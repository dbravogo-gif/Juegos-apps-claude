import type { DefCasilla } from '../core/mundo';

/**
 * Leyenda de los mapas. Cada carácter es una casilla; el aspecto lo dibuja
 * `src/ui/casillasVisual.ts`. Para añadir un tipo de casilla: entrada aquí y dibujo allí.
 */
export const CASILLAS: Record<string, DefCasilla> = {
  '.': { nombre: 'Camino', solido: false },
  ',': { nombre: 'Hierba', solido: false },
  h: { nombre: 'Hierba alta', solido: false, hierba: true },
  '*': { nombre: 'Flores', solido: false },
  S: { nombre: 'Empedrado', solido: false },
  '=': { nombre: 'Puente', solido: false },
  P: { nombre: 'Puerta', solido: false },
  G: { nombre: 'Portón', solido: false },
  B: { nombre: 'Suelo', solido: false },
  R: { nombre: 'Alfombra', solido: false },
  '#': { nombre: 'Árbol', solido: true },
  o: { nombre: 'Olivo', solido: true },
  '~': { nombre: 'Acequia', solido: true, pesca: true },
  O: { nombre: 'Agua profunda', solido: true, navegable: true, pesca: true },
  M: { nombre: 'Muro', solido: true },
  T: { nombre: 'Tejado', solido: true },
  L: { nombre: 'Lona', solido: true },
  W: { nombre: 'Pared', solido: true },
  X: { nombre: 'Mostrador', solido: true },
  E: { nombre: 'Estantería', solido: true },
  K: { nombre: 'Barriles', solido: true },
  C: { nombre: 'Columna', solido: true },
  A: { nombre: 'Fuente', solido: true },
  Z: { nombre: 'Azulejos', solido: true },
  n: { nombre: 'Naranjo', solido: true },
  f: { nombre: 'Valla', solido: true },
  v: { nombre: 'Seto', solido: true },
  u: { nombre: 'Huerto', solido: true },
  Q: { nombre: 'Pozo', solido: true },
  r: { nombre: 'Roca', solido: true },
  w: { nombre: 'Trigal', solido: false, hierba: true },
  Y: { nombre: 'Armadura', solido: true },
  J: { nombre: 'Armero', solido: true },
  V: { nombre: 'Cascada', solido: true },
  k: { nombre: 'Peña', solido: true },
  I: { nombre: 'Atalaya', solido: true },
  /** Una noria sobre la acequia: es agua, y se pesca a su lado. */
  N: { nombre: 'Noria', solido: true, pesca: true },
  // Capítulo 3. La cubierta del galeón del gimnasio de Sevilla: mojada, se resbala hasta chocar o
  // pisar tabla seca, como el hielo de los juegos del género.
  D: { nombre: 'Cubierta mojada', solido: false, resbala: true },
  U: { nombre: 'Mástil', solido: true },
  H: { nombre: 'Cañón', solido: true },
  // Piezas grandes: se dibujan una vez por bloque (el de abajo a la izquierda manda).
  g: { nombre: 'Giralda', solido: true },
  t: { nombre: 'Torre del Oro', solido: true },
  /** Un galeón amarrado: está sobre el río. */
  x: { nombre: 'Galeón', solido: true },
  s: { nombre: 'Sillares', solido: true },
  a: { nombre: 'Andamio', solido: true },
  // Capítulo 4. Las trincheras del campo de Breda: cauces con compuerta que se secan o se inundan
  // según las palancas `a` y `b` de la zona (sin echar, `c` e `i` están inundados).
  c: { nombre: 'Cauce', solido: true, compuerta: { palanca: 'a', seca: true } },
  e: { nombre: 'Cauce', solido: false, compuerta: { palanca: 'a', seca: false } },
  i: { nombre: 'Cauce', solido: true, compuerta: { palanca: 'b', seca: true } },
  j: { nombre: 'Cauce', solido: false, compuerta: { palanca: 'b', seca: false } },
  /** Cestón de mimbre lleno de tierra, de los asedios. */
  F: { nombre: 'Gavión', solido: true },
  /** Suelo de cueva o galería donde salen criaturas, como la hierba alta. */
  y: { nombre: 'Galería', solido: false, hierba: true },
};
