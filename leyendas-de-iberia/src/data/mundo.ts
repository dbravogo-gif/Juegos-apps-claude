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

/**
 * Regalos de la historia añadidos después de que alguien pasara por allí: al cargar la partida,
 * si tiene la bandera `si` y no la `marca`, recibe el objeto con el texto (`darAtrasados`).
 */
export const REGALOS_ATRASADOS = [
  { si: 'colon', marca: 'regalo:mapa', objeto: 'mapa', texto: 'Un paje de Colón te alcanza: te trae el mapa de los reinos que te prometió.' },
  { si: 'vencido:boabdil', marca: 'regalo:mt_boabdil', objeto: 'mt_noche_cerrada', texto: 'Un mensajero de Boabdil te trae la MT01 Noche cerrada.' },
  { si: 'vencido:maria_pacheco', marca: 'regalo:mt_maria', objeto: 'mt_hoja_toledana', texto: 'Un comunero de Toledo te trae, de parte de María Pacheco, la MT02 Hoja toledana.' },
];
