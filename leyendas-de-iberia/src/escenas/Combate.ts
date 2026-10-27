import Phaser from 'phaser';
import { DATOS } from '../data';
import { crearRng } from '../core/rng';
import { crearCriatura, nombreDe } from '../core/criatura';
import { calcularEstadisticas } from '../core/estadisticas';
import { aprenderMovimiento, evolucionar, evolucionPendiente, expParaNivel } from '../core/progreso';
import type { Criatura, EstadoAlterado, Movimiento } from '../core/modelo';
import { eficacia } from '../core/tipos';
import { construirTablaTipos } from '../ui/tablaTipos';

import { motivoNoUsable, seAplicaACriatura } from '../core/objetos';
import {
  accionesDisponibles,
  activoDe,
  fichaDe,
  iniciarCombate,
  resolverTurno,
  type Accion,
  type EstadoCombate,
  type Evento,
  type FichaCombate,
  type Lado,
  type ResultadoCombate,
} from '../core/combate';
import { Barra, Boton, botonFlecha, filaTipos, simboloSexo, type OpcionesBoton } from '../ui/componentes';
import { cabecera, colorPedestal, fondoMenu, pildora, ventana } from '../ui/ventanas';
import { iconoObjeto } from '../ui/objetoVisual';
import { crearCriaturaVisual } from '../ui/criaturaVisual';
import { describirMovimiento, ESTADO_VISTA, textosEvento, type ContextoTextos } from '../ui/textos';
import { aclarar, ALTO, ANCHO, COLOR, estiloTexto, MARGEN_VERTICAL, oscurecer } from '../ui/tema';
import type { ConfigLaboratorio } from './Laboratorio';

const OBJETOS_INICIALES = { tesera: 5, unguento: 3 };

export interface ResultadoHistoria {
  resultado: ResultadoCombate;
  equipo: Criatura[];
  objetos: Record<string, number>;
  capturada: Criatura | null;
  /** Especies rivales que han salido: van al Bestiario como vistas. */
  rivales: string[];
  /** La última tésera lanzada, para tenerla a mano en el siguiente combate. */
  ultimaTesera: string;
}

export type DatosCombate =
  | { modo: 'laboratorio'; config: ConfigLaboratorio; semilla: number }
  | {
      modo: 'historia';
      semilla: number;
      equipo: Criatura[];
      objetos: Record<string, number>;
      rival: Criatura[];
      salvaje: boolean;
      nombreRival: string;
      /** El rival salvaje elige sus movimientos como un entrenador. */
      iaAstuta?: boolean;
      /** Repartir experiencia encendido. */
      repartir?: boolean;
      ultimaTesera?: string;
      alTerminar: (r: ResultadoHistoria) => void;
    };

/** Centro vertical de las dos filas de botones del menú de combate. */
const FILA_MENU = [1385, 1595];

const POSICION: Record<Lado, { x: number; y: number; tam: number }> = {
  rival: { x: 770, y: 370, tam: 330 },
  jugador: { x: 290, y: 770, tam: 390 },
};

/** Recuadro con nombre, nivel, tipos y Vida de una criatura en el campo. */
class Ficha {
  private capa: Phaser.GameObjects.Container;
  private nombre: Phaser.GameObjects.Text;
  private sexo?: Phaser.GameObjects.Graphics;
  private nivel: Phaser.GameObjects.Text;
  private estado: Phaser.GameObjects.Text;
  private tipos: Phaser.GameObjects.Container;
  private barra: Barra;
  private numeros?: Phaser.GameObjects.Text;
  private barraExp?: Barra;

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    private ancho: number,
    esJugador: boolean,
  ) {
    const alto = esJugador ? 250 : 200;
    this.capa = scene.add.container(x, y);
    this.capa.add(ventana(scene, 0, 0, ancho, alto, { radio: 36 }));
    this.nombre = scene.add.text(30, 46, '', estiloTexto(40, COLOR.tinta, true)).setOrigin(0, 0.5);
    const fondoNivel = scene.add.graphics();
    fondoNivel.fillStyle(COLOR.tinta, 1).fillRoundedRect(ancho - 150, 24, 124, 44, 22);
    this.nivel = scene.add.text(ancho - 88, 46, '', estiloTexto(28, COLOR.panel, true)).setOrigin(0.5);
    this.tipos = scene.add.container(0, 0);
    this.estado = scene.add.text(ancho - 28, 104, '', estiloTexto(24, COLOR.panel, true)).setOrigin(1, 0.5);
    this.estado.setBackgroundColor('#ec3b4f').setPadding(14, 4, 14, 4);
    const etiqueta = pildora(scene, 30, 156, 'VIDA', COLOR.tinta, 20, COLOR.oro);
    this.barra = new Barra(scene, 130, 156, ancho - 160, 28, true);
    this.capa.add([this.nombre, fondoNivel, this.nivel, this.tipos, this.estado, etiqueta, this.barra]);
    if (esJugador) {
      this.numeros = scene.add.text(ancho - 30, 196, '', estiloTexto(30, COLOR.tinta, true)).setOrigin(1, 0.5);
      const etExp = pildora(scene, 30, 222, 'EXP', COLOR.exp, 16, COLOR.panel);
      this.barraExp = new Barra(scene, 130, 222, ancho - 300, 14, false);
      this.capa.add([this.numeros, etExp, this.barraExp]);
    }
  }

  mostrar(ficha: FichaCombate): void {
    this.nombre.setText(ficha.nombre);
    // Si el nombre es largo, se encoge para no pisar el nivel.
    this.nombre.setScale(Math.min(1, (this.ancho - 250) / Math.max(1, this.nombre.width / this.nombre.scaleX)));
    this.sexo?.destroy();
    this.sexo = simboloSexo(this.scene, 30 + this.nombre.displayWidth + 26, 46, ficha.sexo, 36);
    this.capa.add(this.sexo);
    this.nivel.setText(`Nv ${ficha.nivel}`);
    this.tipos.removeAll(true);
    filaTipos(this.scene, this.tipos, 30, 104, DATOS.especies[ficha.especie].tipos, 22);
    this.setEstado(ficha.estado);
    void this.setVida(ficha.vida, ficha.vidaMax, false);
    this.capa.setVisible(true);
  }

  setNivel(nivel: number): void {
    this.nivel.setText(`Nv ${nivel}`);
  }

  setEstado(estado: EstadoAlterado | null): void {
    const vista = estado ? ESTADO_VISTA[estado] : null;
    this.estado.setText(vista?.etiqueta ?? '').setVisible(vista !== null);
    if (vista) this.estado.setBackgroundColor(`#${vista.color.toString(16).padStart(6, '0')}`);
  }

  /** Vida que se ve ahora en los números, para contarla hacia abajo o hacia arriba. */
  private vidaVista = 0;
  private cuenta?: Phaser.Tweens.Tween;

  setVida(vida: number, max: number, animar: boolean): Promise<void> {
    const desde = this.vidaVista;
    this.vidaVista = vida;
    this.cuenta?.stop();
    if (!animar || desde === vida) {
      this.numeros?.setText(`${vida} / ${max}`);
      return this.barra.setFraccion(vida / max, false);
    }
    // Los números y la barra bajan a la vez y al mismo ritmo.
    const duracion = 300 + (Math.abs(vida - desde) / max) * 900;
    if (this.numeros) {
      this.cuenta = this.scene.tweens.addCounter({
        from: desde,
        to: vida,
        duration: duracion,
        onUpdate: (t) => this.numeros?.setText(`${Math.round(t.getValue() ?? vida)} / ${max}`),
        onComplete: () => this.numeros?.setText(`${vida} / ${max}`),
      });
    }
    return this.barra.setFraccion(vida / max, true, duracion);
  }

  setExp(fraccion: number): void {
    void this.barraExp?.setFraccion(fraccion, false);
  }

  ocultar(): void {
    this.capa.setVisible(false);
  }
}

export class Combate extends Phaser.Scene {
  private entrada!: DatosCombate;
  private rivalesVistos = new Set<string>();
  private pendientesAprender: { indice: number; movimientoId: string }[] = [];

  private estado!: EstadoCombate;
  private ctx!: ContextoTextos;
  private visual: Record<Lado, Phaser.GameObjects.Container | null> = { jugador: null, rival: null };
  private ficha!: Record<Lado, Ficha>;
  private activoVisual: Record<Lado, number> = { jugador: 0, rival: 0 };
  private texto!: Phaser.GameObjects.Text;
  private info!: Phaser.GameObjects.Text;
  private menu?: Phaser.GameObjects.Container;
  private saltar: (() => void) | null = null;
  private ocupado = false;
  private ultimaTesera = 'tesera';
  /** Teclado: el botón del menú con el foco y el marco que lo señala. */
  private foco: Boton | null = null;
  private menuConFoco?: Phaser.GameObjects.Container;
  private marcoFoco?: Phaser.GameObjects.Graphics;
  /** El marco del foco solo se ve si se juega con teclado: con el dedo no hace falta. */
  private usaTeclado = false;

  constructor() {
    super('Combate');
  }

  init(data: DatosCombate): void {
    this.entrada = data;
    this.foco = null;
    this.menuConFoco = undefined;
    this.rivalesVistos = new Set();
    this.pendientesAprender = [];
    this.visual = { jugador: null, rival: null };
    this.menu = undefined;
    this.saltar = null;
    this.ocupado = false;
    this.ultimaTesera = (data.modo === 'historia' && data.ultimaTesera) || 'tesera';
  }

  create(): void {
    const { semilla } = this.entrada;
    this.cameras.main.setBackgroundColor(COLOR.fondo);
    // Diseñada a 1920 de alto: en pantallas más altas se centra y el cielo llega hasta arriba.
    this.cameras.main.setScroll(0, -MARGEN_VERTICAL);

    // Campo de batalla: cielo en degradado, pradera y dos plataformas de hierba con borde.
    const campo = this.add.graphics();
    campo.fillGradientStyle(aclarar(COLOR.cielo, 0.55), aclarar(COLOR.cielo, 0.55), COLOR.cielo, COLOR.cielo, 1);
    campo.fillRect(0, -MARGEN_VERTICAL, ANCHO, 560 + MARGEN_VERTICAL);
    campo.fillGradientStyle(aclarar(COLOR.suelo, 0.35), aclarar(COLOR.suelo, 0.35), COLOR.suelo, COLOR.suelo, 1);
    campo.fillRect(0, 560, ANCHO, 430);
    campo.fillStyle(0xffffff, 0.3).fillRect(0, 560, ANCHO, 5);
    for (const [lado, ancho, alto, dy] of [
      ['rival', 460, 120, 150],
      ['jugador', 540, 130, 175],
    ] as const) {
      const { x, y } = POSICION[lado];
      campo.fillStyle(oscurecer(COLOR.suelo, 0.35), 1).fillEllipse(x, y + dy + 12, ancho, alto);
      campo.fillStyle(oscurecer(COLOR.suelo, 0.1), 1).fillEllipse(x, y + dy, ancho, alto);
      campo.fillStyle(aclarar(COLOR.suelo, 0.3), 1).fillEllipse(x, y + dy - 6, ancho * 0.82, alto * 0.7);
    }

    this.ficha = {
      rival: new Ficha(this, 24, 40, 560, false),
      jugador: new Ficha(this, 500, 640, 556, true),
    };
    this.ficha.rival.ocultar();
    this.ficha.jugador.ocultar();

    // Mensajes en una caja oscura, como en los juegos actuales.
    ventana(this, 24, 1010, ANCHO - 48, 236, { color: COLOR.tinta, opacidad: 0.94, borde: null, radio: 36 });
    this.texto = this.add.text(64, 1046, '', {
      ...estiloTexto(40, COLOR.panel, true),
      wordWrap: { width: ANCHO - 128 },
      lineSpacing: 10,
    });
    this.info = this.add
      .text(64, 1036, '', { ...estiloTexto(31, COLOR.panel), wordWrap: { width: ANCHO - 128 }, lineSpacing: 6 })
      .setVisible(false);

    if (this.entrada.modo === 'laboratorio') {
      this.add.text(ANCHO - 40, 1900, `Semilla ${semilla}`, estiloTexto(22, COLOR.tintaSuave)).setOrigin(1, 1);
    }

    // Tocar la pantalla adelanta el texto.
    this.input.on('pointerdown', () => this.saltar?.());
    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => this.tecla(e));
    this.marcoFoco = this.add.graphics().setDepth(50);

    let equipoJugador: Criatura[];
    let equipoRival: Criatura[];
    let objetos: Record<string, number>;
    let salvaje: boolean;
    let nombreRival: string;
    if (this.entrada.modo === 'laboratorio') {
      const { config } = this.entrada;
      const rng = crearRng(`${semilla}:criaturas`);
      equipoJugador = config.jugador.map((id) => crearCriatura(DATOS, id, config.nivelJugador, rng));
      equipoRival = config.rival.map((id) => crearCriatura(DATOS, id, config.nivelRival, rng));
      objetos = { ...OBJETOS_INICIALES };
      salvaje = config.salvaje;
      nombreRival = salvaje ? 'Salvaje' : 'El ballestero';
    } else {
      equipoJugador = this.entrada.equipo;
      equipoRival = this.entrada.rival;
      objetos = this.entrada.objetos;
      salvaje = this.entrada.salvaje;
      nombreRival = this.entrada.nombreRival;
    }
    const inicio = iniciarCombate(
      {
        semilla,
        jugador: { nombre: 'Tú', equipo: equipoJugador, objetos },
        rival: { nombre: nombreRival, equipo: equipoRival },
        salvaje,
        iaAstuta: this.entrada.modo === 'historia' && this.entrada.iaAstuta,
        repartir: this.entrada.modo === 'historia' && this.entrada.repartir,
      },
      DATOS,
    );
    this.estado = inicio.estado;
    this.ctx = { salvaje, nombreRival };
    void this.reproducir(inicio.eventos);
  }

  // ---------- Reproducción de eventos ----------

  private esperar(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timer = this.time.delayedCall(ms, () => {
        this.saltar = null;
        resolve();
      });
      this.saltar = () => {
        timer.remove(false);
        this.saltar = null;
        resolve();
      };
    });
  }

  private tween(config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({ ...config, onComplete: () => resolve() });
    });
  }

  private async decir(texto: string, ms = 1100): Promise<void> {
    this.texto.setText(texto);
    await this.esperar(ms);
  }

  private async reproducir(eventos: Evento[]): Promise<void> {
    this.ocupado = true;
    this.limpiarMenu();
    for (const ev of eventos) await this.reproducirEvento(ev);
    this.ocupado = false;
    this.refrescarFichas();
    if (this.estado.fin) await this.terminar();
    else if (this.estado.pendiente === 'reemplazo') this.menuEquipo('reemplazo');
    else this.menuPrincipal();
  }

  private async reproducirEvento(ev: Evento): Promise<void> {
    const frases = textosEvento(ev, this.ctx);
    if (ev.tipo === 'entrada' && ev.lado === 'rival') this.rivalesVistos.add(ev.ficha.especie);
    if (ev.tipo === 'noAprende') this.pendientesAprender.push({ indice: ev.indice, movimientoId: ev.movimientoId });
    switch (ev.tipo) {
      case 'entrada':
        await this.mostrarEntrada(ev.lado, ev.indice, ev.ficha);
        break;
      case 'retirada':
        await this.decir(frases[0], 700);
        await this.retirar(ev.lado);
        return;
      case 'usa':
        this.texto.setText(frases[0]);
        await this.embestida(ev.lado);
        await this.esperar(500);
        return;
      case 'danio':
        if (ev.causa === 'ataque') await this.parpadeo(ev.lado);
        await this.ficha[ev.lado].setVida(ev.vida, ev.vidaMax, true);
        for (const f of frases) await this.decir(f, ev.causa === 'ataque' ? 900 : 1100);
        return;
      case 'curacion':
        if (ev.indice === this.activoVisual[ev.lado]) await this.ficha[ev.lado].setVida(ev.vida, ev.vidaMax, true);
        break;
      case 'estado':
        this.ficha[ev.lado].setEstado(ev.estado);
        break;
      case 'despierta':
      case 'curaEstado':
        this.ficha[ev.lado].setEstado(null);
        break;
      case 'debilitado':
        this.ficha[ev.lado].setEstado(null);
        await this.caer(ev.lado);
        break;
      case 'nivel':
        if (ev.indice !== this.activoVisual.jugador) break;
        this.ficha.jugador.setNivel(ev.nivel);
        await this.ficha.jugador.setVida(ev.vida, ev.vidaMax, true);
        break;
      case 'captura':
        await this.animarCaptura(ev.sacudidas, ev.exito);
        break;
    }
    for (const f of frases) await this.decir(f);
  }

  private async mostrarEntrada(lado: Lado, indice: number, ficha: FichaCombate): Promise<void> {
    this.visual[lado]?.destroy();
    this.activoVisual[lado] = indice;
    const p = POSICION[lado];
    const v = crearCriaturaVisual(this, ficha.especie, p.x, p.y, p.tam, lado === 'jugador', lado === 'jugador');
    this.visual[lado] = v;
    this.ficha[lado].mostrar(ficha);
    v.setScale(0.2).setAlpha(0);
    await this.tween({ targets: v, scale: 1, alpha: 1, duration: 350, ease: 'Back.easeOut' });
  }

  private async retirar(lado: Lado): Promise<void> {
    const v = this.visual[lado];
    if (!v) return;
    await this.tween({ targets: v, scale: 0.2, alpha: 0, duration: 250 });
    v.destroy();
    this.visual[lado] = null;
    this.ficha[lado].ocultar();
  }

  private async embestida(lado: Lado): Promise<void> {
    const v = this.visual[lado];
    if (!v) return;
    const dx = lado === 'jugador' ? 50 : -50;
    const dy = lado === 'jugador' ? -30 : 30;
    await this.tween({ targets: v, x: v.x + dx, y: v.y + dy, duration: 110, yoyo: true, ease: 'Quad.easeOut' });
  }

  private async parpadeo(lado: Lado): Promise<void> {
    const v = this.visual[lado];
    if (!v) return;
    await this.tween({ targets: v, alpha: 0.15, duration: 70, yoyo: true, repeat: 2 });
    v.setAlpha(1);
  }

  private async caer(lado: Lado): Promise<void> {
    const v = this.visual[lado];
    if (!v) return;
    await this.tween({ targets: v, y: v.y + 120, alpha: 0, duration: 450, ease: 'Quad.easeIn' });
    v.destroy();
    this.visual[lado] = null;
    this.ficha[lado].ocultar();
  }

  private async animarCaptura(sacudidas: number, exito: boolean): Promise<void> {
    const presa = this.visual.rival;
    // Vuela la tésera que se ha usado, con su dibujo.
    const t = iconoObjeto(this, POSICION.jugador.x, POSICION.jugador.y, this.ultimaTesera, 120) as Phaser.GameObjects.Image;
    await this.tween({ targets: t, x: POSICION.rival.x, y: POSICION.rival.y + 60, angle: 360, duration: 500, ease: 'Quad.easeOut' });
    if (presa) await this.tween({ targets: presa, scale: 0.05, alpha: 0, duration: 250 });
    for (let i = 0; i < sacudidas; i++) {
      await this.esperar(300);
      await this.tween({ targets: t, angle: 20, duration: 110, yoyo: true });
    }
    await this.esperar(300);
    if (exito) {
      // Destellos alrededor: el pacto está sellado.
      for (let i = 0; i < 8; i++) {
        const angulo = (i / 8) * Math.PI * 2;
        const chispa = this.add.star(t.x, t.y, 5, 6, 16, COLOR.oro);
        this.tweens.add({ targets: chispa, x: t.x + Math.cos(angulo) * 110, y: t.y + Math.sin(angulo) * 110, alpha: 0, duration: 600, onComplete: () => chispa.destroy() });
      }
      return;
    }
    t.destroy();
    if (presa) await this.tween({ targets: presa, scale: 1, alpha: 1, duration: 250, ease: 'Back.easeOut' });
  }

  private refrescarFichas(): void {
    for (const lado of ['jugador', 'rival'] as Lado[]) {
      const c = activoDe(this.estado, lado);
      if (c.vida <= 0 || this.visual[lado] === null) continue;
      const max = calcularEstadisticas(c, DATOS).vida;
      void this.ficha[lado].setVida(c.vida, max, false);
      this.ficha[lado].setNivel(c.nivel);
      this.ficha[lado].setEstado(c.estado?.tipo ?? null);
    }
    const j = activoDe(this.estado, 'jugador');
    const desde = expParaNivel(j.nivel);
    const hasta = expParaNivel(j.nivel + 1);
    this.ficha.jugador.setExp((j.exp - desde) / Math.max(1, hasta - desde));
  }

  // ---------- Teclado ----------

  /** Con teclado: las flechas mueven el foco por los botones del menú, Intro pulsa y Esc vuelve. */
  private tecla(e: KeyboardEvent): void {
    if (e.repeat) return;
    this.usaTeclado = true;
    const k = e.key.toLowerCase();
    const aceptar = k === 'enter' || k === ' ' || k === 'z';
    if (this.saltar && (aceptar || k === 'escape' || k === 'x')) {
      this.saltar();
      return;
    }
    const botones = this.botonesMenu();
    if (botones.length === 0) return;
    if (!this.foco || !botones.includes(this.foco)) this.enfocar(botones);
    const dir = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] }[k];
    if (dir) {
      this.moverFoco(botones, dir[0], dir[1]);
      return;
    }
    if (aceptar) this.foco?.pulsar();
    else if (k === 'escape' || k === 'x' || k === 'backspace') botones.find((b) => b.texto === 'Volver')?.pulsar();
  }

  /** Los botones del menú que se pueden pulsar, en orden de lectura. */
  private botonesMenu(): Boton[] {
    const out: Boton[] = [];
    const recorrer = (lista: Phaser.GameObjects.GameObject[]) =>
      lista.forEach((o) => {
        if (o instanceof Boton) {
          if (o.estaActivo && o.visible) out.push(o);
        } else if (o instanceof Phaser.GameObjects.Container) recorrer(o.list);
      });
    if (this.menu) recorrer(this.menu.list);
    return out;
  }

  private enfocar(botones: Boton[], boton?: Boton): void {
    this.foco = boton ?? botones[0] ?? null;
    this.menuConFoco = this.menu;
    this.dibujarFoco();
  }

  /** El botón más cercano en esa dirección. */
  private moverFoco(botones: Boton[], dx: number, dy: number): void {
    const f = this.foco!.getBounds();
    let mejor: Boton | undefined;
    let distancia = Infinity;
    for (const b of botones) {
      if (b === this.foco) continue;
      const r = b.getBounds();
      const vx = r.centerX - f.centerX;
      const vy = r.centerY - f.centerY;
      const avance = vx * dx + vy * dy;
      if (avance <= 0) continue;
      const lateral = Math.abs(vx * dy) + Math.abs(vy * dx);
      const d = avance + lateral * 2;
      if (d < distancia) {
        distancia = d;
        mejor = b;
      }
    }
    if (mejor) this.enfocar(botones, mejor);
  }

  private dibujarFoco(): void {
    const g = this.marcoFoco;
    if (!g) return;
    g.clear();
    const b = this.foco;
    if (!b || !b.visible || !this.usaTeclado) return;
    // Los botones van dentro de contenedores: hace falta su sitio en pantalla.
    const r = b.getBounds();
    g.lineStyle(8, COLOR.oro, 1).strokeRoundedRect(r.x - 8, r.y - 8, r.width + 16, r.height + 16, 34);
  }

  update(): void {
    // Un menú nuevo: el foco vuelve a su primer botón. Sin menú, no se ve.
    if (this.menu !== this.menuConFoco) {
      this.foco = null;
      this.menuConFoco = this.menu;
      this.marcoFoco?.clear();
      if (this.menu && this.usaTeclado) {
        const botones = this.botonesMenu();
        if (botones.length) this.enfocar(botones);
      }
    }
  }

  // ---------- Menús ----------

  private limpiarMenu(): void {
    this.menu?.destroy();
    this.menu = undefined;
  }

  private nuevoMenu(): Phaser.GameObjects.Container {
    this.limpiarMenu();
    this.menu = this.add.container(0, 0);
    return this.menu;
  }

  /**
   * Menú del combate, como en los juegos del género: los cuatro movimientos a la izquierda (70 %)
   * y, a la derecha (30 %), la última tésera usada, la mochila, el equipo y huir en un 2 × 2.
   */
  private menuPrincipal(): void {
    const menu = this.nuevoMenu();
    const yo = activoDe(this.estado, 'jugador');
    const rival = activoDe(this.estado, 'rival');
    const disp = accionesDisponibles(this.estado, DATOS);
    this.texto.setText(`¿Qué hará ${nombreDe(yo, DATOS)}?`);

    const filas = [FILA_MENU[0], FILA_MENU[1]];
    const altoFila = 192;
    const anchoMov = 348;
    const xMov = [24 + anchoMov / 2, 24 + anchoMov + 16 + anchoMov / 2];
    for (let i = 0; i < 4; i++) {
      const x = xMov[i % 2];
      const y = filas[Math.floor(i / 2)];
      const m = yo.movimientos[i];
      if (!m) {
        menu.add(this.add.rectangle(x, y, anchoMov, altoFila - 8, 0xffffff, 0.08).setRounded(30));
        continue;
      }
      const mov = DATOS.movimientos[m.id];
      const tipo = DATOS.tipos.tipos.find((t) => t.id === mov.tipo);
      menu.add(
        new Boton(this, x, y, {
          ancho: anchoMov,
          alto: altoFila,
          texto: mov.nombre,
          subtexto: `${tipo?.nombre ?? ''} · PP ${m.pp}/${mov.pp}`,
          color: tipo?.color ?? COLOR.panel,
          tamano: 38,
          alPulsar: () => void this.ejecutar({ tipo: 'movimiento', indice: i }),
          alMantener: () => this.mostrarInfo(mov, m.pp),
          alSoltar: () => this.ocultarInfo(),
        }).setActivo(disp.movimientos[i] || disp.sinPP),
      );
      if (mov.categoria !== 'estado') {
        const ef = eficacia(DATOS.tipos, mov.tipo, DATOS.especies[rival.especie].tipos);
        if (ef !== 1) {
          const marca = ef === 0 ? 'Sin efecto' : ef < 1 ? `×${ef === 0.25 ? '¼' : '½'}` : `×${ef}`;
          const etiqueta = pildora(this, 0, y - altoFila / 2 + 4, marca, ef > 1 ? COLOR.verde : COLOR.tinta, 20);
          etiqueta.x = x + anchoMov / 2 - etiqueta.width / 2 - 10;
          menu.add(etiqueta);
        }
      }
    }

    // Derecha: la última tésera usada, la mochila, el equipo y huir.
    const capturas = Object.keys(disp.objetos).filter((id) => DATOS.objetos[id].tipo === 'captura');
    const tesera = disp.objetos[this.ultimaTesera] ? this.ultimaTesera : (capturas.find((id) => disp.objetos[id]) ?? this.ultimaTesera);
    const quedan = this.estado.jugador.objetos[tesera] ?? 0;
    const anchoLado = 144;
    const xLado = [24 + 2 * anchoMov + 16 + 16 + anchoLado / 2, ANCHO - 24 - anchoLado / 2];
    const lado: { texto: string; color: number; icono: OpcionesBoton['icono']; activo: boolean; accion: () => void }[] = [
      {
        texto: 'Tésera',
        color: COLOR.oro,
        icono: { objeto: tesera, tam: 84 },
        activo: disp.objetos[tesera] === true,
        accion: () => void this.ejecutar({ tipo: 'objeto', objeto: tesera }),
      },
      { texto: 'Mochila', color: COLOR.bronce, icono: { ui: 'mochila', tam: 84 }, activo: Object.values(disp.objetos).some(Boolean), accion: () => this.menuMochila() },
      { texto: 'Equipo', color: COLOR.verde, icono: { ui: 'equipo', tam: 84 }, activo: disp.cambios.some(Boolean), accion: () => this.menuEquipo('cambio') },
      { texto: 'Huir', color: COLOR.azul, icono: { ui: 'huir', tam: 84 }, activo: disp.huir, accion: () => void this.ejecutar({ tipo: 'huir' }) },
    ];
    lado.forEach((o, i) => {
      const x = xLado[i % 2];
      const y = filas[Math.floor(i / 2)];
      menu.add(new Boton(this, x, y, { ancho: anchoLado, alto: altoFila, texto: o.texto, tamano: 26, color: o.color, icono: o.icono, alPulsar: o.accion }).setActivo(o.activo));
    });
    if (quedan > 0) {
      const n = pildora(this, 0, filas[0] - altoFila / 2 + 4, `×${quedan}`, COLOR.tinta, 20);
      n.x = xLado[0] + anchoLado / 2 - n.width / 2 - 8;
      menu.add(n);
    }

    // Abajo: la ayuda y la tabla de tipos.
    menu.add(this.add.text(40, 1830, 'Mantén pulsado un movimiento para ver qué hace.', estiloTexto(24, COLOR.panelSuave)).setOrigin(0, 0.5));
    menu.add(
      new Boton(this, ANCHO - 170, 1830, { ancho: 290, alto: 92, texto: 'Tipos', tamano: 30, color: COLOR.morado, icono: { ui: 'tipos', tam: 58 }, alPulsar: () => this.verTablaTipos() }),
    );
  }

  private menuMochila(pagina = 0): void {
    const menu = this.nuevoMenu();
    const disp = accionesDisponibles(this.estado, DATOS);
    this.texto.setText('¿Qué objeto usas?');
    const objetos = Object.keys(disp.objetos);
    const porPagina = 4;
    objetos.slice(pagina * porPagina, (pagina + 1) * porPagina).forEach((id, i) => {
      const obj = DATOS.objetos[id];
      const n = this.estado.jugador.objetos[id];
      menu.add(
        new Boton(this, i % 2 === 0 ? 280 : 800, FILA_MENU[Math.floor(i / 2)], {
          ancho: 500,
          alto: 192,
          texto: obj.nombre,
          subtexto: `Tienes ${n}`,
          tamano: 32,
          icono: { objeto: id, tam: 96 },
          alPulsar: () => {
            if (seAplicaACriatura(obj)) this.menuEquipo('objeto', id);
            else void this.ejecutar({ tipo: 'objeto', objeto: id });
          },
          alMantener: () => {
            this.info.setText(`${obj.nombre}\n${obj.descripcion}`).setVisible(true);
            this.texto.setVisible(false);
          },
          alSoltar: () => this.ocultarInfo(),
        }).setActivo(disp.objetos[id]),
      );
    });
    const paginas = Math.ceil(objetos.length / porPagina);
    if (paginas > 1) {
      menu.add(botonFlecha(this, 110, 1830, -1, () => this.menuMochila(pagina - 1), 170, 104).setActivo(pagina > 0));
      menu.add(botonFlecha(this, ANCHO - 110, 1830, 1, () => this.menuMochila(pagina + 1), 170, 104).setActivo(pagina < paginas - 1));
    }
    menu.add(new Boton(this, ANCHO / 2, 1830, { ancho: 360, alto: 104, texto: 'Volver', tamano: 36, icono: { ui: 'cerrar', tam: 54 }, alPulsar: () => this.menuPrincipal() }));
  }

  private menuEquipo(modo: 'cambio' | 'reemplazo' | 'objeto', objeto?: string): void {
    const menu = this.nuevoMenu();
    const equipo = this.estado.jugador.equipo;
    const obj = objeto ? DATOS.objetos[objeto] : undefined;
    this.texto.setText(modo === 'reemplazo' ? '¿Quién sale ahora?' : obj ? `¿A quién aplicas ${obj.nombre}?` : '¿A quién sacas?');
    equipo.forEach((c, i) => {
      const max = calcularEstadisticas(c, DATOS).vida;
      const x = i % 2 === 0 ? 280 : 800;
      const y = 1340 + Math.floor(i / 2) * 156;
      const estado = c.vida <= 0 ? ' · debilitada' : c.estado ? ` · ${ESTADO_VISTA[c.estado.tipo].etiqueta.toLowerCase()}` : '';
      const valido = obj ? motivoNoUsable(obj, c, DATOS) === null : c.vida > 0 && i !== this.estado.jugador.activo;
      const b = new Boton(this, x, y, {
        ancho: 500,
        alto: 142,
        texto: `${nombreDe(c, DATOS)} · Nv ${c.nivel}`,
        subtexto: `Vida ${c.vida}/${max}${estado}`,
        tamano: 30,
        alPulsar: () => {
          if (obj && objeto) void this.ejecutar({ tipo: 'objeto', objeto, objetivo: i });
          else if (modo === 'reemplazo') void this.ejecutar({ tipo: 'reemplazo', indice: i });
          else void this.ejecutar({ tipo: 'cambio', indice: i });
        },
      }).setActivo(valido);
      menu.add(b);
      // La criatura, en su círculo, a la izquierda del botón (dentro de la cara, para que se hunda con él).
      const circulo = this.add.graphics();
      circulo.fillStyle(colorPedestal(c.especie), 1).fillCircle(-196, -3, 46);
      const figura = crearCriaturaVisual(this, c.especie, -196, -6, 92, true);
      if (c.vida <= 0) figura.setAlpha(0.5);
      b.add([circulo, figura]);
    });
    if (modo !== 'reemplazo') {
      menu.add(new Boton(this, ANCHO / 2, 1830, { ancho: 360, alto: 104, texto: 'Volver', tamano: 36, icono: { ui: 'cerrar', tam: 54 }, alPulsar: () => this.menuPrincipal() }));
    }
  }

  private async ejecutar(accion: Accion): Promise<void> {
    if (this.ocupado) return;
    if (accion.tipo === 'objeto' && DATOS.objetos[accion.objeto]?.tipo === 'captura') this.ultimaTesera = accion.objeto;
    let r;
    try {
      r = resolverTurno(this.estado, accion, DATOS);
    } catch (err) {
      this.texto.setText(err instanceof Error ? err.message : String(err));
      return;
    }
    this.estado = r.estado;
    await this.reproducir(r.eventos);
  }

  // ---------- Ayuda de movimientos ----------

  /** La tabla de tipos encima del combate, abierta con el tipo del rival. */
  private verTablaTipos(): void {
    const capa = this.add.container(0, -MARGEN_VERTICAL).setDepth(50);
    capa.add(this.add.rectangle(0, 0, ANCHO, ALTO, COLOR.fondo).setOrigin(0, 0).setInteractive());
    fondoMenu(this, capa, ALTO, COLOR.morado);
    cabecera(this, capa, 'Tabla de tipos', 'tipos', oscurecer(COLOR.morado, 0.25));
    const rival = activoDe(this.estado, 'rival');
    construirTablaTipos(this, capa, 130, DATOS.especies[rival.especie].tipos[0]);
    capa.add(new Boton(this, ANCHO / 2, ALTO - 100, { ancho: 360, alto: 112, texto: 'Volver', tamano: 38, icono: { ui: 'cerrar', tam: 56 }, alPulsar: () => capa.destroy() }));
  }

  private mostrarInfo(mov: Movimiento, pp?: number): void {
    const d = describirMovimiento(mov, pp);
    this.info.setText(`${d.titulo}\n${d.cifras}\n${d.efecto}`).setVisible(true);
    this.texto.setVisible(false);
  }

  private ocultarInfo(): void {
    this.info.setVisible(false);
    this.texto.setVisible(true);
  }

  // ---------- Final ----------

  private async terminar(): Promise<void> {
    this.ocupado = true;
    if (this.estado.fin === 'victoria' || this.estado.fin === 'captura') await this.evoluciones();
    await this.aprenderPendientes();
    this.ocupado = false;
    const textos: Record<string, string> = {
      victoria: '¡Victoria!',
      derrota: 'Derrota…',
      huida: 'Has huido.',
      captura: '¡Captura!',
    };
    this.texto.setText(textos[this.estado.fin ?? ''] ?? '');
    const menu = this.nuevoMenu();
    const entrada = this.entrada;
    if (entrada.modo === 'historia') {
      menu.add(
        new Boton(this, ANCHO / 2, 1500, {
          ancho: 600,
          alto: 170,
          texto: 'Continuar',
          color: COLOR.verde,
          alPulsar: () =>
            entrada.alTerminar({
              resultado: this.estado.fin ?? 'huida',
              equipo: this.estado.jugador.equipo,
              objetos: this.estado.jugador.objetos,
              capturada: this.estado.capturada,
              rivales: [...this.rivalesVistos],
              ultimaTesera: this.ultimaTesera,
            }),
        }),
      );
      return;
    }
    const config = entrada.config;
    menu.add(
      new Boton(this, 280, 1500, {
        ancho: 500,
        alto: 170,
        texto: 'Otra vez',
        color: COLOR.rojo,
        alPulsar: () => this.scene.start('Combate', { modo: 'laboratorio', config, semilla: Math.floor(Math.random() * 1e9) }),
      }),
    );
    menu.add(
      new Boton(this, 800, 1500, {
        ancho: 500,
        alto: 170,
        texto: 'Laboratorio',
        alPulsar: () => this.scene.start('Laboratorio'),
      }),
    );
  }

  /** Movimientos que no cabían: el jugador elige cuál olvida, o no aprende el nuevo. */
  private async aprenderPendientes(): Promise<void> {
    for (const { indice, movimientoId } of this.pendientesAprender) {
      const c = this.estado.jugador.equipo[indice];
      if (!c || c.movimientos.some((m) => m.id === movimientoId)) continue;
      const nuevo = DATOS.movimientos[movimientoId];
      const nombre = nombreDe(c, DATOS);
      const eleccion = await new Promise<number>((resolve) => {
        const menu = this.nuevoMenu();
        this.texto.setText(`${nombre} quiere aprender ${nuevo.nombre}. ¿Qué movimiento olvida?`);
        c.movimientos.forEach((m, i) => {
          const mov = DATOS.movimientos[m.id];
          const tipo = DATOS.tipos.tipos.find((t) => t.id === mov.tipo);
          menu.add(
            new Boton(this, i % 2 === 0 ? 280 : 800, FILA_MENU[i < 2 ? 0 : 1], {
              ancho: 500,
              alto: 192,
              texto: mov.nombre,
              subtexto: `${tipo?.nombre ?? ''} · PP ${m.pp}/${mov.pp}`,
              color: tipo?.color ?? COLOR.panel,
              tamano: 40,
              alPulsar: () => resolve(i),
              alMantener: () => this.mostrarInfo(mov, m.pp),
              alSoltar: () => this.ocultarInfo(),
            }),
          );
        });
        const tipoNuevo = DATOS.tipos.tipos.find((t) => t.id === nuevo.tipo);
        menu.add(
          new Boton(this, 280, 1810, {
            ancho: 500,
            alto: 130,
            texto: `Ver ${nuevo.nombre}`,
            subtexto: tipoNuevo?.nombre ?? '',
            tamano: 34,
            alPulsar: () => this.mostrarInfo(nuevo),
            alMantener: () => this.mostrarInfo(nuevo),
            alSoltar: () => this.ocultarInfo(),
          }),
        );
        menu.add(new Boton(this, 800, 1810, { ancho: 500, alto: 130, texto: 'No aprenderlo', tamano: 36, color: COLOR.rojo, alPulsar: () => resolve(-1) }));
      });
      this.ocultarInfo();
      this.limpiarMenu();
      if (eleccion < 0) {
        await this.decir(`${nombre} no aprende ${nuevo.nombre}.`);
        continue;
      }
      const olvidado = DATOS.movimientos[c.movimientos[eleccion].id].nombre;
      this.estado.jugador.equipo[indice] = aprenderMovimiento(c, movimientoId, eleccion, DATOS);
      await this.decir(`${nombre} olvida ${olvidado} y aprende ${nuevo.nombre}.`, 1600);
    }
    this.pendientesAprender = [];
  }

  /** Como en Pokémon, las evoluciones se ven al acabar el combate. */
  private async evoluciones(): Promise<void> {
    const equipo = this.estado.jugador.equipo;
    for (let i = 0; i < equipo.length; i++) {
      const c = equipo[i];
      if (c.vida <= 0 || !evolucionPendiente(c, DATOS)) continue;
      const antes = nombreDe(c, DATOS);
      const nueva = evolucionar(c, DATOS);
      equipo[i] = nueva;
      const v = this.visual.jugador;
      if (i === this.estado.jugador.activo && v) {
        await this.decir(`¿Eh? ¡${antes} está evolucionando!`, 900);
        await this.tween({ targets: v, alpha: 0.1, duration: 160, yoyo: true, repeat: 5 });
        v.destroy();
        const p = POSICION.jugador;
        this.visual.jugador = crearCriaturaVisual(this, nueva.especie, p.x, p.y, p.tam, true, true);
        this.ficha.jugador.mostrar(fichaDe(nueva, DATOS));
      }
      await this.decir(`¡${antes} se ha convertido en ${DATOS.especies[nueva.especie].nombre}!`, 1600);
    }
  }
}
