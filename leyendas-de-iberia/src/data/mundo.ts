import { entradasDeZonas, type Zona } from '../core/mundo';
import { INICIO, ZONAS_CAPITULO_1 } from './zonas/capitulo1';
import { INICIO_CAPITULO_2, ZONAS_CAPITULO_2 } from './zonas/capitulo2';

export { CASILLAS } from './casillas';
export { ENTRENADORES } from './entrenadores';
export { INICIO } from './zonas/capitulo1';

export { INICIO_CAPITULO_2 } from './zonas/capitulo2';

export const ZONAS: Record<string, Zona> = Object.fromEntries([...ZONAS_CAPITULO_1, ...ZONAS_CAPITULO_2].map((z) => [z.id, z]));

/** Las zonas de cada capítulo, en orden de juego. */
export const CAPITULOS: { nombre: string; zonas: string[] }[] = [
  { nombre: 'Capítulo 1 · Granada, 1492', zonas: ZONAS_CAPITULO_1.map((z) => z.id) },
  { nombre: 'Capítulo 2 · Castilla, 1521', zonas: ZONAS_CAPITULO_2.map((z) => z.id) },
];

/** Por dónde se entra en cada zona (modo desarrollador). */
export const ENTRADAS = entradasDeZonas(ZONAS, [INICIO, INICIO_CAPITULO_2]);
