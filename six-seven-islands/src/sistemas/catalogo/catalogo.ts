// Subsistema «catalogo»: enseña las piezas propias en fila, con la luz y la cámara del juego, para
// revisarlas de cerca y compararlas (ARTE.md, «Modelos del mundo»). No forma parte del juego.
// Se abre con ?catalogo (plantas, rocas, muro y lo del mar), ?catalogo=edificios (casas, casonas y faro;
// primero los de Lanzarote, después los de La Palma) o ?catalogo=cubos (los cubos de captura:
// arriba, la figura completa de cada nivel; abajo, la que se lanza en combate).
// Teclas: ← → acercan la cámara a cada pieza; Esc vuelve a verlas todas. ?pieza=N empieza en la N.

import { Box3, Mesh, Vector3, type BufferGeometry } from 'three/webgpu';
import { attribute } from 'three/tsl';
import { MaterialDiorama, sueloY } from '../../arte/material';
import { COLORES } from '../../arte/paleta';
import type { Ctx, Subsistema } from '../../motor/motor';
import { casaCanaria, faro } from '../mundo/canario';
import { piezaKit } from '../mundo/kit';
import { Montaje } from '../../arte/montaje';
import { CUBOS, RADIO_CUBO, geometriaCubo } from '../../arte/cubos';
import type { Render } from '../render/render';

interface Muestra {
  nombre: string;
  geometria: BufferGeometry;
}

const CUBOS_CAPTURA = (): Muestra[][] => [
  CUBOS.map((c, i) => ({ nombre: c.nombre, geometria: geometriaCubo(i, true).translate(0, RADIO_CUBO * 1.5, 0) })),
  CUBOS.map((c, i) => ({ nombre: `${c.nombre} (al lanzarlo)`, geometria: geometriaCubo(i, false).translate(0, RADIO_CUBO * 1.1, 0) })),
];

const NATURALEZA = (): Muestra[][] => [
  [
    { nombre: 'Palmera canaria', geometria: piezaKit('palmera', 0) },
    { nombre: 'Drago', geometria: piezaKit('drago', 0) },
    { nombre: 'Laurel', geometria: piezaKit('laurel', 0) },
    { nombre: 'Tajinaste azul', geometria: piezaKit('tajinaste', 0) },
    { nombre: 'Platanera', geometria: piezaKit('platanera', 0) },
    { nombre: 'Cardón', geometria: piezaKit('cardon', 0) },
    { nombre: 'Tabaiba', geometria: piezaKit('tabaiba', 0) },
    { nombre: 'Tunera', geometria: piezaKit('tunera', 0) },
    { nombre: 'Viña en su hoyo', geometria: piezaKit('vid', 0) },
  ],
  [
    { nombre: 'Roca basáltica', geometria: piezaKit('roca', 0) },
    { nombre: 'Órganos', geometria: piezaKit('organos', 0) },
    { nombre: 'Escoria', geometria: piezaKit('escoria', 0) },
    { nombre: 'Malpaís', geometria: piezaKit('lajas', 0) },
    { nombre: 'Muro de piedra seca', geometria: muroLargo() },
    { nombre: 'Volcán', geometria: piezaKit('volcan', 0).scale(1.6, 1.6, 1.6) },
  ],
  [
    { nombre: 'Boya', geometria: piezaKit('boya', 0) },
    { nombre: 'Barca', geometria: piezaKit('barca', 0) },
    { nombre: 'Barca', geometria: piezaKit('barca', 1) },
  ],
];

const EDIFICIOS = (): Muestra[][] => [
  [
    { nombre: 'Casa lanzaroteña', geometria: casaCanaria({ estilo: 'lanzarote', ancho: 4, fondo: 3, puerta: -0.5, semilla: 4 }) },
    { nombre: 'Tienda (Lanzarote)', geometria: casaCanaria({ estilo: 'lanzarote', uso: 'tienda', ancho: 4, fondo: 3, puerta: -0.5, semilla: 8 }) },
    { nombre: 'Refugio (Lanzarote)', geometria: casaCanaria({ estilo: 'lanzarote', uso: 'refugio', ancho: 5, fondo: 4, semilla: 5 }) },
    { nombre: 'Casa blanca de balcones', geometria: casaCanaria({ estilo: 'balcones', blanca: true, ancho: 4, fondo: 3, puerta: -0.5, semilla: 2 }) },
    { nombre: 'Faro', geometria: faro() },
  ],
  [
    { nombre: 'Museo (provisional)', geometria: casaCanaria({ estilo: 'lanzarote', uso: 'museo', techo: 'teja', ancho: 8, fondo: 4, puerta: 0.5, semilla: 21 }) },
    { nombre: 'Gimnasio de Roca (provisional)', geometria: casaCanaria({ estilo: 'balcones', blanca: true, emblema: 'volcan', uso: 'gimnasio', techo: 'azotea', ancho: 8, fondo: 6, puerta: 0.5, semilla: 34 }) },
  ],
  [
    { nombre: 'Casa rural (La Palma)', geometria: casaCanaria({ estilo: 'rural', ancho: 4, fondo: 3, puerta: -0.5, semilla: 3 }) },
    { nombre: 'Balcones con teja (La Palma)', geometria: casaCanaria({ estilo: 'balcones', techo: 'teja', ancho: 4, fondo: 3, puerta: -0.5, semilla: 1 }) },
    { nombre: 'Balcones con azotea (La Palma)', geometria: casaCanaria({ estilo: 'balcones', techo: 'azotea', ancho: 4, fondo: 3, puerta: 0.5, semilla: 2 }) },
    { nombre: 'Museo rural (La Palma)', geometria: casaCanaria({ estilo: 'rural', uso: 'museo', techo: 'teja', ancho: 8, fondo: 4, puerta: 0.5, semilla: 21 }) },
  ],
];

/** Tres tramos de muro seguidos, para ver cómo empalman. */
function muroLargo(): BufferGeometry {
  const M = new Montaje();
  for (let i = 0; i < 3; i++) {
    const g = piezaKit('muro', i).translate(i - 1, 0, 0);
    // `pon` recolorea; aquí se quiere conservar el color de cada piedra.
    M.ponTal(g);
  }
  return M.fusionar();
}

const SEPARACION = 0.9;
const ELEVACION = (50 * Math.PI) / 180;

export class Catalogo implements Subsistema {
  static readonly id = 'catalogo';
  static readonly deps: readonly string[] = ['render'];

  private mallas: Mesh[] = [];
  private material!: MaterialDiorama;
  private suelo!: MaterialDiorama;
  private etiquetas: { el: HTMLElement; en: Vector3 }[] = [];
  private capa!: HTMLElement;
  /** Centro y tamaño de cada pieza, para acercar la cámara. */
  private piezas: { centro: Vector3; tam: number }[] = [];
  /** La pieza enfocada, o -1 para verlas todas. */
  private foco = -1;
  private general!: { pos: Vector3; mira: Vector3 };
  private mira = new Vector3();
  private render!: Render;
  private alPulsar = (e: KeyboardEvent) => {
    const n = this.piezas.length;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') this.foco = (this.foco + 1) % n;
    else if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.foco = (this.foco - 1 + n + (this.foco < 0 ? 1 : 0)) % n;
    else if (e.code === 'Escape' || e.code === 'Digit0') this.foco = -1;
  };

  init(ctx: Ctx): void {
    const vista = new URLSearchParams(location.search).get('catalogo');
    const filas = vista === 'edificios' ? EDIFICIOS() : vista === 'cubos' ? CUBOS_CAPTURA() : NATURALEZA();
    this.material = new MaterialDiorama({ bordes: [-0.1, 0.4], especular: 0.06, rebote: 0.12 }, attribute('color', 'vec3'));
    this.suelo = new MaterialDiorama({ color: COLORES.hierbaMenta, bordes: [-0.02, 0.32], rebote: 0.1 });
    sueloY.value = 0;
    this.capa = document.createElement('div');
    this.capa.className = 'catalogo';
    document.body.append(this.capa);

    // Cada fila, centrada en x; las filas, de atrás (la primera) hacia delante.
    let z = 0;
    const total = new Box3();
    filas.forEach((fila, f) => {
      const cajas = fila.map((m) => m.geometria.boundingBox!.clone());
      const anchos = cajas.map((c) => c.max.x - c.min.x);
      const largo = anchos.reduce((a, b) => a + b, 0) + SEPARACION * (fila.length - 1);
      const fondo = Math.max(...cajas.map((c) => c.max.z - c.min.z));
      if (f > 0) z += fondo / 2 + SEPARACION;
      let x = -largo / 2;
      fila.forEach((m, i) => {
        const c = cajas[i];
        const malla = new Mesh(m.geometria, this.material);
        malla.position.set(x - c.min.x, 0, z);
        malla.castShadow = true;
        malla.receiveShadow = true;
        ctx.escena.add(malla);
        this.mallas.push(malla);
        total.expandByPoint(new Vector3(x, c.max.y, z + c.max.z)).expandByPoint(new Vector3(x + anchos[i], 0, z + c.min.z));
        const el = document.createElement('span');
        el.textContent = m.nombre;
        this.capa.append(el);
        this.etiquetas.push({ el, en: new Vector3(x + anchos[i] / 2, 0, z + c.max.z + 0.25) });
        this.piezas.push({ centro: new Vector3(x + anchos[i] / 2, c.max.y * 0.45, z + (c.min.z + c.max.z) / 2), tam: Math.max(anchos[i], c.max.y, c.max.z - c.min.z) });
        x += anchos[i] + SEPARACION;
      });
      z += fondo / 2;
    });

    // Un tablero de hierba debajo de todo.
    const t = total.getSize(new Vector3());
    const centro = total.getCenter(new Vector3());
    const base = new Montaje();
    base.cajaRedonda(t.x + 2, 0.3, t.z + 2, centro.x, -0.3, centro.z, COLORES.hierbaMenta, 0.1);
    const tablero = new Mesh(base.fusionar(), this.suelo);
    tablero.receiveShadow = true;
    ctx.escena.add(tablero);
    this.mallas.push(tablero);

    // Cámara del juego (alta, a 50°), a la distancia que hace caber todo el ancho.
    const ancho = Math.max(t.x + 1, (t.z + 1) * 1.6);
    const fovH = 2 * Math.atan(Math.tan(((ctx.camara.fov / 2) * Math.PI) / 180) * ctx.camara.aspect);
    const distancia = ancho / 2 / Math.tan(fovH / 2) + t.y;
    const mira = new Vector3(centro.x, t.y * 0.3, centro.z);
    this.general = { pos: this.desde(mira, distancia), mira };
    this.render = ctx.get<Render>('render');
    const pieza = new URLSearchParams(location.search).get('pieza');
    const pedida = pieza === null ? -1 : Number(pieza);
    this.foco = Number.isInteger(pedida) && pedida >= 0 && pedida < this.piezas.length ? pedida : -1;
    const destino = this.destino();
    ctx.camara.position.copy(destino.pos);
    this.mira.copy(destino.mira);
    ctx.camara.lookAt(this.mira);
    this.render.enfocar(this.mira.x, this.mira.y, this.mira.z);
    const ayuda = document.createElement('p');
    ayuda.className = 'ayuda';
    ayuda.textContent = '← →: acercarse a cada pieza · Esc: todas';
    this.capa.append(ayuda);
    window.addEventListener('keydown', this.alPulsar);
  }

  /** Posición de la cámara del juego (a 50°) que mira a `mira` desde `distancia`. */
  private desde(mira: Vector3, distancia: number): Vector3 {
    return new Vector3(mira.x, mira.y + Math.sin(ELEVACION) * distancia, mira.z + Math.cos(ELEVACION) * distancia);
  }

  private destino(): { pos: Vector3; mira: Vector3 } {
    if (this.foco < 0) return this.general;
    const p = this.piezas[this.foco];
    return { pos: this.desde(p.centro, p.tam * 3 + 2), mira: p.centro };
  }

  actualizar(dt: number, ctx: Ctx): void {
    const d = this.destino();
    const k = Math.min(1, dt * 5);
    ctx.camara.position.lerp(d.pos, k);
    this.mira.lerp(d.mira, k);
    ctx.camara.lookAt(this.mira);
    this.render.enfocar(this.mira.x, this.mira.y, this.mira.z);
    const v = new Vector3();
    for (const { el, en } of this.etiquetas) {
      v.copy(en).project(ctx.camara);
      el.style.transform = `translate(${((v.x + 1) / 2) * innerWidth}px, ${((1 - v.y) / 2) * innerHeight}px) translate(-50%, 0)`;
    }
  }

  dispose(): void {
    for (const m of this.mallas) {
      m.removeFromParent();
      m.geometry.dispose();
    }
    this.material.dispose();
    this.suelo.dispose();
    this.capa.remove();
    window.removeEventListener('keydown', this.alPulsar);
  }
}
