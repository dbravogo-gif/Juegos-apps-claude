// La cueva de Ajuy (Fuerteventura, fase 2; 2026-11-13), hecha a mano: una cueva marina con pozas de
// agua del mar (`~`) y columnas de roca (`#`). Dentro, un explorador y, al fondo, «algo que
// brilla», como dice el niño de la playa.

import type { DefInterior } from '../core/mundo';

export const CUEVA_AJUY: DefInterior = {
  id: 'cueva-ajuy',
  nombre: 'Cueva de Ajuy',
  mapa: [
    '|||||||||||||||||',
    '|###mmm~~~mmm###|',
    '|#mmmmm~~~mmmmm#|',
    '|mmm~~mmmmm~~mmm|',
    '|mmm~~mm#mm~~mmm|',
    '|mmmmmmm#mmmmmmm|',
    '|m~~mmmmmmmmm~~m|',
    '|m~~mm#mmm#mm~~m|',
    '|mmmmmmmmmmmmmmm|',
    '|mmmmmmmmmmmmmmm|',
    '||||||||d||||||||',
  ],
  entrada: { x: 8, y: 9 },
  personajes: [{ id: 'explorador-cueva', x: 12, y: 2, mira: 's', entrenador: { vision: 3, obligatorio: false }, frase: '¡Shhh! Las pozas tienen eco. ¿Has venido a por lo que brilla? Primero, a luchar.' }],
  objetos: [{ id: 'cubo-cueva', x: 5, y: 1, objeto: 'cubo-blanco' }],
};
