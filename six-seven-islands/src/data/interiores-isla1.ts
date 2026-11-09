// Los interiores de la isla 1: salas pequeñas aparte, escritas como texto (una letra por casilla,
// ver LEYENDA en src/core/mundo.ts). Arriba, la pared del fondo; abajo, la pared de delante con
// la puerta `d`, por la que se sale andando hacia el sur. La pared de delante se dibuja baja
// para que la cámara vea la sala, como en una casa de muñecas.

import type { DefInterior } from '../core/mundo';

export const INTERIORES_ISLA1: readonly DefInterior[] = [
  {
    id: 'museo',
    nombre: 'Museo de las tres leyendas',
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
      { id: 'estatua-planta', x: 2, y: 2, mira: 's' },
      { id: 'estatua-agua', x: 5, y: 2, mira: 's' },
      { id: 'estatua-infernal', x: 8, y: 2, mira: 's' },
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
      '|mmcccccmm|',
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
    nombre: 'Gimnasio de Luz',
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

/**
 * A qué interior lleva cada puerta de la isla, por zona y casilla de la puerta (en coordenadas de
 * la zona). Las casas y los refugios comparten sala: al salir, se vuelve a la puerta por la que
 * se entró.
 */
export const PUERTAS_ISLA1: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  inicial: { '6,6': 'casa-jugador', '11,6': 'casa', '7,13': 'museo' },
  pueblo: { '3,7': 'casa', '17,8': 'refugio', '23,7': 'tienda', '22,14': 'casa' },
  capital: {
    '14,10': 'gimnasio',
    '15,10': 'gimnasio',
    '21,7': 'casa',
    '5,9': 'refugio',
    '4,16': 'casa',
    '10,16': 'casa',
    '16,16': 'casa',
  },
};
