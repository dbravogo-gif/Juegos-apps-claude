// El simulador de partida (autor, 2026-11-25; skill `rpg`, paso «Check it»). Juega el recorrido de
// cada isla con el núcleo, sin render: en segundos dice con qué nivel se llega a cada jefe, cuánto
// dinero hay y la probabilidad de ganarle a la primera. Antes se medía jugando con render por
// software, a minutos por combate (APRENDIDO.md, 2026-11-24).
//
// Supuestos (salen en el informe, EQUILIBRIO.md):
// - Experiencia: la de cada salvaje y entrenador vencido, con las fórmulas del núcleo. Las salvajes
//   esperadas en cada zona = casillas de encuentros del camino más corto × la probabilidad por paso,
//   más unas cuantas buscadas según el perfil.
// - El equipo: la inicial y dos compañeras (líneas capturables en Lanzarote). La inicial se lleva
//   la mitad de la experiencia y cada compañera una cuarta parte.
// - El jugador del simulador ataca siempre con lo que más daño hace y bebe una poción por debajo
//   del 30 % de vida. No cambia de criatura: los porcentajes son algo pesimistas.

import {
  banquillo,
  criaturaEn,
  delAliado,
  iniciarCombate,
  reemplazar,
  refsVivas,
  resolverTurno,
  type Accion,
  type Campo,
  type EstadoCombate,
} from '../../src/core/combate';
import { crearCriatura } from '../../src/core/criatura';
import { calcularDanio } from '../../src/core/danio';
import { PROB_ENCUENTRO } from '../../src/core/encuentros';
import { calcularEstadisticas, vidaMaxima } from '../../src/core/estadisticas';
import type { Criatura } from '../../src/core/modelo';
import { DE_ENCUENTROS, TRANSITABLES, clave, construirMundo, deClave, enIsla } from '../../src/core/mundo';
import { expGanada, expParaNivel, formaAlNivel } from '../../src/core/progreso';
import { crearRng, type EstadoRng } from '../../src/core/rng';
import { DATOS_COMBATE_PRUEBA as DATOS, ESPECIE_INICIAL } from '../../src/data/combate-prueba';
import { equipoDeEntrenador } from '../../src/data/equipos';
import { ISLAS } from '../../src/data/islas';
import type { TipoInicial } from '../../src/data/pueblos';
import { RECORRIDOS, type Recorrido } from './ruta';

export const INICIALES: readonly TipoInicial[] = ['agua', 'planta', 'infernal', 'roca', 'tierra'];
export const PERFILES = ['directo', 'normal', 'completo'] as const;
export type Perfil = (typeof PERFILES)[number];
/** Salvajes que busca cada perfil en una zona con hierba, además de las del camino. */
const BUSCADAS: Record<Perfil, number> = { directo: 0, normal: 3, completo: 3 };
/** Las compañeras de la inicial: una de Aire (Ravich) y otra que cubra su punto flaco. */
const COMPANERAS: Record<TipoInicial, readonly [string, string]> = {
  agua: ['c032-1', 'c013-1'],
  planta: ['c032-1', 'c013-1'],
  infernal: ['c032-1', 'c037-1'],
  roca: ['c032-1', 'c037-1'],
  tierra: ['c032-1', 'c013-1'],
};
const NIVEL_INICIAL = 5;

/** El nivel que da esta experiencia acumulada. */
export function nivelDeExp(exp: number): number {
  let n = 1;
  while (n < 100 && exp >= expParaNivel(n + 1)) n++;
  return n;
}

/**
 * Las casillas de encuentros que hay que pisar como mínimo para llegar a cada zona, desde el
 * principio de la isla (camino de menos encuentros y, a igualdad, de menos pasos).
 */
export function encuentrosHasta(numero: number): Map<string, number> {
  const isla = ISLAS[numero]!;
  const m = construirMundo(isla.def);
  const ini = numero === 1 ? isla.def.inicio : isla.llegada;
  const k0 = enIsla(m, ini.zona, ini.x, ini.y);
  const coste = new Map<number, [number, number]>([[k0, [0, 0]]]);
  const cola: [number, number, number][] = [[0, 0, k0]];
  const pasa = (k: number) => {
    const c = m.casillas.get(k);
    return !!c && (TRANSITABLES.has(c.c) || c.c === 'X');
  };
  while (cola.length) {
    cola.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const [e, s, k] = cola.shift()!;
    const actual = coste.get(k)!;
    if (actual[0] < e || (actual[0] === e && actual[1] < s)) continue;
    const [x, y] = deClave(k);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const v = clave(x + dx, y + dy);
      if (!pasa(v)) continue;
      const ne = e + (DE_ENCUENTROS.has(m.casillas.get(v)!.c) ? 1 : 0);
      const ns = s + 1;
      const c = coste.get(v);
      if (!c || ne < c[0] || (ne === c[0] && ns < c[1])) {
        coste.set(v, [ne, ns]);
        cola.push([ne, ns, v]);
      }
    }
  }
  const porZona = new Map<string, number>();
  for (const [k, [e]] of coste) {
    const z = m.casillas.get(k)!.zona;
    porZona.set(z, Math.min(porZona.get(z) ?? Infinity, e));
  }
  return porZona;
}

/** La experiencia media de una salvaje de la zona (la tabla de encuentros, por su peso). */
function expSalvaje(numero: number, zona: string): number {
  const tabla = ISLAS[numero]!.encuentros[zona];
  if (!tabla?.length) return 0;
  const total = tabla.reduce((s, x) => s + x.peso, 0);
  const rng = crearRng(`salvaje-${zona}`);
  return tabla.reduce((s, x) => {
    const nivel = Math.round((x.nivel[0] + x.nivel[1]) / 2);
    return s + (x.peso / total) * expGanada(crearCriatura(DATOS, x.especie, nivel, rng), DATOS, false);
  }, 0);
}

function expEntrenador(numero: number, id: string, inicial: TipoInicial): number {
  const { rivales } = equipoDeEntrenador(id, ISLAS[numero]!.entrenadores, inicial, crearRng(`exp-${id}`));
  return rivales.reduce((s, c) => s + expGanada(c, DATOS, true), 0);
}

export interface Hito {
  isla: number;
  jefe: string;
  /** Niveles del rival (y del otro líder, en el dos contra dos). */
  nivelesRival: number[];
  salvajes: number;
  entrenadores: number;
  dinero: number;
  /** Si toda la experiencia fuera a una sola criatura. */
  nivelSola: number;
  /** La inicial (la mitad de la experiencia) y cada compañera (una cuarta parte). */
  nivelInicial: number;
  nivelCompanera: number;
}

/** Recorre las islas acumulando experiencia y dinero, y anota cómo se llega a cada jefe. */
export function progresion(perfil: Perfil, inicial: TipoInicial): Hito[] {
  const hitos: Hito[] = [];
  let pool = 0;
  let salvajes = 0;
  let entrenadores = 0;
  let dinero = 0;
  const base = expParaNivel(NIVEL_INICIAL);
  for (const r of RECORRIDOS) {
    const hasta = encuentrosHasta(r.isla);
    const caminos = r.tramos.filter((t) => !t.opcional);
    for (const t of r.tramos) {
      if (t.opcional && perfil !== 'completo') continue;
      // Las del camino: lo que cuesta cruzarla hasta la siguiente zona del recorrido.
      const i = caminos.indexOf(t);
      const siguiente = i >= 0 ? caminos[i + 1] : undefined;
      const forzadas = siguiente && hasta.has(siguiente.zona) && hasta.has(t.zona) ? Math.max(0, hasta.get(siguiente.zona)! - hasta.get(t.zona)!) : 0;
      const hayHierba = !!ISLAS[r.isla]!.encuentros[t.zona]?.length;
      const n = hayHierba ? (forzadas * PROB_ENCUENTRO) / 100 + BUSCADAS[perfil] : 0;
      pool += n * expSalvaje(r.isla, t.zona);
      salvajes += n;
      for (const e of t.entrenadores) {
        if (perfil === 'directo' && !e.forzoso) continue;
        if (r.jefes.includes(e.id)) {
          const { rivales, pareja } = equipoDeEntrenador(e.id, ISLAS[r.isla]!.entrenadores, inicial, crearRng(`hito-${e.id}`));
          hitos.push({
            isla: r.isla,
            jefe: e.id,
            nivelesRival: [...rivales, ...(pareja?.delOtro ?? [])].map((c) => c.nivel),
            salvajes: Math.round(salvajes),
            entrenadores,
            dinero,
            nivelSola: nivelDeExp(base + pool),
            nivelInicial: nivelDeExp(base + pool / 2),
            nivelCompanera: nivelDeExp(base + pool / 4),
          });
        }
        pool += expEntrenador(r.isla, e.id, inicial);
        dinero += ISLAS[r.isla]!.entrenadores[e.id]!.premio;
        entrenadores++;
      }
    }
  }
  return hitos;
}

/** La sala de cada entrenador de gimnasio, para su campo (tormenta de arena, viento…). */
function campoDe(numero: number, id: string): Campo | undefined {
  const isla = ISLAS[numero]!;
  const sala = isla.interiores.find((s) => s.personajes.some((p) => p.id === id))?.id;
  return sala ? isla.campos?.[sala] : undefined;
}

/** El jugador del simulador: con lo que más daño hace y, por debajo del 30 % de vida, una poción. */
function decidir(e: EstadoCombate, pociones: { n: number; objeto: string }): (Accion | null)[] {
  const l = e.lados[0];
  return l.activos.map((i, hueco) => {
    if (i < 0 || delAliado(l, i)) return null;
    const c = l.equipo[i];
    if (!c || c.vida <= 0) return null;
    if (pociones.n > 0 && c.vida < vidaMaxima(c, DATOS) * 0.3) {
      pociones.n--;
      return { tipo: 'objeto', objeto: pociones.objeto, objetivo: i };
    }
    const rivales = refsVivas(e, 1);
    let mejor: Accion | null = null;
    let max = -1;
    c.movimientos.forEach((m, indice) => {
      if (m.pp <= 0) return;
      const mov = DATOS.movimientos[m.id]!;
      for (const obj of rivales) {
        const d = mov.categoria === 'estado' ? 0 : calcularDanio({ criatura: c, etapas: l.etapas[hueco]! }, { criatura: criaturaEn(e, obj)!, etapas: e.lados[1].etapas[obj.hueco]! }, mov, DATOS, false, 92, 1).danio * ((mov.precision ?? 100) / 100);
        if (d > max) {
          max = d;
          mejor = { tipo: 'movimiento', indice, objetivo: obj };
        }
      }
    });
    return mejor ?? { tipo: 'movimiento', indice: 0, objetivo: rivales[0]! };
  });
}

/** Un combate hasta el final: ¿gana el jugador? */
function luchar(equipo: Criatura[], rivales: Criatura[], rng: EstadoRng, op: { campo?: Campo; aliado?: Criatura[]; rebeldes?: string[]; pociones: { n: number; objeto: string } }): boolean {
  const aliado = op.aliado ?? [];
  const dos = aliado.length > 0;
  let r = iniciarCombate(
    {
      equipos: [[...equipo, ...aliado], rivales],
      formato: dos ? 2 : 1,
      salvaje: false,
      control: ['jugador', 'ia'],
      rng,
      experiencia: false,
      rebeldes: op.rebeldes,
      ...(op.campo ? { campo: op.campo } : {}),
      ...(dos ? { aliadoDesde: equipo.length, activosIniciales: [[0, equipo.length], [0, 1]] as [number[], number[]] } : {}),
    },
    DATOS,
  );
  for (let turno = 0; turno < 300 && !r.estado.fin; turno++) {
    while (r.estado.pendientes.length && !r.estado.fin) {
      const ref = r.estado.pendientes[0]!;
      const libres = banquillo(r.estado, ref.lado).filter((j) => ref.lado !== 0 || !delAliado(r.estado.lados[0], j));
      if (libres[0] === undefined) return false;
      r = reemplazar(r.estado, ref, libres[0], DATOS);
    }
    if (r.estado.fin) break;
    r = resolverTurno(r.estado, { 0: decidir(r.estado, op.pociones) }, DATOS);
  }
  return r.estado.fin === 'victoria';
}

/** El equipo del jugador a esos niveles: la inicial y sus dos compañeras, en la forma de su nivel. */
function equipoJugador(inicial: TipoInicial, nivelInicial: number, nivelCompanera: number, rng: EstadoRng): Criatura[] {
  const [a, b] = COMPANERAS[inicial];
  return [
    crearCriatura(DATOS, formaAlNivel(DATOS, ESPECIE_INICIAL[inicial]!, nivelInicial), nivelInicial, rng),
    crearCriatura(DATOS, formaAlNivel(DATOS, a, nivelCompanera), nivelCompanera, rng),
    crearCriatura(DATOS, formaAlNivel(DATOS, b, nivelCompanera), nivelCompanera, rng),
  ];
}

/** Probabilidad (0 a 1) de ganar a un jefe a la primera, con N combates de semilla distinta. */
export function probabilidadDeGanar(isla: number, jefe: string, inicial: TipoInicial, nivelInicial: number, nivelCompanera: number, n = 100): number {
  const pociones = isla >= 3 ? { n: 3, objeto: 'superpocion' } : { n: 3, objeto: 'pocion' };
  let ganadas = 0;
  for (let k = 0; k < n; k++) {
    const rng = crearRng(`sim-${jefe}-${inicial}-${nivelInicial}-${nivelCompanera}-${k}`);
    const equipo = equipoJugador(inicial, nivelInicial, nivelCompanera, rng);
    const { rivales, pareja } = equipoDeEntrenador(jefe, ISLAS[isla]!.entrenadores, inicial, rng);
    if (luchar(equipo, [...rivales, ...(pareja?.delOtro ?? [])], rng, { campo: campoDe(isla, jefe), aliado: pareja?.aliado, pociones: { ...pociones } })) ganadas++;
  }
  return ganadas / n;
}

/** El primer combate: la inicial sola a nivel 5, que aún desobedece (hasta el anciano), y 2 pociones. */
export function probabilidadPrimerCombate(inicial: TipoInicial, n = 300): number {
  let ganadas = 0;
  for (let k = 0; k < n; k++) {
    const rng = crearRng(`primero-${inicial}-${k}`);
    const mia = crearCriatura(DATOS, ESPECIE_INICIAL[inicial]!, NIVEL_INICIAL, rng);
    const { rivales } = equipoDeEntrenador('entrenador-barrera', ISLAS[1]!.entrenadores, inicial, rng);
    if (luchar([mia], rivales, rng, { rebeldes: [mia.uid], pociones: { n: 2, objeto: 'pocion' } })) ganadas++;
  }
  return ganadas / n;
}

const SIN_ETAPAS = { fuerza: 0, escudo: 0, magia: 0, resMagica: 0, celeridad: 0, precision: 0, evasion: 0 };

/** El daño medio del mejor ataque de `a` contra `b` (sin críticos, tirada media, con su precisión). */
function mejorDanio(a: Criatura, b: Criatura): number {
  return Math.max(
    1,
    ...a.movimientos.map((m) => {
      const mov = DATOS.movimientos[m.id]!;
      return mov.categoria === 'estado' ? 0 : calcularDanio({ criatura: a, etapas: SIN_ETAPAS }, { criatura: b, etapas: SIN_ETAPAS }, mov, DATOS, false, 92, 1).danio * ((mov.precision ?? 100) / 100);
    }),
  );
}

/** La suma de las estadísticas base de una forma: lo fuerte que es la especie, sin contar el nivel. */
export function sumaBase(especie: string): number {
  return Object.values(DATOS.especies[especie]!.base).reduce((s, x) => s + x, 0);
}

export interface Golpes {
  rival: string;
  nivel: number;
  sumaBase: number;
  /** Golpes de tu inicial para tumbarla y golpes suyos para tumbar a tu inicial. */
  tuyos: number;
  suyos: number;
}

/**
 * La tabla de golpes de la skill `rpg`: tu inicial a ese nivel contra cada criatura del jefe.
 * Objetivo orientativo: un rival normal cae en 2 a 4 golpes y tú aguantas de 5 a 8.
 */
export function golpesContra(isla: number, jefe: string, inicial: TipoInicial, nivel: number): { tuya: { nombre: string; sumaBase: number }; filas: Golpes[] } {
  const rng = crearRng(`golpes-${jefe}-${inicial}`);
  const yo = crearCriatura(DATOS, formaAlNivel(DATOS, ESPECIE_INICIAL[inicial]!, nivel), nivel, rng);
  const { rivales, pareja } = equipoDeEntrenador(jefe, ISLAS[isla]!.entrenadores, inicial, rng);
  const vida = (c: Criatura) => calcularEstadisticas(c, DATOS).vida;
  return {
    tuya: { nombre: DATOS.especies[yo.especie]!.nombre, sumaBase: sumaBase(yo.especie) },
    filas: [...rivales, ...(pareja?.delOtro ?? [])].map((r) => ({
      rival: DATOS.especies[r.especie]!.nombre,
      nivel: r.nivel,
      sumaBase: sumaBase(r.especie),
      tuyos: Math.ceil(vida(r) / mejorDanio(yo, r)),
      suyos: Math.ceil(vida(yo) / mejorDanio(r, yo)),
    })),
  };
}

/** Los recorridos, para las pruebas. */
export function recorridos(): readonly Recorrido[] {
  return RECORRIDOS;
}
