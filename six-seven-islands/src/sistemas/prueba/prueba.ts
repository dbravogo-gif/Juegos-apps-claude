// Subsistema «prueba», TEMPORAL: la escena de diorama de la prueba de arte (F04). Una isla de
// juguete con el material de ARTE.md y, encima, las criaturas del generador: las tres iniciales y
// la segunda forma de la de Planta, más un muestrario de los 15 colores de tipo. Desaparece cuando
// lleguen «mundo», «camara» e «interfaz» (F05).
//
// Vistas: combate (una criatura de cerca), todas, explorar (la cámara alta de ARTE.md) y tipos.
// Parámetros: ?vista=combate|todas|explorar|tipos, ?criatura=0..3, ?gris y ?lento=0.1 (cámara lenta).
// Teclas: ← → criatura, 1 atacar, 2 golpe, 3 debilitar o revivir, V vista, G gris.

import {
  BufferGeometry,
  CircleGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  ExtrudeGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  Object3D,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  Vector3,
  type Material,
} from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { color, fwidth, mix, normalLocal, positionLocal, smoothstep, float } from 'three/tsl';
import type { AspectoCriatura } from '../../core/aspecto';
import { ASPECTOS_PRUEBA } from '../../data/aspectos';
import { TIPOS } from '../../data/tipos';
import { MaterialDiorama, fijarColorSuelo, sueloY, type Nodo } from '../../arte/material';
import { COLORES } from '../../arte/paleta';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Criatura, Criaturas } from '../criaturas/criaturas';

type Vista = 'combate' | 'todas' | 'explorar' | 'tipos';
const VISTAS: Vista[] = ['combate', 'todas', 'explorar', 'tipos'];
const NOMBRE_VISTA: Record<Vista, string> = { combate: 'Combate', todas: 'Todas', explorar: 'Explorar', tipos: 'Tipos' };
const ETIQUETAS = ['Planta · forma 1', 'Planta · forma 2', 'Agua · forma 1', 'Infernal · forma 1'];
const ALTO_ISLA = 1.6;
/** Dónde se colocan las criaturas de la prueba, en el orden de ASPECTOS_PRUEBA. */
const SITIOS: [number, number][] = [
  [-2.5, 0.9],
  [-0.85, 0.1],
  [0.85, 0.1],
  [2.5, 0.9],
];

function muestra(tipo: string): AspectoCriatura {
  return {
    id: `muestra-${tipo}`,
    tipo,
    secundario: 0xffffff,
    escala: 0.62,
    anguloso: 0,
    cuerpo: { forma: 'esfera', ancho: 1, alto: 0.92 },
    ojos: { tamano: 0.16, separacion: 0.42, altura: 0.6 },
    boca: 'sonrisa',
    mejillas: true,
    vientre: true,
    patron: { tipo: 'liso', color: 'claro', escala: 1 },
    piezas: { patas: { tamano: 0.22, color: 'oscuro' } },
  };
}

function rectanguloRedondo(ancho: number, fondo: number, r: number): Shape {
  const s = new Shape();
  const x = -ancho / 2;
  const y = -fondo / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + ancho - r, y);
  s.quadraticCurveTo(x + ancho, y, x + ancho, y + r);
  s.lineTo(x + ancho, y + fondo - r);
  s.quadraticCurveTo(x + ancho, y + fondo, x + ancho - r, y + fondo);
  s.lineTo(x + r, y + fondo);
  s.quadraticCurveTo(x, y + fondo, x, y + fondo - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

export class Prueba implements Subsistema {
  static readonly id = 'prueba';
  static readonly deps: readonly string[] = ['render', 'criaturas'];

  private geometrias: BufferGeometry[] = [];
  private materiales: Material[] = [];
  private objetos: Object3D[] = [];
  private criaturas: Criatura[] = [];
  private muestrario: Criatura[] = [];
  private sistema!: Criaturas;
  private vista: Vista = 'combate';
  private elegida = 0;
  private gris = false;
  private ui: HTMLElement | null = null;
  private etiqueta: HTMLElement | null = null;
  private botonDebil: HTMLButtonElement | null = null;
  private botonesVista = new Map<Vista, HTMLButtonElement>();
  private quitarTeclas: (() => void) | null = null;
  // Cámara: se acerca suavemente a su objetivo. Reservados una vez (sin objetos por fotograma).
  private camPos = new Vector3();
  private camMira = new Vector3();
  private objPos = new Vector3();
  private objMira = new Vector3();
  private primera = true;

  init(ctx: Ctx): void {
    this.sistema = ctx.get<Criaturas>('criaturas');
    this.montarIsla(ctx);
    this.montarCriaturas(ctx);

    const p = new URLSearchParams(location.search);
    const v = p.get('vista') as Vista | null;
    if (v && VISTAS.includes(v)) this.vista = v;
    const n = Number(p.get('criatura'));
    if (Number.isInteger(n) && n >= 0 && n < this.criaturas.length) this.elegida = n;
    this.montarInterfaz();
    if (p.has('gris')) this.ponerGris(true);
    const lento = Number(p.get('lento'));
    if (lento > 0 && lento <= 1) this.sistema.velocidad = lento;
    this.aplicarVista();
  }

  // ——— Escena ———

  private malla(g: BufferGeometry, m: Material, x = 0, y = 0, z = 0, sombra = true): Mesh {
    this.geometrias.push(g);
    const me = new Mesh(g, m);
    me.position.set(x, y, z);
    me.castShadow = sombra;
    me.receiveShadow = true;
    this.objetos.push(me);
    return me;
  }

  private material(c: string, op: ConstructorParameters<typeof MaterialDiorama>[0] = {}, nodo?: Nodo): MaterialDiorama {
    const m = new MaterialDiorama({ color: c, bordes: [-0.02, 0.32], rebote: 0.12, ...op }, nodo);
    this.materiales.push(m);
    return m;
  }

  private montarIsla(ctx: Ctx): void {
    const escena = ctx.escena;
    sueloY.value = 0;
    fijarColorSuelo(COLORES.hierbaMenta);

    // Bloque de la isla: un rectángulo redondeado extruido, con bisel. Por altura: hierba arriba,
    // un labio de hierba más honda, arena y, abajo, madera tostada (el canto del diorama).
    const forma = rectanguloRedondo(16, 12, 3.2);
    const isla = new ExtrudeGeometry(forma, {
      depth: ALTO_ISLA,
      bevelEnabled: true,
      bevelThickness: 0.22,
      bevelSize: 0.22,
      bevelSegments: 3,
      curveSegments: 10,
      steps: 1,
    });
    isla.rotateX(-Math.PI / 2);
    isla.translate(0, -ALTO_ISLA - 0.22, 0);
    const y: Nodo = positionLocal.y;
    const arriba: Nodo = smoothstep(0.55, 0.75, normalLocal.y);
    const banda = (corte: number) => {
      const aa = fwidth(y);
      return smoothstep(float(corte).sub(aa), float(corte).add(aa), y);
    };
    let canto: Nodo = mix(color(COLORES.maderaTostada), color(COLORES.arenaCaramelo), banda(-1.15));
    canto = mix(canto, color(COLORES.hierbaHonda), banda(-0.32));
    const colorIsla = mix(canto, color(COLORES.hierbaMenta), arriba);
    escena.add(this.malla(isla, this.material('#ffffff', {}, colorIsla)));

    // Mar con una orla de espuma alrededor del canto.
    const mar = this.malla(new CircleGeometry(140, 48), this.material(COLORES.aguaTurquesa, { rebote: 0 }), 0, -1.25, 0, false);
    mar.rotation.x = -Math.PI / 2;
    escena.add(mar);
    const espuma = this.malla(new ShapeGeometry(rectanguloRedondo(17.4, 13.4, 3.9), 12), this.material(COLORES.espuma, { rebote: 0 }), 0, -1.2, 0, false);
    espuma.rotation.x = -Math.PI / 2;
    escena.add(espuma);

    // Árboles de juguete: tronco y copa de tres bolas fusionadas.
    const tronco = this.material(COLORES.maderaTostada);
    const copa = this.material(COLORES.hierbaHonda);
    const copaGeo = (() => {
      const partes = [
        new SphereGeometry(1, 20, 14),
        new SphereGeometry(0.75, 16, 12).translate(0.75, -0.25, 0.2),
        new SphereGeometry(0.7, 16, 12).translate(-0.6, -0.3, -0.3),
      ];
      const g = mergeGeometries(partes, false)!;
      for (const p of partes) p.dispose();
      return g;
    })();
    this.geometrias.push(copaGeo);
    const troncoGeo = new CylinderGeometry(0.16, 0.24, 1.2, 8);
    this.geometrias.push(troncoGeo);
    for (const [x, z, s] of [
      [-6, -3.6, 1.15],
      [-4.4, -4.6, 0.85],
      [5.6, -3.4, 1.25],
      [6.3, 2.8, 0.9],
      [-6.5, 3.2, 0.8],
    ]) {
      const t = new Mesh(troncoGeo, tronco);
      t.position.set(x, 0.6 * s, z);
      t.scale.setScalar(s);
      const c = new Mesh(copaGeo, copa);
      c.position.set(x, 1.75 * s, z);
      c.scale.setScalar(s);
      for (const m of [t, c]) {
        m.castShadow = true;
        m.receiveShadow = true;
        escena.add(m);
        this.objetos.push(m);
      }
    }

    // Rocas de color lavanda y matas de hierba instanciadas (una sola llamada de dibujo).
    const roca = this.material(COLORES.piedraLavanda);
    for (const [x, z, s, r] of [
      [4.6, 1.6, 0.55, 0.3],
      [5.1, 2.1, 0.32, 1.2],
      [-4.2, -1.2, 0.42, 2],
      [1.8, -4.4, 0.5, 0.7],
    ]) {
      const m = this.malla(new DodecahedronGeometry(1, 1), roca, x, s * 0.35, z);
      m.scale.set(s, s * 0.7, s * 0.9);
      m.rotation.y = r;
      escena.add(m);
    }
    // Mata: tres briznas redondeadas (gotas aplastadas) abiertas en abanico.
    const mataGeo = (() => {
      const briznas = [-0.5, 0, 0.5].map((g, i) => {
        const b = new SphereGeometry(0.5, 8, 6).translate(0, 0.5, 0);
        b.scale(0.09, 0.36 + (i === 1 ? 0.1 : 0), 0.05);
        b.rotateZ(g);
        b.rotateY(i * 1.1);
        return b;
      });
      const g = mergeGeometries(briznas, false)!;
      for (const b of briznas) b.dispose();
      return g;
    })();
    this.geometrias.push(mataGeo);
    const matas = new InstancedMesh(mataGeo, this.material(COLORES.hierbaHonda), 90);
    const mat = new Matrix4();
    let k = 0;
    // Colocación fija (no azar): una espiral áurea dentro de la isla, lejos de las criaturas.
    for (let i = 0; k < 90 && i < 400; i++) {
      const a = i * 2.39996;
      const r = 1.2 * Math.sqrt(i);
      const x = Math.cos(a) * r * 1.25;
      const z = Math.sin(a) * r;
      if (Math.abs(x) > 7.2 || Math.abs(z) > 5.2 || (Math.abs(x) < 3.6 && z > -1.2 && z < 2.2)) continue;
      const s = 0.7 + ((i * 37) % 10) / 20;
      mat.makeRotationY(a).scale(new Vector3(s, s * (1 + (i % 3) * 0.2), s)).setPosition(x, 0, z);
      matas.setMatrixAt(k++, mat);
    }
    matas.count = k;
    matas.castShadow = true;
    matas.receiveShadow = true;
    escena.add(matas);
    this.objetos.push(matas);
  }

  private montarCriaturas(ctx: Ctx): void {
    ASPECTOS_PRUEBA.forEach((a, i) => {
      const c = this.sistema.crear(a);
      const [x, z] = SITIOS[i];
      c.raiz.position.set(x, 0, z);
      // Miran hacia donde está la cámara de combate, un poco hacia el centro.
      c.raiz.rotation.y = Math.atan2(-x * 0.25, 6);
      ctx.escena.add(c.raiz);
      this.criaturas.push(c);
    });
    TIPOS.forEach((t, i) => {
      const c = this.sistema.crear(muestra(t.id));
      c.raiz.position.set(-4.6 + (i % 6) * 1.25, 0, -1.1 + Math.floor(i / 6) * 1.25);
      c.raiz.visible = false;
      ctx.escena.add(c.raiz);
      this.muestrario.push(c);
    });
  }

  // ——— Vistas y cámara ———

  private aplicarVista(): void {
    const tipos = this.vista === 'tipos';
    for (const c of this.muestrario) c.raiz.visible = tipos;
    for (const c of this.criaturas) c.raiz.visible = !tipos;
    if (this.etiqueta) this.etiqueta.textContent = tipos ? 'Los 16 colores de tipo' : ETIQUETAS[this.elegida];
    for (const [v, b] of this.botonesVista) b.setAttribute('aria-pressed', String(v === this.vista));
    this.actualizarBotonDebil();
  }

  /** Distancia para que un rectángulo de ancho × alto quepa en pantalla con la lente de la cámara. */
  private distanciaPara(ctx: Ctx, ancho: number, alto: number): number {
    const tanV = Math.tan(((ctx.camara.fov / 2) * Math.PI) / 180);
    // Hueco para la interfaz de abajo: el encuadre usa el 78 % del alto.
    return Math.max(alto / 2 / (tanV * 0.78), ancho / 2 / (tanV * ctx.camara.aspect));
  }

  private calcularObjetivo(ctx: Ctx): void {
    let elevacion = 20;
    let acimut = 0;
    let dist = 10;
    if (this.vista === 'combate') {
      const c = this.criaturas[this.elegida];
      this.objMira.set(c.raiz.position.x, c.alto * 0.48, c.raiz.position.z);
      dist = this.distanciaPara(ctx, c.alto * 1.5, c.alto / 0.45);
      elevacion = 16;
      acimut = -18 + c.raiz.rotation.y * (180 / Math.PI);
    } else if (this.vista === 'todas') {
      this.objMira.set(0, 0.62, 0.45);
      dist = this.distanciaPara(ctx, 7.6, 2.6);
      elevacion = 18;
    } else if (this.vista === 'explorar') {
      // ARTE.md: cámara alta (~50°) con lente larga; el jugador mediría ~9 % del alto.
      this.objMira.set(0, 0, 0.5);
      dist = 22;
      elevacion = 50;
    } else {
      this.objMira.set(-1.5, 0.35, 0.15);
      dist = this.distanciaPara(ctx, 7.8, 3.6);
      elevacion = 32;
    }
    const e = (elevacion * Math.PI) / 180;
    const a = (acimut * Math.PI) / 180;
    // La barra de abajo tapa ~22 % del alto: se baja el punto de mira para que lo encuadrado
    // quede centrado en el hueco libre.
    const altoVisible = 2 * dist * Math.tan(((ctx.camara.fov / 2) * Math.PI) / 180);
    this.objMira.y -= (altoVisible * 0.11) / Math.cos(e);
    this.objPos.set(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)).multiplyScalar(dist).add(this.objMira);
  }

  actualizar(dt: number, ctx: Ctx): void {
    this.calcularObjetivo(ctx);
    const k = this.primera ? 1 : 1 - Math.exp(-dt * 6);
    this.primera = false;
    this.camPos.lerp(this.objPos, k);
    this.camMira.lerp(this.objMira, k);
    ctx.camara.position.copy(this.camPos);
    ctx.camara.lookAt(this.camMira);
  }

  // ——— Interfaz temporal ———

  private accion(n: 'ataque' | 'golpe' | 'debil'): void {
    const lista = this.vista === 'combate' ? [this.criaturas[this.elegida]] : this.vista === 'tipos' ? this.muestrario : this.criaturas;
    const debil = lista[0].anim.accion === 'debilitarse';
    for (const c of lista) {
      if (n === 'debil') this.sistema.accion(c, debil ? 'reposo' : 'debilitarse');
      else this.sistema.accion(c, n);
    }
    window.setTimeout(() => this.actualizarBotonDebil(), 0);
  }

  private actualizarBotonDebil(): void {
    if (!this.botonDebil) return;
    const c = this.vista === 'combate' ? this.criaturas[this.elegida] : this.vista === 'tipos' ? this.muestrario[0] : this.criaturas[0];
    this.botonDebil.textContent = c.anim.accion === 'debilitarse' ? 'Revivir' : 'Debilitar';
  }

  private cambiarCriatura(paso: number): void {
    if (this.vista !== 'combate' && this.vista !== 'todas') this.vista = 'combate';
    this.elegida = (this.elegida + paso + this.criaturas.length) % this.criaturas.length;
    this.aplicarVista();
  }

  private ponerGris(si: boolean): void {
    this.gris = si;
    document.getElementById('lienzo')?.classList.toggle('gris', si);
    this.ui?.querySelector('[data-gris]')?.setAttribute('aria-pressed', String(si));
  }

  private montarInterfaz(): void {
    const ui = document.createElement('div');
    ui.className = 'vitrina';
    ui.innerHTML = `
      <div class="vitrina-fila">
        <button data-paso="-1" aria-label="Criatura anterior">‹</button>
        <span class="vitrina-nombre" aria-live="polite"></span>
        <button data-paso="1" aria-label="Criatura siguiente">›</button>
      </div>
      <div class="vitrina-fila">
        <button class="principal" data-accion="ataque">Atacar</button>
        <button data-accion="golpe">Golpe</button>
        <button data-accion="debil">Debilitar</button>
      </div>
      <div class="vitrina-fila vitrina-vistas" role="group" aria-label="Vista">
        ${VISTAS.map((v) => `<button data-vista="${v}">${NOMBRE_VISTA[v]}</button>`).join('')}
        <button data-gris aria-label="Escala de grises">Gris</button>
      </div>`;
    ui.addEventListener('click', (ev) => {
      const b = (ev.target as HTMLElement).closest('button');
      if (!b) return;
      if (b.dataset.paso) this.cambiarCriatura(Number(b.dataset.paso));
      else if (b.dataset.accion) this.accion(b.dataset.accion as 'ataque' | 'golpe' | 'debil');
      else if (b.dataset.vista) {
        this.vista = b.dataset.vista as Vista;
        this.aplicarVista();
      } else if (b.hasAttribute('data-gris')) this.ponerGris(!this.gris);
    });
    document.body.append(ui);
    this.ui = ui;
    this.etiqueta = ui.querySelector('.vitrina-nombre');
    this.botonDebil = ui.querySelector('[data-accion="debil"]');
    for (const b of ui.querySelectorAll<HTMLButtonElement>('[data-vista]')) this.botonesVista.set(b.dataset.vista as Vista, b);

    const teclas = (ev: KeyboardEvent) => {
      if (ev.key === 'ArrowLeft') this.cambiarCriatura(-1);
      else if (ev.key === 'ArrowRight') this.cambiarCriatura(1);
      else if (ev.key === '1') this.accion('ataque');
      else if (ev.key === '2') this.accion('golpe');
      else if (ev.key === '3') this.accion('debil');
      else if (ev.key === 'v' || ev.key === 'V') {
        this.vista = VISTAS[(VISTAS.indexOf(this.vista) + 1) % VISTAS.length];
        this.aplicarVista();
      } else if (ev.key === 'g' || ev.key === 'G') this.ponerGris(!this.gris);
    };
    window.addEventListener('keydown', teclas);
    this.quitarTeclas = () => window.removeEventListener('keydown', teclas);
  }

  dispose(): void {
    this.quitarTeclas?.();
    this.ui?.remove();
    for (const c of [...this.criaturas, ...this.muestrario]) this.sistema.quitar(c);
    for (const o of this.objetos) o.removeFromParent();
    for (const g of this.geometrias) g.dispose();
    for (const m of this.materiales) m.dispose();
  }
}

