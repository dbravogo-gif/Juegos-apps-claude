import {
  UMBRAL_DIA_CUMPLIDO,
  VENTANA_RACHA,
  DIAS_FALLO_PERMITIDOS,
  BONUS_RACHA,
  BONUS_COMBINADO,
  RETENCION_AL_ROMPER,
} from '../constants.js';

/**
 * @typedef {'cumplido'|'fallado'|'no_exigido'} EstadoDia
 * @typedef {{
 *   fecha: string,
 *   planEntreno: 'entreno'|'descanso',
 *   exencionEntreno?: boolean,
 *   entreno?: { cumplimiento: number|null } | null,
 *   comida?: { puntuacion: number|null, comidasExentas?: number } | null,
 * }} DiaHistorial
 */

/** @returns {EstadoDia} */
export function clasificarEntreno(dia) {
  if (dia.planEntreno === 'descanso' || dia.exencionEntreno) return 'no_exigido';
  if (!dia.entreno) return 'fallado';
  // Sesión adaptada por completo (todo justificado): ni cuenta ni penaliza.
  if (dia.entreno.cumplimiento === null) return 'no_exigido';
  return dia.entreno.cumplimiento >= UMBRAL_DIA_CUMPLIDO.entreno ? 'cumplido' : 'fallado';
}

/** @returns {EstadoDia} */
export function clasificarComida(dia) {
  if (!dia.comida) return 'fallado';
  if (dia.comida.puntuacion === null) {
    return dia.comida.comidasExentas > 0 ? 'no_exigido' : 'fallado';
  }
  return dia.comida.puntuacion >= UMBRAL_DIA_CUMPLIDO.comida ? 'cumplido' : 'fallado';
}

/**
 * Mínimo de días cumplidos que la ventana debe contener para que la racha siga viva.
 * Sin esto, un plan con todos los días marcados como descanso mantendría la racha —y su
 * bonus— sin haber entrenado nunca.
 */
function minimoCumplidos(ventanaDias) {
  const exigidos = ventanaDias.filter(
    (d) => d.planEntreno === 'entreno' && !d.exencionEntreno,
  ).length;
  return Math.max(1, Math.min(2, exigidos - DIAS_FALLO_PERMITIDOS));
}

/**
 * Recorre el historial en orden y devuelve el estado de la racha al final.
 * La ventana móvil de 7 días admite `DIAS_FALLO_PERMITIDOS` fallos; los días no exigidos
 * (descanso planificado, exención, sesión adaptada) no consumen ese margen, pero tampoco
 * bastan por sí solos: la ventana necesita días cumplidos de verdad.
 * Al romperse, la racha se reduce una sola vez y se congela hasta que vuelve a estar activa.
 *
 * @param {DiaHistorial[]} dias ordenados de más antiguo a más reciente
 * @param {(dia: DiaHistorial) => EstadoDia} clasificar
 */
export function calcularRacha(dias, clasificar) {
  const estados = dias.map(clasificar);
  let longitud = 0;
  let activa = false;

  estados.forEach((_, i) => {
    const desde = Math.max(0, i - VENTANA_RACHA + 1);
    const ventana = estados.slice(desde, i + 1);
    const fallos = ventana.filter((e) => e === 'fallado').length;
    const cumplidos = ventana.filter((e) => e === 'cumplido').length;
    const activaAhora =
      fallos <= DIAS_FALLO_PERMITIDOS && cumplidos >= minimoCumplidos(dias.slice(desde, i + 1));

    if (activaAhora) longitud += 1;
    else if (activa) longitud = Math.floor(longitud * RETENCION_AL_ROMPER);

    activa = activaAhora;
  });

  return { activa, longitud, semanas: Math.floor(longitud / VENTANA_RACHA) };
}

function bonusDe(racha, escalones) {
  if (!racha.activa) return 0;
  return escalones[Math.min(racha.semanas, escalones.length - 1)];
}

/**
 * Multiplicador aditivo con tope: 1 + bonus entreno + bonus comida + bonus combinado.
 * Nunca se multiplican bonus entre sí para que la economía no se dispare.
 *
 * @param {DiaHistorial[]} dias
 */
export function calcularMultiplicador(dias) {
  const entreno = calcularRacha(dias, clasificarEntreno);
  const comida = calcularRacha(dias, clasificarComida);

  const bonusEntreno = bonusDe(entreno, BONUS_RACHA.entreno);
  const bonusComida = bonusDe(comida, BONUS_RACHA.comida);
  const ambasConSemana =
    entreno.activa && comida.activa && entreno.semanas >= 1 && comida.semanas >= 1;
  const bonusCombinado = ambasConSemana ? BONUS_COMBINADO : 0;

  return {
    entreno,
    comida,
    bonusEntreno,
    bonusComida,
    bonusCombinado,
    multiplicador: Math.round((1 + bonusEntreno + bonusComida + bonusCombinado) * 100) / 100,
  };
}
