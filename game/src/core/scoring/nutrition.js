import { PUNTUACION_COMIDA, EXENCIONES } from '../constants.js';

/**
 * @typedef {'completo'|'excepcion_menor'|'incumplido'} EstadoComida
 * @typedef {{ id: string, nombre?: string, estado: EstadoComida|null, exenta?: boolean }} ComidaRegistrada
 */

/**
 * Puntuación de alimentación del día: media de las comidas del plan.
 * Las exentas se excluyen del cálculo en lugar de puntuar cero.
 *
 * Una comida del plan sin marcar se ignora mientras el día sigue abierto —aún puedes
 * comértela— pero cuenta como incumplida en cuanto el día se cierra. Si no, bastaría con
 * marcar solo lo que sale bien y dejar el resto en blanco.
 *
 * @param {ComidaRegistrada[]} comidas
 * @param {{ cerrado?: boolean }} opciones
 */
export function puntuarDiaComida(comidas, { cerrado = false } = {}) {
  const computables = comidas.filter((c) => !c.exenta && (c.estado || cerrado));
  if (computables.length === 0) {
    return { puntuacion: null, comidasComputadas: 0, comidasExentas: comidas.length };
  }

  const suma = computables.reduce((total, c) => total + (PUNTUACION_COMIDA[c.estado] ?? 0), 0);
  return {
    puntuacion: suma / computables.length,
    comidasComputadas: computables.length,
    comidasExentas: comidas.filter((c) => c.exenta).length,
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
