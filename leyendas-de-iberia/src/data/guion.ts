import type { Paso } from '../core/mundo';

// Atajos para escribir guiones con menos ruido. `{nombre}` se sustituye por el nombre del
// jugador al mostrar el texto.

export const decir = (quien: string | undefined, ...textos: string[]): Paso[] =>
  textos.map((texto) => ({ tipo: 'decir', texto, quien }));

export const si = (bandera: string, entonces: Paso[], sino: Paso[] = []): Paso => ({ tipo: 'si', bandera, entonces, sino });

export const bandera = (nombre: string): Paso => ({ tipo: 'bandera', nombre });

export const dar = (objeto: string, cantidad: number): Paso => ({ tipo: 'dar', objeto, cantidad });
