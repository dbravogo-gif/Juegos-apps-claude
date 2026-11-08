// Subsistema «partida»: el estado del juego en el núcleo y sus modos. Lo avanza a paso fijo
// (60 Hz) con la entrada del teclado; el resto solo lo lee y lo dibuja. Por ahora, explorar la
// isla 1 y leer avisos; el combate, el guardado y los diálogos llegan en sus funciones.
//
// Parámetros de prueba: ?abrir=todo abre todos los pasos cerrados (para recorrer la isla antes
// de que existan el museo, el anciano y el gimnasio).

import { crearExploracion, avanzar, cumplir, interactuar, type EstadoExplorar, type EventoExplorar } from '../../core/explorar';
import { TODAS_LAS_CONDICIONES, clave, construirMundo, edificios, enIsla, type Casilla, type Condicion, type Mundo } from '../../core/mundo';
import { ISLA_1 } from '../../data/isla1';
import { NOMBRE_OBJETO, TEXTO_PUERTA } from '../../data/textos-isla1';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Entrada } from '../entrada/entrada';

export type Modo = 'explorar' | 'aviso';

/** Lo que se puede cargar con poner(): para pruebas y para el guardado (F10). */
export interface EstadoParcial {
  condiciones?: Condicion[];
  zona?: string;
  x?: number;
  y?: number;
}

export class Partida implements Subsistema {
  static readonly id = 'partida';
  static readonly deps: readonly string[] = ['entrada'];

  mundo!: Mundo;
  estado!: EstadoExplorar;
  modo: Modo = 'explorar';
  private entrada!: Entrada;
  private ctx!: Ctx;
  private puertas = new Map<number, Casilla>();

  init(ctx: Ctx): void {
    this.ctx = ctx;
    this.entrada = ctx.get<Entrada>('entrada');
    this.mundo = construirMundo(ISLA_1);
    for (const zona of this.mundo.zonas.keys()) {
      for (const e of edificios(this.mundo, zona)) for (const p of e.puertas) this.puertas.set(p, e.tipo);
    }
    const abrirTodo = new URLSearchParams(location.search).get('abrir') === 'todo';
    this.estado = crearExploracion(this.mundo, abrirTodo ? [...TODAS_LAS_CONDICIONES] : []);
  }

  pasoFijo(): void {
    if (this.modo === 'aviso') {
      if (this.entrada.consumir('confirmar') || this.entrada.consumir('cancelar')) {
        this.modo = 'explorar';
        this.entrada.olvidar();
        this.ctx.eventos.emit('aviso:cerrar', {});
      }
      return;
    }
    const eventos = avanzar(this.mundo, this.estado, this.entrada.direccion());
    if (this.entrada.consumir('confirmar')) eventos.push(...interactuar(this.mundo, this.estado));
    this.entrada.consumir('cancelar');
    for (const ev of eventos) this.atender(ev);
  }

  private atender(ev: EventoExplorar): void {
    switch (ev.tipo) {
      case 'zona':
        this.ctx.eventos.emit('zona:entrar', { zonaId: ev.zona });
        break;
      case 'aviso':
        this.mostrar(ev.texto);
        break;
      case 'objeto':
        this.ctx.eventos.emit('objeto:recogido', { id: ev.id, objeto: ev.objeto });
        this.mostrar(`Has encontrado ${NOMBRE_OBJETO[ev.objeto] ?? ev.objeto}.`);
        break;
      case 'puerta': {
        const tipo = this.puertas.get(clave(ev.x, ev.y));
        const texto = tipo && TEXTO_PUERTA[tipo];
        if (texto) this.mostrar(texto);
        break;
      }
      case 'hablar': {
        const p = this.mundo.zonas.get(ev.zona)?.personajes.find((q) => q.id === ev.personaje);
        this.mostrar(p?.frase ?? '…');
        break;
      }
    }
  }

  private mostrar(texto: string): void {
    this.modo = 'aviso';
    this.ctx.eventos.emit('aviso:mostrar', { texto });
  }

  /** Carga un estado parcial: condiciones cumplidas y posición (en coordenadas de la zona). */
  poner(e: unknown): void {
    const p = e as EstadoParcial;
    for (const c of p.condiciones ?? []) cumplir(this.estado, c);
    if (p.zona !== undefined && p.x !== undefined && p.y !== undefined) {
      const k = enIsla(this.mundo, p.zona, p.x, p.y);
      const z = this.mundo.zonas.get(p.zona)!;
      this.estado.x = this.estado.desdeX = z.origen.x + p.x;
      this.estado.y = this.estado.desdeY = z.origen.y + p.y;
      this.estado.paso = 0;
      this.estado.zona = this.mundo.casillas.get(k)?.zona ?? p.zona;
      this.ctx.eventos.emit('zona:entrar', { zonaId: this.estado.zona });
    }
  }

  /** Resumen para window.__JUEGO__.estado(). */
  visible(): { modo: Modo; zona: string; posicion: { x: number; y: number }; condiciones: Condicion[] } {
    const z = this.mundo.zonas.get(this.estado.zona)!;
    return {
      modo: this.modo,
      zona: this.estado.zona,
      posicion: { x: this.estado.x - z.origen.x, y: this.estado.y - z.origen.y },
      condiciones: [...this.estado.condiciones],
    };
  }

  dispose(): void {}
}
