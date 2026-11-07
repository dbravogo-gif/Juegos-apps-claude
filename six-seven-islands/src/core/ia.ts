// Decisiones de los lados que maneja la máquina. Usa el generador del combate, así que dos
// jugadores que resuelven el mismo combate obtienen las mismas decisiones de la IA.

import { banquillo, criaturaEn, objetivoDe, refsVivas, type Accion, type EstadoCombate, type IdLado, type Ref } from './combate';
import { calcularDanio, MULT_VARIOS_OBJETIVOS } from './danio';
import { vidaMaxima } from './estadisticas';
import type { DatosJuego, Movimiento } from './modelo';
import { elegir, entero } from './rng';

/** Estimación rápida, sin crítico y con la tirada media. */
function danioEstimado(e: EstadoCombate, ref: Ref, obj: Ref, mov: Movimiento, extra: number, datos: DatosJuego): number {
  const at = { criatura: criaturaEn(e, ref)!, etapas: e.lados[ref.lado].etapas[ref.hueco] };
  const def = { criatura: criaturaEn(e, obj)!, etapas: e.lados[obj.lado].etapas[obj.hueco] };
  return calcularDanio(at, def, mov, datos, false, 92, extra).danio;
}

/** Puntuación de usar `mov` contra `obj`: fracción de Vida que quita, más un premio si debilita. */
function puntuar(e: EstadoCombate, ref: Ref, obj: Ref, mov: Movimiento, datos: DatosJuego): number {
  const precision = (mov.precision ?? 100) / 100;
  const c = criaturaEn(e, ref)!;
  const destino = objetivoDe(mov);
  if (mov.categoria !== 'estado') {
    const objetivos = destino === 'rivales' ? refsVivas(e, obj.lado) : [obj];
    const extra = objetivos.length > 1 ? MULT_VARIOS_OBJETIVOS : 1;
    let total = 0;
    for (const o of objetivos) {
      const d = criaturaEn(e, o)!;
      const danio = danioEstimado(e, ref, o, mov, extra, datos);
      total += Math.min(danio, d.vida) / vidaMaxima(d, datos) + (danio >= d.vida ? 0.5 : 0);
    }
    return total * precision;
  }
  const d = criaturaEn(e, obj)!;
  let p = 0;
  for (const f of mov.efectos ?? []) {
    if (f.tipo === 'estado' && !d.estado) p += 0.35;
    if (f.tipo === 'etapa') p += f.a === 'propio' ? (e.lados[ref.lado].etapas[ref.hueco][f.estadistica] < 2 ? 0.2 : 0) : 0.15;
    if (f.tipo === 'curar') p += c.vida < vidaMaxima(c, datos) / 2 ? 0.6 : 0;
    if (f.tipo === 'proteger') p += 0.1;
  }
  return p * precision;
}

/**
 * Solo la llama resolverTurno, sobre su copia del estado: consume el generador del combate. Si
 * otro código la llamara sobre el estado en vivo, los jugadores online se desincronizarían.
 */
export function elegirAccionIA(e: EstadoCombate, ref: Ref, datos: DatosJuego): Accion {
  const c = criaturaEn(e, ref)!;
  const rivales = refsVivas(e, ref.lado === 0 ? 1 : 0);
  const usables = c.movimientos.map((m, indice) => ({ m, indice })).filter((x) => x.m.pp > 0);
  if (usables.length === 0) return { tipo: 'movimiento', indice: 0, objetivo: rivales[0] };
  // Las salvajes eligen al azar.
  if (e.salvaje && ref.lado === 1) {
    return { tipo: 'movimiento', indice: elegir(e.rng, usables).indice, objetivo: elegir(e.rng, rivales) };
  }
  let mejor: Accion = { tipo: 'movimiento', indice: usables[0].indice, objetivo: rivales[0] };
  let maxPuntos = -Infinity;
  for (const { m, indice } of usables) {
    const mov = datos.movimientos[m.id];
    const objetivos = objetivoDe(mov) === 'uno' ? rivales : rivales.slice(0, 1);
    for (const obj of objetivos) {
      // Un poco de ruido para no ser previsible; sale del generador, así que es reproducible.
      const puntos = puntuar(e, ref, obj, mov, datos) + entero(e.rng, 0, 99) / 2000;
      if (puntos > maxPuntos) {
        maxPuntos = puntos;
        mejor = { tipo: 'movimiento', indice, objetivo: obj };
      }
    }
  }
  return mejor;
}

/** La primera criatura disponible del banquillo. */
export function elegirReemplazoIA(e: EstadoCombate, lado: IdLado, libres: number[], _datos: DatosJuego): number {
  return libres[0] ?? banquillo(e, lado)[0];
}
