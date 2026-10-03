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
 * @typedef {'entreno'|'descanso'|'otra'|'sin_decidir'} TipoSesion
 * @typedef {{
 *   fecha: string,
 *   sesion: TipoSesion,
 *   exencionEntreno?: boolean,
 *   entreno?: { cumplimiento: number|null } | null,
 *   comida?: { puntuacion: number|null, comidasExentas?: number } | null,
 * }} DiaHistorial
 */

/**
 * Los días que no son sesión de gimnasio —descanso, otra actividad, o sin decidir— no se
 * exigen: no gastan el margen de fallo. Quien deja de abrir la app no se escapa por ahí,
 * porque la ventana sigue necesitando su cuota de días cumplidos.
 *
 * @returns {EstadoDia}
 */
export function clasificarEntreno(dia) {
  if (dia.sesion !== 'entreno' || dia.exencionEntreno) return 'no_exigido';
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
 * Días cumplidos que una ventana debe contener para que la racha de entreno siga viva.
 * Sale del compromiso semanal: con 4 días por semana, la ventana completa necesita 3.
 *
 * Es lo que sostiene la racha ahora que no hay días fijos en el calendario. Sin esta cuota
 * bastaría con marcar descanso —o no marcar nada— para mantenerla sin entrenar nunca.
 *
 * Se escala al tamaño real de la ventana porque los primeros días del historial tienen
 * menos de siete: exigir tres sesiones en una ventana de dos días sería imposible de
 * cumplir y nadie llegaría a tener racha.
 */
export function minimoCumplidosEntreno(diasPorSemana, largoVentana = VENTANA_RACHA) {
  const comprometidos = Math.min(VENTANA_RACHA, Math.max(1, diasPorSemana));
  const exigidos = Math.ceil((comprometidos * largoVentana) / VENTANA_RACHA);
  return Math.max(1, exigidos - DIAS_FALLO_PERMITIDOS);
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
 * @param {{ minimoCumplidos?: (largoVentana: number) => number }} opciones
 */
export function calcularRacha(dias, clasificar, { minimoCumplidos = () => 1 } = {}) {
  const estados = dias.map(clasificar);
  let longitud = 0;
  let activa = false;

  estados.forEach((_, i) => {
    const desde = Math.max(0, i - VENTANA_RACHA + 1);
    const ventana = estados.slice(desde, i + 1);
    const fallos = ventana.filter((e) => e === 'fallado').length;
    const cumplidos = ventana.filter((e) => e === 'cumplido').length;
    const activaAhora = fallos <= DIAS_FALLO_PERMITIDOS && cumplidos >= minimoCumplidos(ventana.length);

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
 * @param {{ diasPorSemana?: number }} opciones compromiso semanal de entrenos
 */
export function calcularMultiplicador(dias, { diasPorSemana = 4 } = {}) {
  const entreno = calcularRacha(dias, clasificarEntreno, {
    minimoCumplidos: (largo) => minimoCumplidosEntreno(diasPorSemana, largo),
  });
  // La comida se exige todos los días, así que ahí el margen de fallos ya hace el trabajo.
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
