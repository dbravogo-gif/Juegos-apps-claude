import type { Criatura, DatosJuego } from './modelo';
import { vidaMaxima } from './estadisticas';

export const NIVEL_MAX = 100;
export const MAX_MOVIMIENTOS = 4;

/** Curva de experiencia «media» de Pokémon: nivel al cubo. */
export function expParaNivel(nivel: number): number {
  return nivel <= 1 ? 0 : nivel ** 3;
}

export function expGanada(derrotado: Criatura, datos: DatosJuego, deEntrenador: boolean): number {
  const especie = datos.especies[derrotado.especie];
  const base = Math.floor((especie.expBase * derrotado.nivel) / 7);
  return Math.max(1, Math.floor(base * (deEntrenador ? 1.5 : 1)));
}

/** Movimientos que la especie aprende exactamente en ese nivel. */
export function movimientosDeNivel(datos: DatosJuego, especie: string, nivel: number): string[] {
  return datos.especies[especie].aprende.filter((a) => a.nivel === nivel).map((a) => a.movimiento);
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
 * Suma experiencia y sube los niveles que toque. Devuelve una copia de la criatura. Al subir de
 * nivel la Vida actual crece lo mismo que la máxima, como en Pokémon.
 */
export function aplicarExperiencia(
  c: Criatura,
  cantidad: number,
  datos: DatosJuego,
): { criatura: Criatura; subidas: SubidaNivel[] } {
  const r: Criatura = structuredClone(c);
  const subidas: SubidaNivel[] = [];
  if (r.nivel >= NIVEL_MAX) return { criatura: r, subidas };
  r.exp += cantidad;
  while (r.nivel < NIVEL_MAX && r.exp >= expParaNivel(r.nivel + 1)) {
    const maxAntes = vidaMaxima(r, datos);
    r.nivel += 1;
    const maxDespues = vidaMaxima(r, datos);
    if (r.vida > 0) r.vida += maxDespues - maxAntes;
    const aprendidos: string[] = [];
    const pendientes: string[] = [];
    for (const mov of movimientosDeNivel(datos, r.especie, r.nivel)) {
      if (r.movimientos.some((m) => m.id === mov)) continue;
      if (r.movimientos.length < MAX_MOVIMIENTOS) {
        r.movimientos.push({ id: mov, pp: datos.movimientos[mov].pp });
        aprendidos.push(mov);
      } else {
        pendientes.push(mov);
      }
    }
    subidas.push({ nivel: r.nivel, vida: r.vida, vidaMax: maxDespues, aprendidos, pendientes });
  }
  if (r.nivel >= NIVEL_MAX) r.exp = expParaNivel(NIVEL_MAX);
  return { criatura: r, subidas };
}

/** Sustituye el movimiento en `indice` por `movimiento`, con los PP llenos. */
export function aprenderMovimiento(c: Criatura, movimiento: string, indice: number, datos: DatosJuego): Criatura {
  const r: Criatura = structuredClone(c);
  const nuevo = { id: movimiento, pp: datos.movimientos[movimiento].pp };
  if (indice >= r.movimientos.length) r.movimientos.push(nuevo);
  else r.movimientos[indice] = nuevo;
  return r;
}

/** Especie a la que evolucionaría ahora, o `null`. */
/** Especie a la que evoluciona por nivel, si ya le toca. */
export function evolucionPendiente(c: Criatura, datos: DatosJuego): string | null {
  const evo = datos.especies[c.especie].evoluciona;
  return evo && evo.nivel !== undefined && c.nivel >= evo.nivel ? evo.a : null;
}

/** Especie a la que evoluciona con ese objeto, o `null` si el objeto no le hace nada. */
export function destinoConObjeto(c: Criatura, objeto: string, datos: DatosJuego): string | null {
  const evo = datos.especies[c.especie].evoluciona;
  return evo && evo.objeto === objeto ? evo.a : null;
}

/**
 * Evoluciona conservando la Vida perdida: la nueva Vida máxima suma su diferencia. Sin
 * `destino`, evoluciona por nivel si le toca.
 */
export function evolucionar(c: Criatura, datos: DatosJuego, destino = evolucionPendiente(c, datos)): Criatura {
  if (!destino) return structuredClone(c);
  const r: Criatura = structuredClone(c);
  const maxAntes = vidaMaxima(r, datos);
  r.especie = destino;
  const maxDespues = vidaMaxima(r, datos);
  if (r.vida > 0) r.vida = Math.min(maxDespues, r.vida + (maxDespues - maxAntes));
  return r;
}

/** Sube exactamente un nivel, como con un Turrón. */
export function subirNivel(c: Criatura, datos: DatosJuego): { criatura: Criatura; subidas: SubidaNivel[] } {
  if (c.nivel >= NIVEL_MAX) return { criatura: structuredClone(c), subidas: [] };
  return aplicarExperiencia(c, expParaNivel(c.nivel + 1) - c.exp, datos);
}
