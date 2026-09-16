import { calcularMultiplicador } from './scoring/streaks.js';
import { recompensaDelDia, presupuestoExtras } from './economy/rewards.js';

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

  const cumplimientoEntreno = dia.entreno ? dia.entreno.cumplimiento : null;
  const puntuacionComida = dia.comida ? dia.comida.puntuacion : null;

  const recompensa = recompensaDelDia({
    cumplimientoEntreno,
    puntuacionComida,
    multiplicador: rachas.multiplicador,
  });

  return {
    fecha: dia.fecha,
    rachas,
    recompensa,
    extras: presupuestoExtras({ cumplimientoEntreno, puntuacionComida }, recompensa.total),
  };
}
