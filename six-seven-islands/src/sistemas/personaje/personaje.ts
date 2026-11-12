// Subsistema «personaje»: el jugador y los personajes de la isla y de sus interiores. El jugador y
// algunos personajes son personas de Meshy (`arte/personas.ts`); el resto, personajes de KayKit
// (CC0) sin armas. Todos animados (parado y andando) o, si su modelo no trae esqueleto, respirando. Dibuja al jugador donde dice
// «partida», interpolado entre pasos fijos. Si algo lo tapa (según las alturas de «mundo»), se ve
// su silueta. Quien habla con el jugador se gira hacia él. Los entrenadores enseñan su línea de
// visión en el suelo (ARTE.md, «Peligros»). Las estatuas las dibuja «salas». El generador de
// personajes llega en F12.

import {
  AnimationMixer,
  AnimationUtils,
  Box3,
  CanvasTexture,
  SRGBColorSpace,
  Sprite,
  SpriteNodeMaterial,
  CapsuleGeometry,
  GreaterDepth,
  Group,
  InstancedMesh,
  LoopRepeat,
  Matrix4,
  Mesh,
  MeshBasicNodeMaterial,
  PlaneGeometry,
  SphereGeometry,
  Vector3,
  type AnimationAction,
  type BufferGeometry,
  type Material,
  type Object3D,
  type Texture,
} from 'three/webgpu';
import { clone as clonarConEsqueleto } from 'three/addons/utils/SkeletonUtils.js';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { PASOS_POR_CASILLA, posicionVisual } from '../../core/explorar';
import { clave, deClave, enIsla, vision, type Direccion, type Personaje as DefPersonaje } from '../../core/mundo';
import { COLORES } from '../../arte/paleta';
import { alturaSuelo } from '../../arte/escala';
import { aMaterialDelJuego, cargarModelo, rutaModelo } from '../../arte/modelos';
import { materialColor } from '../../arte/criaturas3d';
import { PERSONAS, PERSONA_DE, PERSONA_JUGADOR, type DefPersona, type NombrePersona } from '../../arte/personas';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Partida } from '../partida/partida';
import type { Mundo } from '../mundo/mundo';

const GIRO: Record<Direccion, number> = { s: 0, e: Math.PI / 2, n: Math.PI, o: -Math.PI / 2 };
/** Alto de las figuritas en el mundo (la casilla mide 1). */
const ALTO = 1.25;
/** Lo que sube la línea de vista hacia la cámara por cada casilla hacia el sur (cámara a 50°). */
const PENDIENTE = Math.tan((50 * Math.PI) / 180);
/** Altura del pecho del jugador: si algo la tapa, se enseña la silueta. */
const PECHO = 0.7;
const OPACIDAD_SILUETA = 0.7;

interface Figura {
  raiz: Group;
  mezclador: AnimationMixer;
  acciones: Map<string, AnimationAction>;
  actual: string;
  /** Los nombres de sus clips de andar y de parado. */
  andar: string;
  parado: string;
  /** Sin esqueleto: respira (sube y baja un poco), para no parecer una estatua. */
  respira?: { malla: Object3D; escala: number; fase: number };
}

/** Velocidad del jugador, en casillas por segundo (paso fijo de 60 por segundo). */
const VELOCIDAD = 60 / PASOS_POR_CASILLA;

/** Tinte de la piel quemada por el sol (el guiri de Famara). */
const QUEMADO = [1, 0.66, 0.58] as const;

/** Qué modelo de KayKit hace de cada personaje, hasta que lleguen las personas de Meshy. */
function modeloDe(p: DefPersonaje): string {
  if (p.postura === 'tumbado') return p.quemado ? 'Barbarian' : 'Rogue';
  if (p.id === 'anciano' || p.id === 'doctora') return 'Mage';
  if (p.id === 'lider-gimnasio') return 'Knight';
  if (p.entrenador) return p.entrenador.obligatorio ? 'Knight' : 'Barbarian';
  return 'Rogue_Hooded';
}

export class Personaje implements Subsistema {
  static readonly id = 'personaje';
  static readonly deps: readonly string[] = ['render', 'partida', 'mundo'];

  /** Posición del jugador en el mundo, para la cámara. */
  readonly posicion = new Vector3();
  private partida!: Partida;
  private mundo!: Mundo;
  private silueta!: MeshBasicNodeMaterial;
  private mallasSilueta: Mesh[] = [];
  private opacidad = 0;
  private jugador!: Figura;
  private figuras: Figura[] = [];
  /** Los personajes por id, con hacia dónde miran normalmente, para girarlos al hablar. */
  private porId = new Map<string, { figura: Figura; giro: number; tumbado?: boolean }>();
  private giro = 0;
  /** Segundos que lleva el jugador sin moverse: entre casilla y casilla hay un instante parado. */
  private quieto = 0;
  private geometrias: BufferGeometry[] = [];
  private materiales: Material[] = [];
  private objetos: Object3D[] = [];
  private quitar: (() => void)[] = [];
  private reloj = 0;
  private personaJugador: NombrePersona = PERSONA_JUGADOR;
  /** La exclamación sobre el entrenador que acaba de ver al jugador (F16). */
  private exclamacion!: Sprite;
  /** Las casillas que ve cada entrenador, en una sola malla: qué instancias son de quién. */
  private visiones: { malla: InstancedMesh; matrices: Matrix4[]; deQuien: Map<string, number[]> } | null = null;
  /** Los vencidos ya aplicados a la malla de visiones (los vencidos no ven: sus casillas se ocultan). */
  private firmaVencidos: string | null = null;
  private tExclamacion = -1;

  async init(ctx: Ctx): Promise<void> {
    this.partida = ctx.get<Partida>('partida');
    this.mundo = ctx.get<Mundo>('mundo');
    const m = this.partida.mundo;
    const modelos = new Map<string, GLTF>();
    const cargar = async (nombre: string) => {
      if (!modelos.has(nombre)) modelos.set(nombre, await cargarModelo(rutaModelo(`kaykit/${nombre}.glb`)));
      return modelos.get(nombre)!;
    };

    // Jugador, con su silueta: solo se dibuja la parte que algo tapa (prueba de profundidad al
    // revés). Como también se pintaría sobre el propio jugador, solo se enciende cuando algo lo
    // tapa. Es coral: la clara (espuma) desaparecía contra las casas blancas de Lanzarote, y el
    // coral se ve sobre la cal, las copas, el picón negro y el tejado azul del museo.
    const persona = (this.partida.persona in PERSONAS ? this.partida.persona : PERSONA_JUGADOR) as NombrePersona;
    this.jugador = await this.figuraPersona(persona);
    this.personaJugador = persona;
    const silueta = new MeshBasicNodeMaterial({ color: COLORES.acentoCoral, transparent: true, opacity: 0, depthWrite: false });
    silueta.depthFunc = GreaterDepth;
    this.silueta = silueta;
    const cuerpo = new CapsuleGeometry(0.3, 0.45, 4, 10).translate(0, 0.52, 0);
    const cabeza = new SphereGeometry(0.33, 14, 10).translate(0, 1.0, 0);
    this.geometrias.push(cuerpo, cabeza);
    this.materiales.push(silueta);
    for (const g of [cuerpo, cabeza]) {
      const malla = new Mesh(g, silueta);
      malla.renderOrder = 10;
      malla.visible = false;
      this.jugador.raiz.add(malla);
      this.mallasSilueta.push(malla);
    }
    ctx.escena.add(this.jugador.raiz);
    this.objetos.push(this.jugador.raiz);

    // Personajes de la isla y de los interiores, y lo que ven los entrenadores.
    const visiones: Matrix4[] = [];
    const deQuien = new Map<string, number[]>();
    for (const mapa of [m, ...this.partida.interiores.values()]) {
      for (const z of mapa.zonas.values()) {
        for (const p of z.personajes) {
          if (p.id.startsWith('estatua-')) continue;
          const persona = PERSONA_DE[p.id];
          const nombre = modeloDe(p);
          const f = persona ? await this.figuraPersona(persona) : this.figura(await cargar(nombre), nombre, p.quemado ? QUEMADO : undefined);
          const k = enIsla(mapa, z.id, p.x, p.y);
          const [x, y] = deClave(k);
          f.raiz.position.set(x, alturaSuelo(mapa.casillas.get(k)!.h), y);
          if (p.postura === 'tumbado') {
            // Boca arriba sobre su toalla, con la cabeza al norte y los pies en el borde sur de la
            // casilla. No se gira al hablar.
            const cuerpo = f.raiz.children[0];
            cuerpo.rotation.x = -Math.PI / 2;
            cuerpo.position.set(0, 0.1, 0.5);
            // Pegado al suelo, su sombra no se ve y costaría una llamada de dibujo por pieza.
            cuerpo.traverse((o) => (o.castShadow = false));
            this.porId.set(p.id, { figura: f, giro: 0, tumbado: true });
          } else {
            f.raiz.rotation.y = GIRO[p.mira];
            this.porId.set(p.id, { figura: f, giro: GIRO[p.mira] });
          }
          ctx.escena.add(f.raiz);
          this.objetos.push(f.raiz);
          for (const v of vision(mapa, z.id, p)) {
            const [vx, vy] = deClave(v);
            deQuien.set(p.id, [...(deQuien.get(p.id) ?? []), visiones.length]);
            visiones.push(new Matrix4().makeTranslation(vx, alturaSuelo(mapa.casillas.get(v)!.h) + 0.14, vy));
          }
        }
      }
    }
    // Al empezar una partida nueva con otra persona, se cambia la figura del jugador.
    this.quitar.push(
      ctx.eventos.on('jugador:elegido', ({ persona }) => {
        if (persona === this.personaJugador || !(persona in PERSONAS)) return;
        void this.cambiarJugador(persona as NombrePersona, ctx);
      }),
    );
    // La exclamación: un bocadillo blanco con un «!» coral, que salta sobre el entrenador.
    this.exclamacion = new Sprite(this.materialExclamacion());
    this.exclamacion.visible = false;
    this.exclamacion.renderOrder = 20;
    ctx.escena.add(this.exclamacion);
    this.objetos.push(this.exclamacion);
    this.quitar.push(
      ctx.eventos.on('entrenador:visto', ({ id }) => {
        const q = this.porId.get(id);
        if (!q) return;
        this.exclamacion.position.copy(q.figura.raiz.position).add(new Vector3(0, ALTO + 0.5, 0));
        this.tExclamacion = 0;
      }),
    );
    // Quien habla con el jugador se gira hacia él, y al acabar vuelve a mirar donde miraba.
    this.quitar.push(
      ctx.eventos.on('dialogo:abrir', ({ guionId }) => {
        const q = this.porId.get(guionId);
        if (!q || q.tumbado) return;
        const r = q.figura.raiz.position;
        q.figura.raiz.rotation.y = Math.atan2(this.posicion.x - r.x, this.posicion.z - r.z);
      }),
      ctx.eventos.on('dialogo:cerrar', ({ guionId }) => {
        const q = this.porId.get(guionId);
        if (q && !q.tumbado) q.figura.raiz.rotation.y = q.giro;
      }),
    );
    if (visiones.length) {
      const plano = new PlaneGeometry(0.8, 0.8).rotateX(-Math.PI / 2);
      const mv = new MeshBasicNodeMaterial({ color: COLORES.acentoCoral, transparent: true, opacity: 0.35, depthWrite: false });
      this.geometrias.push(plano);
      this.materiales.push(mv);
      const im = new InstancedMesh(plano, mv, visiones.length);
      visiones.forEach((mt, i) => im.setMatrixAt(i, mt));
      im.computeBoundingSphere();
      ctx.escena.add(im);
      this.objetos.push(im);
      this.visiones = { malla: im, matrices: visiones, deQuien };
    }
    this.colocar(0, 0);
  }

  private materialExclamacion(): SpriteNodeMaterial {
    const lienzo = document.createElement('canvas');
    lienzo.width = lienzo.height = 128;
    const g = lienzo.getContext('2d')!;
    g.fillStyle = '#fffaf2';
    g.strokeStyle = '#2b2340';
    g.lineWidth = 8;
    g.beginPath();
    g.arc(64, 56, 44, 0, Math.PI * 2);
    g.moveTo(52, 96);
    g.lineTo(64, 122);
    g.lineTo(76, 96);
    g.fill();
    g.stroke();
    g.fillStyle = COLORES.acentoCoral;
    g.font = '900 72px system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('!', 64, 60);
    const t = new CanvasTexture(lienzo);
    t.colorSpace = SRGBColorSpace;
    const m = new SpriteNodeMaterial({ map: t, transparent: true, depthTest: false });
    this.materiales.push(m);
    return m;
  }

  private async cambiarJugador(persona: NombrePersona, ctx: Ctx): Promise<void> {
    const nueva = await this.figuraPersona(persona);
    const vieja = this.jugador;
    for (const m of this.mallasSilueta) nueva.raiz.add(m);
    vieja.mezclador.stopAllAction();
    vieja.raiz.removeFromParent();
    this.figuras = this.figuras.filter((f) => f !== vieja);
    ctx.escena.add(nueva.raiz);
    this.objetos.push(nueva.raiz);
    this.jugador = nueva;
    this.personaJugador = persona;
  }

  /** Dónde está un personaje (no el jugador), o null si no tiene figura. */
  posicionDe(id: string): Vector3 | null {
    return this.porId.get(id)?.figura.raiz.position ?? null;
  }

  /** Una figurita: copia del modelo con su esqueleto, sin armas, a escala y con sus animaciones. */
  private figura(gltf: GLTF, nombre: string, tinte?: readonly [number, number, number]): Figura {
    const base = nombre.split('_')[0];
    const copia = clonarConEsqueleto(gltf.scene);
    copia.traverse((o) => {
      if (!(o as Mesh).isMesh) return;
      // Solo las piezas del cuerpo («Rogue_Body», «Mage_Hat»…); fuera armas, escudos y libros.
      o.visible = o.name.startsWith(`${base}_`) && !o.name.includes('Shield');
    });
    this.materiales.push(...aMaterialDelJuego(copia, { bordes: [-0.25, 0.5], especular: 0.1, dureza: 16, contraluz: 0.35 }, tinte));
    const caja = new Box3();
    copia.updateWorldMatrix(true, true);
    copia.traverse((o) => {
      if ((o as Mesh).isMesh && o.visible) caja.expandByObject(o);
    });
    const alto = caja.max.y - caja.min.y || 1;
    copia.scale.setScalar(ALTO / alto);
    const raiz = new Group();
    raiz.add(copia);
    const mezclador = new AnimationMixer(copia);
    const acciones = new Map<string, AnimationAction>();
    for (const clip of gltf.animations) acciones.set(clip.name, mezclador.clipAction(clip).setLoop(LoopRepeat, Infinity));
    // El jugador anda a unas 5,5 casillas por segundo: a su ritmo normal, los pies patinaban.
    acciones.get('Walking_A')?.setEffectiveTimeScale(1.6);
    const f: Figura = { raiz, mezclador, acciones, actual: '', andar: 'Walking_A', parado: 'Idle' };
    this.animar(f, f.parado);
    this.figuras.push(f);
    return f;
  }

  /**
   * Una persona de Meshy: con su luz pintada, a la escala de las demás figuras y con la base en el
   * suelo. Si trae esqueleto, corre al ritmo del jugador sin que patinen los pies.
   */
  private async figuraPersona(nombre: NombrePersona): Promise<Figura> {
    const def: DefPersona = PERSONAS[nombre];
    const gltf = await cargarModelo(rutaModelo(def.archivo));
    const copia = clonarConEsqueleto(gltf.scene);
    copia.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      const viejo = (Array.isArray(m.material) ? m.material[0] : m.material) as Material & { map?: Texture | null };
      m.material = materialColor(viejo.map ?? null);
      m.castShadow = true;
      m.receiveShadow = false;
      // Las mallas con esqueleto no se recortan bien por su caja de reposo.
      m.frustumCulled = false;
    });
    copia.updateWorldMatrix(true, true);
    const caja = new Box3().setFromObject(copia);
    const altoModelo = caja.max.y - caja.min.y || 1;
    const escala = ALTO / altoModelo;
    copia.scale.setScalar(escala);
    copia.position.y = -caja.min.y * escala;
    // El pivote, en los pies: lo que respira se estira desde el suelo.
    const pivote = new Group();
    pivote.add(copia);
    const raiz = new Group();
    raiz.add(pivote);
    const mezclador = new AnimationMixer(copia);
    const acciones = new Map<string, AnimationAction>();
    const f: Figura = { raiz, mezclador, acciones, actual: '', andar: '', parado: '' };
    if (def.mover) {
      const clip = gltf.animations.find((c) => c.name === def.mover!.clip);
      if (clip) {
        // A esta escala, el pie apoyado va a pie × escala casillas por segundo.
        const a = mezclador.clipAction(clip).setLoop(LoopRepeat, Infinity);
        a.setEffectiveTimeScale(VELOCIDAD / (def.mover.pie * escala));
        acciones.set('andar', a);
        f.andar = 'andar';
      }
    }
    if (def.parado) {
      const clip = gltf.animations.find((c) => c.name === def.parado!.clip);
      if (clip) {
        const quieto = AnimationUtils.subclip(clip, `${clip.name}-parado`, def.parado.fotograma, def.parado.fotograma + 1, 30);
        acciones.set('parado', mezclador.clipAction(quieto).setLoop(LoopRepeat, Infinity));
        f.parado = 'parado';
      }
    }
    if (!gltf.animations.length) f.respira = { malla: pivote, escala: 1, fase: this.figuras.length * 1.7 };
    this.animar(f, f.parado);
    this.figuras.push(f);
    return f;
  }

  private animar(f: Figura, nombre: string): void {
    if (f.actual === nombre) return;
    const nueva = f.acciones.get(nombre);
    if (!nueva) return;
    const vieja = f.acciones.get(f.actual);
    nueva.reset().play();
    if (vieja) nueva.crossFadeFrom(vieja, 0.15, false);
    f.actual = nombre;
  }

  private colocar(dt: number, alfa: number): void {
    const m = this.partida.activo();
    const e = this.partida.estado;
    const p = posicionVisual(e, alfa);
    const h0 = alturaSuelo(m.casillas.get(clave(e.desdeX, e.desdeY))?.h ?? 0);
    const h1 = alturaSuelo(m.casillas.get(clave(e.x, e.y))?.h ?? 0);
    const t = e.paso === 0 ? 1 : Math.min(1, (e.paso + alfa) / PASOS_POR_CASILLA);
    this.posicion.set(p.x, h0 + (h1 - h0) * t, p.y);
    this.jugador.raiz.position.copy(this.posicion);
    // Andando se pasa un instante por paso 0 entre casilla y casilla: cambiar a «parado» ahí hacía
    // que la animación tropezara en cada casilla (el autor veía el andar raro, 2026-11-10).
    this.quieto = e.paso > 0 ? 0 : this.quieto + dt;
    this.animar(this.jugador, this.quieto < 0.12 ? this.jugador.andar : this.jugador.parado);
    let objetivo = GIRO[e.mira];
    while (objetivo - this.giro > Math.PI) objetivo -= Math.PI * 2;
    while (objetivo - this.giro < -Math.PI) objetivo += Math.PI * 2;
    this.giro += (objetivo - this.giro) * Math.min(1, dt * 18 || 1);
    this.jugador.raiz.rotation.y = this.giro;

    const tapado = !e.dentro && this.tapado(Math.round(p.x), Math.round(p.y), this.posicion.y);
    this.opacidad += ((tapado ? OPACIDAD_SILUETA : 0) - this.opacidad) * Math.min(1, dt * 10 || 1);
    this.silueta.opacity = this.opacidad;
    for (const malla of this.mallasSilueta) malla.visible = this.opacidad > 0.02;
  }

  /** ¿Tapa algo el pecho del jugador? Mira las casillas al sur, entre él y la cámara. */
  private tapado(x: number, y: number, suelo: number): boolean {
    for (let d = 1; d <= 6; d++) {
      const alto = this.mundo.tapas.get(clave(x, y + d));
      if (alto !== undefined && alto > suelo + PECHO + PENDIENTE * (d - 0.5)) return true;
    }
    return false;
  }

  /** Oculta lo que ven los entrenadores vencidos (al vencerlos, al cargar o al importar). */
  private ocultarVisionesVencidas(): void {
    const v = this.visiones;
    const vencidos = this.partida.vencidos;
    const firma = vencidos.join(',');
    if (!v || firma === this.firmaVencidos) return;
    this.firmaVencidos = firma;
    const nada = new Matrix4().makeScale(0, 0, 0);
    for (const [id, indices] of v.deQuien) {
      const vencido = vencidos.includes(id);
      for (const i of indices) v.malla.setMatrixAt(i, vencido ? nada : v.matrices[i]);
    }
    v.malla.instanceMatrix.needsUpdate = true;
  }

  actualizar(dt: number, ctx: Ctx): void {
    this.colocar(dt, ctx.tiempo.alfa);
    this.ocultarVisionesVencidas();
    this.reloj += dt;
    if (this.tExclamacion >= 0) {
      // Salta y se queda un momento; dura lo mismo que la espera de «partida» (0,75 s).
      this.tExclamacion += dt;
      const t = this.tExclamacion;
      this.exclamacion.visible = t < 0.85;
      this.exclamacion.scale.setScalar(0.62 * Math.min(1, t * 9) * (1 + 0.15 * Math.sin(Math.min(1, t * 3) * Math.PI)));
      if (t >= 0.85) this.tExclamacion = -1;
    }
    for (const f of this.figuras) {
      f.mezclador.update(dt);
      // Respirar: un 1,2 % de alto, sin tocar los pies (la base está en el origen).
      if (f.respira) f.respira.malla.scale.y = f.respira.escala * (1 + 0.012 * Math.sin(this.reloj * 2.2 + f.respira.fase));
    }
  }

  dispose(): void {
    for (const q of this.quitar) q();
    for (const f of this.figuras) f.mezclador.stopAllAction();
    for (const o of this.objetos) o.removeFromParent();
    for (const g of this.geometrias) g.dispose();
    for (const m of this.materiales) m.dispose();
  }
}
