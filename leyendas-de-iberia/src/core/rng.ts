// Generador aleatorio con semilla (sfc32). Su estado es un objeto JSON que viaja dentro del
// estado del juego, así que una partida se puede repetir exactamente con la misma semilla y
// las mismas acciones. Es la base del reto diario y del multijugador.
//
// Las funciones de este módulo modifican el objeto que reciben. Quien necesite no tocar el
// original, que lo clone antes.

export interface EstadoRng {
  s: [number, number, number, number];
}

function hashCadena(texto: string): number {
  // FNV-1a de 32 bits.
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function splitmix32(semilla: number): () => number {
  let x = semilla >>> 0;
  return () => {
    x = (x + 0x9e3779b9) >>> 0;
    let z = x;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
    return (z ^ (z >>> 16)) >>> 0;
  };
}

export function crearRng(semilla: number | string): EstadoRng {
  const base = typeof semilla === 'string' ? hashCadena(semilla) : semilla >>> 0;
  const sm = splitmix32(base);
  const rng: EstadoRng = { s: [sm(), sm(), sm(), sm()] };
  // Descartar las primeras salidas mezcla mejor semillas parecidas.
  for (let i = 0; i < 12; i++) siguienteU32(rng);
  return rng;
}

function siguienteU32(rng: EstadoRng): number {
  let [a, b, c, d] = rng.s;
  const t = (((a + b) >>> 0) + d) >>> 0;
  d = (d + 1) >>> 0;
  a = b ^ (b >>> 9);
  b = (c + (c << 3)) >>> 0;
  c = ((c << 21) | (c >>> 11)) >>> 0;
  c = (c + t) >>> 0;
  rng.s = [a >>> 0, b >>> 0, c, d];
  return t;
}

/** Número en [0, 1). */
export function siguiente(rng: EstadoRng): number {
  return siguienteU32(rng) / 4294967296;
}

/** Entero entre `min` y `max`, ambos incluidos. */
export function entero(rng: EstadoRng, min: number, max: number): number {
  return min + Math.floor(siguiente(rng) * (max - min + 1));
}

/** `true` con una probabilidad de `porcentaje` sobre 100. */
export function probabilidad(rng: EstadoRng, porcentaje: number): boolean {
  if (porcentaje >= 100) return true;
  if (porcentaje <= 0) return false;
  return siguiente(rng) * 100 < porcentaje;
}

export function elegir<T>(rng: EstadoRng, lista: readonly T[]): T {
  if (lista.length === 0) throw new Error('No se puede elegir de una lista vacía');
  return lista[entero(rng, 0, lista.length - 1)];
}

/** Devuelve un índice con probabilidad proporcional a su peso. */
export function elegirPonderado(rng: EstadoRng, pesos: readonly number[]): number {
  const total = pesos.reduce((a, b) => a + b, 0);
  let r = siguiente(rng) * total;
  for (let i = 0; i < pesos.length; i++) {
    r -= pesos[i];
    if (r < 0) return i;
  }
  return pesos.length - 1;
}

export function clonarRng(rng: EstadoRng): EstadoRng {
  return { s: [...rng.s] };
}
