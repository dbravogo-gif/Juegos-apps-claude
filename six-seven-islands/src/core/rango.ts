// El rango de una especie, para que una criatura mejor suene más épica al aparecer y al salir del
// cubo, y las legendarias con su propio sonido (autor, 2026-11-27). Sale de la experiencia base, que
// herramientas/criaturas/juego.py da por quintil (Q1 55, Q2 75, Q3 140, Q4 170, Q5 250); las
// iniciales tienen 60, 140 y 240 según la forma (rangos 1, 3 y 4).
import type { Especie } from './modelo';

export type Rango = 1 | 2 | 3 | 4 | 5 | 'leyenda';

export const RANGOS: readonly Rango[] = [1, 2, 3, 4, 5, 'leyenda'];

export function rangoDe(e: Pick<Especie, 'expBase' | 'legendaria'>): Rango {
  if (e.legendaria) return 'leyenda';
  if (e.expBase >= 250) return 5;
  if (e.expBase >= 170) return 4;
  if (e.expBase >= 140) return 3;
  if (e.expBase >= 75) return 2;
  return 1;
}
