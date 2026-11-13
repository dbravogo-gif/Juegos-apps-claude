// Subsistema «partida»: el estado del juego en el núcleo y sus modos. Lo avanza a paso fijo
// (60 Hz) con la entrada del teclado; el resto solo lo lee y lo dibuja.
// Modos: explorar la isla y sus interiores, leer un diálogo, el fundido al cruzar una puerta y el
// combate (lo lleva «combate»). Aquí viven también el equipo y la mochila: al pisar terreno de
// encuentros se sortea si sale una criatura, y las enfermeras y la madre curan al equipo.
// Guardado automático (F10) en localStorage: al cambiar de zona, al acabar cada combate, cada 5
// segundos explorando y al cerrar u ocultar la pestaña; al abrir el juego se sigue donde se dejó.
//
// Parámetros de prueba: ?abrir=todo abre todos los pasos cerrados; ?nueva empieza sin cargar;
// ?semilla=N fija el azar de una partida nueva (sin ella, cada partida nueva es distinta).

import { avanzar, crearExploracion, cumplir, entrar, interactuar, salir, type EstadoExplorar, type EventoExplorar } from '../../core/explorar';
import { abrirDialogo, elegirDialogo, lineaActual, pasoDialogo, pulsar, type Dialogo, type Efecto, type EstadoDialogo, type Tecla } from '../../core/guion';
import { TODAS_LAS_CONDICIONES, clave, construirInterior, construirMundo, deClave, enIsla, entrenadorQueVe, transitable, type Condicion, type Mundo } from '../../core/mundo';
import { PERSONA_JUGADOR, PERSONAS } from '../../arte/personas';
import { ISLAS, LANZAROTE, type DatosIsla } from '../../data/islas';
import { NOMBRE_OBJETO } from '../../data/textos-isla1';
import { crearCriatura, curarDelTodo } from '../../core/criatura';
import { sortearEncuentro } from '../../core/encuentros';
import { perdidaPorDerrota } from '../../core/economia';
import { crearRng } from '../../core/rng';
import { VERSION_GUARDADO, deserializar, serializar, type Guardado } from '../../core/guardado';
import type { Criatura } from '../../core/modelo';
import { DATOS_COMBATE_PRUEBA as DATOS, ESPECIE_INICIAL, MOCHILA_INICIAL } from '../../data/combate-prueba';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Entrada } from '../entrada/entrada';

export type Modo = 'titulo' | 'explorar' | 'dialogo' | 'fundido' | 'combate' | 'menu' | 'fin' | 'viaje';

/** Pasos fijos de cada mitad del fundido al cruzar una puerta: 0,2 s a negro y 0,2 s de vuelta. */
export const PASOS_FUNDIDO = 12;
/** Tras cerrar un diálogo, unos pasos sin interactuar: la última pulsación no lo vuelve a abrir. */
const ESPERA_TRAS_DIALOGO = 12;
/** Los interiores se colocan lejos de la isla, uno al lado de otro. */
const ORIGEN_INTERIORES = { x: 200, y: 0 };
/** Entre sala y sala: la más ancha (el gimnasio) mide 16 casillas. */
const SEPARACION_INTERIORES = 24;

/** Nivel de la inicial al elegirla. */
const NIVEL_INICIAL = 5;
/** Dónde se guarda la partida en el navegador. */
const CLAVE_GUARDADO = 'six-seven-islands:partida';
/** Cada cuántos pasos fijos se guarda mientras se explora: 5 segundos. */
const PASOS_GUARDADO = 300;
/** Lo que dura la exclamación del entrenador que te ve, antes de que hable: 0,75 s. */
const PASOS_ALERTA = 45;

/** Lo que se puede cargar con poner(): para pruebas y para el guardado (F10). */
export interface EstadoParcial {
  condiciones?: Condicion[];
  inicial?: string;
  /** Solo para pruebas: deja al equipo con esta vida como mucho (para probar la derrota). */
  vida?: number;
  /** Solo para pruebas: el dinero. */
  dinero?: number;
  /** Solo para pruebas: los entrenadores vencidos. */
  vencidos?: string[];
  /** Solo para pruebas: criaturas que se añaden al principio del equipo (especie y nivel). */
  anadir?: { especie: string; nivel: number }[];
  /** Zona de la isla o id de un interior. */
  zona?: string;
  x?: number;
  y?: number;
}

export class Partida implements Subsistema {
  static readonly id = 'partida';
  static readonly deps: readonly string[] = ['entrada'];

  /** La isla en la que se está, con todo lo suyo (data/islas.ts). */
  datos: DatosIsla = LANZAROTE;
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
  ultimoRefugio = LANZAROTE.refugio;
  /** Entrenadores vencidos: no vuelven a retar. */
  vencidos: string[] = [];
  dinero = 0;
  /** El nombre y la persona del jugador, elegidos al empezar. */
  nombre = 'Dani';
  persona: string = PERSONA_JUGADOR;
  /** Se ha dicho que sí al barco: al cerrar el diálogo, sale la pantalla del final. */
  private finPendiente = false;
  /** Se ha dicho que sí al barco: la isla a la que se zarpa (tras el final, si lo hay). */
  private viajePendiente: number | null = null;
  /** Pasos fijos del fundido del viaje. */
  private pasosViaje = 0;
  /** Lo que dice el entrenador recién vencido, al volver del combate (compuertas, pintadera). */
  private trasCombate: { lineas: string[]; medalla?: number } | null = null;
  /** Un entrenador acaba de ver al jugador: cuando pase la exclamación, habla. */
  private alerta: { zona: string; personaje: string; pasos: number } | null = null;
  private pasosSinGuardar = 0;
  /** Esc pulsado mientras se anda (o con una flecha apretada): el menú se abre al acabar el paso. */
  private menuPendiente = false;
  /** La partida se ha borrado para empezar otra: ya no se guarda nada (ni al cerrar la pestaña). */
  private borrada = false;
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
  private quitar: (() => void) | null = null;

  init(ctx: Ctx): void {
    this.ctx = ctx;
    this.entrada = ctx.get<Entrada>('entrada');
    // Primero, en qué isla está la partida guardada: de ella sale todo lo demás.
    const nueva = new URLSearchParams(location.search).has('nueva');
    const guardada = nueva ? null : this.leerGuardado();
    this.datos = ISLAS[guardada?.isla ?? 1] ?? LANZAROTE;
    this.ultimoRefugio = this.datos.refugio;
    this.mundo = construirMundo(this.datos.def);
    this.datos.interiores.forEach((def, i) => {
      this.interiores.set(def.id, construirInterior(def, { x: ORIGEN_INTERIORES.x + i * SEPARACION_INTERIORES, y: ORIGEN_INTERIORES.y }));
    });
    for (const [zona, puertas] of Object.entries(this.datos.puertas)) {
      for (const [xy, id] of Object.entries(puertas)) {
        const [x, y] = xy.split(',').map(Number);
        this.puertas.set(enIsla(this.mundo, zona, x, y), id);
      }
    }
    const abrirTodo = new URLSearchParams(location.search).get('abrir') === 'todo';
    this.estado = crearExploracion(this.mundo, abrirTodo ? [...TODAS_LAS_CONDICIONES] : []);
    // Se empieza dentro de casa, como si se acabara de entrar por su puerta.
    const sala = this.datos.salaInicial;
    const puerta = sala ? [...this.puertas].find(([, id]) => id === sala)?.[0] : undefined;
    if (sala && puerta !== undefined) {
      [this.estado.x, this.estado.y] = deClave(puerta);
      this.estado.zona = this.mundo.casillas.get(puerta)!.zona;
      entrar(this.estado, sala, this.interiores.get(sala)!);
    }
    // Se sigue donde se dejó, salvo con ?nueva. Sin partida guardada, se empieza en la portada
    // (elegir persona y nombre). En Safari, se pide que no se borre lo guardado.
    if (guardada) this.aplicarGuardado(guardada);
    else this.modo = 'titulo';
    void navigator.storage?.persist?.().catch(() => undefined);
    // Al cerrar u ocultar la pestaña se guarda, para no perder los últimos pasos. En combate no:
    // el combate no se guarda a medias y vale lo guardado al empezarlo.
    const alSalir = () => {
      if (this.modo !== 'combate') this.guardar();
    };
    const alOcultar = () => {
      if (document.visibilityState === 'hidden') alSalir();
    };
    window.addEventListener('pagehide', alSalir);
    document.addEventListener('visibilitychange', alOcultar);
    this.quitar = () => {
      window.removeEventListener('pagehide', alSalir);
      document.removeEventListener('visibilitychange', alOcultar);
    };
  }

  /** El estado que se guarda: posición, equipo, mochila, refugio, vencidos y generador. */
  guardado(): Guardado {
    return {
      version: VERSION_GUARDADO,
      isla: this.datos.numero,
      explorar: structuredClone(this.estado),
      equipo: structuredClone(this.equipo),
      mochila: { ...this.mochila },
      ultimoRefugio: this.ultimoRefugio,
      vencidos: [...this.vencidos],
      rng: structuredClone(this.ctx.rng),
      dinero: this.dinero,
      nombre: this.nombre,
      persona: this.persona,
    };
  }

  /** Tras la pantalla del final: se sigue explorando Lanzarote. */
  seguirTrasFin(): void {
    if (this.viajePendiente !== null) return this.viajar(this.viajePendiente);
    this.modo = 'explorar';
    this.espera = ESPERA_TRAS_DIALOGO;
    this.entrada.olvidar();
    this.guardar();
  }

  /** Desde la portada: el nombre y la persona elegidos, y a jugar. */
  empezarPartida(nombre: string, persona: string): void {
    // Cada partida nueva con su propio azar (encuentros, valores de las criaturas), salvo con
    // ?semilla, que la deja fija para las pruebas.
    if (!new URLSearchParams(location.search).has('semilla')) this.ctx.rng.s = crearRng(`partida-${Date.now()}-${performance.now()}`).s;
    this.nombre = nombre.trim().slice(0, 16) || 'Dani';
    this.persona = persona in PERSONAS ? persona : PERSONA_JUGADOR;
    this.modo = 'explorar';
    this.entrada.olvidar();
    this.ctx.eventos.emit('jugador:elegido', { nombre: this.nombre, persona: this.persona });
    this.ctx.eventos.emit('zona:entrar', { zonaId: this.estado.zona });
    this.guardar();
  }

  guardar(): void {
    if (this.modo === 'titulo' || this.borrada) return;
    this.pasosSinGuardar = 0;
    try {
      localStorage.setItem(CLAVE_GUARDADO, serializar(this.guardado()));
      this.ctx.eventos.emit('guardado:hecho', {});
    } catch {
      // Sin almacenamiento (ventana privada, cuota llena): se sigue jugando sin guardar.
    }
  }

  /** La isla a la que se va a zarpar, o null: lo usa la pantalla del final. */
  get destinoViaje(): DatosIsla | null {
    return this.viajePendiente !== null ? (ISLAS[this.viajePendiente] ?? null) : null;
  }

  /** Zarpa en barco: fundido a negro, se guarda la partida en la isla de destino y se recarga. */
  viajar(n: number): void {
    if (!ISLAS[n]) throw new Error(`No existe la isla ${n}`);
    this.viajePendiente = n;
    this.modo = 'viaje';
    this.pasosViaje = 0;
    this.entrada.olvidar();
    this.ctx.eventos.emit('sonido:tocar', { nombre: 'salida' });
  }

  private pasoViaje(): void {
    this.pasosViaje++;
    this.fundido = Math.min(1, this.pasosViaje / (PASOS_FUNDIDO * 3));
    if (this.pasosViaje !== PASOS_FUNDIDO * 3) return;
    const n = this.viajePendiente!;
    const destino = ISLAS[n];
    try {
      localStorage.setItem(CLAVE_GUARDADO, serializar(this.guardadoEnIsla(n)));
    } catch {
      // Sin almacenamiento no se puede viajar recargando: se queda donde está.
      this.modo = 'explorar';
      this.fundido = 0;
      return;
    }
    // Ya no se guarda nada de esta isla (ni al cerrar la pestaña, que lo pisaría).
    this.borrada = true;
    this.ctx.eventos.emit('jugador:viaja', { isla: destino.numero });
    location.replace(location.pathname);
  }

  /** La partida tal cual, pero en la isla `n`, junto a su muelle. */
  guardadoEnIsla(n: number): Guardado {
    const destino = ISLAS[n];
    const m = construirMundo(destino.def);
    const z = m.zonas.get(destino.llegada.zona)!;
    const e = crearExploracion(m, this.estado.condiciones);
    e.recogidos = [...this.estado.recogidos];
    e.inicial = this.estado.inicial;
    e.x = e.desdeX = z.origen.x + destino.llegada.x;
    e.y = e.desdeY = z.origen.y + destino.llegada.y;
    e.zona = destino.llegada.zona;
    e.mira = 's';
    return { ...this.guardado(), isla: n, explorar: e, ultimoRefugio: destino.refugio };
  }

  /** Borra la partida guardada y vuelve a la portada (desde el menú, con confirmación). */
  borrarPartida(): void {
    this.borrada = true;
    try {
      localStorage.removeItem(CLAVE_GUARDADO);
    } catch {
      // Sin almacenamiento no había nada guardado.
    }
    // Se recarga sin parámetros de prueba: la portada sale porque ya no hay partida guardada.
    location.replace(location.pathname);
  }

  /** La partida guardada en el navegador, si la hay. */
  private leerGuardado(): Guardado | null {
    try {
      return deserializar(localStorage.getItem(CLAVE_GUARDADO));
    } catch {
      return null;
    }
  }

  /**
   * Carga un guardado. Si el mapa ha cambiado desde entonces y su casilla ya no se pisa (o su
   * interior ya no existe), se queda en casa, pero con su equipo, su mochila y sus avances.
   */
  aplicarGuardado(g: Guardado): void {
    const e = g.explorar;
    const mapa = e.dentro ? this.interiores.get(e.dentro) : this.mundo;
    const valido = !!mapa && transitable(mapa, e.x, e.y, { condiciones: new Set(e.condiciones) }) && (!e.fuera || this.mundo.casillas.has(clave(e.fuera.x, e.fuera.y)));
    if (valido) this.estado = e;
    else {
      this.estado.condiciones = [...e.condiciones];
      this.estado.recogidos = [...e.recogidos];
      this.estado.inicial = e.inicial;
    }
    this.equipo = g.equipo;
    this.mochila = g.mochila;
    this.ultimoRefugio = this.interiores.has(g.ultimoRefugio) ? g.ultimoRefugio : this.datos.refugio;
    this.vencidos = g.vencidos;
    this.dinero = g.dinero ?? 0;
    this.nombre = g.nombre ?? 'Dani';
    this.persona = g.persona && g.persona in PERSONAS ? g.persona : PERSONA_JUGADOR;
    this.ctx.rng.s = [...g.rng.s] as typeof this.ctx.rng.s;
  }

  /** El objetivo que se enseña en pantalla, o null si no queda ninguno. */
  objetivo(): string | null {
    return this.datos.objetivos.find((o) => !this.estado.condiciones.includes(o.hasta))?.texto ?? null;
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
    if (this.modo !== 'explorar') this.menuPendiente = false;
    // En combate manda el subsistema «combate»; en el menú, «menu», y en la portada y el final, «inicio».
    if (this.modo === 'combate' || this.modo === 'menu' || this.modo === 'titulo' || this.modo === 'fin') return;
    if (this.modo === 'viaje') return this.pasoViaje();
    if (this.modo === 'fundido') return this.pasoFundido();
    if (this.modo === 'dialogo') return this.pasoDialogo();
    if (this.espera > 0) {
      this.espera--;
      this.entrada.consumir('confirmar');
    }
    if (++this.pasosSinGuardar >= PASOS_GUARDADO) this.guardar();
    if (this.alerta) {
      // Quieto mientras sale la exclamación; luego, el entrenador habla y reta.
      this.entrada.olvidar();
      if (--this.alerta.pasos > 0) return;
      const a = this.alerta;
      this.alerta = null;
      return this.atender({ tipo: 'hablar', zona: a.zona, personaje: a.personaje });
    }
    // Esc: el menú de pausa. Si se está andando, se abre al acabar el paso, antes del siguiente
    // (aunque se mantenga una flecha apretada); así no se pierde la pulsación.
    if (this.entrada.consumir('cancelar')) this.menuPendiente = true;
    if (this.menuPendiente && this.estado.paso === 0) {
      this.menuPendiente = false;
      this.modo = 'menu';
      this.entrada.olvidar();
      this.ctx.eventos.emit('menu:abrir', {});
      return;
    }
    const antes = this.estado.paso;
    const parado = this.estado.paso === 0;
    const eventos = avanzar(this.activo(), this.estado, this.entrada.direccion(parado));
    // Interactuar mientras se anda espera a que termine el paso, en vez de perderse.
    if (this.estado.paso === 0 && this.entrada.consumir('confirmar')) eventos.push(...interactuar(this.activo(), this.estado));
    for (const ev of eventos) {
      this.atender(ev);
      if (this.modo !== 'explorar') break;
    }
    // Al terminar un paso, ¿le ve algún entrenador? También dentro (los aprendices del gimnasio).
    // Sin criaturas en pie, no retan.
    if (this.modo === 'explorar' && antes > 0 && this.estado.paso === 0 && this.equipo.some((c) => c.vida > 0)) {
      const quien = entrenadorQueVe(this.activo(), this.estado.x, this.estado.y, this.vencidos);
      if (quien) {
        this.alerta = { ...quien, pasos: PASOS_ALERTA };
        this.ctx.eventos.emit('entrenador:visto', { id: quien.personaje });
      }
    }
  }

  /** Tras vencer a un entrenador: su premio y, si lo da, su condición (la líder abre el barco). */
  vencerA(id: string): { premio: number } {
    if (!this.vencidos.includes(id)) this.vencidos.push(id);
    // Vencer a alguien abre lo que dependa de él (las compuertas del gimnasio).
    cumplir(this.estado, `vencido:${id}`);
    const def = this.datos.entrenadores[id];
    if (!def) return { premio: 0 };
    this.dinero += def.premio;
    if (def.condicion) cumplir(this.estado, def.condicion);
    if (def.alVencer?.length) this.trasCombate = { lineas: [...def.alVencer], medalla: def.medalla };
    return { premio: def.premio };
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
      if (this.finPendiente) {
        // El final de la isla (F23): lo enseña «inicio»; con Enter se zarpa (o se sigue).
        this.finPendiente = false;
        this.modo = 'fin';
      } else if (this.viajePendiente !== null) {
        this.viajar(this.viajePendiente);
      } else if (this.datos.tenderos.has(this.hablando)) {
        // El tendero, al acabar de hablar, abre la tienda (en el subsistema «menu»).
        this.modo = 'menu';
        this.ctx.eventos.emit('tienda:abrir', {});
      }
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
      this.guardar();
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
        this.guardar();
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
        const d = elegirDialogo(this.datos.guion, ev.personaje, this.estado.condiciones, this.estado.inicial);
        const frase = this.activo().zonas.get(ev.zona)?.personajes.find((p) => p.id === ev.personaje)?.frase;
        const vencido = this.vencidos.includes(ev.personaje) ? this.datos.entrenadores[ev.personaje] : undefined;
        let dialogo: Dialogo = d ?? { lineas: [{ texto: (vencido ? vencido.tras : frase) ?? '…' }] };
        const refugio = this.datos.curanderos[ev.personaje];
        if (refugio && this.equipo.length) {
          this.curarEquipo();
          this.ctx.eventos.emit('sonido:tocar', { nombre: 'curar' });
          this.ultimoRefugio = refugio;
          dialogo = { ...dialogo, lineas: [...dialogo.lineas, { texto: 'Tu equipo está como nuevo.' }] };
        }
        this.abrir(dialogo, ev.personaje);
        break;
      }
      case 'aspas': {
        // Las aspas se giran y se vuelven a girar: así nadie se queda sin salida.
        const cond: Condicion = `aspas:${ev.id}`;
        if (ev.activas) this.estado.condiciones = this.estado.condiciones.filter((c) => c !== cond);
        else cumplir(this.estado, cond);
        this.ctx.eventos.emit('sonido:tocar', { nombre: 'salida' });
        this.abrir({ lineas: [{ texto: 'Giras las aspas del molino. En algún sitio, el viento cambia de dirección.' }] }, 'aspas');
        this.guardar();
        break;
      }
      case 'palanca':
        if (ev.ya) this.abrir({ lineas: [{ texto: 'La palanca ya está bajada. La compuerta sigue abierta.' }] }, 'palanca');
        else {
          cumplir(this.estado, `palanca:${ev.id}`);
          this.ctx.eventos.emit('sonido:tocar', { nombre: 'puerta' });
          this.abrir({ lineas: [{ texto: 'Bajas la palanca. Al fondo, la última compuerta de basalto se hunde en la lava.' }] }, 'palanca');
          this.guardar();
        }
        break;
      case 'hierba': {
        this.ctx.eventos.emit('sonido:tocar', { nombre: 'hierba' });
        // Sin una criatura en pie no se lucha: la hierba se cruza sin más.
        if (!this.equipo.some((c) => c.vida > 0)) break;
        const s = sortearEncuentro(this.datos.encuentros, ev.zona, this.ctx.rng);
        if (s) this.ctx.eventos.emit('encuentro:inicio', { salvajes: [crearCriatura(DATOS, s.especie, s.nivel, this.ctx.rng)], visible: false });
        break;
      }
    }
  }

  private abrir(d: Dialogo, guionId: string): void {
    // {nombre} en un texto se cambia por el nombre del jugador.
    const conNombre = (l: Dialogo['lineas'][number]) => ({ ...l, texto: l.texto.replaceAll('{nombre}', this.nombre) });
    d = { ...d, lineas: d.lineas.map(conNombre), ...(d.pregunta ? { pregunta: conNombre(d.pregunta) } : {}), ...(d.tras ? { tras: d.tras.map(conNombre) } : {}) };
    this.dialogo = abrirDialogo(d);
    this.ctx.eventos.emit('sonido:tocar', { nombre: 'hablar' });
    this.hablando = guionId;
    this.modo = 'dialogo';
    this.entrada.olvidar();
    this.ctx.eventos.emit('dialogo:abrir', { guionId });
  }

  /** Lo llama «menu» al cerrarse. */
  cerrarMenu(): void {
    this.modo = 'explorar';
    this.espera = ESPERA_TRAS_DIALOGO;
    this.entrada.olvidar();
    this.guardar();
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
    this.guardar();
    // Lo que dice el vencido (abrir su compuerta, dar la pintadera), nada más volver.
    const t = this.trasCombate;
    this.trasCombate = null;
    if (t) {
      this.abrir({ lineas: t.lineas.map((texto) => ({ texto })) }, 'tras-combate');
      if (t.medalla !== undefined) {
        this.ctx.eventos.emit('sonido:tocar', { nombre: 'nivel' });
        this.ctx.eventos.emit('medalla:ganada', { isla: t.medalla });
      }
    }
  }

  /** Empieza el fundido para entrar en un interior (o salir, con null). */
  private cruzar(destino: string | null): void {
    this.ctx.eventos.emit('sonido:tocar', { nombre: 'puerta' });
    this.cruce = { paso: 0, destino };
    this.modo = 'fundido';
  }

  private aplicar(e: Efecto): void {
    if (e.condicion) cumplir(this.estado, e.condicion);
    if (e.fin) this.finPendiente = true;
    if (e.viaje !== undefined && ISLAS[e.viaje]) this.viajePendiente = e.viaje;
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

  /** Tras perder un combate (en negro): se cae el 10 % del dinero, y el equipo, curado, y el jugador, al último refugio. */
  volverAlRefugio(): void {
    this.dinero -= perdidaPorDerrota(this.dinero);
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
    // Delante: así la añadida es la que sale a combatir (para probar combates).
    for (const a of p.anadir ?? []) if (this.equipo.length < 6) this.equipo.unshift(crearCriatura(DATOS, a.especie, a.nivel, this.ctx.rng));
    if (p.vida !== undefined) for (const c of this.equipo) c.vida = Math.min(c.vida, p.vida);
    if (p.dinero !== undefined) this.dinero = p.dinero;
    if (p.vencidos !== undefined) this.vencidos = [...p.vencidos];
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
    // Un salto de sitio cuenta como cambio de zona: se guarda.
    this.guardar();
  }

  /** Resumen para window.__JUEGO__.estado(). */
  visible(): {
    modo: Modo;
    zona: string;
    dentro: string | null;
    posicion: { x: number; y: number };
    /** Por dónde va el paso en curso (0: parado o recién llegado). */
    paso: number;
    condiciones: Condicion[];
    inicial: string | null;
    dialogo: string | null;
    equipo: { especie: string; nivel: number; vida: number; exp: number }[];
    mochila: Record<string, number>;
    dinero: number;
    vencidos: string[];
  } {
    const z = this.activo().zonas.get(this.estado.zona)!;
    return {
      modo: this.modo,
      zona: this.estado.zona,
      dentro: this.estado.dentro,
      posicion: { x: this.estado.x - z.origen.x, y: this.estado.y - z.origen.y },
      paso: this.estado.paso,
      condiciones: [...this.estado.condiciones],
      inicial: this.estado.inicial,
      dialogo: this.dialogo ? lineaActual(this.dialogo).texto : null,
      equipo: this.equipo.map((c) => ({ especie: c.especie, nivel: c.nivel, vida: c.vida, exp: c.exp })),
      mochila: { ...this.mochila },
      dinero: this.dinero,
      vencidos: [...this.vencidos],
    };
  }

  dispose(): void {
    this.quitar?.();
  }
}
