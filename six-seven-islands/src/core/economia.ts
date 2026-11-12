// El dinero: reglas puras (sin DOM ni azar), para probarlas.

/** Al perder un combate se cae parte del dinero, por el camino al refugio: el 10 %. */
export const PERDIDA_DERROTA = 0.1;

/** Lo que se pierde al caer derrotado con este dinero (redondeado hacia abajo). */
export function perdidaPorDerrota(dinero: number): number {
  return Math.floor(Math.max(0, dinero) * PERDIDA_DERROTA);
}
