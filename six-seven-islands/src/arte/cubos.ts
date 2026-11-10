// Los cubos de captura (autor, 2026-11-10): la figura de Metatrón, con la red de 13 esferas y los
// cinco sólidos platónicos uno dentro de otro. El nivel se lee por el color, cada vez más épico:
// blanco, verde, azul, rojo y morado. En la imagen va la figura completa; al lanzarlo en combate,
// solo las dos últimas figuras (dodecaedro e icosaedro), que se leen mejor en movimiento.
// Aristas gruesas y vértices redondos, como un juguete. Cada figura es una capa aparte, para que
// gire a su ritmo. Nombres provisionales: los pone el autor.

import {
  BoxGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  Mesh,
  OctahedronGeometry,
  SphereGeometry,
  TetrahedronGeometry,
  Vector3,
  type BufferGeometry,
  type Material,
} from 'three/webgpu';
import { Montaje, apuntar } from './montaje';

type Solido = 'tetraedro' | 'octaedro' | 'cubo' | 'icosaedro' | 'dodecaedro';
/** De menos a más vértices: 4, 6, 8, 12 y 20. */
const SOLIDOS: Solido[] = ['tetraedro', 'octaedro', 'cubo', 'icosaedro', 'dodecaedro'];

export interface DefCubo {
  nombre: string;
  /** Color de la figura de fuera. */
  color: string;
  /** Color claro de las figuras de dentro. */
  claro: string;
}

export const CUBOS: readonly DefCubo[] = [
  { nombre: 'Blanco', color: '#F3F0E8', claro: '#AEB6C4' },
  { nombre: 'Verde', color: '#2FBF71', claro: '#CFF3DD' },
  { nombre: 'Azul', color: '#3B82F6', claro: '#D3E3FF' },
  { nombre: 'Rojo', color: '#E5484D', claro: '#FFD6D6' },
  { nombre: 'Morado', color: '#9B5DE5', claro: '#E9DBFF' },
];

/** Radio de la figura de fuera; cada una de dentro mide esto por `MENGUA`. */
export const RADIO_CUBO = 0.3;
const MENGUA = 0.6;

function solido(s: Solido, r: number): BufferGeometry {
  switch (s) {
    case 'tetraedro':
      return new TetrahedronGeometry(r);
    case 'octaedro':
      return new OctahedronGeometry(r);
    case 'cubo': {
      const lado = (2 * r) / Math.sqrt(3);
      return new BoxGeometry(lado, lado, lado);
    }
    case 'icosaedro':
      return new IcosahedronGeometry(r);
    case 'dodecaedro':
      return new DodecahedronGeometry(r);
  }
}

/** Aristas en tubos y vértices en bolitas; con `caras`, también la figura maciza. */
function aristas(M: Montaje, g: BufferGeometry, color: string, grosor: number): void {
  const pos = new EdgesGeometry(g, 1).getAttribute('position');
  const vistos = new Set<string>();
  const a = new Vector3();
  const b = new Vector3();
  for (let i = 0; i < pos.count; i += 2) {
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, i + 1);
    const largo = a.distanceTo(b);
    M.pon(apuntar(new CylinderGeometry(grosor, grosor, largo, 6).translate(0, largo / 2, 0), a, b.clone().sub(a)), color);
    for (const v of [a, b]) {
      const k = `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
      if (vistos.has(k)) continue;
      vistos.add(k);
      M.pon(new SphereGeometry(grosor * 1.8, 8, 6).translate(v.x, v.y, v.z), color);
    }
  }
}

/** La red de Metatrón: 13 esferas (el centro y las 12 de un cuboctaedro) y sus uniones. */
function redMetatron(M: Montaje, r: number, color: string, perla: string): void {
  const puntos = [new Vector3()];
  for (const [x, y, z] of [[1, 1, 0], [1, -1, 0], [-1, 1, 0], [-1, -1, 0], [1, 0, 1], [1, 0, -1], [-1, 0, 1], [-1, 0, -1], [0, 1, 1], [0, 1, -1], [0, -1, 1], [0, -1, -1]]) {
    puntos.push(new Vector3(x, y, z).normalize().multiplyScalar(r));
  }
  const vecino = r * 1.01; // en un cuboctaedro, la arista mide lo mismo que el radio
  for (let i = 0; i < puntos.length; i++) {
    for (let j = i + 1; j < puntos.length; j++) {
      const largo = puntos[i].distanceTo(puntos[j]);
      if (largo > vecino) continue;
      M.pon(apuntar(new CylinderGeometry(0.008, 0.008, largo, 5).translate(0, largo / 2, 0), puntos[i], puntos[j].clone().sub(puntos[i])), color);
    }
  }
  for (const p of puntos) M.pon(new SphereGeometry(0.03, 10, 8).translate(p.x, p.y, p.z), perla);
}

/**
 * Las capas de un cubo, de fuera a dentro. Completo: la red de Metatrón, el dodecaedro grueso y
 * de color, y los demás sólidos claros hasta el tetraedro macizo del centro. Para lanzar: el
 * dodecaedro y, dentro, el icosaedro macizo.
 */
function capas(nivel: number, completo: boolean): BufferGeometry[] {
  const d = CUBOS[nivel];
  const res: BufferGeometry[] = [];
  if (!completo) {
    const fuera = new Montaje();
    aristas(fuera, solido('dodecaedro', RADIO_CUBO), d.color, 0.026);
    const dentro = new Montaje();
    const r = RADIO_CUBO * 0.72;
    dentro.pon(solido('icosaedro', r), d.claro, 1.05);
    aristas(dentro, solido('icosaedro', r), d.color, 0.012);
    return [fuera.fusionar(), dentro.fusionar()];
  }
  const red = new Montaje();
  redMetatron(red, RADIO_CUBO * 1.25, d.color, d.claro);
  res.push(red.fusionar());
  let r = RADIO_CUBO;
  let grosor = 0.022;
  for (let i = SOLIDOS.length - 1; i >= 0; i--) {
    const M = new Montaje();
    aristas(M, solido(SOLIDOS[i], r), i === SOLIDOS.length - 1 ? d.color : d.claro, grosor);
    // La de más dentro, maciza: el corazón del color del nivel.
    if (i === 0) M.pon(solido('tetraedro', r * 0.55), d.color, 1.15);
    res.push(M.fusionar());
    r *= MENGUA;
    grosor = Math.max(0.009, grosor * 0.75);
  }
  return res;
}

/** Un cubo de captura listo para la escena, con cada capa en su malla para girarla aparte. */
export function figuraCubo(nivel: number, material: Material, completo = false): Group {
  const g = new Group();
  capas(nivel, completo).forEach((geo, i) => {
    const malla = new Mesh(geo, material);
    malla.castShadow = true;
    malla.userData.giro = (i % 2 ? -1 : 1) * (0.6 + i * 0.35);
    g.add(malla);
  });
  return g;
}

/** Gira las capas de un cubo, cada una a su ritmo y sobre un eje distinto. */
export function girarCubo(g: Group, t: number): void {
  g.children.forEach((c, i) => {
    const v = (c.userData.giro as number) ?? 1;
    c.rotation.set(t * v * 0.7, t * v, t * v * 0.4 * (i % 3));
  });
}

/** El cubo en una sola geometría, para el catálogo. */
export function geometriaCubo(nivel: number, completo = true): BufferGeometry {
  const M = new Montaje();
  for (const g of capas(nivel, completo)) M.ponTal(g);
  return M.fusionar();
}
