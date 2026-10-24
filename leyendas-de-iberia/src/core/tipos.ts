import type { DefTablaTipos } from './modelo';

/** Multiplicador de un tipo de ataque contra un tipo defensor: 0, 0,5, 1 o 2. */
export function multiplicadorTipo(def: DefTablaTipos, atacante: string, defensor: string): number {
  const r = def.relaciones[atacante];
  if (!r) return 1;
  if (r.sinEfecto.includes(defensor)) return 0;
  if (r.eficaz.includes(defensor)) return 2;
  if (r.pocoEficaz.includes(defensor)) return 0.5;
  return 1;
}

/** Multiplicador contra una criatura de uno o dos tipos: ×4, ×2, ×1, ×0,5, ×0,25 o ×0. */
export function eficacia(def: DefTablaTipos, tipoAtaque: string, tiposDefensor: readonly string[]): number {
  return tiposDefensor.reduce((acc, t) => acc * multiplicadorTipo(def, tipoAtaque, t), 1);
}

export interface ResumenTipo {
  ataque: { eficaz: string[]; pocoEficaz: string[]; sinEfecto: string[] };
  defensa: { debil: string[]; resiste: string[]; inmune: string[] };
}

/** Qué hace un tipo al atacar y qué le hacen los demás al defenderse. */
export function resumenTipo(def: DefTablaTipos, tipo: string): ResumenTipo {
  const ids = def.tipos.map((t) => t.id);
  const contra = (m: number) => ids.filter((d) => multiplicadorTipo(def, tipo, d) === m);
  const recibe = (m: number) => ids.filter((a) => multiplicadorTipo(def, a, tipo) === m);
  return {
    ataque: { eficaz: contra(2), pocoEficaz: contra(0.5), sinEfecto: contra(0) },
    defensa: { debil: recibe(2), resiste: recibe(0.5), inmune: recibe(0) },
  };
}

/** Multiplicador de cada tipo atacante contra una especie de uno o dos tipos (solo los que no son ×1). */
export function debilidades(def: DefTablaTipos, tiposDefensor: readonly string[]): { tipo: string; multiplicador: number }[] {
  return def.tipos
    .map((t) => ({ tipo: t.id, multiplicador: eficacia(def, t.id, tiposDefensor) }))
    .filter((x) => x.multiplicador !== 1)
    .sort((a, b) => b.multiplicador - a.multiplicador);
}
