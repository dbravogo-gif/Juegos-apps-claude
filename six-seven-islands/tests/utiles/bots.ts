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
  type Ref,
} from '../../src/core/combate';
import { objetoUtil } from '../../src/core/criatura';
import type { DatosJuego } from '../../src/core/modelo';
import { elegir, entero, probabilidad, type EstadoRng } from '../../src/core/rng';

const CURAS = ['pocion', 'antidoto', 'revivir'];

/** Una decisión válida al azar para cada hueco en pie de un lado controlado por un jugador. */
export function decidirAlAzar(e: EstadoCombate, lado: IdLado, rng: EstadoRng, datos: DatosJuego): (Accion | null)[] {
  const acciones: (Accion | null)[] = e.lados[lado].activos.map(() => null);
  const salen: number[] = [];
  const curados: number[] = [];
  let capturaLanzada = false;
  for (const ref of refsVivas(e, lado)) {
    const c = criaturaEn(e, ref)!;
    const rivales = refsVivas(e, lado === 0 ? 1 : 0);
    const libres = banquillo(e, lado).filter((i) => !salen.includes(i));
    const curas = e.lados[lado].equipo.flatMap((cr, i) =>
      curados.includes(i) ? [] : CURAS.filter((o) => objetoUtil(cr, o, datos)).map((objeto) => ({ objeto, objetivo: i })),
    );
    let a: Accion;
    if (e.salvaje && rivales.length === 1 && !capturaLanzada && probabilidad(rng, 10)) {
      capturaLanzada = true;
      a = { tipo: 'objeto', objeto: 'basica', calidad: entero(rng, 0, 100) / 100 };
    } else if (e.salvaje && probabilidad(rng, 4)) a = { tipo: 'huir' };
    else if (curas.length && probabilidad(rng, 12)) {
      const cura = elegir(rng, curas);
      curados.push(cura.objetivo);
      a = { tipo: 'objeto', ...cura };
    } else if (libres.length && probabilidad(rng, 8)) {
      const indice = elegir(rng, libres);
      salen.push(indice);
      a = { tipo: 'cambio', indice };
    } else {
      const conPP = c.movimientos.map((m, i) => ({ m, i })).filter((x) => x.m.pp > 0);
      a = { tipo: 'movimiento', indice: conPP.length ? elegir(rng, conPP).i : 0, objetivo: elegir(rng, rivales) };
    }
    acciones[ref.hueco] = a;
  }
  return acciones;
}

/** Lo que viaja por la red: las decisiones de cada turno y la elección de cada reemplazo. */
export type Paso = { tipo: 'turno'; decisiones: Decisiones } | { tipo: 'reemplazo'; ref: Ref; indice: number };

export interface Partida {
  estado: EstadoCombate;
  eventos: Evento[];
  pasos: Paso[];
  turnos: number;
}

/**
 * Juega hasta el final (o `maxTurnos`) y registra los pasos para poder repetirlo. `alPaso` recibe
 * el estado antes y después de cada paso (para comprobar invariantes y que no se modifica).
 */
export function jugarHastaElFinal(
  inicial: EstadoCombate,
  datos: DatosJuego,
  rngBot: EstadoRng,
  maxTurnos = 400,
  alPaso?: (antes: EstadoCombate, despues: EstadoCombate, copiaAntes: string) => void,
): Partida {
  let estado = inicial;
  const eventos: Evento[] = [];
  const pasos: Paso[] = [];
  let turnos = 0;
  const aplicar = (paso: Paso) => {
    const copia = JSON.stringify(estado);
    const r =
      paso.tipo === 'turno' ? resolverTurno(estado, paso.decisiones, datos) : reemplazar(estado, paso.ref, paso.indice, datos);
    alPaso?.(estado, r.estado, copia);
    pasos.push(paso);
    estado = r.estado;
    eventos.push(...r.eventos);
  };
  while (!estado.fin && turnos < maxTurnos) {
    while (estado.pendientes.length) {
      const ref = estado.pendientes[0];
      aplicar({ tipo: 'reemplazo', ref, indice: elegir(rngBot, banquillo(estado, ref.lado)) });
    }
    const decisiones: Decisiones = {};
    for (const lado of [0, 1] as IdLado[]) if (estado.lados[lado].control === 'jugador') decisiones[lado] = decidirAlAzar(estado, lado, rngBot, datos);
    aplicar({ tipo: 'turno', decisiones });
    turnos++;
  }
  return { estado, eventos, pasos, turnos };
}

/**
 * Repite un combate con los pasos registrados, como haría el otro jugador por la red: el estado
 * se serializa y se vuelve a leer en cada paso, igual que si viajara.
 */
export function repetir(inicial: EstadoCombate, pasos: Paso[], datos: DatosJuego): Partida {
  let estado: EstadoCombate = JSON.parse(JSON.stringify(inicial));
  const eventos: Evento[] = [];
  for (const paso of JSON.parse(JSON.stringify(pasos)) as Paso[]) {
    const r =
      paso.tipo === 'turno' ? resolverTurno(estado, paso.decisiones, datos) : reemplazar(estado, paso.ref, paso.indice, datos);
    estado = JSON.parse(JSON.stringify(r.estado));
    eventos.push(...r.eventos);
  }
  return { estado, eventos, pasos, turnos: pasos.filter((p) => p.tipo === 'turno').length };
}
