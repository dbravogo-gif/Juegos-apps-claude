// Geometría de la isla con formas simples (maqueta de F05): el terreno en terrazas por alturas,
// el relleno de las cumbres entre zonas, los edificios y la decoración repetida. Funciones puras
// de Three.js sin estado: el subsistema «mundo» las monta en la escena.

import {
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  Matrix4,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { clave, deClave, edificios, type Casilla, type CasillaMundo, type Mundo } from '../../core/mundo';
import { FONDO, alturaSuelo } from '../../arte/escala';
import { COLORES } from '../../arte/paleta';

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
      return alturaSuelo(cm.h) + 1.4;
    case '=':
      return alturaSuelo(cm.h) + 0.45;
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
  '#': COLORES.cumbre,
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
  if (esCumbre || cm?.c === '#') return '#9196C6';
  if (cm?.c === '_' || cm?.c === ';') return '#4A4247';
  return '#8E6A4D';
}

/** El terreno entero en una malla: caras de arriba y laterales solo donde hay desnivel. */
export function geometriaTerreno(m: Mundo, cumbre: Map<number, number>): BufferGeometry {
  const pos: number[] = [];
  const nor: number[] = [];
  const col: number[] = [];
  const c = new Color();
  const quad = (a: number[], b: number[], cc: number[], d: number[], n: number[], hex: string) => {
    c.set(hex);
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
    quad([x0, top, z1], [x1, top, z1], [x1, top, z0], [x0, top, z0], [0, 1, 0], colorArriba(cm, esCumbre));
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

/** Colorea una geometría entera de un color, como atributo de vértice. */
function teñir(g: BufferGeometry, hex: string): BufferGeometry {
  g.deleteAttribute('uv');
  const c = new Color(hex);
  const n = g.attributes.position.count;
  const col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) col.set([c.r, c.g, c.b], i * 3);
  g.setAttribute('color', new BufferAttribute(col, 3));
  if (g.index) return g.toNonIndexed();
  return g;
}

// Bajos a propósito: con la cámara a 50°, un edificio alto tapa lo que hay detrás.
const ALTO_EDIFICIO: Partial<Record<Casilla, number>> = { C: 1.3, M: 1.6, R: 1.6, S: 1.3, G: 2.6, F: 4.2 };
const ALTO_TEJADO: Partial<Record<Casilla, number>> = { C: 0.9, M: 1.0, R: 1.0, S: 0.9, G: 1.4 };
const PARED: Partial<Record<Casilla, string>> = {
  C: COLORES.crema,
  M: '#F2E2C4',
  R: '#FFF6EA',
  S: '#FFF6EA',
  G: '#FFF3C2',
  F: '#FFFFFF',
};
const TEJADO: Partial<Record<Casilla, string>> = {
  C: COLORES.tejaCanaria,
  M: COLORES.sombraLavanda,
  R: COLORES.acentoCoral,
  S: '#5E8FD6',
  G: '#F2C230',
  F: COLORES.acentoCoral,
};

/** Los edificios de la isla en dos mallas: paredes y tejados (y las puertas en las paredes). */
export function geometriaEdificios(m: Mundo): BufferGeometry {
  const partes: BufferGeometry[] = [];
  for (const zona of m.zonas.keys()) {
    for (const e of edificios(m, zona)) {
      const xs = e.casillas.map((k) => deClave(k)[0]);
      const ys = e.casillas.map((k) => deClave(k)[1]);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
      const cz = (Math.min(...ys) + Math.max(...ys)) / 2;
      const base = alturaSuelo(m.casillas.get(e.casillas[0])!.h);
      const alto = ALTO_EDIFICIO[e.tipo] ?? 2;
      const w = e.ancho - 0.15;
      const d = e.fondo - 0.15;
      if (e.tipo === 'F') {
        const torre = new CylinderGeometry(0.55, 0.8, alto, 16).translate(cx, base + alto / 2, cz);
        partes.push(teñir(torre, PARED.F!));
        partes.push(teñir(new CylinderGeometry(0.45, 0.45, 0.6, 12).translate(cx, base + alto + 0.3, cz), '#FFE9A8'));
        partes.push(teñir(new ConeGeometry(0.7, 0.7, 12).translate(cx, base + alto + 0.95, cz), TEJADO.F!));
        continue;
      }
      const cuerpo = new BoxGeometryLigera(w, alto, d).translate(cx, base + alto / 2, cz);
      partes.push(teñir(cuerpo, PARED[e.tipo] ?? COLORES.crema));
      // Tejado a cuatro aguas con alero: una pirámide de base cuadrada escalada a la planta.
      const ht = ALTO_TEJADO[e.tipo] ?? 0.9;
      const tejado = new ConeGeometry(Math.SQRT1_2, 1, 4, 1)
        .rotateY(Math.PI / 4)
        .scale(w + 0.35, ht, d + 0.35)
        .translate(cx, base + alto + ht / 2, cz);
      partes.push(teñir(tejado, TEJADO[e.tipo] ?? COLORES.tejaCanaria));
      // Puertas: un rectángulo oscuro en la pared que da a cada puerta.
      for (const p of e.puertas) {
        const [px, pz] = deClave(p);
        const dx = Math.sign(px - cx) * (Math.abs(px - cx) > w / 2 ? 1 : 0);
        const dz = Math.sign(pz - cz) * (Math.abs(pz - cz) > d / 2 ? 1 : 0);
        const hueco = new BoxGeometryLigera(dz !== 0 ? 0.7 : 0.08, 1.1, dx !== 0 ? 0.7 : 0.08);
        const ex = dx !== 0 ? cx + dx * (w / 2 + 0.02) : px;
        const ez = dz !== 0 ? cz + dz * (d / 2 + 0.02) : pz;
        partes.push(teñir(hueco.translate(ex, base + 0.55, ez), COLORES.balcon));
      }
      // El gimnasio lleva su emblema de Luz sobre la puerta: que se vea que es el gimnasio.
      if (e.tipo === 'G') {
        const emblema = new SphereGeometry(0.55, 16, 10).scale(1, 1, 0.35).translate(cx, base + alto - 0.4, cz + d / 2 + 0.1);
        partes.push(teñir(emblema, '#FFD84A'));
      }
    }
  }
  const g = mergeGeometries(partes, false)!;
  for (const p of partes) p.dispose();
  g.computeBoundingSphere();
  return g;
}

/** Caja sin índice, para fusionar con lo demás. */
class BoxGeometryLigera extends BufferGeometry {
  constructor(w: number, h: number, d: number) {
    super();
    const x = w / 2;
    const y = h / 2;
    const z = d / 2;
    const caras: [number[], number[][]][] = [
      [[1, 0, 0], [[x, -y, z], [x, -y, -z], [x, y, -z], [x, y, z]]],
      [[-1, 0, 0], [[-x, -y, -z], [-x, -y, z], [-x, y, z], [-x, y, -z]]],
      [[0, 1, 0], [[-x, y, z], [x, y, z], [x, y, -z], [-x, y, -z]]],
      [[0, -1, 0], [[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z]]],
      [[0, 0, 1], [[-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]]],
      [[0, 0, -1], [[x, -y, -z], [-x, -y, -z], [-x, y, -z], [x, y, -z]]],
    ];
    const pos: number[] = [];
    const nor: number[] = [];
    for (const [n, [a, b, c, d2]] of caras) {
      for (const v of [a, b, c, a, c, d2]) {
        pos.push(...v);
        nor.push(...n);
      }
    }
    this.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
    this.setAttribute('normal', new BufferAttribute(new Float32Array(nor), 3));
  }
}

export interface Decoracion {
  /** Trozo de la isla: cada trozo lleva sus propias mallas, para descartar las que no se ven. */
  zona: string;
  geometria: BufferGeometry;
  color: string;
  matrices: Matrix4[];
}

/** Lado de los trozos de decoración, en casillas: lo que no se ve se descarta trozo a trozo. */
const TROZO = 12;

/** La decoración repetida, por trozos: árboles, plataneras, el drago, matas de hierba alta y piedras del malpaís. */
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

/** Geometrías de la decoración, compartidas por todas las zonas. */
export function geometriasDecoracion() {
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
  const dragoGeo = mergeGeometries(
    [new CylinderGeometry(0.25, 0.35, 1.4, 8).translate(0, 0.7, 0), new SphereGeometry(1.2, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.45, 1).translate(0, 1.45, 0)],
    false,
  )!;
  return {
    troncos: { geometria: new CylinderGeometry(0.1, 0.16, 0.8, 5) as BufferGeometry, color: COLORES.maderaTostada },
    copas: { geometria: new SphereGeometry(0.62, 8, 6) as BufferGeometry, color: '#2E7D57' },
    plataneras: { geometria: platanera, color: '#8CC152' },
    drago: { geometria: dragoGeo, color: '#6E8F45' },
    matas: { geometria: mata, color: '#2F8A5B' },
    piedras: { geometria: new DodecahedronGeometry(1, 0) as BufferGeometry, color: '#5E3A33' },
  };
}

function decoracionDe(m: Mundo, claves: number[]): Record<'troncos' | 'copas' | 'plataneras' | 'drago' | 'matas' | 'piedras', Matrix4[]> {
  const troncos: Matrix4[] = [];
  const copas: Matrix4[] = [];
  const plataneras: Matrix4[] = [];
  const matas: Matrix4[] = [];
  const piedras: Matrix4[] = [];
  const drago: Matrix4[] = [];
  const v = new Vector3();
  for (const k of claves) {
    const cm = m.casillas.get(k)!;
    const [x, y] = deClave(k);
    const base = alturaSuelo(cm.h);
    const r = pseudo(k);
    const j = (n: number) => (((r >>> n) & 255) / 255 - 0.5) * 0.3;
    if (cm.c === 'T') {
      const s = 0.85 + ((r & 15) / 15) * 0.35;
      troncos.push(new Matrix4().compose(v.set(x, base + 0.4 * s, y), IDENT, new Vector3(s, s, s)));
      copas.push(new Matrix4().compose(v.set(x + j(4), base + 1.25 * s, y + j(12)), IDENT, new Vector3(s, s * 1.1, s)));
    } else if (cm.c === 'b') {
      plataneras.push(new Matrix4().compose(v.set(x + j(4), base, y + j(12)), IDENT, new Vector3(1, 0.9 + (r & 7) / 20, 1)));
    } else if (cm.c === 'Y') {
      drago.push(new Matrix4().compose(v.set(x, base, y), IDENT, new Vector3(1, 1, 1)));
    } else if (cm.c === '"') {
      for (let i = 0; i < 3; i++) {
        matas.push(new Matrix4().compose(v.set(x + j(i * 5) * 2, base + 0.12, y + j(i * 5 + 3) * 2), IDENT, new Vector3(1, 0.8 + ((r >>> i) & 3) * 0.15, 1)));
      }
    } else if (cm.c === ';') {
      for (let i = 0; i < 2; i++) {
        const s = 0.18 + ((r >>> (i * 3)) & 7) / 40;
        piedras.push(new Matrix4().compose(v.set(x + j(i * 6) * 2, base + 0.12 + s * 0.4, y + j(i * 6 + 2) * 2), IDENT, new Vector3(s, s * 0.7, s)));
      }
    }
  }
  return { troncos, copas, plataneras, drago, matas, piedras };
}

