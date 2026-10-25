// Estado de una partida del modo historia. Es JSON plano: se guarda tal cual. Las funciones
// de este módulo modifican la partida que reciben, como las del generador aleatorio.

import type { Criatura, DatosJuego } from './modelo';
import { crearRng, elegirPonderado, entero, probabilidad, type EstadoRng } from './rng';
import { crearCriatura, curarDelTodo } from './criatura';
import { vidaMaxima } from './estadisticas';
import type { DefEntrenador, Dir, TablaEncuentros } from './mundo';
import type { ResultadoCombate } from './combate';

export const VERSION_PARTIDA = 2;
export const MAX_EQUIPO = 6;

export interface Posicion {
  zona: string;
  x: number;
  y: number;
  dir: Dir;
}

export interface Partida {
  version: number;
  nombre: string;
  rng: EstadoRng;
  posicion: Posicion;
  /** Dónde reapareces si pierdes: el último mesón. */
  regreso: Posicion;
  equipo: Criatura[];
  /** Las criaturas que no caben en el equipo viven en las páginas del Bestiario. */
  almacen: Criatura[];
  objetos: Record<string, number>;
  dinero: number;
  vistos: string[];
  capturados: string[];
  banderas: Record<string, boolean>;
  vencidos: string[];
  blasones: string[];
  pasos: number;
  /** Pasos que le quedan al repelente en uso. */
  repelente: number;
  /** Recipientes ya registrados, como `zona:id`. */
  revisados: string[];
  /** La última tésera lanzada en un combate: sale a mano en el siguiente. */
  ultimaTesera?: string;
}

export function nuevaPartida(nombre: string, semilla: number | string, inicio: Posicion): Partida {
  return {
    version: VERSION_PARTIDA,
    nombre,
    rng: crearRng(semilla),
    posicion: { ...inicio },
    regreso: { ...inicio },
    equipo: [],
    almacen: [],
    objetos: {},
    dinero: 300,
    vistos: [],
    capturados: [],
    banderas: {},
    vencidos: [],
    blasones: [],
    pasos: 0,
    repelente: 0,
    revisados: [],
  };
}

export function marcarVisto(p: Partida, especie: string): void {
  if (!p.vistos.includes(especie)) p.vistos.push(especie);
}

export function marcarCapturado(p: Partida, especie: string): void {
  marcarVisto(p, especie);
  if (!p.capturados.includes(especie)) p.capturados.push(especie);
}

/** Añade una criatura al equipo o, si está lleno, al Bestiario. Devuelve dónde ha ido. */
export function anadirCriatura(p: Partida, c: Criatura): 'equipo' | 'almacen' {
  marcarCapturado(p, c.especie);
  if (p.equipo.length < MAX_EQUIPO) {
    p.equipo.push(c);
    return 'equipo';
  }
  p.almacen.push(c);
  return 'almacen';
}

/**
 * Pone al día una partida cargada con los datos actuales: las criaturas de especies retiradas
 * pasan a su sustituta, y la Vida no pasa de la máxima, por si han cambiado las estadísticas.
 */
export function ajustarADatos(p: Partida, datos: DatosJuego, retiradas: Record<string, { desdeNivel: number; a: string }[]>): void {
  for (const c of [...p.equipo, ...p.almacen]) {
    const opciones = retiradas[c.especie];
    if (opciones) c.especie = (opciones.find((o) => c.nivel >= o.desdeNivel) ?? opciones[opciones.length - 1]).a;
    c.vida = Math.min(c.vida, vidaMaxima(c, datos));
  }
  const sustituir = (ids: string[]) =>
    [...new Set(ids.map((id) => retiradas[id]?.at(-1)?.a ?? id))].filter((id) => datos.especies[id]);
  p.vistos = sustituir(p.vistos);
  p.capturados = sustituir(p.capturados);
  for (const c of [...p.equipo, ...p.almacen]) marcarCapturado(p, c.especie);
}

export function darObjeto(p: Partida, objeto: string, cantidad: number): void {
  p.objetos[objeto] = Math.max(0, (p.objetos[objeto] ?? 0) + cantidad);
}

export function curarEquipo(p: Partida, datos: DatosJuego): void {
  p.equipo = p.equipo.map((c) => curarDelTodo(c, datos));
}

export function equipoEnPie(p: Partida): boolean {
  return p.equipo.some((c) => c.vida > 0);
}

/** Saca una semilla nueva para un combate, sin perder el determinismo de la partida. */
export function semillaCombate(p: Partida): number {
  return entero(p.rng, 0, 0x7fffffff);
}

/**
 * Gasta un paso del repelente. Devuelve `true` si se acaba justo ahora, para avisar.
 */
export function pasoRepelente(p: Partida): boolean {
  if (p.repelente <= 0) return false;
  p.repelente -= 1;
  return p.repelente === 0;
}

/** Con repelente, no aparecen criaturas de menos nivel que la primera del equipo en pie. */
export function repelida(p: Partida, salvaje: Criatura): boolean {
  if (p.repelente <= 0) return false;
  const primera = p.equipo.find((c) => c.vida > 0);
  return primera !== undefined && salvaje.nivel < primera.nivel;
}

/** Un paso por hierba alta: devuelve la criatura salvaje que aparece, o `null`. */
export function tirarEncuentro(p: Partida, tabla: TablaEncuentros, datos: DatosJuego): Criatura | null {
  if (!probabilidad(p.rng, tabla.tasa)) return null;
  const e = tabla.especies[elegirPonderado(p.rng, tabla.especies.map((x) => x.peso))];
  return crearCriatura(datos, e.especie, entero(p.rng, e.min, e.max), p.rng);
}

/** El equipo de un entrenador es siempre el mismo en todas las partidas. */
export function equipoEntrenador(def: DefEntrenador, datos: DatosJuego): Criatura[] {
  const rng = crearRng(`entrenador:${def.id}`);
  return def.equipo.map((e) => crearCriatura(datos, e.especie, e.nivel, rng, { valia: def.valia }));
}

export interface ResultadoParaPartida {
  resultado: ResultadoCombate;
  equipo: Criatura[];
  objetos: Record<string, number>;
  capturada: Criatura | null;
  rivales: string[];
  entrenador?: DefEntrenador;
}

/** Lo que se pierde al caer derrotado: una décima parte del dinero. */
export const PERDIDA_DERROTA = 0.1;

/**
 * Vuelca el resultado de un combate en la partida. Devuelve el premio ganado y el dinero
 * perdido, para que la interfaz lo cuente.
 */
export function aplicarCombate(
  p: Partida,
  r: ResultadoParaPartida,
  datos: DatosJuego,
): { premio: number; perdido: number; regalos: Record<string, number> } {
  p.equipo = r.equipo;
  p.objetos = { ...r.objetos };
  for (const e of r.rivales) marcarVisto(p, e);
  // Las que han evolucionado durante el combate cuentan como capturadas en su nueva forma.
  for (const c of p.equipo) marcarCapturado(p, c.especie);
  if (r.capturada) anadirCriatura(p, r.capturada);
  let premio = 0;
  let perdido = 0;
  let regalos: Record<string, number> = {};
  if (r.resultado === 'victoria' && r.entrenador) {
    const primeraVez = !p.vencidos.includes(r.entrenador.id);
    if (primeraVez) p.vencidos.push(r.entrenador.id);
    premio = r.entrenador.premio;
    p.dinero += premio;
    if (primeraVez && r.entrenador.objetos) {
      regalos = { ...r.entrenador.objetos };
      for (const [id, n] of Object.entries(regalos)) darObjeto(p, id, n);
    }
  }
  if (r.resultado === 'derrota') {
    perdido = Math.floor(p.dinero * PERDIDA_DERROTA);
    p.dinero -= perdido;
    p.posicion = { ...p.regreso };
    curarEquipo(p, datos);
  }
  return { premio, perdido, regalos };
}
