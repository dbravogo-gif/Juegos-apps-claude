// El motor: registra los subsistemas, los inicia en orden de dependencias, avanza la lógica a
// paso fijo (60 Hz) y llama a actualizar() una vez por fotograma. No conoce el DOM: el bucle de
// requestAnimationFrame lo pone main.ts, y así el motor se prueba en Node.

import type { PerspectiveCamera, Scene } from 'three';
import { crearRng, type EstadoRng } from '../core/rng';
import { CALIDADES, type Calidad, type NivelCalidad } from './calidad';
import { Eventos } from './eventos';

/** Duración del paso fijo, en segundos. */
export const PASO_FIJO = 1 / 60;
/** Pasos fijos como mucho por fotograma: evita la espiral de la muerte tras una pausa. */
export const PASOS_MAX_POR_FOTOGRAMA = 5;

export interface Tiempo {
  /** Fotogramas dibujados desde el arranque. */
  fotograma: number;
  /** Pasos fijos ejecutados desde el arranque. */
  pasos: number;
  /** Fracción del siguiente paso fijo ya transcurrida, de 0 a 1: para interpolar. */
  alfa: number;
}

export interface Ctx {
  escena: Scene;
  camara: PerspectiveCamera;
  config: { calidad: Calidad };
  eventos: Eventos;
  tiempo: Tiempo;
  rng: EstadoRng;
  get<T extends Subsistema>(id: string): T;
  tiene(id: string): boolean;
}

export interface Subsistema {
  init(ctx: Ctx): Promise<void> | void;
  /** Lógica determinista a frecuencia fija. `h` es PASO_FIJO. */
  pasoFijo?(h: number, ctx: Ctx): void;
  /** Una vez por fotograma, con el tiempo real transcurrido en segundos. */
  actualizar?(dt: number, ctx: Ctx): void;
  /** Fase final del fotograma, después de todos los actualizar(): solo el render dibuja aquí. */
  dibujar?(ctx: Ctx): void;
  redimensionar?(ancho: number, alto: number, ctx: Ctx): void;
  dispose(): void;
}

export interface ClaseSubsistema {
  new (): Subsistema;
  readonly id: string;
  readonly deps: readonly string[];
}

/** Ordena las clases para que cada una vaya detrás de sus dependencias. */
export function ordenarPorDependencias(clases: readonly ClaseSubsistema[]): ClaseSubsistema[] {
  const porId = new Map<string, ClaseSubsistema>();
  for (const c of clases) {
    if (porId.has(c.id)) throw new Error(`Subsistema repetido: «${c.id}»`);
    porId.set(c.id, c);
  }
  const orden: ClaseSubsistema[] = [];
  const estado = new Map<string, 'visitando' | 'hecho'>();
  const visitar = (c: ClaseSubsistema, camino: string[]) => {
    const e = estado.get(c.id);
    if (e === 'hecho') return;
    if (e === 'visitando') throw new Error(`Dependencia circular: ${[...camino, c.id].join(' → ')}`);
    estado.set(c.id, 'visitando');
    for (const dep of c.deps) {
      const d = porId.get(dep);
      if (!d) throw new Error(`«${c.id}» depende de «${dep}», que no está registrado`);
      visitar(d, [...camino, c.id]);
    }
    estado.set(c.id, 'hecho');
    orden.push(c);
  };
  for (const c of clases) visitar(c, []);
  return orden;
}

export class Motor {
  readonly ctx: Ctx;
  private sistemas: { id: string; sistema: Subsistema }[] = [];
  private porId = new Map<string, Subsistema>();
  private acumulado = 0;

  constructor(escena: Scene, camara: PerspectiveCamera, nivel: NivelCalidad, semilla: number | string) {
    const porId = this.porId;
    this.ctx = {
      escena,
      camara,
      config: { calidad: CALIDADES[nivel] },
      eventos: new Eventos(),
      tiempo: { fotograma: 0, pasos: 0, alfa: 0 },
      rng: crearRng(semilla),
      get<T extends Subsistema>(id: string): T {
        const s = porId.get(id);
        if (!s) throw new Error(`No hay ningún subsistema «${id}»`);
        return s as T;
      },
      tiene: (id: string) => porId.has(id),
    };
  }

  /** Crea e inicia los subsistemas en orden de dependencias. */
  async iniciar(clases: readonly ClaseSubsistema[]): Promise<void> {
    for (const Clase of ordenarPorDependencias(clases)) {
      const sistema = new Clase();
      this.porId.set(Clase.id, sistema);
      this.sistemas.push({ id: Clase.id, sistema });
      await sistema.init(this.ctx);
    }
  }

  /** Avanza un fotograma: los pasos fijos que tocan y después actualizar(). */
  fotograma(dtSegundos: number): void {
    const dt = Math.max(0, Math.min(dtSegundos, PASO_FIJO * PASOS_MAX_POR_FOTOGRAMA));
    this.acumulado += dt;
    // Margen para que 1/60 s exacto cuente como un paso pese al redondeo binario.
    while (this.acumulado >= PASO_FIJO - 1e-9) {
      this.acumulado -= PASO_FIJO;
      for (const { sistema } of this.sistemas) sistema.pasoFijo?.(PASO_FIJO, this.ctx);
      this.ctx.tiempo.pasos++;
    }
    this.acumulado = Math.max(0, this.acumulado);
    this.ctx.tiempo.alfa = this.acumulado / PASO_FIJO;
    for (const { sistema } of this.sistemas) sistema.actualizar?.(dt, this.ctx);
    for (const { sistema } of this.sistemas) sistema.dibujar?.(this.ctx);
    this.ctx.tiempo.fotograma++;
  }

  redimensionar(ancho: number, alto: number): void {
    for (const { sistema } of this.sistemas) sistema.redimensionar?.(ancho, alto, this.ctx);
  }

  /** Libera en orden inverso al de inicio. */
  dispose(): void {
    for (const { sistema } of [...this.sistemas].reverse()) sistema.dispose();
    this.sistemas = [];
    this.porId.clear();
    this.ctx.eventos.limpiar();
  }
}
