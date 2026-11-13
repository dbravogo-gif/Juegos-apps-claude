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
  /**
   * Dónde empezaban, al guardar, la zona actual y la de la puerta por la que se entró (desde el
   * 2026-11-13). Si después se mueve una zona o un interior, la posición se corrige con ellos.
   */
  origenes?: Origenes;
  /** El último refugio de cada isla visitada, por número (desde el 2026-11-13). */
  refugios?: Record<string, string>;
}

/**
 * Al viajar en barco: se apunta el refugio de la isla que se deja y se recupera el de la isla de
 * destino, o el suyo por defecto si nunca te curaron allí. Antes, volver a Lanzarote dejaba como
 * refugio tu casa, el del principio (probador, 2026-11-13).
 */
export function refugiosAlViajar(
  refugios: Readonly<Record<string, string>> | undefined,
  desde: number,
  ultimo: string,
  hacia: number,
  porDefecto: string,
): { refugios: Record<string, string>; ultimo: string } {
  const r: Record<string, string> = { ...refugios, [String(desde)]: ultimo };
  return { refugios: r, ultimo: r[String(hacia)] ?? porDefecto };
}

export interface Punto {
  x: number;
  y: number;
}

export interface Origenes {
  /** El origen de la zona actual (de la isla o del interior). */
  actual: Punto;
  /** El de la zona de la puerta, si se está dentro de un interior. */
  fuera?: Punto;
}

/**
 * La exploración guardada, movida lo mismo que se hayan movido sus zonas desde que se guardó
 * (`antes`) hasta ahora (`ahora`). Las posiciones son de la isla entera: sin esto, mover una zona
 * dejaría al jugador en otra casilla (APRENDIDO.md).
 */
export function reubicar(e: EstadoExplorar, antes: Origenes, ahora: Origenes): EstadoExplorar {
  const r = structuredClone(e);
  const dx = ahora.actual.x - antes.actual.x;
  const dy = ahora.actual.y - antes.actual.y;
  r.x += dx;
  r.desdeX += dx;
  r.y += dy;
  r.desdeY += dy;
  if (r.fuera && antes.fuera && ahora.fuera) {
    r.fuera.x += ahora.fuera.x - antes.fuera.x;
    r.fuera.y += ahora.fuera.y - antes.fuera.y;
  }
  return r;
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
