// Encuentros con criaturas salvajes (DISENO.md, «Encuentros»): al terminar un paso sobre terreno de
// encuentros (hierba alta o malpaís) puede salir una criatura por sorpresa, sorteada de la tabla de
// su zona. Puro: el resultado solo depende del generador.

import { elegirPonderado, entero, probabilidad, type EstadoRng } from './rng';

/** Una especie de la tabla de una zona: entre qué niveles sale y cuánto pesa en el sorteo. */
export interface EntradaEncuentro {
  especie: string;
  nivel: readonly [number, number];
  peso: number;
}

export type TablaEncuentros = Readonly<Record<string, readonly EntradaEncuentro[]>>;

/** Probabilidad de encuentro por paso sobre terreno de encuentros, en tanto por ciento. */
export const PROB_ENCUENTRO = 10;

/** Sortea si sale una criatura en esta zona, y cuál y de qué nivel. */
export function sortearEncuentro(tabla: TablaEncuentros, zona: string, rng: EstadoRng, prob = PROB_ENCUENTRO): { especie: string; nivel: number } | null {
  const entradas = tabla[zona];
  if (!entradas?.length || !probabilidad(rng, prob)) return null;
  const e = entradas[elegirPonderado(rng, entradas.map((x) => x.peso))];
  return { especie: e.especie, nivel: entero(rng, e.nivel[0], e.nivel[1]) };
}
