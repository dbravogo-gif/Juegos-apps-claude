// Los recados de Lanzarote (HISTORIA.md, parte 3; decididos por el autor el 2026-11-15): pequeños
// encargos con premios modestos, porque al principio hay pocos objetos y flojos. Cada uno lo da un
// personaje; al cumplirlo se gana el premio y la condición `recado:<id>`.

import type { DefRecado } from '../core/recados';

/** Los recados, por el id del personaje que los da. */
export const RECADOS_ISLA1: Readonly<Record<string, DefRecado>> = {
  anciano: {
    id: 'vid-anciano',
    con: 'anciano',
    pide: { especie: 'c007-1' },
    da: { objeto: 'pocion', cantidad: 1 },
    quien: 'Anciano',
    pedir: ['Mis vides andan tristes. Dicen que un Dragosil cerca las alegra.', 'Si capturas una, tráemela: solo quiero que la vean un ratito.'],
    cumplido: ['¡Un Dragosil! Mira cómo se animan las vides.', 'Toma, mi niño, por las molestias.'],
    hecho: ['Mis vides nunca habían estado tan verdes. ¡Gracias!'],
  },
  'redera-famara': {
    id: 'red-famara',
    pide: { vencidos: ['pescador-famara', 'pulpero-famara'] },
    da: { objeto: 'cubo-blanco', cantidad: 3 },
    quien: 'Redera',
    pedir: ['Esos dos se llevaron mi red para pescar y no me la devuelven.', 'Si les ganas a los dos, a lo mejor te hacen caso.'],
    cumplido: ['¡Mi red! Les ganaste a los dos, ¿eh? Así aprenden.', 'Toma estos cubos, que a mí no me hacen falta.'],
    hecho: ['Con la red arreglada, esta semana cenamos viejas.'],
  },
};
