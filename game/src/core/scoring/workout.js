import { PESOS_EJERCICIO, FACTOR_ESTADO, MAX_PESO_JUSTIFICADO } from '../constants.js';

/**
 * @typedef {'principal'|'secundario'|'opcional'} Importancia
 * @typedef {'completado'|'sustituido'|'parcial'|'justificado'|'omitido'} EstadoEjercicio
 * @typedef {{ id: string, importancia: Importancia, estado: EstadoEjercicio }} EjercicioRegistrado
 */

/**
 * Cumplimiento ponderado de una sesión.
 * Devuelve `cumplimiento: null` cuando no queda nada exigible (sesión adaptada):
 * ese día no puntúa pero tampoco rompe la racha.
 *
 * @param {EjercicioRegistrado[]} ejercicios
 */
export function puntuarEntreno(ejercicios) {
  const pesos = ejercicios.map((e) => PESOS_EJERCICIO[e.importancia] ?? 0);
  const pesoTotal = pesos.reduce((a, b) => a + b, 0);
  const cupoJustificado = pesoTotal * MAX_PESO_JUSTIFICADO;

  let pesoJustificado = 0;
  let numerador = 0;
  let denominador = 0;
  const excedidos = [];

  ejercicios.forEach((ejercicio, i) => {
    const peso = pesos[i];
    if (ejercicio.estado === 'justificado' && pesoJustificado + peso <= cupoJustificado) {
      pesoJustificado += peso;
      return;
    }
    if (ejercicio.estado === 'justificado') excedidos.push(ejercicio.id);
    denominador += peso;
    numerador += peso * (FACTOR_ESTADO[ejercicio.estado] ?? 0);
  });

  return {
    cumplimiento: denominador > 0 ? numerador / denominador : null,
    pesoTotal,
    pesoJustificado,
    justificadosExcedidos: excedidos,
  };
}
