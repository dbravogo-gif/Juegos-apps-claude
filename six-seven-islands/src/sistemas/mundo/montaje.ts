// Utilidades para modelar piezas por código en el estilo de juguete de ARTE.md: juntar piezas con
// color por vértice, azar determinista y deformaciones (abollar, doblar, acanalar). Las usan las
// casas canarias (`canario.ts`) y el kit de naturaleza (`kit.ts`).

import { BoxGeometry, BufferAttribute, BufferGeometry, Color, Matrix4, Quaternion, Vector3 } from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/** Junta piezas de colores en una sola geometría con color por vértice. */
export class Montaje {
  private partes: BufferGeometry[] = [];
  private readonly c = new Color();
  private readonly c2 = new Color();

  /** Sin índice y solo con los atributos que se juntan (posición, normal y, si se pide, color). */
  private preparar(g: BufferGeometry, conColor = false): BufferGeometry {
    const p = g.index ? g.toNonIndexed() : g;
    if (p !== g) g.dispose();
    for (const n of Object.keys(p.attributes)) if (n !== 'position' && n !== 'normal' && !(conColor && n === 'color')) p.deleteAttribute(n);
    return p;
  }

  pon(g: BufferGeometry, color: string, tono = 1): void {
    const p = this.preparar(g);
    this.c.set(color).multiplyScalar(tono);
    const col = new Float32Array(p.getAttribute('position').count * 3);
    for (let i = 0; i < col.length; i += 3) col.set([this.c.r, this.c.g, this.c.b], i);
    p.setAttribute('color', new BufferAttribute(col, 3));
    this.partes.push(p);
  }

  /** Como `pon`, pero con el color en degradado vertical: de `abajo` en su base a `arriba` en su punta. */
  ponDegradado(g: BufferGeometry, abajo: string, arriba: string, tono = 1): void {
    const p = this.preparar(g);
    const pos = p.getAttribute('position');
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < pos.count; i++) {
      min = Math.min(min, pos.getY(i));
      max = Math.max(max, pos.getY(i));
    }
    this.c.set(abajo).multiplyScalar(tono);
    this.c2.set(arriba).multiplyScalar(tono);
    const col = new Float32Array(pos.count * 3);
    const mezcla = new Color();
    for (let i = 0; i < pos.count; i++) {
      mezcla.lerpColors(this.c, this.c2, max > min ? (pos.getY(i) - min) / (max - min) : 1);
      col.set([mezcla.r, mezcla.g, mezcla.b], i * 3);
    }
    p.setAttribute('color', new BufferAttribute(col, 3));
    this.partes.push(p);
  }

  /** Añade una geometría que ya trae su color por vértice, sin cambiarlo. */
  ponTal(g: BufferGeometry): void {
    this.partes.push(this.preparar(g, true));
  }

  /** Una caja apoyada: `y` es la altura de su base. */
  caja(an: number, al: number, fo: number, x: number, y: number, z: number, color: string, tono = 1): void {
    this.pon(new BoxGeometry(an, al, fo).translate(x, y + al / 2, z), color, tono);
  }

  /** Una caja apoyada con las aristas redondeadas, como una pieza de juguete. */
  cajaRedonda(an: number, al: number, fo: number, x: number, y: number, z: number, color: string, radio = 0.06, tono = 1): void {
    this.pon(new RoundedBoxGeometry(an, al, fo, 2, radio).translate(x, y + al / 2, z), color, tono);
  }

  fusionar(): BufferGeometry {
    const g = mergeGeometries(this.partes, false)!;
    for (const p of this.partes) p.dispose();
    this.partes = [];
    g.computeBoundingBox();
    g.computeBoundingSphere();
    return g;
  }
}

/** Azar determinista: la semilla se mezcla primero (las semillas pequeñas darían casi 0) y luego xorshift de 32 bits. */
export function azar(semilla: number): () => number {
  let s = (semilla + 0x9e3779b9) >>> 0;
  s = Math.imul(s ^ (s >>> 16), 0x85ebca6b);
  s = Math.imul(s ^ (s >>> 13), 0xc2b2ae35);
  s = (s ^ (s >>> 16)) >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

export const elegir = <T>(r: () => number, lista: readonly T[]): T => lista[Math.floor(r() * lista.length)];

/** Ruido estable por posición, de -1 a 1: los vértices repetidos de una costura se mueven igual. */
export function ruido(x: number, y: number, z: number, s: number): number {
  let h = Math.imul(Math.round(x * 100) + 7919 * s, 73856093) ^ Math.imul(Math.round(y * 100), 19349663) ^ Math.imul(Math.round(z * 100), 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 2147483648 - 1;
}

/** Abolla una geometría hacia fuera desde su centro, para que no parezca una esfera perfecta. */
export function abollar(g: BufferGeometry, fuerza: number, s: number): BufferGeometry {
  const pos = g.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const f = 1 + ruido(x, y, z, s) * fuerza;
    pos.setXYZ(i, x * f, y * f, z * f);
  }
  g.computeVertexNormals();
  return g;
}

/** Costillas verticales, como las de un cardón: el radio sube y baja `costillas` veces por vuelta. */
export function acanalar(g: BufferGeometry, costillas: number, fondo: number): BufferGeometry {
  const pos = g.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const f = 1 - fondo / 2 + (fondo / 2) * Math.cos(costillas * Math.atan2(x, z)); // el ángulo de CylinderGeometry
    pos.setX(i, x * f);
    pos.setZ(i, z * f);
  }
  g.computeVertexNormals();
  return g;
}

/** Dobla hacia abajo una pieza tumbada a lo largo de +z: la punta (z = largo) baja `caida`. */
export function doblar(g: BufferGeometry, largo: number, caida: number): BufferGeometry {
  const pos = g.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const t = Math.max(0, pos.getZ(i)) / largo;
    pos.setY(i, pos.getY(i) - caida * t * t);
  }
  g.computeVertexNormals();
  return g;
}

/** Triángulo de dos caras en el plano x = constante; los puntos son (z, y). */
export function triangulo(x: number, a: [number, number], b: [number, number], c: [number, number]): BufferGeometry {
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array([a, b, c, a, c, b].flatMap(([z, y]) => [x, y, z])), 3));
  g.computeVertexNormals();
  return g;
}

const ARRIBA = new Vector3(0, 1, 0);

/** Coloca una pieza modelada a lo largo de +y (de 0 a su largo) para que salga de `desde` hacia `dir`. */
export function apuntar(g: BufferGeometry, desde: Vector3, dir: Vector3): BufferGeometry {
  const q = new Quaternion().setFromUnitVectors(ARRIBA, dir.clone().normalize());
  return g.applyMatrix4(new Matrix4().compose(desde, q, new Vector3(1, 1, 1)));
}
