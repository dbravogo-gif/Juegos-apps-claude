/**
 * Aspecto de las personas del mapa: el nombre de su hoja en `src/assets/personajes/`. Cada hoja
 * tiene 4 columnas (abajo, arriba, izquierda, derecha) y 4 filas de paso, a 16 × 16 píxeles.
 * Salen del paquete Ninja Adventure (CC0); ver `src/assets/LEEME.md`.
 */
export const ASPECTOS = [
  'muchacho',
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
] as const;

export type Aspecto = (typeof ASPECTOS)[number];

export const ASPECTO_JUGADOR: Aspecto = 'muchacho';
