// Captura: la fórmula del género (tercera y cuarta generación) más la calidad del lanzamiento, que
// sale de la barra (DISENO.md, «Captura»): una flecha que va y viene sobre una barra gris con una
// zona blanca y, en su centro, una verde pequeña. Ninguna zona asegura la captura.

import type { EstadoCriatura } from './modelo';
import { entero, type EstadoRng } from './rng';

export interface DatosCaptura {
  vida: number;
  vidaMax: number;
  /** Ratio de la especie, de 1 a 255. */
  ratio: number;
  /** Bonificación del objeto de captura (el básico vale 1). */
  bonus: number;
  estado: EstadoCriatura | null;
  /** Calidad del lanzamiento, de 0 a 1: 0 la zona gris, 0,5 la blanca y 1 la verde. */
  calidad: number;
}

export type ZonaBarra = 'gris' | 'blanca' | 'verde';

/** La calidad que da cada zona de la barra. */
export const CALIDAD_ZONA: Readonly<Record<ZonaBarra, number>> = { gris: 0, blanca: 0.5, verde: 1 };

/** Mitad del ancho de cada zona, desde el centro de la barra (de 0 a 1): verde, 5 %; blanca, 15 %. */
export const MEDIA_VERDE = 0.05;
export const MEDIA_BLANCA = 0.15;

/** La zona de la barra donde se para la flecha, con `pos` de 0 (izquierda) a 1 (derecha). */
export function zonaBarra(pos: number): ZonaBarra {
  const d = Math.abs(pos - 0.5);
  return d <= MEDIA_VERDE ? 'verde' : d <= MEDIA_BLANCA ? 'blanca' : 'gris';
}

/**
 * Multiplicador del lanzamiento (propuesta de DISENO.md): gris ×1, blanca ×1,5 y verde ×2,5.
 * Por debajo de la blanca cuenta como gris; desde la verde, como verde.
 */
export function factorLanzamiento(calidad: number): number {
  const q = Number.isFinite(calidad) ? calidad : 0;
  return q >= 1 ? 2.5 : q >= 0.5 ? 1.5 : 1;
}

/** Valor «a» de la fórmula. 255 o más: captura segura. */
export function valorCaptura(d: DatosCaptura): number {
  const max = Math.max(1, d.vidaMax);
  const vida = Math.max(1, Math.min(d.vida, max));
  let a = Math.floor(((3 * max - 2 * vida) * d.ratio * d.bonus * factorLanzamiento(d.calidad)) / (3 * max));
  // Dormida, el doble; con cualquier otro estado, un 50 % más.
  if (d.estado?.tipo === 'dormido') a = Math.floor(a * 2);
  else if (d.estado) a = Math.floor(a * 1.5);
  return Math.max(1, a);
}

function umbralSacudida(a: number): number {
  return Math.floor(1048560 / Math.floor(Math.sqrt(Math.floor(Math.sqrt(Math.floor(16711680 / a))))));
}

/** Probabilidad de capturar, de 0 a 1. Para la interfaz y las pruebas. */
export function probabilidadCaptura(d: DatosCaptura): number {
  const a = valorCaptura(d);
  if (a >= 255) return 1;
  return (umbralSacudida(a) / 65536) ** 4;
}

/** Cuatro comprobaciones; `sacudidas` (0–3) es para la animación. */
export function intentarCaptura(d: DatosCaptura, rng: EstadoRng): { exito: boolean; sacudidas: number } {
  const a = valorCaptura(d);
  if (a >= 255) return { exito: true, sacudidas: 3 };
  const b = umbralSacudida(a);
  for (let i = 0; i < 4; i++) {
    if (entero(rng, 0, 65535) >= b) return { exito: false, sacudidas: Math.min(i, 3) };
  }
  return { exito: true, sacudidas: 3 };
}
