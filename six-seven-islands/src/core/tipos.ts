// Eficacia de los tipos. La tabla es dato (src/data/tipos.ts).

import type { DefTablaTipos } from './modelo';

/** Multiplicador de un tipo atacante contra un tipo defensor: 0, 0,5, 1 o 2. */
export function multiplicadorTipo(def: DefTablaTipos, atacante: string, defensor: string): number {
  const r = def.relaciones[atacante];
  if (!r) return 1;
  if (r.sinEfecto.includes(defensor)) return 0;
  if (r.eficaz.includes(defensor)) return 2;
  if (r.pocoEficaz.includes(defensor)) return 0.5;
  return 1;
}

/** Contra una criatura de uno o dos tipos: ×4, ×2, ×1, ×0,5, ×0,25 o ×0. */
export function eficacia(def: DefTablaTipos, tipoAtaque: string, tiposDefensor: readonly string[]): number {
  return tiposDefensor.reduce((acc, t) => acc * multiplicadorTipo(def, tipoAtaque, t), 1);
}
