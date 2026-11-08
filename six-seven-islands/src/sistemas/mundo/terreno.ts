// Geometría de la isla con formas simples (maqueta de F05): el terreno en terrazas por alturas,
// el relleno de las cumbres entre zonas, los edificios y la decoración repetida. Funciones puras
// de Three.js sin estado: el subsistema «mundo» las monta en la escena.

import {
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Matrix4,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { clave, deClave, type Casilla, type CasillaMundo, type Mundo } from '../../core/mundo';
import { FONDO, alturaSuelo } from '../../arte/escala';
import { COLORES } from '../../arte/paleta';
import { lajasMalpais } from './canario';

/** Casillas que no son de ninguna zona pero quedan dentro de la isla: las cumbres del centro. */
export function cumbres(m: Mundo): Map<number, number> {
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
const IDENT = new Quaternion();

/** Altura de la cara de arriba de una casilla. */
export function alturaCara(cm: CasillaMundo | undefined, cumbre: number | undefined): number {
  if (cumbre !== undefined) return alturaSuelo(cumbre);
  if (!cm) return FONDO;
  switch (cm.c) {
    case '~':
    case 'B':
      return -0.7;
    case '#':
      return alturaSuelo(cm.h) + 0.9;
    case '"':
    case ';':
      return alturaSuelo(cm.h) + SUBIDA_ENCUENTRO;
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
};

function colorArriba(cm: CasillaMundo | undefined, esCumbre: boolean): string {
  if (esCumbre) return COLORES.cumbre;
  if (!cm) return COLORES.tierra;
  return COLOR_ARRIBA[cm.c] ?? COLORES.arenaCaramelo; // bajo los edificios, como el camino
}

function colorLado(cm: CasillaMundo | undefined, esCumbre: boolean): string {
  if (esCumbre) return '#9196C6';
  if (cm?.c === '#') return '#7E746F';
  if (cm?.c === '_' || cm?.c === ';') return '#4A4247';
  return '#8E6A4D';
}

/** El terreno entero en una malla: caras de arriba y laterales solo donde hay desnivel. */
export function geometriaTerreno(m: Mundo, cumbre: Map<number, number>): BufferGeometry {
  const pos: number[] = [];
  const nor: number[] = [];
  const col: number[] = [];
  const c = new Color();
  // `tono` varía un poco el color de cada casilla, para que el suelo no sean losas lisas.
  const quad = (a: number[], b: number[], cc: number[], d: number[], n: number[], hex: string, tono = 1) => {
    c.set(hex).multiplyScalar(tono);
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
    quad([x0, top, z1], [x1, top, z1], [x1, top, z0], [x0, top, z0], [0, 1, 0], colorArriba(cm, esCumbre), 0.95 + (pseudo(k) % 11) * 0.01);
    const lado = colorLado(cm, esCumbre);
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

/** La decoración propia, por trozos: plataneras, el drago, matas de hierba alta, lajas del malpaís y flores. */
export function decoracion(m: Mundo): Decoracion[] {
  const res: Decoracion[] = [];
  const geos = geometriasDecoracion();
  const trozos = new Map<string, number[]>();
  for (const k of m.casillas.keys()) {
    const [x, y] = deClave(k);
    const id = `${Math.floor(x / TROZO)},${Math.floor(y / TROZO)}`;
    const lista = trozos.get(id) ?? [];
    lista.push(k);
    trozos.set(id, lista);
  }
  for (const [id, claves] of trozos) {
    const listas = decoracionDe(m, claves);
    for (const [nombre, matrices] of Object.entries(listas)) {
      const g = geos[nombre as keyof typeof geos];
      if (matrices.length) res.push({ zona: id, geometria: g.geometria, color: g.color, matrices });
    }
  }
  return res;
}

/** Variantes de las lajas del malpaís: cada casilla toma una, girada de 90 en 90 grados. */
const LAJAS = 4;

/** Geometrías de la decoración, compartidas por todas las zonas. */
export function geometriasDecoracion(): Record<NombreDeco, { geometria: BufferGeometry; color: string | null }> {
  const mata = mergeGeometries(
    [-0.25, 0, 0.25].map((a, i) => new ConeGeometry(0.08, 0.5, 4).translate(0, 0.25, 0).rotateZ(a).rotateY(i * 1.2).translate((i - 1) * 0.1, 0, 0)),
    false,
  )!;
  const platanera = mergeGeometries(
    [
      ...[0, 1.3, 2.6, 3.9, 5.2].map((a): BufferGeometry => new SphereGeometry(0.5, 5, 3).scale(0.12, 0.08, 0.5).translate(0, 1.1, 0.35).rotateY(a)),
      new CylinderGeometry(0.08, 0.1, 1.1, 5).translate(0, 0.55, 0),
    ],
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
  const dragoGeo = mergeGeometries(
    [new CylinderGeometry(0.25, 0.35, 1.4, 8).translate(0, 0.7, 0), new SphereGeometry(1.2, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.45, 1).translate(0, 1.45, 0)],
    false,
  )!;
  return {
    plataneras: { geometria: platanera, color: '#8CC152' },
    drago: { geometria: dragoGeo, color: '#6E8F45' },
    matas: { geometria: mata, color: '#2F8A5B' },
    lajas0: { geometria: lajasMalpais(11), color: null },
    lajas1: { geometria: lajasMalpais(23), color: null },
    lajas2: { geometria: lajasMalpais(37), color: null },
    lajas3: { geometria: lajasMalpais(41), color: null },
    floresBlancas: { geometria: flores, color: '#FFF8EC' },
    floresAmarillas: { geometria: flores, color: '#FFD84A' },
  };
}

type NombreDeco = 'plataneras' | 'drago' | 'matas' | 'lajas0' | 'lajas1' | 'lajas2' | 'lajas3' | 'floresBlancas' | 'floresAmarillas';

function decoracionDe(m: Mundo, claves: number[]): Record<NombreDeco, Matrix4[]> {
  const floresBlancas: Matrix4[] = [];
  const floresAmarillas: Matrix4[] = [];
  const plataneras: Matrix4[] = [];
  const matas: Matrix4[] = [];
  const lajas: Matrix4[][] = Array.from({ length: LAJAS }, () => []);
  const drago: Matrix4[] = [];
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
    } else if (cm.c === 'b') {
      plataneras.push(new Matrix4().compose(v.set(x + j(4), base, y + j(12)), IDENT, new Vector3(1, 0.9 + (r & 7) / 20, 1)));
    } else if (cm.c === 'Y') {
      drago.push(new Matrix4().compose(v.set(x, base, y), IDENT, new Vector3(1, 1, 1)));
    } else if (cm.c === '"') {
      for (let i = 0; i < 3; i++) {
        matas.push(new Matrix4().compose(v.set(x + j(i * 5) * 2, base + 0.12, y + j(i * 5 + 3) * 2), IDENT, new Vector3(1, 0.8 + ((r >>> i) & 3) * 0.15, 1)));
      }
    } else if (cm.c === ';') {
      giro.setFromAxisAngle(arriba, ((r >>> 4) % 4) * (Math.PI / 2));
      lajas[r % LAJAS].push(new Matrix4().compose(v.set(x, base + SUBIDA_ENCUENTRO, y), giro, new Vector3(1, 0.9 + ((r >>> 7) & 3) * 0.1, 1)));
    }
  }
  const [lajas0, lajas1, lajas2, lajas3] = lajas;
  return { plataneras, drago, matas, lajas0, lajas1, lajas2, lajas3, floresBlancas, floresAmarillas };
}

