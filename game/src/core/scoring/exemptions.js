import { EXENCIONES } from '../constants.js';

/**
 * @typedef {{ id: string, inicio: string, dias?: number }} Exencion
 */

const DIA_MS = 86400000;

const aFecha = (iso) => new Date(`${iso}T00:00:00Z`);
const aISO = (fecha) => fecha.toISOString().slice(0, 10);

/** Días naturales entre dos fechas ISO (negativo si `b` es anterior a `a`). */
export function diasEntre(a, b) {
  return Math.round((aFecha(b).getTime() - aFecha(a).getTime()) / DIA_MS);
}

export function sumarDias(iso, dias) {
  return aISO(new Date(aFecha(iso).getTime() + dias * DIA_MS));
}

/** Fechas que cubre una exención. */
export function fechasCubiertas(exencion) {
  const dias = exencion.dias ?? EXENCIONES.diasPorExencionEntreno;
  return Array.from({ length: dias }, (_, i) => sumarDias(exencion.inicio, i));
}

/** Conjunto de fechas cubiertas por cualquier exención de entreno. */
export function diasExentos(exenciones) {
  return new Set(exenciones.flatMap(fechasCubiertas));
}

/** Exenciones que quedan en el año natural de `fechaISO`. */
export function exencionesEntrenoDisponibles(exenciones, fechaISO) {
  const anio = fechaISO.slice(0, 4);
  const usadas = exenciones.filter((e) => e.inicio.slice(0, 4) === anio).length;
  return Math.max(0, EXENCIONES.entrenoPorAnio - usadas);
}

/**
 * Comprueba si se puede activar una exención que empieza en `inicio`, estando hoy en `hoy`.
 *
 * Solo se permite hacia delante o con un día de retraso: sin ese límite, se podrían tapar
 * días ya fallados a posteriori y la racha dejaría de significar nada. Tampoco se permite
 * solapar dos exenciones ni gastar más de las que quedan en el año.
 *
 * @returns {{ ok: boolean, motivo?: string }}
 */
export function puedeActivarExencion(exenciones, inicio, hoy) {
  const desfase = diasEntre(hoy, inicio);
  if (desfase < -1) return { ok: false, motivo: 'retroactiva' };
  if (exencionesEntrenoDisponibles(exenciones, inicio) === 0) {
    return { ok: false, motivo: 'sin_exenciones' };
  }

  const ocupadas = diasExentos(exenciones);
  const solapa = fechasCubiertas({ inicio }).some((f) => ocupadas.has(f));
  if (solapa) return { ok: false, motivo: 'solapada' };

  return { ok: true };
}
