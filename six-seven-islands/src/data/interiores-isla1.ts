// Los interiores de la isla 1: salas pequeñas aparte, escritas como texto (una letra por casilla,
// ver LEYENDA en src/core/mundo.ts). Arriba, la pared del fondo; abajo, la pared de delante con
// la puerta `d`, por la que se sale andando hacia el sur. La pared de delante se dibuja baja
// para que la cámara vea la sala, como en una casa de muñecas.

import type { DefInterior } from '../core/mundo';

/** La partida empieza dentro de casa: mamá te manda al museo (probador, 2026-11-08). */
export const SALA_INICIAL = 'casa-jugador';

export const INTERIORES_ISLA1: readonly DefInterior[] = [
  {
    id: 'museo',
    nombre: 'Museo de las cuatro leyendas',
    mapa: [
      '|||||||||||',
      '|mmmmmmmmm|',
      '|mmmmmmmmm|',
      '|mmmmmmmmm|',
      '|kmmmmmmmh|',
      '|vmmmmmmmv|',
      '|mmmmmmmmm|',
      '|||||d|||||',
    ],
    personajes: [
      // Cuatro pedestales, uno por inicial (autor, 2026-11-10).
      { id: 'estatua-planta', x: 2, y: 2, mira: 's' },
      { id: 'estatua-agua', x: 4, y: 2, mira: 's' },
      { id: 'estatua-infernal', x: 6, y: 2, mira: 's' },
      { id: 'estatua-roca', x: 8, y: 2, mira: 's' },
      { id: 'doctora', x: 5, y: 4, mira: 's' },
      { id: 'informatica', x: 2, y: 4, mira: 'o' },
    ],
    entrada: { x: 5, y: 6 },
  },
  {
    id: 'casa-jugador',
    nombre: 'Tu casa',
    mapa: [
      '|||||||||',
      '|lmmmmmh|',
      '|mmmmmmm|',
      '|mmmommm|',
      '|vmmmmmm|',
      '|mmmmmmm|',
      '||||d||||',
    ],
    personajes: [{ id: 'madre', x: 6, y: 2, mira: 's' }],
    entrada: { x: 4, y: 5 },
  },
  {
    id: 'casa',
    nombre: 'Casa de unos vecinos',
    mapa: [
      '|||||||||',
      '|hmmmmml|',
      '|mmmmmmm|',
      '|mmommmm|',
      '|mmmmmmv|',
      '|mmmmmmm|',
      '||||d||||',
    ],
    personajes: [{ id: 'vecina-casa', x: 5, y: 2, mira: 's' }],
    entrada: { x: 4, y: 5 },
  },
  {
    id: 'refugio',
    nombre: 'Refugio',
    mapa: [
      '|||||||||||',
      '|hmmmmmmmh|',
      '|ccccccccc|',
      '|mmmmmmmmm|',
      '|lmmmmmmmv|',
      '|mmmmmmmmm|',
      '|||||d|||||',
    ],
    personajes: [{ id: 'enfermera', x: 5, y: 1, mira: 's' }],
    entrada: { x: 5, y: 5 },
  },
  {
    id: 'tienda',
    nombre: 'Tienda',
    mapa: [
      '|||||||||',
      '|hhmmmhh|',
      '|mmcccmm|',
      '|mmmmmmm|',
      '|vmmmmmv|',
      '||||d||||',
    ],
    personajes: [{ id: 'tendero', x: 4, y: 1, mira: 's' }],
    entrada: { x: 4, y: 4 },
  },
  {
    id: 'gimnasio',
    nombre: 'Gimnasio de Roca',
    mapa: [
      '|||||||||||',
      '|vmmmmmmmv|',
      '|mmmmmmmmm|',
      '|vmmmmmmmv|',
      '|mmmmmmmmm|',
      '|vmmmmmmmv|',
      '|mmmmmmmmm|',
      '|||||d|||||',
    ],
    personajes: [{ id: 'lider-gimnasio', x: 5, y: 1, mira: 's' }],
    entrada: { x: 5, y: 6 },
  },
];
