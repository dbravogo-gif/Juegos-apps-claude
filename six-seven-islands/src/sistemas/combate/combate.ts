// Subsistema «combate»: el combate por turnos, visto como en los juegos del género: en diagonal,
// tu criatura delante a la izquierda, de espaldas, y la rival al fondo a la derecha, mirándote
// (autor, 2026-11-10). Es una arena aparte, lejos de la isla, con un fondo pintado detrás, dos
// plataformas y las criaturas de Meshy. Las reglas son las del núcleo (src/core/combate.ts); los
// datos son provisionales (src/data/combate-prueba.ts). Lo lanzan los encuentros en la hierba y el
// primer entrenador. Lucha el equipo de «partida», y al acabar se le devuelve con su vida y su
// experiencia. Con teclado: flechas para elegir, E, Enter o Espacio para confirmar y Esc para volver.

import {
  AdditiveBlending,
  CanvasTexture,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicNodeMaterial,
  SRGBColorSpace,
  SphereGeometry,
  TextureLoader,
  Vector3,
  type Color,
  type Fog,
  type Material,
  type Texture,
} from 'three/webgpu';
import { iniciarCombate, reemplazar, resolverTurno, type Accion, type EstadoCombate, type Evento, type Resultado } from '../../core/combate';
import { crearCriatura, nombreDe, objetoUtil } from '../../core/criatura';
import type { Criatura } from '../../core/modelo';
import { CALIDAD_ZONA, MEDIA_BLANCA, MEDIA_VERDE, zonaBarra } from '../../core/captura';
import { crearRng } from '../../core/rng';
import { vidaMaxima } from '../../core/estadisticas';
import { MaterialDiorama } from '../../arte/material';
import { figuraCriatura } from '../../arte/criaturas3d';
import { RADIO_CUBO, figuraCubo, girarCubo } from '../../arte/cubos';
import { attribute } from 'three/tsl';
import { DATOS_COMBATE_PRUEBA, ENTRENADOR_PRUEBA, ESPECIE_INICIAL, MODELO_DE, RIVAL_DE } from '../../data/combate-prueba';
import { TIPOS } from '../../data/tipos';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Entrada } from '../entrada/entrada';
import type { Partida } from '../partida/partida';
import type { Render } from '../render/render';

const DATOS = DATOS_COMBATE_PRUEBA;
/** La arena, lejos de la isla y de los interiores. */
const ARENA = new Vector3(600, 0, 600);
/** Dónde va cada criatura, respecto a la arena: la tuya delante a la izquierda, la rival al fondo. */
const SITIO: [Vector3, Vector3] = [new Vector3(-2.05, 0, 1.55), new Vector3(2.35, 0, -1.85)];
const TAMANO: [number, number] = [1.0, 0.95];
/**
 * Hacia dónde miran: la una a la otra, sobre la diagonal, con la tuya un poco más de espaldas y la
 * rival un poco más de frente para que se le vea la cara (autor, 2026-11-10: más en las esquinas y
 * más giradas).
 */
const GIRO: [number, number] = [2.4, -0.75];
const CAMARA = new Vector3(0.1, 2.7, 8.6);
const MIRA = new Vector3(0.15, 0.4, 0);
/** El cubo de captura con que sale cada criatura (por ahora, el blanco, el básico). */
const CUBO: [number, number] = [0, 0];
/** Desde qué altura cae el cubo y cuánto sube al rebotar. */
const CAIDA = 2.6;
const REBOTE = 0.5;
/** Segundos de cada fundido, al entrar y al salir. */
const FUNDIDO = 0.55;
/** Segundos que tarda la flecha de la barra de captura en cruzarla de lado a lado. */
const BARRIDO = 1.1;
/** Cuántas criaturas caben en el equipo. */
const MAX_EQUIPO = 6;

const NOMBRE_TIPO = new Map<string, string>(TIPOS.map((t) => [t.id, t.nombre]));
const COLOR_TIPO = new Map<string, number>(TIPOS.map((t) => [t.id, t.color]));
const ESTADISTICA: Record<string, string> = { fuerza: 'la fuerza', escudo: 'el escudo', magia: 'la magia', resMagica: 'la resistencia mágica', celeridad: 'la celeridad' };

type Fase = 'fuera' | 'entrando' | 'mensajes' | 'menu' | 'barra' | 'saliendo';
/** Qué menú está abierto: el principal, los ataques, la mochila, el equipo o el cambio obligado. */
type Menu = 'raiz' | 'ataques' | 'mochila' | 'equipo' | 'forzado';

interface Opcion {
  html: string;
  activa: boolean;
  elegir: () => void;
}

/** Un paso de la función: un mensaje, una animación o las dos cosas a la vez. */
interface Paso {
  texto?: string;
  duracion: number;
  /** Se puede adelantar pulsando. */
  saltable: boolean;
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
  private fondoPintado: Texture | null = null;
  private guardado: { fondo: Color | Texture | null; niebla: Fog | null } | null = null;

  private fase: Fase = 'fuera';
  private reloj = 0;
  private estado: EstadoCombate | null = null;
  private luchadores: (Luchador | null)[] = [null, null];
  private cola: Paso[] = [];
  private paso: Paso | null = null;
  private tPaso = 0;
  private eleccion = 0;
  private menuActual: Menu = 'raiz';
  private opciones: Opcion[] = [];
  /** La figura de cada criatura del combate, por su uid: se cargan todas al empezar. */
  private figuras = new Map<string, Group>();
  /** Contra quién se lucha: el id del entrenador, o null si es salvaje. */
  private entrenador: string | null = null;
  /** La barra de captura (F08): qué cubo se lanza y cuánto lleva la flecha moviéndose. */
  private barra!: HTMLDivElement;
  private flecha!: HTMLElement;
  private lanzamiento: { objeto: string; t: number } | null = null;
  private particulas: { malla: Mesh; vel: Vector3; vida: number }[] = [];
  private vidaVista: [number, number] = [0, 0];

  // Interfaz.
  private raiz!: HTMLDivElement;
  private texto!: HTMLParagraphElement;
  private menu!: HTMLDivElement;
  private botones: HTMLSpanElement[] = [];
  private fichas: { nombre: HTMLElement; nivel: HTMLElement; relleno: HTMLElement; numeros: HTMLElement | null }[] = [];
  private velo!: HTMLDivElement;

  init(ctx: Ctx): void {
    this.ctx = ctx;
    this.partida = ctx.get<Partida>('partida');
    this.entrada = ctx.get<Entrada>('entrada');
    this.render = ctx.get<Render>('render');
    this.montarArena();
    this.montarInterfaz();
    this.fondoProvisional = fondoProvisional();
    // Si el autor ya ha subido el fondo pintado, se usa; si no, el provisional hecho por código.
    new TextureLoader().load(
      `${import.meta.env.BASE_URL}fondos/combate-exterior.webp`,
      (t) => {
        t.colorSpace = SRGBColorSpace;
        this.fondoPintado = t;
      },
      undefined,
      () => undefined,
    );
    ctx.eventos.on('dialogo:cerrar', ({ guionId }) => {
      const inicial = this.partida.estado.inicial;
      if (guionId === ENTRENADOR_PRUEBA && inicial && !this.partida.vencidos.includes(guionId)) {
        // Provisional: el primer entrenador saca la inicial que pierde contra la tuya.
        const rng = crearRng(`rival-${guionId}`);
        void this.empezar([crearCriatura(DATOS, ESPECIE_INICIAL[RIVAL_DE[inicial] ?? 'roca'], 5, rng)], guionId);
      }
    });
    ctx.eventos.on('encuentro:inicio', ({ salvajes }) => void this.empezar(salvajes as Criatura[], null));
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
    for (const [i, s] of SITIO.entries()) {
      const r = i === 0 ? 1.15 : 1.0;
      const losa = new Mesh(new CylinderGeometry(r, r * 1.04, 0.14, 40), [canto, arriba, canto]);
      losa.position.set(s.x, -0.07, s.z);
      losa.receiveShadow = true;
      this.arena.add(losa);
    }
    this.ctx.escena.add(this.arena);
  }

  private montarInterfaz(): void {
    const raiz = document.createElement('div');
    raiz.className = 'combate';
    raiz.hidden = true;
    raiz.innerHTML = `
      <div class="combate-ficha rival"><p class="combate-nombre"></p><p class="combate-nivel"></p><div class="combate-vida"><div class="combate-relleno"></div></div></div>
      <div class="combate-ficha propia"><p class="combate-nombre"></p><p class="combate-nivel"></p><div class="combate-vida"><div class="combate-relleno"></div></div><p class="combate-numeros"></p></div>
      <div class="combate-caja"><p class="combate-texto" aria-live="assertive"></p><div class="combate-menu" hidden></div></div>
      <div class="combate-barra" hidden><i class="blanca"></i><i class="verde"></i><b class="flecha"></b></div>
      <div class="combate-velo"></div>`;
    document.body.append(raiz);
    this.raiz = raiz;
    this.texto = raiz.querySelector('.combate-texto')!;
    this.menu = raiz.querySelector('.combate-menu')!;
    this.velo = raiz.querySelector('.combate-velo')!;
    this.barra = raiz.querySelector('.combate-barra')!;
    this.flecha = raiz.querySelector('.combate-barra .flecha')!;
    // Las zonas, con los anchos del núcleo: así lo que se ve es lo que cuenta.
    const zona = (clase: string, media: number) => (raiz.querySelector<HTMLElement>(`.combate-barra .${clase}`)!.style.cssText = `left:${(0.5 - media) * 100}%;width:${media * 200}%`);
    zona('blanca', MEDIA_BLANCA);
    zona('verde', MEDIA_VERDE);
    for (const ficha of raiz.querySelectorAll('.combate-ficha')) {
      this.fichas.push({
        nombre: ficha.querySelector('.combate-nombre')!,
        nivel: ficha.querySelector('.combate-nivel')!,
        relleno: ficha.querySelector('.combate-relleno')!,
        numeros: ficha.querySelector('.combate-numeros'),
      });
    }
    // fichas[0] es la rival (arriba) y fichas[1] la tuya: se ordenan por lado.
    this.fichas.reverse();
  }

  // ——— Entrar y salir ———

  /** Empieza un combate contra un entrenador (`entrenador`, su id) o una criatura salvaje (null). */
  private async empezar(rival: Criatura[], entrenador: string | null): Promise<void> {
    if (this.fase !== 'fuera' || !this.partida.equipo.some((c) => c.vida > 0)) return;
    this.fase = 'entrando';
    this.entrenador = entrenador;
    this.partida.empezarCombate();
    const rng = crearRng(`combate-${entrenador ?? 'salvaje'}-${this.ctx.tiempo.pasos}`);
    const r = iniciarCombate(
      { equipos: [structuredClone(this.partida.equipo), rival], formato: 1, salvaje: entrenador === null, control: ['jugador', 'ia'], rng, experiencia: true },
      DATOS,
    );
    this.estado = r.estado;
    // Todas las figuras, antes del fundido: un cambio de criatura no espera a cargar nada.
    this.figuras.clear();
    const todas = r.estado.lados.flatMap((l, lado) => l.equipo.map((c) => [lado, c] as const));
    await Promise.all(todas.map(async ([lado, c]) => this.figuras.set(c.uid, await figuraCriatura(MODELO_DE[c.especie] ?? MODELO_DE['inicial-roca'], 'color', TAMANO[lado]))));
    for (const l of this.luchadores) l?.raiz.removeFromParent();
    this.luchadores = [null, null];
    // Destello y fundido a negro; en negro, se cambia a la arena.
    this.encolar({ duracion: 0.45, saltable: false, animar: (t) => (this.velo.style.cssText = `opacity:${Math.sin(t * Math.PI * 3) ** 2 * 0.85};background:#fff`) });
    this.encolar({ duracion: FUNDIDO, saltable: false, animar: (t) => (this.velo.style.cssText = `opacity:${t};background:#1d1720`) });
    this.encolar({ duracion: 0.05, saltable: false, empezar: () => this.mostrarArena(true) });
    this.encolar({ duracion: FUNDIDO, saltable: false, animar: (t) => (this.velo.style.cssText = `opacity:${1 - t};background:#1d1720`) });
    this.mostrarEventos(r.eventos);
    this.fase = 'mensajes';
  }

  /** Pone en su plataforma la figura de una criatura, en lugar de la que hubiera. */
  private ponerLuchador(lado: number, uid: string): void {
    const f = this.figuras.get(uid);
    if (!f) return;
    this.luchadores[lado]?.raiz.removeFromParent();
    this.luchadores[lado] = { raiz: f, giro: GIRO[lado], extra: new Vector3(), escala: 0, visible: false };
    this.arena.add(f);
  }

  private mostrarArena(si: boolean): void {
    const escena = this.ctx.escena;
    this.arena.visible = si;
    this.raiz.hidden = !si;
    if (si) {
      this.guardado = { fondo: escena.background as Color | Texture | null, niebla: escena.fog as Fog | null };
      escena.background = this.fondoPintado ?? this.fondoProvisional;
      escena.fog = null;
      this.ajustarFondo();
      this.render.enfocar(ARENA.x, 0, ARENA.z);
      this.colocarCamara();
      for (const lado of [0, 1] as const) this.pintarFicha(lado, true);
    } else if (this.guardado) {
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
    c.position.copy(ARENA).add(CAMARA);
    c.lookAt(ARENA.clone().add(MIRA));
  }

  private terminar(): void {
    const caja = this.raiz.querySelector<HTMLElement>('.combate-caja')!;
    const paneles = [caja, ...this.fichas.map((f) => f.nombre.parentElement!)];
    this.encolar({ duracion: FUNDIDO, saltable: false, animar: (t) => (this.velo.style.cssText = `opacity:${t};background:#1d1720`) });
    this.encolar({
      // En negro: vuelta a la isla. Solo queda el velo, que se aclara.
      duracion: 0.05,
      saltable: false,
      empezar: () => {
        this.mostrarArena(false);
        this.raiz.hidden = false;
        for (const p of paneles) p.style.visibility = 'hidden';
        for (const l of this.luchadores) l?.raiz.removeFromParent();
        this.luchadores = [null, null];
        const e = this.estado!;
        // El equipo vuelve a «partida» como ha quedado: vida, PP, estados y experiencia.
        this.partida.equipo = e.lados[0].equipo;
        if (e.capturada && this.partida.equipo.length < MAX_EQUIPO) this.partida.equipo.push(e.capturada);
        if (e.fin === 'victoria' && this.entrenador && !this.partida.vencidos.includes(this.entrenador)) this.partida.vencidos.push(this.entrenador);
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
    this.texto.textContent = 'Para la flecha con Espacio. En el verde, mucho mejor. (Esc: volver)';
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
    if (!lanzar) return this.abrirMenu('mochila');
    const texto = { verde: '¡En el verde! Un lanzamiento perfecto.', blanca: 'En el blanco: buen lanzamiento.', gris: 'En el gris… Lanzas como puedes.' }[zona];
    this.encolar({ texto, duracion: 1, saltable: true });
    this.enviar({ tipo: 'objeto', objeto: l.objeto, calidad: CALIDAD_ZONA[zona] });
  }

  /** La criatura activa de un lado. */
  private activa(lado: 0 | 1): Criatura | undefined {
    const l = this.estado?.lados[lado];
    return l ? l.equipo[l.activos[0]] : undefined;
  }

  /** Convierte los eventos del núcleo en la función: mensajes y animaciones, en orden. */
  private mostrarEventos(eventos: Evento[]): void {
    let tipoUsado = 'comun';
    let atacante = 0;
    for (const ev of eventos) {
      switch (ev.tipo) {
        case 'entrada': {
          const lado = ev.ref.lado;
          const uid = ev.ficha.uid;
          if (lado === 1 && this.estado?.salvaje) {
            // La salvaje ya está ahí: aparece de un salto, sin cubo.
            this.encolar({
              texto: `¡Un ${ev.ficha.nombre} salvaje te sale al paso!`,
              duracion: 1.3,
              saltable: false,
              empezar: () => {
                this.ponerLuchador(lado, uid);
                this.pintarFicha(lado, true);
              },
              animar: (t) => {
                const l = this.luchadores[lado]!;
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
            texto: lado === 1 ? `¡El entrenador saca a ${ev.ficha.nombre}!` : `¡Adelante, ${ev.ficha.nombre}!`,
            duracion: 1.9,
            saltable: false,
            empezar: () => {
              this.ponerLuchador(lado, uid);
              this.pintarFicha(lado, true);
              cubo = figuraCubo(CUBO[lado], this.materialCubo);
              cubo.position.copy(SITIO[lado]).setY(CAIDA);
              this.arena.add(cubo);
              destello = new Mesh(this.esferaDestello, this.materialDestello.clone());
              destello.visible = false;
              destello.position.copy(SITIO[lado]).setY(TAMANO[lado] * 0.45);
              this.arena.add(destello);
            },
            animar: (t) => this.animarSalida(lado, t, cubo!, destello!, abierto),
          });
          break;
        }
        case 'usa': {
          atacante = ev.ref.lado;
          // El evento trae el id del movimiento; se enseña su nombre.
          const mov = DATOS.movimientos[ev.movimiento];
          tipoUsado = mov?.tipo || 'comun';
          const lado = atacante;
          const estado = mov?.categoria === 'estado';
          this.encolar({
            texto: `¡${ev.nombre} usa ${mov?.nombre ?? ev.movimiento}!`,
            duracion: 0.75,
            saltable: false,
            animar: (t) => {
              const l = this.luchadores[lado]!;
              if (estado) {
                l.extra.set(0, Math.sin(t * Math.PI) * 0.25, 0);
                return;
              }
              const hacia = SITIO[1 - lado].clone().sub(SITIO[lado]).normalize();
              const k = t < 0.45 ? -Math.sin((t / 0.45) * Math.PI) * 0.15 : Math.sin(((t - 0.45) / 0.55) * Math.PI) * 0.8;
              l.extra.copy(hacia).multiplyScalar(k);
            },
          });
          break;
        }
        case 'danio': {
          if (ev.causa !== 'golpe') {
            this.encolar({ texto: ev.causa === 'quemadura' ? 'La quemadura le hace daño.' : 'Le hace daño.', duracion: 0.9, saltable: true, empezar: () => this.pintarVida(ev.ref.lado, ev.vida, ev.vidaMax) });
            break;
          }
          const lado = ev.ref.lado;
          const color = COLOR_TIPO.get(tipoUsado) ?? 0xffffff;
          this.encolar({
            duracion: 0.55,
            saltable: false,
            empezar: () => {
              this.chispas(lado, color);
              this.pintarVida(lado, ev.vida, ev.vidaMax);
            },
            animar: (t) => {
              const l = this.luchadores[lado]!;
              l.visible = t > 0.8 || Math.floor(t * 8) % 2 === 0;
              l.extra.set(Math.sin(t * 40) * 0.06 * (1 - t), 0, 0);
            },
          });
          if (ev.critico) this.encolar({ texto: '¡Un golpe crítico!', duracion: 0.9, saltable: true });
          if (ev.eficacia > 1) this.encolar({ texto: '¡Es muy eficaz!', duracion: 0.9, saltable: true });
          else if (ev.eficacia > 0 && ev.eficacia < 1) this.encolar({ texto: 'No es muy eficaz…', duracion: 0.9, saltable: true });
          break;
        }
        case 'falla':
          this.encolar({ texto: `¡${ev.nombre} ha fallado!`, duracion: 0.9, saltable: true });
          break;
        case 'sinEfecto':
          this.encolar({ texto: `No afecta a ${ev.nombre}…`, duracion: 0.9, saltable: true });
          break;
        case 'etapa': {
          const lado = ev.ref.lado;
          const sube = ev.cambio > 0;
          this.encolar({
            texto: `¡${sube ? 'Sube' : 'Baja'} ${ESTADISTICA[ev.estadistica] ?? ev.estadistica} de ${ev.nombre}!`,
            duracion: 1,
            saltable: true,
            empezar: () => this.chispas(lado, sube ? 0xffb347 : 0x6fa8ff, sube ? 1 : -1),
          });
          break;
        }
        case 'estado':
          this.encolar({ texto: `¡${ev.nombre} está ${ev.estado}!`, duracion: 1, saltable: true });
          break;
        case 'noSeMueve':
          this.encolar({ texto: `${ev.nombre} no se puede mover.`, duracion: 1, saltable: true });
          break;
        case 'debilitado': {
          const lado = ev.ref.lado;
          this.encolar({
            texto: `¡${ev.nombre} se ha debilitado!`,
            duracion: 1.1,
            saltable: false,
            animar: (t) => {
              const l = this.luchadores[lado]!;
              l.extra.set(0, -t * 0.5, 0);
              l.escala = 1 - t;
            },
          });
          break;
        }
        case 'retirada': {
          const lado = ev.ref.lado;
          this.encolar({
            texto: lado === 0 ? `¡${ev.nombre}, vuelve!` : `El entrenador retira a ${ev.nombre}.`,
            duracion: 0.8,
            saltable: false,
            animar: (t) => (this.luchadores[lado]!.escala = 1 - t),
          });
          break;
        }
        case 'experiencia': {
          this.encolar({ texto: `${ev.nombre} gana ${ev.cantidad} puntos de experiencia.`, duracion: 1.1, saltable: true });
          for (const s of ev.subidas) {
            this.encolar({ texto: `¡${ev.nombre} sube al nivel ${s.nivel}!`, duracion: 1.3, saltable: true, empezar: () => this.pintarFicha(0, true) });
            for (const m of s.aprendidos) this.encolar({ texto: `¡${ev.nombre} aprende ${DATOS.movimientos[m]?.nombre ?? m}!`, duracion: 1.2, saltable: true });
          }
          break;
        }
        case 'curacion':
          this.encolar({ texto: 'Recupera vida.', duracion: 0.9, saltable: true, empezar: () => this.pintarVida(ev.ref.lado, ev.vida, ev.vidaMax) });
          break;
        case 'objetoUsado': {
          const o = DATOS.objetos[ev.objeto];
          const nombre = o?.nombre ?? ev.objeto;
          if (o?.tipo === 'captura') {
            // El cubo vuela hasta la salvaje, que desaparece dentro.
            this.encolar({ texto: `¡Lanzas un ${nombre}!`, duracion: 0.9, saltable: false, animar: (t) => (this.luchadores[1]!.escala = 1 - t) });
          } else {
            this.encolar({ texto: ev.lado === 0 ? `Usas ${nombre}.` : `El entrenador usa ${nombre}.`, duracion: 1, saltable: true });
          }
          break;
        }
        case 'captura': {
          for (let i = 0; i < ev.sacudidas; i++) {
            this.encolar({ texto: '…', duracion: 0.55, saltable: false, animar: (t) => this.luchadores[1]!.extra.set(Math.sin(t * Math.PI * 2) * 0.12, 0, 0) });
          }
          const nombre = this.activa(1) ? nombreDe(this.activa(1)!, DATOS) : 'la criatura';
          if (ev.exito) {
            const cabe = this.partida.equipo.length < MAX_EQUIPO;
            this.encolar({ texto: `¡Has capturado a ${nombre}!`, duracion: 1.6, saltable: true });
            if (!cabe) this.encolar({ texto: 'Pero tu equipo está lleno: se queda en libertad.', duracion: 1.6, saltable: true });
          } else {
            this.encolar({ texto: '¡Oh, no! Se ha escapado.', duracion: 1.1, saltable: true, animar: (t) => (this.luchadores[1]!.escala = rebote(t)) });
          }
          break;
        }
        case 'huida':
          this.encolar({ texto: ev.exito ? '¡Escapas sin problemas!' : '¡No has podido escapar!', duracion: 1.1, saltable: true });
          break;
        case 'fin': {
          const textos: Record<string, string> = {
            victoria: this.entrenador ? '¡Has vencido al entrenador!' : '¡Has ganado!',
            derrota: 'No te quedan criaturas que puedan luchar… Vuelves corriendo al refugio.',
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
    if (this.fase === 'barra') {
      if (confirmar) this.pararBarra(true);
      else if (cancelar) this.pararBarra(false);
      return;
    }
    if (this.fase === 'menu') {
      const dir = this.entrada.pulsacion();
      if (dir) {
        // En rejilla de dos columnas (menú y ataques) o en lista (mochila y equipo).
        const columnas = this.menu.classList.contains('lista') ? 1 : 2;
        const paso = dir === 'e' ? 1 : dir === 'o' ? -1 : dir === 's' ? columnas : -columnas;
        if (columnas === 2 || dir === 'n' || dir === 's') {
          const n = this.eleccion + paso;
          if (n >= 0 && n < this.opciones.length) this.eleccion = n;
        }
        this.pintarMenu();
      }
      const o = this.opciones[this.eleccion];
      if (confirmar && o?.activa) o.elegir();
      else if (cancelar && this.menuActual !== 'raiz' && this.menuActual !== 'forzado') this.abrirMenu('raiz');
      return;
    }
    // Una flecha pulsada mientras salen los mensajes no debe mover el menú al abrirse (se elegía
    // otra opción sin querer).
    this.entrada.pulsacion();
    if (confirmar && this.paso?.saltable && this.tPaso > 0.25) this.tPaso = this.paso.duracion;
  }

  actualizar(dt: number): void {
    if (this.fase === 'fuera') return;
    this.reloj += dt;
    // Avanza la cola.
    if (!this.paso && this.cola.length) {
      this.paso = this.cola.shift()!;
      this.tPaso = 0;
      this.paso.empezar?.();
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
      else this.abrirMenu(this.estado?.pendientes.length ? 'forzado' : 'raiz');
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
          { html: boton('Equipo'), activa: e.lados[0].equipo.length > 1, elegir: () => this.abrirMenu('equipo') },
          { html: boton('Huir'), activa: e.salvaje, elegir: () => this.enviar({ tipo: 'huir' }) },
        ];
        break;
      case 'ataques':
        this.opciones = c.movimientos.map((m, indice) => {
          const mov = DATOS.movimientos[m.id];
          const color = `#${(COLOR_TIPO.get(mov.tipo) ?? 0xa8a29e).toString(16).padStart(6, '0')}`;
          return {
            html: boton(mov.nombre, `<i style="background:${color}">${NOMBRE_TIPO.get(mov.tipo) ?? 'Común'}</i> PP ${m.pp}/${mov.pp}`),
            activa: m.pp > 0,
            elegir: () => this.enviar({ tipo: 'movimiento', indice, objetivo: { lado: 1, hueco: 0 } }),
          };
        });
        break;
      case 'mochila': {
        texto = '¿Qué usas? (Esc: volver)';
        const activo = e.lados[0].activos[0];
        this.opciones = Object.entries(this.partida.mochila)
          .filter(([id, n]) => n > 0 && DATOS.objetos[id])
          .map(([id, n]) => {
            const o = DATOS.objetos[id];
            const captura = o.tipo === 'captura';
            return {
              html: boton(`${o.nombre} ×${n}`, o.descripcion),
              activa: captura ? e.salvaje : objetoUtil(c, id, DATOS),
              elegir: () => (captura ? this.abrirBarra(id) : this.enviar({ tipo: 'objeto', objeto: id, objetivo: activo })),
            };
          });
        if (!this.opciones.length) texto = 'La mochila está vacía. (Esc: volver)';
        break;
      }
      case 'equipo':
      case 'forzado': {
        texto = cual === 'forzado' ? '¿A quién sacas?' : '¿A quién sacas? (Esc: volver)';
        const l = e.lados[0];
        this.opciones = l.equipo.map((x, indice) => ({
          html: boton(`${nombreDe(x, DATOS)} · Nv. ${x.nivel}`, `Vida ${x.vida}/${vidaMaxima(x, DATOS)}${l.activos.includes(indice) ? ' · en combate' : ''}`),
          activa: x.vida > 0 && !l.activos.includes(indice),
          elegir: () => (cual === 'forzado' ? this.seguir(reemplazar(this.estado!, { lado: 0, hueco: 0 }, indice, DATOS)) : this.enviar({ tipo: 'cambio', indice })),
        }));
        break;
      }
    }
    this.texto.textContent = texto;
    this.menu.hidden = false;
    this.menu.classList.toggle('lista', cual === 'mochila' || cual === 'equipo' || cual === 'forzado');
    this.menu.replaceChildren();
    this.botones = this.opciones.map((o) => {
      const b = document.createElement('span');
      b.className = 'combate-ataque';
      b.classList.toggle('apagado', !o.activa);
      b.innerHTML = o.html;
      this.menu.append(b);
      return b;
    });
    // Se empieza en la primera opción que se puede elegir.
    this.eleccion = Math.max(0, this.opciones.findIndex((o) => o.activa));
    this.pintarMenu();
  }

  private pintarMenu(): void {
    this.botones.forEach((b, i) => b.classList.toggle('elegido', i === this.eleccion));
  }

  private pintarFicha(lado: 0 | 1, deGolpe = false): void {
    const c = this.activa(lado);
    if (!c) return;
    const f = this.fichas[lado];
    f.nombre.textContent = nombreDe(c, DATOS);
    f.nivel.textContent = `Nv. ${c.nivel}`;
    if (deGolpe) this.pintarVida(lado, c.vida, vidaMaxima(c, DATOS), true);
  }

  private pintarVida(lado: number, vida: number, max: number, deGolpe = false): void {
    const f = this.fichas[lado];
    const p = Math.max(0, vida / max);
    f.relleno.style.transition = deGolpe ? 'none' : '';
    f.relleno.style.width = `${p * 100}%`;
    f.relleno.style.background = p > 0.5 ? '#4cc26e' : p > 0.2 ? '#f2c14e' : '#ef5b4f';
    if (f.numeros) f.numeros.textContent = `${Math.max(0, vida)} / ${max}`;
    this.vidaVista[lado] = vida;
  }

  // ——— Animación ———

  /**
   * La salida de una criatura, con t de 0 a 1: el cubo cae girando (hasta 0,36), rebota una vez
   * (hasta 0,6), tiembla un instante y se abre en un destello (desde 0,66) del que sale la
   * criatura con un rebote.
   */
  private animarSalida(lado: number, t: number, cubo: Group, destello: Mesh, abierto: { chispas: boolean }): void {
    const suelo = RADIO_CUBO * 1.05;
    const l = this.luchadores[lado]!;
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
      this.chispas(lado, 0xffe39a);
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

  private animarLuchadores(): void {
    for (const [lado, l] of this.luchadores.entries()) {
      if (!l) continue;
      const s = SITIO[lado];
      const respira = 1 + Math.sin(this.reloj * 2.4 + lado * 1.7) * 0.025;
      l.raiz.visible = l.visible && l.escala > 0.01;
      l.raiz.position.set(s.x + l.extra.x, s.y + l.extra.y, s.z + l.extra.z);
      l.raiz.rotation.y = l.giro;
      l.raiz.scale.set(l.escala, l.escala * respira, l.escala);
    }
  }

  /** Chispas del color del ataque sobre una criatura; `sube` 1 o -1 para las de subir o bajar. */
  private chispas(lado: number, color: number, sube = 0): void {
    const mat = new MeshBasicNodeMaterial({ color, transparent: true });
    mat.toneMapped = false;
    this.materiales.push(mat);
    const centro = SITIO[lado].clone().add(new Vector3(0, TAMANO[lado] * 0.5, 0));
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
    this.fondoPintado?.dispose();
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
