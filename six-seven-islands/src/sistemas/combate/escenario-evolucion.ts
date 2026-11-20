// El escenario de la evolución, según el tipo principal de la forma nueva (autor, 2026-11-19: «quiero
// que esté más currado»; la primera versión, de discos planos y confeti, le pareció muy pobre).
//
// Una isla flotante esculpida sobre el blanco roto, con luz y sombra (MaterialDiorama):
// - arriba, suelo con relieve y manchas de varios tonos; el centro, liso, para el Sello;
// - el canto, en estratos irregulares, y debajo, un peñón que se afila hacia abajo;
// - encima, lo de su tipo (un jardín, columnas de basalto, una charca, grietas de lava…), sobre todo
//   detrás de la criatura para no taparla;
// - lo que cae (o sube) alrededor de la criatura, no por toda la pantalla, con forma y peso: las hojas
//   planean y se posan, las piedras caen, rebotan y levantan polvo, las brasas suben.
// Todo es dibujo propio, por código (R8). El azar es determinista (semilla), aunque solo sea visual.

import { attribute, float, normalWorld, smoothstep } from 'three/tsl';
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  DynamicDrawUsage,
  Euler,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicNodeMaterial,
  OctahedronGeometry,
  Quaternion,
  RingGeometry,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  Vector3,
  CircleGeometry,
} from 'three/webgpu';
import { MaterialDiorama } from '../../arte/material';
import { DECORADOS } from './decorados-evolucion';
import { Montaje, abollar, azar, ruido } from '../../arte/montaje';

/** El basalto de las columnas: gris frío, no pardo (a la luz cálida parecían postes de madera). */
const BASALTO_OSCURO = '#3E3F46';
const BASALTO = '#5C5D66';
const BASALTO_CLARO = '#8A8A92';

/** Cuánta luz propia tiene la isla, para que lo de abajo no se quede en negro. */
const LUZ_PROPIA = 0.32;

/** Radio de la cara de arriba de la isla. */
const R = 1.7;
/** Hasta aquí el suelo es liso: ahí van la criatura y el Sello (que llega a 1,08). */
const R_LISO = 1.12;
/** El foso de agua de la charca, entre estos dos radios. */
const FOSO: [number, number] = [1.16, 1.6];

type Props = 'jardin' | 'basalto' | 'charca' | 'lava' | 'desierto' | 'hielo' | 'nubes' | 'cristales' | 'piedras' | 'terrero' | 'cienaga' | 'bobinas' | 'taller' | 'prismas' | 'bruma' | 'obsidiana' | 'ruinas' | 'bosquecillo';
type Cae = 'hoja' | 'piedra' | 'gota' | 'brasa' | 'arena' | 'copo' | 'pluma' | 'chispa' | 'burbuja' | 'mota' | 'tuerca' | 'espiritu' | 'sombra' | 'luciernaga';

export interface Paleta {
  /** Tres tonos del suelo de arriba, que se mezclan a manchas. */
  suelo: [string, string, string];
  /** Los estratos del canto, de arriba abajo. */
  capas: string[];
  /** El peñón de abajo. */
  roca: string;
  props: Props;
  cae: Cae;
  /** Color de lo que cae, si no lo trae su forma. */
  colorCae?: string;
  /** Color de los cristales (los tipos sin escenario propio). */
  cristal?: string;
}

export const PALETAS: Record<string, Paleta> = {
  planta: { suelo: ['#5E9E3F', '#7DBB4C', '#4A8436'], capas: ['#5E9E3F', '#6B4A2F', '#7A5636', '#5C3F27'], roca: '#5A4A3E', props: 'jardin', cae: 'hoja' },
  bicho: { suelo: ['#7FA63A', '#98BE4A', '#668C2E'], capas: ['#7FA63A', '#6B4A2F', '#7A5636', '#5C3F27'], roca: '#5A4A3E', props: 'bosquecillo', cae: 'luciernaga', colorCae: '#E8FF7A' },
  roca: { suelo: ['#8C8177', '#A39789', '#70665D'], capas: ['#7C7168', '#5F574F', '#8E8378', '#4F4842'], roca: '#4A443F', props: 'basalto', cae: 'piedra' },
  ancestral: { suelo: ['#B9A27A', '#C9B38A', '#A68F68'], capas: ['#A68F68', '#8A7552', '#B39C74', '#6E5A3C'], roca: '#5A4A32', props: 'ruinas', cae: 'mota', colorCae: '#FFD45E' },
  agua: { suelo: ['#7D8A8F', '#97A3A7', '#66737A'], capas: ['#6E7B80', '#56636A', '#7F8C90', '#4B575D'], roca: '#45515A', props: 'charca', cae: 'gota', colorCae: '#7CC4F2' },
  infernal: { suelo: ['#4E2E27', '#62382E', '#3A221D'], capas: ['#4A2C26', '#33201C', '#55342B', '#2A1A17'], roca: '#24160F', props: 'lava', cae: 'brasa', colorCae: '#FF8A2A' },
  tierra: { suelo: ['#D4AA68', '#E3BF82', '#C09556'], capas: ['#C69C5C', '#A87C45', '#B98D50', '#8E6738'], roca: '#7A5A36', props: 'desierto', cae: 'arena', colorCae: '#B98D50' },
  hielo: { suelo: ['#EAF5FB', '#FFFFFF', '#D2E8F3'], capas: ['#DDEEF6', '#B9D8E8', '#CBE3EF', '#9CC5DA'], roca: '#7FA7BD', props: 'hielo', cae: 'copo', colorCae: '#FFFFFF' },
  aire: { suelo: ['#9FC0D6', '#B6D3E5', '#88AEC6'], capas: ['#94B3C7', '#7C9BAF', '#A3BFD0', '#68869A'], roca: '#587083', props: 'nubes', cae: 'pluma', colorCae: '#F4F1EA' },
  electrico: { suelo: ['#7E8590', '#949BA6', '#6A717C'], capas: ['#737A85', '#5E6570', '#828994', '#4C525C'], roca: '#3F444C', props: 'bobinas', cae: 'chispa', colorCae: '#FFD84A' },
  acero: { suelo: ['#9AA3AD', '#AEB6BF', '#8A939D'], capas: ['#8A939D', '#6F7882', '#97A0AA', '#5E666F'], roca: '#4F5660', props: 'taller', cae: 'tuerca' },
  mental: { suelo: ['#C9A8C9', '#D9BCD9', '#B693B6'], capas: ['#B898B8', '#9B7C9B', '#C4A4C4', '#7E637E'], roca: '#5E4A5E', props: 'prismas', cae: 'burbuja', colorCae: '#F2A5D2' },
  veneno: { suelo: ['#5B4A66', '#6E5A7A', '#4A3D55'], capas: ['#56465F', '#43364C', '#62506D', '#33283D'], roca: '#2C2233', props: 'cienaga', cae: 'burbuja', colorCae: '#C77DEB' },
  espectral: { suelo: ['#6E6880', '#827B94', '#5C566D'], capas: ['#655F76', '#504B60', '#726C85', '#3F3B4D'], roca: '#343041', props: 'bruma', cae: 'espiritu', colorCae: '#D4C8FF' },
  oscuridad: { suelo: ['#3A3542', '#47414F', '#2E2A35'], capas: ['#34303B', '#28252E', '#3D3846', '#1F1C24'], roca: '#18161C', props: 'obsidiana', cae: 'sombra', colorCae: '#4B3A66' },
  lucha: { suelo: ['#D8B98A', '#E4C79C', '#C9A574'], capas: ['#C9A574', '#A8865A', '#B8956A', '#8A6B45'], roca: '#6B5338', props: 'terrero', cae: 'mota', colorCae: '#E9CFA2' },
  comun: { suelo: ['#C9A97E', '#D9BD94', '#B39068'], capas: ['#B8966C', '#9A7A54', '#C2A078', '#80643F'], roca: '#6B5338', props: 'piedras', cae: 'mota', colorCae: '#F2D58A' },
};

export interface EscenarioEvolucion {
  grupo: Group;
  /** Mueve lo que cae y lo vivo de la isla; `reloj` en segundos. */
  animar(reloj: number): void;
  dispose(): void;
}

// ——— Utilidades ———

/** Ruido suave en 2D (de valor, interpolado), de -1 a 1: manchas en lugar de puntitos. */
function suave(x: number, z: number, s: number): number {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const fx = x - xi;
  const fz = z - zi;
  const u = fx * fx * (3 - 2 * fx);
  const v = fz * fz * (3 - 2 * fz);
  const h = (a: number, b: number) => ruido(a, 0, b, s);
  const arriba = h(xi, zi) + (h(xi + 1, zi) - h(xi, zi)) * u;
  const abajo = h(xi, zi + 1) + (h(xi + 1, zi + 1) - h(xi, zi + 1)) * u;
  return arriba + (abajo - arriba) * v;
}

/** Caras planas: cada triángulo con su normal (rocas talladas). */
function plano(g: BufferGeometry): BufferGeometry {
  const n = g.index ? g.toNonIndexed() : g;
  if (n !== g) g.dispose();
  n.computeVertexNormals();
  return n;
}

const c1 = new Color();
const c2 = new Color();
const c3 = new Color();
/** Mezcla los tres tonos del suelo según dos ruidos. */
function tonoSuelo(p: Paleta, x: number, z: number, s: number, salida: Color): Color {
  const a = suave(x * 1.6, z * 1.6, s) * 0.5 + 0.5;
  const b = suave(x * 3.7 + 9, z * 3.7 - 4, s + 1) * 0.5 + 0.5;
  c1.set(p.suelo[0]);
  c2.set(p.suelo[1]);
  c3.set(p.suelo[2]);
  salida.copy(c1).lerp(c2, Math.max(0, Math.min(1, (a - 0.35) * 2.2)));
  return salida.lerp(c3, Math.max(0, Math.min(1, (b - 0.62) * 3)));
}

/** Una geometría con color por vértice, a partir de posiciones, colores e índices. */
function conColores(pos: number[], col: number[], idx?: number[]): BufferGeometry {
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('color', new BufferAttribute(new Float32Array(col), 3));
  if (idx) g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** La forma de una hoja (de canto a canto, a lo largo de +x), con su nervio más oscuro. */
function geometriaHoja(largo: number, ancho: number, claro: string, oscuro: string): BufferGeometry {
  const s = new Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(largo * 0.3, ancho * 0.9, largo * 0.75, ancho * 0.6, largo, 0);
  s.bezierCurveTo(largo * 0.75, -ancho * 0.6, largo * 0.3, -ancho * 0.9, 0, 0);
  const g = new ShapeGeometry(s, 6).translate(-largo / 2, 0, 0);
  const pos = g.getAttribute('position');
  const col = new Float32Array(pos.count * 3);
  const a = new Color(claro);
  const b = new Color(oscuro);
  const m = new Color();
  for (let i = 0; i < pos.count; i++) {
    // Cerca del nervio (y = 0), más oscuro.
    const k = Math.min(1, Math.abs(pos.getY(i)) / (ancho * 0.35));
    m.copy(b).lerp(a, k);
    col.set([m.r, m.g, m.b], i * 3);
  }
  g.setAttribute('color', new BufferAttribute(col, 3));
  return g;
}

// ——— La isla ———

/** Altura del suelo de arriba en (x, z): liso en el centro y con relieve hacia el borde. */
function alturaSuelo(p: Paleta, x: number, z: number, s: number): number {
  const r = Math.hypot(x, z);
  const borde = Math.max(0, Math.min(1, (r - R_LISO) / 0.45));
  let h = borde * (suave(x * 2.4, z * 2.4, s + 3) * 0.035 + 0.012);
  if (p.props === 'desierto') h += borde * Math.sin(x * 9 + z * 3) * 0.012;
  if (p.props === 'charca' && r > FOSO[0] && r < FOSO[1]) h -= 0.07 * Math.sin(((r - FOSO[0]) / (FOSO[1] - FOSO[0])) * Math.PI);
  return h;
}

function isla(M: Montaje, p: Paleta, s: number): void {
  // Arriba: anillos de vértices, para que el relieve y las manchas tengan dónde ponerse.
  const anillos = 14;
  const lados = 84;
  const pos: number[] = [0, 0, 0];
  const col: number[] = [];
  const t = new Color();
  tonoSuelo(p, 0, 0, s, t);
  col.push(t.r, t.g, t.b);
  for (let a = 1; a <= anillos; a++) {
    const r = (a / anillos) * R;
    for (let l = 0; l < lados; l++) {
      const ang = (l / lados) * Math.PI * 2;
      const x = Math.cos(ang) * r;
      const z = Math.sin(ang) * r;
      pos.push(x, alturaSuelo(p, x, z, s), z);
      tonoSuelo(p, x, z, s, t);
      // El borde, un poco más claro, como iluminado de canto.
      if (a === anillos) t.offsetHSL(0, 0, 0.04);
      // El fondo de la charca, más oscuro y azulado.
      if (p.props === 'charca' && r > FOSO[0] && r < FOSO[1]) t.lerp(c1.set('#3F5F6E'), 0.6);
      col.push(t.r, t.g, t.b);
    }
  }
  const idx: number[] = [];
  for (let l = 0; l < lados; l++) idx.push(0, 1 + ((l + 1) % lados), 1 + l);
  for (let a = 1; a < anillos; a++) {
    const b0 = 1 + (a - 1) * lados;
    const b1 = 1 + a * lados;
    for (let l = 0; l < lados; l++) {
      const l1 = (l + 1) % lados;
      idx.push(b0 + l, b0 + l1, b1 + l, b0 + l1, b1 + l1, b1 + l);
    }
  }
  M.ponTal(conColores(pos, col, idx));

  // El canto, en estratos irregulares, tallados (caras planas).
  const bordeArriba = 1 + (anillos - 1) * lados;
  const niveles = [0, -0.07, -0.17, -0.27, -0.38];
  const radio = (ang: number, k: number) => R * (1 - k * 0.012) + suave(Math.cos(ang) * 3 + k, Math.sin(ang) * 3, s + 7 + k) * 0.05;
  const posC: number[] = [];
  const colC: number[] = [];
  const pasoC = 48;
  for (let k = 0; k < niveles.length - 1; k++) {
    c2.set(p.capas[Math.min(k, p.capas.length - 1)]);
    for (let l = 0; l < pasoC; l++) {
      const a0 = (l / pasoC) * Math.PI * 2;
      const a1 = ((l + 1) / pasoC) * Math.PI * 2;
      // La fila de arriba del primer estrato coincide con el borde del suelo.
      const yA0 = k === 0 ? pos[(bordeArriba + Math.round((l / pasoC) * lados) % lados) * 3 + 1] : niveles[k];
      const yA1 = k === 0 ? pos[(bordeArriba + Math.round(((l + 1) / pasoC) * lados) % lados) * 3 + 1] : niveles[k];
      const rA0 = k === 0 ? R : radio(a0, k);
      const rA1 = k === 0 ? R : radio(a1, k);
      const rB0 = radio(a0, k + 1);
      const rB1 = radio(a1, k + 1);
      const quad = [
        [Math.cos(a0) * rA0, yA0, Math.sin(a0) * rA0],
        [Math.cos(a1) * rA1, yA1, Math.sin(a1) * rA1],
        [Math.cos(a0) * rB0, niveles[k + 1], Math.sin(a0) * rB0],
        [Math.cos(a1) * rB1, niveles[k + 1], Math.sin(a1) * rB1],
      ];
      for (const v of [quad[0], quad[2], quad[1], quad[1], quad[2], quad[3]]) posC.push(...v);
      t.copy(c2).offsetHSL(0, 0, ruido(l, k, 0, s) * 0.03);
      for (let i = 0; i < 6; i++) colC.push(t.r, t.g, t.b);
    }
  }
  M.ponTal(plano(conColores(posC, colC)));

  // El peñón de abajo, que se afila hasta una punta (la isla flota).
  const capasPenon = [
    [-0.38, 0.985],
    [-0.62, 0.8],
    [-0.88, 0.52],
    [-1.12, 0.24],
  ];
  const posP: number[] = [];
  const colP: number[] = [];
  const pasoP = 20;
  const punto = (k: number, l: number): number[] => {
    if (k >= capasPenon.length) return [0.05, -1.3, -0.03];
    const ang = (l / pasoP) * Math.PI * 2;
    const [y, f] = capasPenon[k];
    const r = R * f * (k === 0 ? 1 : 1 + ruido(l, k, 1, s) * 0.12);
    return [Math.cos(ang) * r, y + (k === 0 ? 0 : ruido(l, k, 2, s) * 0.05), Math.sin(ang) * r];
  };
  for (let k = 0; k < capasPenon.length; k++) {
    for (let l = 0; l < pasoP; l++) {
      const a = punto(k, l);
      const b = punto(k, l + 1);
      const c = punto(k + 1, l);
      const d = punto(k + 1, l + 1);
      for (const v of [a, c, b, b, c, d]) posP.push(...v);
      t.set(p.roca).multiplyScalar(1 - k * 0.12 + ruido(l, k, 3, s) * 0.05);
      for (let i = 0; i < 6; i++) colP.push(t.r, t.g, t.b);
    }
  }
  M.ponTal(plano(conColores(posP, colP)));
}

// ——— Lo de encima, por tipo ———

/** Un sitio en el anillo de fuera, sobre todo detrás (z < 0, lejos de la cámara). */
function sitio(r: () => number, detras = 0.75): [number, number] {
  // La cámara mira desde +z: detrás es z negativa (ángulos entre π y 2π).
  const atras = r() < detras;
  const a = (atras ? Math.PI : 0) + 0.12 + r() * (Math.PI - 0.24);
  const rr = R_LISO + 0.08 + r() * (R - R_LISO - 0.2);
  return [Math.cos(a) * rr, Math.sin(a) * rr];
}

function brizna(M: Montaje, x: number, y: number, z: number, alto: number, ang: number, inclina: number, bajo: string, alto2: string): void {
  // Tres tramos que se estrechan y se doblan hacia fuera.
  const pos: number[] = [];
  const tramos = 3;
  const ancho = 0.028;
  const dx = Math.cos(ang);
  const dz = Math.sin(ang);
  const px = -dz;
  const pz = dx;
  const punto = (i: number, lado: number) => {
    const k = i / tramos;
    const w = ancho * (1 - k) * lado;
    const salida = inclina * k * k;
    return [x + dx * salida + px * w, y + alto * k, z + dz * salida + pz * w];
  };
  for (let i = 0; i < tramos; i++) {
    const a = punto(i, -1);
    const b = punto(i, 1);
    const c = punto(i + 1, -1);
    const d = punto(i + 1, 1);
    pos.push(...a, ...b, ...c, ...b, ...d, ...c);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
  g.computeVertexNormals();
  M.ponDegradado(g, bajo, alto2);
}

function props(M: Montaje, p: Paleta, s: number, r: () => number): void {
  const y = (x: number, z: number) => alturaSuelo(p, x, z, s);
  switch (p.props) {
    case 'jardin':
    case 'bosquecillo': {
      // Matas de hierba de briznas dobladas, flores y setas.
      for (let i = 0; i < 26; i++) {
        const [x, z] = sitio(r, 0.6);
        const n = 5 + Math.floor(r() * 4);
        for (let b = 0; b < n; b++) {
          const ang = (b / n) * Math.PI * 2 + r();
          brizna(M, x + Math.cos(ang) * 0.02, y(x, z) - 0.01, z + Math.sin(ang) * 0.02, 0.14 + r() * 0.16, ang, 0.05 + r() * 0.06, '#3E7A2C', '#B5D86A');
        }
      }
      const petalos = ['#FFFFFF', '#FFE27A', '#F7A8C4', '#FFFFFF'];
      for (let i = 0; i < 9; i++) {
        const [x, z] = sitio(r, 0.55);
        const base = y(x, z);
        const alto = 0.1 + r() * 0.08;
        M.pon(new CylinderGeometry(0.007, 0.009, alto, 5).translate(x, base + alto / 2, z), '#4F8A35');
        const color = petalos[i % petalos.length];
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2;
          M.pon(new SphereGeometry(1, 6, 4).scale(0.032, 0.01, 0.018).rotateY(-a).translate(x + Math.cos(a) * 0.028, base + alto, z + Math.sin(a) * 0.028), color);
        }
        M.pon(new SphereGeometry(0.016, 6, 4).translate(x, base + alto + 0.006, z), '#F2A93B');
      }
      for (let i = 0; i < 3; i++) {
        const [x, z] = sitio(r, 1);
        const base = y(x, z);
        const alto = 0.07 + r() * 0.05;
        const radio = 0.05 + r() * 0.03;
        M.pon(new CylinderGeometry(radio * 0.35, radio * 0.45, alto, 7).translate(x, base + alto / 2, z), '#F1E6CF');
        M.pon(new SphereGeometry(radio, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.7, 1).translate(x, base + alto, z), '#B8553A');
        for (let k = 0; k < 4; k++) {
          const a = r() * Math.PI * 2;
          M.pon(new SphereGeometry(radio * 0.16, 5, 3).translate(x + Math.cos(a) * radio * 0.55, base + alto + radio * 0.5, z + Math.sin(a) * radio * 0.55), '#FFF6E8');
        }
      }
      for (let i = 0; i < 5; i++) {
        const [x, z] = sitio(r, 0.5);
        M.pon(plano(abollar(new IcosahedronGeometry(0.04 + r() * 0.03, 0), 0.25, s + i)).translate(x, y(x, z) + 0.015, z), '#8E8A80');
      }
      // Raíces que asoman por debajo del canto, y hierba que cuelga del borde.
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + r() * 0.3;
        const rr = R * (0.9 + r() * 0.08);
        const largo = 0.18 + r() * 0.32;
        M.pon(new ConeGeometry(0.014, largo, 4).rotateX(Math.PI).rotateZ((r() - 0.5) * 0.4).translate(Math.cos(a) * rr, -0.36 - largo / 2, Math.sin(a) * rr), '#6B4A2F');
      }
      for (let i = 0; i < 40; i++) {
        const a = (i / 40) * Math.PI * 2 + r() * 0.1;
        const x = Math.cos(a) * (R + 0.005);
        const z = Math.sin(a) * (R + 0.005);
        brizna(M, x, y(x, z) + 0.01, z, -(0.06 + r() * 0.07), a, 0.03, '#4A8436', '#6FAE45');
      }
      break;
    }
    case 'basalto': {
      // Grupos de columnas hexagonales detrás, peñascos tallados y guijarros.
      for (const centro of [-2.2, -1.25, -0.6]) {
        const n = 4 + Math.floor(r() * 3);
        for (let i = 0; i < n; i++) {
          const a = centro + (r() - 0.5) * 0.5;
          const rr = R_LISO + 0.18 + r() * (R - R_LISO - 0.3);
          const x = Math.cos(a) * rr;
          const z = Math.sin(a) * rr;
          const radio = 0.08 + r() * 0.05;
          const alto = 0.22 + r() * (centro === -1.25 ? 0.75 : 0.45);
          const base = y(x, z) - 0.02;
          const columna = new CylinderGeometry(radio, radio * 1.04, alto, 6).translate(0, alto / 2, 0);
          columna.rotateZ((r() - 0.5) * 0.12).rotateX((r() - 0.5) * 0.12).translate(x, base, z);
          M.ponDegradado(plano(columna), BASALTO_OSCURO, BASALTO, 0.92 + r() * 0.16);
          M.pon(plano(new CylinderGeometry(radio * 0.84, radio * 0.98, 0.03, 6).translate(x, base + alto + 0.014, z)), BASALTO_CLARO);
        }
      }
      for (let i = 0; i < 7; i++) {
        const [x, z] = sitio(r, 0.6);
        const t = 0.09 + r() * 0.1;
        const g = plano(abollar(new IcosahedronGeometry(t, 1), 0.3, s + 10 + i).scale(1, 0.7, 1));
        M.ponDegradado(g.translate(x, y(x, z) + t * 0.45, z), p.roca, p.suelo[0]);
      }
      for (let i = 0; i < 14; i++) {
        const [x, z] = sitio(r, 0.5);
        M.pon(plano(abollar(new IcosahedronGeometry(0.025 + r() * 0.025, 0), 0.3, s + 30 + i)).translate(x, y(x, z) + 0.01, z), p.suelo[2]);
      }
      // Grietas en la piedra, oscuras, hacia fuera.
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + r() * 0.4;
        const largo = 0.25 + r() * 0.2;
        const rr = R_LISO + 0.05 + largo / 2;
        M.pon(new BoxGeometry(largo, 0.006, 0.018).rotateY(-a).translate(Math.cos(a) * rr, y(Math.cos(a) * rr, Math.sin(a) * rr) + 0.004, Math.sin(a) * rr), '#3B3631');
      }
      break;
    }
    case 'charca': {
      // Un foso de agua alrededor del centro (el agua la pone `charcaAgua`), juncos y piedras mojadas.
      for (let i = 0; i < 6; i++) {
        const [x, z] = sitio(r, 1);
        const rr = Math.hypot(x, z);
        const f = (FOSO[0] + FOSO[1]) / 2 / rr;
        const n = 5 + Math.floor(r() * 3);
        for (let k = 0; k < n; k++) {
          const ang = r() * Math.PI * 2;
          brizna(M, x * f + Math.cos(ang) * 0.03, -0.05, z * f + Math.sin(ang) * 0.03, 0.3 + r() * 0.25, ang, 0.03, '#3F6B3A', '#9CC27A');
        }
      }
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + r() * 0.2;
        const rr = FOSO[1] + 0.03 + r() * 0.04;
        const t = 0.07 + r() * 0.05;
        M.pon(abollar(new IcosahedronGeometry(t, 1), 0.2, s + i).scale(1, 0.55, 1).translate(Math.cos(a) * rr, 0.01, Math.sin(a) * rr), p.suelo[i % 3]);
      }
      break;
    }
    case 'lava': {
      // Agujas de roca volcánica detrás, en grupos de dos o tres, y escoria.
      for (let i = 0; i < 5; i++) {
        const [x0, z0] = sitio(r, 1);
        const n = 2 + Math.floor(r() * 2);
        for (let k = 0; k < n; k++) {
          const x = x0 + (r() - 0.5) * 0.18;
          const z = z0 + (r() - 0.5) * 0.12;
          const alto = 0.2 + r() * (k === 0 ? 0.55 : 0.3);
          const aguja = abollar(new ConeGeometry(0.07 + r() * 0.06, alto, 7, 3), 0.18, s + i * 7 + k).translate(0, alto / 2, 0);
          aguja.rotateZ((r() - 0.5) * 0.25).rotateX((r() - 0.5) * 0.25);
          M.ponDegradado(plano(aguja.translate(x, y(x, z) - 0.02, z)), '#1C120F', p.capas[2]);
        }
      }
      for (let i = 0; i < 12; i++) {
        const [x, z] = sitio(r, 0.5);
        M.pon(plano(abollar(new IcosahedronGeometry(0.03 + r() * 0.04, 0), 0.35, s + 20 + i)).translate(x, y(x, z) + 0.015, z), '#1C1615');
      }
      break;
    }
    case 'desierto': {
      // Piedras, una mata seca y huesos de roca; las ondas de la arena van en el suelo.
      for (let i = 0; i < 6; i++) {
        const [x, z] = sitio(r, 0.7);
        const t = 0.06 + r() * 0.09;
        M.ponDegradado(plano(abollar(new IcosahedronGeometry(t, 1), 0.3, s + i).scale(1, 0.6, 1)).translate(x, y(x, z) + t * 0.3, z), '#8E6738', '#C69C5C');
      }
      for (let i = 0; i < 3; i++) {
        const [x, z] = sitio(r, 1);
        const base = y(x, z);
        for (let k = 0; k < 9; k++) {
          const ang = (k / 9) * Math.PI * 2;
          brizna(M, x, base, z, 0.12 + r() * 0.1, ang, 0.09, '#7A5A36', '#C7A86A');
        }
      }
      break;
    }
    case 'hielo': {
      // Montoncitos de nieve; los cristales y carámbanos, aparte (translúcidos).
      for (let i = 0; i < 10; i++) {
        const [x, z] = sitio(r, 0.6);
        const t = 0.06 + r() * 0.07;
        M.pon(abollar(new SphereGeometry(t, 8, 5), 0.2, s + i).scale(1, 0.45, 1).translate(x, y(x, z), z), '#FFFFFF');
      }
      break;
    }
    case 'nubes': {
      // Piedras claras arriba; las nubes, bajo el canto, aparte.
      for (let i = 0; i < 8; i++) {
        const [x, z] = sitio(r, 0.6);
        M.pon(plano(abollar(new IcosahedronGeometry(0.04 + r() * 0.05, 0), 0.25, s + i)).translate(x, y(x, z) + 0.02, z), p.suelo[2]);
      }
      break;
    }
    case 'piedras': {
      // Un corro de piedras hincadas detrás, matas de hierba seca y alguna flor amarilla.
      for (let i = 0; i < 7; i++) {
        const a = Math.PI + 0.35 + (i / 6) * (Math.PI - 0.7);
        const rr = R - 0.2;
        const alto = 0.28 + r() * 0.3;
        const piedra = abollar(new BoxGeometry(0.16, alto, 0.1, 2, 3, 1), 0.12, s + i).translate(0, alto / 2, 0);
        piedra.rotateY(-a + Math.PI / 2).rotateZ((r() - 0.5) * 0.15);
        M.ponDegradado(plano(piedra.translate(Math.cos(a) * rr, y(Math.cos(a) * rr, Math.sin(a) * rr) - 0.02, Math.sin(a) * rr)), p.roca, p.suelo[1]);
      }
      for (let i = 0; i < 14; i++) {
        const [x, z] = sitio(r, 0.5);
        const n = 5 + Math.floor(r() * 3);
        for (let b = 0; b < n; b++) brizna(M, x, y(x, z) - 0.01, z, 0.1 + r() * 0.1, (b / n) * Math.PI * 2 + r(), 0.05, '#8A8A4A', '#D8CB86');
        if (i % 3 === 0) M.pon(new SphereGeometry(0.022, 6, 4).translate(x, y(x, z) + 0.13, z), '#F2C94C');
      }
      break;
    }
    case 'cristales': {
      for (let i = 0; i < 10; i++) {
        const [x, z] = sitio(r, 0.6);
        const t = 0.05 + r() * 0.08;
        M.ponDegradado(plano(abollar(new IcosahedronGeometry(t, 1), 0.3, s + i).scale(1, 0.65, 1)).translate(x, y(x, z) + t * 0.35, z), p.roca, p.suelo[1]);
      }
      break;
    }
  }
}

/** Lo translúcido o brillante, en su propia malla: agua, lava, cristales, nubes. */
function extras(grupo: Group, p: Paleta, s: number, r: () => number, nuevos: { dispose(): void }[], vivos: ((t: number) => void)[]): void {
  const mat = (m: MeshBasicNodeMaterial) => {
    m.toneMapped = false;
    nuevos.push(m);
    return m;
  };
  const geo = <T extends BufferGeometry>(g: T) => {
    nuevos.push(g);
    return g;
  };
  if (p.props === 'charca') {
    const agua = new Mesh(geo(new RingGeometry(FOSO[0] - 0.02, FOSO[1] + 0.02, 72, 1)), mat(new MeshBasicNodeMaterial({ color: '#5FB4DA', transparent: true, opacity: 0.72, depthWrite: false })));
    agua.rotation.x = -Math.PI / 2;
    agua.position.y = -0.012;
    grupo.add(agua);
    // Ondas que se abren desde sitios del foso.
    const onda = geo(new RingGeometry(0.06, 0.075, 28));
    const ondas = Array.from({ length: 6 }, (_, i) => {
      const m = new Mesh(onda, mat(new MeshBasicNodeMaterial({ color: '#EAF7FF', transparent: true, opacity: 0, depthWrite: false })));
      m.rotation.x = -Math.PI / 2;
      const a = (i / 6) * Math.PI * 2 + 0.3;
      m.position.set(Math.cos(a) * 1.38, -0.004, Math.sin(a) * 1.38);
      m.userData.fase = i / 6;
      grupo.add(m);
      return m;
    });
    // Hojas flotantes de nenúfar.
    const hoja = geo(new CircleGeometry(0.075, 14, 0.4, Math.PI * 2 - 0.4));
    for (let i = 0; i < 5; i++) {
      const m = new Mesh(hoja, mat(new MeshBasicNodeMaterial({ color: i % 2 ? '#5E9E4A' : '#6FB257' })));
      const a = r() * Math.PI * 2;
      m.rotation.set(-Math.PI / 2, 0, r() * 6);
      const rr = FOSO[0] + 0.08 + r() * (FOSO[1] - FOSO[0] - 0.16);
      m.position.set(Math.cos(a) * rr, -0.006, Math.sin(a) * rr);
      grupo.add(m);
    }
    vivos.push((t) => {
      for (const m of ondas) {
        const k = (t * 0.5 + (m.userData.fase as number)) % 1;
        m.scale.setScalar(1 + k * 2.6);
        (m.material as MeshBasicNodeMaterial).opacity = 0.75 * (1 - k);
      }
    });
  } else if (p.props === 'lava') {
    // Grietas encendidas en zigzag hacia fuera, y charquitos de lava en el borde.
    const M = new Montaje();
    for (let i = 0; i < 9; i++) {
      let a = (i / 9) * Math.PI * 2 + r() * 0.3;
      let rr = R_LISO + 0.02;
      for (let k = 0; k < 4; k++) {
        const largo = 0.12 + r() * 0.08;
        const a2 = a + (r() - 0.5) * 0.35;
        const x = Math.cos(a2) * (rr + largo / 2);
        const z = Math.sin(a2) * (rr + largo / 2);
        M.pon(new BoxGeometry(largo, 0.008, 0.022 - k * 0.004).rotateY(-a2).translate(x, alturaSuelo(p, x, z, s) + 0.005, z), k ? '#FF7A1F' : '#FFB347');
        rr += largo * 0.9;
        a = a2;
      }
    }
    for (let i = 0; i < 7; i++) {
      const [x, z] = sitio(r, 0.65);
      const radio = 0.06 + r() * 0.06;
      const y = alturaSuelo(p, x, z, s);
      M.pon(new CircleGeometry(radio + 0.025, 12).rotateX(-Math.PI / 2).scale(1, 1, 0.7).translate(x, y + 0.005, z), '#C2410C');
      M.pon(new CircleGeometry(radio, 12).rotateX(-Math.PI / 2).scale(1, 1, 0.7).translate(x, y + 0.009, z), '#FFB347');
    }
    // Las grietas también por el canto, hacia abajo.
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + r() * 0.3;
      const largo = 0.12 + r() * 0.18;
      M.pon(new BoxGeometry(0.02, largo, 0.02).rotateZ((r() - 0.5) * 0.5).translate(Math.cos(a) * (R + 0.012), -0.06 - largo / 2, Math.sin(a) * (R + 0.012)), '#FF7A1F');
    }
    const m = new Mesh(geo(M.fusionar()), mat(new MeshBasicNodeMaterial({ vertexColors: true })));
    grupo.add(m);
    vivos.push((t) => (m.material as MeshBasicNodeMaterial).color.setScalar(0.85 + Math.sin(t * 3.1) * 0.15));
  } else if (p.props === 'hielo' || p.props === 'cristales') {
    const color = p.props === 'hielo' ? '#BFE6F7' : (p.cristal ?? '#CCCCCC');
    const M = new Montaje();
    for (let g = 0; g < 4; g++) {
      const [x, z] = sitio(r, 0.85);
      const base = alturaSuelo(p, x, z, s);
      const n = 3 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) {
        const alto = 0.18 + r() * (g === 0 ? 0.5 : 0.3);
        const inclina = new Vector3((r() - 0.5) * 0.6, 1, (r() - 0.5) * 0.6).normalize();
        const cristal = plano(new OctahedronGeometry(0.06, 0).scale(1, alto / 0.12, 1).translate(0, alto / 2, 0));
        cristal.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), inclina));
        M.ponDegradado(cristal.translate(x + (r() - 0.5) * 0.08, base, z + (r() - 0.5) * 0.08), new Color(color).multiplyScalar(0.75).getStyle(), '#FFFFFF');
      }
    }
    if (p.props === 'hielo') {
      // Carámbanos colgando del canto, delante y a los lados.
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const largo = 0.12 + r() * 0.2;
        M.pon(new ConeGeometry(0.03, largo, 5).rotateX(Math.PI).translate(Math.cos(a) * (R - 0.02), -0.07 - largo / 2, Math.sin(a) * (R - 0.02)), '#D8F1FB');
      }
    }
    const m = new Mesh(geo(M.fusionar()), mat(new MeshBasicNodeMaterial({ vertexColors: true, transparent: true, opacity: p.props === 'hielo' ? 0.85 : 0.92 })));
    grupo.add(m);
  } else if (p.props === 'nubes') {
    // Nubecitas bajo el canto, que se mecen.
    const M = new Montaje();
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + r() * 0.4;
      const rr = R * (0.85 + r() * 0.25);
      // Una nube: bolas de tamaños distintos, apretadas y abolladas, más anchas que altas.
      const cx = Math.cos(a) * rr;
      const cz = Math.sin(a) * rr;
      const cy = -0.45 - r() * 0.25;
      for (let k = 0; k < 7; k++) {
        const t = 0.09 + r() * 0.13;
        M.pon(abollar(new SphereGeometry(t, 10, 7), 0.08, s + i * 10 + k).scale(1.25, 0.85, 1).translate(cx + (r() - 0.5) * 0.42, cy + (r() - 0.5) * 0.1, cz + (r() - 0.5) * 0.3), k % 3 ? '#FFFFFF' : '#EEF4F8');
      }
    }
    // Con luz propia: por abajo les llegaba la luz verde del suelo de la isla y parecían huevos.
    const blanco = attribute('color', 'vec3');
    const nubes = new Mesh(geo(M.fusionar()), new MaterialDiorama({ color: '#FFFFFF', bordes: [-0.3, 0.5], rebote: 0 }, blanco, blanco.mul(0.55)));
    nuevos.push(nubes.material as MaterialDiorama);
    grupo.add(nubes);
    vivos.push((t) => {
      nubes.rotation.y = t * 0.06;
      nubes.position.y = Math.sin(t * 0.8) * 0.03;
    });
  }
}

// ——— Lo que cae ———

interface Particula {
  pos: Vector3;
  vel: Vector3;
  giro: Euler;
  vgiro: Vector3;
  fase: number;
  estado: 'aire' | 'posada';
  t: number;
  botes: number;
  escala: number;
}

const CUANTAS: Record<Cae, number> = { hoja: 26, piedra: 18, gota: 34, brasa: 30, arena: 22, copo: 36, pluma: 16, chispa: 10, burbuja: 18, mota: 28, tuerca: 14, espiritu: 14, sombra: 26, luciernaga: 18 };

function geometriaCae(p: Paleta, s: number): BufferGeometry {
  const color = p.colorCae ?? p.suelo[0];
  switch (p.cae) {
    case 'hoja':
      return geometriaHoja(0.16, 0.08, '#86C95A', '#3F7F2E');
    case 'pluma':
      // Gris azulado con el cañón oscuro: blancas no se veían sobre el blanco roto.
      return geometriaHoja(0.24, 0.06, '#C9D9E6', '#6F8597');
    case 'piedra': {
      const M = new Montaje();
      M.ponDegradado(plano(abollar(new IcosahedronGeometry(0.12, 0), 0.3, s)), p.roca, p.suelo[1]);
      return M.fusionar();
    }
    case 'arena': {
      const M = new Montaje();
      M.pon(plano(abollar(new IcosahedronGeometry(0.035, 0), 0.3, s)), color);
      return M.fusionar();
    }
    case 'gota': {
      const M = new Montaje();
      M.ponDegradado(new SphereGeometry(0.035, 8, 6).scale(1, 2.6, 1), color, '#E8F6FF');
      return M.fusionar();
    }
    case 'copo': {
      // Seis brazos finos cruzados.
      const M = new Montaje();
      for (let i = 0; i < 3; i++) M.pon(new BoxGeometry(0.12, 0.012, 0.004).rotateZ((i * Math.PI) / 3), color);
      return M.fusionar();
    }
    case 'chispa': {
      // Un rayo en zigzag.
      const M = new Montaje();
      const puntos: [number, number][] = [
        [0, 0.12],
        [0.03, 0.03],
        [-0.02, 0.01],
        [0.02, -0.12],
      ];
      for (let i = 0; i < puntos.length - 1; i++) {
        const [x1, y1] = puntos[i];
        const [x2, y2] = puntos[i + 1];
        const largo = Math.hypot(x2 - x1, y2 - y1);
        M.pon(new BoxGeometry(0.016, largo, 0.006).rotateZ(Math.atan2(x1 - x2, y2 - y1) + Math.PI).translate((x1 + x2) / 2, (y1 + y2) / 2, 0), color);
      }
      return M.fusionar();
    }
    case 'tuerca': {
      // Una tuerca: prisma hexagonal con su agujero oscuro.
      const M = new Montaje();
      M.ponDegradado(plano(new CylinderGeometry(0.06, 0.06, 0.04, 6)), '#6F7882', '#C4CBD3');
      M.pon(new CylinderGeometry(0.026, 0.026, 0.042, 10), '#3A3F47');
      return M.fusionar();
    }
    case 'espiritu': {
      // Un jirón: una gota alargada, más clara arriba.
      const M = new Montaje();
      M.ponDegradado(new SphereGeometry(0.05, 10, 8).scale(1, 2.2, 1), '#8F73E0', color);
      return M.fusionar();
    }
    case 'luciernaga': {
      const M = new Montaje();
      M.pon(new SphereGeometry(0.022, 8, 6), color);
      return M.fusionar();
    }
    case 'sombra':
    case 'burbuja':
    case 'brasa':
    case 'mota': {
      const M = new Montaje();
      M.pon(new SphereGeometry(p.cae === 'burbuja' ? 0.06 : 0.03, 10, 7), color);
      return M.fusionar();
    }
  }
}

/** Los que brillan (sin luz): brasas, chispas, motas, gotas y burbujas. */
const BRILLAN: ReadonlySet<Cae> = new Set(['brasa', 'chispa', 'mota', 'gota', 'burbuja', 'espiritu', 'sombra', 'luciernaga']);
/** Los que suben en lugar de caer. */
const SUBEN: ReadonlySet<Cae> = new Set(['brasa', 'burbuja', 'mota', 'espiritu']);
/** Los que planean al caer, con vaivén, y se posan. */
const PLANEAN: ReadonlySet<Cae> = new Set(['hoja', 'pluma', 'copo', 'sombra']);
/** Los que caen con peso y rebotan. */
const PESAN: ReadonlySet<Cae> = new Set(['piedra', 'arena', 'tuerca']);

// ——— El conjunto ———

export function crearEscenarioEvolucion(tipo: string, semilla: number): EscenarioEvolucion {
  const p = PALETAS[tipo] ?? PALETAS.comun;
  const r = azar(semilla);
  const s = Math.floor(r() * 1000);
  const grupo = new Group();
  const nuevos: { dispose(): void }[] = [];
  const vivos: ((t: number) => void)[] = [];

  // La isla y lo de encima, en una sola malla con luz y sombra.
  const M = new Montaje();
  isla(M, p, s);
  props(M, p, s, r);
  // Los decorados de los tipos que tienen el suyo (decorados-evolucion.ts): primero su parte fija.
  const decorado = DECORADOS[p.props];
  const ctxBase = {
    c: { suelo: p.suelo, capas: p.capas, roca: p.roca },
    r,
    s,
    R,
    R_LISO,
    y: (x: number, z: number) => alturaSuelo(p, x, z, s),
    sitio: (detras?: number) => sitio(r, detras),
    plano,
  };
  decorado?.fijo?.({ ...ctxBase, M, brizna });
  const geoIsla = M.fusionar();
  // Sin rebote: el falso rebote toma el color del suelo de la isla del juego, y aquí no hay suelo.
  // Con algo de luz propia: la luz de abajo de la escena es la del suelo verde de la isla, y el
  // peñón salía casi negro y verdoso.
  const color = attribute('color', 'vec3');
  // Más en las caras que miran abajo, que solo reciben esa luz verde.
  const propia = color.mul(float(LUZ_PROPIA).add(smoothstep(0.2, -0.9, normalWorld.y).mul(0.45)));
  const matIsla = new MaterialDiorama({ bordes: [-0.12, 0.42], especular: 0.04, rebote: 0 }, color, propia);
  matIsla.side = DoubleSide;
  nuevos.push(geoIsla, matIsla);
  grupo.add(new Mesh(geoIsla, matIsla));
  extras(grupo, p, s, r, nuevos, vivos);
  decorado?.vivo?.({
    ...ctxBase,
    grupo,
    matLuz: matIsla,
    mat: (m) => {
      nuevos.push(m);
      return m;
    },
    geo: (g) => {
      nuevos.push(g);
      return g;
    },
    vivos,
  });

  // Peñascos que flotan junto a la isla, meciéndose.
  const MF = new Montaje();
  for (let i = 0; i < 3; i++) MF.ponDegradado(plano(abollar(new IcosahedronGeometry(0.1 + i * 0.03, 1), 0.3, s + 50 + i).scale(1, 0.8, 1)), p.roca, p.capas[0]);
  const geoFlota = MF.fusionar();
  nuevos.push(geoFlota);
  const flotantes = [
    [-2.05, -0.55, -0.6],
    [2.1, -0.25, -0.9],
    [1.7, -0.95, 0.5],
  ].map(([x, y, z], i) => {
    const m = new Mesh(geoFlota, matIsla);
    m.position.set(x, y, z);
    m.scale.setScalar(0.6 + i * 0.25);
    m.userData = { y, fase: i * 2.1 };
    grupo.add(m);
    return m;
  });
  vivos.push((t) => {
    for (const m of flotantes) {
      const { y, fase } = m.userData as { y: number; fase: number };
      m.position.y = y + Math.sin(t * 0.9 + fase) * 0.06;
      m.rotation.y = t * 0.2 + fase;
    }
  });

  // La sombra, difusa, lejos debajo: discos concéntricos muy tenues.
  const matSombra = new MeshBasicNodeMaterial({ color: '#7A6E62', transparent: true, opacity: 0.07, depthWrite: false });
  matSombra.toneMapped = false;
  const geoSombra = new CircleGeometry(1, 40).rotateX(-Math.PI / 2);
  nuevos.push(matSombra, geoSombra);
  for (const radio of [1.7, 1.35, 1.0, 0.65]) {
    const m = new Mesh(geoSombra, matSombra);
    m.scale.set(radio, 1, radio * 0.75);
    m.position.y = -1.9;
    grupo.add(m);
  }

  // Lo que cae (o sube), con su peso y su vuelo.
  const geoCae = geometriaCae(p, s);
  const brilla = BRILLAN.has(p.cae);
  const matCae = brilla
    ? new MeshBasicNodeMaterial({ vertexColors: true, transparent: p.cae === 'burbuja' || p.cae === 'espiritu', opacity: p.cae === 'burbuja' ? 0.55 : p.cae === 'espiritu' ? 0.6 : 1, side: DoubleSide })
    : new MaterialDiorama({ bordes: [-0.2, 0.5], rebote: 0 }, color, propia);
  if (brilla) (matCae as MeshBasicNodeMaterial).toneMapped = false;
  matCae.side = DoubleSide;
  nuevos.push(geoCae, matCae);
  const n = CUANTAS[p.cae];
  const malla = new InstancedMesh(geoCae, matCae, n);
  malla.instanceMatrix.setUsage(DynamicDrawUsage);
  malla.frustumCulled = false;
  grupo.add(malla);
  const sube = SUBEN.has(p.cae);
  const nacer = (q: Particula, alPrincipio: boolean) => {
    const ang = r() * Math.PI * 2;
    // Las que caen, alrededor de la criatura; las que suben, desde la isla.
    // Lejos del centro: lo que caía cerca cruzaba por delante de la criatura (probador, 2026-11-19).
    const rr = sube ? R_LISO - 0.1 + r() * (R - R_LISO) : 1.05 + Math.sqrt(r()) * 1.6;
    const alto = sube ? alturaSuelo(p, Math.cos(ang) * rr, Math.sin(ang) * rr, s) + 0.02 : 3.2 + r() * 1.4;
    q.pos.set(Math.cos(ang) * rr, alPrincipio && !sube ? alto - r() * 3.6 : alto, Math.sin(ang) * rr * 0.85);
    const lento = PLANEAN.has(p.cae);
    q.vel.set(0, sube ? 0.35 + r() * 0.45 : lento ? -(0.45 + r() * 0.25) : p.cae === 'gota' ? -4.5 : -(0.6 + r() * 0.6), 0);
    q.giro.set(r() * 6, r() * 6, r() * 6);
    q.vgiro.set((r() - 0.5) * 4, (r() - 0.5) * 4, (r() - 0.5) * 4);
    q.fase = r() * 10;
    q.estado = 'aire';
    q.t = 0;
    q.botes = 0;
    q.escala = 0.75 + r() * 0.5;
    if (p.cae === 'luciernaga') {
      // Cada luciérnaga revolotea alrededor de un sitio fijo, por detrás y a los lados (en `vel`).
      const a = Math.PI + 0.1 + r() * (Math.PI - 0.2) + (r() < 0.3 ? Math.PI * 0.6 * (r() < 0.5 ? -1 : 1) : 0);
      const rr = R_LISO + r() * (R - R_LISO + 0.5);
      q.vel.set(Math.cos(a) * rr, r() * 0.6, Math.sin(a) * rr * 0.9);
    }
  };
  const particulas: Particula[] = Array.from({ length: n }, () => {
    const q: Particula = { pos: new Vector3(), vel: new Vector3(), giro: new Euler(), vgiro: new Vector3(), fase: 0, estado: 'aire', t: 0, botes: 0, escala: 1 };
    nacer(q, true);
    return q;
  });

  // Polvo y salpicaduras al tocar la isla.
  const geoPolvo = p.cae === 'gota' ? new RingGeometry(0.05, 0.07, 20).rotateX(-Math.PI / 2) : new SphereGeometry(0.06, 8, 5).scale(1, 0.5, 1);
  nuevos.push(geoPolvo);
  const polvos = Array.from({ length: 10 }, () => {
    const mat = new MeshBasicNodeMaterial({ color: p.cae === 'gota' ? '#EAF7FF' : new Color(p.suelo[1]).lerp(new Color('#FFFFFF'), 0.35), transparent: true, opacity: 0, depthWrite: false });
    mat.toneMapped = false;
    nuevos.push(mat);
    const m = new Mesh(geoPolvo, mat);
    m.visible = false;
    m.userData.t = 1;
    grupo.add(m);
    return m;
  });
  let siguientePolvo = 0;
  const levantarPolvo = (x: number, y: number, z: number) => {
    if (p.cae !== 'piedra' && p.cae !== 'gota' && p.cae !== 'arena') return;
    const m = polvos[siguientePolvo++ % polvos.length];
    m.position.set(x, y + 0.02, z);
    m.userData.t = 0;
    m.visible = true;
  };

  const matriz = new Matrix4();
  const QUIETO = new Euler(0, 0, 0);
  const quat = new Quaternion();
  const escala = new Vector3();
  let ultimo: number | null = null;

  return {
    grupo,
    animar(reloj: number) {
      const dt = ultimo === null ? 0 : Math.min(0.05, Math.max(0, reloj - ultimo));
      ultimo = reloj;
      for (const v of vivos) v(reloj);
      for (let i = 0; i < n; i++) {
        const q = particulas[i];
        q.t += dt;
        let visible = 1;
        if (q.estado === 'posada') {
          // Se queda un momento en el suelo y se encoge.
          visible = q.t < 1.2 ? 1 : Math.max(0, 1 - (q.t - 1.2) / 0.4);
          if (visible <= 0) nacer(q, false);
        } else {
          if (PESAN.has(p.cae)) q.vel.y -= 5.5 * dt;
          if (p.cae === 'luciernaga') {
            // Revolotean despacio alrededor de su sitio y se encienden y apagan.
            const cx = q.vel.x;
            const cz = q.vel.z;
            q.pos.set(cx + Math.sin(reloj * 0.7 + q.fase) * 0.35, 0.35 + q.vel.y + Math.sin(reloj * 1.1 + q.fase * 2) * 0.18, cz + Math.cos(reloj * 0.6 + q.fase) * 0.25);
          } else if (PLANEAN.has(p.cae)) {
            // Planean: vaivén de lado a lado y un poco de giro.
            q.pos.x += Math.sin(reloj * 1.7 + q.fase) * 0.45 * dt;
            q.pos.z += Math.cos(reloj * 1.3 + q.fase) * 0.25 * dt;
          } else if (p.cae === 'espiritu') {
            // Suben en espiral.
            q.pos.x += Math.cos(reloj * 2 + q.fase) * 0.35 * dt;
            q.pos.z += Math.sin(reloj * 2 + q.fase) * 0.35 * dt;
          } else if (sube) {
            q.pos.x += Math.sin(reloj * 2.3 + q.fase) * 0.12 * dt;
          }
          if (p.cae !== 'luciernaga') q.pos.addScaledVector(q.vel, dt);
          q.giro.x += q.vgiro.x * dt;
          q.giro.y += q.vgiro.y * dt;
          q.giro.z += q.vgiro.z * dt;
          const rr = Math.hypot(q.pos.x, q.pos.z);
          const suelo = alturaSuelo(p, q.pos.x, q.pos.z, s);
          if (p.cae === 'luciernaga') {
            visible = Math.sin(reloj * 2.6 + q.fase * 3) > 0.2 ? 1 : 0.25;
          } else if (sube) {
            // Suben, parpadean (las brasas) y se apagan arriba.
            visible = Math.max(0, 1 - q.t / 3.2) * (p.cae === 'brasa' ? 0.75 + Math.sin(reloj * 14 + q.fase) * 0.25 : 1);
            if (q.t > 3.2 || q.pos.y > 3) nacer(q, false);
          } else if (p.cae === 'chispa') {
            visible = q.t % 0.9 < 0.12 ? 1 : 0;
            if (q.t > 2.7) nacer(q, false);
          } else if (rr < R - 0.03 && q.pos.y <= suelo + 0.02 && q.vel.y < 0) {
            q.pos.y = suelo + 0.02;
            if (PESAN.has(p.cae) && q.botes < 2) {
              // Rebota, cada vez menos, y levanta polvo.
              levantarPolvo(q.pos.x, suelo, q.pos.z);
              q.vel.y = -q.vel.y * 0.32;
              q.vel.x = (r() - 0.5) * 0.4;
              q.vel.z = (r() - 0.5) * 0.4;
              q.botes++;
            } else if (p.cae === 'gota') {
              levantarPolvo(q.pos.x, suelo, q.pos.z);
              nacer(q, false);
            } else {
              q.estado = 'posada';
              q.t = 0;
              q.vel.set(0, 0, 0);
              // Las hojas y plumas, tumbadas.
              if (PLANEAN.has(p.cae)) q.giro.set(-Math.PI / 2, q.giro.y, 0);
            }
          } else if (q.pos.y < -2.2) nacer(q, false);
        }
        quat.setFromEuler(p.cae === 'gota' || p.cae === 'luciernaga' || p.cae === 'espiritu' ? QUIETO : q.giro);
        escala.setScalar(q.escala * visible);
        matriz.compose(q.pos, quat, escala);
        malla.setMatrixAt(i, matriz);
      }
      malla.instanceMatrix.needsUpdate = true;
      for (const m of polvos) {
        if (!m.visible) continue;
        m.userData.t += dt * 2;
        const k = m.userData.t as number;
        m.scale.setScalar(1 + k * 3);
        (m.material as MeshBasicNodeMaterial).opacity = 0.55 * (1 - k);
        if (k >= 1) m.visible = false;
      }
    },
    dispose() {
      grupo.removeFromParent();
      for (const x of nuevos) x.dispose();
      malla.dispose();
    },
  };
}
