// Textos sueltos de la isla 1 que no son diálogos (los diálogos están en guion-isla1.ts).
// Contenido propio.

import type { Condicion } from '../core/mundo';

/** El objetivo que se ve en pantalla: el primero cuya condición aún no se ha cumplido. */
export const OBJETIVOS: readonly { hasta: Condicion; texto: string }[] = [
  { hasta: 'inicial-elegida', texto: 'Desayuna con tu amigo en el bar y elige compañera en el museo' },
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

/**
 * Los amigos a los que el jugador pone nombre al conocerlos (HISTORIA.md), por el id de cada
 * personaje que es ese amigo: el del bar y el del muelle son el mismo, tu rival.
 */
export const AMIGOS: ReadonlyMap<string, string> = new Map([
  ['amigo', 'amigo'],
  ['amigo-muelle', 'amigo'],
  // El segundo amigo, al que conoces en el Roque Nublo (Gran Canaria).
  ['amigo2-nublo', 'amigo2'],
]);

/**
 * Lo que dice un amigo antes de que le pongas nombre (probador, 2026-11-23: te lo pedía sin que
 * hubiera dicho nada). Quien no está aquí, se nombra nada más hablarle.
 */
export const PRESENTACION: ReadonlyMap<string, readonly string[]> = new Map([['amigo2-nublo', ['¡Eh! ¡Espera, no te vayas!', '¿No me reconoces? ¡Soy yo!']]]);

/** El nombre del tipo de cada inicial, para los textos («la de Roca»). */
export const NOMBRE_TIPO_INICIAL: Readonly<Record<string, string>> = { planta: 'Planta', infernal: 'Infernal', roca: 'Roca', tierra: 'Tierra', agua: 'Agua' };
