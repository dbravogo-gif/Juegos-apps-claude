import { calcularMultiplicador } from './scoring/streaks.js';
import { recompensaDelDia, presupuestoExtras } from './economy/rewards.js';
import { VENTANA_MEDIA_RECIENTE, MIN_REGISTROS_PARA_MEDIA } from './constants.js';

/**
 * Media de los días anteriores a `indice` (el día que se cierra no entra: uno se compara
 * con su pasado). Devuelve `null` mientras no haya registros suficientes para que la media
 * signifique algo.
 */
export function mediaReciente(historial, indice, extraer) {
  const desde = Math.max(0, indice - VENTANA_MEDIA_RECIENTE);
  const valores = historial
    .slice(desde, indice)
    .map(extraer)
    .filter((v) => typeof v === 'number');

  if (valores.length < MIN_REGISTROS_PARA_MEDIA) return null;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

const cumplimientoEntrenoDe = (dia) => (dia.entreno ? dia.entreno.cumplimiento : null);
const puntuacionComidaDe = (dia) => (dia.comida ? dia.comida.puntuacion : null);

/**
 * Cierre de un día: rachas con el historial disponible hasta esa fecha, recompensa
 * resultante y techo de extras. La app y las simulaciones usan esta misma entrada.
 *
 * @param {import('./scoring/streaks.js').DiaHistorial[]} historial ordenado por fecha
 * @param {number} indice día que se cierra
 */
export function resumenDelDia(historial, indice) {
  const hastaHoy = historial.slice(0, indice + 1);
  const dia = historial[indice];
  const rachas = calcularMultiplicador(hastaHoy);

  const cumplimientoEntreno = cumplimientoEntrenoDe(dia);
  const puntuacionComida = puntuacionComidaDe(dia);

  const recompensa = recompensaDelDia({
    cumplimientoEntreno,
    puntuacionComida,
    multiplicador: rachas.multiplicador,
  });

  const extras = presupuestoExtras(
    {
      cumplimientoEntreno,
      puntuacionComida,
      mediaEntreno: mediaReciente(historial, indice, cumplimientoEntrenoDe),
      mediaComida: mediaReciente(historial, indice, puntuacionComidaDe),
      rachaEntrenoActiva: rachas.entreno.activa,
      rachaComidaActiva: rachas.comida.activa,
    },
    recompensa.total,
  );

  return { fecha: dia.fecha, rachas, recompensa, extras };
}
