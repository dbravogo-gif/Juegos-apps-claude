// Motor de combate: una función pura (estado, acción) → (estado, eventos). El estado es JSON y
// lleva dentro el generador aleatorio, así que el mismo estado con la misma acción da siempre
// el mismo resultado. La interfaz solo pinta los eventos.

import type {
  Criatura,
  DatosJuego,
  EfectoEquipo,
  EstadisticaCombate,
  EstadoAlterado,
  Etapas,
  Movimiento,
  Objeto,
  Pasiva,
  Sexo,
} from './modelo';
import { crearRng, elegir, elegirPonderado, entero, probabilidad, type EstadoRng } from './rng';
import { calcularEstadisticas, multiplicadorEtapa } from './estadisticas';
import { calcularDanio, PROB_CRITICO, type Combatiente } from './danio';
import { intentarCaptura } from './captura';
import { aplicarExperiencia, expGanada } from './progreso';
import { nombreDe, sexoDe } from './criatura';
import { elegirAccionIA } from './ia';
import { aplicarCuracion, motivoNoUsable, seAplicaACriatura, usoDe } from './objetos';
import { anulaTipo, inmuneAEstado, nuevoEstado, pasivaDe, pasivaTipo, puedeSufrir } from './pasivas';

export type Lado = 'jugador' | 'rival';
export type ResultadoCombate = 'victoria' | 'derrota' | 'huida' | 'captura';

export interface LadoCombate {
  nombre: string;
  equipo: Criatura[];
  activo: number;
  /** Cambios de estadísticas del activo. Se pierden al retirarlo. */
  etapas: Etapas;
  objetos: Record<string, number>;
  /** Lo que le pasa al activo y no es un estado alterado. Se pierde al retirarlo. */
  volatil: Volatil;
}

export interface Volatil {
  /**
   * Turnos de ceguera que le quedan, contando el que la cura (como la confusión del género):
   * 0, ve bien.
   */
  ceguera: number;
  /** La han sembrado: cada turno pierde Vida y se la lleva el activo del otro lado. */
  drenadoras: boolean;
  /** Se ha protegido este turno. */
  protegido: boolean;
  /** Protecciones seguidas que han salido bien: cada una deja la siguiente a la mitad. */
  protecciones: number;
  /** Perderá el turno si todavía no ha actuado. */
  retrocede: boolean;
  /** Brasero: un ataque de tipo Infernal le ha avivado los suyos. */
  avivado: boolean;
  /** Ya ha actuado este turno. */
  actuado: boolean;
}

export function volatilCero(): Volatil {
  return { ceguera: 0, drenadoras: false, protegido: false, protecciones: 0, retrocede: false, avivado: false, actuado: false };
}

export interface EstadoCombate {
  version: 1;
  rng: EstadoRng;
  turno: number;
  salvaje: boolean;
  jugador: LadoCombate;
  rival: LadoCombate;
  /** El jugador tiene que elegir quién sale tras perder a su criatura activa. */
  pendiente: 'reemplazo' | null;
  intentosHuida: number;
  fin: ResultadoCombate | null;
  capturada: Criatura | null;
  /** El rival salvaje elige sus movimientos como un entrenador (el Papemímico). */
  iaAstuta?: boolean;
  /** Las criaturas del jugador que han salido contra la criatura rival actual: ganan experiencia. */
  participantes: number[];
  /** Repartir experiencia encendido: las demás ganan la mitad. */
  repartir?: boolean;
}

export type Accion =
  | { tipo: 'movimiento'; indice: number }
  | { tipo: 'cambio'; indice: number }
  | { tipo: 'objeto'; objeto: string; objetivo?: number }
  | { tipo: 'huir' }
  | { tipo: 'reemplazo'; indice: number };

export interface FichaCombate {
  especie: string;
  nombre: string;
  nivel: number;
  vida: number;
  vidaMax: number;
  estado: EstadoAlterado | null;
  sexo: Sexo;
}

export type Evento =
  | { tipo: 'entrada'; lado: Lado; indice: number; ficha: FichaCombate }
  | { tipo: 'retirada'; lado: Lado; nombre: string }
  | { tipo: 'usa'; lado: Lado; nombre: string; movimiento: string }
  | { tipo: 'sinPP'; lado: Lado; nombre: string }
  | { tipo: 'falla'; lado: Lado; nombre: string }
  | {
      tipo: 'danio';
      lado: Lado;
      nombre: string;
      cantidad: number;
      vida: number;
      vidaMax: number;
      eficacia: number;
      critico: boolean;
      causa: 'ataque' | 'quemadura' | 'veneno' | 'retroceso' | 'objeto' | 'drenadoras' | 'pasiva';
    }
  | { tipo: 'sinEfecto'; lado: Lado; nombre: string }
  | { tipo: 'curacion'; lado: Lado; indice: number; nombre: string; cantidad: number; vida: number; vidaMax: number }
  | { tipo: 'estado'; lado: Lado; nombre: string; estado: EstadoAlterado }
  | { tipo: 'sigueDormido'; lado: Lado; nombre: string }
  | { tipo: 'despierta'; lado: Lado; nombre: string }
  /** La parálisis no la deja moverse. */
  | { tipo: 'noSeMueve'; lado: Lado; nombre: string }
  | { tipo: 'ciega'; lado: Lado; nombre: string }
  | { tipo: 'recuperaVista'; lado: Lado; nombre: string }
  /** Ha fallado estando cegado. */
  | { tipo: 'fallaCiego'; lado: Lado; nombre: string }
  /** En cólera, usa otro movimiento en lugar del elegido. */
  | { tipo: 'arrebatado'; lado: Lado; nombre: string }
  | { tipo: 'retrocede'; lado: Lado; nombre: string }
  | { tipo: 'siembra'; lado: Lado; nombre: string }
  | { tipo: 'protege'; lado: Lado; nombre: string }
  /** Un ataque contra quien se ha protegido. */
  | { tipo: 'protegido'; lado: Lado; nombre: string }
  /** Actúa una pasiva. Lo que hace va en los eventos siguientes. */
  | { tipo: 'pasiva'; lado: Lado; nombre: string; pasiva: string }
  | { tipo: 'aguanta'; lado: Lado; nombre: string }
  | { tipo: 'aviva'; lado: Lado; nombre: string }
  /** Una pasiva impide que le bajen las estadísticas. */
  | { tipo: 'etapaProtegida'; lado: Lado; nombre: string }
  /** Un Elixir le devuelve los PP. */
  | { tipo: 'recuperaPP'; lado: Lado; nombre: string }
  /** Rebuscar: encuentra un objeto al acabar el combate. */
  | { tipo: 'rebusca'; nombre: string; objeto: string }
  | { tipo: 'etapa'; lado: Lado; nombre: string; estadistica: EstadisticaCombate; cambio: number; intento: number }
  | { tipo: 'debilitado'; lado: Lado; nombre: string }
  /** `repartida`: la gana por Repartir experiencia, sin haber luchado (no se narra una a una). */
  | { tipo: 'experiencia'; indice: number; nombre: string; cantidad: number; repartida?: boolean }
  | { tipo: 'experienciaRepartida' }
  | { tipo: 'nivel'; indice: number; nombre: string; nivel: number; vida: number; vidaMax: number }
  | { tipo: 'aprende'; indice: number; nombre: string; movimiento: string }
  /** Ya sabe cuatro movimientos: la interfaz pregunta si olvida uno al acabar el combate. */
  | { tipo: 'noAprende'; indice: number; nombre: string; movimiento: string; movimientoId: string }
  | { tipo: 'objeto'; lado: Lado; objeto: string }
  /** Un objeto de la mochila cura el estado o reanima a una criatura. */
  | { tipo: 'curaEstado'; lado: Lado; nombre: string }
  | { tipo: 'reanima'; lado: Lado; indice: number; nombre: string; vida: number; vidaMax: number }
  /** Actúa el objeto equipado. */
  | { tipo: 'objetoEquipado'; lado: Lado; nombre: string; objeto: string; efecto: 'aguanta' | 'cura' | 'come' | 'pierde' }
  | { tipo: 'captura'; nombre: string; sacudidas: number; exito: boolean }
  | { tipo: 'huida'; exito: boolean }
  | { tipo: 'fin'; resultado: ResultadoCombate };

export interface Resultado {
  estado: EstadoCombate;
  eventos: Evento[];
}

/** Cegado, falla este tanto por ciento más de veces. */
export const FALLO_CEGADO = 30;
/** En cólera, este tanto por ciento de las veces usa otro movimiento. */
export const PROB_ARREBATO = 20;

/** Lo que se usa cuando no quedan PP: sin tipo y con retroceso. */
export const ARREBATO: Movimiento = {
  id: 'arrebato',
  nombre: 'Arrebato',
  tipo: '',
  categoria: 'fisico',
  poder: 50,
  precision: null,
  pp: 1,
};

export function etapasCero(): Etapas {
  return { fuerza: 0, escudo: 0, magia: 0, resMagica: 0, celeridad: 0 };
}

const otro = (lado: Lado): Lado => (lado === 'jugador' ? 'rival' : 'jugador');
const vivo = (c: Criatura) => c.vida > 0;

export function activoDe(e: EstadoCombate, lado: Lado): Criatura {
  return e[lado].equipo[e[lado].activo];
}

function combatiente(e: EstadoCombate, lado: Lado): Combatiente {
  return { criatura: activoDe(e, lado), etapas: e[lado].etapas, avivado: e[lado].volatil.avivado };
}

function vidaMax(c: Criatura, datos: DatosJuego): number {
  return calcularEstadisticas(c, datos).vida;
}

export function fichaDe(c: Criatura, datos: DatosJuego): FichaCombate {
  return {
    especie: c.especie,
    nombre: nombreDe(c, datos),
    nivel: c.nivel,
    vida: c.vida,
    vidaMax: vidaMax(c, datos),
    estado: c.estado?.tipo ?? null,
    sexo: sexoDe(c, datos),
  };
}

export interface ParticipanteInicial {
  nombre: string;
  equipo: Criatura[];
  objetos?: Record<string, number>;
}

export function iniciarCombate(
  op: {
    semilla: number | string;
    jugador: ParticipanteInicial;
    rival: ParticipanteInicial;
    salvaje: boolean;
    iaAstuta?: boolean;
    repartir?: boolean;
  },
  datos: DatosJuego,
): Resultado {
  const lado = (p: ParticipanteInicial): LadoCombate => {
    const activo = p.equipo.findIndex(vivo);
    if (activo < 0) throw new Error(`${p.nombre} no tiene ninguna criatura en pie`);
    if (p.equipo.length > 6) throw new Error('Un equipo tiene como mucho 6 criaturas');
    return {
      nombre: p.nombre,
      equipo: structuredClone(p.equipo),
      activo,
      etapas: etapasCero(),
      objetos: { ...(p.objetos ?? {}) },
      volatil: volatilCero(),
    };
  };
  const estado: EstadoCombate = {
    version: 1,
    rng: crearRng(op.semilla),
    turno: 1,
    salvaje: op.salvaje,
    jugador: lado(op.jugador),
    rival: lado(op.rival),
    pendiente: null,
    intentosHuida: 0,
    fin: null,
    capturada: null,
    participantes: [],
  };
  estado.participantes = [estado.jugador.activo];
  if (op.iaAstuta) estado.iaAstuta = true;
  if (op.repartir) estado.repartir = true;
  const eventos: Evento[] = [
    { tipo: 'entrada', lado: 'rival', indice: estado.rival.activo, ficha: fichaDe(activoDe(estado, 'rival'), datos) },
    { tipo: 'entrada', lado: 'jugador', indice: estado.jugador.activo, ficha: fichaDe(activoDe(estado, 'jugador'), datos) },
  ];
  alEntrar(estado, 'rival', datos, eventos);
  alEntrar(estado, 'jugador', datos, eventos);
  return { estado, eventos };
}

export interface AccionesDisponibles {
  movimientos: boolean[];
  /** Sin PP en ningún movimiento: cualquier ataque será un Arrebato. */
  sinPP: boolean;
  cambios: boolean[];
  objetos: Record<string, boolean>;
  huir: boolean;
}

export function accionesDisponibles(e: EstadoCombate, datos: DatosJuego): AccionesDisponibles {
  const a = activoDe(e, 'jugador');
  const objetos: Record<string, boolean> = {};
  for (const [id, n] of Object.entries(e.jugador.objetos)) {
    const obj = datos.objetos[id];
    if (!obj || n <= 0 || !usoDe(obj).combate) continue;
    objetos[id] = objetoUtil(e, obj, datos);
  }
  return {
    movimientos: a.movimientos.map((m) => m.pp > 0),
    sinPP: a.movimientos.every((m) => m.pp === 0),
    cambios: e.jugador.equipo.map((c, i) => i !== e.jugador.activo && vivo(c)),
    objetos,
    huir: e.salvaje,
  };
}

/** Si ahora mismo tiene sentido usar ese objeto en el combate. */
function objetoUtil(e: EstadoCombate, obj: Objeto, datos: DatosJuego): boolean {
  if (obj.tipo === 'captura') return e.salvaje;
  if (obj.tipo === 'potenciador') return e.jugador.etapas[obj.estadistica] < 6;
  if (seAplicaACriatura(obj)) return e.jugador.equipo.some((c) => motivoNoUsable(obj, c, datos) === null);
  return false;
}

function validar(e: EstadoCombate, accion: Accion, datos: DatosJuego): void {
  const j = e.jugador;
  switch (accion.tipo) {
    case 'movimiento': {
      const a = activoDe(e, 'jugador');
      if (a.movimientos.every((m) => m.pp === 0)) return;
      const m = a.movimientos[accion.indice];
      if (!m) throw new Error('Movimiento inexistente');
      if (m.pp <= 0) throw new Error('A ese movimiento no le quedan PP');
      return;
    }
    case 'cambio': {
      const c = j.equipo[accion.indice];
      if (!c || !vivo(c) || accion.indice === j.activo) throw new Error('No se puede cambiar a esa criatura');
      return;
    }
    case 'objeto': {
      const obj = datos.objetos[accion.objeto];
      if (!obj || (j.objetos[accion.objeto] ?? 0) <= 0) throw new Error('No te quedan de ese objeto');
      if (!usoDe(obj).combate) throw new Error('Ese objeto no se usa en combate');
      if (obj.tipo === 'captura' && !e.salvaje) throw new Error('No se puede capturar la criatura de otro entrenador');
      if (seAplicaACriatura(obj)) {
        const c = j.equipo[accion.objetivo ?? j.activo];
        const motivo = c ? motivoNoUsable(obj, c, datos) : 'No hay ninguna criatura ahí';
        if (motivo) throw new Error(motivo);
      }
      return;
    }
    case 'huir':
      if (!e.salvaje) throw new Error('No se puede huir de un combate contra un entrenador');
      return;
    case 'reemplazo':
      throw new Error('Ahora no toca elegir reemplazo');
  }
}

export function resolverTurno(estado: EstadoCombate, accion: Accion, datos: DatosJuego): Resultado {
  if (estado.fin) throw new Error('El combate ya ha terminado');
  const e: EstadoCombate = structuredClone(estado);
  const ev: Evento[] = [];

  if (e.pendiente === 'reemplazo') {
    if (accion.tipo !== 'reemplazo') throw new Error('Hay que elegir qué criatura sale');
    const c = e.jugador.equipo[accion.indice];
    if (!c || !vivo(c)) throw new Error('Esa criatura no puede salir');
    entrar(e, 'jugador', accion.indice, datos, ev);
    e.pendiente = null;
    return { estado: e, eventos: ev };
  }
  validar(e, accion, datos);
  jugarTurno(e, accion, datos, ev);
  if (e.fin && e.fin !== 'derrota') rebuscar(e, datos, ev);
  return { estado: e, eventos: ev };
}

function jugarTurno(e: EstadoCombate, accion: Accion, datos: DatosJuego, ev: Evento[]): void {
  const accionRival = elegirAccionIA(e, datos);

  switch (accion.tipo) {
    case 'huir':
      if (huir(e, datos, ev)) return;
      e.jugador.volatil.actuado = true;
      ejecutarMovimiento(e, 'rival', indiceDe(accionRival), datos, ev);
      break;
    case 'objeto':
      if (usarObjeto(e, accion, datos, ev)) return;
      e.jugador.volatil.actuado = true;
      ejecutarMovimiento(e, 'rival', indiceDe(accionRival), datos, ev);
      break;
    case 'cambio':
      retirar(e, 'jugador', datos, ev);
      entrar(e, 'jugador', accion.indice, datos, ev);
      e.jugador.volatil.actuado = true;
      ejecutarMovimiento(e, 'rival', indiceDe(accionRival), datos, ev);
      break;
    case 'movimiento': {
      const orden = ordenDeActuacion(e, accion.indice, indiceDe(accionRival), datos);
      for (const [lado, indice] of orden) ejecutarMovimiento(e, lado, indice, datos, ev);
      break;
    }
  }

  finDeTurno(e, datos, ev);
  resolverDebilitados(e, datos, ev);
  e.turno += 1;
}

/** Rebuscar: al acabar el combate, las que la tienen pueden encontrar un objeto. */
function rebuscar(e: EstadoCombate, datos: DatosJuego, ev: Evento[]): void {
  const hallazgos: Evento[] = [];
  for (const c of e.jugador.equipo) {
    const ef = pasivaTipo(c, datos, 'rebuscar');
    if (!ef || !vivo(c) || !probabilidad(e.rng, ef.prob)) continue;
    const id = ef.objetos[elegirPonderado(e.rng, ef.objetos.map((o) => o.peso))].objeto;
    const obj = datos.objetos[id];
    if (!obj) continue;
    e.jugador.objetos[id] = (e.jugador.objetos[id] ?? 0) + 1;
    hallazgos.push({ tipo: 'rebusca', nombre: nombreDe(c, datos), objeto: obj.nombre });
  }
  const i = ev.findIndex((x) => x.tipo === 'fin');
  ev.splice(i < 0 ? ev.length : i, 0, ...hallazgos);
}

function indiceDe(a: Accion): number {
  return a.tipo === 'movimiento' ? a.indice : -1;
}

function movimientoUsado(c: Criatura, indice: number, datos: DatosJuego): Movimiento {
  const m = c.movimientos[indice];
  return m && m.pp > 0 ? datos.movimientos[m.id] : ARREBATO;
}

function celeridadEfectiva(e: EstadoCombate, lado: Lado, datos: DatosJuego): number {
  const c = activoDe(e, lado);
  let v = calcularEstadisticas(c, datos).celeridad * multiplicadorEtapa(e[lado].etapas.celeridad);
  if (c.estado && pasivaTipo(c, datos, 'piesLigeros')) v *= 1.5;
  else if (c.estado?.tipo === 'paralizado') v *= 0.5;
  return v;
}

function ordenDeActuacion(
  e: EstadoCombate,
  indiceJugador: number,
  indiceRival: number,
  datos: DatosJuego,
): [Lado, number][] {
  const pj = movimientoUsado(activoDe(e, 'jugador'), indiceJugador, datos).prioridad ?? 0;
  const pr = movimientoUsado(activoDe(e, 'rival'), indiceRival, datos).prioridad ?? 0;
  let primeroJugador: boolean;
  const garra = (lado: Lado) => {
    const ef = efectoEquipo(activoDe(e, lado), datos);
    return ef?.tipo === 'primero' && probabilidad(e.rng, ef.prob);
  };
  if (pj !== pr) primeroJugador = pj > pr;
  else if (garra('jugador')) primeroJugador = true;
  else if (garra('rival')) primeroJugador = false;
  else {
    const cj = celeridadEfectiva(e, 'jugador', datos);
    const cr = celeridadEfectiva(e, 'rival', datos);
    primeroJugador = cj !== cr ? cj > cr : probabilidad(e.rng, 50);
  }
  const j: [Lado, number] = ['jugador', indiceJugador];
  const r: [Lado, number] = ['rival', indiceRival];
  return primeroJugador ? [j, r] : [r, j];
}

function entrar(e: EstadoCombate, lado: Lado, indice: number, datos: DatosJuego, ev: Evento[]): void {
  e[lado].activo = indice;
  e[lado].etapas = etapasCero();
  e[lado].volatil = volatilCero();
  const c = activoDe(e, lado);
  if (c.estado?.tipo === 'intoxicado') c.estado.turnos = 1;
  if (lado === 'rival') e.participantes = [e.jugador.activo];
  else if (!e.participantes.includes(indice)) e.participantes.push(indice);
  ev.push({ tipo: 'entrada', lado, indice, ficha: fichaDe(c, datos) });
  alEntrar(e, lado, datos, ev);
}

/** Pasivas que actúan al salir al combate (Mirada torva). */
function alEntrar(e: EstadoCombate, lado: Lado, datos: DatosJuego, ev: Evento[]): void {
  const c = activoDe(e, lado);
  const p = pasivaDe(c, datos);
  if (p?.efecto.tipo !== 'intimidar' || !vivo(c) || !vivo(activoDe(e, otro(lado)))) return;
  anunciarPasiva(ev, lado, c, p, datos);
  cambiarEtapa(e, otro(lado), 'fuerza', -1, datos, ev, true);
}

/** Se retira por un cambio. Reposo y Brote actúan sin decir nada, como en el género. */
function retirar(e: EstadoCombate, lado: Lado, datos: DatosJuego, ev: Evento[]): void {
  const c = activoDe(e, lado);
  ev.push({ tipo: 'retirada', lado, nombre: nombreDe(c, datos) });
  const ef = pasivaDe(c, datos)?.efecto;
  if (ef?.tipo === 'reposo') c.estado = null;
  if (ef?.tipo === 'brote' && vivo(c)) {
    const max = vidaMax(c, datos);
    c.vida = Math.min(max, c.vida + Math.floor(max / 3));
  }
}

function anunciarPasiva(ev: Evento[], lado: Lado, c: Criatura, p: Pasiva, datos: DatosJuego): void {
  ev.push({ tipo: 'pasiva', lado, nombre: nombreDe(c, datos), pasiva: p.nombre });
}

/** Cambia las etapas de una estadística. `porRival`: Pétreo y Garras duras pueden impedir la bajada. */
function cambiarEtapa(
  e: EstadoCombate,
  lado: Lado,
  estadistica: EstadisticaCombate,
  cambio: number,
  datos: DatosJuego,
  ev: Evento[],
  porRival: boolean,
): void {
  const c = activoDe(e, lado);
  const nombre = nombreDe(c, datos);
  if (porRival && cambio < 0) {
    const p = pasivaDe(c, datos);
    if (p && (p.efecto.tipo === 'petreo' || (p.efecto.tipo === 'garrasDuras' && estadistica === 'fuerza'))) {
      anunciarPasiva(ev, lado, c, p, datos);
      ev.push({ tipo: 'etapaProtegida', lado, nombre });
      return;
    }
  }
  const etapas = e[lado].etapas;
  const antes = etapas[estadistica];
  const despues = Math.max(-6, Math.min(6, antes + cambio));
  etapas[estadistica] = despues;
  ev.push({ tipo: 'etapa', lado, nombre, estadistica, cambio: despues - antes, intento: cambio });
}

/** Le pone un estado alterado. Con Espejo, quien se lo ha causado sufre lo mismo. */
function provocarEstado(e: EstadoCombate, lado: Lado, estado: EstadoAlterado, datos: DatosJuego, ev: Evento[], causante?: Lado): void {
  const c = activoDe(e, lado);
  c.estado = nuevoEstado(estado, e.rng);
  ev.push({ tipo: 'estado', lado, nombre: nombreDe(c, datos), estado });
  comprobarBayaEstado(e, lado, datos, ev);
  if (!causante || estado === 'dormido') return;
  const p = pasivaDe(c, datos);
  if (p?.efecto.tipo !== 'espejo' || !puedeSufrir(activoDe(e, causante), estado, datos)) return;
  anunciarPasiva(ev, lado, c, p, datos);
  provocarEstado(e, causante, estado, datos, ev);
}

function quitarVida(e: EstadoCombate, lado: Lado, cantidad: number, causa: 'quemadura' | 'veneno' | 'retroceso' | 'objeto' | 'drenadoras' | 'pasiva', datos: DatosJuego, ev: Evento[]): number {
  const c = activoDe(e, lado);
  const max = vidaMax(c, datos);
  const real = Math.min(c.vida, Math.max(1, cantidad));
  c.vida -= real;
  ev.push({ tipo: 'danio', lado, nombre: nombreDe(c, datos), cantidad: real, vida: c.vida, vidaMax: max, eficacia: 1, critico: false, causa });
  return real;
}

function huir(e: EstadoCombate, datos: DatosJuego, ev: Evento[]): boolean {
  e.intentosHuida += 1;
  const cj = celeridadEfectiva(e, 'jugador', datos);
  const cr = Math.max(1, celeridadEfectiva(e, 'rival', datos));
  const j = activoDe(e, 'jugador');
  const escurridizo = pasivaTipo(j, datos, 'escurridizo') !== null || efectoEquipo(j, datos)?.tipo === 'huida';
  const exito = escurridizo || cj >= cr || entero(e.rng, 0, 255) < Math.floor((cj * 128) / cr) + 30 * e.intentosHuida;
  ev.push({ tipo: 'huida', exito });
  if (exito) {
    e.fin = 'huida';
    ev.push({ tipo: 'fin', resultado: 'huida' });
  }
  return exito;
}

/** Devuelve `true` si el objeto termina el combate (una captura con éxito). */
function usarObjeto(e: EstadoCombate, accion: Extract<Accion, { tipo: 'objeto' }>, datos: DatosJuego, ev: Evento[]): boolean {
  const obj = datos.objetos[accion.objeto];
  e.jugador.objetos[accion.objeto] -= 1;
  ev.push({ tipo: 'objeto', lado: 'jugador', objeto: obj.nombre });
  if (obj.tipo === 'potenciador') {
    const a = activoDe(e, 'jugador');
    const antes = e.jugador.etapas[obj.estadistica];
    const despues = Math.min(6, antes + obj.cambio);
    e.jugador.etapas[obj.estadistica] = despues;
    ev.push({ tipo: 'etapa', lado: 'jugador', nombre: nombreDe(a, datos), estadistica: obj.estadistica, cambio: despues - antes, intento: obj.cambio });
    return false;
  }
  if (obj.tipo !== 'captura') {
    const indice = accion.objetivo ?? e.jugador.activo;
    const c = e.jugador.equipo[indice];
    const nombre = nombreDe(c, datos);
    const recuperada = aplicarCuracion(obj, c, datos);
    if (obj.tipo === 'remedio') ev.push({ tipo: 'curaEstado', lado: 'jugador', nombre });
    else if (obj.tipo === 'pp') ev.push({ tipo: 'recuperaPP', lado: 'jugador', nombre });
    else if (obj.tipo === 'revivir') ev.push({ tipo: 'reanima', lado: 'jugador', indice, nombre, vida: c.vida, vidaMax: vidaMax(c, datos) });
    else ev.push({ tipo: 'curacion', lado: 'jugador', indice, nombre, cantidad: recuperada, vida: c.vida, vidaMax: vidaMax(c, datos) });
    return false;
  }
  const presa = activoDe(e, 'rival');
  const r = intentarCaptura(
    {
      vida: presa.vida,
      vidaMax: vidaMax(presa, datos),
      ratio: datos.especies[presa.especie].ratioCaptura,
      bonus: bonusTesera(e, obj, presa, datos),
      estado: presa.estado,
      segura: obj.segura,
    },
    e.rng,
  );
  ev.push({ tipo: 'captura', nombre: nombreDe(presa, datos), sacudidas: r.sacudidas, exito: r.exito });
  if (r.exito) {
    e.fin = 'captura';
    e.capturada = structuredClone(presa);
    ev.push({ tipo: 'fin', resultado: 'captura' });
  }
  return r.exito;
}

/** La bonificación de una tésera: la Rápida en el primer turno, la de Red contra Agua y Aire… */
function bonusTesera(e: EstadoCombate, obj: Extract<Objeto, { tipo: 'captura' }>, presa: Criatura, datos: DatosJuego): number {
  const si = obj.bonusSi;
  if (!si) return obj.bonus;
  const cumple =
    (si.primerTurno && e.turno === 1) || (si.tipos ?? []).some((t) => datos.especies[presa.especie].tipos.includes(t));
  return cumple ? si.bonus : obj.bonus;
}

// ---------- Objetos equipados ----------

function efectoEquipo(c: Criatura, datos: DatosJuego): EfectoEquipo | null {
  const obj = c.objeto ? datos.objetos[c.objeto] : undefined;
  return obj?.tipo === 'equipo' ? obj.efecto : null;
}

function nombreObjeto(c: Criatura, datos: DatosJuego): string {
  return c.objeto ? (datos.objetos[c.objeto]?.nombre ?? c.objeto) : '';
}

/** El objeto equipado se ha gastado (un fruto comido, un amuleto roto). */
function gastar(c: Criatura, datos: DatosJuego): void {
  const obj = c.objeto ? datos.objetos[c.objeto] : undefined;
  if (obj?.tipo === 'equipo' && obj.consumible) delete c.objeto;
}

/** Fruto que cura al bajar de cierta Vida. */
function comprobarBaya(e: EstadoCombate, lado: Lado, datos: DatosJuego, ev: Evento[]): void {
  const c = activoDe(e, lado);
  const ef = efectoEquipo(c, datos);
  if (ef?.tipo !== 'baya' || !vivo(c)) return;
  const max = vidaMax(c, datos);
  if (c.vida > Math.floor(max * ef.umbral)) return;
  ev.push({ tipo: 'objetoEquipado', lado, nombre: nombreDe(c, datos), objeto: nombreObjeto(c, datos), efecto: 'come' });
  gastar(c, datos);
  curar(c, ef.puntos ?? Math.max(1, Math.floor(max * (ef.cura ?? 0))), lado, e[lado].activo, datos, ev);
}

/** Fruto que cura un estado (o la ceguera) en cuanto se sufre. */
function comprobarBayaEstado(e: EstadoCombate, lado: Lado, datos: DatosJuego, ev: Evento[]): void {
  const c = activoDe(e, lado);
  const ef = efectoEquipo(c, datos);
  if (ef?.tipo !== 'bayaEstado' || !vivo(c)) return;
  const estado = c.estado && ef.estados.includes(c.estado.tipo);
  const ceguera = e[lado].volatil.ceguera > 0 && ef.estados.includes('cegado');
  if (!estado && !ceguera) return;
  const nombre = nombreDe(c, datos);
  ev.push({ tipo: 'objetoEquipado', lado, nombre, objeto: nombreObjeto(c, datos), efecto: 'come' });
  gastar(c, datos);
  if (estado) {
    c.estado = null;
    ev.push({ tipo: 'curaEstado', lado, nombre });
  }
  if (ceguera) {
    e[lado].volatil.ceguera = 0;
    ev.push({ tipo: 'recuperaVista', lado, nombre });
  }
}

function curar(c: Criatura, cantidad: number, lado: Lado, indice: number, datos: DatosJuego, ev: Evento[]): void {
  const max = vidaMax(c, datos);
  const real = Math.max(0, Math.min(cantidad, max - c.vida));
  c.vida += real;
  ev.push({ tipo: 'curacion', lado, indice, nombre: nombreDe(c, datos), cantidad: real, vida: c.vida, vidaMax: max });
}

function ejecutarMovimiento(e: EstadoCombate, lado: Lado, indice: number, datos: DatosJuego, ev: Evento[]): void {
  if (e.fin) return;
  const atacante = activoDe(e, lado);
  if (!vivo(atacante)) return;
  const vol = e[lado].volatil;
  vol.actuado = true;
  const racha = vol.protecciones;
  vol.protecciones = 0;
  const ladoDef = otro(lado);
  const defensor = activoDe(e, ladoDef);
  const volDef = e[ladoDef].volatil;
  const nAt = nombreDe(atacante, datos);
  const nDef = nombreDe(defensor, datos);

  if (atacante.estado?.tipo === 'dormido') {
    if (atacante.estado.turnos > 0) {
      atacante.estado.turnos -= 1;
      ev.push({ tipo: 'sigueDormido', lado, nombre: nAt });
      return;
    }
    atacante.estado = null;
    ev.push({ tipo: 'despierta', lado, nombre: nAt });
  }
  if (vol.retrocede) {
    vol.retrocede = false;
    ev.push({ tipo: 'retrocede', lado, nombre: nAt });
    return;
  }
  // La ceguera se cuenta en cada turno en que actúa; el último, ya ve.
  let ciego = false;
  if (vol.ceguera > 0) {
    vol.ceguera -= 1;
    if (vol.ceguera === 0) ev.push({ tipo: 'recuperaVista', lado, nombre: nAt });
    else ciego = true;
  }
  if (atacante.estado?.tipo === 'paralizado' && probabilidad(e.rng, 25)) {
    ev.push({ tipo: 'noSeMueve', lado, nombre: nAt });
    return;
  }
  // En cólera, una de cada cinco veces usa otro de sus movimientos (con PP) en vez del elegido.
  if (atacante.estado?.tipo === 'colera' && probabilidad(e.rng, PROB_ARREBATO)) {
    const otros = atacante.movimientos.map((m, i) => (i !== indice && m.pp > 0 ? i : -1)).filter((i) => i >= 0);
    if (otros.length > 0) {
      indice = elegir(e.rng, otros);
      ev.push({ tipo: 'arrebatado', lado, nombre: nAt });
    }
  }

  const usado = atacante.movimientos[indice];
  let mov: Movimiento;
  if (usado && usado.pp > 0) {
    usado.pp -= 1;
    mov = datos.movimientos[usado.id];
  } else {
    mov = ARREBATO;
    ev.push({ tipo: 'sinPP', lado, nombre: nAt });
  }
  ev.push({ tipo: 'usa', lado, nombre: nAt, movimiento: mov.nombre });

  const efectos = mov.efectos ?? [];
  if (efectos.some((f) => f.tipo === 'proteger')) {
    // Falla si el rival ya ha actuado, y cada vez que se repite sale la mitad de veces.
    const exito = !volDef.actuado && (racha === 0 || probabilidad(e.rng, 100 / 2 ** racha));
    if (!exito) {
      ev.push({ tipo: 'falla', lado, nombre: nAt });
      return;
    }
    vol.protegido = true;
    vol.protecciones = racha + 1;
    ev.push({ tipo: 'protege', lado, nombre: nAt });
    return;
  }

  const contraRival =
    mov.categoria !== 'estado' ||
    efectos.some((f) => f.tipo === 'estado' || f.tipo === 'cegar' || f.tipo === 'drenadoras' || (f.tipo === 'etapa' && f.objetivo === 'rival'));
  if (contraRival && usado && mov !== ARREBATO && usado.pp > 0 && vivo(defensor) && pasivaTipo(defensor, datos, 'imponente')) usado.pp -= 1;
  if (contraRival && !vivo(defensor)) {
    ev.push({ tipo: 'falla', lado, nombre: nAt });
    return;
  }
  if (contraRival && volDef.protegido) {
    ev.push({ tipo: 'protegido', lado: ladoDef, nombre: nDef });
    return;
  }
  if (contraRival && anulaTipo(defensor, mov.tipo, datos)) {
    absorber(e, ladoDef, datos, ev);
    return;
  }
  const pAt = pasivaDe(atacante, datos)?.efecto;
  const efAt = efectoEquipo(atacante, datos);
  // Cegado, falla un 30 % más: se multiplica por lo demás que cambia la precisión, y también
  // afecta a los ataques que no fallan nunca. Lo que hace sobre sí mismo no falla.
  const cegado = ciego && contraRival;
  if (mov.precision !== null || cegado) {
    const precision =
      (mov.precision ?? 100) *
      (pAt?.tipo === 'ojoAvizor' ? 1.3 : 1) *
      (efAt?.tipo === 'precision' ? efAt.multiplicador : 1) *
      (cegado ? 1 - FALLO_CEGADO / 100 : 1);
    if (entero(e.rng, 1, 100) > precision) {
      ev.push({ tipo: cegado ? 'fallaCiego' : 'falla', lado, nombre: nAt });
      return;
    }
  }

  let danioCausado = 0;
  if (mov.categoria !== 'estado') {
    const probCritico = PROB_CRITICO * (pAt?.tipo === 'buenaEstrella' ? 2 : 1) * (efAt?.tipo === 'critico' ? efAt.multiplicador : 1);
    const critico = probabilidad(e.rng, probCritico) && !pasivaTipo(defensor, datos, 'caparazon');
    const tirada = entero(e.rng, 85, 100);
    const r = calcularDanio(combatiente(e, lado), combatiente(e, ladoDef), mov, datos, critico, tirada);
    if (r.eficacia === 0) {
      ev.push({ tipo: 'sinEfecto', lado: ladoDef, nombre: nDef });
      return;
    }
    const efDef = efectoEquipo(defensor, datos);
    const danio = efAt?.tipo === 'potenciar' ? Math.floor(r.danio * efAt.multiplicador) : r.danio;
    danioCausado = Math.min(defensor.vida, danio);
    const golpeLetal = defensor.vida === vidaMax(defensor, datos) && danioCausado >= defensor.vida;
    const firme = golpeLetal && pasivaTipo(defensor, datos, 'firme') !== null;
    const aguanta = golpeLetal && !firme && efDef?.tipo === 'aguantar';
    if (firme || aguanta) danioCausado = defensor.vida - 1;
    defensor.vida -= danioCausado;
    ev.push({
      tipo: 'danio',
      lado: ladoDef,
      nombre: nDef,
      cantidad: danioCausado,
      vida: defensor.vida,
      vidaMax: vidaMax(defensor, datos),
      eficacia: r.eficacia,
      critico: r.critico,
      causa: 'ataque',
    });
    if (firme) {
      anunciarPasiva(ev, ladoDef, defensor, pasivaDe(defensor, datos)!, datos);
      ev.push({ tipo: 'aguanta', lado: ladoDef, nombre: nDef });
    }
    if (aguanta) {
      ev.push({ tipo: 'objetoEquipado', lado: ladoDef, nombre: nDef, objeto: nombreObjeto(defensor, datos), efecto: 'aguanta' });
      gastar(defensor, datos);
    }
    comprobarBaya(e, ladoDef, datos, ev);
    if (efAt?.tipo === 'robarVida' && danioCausado > 0 && vivo(atacante)) {
      ev.push({ tipo: 'objetoEquipado', lado, nombre: nAt, objeto: nombreObjeto(atacante, datos), efecto: 'cura' });
      curar(atacante, Math.max(1, Math.floor(danioCausado * efAt.fraccion)), lado, e[lado].activo, datos, ev);
    }
    if (efAt?.tipo === 'potenciar' && danioCausado > 0 && vivo(atacante)) {
      ev.push({ tipo: 'objetoEquipado', lado, nombre: nAt, objeto: nombreObjeto(atacante, datos), efecto: 'pierde' });
      quitarVida(e, lado, Math.floor(vidaMax(atacante, datos) * efAt.coste), 'objeto', datos, ev);
    }
    if (mov === ARREBATO) quitarVida(e, lado, Math.floor(vidaMax(atacante, datos) / 4), 'retroceso', datos, ev);
    if (mov.categoria === 'fisico' && danioCausado > 0 && vivo(atacante)) contacto(e, lado, datos, ev);
    comprobarBaya(e, lado, datos, ev);
    if (pAt?.tipo === 'hedor' && !efectos.some((f) => f.tipo === 'retroceso')) hacerRetroceder(e, ladoDef, 10, datos);
    if (pAt?.tipo === 'ataqueCegador' && danioCausado > 0 && vivo(defensor) && puedeCegarse(e, ladoDef, datos) && probabilidad(e.rng, pAt.prob)) {
      anunciarPasiva(ev, lado, atacante, pasivaDe(atacante, datos)!, datos);
      cegar(e, ladoDef, datos, ev);
    }
  }

  // Bendición: los efectos añadidos de los ataques salen el doble de a menudo.
  const prob = (p: number) => (mov.categoria !== 'estado' && pAt?.tipo === 'bendicion' ? Math.min(100, p * 2) : p);
  for (const f of efectos) {
    switch (f.tipo) {
      case 'drenar': {
        const cantidad = Math.max(1, Math.floor(danioCausado * f.fraccion));
        if (danioCausado > 0 && vivo(atacante)) curar(atacante, cantidad, lado, e[lado].activo, datos, ev);
        break;
      }
      case 'curar':
        if (vivo(atacante)) curar(atacante, Math.floor(vidaMax(atacante, datos) * f.fraccion), lado, e[lado].activo, datos, ev);
        break;
      case 'estado': {
        if (!vivo(defensor)) break;
        if (!puedeSufrir(defensor, f.estado, datos)) {
          if (mov.categoria === 'estado') ev.push({ tipo: 'sinEfecto', lado: ladoDef, nombre: nDef });
          break;
        }
        if (!probabilidad(e.rng, prob(f.prob))) break;
        provocarEstado(e, ladoDef, f.estado, datos, ev, lado);
        break;
      }
      case 'cegar': {
        if (!vivo(defensor)) break;
        if (!puedeCegarse(e, ladoDef, datos)) {
          if (mov.categoria === 'estado') ev.push({ tipo: 'sinEfecto', lado: ladoDef, nombre: nDef });
          break;
        }
        if (!probabilidad(e.rng, prob(f.prob))) break;
        cegar(e, ladoDef, datos, ev);
        break;
      }
      case 'retroceso':
        hacerRetroceder(e, ladoDef, prob(f.prob), datos);
        break;
      case 'drenadoras': {
        if (!vivo(defensor)) break;
        if (volDef.drenadoras || datos.especies[defensor.especie].tipos.includes('planta')) {
          ev.push({ tipo: 'sinEfecto', lado: ladoDef, nombre: nDef });
          break;
        }
        volDef.drenadoras = true;
        ev.push({ tipo: 'siembra', lado: ladoDef, nombre: nDef });
        break;
      }
      case 'etapa': {
        const objetivoLado = f.objetivo === 'propio' ? lado : ladoDef;
        if (!vivo(activoDe(e, objetivoLado))) break;
        if (!probabilidad(e.rng, prob(f.prob))) break;
        cambiarEtapa(e, objetivoLado, f.estadistica, f.cambio, datos, ev, objetivoLado !== lado);
        break;
      }
      case 'proteger':
        break;
    }
  }

  comprobarDebilitado(e, ladoDef, datos, ev);
  comprobarDebilitado(e, lado, datos, ev);
}

/** Puede quedar cegado: en pie, sin estarlo ya y sin pasiva que lo impida. */
function puedeCegarse(e: EstadoCombate, lado: Lado, datos: DatosJuego): boolean {
  const c = activoDe(e, lado);
  return vivo(c) && e[lado].volatil.ceguera === 0 && !inmuneAEstado(c, 'cegado', datos);
}

/** Lo deja cegado de 2 a 5 turnos, como la confusión del género. */
function cegar(e: EstadoCombate, lado: Lado, datos: DatosJuego, ev: Evento[]): void {
  e[lado].volatil.ceguera = entero(e.rng, 2, 5);
  ev.push({ tipo: 'ciega', lado, nombre: nombreDe(activoDe(e, lado), datos) });
  comprobarBayaEstado(e, lado, datos, ev);
}

/** El rival retrocede (pierde el turno) si todavía no ha actuado. */
function hacerRetroceder(e: EstadoCombate, lado: Lado, prob: number, datos: DatosJuego): void {
  const c = activoDe(e, lado);
  const v = e[lado].volatil;
  if (!vivo(c) || v.actuado || inmuneAEstado(c, 'retroceso', datos)) return;
  if (probabilidad(e.rng, prob)) v.retrocede = true;
}

/** El ataque es de un tipo que su pasiva anula: no le hace nada y quizá le sirve. */
function absorber(e: EstadoCombate, lado: Lado, datos: DatosJuego, ev: Evento[]): void {
  const c = activoDe(e, lado);
  const p = pasivaDe(c, datos)!;
  const nombre = nombreDe(c, datos);
  anunciarPasiva(ev, lado, c, p, datos);
  if (p.efecto.tipo === 'absorber') {
    const max = vidaMax(c, datos);
    if (p.efecto.ganancia === 'curar' && c.vida < max) return curar(c, Math.max(1, Math.floor(max / 4)), lado, e[lado].activo, datos, ev);
    if (p.efecto.ganancia === 'avivar' && !e[lado].volatil.avivado) {
      e[lado].volatil.avivado = true;
      ev.push({ tipo: 'aviva', lado, nombre });
      return;
    }
    if (p.efecto.ganancia === 'fuerza') return cambiarEtapa(e, lado, 'fuerza', 1, datos, ev, false);
  }
  ev.push({ tipo: 'sinEfecto', lado, nombre });
}

/** Pasivas del defensor que castigan al que le golpea con un ataque físico. */
function contacto(e: EstadoCombate, lado: Lado, datos: DatosJuego, ev: Evento[]): void {
  const ladoDef = otro(lado);
  const defensor = activoDe(e, ladoDef);
  const atacante = activoDe(e, lado);
  const p = pasivaDe(defensor, datos);
  if (p?.efecto.tipo === 'contacto') {
    if (!probabilidad(e.rng, p.efecto.prob)) return;
    const estado = elegir(e.rng, p.efecto.estados);
    if (estado === 'cegado') {
      if (!puedeCegarse(e, lado, datos)) return;
      anunciarPasiva(ev, ladoDef, defensor, p, datos);
      cegar(e, lado, datos, ev);
      return;
    }
    if (!puedeSufrir(atacante, estado, datos)) return;
    anunciarPasiva(ev, ladoDef, defensor, p, datos);
    provocarEstado(e, lado, estado, datos, ev, ladoDef);
  } else if (p?.efecto.tipo === 'pielAspera') {
    anunciarPasiva(ev, ladoDef, defensor, p, datos);
    quitarVida(e, lado, Math.floor(vidaMax(atacante, datos) / 8), 'pasiva', datos, ev);
  }
}

function comprobarDebilitado(e: EstadoCombate, lado: Lado, datos: DatosJuego, ev: Evento[]): void {
  const c = activoDe(e, lado);
  if (vivo(c) || yaAnunciado(ev, lado)) return;
  c.estado = null;
  ev.push({ tipo: 'debilitado', lado, nombre: nombreDe(c, datos) });
  if (lado === 'rival') darExperiencia(e, c, datos, ev);
}

/** El último evento de entrada o debilitamiento de ese lado fue un debilitamiento. */
function yaAnunciado(ev: Evento[], lado: Lado): boolean {
  for (let i = ev.length - 1; i >= 0; i--) {
    const x = ev[i];
    if ((x.tipo === 'debilitado' || x.tipo === 'entrada') && x.lado === lado) return x.tipo === 'debilitado';
  }
  return false;
}

/**
 * Ganan experiencia las que han salido contra la derrotada (todas la entera, como en los
 * juegos modernos del género) y, con Repartir experiencia, las demás la mitad.
 */
function darExperiencia(e: EstadoCombate, derrotado: Criatura, datos: DatosJuego, ev: Evento[]): void {
  const base = expGanada(derrotado, datos, !e.salvaje);
  const activo = e.jugador.activo;
  const participantes = [activo, ...e.participantes.filter((i) => i !== activo)];
  const resto = e.repartir ? e.jugador.equipo.map((_, i) => i).filter((i) => !participantes.includes(i) && vivo(e.jugador.equipo[i])) : [];
  if (resto.length > 0) ev.push({ tipo: 'experienciaRepartida' });
  for (const indice of [...participantes, ...resto]) {
    const receptor = e.jugador.equipo[indice];
    if (!receptor || !vivo(receptor)) continue;
    const ef = efectoEquipo(receptor, datos);
    const repartida = !participantes.includes(indice);
    const propia = repartida ? Math.max(1, Math.floor(base / 2)) : base;
    const cantidad = ef?.tipo === 'experiencia' ? Math.floor(propia * ef.multiplicador) : propia;
    const { criatura, subidas } = aplicarExperiencia(receptor, cantidad, datos);
    Object.assign(receptor, criatura);
    const nombre = nombreDe(receptor, datos);
    ev.push(repartida ? { tipo: 'experiencia', indice, nombre, cantidad, repartida } : { tipo: 'experiencia', indice, nombre, cantidad });
    for (const s of subidas) {
      ev.push({ tipo: 'nivel', indice, nombre, nivel: s.nivel, vida: s.vida, vidaMax: s.vidaMax });
      for (const m of s.aprendidos) ev.push({ tipo: 'aprende', indice, nombre, movimiento: datos.movimientos[m].nombre });
      for (const m of s.pendientes) {
        ev.push({ tipo: 'noAprende', indice, nombre, movimiento: datos.movimientos[m].nombre, movimientoId: m });
      }
    }
  }
}

function finDeTurno(e: EstadoCombate, datos: DatosJuego, ev: Evento[]): void {
  if (e.fin) return;
  const lados: Lado[] =
    celeridadEfectiva(e, 'jugador', datos) >= celeridadEfectiva(e, 'rival', datos) ? ['jugador', 'rival'] : ['rival', 'jugador'];
  // Quemaduras y venenos.
  for (const lado of lados) {
    const c = activoDe(e, lado);
    if (!vivo(c) || !c.estado) continue;
    const max = vidaMax(c, datos);
    if (c.estado.tipo === 'quemado') quitarVida(e, lado, Math.floor(max / 16), 'quemadura', datos, ev);
    else if (c.estado.tipo === 'envenenado') quitarVida(e, lado, Math.floor(max / 8), 'veneno', datos, ev);
    else if (c.estado.tipo === 'intoxicado') {
      quitarVida(e, lado, Math.floor((max * c.estado.turnos) / 16), 'veneno', datos, ev);
      c.estado.turnos = Math.min(15, c.estado.turnos + 1);
    } else continue;
    comprobarBaya(e, lado, datos, ev);
    comprobarDebilitado(e, lado, datos, ev);
  }
  // Drenadoras: la Vida que pierde se la lleva el activo del otro lado.
  for (const lado of lados) {
    const c = activoDe(e, lado);
    const ladoReceptor = otro(lado);
    const receptor = activoDe(e, ladoReceptor);
    if (!e[lado].volatil.drenadoras || !vivo(c) || !vivo(receptor)) continue;
    const robado = quitarVida(e, lado, Math.floor(vidaMax(c, datos) / 8), 'drenadoras', datos, ev);
    if (receptor.vida < vidaMax(receptor, datos)) curar(receptor, robado, ladoReceptor, e[ladoReceptor].activo, datos, ev);
    comprobarBaya(e, lado, datos, ev);
    comprobarDebilitado(e, lado, datos, ev);
  }
  for (const lado of lados) {
    const c = activoDe(e, lado);
    const ef = efectoEquipo(c, datos);
    if (ef?.tipo !== 'regenerar' || !vivo(c)) continue;
    const max = vidaMax(c, datos);
    if (c.vida >= max) continue;
    ev.push({ tipo: 'objetoEquipado', lado, nombre: nombreDe(c, datos), objeto: nombreObjeto(c, datos), efecto: 'cura' });
    curar(c, Math.max(1, Math.floor(max * ef.fraccion)), lado, e[lado].activo, datos, ev);
  }
  // Carrerilla y Muda.
  for (const lado of lados) {
    const c = activoDe(e, lado);
    const p = pasivaDe(c, datos);
    if (!p || !vivo(c)) continue;
    if (p.efecto.tipo === 'carrerilla' && e[lado].etapas.celeridad < 6) {
      anunciarPasiva(ev, lado, c, p, datos);
      cambiarEtapa(e, lado, 'celeridad', 1, datos, ev, false);
    } else if (p.efecto.tipo === 'muda' && c.estado && probabilidad(e.rng, 100 / 3)) {
      anunciarPasiva(ev, lado, c, p, datos);
      c.estado = null;
      ev.push({ tipo: 'curaEstado', lado, nombre: nombreDe(c, datos) });
    }
  }
  for (const lado of lados) {
    const v = e[lado].volatil;
    v.protegido = false;
    v.retrocede = false;
    v.actuado = false;
  }
}

function resolverDebilitados(e: EstadoCombate, datos: DatosJuego, ev: Evento[]): void {
  if (e.fin) return;
  if (!vivo(activoDe(e, 'rival'))) {
    const siguiente = e.rival.equipo.findIndex(vivo);
    if (siguiente < 0) {
      e.fin = 'victoria';
      ev.push({ tipo: 'fin', resultado: 'victoria' });
      return;
    }
    entrar(e, 'rival', siguiente, datos, ev);
  }
  if (!vivo(activoDe(e, 'jugador'))) {
    if (!e.jugador.equipo.some(vivo)) {
      e.fin = 'derrota';
      ev.push({ tipo: 'fin', resultado: 'derrota' });
      return;
    }
    e.pendiente = 'reemplazo';
  }
}
