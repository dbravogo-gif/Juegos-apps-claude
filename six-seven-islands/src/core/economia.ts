// El dinero: reglas puras (sin DOM ni azar), para probarlas.
import type { Objeto } from './modelo';

/** Al perder un combate se cae parte del dinero, por el camino al refugio: el 10 %. */
export const PERDIDA_DERROTA = 0.1;

/** Lo que se pierde al caer derrotado con este dinero (redondeado hacia abajo). */
export function perdidaPorDerrota(dinero: number): number {
  return Math.floor(Math.max(0, dinero) * PERDIDA_DERROTA);
}

/**
 * Lo que vende la tienda en una isla: lo que tiene precio y ya se vende allí. Así un objeto que en
 * una isla es premio (la Superpoción en Fuerteventura) no se compra antes (probador, 2026-11-24).
 */
export function enVenta(objetos: Readonly<Record<string, Objeto>>, isla: number): Objeto[] {
  return Object.values(objetos).filter((o) => o.precio !== undefined && (o.desdeIsla ?? 1) <= isla);
}
