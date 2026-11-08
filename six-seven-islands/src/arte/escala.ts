// La escala del mundo en 3D: una casilla mide 1 unidad y cada escalón de altura, media. Lo usan
// «mundo» (el terreno) y «personaje» (dónde pisa cada uno), para que coincidan.

/** Altura de un escalón, en unidades. */
export const ESCALON = 0.5;
/** El mar está a esta altura; el suelo a nivel 0 queda un poco por encima. */
export const NIVEL_MAR = 0;
/** Fondo del diorama: hasta aquí bajan los cantos de la isla. */
export const FONDO = -1.6;

/** Altura de la superficie que se pisa en una casilla de altura `h`. */
export function alturaSuelo(h: number): number {
  return NIVEL_MAR + 0.25 + h * ESCALON;
}
