// Subsistema «combate»: el combate por turnos, visto como en los juegos del género: en diagonal,
// tu criatura delante a la izquierda, de espaldas, y la rival al fondo a la derecha, mirándote
// (autor, 2026-11-10). Es una arena aparte, lejos de la isla, con un fondo pintado detrás, dos
// plataformas y las criaturas de Meshy. Las reglas son las del núcleo (src/core/combate.ts); los
// datos son provisionales (src/data/combate-prueba.ts). Lo lanzan los encuentros en la hierba y el
// primer entrenador. Lucha el equipo de «partida», y al acabar se le devuelve con su vida y su
// experiencia. Con teclado: flechas para elegir, E, Enter o Espacio para confirmar y Esc para volver.

import {
  AdditiveBlending,
  Box3,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  DoubleSide,
  CylinderGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicNodeMaterial,
  LineSegments,
  Mesh,
  MeshBasicNodeMaterial,
  SRGBColorSpace,
  SphereGeometry,
  TextureLoader,
  Vector3,
  RingGeometry,
  type Fog,
  type Object3D,
  type Material,
  type Texture,
} from 'three/webgpu';
import { describirMovimiento } from '../../core/describir';
import { delAliado, iniciarCombate, objetivoDe, reemplazar, resolverTurno, type Accion, type EstadoCombate, type Evento, type FichaCombate, type Ref, type Resultado } from '../../core/combate';
import { nombreDe, objetoUtil } from '../../core/criatura';
import type { Criatura } from '../../core/modelo';
import { CALIDAD_ZONA, MEDIA_BLANCA, MEDIA_VERDE, zonaBarra } from '../../core/captura';
import { crearRng } from '../../core/rng';
import { evolucionar, evolucionesPosibles, evolucionesTrasCombate, type SubidaNivel } from '../../core/progreso';
import { perdidaPorDerrota } from '../../core/economia';
import { BOLSILLOS, bolsilloDe, type IdBolsillo } from '../../data/bolsillos';
import { vidaMaxima } from '../../core/estadisticas';
import { gruposContra } from '../../core/tipos';
import type { TipoInicial } from '../../data/pueblos';
import { MaterialDiorama } from '../../arte/material';
import { figuraCriatura } from '../../arte/criaturas3d';
import { crearEscenarioEvolucion } from './escenario-evolucion';
import { escalaPorAltura } from '../../arte/escala-criaturas';
import { RADIO_CUBO, figuraCubo, girarCubo } from '../../arte/cubos';
import { attribute, dot, mix, normalView, positionViewDirection, pow, vec3 } from 'three/tsl';
import { DATOS_COMBATE_PRUEBA, ESPECIE_INICIAL, MODELO_DE } from '../../data/combate-prueba';
import { equipoDeEntrenador } from '../../data/equipos';
import { TIPOS } from '../../data/tipos';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Entrada } from '../entrada/entrada';
import type { Partida } from '../partida/partida';
import type { Render } from '../render/render';
import type { NombreEfecto } from '../sonido/sonido';

const DATOS = DATOS_COMBATE_PRUEBA;
/** La arena, lejos de la isla y de los interiores. */
const ARENA = new Vector3(600, 0, 600);
/** Dónde va cada criatura, respecto a la arena: la tuya delante a la izquierda, la rival al fondo. */
// La tuya, más adentro y atrás que al principio: su círculo se salía de la vista (autor, 2026-11-19).
const SITIO: [Vector3, Vector3] = [new Vector3(-1.6, 0, 1.1), new Vector3(2.35, 0, -1.85)];
/**
 * En el dos contra dos (el terrero de Agaete), por posición (lado × 2 + hueco): las dos tuyas
 * delante, la tuya a la izquierda y la del amigo a su lado; las dos rivales al fondo.
 */
// Las rivales, más al centro: a la derecha las tapaban tus fichas (2026-11-23).
const SITIO2: readonly Vector3[] = [new Vector3(-2.15, 0, 0.9), new Vector3(-0.35, 0, 1.65), new Vector3(0.35, 0, -2.55), new Vector3(2.15, 0, -2.3)];
/** En el dos contra dos, la cámara algo más atrás y más alta: caben las cuatro. */
const CAMARA2 = new Vector3(0.1, 3.4, 10.9);
/** El tamaño de siempre en cada lado; cada criatura lo multiplica según su altura (escalaPorAltura). */
const TAMANO: [number, number] = [1.0, 0.95];
/**
 * Hacia dónde miran: la una a la otra, sobre la diagonal, con la tuya un poco más de espaldas y la
 * rival un poco más de frente para que se le vea la cara (autor, 2026-11-10: más en las esquinas y
 * más giradas).
 */
const GIRO: [number, number] = [2.4, -0.75];
const CAMARA = new Vector3(0.1, 2.7, 8.6);
/**
 * Dónde evoluciona una criatura: en el centro, un poco hacia la cámara, mirándola, y algo alta: la
 * isla flota y su peñón no debe quedar tapado por el cuadro de texto.
 */
const CENTRO_EVOLUCION = new Vector3(0.15, 0.6, 0.2);
/** El fondo de la evolución: blanco roto (autor, 2026-11-19). */
const FONDO_EVOLUCION = new Color('#f2ede4');

/**
 * Los trece círculos del Sello (HISTORIA.md: el cubo de Metatrón), en el suelo bajo la criatura que
 * evoluciona: uno en el centro, seis alrededor y seis más fuera.
 */
const CIRCULOS_SELLO: readonly [number, number][] = [
  [0, 0],
  ...Array.from({ length: 6 }, (_, i): [number, number] => [Math.cos((i * Math.PI) / 3) * 0.55, Math.sin((i * Math.PI) / 3) * 0.55]),
  ...Array.from({ length: 6 }, (_, i): [number, number] => [Math.cos((i * Math.PI) / 3) * 1.1, Math.sin((i * Math.PI) / 3) * 1.1]),
];
/**
 * El Sello, a este tamaño: entero llegaba a 1,39 del centro y el relieve de la isla se comía los
 * círculos de fuera (probador, 2026-11-19). Así llega a 1,08, dentro del suelo liso.
 */
const ESCALA_SELLO = 0.78;
const MIRA = new Vector3(0.15, 0.4, 0);
/** El cubo de captura con que sale cada criatura (por ahora, el blanco, el básico). */
const CUBO: [number, number] = [0, 0];
/** Desde qué altura cae el cubo y cuánto sube al rebotar. */
const CAIDA = 2.6;
const REBOTE = 0.5;
/** Segundos de cada fundido, al entrar y al salir. */
/** Los fondos de combate que hay en src/assets/fondos/, por nombre sin extensión (solo los que existen). */
const URL_FONDOS = new Map(
  Object.entries(import.meta.glob<string>('../../assets/fondos/*.{webp,jpg,jpeg,png}', { eager: true, query: '?url', import: 'default' })).map(([ruta, url]) => [ruta.replace(/^.*\//, '').replace(/\.[^.]+$/, ''), url]),
);
const FUNDIDO = 0.55;
/** Lo más que se mueve la cámara al sacudirse, en unidades del mundo. */
const SACUDIDA_MAXIMA = 0.12;

/** Los bolsillos que se abren en combate: lo que cura y los cubos (objetos clave y técnicas, no). */
const BOLSILLOS_COMBATE: readonly IdBolsillo[] = ['botiquin', 'cubos'];
/** Segundos que tarda la flecha de la barra de captura en cruzarla de lado a lado. */
const BARRIDO = 1.1;
/** Cuántas criaturas caben en el equipo. */
const MAX_EQUIPO = 6;

const NOMBRE_TIPO = new Map<string, string>(TIPOS.map((t) => [t.id, t.nombre]));
const COLOR_TIPO = new Map<string, number>(TIPOS.map((t) => [t.id, t.color]));
/**
 * El icono de la categoría de un ataque, en un cuadradito (autor, 2026-11-19), dibujo propio:
 * una pesa para los físicos (Fuerza), un destello para los mágicos (Magia) y dos flechas, sube y
 * baja, para los de estado.
 */
const ICONO_CATEGORIA: Record<string, { color: string; dibujo: string; nombre: string }> = {
  // La pesa, en diagonal y con discos redondos: recta, a su tamaño, parecía una «H» (probador).
  fisico: { color: '#C9542A', nombre: 'Físico (Fuerza)', dibujo: '<g transform="rotate(-40 12 12)"><rect x="6" y="10.6" width="12" height="2.8" rx="1"/><circle cx="5.2" cy="12" r="3.6"/><circle cx="18.8" cy="12" r="3.6"/></g>' },
  magico: { color: '#4766CC', nombre: 'Mágico (Magia)', dibujo: '<path d="M12 3 L14 10 L21 12 L14 14 L12 21 L10 14 L3 12 L10 10 Z"/>' },
  estado: { color: '#8A847E', nombre: 'De estado', dibujo: '<path d="M8 4 L12 9 H9.5 V20 H6.5 V9 H4 Z"/><path d="M16 20 L20 15 H17.5 V4 H14.5 V15 H12 Z"/>' },
};
const iconoCategoria = (categoria: string) => {
  const i = ICONO_CATEGORIA[categoria] ?? ICONO_CATEGORIA.estado;
  return `<svg class="combate-categoria" viewBox="0 0 24 24" role="img" aria-label="${i.nombre}"><title>${i.nombre}</title><rect width="24" height="24" rx="5" fill="${i.color}"/><g fill="#fff">${i.dibujo}</g></svg>`;
};
/**
 * La etiqueta de un tipo, en su color. Con letra oscura en los tipos claros: blanca sobre Hielo,
 * Aire o Eléctrico no se leía (probador, 2026-11-19).
 */
function chipTipo(t: string): string {
  const color = COLOR_TIPO.get(t) ?? 0xa8a29e;
  const c = new Color(color);
  const luz = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  return `<i style="background:#${color.toString(16).padStart(6, '0')};color:${luz > 0.42 ? '#2B2320' : '#FFFFFF'}">${NOMBRE_TIPO.get(t) ?? t}</i>`;
}
/** Los tipos de una criatura, en sus colores, para ponerlos bajo su nombre (autor, 2026-11-19). */
const chipsTipos = (tipos: readonly string[]) => tipos.map(chipTipo).join('');
const ESTADISTICA: Record<string, string> = { fuerza: 'la fuerza', escudo: 'el escudo', magia: 'la magia', resMagica: 'la resistencia mágica', celeridad: 'la celeridad' };

type Fase = 'fuera' | 'entrando' | 'mensajes' | 'menu' | 'barra' | 'saliendo';
/** Qué menú está abierto: el principal, los ataques, la mochila, el equipo o el cambio obligado. */
type Menu = 'raiz' | 'ataques' | 'mochila' | 'equipo' | 'forzado' | 'objetivo';

interface Opcion {
  html: string;
  activa: boolean;
  elegir: () => void;
}

/** Un paso de la función: un mensaje, una animación o las dos cosas a la vez. */
interface Paso {
  texto?: string;
  /** El efecto que suena al empezar el paso (tabla EFECTOS de «sonido»). */
  sonido?: NombreEfecto;
  duracion: number;
  /** Se puede adelantar pulsando. */
  saltable: boolean;
  /** Segundos antes de poder adelantarlo (0,25 si no se dice). */
  minimo?: number;
  empezar?: () => void;
  /** t de 0 a 1 a lo largo del paso. */
  animar?: (t: number) => void;
}

interface Luchador {
  raiz: Group;
  giro: number;
  /** Desplazamiento de la animación actual (embestida, temblor, caída), sobre su sitio. */
  extra: Vector3;
  escala: number;
  visible: boolean;
  /** Su alto en la arena, según su altura: para poner a su medida el destello y las chispas. */
  alto: number;
  /** Cuánto se aparta de su sitio por ser grande: la tuya, hacia el centro, para no salirse por la izquierda. */
  ajuste: Vector3;
}

export class Combate implements Subsistema {
  static readonly id = 'combate';
  static readonly deps: readonly string[] = ['render', 'entrada', 'partida'];

  private ctx!: Ctx;
  private partida!: Partida;
  private entrada!: Entrada;
  private render!: Render;
  private arena = new Group();
  private materiales: Material[] = [];
  private materialCubo!: MaterialDiorama;
  private materialDestello!: MeshBasicNodeMaterial;
  private esferaDestello = new SphereGeometry(0.5, 20, 14);
  private fondoProvisional!: Texture;
  /** Las salas pintadas por código de los gimnasios sin fondo propio, por tipo. */
  private salas = new Map<string, Texture>();
  /** Los fondos pintados que ya se han cargado, por nombre (sin extensión). */
  private fondos = new Map<string, Texture>();
  /** El fondo pintado de los gimnasios (un interior con su volcán; probador, 2026-11-13). */
  private guardado: { fondo: Color | Texture | null; niebla: Fog | null } | null = null;

  private fase: Fase = 'fuera';
  private reloj = 0;
  private estado: EstadoCombate | null = null;
  /** Por posición: lado × 2 + hueco (en el 1 contra 1, la 0 y la 2). */
  private luchadores: (Luchador | null)[] = [null, null, null, null];
  private cola: Paso[] = [];
  private paso: Paso | null = null;
  private tPaso = 0;
  private eleccion = 0;
  private menuActual: Menu = 'raiz';
  /** El bolsillo de la mochila que se ve en combate (solo los que se usan luchando). */
  private bolsillo = 0;
  private opciones: Opcion[] = [];
  /** La figura de cada criatura del combate, por su uid: se cargan todas al empezar. */
  private figuras = new Map<string, Group>();
  /** El alto de cada figura en la arena, por uid. */
  private altos = new Map<string, number>();
  /** Nivel de cada criatura tuya al empezar: las que suben y ya pueden, evolucionan al ganar. */
  private nivelesAntes = new Map<string, number>();
  /** La figura de la forma siguiente de cada criatura tuya, por «uid>especie», cargada de antemano. */
  private figurasEvolucion = new Map<string, { figura: Group; alto: number }>();
  /** La evolución en curso: hasta el destello, Esc la para. */
  private evolucion: { parable: boolean; cancelada: boolean } | null = null;
  /** Lo que la evolución apaga de la arena (las plataformas): se vuelve a encender al abrirla otra vez. */
  private apagadasEvolucion: Object3D[] = [];
  /** Lo que queda de cada evolución hasta que se cierra la arena: su grupo y lo que hay que soltar. */
  private restosEvolucion: { grupo: Group; nuevos: { dispose(): void }[] }[] = [];
  /** El escenario de evolución a la fuerza («Probar evolución», modo desarrollador), o null: el de su tipo. */
  private tipoEvolucion: string | null = null;
  /** Contra quién se lucha: el id del entrenador, o null si es salvaje. */
  private entrenador: string | null = null;
  /** La barra de captura (F08): qué cubo se lanza y cuánto lleva la flecha moviéndose. */
  private barra!: HTMLDivElement;
  private flecha!: HTMLElement;
  private lanzamiento: { objeto: string; t: number } | null = null;
  private particulas: { malla: Mesh; vel: Vector3; vida: number }[] = [];
  private vidaVista = [0, 0, 0, 0];
  /** El dos contra dos: formato, cuántas del lado 0 son tuyas (el resto, del amigo) y quién saca a cada rival. */
  private formato: 1 | 2 = 1;
  private nPropias = 0;
  private nombresRival: string[] = [];
  private nombreAliado = '';
  /** En el dos contra dos, desde qué índice del equipo rival las criaturas son del segundo rival. */
  private corteRival = Infinity;
  private movElegido = 0;
  private plataformas: Mesh[] = [];

  // Interfaz.
  private raiz!: HTMLDivElement;
  private texto!: HTMLParagraphElement;
  private menu!: HTMLDivElement;
  private botones: HTMLSpanElement[] = [];
  private fichas: { dueno: HTMLElement; nombre: HTMLElement; nivel: HTMLElement; chips: HTMLElement; relleno: HTMLElement; numeros: HTMLElement | null }[] = [];
  /** El último ataque elegido por cada criatura (uid → id del ataque): el cursor vuelve a él (autor, 2026-11-19). */
  private ultimoAtaque = new Map<string, string>();
  private velo!: HTMLDivElement;
  /** La tabla de tipos (tecla T): qué le hace daño a la rival y qué a la tuya. */
  private panelTipos!: HTMLDivElement;
  /** La arena o el viento del campo del gimnasio, en pantalla. */
  private clima!: HTMLDivElement;

  init(ctx: Ctx): void {
    this.ctx = ctx;
    this.partida = ctx.get<Partida>('partida');
    this.entrada = ctx.get<Entrada>('entrada');
    this.render = ctx.get<Render>('render');
    this.montarArena();
    this.montarInterfaz();
    this.fondoProvisional = fondoProvisional();
    // Los fondos pintados por el autor (src/assets/fondos/): los dos de Lanzarote, que valen para
    // todo, y los de cada paisaje de esta isla (DatosIsla.fondos). Solo se piden los que existen; si
    // falta uno, el de Lanzarote, y sin ninguno, el provisional hecho por código.
    const nombres = new Set(['combate-exterior', 'combate-gimnasio', ...Object.values(this.partida.datos.fondos ?? {})]);
    for (const nombre of nombres) {
      const url = URL_FONDOS.get(nombre);
      if (!url) continue;
      new TextureLoader().load(url, (t) => {
        t.colorSpace = SRGBColorSpace;
        this.fondos.set(nombre, t);
      });
    }
    // Hablar con un entrenador no vencido (o que te vea) acaba en combate (F16).
    ctx.eventos.on('dialogo:cerrar', ({ guionId }) => {
      const inicial = this.partida.estado.inicial;
      const def = this.partida.datos.entrenadores[guionId];
      if (!def || !inicial || this.partida.vencidos.includes(guionId)) return;
      // Quien pregunta antes de luchar, solo si le has dicho que sí.
      if (def.pregunta && !this.partida.estado.condiciones.includes(`listo:${guionId}`)) return;
      const rng = crearRng(`rival-${guionId}`);
      // El equipo según tu inicial (data/equipos.ts, el mismo que usa el simulador de partida).
      const { rivales: equipo, pareja } = equipoDeEntrenador(guionId, this.partida.datos.entrenadores, inicial as TipoInicial, rng);
      // Los dos líderes juntos (el terrero de Agaete): dos contra dos, con tu segundo amigo al lado.
      if (def.pareja && pareja) {
        void this.empezar([...equipo, ...pareja.delOtro], guionId, {
          formato: 2,
          aliado: pareja.aliado,
          activosRival: [0, equipo.length],
          nombresRival: def.pareja.nombres,
          nombreAliado: this.partida.amigos.amigo2 ?? 'Tu amigo',
        });
        return;
      }
      void this.empezar(equipo, guionId);
    });
    ctx.eventos.on('evolucion:fuera', () => void this.evolucionarFuera());
    ctx.eventos.on('encuentro:inicio', ({ salvajes, tipoEvolucion }) => {
      this.tipoEvolucion = tipoEvolucion ?? null;
      void this.empezar(salvajes as Criatura[], null);
    });
  }

  /** La arena: dos plataformas de jable con su canto, una para cada criatura. */
  private montarArena(): void {
    this.materialCubo = new MaterialDiorama({ bordes: [-0.1, 0.45], especular: 0.25, dureza: 30, rebote: 0.15 }, attribute('color', 'vec3'));
    this.materialDestello = new MeshBasicNodeMaterial({ color: '#fffbe8', transparent: true, depthWrite: false, blending: AdditiveBlending });
    this.materialDestello.toneMapped = false;
    this.materiales.push(this.materialCubo, this.materialDestello);
    this.arena.position.copy(ARENA);
    this.arena.visible = false;
    const arriba = new MaterialDiorama({ color: '#E9D6A8', bordes: [-0.05, 0.4], rebote: 0.15 });
    const canto = new MaterialDiorama({ color: '#B9976A', bordes: [-0.05, 0.4] });
    this.materiales.push(arriba, canto);
    // Las del 1 contra 1 y, aparte, las cuatro del dos contra dos (más pequeñas): se ven las de su formato.
    const losas: [Vector3, number, 1 | 2][] = [
      ...SITIO.map((s, i): [Vector3, number, 1 | 2] => [s, i === 0 ? 1.15 : 1.0, 1]),
      ...SITIO2.map((s, i): [Vector3, number, 1 | 2] => [s, i < 2 ? 0.88 : 0.8, 2]),
    ];
    for (const [s, r, formato] of losas) {
      const losa = new Mesh(new CylinderGeometry(r, r * 1.04, 0.14, 40), [canto, arriba, canto]);
      losa.position.set(s.x, -0.07, s.z);
      losa.receiveShadow = true;
      losa.userData.formato = formato;
      losa.visible = formato === 1;
      this.arena.add(losa);
      this.plataformas.push(losa);
    }
    this.ctx.escena.add(this.arena);
  }

  private montarInterfaz(): void {
    const raiz = document.createElement('div');
    raiz.className = 'combate';
    raiz.hidden = true;
    raiz.innerHTML = `
      <div class="calima combate-clima" hidden aria-hidden="true"></div>
      <div class="combate-ficha propia"><p class="combate-dueno" hidden></p><p class="combate-nombre"></p><p class="combate-nivel"></p><p class="combate-chips"></p><div class="combate-vida"><div class="combate-relleno"></div></div><p class="combate-numeros"></p></div>
      <div class="combate-ficha propia2"><p class="combate-dueno" hidden></p><p class="combate-nombre"></p><p class="combate-nivel"></p><p class="combate-chips"></p><div class="combate-vida"><div class="combate-relleno"></div></div><p class="combate-numeros"></p></div>
      <div class="combate-ficha rival"><p class="combate-dueno" hidden></p><p class="combate-nombre"></p><p class="combate-nivel"></p><p class="combate-chips"></p><div class="combate-vida"><div class="combate-relleno"></div></div></div>
      <div class="combate-ficha rival2"><p class="combate-dueno" hidden></p><p class="combate-nombre"></p><p class="combate-nivel"></p><p class="combate-chips"></p><div class="combate-vida"><div class="combate-relleno"></div></div></div>
      <div class="combate-caja"><p class="combate-texto" aria-live="assertive"></p><div class="combate-menu" hidden></div></div>
      <div class="combate-tipos" hidden></div>
      <div class="combate-barra" hidden><i class="blanca"></i><i class="verde"></i><b class="flecha"></b></div>
      <div class="combate-velo"></div>`;
    document.body.append(raiz);
    this.raiz = raiz;
    this.texto = raiz.querySelector('.combate-texto')!;
    this.menu = raiz.querySelector('.combate-menu')!;
    this.velo = raiz.querySelector('.combate-velo')!;
    this.panelTipos = raiz.querySelector('.combate-tipos')!;
    // La arena o el viento del gimnasio, en pantalla durante el combate: las motas de la calima, más.
    this.clima = raiz.querySelector('.combate-clima')!;
    for (let i = 0; i < 36; i++) {
      const mota = document.createElement('i');
      mota.style.top = `${4 + ((i * 29) % 92)}%`;
      mota.style.setProperty('--d', `${4 + ((i * 3) % 5)}s`);
      mota.style.animationDelay = `${-((i * 1.7) % 6)}s`;
      mota.style.transform = `scale(${0.7 + ((i * 3) % 5) * 0.15})`;
      this.clima.append(mota);
    }
    this.barra = raiz.querySelector('.combate-barra')!;
    this.flecha = raiz.querySelector('.combate-barra .flecha')!;
    // Las zonas, con los anchos del núcleo: así lo que se ve es lo que cuenta.
    const zona = (clase: string, media: number) => (raiz.querySelector<HTMLElement>(`.combate-barra .${clase}`)!.style.cssText = `left:${(0.5 - media) * 100}%;width:${media * 200}%`);
    zona('blanca', MEDIA_BLANCA);
    zona('verde', MEDIA_VERDE);
    for (const ficha of raiz.querySelectorAll('.combate-ficha')) {
      this.fichas.push({
        dueno: ficha.querySelector('.combate-dueno')!,
        nombre: ficha.querySelector('.combate-nombre')!,
        nivel: ficha.querySelector('.combate-nivel')!,
        chips: ficha.querySelector('.combate-chips')!,
        relleno: ficha.querySelector('.combate-relleno')!,
        numeros: ficha.querySelector('.combate-numeros'),
      });
    }
    // Por posición: 0 la tuya, 1 la del amigo, 2 y 3 las rivales (en el 1 contra 1, solo la 0 y la 2).
  }

  // ——— Entrar y salir ———

  /** Empieza un combate contra un entrenador (`entrenador`, su id) o una criatura salvaje (null). */
  private async empezar(
    rival: Criatura[],
    entrenador: string | null,
    op: { formato?: 1 | 2; aliado?: Criatura[]; activosRival?: number[]; nombresRival?: string[]; nombreAliado?: string } = {},
  ): Promise<void> {
    if (this.fase !== 'fuera' || !this.partida.equipo.some((c) => c.vida > 0)) return;
    this.fase = 'entrando';
    this.entrenador = entrenador;
    this.ctx.eventos.emit('combate:rival', { entrenador });
    this.partida.empezarCombate();
    // Que no asome el texto ni el menú del combate anterior mientras se aclara la arena.
    this.texto.textContent = '';
    this.menu.hidden = true;
    const rng = crearRng(`combate-${entrenador ?? 'salvaje'}-${this.ctx.tiempo.pasos}`);
    // La inicial no hace caso hasta que el anciano cuenta su historia (F25).
    const especieInicial = ESPECIE_INICIAL[this.partida.estado.inicial ?? ''];
    const rebeldes = this.partida.estado.condiciones.includes('anciano') ? [] : this.partida.equipo.filter((c) => c.especie === especieInicial).map((c) => c.uid);
    // Dentro de un gimnasio, su campo (tormenta de arena, viento…) en los combates contra entrenadores.
    const sala = this.partida.estado.dentro;
    const campo = entrenador && sala ? this.partida.datos.campos?.[sala] : undefined;
    // En el dos contra dos, tu equipo y, detrás, el del amigo (aliado): empiezan tu primera y la suya.
    this.formato = op.formato ?? 1;
    const propias = structuredClone(this.partida.equipo);
    const aliado = op.aliado ?? [];
    this.nPropias = propias.length;
    this.nombresRival = op.nombresRival ?? [];
    this.nombreAliado = op.nombreAliado ?? '';
    this.corteRival = op.activosRival?.[1] ?? Infinity;
    for (const pl of this.plataformas) pl.visible = pl.userData.formato === this.formato;
    const conAliado = aliado.length
      ? { aliadoDesde: propias.length, activosIniciales: [[propias.findIndex((c) => c.vida > 0), propias.length + Math.max(0, aliado.findIndex((c) => c.vida > 0))], op.activosRival ?? [0, 1]] as [number[], number[]] }
      : {};
    const r = iniciarCombate(
      { equipos: [[...propias, ...aliado], rival], formato: this.formato, salvaje: entrenador === null, control: ['jugador', 'ia'], rng, experiencia: true, rebeldes, ...(campo ? { campo } : {}), ...conAliado },
      DATOS,
    );
    this.estado = r.estado;
    // Todas las figuras, antes del fundido: un cambio de criatura no espera a cargar nada.
    this.figuras.clear();
    const todas = r.estado.lados.flatMap((l, lado) => l.equipo.map((c) => [lado, c] as const));
    // Cada una a su altura, con la diferencia comprimida (ARTE.md, «Escala de las criaturas»).
    this.altos.clear();
    await Promise.all(
      todas.map(async ([lado, c]) => {
        const alto = TAMANO[lado] * escalaPorAltura(DATOS.especies[c.especie]?.altura);
        this.altos.set(c.uid, alto);
        this.figuras.set(c.uid, await figuraCriatura(MODELO_DE[c.especie] ?? MODELO_DE['inicial-roca'], 'color', alto));
      }),
    );
    // Lo que hace falta para evolucionar al final, ya cargado: el nivel de cada una y su forma siguiente.
    // Las que subieron fuera del combate (el almendrado) cuentan como subidas: evolucionan al ganar.
    this.nivelesAntes = new Map(this.partida.equipo.map((c) => [c.uid, this.partida.subidasFuera.has(c.uid) ? c.nivel - 1 : c.nivel]));
    this.figurasEvolucion.clear();
    await Promise.all(
      this.partida.equipo.flatMap((c) =>
        (DATOS.especies[c.especie]?.evoluciona ?? []).map(async (ev) => {
          const modelo = MODELO_DE[ev.a];
          if (!modelo) return;
          const alto = TAMANO[0] * escalaPorAltura(DATOS.especies[ev.a]?.altura);
          this.figurasEvolucion.set(`${c.uid}>${ev.a}`, { figura: await figuraCriatura(modelo, 'color', alto), alto });
        }),
      ),
    );
    for (const l of this.luchadores) l?.raiz.removeFromParent();
    this.luchadores = [null, null, null, null];
    // Destello y fundido a negro; en negro, se cambia a la arena.
    this.encolar({ duracion: 0.45, saltable: false, animar: (t) => (this.velo.style.cssText = `opacity:${Math.sin(t * Math.PI * 3) ** 2 * 0.85};background:#fff`) });
    this.encolar({ duracion: FUNDIDO, saltable: false, animar: (t) => (this.velo.style.cssText = `opacity:${t};background:#1d1720`) });
    this.encolar({ duracion: 0.05, saltable: false, empezar: () => this.mostrarArena(true) });
    this.encolar({ duracion: FUNDIDO, saltable: false, animar: (t) => (this.velo.style.cssText = `opacity:${1 - t};background:#1d1720`) });
    this.mostrarEventos(r.eventos);
    this.fase = 'mensajes';
  }

  /**
   * Evoluciona fuera de combate (autor, 2026-11-20: con el almendrado también): las del equipo que ya
   * tienen el nivel de su evolución, con la misma escena que tras un combate, y de vuelta a la isla.
   * Usa un estado mínimo con el equipo (la escena lo lee de ahí y ahí deja la forma nueva).
   */
  private async evolucionarFuera(): Promise<void> {
    if (this.fase !== 'fuera') return;
    const equipo = structuredClone(this.partida.equipo);
    const evoluciones = equipo.flatMap((c) => {
      const ev = evolucionesPosibles(c, DATOS)[0];
      return ev ? [{ uid: c.uid, a: ev.a }] : [];
    });
    if (!evoluciones.length) return;
    this.formato = 1;
    this.nPropias = this.partida.equipo.length;
    for (const pl of this.plataformas) pl.visible = pl.userData.formato === 1;
    this.fase = 'entrando';
    this.entrenador = null;
    this.ctx.eventos.emit('combate:rival', { entrenador: null, soloEvolucion: true });
    this.partida.empezarCombate();
    this.texto.textContent = '';
    this.menu.hidden = true;
    this.estado = { lados: [{ equipo, activos: [] }, { equipo: [], activos: [] }], pendientes: [], fin: 'victoria' } as unknown as EstadoCombate;
    this.figuras.clear();
    this.altos.clear();
    this.figurasEvolucion.clear();
    await Promise.all(
      evoluciones.map(async ({ uid, a }) => {
        const c = equipo.find((x) => x.uid === uid)!;
        const alto = TAMANO[0] * escalaPorAltura(DATOS.especies[c.especie]?.altura);
        this.altos.set(uid, alto);
        this.figuras.set(uid, await figuraCriatura(MODELO_DE[c.especie] ?? MODELO_DE['inicial-roca'], 'color', alto));
        const altoNueva = TAMANO[0] * escalaPorAltura(DATOS.especies[a]?.altura);
        this.figurasEvolucion.set(`${uid}>${a}`, { figura: await figuraCriatura(MODELO_DE[a] ?? MODELO_DE['inicial-roca'], 'color', altoNueva), alto: altoNueva });
      }),
    );
    const caja = this.raiz.querySelector<HTMLElement>('.combate-caja')!;
    const paneles = [caja, ...this.fichas.map((f) => f.nombre.parentElement!)];
    this.encolar({ duracion: FUNDIDO, saltable: false, animar: (t) => (this.velo.style.cssText = `opacity:${t};background:#1d1720`) });
    // La arena se abre con la pantalla en negro y la evolución aclara desde ahí: con el fundido
    // aparte se veía un segundo el campo de batalla vacío (autor, 2026-11-20).
    this.encolar({ duracion: 0.05, saltable: false, empezar: () => this.mostrarArena(true) });
    evoluciones.forEach(({ uid, a }, i) => this.encolarEvolucion(uid, a, { desdeNegro: i === 0 }));
    this.encolar({ duracion: FUNDIDO, saltable: false, animar: (t) => (this.velo.style.cssText = `opacity:${t};background:#1d1720`) });
    this.encolar({
      duracion: 0.05,
      saltable: false,
      empezar: () => {
        this.mostrarArena(false);
        this.raiz.hidden = false;
        for (const p of paneles) p.style.visibility = 'hidden';
        // El equipo vuelve como ha quedado: con las formas nuevas.
        this.partida.equipo = this.estado!.lados[0].equipo;
        for (const { uid } of evoluciones) this.partida.subidasFuera.delete(uid);
        this.partida.terminarCombate();
      },
    });
    this.encolar({ duracion: FUNDIDO, saltable: false, animar: (t) => (this.velo.style.cssText = `opacity:${1 - t};background:#1d1720`) });
    this.encolar({
      duracion: 0.01,
      saltable: false,
      empezar: () => {
        this.raiz.hidden = true;
        for (const p of paneles) p.style.visibility = '';
        this.estado = null;
        this.fase = 'fuera';
      },
    });
    this.fase = 'saliendo';
  }

  /** Pone en su plataforma la figura de una criatura, en lugar de la que hubiera. */
  private ponerLuchador(p: number, uid: string): void {
    const f = this.figuras.get(uid);
    if (!f) return;
    const lado = (p >> 1) as 0 | 1;
    this.luchadores[p]?.raiz.removeFromParent();
    const alto = this.altos.get(uid) ?? TAMANO[lado];
    // Centradas en su círculo por el centro del cuerpo (figuraCriatura), sin desplazarlas (autor).
    const ajuste = new Vector3();
    this.luchadores[p] = { raiz: f, giro: GIRO[lado], extra: new Vector3(), escala: 0, visible: false, alto, ajuste };
    this.arena.add(f);
  }

  /**
   * El fondo de un gimnasio sin el suyo pintado: una sala con estandartes del color de su tipo. Antes
   * salía el del gimnasio de Roca, con su volcán, en los de Aire, Eléctrico y Lucha (probador,
   * 2026-11-24). El de Roca (`gimnasio`, sin tipo en el nombre) sigue con el pintado.
   */
  private salaDeGimnasio(sala: string): Texture | undefined {
    const tipo = TIPOS.find((t) => sala === `gimnasio-${t.id}`);
    if (!tipo) return undefined;
    let t = this.salas.get(tipo.id);
    if (!t) this.salas.set(tipo.id, (t = fondoDeSala(tipo.color)));
    return t;
  }

  private mostrarArena(si: boolean): void {
    const escena = this.ctx.escena;
    this.arena.visible = si;
    this.raiz.hidden = !si;
    if (!si) this.clima.hidden = true;
    if (si) {
      for (const o of this.apagadasEvolucion) o.visible = true;
      this.apagadasEvolucion = [];
      this.guardado = { fondo: escena.background as Color | Texture | null, niebla: escena.fog as Fog | null };
      const enGimnasio = this.partida.estado.dentro?.startsWith('gimnasio') ?? false;
      // La arena (ocre) o el viento (rachas blancas) del campo, mientras dure el combate.
      const campo = this.estado?.campo;
      this.clima.hidden = !(campo?.clima === 'arena' || campo?.vientoAFavor !== undefined);
      this.clima.classList.toggle('viento', campo?.vientoAFavor !== undefined && campo.clima !== 'arena');
      const e = this.partida.estado;
      const propio = this.partida.datos.fondos?.[e.dentro ?? e.zona];
      escena.background = (propio && this.fondos.get(propio)) || (enGimnasio && this.salaDeGimnasio(e.dentro!)) || this.fondos.get(enGimnasio ? 'combate-gimnasio' : 'combate-exterior') || this.fondoProvisional;
      escena.fog = null;
      this.ajustarFondo();
      this.render.enfocar(ARENA.x, 0, ARENA.z);
      this.colocarCamara();
      for (let p = 0; p < 4; p++) this.pintarFicha(p, true);
    } else if (this.guardado) {
      for (const r of this.restosEvolucion) {
        r.grupo.removeFromParent();
        for (const n of r.nuevos) n.dispose();
      }
      this.restosEvolucion = [];
      escena.background = this.guardado.fondo;
      escena.fog = this.guardado.niebla;
      this.guardado = null;
    }
  }

  /** El fondo cubre la pantalla sin deformarse, como `background-size: cover`. */
  private ajustarFondo(): void {
    const t = this.ctx.escena.background as Texture | null;
    if (!t || !(t as Texture).isTexture || !t.image) return;
    const img = t.image as { width: number; height: number };
    const pantalla = window.innerWidth / window.innerHeight;
    const imagen = img.width / img.height;
    if (pantalla > imagen) {
      t.repeat.set(1, imagen / pantalla);
      t.offset.set(0, (1 - t.repeat.y) / 2);
    } else {
      t.repeat.set(pantalla / imagen, 1);
      t.offset.set((1 - t.repeat.x) / 2, 0);
    }
  }

  private colocarCamara(): void {
    const c = this.ctx.camara;
    c.position.copy(ARENA).add(this.formato === 2 ? CAMARA2 : CAMARA);
    c.lookAt(ARENA.clone().add(MIRA));
  }

  /**
   * Sacude la cámara con la curva trauma² (de 1 a 0) y un tope pequeño, para que nunca tape la
   * decisión siguiente. Ruido de senos, sin azar. Nada si el sistema pide menos movimiento.
   */
  private sacudirCamara(trauma: number): void {
    this.colocarCamara();
    if (trauma <= 0 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const fuerza = trauma * trauma * SACUDIDA_MAXIMA;
    const fase = trauma * 60;
    this.ctx.camara.position.x += Math.sin(fase * 1.7) * fuerza;
    this.ctx.camara.position.y += Math.sin(fase * 2.3 + 1) * fuerza * 0.6;
  }

  private terminar(): void {
    const caja = this.raiz.querySelector<HTMLElement>('.combate-caja')!;
    const paneles = [caja, ...this.fichas.map((f) => f.nombre.parentElement!)];
    // Antes de volver: las que han subido de nivel y ya pueden, evolucionan (si no has perdido).
    const fin = this.estado!;
    if (fin.fin !== 'derrota') for (const { uid, a } of evolucionesTrasCombate(this.nivelesAntes, fin.lados[0].equipo.slice(0, this.nPropias), DATOS)) this.encolarEvolucion(uid, a);
    this.encolar({ duracion: FUNDIDO, saltable: false, animar: (t) => (this.velo.style.cssText = `opacity:${t};background:#1d1720`) });
    this.encolar({
      // En negro: vuelta a la isla. Solo queda el velo, que se aclara.
      duracion: 0.05,
      saltable: false,
      empezar: () => {
        this.mostrarArena(false);
        this.tipoEvolucion = null;
        this.raiz.hidden = false;
        for (const p of paneles) p.style.visibility = 'hidden';
        for (const l of this.luchadores) l?.raiz.removeFromParent();
        this.luchadores = [null, null, null, null];
        const e = this.estado!;
        // El equipo vuelve a «partida» como ha quedado: vida, PP, estados y experiencia.
        // Sin las del amigo, que van detrás de las tuyas.
        this.partida.equipo = e.lados[0].equipo.slice(0, this.nPropias);
        if (e.fin !== 'derrota') this.partida.subidasFuera.clear();
        if (e.capturada && this.partida.equipo.length < MAX_EQUIPO) this.partida.equipo.push(e.capturada);
        if (e.fin === 'victoria' && this.entrenador) {
          // Con dos líderes, primero el otro: lo que dice al volver es lo del principal.
          const pareja = this.partida.datos.entrenadores[this.entrenador]?.pareja;
          if (pareja) this.partida.vencerA(pareja.entrenador);
          this.partida.vencerA(this.entrenador);
        }
        // Quien pregunta antes de luchar, si te ha vencido, vuelve a preguntar (probador, 2026-11-23).
        if (e.fin !== 'victoria' && this.entrenador) this.partida.olvidarListo(this.entrenador);
        this.partida.terminarCombate();
        if (e.fin === 'derrota') this.partida.volverAlRefugio();
        this.ctx.eventos.emit('combate:fin', { resultado: e.fin ?? 'victoria' });
      },
    });
    this.encolar({ duracion: FUNDIDO, saltable: false, animar: (t) => (this.velo.style.cssText = `opacity:${1 - t};background:#1d1720`) });
    this.encolar({
      duracion: 0.01,
      saltable: false,
      empezar: () => {
        this.raiz.hidden = true;
        for (const p of paneles) p.style.visibility = '';
        this.estado = null;
        this.fase = 'fuera';
      },
    });
    this.fase = 'saliendo';
  }

  // ——— Turnos ———

  /** Manda la acción del jugador al núcleo y enseña lo que pasa en el turno. */
  private enviar(a: Accion): void {
    let r: Resultado;
    try {
      r = resolverTurno(this.estado!, { 0: [a] }, DATOS);
    } catch {
      this.texto.textContent = 'Eso no se puede hacer ahora.';
      return;
    }
    // Los objetos se gastan de la mochila de verdad.
    if (a.tipo === 'objeto') this.partida.mochila[a.objeto] = Math.max(0, (this.partida.mochila[a.objeto] ?? 0) - 1);
    this.seguir(r);
  }

  private seguir(r: Resultado): void {
    this.estado = r.estado;
    this.menu.hidden = true;
    this.fase = 'mensajes';
    this.mostrarEventos(r.eventos);
  }

  /** La barra de captura: la flecha va y viene hasta que se para con Espacio, E o Enter. */
  private abrirBarra(objeto: string): void {
    this.fase = 'barra';
    this.lanzamiento = { objeto, t: 0 };
    this.menu.hidden = true;
    this.barra.hidden = false;
    this.texto.textContent = 'Para la flecha con A o Espacio. En el verde, mucho mejor. (X: volver)';
  }

  /** Dónde está la flecha, de 0 (izquierda) a 1 (derecha): va y viene. */
  private posicionFlecha(): number {
    const u = ((this.lanzamiento?.t ?? 0) / BARRIDO) % 2;
    return u < 1 ? u : 2 - u;
  }

  private pararBarra(lanzar: boolean): void {
    const l = this.lanzamiento!;
    const zona = zonaBarra(this.posicionFlecha());
    this.barra.hidden = true;
    this.lanzamiento = null;
    if (!lanzar) {
      // De vuelta a la mochila, en los cubos y con el cursor en el que se iba a lanzar.
      this.bolsillo = BOLSILLOS_COMBATE.indexOf(bolsilloDe(DATOS.objetos[l.objeto]));
      this.abrirMenu('mochila');
      this.eleccion = Math.max(0, this.objetosMochila().indexOf(l.objeto));
      return this.pintarMenu();
    }
    const texto = { verde: '¡En el verde! Un lanzamiento perfecto.', blanca: 'En el blanco: buen lanzamiento.', gris: 'En el gris… Lanzas como puedes.' }[zona];
    this.encolar({ texto, duracion: 1, saltable: true });
    this.enviar({ tipo: 'objeto', objeto: l.objeto, calidad: CALIDAD_ZONA[zona] });
  }

  /** Los objetos del bolsillo que se ve, en el orden en que salen en el menú. */
  private objetosMochila(): string[] {
    const b = BOLSILLOS_COMBATE[this.bolsillo];
    return Object.entries(this.partida.mochila)
      .filter(([id, n]) => n > 0 && DATOS.objetos[id] && bolsilloDe(DATOS.objetos[id]) === b)
      .map(([id]) => id);
  }

  /** La criatura activa de un lado. */
  /** De cuál de los dos rivales es una criatura (dos contra dos): 0, el primero; 1, el segundo. */
  private duenoRival(uid: string): number {
    const i = this.estado?.lados[1].equipo.findIndex((c) => c.uid === uid) ?? -1;
    return i >= this.corteRival ? 1 : 0;
  }

  /** Si una criatura de tu lado es de tu amigo. */
  private esDelAliado(uid: string): boolean {
    const l = this.estado?.lados[0];
    const i = l?.equipo.findIndex((c) => c.uid === uid) ?? -1;
    return !!l && i >= 0 && delAliado(l, i);
  }

  private activa(lado: 0 | 1): Criatura | undefined {
    return this.activaEn(lado * 2);
  }

  /** La criatura de una posición (lado × 2 + hueco), si la hay. */
  private activaEn(p: number): Criatura | undefined {
    const l = this.estado?.lados[p >> 1];
    const i = l?.activos[p & 1];
    return l && i !== undefined && i >= 0 ? l.equipo[i] : undefined;
  }

  private pos(r: Ref): number {
    return r.lado * 2 + r.hueco;
  }

  /** Dónde está cada posición en la arena, según el formato. */
  private sitio(p: number): Vector3 {
    return this.formato === 2 ? SITIO2[p]! : SITIO[(p >> 1) as 0 | 1];
  }

  /** El centro del otro lado: hacia allí se lanzan los ataques. */
  private centroRival(lado: number): Vector3 {
    const otro = 1 - lado;
    return this.formato === 2 ? this.sitio(otro * 2).clone().add(this.sitio(otro * 2 + 1)).multiplyScalar(0.5) : this.sitio(otro * 2).clone();
  }

  /** Convierte los eventos del núcleo en la función: mensajes y animaciones, en orden. */
  private mostrarEventos(eventos: Evento[]): void {
    let tipoUsado = 'comun';
    let atacante = 0;
    for (const ev of eventos) {
      switch (ev.tipo) {
        case 'entrada': {
          const lado = ev.ref.lado;
          const p = this.pos(ev.ref);
          const uid = ev.ficha.uid;
          if (lado === 1 && this.estado?.salvaje) {
            // La salvaje ya está ahí: aparece de un salto, sin cubo.
            this.encolar({
              texto: `¡Un ${ev.ficha.nombre} salvaje te sale al paso!`,
              sonido: 'salida',
              duracion: 1.3,
              saltable: false,
              empezar: () => {
                this.ponerLuchador(p, uid);
                this.pintarEntrada(p, ev.ficha);
              },
              animar: (t) => {
                const l = this.luchadores[p]!;
                l.visible = true;
                l.escala = rebote(Math.min(1, t * 1.6));
              },
            });
            break;
          }
          // El cubo de captura cae en su plataforma, rebota una vez y la criatura sale con un
          // destello de luz (autor, 2026-11-10).
          let cubo: Group | null = null;
          let destello: Mesh | null = null;
          const abierto = { chispas: false };
          this.encolar({
            texto:
              this.formato === 2 && lado === 1
                ? `¡${this.nombresRival[this.duenoRival(uid)] ?? 'El rival'} saca a ${ev.ficha.nombre}!`
                : this.formato === 2 && this.esDelAliado(uid)
                  ? `¡${this.nombreAliado} saca a ${ev.ficha.nombre}!`
                  : lado === 1
                    ? `¡${this.entrenador?.startsWith('lider') ? 'La líder' : 'El entrenador'} saca a ${ev.ficha.nombre}!`
                    : `¡Adelante, ${ev.ficha.nombre}!`,
            sonido: 'salida',
            duracion: 1.9,
            saltable: false,
            empezar: () => {
              this.ponerLuchador(p, uid);
              this.pintarEntrada(p, ev.ficha);
              cubo = figuraCubo(CUBO[lado], this.materialCubo);
              cubo.position.copy(this.sitio(p)).setY(CAIDA);
              this.arena.add(cubo);
              destello = new Mesh(this.esferaDestello, this.materialDestello.clone());
              destello.visible = false;
              destello.position.copy(this.sitio(p)).setY((this.luchadores[p]?.alto ?? TAMANO[lado]) * 0.45);
              this.arena.add(destello);
            },
            animar: (t) => this.animarSalida(p, t, cubo!, destello!, abierto),
          });
          break;
        }
        case 'usa': {
          atacante = ev.ref.lado;
          // El evento trae el id del movimiento; se enseña su nombre.
          const mov = DATOS.movimientos[ev.movimiento];
          tipoUsado = mov?.tipo || 'comun';
          const lado = atacante;
          const p = this.pos(ev.ref);
          const estado = mov?.categoria === 'estado';
          this.encolar({
            texto: `¡${ev.nombre} usa ${mov?.nombre ?? ev.movimiento}!`,
            sonido: estado ? 'confirmar' : 'ataque',
            duracion: 0.75,
            saltable: false,
            animar: (t) => {
              const l = this.luchadores[p]!;
              if (estado) {
                l.extra.set(0, Math.sin(t * Math.PI) * 0.25, 0);
                return;
              }
              const hacia = this.centroRival(lado).sub(this.sitio(p)).normalize();
              const k = t < 0.45 ? -Math.sin((t / 0.45) * Math.PI) * 0.15 : Math.sin(((t - 0.45) / 0.55) * Math.PI) * 0.8;
              l.extra.copy(hacia).multiplyScalar(k);
            },
          });
          break;
        }
        case 'danio': {
          if (ev.causa !== 'golpe') {
            const quien = this.activaEn(this.pos(ev.ref));
            const nombre = quien ? nombreDe(quien, DATOS) : '';
            const textos: Partial<Record<typeof ev.causa, string>> = {
              quemadura: 'La quemadura le hace daño.',
              arena: `La tormenta de arena golpea a ${nombre}.`,
              confusion: 'Se golpea a sí misma.',
            };
            this.encolar({ texto: textos[ev.causa] ?? 'Le hace daño.', duracion: 0.9, saltable: true, empezar: () => this.pintarVida(this.pos(ev.ref), ev.vida, ev.vidaMax) });
            break;
          }
          const p = this.pos(ev.ref);
          const color = COLOR_TIPO.get(tipoUsado) ?? 0xffffff;
          // Los golpes muy eficaces y los críticos sacuden la cámara (skill pulir, 2026-11-25).
          const fuerte = ev.eficacia > 1 || ev.critico;
          this.encolar({
            duracion: 0.55,
            saltable: false,
            sonido: 'golpe',
            empezar: () => {
              this.chispas(p, color);
              this.pintarVida(p, ev.vida, ev.vidaMax);
            },
            animar: (t) => {
              const l = this.luchadores[p]!;
              l.visible = t > 0.8 || Math.floor(t * 8) % 2 === 0;
              l.extra.set(Math.sin(t * 40) * 0.06 * (1 - t), 0, 0);
              if (fuerte) this.sacudirCamara(1 - t);
            },
          });
          if (ev.critico) this.encolar({ texto: '¡Un golpe crítico!', duracion: 0.9, saltable: true });
          if (ev.eficacia > 1) this.encolar({ texto: '¡Es muy eficaz!', sonido: 'eficaz', duracion: 0.9, saltable: true });
          else if (ev.eficacia > 0 && ev.eficacia < 1) this.encolar({ texto: 'No es muy eficaz…', sonido: 'pocoEficaz', duracion: 0.9, saltable: true });
          break;
        }
        case 'falla':
          this.encolar({ texto: `¡${ev.nombre} ha fallado!`, sonido: 'fallo', duracion: 0.9, saltable: true });
          break;
        case 'sinEfecto':
          this.encolar({ texto: `No afecta a ${ev.nombre}…`, sonido: 'fallo', duracion: 0.9, saltable: true });
          break;
        case 'etapa': {
          const p = this.pos(ev.ref);
          const sube = ev.cambio > 0;
          this.encolar({
            texto: `¡${sube ? 'Sube' : 'Baja'} ${ESTADISTICA[ev.estadistica] ?? ev.estadistica} de ${ev.nombre}!`,
            duracion: 1,
            saltable: true,
            empezar: () => this.chispas(p, sube ? 0xffb347 : 0x6fa8ff, sube ? 1 : -1),
          });
          break;
        }
        case 'estado':
          this.encolar({ texto: `¡${ev.nombre} está ${ev.estado}!`, duracion: 1, saltable: true });
          break;
        case 'noSeMueve':
          this.encolar({ texto: `${ev.nombre} no se puede mover.`, duracion: 1, saltable: true });
          break;
        // El campo del gimnasio (autor, 2026-11-15), al empezar.
        case 'campo': {
          const c = ev.campo;
          if (c.clima === 'arena') this.encolar({ texto: '¡Una tormenta de arena azota el gimnasio!', duracion: 1.2, saltable: true });
          if (c.terreno === 'electrico') this.encolar({ texto: '¡El suelo se llena de electricidad! Los ataques eléctricos pegan más.', duracion: 1.4, saltable: true });
          if (c.vientoAFavor !== undefined) this.encolar({ texto: c.vientoAFavor === 1 ? '¡Sopla un viento a favor del rival! Sus criaturas van más rápido.' : '¡Sopla el viento a tu favor!', duracion: 1.4, saltable: true });
          if (c.agarre) this.encolar({ texto: '¡El luchador te ha hecho un agarre antes de empezar!', duracion: 1.2, saltable: true });
          break;
        }
        case 'confuso':
          this.encolar({ texto: ev.inicio ? `¡${ev.nombre} se ha quedado confusa!` : `${ev.nombre} está confusa…`, duracion: 1, saltable: true });
          break;
        case 'seHiere':
          this.encolar({ texto: `¡Está tan confusa que se ha hecho daño!`, duracion: 1, saltable: true });
          break;
        case 'desconfusa':
          this.encolar({ texto: `${ev.nombre} ya no está confusa.`, duracion: 1, saltable: true });
          break;
        case 'debilitado': {
          const p = this.pos(ev.ref);
          this.encolar({
            texto: `¡${ev.nombre} se ha debilitado!`,
            sonido: 'debilitado',
            duracion: 1.1,
            saltable: false,
            animar: (t) => {
              const l = this.luchadores[p]!;
              l.extra.set(0, -t * 0.5, 0);
              l.escala = 1 - t;
            },
          });
          break;
        }
        case 'desobedece': {
          const distraida = ['se pone a mirar las nubes', 'se rasca una oreja con mucha calma', 'bosteza y se sienta un momento', 'persigue una mosca'][(this.estado?.turno ?? 0) % 4];
          this.encolar({
            texto: ev.como === 'otro' ? `¡${ev.nombre} no te hace caso y hace lo que le da la gana!` : `${ev.nombre} no te hace caso: ${distraida}.`,
            duracion: 1.3,
            saltable: true,
          });
          break;
        }
        case 'retirada': {
          const lado = ev.ref.lado;
          const p = this.pos(ev.ref);
          this.encolar({
            texto: lado === 0 ? `¡${ev.nombre}, vuelve!` : `El entrenador retira a ${ev.nombre}.`,
            duracion: 0.8,
            saltable: false,
            animar: (t) => (this.luchadores[p]!.escala = 1 - t),
          });
          break;
        }
        case 'experiencia': {
          // Las del amigo no ganan experiencia (núcleo); por si acaso, no se cuentan.
          if (this.formato === 2 && ev.indice >= this.nPropias) break;
          this.encolar({ texto: `${ev.nombre} gana ${ev.cantidad} puntos de experiencia.`, duracion: 1.1, saltable: true });
          for (const s of ev.subidas) {
            this.encolar({ texto: `¡${ev.nombre} sube al nivel ${s.nivel}!`, sonido: 'nivel', duracion: 1.3, saltable: true, empezar: () => this.pintarSubida(ev.indice, s) });
            for (const m of s.aprendidos) this.encolar({ texto: `¡${ev.nombre} aprende ${DATOS.movimientos[m]?.nombre ?? m}!`, duracion: 1.2, saltable: true });
          }
          break;
        }
        case 'curacion':
          this.encolar({ texto: 'Recupera vida.', sonido: 'curar', duracion: 0.9, saltable: true, empezar: () => this.pintarVida(this.pos(ev.ref), ev.vida, ev.vidaMax) });
          break;
        case 'objetoUsado': {
          const o = DATOS.objetos[ev.objeto];
          const nombre = o?.nombre ?? ev.objeto;
          if (o?.tipo === 'captura') {
            // El cubo vuela hasta la salvaje, que desaparece dentro.
            this.encolar({ texto: `¡Lanzas un ${nombre}!`, sonido: 'lanzar', duracion: 0.9, saltable: false, animar: (t) => (this.luchadores[2]!.escala = 1 - t) });
          } else {
            this.encolar({ texto: ev.lado === 0 ? `Usas ${nombre}.` : `El entrenador usa ${nombre}.`, duracion: 1, saltable: true });
          }
          break;
        }
        case 'captura': {
          for (let i = 0; i < ev.sacudidas; i++) {
            this.encolar({ texto: '…', sonido: 'sacudida', duracion: 0.55, saltable: false, animar: (t) => this.luchadores[2]!.extra.set(Math.sin(t * Math.PI * 2) * 0.12, 0, 0) });
          }
          const nombre = this.activa(1) ? nombreDe(this.activa(1)!, DATOS) : 'la criatura';
          if (ev.exito) {
            const cabe = this.partida.equipo.length < MAX_EQUIPO;
            this.encolar({ texto: `¡Has capturado a ${nombre}!`, sonido: 'captura', duracion: 1.6, saltable: true });
            if (!cabe) this.encolar({ texto: 'Pero tu equipo está lleno: se queda en libertad.', duracion: 1.6, saltable: true });
          } else {
            this.encolar({ texto: '¡Oh, no! Se ha escapado.', sonido: 'escapa', duracion: 1.1, saltable: true, animar: (t) => (this.luchadores[2]!.escala = rebote(t)) });
          }
          break;
        }
        case 'huida':
          this.encolar({ texto: ev.exito ? '¡Escapas sin problemas!' : '¡No has podido escapar!', sonido: ev.exito ? 'huir' : 'atras', duracion: 1.1, saltable: true });
          break;
        case 'fin': {
          const premio = this.entrenador ? (this.partida.datos.entrenadores[this.entrenador]?.premio ?? 0) : 0;
          const textos: Record<string, string> = {
            victoria:
              this.formato === 2
                ? `¡Habéis vencido a los dos líderes! Te dan ${premio} de dinero.`
                : this.entrenador
                  ? `¡Has vencido al entrenador! Te da ${premio} de dinero.`
                  : '¡Has ganado!',
            derrota:
              perdidaPorDerrota(this.partida.dinero) > 0
                ? `No te quedan criaturas que puedan luchar… Vuelves corriendo al refugio y por el camino se te caen ${perdidaPorDerrota(this.partida.dinero)} de dinero.`
                : 'No te quedan criaturas que puedan luchar… Vuelves corriendo al refugio.',
          };
          if (textos[ev.resultado]) this.encolar({ texto: textos[ev.resultado], duracion: 1.8, saltable: true });
          break;
        }
        default:
          break;
      }
    }
  }

  // ——— La función: cola de pasos ———

  private encolar(p: Paso): void {
    this.cola.push(p);
  }

  pasoFijo(): void {
    if (this.fase === 'fuera') return;
    const confirmar = this.entrada.consumir('confirmar');
    const cancelar = this.entrada.consumir('cancelar');
    const numero = this.entrada.consumirNumero();
    if (this.fase === 'barra') {
      if (confirmar) this.pararBarra(true);
      else if (cancelar) this.pararBarra(false);
      return;
    }
    // La T abre o cierra la tabla de tipos; con ella abierta, Esc solo la cierra.
    const tabla = this.entrada.consumir('tabla');
    if (this.fase === 'menu' && tabla) this.alternarTipos();
    if (!this.panelTipos.hidden && (cancelar || this.fase !== 'menu')) {
      this.panelTipos.hidden = true;
      if (cancelar) return;
    }
    if (this.fase === 'menu') {
      const dir = this.entrada.pulsacion();
      if (dir && this.menuActual === 'mochila' && (dir === 'e' || dir === 'o')) {
        this.bolsillo = (this.bolsillo + (dir === 'e' ? 1 : -1) + BOLSILLOS_COMBATE.length) % BOLSILLOS_COMBATE.length;
        this.ctx.eventos.emit('sonido:tocar', { nombre: 'seleccion' });
        this.abrirMenu('mochila');
      } else if (dir) {
        // En rejilla de dos columnas (menú y ataques) o en lista (mochila y equipo).
        const columnas = this.menu.classList.contains('lista') ? 1 : 2;
        const paso = dir === 'e' ? 1 : dir === 'o' ? -1 : dir === 's' ? columnas : -columnas;
        if (columnas === 2 || dir === 'n' || dir === 's') {
          const n = this.eleccion + paso;
          if (n >= 0 && n < this.opciones.length && n !== this.eleccion) {
            this.eleccion = n;
            this.ctx.eventos.emit('sonido:tocar', { nombre: 'seleccion' });
          }
        }
        this.pintarMenu();
      }
      // Del 1 al 9: elige esa opción directamente (1 = la primera).
      if (numero !== null && numero < this.opciones.length) {
        this.eleccion = numero;
        this.pintarMenu();
      }
      const o = this.opciones[this.eleccion];
      if ((confirmar || (numero !== null && numero < this.opciones.length)) && o?.activa) {
        this.ctx.eventos.emit('sonido:tocar', { nombre: 'confirmar' });
        o.elegir();
      } else if (cancelar && this.menuActual !== 'raiz' && this.menuActual !== 'forzado') {
        this.ctx.eventos.emit('sonido:tocar', { nombre: 'atras' });
        this.abrirMenu(this.menuActual === 'objetivo' ? 'ataques' : 'raiz');
      }
      return;
    }
    // Una flecha pulsada mientras salen los mensajes no debe mover el menú al abrirse (se elegía
    // otra opción sin querer).
    this.entrada.pulsacion();
    // Esc mientras late: la evolución se para (como en el género, se puede no querer).
    if (cancelar && this.evolucion?.parable && !this.evolucion.cancelada && this.paso) {
      this.evolucion.cancelada = true;
      this.tPaso = this.paso.duracion;
    }
    if (confirmar && this.paso?.saltable && this.tPaso > (this.paso.minimo ?? 0.25)) this.tPaso = this.paso.duracion;
  }

  actualizar(dt: number): void {
    if (this.fase === 'fuera') return;
    this.reloj += dt;
    // Avanza la cola.
    if (!this.paso && this.cola.length) {
      this.paso = this.cola.shift()!;
      this.tPaso = 0;
      this.paso.empezar?.();
      if (this.paso.sonido) this.ctx.eventos.emit('sonido:tocar', { nombre: this.paso.sonido });
      if (this.paso.texto !== undefined) this.texto.textContent = this.paso.texto;
    }
    if (this.paso) {
      this.tPaso += dt;
      const t = Math.min(1, this.tPaso / this.paso.duracion);
      this.paso.animar?.(t);
      if (t >= 1) {
        for (const l of this.luchadores) if (l && l.escala > 0) l.extra.set(0, 0, 0);
        this.paso = null;
      }
    } else if (this.fase === 'barra' && this.lanzamiento) {
      this.lanzamiento.t += dt;
      this.flecha.style.left = `${this.posicionFlecha() * 100}%`;
    } else if (this.fase === 'mensajes') {
      if (this.estado?.fin) this.terminar();
      else if (this.estado?.pendientes.length) this.abrirMenu('forzado');
      // Dos contra dos con un amigo: si han caído todas las tuyas, tu amigo sigue solo (no decides nada).
      else if (!this.activa(0)) {
        this.texto.textContent = `${this.nombreAliado} sigue luchando...`;
        this.seguir(resolverTurno(this.estado!, { 0: [] }, DATOS));
      } else this.abrirMenu('raiz');
    }
    this.animarLuchadores();
    this.animarParticulas(dt);
    if (this.arena.visible) this.colocarCamara();
  }

  private abrirMenu(cual: Menu): void {
    this.fase = 'menu';
    this.menuActual = cual;
    const e = this.estado!;
    const c = this.activa(0)!;
    const nombre = nombreDe(c, DATOS);
    const boton = (titulo: string, detalle = '') => `<b>${titulo}</b>${detalle ? `<small>${detalle}</small>` : ''}`;
    let texto = `¿Qué hará ${nombre}?`;
    switch (cual) {
      case 'raiz':
        this.opciones = [
          { html: boton('Luchar'), activa: true, elegir: () => this.abrirMenu('ataques') },
          { html: boton('Mochila'), activa: true, elegir: () => this.abrirMenu('mochila') },
          { html: boton('Equipo'), activa: (this.formato === 2 ? this.nPropias : e.lados[0].equipo.length) > 1, elegir: () => this.abrirMenu('equipo') },
          { html: boton('Huir'), activa: e.salvaje, elegir: () => this.enviar({ tipo: 'huir' }) },
        ];
        break;
      case 'ataques': {
        // Sin pistas en los botones (al autor no le gustaron, 2026-11-15): la tabla, con la T.
        texto = `¿Qué hará ${nombre}? (T: tabla de tipos · X: volver)`;
        this.opciones = c.movimientos.map((m, indice) => {
          const mov = DATOS.movimientos[m.id];
          return {
            html: boton(mov.nombre, `${chipTipo(mov.tipo || 'comun')} PP ${m.pp}/${mov.pp}`),
            activa: m.pp > 0,
            elegir: () => {
              this.ultimoAtaque.set(c.uid, m.id);
              // En el dos contra dos, a cuál de las rivales (si quedan dos y el ataque es a una).
              const vivas = [0, 1].filter((h) => (this.activaEn(2 + h)?.vida ?? 0) > 0);
              if (this.formato === 2 && vivas.length === 2 && objetivoDe(mov) === 'uno') {
                this.movElegido = indice;
                this.abrirMenu('objetivo');
              } else this.enviar({ tipo: 'movimiento', indice, objetivo: { lado: 1, hueco: vivas[0] ?? 0 } });
            },
          };
        });
        break;
      }
      case 'mochila': {
        // Por bolsillos, como fuera del combate: ← y → cambian entre el botiquín y los cubos.
        const b = BOLSILLOS.find((x) => x.id === BOLSILLOS_COMBATE[this.bolsillo])!;
        texto = `◀ ${b.nombre} ▶ ¿Qué usas? (X: volver)`;
        const activo = e.lados[0].activos[0];
        this.opciones = this.objetosMochila().map((id) => {
          const n = this.partida.mochila[id];
          const o = DATOS.objetos[id];
          const captura = o.tipo === 'captura';
          return {
            html: boton(`${o.nombre} ×${n}`, o.descripcion),
            activa: captura ? e.salvaje : objetoUtil(c, id, DATOS),
            elegir: () => (captura ? this.abrirBarra(id) : this.enviar({ tipo: 'objeto', objeto: id, objetivo: activo })),
          };
        });
        if (!this.opciones.length) texto = `◀ ${b.nombre} ▶ ${b.vacio} (X: volver)`;
        break;
      }
      case 'objetivo': {
        texto = '¿A cuál atacas? (X: volver)';
        this.opciones = [0, 1].map((h) => {
          const r = this.activaEn(2 + h);
          return {
            html: boton(r ? nombreDe(r, DATOS) : '—', r ? `Vida ${r.vida}/${vidaMaxima(r, DATOS)}` : ''),
            activa: (r?.vida ?? 0) > 0,
            elegir: () => this.enviar({ tipo: 'movimiento', indice: this.movElegido, objetivo: { lado: 1, hueco: h } }),
          };
        });
        break;
      }
      case 'equipo':
      case 'forzado': {
        texto = cual === 'forzado' ? '¿A quién sacas?' : '¿A quién sacas? (X: volver)';
        const l = e.lados[0];
        // Con un amigo al lado, solo las tuyas (las suyas las saca él).
        const tuyas = l.equipo.map((x, indice) => ({ x, indice })).filter(({ indice }) => this.formato !== 2 || indice < this.nPropias);
        const hueco = e.pendientes[0] ?? { lado: 0 as const, hueco: 0 };
        this.opciones = tuyas.map(({ x, indice }) => ({
          html: boton(`${nombreDe(x, DATOS)} · Nv. ${x.nivel}`, `Vida ${x.vida}/${vidaMaxima(x, DATOS)}${l.activos.includes(indice) ? ' · en combate' : ''}`),
          activa: x.vida > 0 && !l.activos.includes(indice),
          elegir: () => (cual === 'forzado' ? this.seguir(reemplazar(this.estado!, hueco, indice, DATOS)) : this.enviar({ tipo: 'cambio', indice })),
        }));
        break;
      }
    }
    this.texto.textContent = texto;
    this.menu.hidden = false;
    this.menu.classList.toggle('lista', cual === 'mochila' || cual === 'equipo' || cual === 'forzado' || cual === 'objetivo');
    this.menu.replaceChildren();
    this.botones = this.opciones.map((o) => {
      const b = document.createElement('span');
      b.className = 'combate-ataque';
      b.classList.toggle('apagado', !o.activa);
      b.innerHTML = o.html;
      this.menu.append(b);
      return b;
    });
    // Se empieza en la primera opción que se puede elegir; en los ataques, en el último que usó.
    this.eleccion = Math.max(0, this.opciones.findIndex((o) => o.activa));
    const ultimo = cual === 'ataques' ? c.movimientos.findIndex((m) => m.id === this.ultimoAtaque.get(c.uid)) : -1;
    if (ultimo >= 0 && this.opciones[ultimo]?.activa) this.eleccion = ultimo;
    this.pintarMenu();
  }

  /** Abre o cierra la tabla de tipos para las dos criaturas que están luchando ahora. */
  private alternarTipos(): void {
    if (!this.panelTipos.hidden) {
      this.panelTipos.hidden = true;
      return;
    }
    const rival = this.activa(1);
    const propia = this.activa(0);
    if (!rival || !propia) return;
    const chip = chipTipo;
    const fila = (titulo: string, tipos: string[]) => (tipos.length ? `<p><b>${titulo}</b> ${tipos.map(chip).join(' ')}</p>` : '');
    const bloque = (quien: string, tipos: readonly string[]) => {
      const g = gruposContra(DATOS.tipos, tipos);
      return `<h3>${quien} ${tipos.map(chip).join(' ')}</h3>${fila('Le hacen mucho daño:', g.mucho)}${fila('Le hacen poco:', g.poco)}${fila('No le afectan:', g.nada)}`;
    };
    this.panelTipos.innerHTML = `${bloque(nombreDe(rival, DATOS), DATOS.especies[rival.especie].tipos)}${bloque(`Tu ${nombreDe(propia, DATOS)}`, DATOS.especies[propia.especie].tipos)}<p class="combate-tipos-ayuda">Ataques: ${iconoCategoria('fisico')} físico · ${iconoCategoria('magico')} mágico · ${iconoCategoria('estado')} de estado</p><p class="combate-tipos-ayuda">T o X: cerrar</p>`;
    this.panelTipos.hidden = false;
    this.ctx.eventos.emit('sonido:tocar', { nombre: 'seleccion' });
  }

  private pintarMenu(): void {
    this.botones.forEach((b, i) => b.classList.toggle('elegido', i === this.eleccion));
    // En los ataques, el texto de la izquierda explica el marcado (sin pistas en los botones).
    if (this.fase === 'menu' && this.menuActual === 'ataques') {
      const m = this.activa(0)?.movimientos[this.eleccion];
      const mov = m && DATOS.movimientos[m.id];
      if (m && mov) {
        // Como en el género: un cuadradito con la categoría y, debajo, potencia, PP y efectos.
        const d = describirMovimiento(mov, { variosRivales: (this.estado?.lados[1].activos.length ?? 1) > 1 });
        const cifras = [d.cifras, `PP ${m.pp}/${mov.pp}`].filter(Boolean).join(' · ');
        // La línea del efecto, siempre (vacía si no hay): sin ella, el título saltaba 12 px.
        this.texto.innerHTML =
          `<span class="combate-titulo-ataque">${iconoCategoria(mov.categoria)}<b>${mov.nombre}</b></span>` +
          `<small>${cifras}</small><small class="combate-efecto">${d.efecto || '&nbsp;'}</small><small class="combate-pista">T: tabla de tipos · X: volver</small>`;
      }
    }
  }

  private pintarFicha(p: number, deGolpe = false): void {
    const c = this.activaEn(p);
    const f = this.fichas[p]!;
    // Las fichas sin criatura (las de los huecos del dos contra dos, en el 1 contra 1), fuera.
    f.nombre.parentElement!.style.display = c ? '' : 'none';
    if (!c) return;
    this.pintarDueno(p, c.uid);
    f.nombre.textContent = nombreDe(c, DATOS);
    f.nivel.textContent = `Nv. ${c.nivel}`;
    f.chips.innerHTML = chipsTipos(DATOS.especies[c.especie].tipos);
    if (deGolpe) this.pintarVida(p, c.vida, vidaMaxima(c, DATOS), true);
  }

  /**
   * En el dos contra dos, de quién es cada una (probador, 2026-11-23: no se sabía). También al pintar
   * la ficha de golpe: en la primera imagen del combate, la del segundo rival salía sin ella
   * (probador, 2026-11-24).
   */
  private pintarDueno(p: number, uid: string): void {
    const f = this.fichas[p]!;
    const dueno = this.formato !== 2 ? '' : p === 0 ? 'Tuya' : p === 1 ? `De ${this.nombreAliado.replace(/^Tu /, 'tu ')}` : (this.nombresRival[this.duenoRival(uid)] ?? '');
    f.dueno.textContent = dueno;
    f.dueno.hidden = !dueno;
    f.dueno.classList.toggle('aliada', p === 1);
    f.dueno.classList.toggle('rival', p >= 2);
  }

  /**
   * La ficha de la que entra, con la vida que trae al entrar (la del evento). La del estado ya es la
   * del final del turno: al cambiar, salía con el golpe del rival ya restado (autor, 2026-11-19).
   */
  private pintarEntrada(p: number, ficha: FichaCombate): void {
    const f = this.fichas[p]!;
    f.nombre.parentElement!.style.display = '';
    this.pintarDueno(p, ficha.uid);
    f.nombre.textContent = ficha.nombre;
    f.nivel.textContent = `Nv. ${ficha.nivel}`;
    f.chips.innerHTML = chipsTipos(DATOS.especies[ficha.especie].tipos);
    this.pintarVida(p, ficha.vida, ficha.vidaMax, true);
  }

  /** La subida de nivel de la que está en combate, con el nivel y la vida de esa subida (no los del final). */
  private pintarSubida(indice: number, s: SubidaNivel): void {
    if (this.estado?.lados[0].activos[0] !== indice) return;
    this.fichas[0].nivel.textContent = `Nv. ${s.nivel}`;
    this.pintarVida(0, s.vida, s.vidaMax, true);
  }

  private pintarVida(p: number, vida: number, max: number, deGolpe = false): void {
    const f = this.fichas[p]!;
    const parte = Math.max(0, vida / max);
    f.relleno.style.transition = deGolpe ? 'none' : '';
    f.relleno.style.width = `${parte * 100}%`;
    f.relleno.style.background = parte > 0.5 ? '#4cc26e' : parte > 0.2 ? '#f2c14e' : '#ef5b4f';
    if (f.numeros) f.numeros.textContent = `${Math.max(0, vida)} / ${max}`;
    this.vidaVista[p] = vida;
  }

  // ——— Animación ———

  /**
   * La salida de una criatura, con t de 0 a 1: el cubo cae girando (hasta 0,36), rebota una vez
   * (hasta 0,6), tiembla un instante y se abre en un destello (desde 0,66) del que sale la
   * criatura con un rebote.
   */
  private animarSalida(p: number, t: number, cubo: Group, destello: Mesh, abierto: { chispas: boolean }): void {
    const suelo = RADIO_CUBO * 1.05;
    const l = this.luchadores[p]!;
    girarCubo(cubo, this.reloj * (t < 0.6 ? 3 : 1));
    if (t < 0.36) {
      const u = t / 0.36;
      cubo.position.y = suelo + (CAIDA - suelo) * (1 - u * u);
    } else if (t < 0.6) {
      const u = (t - 0.36) / 0.24;
      cubo.position.y = suelo + REBOTE * Math.sin(u * Math.PI);
    } else {
      cubo.position.y = suelo;
      cubo.rotation.z = t < 0.66 ? Math.sin(t * 120) * 0.12 : 0;
    }
    const abre = (t - 0.66) / 0.34;
    if (abre >= 0 && !abierto.chispas) {
      abierto.chispas = true;
      this.chispas(p, 0xffe39a);
    }
    if (abre >= 0) {
      cubo.scale.setScalar(Math.max(0, 1 - abre * 5));
      destello.visible = abre < 0.6;
      destello.scale.setScalar(0.3 + abre * 3.2);
      (destello.material as MeshBasicNodeMaterial).opacity = Math.max(0, 1 - abre / 0.6);
      this.velo.style.cssText = `opacity:${Math.max(0, 0.35 - abre) * 1.2};background:#fffbe8`;
      l.visible = true;
      l.escala = rebote(Math.min(1, abre / 0.7));
    }
    if (t >= 1) {
      cubo.removeFromParent();
      destello.removeFromParent();
      (destello.material as Material).dispose();
      this.velo.style.cssText = 'opacity:0';
    }
  }

  /**
   * La evolución, en la arena (autor, 2026-11-19; propia, no la del género; revisada con el probador):
   * - de noche, el Sello se dibuja en el suelo: los trece círculos del cubo de Metatrón, que se tocan,
   *   y después las líneas que unen sus centros, del color del tipo de la forma nueva;
   * - un círculo de luz bajo la criatura, para que se lea aunque sea oscura, y motas que suben;
   * - la criatura, tal cual, crece y mengua cada vez más deprisa, y cada vez que mengua una bola de
   *   luz blanca la tapa (autor, 2026-11-20: sin silueta); al final se queda dentro;
   * - con un fogonazo blanco, la bola y el Sello se rompen hacia fuera y queda la nueva, que se ve
   *   un rato antes de poder pasar el mensaje.
   * Hasta el destello, Esc la para.
   */
  private encolarEvolucion(uid: string, a: string, op: { desdeNegro?: boolean } = {}): void {
    const nueva = this.figurasEvolucion.get(`${uid}>${a}`);
    const vieja = this.figuras.get(uid);
    const especieNueva = DATOS.especies[a];
    if (!nueva || !vieja || !especieNueva) return;
    const equipo = () => this.estado!.lados[0].equipo;
    const nombre = nombreDe(equipo().find((c) => c.uid === uid)!, DATOS);
    const color = new Color(TIPOS.find((t) => t.id === especieNueva.tipos[0])?.color ?? 0xfff4dc);
    const grupo = new Group();
    grupo.position.copy(CENTRO_EVOLUCION);
    const nuevos: { dispose(): void }[] = [];
    const material = <T extends { dispose(): void; toneMapped: boolean }>(m: T): T => {
      m.toneMapped = false;
      nuevos.push(m);
      return m;
    };
    // Sobre el blanco roto: el Sello, en claro sobre la plataforma.
    const matCirculo = material(new MeshBasicNodeMaterial({ color: '#fffaf0', transparent: true, depthWrite: false }));
    const matMota = material(new MeshBasicNodeMaterial({ color, transparent: true, depthWrite: false }));
    // La bola de luz: blanca en el centro y del color del tipo hacia el borde, para que se lea
    // también sobre el fondo blanco roto.
    const matBola = material(new MeshBasicNodeMaterial({ transparent: true, opacity: 0 }));
    const borde = dot(normalView, positionViewDirection).abs().oneMinus();
    matBola.colorNode = mix(vec3(1, 1, 1), vec3(color.r, color.g, color.b), pow(borde, 1.6));
    const matSuelo = material(new MeshBasicNodeMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false }));
    const matLineas = material(new LineBasicNodeMaterial({ color: '#fffaf0', transparent: true, opacity: 0, depthWrite: false }));
    // El fogonazo, con luz que se suma (no un disco plano), y una onda que recorre el suelo.
    const matDestello = material(new MeshBasicNodeMaterial({ color: color.clone().lerp(new Color('#ffffff'), 0.5), transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }));
    const matOnda = material(new MeshBasicNodeMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false, side: DoubleSide }));
    const anillo = new RingGeometry(0.24, 0.285, 48);
    const disco = new CircleGeometry(1.35 * ESCALA_SELLO, 48);
    const esfera = new SphereGeometry(0.5, 40, 24);
    const mota = new SphereGeometry(0.035, 6, 4);
    // Las líneas del cubo de Metatrón: todos los centros unidos entre sí.
    const puntos: number[] = [];
    CIRCULOS_SELLO.forEach(([x1, z1], i) => CIRCULOS_SELLO.slice(i + 1).forEach(([x2, z2]) => puntos.push(x1, 0.03, z1, x2, 0.03, z2)));
    const geoLineas = new BufferGeometry();
    geoLineas.setAttribute('position', new Float32BufferAttribute(puntos, 3));
    const geoOnda = new RingGeometry(0.85, 1, 72);
    nuevos.push(anillo, disco, esfera, mota, geoLineas, geoOnda);
    // La isla de su tipo y lo que cae alrededor (escenario-evolucion.ts; autor, 2026-11-19).
    const semilla = [...`${uid}>${a}`].reduce((h, letra) => (Math.imul(h, 31) + letra.charCodeAt(0)) >>> 0, 7);
    const escenario = crearEscenarioEvolucion(this.tipoEvolucion ?? especieNueva.tipos[0], semilla, {
      sonar: (n) => this.ctx.eventos.emit('sonido:tocar', { nombre: n }),
      fondo: (c) => {
        // Solo mientras se ve la evolución: al volver a la arena, el fondo es el suyo.
        if (this.evolucion) this.ctx.escena.background = c ?? FONDO_EVOLUCION;
      },
    });
    nuevos.push(escenario);
    const caer = (tiempo: number) => escenario.animar(tiempo);
    const suelo = new Mesh(disco, matSuelo);
    suelo.rotation.x = -Math.PI / 2;
    suelo.position.y = 0.01;
    const lineas = new LineSegments(geoLineas, matLineas);
    const sello = new Group();
    sello.scale.setScalar(ESCALA_SELLO);
    sello.add(lineas);
    const circulos = CIRCULOS_SELLO.map(([x, z]) => {
      const m = new Mesh(anillo, matCirculo);
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.02, z);
      m.scale.setScalar(0);
      sello.add(m);
      return m;
    });
    const motas = Array.from({ length: 26 }, (_, i) => {
      const m = new Mesh(mota, matMota);
      m.userData = { a: (i / 26) * Math.PI * 2, r: 0.5 + (i % 5) * 0.17, fase: (i * 0.37) % 1 };
      m.visible = false;
      grupo.add(m);
      return m;
    });
    const destello = new Mesh(esfera, matDestello);
    destello.visible = false;
    const onda = new Mesh(geoOnda, matOnda);
    onda.rotation.x = -Math.PI / 2;
    onda.position.y = 0.04;
    onda.visible = false;
    grupo.add(onda);
    grupo.add(escenario.grupo, suelo, sello, destello);
    const bola = new Mesh(esfera, matBola);
    bola.visible = false;
    let bolaFinal = 1;
    // Medida de la vieja tal como está en la isla: la altura de su centro y el radio que la tapa.
    let centroVieja = 0.5;
    let radioVieja = 0.5;
    const medirVieja = () => {
      const padre = vieja.parent;
      vieja.removeFromParent();
      vieja.position.set(0, 0, 0);
      vieja.scale.setScalar(1);
      vieja.updateMatrixWorld(true);
      const caja = new Box3().setFromObject(vieja);
      const lado = caja.getSize(new Vector3());
      centroVieja = caja.getCenter(new Vector3()).y;
      radioVieja = 0.5 * Math.hypot(Math.max(lado.x, lado.z), lado.y);
      padre?.add(vieja);
    };
    /** La vieja a escala s de su tamaño, con el centro quieto (si mengua, no se hunde en la isla). */
    const escalarVieja = (s: number) => {
      vieja.scale.setScalar(k * s);
      vieja.position.y = Math.max(0, centroVieja * k * (1 - s));
    };
    const motasSuben = (tiempo: number) => {
      for (const m of motas) {
        const { a: ang, r, fase } = m.userData as { a: number; r: number; fase: number };
        const k = (tiempo * 0.45 + fase) % 1;
        m.visible = true;
        m.position.set(Math.cos(ang + tiempo * 0.8) * r, k * 2.2, Math.sin(ang + tiempo * 0.8) * r);
        m.scale.setScalar(1 - k);
      }
    };
    // Las pequeñas se perdían en la isla (probador: Shimari, 70 px de 800): en la evolución se ven
    // al menos de 1,15 de alto, sin cambiar la proporción entre las dos formas.
    const k = Math.min(1.7, Math.max(1, 1.15 / Math.max(this.altos.get(uid) ?? 1, nueva.alto)));
    const respirar = (f: Group) => f.scale.set(k, k * (1 + Math.sin(this.reloj * 2.4) * 0.025), k);
    const fichas = () => this.fichas.map((f) => f.nombre.parentElement!);
    const cancelada = () => this.evolucion?.cancelada ?? false;
    this.encolar({
      texto: `¡El Sello reacciona a ${nombre}! (X: pararlo)`,
      sonido: 'salida',
      duracion: 2.2,
      saltable: false,
      empezar: () => {
        this.evolucion = { parable: true, cancelada: false };
        // Fuera la rival y las fichas; la que evoluciona, sola en el centro y de cara.
        for (const l of this.luchadores) l?.raiz.removeFromParent();
        this.luchadores = [null, null, null, null];
        for (const f of fichas()) f.style.visibility = 'hidden';
        this.ctx.escena.background = FONDO_EVOLUCION;
        for (const o of this.arena.children) {
          if (o.visible) {
            o.visible = false;
            this.apagadasEvolucion.push(o);
          }
        }
        vieja.position.set(0, 0, 0);
        vieja.rotation.y = 0.35;
        vieja.scale.setScalar(k);
        vieja.visible = true;
        grupo.add(vieja);
        this.arena.add(grupo);
      },
      animar: (t) => {
        // Los círculos, uno detrás de otro; después, las líneas que los unen.
        circulos.forEach((c, i) => c.scale.setScalar(Math.min(1, Math.max(0, t * 20 - i) / 1.5)));
        matLineas.opacity = Math.max(0, (t - 0.6) / 0.4) * 0.8;
        matSuelo.opacity = Math.min(1, t * 2) * 0.18;
        sello.rotation.y = this.reloj * 0.25;
        respirar(vieja);
        motasSuben(this.reloj);
        caer(this.reloj);
        if (op.desdeNegro) this.velo.style.cssText = `opacity:${Math.max(0, 1 - (t * 2.2) / FUNDIDO)};background:#1d1720`;
      },
    });
    this.encolar({
      duracion: 3.8,
      saltable: false,
      empezar: () => {
        // Parada durante el Sello: se salta el latido.
        if (cancelada()) {
          this.tPaso = this.paso!.duracion;
          return;
        }
        medirVieja();
        vieja.rotation.y = 0.35;
        bola.position.set(0, centroVieja * k, 0);
        grupo.add(bola);
      },
      animar: (t) => {
        caer(this.reloj);
        if (cancelada()) {
          bola.visible = false;
          vieja.visible = true;
          respirar(vieja);
          vieja.position.y = 0;
          return;
        }
        // Crece y mengua cada vez más deprisa (cinco veces); cada vez que mengua, la bola la tapa.
        // Desde la quinta se queda dentro y la bola crece hasta el destello.
        const ciclos = Math.min(4.5, 1.2 * t + 4.5 * t * t);
        const kk = (1 + Math.cos(Math.PI * 2 * ciclos)) / 2;
        const s = 0.35 + 0.73 * kk;
        escalarVieja(s);
        const o = Math.min(1, Math.max(0, (0.55 - kk) / 0.4));
        matBola.opacity = o * o * (3 - 2 * o);
        bola.visible = matBola.opacity > 0.01;
        const fin = ciclos >= 4.5 ? Math.min(1, (t - 0.8755) / 0.1245) : 0;
        bola.scale.setScalar(2 * radioVieja * k * s * 1.2 * (1 + fin * 0.35 + Math.sin(this.reloj * 30) * 0.03 * fin));
        sello.rotation.y = this.reloj * (0.25 + t * 1.4);
        matSuelo.opacity = 0.18 + t * 0.14;
        motasSuben(this.reloj * (1 + t * 2));
      },
    });
    this.encolar({
      duracion: 3.6,
      saltable: true,
      // La forma nueva se ve un rato antes de poder pasar el mensaje (probador: con Enter no se veía;
      // y el remate se quedaba corto, 2026-11-19).
      minimo: 2.4,
      empezar: () => {
        const ev = this.evolucion!;
        ev.parable = false;
        if (ev.cancelada) {
          bola.visible = false;
          vieja.visible = true;
          vieja.position.y = 0;
          vieja.scale.setScalar(k);
          this.texto.textContent = `${nombre} se aparta del Sello y sigue igual.`;
          this.ctx.eventos.emit('sonido:tocar', { nombre: 'atras' });
          return;
        }
        // La nueva sale de dentro de la bola.
        vieja.removeFromParent();
        nueva.figura.position.set(0, 0, 0);
        nueva.figura.rotation.y = 0.35;
        nueva.figura.scale.setScalar(0);
        nueva.figura.visible = true;
        grupo.add(nueva.figura);
        bola.visible = true;
        matBola.opacity = 1;
        bolaFinal = bola.scale.x;
        this.figuras.set(uid, nueva.figura);
        this.altos.set(uid, nueva.alto);
        // La criatura cambia de verdad: la que vuelve a la isla ya es la nueva.
        const lista = equipo();
        const i = lista.findIndex((c) => c.uid === uid);
        lista[i] = evolucionar(lista[i]!, a, DATOS);
        destello.visible = true;
        destello.position.set(0, nueva.alto * k * 0.5, 0);
        this.texto.textContent = `¡${nombre} es ahora ${especieNueva.nombre}!`;
        this.ctx.eventos.emit('sonido:tocar', { nombre: 'captura' });
      },
      animar: (t) => {
        caer(this.reloj);
        if (this.evolucion?.cancelada) {
          // Sin congelarse: las motas siguen y el Sello se apaga despacio.
          circulos.forEach((c) => c.scale.setScalar(Math.max(0, 1 - t * 1.5)));
          matLineas.opacity = Math.max(0, 0.8 - t);
          matSuelo.opacity = Math.max(0, 0.18 - t * 0.3);
          respirar(vieja);
          motasSuben(this.reloj);
          return;
        }
        // Fogonazo blanco: la bola revienta y el Sello se rompe hacia fuera.
        const p = Math.min(1, t * 2.5);
        bola.visible = p < 1;
        bola.scale.setScalar(bolaFinal * (1 + p * 1.6));
        matBola.opacity = 1 - p;
        destello.scale.setScalar(0.5 + p * 3.2);
        matDestello.opacity = 0.55 * (1 - p);
        onda.visible = p < 1;
        onda.scale.setScalar(0.3 + p * 2.6);
        matOnda.opacity = 0.8 * (1 - p);
        this.velo.style.cssText = `opacity:${Math.max(0, 0.9 - t * 4)};background:#ffffff`;
        circulos.forEach((c, i) => {
          const [x, z] = CIRCULOS_SELLO[i]!;
          c.position.set(x * (1 + p * 3), 0.02 + p * 0.6, z * (1 + p * 3));
          c.scale.setScalar(Math.max(0, 1 - p));
        });
        matLineas.opacity = Math.max(0, 0.8 * (1 - p * 2));
        matSuelo.opacity = 0.32 * (1 - t * 0.5);
        nueva.figura.scale.setScalar(k * rebote(Math.min(1, t * 1.8)));
        if (t > 0.6) respirar(nueva.figura);
        for (const m of motas) m.visible = false;
      },
    });
    this.encolar({
      duracion: 0.3,
      saltable: false,
      empezar: () => {
        // La escena se queda hasta el fundido (se quita al cerrar la arena); lo apagado se enciende al
        // abrirla otra vez.
        this.velo.style.cssText = 'opacity:0';
        this.restosEvolucion.push({ grupo, nuevos });
        this.evolucion = null;
      },
    });
  }

  private animarLuchadores(): void {
    for (const [p, l] of this.luchadores.entries()) {
      if (!l) continue;
      const s = this.sitio(p);
      const respira = 1 + Math.sin(this.reloj * 2.4 + p * 1.7) * 0.025;
      l.raiz.visible = l.visible && l.escala > 0.01;
      l.raiz.position.set(s.x + l.ajuste.x + l.extra.x, s.y + l.extra.y, s.z + l.ajuste.z + l.extra.z);
      l.raiz.rotation.y = l.giro;
      l.raiz.scale.set(l.escala, l.escala * respira, l.escala);
    }
  }

  /** Chispas del color del ataque sobre una criatura; `sube` 1 o -1 para las de subir o bajar. */
  private chispas(p: number, color: number, sube = 0): void {
    const mat = new MeshBasicNodeMaterial({ color, transparent: true });
    mat.toneMapped = false;
    this.materiales.push(mat);
    const centro = this.sitio(p).clone().add(new Vector3(0, (this.luchadores[p]?.alto ?? TAMANO[(p >> 1) as 0 | 1]) * 0.5, 0));
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const malla = new Mesh(new SphereGeometry(0.06 + (i % 3) * 0.02, 6, 4), mat);
      malla.position.copy(centro);
      const vel = sube ? new Vector3(Math.cos(a) * 0.4, sube * (1.2 + (i % 4) * 0.2), Math.sin(a) * 0.4) : new Vector3(Math.cos(a) * 2.2, 0.8 + Math.sin(a * 3) * 1.2, Math.sin(a) * 2.2);
      this.arena.add(malla);
      this.particulas.push({ malla, vel, vida: 0.6 });
    }
  }

  private animarParticulas(dt: number): void {
    for (const p of this.particulas) {
      p.vida -= dt;
      p.malla.position.addScaledVector(p.vel, dt);
      p.vel.y -= dt * 2;
      p.malla.scale.setScalar(Math.max(0, p.vida / 0.6));
    }
    const muertas = this.particulas.filter((p) => p.vida <= 0);
    for (const p of muertas) {
      p.malla.removeFromParent();
      p.malla.geometry.dispose();
    }
    this.particulas = this.particulas.filter((p) => p.vida > 0);
  }

  redimensionar(): void {
    if (this.arena.visible) this.ajustarFondo();
  }

  dispose(): void {
    this.raiz.remove();
    this.arena.removeFromParent();
    for (const m of this.materiales) m.dispose();
    this.fondoProvisional.dispose();
    for (const t of this.salas.values()) t.dispose();
    for (const t of this.fondos.values()) t.dispose();
  }
}

/** Sale con un pequeño rebote, como al lanzarla. */
function rebote(t: number): number {
  const s = 1.70158 * 1.4;
  const u = t - 1;
  return 1 + (s + 1) * u * u * u + s * u * u;
}

/** Fondo provisional por código, hasta que llegue el pintado: cielo de tarde, volcanes, mar y jable. */
function fondoProvisional(): Texture {
  const lienzo = document.createElement('canvas');
  lienzo.width = 1024;
  lienzo.height = 576;
  const g = lienzo.getContext('2d')!;
  const cielo = g.createLinearGradient(0, 0, 0, 300);
  cielo.addColorStop(0, '#f6c79a');
  cielo.addColorStop(1, '#fbe3c4');
  g.fillStyle = cielo;
  g.fillRect(0, 0, 1024, 300);
  g.fillStyle = '#c9794b';
  for (const [x, w, h] of [[120, 300, 120], [330, 220, 80], [760, 280, 95]]) {
    g.beginPath();
    g.moveTo(x - w / 2, 230);
    g.lineTo(x - w * 0.12, 230 - h);
    g.lineTo(x + w * 0.12, 230 - h);
    g.lineTo(x + w / 2, 230);
    g.fill();
  }
  g.fillStyle = '#7fcfc4';
  g.fillRect(0, 222, 1024, 34);
  const suelo = g.createLinearGradient(0, 250, 0, 576);
  suelo.addColorStop(0, '#e8d3a6');
  suelo.addColorStop(1, '#f1dfb8');
  g.fillStyle = suelo;
  g.fillRect(0, 250, 1024, 326);
  const t = new CanvasTexture(lienzo);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Mezcla dos colores (0xRRGGBB) y los devuelve en CSS: `t` = 0, el primero; 1, el segundo. */
function mezclaCss(a: number, b: number, t: number): string {
  const c = (d: number) => Math.round(((a >> d) & 255) * (1 - t) + ((b >> d) & 255) * t);
  return `rgb(${c(16)}, ${c(8)}, ${c(0)})`;
}

/**
 * Una sala de gimnasio pintada por código, con el color de su tipo: pared con pilastras y dos
 * estandartes arriba (el tercio del horizonte) y, abajo, el suelo de tablas casi liso con el círculo
 * del combate, donde van las criaturas. Como los fondos pintados: 16:9 y sin nada en el centro.
 */
function fondoDeSala(color: number): Texture {
  const W = 1024;
  const H = 576;
  const SUELO = 300;
  const lienzo = document.createElement('canvas');
  lienzo.width = W;
  lienzo.height = H;
  const g = lienzo.getContext('2d')!;
  const crema = 0xf3e6d0;
  // La pared, del crema al tono del tipo, más oscura abajo.
  const pared = g.createLinearGradient(0, 0, 0, SUELO);
  pared.addColorStop(0, mezclaCss(crema, color, 0.18));
  pared.addColorStop(1, mezclaCss(crema, color, 0.34));
  g.fillStyle = pared;
  g.fillRect(0, 0, W, SUELO);
  // Pilastras.
  for (let x = 40; x < W; x += 188) {
    g.fillStyle = mezclaCss(crema, 0xffffff, 0.45);
    g.fillRect(x, 0, 34, SUELO);
    g.fillStyle = 'rgba(60, 40, 30, 0.12)';
    g.fillRect(x + 34, 0, 8, SUELO);
  }
  // Dos estandartes del color del tipo, con un círculo claro.
  for (const cx of [300, 724]) {
    g.fillStyle = mezclaCss(color, 0x000000, 0.12);
    g.beginPath();
    g.moveTo(cx - 52, 24);
    g.lineTo(cx + 52, 24);
    g.lineTo(cx + 52, 196);
    g.lineTo(cx, 226);
    g.lineTo(cx - 52, 196);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(255, 248, 235, 0.85)';
    g.beginPath();
    g.arc(cx, 112, 30, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = mezclaCss(color, 0x000000, 0.12);
    g.beginPath();
    g.arc(cx, 112, 16, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(70, 45, 30, 0.55)';
    g.fillRect(cx - 62, 18, 124, 8);
  }
  // El zócalo.
  g.fillStyle = mezclaCss(color, 0x2a1d18, 0.6);
  g.fillRect(0, SUELO - 16, W, 16);
  // El suelo de tablas, hacia un punto de fuga en el centro.
  const suelo = g.createLinearGradient(0, SUELO, 0, H);
  suelo.addColorStop(0, '#cfae80');
  suelo.addColorStop(1, '#e6cda2');
  g.fillStyle = suelo;
  g.fillRect(0, SUELO, W, H - SUELO);
  g.strokeStyle = 'rgba(110, 75, 45, 0.16)';
  g.lineWidth = 2;
  for (let i = -8; i <= 8; i++) {
    g.beginPath();
    g.moveTo(W / 2 + i * 40, SUELO);
    g.lineTo(W / 2 + i * 150, H);
    g.stroke();
  }
  // El círculo del combate, pintado en el suelo.
  g.strokeStyle = mezclaCss(color, 0xffffff, 0.15);
  g.globalAlpha = 0.55;
  g.lineWidth = 6;
  g.beginPath();
  g.ellipse(W / 2, 455, 400, 78, 0, 0, Math.PI * 2);
  g.stroke();
  g.globalAlpha = 1;
  const t = new CanvasTexture(lienzo);
  t.colorSpace = SRGBColorSpace;
  return t;
}
