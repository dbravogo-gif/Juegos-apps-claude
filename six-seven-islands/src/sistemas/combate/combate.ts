// Subsistema «combate»: el combate por turnos, visto como en los juegos del género: en diagonal,
// tu criatura delante a la izquierda, de espaldas, y la rival al fondo a la derecha, mirándote
// (autor, 2026-11-10). Es una arena aparte, lejos de la isla, con un fondo pintado detrás, dos
// plataformas y las criaturas de Meshy. Las reglas son las del núcleo (src/core/combate.ts); los
// datos son provisionales (src/data/combate-prueba.ts) y por ahora solo lo lanza el primer
// entrenador. Con teclado: flechas para elegir y E, Enter o Espacio para confirmar.

import {
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
import { iniciarCombate, resolverTurno, type EstadoCombate, type Evento } from '../../core/combate';
import { crearCriatura } from '../../core/criatura';
import { crearRng } from '../../core/rng';
import { vidaMaxima } from '../../core/estadisticas';
import { MaterialDiorama } from '../../arte/material';
import { MODELO_INICIAL, figuraCriatura } from '../../arte/criaturas3d';
import { DATOS_COMBATE_PRUEBA, ENTRENADOR_PRUEBA, ESPECIE_INICIAL, RIVAL_DE } from '../../data/combate-prueba';
import { TIPOS } from '../../data/tipos';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Entrada } from '../entrada/entrada';
import type { Partida } from '../partida/partida';
import type { Render } from '../render/render';

const DATOS = DATOS_COMBATE_PRUEBA;
/** La arena, lejos de la isla y de los interiores. */
const ARENA = new Vector3(600, 0, 600);
/** Dónde va cada criatura, respecto a la arena: la tuya delante a la izquierda, la rival al fondo. */
const SITIO: [Vector3, Vector3] = [new Vector3(-1.45, 0, 1.15), new Vector3(1.75, 0, -1.4)];
const TAMANO: [number, number] = [1.0, 0.95];
/** Hacia dónde miran: la tuya casi de espaldas (tres cuartos), la rival casi de frente. */
const GIRO: [number, number] = [2.55, -0.55];
const CAMARA = new Vector3(0, 2.6, 7.9);
const MIRA = new Vector3(0.15, 0.45, 0);
/** Segundos de cada fundido, al entrar y al salir. */
const FUNDIDO = 0.55;

const NOMBRE_TIPO = new Map<string, string>(TIPOS.map((t) => [t.id, t.nombre]));
const COLOR_TIPO = new Map<string, number>(TIPOS.map((t) => [t.id, t.color]));
const ESTADISTICA: Record<string, string> = { fuerza: 'la fuerza', escudo: 'el escudo', magia: 'la magia', resMagica: 'la resistencia mágica', celeridad: 'la celeridad' };

type Fase = 'fuera' | 'entrando' | 'mensajes' | 'menu' | 'saliendo';

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
  private fondoProvisional!: Texture;
  private fondoPintado: Texture | null = null;
  private guardado: { fondo: Color | Texture | null; niebla: Fog | null } | null = null;
  private vencidos = new Set<string>();

  private fase: Fase = 'fuera';
  private reloj = 0;
  private estado: EstadoCombate | null = null;
  private luchadores: (Luchador | null)[] = [null, null];
  private cola: Paso[] = [];
  private paso: Paso | null = null;
  private tPaso = 0;
  private eleccion = 0;
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
      `${import.meta.env.BASE_URL}fondos/combate-exterior.jpg`,
      (t) => {
        t.colorSpace = SRGBColorSpace;
        this.fondoPintado = t;
      },
      undefined,
      () => undefined,
    );
    ctx.eventos.on('dialogo:cerrar', ({ guionId }) => {
      if (guionId === ENTRENADOR_PRUEBA && this.partida.estado.inicial && !this.vencidos.has(guionId) && this.fase === 'fuera') {
        void this.empezar(guionId);
      }
    });
  }

  /** La arena: dos plataformas de jable con su canto, una para cada criatura. */
  private montarArena(): void {
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
      <div class="combate-velo"></div>`;
    document.body.append(raiz);
    this.raiz = raiz;
    this.texto = raiz.querySelector('.combate-texto')!;
    this.menu = raiz.querySelector('.combate-menu')!;
    this.velo = raiz.querySelector('.combate-velo')!;
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

  private async empezar(entrenador: string): Promise<void> {
    const inicial = this.partida.estado.inicial!;
    const rival = RIVAL_DE[inicial] ?? 'roca';
    this.fase = 'entrando';
    this.partida.empezarCombate();
    const rng = crearRng(`combate-${entrenador}-${this.ctx.tiempo.pasos}`);
    const propia = crearCriatura(DATOS, ESPECIE_INICIAL[inicial], 5, rng);
    const contraria = crearCriatura(DATOS, ESPECIE_INICIAL[rival], 5, rng);
    const r = iniciarCombate({ equipos: [[propia], [contraria]], formato: 1, salvaje: false, control: ['jugador', 'ia'], rng, experiencia: false }, DATOS);
    this.estado = r.estado;
    const figuras = await Promise.all([figuraCriatura(MODELO_INICIAL[inicial], 'color', TAMANO[0]), figuraCriatura(MODELO_INICIAL[rival], 'color', TAMANO[1])]);
    figuras.forEach((f, lado) => {
      this.luchadores[lado]?.raiz.removeFromParent();
      this.luchadores[lado] = { raiz: f, giro: GIRO[lado], extra: new Vector3(), escala: 0, visible: false };
      this.arena.add(f);
    });
    // Destello y fundido a negro; en negro, se cambia a la arena.
    this.encolar({ duracion: 0.45, saltable: false, animar: (t) => (this.velo.style.cssText = `opacity:${Math.sin(t * Math.PI * 3) ** 2 * 0.85};background:#fff`) });
    this.encolar({ duracion: FUNDIDO, saltable: false, animar: (t) => (this.velo.style.cssText = `opacity:${t};background:#1d1720`) });
    this.encolar({ duracion: 0.05, saltable: false, empezar: () => this.mostrarArena(true) });
    this.encolar({ duracion: FUNDIDO, saltable: false, animar: (t) => (this.velo.style.cssText = `opacity:${1 - t};background:#1d1720`) });
    this.mostrarEventos(r.eventos);
    this.fase = 'mensajes';
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
        this.partida.terminarCombate();
        this.ctx.eventos.emit('combate:fin', { resultado: this.estado?.fin ?? 'victoria' });
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

  private elegir(indice: number): void {
    const e = this.estado!;
    const r = resolverTurno(e, { 0: [{ tipo: 'movimiento', indice, objetivo: { lado: 1, hueco: 0 } }] }, DATOS);
    this.estado = r.estado;
    this.menu.hidden = true;
    this.fase = 'mensajes';
    this.mostrarEventos(r.eventos);
  }

  /** Convierte los eventos del núcleo en la función: mensajes y animaciones, en orden. */
  private mostrarEventos(eventos: Evento[]): void {
    let tipoUsado = 'comun';
    let atacante = 0;
    for (const ev of eventos) {
      switch (ev.tipo) {
        case 'entrada': {
          const lado = ev.ref.lado;
          this.encolar({
            texto: lado === 1 ? `¡El entrenador saca a ${ev.ficha.nombre}!` : `¡Adelante, ${ev.ficha.nombre}!`,
            duracion: 0.9,
            saltable: true,
            empezar: () => {
              this.luchadores[lado]!.visible = true;
              this.pintarFicha(lado, true);
            },
            animar: (t) => (this.luchadores[lado]!.escala = rebote(t)),
          });
          break;
        }
        case 'usa': {
          atacante = ev.ref.lado;
          const mov = Object.values(DATOS.movimientos).find((m) => m.nombre === ev.movimiento);
          tipoUsado = mov?.tipo || 'comun';
          const lado = atacante;
          const estado = mov?.categoria === 'estado';
          this.encolar({
            texto: `¡${ev.nombre} usa ${ev.movimiento}!`,
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
        case 'fin':
          this.encolar({
            texto: ev.resultado === 'victoria' ? '¡Has ganado el combate!' : 'Te has quedado sin criaturas que puedan luchar…',
            duracion: 1.8,
            saltable: true,
            empezar: () => {
              if (ev.resultado === 'victoria') this.vencidos.add(ENTRENADOR_PRUEBA);
            },
          });
          break;
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
    this.entrada.consumir('cancelar');
    if (this.fase === 'menu') {
      const dir = this.entrada.pulsacion();
      if (dir) {
        const fila = this.eleccion >> 1;
        const col = this.eleccion & 1;
        if (dir === 'e' || dir === 'o') this.eleccion = fila * 2 + (1 - col);
        else this.eleccion = (1 - fila) * 2 + col;
        this.pintarMenu();
      }
      if (confirmar) this.elegir(this.eleccion);
      return;
    }
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
    } else if (this.fase === 'mensajes') {
      if (this.estado?.fin) this.terminar();
      else this.abrirMenu();
    }
    this.animarLuchadores();
    this.animarParticulas(dt);
    if (this.arena.visible) this.colocarCamara();
  }

  private abrirMenu(): void {
    this.fase = 'menu';
    const c = this.estado!.lados[0].equipo[0];
    this.texto.textContent = `¿Qué hará ${DATOS.especies[c.especie].nombre}?`;
    this.menu.hidden = false;
    this.menu.replaceChildren();
    this.botones = c.movimientos.map((m) => {
      const mov = DATOS.movimientos[m.id];
      const b = document.createElement('span');
      b.className = 'combate-ataque';
      const color = `#${(COLOR_TIPO.get(mov.tipo) ?? 0xa8a29e).toString(16).padStart(6, '0')}`;
      b.innerHTML = `<b>${mov.nombre}</b><small><i style="background:${color}">${NOMBRE_TIPO.get(mov.tipo) ?? 'Común'}</i> PP ${m.pp}/${mov.pp}</small>`;
      this.menu.append(b);
      return b;
    });
    this.eleccion = Math.min(this.eleccion, this.botones.length - 1);
    this.pintarMenu();
  }

  private pintarMenu(): void {
    this.botones.forEach((b, i) => b.classList.toggle('elegido', i === this.eleccion));
  }

  private pintarFicha(lado: 0 | 1, deGolpe = false): void {
    const c = this.estado?.lados[lado].equipo[0];
    if (!c) return;
    const f = this.fichas[lado];
    f.nombre.textContent = DATOS.especies[c.especie].nombre;
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
