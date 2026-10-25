// Recipientes registrables (las tinajas). El resultado sale del generador de la partida,
// así que no se puede repetir recargando: el estado del generador viaja con el guardado.

import type { Criatura, DatosJuego } from './modelo';
import { elegirPonderado } from './rng';
import { crearCriatura } from './criatura';
import type { TablaEncuentros } from './mundo';
import type { Partida } from './partida';

export type ResultadoRecipiente =
  | { tipo: 'objeto'; objeto: string }
  | { tipo: 'nada' }
  | { tipo: 'mimico'; criatura: Criatura };

export const ESPECIE_MIMICO = 'papemimico';

export const claveRecipiente = (zona: string, id: string) => `${zona}:${id}`;

export function revisado(p: Partida, zona: string, id: string): boolean {
  return p.revisados.includes(claveRecipiente(zona, id));
}

/** Nivel del Papemímico: dos por encima de la criatura más fuerte del equipo y nunca por debajo de la zona. */
export function nivelMimico(p: Partida, encuentros?: TablaEncuentros): number {
  const equipo = Math.max(1, ...p.equipo.map((c) => c.nivel));
  const zona = Math.max(1, ...(encuentros?.especies.map((e) => e.max) ?? [1]));
  return Math.min(100, Math.max(zona, equipo + 2));
}

/** Registra el recipiente (queda marcado) y decide qué hay dentro. */
export function registrarRecipiente(
  p: Partida,
  zona: string,
  id: string,
  op: {
    prob: { objeto: number; nada: number; mimico: number };
    objetos: { objeto: string; peso: number }[];
    encuentros?: TablaEncuentros;
  },
  datos: DatosJuego,
): ResultadoRecipiente {
  if (revisado(p, zona, id)) return { tipo: 'nada' };
  p.revisados.push(claveRecipiente(zona, id));
  const tipos = ['objeto', 'nada', 'mimico'] as const;
  // Sin tabla de objetos en la zona, la parte de «objeto» no puede salir. Sin ninguna criatura
  // en pie, tampoco el Papemímico: no habría con quién luchar.
  const pesoObjeto = op.objetos.length > 0 ? op.prob.objeto : 0;
  const pesoMimico = p.equipo.some((c) => c.vida > 0) ? op.prob.mimico : 0;
  const pesos = [pesoObjeto, op.prob.nada, pesoMimico];
  if (pesos.every((w) => w === 0)) return { tipo: 'nada' };
  const tipo = tipos[elegirPonderado(p.rng, pesos)];
  if (tipo === 'nada') return { tipo: 'nada' };
  if (tipo === 'mimico') {
    const criatura = crearCriatura(datos, ESPECIE_MIMICO, nivelMimico(p, op.encuentros), p.rng, { valia: 10 });
    return { tipo: 'mimico', criatura };
  }
  return { tipo: 'objeto', objeto: op.objetos[elegirPonderado(p.rng, op.objetos.map((o) => o.peso))].objeto };
}
