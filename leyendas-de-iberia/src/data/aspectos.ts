/**
 * Aspecto de las personas del mapa: el nombre de su hoja en `src/assets/personajes/`. Cada hoja
 * tiene 4 columnas (abajo, arriba, izquierda, derecha) y 4 filas de paso, a 16 × 24 píxeles.
 * Las dibuja `arte/mapa/personajes.py`: un aspecto nuevo se añade allí y aquí.
 */
export const ASPECTOS = [
  'muchacho',
  'muchacho_agua',
  'dama',
  'noble',
  'caballero',
  'explorador',
  'anciano',
  'anciana',
  'mujer',
  'monje',
  'ballestero',
  'mercader',
  'guardia_nazari',
  'sultan',
  'soldado',
  'aldeano',
  'aldeano_verde',
  'aldeana',
  'maestro',
  'tendero',
  'labrador',
  'hortelana',
  'aguador',
  'halconero',
  'jardinero',
  'maria_pacheco',
  'padilla',
  'comunero',
  'imperial',
  'espadero',
  'felipe_ii',
  'almirante',
  'marinero',
  'cantero',
  'arriero',
  'rival_a',
  'rival_b',
] as const;

export type Aspecto = (typeof ASPECTOS)[number];

export const ASPECTO_JUGADOR: Aspecto = 'muchacho';
/** El jugador surcando el agua con Pleamar, sobre una criatura (`hoja_navegando` en personajes.py). */
export const ASPECTO_NAVEGANDO: Aspecto = 'muchacho_agua';
