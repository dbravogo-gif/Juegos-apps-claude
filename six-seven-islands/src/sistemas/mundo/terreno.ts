// Geometría del suelo de la isla: el terreno en terrazas por alturas, el relleno de las cumbres
// entre zonas y la decoración del suelo (hierba alta, malpaís y flores). Funciones puras de
// Three.js sin estado: el subsistema «mundo» las monta en la escena.

import {
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  Matrix4,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EDIFICIOS, TRANSITABLES, clave, deClave, type Casilla, type CasillaMundo, type DefZona, type Mundo } from '../../core/mundo';
import { FONDO, alturaSuelo } from '../../arte/escala';
import { COLORES } from '../../arte/paleta';
import { piezaKit } from './kit';

/** Si el punto (x, y) cae dentro del polígono (regla par-impar). */
export function dentroDe(pol: readonly (readonly [number, number])[], x: number, y: number): boolean {
  let dentro = false;
  for (let i = 0, j = pol.length - 1; i < pol.length; j = i++) {
    const [xi, yi] = pol[i];
    const [xj, yj] = pol[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}

/**
 * La tierra de la silueta (autor, 2026-11-11): lo que cae dentro de la costa y no es de ninguna
 * zona. Baja junto al mar y junto a las zonas, para no tapar los caminos a la cámara, y sube hacia
 * el interior, hasta 5 escalones; los volcanes los pone «mundo» encima.
 */
function tierraDeSilueta(m: Mundo, silueta: readonly (readonly [number, number])[]): Map<number, number> {
  const tierra = new Set<number>();
  for (let y = 0; y < m.alto; y++) {
    for (let x = 0; x < m.ancho; x++) {
      const k = clave(x, y);
      if (!m.casillas.has(k) && dentroDe(silueta, x, y)) tierra.add(k);
    }
  }
  // Distancia a lo que no es esta tierra (el mar o una zona), por anchura.
  const dist = new Map<number, number>();
  let frente: number[] = [];
  for (const k of tierra) {
    const [x, y] = deClave(k);
    if ([clave(x + 1, y), clave(x - 1, y), clave(x, y + 1), clave(x, y - 1)].some((v) => !tierra.has(v))) {
      dist.set(k, 1);
      frente.push(k);
    }
  }
  for (let d = 2; frente.length; d++) {
    const siguiente: number[] = [];
    for (const k of frente) {
      const [x, y] = deClave(k);
      for (const v of [clave(x + 1, y), clave(x - 1, y), clave(x, y + 1), clave(x, y - 1)]) {
        if (tierra.has(v) && !dist.has(v)) {
          dist.set(v, d);
          siguiente.push(v);
        }
      }
    }
    frente = siguiente;
  }
  const res = new Map<number, number>();
  for (const [k, d] of dist) res.set(k, Math.min(5, 1 + Math.floor((d - 1) / 2)));
  return res;
}

/**
 * Casillas que no son de ninguna zona pero quedan dentro de la isla: con silueta, toda la tierra
 * de su costa; sin ella, las cumbres del centro, entre zona y zona.
 */
export function cumbres(m: Mundo): Map<number, number> {
  if (m.isla.silueta) return tierraDeSilueta(m, m.isla.silueta);
  const res = new Map<number, number>();
  for (let y = 0; y < m.alto; y++) {
    let min = Infinity;
    let max = -Infinity;
    for (let x = 0; x < m.ancho; x++) {
      if (m.casillas.has(clave(x, y))) {
        min = Math.min(min, x);
        max = Math.max(max, x);
      }
    }
    for (let x = min + 1; x < max; x++) {
      const k = clave(x, y);
      if (!m.casillas.has(k)) res.set(k, 7 + (pseudo(k) % 3));
    }
  }
  return res;
}

/** Número estable por casilla, para variar la decoración sin azar. */
export function pseudo(k: number): number {
  let h = (k * 2654435761) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 2246822519) >>> 0;
  return (h ^ (h >>> 13)) >>> 0;
}

const SUBIDA_ENCUENTRO = 0.12;
/**
 * Las coladas de lava, que no se pisan, van claramente más altas que el camino y el malpaís, que sí
 * se pisa y es bajo: así se leen como muro y como suelo (probador, 2026-11-10). No más, para no tapar.
 */
const SUBIDA_COLADA = 0.45;
const IDENT = new Quaternion();

/** Altura de la cara de arriba de una casilla. */
export function alturaCara(cm: CasillaMundo | undefined, cumbre: number | undefined): number {
  if (cumbre !== undefined) return alturaSuelo(cumbre);
  if (!cm) return FONDO;
  switch (cm.c) {
    case '~':
    case 'B':
      return -0.7;
    case 'w':
      // 10 cm por encima del mar, que va bajo toda la isla: a la misma altura, el azul del mar y el
      // verde del charco se peleaban por cada píxel (autor, 2026-11-10).
      return alturaSuelo(cm.h) - 0.15;
    case '#':
      return alturaSuelo(cm.h) + 0.9;
    case '"':
    case ';':
      return alturaSuelo(cm.h) + SUBIDA_ENCUENTRO;
    case 'L':
    case 'Q': // los conos salen de entre las coladas
      return alturaSuelo(cm.h) + SUBIDA_COLADA;
    default:
      return alturaSuelo(cm.h);
  }
}

const COLOR_ARRIBA: Partial<Record<Casilla, string>> = {
  '.': COLORES.hierbaMenta,
  ',': COLORES.arenaCaramelo,
  ':': COLORES.tierra,
  _: COLORES.picon,
  '"': COLORES.hierbaAlta,
  ';': COLORES.malpais,
  '#': '#9C928C',
  '~': COLORES.aguaTurquesa,
  T: COLORES.hierbaHonda,
  Y: COLORES.hierbaMenta,
  b: COLORES.hierbaMenta,
  '=': COLORES.muro,
  d: COLORES.arenaCaramelo,
  X: COLORES.arenaCaramelo,
  P: COLORES.maderaTostada,
  B: COLORES.aguaTurquesa,
  V: COLORES.picon,
  U: COLORES.tierra,
  // Las coladas, negras y con lajas altas: se distinguen del malpaís rojizo, que sí se pisa.
  L: COLORES.lavaNegra,
  w: COLORES.charcoVerde,
  a: COLORES.arenaDorada,
  Q: COLORES.lavaNegra,
};

type ColoresIsla = Mundo['isla']['colores'];

/**
 * Ruido suave por casilla, entre 0 y 1: manchas de unas `lado` casillas, sin azar. Interpola los
 * valores de una rejilla gruesa para que las manchas tengan bordes suaves y no sean un damero.
 */
export function manchas(x: number, y: number, lado: number): number {
  const gx = Math.floor(x / lado);
  const gy = Math.floor(y / lado);
  const fx = x / lado - gx;
  const fy = y / lado - gy;
  const v = (i: number, j: number) => (pseudo(clave(gx + i + 64, gy + j + 64)) % 1000) / 1000;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const arriba = v(0, 0) + (v(1, 0) - v(0, 0)) * sx;
  const abajo = v(0, 1) + (v(1, 1) - v(0, 1)) * sx;
  return arriba + (abajo - arriba) * sy;
}

const TIMANFAYA = [new Color(COLORES.picon), new Color(COLORES.piconOxido), new Color(COLORES.piconOcre)];

/** El picón y la tierra de las zonas de volcán, con manchas negras, óxido y ocre como en Timanfaya. */
function colorTimanfaya(x: number, y: number, c: Color): Color {
  const n = Math.min(0.999, Math.max(0, (manchas(x, y, 5) - 0.25) * 1.6));
  const t = n * (TIMANFAYA.length - 1);
  const i = Math.floor(t);
  return c.copy(TIMANFAYA[i]).lerp(TIMANFAYA[i + 1], t - i);
}

/** Casillas de una planta: su suelo es el de alrededor, para que no quede un cuadro de otro color. */
/** Lo que se pone encima del suelo: debajo, el suelo es del color del de alrededor. */
const PLANTAS: ReadonlySet<string> = new Set(['T', 'U', 'Y', 'b', 'O', 't']);

/** El suelo más repetido alrededor de una planta (sin contar plantas ni edificios), si hay. */
function sueloAlrededor(m: Mundo, x: number, y: number): CasillaMundo | undefined {
  const cuenta = new Map<string, { n: number; cm: CasillaMundo }>();
  let mejor: { n: number; cm: CasillaMundo } | undefined;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const v = m.casillas.get(clave(x + dx, y + dy));
      if (!v || PLANTAS.has(v.c) || EDIFICIOS.has(v.c) || v.c === 'd' || !TRANSITABLES.has(v.c)) continue;
      const c = cuenta.get(v.c) ?? { n: 0, cm: v };
      c.n++;
      cuenta.set(v.c, c);
      if (!mejor || c.n > mejor.n) mejor = c;
    }
  }
  return mejor?.cm;
}

/** Color de la cara de arriba de una casilla de la isla (sin el tono que la varía). */
export function colorDeCasilla(m: Mundo, k: number, esCumbre = false, c = new Color()): Color {
  const [x, y] = deClave(k);
  let cm = m.casillas.get(k);
  if (cm && PLANTAS.has(cm.c)) cm = sueloAlrededor(m, x, y) ?? cm;
  const zona = cm ? m.zonas.get(cm.zona) : undefined;
  if (!esCumbre && zona?.flora === 'volcan' && (cm?.c === '_' || cm?.c === ':')) return colorTimanfaya(x, y, c);
  return c.set(colorArriba(cm, esCumbre, m.isla.colores, zona));
}

function colorArriba(cm: CasillaMundo | undefined, esCumbre: boolean, isla: ColoresIsla, zona?: DefZona): string {
  if (esCumbre) return isla?.cumbre ?? COLORES.cumbre;
  if (!cm) return COLORES.tierra;
  return zona?.suelo?.[cm.c] ?? isla?.suelo?.[cm.c] ?? COLOR_ARRIBA[cm.c] ?? COLORES.arenaCaramelo; // bajo los edificios, como el camino
}

function colorLado(cm: CasillaMundo | undefined, esCumbre: boolean, isla: ColoresIsla): string {
  if (esCumbre) return isla?.ladoCumbre ?? '#9196C6';
  if (cm?.c === '#') return '#7E746F';
  if (cm?.c === 'a') return COLORES.ladoArena;
  if (cm?.c === '_' || cm?.c === ';' || cm?.c === 'L' || cm?.c === 'Q') return '#4A4247';
  return '#8E6A4D';
}

/** El terreno entero en una malla: caras de arriba y laterales solo donde hay desnivel. */
export function geometriaTerreno(m: Mundo, cumbre: Map<number, number>): BufferGeometry {
  const pos: number[] = [];
  const nor: number[] = [];
  const col: number[] = [];
  const c = new Color();
  const tinte = new Color();
  // `tono` varía un poco el color de cada casilla, para que el suelo no sean losas lisas.
  const quad = (a: number[], b: number[], cc: number[], d: number[], n: number[], hex: string | Color, tono = 1) => {
    if (typeof hex === 'string') c.set(hex);
    else c.copy(hex);
    c.multiplyScalar(tono);
    for (const v of [a, b, cc, a, cc, d]) {
      pos.push(v[0], v[1], v[2]);
      nor.push(n[0], n[1], n[2]);
      col.push(c.r, c.g, c.b);
    }
  };
  const casillas = new Set<number>([...m.casillas.keys(), ...cumbre.keys()]);
  for (const k of casillas) {
    const [x, y] = deClave(k);
    const cm = m.casillas.get(k);
    const esCumbre = cumbre.has(k);
    const top = alturaCara(cm, cumbre.get(k));
    const x0 = x - 0.5;
    const x1 = x + 0.5;
    const z0 = y - 0.5;
    const z1 = y + 0.5;
    const arriba = colorDeCasilla(m, k, esCumbre, tinte);
    quad([x0, top, z1], [x1, top, z1], [x1, top, z0], [x0, top, z0], [0, 1, 0], arriba, 0.95 + (pseudo(k) % 11) * 0.01);
    const lado = colorLado(cm, esCumbre, m.isla.colores);
    const vecinos: [number, number, number[], number[][]][] = [
      [x, y + 1, [0, 0, 1], [[x0, z1], [x1, z1]]],
      [x, y - 1, [0, 0, -1], [[x1, z0], [x0, z0]]],
      [x + 1, y, [1, 0, 0], [[x1, z1], [x1, z0]]],
      [x - 1, y, [-1, 0, 0], [[x0, z0], [x0, z1]]],
    ];
    for (const [vx, vy, n, [[ax, az], [bx, bz]]] of vecinos) {
      const kv = clave(vx, vy);
      const abajo = alturaCara(m.casillas.get(kv), cumbre.get(kv));
      if (abajo >= top) continue;
      quad([ax, abajo, az], [bx, abajo, bz], [bx, top, bz], [ax, top, az], n, lado);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('normal', new BufferAttribute(new Float32Array(nor), 3));
  g.setAttribute('color', new BufferAttribute(new Float32Array(col), 3));
  g.computeBoundingSphere();
  return g;
}

export interface Decoracion {
  /** Trozo de la isla: cada trozo lleva sus propias mallas, para descartar las que no se ven. */
  zona: string;
  geometria: BufferGeometry;
  /** Color liso, o null si la geometría trae su color por vértice. */
  color: string | null;
  matrices: Matrix4[];
}

/** Lado de los trozos de decoración, en casillas: lo que no se ve se descarta trozo a trozo. */
const TROZO = 12;

/** La decoración del suelo, por trozos: matas de hierba alta, lajas del malpaís y flores. */
export function decoracion(m: Mundo): Decoracion[] {
  const res: Decoracion[] = [];
  const trozos = new Map<string, number[]>();
  for (const k of m.casillas.keys()) {
    const [x, y] = deClave(k);
    const id = `${Math.floor(x / TROZO)},${Math.floor(y / TROZO)}`;
    const lista = trozos.get(id) ?? [];
    lista.push(k);
    trozos.set(id, lista);
  }
  const geosIsla = geometriasDecoracion(m.isla.colores?.matas);
  for (const [id, claves] of trozos) {
    const listas = decoracionDe(m, claves);
    for (const [nombre, matrices] of Object.entries(listas)) {
      const g = geosIsla[nombre as NombreDeco];
      if (matrices.length) res.push({ zona: id, geometria: g.geometria, color: g.color, matrices });
    }
  }
  return res;
}

/** Variantes de las lajas del malpaís: cada casilla toma una, girada de 90 en 90 grados. */
const LAJAS = 3;

/** Geometrías de la decoración, compartidas por todas las zonas. */
export function geometriasDecoracion(colorMatas = '#2F8A5B'): Record<NombreDeco, { geometria: BufferGeometry; color: string | null }> {
  const mata = mergeGeometries(
    [-0.25, 0, 0.25].map((a, i) => new ConeGeometry(0.08, 0.5, 4).translate(0, 0.25, 0).rotateZ(a).rotateY(i * 1.2).translate((i - 1) * 0.1, 0, 0)),
    false,
  )!;
  const flores = mergeGeometries(
    [
      [0, 0],
      [0.14, 0.08],
      [-0.1, 0.12],
    ].map(([a, b]) => new SphereGeometry(0.05, 6, 4).translate(a, 0.05, b)),
    false,
  )!;
  const guijarros = mergeGeometries(
    [
      [0, 0, 0.07],
      [0.12, -0.06, 0.05],
      [-0.08, 0.1, 0.045],
    ].map(([a, b, r]) => new SphereGeometry(r, 6, 4).scale(1.2, 0.5, 1).translate(a, r * 0.25, b)),
    false,
  )!;
  return {
    matas: { geometria: mata, color: colorMatas },
    lajas0: { geometria: piezaKit('lajas', 0), color: null },
    lajas1: { geometria: piezaKit('lajas', 1), color: null },
    lajas2: { geometria: piezaKit('lajas', 2), color: null },
    colada0: { geometria: piezaKit('colada', 0), color: null },
    colada1: { geometria: piezaKit('colada', 1), color: null },
    colada2: { geometria: piezaKit('colada', 2), color: null },
    floresBlancas: { geometria: flores, color: '#FFF8EC' },
    floresAmarillas: { geometria: flores, color: '#FFD84A' },
    guijarrosClaros: { geometria: guijarros, color: COLORES.guijarroClaro },
    guijarrosOscuros: { geometria: guijarros, color: COLORES.guijarroOscuro },
  };
}

type NombreDeco =
  | 'matas'
  | 'lajas0'
  | 'lajas1'
  | 'lajas2'
  | 'colada0'
  | 'colada1'
  | 'colada2'
  | 'floresBlancas'
  | 'floresAmarillas'
  | 'guijarrosClaros'
  | 'guijarrosOscuros';

/** Si la casilla tiene algún vecino con otra letra. */
function bordeDe(m: Mundo, x: number, y: number, letra: string): boolean {
  return [clave(x + 1, y), clave(x - 1, y), clave(x, y + 1), clave(x, y - 1)].some((k) => m.casillas.get(k)?.c !== letra);
}

function decoracionDe(m: Mundo, claves: number[]): Record<NombreDeco, Matrix4[]> {
  const floresBlancas: Matrix4[] = [];
  const floresAmarillas: Matrix4[] = [];
  const guijarrosClaros: Matrix4[] = [];
  const guijarrosOscuros: Matrix4[] = [];
  const matas: Matrix4[] = [];
  const lajas: Matrix4[][] = Array.from({ length: LAJAS }, () => []);
  const coladas: Matrix4[][] = Array.from({ length: LAJAS }, () => []);
  const giro = new Quaternion();
  const arriba = new Vector3(0, 1, 0);
  const v = new Vector3();
  for (const k of claves) {
    const cm = m.casillas.get(k)!;
    const [x, y] = deClave(k);
    const base = alturaSuelo(cm.h);
    const r = pseudo(k);
    const j = (n: number) => (((r >>> n) & 255) / 255 - 0.5) * 0.3;
    if (cm.c === '.' && r % 5 === 0) {
      // Florecillas sueltas en la hierba corta: puntos de color, no matas (las matas avisan de
      // zona de encuentros).
      (r & 32 ? floresBlancas : floresAmarillas).push(new Matrix4().compose(v.set(x + j(2) * 2, base + 0.02, y + j(9) * 2), IDENT, new Vector3(1, 1, 1)));
    } else if (cm.c === '"') {
      for (let i = 0; i < 3; i++) {
        matas.push(new Matrix4().compose(v.set(x + j(i * 5) * 2, base + 0.12, y + j(i * 5 + 3) * 2), IDENT, new Vector3(1, 0.8 + ((r >>> i) & 3) * 0.15, 1)));
      }
    } else if (cm.c === ';' || cm.c === 'L' || (cm.c === 'Q' && bordeDe(m, x, y, 'Q'))) {
      // El malpaís (se pisa) y las coladas (no) llevan las mismas lajas de lava; también el borde
      // de los conos, que asoman por su falda como lava a su pie.
      giro.setFromAxisAngle(arriba, ((r >>> 4) % 4) * (Math.PI / 2));
      const colada = cm.c !== ';';
      const sube = colada ? SUBIDA_COLADA : SUBIDA_ENCUENTRO;
      const alto = colada ? 1.7 + ((r >>> 7) & 3) * 0.12 : 0.55 + ((r >>> 7) & 3) * 0.08;
      (colada ? coladas : lajas)[r % LAJAS].push(new Matrix4().compose(v.set(x, base + sube, y), giro, new Vector3(1, alto, 1)));
    } else if ((cm.c === 'a' || cm.c === ':' || cm.c === '_') && r % 4 === 1) {
      // Guijarros sueltos en la arena, la tierra y el picón: el suelo liso parecía sin trabajar.
      giro.setFromAxisAngle(arriba, (r >>> 6) % 7);
      const lista = cm.c === '_' ? guijarrosOscuros : guijarrosClaros;
      lista.push(new Matrix4().compose(v.set(x + j(3) * 2, base, y + j(11) * 2), giro, new Vector3(1, 1, 1)));
    }
  }
  const [lajas0, lajas1, lajas2] = lajas;
  const [colada0, colada1, colada2] = coladas;
  return { matas, lajas0, lajas1, lajas2, colada0, colada1, colada2, floresBlancas, floresAmarillas, guijarrosClaros, guijarrosOscuros };
}

