// Lugares del mapa de la península (zona de captura del Bestiario), con su latitud y longitud
// reales. Cada zona dice en `enMapa` en qué lugar está, o entre qué dos lugares va su camino.
// Las zonas de una misma ciudad comparten lugar: a la escala de la península no se distinguen.

import meta from '../assets/mundo/mapa_iberia.json';

export interface Lugar {
  nombre: string;
  lat: number;
  lon: number;
  /** Dónde aterrizas al llegar con Vuelo: una casilla libre a la entrada del pueblo. */
  llegada?: { zona: string; x: number; y: number; dir: 'arriba' | 'abajo' | 'izquierda' | 'derecha' };
}

export const LUGARES: Record<string, Lugar> = {
  // La Alhambra; Santa Fe y la Vega quedan a unos 10 km.
  granada: { nombre: 'Granada', lat: 37.176, lon: -3.588, llegada: { zona: 'santa_fe', x: 12, y: 16, dir: 'arriba' } },
  // Villalar de los Comuneros (Valladolid).
  villalar: { nombre: 'Villalar', lat: 41.553, lon: -5.137, llegada: { zona: 'villalar', x: 11, y: 8, dir: 'arriba' } },
  toledo: { nombre: 'Toledo', lat: 39.857, lon: -4.024, llegada: { zona: 'toledo', x: 5, y: 5, dir: 'abajo' } },
};

/** Tamaño de la imagen del mapa (`arte/mapa/mapa_iberia.py`), en sus píxeles. */
export const MAPA_ANCHO = meta.ancho;
export const MAPA_ALTO = meta.alto;

/** Posición en la imagen (sin escalar) de un punto: Canarias va en su recuadro. */
export function aPixel(lat: number, lon: number): { x: number; y: number } {
  const c = meta.canarias;
  if (lon > c.oeste - 0.5 && lon < c.este + 0.5 && lat > c.sur - 0.5 && lat < c.norte + 0.5) {
    return { x: c.x + 1 + (lon - c.oeste) * c.kx, y: c.y + 1 + (c.norte - lat) * c.ky };
  }
  const p = meta.principal;
  return { x: (lon - p.oeste) * p.kx, y: (p.norte - lat) * p.ky };
}
