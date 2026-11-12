// Subsistema «partida»: el estado del juego en el núcleo y sus modos. Lo avanza a paso fijo
// (60 Hz) con la entrada del teclado; el resto solo lo lee y lo dibuja.
// Modos: explorar la isla y sus interiores, leer un diálogo, el fundido al cruzar una puerta y el
// combate (lo lleva «combate»). Aquí viven también el equipo y la mochila: al pisar terreno de
// encuentros se sortea si sale una criatura, y las enfermeras y la madre curan al equipo. El
// guardado llega en su función.
//
// Parámetros de prueba: ?abrir=todo abre todos los pasos cerrados.

import { avanzar, crearExploracion, cumplir, entrar, interactuar, salir, type EstadoExplorar, type EventoExplorar } from '../../core/explorar';
import { abrirDialogo, elegirDialogo, lineaActual, pasoDialogo, pulsar, type Dialogo, type Efecto, type EstadoDialogo, type Tecla } from '../../core/guion';
import { TODAS_LAS_CONDICIONES, clave, construirInterior, construirMundo, deClave, enIsla, type Condicion, type Mundo } from '../../core/mundo';
import { GUION_ISLA1 } from '../../data/guion-isla1';
import { INTERIORES_ISLA1, SALA_INICIAL } from '../../data/interiores-isla1';
import { ISLA_1, PUERTAS_ISLA1 } from '../../data/isla1';
import { NOMBRE_OBJETO, OBJETIVOS } from '../../data/textos-isla1';
import { crearCriatura, curarDelTodo } from '../../core/criatura';
import { sortearEncuentro } from '../../core/encuentros';
import type { Criatura } from '../../core/modelo';
import { DATOS_COMBATE_PRUEBA as DATOS, ESPECIE_INICIAL, MOCHILA_INICIAL } from '../../data/combate-prueba';
import { ENCUENTROS_ISLA1 } from '../../data/encuentros-isla1';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Entrada } from '../entrada/entrada';

export type Modo = 'explorar' | 'dialogo' | 'fundido' | 'combate';

/** Pasos fijos de cada mitad del fundido al cruzar una puerta: 0,2 s a negro y 0,2 s de vuelta. */
export const PASOS_FUNDIDO = 12;
/** Tras cerrar un diálogo, unos pasos sin interactuar: la última pulsación no lo vuelve a abrir. */
const ESPERA_TRAS_DIALOGO = 12;
/** Los interiores se colocan lejos de la isla, uno al lado de otro. */
const ORIGEN_INTERIORES = { x: 200, y: 0 };
/** Entre sala y sala: la más ancha (el gimnasio) mide 16 casillas. */
const SEPARACION_INTERIORES = 24;

/** Quién cura al equipo al hablarle, y el refugio al que se vuelve al perder desde entonces. */
const CURANDEROS: Readonly<Record<string, string>> = {
  madre: 'casa-jugador',
  enfermera: 'refugio-geria',
  'enfermera-capital': 'refugio-capital',
};
/** Nivel de la inicial al elegirla. */
const NIVEL_INICIAL = 5;

/** Lo que se puede cargar con poner(): para pruebas y para el guardado (F10). */
export interface EstadoParcial {
  condiciones?: Condicion[];
  inicial?: string;
  /** Solo para pruebas: deja al equipo con esta vida como mucho (para probar la derrota). */
  vida?: number;
  /** Zona de la isla o id de un interior. */
  zona?: string;
  x?: number;
  y?: number;
}

export class Partida implements Subsistema {
  static readonly id = 'partida';
  static readonly deps: readonly string[] = ['entrada'];

  /** La isla. */
  mundo!: Mundo;
  /** Los interiores, por id: salas aparte, lejos de la isla. */
  readonly interiores = new Map<string, Mundo>();
  estado!: EstadoExplorar;
  modo: Modo = 'explorar';
  /** El equipo (hasta 6) y la mochila (objeto → cuántos). Se llenan al elegir la inicial. */
  equipo: Criatura[] = [];
  mochila: Record<string, number> = {};
  /** Al perder, se vuelve curado a esta sala: el último sitio donde curaron al equipo. */
  ultimoRefugio = SALA_INICIAL;
  /** El diálogo abierto, si lo hay. */
  dialogo: EstadoDialogo | null = null;
  /** Negro del fundido al cruzar una puerta, de 0 a 1 (lo dibuja la interfaz). */
  fundido = 0;
  private entrada!: Entrada;
  private ctx!: Ctx;
  /** A qué interior lleva cada puerta de la isla, por clave de casilla. */
  private puertas = new Map<number, string>();
  private cruce: { paso: number; destino: string | null } | null = null;
  private hablando = '';
  private espera = 0;

  init(ctx: Ctx): void {
    this.ctx = ctx;
    this.entrada = ctx.get<Entrada>('entrada');
    this.mundo = construirMundo(ISLA_1);
    INTERIORES_ISLA1.forEach((def, i) => {
      this.interiores.set(def.id, construirInterior(def, { x: ORIGEN_INTERIORES.x + i * SEPARACION_INTERIORES, y: ORIGEN_INTERIORES.y }));
    });
    for (const [zona, puertas] of Object.entries(PUERTAS_ISLA1)) {
      for (const [xy, id] of Object.entries(puertas)) {
        const [x, y] = xy.split(',').map(Number);
        this.puertas.set(enIsla(this.mundo, zona, x, y), id);
      }
    }
    const abrirTodo = new URLSearchParams(location.search).get('abrir') === 'todo';
    this.estado = crearExploracion(this.mundo, abrirTodo ? [...TODAS_LAS_CONDICIONES] : []);
    // Se empieza dentro de casa, como si se acabara de entrar por su puerta.
    const puerta = [...this.puertas].find(([, id]) => id === SALA_INICIAL)?.[0];
    if (puerta !== undefined) {
      [this.estado.x, this.estado.y] = deClave(puerta);
      this.estado.zona = this.mundo.casillas.get(puerta)!.zona;
      entrar(this.estado, SALA_INICIAL, this.interiores.get(SALA_INICIAL)!);
    }
  }

  /** El objetivo que se enseña en pantalla, o null si no queda ninguno. */
  objetivo(): string | null {
    return OBJETIVOS.find((o) => !this.estado.condiciones.includes(o.hasta))?.texto ?? null;
  }

  /** El mapa donde está el jugador: la isla o el interior. */
  activo(): Mundo {
    return this.estado.dentro ? this.interiores.get(this.estado.dentro)! : this.mundo;
  }

  /** Nombre de una zona de la isla o de un interior, para el cartel. */
  nombreZona(id: string): string {
    return this.mundo.zonas.get(id)?.nombre ?? this.interiores.get(id)?.zonas.get(id)?.nombre ?? id;
  }

  pasoFijo(): void {
    // En combate manda el subsistema «combate»: aquí no se anda ni se habla.
    if (this.modo === 'combate') return;
    if (this.modo === 'fundido') return this.pasoFundido();
    if (this.modo === 'dialogo') return this.pasoDialogo();
    if (this.espera > 0) {
      this.espera--;
      this.entrada.consumir('confirmar');
    }
    const parado = this.estado.paso === 0;
    const eventos = avanzar(this.activo(), this.estado, this.entrada.direccion(parado));
    // Interactuar mientras se anda espera a que termine el paso, en vez de perderse.
    if (this.estado.paso === 0 && this.entrada.consumir('confirmar')) eventos.push(...interactuar(this.activo(), this.estado));
    this.entrada.consumir('cancelar');
    for (const ev of eventos) {
      this.atender(ev);
      if (this.modo !== 'explorar') break;
    }
  }

  private pasoDialogo(): void {
    const d = this.dialogo!;
    pasoDialogo(d);
    let tecla: Tecla | null = null;
    if (this.entrada.consumir('confirmar')) tecla = 'confirmar';
    else if (this.entrada.consumir('cancelar')) tecla = 'cancelar';
    else {
      const dir = this.entrada.pulsacion();
      if (dir) tecla = dir === 'o' || dir === 'n' ? 'izquierda' : 'derecha';
    }
    if (!tecla) return;
    const r = pulsar(d, tecla);
    if (r.efecto) this.aplicar(r.efecto);
    if (r.fin) {
      this.dialogo = null;
      this.modo = 'explorar';
      this.espera = ESPERA_TRAS_DIALOGO;
      this.entrada.olvidar();
      this.ctx.eventos.emit('dialogo:cerrar', { guionId: this.hablando });
    }
  }

  private pasoFundido(): void {
    const c = this.cruce!;
    c.paso++;
    this.fundido = c.paso <= PASOS_FUNDIDO ? c.paso / PASOS_FUNDIDO : Math.max(0, 2 - c.paso / PASOS_FUNDIDO);
    if (c.paso === PASOS_FUNDIDO) {
      // En negro: se cambia de sitio.
      if (c.destino) entrar(this.estado, c.destino, this.interiores.get(c.destino)!);
      else salir(this.estado);
      this.ctx.eventos.emit('zona:entrar', { zonaId: this.estado.zona });
    }
    if (c.paso >= 2 * PASOS_FUNDIDO) {
      this.cruce = null;
      this.fundido = 0;
      this.modo = 'explorar';
      this.entrada.olvidar();
    }
  }

  private atender(ev: EventoExplorar): void {
    switch (ev.tipo) {
      case 'zona':
        this.ctx.eventos.emit('zona:entrar', { zonaId: ev.zona });
        break;
      case 'aviso':
        this.abrir({ lineas: [{ texto: ev.texto }] }, 'aviso');
        break;
      case 'objeto':
        this.mochila[ev.objeto] = (this.mochila[ev.objeto] ?? 0) + 1;
        this.ctx.eventos.emit('objeto:recogido', { id: ev.id, objeto: ev.objeto });
        this.abrir({ lineas: [{ texto: `Has encontrado ${NOMBRE_OBJETO[ev.objeto] ?? ev.objeto}.` }] }, 'objeto');
        break;
      case 'puerta': {
        const destino = this.puertas.get(clave(ev.x, ev.y));
        if (destino) this.cruzar(destino);
        else this.abrir({ lineas: [{ texto: 'La puerta está cerrada.' }] }, 'puerta');
        break;
      }
      case 'salida':
        this.cruzar(null);
        break;
      case 'hablar': {
        const d = elegirDialogo(GUION_ISLA1, ev.personaje, this.estado.condiciones, this.estado.inicial);
        const frase = this.activo().zonas.get(ev.zona)?.personajes.find((p) => p.id === ev.personaje)?.frase;
        let dialogo: Dialogo = d ?? { lineas: [{ texto: frase ?? '…' }] };
        const refugio = CURANDEROS[ev.personaje];
        if (refugio && this.equipo.length) {
          this.curarEquipo();
          this.ultimoRefugio = refugio;
          dialogo = { ...dialogo, lineas: [...dialogo.lineas, { texto: 'Tu equipo está como nuevo.' }] };
        }
        this.abrir(dialogo, ev.personaje);
        break;
      }
      case 'hierba': {
        // Sin una criatura en pie no se lucha: la hierba se cruza sin más.
        if (!this.equipo.some((c) => c.vida > 0)) break;
        const s = sortearEncuentro(ENCUENTROS_ISLA1, ev.zona, this.ctx.rng);
        if (s) this.ctx.eventos.emit('encuentro:inicio', { salvajes: [crearCriatura(DATOS, s.especie, s.nivel, this.ctx.rng)], visible: false });
        break;
      }
    }
  }

  private abrir(d: Dialogo, guionId: string): void {
    this.dialogo = abrirDialogo(d);
    this.hablando = guionId;
    this.modo = 'dialogo';
    this.entrada.olvidar();
    this.ctx.eventos.emit('dialogo:abrir', { guionId });
  }

  /** Lo llama «combate» al empezar (ya en negro) y al terminar. */
  empezarCombate(): void {
    this.modo = 'combate';
    this.entrada.olvidar();
  }

  terminarCombate(): void {
    this.modo = 'explorar';
    this.espera = ESPERA_TRAS_DIALOGO;
    this.entrada.olvidar();
  }

  /** Empieza el fundido para entrar en un interior (o salir, con null). */
  private cruzar(destino: string | null): void {
    this.cruce = { paso: 0, destino };
    this.modo = 'fundido';
  }

  private aplicar(e: Efecto): void {
    if (e.condicion) cumplir(this.estado, e.condicion);
    if (e.inicial) {
      this.estado.inicial = e.inicial;
      this.formarEquipo();
      this.ctx.eventos.emit('inicial:elegida', { tipo: e.inicial });
    }
  }

  /** Con la inicial elegida y el equipo vacío: la inicial al nivel 5 y la mochila de salida. */
  private formarEquipo(): void {
    const tipo = this.estado.inicial;
    if (!tipo || this.equipo.length || !ESPECIE_INICIAL[tipo]) return;
    this.equipo = [crearCriatura(DATOS, ESPECIE_INICIAL[tipo], NIVEL_INICIAL, this.ctx.rng)];
    this.mochila = { ...MOCHILA_INICIAL };
  }

  curarEquipo(): void {
    this.equipo = this.equipo.map((c) => curarDelTodo(c, DATOS));
  }

  /** Tras perder un combate (en negro): el equipo, curado, y el jugador, en el último refugio. */
  volverAlRefugio(): void {
    this.curarEquipo();
    this.poner({ zona: this.ultimoRefugio });
  }

  /** Carga un estado parcial: condiciones, inicial y posición (en coordenadas de la zona o de la sala). */
  poner(e: unknown): void {
    const p = e as EstadoParcial;
    for (const c of p.condiciones ?? []) cumplir(this.estado, c);
    if (p.inicial !== undefined) {
      this.estado.inicial = p.inicial;
      this.formarEquipo();
    }
    if (p.vida !== undefined) for (const c of this.equipo) c.vida = Math.min(c.vida, p.vida);
    if (p.zona === undefined) return;
    this.modo = 'explorar';
    this.dialogo = null;
    const sala = this.interiores.get(p.zona);
    if (sala) {
      // Entra por la primera puerta que lleva a esa sala.
      if (this.estado.dentro) salir(this.estado);
      const puerta = [...this.puertas].find(([, id]) => id === p.zona)?.[0];
      if (puerta !== undefined) {
        [this.estado.x, this.estado.y] = deClave(puerta);
        this.estado.zona = this.mundo.casillas.get(puerta)!.zona;
      }
      entrar(this.estado, p.zona, sala);
    } else if (this.estado.dentro) {
      salir(this.estado);
    }
    if (p.x !== undefined && p.y !== undefined) {
      const m = this.activo();
      const z = m.zonas.get(p.zona);
      if (!z) throw new Error(`No existe la zona «${p.zona}»`);
      this.estado.x = this.estado.desdeX = z.origen.x + p.x;
      this.estado.y = this.estado.desdeY = z.origen.y + p.y;
      this.estado.paso = 0;
      this.estado.zona = m.casillas.get(clave(this.estado.x, this.estado.y))?.zona ?? p.zona;
    }
    this.ctx.eventos.emit('zona:entrar', { zonaId: this.estado.zona });
  }

  /** Resumen para window.__JUEGO__.estado(). */
  visible(): {
    modo: Modo;
    zona: string;
    dentro: string | null;
    posicion: { x: number; y: number };
    condiciones: Condicion[];
    inicial: string | null;
    dialogo: string | null;
    equipo: { especie: string; nivel: number; vida: number; exp: number }[];
    mochila: Record<string, number>;
  } {
    const z = this.activo().zonas.get(this.estado.zona)!;
    return {
      modo: this.modo,
      zona: this.estado.zona,
      dentro: this.estado.dentro,
      posicion: { x: this.estado.x - z.origen.x, y: this.estado.y - z.origen.y },
      condiciones: [...this.estado.condiciones],
      inicial: this.estado.inicial,
      dialogo: this.dialogo ? lineaActual(this.dialogo).texto : null,
      equipo: this.equipo.map((c) => ({ especie: c.especie, nivel: c.nivel, vida: c.vida, exp: c.exp })),
      mochila: { ...this.mochila },
    };
  }

  dispose(): void {}
}
