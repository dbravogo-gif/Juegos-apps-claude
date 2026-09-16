import { puntuarEntreno } from '../core/scoring/workout.js';
import { puntuarDiaComida } from '../core/scoring/nutrition.js';
import { sumarDias, diasEntre } from '../core/scoring/exemptions.js';

/** Índice del día de la semana con el lunes como 0, igual que `plan.diasEntreno`. */
export function diaDeLaSemana(fechaISO) {
  return (new Date(`${fechaISO}T00:00:00Z`).getUTCDay() + 6) % 7;
}

export function planDelDia(plan, fechaISO) {
  return plan.diasEntreno.includes(diaDeLaSemana(fechaISO)) ? 'entreno' : 'descanso';
}

/**
 * Convierte un registro crudo en el día que consume el motor de puntuación.
 * Un día sin sesión registrada deja `entreno: null`, que el motor trata como fallado si
 * estaba planificado; los días de descanso no se exigen.
 */
export function evaluarDia(registro, planEntreno, fecha) {
  const ejercicios = registro?.ejercicios ?? [];
  const comidas = registro?.comidas ?? [];

  return {
    fecha,
    planEntreno: registro?.planEntreno ?? planEntreno,
    entreno: ejercicios.length > 0 ? puntuarEntreno(ejercicios) : null,
    comida: comidas.length > 0 ? puntuarDiaComida(comidas) : null,
    extras: registro?.extras ?? [],
  };
}

/**
 * Historial continuo desde el primer registro hasta `hoy`, rellenando los días en los que
 * no se abrió la app. Sin ese relleno, dejar de registrar durante una semana no rompería
 * ninguna racha: los huecos simplemente no existirían.
 *
 * @param {{ plan: { diasEntreno: number[] }, dias: Record<string, object> }} db
 * @param {string} hoy fecha ISO
 */
export function construirHistorial(db, hoy) {
  const fechas = Object.keys(db.dias).sort();
  const primera = fechas[0] ?? hoy;
  if (diasEntre(primera, hoy) < 0) return [];

  const historial = [];
  for (let fecha = primera; diasEntre(fecha, hoy) >= 0; fecha = sumarDias(fecha, 1)) {
    historial.push(evaluarDia(db.dias[fecha], planDelDia(db.plan, fecha), fecha));
  }
  return historial;
}
