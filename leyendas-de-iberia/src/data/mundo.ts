import { entradasDeZonas, type Zona } from '../core/mundo';
import { INICIO, ZONAS_CAPITULO_1 } from './zonas/capitulo1';
import { INICIO_CAPITULO_2, ZONAS_CAPITULO_2 } from './zonas/capitulo2';
import { INICIO_CAPITULO_3, ZONAS_CAPITULO_3 } from './zonas/capitulo3';

export { CASILLAS } from './casillas';
export { ENTRENADORES } from './entrenadores';
export { INICIO } from './zonas/capitulo1';

export { INICIO_CAPITULO_2 } from './zonas/capitulo2';
export { INICIO_CAPITULO_3 } from './zonas/capitulo3';

export const ZONAS: Record<string, Zona> = Object.fromEntries([...ZONAS_CAPITULO_1, ...ZONAS_CAPITULO_2, ...ZONAS_CAPITULO_3].map((z) => [z.id, z]));

/** Las zonas de cada capítulo, en orden de juego. */
export const CAPITULOS: { nombre: string; zonas: string[] }[] = [
  { nombre: 'Capítulo 1 · Granada, 1492', zonas: ZONAS_CAPITULO_1.map((z) => z.id) },
  { nombre: 'Capítulo 2 · Castilla, 1521', zonas: ZONAS_CAPITULO_2.map((z) => z.id) },
  { nombre: 'Capítulo 3 · Sevilla, 1571', zonas: ZONAS_CAPITULO_3.map((z) => z.id) },
];

/** Por dónde se entra en cada zona (modo desarrollador). */
export const ENTRADAS = entradasDeZonas(ZONAS, [INICIO, INICIO_CAPITULO_2, INICIO_CAPITULO_3]);

/**
 * Regalos de la historia añadidos después de que alguien pasara por allí: al cargar la partida,
 * si tiene la bandera `si` y no la `marca`, recibe el objeto con el texto (`darAtrasados`).
 */
export const REGALOS_ATRASADOS = [
  { si: 'inicial', marca: 'regalo:alpargatas', objeto: 'alpargatas', texto: 'Un criado del rey Fernando te trae unas alpargatas de esparto: mantén pulsado B al andar para correr.' },
  { si: 'colon', marca: 'regalo:mapa', objeto: 'mapa', texto: 'Un paje de Colón te alcanza: te trae el mapa de los reinos que te prometió.' },
  { si: 'vencido:boabdil', marca: 'regalo:mt_boabdil', objeto: 'mt_noche_cerrada', texto: 'Un mensajero de Boabdil te trae la MT01 Noche cerrada.' },
  { si: 'vencido:maria_pacheco', marca: 'regalo:mt_maria', objeto: 'mt_hoja_toledana', texto: 'Un comunero de Toledo te trae, de parte de María Pacheco, la MT02 Hoja toledana.' },
  { si: 'vencido:maria_pacheco', marca: 'regalo:repartir_exp', objeto: 'repartir_exp', texto: 'Un maestro de Toledo te manda el Repartir experiencia: las criaturas que no luchan ganan la mitad de experiencia. Se apaga desde la mochila.' },
];
