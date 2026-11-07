// Experiencia, niveles, movimientos aprendidos y evoluciones.

import { vidaMaxima } from './estadisticas';
import type { Criatura, DatosJuego, Evolucion } from './modelo';

export const NIVEL_MAX = 100;
export const MAX_MOVIMIENTOS = 4;

/** Curva de experiencia media: el nivel al cubo. */
export function expParaNivel(nivel: number): number {
  return nivel <= 1 ? 0 : nivel ** 3;
}

export function expGanada(derrotado: Criatura, datos: DatosJuego, deEntrenador: boolean): number {
  const especie = datos.especies[derrotado.especie];
  const base = Math.floor((especie.expBase * derrotado.nivel) / 7);
  return Math.max(1, Math.floor(base * (deEntrenador ? 1.5 : 1)));
}

/** Los cuatro últimos movimientos aprendidos hasta ese nivel, como las criaturas salvajes. */
export function movimientosIniciales(datos: DatosJuego, especie: string, nivel: number): string[] {
  const vistos: string[] = [];
  for (const a of datos.especies[especie].aprende) {
    if (a.nivel <= nivel && !vistos.includes(a.movimiento)) vistos.push(a.movimiento);
  }
  return vistos.slice(-MAX_MOVIMIENTOS);
}

export interface SubidaNivel {
  nivel: number;
  vida: number;
  vidaMax: number;
  aprendidos: string[];
  /** Movimientos que no caben: el jugador decide si olvida otro. */
  pendientes: string[];
}

/**
 * Suma experiencia y sube los niveles que toque. Devuelve una copia. Al subir de nivel, la Vida
 * actual crece lo mismo que la máxima.
 */
export function aplicarExperiencia(
  c: Criatura,
  cantidad: number,
  datos: DatosJuego,
): { criatura: Criatura; subidas: SubidaNivel[] } {
  const r: Criatura = structuredClone(c);
  const subidas: SubidaNivel[] = [];
  if (r.nivel >= NIVEL_MAX) return { criatura: r, subidas };
  r.exp += Math.max(0, Math.floor(cantidad));
  while (r.nivel < NIVEL_MAX && r.exp >= expParaNivel(r.nivel + 1)) {
    const maxAntes = vidaMaxima(r, datos);
    r.nivel += 1;
    const maxDespues = vidaMaxima(r, datos);
    if (r.vida > 0) r.vida += maxDespues - maxAntes;
    const aprendidos: string[] = [];
    const pendientes: string[] = [];
    for (const a of datos.especies[r.especie].aprende) {
      if (a.nivel !== r.nivel || r.movimientos.some((m) => m.id === a.movimiento)) continue;
      if (r.movimientos.length < MAX_MOVIMIENTOS) {
        r.movimientos.push({ id: a.movimiento, pp: datos.movimientos[a.movimiento].pp });
        aprendidos.push(a.movimiento);
      } else pendientes.push(a.movimiento);
    }
    subidas.push({ nivel: r.nivel, vida: r.vida, vidaMax: maxDespues, aprendidos, pendientes });
  }
  if (r.nivel >= NIVEL_MAX) r.exp = expParaNivel(NIVEL_MAX);
  return { criatura: r, subidas };
}

/** Sustituye el movimiento del hueco `indice` por uno nuevo. Devuelve una copia. */
export function aprenderMovimiento(c: Criatura, movimiento: string, indice: number, datos: DatosJuego): Criatura {
  if (indice < 0 || indice >= MAX_MOVIMIENTOS) throw new Error(`Hueco de movimiento no válido: ${indice}`);
  const r = structuredClone(c);
  r.movimientos[indice] = { id: movimiento, pp: datos.movimientos[movimiento].pp };
  return r;
}

/** Evoluciones que ya puede hacer. Más de una: evolución ramificada, elige el jugador. */
export function evolucionesPosibles(c: Criatura, datos: DatosJuego): Evolucion[] {
  return (datos.especies[c.especie].evoluciona ?? []).filter((e) => c.nivel >= e.nivel);
}

/** Evoluciona a la especie `a`, conservando la Vida perdida. Devuelve una copia. */
export function evolucionar(c: Criatura, a: string, datos: DatosJuego): Criatura {
  if (!evolucionesPosibles(c, datos).some((e) => e.a === a)) {
    throw new Error(`${c.especie} no puede evolucionar a ${a} al nivel ${c.nivel}`);
  }
  const perdida = vidaMaxima(c, datos) - c.vida;
  const r: Criatura = { ...structuredClone(c), especie: a };
  r.vida = Math.max(c.vida > 0 ? 1 : 0, vidaMaxima(r, datos) - perdida);
  return r;
}
