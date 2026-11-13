// El guardado de la partida (F10): JSON plano con versión de formato, y el mismo contenido como
// código para copiar y pegar (en Safari, WebKit borra lo guardado tras 7 días sin visitar la web;
// ARCHITECTURE.md, «Guardado»). Puro: no toca localStorage, que es cosa de «partida».

import type { EstadoExplorar } from './explorar';
import type { Criatura } from './modelo';
import type { EstadoRng } from './rng';

export const VERSION_GUARDADO = 1;
/** Prefijo del código exportado: identifica el juego y la versión. */
const PREFIJO = 'SSI1:';

export interface Guardado {
  version: typeof VERSION_GUARDADO;
  explorar: EstadoExplorar;
  equipo: Criatura[];
  mochila: Record<string, number>;
  /** Sala a la que se vuelve al perder. */
  ultimoRefugio: string;
  /** Entrenadores ya vencidos: no vuelven a retar. */
  vencidos: string[];
  rng: EstadoRng;
  /** Dinero ganado a los entrenadores (desde el 2026-11-12; si falta, 0). */
  dinero?: number;
  /** La isla en la que se está (desde el 2026-11-13; sin ella, la 1). */
  isla?: number;
  /** El nombre y la persona elegidos al empezar (desde el 2026-11-12). */
  nombre?: string;
  persona?: string;
}

export function serializar(g: Guardado): string {
  return JSON.stringify(g);
}

/** Lee un guardado; null si no es válido o es de una versión que no se sabe leer. */
export function deserializar(texto: string | null): Guardado | null {
  if (!texto) return null;
  let g: unknown;
  try {
    g = JSON.parse(texto);
  } catch {
    return null;
  }
  if (!esGuardado(g)) return null;
  // Aquí irán las migraciones de una versión a la siguiente.
  return g;
}

function esGuardado(g: unknown): g is Guardado {
  if (!g || typeof g !== 'object') return false;
  const x = g as Partial<Guardado>;
  return (
    x.version === VERSION_GUARDADO &&
    !!x.explorar &&
    typeof x.explorar.x === 'number' &&
    typeof x.explorar.y === 'number' &&
    typeof x.explorar.zona === 'string' &&
    Array.isArray(x.equipo) &&
    !!x.mochila &&
    typeof x.mochila === 'object' &&
    typeof x.ultimoRefugio === 'string' &&
    Array.isArray(x.vencidos) &&
    Array.isArray(x.rng?.s) &&
    x.rng.s.length === 4
  );
}

/** El guardado como código de texto, para copiarlo y llevarlo a otro navegador. */
export function exportarCodigo(g: Guardado): string {
  const bytes = new TextEncoder().encode(serializar(g));
  let binario = '';
  for (const b of bytes) binario += String.fromCharCode(b);
  return PREFIJO + btoa(binario);
}

export function importarCodigo(codigo: string): Guardado | null {
  const limpio = codigo.trim();
  if (!limpio.startsWith(PREFIJO)) return null;
  try {
    const binario = atob(limpio.slice(PREFIJO.length));
    const bytes = Uint8Array.from(binario, (c) => c.charCodeAt(0));
    return deserializar(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}
