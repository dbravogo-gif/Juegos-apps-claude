// El medallero (autor, 2026-11-12): una medalla por isla, que se gana al vencer a su gimnasio. Son
// siete (2026-11-15): las seis islas y El Hierro; las pintaderas son piezas del Sello que abre el
// Teide (HISTORIA.md).
// Cada medalla es la pintadera de su isla (src/arte/pintaderas.ts). Solo la isla 1 tiene
// gimnasio por ahora; las demás salen como hueco hasta que existan.

import type { Condicion } from '../core/mundo';

export interface DefMedalla {
  /** Número de la isla, de este a oeste (DISENO.md). */
  isla: number;
  /** Nombre de la isla. */
  nombre: string;
  /** Tipo del gimnasio, o null si aún no está decidido. */
  gimnasio: string | null;
  /** La condición que la da (vencer al gimnasio), o null si la isla aún no existe. */
  condicion: Condicion | null;
  /** La isla escondida (DISENO.md): no se dice su nombre hasta descubrirla. */
  secreta?: boolean;
}

/**
 * El nombre que se enseña: el de la isla secreta, oculto. El medallero decía «El Hierro» desde el
 * principio y destripaba el final (probador, 2026-11-24).
 */
export function nombreVisible(m: DefMedalla): string {
  return m.secreta ? '¿?' : m.nombre;
}

export const MEDALLAS: readonly DefMedalla[] = [
  { isla: 1, nombre: 'Lanzarote', gimnasio: 'Roca', condicion: 'gimnasio-vencido' },
  { isla: 2, nombre: 'Fuerteventura', gimnasio: 'Aire', condicion: 'gimnasio2-vencido' },
  { isla: 3, nombre: 'Gran Canaria', gimnasio: 'Eléctrico y Lucha', condicion: 'gimnasio3-vencido' },
  { isla: 4, nombre: 'Tenerife', gimnasio: null, condicion: null },
  { isla: 5, nombre: 'La Gomera', gimnasio: null, condicion: null },
  { isla: 6, nombre: 'La Palma', gimnasio: null, condicion: null },
  // La última, en la isla escondida (autor, 2026-11-15): siete en total. La de Gran Canaria es una
  // sola pintadera partida a la mitad, una por cada uno de sus dos gimnasios.
  { isla: 7, nombre: 'El Hierro', gimnasio: null, condicion: null, secreta: true },
];

/** Las medallas ganadas con estas condiciones cumplidas. */
export function medallasGanadas(condiciones: readonly string[]): DefMedalla[] {
  return MEDALLAS.filter((m) => m.condicion !== null && condiciones.includes(m.condicion));
}
