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

/** Los tipos atacantes agrupados por lo que le hacen a una criatura: para la ayuda del combate. */
export interface GruposEficacia {
  /** ×2 o ×4. */
  mucho: string[];
  /** ×0,5 o ×0,25. */
  poco: string[];
  /** ×0. */
  nada: string[];
}

/**
 * Qué tipos le hacen mucho, poco o nada a una criatura de estos tipos (autor, 2026-11-15: que sea
 * fácil ver la tabla de tipos en pleno combate). Los de ×1 no salen.
 */
export function gruposContra(def: DefTablaTipos, tiposDefensor: readonly string[]): GruposEficacia {
  const g: GruposEficacia = { mucho: [], poco: [], nada: [] };
  for (const t of def.tipos) {
    const e = eficacia(def, t.id, tiposDefensor);
    if (e === 0) g.nada.push(t.id);
    else if (e > 1) g.mucho.push(t.id);
    else if (e < 1) g.poco.push(t.id);
  }
  return g;
}

/** La etiqueta corta de un multiplicador, para el botón de cada ataque. */
export function etiquetaEficacia(e: number): { texto: string; clase: 'mucho' | 'poco' | 'nada' | 'normal' } {
  if (e === 0) return { texto: '×0 No le afecta', clase: 'nada' };
  if (e >= 4) return { texto: '×4 Muy eficaz', clase: 'mucho' };
  if (e > 1) return { texto: '×2 Muy eficaz', clase: 'mucho' };
  if (e <= 0.25) return { texto: '×¼ Poco eficaz', clase: 'poco' };
  if (e < 1) return { texto: '×½ Poco eficaz', clase: 'poco' };
  return { texto: '×1', clase: 'normal' };
}
