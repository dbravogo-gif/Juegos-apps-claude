import type { EstadoCriatura } from './modelo';
import { entero, type EstadoRng } from './rng';

export interface DatosCaptura {
  vida: number;
  vidaMax: number;
  /** Ratio de la especie, de 1 a 255. */
  ratio: number;
  /** Bonificación del objeto de captura (la tésera normal vale 1). */
  bonus: number;
  estado: EstadoCriatura | null;
  /** Captura sin fallo posible (la Tésera real). */
  segura?: boolean;
}

/** Valor «a» de la fórmula de Pokémon (tercera y cuarta generación). 255 o más: captura segura. */
export function valorCaptura(d: DatosCaptura): number {
  const max = Math.max(1, d.vidaMax);
  const vida = Math.max(1, Math.min(d.vida, max));
  let a = Math.floor(((3 * max - 2 * vida) * d.ratio * d.bonus) / (3 * max));
  if (d.estado?.tipo === 'dormido') a = Math.floor(a * 2);
  else if (d.estado?.tipo === 'quemado') a = Math.floor(a * 1.5);
  return Math.max(1, a);
}

/** Probabilidad aproximada de capturar, de 0 a 1. Para la interfaz y las pruebas. */
export function probabilidadCaptura(d: DatosCaptura): number {
  const a = valorCaptura(d);
  if (a >= 255) return 1;
  const b = umbralSacudida(a);
  return (b / 65536) ** 4;
}

function umbralSacudida(a: number): number {
  return Math.floor(1048560 / Math.floor(Math.sqrt(Math.floor(Math.sqrt(Math.floor(16711680 / a))))));
}

/**
 * Cuatro comprobaciones; si pasan todas, la criatura queda capturada. `sacudidas` (0–3) es
 * cuántas veces se agita la tésera antes de soltarse, para la animación.
 */
export function intentarCaptura(d: DatosCaptura, rng: EstadoRng): { exito: boolean; sacudidas: number } {
  if (d.segura) return { exito: true, sacudidas: 3 };
  const a = valorCaptura(d);
  if (a >= 255) return { exito: true, sacudidas: 3 };
  const b = umbralSacudida(a);
  for (let i = 0; i < 4; i++) {
    if (entero(rng, 0, 65535) >= b) return { exito: false, sacudidas: Math.min(i, 3) };
  }
  return { exito: true, sacudidas: 3 };
}
