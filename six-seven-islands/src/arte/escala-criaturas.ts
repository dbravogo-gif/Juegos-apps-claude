// Escala de las criaturas (ARTE.md, «Escala de las criaturas»): cada una se ve según su altura, con
// la diferencia comprimida para que un renacuajo y un dragón quepan los dos en el mismo combate.
// Puro y sin Three: lo prueban los tests.

/** La altura que se ve al tamaño de siempre (el que tenían todas antes de tener altura). */
export const ALTURA_REFERENCIA = 0.6;
/** Ni la más pequeña baja de esto ni la más grande pasa de esto, respecto al tamaño de siempre. */
export const ESCALA_MINIMA = 0.6;
export const ESCALA_MAXIMA = 2;

/**
 * Por cuánto multiplicar el tamaño de siempre: con la raíz cuadrada de la altura, una de 0,3 m frente
 * a una de 3 m se ve 1 a 3 en vez de 1 a 10. Sin altura, el tamaño de siempre.
 */
export function escalaPorAltura(altura?: number): number {
  if (!altura || altura <= 0) return 1;
  return Math.min(ESCALA_MAXIMA, Math.max(ESCALA_MINIMA, Math.sqrt(altura / ALTURA_REFERENCIA)));
}
