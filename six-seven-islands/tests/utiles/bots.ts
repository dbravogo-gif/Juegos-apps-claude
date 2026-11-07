// Bots que juegan con el estado, no con los píxeles (skill juego-3d).
import {
  banquillo,
  criaturaEn,
  refsVivas,
  reemplazar,
  resolverTurno,
  type Accion,
  type Decisiones,
  type EstadoCombate,
  type Evento,
  type IdLado,
} from '../../src/core/combate';
import type { DatosJuego } from '../../src/core/modelo';
import { elegir, entero, probabilidad, type EstadoRng } from '../../src/core/rng';

/** Una acción válida al azar para cada hueco en pie de un lado controlado por un jugador. */
export function decidirAlAzar(e: EstadoCombate, lado: IdLado, rng: EstadoRng, _datos: DatosJuego): (Accion | null)[] {
  const acciones: (Accion | null)[] = e.lados[lado].activos.map(() => null);
  const usados: number[] = [];
  for (const ref of refsVivas(e, lado)) {
    const c = criaturaEn(e, ref)!;
    const rivales = refsVivas(e, lado === 0 ? 1 : 0);
    const libres = banquillo(e, lado).filter((i) => !usados.includes(i));
    let a: Accion;
    if (e.salvaje && rivales.length === 1 && probabilidad(rng, 10)) {
      a = { tipo: 'objeto', objeto: 'basica', calidad: entero(rng, 0, 100) / 100 };
    } else if (e.salvaje && probabilidad(rng, 4)) a = { tipo: 'huir' };
    else if (libres.length && probabilidad(rng, 8)) {
      const indice = elegir(rng, libres);
      usados.push(indice);
      a = { tipo: 'cambio', indice };
    } else {
      const conPP = c.movimientos.map((m, i) => ({ m, i })).filter((x) => x.m.pp > 0);
      a = { tipo: 'movimiento', indice: conPP.length ? elegir(rng, conPP).i : 0, objetivo: elegir(rng, rivales) };
    }
    acciones[ref.hueco] = a;
  }
  return acciones;
}

export interface Partida {
  estado: EstadoCombate;
  eventos: Evento[];
  decisiones: Decisiones[];
  turnos: number;
}

/** Juega hasta el final (o `maxTurnos`) y registra las decisiones para poder repetirlo. */
export function jugarHastaElFinal(
  inicial: EstadoCombate,
  datos: DatosJuego,
  rngBot: EstadoRng,
  maxTurnos = 400,
  alTurno?: (e: EstadoCombate) => void,
): Partida {
  let estado = inicial;
  const eventos: Evento[] = [];
  const decisiones: Decisiones[] = [];
  let turnos = 0;
  while (!estado.fin && turnos < maxTurnos) {
    while (estado.pendientes.length) {
      const ref = estado.pendientes[0];
      const r = reemplazar(estado, ref, banquillo(estado, ref.lado)[0], datos);
      estado = r.estado;
      eventos.push(...r.eventos);
    }
    const d: Decisiones = {};
    for (const lado of [0, 1] as IdLado[]) if (estado.lados[lado].control === 'jugador') d[lado] = decidirAlAzar(estado, lado, rngBot, datos);
    decisiones.push(d);
    const r = resolverTurno(estado, d, datos);
    estado = r.estado;
    eventos.push(...r.eventos);
    turnos++;
    alTurno?.(estado);
  }
  return { estado, eventos, decisiones, turnos };
}

/** Repite un combate con las decisiones registradas (como haría el otro jugador por la red). */
export function repetir(inicial: EstadoCombate, decisiones: Decisiones[], datos: DatosJuego): Partida {
  let estado = inicial;
  const eventos: Evento[] = [];
  for (const d of decisiones) {
    while (estado.pendientes.length) {
      const ref = estado.pendientes[0];
      const r = reemplazar(estado, ref, banquillo(estado, ref.lado)[0], datos);
      estado = r.estado;
      eventos.push(...r.eventos);
    }
    const r = resolverTurno(estado, d, datos);
    estado = r.estado;
    eventos.push(...r.eventos);
  }
  return { estado, eventos, decisiones, turnos: decisiones.length };
}
