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

import { avanzar, cambiarDePiso, crearExploracion, cumplir, entrar, interactuar, salir, type EstadoExplorar, type EventoExplorar } from '../../core/explorar';
import { abrirDialogo, elegirDialogo, lineaActual, objetivoActual, pasoDialogo, pulsar, type Dialogo, type Efecto, type EstadoDialogo, type Tecla } from '../../core/guion';
import { TODAS_LAS_CONDICIONES, clave, construirInterior, construirMundo, deClave, enIsla, entrenadorQueVe, transitable, type Condicion, type Direccion, type Mundo } from '../../core/mundo';
import { PERSONA_JUGADOR, PERSONAS } from '../../arte/personas';
import { ISLAS, LANZAROTE, type DatosIsla } from '../../data/islas';
import { NOMBRE_OBJETO } from '../../data/textos-isla1';
import { quienEs } from '../../data/entrenadores-isla1';
import { puntoRecado } from '../../core/recados';
import { AMIGOS, NOMBRE_TIPO_INICIAL, PRESENTACION } from '../../data/textos-isla1';
import { PUEBLOS, inicialDelRival, inicialesDeAmigos, puebloQueTePersigue, type TipoInicial } from '../../data/pueblos';
import { crearCriatura, curarDelTodo } from '../../core/criatura';
import { expParaNivel } from '../../core/progreso';
import { sortearEncuentro } from '../../core/encuentros';
import { perdidaPorDerrota } from '../../core/economia';
import { crearRng } from '../../core/rng';
import { claveGuardado, esCodigoDesarrollador } from '../../core/desarrollador';
import { VERSION_GUARDADO, cambiarRetiradas, deserializar, refugiosAlViajar, reubicar, serializar, type Guardado, type Origenes } from '../../core/guardado';
import type { Criatura } from '../../core/modelo';
import { DATOS_COMBATE_PRUEBA as DATOS, ESPECIE_INICIAL, ESPECIES_RETIRADAS, MOCHILA_INICIAL } from '../../data/combate-prueba';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Entrada } from '../entrada/entrada';

/** El id del diálogo con el que un amigo se presenta antes de ponerle nombre. */
const PRESENTARSE = 'presentarse';

export type Modo = 'titulo' | 'explorar' | 'dialogo' | 'fundido' | 'combate' | 'menu' | 'viaje' | 'nombrar';

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
/** En la sesión del navegador: si se juega en modo desarrollador (con su partida aparte). */
const CLAVE_SESION_DESARROLLADOR = 'six-seven-islands:desarrollador';

function leerModoDesarrollador(): boolean {
  try {
    return sessionStorage.getItem(CLAVE_SESION_DESARROLLADOR) === '1';
  } catch {
    return false;
  }
}
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
  /** Solo para pruebas: objetos que se añaden a la mochila (id → cuántos). */
  mochila?: Record<string, number>;
  /** Solo para pruebas: los entrenadores vencidos. */
  vencidos?: string[];
  /** Solo para pruebas: criaturas que se añaden al principio del equipo (especie y nivel). */
  /** `casiSube`: a un punto de experiencia del nivel siguiente (para probar la evolución). */
  anadir?: { especie: string; nivel: number; casiSube?: boolean }[];
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
  /** El último refugio de cada isla visitada, para volver a él al regresar en barco. */
  private refugios: Record<string, string> = {};
  /** Los nombres que el jugador ha puesto a sus amigos (HISTORIA.md: se decide al conocerlos). */
  amigos: Record<string, string> = {};
  /** A quién se está poniendo nombre: al acabar, se habla con él. */
  private porNombrar: EventoExplorar | null = null;
  /** Entrenadores vencidos: no vuelven a retar. */
  vencidos: string[] = [];
  dinero = 0;
  /** El nombre y la persona del jugador, elegidos al empezar. */
  nombre = 'Dani';
  persona: string = PERSONA_JUGADOR;
  /** Se ha dicho que sí al barco: la isla a la que se zarpa. */
  private viajePendiente: number | null = null;
  /** Pasos fijos del fundido del viaje. */
  private pasosViaje = 0;
  /** Lo que dice el entrenador recién vencido, al volver del combate (compuertas, pintadera). */
  private trasCombate: { lineas: string[]; quien?: string; medalla?: number; luego?: string } | null = null;
  /** Quien habla al acabar lo que dice el vencido (`luego` de su entrenador). */
  private hablaLuego: string | null = null;
  /** Un entrenador acaba de ver al jugador: cuando pase la exclamación, habla. */
  private alerta: { zona: string; personaje: string; pasos: number } | null = null;
  private pasosSinGuardar = 0;
  /** Z o Esc pulsado mientras se anda (o con una flecha apretada): el menú se abre al acabar el paso. */
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

  /** La sala a la que lleva la puerta de la casilla `k` de la isla, si la hay. */
  salaDePuerta(k: number): string | undefined {
    return this.puertas.get(k);
  }
  /** El fundido de una puerta: a dónde se va y de qué sala se sale (para el mensaje del rival). */
  private cruce: { paso: number; destino: string | null; desde?: string | null; piso?: { id: string; punto: { x: number; y: number }; mira: Direccion } } | null = null;
  private hablando = '';
  private espera = 0;
  private quitar: (() => void) | null = null;

  /** Modo desarrollador (autor, 2026-11-19): con su partida aparte y su menú. */
  readonly desarrollador = leerModoDesarrollador();
  /** Dónde se guarda esta partida: la del modo desarrollador no pisa la normal. */
  private get clave(): string {
    return claveGuardado(this.desarrollador);
  }
  /** Las que han subido de nivel fuera del combate (el almendrado): evolucionan al ganar el siguiente. */
  readonly subidasFuera = new Set<string>();
  /** Si hay una partida guardada que se pueda continuar (para la portada). */
  hayGuardado = false;

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
    this.hayGuardado = guardada !== null;
    // Sin partida, la portada. Con ?portada (al volver al menú), también, encima de la partida
    // cargada: «Continuar» sigue donde estaba.
    if (!guardada || new URLSearchParams(location.search).has('portada')) this.modo = 'titulo';
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
      refugios: { ...this.refugios },
      amigos: { ...this.amigos },
      vencidos: [...this.vencidos],
      rng: structuredClone(this.ctx.rng),
      dinero: this.dinero,
      nombre: this.nombre,
      persona: this.persona,
      origenes: this.origenesDe(this.estado, this.activo()) ?? undefined,
    };
  }

  /** Dónde empiezan la zona actual y la de la puerta (si se está dentro), para el guardado. */
  private origenesDe(e: EstadoExplorar, mapa: Mundo | undefined): Origenes | null {
    const z = mapa?.zonas.get(e.zona);
    if (!z) return null;
    const f = e.fuera ? this.mundo.zonas.get(e.fuera.zona) : undefined;
    if (e.fuera && !f) return null;
    return { actual: { ...z.origen }, ...(f ? { fuera: { ...f.origen } } : {}) };
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
      localStorage.setItem(this.clave, serializar(this.guardado()));
      this.ctx.eventos.emit('guardado:hecho', {});
    } catch {
      // Sin almacenamiento (ventana privada, cuota llena): se sigue jugando sin guardar.
    }
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
      localStorage.setItem(this.clave, serializar(this.guardadoEnIsla(n)));
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
    const llegada = destino.llegadas?.[this.datos.numero] ?? destino.llegada;
    const z = m.zonas.get(llegada.zona)!;
    const e = crearExploracion(m, this.estado.condiciones);
    e.recogidos = [...this.estado.recogidos];
    e.inicial = this.estado.inicial;
    e.x = e.desdeX = z.origen.x + llegada.x;
    e.y = e.desdeY = z.origen.y + llegada.y;
    e.zona = llegada.zona;
    e.mira = 's';
    const { refugios, ultimo } = refugiosAlViajar(this.refugios, this.datos.numero, this.ultimoRefugio, n, destino.refugio);
    return { ...this.guardado(), isla: n, explorar: e, ultimoRefugio: ultimo, refugios, origenes: { actual: { ...z.origen } } };
  }

  /** Vuelve a la portada (Continuar, Partida nueva o Código), guardando antes. Sale del modo desarrollador. */
  volverAlMenu(): void {
    this.guardar();
    try {
      sessionStorage.removeItem(CLAVE_SESION_DESARROLLADOR);
    } catch {
      // Sin almacenamiento de sesión no había modo desarrollador.
    }
    location.replace(`${location.pathname}?portada`);
  }

  /** Desde la portada: sigue con la partida cargada. */
  continuar(): void {
    if (!this.hayGuardado) return;
    // Fuera el ?portada de la dirección: al recargar (un viaje en barco), se sigue jugando.
    history.replaceState(null, '', location.pathname);
    this.modo = 'explorar';
    this.entrada.olvidar();
    this.ctx.eventos.emit('zona:entrar', { zonaId: this.estado.zona });
  }

  /** Desde la portada: una partida nueva en este hueco (borra la guardada de este hueco). */
  partidaNueva(): void {
    this.borrarPartida();
  }

  /** El código del modo desarrollador: si vale, se recarga en su partida aparte. */
  activarDesarrollador(codigo: string): boolean {
    if (!esCodigoDesarrollador(codigo)) return false;
    try {
      sessionStorage.setItem(CLAVE_SESION_DESARROLLADOR, '1');
    } catch {
      return false;
    }
    location.replace(location.pathname);
    return true;
  }

  // ——— Modo desarrollador ———

  /** Las zonas de la isla, para viajar entre ellas: id y nombre. */
  zonasDeLaIsla(): { id: string; nombre: string }[] {
    return [...this.mundo.zonas.entries()].map(([id, z]) => ({ id, nombre: z.nombre ?? id }));
  }

  /** Lleva al jugador a una zona: a la casilla que se pueda pisar más cerca de su centro. */
  teletransportar(zonaId: string): void {
    const m = this.mundo;
    const z = m.zonas.get(zonaId);
    if (!z) return;
    const opciones = { condiciones: new Set(this.estado.condiciones) };
    const casillas = [...m.casillas.entries()].filter(([, c]) => c.zona === zonaId).map(([k]) => deClave(k));
    if (!casillas.length) return;
    const cx = casillas.reduce((a, [x]) => a + x, 0) / casillas.length;
    const cy = casillas.reduce((a, [, y]) => a + y, 0) / casillas.length;
    const libres = casillas.filter(([x, y]) => transitable(m, x, y, opciones));
    if (!libres.length) return;
    libres.sort(([ax, ay], [bx, by]) => Math.hypot(ax - cx, ay - cy) - Math.hypot(bx - cx, by - cy));
    const [x, y] = libres[0]!;
    this.poner({ zona: zonaId, x: x - z.origen.x, y: y - z.origen.y });
  }

  /** Pone una criatura en el equipo, si cabe. */
  anadirCriatura(especie: string, nivel: number): boolean {
    if (this.equipo.length >= 6 || !DATOS.especies[especie]) return false;
    this.equipo.push(crearCriatura(DATOS, especie, nivel, this.ctx.rng));
    this.guardar();
    return true;
  }

  /**
   * «Probar evolución» (modo desarrollador): pone delante una criatura a punto de evolucionar y
   * empieza un combate fácil; al ganarlo, evoluciona con el escenario del tipo `tipo`.
   */
  probarEvolucion(tipo: string): void {
    const c = crearCriatura(DATOS, 'inicial-agua', 15, this.ctx.rng);
    c.exp = expParaNivel(16) - 1;
    this.equipo.unshift(c);
    if (this.equipo.length > 6) this.equipo.pop();
    this.guardar();
    this.ctx.eventos.emit('encuentro:inicio', { salvajes: [crearCriatura(DATOS, 'c031-1', 2, this.ctx.rng)], visible: false, tipoEvolucion: tipo });
  }

  /** Quita la última del equipo (si queda alguna más). */
  quitarUltima(): void {
    if (this.equipo.length > 1) this.equipo.pop();
    this.guardar();
  }

  /** Borra la partida guardada y vuelve a la portada (desde el menú, con confirmación). */
  borrarPartida(): void {
    this.borrada = true;
    try {
      localStorage.removeItem(this.clave);
    } catch {
      // Sin almacenamiento no había nada guardado.
    }
    // Se recarga sin parámetros de prueba: la portada sale porque ya no hay partida guardada.
    location.replace(location.pathname);
  }

  /** La partida guardada en el navegador, si la hay. */
  private leerGuardado(): Guardado | null {
    try {
      return deserializar(localStorage.getItem(this.clave));
    } catch {
      return null;
    }
  }

  /**
   * Carga un guardado. Si el mapa ha cambiado desde entonces y su casilla ya no se pisa (o su
   * interior ya no existe), se queda en casa, pero con su equipo, su mochila y sus avances.
   */
  aplicarGuardado(g: Guardado): void {
    const mapa = g.explorar.dentro ? this.interiores.get(g.explorar.dentro) : this.mundo;
    // Si sus zonas se han movido desde que se guardó, la posición se mueve con ellas.
    const ahora = this.origenesDe(g.explorar, mapa);
    const e = g.origenes && ahora ? reubicar(g.explorar, g.origenes, ahora) : g.explorar;
    const valido =
      !!mapa &&
      transitable(mapa, e.x, e.y, { condiciones: new Set(e.condiciones) }) &&
      mapa.casillas.get(clave(e.x, e.y))?.zona === e.zona &&
      (!e.fuera || this.mundo.casillas.get(clave(e.fuera.x, e.fuera.y))?.zona === e.fuera.zona);
    if (valido) this.estado = e;
    else {
      this.estado.condiciones = [...e.condiciones];
      this.estado.recogidos = [...e.recogidos];
      this.estado.inicial = e.inicial;
    }
    this.equipo = cambiarRetiradas(g.equipo, ESPECIES_RETIRADAS, DATOS);
    this.mochila = g.mochila;
    this.ultimoRefugio = this.interiores.has(g.ultimoRefugio) ? g.ultimoRefugio : this.datos.refugio;
    this.refugios = { ...g.refugios };
    this.amigos = { ...g.amigos };
    this.vencidos = g.vencidos;
    this.dinero = g.dinero ?? 0;
    this.nombre = g.nombre ?? 'Dani';
    this.persona = g.persona && g.persona in PERSONAS ? g.persona : PERSONA_JUGADOR;
    this.ctx.rng.s = [...g.rng.s] as typeof this.ctx.rng.s;
  }

  /** El objetivo que se enseña en pantalla, o null si no queda ninguno. */
  objetivo(): string | null {
    return objetivoActual(this.datos.objetivos, this.estado.condiciones);
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
    // Mientras se escribe el nombre de un amigo, manda la «interfaz».
    if (this.modo === 'combate' || this.modo === 'menu' || this.modo === 'titulo' || this.modo === 'nombrar') return;
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
    // Z o Esc: el menú de pausa. Si se está andando, se abre al acabar el paso, antes del siguiente
    // (aunque se mantenga una flecha apretada); así no se pierde la pulsación. X (volver) no hace
    // nada al explorar: se descarta para que no cierre el menú nada más abrirlo.
    if (this.entrada.consumir('menu')) this.menuPendiente = true;
    this.entrada.consumir('cancelar');
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
      const quien = entrenadorQueVe(this.activo(), this.estado.x, this.estado.y, this.vencidos, this.estado.condiciones);
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
    // Nada más volver, el vencido habla: el líder da su pintadera y los demás, su consejo (antes
    // solo salía si se le volvía a hablar; probador, 2026-11-13).
    const quien = quienEs(id);
    this.trasCombate = def.alVencer?.length ? { lineas: [...def.alVencer], quien, medalla: def.medalla, luego: def.luego } : { lineas: [def.tras], quien, luego: def.luego };
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
      const luego = this.hablaLuego;
      this.hablaLuego = null;
      if (this.hablando === PRESENTARSE && this.porNombrar) {
        this.pedirNombre();
      } else if (this.hablando === 'tras-combate' && luego) {
        this.atender({ tipo: 'hablar', zona: this.estado.zona, personaje: luego });
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
      c.desde = this.estado.dentro;
      if (c.piso) cambiarDePiso(this.estado, c.piso.id, this.interiores.get(c.piso.id)!, c.piso.punto, c.piso.mira);
      else if (c.destino) entrar(this.estado, c.destino, this.interiores.get(c.destino)!);
      else salir(this.estado);
      this.ctx.eventos.emit('zona:entrar', { zonaId: this.estado.zona });
      this.guardar();
    }
    if (c.paso >= 2 * PASOS_FUNDIDO) {
      this.cruce = null;
      this.fundido = 0;
      this.modo = 'explorar';
      this.entrada.olvidar();
      // Al salir del museo con tu compañera, tu amigo te escribe al móvil (HISTORIA.md).
      const msg = this.datos.guion['mensaje-rival'];
      if (c.desde === 'museo' && !c.destino && msg && this.estado.condiciones.includes('inicial-elegida') && !this.estado.condiciones.includes('mensaje-rival')) {
        cumplir(this.estado, 'mensaje-rival');
        this.ctx.eventos.emit('sonido:tocar', { nombre: 'seleccion' });
        const d = elegirDialogo(this.datos.guion, 'mensaje-rival', this.estado.condiciones, this.estado.inicial);
        if (d) this.abrir(d, 'mensaje-rival');
        this.guardar();
      }
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
      case 'choque':
        this.ctx.eventos.emit('sonido:tocar', { nombre: 'choque' });
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
      case 'escalera':
        this.usarEscalera(ev.sube);
        break;
      case 'hablar': {
        // Quien tiene escena (te para al verte) solo te para una vez: luego se le habla sin más.
        const quienHabla = this.activo().zonas.get(ev.zona)?.personajes.find((p) => p.id === ev.personaje);
        if (quienHabla?.escena && !this.vencidos.includes(ev.personaje)) this.vencidos.push(ev.personaje);
        // A un amigo se le pone nombre la primera vez que se le habla (autor, 2026-11-15).
        const amigo = AMIGOS.get(ev.personaje);
        if (amigo && !this.amigos[amigo]) {
          this.porNombrar = ev;
          // Primero dice algo (aún sin nombre) y, al acabar, se le pone.
          const presentacion = PRESENTACION.get(ev.personaje);
          if (presentacion) this.abrir({ lineas: presentacion.map((texto) => ({ quien: '¿?', texto })) }, PRESENTARSE);
          else this.pedirNombre();
          break;
        }
        // Un recado (HISTORIA.md): pide, da el premio al cumplirlo y luego da las gracias.
        const recado = this.datos.recados?.[ev.personaje];
        const punto = recado ? puntoRecado(recado, this.estado.condiciones, this.equipo.map((c) => c.especie), this.vencidos) : 'cerrado';
        if (recado && punto !== 'cerrado') {
          const lineas: Dialogo['lineas'][number][] = (punto === 'hecho' ? recado.hecho : punto === 'cumplible' ? recado.cumplido : recado.pedir).map((texto) => ({ quien: recado.quien, texto }));
          if (punto === 'cumplible') {
            const { objeto, cantidad } = recado.da;
            this.mochila[objeto] = (this.mochila[objeto] ?? 0) + cantidad;
            cumplir(this.estado, `recado:${recado.id}`);
            lineas.push({ texto: `Recibes ${cantidad > 1 ? `${cantidad} × ` : ''}${DATOS.objetos[objeto]?.nombre ?? objeto}.` });
            this.ctx.eventos.emit('sonido:tocar', { nombre: 'nivel' });
            this.guardar();
          }
          this.abrir({ lineas }, ev.personaje);
          break;
        }
        const d = elegirDialogo(this.datos.guion, ev.personaje, this.estado.condiciones, this.estado.inicial);
        const frase = this.activo().zonas.get(ev.zona)?.personajes.find((p) => p.id === ev.personaje)?.frase;
        const vencido = this.vencidos.includes(ev.personaje) ? this.datos.entrenadores[ev.personaje] : undefined;
        const quien = this.datos.entrenadores[ev.personaje] ? quienEs(ev.personaje) : undefined;
        let dialogo: Dialogo = d ?? { lineas: [{ quien, texto: (vencido ? vencido.tras : frase) ?? '…' }] };
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
      case 'letrero':
        // Cada línea del texto, una caja del diálogo.
        this.abrir({ lineas: ev.texto.split('\n').map((texto) => ({ texto })) }, 'letrero');
        break;
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
        // Cada terreno suena a lo suyo: hierba alta, malpaís o arena de duna (autor, 2026-11-19).
        this.ctx.eventos.emit('sonido:tocar', { nombre: ev.terreno === ';' ? 'malpais' : ev.terreno === 'D' ? 'arena' : 'hierba' });
        // Sin una criatura en pie no se lucha: la hierba se cruza sin más.
        if (!this.equipo.some((c) => c.vida > 0)) break;
        const s = sortearEncuentro(this.datos.encuentros, ev.zona, this.ctx.rng);
        if (s) this.ctx.eventos.emit('encuentro:inicio', { salvajes: [crearCriatura(DATOS, s.especie, s.nivel, this.ctx.rng)], visible: false });
        break;
      }
    }
  }

  private abrir(d: Dialogo, guionId: string): void {
    // {nombre} en un texto se cambia por el nombre del jugador; {amigo}, por el del rival; y
    // {inicial} y {inicialRival}, por el tipo de la inicial de cada uno (HISTORIA.md).
    const tuya = this.estado.inicial as TipoInicial | null;
    const cambiar = (t: string) =>
      t
        .replaceAll('{nombre}', this.nombre)
        .replaceAll('{amigo}', this.amigos.amigo ?? 'tu amigo')
        .replaceAll('{inicial}', tuya ? NOMBRE_TIPO_INICIAL[tuya] : '')
        .replaceAll('{inicialRival}', tuya ? NOMBRE_TIPO_INICIAL[inicialDelRival(tuya)] : '')
        .replaceAll('{amigo2}', this.amigos.amigo2 ?? 'tu amigo')
        .replaceAll('{inicialAmigo2}', tuya ? NOMBRE_TIPO_INICIAL[inicialesDeAmigos(tuya)[0]!] : '')
        .replaceAll('{comandante}', tuya ? PUEBLOS[puebloQueTePersigue(tuya)].comandante : 'el comandante')
        .replaceAll('{rama}', tuya ? PUEBLOS[puebloQueTePersigue(tuya)].rama : 'la rama')
        .replaceAll('{pueblo}', tuya ? PUEBLOS[tuya].nombre : 'tu pueblo');
    const conNombre = (l: Dialogo['lineas'][number]) => ({ ...l, texto: cambiar(l.texto), ...(l.quien ? { quien: cambiar(l.quien) } : {}) });
    d = { ...d, lineas: d.lineas.map(conNombre), ...(d.pregunta ? { pregunta: conNombre(d.pregunta) } : {}), ...(d.tras ? { tras: d.tras.map(conNombre) } : {}) };
    this.dialogo = abrirDialogo(d);
    this.ctx.eventos.emit('sonido:tocar', { nombre: 'hablar' });
    this.hablando = guionId;
    this.modo = 'dialogo';
    this.entrada.olvidar();
    this.ctx.eventos.emit('dialogo:abrir', { guionId });
  }

  private pedirNombre(): void {
    this.modo = 'nombrar';
    this.entrada.olvidar();
    this.ctx.eventos.emit('amigo:nombrar', { id: this.porNombrar?.tipo === 'hablar' ? this.porNombrar.personaje : '' });
  }

  /** Has perdido contra quien pregunta antes de luchar: la próxima vez vuelve a preguntar. */
  olvidarListo(id: string): void {
    const i = this.estado.condiciones.indexOf(`listo:${id}`);
    if (i >= 0) this.estado.condiciones.splice(i, 1);
  }

  /** Lo llama «interfaz» al escribir el nombre de un amigo (o null si se cancela). */
  nombrarAmigo(nombre: string | null): void {
    const ev = this.porNombrar;
    this.porNombrar = null;
    this.modo = 'explorar';
    this.espera = ESPERA_TRAS_DIALOGO;
    this.entrada.olvidar();
    if (!ev || ev.tipo !== 'hablar' || nombre === null) return;
    this.amigos[AMIGOS.get(ev.personaje) ?? ev.personaje] = nombre.trim().slice(0, 16) || 'Amigo';
    this.guardar();
    this.atender(ev);
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
      this.hablaLuego = t.luego ?? null;
      // Entre paréntesis, la acotación del narrador: sin nombre encima (salía como si la dijera el
      // soldado; probador, 2026-11-24).
      this.abrir({ lineas: t.lineas.map((texto) => (/^\(.*\)$/.test(texto) ? { texto: texto.slice(1, -1) } : { quien: t.quien, texto })) }, 'tras-combate');
      if (t.medalla !== undefined) {
        this.ctx.eventos.emit('sonido:tocar', { nombre: 'nivel' });
        this.ctx.eventos.emit('medalla:ganada', { isla: t.medalla });
      }
    }
  }

  /**
   * Sube al piso de arriba (`<sala>-arriba`) o baja de él, con el mismo fundido que una puerta
   * (autor, 2026-11-19). Arriba se aparece en su entrada, mirando al norte; abajo, delante de la
   * escalera, mirando al sur: así, si se sigue pulsando la flecha, no se vuelve a cambiar de piso.
   */
  private usarEscalera(sube: boolean): void {
    const aqui = this.estado.dentro;
    if (!aqui) return;
    const id = sube ? `${aqui}-arriba` : aqui.replace(/-arriba$/, '');
    const sala = this.interiores.get(id);
    if (!sala || id === aqui) {
      this.abrir({ lineas: [{ texto: 'Esa escalera es solo para quien vive o trabaja aquí.' }] }, 'escalera');
      return;
    }
    const z = sala.zonas.get(sala.isla.inicio.zona)!;
    let punto = { x: sala.isla.inicio.x, y: sala.isla.inicio.y };
    if (!sube) {
      const k = [...sala.casillas].find(([, c]) => c.c === 'e')?.[0];
      if (k !== undefined) {
        const [x, y] = deClave(k);
        punto = { x: x - z.origen.x, y: y + 1 - z.origen.y };
      }
    }
    this.ctx.eventos.emit('sonido:tocar', { nombre: 'puerta' });
    this.cruce = { paso: 0, destino: id, piso: { id, punto, mira: sube ? 'n' : 's' } };
    this.modo = 'fundido';
  }

  /** Empieza el fundido para entrar en un interior (o salir, con null). */
  private cruzar(destino: string | null): void {
    this.ctx.eventos.emit('sonido:tocar', { nombre: 'puerta' });
    this.cruce = { paso: 0, destino };
    this.modo = 'fundido';
  }

  private aplicar(e: Efecto): void {
    if (e.condicion) cumplir(this.estado, e.condicion);
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
      // Una inicial que no existe («fuego» en vez de «infernal») colgaba el juego al teñir uniformes.
      if (!(p.inicial in PUEBLOS)) throw new Error(`Inicial desconocida: «${p.inicial}». Valen: ${Object.keys(PUEBLOS).join(', ')}`);
      this.estado.inicial = p.inicial;
      this.formarEquipo();
    }
    // Delante: así la añadida es la que sale a combatir (para probar combates).
    for (const a of p.anadir ?? []) {
      if (this.equipo.length >= 6) break;
      const c = crearCriatura(DATOS, a.especie, a.nivel, this.ctx.rng);
      if (a.casiSube) c.exp = expParaNivel(a.nivel + 1) - 1;
      this.equipo.unshift(c);
    }
    if (p.vida !== undefined) for (const c of this.equipo) c.vida = Math.min(c.vida, p.vida);
    if (p.dinero !== undefined) this.dinero = p.dinero;
    for (const [id, n] of Object.entries(p.mochila ?? {})) this.mochila[id] = (this.mochila[id] ?? 0) + n;
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
