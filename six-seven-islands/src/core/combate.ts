// Combate por turnos N contra N: cada lado tiene 1 o 2 huecos activos. Es una función pura:
// (estado, decisiones) → (estado nuevo, eventos). El estado es JSON plano y lleva su generador,
// así que dos jugadores con el mismo estado y las mismas decisiones llegan al mismo resultado:
// por la red solo viajan las decisiones (DISENO.md, «Con amigos»).

import { intentarCaptura } from './captura';
import { nombreDe, objetoUtil, usarObjeto } from './criatura';
import { MULT_VARIOS_OBJETIVOS, PROB_CRITICO, calcularDanio, type Combatiente } from './danio';
import { calcularEstadisticas, multiplicadorEtapa, vidaMaxima } from './estadisticas';
import { elegirAccionIA, elegirReemplazoIA } from './ia';
import type {
  Criatura,
  DatosJuego,
  Efecto,
  EstadisticaCombate,
  EstadoAlterado,
  Etapas,
  Movimiento,
  ObjetivoMovimiento,
} from './modelo';
import { aplicarExperiencia, expGanada, type SubidaNivel } from './progreso';
import { entero, probabilidad, type EstadoRng } from './rng';

export type IdLado = 0 | 1;
export type Control = 'jugador' | 'ia';
/** Siempre desde el punto de vista del lado 0. */
export type ResultadoCombate = 'victoria' | 'derrota' | 'huida' | 'captura';

export interface Ref {
  lado: IdLado;
  hueco: number;
}

export interface Volatil {
  protegido: boolean;
  /** Veces seguidas que ha usado proteger con éxito. */
  usosProteger: number;
  retrocede: boolean;
  actuado: boolean;
}

export interface LadoCombate {
  equipo: Criatura[];
  /** Índice en `equipo` de la criatura de cada hueco; −1 si el hueco se ha quedado vacío. */
  activos: number[];
  /** Por hueco: se pierden al retirarse. */
  etapas: Etapas[];
  volatil: Volatil[];
  control: Control;
  /** Índices del equipo que han salido contra el rival actual: se reparten la experiencia. */
  participantes: number[];
}

export interface EstadoCombate {
  version: 1;
  rng: EstadoRng;
  turno: number;
  salvaje: boolean;
  /** Si el lado 0 gana experiencia (no en los retos entre amigos). */
  experiencia: boolean;
  lados: [LadoCombate, LadoCombate];
  /** Huecos de un lado controlado por un jugador que esperan su criatura de refresco. */
  pendientes: Ref[];
  intentosHuida: number;
  fin: ResultadoCombate | null;
  capturada: Criatura | null;
  /** Lado de la última criatura debilitada: desempata si caen a la vez las últimas de los dos. */
  ultimaCaida: IdLado | null;
}

export type Accion =
  /** `indice` del movimiento. Sin PP en ninguno, se usa el Empujón y el índice no importa. */
  | { tipo: 'movimiento'; indice: number; objetivo?: Ref }
  | { tipo: 'cambio'; indice: number }
  /** `objetivo`: índice del equipo propio (curas) o se ignora (captura). `calidad`: del lanzamiento. */
  | { tipo: 'objeto'; objeto: string; objetivo?: number; calidad?: number }
  | { tipo: 'huir' };

/** Una acción por hueco; `null` en los huecos vacíos o debilitados. */
export type Decisiones = Partial<Record<IdLado, (Accion | null)[]>>;

export interface FichaCombate {
  uid: string;
  especie: string;
  nombre: string;
  nivel: number;
  vida: number;
  vidaMax: number;
  estado: EstadoAlterado | null;
}

export type Evento =
  | { tipo: 'entrada'; ref: Ref; ficha: FichaCombate }
  | { tipo: 'retirada'; ref: Ref; nombre: string }
  | { tipo: 'usa'; ref: Ref; nombre: string; movimiento: string }
  | { tipo: 'noSeMueve'; ref: Ref; nombre: string; motivo: 'dormido' | 'paralizado' | 'retroceso' }
  | { tipo: 'despierta'; ref: Ref; nombre: string }
  | { tipo: 'falla'; ref: Ref; nombre: string }
  | { tipo: 'sinObjetivo'; ref: Ref }
  | { tipo: 'sinEfecto'; ref: Ref; nombre: string }
  | { tipo: 'protege'; ref: Ref; nombre: string }
  | { tipo: 'protegido'; ref: Ref; nombre: string }
  | { tipo: 'danio'; ref: Ref; cantidad: number; vida: number; vidaMax: number; eficacia: number; critico: boolean; causa: 'golpe' | 'retroceso' | 'quemadura' | 'veneno' }
  | { tipo: 'curacion'; ref: Ref; cantidad: number; vida: number; vidaMax: number }
  | { tipo: 'estado'; ref: Ref; nombre: string; estado: EstadoAlterado }
  | { tipo: 'etapa'; ref: Ref; nombre: string; estadistica: EstadisticaCombate; cambio: number }
  | { tipo: 'debilitado'; ref: Ref; nombre: string }
  | { tipo: 'experiencia'; indice: number; nombre: string; cantidad: number; subidas: SubidaNivel[] }
  | { tipo: 'objetoUsado'; lado: IdLado; objeto: string; objetivo: number | null }
  | { tipo: 'captura'; exito: boolean; sacudidas: number }
  | { tipo: 'huida'; exito: boolean }
  | { tipo: 'reemplazoPendiente'; ref: Ref }
  | { tipo: 'fin'; resultado: ResultadoCombate };

export interface Resultado {
  estado: EstadoCombate;
  eventos: Evento[];
}

export interface ParametrosCombate {
  equipos: [Criatura[], Criatura[]];
  /** Criaturas activas por lado: 1 (1 contra 1) o 2 (2 contra 2). */
  formato: 1 | 2;
  salvaje: boolean;
  control: [Control, Control];
  rng: EstadoRng;
  /** Si el lado 0 gana experiencia. Obligatorio: en los retos entre amigos, `false`. */
  experiencia: boolean;
}

/** Sin PP en ningún movimiento: golpe sin tipo y retroceso de un cuarto del daño. */
export const EMPUJON: Movimiento = {
  id: 'empujon',
  nombre: 'Empujón',
  tipo: '',
  categoria: 'fisico',
  poder: 50,
  precision: null,
  pp: 1,
};
/** Probabilidad de no moverse estando paralizado. */
export const PROB_PARALISIS = 25;

const etapasCero = (): Etapas => ({ fuerza: 0, escudo: 0, magia: 0, resMagica: 0, celeridad: 0 });
const volatilCero = (): Volatil => ({ protegido: false, usosProteger: 0, retrocede: false, actuado: false });
const vivo = (c: Criatura | undefined): c is Criatura => !!c && c.vida > 0;
const otro = (lado: IdLado): IdLado => (lado === 0 ? 1 : 0);

// ——— Consultas ———

export function criaturaEn(e: EstadoCombate, ref: Ref): Criatura | undefined {
  const lado = e.lados[ref.lado];
  const i = lado.activos[ref.hueco];
  return i === undefined || i < 0 ? undefined : lado.equipo[i];
}

/** Huecos con una criatura en pie. */
export function refsVivas(e: EstadoCombate, lado: IdLado): Ref[] {
  return e.lados[lado].activos
    .map((_, hueco) => ({ lado, hueco }))
    .filter((ref) => vivo(criaturaEn(e, ref)));
}

/** Índices del equipo que pueden salir al campo en un cambio. */
export function banquillo(e: EstadoCombate, lado: IdLado): number[] {
  const l = e.lados[lado];
  return l.equipo.map((_, i) => i).filter((i) => vivo(l.equipo[i]) && !l.activos.includes(i));
}

export function fichaDe(c: Criatura, datos: DatosJuego): FichaCombate {
  return {
    uid: c.uid,
    especie: c.especie,
    nombre: nombreDe(c, datos),
    nivel: c.nivel,
    vida: c.vida,
    vidaMax: vidaMaxima(c, datos),
    estado: c.estado?.tipo ?? null,
  };
}

export function objetivoDe(mov: Movimiento): ObjetivoMovimiento {
  if (mov.objetivo) return mov.objetivo;
  const alRival = (mov.efectos ?? []).some((f) => f.tipo === 'estado' || f.tipo === 'retroceso' || (f.tipo === 'etapa' && f.a === 'objetivo'));
  return mov.categoria === 'estado' && !alRival ? 'propio' : 'uno';
}

function sinPP(c: Criatura): boolean {
  return c.movimientos.every((m) => m.pp <= 0);
}

function celeridadEfectiva(e: EstadoCombate, ref: Ref, datos: DatosJuego): number {
  const c = criaturaEn(e, ref);
  if (!c) return 0;
  const v = calcularEstadisticas(c, datos).celeridad * multiplicadorEtapa(e.lados[ref.lado].etapas[ref.hueco].celeridad);
  return c.estado?.tipo === 'paralizado' ? v * 0.5 : v;
}

// ——— Inicio ———

export function iniciarCombate(p: ParametrosCombate, datos: DatosJuego): Resultado {
  const lados = p.equipos.map((equipo, l) => {
    const copia = structuredClone(equipo);
    const vivos = copia.map((_, i) => i).filter((i) => vivo(copia[i]));
    if (vivos.length === 0) throw new Error(`El lado ${l} no tiene ninguna criatura en pie`);
    const activos = vivos.slice(0, p.formato);
    return {
      equipo: copia,
      activos,
      etapas: activos.map(etapasCero),
      volatil: activos.map(volatilCero),
      control: p.control[l],
      participantes: [...activos],
    } satisfies LadoCombate;
  }) as [LadoCombate, LadoCombate];
  const e: EstadoCombate = {
    version: 1,
    rng: structuredClone(p.rng),
    turno: 0,
    salvaje: p.salvaje,
    experiencia: p.experiencia,
    lados,
    pendientes: [],
    intentosHuida: 0,
    fin: null,
    capturada: null,
    ultimaCaida: null,
  };
  const eventos: Evento[] = [];
  for (const lado of [1, 0] as IdLado[]) {
    e.lados[lado].activos.forEach((i, hueco) => eventos.push({ tipo: 'entrada', ref: { lado, hueco }, ficha: fichaDe(e.lados[lado].equipo[i], datos) }));
  }
  return { estado: e, eventos };
}

// ——— Validación ———

/** Lanza un error si la acción no se puede hacer desde ese hueco. */
export function validarAccion(e: EstadoCombate, ref: Ref, a: Accion, datos: DatosJuego): void {
  const c = criaturaEn(e, ref);
  if (!vivo(c)) throw new Error(`No hay criatura en pie en el hueco ${ref.lado}:${ref.hueco}`);
  const lado = e.lados[ref.lado];
  switch (a.tipo) {
    case 'movimiento': {
      if (sinPP(c)) return; // Empujón.
      const m = c.movimientos[a.indice];
      if (!m) throw new Error(`Movimiento ${a.indice} inexistente`);
      if (m.pp <= 0) throw new Error(`${m.id} no tiene PP`);
      if (a.objetivo && a.objetivo.lado === ref.lado) throw new Error('En esta versión no se ataca al propio lado');
      return;
    }
    case 'cambio':
      if (!banquillo(e, ref.lado).includes(a.indice)) throw new Error(`La criatura ${a.indice} no puede salir`);
      return;
    case 'huir':
      if (!e.salvaje) throw new Error('No se puede huir de un entrenador');
      return;
    case 'objeto': {
      const o = datos.objetos[a.objeto];
      if (!o) throw new Error(`Objeto desconocido: ${a.objeto}`);
      if (o.tipo === 'captura') {
        if (!e.salvaje) throw new Error('No se captura la criatura de un entrenador');
        if (refsVivas(e, otro(ref.lado)).length !== 1) throw new Error('Solo se captura cuando queda una criatura salvaje');
        return;
      }
      if (o.tipo === 'clave') throw new Error('Los objetos clave no se usan en combate');
      const objetivo = lado.equipo[a.objetivo ?? -1];
      if (!objetivo || !objetoUtil(objetivo, a.objeto, datos)) throw new Error(`${a.objeto} no sirve sobre esa criatura`);
      return;
    }
  }
}

/**
 * Valida las acciones de todos los huecos de un lado a la vez: además de cada una por separado,
 * que dos huecos no saquen a la misma criatura ni usen dos objetos sobre la misma. La interfaz la
 * usa antes de enviar las decisiones.
 */
export function validarDecisiones(e: EstadoCombate, lado: IdLado, acciones: (Accion | null | undefined)[], datos: DatosJuego): void {
  const cambios = new Set<number>();
  const curados = new Set<number>();
  for (const ref of refsVivas(e, lado)) {
    const a = acciones[ref.hueco];
    if (!a) throw new Error(`Falta la decisión del hueco ${lado}:${ref.hueco}`);
    validarAccion(e, ref, a, datos);
    if (a.tipo === 'cambio') {
      if (cambios.has(a.indice)) throw new Error(`La criatura ${a.indice} no puede salir a dos huecos`);
      cambios.add(a.indice);
    }
    if (a.tipo === 'objeto' && datos.objetos[a.objeto].tipo !== 'captura') {
      if (curados.has(a.objetivo!)) throw new Error('Dos objetos sobre la misma criatura en un turno');
      curados.add(a.objetivo!);
    }
    if (a.tipo === 'objeto' && datos.objetos[a.objeto].tipo === 'captura' && acciones.some((b, h) => h !== ref.hueco && b?.tipo === 'objeto' && datos.objetos[b.objeto].tipo === 'captura')) {
      throw new Error('Solo se lanza un objeto de captura por turno');
    }
  }
}

// ——— Turno ———

interface Turno {
  ref: Ref;
  accion: Accion;
  grupo: number;
  prioridad: number;
  celeridad: number;
  desempate: number;
}

const GRUPO: Record<Accion['tipo'], number> = { huir: 3, cambio: 2, objeto: 1, movimiento: 0 };

/** Resuelve un turno completo. No modifica el estado recibido. */
export function resolverTurno(estado: EstadoCombate, decisiones: Decisiones, datos: DatosJuego): Resultado {
  if (estado.fin) throw new Error('El combate ya ha terminado');
  if (estado.pendientes.length) throw new Error('Faltan criaturas de refresco: usa reemplazar()');
  const e: EstadoCombate = structuredClone(estado);
  const ev: Evento[] = [];
  e.turno += 1;

  const turnos: Turno[] = [];
  for (const lado of [0, 1] as IdLado[]) {
    const acciones: (Accion | null | undefined)[] =
      e.lados[lado].control === 'ia'
        ? e.lados[lado].activos.map((_, hueco) => (vivo(criaturaEn(e, { lado, hueco })) ? elegirAccionIA(e, { lado, hueco }, datos) : null))
        : (decisiones[lado] ?? []);
    validarDecisiones(e, lado, acciones, datos);
    for (const ref of refsVivas(e, lado)) {
      const accion = acciones[ref.hueco]!;
      const c = criaturaEn(e, ref)!;
      const mov = accion.tipo === 'movimiento' ? movimientoUsado(c, accion.indice, datos) : null;
      turnos.push({
        ref,
        accion,
        grupo: GRUPO[accion.tipo],
        prioridad: mov?.prioridad ?? 0,
        celeridad: celeridadEfectiva(e, ref, datos),
        desempate: entero(e.rng, 0, 0xffff),
      });
    }
  }
  turnos.sort((a, b) => b.grupo - a.grupo || b.prioridad - a.prioridad || b.celeridad - a.celeridad || b.desempate - a.desempate);

  for (const t of turnos) {
    if (e.fin) break;
    if (!vivo(criaturaEn(e, t.ref))) continue;
    actuar(e, t.ref, t.accion, datos, ev);
    comprobarFin(e, ev);
  }
  if (!e.fin) finDeTurno(e, datos, ev);
  if (!e.fin) prepararReemplazos(e, datos, ev);
  return { estado: e, eventos: ev };
}

/** Pone una criatura de refresco en un hueco pendiente de un lado controlado por un jugador. */
export function reemplazar(estado: EstadoCombate, ref: Ref, indice: number, datos: DatosJuego): Resultado {
  const p = estado.pendientes.findIndex((r) => r.lado === ref.lado && r.hueco === ref.hueco);
  if (p < 0) throw new Error(`El hueco ${ref.lado}:${ref.hueco} no espera reemplazo`);
  if (!banquillo(estado, ref.lado).includes(indice)) throw new Error(`La criatura ${indice} no puede salir`);
  const e: EstadoCombate = structuredClone(estado);
  const ev: Evento[] = [];
  e.pendientes.splice(p, 1);
  meter(e, ref, indice, datos, ev);
  return { estado: e, eventos: ev };
}

function movimientoUsado(c: Criatura, indice: number, datos: DatosJuego): Movimiento {
  return sinPP(c) ? EMPUJON : datos.movimientos[c.movimientos[indice].id];
}

function actuar(e: EstadoCombate, ref: Ref, a: Accion, datos: DatosJuego, ev: Evento[]): void {
  const lado = e.lados[ref.lado];
  switch (a.tipo) {
    case 'huir': {
      e.intentosHuida += 1;
      const max = (l: IdLado) => Math.max(1, ...refsVivas(e, l).map((r) => celeridadEfectiva(e, r, datos)));
      const propia = max(ref.lado);
      const rival = max(otro(ref.lado));
      const exito = propia >= rival || entero(e.rng, 0, 255) < Math.floor((propia * 128) / rival) + 30 * e.intentosHuida;
      ev.push({ tipo: 'huida', exito });
      if (exito) terminar(e, 'huida', ev);
      return;
    }
    case 'cambio': {
      const c = criaturaEn(e, ref)!;
      // Al retirarse, la intoxicación vuelve a empezar desde 1/16.
      if (c.estado?.tipo === 'intoxicado') c.estado.turnos = 1;
      ev.push({ tipo: 'retirada', ref, nombre: nombreDe(c, datos) });
      meter(e, ref, a.indice, datos, ev);
      return;
    }
    case 'objeto': {
      const o = datos.objetos[a.objeto];
      if (o.tipo === 'captura') {
        const presaRef = refsVivas(e, otro(ref.lado))[0];
        const presa = criaturaEn(e, presaRef)!;
        ev.push({ tipo: 'objetoUsado', lado: ref.lado, objeto: a.objeto, objetivo: null });
        const r = intentarCaptura(
          {
            vida: presa.vida,
            vidaMax: vidaMaxima(presa, datos),
            ratio: datos.especies[presa.especie].ratioCaptura,
            bonus: o.bonus,
            estado: presa.estado,
            calidad: a.calidad ?? 0.5,
          },
          e.rng,
        );
        ev.push({ tipo: 'captura', ...r });
        if (r.exito) {
          e.capturada = structuredClone(presa);
          terminar(e, 'captura', ev);
        }
        return;
      }
      const i = a.objetivo!;
      const antes = lado.equipo[i].vida;
      lado.equipo[i] = usarObjeto(lado.equipo[i], a.objeto, datos);
      ev.push({ tipo: 'objetoUsado', lado: ref.lado, objeto: a.objeto, objetivo: i });
      const hueco = lado.activos.indexOf(i);
      const c = lado.equipo[i];
      if (hueco >= 0 && c.vida !== antes) {
        ev.push({ tipo: 'curacion', ref: { lado: ref.lado, hueco }, cantidad: c.vida - antes, vida: c.vida, vidaMax: vidaMaxima(c, datos) });
      }
      return;
    }
    case 'movimiento':
      ejecutarMovimiento(e, ref, a, datos, ev);
  }
}

function meter(e: EstadoCombate, ref: Ref, indice: number, datos: DatosJuego, ev: Evento[]): void {
  const lado = e.lados[ref.lado];
  lado.activos[ref.hueco] = indice;
  lado.etapas[ref.hueco] = etapasCero();
  lado.volatil[ref.hueco] = volatilCero();
  if (!lado.participantes.includes(indice)) lado.participantes.push(indice);
  ev.push({ tipo: 'entrada', ref, ficha: fichaDe(lado.equipo[indice], datos) });
}

function ejecutarMovimiento(
  e: EstadoCombate,
  ref: Ref,
  a: Extract<Accion, { tipo: 'movimiento' }>,
  datos: DatosJuego,
  ev: Evento[],
): void {
  const c = criaturaEn(e, ref)!;
  const nombre = nombreDe(c, datos);
  const vol = e.lados[ref.lado].volatil[ref.hueco];
  vol.actuado = true;

  if (c.estado?.tipo === 'dormido') {
    c.estado.turnos -= 1;
    if (c.estado.turnos > 0) {
      ev.push({ tipo: 'noSeMueve', ref, nombre, motivo: 'dormido' });
      return;
    }
    c.estado = null;
    ev.push({ tipo: 'despierta', ref, nombre });
  }
  if (vol.retrocede) {
    ev.push({ tipo: 'noSeMueve', ref, nombre, motivo: 'retroceso' });
    return;
  }
  if (c.estado?.tipo === 'paralizado' && probabilidad(e.rng, PROB_PARALISIS)) {
    ev.push({ tipo: 'noSeMueve', ref, nombre, motivo: 'paralizado' });
    return;
  }

  const mov = movimientoUsado(c, a.indice, datos);
  if (mov !== EMPUJON) c.movimientos[a.indice].pp -= 1;
  ev.push({ tipo: 'usa', ref, nombre, movimiento: mov.id });
  const efectos = mov.efectos ?? [];

  if (efectos.some((f) => f.tipo === 'proteger')) {
    // Seguido sale cada vez peor: 1, 1/3, 1/9…
    if (probabilidad(e.rng, 100 / 3 ** vol.usosProteger)) {
      vol.protegido = true;
      vol.usosProteger += 1;
      ev.push({ tipo: 'protege', ref, nombre });
    } else ev.push({ tipo: 'falla', ref, nombre });
    return;
  }

  const destino = objetivoDe(mov);
  let alcanza = destino === 'propio';
  if (destino !== 'propio') {
    const objetivos = elegirObjetivos(e, ref, destino, a.objetivo);
    if (objetivos.length === 0) {
      ev.push({ tipo: 'sinObjetivo', ref });
      return;
    }
    const extra = objetivos.length > 1 ? MULT_VARIOS_OBJETIVOS : 1;
    for (const obj of objetivos) alcanza = golpear(e, ref, obj, mov, extra, datos, ev) || alcanza;
  }
  // Lo que el movimiento hace sobre quien lo usa, una sola vez y solo si ha alcanzado a alguien.
  if (vivo(c) && alcanza) {
    for (const f of efectos) {
      if (f.tipo === 'etapa' && f.a === 'propio' && probabilidad(e.rng, f.prob)) cambiarEtapa(e, ref, f.estadistica, f.cambio, datos, ev);
      if (f.tipo === 'curar') curar(e, ref, Math.floor(vidaMaxima(c, datos) * f.fraccion), datos, ev);
    }
  }
}

function elegirObjetivos(e: EstadoCombate, ref: Ref, destino: ObjetivoMovimiento, pedido?: Ref): Ref[] {
  const rivales = refsVivas(e, otro(ref.lado));
  if (destino === 'rivales') return rivales;
  // Si el objetivo elegido ya no está, el golpe va a otro rival en pie.
  const elegido = pedido && rivales.find((r) => r.hueco === pedido.hueco);
  return elegido ? [elegido] : rivales.slice(0, 1);
}

/** Devuelve si el movimiento ha alcanzado al objetivo (ni parado, ni fallado, ni sin efecto). */
function golpear(e: EstadoCombate, ref: Ref, obj: Ref, mov: Movimiento, extra: number, datos: DatosJuego, ev: Evento[]): boolean {
  const at = criaturaEn(e, ref)!;
  const def = criaturaEn(e, obj)!;
  const nombreDef = nombreDe(def, datos);
  if (e.lados[obj.lado].volatil[obj.hueco].protegido) {
    ev.push({ tipo: 'protegido', ref: obj, nombre: nombreDef });
    return false;
  }
  if (mov.precision !== null && !probabilidad(e.rng, mov.precision)) {
    ev.push({ tipo: 'falla', ref, nombre: nombreDe(at, datos) });
    return false;
  }
  const efectos = mov.efectos ?? [];
  if (mov.categoria !== 'estado') {
    const critico = probabilidad(e.rng, PROB_CRITICO);
    const tirada = entero(e.rng, 85, 100);
    const r = calcularDanio(combatiente(e, ref), combatiente(e, obj), mov, datos, critico, tirada, extra);
    if (r.eficacia === 0) {
      ev.push({ tipo: 'sinEfecto', ref: obj, nombre: nombreDef });
      return false;
    }
    const hecho = quitarVida(e, obj, r.danio, datos, ev, 'golpe', r.eficacia, r.critico);
    for (const f of efectos) if (f.tipo === 'drenar') curar(e, ref, Math.max(1, Math.floor(hecho * f.fraccion)), datos, ev);
    if (mov === EMPUJON) quitarVida(e, ref, Math.max(1, Math.floor(hecho / 4)), datos, ev, 'retroceso');
    if (vivo(def)) for (const f of efectos) efectoSecundario(e, obj, f, datos, ev);
    return true;
  }
  let algo = false;
  for (const f of efectos) algo = efectoSecundario(e, obj, f, datos, ev) || algo;
  if (!algo) ev.push({ tipo: 'sinEfecto', ref: obj, nombre: nombreDef });
  return algo;
}

/** Efecto sobre el objetivo. Devuelve si ha hecho algo. */
function efectoSecundario(e: EstadoCombate, obj: Ref, f: Efecto, datos: DatosJuego, ev: Evento[]): boolean {
  if (f.tipo === 'estado') return probabilidad(e.rng, f.prob) && provocarEstado(e, obj, f.estado, datos, ev);
  if (f.tipo === 'etapa' && f.a === 'objetivo') return probabilidad(e.rng, f.prob) && cambiarEtapa(e, obj, f.estadistica, f.cambio, datos, ev);
  if (f.tipo === 'retroceso') {
    const v = e.lados[obj.lado].volatil[obj.hueco];
    if (v.actuado || !probabilidad(e.rng, f.prob)) return false;
    v.retrocede = true;
    return true;
  }
  return false;
}

function combatiente(e: EstadoCombate, ref: Ref): Combatiente {
  return { criatura: criaturaEn(e, ref)!, etapas: e.lados[ref.lado].etapas[ref.hueco] };
}

function provocarEstado(e: EstadoCombate, ref: Ref, estado: EstadoAlterado, datos: DatosJuego, ev: Evento[]): boolean {
  const c = criaturaEn(e, ref);
  if (!vivo(c) || c.estado) return false;
  if (estado === 'dormido') c.estado = { tipo: 'dormido', turnos: entero(e.rng, 1, 3) + 1 };
  else if (estado === 'intoxicado') c.estado = { tipo: 'intoxicado', turnos: 1 };
  else c.estado = { tipo: estado };
  ev.push({ tipo: 'estado', ref, nombre: nombreDe(c, datos), estado });
  return true;
}

function cambiarEtapa(e: EstadoCombate, ref: Ref, est: EstadisticaCombate, cambio: number, datos: DatosJuego, ev: Evento[]): boolean {
  const etapas = e.lados[ref.lado].etapas[ref.hueco];
  const antes = etapas[est];
  etapas[est] = Math.max(-6, Math.min(6, antes + cambio));
  ev.push({ tipo: 'etapa', ref, nombre: nombreDe(criaturaEn(e, ref)!, datos), estadistica: est, cambio: etapas[est] - antes });
  return etapas[est] !== antes;
}

function curar(e: EstadoCombate, ref: Ref, cantidad: number, datos: DatosJuego, ev: Evento[]): void {
  const c = criaturaEn(e, ref);
  if (!vivo(c)) return;
  const max = vidaMaxima(c, datos);
  const real = Math.min(cantidad, max - c.vida);
  if (real <= 0) return;
  c.vida += real;
  ev.push({ tipo: 'curacion', ref, cantidad: real, vida: c.vida, vidaMax: max });
}

function quitarVida(
  e: EstadoCombate,
  ref: Ref,
  cantidad: number,
  datos: DatosJuego,
  ev: Evento[],
  causa: 'golpe' | 'retroceso' | 'quemadura' | 'veneno',
  eficacia = 1,
  critico = false,
): number {
  const c = criaturaEn(e, ref)!;
  const real = Math.min(c.vida, Math.max(1, cantidad));
  c.vida -= real;
  ev.push({ tipo: 'danio', ref, cantidad: real, vida: c.vida, vidaMax: vidaMaxima(c, datos), eficacia, critico, causa });
  if (c.vida === 0) debilitar(e, ref, datos, ev);
  return real;
}

function debilitar(e: EstadoCombate, ref: Ref, datos: DatosJuego, ev: Evento[]): void {
  const c = criaturaEn(e, ref)!;
  c.estado = null;
  e.ultimaCaida = ref.lado;
  ev.push({ tipo: 'debilitado', ref, nombre: nombreDe(c, datos) });
  if (ref.lado === 1 && e.experiencia) repartirExperiencia(e, c, datos, ev);
}

/** La experiencia de un rival caído se reparte entre las criaturas del lado 0 que salieron contra él. */
function repartirExperiencia(e: EstadoCombate, derrotado: Criatura, datos: DatosJuego, ev: Evento[]): void {
  const lado = e.lados[0];
  const vivos = lado.participantes.filter((i) => vivo(lado.equipo[i]));
  if (vivos.length) {
    const cantidad = Math.max(1, Math.floor(expGanada(derrotado, datos, !e.salvaje) / vivos.length));
    for (const i of vivos) {
      const { criatura, subidas } = aplicarExperiencia(lado.equipo[i], cantidad, datos);
      lado.equipo[i] = criatura;
      ev.push({ tipo: 'experiencia', indice: i, nombre: nombreDe(criatura, datos), cantidad, subidas });
    }
  }
  lado.participantes = lado.activos.filter((i) => i >= 0 && vivo(lado.equipo[i]));
}

function finDeTurno(e: EstadoCombate, datos: DatosJuego, ev: Evento[]): void {
  const refs = [...refsVivas(e, 0), ...refsVivas(e, 1)].sort((a, b) => celeridadEfectiva(e, b, datos) - celeridadEfectiva(e, a, datos));
  for (const ref of refs) {
    const c = criaturaEn(e, ref);
    if (!vivo(c) || !c.estado || e.fin) continue;
    const max = vidaMaxima(c, datos);
    if (c.estado.tipo === 'quemado') quitarVida(e, ref, Math.floor(max / 16), datos, ev, 'quemadura');
    else if (c.estado.tipo === 'envenenado') quitarVida(e, ref, Math.floor(max / 8), datos, ev, 'veneno');
    else if (c.estado.tipo === 'intoxicado') {
      const turnos = c.estado.turnos;
      c.estado.turnos = Math.min(15, turnos + 1);
      quitarVida(e, ref, Math.floor((max * turnos) / 16), datos, ev, 'veneno');
    }
    comprobarFin(e, ev);
  }
  for (const lado of e.lados) {
    for (const v of lado.volatil) {
      // Proteger solo encadena si este turno ha protegido de verdad.
      if (!v.protegido) v.usosProteger = 0;
      v.protegido = false;
      v.retrocede = false;
      v.actuado = false;
    }
  }
}

function prepararReemplazos(e: EstadoCombate, datos: DatosJuego, ev: Evento[]): void {
  for (const lado of [0, 1] as IdLado[]) {
    const l = e.lados[lado];
    // Con dos caídas y un solo suplente, solo un hueco espera; el otro se queda vacío.
    let disponibles = banquillo(e, lado).length;
    l.activos.forEach((i, hueco) => {
      if (i < 0 || vivo(l.equipo[i])) return;
      const ref = { lado, hueco };
      if (disponibles === 0) {
        l.activos[hueco] = -1;
        return;
      }
      disponibles -= 1;
      if (l.control === 'ia') meter(e, ref, elegirReemplazoIA(e, lado, banquillo(e, lado), datos), datos, ev);
      else {
        e.pendientes.push(ref);
        ev.push({ tipo: 'reemplazoPendiente', ref: { ...ref } });
      }
    });
  }
}

function comprobarFin(e: EstadoCombate, ev: Evento[]): void {
  if (e.fin) return;
  const enPie = (lado: IdLado) => e.lados[lado].equipo.some((c) => vivo(c));
  const sin0 = !enPie(0);
  const sin1 = !enPie(1);
  // Si caen a la vez las últimas de los dos lados, gana el lado cuya última criatura cayó
  // después (como con el daño de retroceso en el género). Así ningún lado gana los empates.
  if (sin0 && sin1) terminar(e, e.ultimaCaida === 0 ? 'victoria' : 'derrota', ev);
  else if (sin0) terminar(e, 'derrota', ev);
  else if (sin1) terminar(e, 'victoria', ev);
}

function terminar(e: EstadoCombate, resultado: ResultadoCombate, ev: Evento[]): void {
  e.fin = resultado;
  e.pendientes = [];
  ev.push({ tipo: 'fin', resultado });
}
