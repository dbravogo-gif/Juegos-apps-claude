// Subsistema «partida»: el estado del juego en el núcleo y sus modos. Lo avanza a paso fijo
// (60 Hz) con la entrada del teclado; el resto solo lo lee y lo dibuja.
// Modos: explorar la isla y sus interiores, leer un diálogo, el fundido al cruzar una puerta y el
// combate (lo lleva «combate»). Aquí viven también el equipo y la mochila: al pisar terreno de
// encuentros se sortea si sale una criatura, y las enfermeras y la madre curan al equipo.
// Guardado automático (F10) en localStorage: al cambiar de zona, al acabar cada combate y cada 5
// segundos explorando; al abrir el juego se sigue donde se dejó.
//
// Parámetros de prueba: ?abrir=todo abre todos los pasos cerrados; ?nueva empieza sin cargar.

import { avanzar, crearExploracion, cumplir, entrar, interactuar, salir, type EstadoExplorar, type EventoExplorar } from '../../core/explorar';
import { abrirDialogo, elegirDialogo, lineaActual, pasoDialogo, pulsar, type Dialogo, type Efecto, type EstadoDialogo, type Tecla } from '../../core/guion';
import { TODAS_LAS_CONDICIONES, clave, construirInterior, construirMundo, deClave, enIsla, entrenadorQueVe, transitable, type Condicion, type Mundo } from '../../core/mundo';
import { ENTRENADORES_ISLA1 } from '../../data/entrenadores-isla1';
import { PERSONA_JUGADOR, PERSONAS } from '../../arte/personas';
import { GUION_ISLA1 } from '../../data/guion-isla1';
import { INTERIORES_ISLA1, SALA_INICIAL } from '../../data/interiores-isla1';
import { ISLA_1, PUERTAS_ISLA1 } from '../../data/isla1';
import { NOMBRE_OBJETO, OBJETIVOS } from '../../data/textos-isla1';
import { crearCriatura, curarDelTodo } from '../../core/criatura';
import { sortearEncuentro } from '../../core/encuentros';
import { VERSION_GUARDADO, deserializar, serializar, type Guardado } from '../../core/guardado';
import type { Criatura } from '../../core/modelo';
import { DATOS_COMBATE_PRUEBA as DATOS, ESPECIE_INICIAL, MOCHILA_INICIAL } from '../../data/combate-prueba';
import { ENCUENTROS_ISLA1 } from '../../data/encuentros-isla1';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Entrada } from '../entrada/entrada';

export type Modo = 'titulo' | 'explorar' | 'dialogo' | 'fundido' | 'combate' | 'menu';

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
/** Quién abre la tienda al terminar de hablarle. */
const TENDEROS: ReadonlySet<string> = new Set(['tendero']);
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
  /** Entrenadores vencidos: no vuelven a retar. */
  vencidos: string[] = [];
  dinero = 0;
  /** El nombre y la persona del jugador, elegidos al empezar. */
  nombre = 'Dani';
  persona: string = PERSONA_JUGADOR;
  /** Un entrenador acaba de ver al jugador: cuando pase la exclamación, habla. */
  private alerta: { zona: string; personaje: string; pasos: number } | null = null;
  private pasosSinGuardar = 0;
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
    // Se sigue donde se dejó, salvo con ?nueva. Sin partida guardada, se empieza en la portada
    // (elegir persona y nombre). En Safari, se pide que no se borre lo guardado.
    const cargada = !new URLSearchParams(location.search).has('nueva') && this.cargar();
    if (!cargada) this.modo = 'titulo';
    void navigator.storage?.persist?.().catch(() => undefined);
  }

  /** El estado que se guarda: posición, equipo, mochila, refugio, vencidos y generador. */
  guardado(): Guardado {
    return {
      version: VERSION_GUARDADO,
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

  /** Desde la portada: el nombre y la persona elegidos, y a jugar. */
  empezarPartida(nombre: string, persona: string): void {
    this.nombre = nombre.trim().slice(0, 16) || 'Dani';
    this.persona = persona in PERSONAS ? persona : PERSONA_JUGADOR;
    this.modo = 'explorar';
    this.entrada.olvidar();
    this.ctx.eventos.emit('jugador:elegido', { nombre: this.nombre, persona: this.persona });
    this.guardar();
  }

  guardar(): void {
    if (this.modo === 'titulo') return;
    this.pasosSinGuardar = 0;
    try {
      localStorage.setItem(CLAVE_GUARDADO, serializar(this.guardado()));
      this.ctx.eventos.emit('guardado:hecho', {});
    } catch {
      // Sin almacenamiento (ventana privada, cuota llena): se sigue jugando sin guardar.
    }
  }

  /** Carga la partida guardada, si la hay. Dice si ha cargado algo. */
  private cargar(): boolean {
    let texto: string | null = null;
    try {
      texto = localStorage.getItem(CLAVE_GUARDADO);
    } catch {
      return false;
    }
    const g = deserializar(texto);
    if (g) this.aplicarGuardado(g);
    return !!g;
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
    this.ultimoRefugio = this.interiores.has(g.ultimoRefugio) ? g.ultimoRefugio : SALA_INICIAL;
    this.vencidos = g.vencidos;
    this.dinero = g.dinero ?? 0;
    this.nombre = g.nombre ?? 'Dani';
    this.persona = g.persona && g.persona in PERSONAS ? g.persona : PERSONA_JUGADOR;
    this.ctx.rng.s = [...g.rng.s] as typeof this.ctx.rng.s;
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
    // En combate manda el subsistema «combate»; en el menú, «menu», y en la portada, «inicio».
    if (this.modo === 'combate' || this.modo === 'menu' || this.modo === 'titulo') return;
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
    const antes = this.estado.paso;
    const parado = this.estado.paso === 0;
    const eventos = avanzar(this.activo(), this.estado, this.entrada.direccion(parado));
    // Interactuar mientras se anda espera a que termine el paso, en vez de perderse.
    if (this.estado.paso === 0 && this.entrada.consumir('confirmar')) eventos.push(...interactuar(this.activo(), this.estado));
    // Esc, parado: el menú de pausa.
    if (this.entrada.consumir('cancelar') && this.estado.paso === 0 && !eventos.length) {
      this.modo = 'menu';
      this.entrada.olvidar();
      this.ctx.eventos.emit('menu:abrir', {});
      return;
    }
    for (const ev of eventos) {
      this.atender(ev);
      if (this.modo !== 'explorar') break;
    }
    // Al terminar un paso, ¿le ve algún entrenador? Sin criaturas en pie, no retan.
    if (this.modo === 'explorar' && antes > 0 && this.estado.paso === 0 && !this.estado.dentro && this.equipo.some((c) => c.vida > 0)) {
      const quien = entrenadorQueVe(this.mundo, this.estado.x, this.estado.y, this.vencidos);
      if (quien) {
        this.alerta = { ...quien, pasos: PASOS_ALERTA };
        this.ctx.eventos.emit('entrenador:visto', { id: quien.personaje });
      }
    }
  }

  /** Tras vencer a un entrenador: su premio y, si lo da, su condición (la líder abre el barco). */
  vencerA(id: string): { premio: number } {
    if (!this.vencidos.includes(id)) this.vencidos.push(id);
    const def = ENTRENADORES_ISLA1[id];
    if (!def) return { premio: 0 };
    this.dinero += def.premio;
    if (def.condicion) cumplir(this.estado, def.condicion);
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
      // El tendero, al acabar de hablar, abre la tienda (en el subsistema «menu»).
      if (TENDEROS.has(this.hablando)) {
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
        const d = elegirDialogo(GUION_ISLA1, ev.personaje, this.estado.condiciones, this.estado.inicial);
        const frase = this.activo().zonas.get(ev.zona)?.personajes.find((p) => p.id === ev.personaje)?.frase;
        const vencido = this.vencidos.includes(ev.personaje) ? ENTRENADORES_ISLA1[ev.personaje] : undefined;
        let dialogo: Dialogo = d ?? { lineas: [{ texto: (vencido ? vencido.tras : frase) ?? '…' }] };
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
    // {nombre} en un texto se cambia por el nombre del jugador.
    const conNombre = (l: Dialogo['lineas'][number]) => ({ ...l, texto: l.texto.replaceAll('{nombre}', this.nombre) });
    d = { ...d, lineas: d.lineas.map(conNombre), ...(d.pregunta ? { pregunta: conNombre(d.pregunta) } : {}), ...(d.tras ? { tras: d.tras.map(conNombre) } : {}) };
    this.dialogo = abrirDialogo(d);
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
    if (p.dinero !== undefined) this.dinero = p.dinero;
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
      condiciones: [...this.estado.condiciones],
      inicial: this.estado.inicial,
      dialogo: this.dialogo ? lineaActual(this.dialogo).texto : null,
      equipo: this.equipo.map((c) => ({ especie: c.especie, nivel: c.nivel, vida: c.vida, exp: c.exp })),
      mochila: { ...this.mochila },
      dinero: this.dinero,
      vencidos: [...this.vencidos],
    };
  }

  dispose(): void {}
}
