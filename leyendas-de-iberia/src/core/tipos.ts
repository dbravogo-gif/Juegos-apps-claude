import type { DefTablaTipos } from './modelo';

type Matriz = Map<string, number>;

const cache = new WeakMap<DefTablaTipos, Matriz>();

function clave(atacante: string, defensor: string): string {
  return `${atacante}>${defensor}`;
}

function construir(def: DefTablaTipos): Matriz {
  const m: Matriz = new Map();
  // Reverso de cada relación eficaz: poco eficaz. Va primero para que una relación eficaz
  // explícita en el otro sentido la pise.
  for (const [at, de] of def.eficaces) {
    if (at !== de) m.set(clave(de, at), 0.5);
  }
  for (const [at, de] of def.eficaces) m.set(clave(at, de), 2);
  for (const [at, de] of def.inmunidades) m.set(clave(at, de), 0);
  return m;
}

/** Multiplicador de un tipo de ataque contra un tipo defensor: 0, 0,5, 1 o 2. */
export function multiplicadorTipo(def: DefTablaTipos, atacante: string, defensor: string): number {
  if (!atacante) return 1;
  let m = cache.get(def);
  if (!m) {
    m = construir(def);
    cache.set(def, m);
  }
  return m.get(clave(atacante, defensor)) ?? 1;
}

/** Multiplicador contra una criatura de uno o dos tipos. */
export function eficacia(def: DefTablaTipos, tipoAtaque: string, tiposDefensor: readonly string[]): number {
  return tiposDefensor.reduce((acc, t) => acc * multiplicadorTipo(def, tipoAtaque, t), 1);
}
