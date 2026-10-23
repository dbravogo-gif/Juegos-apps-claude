// Motor de combate: una función pura (estado, acción) → (estado, eventos). El estado es JSON y
// lleva dentro el generador aleatorio, así que el mismo estado con la misma acción da siempre
// el mismo resultado. La interfaz solo pinta los eventos.

import type {
  Criatura,
  DatosJuego,
  EstadisticaCombate,
  EstadoAlterado,
  Etapas,
  Movimiento,
} from './modelo';
import { crearRng, entero, probabilidad, type EstadoRng } from './rng';
import { calcularEstadisticas, multiplicadorEtapa } from './estadisticas';
import { calcularDanio, PROB_CRITICO, type Combatiente } from './danio';
import { intentarCaptura } from './captura';
import { aplicarExperiencia, expGanada } from './progreso';
import { nombreDe } from './criatura';
import { elegirAccionIA } from './ia';

export type Lado = 'jugador' | 'rival';
export type ResultadoCombate = 'victoria' | 'derrota' | 'huida' | 'captura';

export interface LadoCombate {
  nombre: string;
  equipo: Criatura[];
  activo: number;
  /** Cambios de estadísticas del activo. Se pierden al retirarlo. */
  etapas: Etapas;
  objetos: Record<string, number>;
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
      causa: 'ataque' | 'quemadura' | 'retroceso';
    }
  | { tipo: 'sinEfecto'; lado: Lado; nombre: string }
  | { tipo: 'curacion'; lado: Lado; indice: number; nombre: string; cantidad: number; vida: number; vidaMax: number }
  | { tipo: 'estado'; lado: Lado; nombre: string; estado: EstadoAlterado }
  | { tipo: 'sigueDormido'; lado: Lado; nombre: string }
  | { tipo: 'despierta'; lado: Lado; nombre: string }
  | { tipo: 'etapa'; lado: Lado; nombre: string; estadistica: EstadisticaCombate; cambio: number; intento: number }
  | { tipo: 'debilitado'; lado: Lado; nombre: string }
  | { tipo: 'experiencia'; indice: number; nombre: string; cantidad: number }
  | { tipo: 'nivel'; indice: number; nombre: string; nivel: number; vida: number; vidaMax: number }
  | { tipo: 'aprende'; indice: number; nombre: string; movimiento: string }
  /** Ya sabe cuatro movimientos: la interfaz pregunta si olvida uno al acabar el combate. */
  | { tipo: 'noAprende'; indice: number; nombre: string; movimiento: string; movimientoId: string }
  | { tipo: 'objeto'; lado: Lado; objeto: string }
  | { tipo: 'captura'; nombre: string; sacudidas: number; exito: boolean }
  | { tipo: 'huida'; exito: boolean }
  | { tipo: 'fin'; resultado: ResultadoCombate };

export interface Resultado {
  estado: EstadoCombate;
  eventos: Evento[];
}

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
  return { criatura: activoDe(e, lado), etapas: e[lado].etapas };
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
  };
}

export interface ParticipanteInicial {
  nombre: string;
  equipo: Criatura[];
  objetos?: Record<string, number>;
}

export function iniciarCombate(
  op: { semilla: number | string; jugador: ParticipanteInicial; rival: ParticipanteInicial; salvaje: boolean },
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
  };
  const eventos: Evento[] = [
    { tipo: 'entrada', lado: 'rival', indice: estado.rival.activo, ficha: fichaDe(activoDe(estado, 'rival'), datos) },
    { tipo: 'entrada', lado: 'jugador', indice: estado.jugador.activo, ficha: fichaDe(activoDe(estado, 'jugador'), datos) },
  ];
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
    if (!obj || n <= 0 || obj.tipo === 'clave') continue;
    objetos[id] = obj.tipo === 'captura' ? e.salvaje : e.jugador.equipo.some((c) => vivo(c) && c.vida < vidaMax(c, datos));
  }
  return {
    movimientos: a.movimientos.map((m) => m.pp > 0),
    sinPP: a.movimientos.every((m) => m.pp === 0),
    cambios: e.jugador.equipo.map((c, i) => i !== e.jugador.activo && vivo(c)),
    objetos,
    huir: e.salvaje,
  };
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
      if (obj.tipo === 'clave') throw new Error('Ese objeto no se usa en combate');
      if (obj.tipo === 'captura' && !e.salvaje) throw new Error('No se puede capturar la criatura de otro entrenador');
      if (obj.tipo === 'curar') {
        const c = j.equipo[accion.objetivo ?? j.activo];
        if (!c || !vivo(c)) throw new Error('No se puede curar a esa criatura');
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

  const accionRival = elegirAccionIA(e, datos);

  switch (accion.tipo) {
    case 'huir':
      if (huir(e, datos, ev)) return { estado: e, eventos: ev };
      ejecutarMovimiento(e, 'rival', indiceDe(accionRival), datos, ev);
      break;
    case 'objeto':
      if (usarObjeto(e, accion, datos, ev)) return { estado: e, eventos: ev };
      ejecutarMovimiento(e, 'rival', indiceDe(accionRival), datos, ev);
      break;
    case 'cambio':
      ev.push({ tipo: 'retirada', lado: 'jugador', nombre: nombreDe(activoDe(e, 'jugador'), datos) });
      entrar(e, 'jugador', accion.indice, datos, ev);
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
  return { estado: e, eventos: ev };
}

function indiceDe(a: Accion): number {
  return a.tipo === 'movimiento' ? a.indice : -1;
}

function movimientoUsado(c: Criatura, indice: number, datos: DatosJuego): Movimiento {
  const m = c.movimientos[indice];
  return m && m.pp > 0 ? datos.movimientos[m.id] : ARREBATO;
}

function celeridadEfectiva(e: EstadoCombate, lado: Lado, datos: DatosJuego): number {
  return calcularEstadisticas(activoDe(e, lado), datos).celeridad * multiplicadorEtapa(e[lado].etapas.celeridad);
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
  if (pj !== pr) primeroJugador = pj > pr;
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
  ev.push({ tipo: 'entrada', lado, indice, ficha: fichaDe(activoDe(e, lado), datos) });
}

function huir(e: EstadoCombate, datos: DatosJuego, ev: Evento[]): boolean {
  e.intentosHuida += 1;
  const cj = celeridadEfectiva(e, 'jugador', datos);
  const cr = Math.max(1, celeridadEfectiva(e, 'rival', datos));
  const exito = cj >= cr || entero(e.rng, 0, 255) < Math.floor((cj * 128) / cr) + 30 * e.intentosHuida;
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
  if (obj.tipo === 'clave') return false;
  e.jugador.objetos[accion.objeto] -= 1;
  ev.push({ tipo: 'objeto', lado: 'jugador', objeto: obj.nombre });
  if (obj.tipo === 'curar') {
    const indice = accion.objetivo ?? e.jugador.activo;
    const c = e.jugador.equipo[indice];
    curar(c, obj.cantidad, 'jugador', indice, datos, ev);
    return false;
  }
  const presa = activoDe(e, 'rival');
  const r = intentarCaptura(
    {
      vida: presa.vida,
      vidaMax: vidaMax(presa, datos),
      ratio: datos.especies[presa.especie].ratioCaptura,
      bonus: obj.bonus,
      estado: presa.estado,
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
  const ladoDef = otro(lado);
  const defensor = activoDe(e, ladoDef);
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

  const contraRival = mov.categoria !== 'estado' || (mov.efectos ?? []).some((f) => f.tipo === 'estado' || (f.tipo === 'etapa' && f.objetivo === 'rival'));
  if (contraRival && !vivo(defensor)) {
    ev.push({ tipo: 'falla', lado, nombre: nAt });
    return;
  }
  if (mov.precision !== null && entero(e.rng, 1, 100) > mov.precision) {
    ev.push({ tipo: 'falla', lado, nombre: nAt });
    return;
  }

  let danioCausado = 0;
  if (mov.categoria !== 'estado') {
    const critico = probabilidad(e.rng, PROB_CRITICO);
    const tirada = entero(e.rng, 85, 100);
    const r = calcularDanio(combatiente(e, lado), combatiente(e, ladoDef), mov, datos, critico, tirada);
    if (r.eficacia === 0) {
      ev.push({ tipo: 'sinEfecto', lado: ladoDef, nombre: nDef });
      return;
    }
    danioCausado = Math.min(defensor.vida, r.danio);
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
    if (mov === ARREBATO) {
      const max = vidaMax(atacante, datos);
      const retroceso = Math.min(atacante.vida, Math.max(1, Math.floor(max / 4)));
      atacante.vida -= retroceso;
      ev.push({ tipo: 'danio', lado, nombre: nAt, cantidad: retroceso, vida: atacante.vida, vidaMax: max, eficacia: 1, critico: false, causa: 'retroceso' });
    }
  }

  for (const f of mov.efectos ?? []) {
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
        const inmune =
          defensor.estado !== null ||
          (f.estado === 'quemado' && datos.especies[defensor.especie].tipos.includes('infernal'));
        if (inmune) {
          if (mov.categoria === 'estado') ev.push({ tipo: 'sinEfecto', lado: ladoDef, nombre: nDef });
          break;
        }
        if (!probabilidad(e.rng, f.prob)) break;
        defensor.estado = f.estado === 'dormido' ? { tipo: 'dormido', turnos: entero(e.rng, 1, 3) } : { tipo: 'quemado' };
        ev.push({ tipo: 'estado', lado: ladoDef, nombre: nDef, estado: f.estado });
        break;
      }
      case 'etapa': {
        const objetivoLado = f.objetivo === 'propio' ? lado : ladoDef;
        const objetivo = activoDe(e, objetivoLado);
        if (!vivo(objetivo)) break;
        if (!probabilidad(e.rng, f.prob)) break;
        const etapas = e[objetivoLado].etapas;
        const antes = etapas[f.estadistica];
        const despues = Math.max(-6, Math.min(6, antes + f.cambio));
        etapas[f.estadistica] = despues;
        ev.push({
          tipo: 'etapa',
          lado: objetivoLado,
          nombre: nombreDe(objetivo, datos),
          estadistica: f.estadistica,
          cambio: despues - antes,
          intento: f.cambio,
        });
        break;
      }
    }
  }

  comprobarDebilitado(e, ladoDef, datos, ev);
  comprobarDebilitado(e, lado, datos, ev);
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

function darExperiencia(e: EstadoCombate, derrotado: Criatura, datos: DatosJuego, ev: Evento[]): void {
  const receptor = activoDe(e, 'jugador');
  if (!vivo(receptor)) return;
  const cantidad = expGanada(derrotado, datos, !e.salvaje);
  const { criatura, subidas } = aplicarExperiencia(receptor, cantidad, datos);
  Object.assign(receptor, criatura);
  const nombre = nombreDe(receptor, datos);
  const indice = e.jugador.activo;
  ev.push({ tipo: 'experiencia', indice, nombre, cantidad });
  for (const s of subidas) {
    ev.push({ tipo: 'nivel', indice, nombre, nivel: s.nivel, vida: s.vida, vidaMax: s.vidaMax });
    for (const m of s.aprendidos) ev.push({ tipo: 'aprende', indice, nombre, movimiento: datos.movimientos[m].nombre });
    for (const m of s.pendientes) {
      ev.push({ tipo: 'noAprende', indice, nombre, movimiento: datos.movimientos[m].nombre, movimientoId: m });
    }
  }
}

function finDeTurno(e: EstadoCombate, datos: DatosJuego, ev: Evento[]): void {
  if (e.fin) return;
  const lados: Lado[] =
    celeridadEfectiva(e, 'jugador', datos) >= celeridadEfectiva(e, 'rival', datos) ? ['jugador', 'rival'] : ['rival', 'jugador'];
  for (const lado of lados) {
    const c = activoDe(e, lado);
    if (!vivo(c) || c.estado?.tipo !== 'quemado') continue;
    const max = vidaMax(c, datos);
    const cantidad = Math.min(c.vida, Math.max(1, Math.floor(max / 16)));
    c.vida -= cantidad;
    ev.push({ tipo: 'danio', lado, nombre: nombreDe(c, datos), cantidad, vida: c.vida, vidaMax: max, eficacia: 1, critico: false, causa: 'quemadura' });
    comprobarDebilitado(e, lado, datos, ev);
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
