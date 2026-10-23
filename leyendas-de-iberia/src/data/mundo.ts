import type { Zona } from '../core/mundo';
import { ZONAS_CAPITULO_1 } from './zonas/capitulo1';

export { CASILLAS } from './casillas';
export { ENTRENADORES } from './entrenadores';
export { INICIO } from './zonas/capitulo1';

export const ZONAS: Record<string, Zona> = Object.fromEntries(ZONAS_CAPITULO_1.map((z) => [z.id, z]));
