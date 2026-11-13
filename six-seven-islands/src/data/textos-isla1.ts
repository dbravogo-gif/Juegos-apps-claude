// Textos sueltos de la isla 1 que no son diálogos (los diálogos están en guion-isla1.ts).
// Contenido propio.

import type { Condicion } from '../core/mundo';

/** El objetivo que se ve en pantalla: el primero cuya condición aún no se ha cumplido. */
export const OBJETIVOS: readonly { hasta: Condicion; texto: string }[] = [
  { hasta: 'inicial-elegida', texto: 'Ve al museo y elige a tu compañera' },
  { hasta: 'anciano', texto: 'Habla con el anciano en la plaza del pueblo' },
  { hasta: 'gimnasio-vencido', texto: 'Cruza las Montañas del Fuego y vence al gimnasio de Roca, en la capital' },
  { hasta: 'isla1-completada', texto: 'Ve al muelle de la capital: el barco te lleva a Fuerteventura' },
];

/** Nombre con artículo de cada objeto, para «Has encontrado…». */
export const NOMBRE_OBJETO: Record<string, string> = {
  pocion: 'una Poción',
  superpocion: 'una Superpoción',
  'cubo-blanco': 'un Cubo blanco',
};
