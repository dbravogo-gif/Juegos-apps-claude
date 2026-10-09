// Hitos de la compañía en los que sale su comandante. Solo cuentan una vez por partida: la
// lista de los ya celebrados viaja en `estado.hitos`.

import { TIPOS } from '../data/aviones.js';

const ANIO = 365 * 1440;
const LARGO_RADIO = 6000; // km de alcance con todas las plazas

export const HITOS = [
  { id: 'primer-vuelo', cumple: (e) => e.aviones.some((a) => a.estado === 'vuelo') },
  { id: 'largo-radio', cumple: (e) => e.aviones.some((a) => (TIPOS[a.tipo]?.alcance ?? 0) >= LARGO_RADIO) },
  { id: 'flota-10', cumple: (e) => e.aviones.length >= 10 },
  { id: 'aniversario-10', cumple: (e) => e.t - (e.tInicio ?? 0) >= 10 * ANIO },
  { id: 'aniversario-25', cumple: (e) => e.t - (e.tInicio ?? 0) >= 25 * ANIO },
];

// Devuelve los hitos recién alcanzados y los apunta para no repetirlos.
export function hitosNuevos(estado) {
  estado.hitos ??= [];
  const nuevos = HITOS.filter((h) => !estado.hitos.includes(h.id) && h.cumple(estado)).map((h) => h.id);
  estado.hitos.push(...nuevos);
  return nuevos;
}
