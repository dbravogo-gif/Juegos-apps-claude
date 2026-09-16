import { PUNTUACION_COMIDA, EXENCIONES } from '../constants.js';

/**
 * @typedef {'completo'|'excepcion_menor'|'incumplido'} EstadoComida
 * @typedef {{ id: string, estado: EstadoComida, exenta?: boolean }} ComidaRegistrada
 */

/**
 * Puntuación de alimentación del día: media de las comidas registradas.
 * Las comidas exentas se excluyen del cálculo en lugar de puntuar cero.
 * Devuelve `null` si no queda ninguna comida computable (día sin registro o todo exento).
 *
 * @param {ComidaRegistrada[]} comidas
 */
export function puntuarDiaComida(comidas) {
  const computables = comidas.filter((c) => !c.exenta);
  if (computables.length === 0) {
    return { puntuacion: null, comidasComputadas: 0, comidasExentas: comidas.length };
  }
  const suma = computables.reduce((total, c) => total + (PUNTUACION_COMIDA[c.estado] ?? 0), 0);
  return {
    puntuacion: suma / computables.length,
    comidasComputadas: computables.length,
    comidasExentas: comidas.length - computables.length,
  };
}

/** Lunes de la semana natural a la que pertenece una fecha ISO (`YYYY-MM-DD`). */
export function inicioSemana(fechaISO) {
  const fecha = new Date(`${fechaISO}T00:00:00Z`);
  const desplazamiento = (fecha.getUTCDay() + 6) % 7;
  fecha.setUTCDate(fecha.getUTCDate() - desplazamiento);
  return fecha.toISOString().slice(0, 10);
}

/**
 * Exenciones de comida disponibles en la semana natural de `fechaISO`.
 * @param {{ fecha: string, comidas?: ComidaRegistrada[] }[]} dias
 */
export function exencionesComidaDisponibles(dias, fechaISO) {
  const semana = inicioSemana(fechaISO);
  const usadas = dias
    .filter((d) => inicioSemana(d.fecha) === semana)
    .reduce((total, d) => total + (d.comidas ?? []).filter((c) => c.exenta).length, 0);
  return Math.max(0, EXENCIONES.comidaPorSemana - usadas);
}
