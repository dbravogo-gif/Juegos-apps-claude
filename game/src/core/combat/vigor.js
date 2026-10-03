import { VIGOR } from '../constants.js';

/**
 * Vigor del día: cuántos combates caben. El día cumplido da margen extra, así que el
 * contenido del juego se abre entrenando y no al revés.
 *
 * @param {boolean} diaCumplido
 */
export function vigorMaximo(diaCumplido) {
  return VIGOR.base + (diaCumplido ? VIGOR.porDiaCumplido : 0);
}

export function costeCombate(esJefe) {
  return esJefe ? VIGOR.coste.jefe : VIGOR.coste.normal;
}

/**
 * Vigor gastado hoy. Cuenta los intentos, no las victorias: si solo contara ganar, perder
 * sería gratis y bastaría con reintentar hasta que la tirada saliera bien.
 *
 * @param {{ jefe?: boolean }[]} combates
 */
export function vigorGastado(combates = []) {
  return combates.reduce((total, c) => total + costeCombate(c.jefe), 0);
}

/**
 * @returns {{ ok: true } | { ok: false, motivo: 'sin_vigor' }}
 */
export function puedeCombatir(combates, diaCumplido, esJefe) {
  const restante = vigorMaximo(diaCumplido) - vigorGastado(combates);
  return restante >= costeCombate(esJefe) ? { ok: true } : { ok: false, motivo: 'sin_vigor' };
}
