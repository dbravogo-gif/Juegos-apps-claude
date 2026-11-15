// Los recados (HISTORIA.md, parte 3): un personaje pide algo (una criatura en el equipo o vencer a
// unos entrenadores) y da un premio. Puro: dice en qué punto está cada recado.

import type { Condicion } from './mundo';

export interface DefRecado {
  id: string;
  /** Desde cuándo se puede hacer (el anciano, después de contarte la historia de tu compañera). */
  con?: Condicion;
  /** Lo que pide: llevar en el equipo una criatura de esa especie, o haber vencido a esos entrenadores. */
  pide: { especie?: string; vencidos?: readonly string[] };
  da: { objeto: string; cantidad: number };
  quien: string;
  /** Lo que dice mientras no está hecho, al cumplirlo y después. */
  pedir: readonly string[];
  cumplido: readonly string[];
  hecho: readonly string[];
}

export type PuntoRecado = 'cerrado' | 'pendiente' | 'cumplible' | 'hecho';

/** En qué punto está un recado, con lo que lleva y ha hecho el jugador. */
export function puntoRecado(r: DefRecado, condiciones: readonly string[], especiesEquipo: readonly string[], vencidos: readonly string[]): PuntoRecado {
  if (condiciones.includes(`recado:${r.id}`)) return 'hecho';
  if (r.con && !condiciones.includes(r.con)) return 'cerrado';
  const tiene = !r.pide.especie || especiesEquipo.includes(r.pide.especie);
  const vencio = (r.pide.vencidos ?? []).every((id) => vencidos.includes(id));
  return tiene && vencio ? 'cumplible' : 'pendiente';
}
