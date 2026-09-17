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
 * Se puntúa contra la rutina entera, no contra lo que se haya tocado. Un ejercicio sin
 * marcar se ignora mientras el día sigue abierto —aún puedes hacerlo— y cuenta como omitido
 * al cerrarse. Sin esa regla bastaría con registrar el ejercicio fácil y dejar el resto en
 * blanco para firmar un 100 % de cumplimiento.
 *
 * @param {EjercicioRegistrado[]} ejercicios
 * @param {{ cerrado?: boolean }} opciones
 */
export function puntuarEntreno(todos, { cerrado = false } = {}) {
  const ejercicios = todos
    .filter((e) => e.estado || cerrado)
    .map((e) => (e.estado ? e : { ...e, estado: 'omitido' }));
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

/**
 * Estado que corresponde a un ejercicio según las series que se hayan completado.
 * Devuelve `null` cuando no hay ninguna: un ejercicio sin tocar no es "omitido" todavía,
 * simplemente no está registrado, y el motor ya trata el día entero según el plan.
 *
 * @param {number} objetivo series previstas en la rutina
 * @param {{ hecha?: boolean }[]} series series anotadas ese día
 */
export function estadoPorSeries(objetivo, series = []) {
  const hechas = series.filter((s) => s.hecha).length;
  if (hechas === 0) return null;
  return hechas >= Math.max(1, objetivo) ? 'completado' : 'parcial';
}
