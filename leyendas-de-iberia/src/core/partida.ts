// Estado de una partida del modo historia. Es JSON plano: se guarda tal cual. Las funciones
// de este módulo modifican la partida que reciben, como las del generador aleatorio.

import type { Criatura, DatosJuego } from './modelo';
import { crearRng, elegirPonderado, entero, probabilidad, type EstadoRng } from './rng';
import { crearCriatura, curarDelTodo } from './criatura';
import type { DefEntrenador, Dir, TablaEncuentros } from './mundo';
import type { ResultadoCombate } from './combate';

export const VERSION_PARTIDA = 1;
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
export function aplicarCombate(p: Partida, r: ResultadoParaPartida, datos: DatosJuego): { premio: number; perdido: number } {
  p.equipo = r.equipo;
  p.objetos = { ...r.objetos };
  for (const e of r.rivales) marcarVisto(p, e);
  if (r.capturada) anadirCriatura(p, r.capturada);
  let premio = 0;
  let perdido = 0;
  if (r.resultado === 'victoria' && r.entrenador) {
    if (!p.vencidos.includes(r.entrenador.id)) p.vencidos.push(r.entrenador.id);
    premio = r.entrenador.premio;
    p.dinero += premio;
  }
  if (r.resultado === 'derrota') {
    perdido = Math.floor(p.dinero * PERDIDA_DERROTA);
    p.dinero -= perdido;
    p.posicion = { ...p.regreso };
    curarEquipo(p, datos);
  }
  return { premio, perdido };
}
