import type { DatosJuego } from '../core/modelo';
import { ESPECIES } from './especies';
import { MOVIMIENTOS } from './movimientos';
import { OBJETOS } from './objetos';
import { TEMPERAMENTOS } from './temperamentos';
import { TABLA_TIPOS } from './tipos';

/** Todo el contenido del juego. El motor lo recibe como parámetro. */
export const DATOS: DatosJuego = {
  especies: ESPECIES,
  movimientos: MOVIMIENTOS,
  temperamentos: TEMPERAMENTOS,
  tipos: TABLA_TIPOS,
  objetos: OBJETOS,
};
