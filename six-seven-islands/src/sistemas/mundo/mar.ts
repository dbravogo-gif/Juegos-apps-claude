// El mar alrededor de la isla (autor, 2026-11-10): espuma en las orillas, alguna ola, rocas,
// boyas frente a las playas y barcas. Sin nada, el mar liso junto al camino parecía que se podía
// pisar («parece que puedes meterte a hacer surf»). El plan es puro y determinista: el mismo mundo
// da siempre el mismo mar. La geometría de la espuma va aparte, en `geometriaEspuma`.

import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Matrix4, PlaneGeometry, Quaternion, SphereGeometry, Vector3, type BufferGeometry } from 'three/webgpu';
import { TRANSITABLES, clave, deClave, type Mundo } from '../../core/mundo';
import { NIVEL_MAR } from '../../arte/escala';
import { pseudo } from './terreno';
import { VARIANTES } from './kit';

/** Hasta dónde se adorna el mar, en casillas desde la costa: más lejos no lo ve la cámara. */
export const ALCANCE_MAR = 8;
/**
 * Lo más cerca de la costa que van las rocas y las barcas: entre ellas y la orilla quedan al menos
 * dos casillas de agua (autor, 2026-11-11). Las del puerto, amarradas, sí van junto al muelle.
 */
export const DISTANCIA_MINIMA = 3;
/** Las boyas marcan la zona de baño a esta distancia de la playa, algo más afuera que las rocas. */
export const DISTANCIA_BOYAS = 4;
/** Suelo de las playas: arena dorada y picón negro (El Golfo). */
const PLAYA = new Set(['a', '_']);

/** Una pieza de espuma: franja junto a la orilla, burbuja suelta u ola en mar abierto. */
export interface PiezaEspuma {
  tipo: 'franja' | 'burbuja' | 'ola';
  x: number;
  y: number;
  /** Franja: a lo largo de x (0) o de y (π/2). Ola: su giro. */
  giro: number;
  escala: number;
}

/** Una pieza del kit en el mar. */
export interface PiezaMar {
  tipo: 'roca' | 'boya' | 'barca';
  x: number;
  y: number;
  /** Altura de su base: las rocas y las barcas van algo hundidas. */
  altura: number;
  escala: number;
  giro: number;
  semilla: number;
}

export interface PlanMar {
  espuma: PiezaEspuma[];
  piezas: PiezaMar[];
}

/**
 * Clave de las casillas de mar. Admite coordenadas negativas, que la de la isla no (el mar la
 * rodea también por el norte y el oeste); las casillas de tierra siguen con la clave de la isla.
 */
const DESPLAZAMIENTO = 64;
export const claveMar = (x: number, y: number): number => clave(x + DESPLAZAMIENTO, y + DESPLAZAMIENTO);
const deClaveMar = (k: number): [number, number] => {
  const [x, y] = deClave(k);
  return [x - DESPLAZAMIENTO, y - DESPLAZAMIENTO];
};

const VECINOS: readonly [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/** Si una casilla es mar: fuera de la isla, o agua dentro de una zona. */
export function esMar(m: Mundo, cumbre: Map<number, number>, x: number, y: number): boolean {
  if (x < 0 || y < 0) return true;
  const k = clave(x, y);
  if (cumbre.has(k)) return false;
  const c = m.casillas.get(k)?.c;
  return c === undefined || c === '~' || c === 'B';
}

/**
 * Distancia de cada casilla de mar a la costa (1 = pegada a tierra), hasta ALCANCE_MAR, y la casilla
 * de tierra de la que viene (con la clave de la isla): así se sabe si da a una playa. Va por
 * `claveMar`.
 */
export function distanciasMar(m: Mundo, cumbre: Map<number, number>): Map<number, { d: number; origen: number }> {
  const res = new Map<number, { d: number; origen: number }>();
  const margen = ALCANCE_MAR + 1;
  let frente: number[] = [];
  for (let y = -margen; y < m.alto + margen; y++) {
    for (let x = -margen; x < m.ancho + margen; x++) {
      if (!esMar(m, cumbre, x, y)) continue;
      // La playa manda sobre el risco: si una casilla toca las dos, cuenta como frente a la playa.
      let origen: number | undefined;
      for (const [dx, dy] of VECINOS) {
        if (esMar(m, cumbre, x + dx, y + dy)) continue;
        const k = clave(x + dx, y + dy);
        if (origen === undefined || PLAYA.has(m.casillas.get(k)?.c ?? '')) origen = k;
      }
      if (origen === undefined) continue;
      res.set(claveMar(x, y), { d: 1, origen });
      frente.push(claveMar(x, y));
    }
  }
  for (let d = 2; d <= ALCANCE_MAR; d++) {
    const siguiente: number[] = [];
    for (const k of frente) {
      const [x, y] = deClaveMar(k);
      const { origen } = res.get(k)!;
      for (const [dx, dy] of VECINOS) {
        const [nx, ny] = [x + dx, y + dy];
        if (nx < -margen || ny < -margen || nx >= m.ancho + margen || ny >= m.alto + margen) continue;
        const nk = claveMar(nx, ny);
        if (res.has(nk) || !esMar(m, cumbre, nx, ny)) continue;
        res.set(nk, { d, origen });
        siguiente.push(nk);
      }
    }
    frente = siguiente;
  }
  return res;
}

/** Qué hay en el mar y dónde. */
export function planMar(m: Mundo, cumbre: Map<number, number>): PlanMar {
  const dist = distanciasMar(m, cumbre);
  const espuma: PiezaEspuma[] = [];
  const piezas: PiezaMar[] = [];
  const ocupadas = new Set<number>();
  const esPlaya = (k: number) => PLAYA.has(m.casillas.get(k)?.c ?? '');
  /** Tierra que se pisa y no es playa: el muelle y las calles del puerto. */
  const esMuelle = (k: number) => {
    const c = m.casillas.get(k)?.c ?? '';
    return TRANSITABLES.has(c) && !PLAYA.has(c);
  };
  const libre = (x: number, y: number, r: number) => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (!esMar(m, cumbre, x + dx, y + dy) || ocupadas.has(claveMar(x + dx, y + dy))) return false;
    return true;
  };
  // Recorrido en orden fijo (por filas), para que el plan no dependa del orden del mapa.
  // `pseudo` de la clave del mar: la misma casilla da siempre lo mismo.
  const claves = [...dist.keys()].sort((a, b) => a - b);

  for (const k of claves) {
    const { d } = dist.get(k)!;
    const [x, y] = deClaveMar(k);
    const r = pseudo(k);
    if (d === 1) {
      // Una franja de espuma pegada a cada lado que da a tierra, y alguna burbuja algo más afuera.
      for (const [dx, dy] of VECINOS) {
        if (esMar(m, cumbre, x + dx, y + dy)) continue;
        const giro = dx === 0 ? 0 : Math.PI / 2;
        espuma.push({ tipo: 'franja', x: x + dx * 0.41, y: y + dy * 0.41, giro, escala: 1 });
        if ((r >>> (dx + 2 * dy + 3)) & 1) espuma.push({ tipo: 'burbuja', x: x + dx * 0.1 + (dy ? ((r >>> 5) % 7) / 10 - 0.3 : 0), y: y + dy * 0.1 + (dx ? ((r >>> 9) % 7) / 10 - 0.3 : 0), giro: 0, escala: 0.7 + ((r >>> 13) % 4) * 0.15 });
      }
      // En las esquinas de tierra que asoman, una burbuja redondea la franja.
      for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
        if (!esMar(m, cumbre, x + dx, y + dy) && esMar(m, cumbre, x + dx, y) && esMar(m, cumbre, x, y + dy)) {
          espuma.push({ tipo: 'burbuja', x: x + dx * 0.42, y: y + dy * 0.42, giro: 0, escala: 1.1 });
        }
      }
    } else if (r % 7 === 0) {
      espuma.push({ tipo: 'ola', x: x + ((r >>> 4) % 5) / 10 - 0.2, y: y + ((r >>> 8) % 5) / 10 - 0.2, giro: ((r >>> 12) % 5) * 0.08 - 0.16, escala: 0.8 + ((r >>> 16) % 4) * 0.15 });
    }
  }

  // Boyas: una fila frente a cada playa, que marca hasta dónde se nada.
  for (const k of claves) {
    const { d, origen } = dist.get(k)!;
    const [x, y] = deClaveMar(k);
    if (d !== DISTANCIA_BOYAS || !esPlaya(origen) || (((x + y) % 3) + 3) % 3 !== 0) continue;
    piezas.push({ tipo: 'boya', x, y, altura: NIVEL_MAR - 0.04, escala: 1, giro: 0, semilla: pseudo(k) });
    ocupadas.add(k);
  }

  // Rocas sueltas cerca de la costa, cada una con su espuma alrededor. Solo basalto gris: la
  // escoria rojiza, en el agua, parecía algo flotando. En el puerto no: allí van barcas.
  for (const k of claves) {
    const { d, origen } = dist.get(k)!;
    const [x, y] = deClaveMar(k);
    const r = pseudo(k);
    if (d < DISTANCIA_MINIMA || d > DISTANCIA_MINIMA + 2 || r % 11 !== 0 || ocupadas.has(k) || esMuelle(origen)) continue;
    const escala = 1 + ((r >>> 6) % 5) * 0.18;
    piezas.push({ tipo: 'roca', x, y, altura: NIVEL_MAR - 0.12 * escala, escala, giro: ((r >>> 10) % 6) * (Math.PI / 3), semilla: r >>> 3 });
    ocupadas.add(k);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + (r % 7);
      espuma.push({ tipo: 'burbuja', x: x + Math.cos(a) * 0.32 * escala, y: y + Math.sin(a) * 0.32 * escala, giro: 0, escala: 0.8 });
    }
  }

  // Barcas: donde caben con agua alrededor, sin juntarse, a lo largo de la costa más cercana.
  // Junto al muelle, muchas más y más juntas: amarradas en el puerto.
  for (const k of claves) {
    const { d, origen } = dist.get(k)!;
    const [x, y] = deClaveMar(k);
    const r = pseudo(k);
    const puerto = esMuelle(origen);
    if (d < (puerto ? 2 : DISTANCIA_MINIMA) || d > (puerto ? 3 : 7) || r % (puerto ? 4 : 29) !== 0 || !libre(x, y, 1)) continue;
    let cerca = false;
    for (const p of piezas) if (p.tipo === 'barca' && Math.abs(p.x - x) + Math.abs(p.y - y) < (puerto ? 4 : 10)) cerca = true;
    if (cerca) continue;
    const [ox, oy] = deClave(origen);
    // El eje largo de la barca es x; girada para quedar paralela a la costa, con algo de holgura.
    const giro = Math.atan2(-(oy - y), ox - x) + Math.PI / 2 + (((r >>> 5) % 5) - 2) * 0.12;
    piezas.push({ tipo: 'barca', x, y, altura: NIVEL_MAR - 0.06, escala: 1, giro, semilla: r >>> 4 });
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) ocupadas.add(claveMar(x + dx, y + dy));
  }
  return { espuma, piezas };
}

/**
 * Las rocas, boyas y barcas del mar en una sola geometría con color por vértice: sueltas por trozos
 * costaban hasta 30 llamadas de dibujo más. `pieza` da cada variante del kit.
 */
export function geometriaPiezasMar(piezas: readonly PiezaMar[], pieza: (nombre: string) => BufferGeometry): BufferGeometry | null {
  if (!piezas.length) return null;
  const q = new Quaternion();
  const eje = new Vector3(0, 1, 0);
  const partes = piezas.map((p) => {
    const mt = new Matrix4().compose(new Vector3(p.x, p.altura, p.y), q.setFromAxisAngle(eje, p.giro), new Vector3(p.escala, p.escala, p.escala));
    return pieza(`${p.tipo}_${p.semilla % VARIANTES[p.tipo]}`).clone().applyMatrix4(mt);
  });
  const g = mergeGeometries(partes, false);
  for (const p of partes) p.dispose();
  return g;
}

/**
 * Toda la espuma del mar en una sola geometría (una llamada de dibujo): las franjas son planas, y
 * las de lo largo de y van un pelo más altas que las de lo largo de x, para que en las esquinas no
 * se solapen en el mismo plano (titilarían, APRENDIDO.md); las burbujas y las olas son bolas
 * aplastadas que asoman del agua.
 */
export function geometriaEspuma(piezas: readonly PiezaEspuma[]): BufferGeometry | null {
  if (!piezas.length) return null;
  const partes: BufferGeometry[] = [];
  for (const p of piezas) {
    if (p.tipo === 'franja') {
      const alto = p.giro === 0 ? 0.014 : 0.02;
      partes.push(new PlaneGeometry(1, 0.18).rotateX(-Math.PI / 2).rotateY(p.giro).translate(p.x, NIVEL_MAR + alto, p.y));
    } else if (p.tipo === 'burbuja') {
      partes.push(new SphereGeometry(0.1 * p.escala, 6, 2).scale(1, 0.3, 0.8).translate(p.x, NIVEL_MAR, p.y));
    } else {
      // Dos crestas paralelas, una algo más corta y desplazada.
      for (const [dz, largo, dx] of [
        [0, 0.34, 0],
        [0.13, 0.22, 0.12],
      ]) {
        partes.push(new SphereGeometry(1, 6, 2).scale(largo * p.escala, 0.02, 0.035).translate(dx, 0, dz).rotateY(p.giro).translate(p.x, NIVEL_MAR, p.y));
      }
    }
  }
  return mergeGeometries(partes, false);
}
