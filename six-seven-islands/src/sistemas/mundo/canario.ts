// Piezas propias de La Palma, hechas por código: la casa canaria (rural o de balcones), el laurel
// de la laurisilva y las lajas del malpaís. Son geometrías con color por vértice, para dibujarlas
// todas con un solo material (ARTE.md, «Modelos del mundo»). Funciones puras y deterministas:
// la misma semilla da siempre la misma pieza.

import { BoxGeometry, BufferAttribute, BufferGeometry, Color, ConeGeometry, CylinderGeometry, SphereGeometry } from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { COLORES } from '../../arte/paleta';

/** Junta piezas de colores en una sola geometría con color por vértice. */
class Montaje {
  private partes: BufferGeometry[] = [];
  private readonly c = new Color();

  pon(g: BufferGeometry, color: string, tono = 1): void {
    const p = g.index ? g.toNonIndexed() : g;
    if (p !== g) g.dispose();
    for (const n of Object.keys(p.attributes)) if (n !== 'position' && n !== 'normal') p.deleteAttribute(n);
    this.c.set(color).multiplyScalar(tono);
    const col = new Float32Array(p.getAttribute('position').count * 3);
    for (let i = 0; i < col.length; i += 3) col.set([this.c.r, this.c.g, this.c.b], i);
    p.setAttribute('color', new BufferAttribute(col, 3));
    this.partes.push(p);
  }

  /** Una caja apoyada: `y` es la altura de su base. */
  caja(an: number, al: number, fo: number, x: number, y: number, z: number, color: string, tono = 1): void {
    this.pon(new BoxGeometry(an, al, fo).translate(x, y + al / 2, z), color, tono);
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
function azar(semilla: number): () => number {
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

const elegir = <T>(r: () => number, lista: readonly T[]): T => lista[Math.floor(r() * lista.length)];

/** Ruido estable por posición, de -1 a 1: los vértices repetidos de una costura se mueven igual. */
function ruido(x: number, y: number, z: number, s: number): number {
  let h = Math.imul(Math.round(x * 100) + 7919 * s, 73856093) ^ Math.imul(Math.round(y * 100), 19349663) ^ Math.imul(Math.round(z * 100), 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 2147483648 - 1;
}

/** Abolla una geometría hacia fuera desde su centro, para que no parezca una esfera perfecta. */
function abollar(g: BufferGeometry, fuerza: number, s: number): BufferGeometry {
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

/** Triángulo de dos caras en el plano x = constante; los puntos son (z, y). */
function triangulo(x: number, a: [number, number], b: [number, number], c: [number, number]): BufferGeometry {
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array([a, b, c, a, c, b].flatMap(([z, y]) => [x, y, z])), 3));
  g.computeVertexNormals();
  return g;
}

export type EstiloCasa = 'rural' | 'balcones';
export type UsoCasa = 'casa' | 'refugio' | 'tienda';

export interface OpcionesCasa {
  /** Rural: blanca, de una planta, con teja. De balcones: fachada de color y dos plantas. */
  estilo: EstiloCasa;
  uso?: UsoCasa;
  /** Ancho de la fachada y fondo del solar, en casillas. La fachada mira al sur (+z). */
  ancho: number;
  fondo: number;
  /** Dónde está la puerta a lo largo de la fachada, desde el centro del solar. */
  puerta?: number;
  semilla?: number;
}

/** La casa no llega al borde del solar. */
const MARGEN = 0.08;
/** Separación entre las filas de tejas. */
const TEJA = 0.15;

/**
 * Una casa canaria con el origen en el centro del solar, a ras de suelo, y la fachada al sur.
 * Lleva zócalo, cantería en las esquinas, puerta con escalón, ventanas con contraventanas,
 * macetas y tejado de teja curva o azotea. La de balcones añade un balcón de madera corrido.
 */
export function casaCanaria(op: OpcionesCasa): BufferGeometry {
  const r = azar(op.semilla ?? 1);
  const M = new Montaje();
  const rural = op.estilo === 'rural';
  const uso = op.uso ?? 'casa';
  const W = op.ancho - 2 * MARGEN;
  const D = op.fondo - 2 * MARGEN;
  const H = rural ? 1.65 : 2.95;
  const frente = D / 2;

  const pared = rural ? COLORES.cal : elegir(r, [COLORES.fachadaOcre, COLORES.fachadaAzul, COLORES.fachadaSalmon, COLORES.fachadaVerde, COLORES.fachadaAmarilla]);
  const madera = rural ? elegir(r, [COLORES.carpinteriaVerde, COLORES.carpinteriaVerde, COLORES.carpinteriaAzul, COLORES.balcon]) : elegir(r, [COLORES.balcon, COLORES.carpinteriaVerde]);
  const zocalo = rural ? elegir(r, [COLORES.zocaloOcre, COLORES.canteria, COLORES.carpinteriaVerde]) : COLORES.canteria;

  // Muros, zócalo y cantería en las esquinas, a soga y tizón.
  M.caja(W, H, D, 0, 0, 0, pared);
  M.caja(W + 0.04, 0.24, D + 0.04, 0, 0, 0, zocalo);
  const hiladas = Math.floor((H - 0.3) / 0.22);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      for (let i = 0; i < hiladas; i++) {
        const largoX = (i + (sx === sz ? 0 : 1)) % 2 === 0;
        const an = largoX ? 0.32 : 0.18;
        const fo = largoX ? 0.18 : 0.32;
        M.caja(an, 0.2, fo, sx * (W / 2 + 0.02 - an / 2), 0.26 + i * 0.22, sz * (D / 2 + 0.02 - fo / 2), COLORES.canteria, 0.9 + r() * 0.14);
      }
    }
  }
  const azotea = !rural && r() < 0.5;
  if (!rural) M.caja(W + 0.06, 0.08, D + 0.06, 0, 1.38, 0, COLORES.cal); // imposta entre plantas
  if (azotea) M.caja(W + 0.14, 0.14, D + 0.14, 0, H - 0.06, 0, COLORES.cal); // cornisa

  // Fachada: puerta con escalón, ventanas a los lados y macetas.
  const ventana = (x: number, y: number, an: number, al: number) => {
    M.caja(an + 0.12, al + 0.12, 0.06, x, y - 0.06, frente, COLORES.canteria);
    M.caja(an, al, 0.08, x, y, frente, COLORES.cristal);
    M.caja(0.035, al, 0.1, x, y, frente, madera);
    M.caja(an, 0.035, 0.1, x, y + al * 0.55, frente, madera);
    for (const s of [-1, 1]) M.caja(an / 2, al, 0.04, x + s * (an / 2 + 0.06 + an / 4), y, frente + 0.01, madera, 0.95);
    M.caja(an + 0.2, 0.06, 0.16, x, y - 0.1, frente, COLORES.canteria, 1.06);
  };
  const anPuerta = uso === 'refugio' ? 0.72 : 0.5;
  const alPuerta = 1.05;
  const px = Math.max(-(W / 2 - 0.6), Math.min(W / 2 - 0.6, op.puerta ?? 0));
  const colorPuerta = uso === 'refugio' ? COLORES.acentoCoral : madera;
  M.caja(anPuerta + 0.16, alPuerta + 0.08, 0.06, px, 0.12, frente, COLORES.canteria);
  M.caja(anPuerta, alPuerta, 0.08, px, 0.12, frente, colorPuerta);
  for (const s of [-1, 1]) M.caja(anPuerta * 0.36, alPuerta * 0.32, 0.1, px + s * anPuerta * 0.22, 0.12 + alPuerta * 0.55, frente, colorPuerta, 0.82);
  M.caja(anPuerta + 0.3, 0.12, 0.3, px, 0, frente + 0.15, COLORES.canteria, 1.08);

  // Ventanas repartidas en los huecos a cada lado de la puerta.
  const anV = 0.38;
  const tramos: [number, number][] = [
    [-W / 2 + 0.3, px - anPuerta / 2 - 0.2],
    [px + anPuerta / 2 + 0.2, W / 2 - 0.3],
  ];
  for (const [a, b] of tramos) {
    const n = Math.floor((b - a) / 0.9);
    for (let i = 0; i < n; i++) ventana(a + ((b - a) * (i + 0.5)) / n, 0.55, anV, 0.5);
  }
  for (const s of [-1, 1]) {
    const x = px + s * (anPuerta / 2 + 0.24);
    if (Math.abs(x) > W / 2 - 0.3 || r() < 0.3) continue;
    M.pon(new CylinderGeometry(0.09, 0.065, 0.16, 7).translate(x, 0.08, frente + 0.16), COLORES.terracota);
    M.pon(abollar(new SphereGeometry(0.11, 6, 4), 0.15, 3).translate(x, 0.24, frente + 0.16), COLORES.laurel);
    M.pon(new SphereGeometry(0.05, 5, 3).translate(x + 0.04, 0.31, frente + 0.22), COLORES.geranio);
    M.pon(new SphereGeometry(0.045, 5, 3).translate(x - 0.05, 0.29, frente + 0.2), COLORES.geranio, 0.88);
  }

  if (uso === 'refugio') {
    // Letrero coral sobre la puerta, con un disco blanco: se ve desde lejos.
    const y = 0.12 + alPuerta + 0.1;
    M.caja(0.8, 0.28, 0.06, px, y, frente + 0.03, COLORES.acentoCoral);
    M.pon(new CylinderGeometry(0.09, 0.09, 0.03, 12).rotateX(Math.PI / 2).translate(px, y + 0.14, frente + 0.07), COLORES.crema);
  }
  if (uso === 'tienda') {
    // Toldo a rayas sobre la puerta y cajas a un lado.
    const franjas = 7;
    const anT = 1.3;
    for (let i = 0; i < franjas; i++) {
      const toldo = new BoxGeometry(anT / franjas, 0.04, 0.42).rotateX(0.35).translate(px - anT / 2 + (anT / franjas) * (i + 0.5), 0.12 + alPuerta + 0.16, frente + 0.21);
      M.pon(toldo, i % 2 ? COLORES.crema : COLORES.toldoAzul);
    }
    const lado = px + (px > 0 ? -1 : 1) * (anPuerta / 2 + 0.45);
    M.caja(0.3, 0.26, 0.26, lado, 0, frente + 0.2, COLORES.maderaTostada);
    M.caja(0.24, 0.2, 0.22, lado + 0.04, 0.26, frente + 0.2, COLORES.maderaTostada, 0.88);
  }

  // Balcón corrido de madera, con su tejadillo, en la planta alta.
  if (!rural) {
    const y0 = 1.46;
    const bw = W - 0.7;
    const vuelo = 0.34;
    const zb = frente + vuelo - 0.03;
    const puertas = Math.max(2, Math.round(bw / 1.1));
    for (let i = 0; i < puertas; i++) {
      const x = -bw / 2 + (bw * (i + 0.5)) / puertas;
      M.caja(0.5, 0.92, 0.06, x, y0 + 0.06, frente, COLORES.canteria);
      M.caja(0.4, 0.86, 0.08, x, y0 + 0.07, frente, madera);
    }
    M.caja(bw, 0.07, vuelo + 0.02, 0, y0, frente + vuelo / 2, COLORES.balcon, 0.85);
    const balaustres = Math.floor(bw / 0.11);
    for (let i = 0; i <= balaustres; i++) M.caja(0.035, 0.34, 0.035, -bw / 2 + (i * bw) / balaustres, y0 + 0.07, zb, COLORES.balcon);
    M.caja(bw, 0.035, 0.05, 0, y0 + 0.09, zb, COLORES.balcon, 0.9);
    M.caja(bw + 0.04, 0.05, 0.07, 0, y0 + 0.41, zb, COLORES.balcon, 0.9);
    const postes = Math.max(2, Math.round(bw / 1.1) + 1);
    for (let i = 0; i < postes; i++) {
      const x = -bw / 2 + (i * bw) / (postes - 1);
      M.caja(0.06, 0.98, 0.06, x, y0 + 0.07, zb, COLORES.balcon, 0.8);
      M.caja(0.06, 0.08, vuelo, x, y0 - 0.08, frente + vuelo / 2, COLORES.balcon, 0.7); // canes
    }
    M.pon(new BoxGeometry(bw + 0.16, 0.05, vuelo + 0.18).rotateX(0.2).translate(0, y0 + 1.1, frente + vuelo / 2), COLORES.tejaCanaria, 0.85);
  }

  // Tejado: a dos aguas de teja curva, o azotea con pretil en algunas de balcones.
  if (!azotea) {
    const o = 0.14;
    const mitad = D / 2 + o;
    const sube = mitad * 0.55;
    const ang = Math.atan2(sube, mitad);
    const largo = Math.hypot(mitad, sube);
    const anchoT = W + 2 * o;
    const base = H - 0.05;
    for (const s of [1, -1]) {
      const enFaldon = (g: BufferGeometry) => g.rotateX(s * ang).translate(0, base + sube / 2, (s * mitad) / 2);
      M.pon(enFaldon(new BoxGeometry(anchoT, 0.06, largo)), COLORES.tejaCanaria, 0.78);
      const filas = Math.floor(anchoT / TEJA);
      for (let i = 0; i < filas; i++) {
        const x = -anchoT / 2 + TEJA * (i + 0.5);
        M.pon(enFaldon(new CylinderGeometry(0.06, 0.06, largo, 4, 1, true, Math.PI / 2, Math.PI).rotateX(Math.PI / 2).translate(x, 0.03, 0)), COLORES.tejaCanaria, 0.88 + r() * 0.16);
      }
    }
    M.pon(new CylinderGeometry(0.075, 0.075, anchoT, 5).rotateZ(Math.PI / 2).translate(0, base + sube + 0.03, 0), COLORES.tejaCanaria, 0.72);
    for (const s of [-1, 1]) M.pon(triangulo((s * W) / 2, [-D / 2, H], [D / 2, H], [0, base + sube - 0.02]), pared);
    if (rural && r() < 0.6) {
      const x = (r() < 0.5 ? -1 : 1) * W * 0.25;
      const z = -mitad * 0.35;
      const y = base + sube * 0.2;
      M.caja(0.26, sube * 0.45 + 0.38, 0.26, x, y, z, COLORES.cal);
      M.caja(0.34, 0.06, 0.34, x, y + sube * 0.45 + 0.38, z, COLORES.tejaCanaria, 0.8);
    }
  } else {
    // Azotea con pretil, el cuarto de la azotea y un depósito de agua.
    M.caja(W - 0.02, 0.04, D - 0.02, 0, H, 0, COLORES.azotea);
    for (const s of [-1, 1]) {
      M.caja(W + 0.1, 0.24, 0.08, 0, H + 0.08, s * (D / 2 + 0.03), pared);
      M.caja(0.08, 0.24, D + 0.1, s * (W / 2 + 0.03), H + 0.08, 0, pared);
    }
    const lado = r() < 0.5 ? -1 : 1;
    const cx = lado * (W / 2 - 0.6);
    const cz = -D / 2 + 0.55;
    M.caja(0.9, 0.7, 0.8, cx, H, cz, COLORES.cal);
    M.caja(1.0, 0.06, 0.9, cx, H + 0.7, cz, COLORES.canteria);
    M.caja(0.3, 0.55, 0.06, cx, H, cz + 0.4, madera);
    M.pon(new CylinderGeometry(0.22, 0.22, 0.4, 8).translate(-cx * 0.6, H + 0.24, cz + 0.1), COLORES.crema, 0.9);
  }
  return M.fusionar();
}

/** Un laurel de la laurisilva: tronco algo torcido y una copa redonda de varias bolas abolladas. */
export function laurel(semilla: number): BufferGeometry {
  const r = azar(semilla);
  const M = new Montaje();
  const alto = 0.75 + r() * 0.35;
  const inclina = (r() - 0.5) * 0.25;
  M.pon(new CylinderGeometry(0.06, 0.1, alto, 5).translate(0, alto / 2, 0).rotateZ(inclina), COLORES.troncoLaurel);
  const cx = -Math.sin(inclina) * alto;
  const cy = Math.cos(inclina) * alto;
  const verdes = [COLORES.laurelHondo, COLORES.laurel, COLORES.laurelClaro];
  const bolas = 5;
  for (let i = 0; i < bolas; i++) {
    const centro = i === 0;
    const a = (i / bolas) * Math.PI * 2 + r();
    const rad = centro ? 0.44 + r() * 0.08 : 0.28 + r() * 0.1;
    const d = centro ? 0 : 0.3 + r() * 0.08;
    const y = cy + (centro ? 0.34 : 0.04 + r() * 0.2);
    const bola = abollar(new SphereGeometry(rad, 7, 5).scale(1, 0.82, 1), 0.12, semilla * 7 + i);
    M.pon(bola.translate(cx + Math.cos(a) * d, y, Math.sin(a) * d), centro ? COLORES.laurel : verdes[i % 3], 0.94 + r() * 0.12);
  }
  return M.fusionar();
}

/**
 * Lajas de lava del malpaís para una casilla: piedras dentadas negras, pardas y rojizas, una
 * punta y alguna mancha de liquen. Caben en la casilla (de -0,5 a 0,5) y salen del suelo (y = 0).
 */
export function lajasMalpais(semilla: number): BufferGeometry {
  const r = azar(semilla);
  const M = new Montaje();
  const colores = [COLORES.lavaNegra, COLORES.lavaNegra, COLORES.lavaParda, COLORES.lavaRojiza];
  // Una laja por celda de una rejilla de 3 × 3 desordenada, para que cubran el suelo.
  for (let i = 0; i < 9; i++) {
    if (r() < 0.2) continue;
    const rad = 0.12 + r() * 0.06;
    const alto = 0.06 + r() * 0.14;
    const g = new CylinderGeometry(rad * (0.45 + r() * 0.3), rad, alto, 5 + Math.floor(r() * 2), 1);
    const pos = g.getAttribute('position');
    for (let v = 0; v < pos.count; v++) {
      if (pos.getY(v) <= 0) continue;
      pos.setY(v, pos.getY(v) + ruido(pos.getX(v), 1, pos.getZ(v), semilla + i) * alto * 0.45);
    }
    g.computeVertexNormals();
    const x = ((i % 3) - 1) * 0.27 + (r() - 0.5) * 0.08;
    const z = (Math.floor(i / 3) - 1) * 0.27 + (r() - 0.5) * 0.08;
    g.rotateY(r() * Math.PI)
      .rotateX((r() - 0.5) * 0.4)
      .rotateZ((r() - 0.5) * 0.4)
      .translate(x, alto / 2 - 0.03, z);
    M.pon(g, elegir(r, colores), 0.88 + r() * 0.24);
  }
  const punta = 0.24 + r() * 0.14;
  M.pon(new ConeGeometry(0.07, punta, 4).rotateY(r()).translate((r() - 0.5) * 0.6, punta / 2 - 0.02, (r() - 0.5) * 0.6), COLORES.lavaNegra, 0.85);
  if (r() < 0.7) M.pon(new SphereGeometry(0.06, 5, 3).scale(1, 0.35, 1).translate((r() - 0.5) * 0.6, 0.01, (r() - 0.5) * 0.6), COLORES.liquen);
  return M.fusionar();
}
