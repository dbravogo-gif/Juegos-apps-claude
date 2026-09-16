import { RECOMPENSA_BASE, UMBRAL_EXTRAS, TOPE_EXTRAS, FACTOR_REVENTA } from '../constants.js';

function aplicar(base, factor, multiplicador) {
  return {
    xp: Math.round(base.xp * factor * multiplicador),
    monedas: Math.round(base.monedas * factor * multiplicador),
  };
}

/**
 * Recompensa de un día por actividad real, ya multiplicada por las rachas.
 *
 * @param {{ cumplimientoEntreno?: number|null, puntuacionComida?: number|null, multiplicador?: number }} dia
 */
export function recompensaDelDia({ cumplimientoEntreno, puntuacionComida, multiplicador = 1 }) {
  const entreno =
    typeof cumplimientoEntreno === 'number'
      ? aplicar(RECOMPENSA_BASE.entreno, cumplimientoEntreno, multiplicador)
      : { xp: 0, monedas: 0 };
  const comida =
    typeof puntuacionComida === 'number'
      ? aplicar(RECOMPENSA_BASE.comida, puntuacionComida, multiplicador)
      : { xp: 0, monedas: 0 };

  return {
    entreno,
    comida,
    total: { xp: entreno.xp + comida.xp, monedas: entreno.monedas + comida.monedas },
  };
}

/**
 * Techo de lo que las actividades del juego (talar, cocinar, combates opcionales) pueden
 * aportar ese día. Solo se abre si el día alcanza el umbral en entreno o en comida: sin
 * actividad real registrada no hay extras.
 *
 * @param {{ cumplimientoEntreno?: number|null, puntuacionComida?: number|null }} dia
 * @param {{ xp: number, monedas: number }} totalDelDia
 */
export function presupuestoExtras({ cumplimientoEntreno, puntuacionComida }, totalDelDia) {
  const desbloqueado =
    cumplimientoEntreno >= UMBRAL_EXTRAS || puntuacionComida >= UMBRAL_EXTRAS;
  if (!desbloqueado) return { desbloqueado: false, xp: 0, monedas: 0 };

  return {
    desbloqueado: true,
    xp: Math.floor(totalDelDia.xp * TOPE_EXTRAS),
    monedas: Math.floor(totalDelDia.monedas * TOPE_EXTRAS),
  };
}

/** Recorta una recompensa de extra al presupuesto que queda ese día. */
export function otorgarExtra(presupuesto, gastado, recompensa) {
  const xp = Math.max(0, Math.min(recompensa.xp, presupuesto.xp - gastado.xp));
  const monedas = Math.max(0, Math.min(recompensa.monedas, presupuesto.monedas - gastado.monedas));
  return { xp, monedas, recortado: xp < recompensa.xp || monedas < recompensa.monedas };
}

/** Lo que devuelve vender un objeto comprado por `precio`. */
export function valorReventa(precio) {
  return Math.floor(precio * FACTOR_REVENTA);
}
