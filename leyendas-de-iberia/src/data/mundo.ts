import type { Zona } from '../core/mundo';
import { ZONAS_CAPITULO_1 } from './zonas/capitulo1';
import { ZONAS_CAPITULO_2 } from './zonas/capitulo2';

export { CASILLAS } from './casillas';
export { ENTRENADORES } from './entrenadores';
export { INICIO } from './zonas/capitulo1';

export { INICIO_CAPITULO_2 } from './zonas/capitulo2';

export const ZONAS: Record<string, Zona> = Object.fromEntries([...ZONAS_CAPITULO_1, ...ZONAS_CAPITULO_2].map((z) => [z.id, z]));
