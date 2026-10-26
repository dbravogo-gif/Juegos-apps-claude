// Consultas sobre las pasivas y las inmunidades a estados. Las usan el combate, el cálculo de
// daño y la IA.

import type { Criatura, DatosJuego, EfectoPasiva, EstadoAlterado, EstadoCriatura, EstadoVolatil, Pasiva } from './modelo';
import { entero, type EstadoRng } from './rng';

export function pasivaDe(c: Criatura, datos: DatosJuego): Pasiva | null {
  const id = datos.especies[c.especie]?.pasiva;
  return id ? (datos.pasivas[id] ?? null) : null;
}

/** El efecto de su pasiva si es de ese tipo. */
export function pasivaTipo<T extends EfectoPasiva['tipo']>(
  c: Criatura,
  datos: DatosJuego,
  tipo: T,
): Extract<EfectoPasiva, { tipo: T }> | null {
  const ef = pasivaDe(c, datos)?.efecto;
  return ef?.tipo === tipo ? (ef as Extract<EfectoPasiva, { tipo: T }>) : null;
}

/** Tipos que no pueden sufrir un estado, como en el género: el fuego no se quema, etc. */
const INMUNIDAD_TIPO: Partial<Record<EstadoAlterado | EstadoVolatil, string>> = {
  quemado: 'infernal',
  paralizado: 'electrico',
  envenenado: 'acero',
  intoxicado: 'acero',
};

/** No puede sufrir ese estado por su tipo o por su pasiva (sin contar si ya tiene otro). */
export function inmuneAEstado(c: Criatura, estado: EstadoAlterado | EstadoVolatil, datos: DatosJuego): boolean {
  const tipo = INMUNIDAD_TIPO[estado];
  if (tipo && datos.especies[c.especie].tipos.includes(tipo)) return true;
  return pasivaTipo(c, datos, 'inmuneEstado')?.estados.includes(estado) ?? false;
}

/** Puede recibir ahora ese estado alterado. */
export function puedeSufrir(c: Criatura, estado: EstadoAlterado, datos: DatosJuego): boolean {
  return c.vida > 0 && c.estado === null && !inmuneAEstado(c, estado, datos);
}

/** Los ataques de ese tipo no le hacen nada por su pasiva (Ingrávido, Esponja…). */
export function anulaTipo(c: Criatura, tipoMov: string, datos: DatosJuego): boolean {
  const ef = pasivaDe(c, datos)?.efecto;
  return !!tipoMov && (ef?.tipo === 'absorber' || ef?.tipo === 'inmuneTipo') && ef.tipoMov === tipoMov;
}

export function nuevoEstado(estado: EstadoAlterado, rng: EstadoRng): EstadoCriatura {
  if (estado === 'dormido') return { tipo: 'dormido', turnos: entero(rng, 1, 3) };
  if (estado === 'intoxicado') return { tipo: 'intoxicado', turnos: 1 };
  return { tipo: estado };
}
