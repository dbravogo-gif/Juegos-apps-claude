// Estado de una partida del modo historia. Es JSON plano: se guarda tal cual. Las funciones
// de este módulo modifican la partida que reciben, como las del generador aleatorio.

import type { Criatura, DatosJuego } from './modelo';
import { crearRng, elegirPonderado, entero, probabilidad, type EstadoRng } from './rng';
import { crearCriatura, curarDelTodo, sexoPara } from './criatura';
import { vidaMaxima } from './estadisticas';
import type { DefEntrenador, Dir, TablaEncuentros } from './mundo';
import type { ResultadoCombate } from './combate';
import { guardadas, guardar, paginasVacias, type Pagina } from './almacen';
import { eficacia } from './tipos';

export const VERSION_PARTIDA = 3;
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
  /** Las criaturas que no van en el equipo viven en las páginas del Bestiario (`almacen.ts`). */
  paginas: Pagina[];
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
  /** La especie inicial que eligió. En las partidas antiguas se deduce del equipo (`inicialDe`). */
  inicial?: string;
  /** Los nombres que puso el jugador a sus dos rivales. */
  rivales?: { a?: string; b?: string };
  /** Zonas por las que ha pasado el jugador (para el mapa y Vuelo). Ver `zonasVisitadas`. */
  visitadas?: string[];
  /**
   * Partida del modo desarrollador: se guarda aparte y su menú de pausa permite darse objetos y
   * criaturas, viajar a cualquier zona o quitar los encuentros (`dev:sin_encuentros`).
   */
  dev?: boolean;
}

export function nuevaPartida(nombre: string, semilla: number | string, inicio: Posicion): Partida {
  return {
    version: VERSION_PARTIDA,
    nombre,
    rng: crearRng(semilla),
    posicion: { ...inicio },
    regreso: { ...inicio },
    equipo: [],
    paginas: paginasVacias(),
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

/**
 * Las zonas visitadas. Las partidas de antes de que existiera la lista la reciben con lo que se
 * sabe: la zona actual y las que tienen el guion de entrada visto.
 */
export function zonasVisitadas(p: Partida): string[] {
  p.visitadas ??= [...new Set([p.posicion.zona, ...Object.keys(p.banderas).filter((b) => b.startsWith('visto:')).map((b) => b.slice(6))])];
  return p.visitadas;
}

export function marcarVisitada(p: Partida, zona: string): void {
  const v = zonasVisitadas(p);
  if (!v.includes(zona)) v.push(zona);
}

/** La primera criatura del equipo que sabe un movimiento (para Pleamar y Vuelo fuera de combate). */
export function quienSabe(p: Partida, movimiento: string): Criatura | undefined {
  return p.equipo.find((c) => c.movimientos.some((m) => m.id === movimiento));
}

/**
 * Objetos que da la historia y que una partida empezada antes de añadirlos no tiene: si la
 * bandera `si` está puesta y la marca no, se dan y se pone la marca. Devuelve lo que se ha dado.
 */
export function darAtrasados(p: Partida, regalos: readonly { si: string; marca: string; objeto: string; cantidad?: number }[]): string[] {
  const dados: string[] = [];
  for (const r of regalos) {
    if (!p.banderas[r.si] || p.banderas[r.marca]) continue;
    p.banderas[r.marca] = true;
    darObjeto(p, r.objeto, r.cantidad ?? 1);
    dados.push(r.objeto);
  }
  return dados;
}

/** Añade una criatura al equipo o, si está lleno, al Bestiario. Devuelve dónde ha ido. */
export function anadirCriatura(p: Partida, c: Criatura): 'equipo' | 'almacen' {
  marcarCapturado(p, c.especie);
  if (p.equipo.length < MAX_EQUIPO) {
    p.equipo.push(c);
    return 'equipo';
  }
  guardar(p, c);
  return 'almacen';
}

/**
 * Pone al día una partida cargada con los datos actuales: las criaturas de especies retiradas
 * pasan a su sustituta, y la Vida no pasa de la máxima, por si han cambiado las estadísticas.
 */
export function ajustarADatos(p: Partida, datos: DatosJuego, retiradas: Record<string, { desdeNivel: number; a: string }[]>): void {
  for (const c of [...p.equipo, ...guardadas(p)]) {
    const opciones = retiradas[c.especie];
    if (opciones) c.especie = (opciones.find((o) => c.nivel >= o.desdeNivel) ?? opciones[opciones.length - 1]).a;
    c.vida = Math.min(c.vida, vidaMaxima(c, datos));
    c.sexo ??= sexoPara(datos, c.especie, c.uid);
  }
  const sustituir = (ids: string[]) =>
    [...new Set(ids.map((id) => retiradas[id]?.at(-1)?.a ?? id))].filter((id) => datos.especies[id]);
  p.vistos = sustituir(p.vistos);
  p.capturados = sustituir(p.capturados);
  for (const c of [...p.equipo, ...guardadas(p)]) marcarCapturado(p, c.especie);
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

// ---------- Rivales ----------

/** La especie y sus evoluciones, en orden (por nivel o con objeto). */
export function lineaDe(especie: string, datos: DatosJuego): string[] {
  const linea = [especie];
  for (let e = datos.especies[especie]?.evoluciona; e && !linea.includes(e.a); e = datos.especies[e.a]?.evoluciona) linea.push(e.a);
  return linea;
}

/** La forma que tiene una especie a ese nivel, si evoluciona por nivel. */
export function formaANivel(especie: string, nivel: number, datos: DatosJuego): string {
  let e = especie;
  for (let evo = datos.especies[e].evoluciona; evo?.nivel !== undefined && evo.nivel <= nivel; evo = datos.especies[e].evoluciona) e = evo.a;
  return e;
}

/** La inicial del jugador. En las partidas de antes de guardarla, la de la línea que hay en su equipo. */
export function inicialDe(p: Partida, iniciales: readonly string[], datos: DatosJuego): string | undefined {
  if (p.inicial) return p.inicial;
  for (const c of [...p.equipo, ...guardadas(p)]) {
    const base = iniciales.find((i) => lineaDe(i, datos).includes(c.especie));
    if (base) return base;
  }
  return undefined;
}

/**
 * Las iniciales de los rivales, como en el género: el primero se queda con la que gana a la del
 * jugador y el segundo, con la que queda.
 */
export function inicialesRivales(inicial: string | undefined, iniciales: readonly string[], datos: DatosJuego): { a: string; b: string } {
  const tipo = (id: string) => datos.especies[id].tipos[0];
  const propia = inicial ?? iniciales[0];
  const otras = iniciales.filter((x) => x !== propia);
  const a = otras.find((x) => eficacia(datos.tipos, tipo(x), [tipo(propia)]) > 1) ?? otras[0];
  return { a, b: otras.find((x) => x !== a) ?? a };
}

/** El nombre de un rival: el que le puso el jugador o, si aún no lo conoce, el de por defecto. */
export function nombreRival(p: Partida, cual: 'a' | 'b', porDefecto: Record<'a' | 'b', string>): string {
  return p.rivales?.[cual] ?? porDefecto[cual];
}

/** Un entrenador listo para el combate: si es un rival, con su nombre y su inicial. */
export function prepararEntrenador(
  def: DefEntrenador,
  p: Partida,
  datos: DatosJuego,
  iniciales: readonly string[],
  nombresPorDefecto: Record<'a' | 'b', string>,
): DefEntrenador {
  if (!def.rival) return def;
  const nombre = nombreRival(p, def.rival.cual, nombresPorDefecto);
  const inicial = inicialesRivales(inicialDe(p, iniciales, datos), iniciales, datos)[def.rival.cual];
  const texto = (t: string) => t.replaceAll('{rival}', nombre).replaceAll('{nombre}', p.nombre);
  return {
    ...def,
    nombre,
    antes: def.antes.map(texto),
    derrota: def.derrota.map(texto),
    despues: def.despues.map(texto),
    equipo: [...def.equipo, { especie: formaANivel(inicial, def.rival.nivel, datos), nivel: def.rival.nivel }],
  };
}
