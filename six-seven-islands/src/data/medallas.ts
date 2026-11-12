// El medallero (autor, 2026-11-12): una medalla por isla, que se gana al vencer a su gimnasio.
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
}

export const MEDALLAS: readonly DefMedalla[] = [
  { isla: 1, nombre: 'Lanzarote', gimnasio: 'Roca', condicion: 'gimnasio-vencido' },
  { isla: 2, nombre: 'Fuerteventura', gimnasio: null, condicion: null },
  { isla: 3, nombre: 'Gran Canaria', gimnasio: null, condicion: null },
  { isla: 4, nombre: 'Tenerife', gimnasio: null, condicion: null },
  { isla: 5, nombre: 'La Gomera', gimnasio: null, condicion: null },
  { isla: 6, nombre: 'La Palma', gimnasio: null, condicion: null },
];

/** Las medallas ganadas con estas condiciones cumplidas. */
export function medallasGanadas(condiciones: readonly string[]): DefMedalla[] {
  return MEDALLAS.filter((m) => m.condicion !== null && condiciones.includes(m.condicion));
}
