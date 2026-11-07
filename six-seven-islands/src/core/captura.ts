// Captura: la fórmula del género (tercera y cuarta generación) más la calidad del lanzamiento
// con el dedo, de 0 a 1, que sale de la puntería y del momento (DISENO.md).

import type { EstadoCriatura } from './modelo';
import { entero, type EstadoRng } from './rng';

export interface DatosCaptura {
  vida: number;
  vidaMax: number;
  /** Ratio de la especie, de 1 a 255. */
  ratio: number;
  /** Bonificación del objeto de captura (el básico vale 1). */
  bonus: number;
  estado: EstadoCriatura | null;
  /** Calidad del lanzamiento, de 0 (malo) a 1 (perfecto). */
  calidad: number;
}

/** Multiplicador del lanzamiento: ×0,75 el peor, ×1,25 el perfecto. */
export function factorLanzamiento(calidad: number): number {
  const q = Math.max(0, Math.min(1, Number.isFinite(calidad) ? calidad : 0));
  return 0.75 + 0.5 * q;
}

/** Valor «a» de la fórmula. 255 o más: captura segura. */
export function valorCaptura(d: DatosCaptura): number {
  const max = Math.max(1, d.vidaMax);
  const vida = Math.max(1, Math.min(d.vida, max));
  let a = Math.floor(((3 * max - 2 * vida) * d.ratio * d.bonus * factorLanzamiento(d.calidad)) / (3 * max));
  // Dormida, el doble; con cualquier otro estado, un 50 % más.
  if (d.estado?.tipo === 'dormido') a = Math.floor(a * 2);
  else if (d.estado) a = Math.floor(a * 1.5);
  return Math.max(1, a);
}

function umbralSacudida(a: number): number {
  return Math.floor(1048560 / Math.floor(Math.sqrt(Math.floor(Math.sqrt(Math.floor(16711680 / a))))));
}

/** Probabilidad de capturar, de 0 a 1. Para la interfaz y las pruebas. */
export function probabilidadCaptura(d: DatosCaptura): number {
  const a = valorCaptura(d);
  if (a >= 255) return 1;
  return (umbralSacudida(a) / 65536) ** 4;
}

/** Cuatro comprobaciones; `sacudidas` (0–3) es para la animación. */
export function intentarCaptura(d: DatosCaptura, rng: EstadoRng): { exito: boolean; sacudidas: number } {
  const a = valorCaptura(d);
  if (a >= 255) return { exito: true, sacudidas: 3 };
  const b = umbralSacudida(a);
  for (let i = 0; i < 4; i++) {
    if (entero(rng, 0, 65535) >= b) return { exito: false, sacudidas: Math.min(i, 3) };
  }
  return { exito: true, sacudidas: 3 };
}
