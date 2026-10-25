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
  '~': { nombre: 'Acequia', solido: true },
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
};
