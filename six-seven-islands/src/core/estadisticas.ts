// Estadísticas: fórmulas del género (tercera generación en adelante, sin EV), con la Valía de
// Leyendas de Iberia como IV común. Valía 13 o 14 equivale a estadísticas al 90 % o más.

import type { Criatura, DatosJuego, Especie, EstadisticaCombate, Estadisticas, Temperamento } from './modelo';
import { elegirPonderado, type EstadoRng } from './rng';

export const VALIA_MIN = 1;
export const VALIA_MAX = 14;
/** Desde esta Valía la criatura es «casi perfecta» (IV de 29 o más sobre 31). */
export const VALIA_CASI_PERFECTA = 13;

/** Pesos de cada Valía, de 1 a 14: campana con lo normal entre 6 y 9. Suman 96. */
export const PESOS_VALIA = [1, 2, 4, 6, 9, 12, 14, 14, 12, 9, 6, 4, 2, 1] as const;

export function tirarValia(rng: EstadoRng): number {
  return VALIA_MIN + elegirPonderado(rng, PESOS_VALIA);
}

/** Valía casi perfecta (13 o 14), con 2 contra 1 a favor del 13, como en la campana. */
export function tirarValiaCasiPerfecta(rng: EstadoRng): number {
  return VALIA_CASI_PERFECTA + elegirPonderado(rng, [PESOS_VALIA[12], PESOS_VALIA[13]]);
}

/** 1 equivale a un IV de 0 y 14 a uno de 31. */
export function ivDeValia(valia: number): number {
  const v = Math.min(VALIA_MAX, Math.max(VALIA_MIN, Math.round(valia)));
  return Math.round(((v - VALIA_MIN) * 31) / (VALIA_MAX - VALIA_MIN));
}

function modificadorTemperamento(t: Temperamento | undefined, est: EstadisticaCombate): number {
  if (!t || t.sube === t.baja) return 1;
  if (t.sube === est) return 1.1;
  if (t.baja === est) return 0.9;
  return 1;
}

export function estadisticasDe(especie: Especie, nivel: number, valia: number, temperamento?: Temperamento): Estadisticas {
  const iv = ivDeValia(valia);
  const b = especie.base;
  const otra = (est: EstadisticaCombate) =>
    Math.floor((Math.floor(((2 * b[est] + iv) * nivel) / 100) + 5) * modificadorTemperamento(temperamento, est));
  return {
    vida: Math.floor(((2 * b.vida + iv) * nivel) / 100) + nivel + 10,
    fuerza: otra('fuerza'),
    escudo: otra('escudo'),
    magia: otra('magia'),
    resMagica: otra('resMagica'),
    celeridad: otra('celeridad'),
  };
}

export function calcularEstadisticas(c: Criatura, datos: DatosJuego): Estadisticas {
  const especie = datos.especies[c.especie];
  if (!especie) throw new Error(`Especie desconocida: ${c.especie}`);
  const temperamento = datos.temperamentos.find((t) => t.id === c.temperamento);
  return estadisticasDe(especie, c.nivel, c.valia, temperamento);
}

export function vidaMaxima(c: Criatura, datos: DatosJuego): number {
  return calcularEstadisticas(c, datos).vida;
}

/** Multiplicador de una etapa de combate, de −6 (×0,25) a +6 (×4). */
export function multiplicadorEtapa(etapa: number): number {
  const e = Math.max(-6, Math.min(6, etapa));
  return e >= 0 ? (2 + e) / 2 : 2 / (2 - e);
}
