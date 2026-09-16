import {
  RECOMPENSA_BASE,
  UMBRAL_EXTRAS,
  UMBRAL_DIA_CUMPLIDO,
  FACTOR_DIA_FALLADO,
  MARGEN_MEJORA,
  TOPE_EXTRAS,
  FACTOR_REVENTA,
} from '../constants.js';

/**
 * Los días cumplidos rinden proporcionalmente; los que se quedan por debajo del umbral
 * rinden la mitad. Así abandonar la sesión a medias cuesta de verdad, mientras que quien
 * se queda justo por encima del umbral cobra entero.
 */
export function factorRecompensa(cumplimiento, umbral) {
  return cumplimiento >= umbral ? cumplimiento : cumplimiento * FACTOR_DIA_FALLADO;
}

function aplicar(base, cumplimiento, umbral, multiplicador) {
  const factor = factorRecompensa(cumplimiento, umbral);
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
      ? aplicar(RECOMPENSA_BASE.entreno, cumplimientoEntreno, UMBRAL_DIA_CUMPLIDO.entreno, multiplicador)
      : { xp: 0, monedas: 0 };
  const comida =
    typeof puntuacionComida === 'number'
      ? aplicar(RECOMPENSA_BASE.comida, puntuacionComida, UMBRAL_DIA_CUMPLIDO.comida, multiplicador)
      : { xp: 0, monedas: 0 };

  return {
    entreno,
    comida,
    total: { xp: entreno.xp + comida.xp, monedas: entreno.monedas + comida.monedas },
  };
}

const diaCumplido = (valor, umbral) => typeof valor === 'number' && valor >= umbral;

function mejoraSobreLaPropiaMedia(valor, media, umbral) {
  return diaCumplido(valor, umbral) && typeof media === 'number' && valor >= media + MARGEN_MEJORA;
}

/**
 * Techo de lo que las actividades del juego (talar, cocinar, combates opcionales) pueden
 * aportar ese día. Se abre por tres vías, todas ellas exigiendo haber hecho las cosas bien:
 *
 * - `excelente`: día por encima del 85 %.
 * - `constancia`: día cumplido con la racha viva. Quien se mantiene estable en un 80 % no
 *   mejora nunca su propia media, y sin esta vía el contenido del juego le quedaría vedado.
 * - `mejora`: día cumplido que supera la media reciente del propio usuario, para quien aún
 *   no tiene racha pero está progresando.
 *
 * El suelo nunca baja del umbral de día cumplido, así que dejarse ir para rebajar la media
 * no abre nada.
 *
 * @param {{ cumplimientoEntreno?: number|null, puntuacionComida?: number|null, mediaEntreno?: number|null, mediaComida?: number|null, rachaEntrenoActiva?: boolean, rachaComidaActiva?: boolean }} dia
 * @param {{ xp: number, monedas: number }} totalDelDia
 */
export function presupuestoExtras(dia, totalDelDia) {
  const {
    cumplimientoEntreno,
    puntuacionComida,
    mediaEntreno,
    mediaComida,
    rachaEntrenoActiva,
    rachaComidaActiva,
  } = dia;

  const entrenoCumplido = diaCumplido(cumplimientoEntreno, UMBRAL_DIA_CUMPLIDO.entreno);
  const comidaCumplida = diaCumplido(puntuacionComida, UMBRAL_DIA_CUMPLIDO.comida);

  const excelente = cumplimientoEntreno >= UMBRAL_EXTRAS || puntuacionComida >= UMBRAL_EXTRAS;
  const constancia =
    (entrenoCumplido && rachaEntrenoActiva) || (comidaCumplida && rachaComidaActiva);
  const mejora =
    mejoraSobreLaPropiaMedia(cumplimientoEntreno, mediaEntreno, UMBRAL_DIA_CUMPLIDO.entreno) ||
    mejoraSobreLaPropiaMedia(puntuacionComida, mediaComida, UMBRAL_DIA_CUMPLIDO.comida);

  const via = excelente ? 'excelente' : constancia ? 'constancia' : mejora ? 'mejora' : null;
  if (!via) return { desbloqueado: false, via: null, xp: 0, monedas: 0 };

  return {
    desbloqueado: true,
    via,
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
