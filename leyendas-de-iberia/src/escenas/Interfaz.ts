import Phaser from 'phaser';
import type { Dir } from '../core/mundo';
import type { Partida, Posicion } from '../core/partida';
import { anadirCriatura, curarEquipo, darObjeto, marcarCapturado, marcarVisto, MAX_EQUIPO, quienSabe, zonasVisitadas } from '../core/partida';
import { crearCriatura, nombreDe, sexoDe } from '../core/criatura';
import { CAPITULOS, ENTRADAS, ZONAS } from '../data/mundo';
import { dondeSale } from '../core/mundo';
import { escalaMapa, lugarDe, MAPA_ALTO, MAPA_ANCHO, mapaZonas } from '../ui/mapaVisual';
import { LUGARES } from '../data/lugares';
import { aplicarCuracion, equipar, motivoNoUsable, quitarObjeto, seAplicaACriatura, usoDe } from '../core/objetos';
import { COLUMNAS_PAGINA, enLugar, HUECOS_PAGINA, liberar, mover, type Lugar } from '../core/almacen';
import { calcularEstadisticas } from '../core/estadisticas';
import { aprenderMovimiento, destinoConObjeto, evolucionar, evolucionPendiente, expParaNivel, subirNivel } from '../core/progreso';
import type { Criatura, Movimiento } from '../core/modelo';
import { NOMBRE_ESTADISTICA, type EstadisticaCombate } from '../core/modelo';
import { DATOS } from '../data';
import { INICIALES } from '../data/especies';
import { BOLSILLOS, CATEGORIAS } from '../data/objetos';
import { Barra, Boton, botonFlecha, filaTipos, NOMBRE_SEXO, simboloSexo } from '../ui/componentes';
import { crearCriaturaVisual } from '../ui/criaturaVisual';
import { conArticulo, describirMovimiento, ESTADO_VISTA } from '../ui/textos';
import { iconoObjeto, iconoUI, type IconoUI } from '../ui/objetoVisual';
import { claveRetrato } from '../ui/retratoVisual';
import { construirTablaTipos, textoMultiplicador } from '../ui/tablaTipos';
import { debilidades } from '../core/tipos';
import { guardarPartida } from '../ui/sesion';
import { aclarar, ALTO, ANCHO, COLOR, estiloTexto, MARGEN_INFERIOR, oscurecer, textoSobre } from '../ui/tema';
import { cabecera, colorPedestal, colorTipoDe, fondoMenu, franja, pildora, ventana } from '../ui/ventanas';

/** Alto del mando, abajo del todo y hasta el borde de la pantalla. El mapa ocupa el resto. */
const ALTO_MANDO = 500 + MARGEN_INFERIOR;

// Capa de interfaz del modo historia, por encima del mapa: mando táctil, teclado, diálogos,
// elecciones y menús. El mapa le pregunta por la dirección pulsada y escucha los eventos «a» y
// «menu». Todo lo que espera al jugador devuelve una promesa.

/** Alto de la zona del mapa; debajo va el mando. En móviles alargados el mapa gana alto. */
export const ALTO_MAPA = ALTO - ALTO_MANDO;
export const MONEDA = 'maravedís';

// El mando va pegado abajo, al alcance del pulgar, como en los emuladores de GBA y DS (los
// skins de Delta): la cruceta a la izquierda, A y B en diagonal a la derecha y Menú abajo en
// el centro, donde va Start. Los botones quedan por encima de la barra de inicio del iPhone.
const SUELO = ALTO - MARGEN_INFERIOR;
const CRUCETA = { x: 240, y: SUELO - 280, radio: 180 };
const BOTON_A = { x: 900, y: SUELO - 330, radio: 96 };
const BOTON_B = { x: 725, y: SUELO - 196, radio: 80 };
const BOTON_MENU = { x: ANCHO / 2, y: SUELO - 50 };
const TECLAS_DIR: Record<string, Dir> = {
  arrowup: 'arriba',
  w: 'arriba',
  arrowdown: 'abajo',
  s: 'abajo',
  arrowleft: 'izquierda',
  a: 'izquierda',
  arrowright: 'derecha',
  d: 'derecha',
};

export class Interfaz extends Phaser.Scene {
  private dirTactil: Dir | null = null;
  private punteroCruceta: number | null = null;
  private teclas!: Record<'arriba' | 'abajo' | 'izquierda' | 'derecha' | 'w' | 'a' | 's' | 'd' | 'correr', Phaser.Input.Keyboard.Key>;
  /** Dedo que mantiene pulsado B (para correr). */
  private punteroB: number | null = null;
  private flechas: Partial<Record<Dir, Phaser.GameObjects.Graphics>> = {};

  private capaDialogo!: Phaser.GameObjects.Container;
  private textoDialogo!: Phaser.GameObjects.Text;
  private nombreDialogo!: Phaser.GameObjects.Text;
  private fondoNombre!: Phaser.GameObjects.Rectangle;
  private marcoRetrato!: Phaser.GameObjects.Graphics;
  private retrato!: Phaser.GameObjects.Image;
  private indicador!: Phaser.GameObjects.Text;
  private alAvanzar: (() => void) | null = null;

  private capaEleccion?: Phaser.GameObjects.Container;
  private opciones: { marca: Phaser.GameObjects.Graphics; elegir: () => void }[] = [];
  private seleccion = 0;
  private alCancelar: (() => void) | null = null;

  private capaMenu?: Phaser.GameObjects.Container;
  private alAtras: (() => void) | null = null;
  /** En los menús, qué hacen la cruceta y A. Se pone a null al cambiar de pantalla. */
  private nav: { mover: (dir: Dir) => void; aceptar: () => void } | null = null;
  private ovilloPermitido = false;
  private alUsarOvillo: (() => void) | null = null;
  private avisos?: Phaser.GameObjects.Container;
  private esperas = 0;

  constructor() {
    super('Interfaz');
  }

  /** Hay algo esperando al jugador: el mapa no debe moverse. */
  get ocupado(): boolean {
    return this.esperas > 0 || this.alAvanzar !== null || this.capaEleccion !== undefined || this.capaMenu !== undefined;
  }

  create(): void {
    this.dirTactil = null;
    this.punteroCruceta = null;
    this.alAvanzar = null;
    this.capaEleccion = undefined;
    this.capaMenu = undefined;
    this.esperas = 0;
    this.input.addPointer(2);
    this.crearMando();
    this.crearDialogo();
    this.crearTeclado();
    // Mientras dura un combate esta escena duerme y no se entera de que sueltas la cruceta o la
    // tecla: al volver, el jugador seguiría andando solo.
    const soltar = () => this.soltarControles();
    this.events.on(Phaser.Scenes.Events.SLEEP, soltar);
    this.events.on(Phaser.Scenes.Events.WAKE, soltar);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.SLEEP, soltar);
      this.events.off(Phaser.Scenes.Events.WAKE, soltar);
    });
  }

  // ---------- Mando ----------

  private crearMando(): void {
    this.add.rectangle(0, ALTO_MAPA, ANCHO, ALTO - ALTO_MAPA, COLOR.fondo).setOrigin(0, 0);
    this.add.rectangle(0, ALTO_MAPA, ANCHO, 6, COLOR.celeste).setOrigin(0, 0);

    // Cruceta: una sola zona circular; la dirección sale del ángulo del dedo.
    const { x, y, radio } = CRUCETA;
    this.add.circle(x, y, radio, 0x1f2550).setStrokeStyle(6, 0x2c3470);
    const brazo = 116;
    const grosor = 116;
    this.add.rectangle(x, y, grosor, brazo * 2 + grosor, 0x343d80).setRounded(26);
    this.add.rectangle(x, y, brazo * 2 + grosor, grosor, 0x343d80).setRounded(26);
    const puntas: Record<Dir, [number, number]> = {
      arriba: [0, -brazo],
      abajo: [0, brazo],
      izquierda: [-brazo, 0],
      derecha: [brazo, 0],
    };
    for (const [dir, [dx, dy]] of Object.entries(puntas) as [Dir, [number, number]][]) {
      const g = this.add.graphics();
      this.flechas[dir] = g;
      this.dibujarFlecha(g, x + dx, y + dy, dir, false);
    }
    const zona = this.add.circle(x, y, radio, 0xffffff, 0.001).setInteractive();
    const actualizar = (p: Phaser.Input.Pointer) => {
      const dx = p.x - x;
      const dy = p.y - y;
      let dir: Dir | null = null;
      if (Math.hypot(dx, dy) > 30) dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'derecha' : 'izquierda') : dy > 0 ? 'abajo' : 'arriba';
      this.setDirTactil(dir);
    };
    zona.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.punteroCruceta = p.id;
      actualizar(p);
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.id === this.punteroCruceta && p.isDown) actualizar(p);
    });
    const soltar = (p: Phaser.Input.Pointer) => {
      if (p.id === this.punteroCruceta) {
        this.punteroCruceta = null;
        this.setDirTactil(null);
      }
    };
    this.input.on('pointerup', soltar);
    this.input.on('pointerupoutside', soltar);

    this.botonRedondo(BOTON_A.x, BOTON_A.y, BOTON_A.radio, COLOR.rojo, 'A', 'Hablar', () => this.pulsarA());
    // B mantenido, con las alpargatas, es correr.
    const b = this.botonRedondo(BOTON_B.x, BOTON_B.y, BOTON_B.radio, COLOR.azul, 'B', 'Volver', () => this.pulsarB());
    b.on('pointerdown', (p: Phaser.Input.Pointer) => (this.punteroB = p.id));
    const soltarB = (p: Phaser.Input.Pointer) => {
      if (p.id === this.punteroB) this.punteroB = null;
    };
    this.input.on('pointerup', soltarB);
    this.input.on('pointerupoutside', soltarB);
    new Boton(this, BOTON_MENU.x, BOTON_MENU.y, { ancho: 240, alto: 80, texto: 'Menú', tamano: 34, alPulsar: () => this.pulsarMenu() });
  }

  private dibujarFlecha(g: Phaser.GameObjects.Graphics, x: number, y: number, dir: Dir, activa: boolean): void {
    g.clear();
    g.fillStyle(activa ? COLOR.oro : COLOR.panel, activa ? 1 : 0.85);
    const s = 34;
    const pts: Record<Dir, number[]> = {
      arriba: [x, y - s, x - s, y + s * 0.6, x + s, y + s * 0.6],
      abajo: [x, y + s, x - s, y - s * 0.6, x + s, y - s * 0.6],
      izquierda: [x - s, y, x + s * 0.6, y - s, x + s * 0.6, y + s],
      derecha: [x + s, y, x - s * 0.6, y - s, x - s * 0.6, y + s],
    };
    const p = pts[dir];
    g.fillTriangle(p[0], p[1], p[2], p[3], p[4], p[5]);
  }

  private setDirTactil(dir: Dir | null): void {
    if (dir === this.dirTactil) return;
    const anterior = this.dirTactil;
    this.dirTactil = dir;
    const brazo = 116;
    const pos: Record<Dir, [number, number]> = { arriba: [0, -brazo], abajo: [0, brazo], izquierda: [-brazo, 0], derecha: [brazo, 0] };
    for (const d of [anterior, dir]) {
      if (!d) continue;
      this.dibujarFlecha(this.flechas[d]!, CRUCETA.x + pos[d][0], CRUCETA.y + pos[d][1], d, d === dir);
    }
    // En menús y elecciones, la cruceta mueve la selección.
    if (dir && this.capaEleccion) this.moverSeleccion(dir === 'arriba' || dir === 'izquierda' ? -1 : 1);
    else if (dir && this.capaMenu) this.nav?.mover(dir);
  }

  private botonRedondo(x: number, y: number, r: number, color: number, letra: string, etiqueta: string, accion: () => void): Phaser.GameObjects.Arc {
    this.add.circle(x, y + 8, r, oscurecer(color, 0.35));
    const c = this.add.circle(x, y, r, color).setInteractive({ useHandCursor: true });
    this.add.circle(x, y - r * 0.35, r * 0.6, 0xffffff, 0.14);
    this.add.text(x, y, letra, estiloTexto(Math.round(r * 0.8), COLOR.panel, true)).setOrigin(0.5);
    this.add.text(x, y + r + 30, etiqueta, estiloTexto(28, COLOR.panelSuave, true)).setOrigin(0.5);
    let ultima = -Infinity;
    c.on('pointerdown', () => {
      c.setScale(0.94);
      if (this.time.now - ultima < 150) return;
      ultima = this.time.now;
      accion();
    });
    c.on('pointerup', () => c.setScale(1));
    c.on('pointerout', () => c.setScale(1));
    return c;
  }

  private crearTeclado(): void {
    const kb = this.input.keyboard;
    if (!kb) return;
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.teclas = kb.addKeys({
      arriba: K.UP,
      abajo: K.DOWN,
      izquierda: K.LEFT,
      derecha: K.RIGHT,
      w: K.W,
      a: K.A,
      s: K.S,
      d: K.D,
      correr: K.SHIFT,
    }) as typeof this.teclas;
    kb.on('keydown', (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === 'enter' || k === ' ' || k === 'z') this.pulsarA();
      else if (k === 'escape' || k === 'backspace' || k === 'x') this.pulsarB();
      else if (k === 'm') this.pulsarMenu();
      else if (this.capaEleccion && (k === 'arrowup' || k === 'w' || k === 'arrowleft' || k === 'a')) this.moverSeleccion(-1);
      else if (this.capaEleccion && (k === 'arrowdown' || k === 's' || k === 'arrowright' || k === 'd')) this.moverSeleccion(1);
      else if (this.capaMenu && this.nav) {
        const dir = TECLAS_DIR[k];
        if (dir) this.nav.mover(dir);
      }
    });
  }

  /** Olvida las direcciones que estuvieran pulsadas. */
  soltarControles(): void {
    this.punteroCruceta = null;
    this.punteroB = null;
    this.setDirTactil(null);
    this.input.keyboard?.resetKeys();
  }

  /** Mantiene pulsado B (o Mayúsculas en el teclado): con las alpargatas, el jugador corre. */
  corriendo(): boolean {
    return this.punteroB !== null || Boolean(this.teclas?.correr.isDown);
  }

  /** Dirección que el jugador mantiene pulsada, en pantalla o en el teclado. */
  direccion(): Dir | null {
    const t = this.teclas;
    if (t) {
      if (t.arriba.isDown || t.w.isDown) return 'arriba';
      if (t.abajo.isDown || t.s.isDown) return 'abajo';
      if (t.izquierda.isDown || t.a.isDown) return 'izquierda';
      if (t.derecha.isDown || t.d.isDown) return 'derecha';
    }
    return this.dirTactil;
  }

  private pulsarA(): void {
    if (this.alAvanzar) this.alAvanzar();
    else if (this.capaEleccion) this.opciones[this.seleccion]?.elegir();
    else if (this.capaMenu) this.nav?.aceptar();
    else if (!this.ocupado) this.events.emit('a');
  }

  private pulsarB(): void {
    if (this.alAvanzar) this.alAvanzar();
    else if (this.capaEleccion) this.alCancelar?.();
    else if (this.capaMenu) this.alAtras?.();
    else if (!this.ocupado) this.events.emit('menu');
  }

  private pulsarMenu(): void {
    if (!this.ocupado) this.events.emit('menu');
    else if (this.capaMenu) this.alAtras?.();
  }

  // ---------- Diálogos ----------

  private crearDialogo(): void {
    const c = this.add.container(0, 0).setDepth(20);
    // Tocar cualquier parte del mapa también avanza el texto.
    const zona = this.add.rectangle(0, 0, ANCHO, ALTO_MAPA, 0x000000, 0.001).setOrigin(0, 0).setInteractive();
    zona.on('pointerdown', () => this.alAvanzar?.());
    const arriba = ALTO_MAPA - 262;
    // Retrato de quien habla: un busto que asoma por encima del cuadro, a la izquierda.
    this.marcoRetrato = this.add.graphics();
    this.marcoRetrato.fillStyle(0x000000, 0.22).fillRoundedRect(40, arriba - 236, 280, 270, 36);
    this.marcoRetrato.fillGradientStyle(COLOR.cielo, COLOR.cielo, COLOR.azul, COLOR.azul, 1);
    this.marcoRetrato.fillRoundedRect(40, arriba - 244, 280, 270, 36);
    this.marcoRetrato.lineStyle(6, COLOR.panel, 1).strokeRoundedRect(40, arriba - 244, 280, 270, 36);
    this.retrato = this.add.image(180, arriba + 26, '__DEFAULT').setOrigin(0.5, 1);
    const fondo = ventana(this, 24, arriba, ANCHO - 48, 238);
    this.fondoNombre = this.add.rectangle(56, ALTO_MAPA - 294, 300, 64, COLOR.rojo).setOrigin(0, 0).setRounded(32);
    this.nombreDialogo = this.add.text(84, ALTO_MAPA - 262, '', estiloTexto(32, COLOR.panel, true)).setOrigin(0, 0.5);
    this.textoDialogo = this.add.text(64, ALTO_MAPA - 222, '', {
      ...estiloTexto(40, COLOR.tinta),
      wordWrap: { width: ANCHO - 140 },
      lineSpacing: 10,
    });
    this.indicador = this.add.text(ANCHO - 72, ALTO_MAPA - 60, '▼', estiloTexto(30, COLOR.rojo)).setOrigin(0.5);
    this.tweens.add({ targets: this.indicador, y: ALTO_MAPA - 52, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    c.add([zona, this.marcoRetrato, this.retrato, fondo, this.fondoNombre, this.nombreDialogo, this.textoDialogo, this.indicador]);
    c.setVisible(false);
    this.capaDialogo = c;
  }

  mostrarTexto(texto: string, quien?: string, indicador = true): void {
    this.capaDialogo.setVisible(true);
    this.textoDialogo.setText(texto);
    this.nombreDialogo.setText(quien ?? '');
    this.fondoNombre.setVisible(Boolean(quien));
    this.nombreDialogo.setVisible(Boolean(quien));
    const retrato = claveRetrato(quien);
    this.marcoRetrato.setVisible(retrato !== null);
    this.retrato.setVisible(retrato !== null);
    if (retrato) this.retrato.setTexture(retrato).setScale(300 / this.retrato.height);
    // Con retrato, el nombre va a su derecha.
    const x = retrato ? 344 : 56;
    this.fondoNombre.setX(x);
    this.nombreDialogo.setX(x + 28);
    // Cambiar `width` a mano no redibuja el rectángulo: hay que pasar por `setSize`.
    if (quien) this.fondoNombre.setSize(this.nombreDialogo.width + 56, 64).setRounded(32);
    this.indicador.setVisible(indicador);
  }

  /** Muestra un texto y espera a que el jugador lo pase. */
  decir(texto: string, quien?: string): Promise<void> {
    this.mostrarTexto(texto, quien);
    return new Promise((resolve) => {
      // Un instante de gracia para que el mismo toque que abrió el texto no lo cierre.
      const abierto = this.time.now;
      this.alAvanzar = () => {
        if (this.time.now - abierto < 120) return;
        this.alAvanzar = null;
        resolve();
      };
    });
  }

  cerrarDialogo(): void {
    this.capaDialogo.setVisible(false);
    this.alAvanzar = null;
  }

  /** Pregunta con opciones. Devuelve el índice elegido; B elige la última (cancelar). */
  /** `cancelar`: la opción que elige B (la última, si no se dice); con `null`, B no hace nada. */
  elegir(pregunta: string, opciones: string[], quien?: string, cancelar: number | null = opciones.length - 1): Promise<number> {
    this.mostrarTexto(pregunta, quien, false);
    return new Promise((resolve) => {
      const c = this.add.container(0, 0).setDepth(30);
      this.capaEleccion = c;
      const terminar = (i: number) => {
        c.destroy();
        this.capaEleccion = undefined;
        this.alCancelar = null;
        this.opciones = [];
        resolve(i);
      };
      const altoFila = 100;
      const ancho = 460;
      const alto = opciones.length * altoFila + 28;
      const x = ANCHO - ancho - 32;
      const y = ALTO_MAPA - 310 - alto;
      c.add(ventana(this, x, y, ancho, alto));
      this.opciones = opciones.map((texto, i) => {
        const fy = y + 14 + i * altoFila;
        const marca = franja(this, x + 12, fy + 6, ancho - 24, altoFila - 12);
        c.add(marca);
        c.add(this.add.text(x + ancho / 2, fy + altoFila / 2, texto, estiloTexto(38, COLOR.tinta, true)).setOrigin(0.5));
        const zona = this.add.rectangle(x + ancho / 2, fy + altoFila / 2, ancho, altoFila, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
        zona.on('pointerup', () => terminar(i));
        c.add(zona);
        return { marca, elegir: () => terminar(i) };
      });
      this.seleccion = 0;
      this.marcarSeleccion();
      this.alCancelar = cancelar === null ? null : () => terminar(cancelar);
    });
  }

  private moverSeleccion(delta: number): void {
    if (this.opciones.length === 0) return;
    this.seleccion = (this.seleccion + delta + this.opciones.length) % this.opciones.length;
    this.marcarSeleccion();
  }

  private marcarSeleccion(): void {
    this.opciones.forEach((o, i) => o.marca.setVisible(i === this.seleccion));
  }

  /** Aviso breve arriba del mapa que no detiene el juego. */
  aviso(texto: string): void {
    this.avisos?.destroy();
    const t = this.add.text(0, 0, texto, { ...estiloTexto(34, COLOR.panel, true), wordWrap: { width: ANCHO - 160 } }).setOrigin(0.5);
    const ancho = t.width + 80;
    const alto = t.height + 36;
    const fondo = this.add.graphics();
    fondo.fillStyle(COLOR.tinta, 0.92).fillRoundedRect(-ancho / 2, -alto / 2, ancho, alto, Math.min(alto / 2, 40));
    const c = this.add.container(ANCHO / 2, 90, [fondo, t]).setDepth(40).setAlpha(0);
    this.avisos = c;
    this.tweens.add({ targets: c, alpha: 1, y: 110, duration: 200, yoyo: true, hold: 1600, onComplete: () => c.destroy() });
  }

  /** Pantalla negra con textos de narración, uno tras otro. */
  async pantallaFin(textos: string[]): Promise<void> {
    const negro = this.add.rectangle(0, 0, ANCHO, ALTO_MAPA, 0x000000, 0.92).setOrigin(0, 0).setDepth(15);
    for (const t of textos) await this.decir(t);
    this.cerrarDialogo();
    negro.destroy();
  }

  // ---------- Elección de inicial ----------

  async elegirInicial(): Promise<string> {
    this.esperas++;
    try {
      for (;;) {
        const especie = await new Promise<string>((resolve) => {
          const c = this.abrirCapa('Elige compañera', { color: COLOR.rojo });
          const ancho = 320;
          INICIALES.forEach((id, i) => {
            const e = DATOS.especies[id];
            const x = 24 + i * (ancho + 24);
            const cx = x + ancho / 2;
            c.add(ventana(this, x, 170, ancho, 760, { radio: 36 }));
            const circulo = this.add.graphics();
            circulo.fillStyle(colorPedestal(id), 1).fillCircle(cx, 360, 130);
            c.add(circulo);
            c.add(crearCriaturaVisual(this, id, cx, 350, 230, true));
            c.add(this.add.text(cx, 540, e.nombre, { ...estiloTexto(40, COLOR.tinta, true), align: 'center' }).setOrigin(0.5));
            const tipos = this.add.container(0, 0);
            const anchoTipos = filaTipos(this, tipos, 0, 600, e.tipos, 26);
            tipos.x = cx - anchoTipos / 2;
            c.add(tipos);
            c.add(
              this.add
                .text(cx, 650, e.descripcion, { ...estiloTexto(23, COLOR.tintaSuave), align: 'center', wordWrap: { width: ancho - 40 }, lineSpacing: 4 })
                .setOrigin(0.5, 0),
            );
            const zona = this.add.rectangle(cx, 550, ancho, 760, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
            zona.on('pointerup', () => resolve(id));
            c.add(zona);
          });
        });
        this.cerrarCapa();
        const si = await this.elegir(`¿Eliges a ${DATOS.especies[especie].nombre}?`, ['Sí', 'No']);
        this.cerrarDialogo();
        if (si === 0) return especie;
      }
    } finally {
      this.esperas--;
    }
  }

  // ---------- Capas de menú ----------

  /**
   * Abre una pantalla de menú encima del mapa. Con `superpuesta`, el mapa se sigue viendo
   * oscurecido detrás (el menú de pausa); si no, la tapa un fondo de color con rayas y una
   * pestaña de título.
   */
  private abrirCapa(titulo: string, op: { superpuesta?: boolean; icono?: IconoUI; color?: number } = {}): Phaser.GameObjects.Container {
    this.destruirCapa();
    this.nav = null;
    const c = this.add.container(0, 0).setDepth(25);
    if (op.superpuesta) {
      c.add(this.add.rectangle(0, 0, ANCHO, ALTO_MAPA, 0x0b0e24, 0.6).setOrigin(0, 0).setInteractive());
    } else {
      c.add(this.add.rectangle(0, 0, ANCHO, ALTO_MAPA, COLOR.fondo).setOrigin(0, 0).setInteractive());
      fondoMenu(this, c, ALTO_MAPA, op.color ?? COLOR.azul);
      cabecera(this, c, titulo, op.icono, oscurecer(op.color ?? COLOR.azul, 0.25));
    }
    this.capaMenu = c;
    return c;
  }

  /**
   * Quita la pantalla de menú y sus animaciones sin fin (rayas del fondo, criaturas que se
   * mecen): si no, seguirían vivas y se irían acumulando al navegar por los menús.
   */
  private destruirCapa(): void {
    if (!this.capaMenu) return;
    const todos: Phaser.GameObjects.GameObject[] = [];
    const recorrer = (lista: Phaser.GameObjects.GameObject[]) =>
      lista.forEach((o) => {
        todos.push(o);
        if (o instanceof Phaser.GameObjects.Container) recorrer(o.list);
      });
    recorrer(this.capaMenu.list);
    this.tweens.killTweensOf(todos);
    this.capaMenu.destroy();
    this.capaMenu = undefined;
  }

  private cerrarCapa(): void {
    this.destruirCapa();
    this.alAtras = null;
    this.nav = null;
  }

  /** Barra de abajo con un texto de ayuda, en blanco sobre azul noche. */
  private barraAyuda(c: Phaser.GameObjects.Container, texto: string, ancho = ANCHO - 48): Phaser.GameObjects.Text {
    const y = ALTO_MAPA - 130;
    c.add(ventana(this, 24, y, ancho, 106, { color: COLOR.tinta, opacidad: 0.9, borde: null, radio: 53 }));
    const t = this.add.text(64, y + 53, texto, { ...estiloTexto(30, COLOR.panel), wordWrap: { width: ancho - 80 } }).setOrigin(0, 0.5);
    c.add(t);
    return t;
  }

  /**
   * Menú de pausa, como en los juegos actuales: el equipo a la izquierda, las opciones con
   * iconos a la derecha y, arriba, tu tarjeta. Devuelve `'ovillo'` si se ha usado una Cuerda
   * huida, para que el mapa lleve al jugador al mesón.
   */
  menu(
    p: Partida,
    op: { ovilloPermitido: boolean; exterior?: boolean } = { ovilloPermitido: false },
  ): Promise<'ovillo' | { viajar: Posicion; texto?: string } | undefined> {
    this.ovilloPermitido = op.ovilloPermitido;
    return new Promise((resolve) => {
      this.alUsarOvillo = () => {
        this.cerrarCapa();
        resolve('ovillo');
      };
      const principal = (inicio: { col: number; fila: number } = { col: 1, fila: 0 }) => {
        const c = this.abrirCapa(p.nombre, { superpuesta: true });
        this.alAtras = () => {
          this.cerrarCapa();
          resolve(undefined);
        };
        this.barraJugador(c, p);
        const volverA = (col: number, fila: number) => () => principal({ col, fila });
        // Volver a la opción del menú con ese texto (las opciones cambian según lo que tengas).
        const aqui = (texto: string) => volverA(1, opciones.findIndex((o) => o.texto === texto));
        const viajar = (pos: Posicion, texto?: string) => resolve({ viajar: pos, texto });
        const opciones: { texto: string; icono: IconoUI; color: number; ayuda: string; activo: boolean; accion: () => void }[] = [
          {
            texto: 'Equipo',
            icono: 'equipo',
            color: COLOR.verde,
            ayuda: 'Mira cómo están tus criaturas, cámbialas de orden y quítales lo que llevan.',
            activo: p.equipo.length > 0,
            accion: () => this.pantallaEquipo(p, aqui('Equipo')),
          },
          {
            texto: 'Bestiario',
            icono: 'bestiario',
            color: COLOR.rojo,
            ayuda: 'Las criaturas que has visto y con las que has sellado un pacto.',
            activo: true,
            accion: () => this.pantallaBestiario(p, aqui('Bestiario')),
          },
          { texto: 'Mochila', icono: 'mochila', color: COLOR.bronce, ayuda: 'Tus objetos, ordenados por bolsillos.', activo: true, accion: () => this.pantallaMochila(p, aqui('Mochila')) },
          ...((p.objetos.mapa ?? 0) > 0
            ? [
                {
                  texto: 'Mapa',
                  icono: 'mapa' as IconoUI,
                  color: COLOR.celeste,
                  ayuda: 'Dónde estás y los lugares que conoces. Con Vuelo, viajas a ellos.',
                  activo: true,
                  accion: () => this.pantallaMapa(p, aqui('Mapa'), viajar, op.exterior ?? false),
                },
              ]
            : []),
          { texto: 'Tipos', icono: 'tipos', color: COLOR.morado, ayuda: 'Qué tipo es fuerte o débil contra cuál.', activo: true, accion: () => this.pantallaTipos(aqui('Tipos')) },
          {
            texto: 'Guardar',
            icono: 'guardar',
            color: COLOR.azul,
            ayuda: 'Guarda la partida en este dispositivo. También se guarda sola al cambiar de zona.',
            activo: true,
            accion: () => this.aviso(guardarPartida(p) ? 'Partida guardada' : 'No se ha podido guardar'),
          },
          { texto: 'Cerrar', icono: 'cerrar', color: COLOR.tintaSuave, ayuda: 'Vuelve al camino.', activo: true, accion: () => this.alAtras?.() },
        ];
        if (p.dev) {
          opciones.splice(opciones.length - 1, 0, {
            texto: 'Desarrollador',
            icono: 'opciones',
            color: COLOR.morado,
            ayuda: 'Objetos, criaturas, viajes y más, para probar el juego.',
            activo: true,
            accion: () => this.pantallaDesarrollador(p, aqui('Desarrollador'), viajar),
          });
        }
        // Con muchas opciones, las filas se aprietan para no pisar la barra de ayuda.
        const y0 = 186;
        const paso = Math.min(128, Math.floor((ALTO_MAPA - 150 - y0) / Math.max(opciones.length, MAX_EQUIPO)));
        const alto = paso - 16;

        // Derecha: las opciones, en píldoras con su icono.
        const xO = 548;
        const anchoO = ANCHO - xO - 24;
        const marcasO = opciones.map((o, i) => {
          const y = y0 + i * paso;
          const marca = franja(this, xO - 8, y - 8, anchoO + 16, alto + 16);
          c.add(marca);
          c.add(ventana(this, xO, y, anchoO, alto, { radio: alto / 2 }));
          const circulo = this.add.graphics();
          circulo.fillStyle(o.color, 1).fillCircle(xO + 58, y + alto / 2, 44);
          c.add(circulo);
          const icono = iconoUI(this, o.icono, xO + 58, y + alto / 2, 76);
          const texto = this.add.text(xO + 122, y + alto / 2, o.texto, estiloTexto(40, COLOR.tinta, true)).setOrigin(0, 0.5);
          if (!o.activo) [circulo, icono, texto].forEach((g) => g.setAlpha(0.35));
          c.add([icono, texto]);
          const zona = this.add.rectangle(xO + anchoO / 2, y + alto / 2, anchoO, alto, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
          zona.on('pointerup', () => elegir(1, i));
          c.add(zona);
          return marca;
        });

        // Izquierda: el equipo, cada criatura en su píldora.
        const xE = 24;
        const anchoE = 500;
        const marcasE: Phaser.GameObjects.Graphics[] = [];
        for (let i = 0; i < MAX_EQUIPO; i++) {
          const y = y0 + i * paso;
          const cr = p.equipo[i];
          if (!cr) {
            c.add(ventana(this, xE, y, anchoE, alto, { color: COLOR.panel, opacidad: 0.12, borde: null, sombra: false, radio: alto / 2 }));
            continue;
          }
          const marca = franja(this, xE - 8, y - 8, anchoE + 16, alto + 16, COLOR.celeste);
          marcasE.push(marca);
          c.add(marca);
          const max = calcularEstadisticas(cr, DATOS).vida;
          c.add(ventana(this, xE, y, anchoE, alto, { radio: alto / 2, color: cr.vida > 0 ? COLOR.panel : 0xffe1e5 }));
          const circulo = this.add.graphics();
          circulo.fillStyle(colorPedestal(cr.especie), 1).fillCircle(xE + 58, y + alto / 2, 46);
          c.add(circulo);
          const figura = crearCriaturaVisual(this, cr.especie, xE + 58, y + alto / 2 - 2, 92, true);
          if (cr.vida <= 0) figura.setAlpha(0.5);
          c.add(figura);
          c.add(this.add.text(xE + 120, y + 34, nombreDe(cr, DATOS), estiloTexto(30, COLOR.tinta, true)).setOrigin(0, 0.5));
          c.add(this.add.text(xE + anchoE - 28, y + 34, `Nv ${cr.nivel}`, estiloTexto(26, COLOR.tintaSuave, true)).setOrigin(1, 0.5));
          const barra = new Barra(this, xE + 120, y + 78, anchoE - 150, 18, true);
          void barra.setFraccion(cr.vida / max, false);
          c.add(barra);
          const zona = this.add.rectangle(xE + anchoE / 2, y + alto / 2, anchoE, alto, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
          zona.on('pointerup', () => elegir(0, i));
          c.add(zona);
        }

        const ayuda = this.barraAyuda(c, '');
        let col = inicio.col;
        let fila = inicio.fila;
        const marcar = (nc: number, nf: number) => {
          col = nc;
          fila = nf;
          marcasO.forEach((m, j) => m.setVisible(col === 1 && j === fila));
          marcasE.forEach((m, j) => m.setVisible(col === 0 && j === fila));
          ayuda.setText(col === 1 ? opciones[fila].ayuda : `${nombreDe(p.equipo[fila], DATOS)}: pulsa para ver su ficha, moverla o quitarle el objeto.`);
        };
        const elegir = (nc: number, nf: number) => {
          marcar(nc, nf);
          if (nc === 1) {
            if (opciones[nf].activo) opciones[nf].accion();
          } else {
            const volver = volverA(0, nf);
            this.pantallaEquipo(p, volver, nf);
            this.menuRanura(p, nf, volver);
          }
        };
        if (col === 0 && !p.equipo[fila]) col = 1;
        marcar(col, col === 1 ? Math.min(fila, opciones.length - 1) : fila);
        this.nav = {
          mover: (dir) => {
            if (dir === 'izquierda' && p.equipo.length > 0) marcar(0, Math.min(fila, p.equipo.length - 1));
            else if (dir === 'derecha') marcar(1, Math.min(fila, opciones.length - 1));
            else if (dir === 'arriba' || dir === 'abajo') {
              const n = col === 1 ? opciones.length : p.equipo.length;
              marcar(col, (fila + (dir === 'arriba' ? -1 : 1) + n) % n);
            }
          },
          aceptar: () => elegir(col, fila),
        };
      };
      principal();
    });
  }

  /** Tu tarjeta, arriba del menú de pausa: nombre, dinero y blasones. */
  private barraJugador(c: Phaser.GameObjects.Container, p: Partida): void {
    const y = 24;
    const alto = 136;
    c.add(ventana(this, 24, y, ANCHO - 48, alto, { radio: alto / 2 }));
    c.add(iconoUI(this, 'tarjeta', 112, y + alto / 2, 104));
    c.add(this.add.text(186, y + 46, p.nombre, estiloTexto(44, COLOR.tinta, true)).setOrigin(0, 0.5));
    c.add(iconoUI(this, 'dinero', 206, y + 100, 44));
    c.add(this.add.text(238, y + 100, `${p.dinero} ${MONEDA}`, estiloTexto(28, COLOR.tintaSuave, true)).setOrigin(0, 0.5));
    // Ocho huecos de blasones, uno por gimnasio: los ganados, en oro.
    const x0 = ANCHO - 70 - 7 * 46;
    c.add(this.add.text(x0 - 22, y + 44, 'Blasones', estiloTexto(24, COLOR.tintaSuave, true)).setOrigin(0, 0.5));
    const g = this.add.graphics();
    for (let i = 0; i < 8; i++) {
      const cx = x0 + i * 46;
      const cy = y + 96;
      const ganado = i < p.blasones.length;
      g.fillStyle(ganado ? COLOR.oro : COLOR.panelSuave, 1);
      g.lineStyle(3, ganado ? oscurecer(COLOR.oro, 0.3) : COLOR.borde, 1);
      const pts = [new Phaser.Math.Vector2(cx, cy - 19), new Phaser.Math.Vector2(cx + 17, cy), new Phaser.Math.Vector2(cx, cy + 19), new Phaser.Math.Vector2(cx - 17, cy)];
      g.fillPoints(pts, true);
      g.strokePoints(pts, true);
    }
    c.add(g);
  }

  private botonVolver(c: Phaser.GameObjects.Container, volver: () => void, x = ANCHO / 2): void {
    this.alAtras = volver;
    c.add(new Boton(this, x, ALTO_MAPA - 80, { ancho: 360, alto: 112, texto: 'Volver', tamano: 38, icono: { ui: 'cerrar', tam: 56 }, alPulsar: volver }));
  }

  /**
   * El equipo: seis huecos en dos columnas, como en los juegos del género. Al elegir una
   * criatura sale un menú pequeño (ficha, mover, quitar objeto). `moviendo` es la criatura que se
   * está cambiando de sitio.
   */
  private pantallaEquipo(p: Partida, volver: () => void, sel = 0, moviendo: number | null = null): void {
    const c = this.abrirCapa('Equipo', { icono: 'equipo', color: COLOR.verde });
    const ancho = 504;
    const alto = 262;
    const marcos: Phaser.GameObjects.Graphics[] = [];
    for (let i = 0; i < MAX_EQUIPO; i++) {
      const x = 24 + (i % 2) * (ancho + 24);
      const y = 140 + Math.floor(i / 2) * (alto + 24);
      const cr = p.equipo[i];
      if (!cr) {
        c.add(ventana(this, x, y, ancho, alto, { color: COLOR.panel, opacidad: 0.12, borde: null, sombra: false }));
        continue;
      }
      const marco = this.add.graphics();
      marco.lineStyle(10, moviendo === i ? COLOR.rojo : COLOR.celeste, 1).strokeRoundedRect(x - 8, y - 8, ancho + 16, alto + 16, 38);
      marco.setVisible(false);
      marcos.push(marco);
      c.add(marco);
      this.ranuraCriatura(c, cr, x, y, ancho, alto, { primera: i === 0, moviendo: moviendo === i });
      const zona = this.add.rectangle(x + ancho / 2, y + alto / 2, ancho, alto, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      zona.on('pointerup', () => elegir(i));
      c.add(zona);
    }

    const mensaje = moviendo !== null ? `¿Con quién cambias a ${nombreDe(p.equipo[moviendo], DATOS)}?` : 'Elige una criatura.';
    this.barraAyuda(c, mensaje, ANCHO - 340);
    const cancelar = moviendo !== null ? () => this.pantallaEquipo(p, volver, moviendo) : volver;
    this.alAtras = cancelar;
    c.add(
      new Boton(this, ANCHO - 158, ALTO_MAPA - 77, {
        ancho: 268,
        alto: 112,
        texto: moviendo !== null ? 'Cancelar' : 'Salir',
        tamano: 34,
        color: COLOR.rojo,
        icono: { ui: 'cerrar', tam: 54 },
        alPulsar: cancelar,
      }),
    );

    const n = p.equipo.length;
    let actual = Math.min(sel, n - 1);
    const marcar = (i: number) => {
      actual = i;
      marcos.forEach((m, j) => m.setVisible(j === i));
    };
    const elegir = (i: number) => {
      marcar(i);
      if (moviendo === null) this.menuRanura(p, i, volver);
      else {
        if (i !== moviendo) [p.equipo[moviendo], p.equipo[i]] = [p.equipo[i], p.equipo[moviendo]];
        this.pantallaEquipo(p, volver, i);
      }
    };
    marcar(actual);
    this.nav = {
      mover: (dir) => {
        const destino = actual + { izquierda: -1, derecha: 1, arriba: -2, abajo: 2 }[dir];
        if (destino >= 0 && destino < n) marcar(destino);
      },
      aceptar: () => elegir(actual),
    };
  }

  /** Ventanita de opciones sobre una pantalla: filas con icono, la marcada en color. */
  private submenu(titulo: string, opciones: { texto: string; icono: IconoUI; accion: () => void }[], alCancelar: () => void): void {
    const ancho = 470;
    const altoFila = 100;
    const alto = opciones.length * altoFila + 28;
    const x = ANCHO - ancho - 32;
    const y = ALTO_MAPA - 170 - alto;
    const sub = this.add.container(0, 0);
    sub.add(this.add.rectangle(0, 0, ANCHO, ALTO_MAPA, 0x0b0e24, 0.45).setOrigin(0, 0).setInteractive());
    sub.add(pildora(this, x, y - 44, titulo, COLOR.tinta, 30));
    sub.add(ventana(this, x, y, ancho, alto));
    const marcas = opciones.map((o, j) => {
      const fy = y + 14 + j * altoFila;
      const marca = franja(this, x + 12, fy + 6, ancho - 24, altoFila - 12);
      sub.add(marca);
      sub.add(iconoUI(this, o.icono, x + 66, fy + altoFila / 2, 64));
      sub.add(this.add.text(x + 118, fy + altoFila / 2, o.texto, estiloTexto(36, COLOR.tinta, true)).setOrigin(0, 0.5));
      const zona = this.add.rectangle(x + ancho / 2, fy + altoFila / 2, ancho - 20, altoFila, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      zona.on('pointerup', o.accion);
      sub.add(zona);
      return marca;
    });
    this.capaMenu!.add(sub);
    let actual = 0;
    const marcar = (j: number) => {
      actual = j;
      marcas.forEach((m, k) => m.setVisible(k === j));
    };
    marcar(0);
    this.alAtras = alCancelar;
    this.nav = {
      mover: (dir) => {
        if (dir === 'arriba' || dir === 'abajo') marcar((actual + (dir === 'arriba' ? -1 : 1) + opciones.length) % opciones.length);
      },
      aceptar: () => opciones[actual].accion(),
    };
  }

  /** Lo que se puede hacer con una criatura del equipo. */
  private menuRanura(p: Partida, i: number, volver: () => void): void {
    const cr = p.equipo[i];
    const volverAqui = () => this.pantallaEquipo(p, volver, i);
    const opciones: { texto: string; icono: IconoUI; accion: () => void }[] = [
      { texto: 'Ficha', icono: 'tarjeta', accion: () => this.pantallaFicha(p, i, volverAqui) },
    ];
    if (p.equipo.length > 1) opciones.push({ texto: 'Mover', icono: 'equipo', accion: () => this.pantallaEquipo(p, volver, i, i) });
    if (cr.objeto) {
      opciones.push({
        texto: 'Quitar objeto',
        icono: 'mochila',
        accion: () => {
          const nombre = DATOS.objetos[cr.objeto!]?.nombre;
          quitarObjeto(p, cr);
          this.aviso(`${nombre} vuelve a la mochila`);
          volverAqui();
        },
      });
    }
    opciones.push({ texto: 'Cancelar', icono: 'cerrar', accion: volverAqui });
    this.submenu(nombreDe(cr, DATOS), opciones, volverAqui);
  }

  /**
   * Tarjeta de una criatura: círculo del color de su tipo, nombre, nivel, tipos, estado, objeto
   * y barra de Vida. Lo usan el equipo y la elección de criatura de la mochila.
   */
  private ranuraCriatura(
    c: Phaser.GameObjects.Container,
    cr: Criatura,
    x: number,
    y: number,
    ancho: number,
    alto: number,
    op: { primera?: boolean; moviendo?: boolean } = {},
  ): void {
    const max = calcularEstadisticas(cr, DATOS).vida;
    const debilitada = cr.vida <= 0;
    c.add(ventana(this, x, y, ancho, alto, { color: debilitada ? 0xffe1e5 : COLOR.panel, borde: op.primera ? COLOR.oro : op.moviendo ? COLOR.rojo : undefined, radio: 34 }));
    if (op.primera) {
      const g = this.add.graphics();
      g.lineStyle(6, COLOR.oro, 1).strokeRoundedRect(x, y, ancho, alto, 34);
      c.add(g);
      c.add(pildora(this, x + ancho - 150, y + 2, 'Primera', COLOR.oro, 18, COLOR.tinta));
    }
    const px = x + 108;
    const py = y + alto / 2;
    const circulo = this.add.graphics();
    circulo.fillStyle(colorPedestal(cr.especie), 1).fillCircle(px, py, 86);
    circulo.fillStyle(0xffffff, 0.35).fillCircle(px, py, 66);
    c.add(circulo);
    const figura = crearCriaturaVisual(this, cr.especie, px, py - 6, 158, true);
    if (debilitada) figura.setAlpha(0.5);
    else this.tweens.add({ targets: figura, y: figura.y - 6, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    c.add(figura);
    if (cr.objeto) {
      const fondo = this.add.graphics();
      fondo.fillStyle(COLOR.panel, 1).fillCircle(px + 64, py + 64, 30);
      fondo.lineStyle(3, COLOR.borde, 1).strokeCircle(px + 64, py + 64, 30);
      c.add(fondo);
      c.add(iconoObjeto(this, px + 64, py + 64, cr.objeto, 46));
    }
    const tx = x + 216;
    c.add(this.add.text(tx, y + 50, nombreDe(cr, DATOS), estiloTexto(34, COLOR.tinta, true)).setOrigin(0, 0.5));
    c.add(pildora(this, tx, y + 100, `Nv ${cr.nivel}`, COLOR.tinta, 22));
    if (debilitada) c.add(pildora(this, tx + 104, y + 100, 'Debilitada', COLOR.rojo, 20));
    else if (cr.estado) {
      const vista = ESTADO_VISTA[cr.estado.tipo];
      c.add(pildora(this, tx + 104, y + 100, vista.etiqueta, vista.color, 20));
    }
    const tipos = this.add.container(0, 0);
    filaTipos(this, tipos, tx, y + 150, DATOS.especies[cr.especie].tipos, 20);
    c.add(tipos);
    const barra = new Barra(this, tx, y + 202, ancho - (tx - x) - 28, 22, true);
    void barra.setFraccion(cr.vida / max, false);
    c.add(barra);
    c.add(this.add.text(x + ancho - 28, y + 236, `${Math.max(0, cr.vida)} / ${max}`, estiloTexto(26, COLOR.tintaSuave, true)).setOrigin(1, 0.5));
  }

  /**
   * Ficha de una criatura del equipo, en tres pestañas como en los juegos del género: datos,
   * estadísticas y movimientos. Izquierda y derecha cambian de pestaña; arriba y abajo, de
   * criatura (en Movimientos, de movimiento).
   */
  private pantallaFicha(p: Partida, i: number, volver: () => void, pestana = 0, movimiento = 0, lista: Criatura[] = p.equipo): void {
    const cr = lista[i];
    const e = DATOS.especies[cr.especie];
    const color = colorTipoDe(cr.especie);
    const c = this.abrirCapa(nombreDe(cr, DATOS), { icono: 'tarjeta', color });
    const stats = calcularEstadisticas(cr, DATOS);
    const temp = DATOS.temperamentos.find((t) => t.id === cr.temperamento);
    const n = lista.length;
    const ir = (j: number, k = pestana, m = 0) => this.pantallaFicha(p, (j + n) % n, volver, k, m, lista);

    // Arriba: la criatura con nombre, nivel, tipos, estado y objeto.
    c.add(ventana(this, 24, 140, ANCHO - 48, 300, { radio: 36 }));
    const px = 178;
    const py = 290;
    const circulo = this.add.graphics();
    circulo.fillStyle(aclarar(color, 0.55), 1).fillCircle(px, py, 124);
    circulo.fillStyle(0xffffff, 0.35).fillCircle(px, py, 96);
    c.add(circulo);
    const figura = crearCriaturaVisual(this, cr.especie, px, py - 8, 236, true);
    if (cr.vida <= 0) figura.setAlpha(0.5);
    else this.tweens.add({ targets: figura, y: figura.y - 8, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    c.add(figura);
    const tx = 336;
    const sexo = sexoDe(cr, DATOS);
    const nombre = this.add.text(tx, 196, nombreDe(cr, DATOS), estiloTexto(46, COLOR.tinta, true)).setOrigin(0, 0.5);
    c.add([nombre, simboloSexo(this, tx + nombre.width + 34, 196, sexo, 42)]);
    c.add(pildora(this, tx, 252, `Nv ${cr.nivel}`, COLOR.tinta, 24));
    c.add(pildora(this, tx + 116, 252, `Nº ${String(e.numero).padStart(3, '0')}`, COLOR.panelSuave, 22, COLOR.tintaSuave));
    if (cr.vida <= 0) c.add(pildora(this, tx + 250, 252, 'Debilitada', COLOR.rojo, 22));
    else if (cr.estado) {
      const vista = ESTADO_VISTA[cr.estado.tipo];
      c.add(pildora(this, tx + 250, 252, vista.etiqueta, vista.color, 22));
    }
    const tipos = this.add.container(0, 0);
    filaTipos(this, tipos, tx, 306, e.tipos, 24);
    c.add(tipos);
    if (cr.objeto) {
      c.add(iconoObjeto(this, tx + 26, 380, cr.objeto, 56));
      c.add(this.add.text(tx + 66, 380, DATOS.objetos[cr.objeto]?.nombre ?? cr.objeto, estiloTexto(30, COLOR.tinta, true)).setOrigin(0, 0.5));
      c.add(
        new Boton(this, ANCHO - 146, 380, {
          ancho: 196,
          alto: 76,
          texto: 'Quitar',
          tamano: 28,
          color: COLOR.panelSuave,
          alPulsar: () => {
            const nombre = DATOS.objetos[cr.objeto!]?.nombre;
            quitarObjeto(p, cr);
            this.aviso(`${nombre} vuelve a la mochila`);
            ir(i);
          },
        }),
      );
    } else {
      c.add(this.add.text(tx, 380, 'No lleva nada', estiloTexto(28, COLOR.tintaSuave)).setOrigin(0, 0.5));
    }

    const pestanas = ['Datos', 'Estadísticas', 'Movimientos', 'Zona'];
    this.pestanas(c, pestanas, pestana, 468, (k) => ir(i, k));

    const yC = 584;
    const altoC = ALTO_MAPA - 170 - yC;
    c.add(ventana(this, 24, yC, ANCHO - 48, altoC, { radio: 36 }));
    if (pestana === 0) {
      // Datos: temperamento, valía, experiencia y el texto del Bestiario.
      const desde = expParaNivel(cr.nivel);
      const hasta = expParaNivel(cr.nivel + 1);
      const temperamento = temp
        ? temp.sube === temp.baja
          ? `${temp.nombre}: neutro`
          : `${temp.nombre}: más ${NOMBRE_ESTADISTICA[temp.sube]}, menos ${NOMBRE_ESTADISTICA[temp.baja]}`
        : '';
      const filas: [string, string][] = [
        ['Especie', e.nombre],
        ['Sexo', NOMBRE_SEXO[sexo]],
        ['Temperamento', temperamento],
        ['Valía', `${cr.valia} de 14`],
      ];
      const pasiva = e.pasiva ? DATOS.pasivas[e.pasiva] : undefined;
      if (pasiva) filas.push(['Pasiva', pasiva.nombre]);
      filas.forEach(([etiqueta, valor], k) => {
        const y = yC + 48 + k * 54;
        c.add(this.add.text(64, y, etiqueta, estiloTexto(26, COLOR.tintaSuave, true)).setOrigin(0, 0.5));
        c.add(this.add.text(300, y, valor, { ...estiloTexto(30, COLOR.tinta, true), wordWrap: { width: ANCHO - 360 } }).setOrigin(0, 0.5));
      });
      let yExp = yC + 48 + filas.length * 54;
      if (pasiva) {
        const desc = this.add.text(300, yExp - 32, pasiva.descripcion, { ...estiloTexto(24, COLOR.tintaSuave), wordWrap: { width: ANCHO - 360 } });
        c.add(desc);
        yExp += desc.height - 10;
      }
      c.add(this.add.text(64, yExp, 'Experiencia', estiloTexto(26, COLOR.tintaSuave, true)).setOrigin(0, 0.5));
      const barra = new Barra(this, 300, yExp, ANCHO - 380, 22, false);
      void barra.setFraccion((cr.exp - desde) / Math.max(1, hasta - desde), false);
      c.add(barra);
      c.add(
        this.add.text(ANCHO - 80, yExp + 38, `Le faltan ${Math.max(0, hasta - cr.exp)} para el nivel ${cr.nivel + 1}`, estiloTexto(24, COLOR.tintaSuave)).setOrigin(1, 0.5),
      );
      const yTexto = yExp + 80;
      const linea = this.add.graphics();
      linea.lineStyle(3, COLOR.borde, 1).lineBetween(64, yTexto, ANCHO - 64, yTexto);
      c.add(linea);
      c.add(this.add.text(64, yTexto + 22, e.descripcion, { ...estiloTexto(28, COLOR.tintaSuave), wordWrap: { width: ANCHO - 128 }, lineSpacing: 6 }));
    } else if (pestana === 3) {
      this.zonaDeCaptura(c, cr.especie, yC, yC + altoC);
    } else if (pestana === 1) {
      // Estadísticas, con barras del color de su tipo. ▲ y ▼: lo que sube y baja su temperamento.
      const orden: (keyof typeof stats)[] = ['vida', 'fuerza', 'escudo', 'magia', 'resMagica', 'celeridad'];
      const tope = Math.max(...orden.filter((k) => k !== 'vida').map((k) => stats[k]), 1);
      const alto = Math.min(80, (altoC - 50) / orden.length);
      orden.forEach((k, j) => {
        const y = yC + 30 + j * alto + alto / 2;
        const marca = temp && temp.sube !== temp.baja ? (temp.sube === (k as EstadisticaCombate) ? '▲' : temp.baja === (k as EstadisticaCombate) ? '▼' : '') : '';
        c.add(this.add.text(64, y, NOMBRE_ESTADISTICA[k], estiloTexto(28, COLOR.tintaSuave, true)).setOrigin(0, 0.5));
        if (marca) c.add(this.add.text(370, y, marca, estiloTexto(26, marca === '▲' ? COLOR.rojo : COLOR.azul, true)).setOrigin(0.5));
        const valor = k === 'vida' ? `${Math.max(0, cr.vida)}/${stats.vida}` : `${stats[k]}`;
        c.add(this.add.text(540, y, valor, estiloTexto(32, COLOR.tinta, true)).setOrigin(1, 0.5));
        if (k === 'vida') {
          const barra = new Barra(this, 580, y, ANCHO - 660, 24, true);
          void barra.setFraccion(cr.vida / stats.vida, false);
          c.add(barra);
        } else {
          const g = this.add.graphics();
          const largo = ANCHO - 660;
          g.fillStyle(COLOR.panelSuave, 1).fillRoundedRect(580, y - 12, largo, 24, 12);
          g.fillStyle(color, 1).fillRoundedRect(580, y - 12, Math.max(24, largo * (stats[k] / tope)), 24, 12);
          c.add(g);
        }
      });
    } else {
      // Movimientos: tócalos para ver qué hacen.
      const actual = Math.min(movimiento, cr.movimientos.length - 1);
      const anchoMov = (ANCHO - 96 - 20) / 2;
      cr.movimientos.forEach((m, j) => {
        const mov = DATOS.movimientos[m.id];
        const x = 48 + (j % 2) * (anchoMov + 20);
        const y = yC + 28 + Math.floor(j / 2) * 118;
        c.add(this.tarjetaMovimiento(mov, m.pp, x, y, anchoMov, 104, j === actual, () => ir(i, 2, j)));
      });
      const m = cr.movimientos[actual];
      if (m) {
        const d = describirMovimiento(DATOS.movimientos[m.id], m.pp);
        const y = yC + 28 + 2 * 118 + 4;
        const linea = this.add.graphics();
        linea.lineStyle(3, COLOR.borde, 1).lineBetween(64, y, ANCHO - 64, y);
        c.add(linea);
        c.add(this.add.text(64, y + 18, d.titulo, estiloTexto(30, COLOR.tinta, true)));
        c.add(this.add.text(64, y + 58, `${d.cifras}\n${d.efecto}`, { ...estiloTexto(27, COLOR.tintaSuave), wordWrap: { width: ANCHO - 128 }, lineSpacing: 6 }));
      }
    }

    // Abajo: criatura anterior, volver y siguiente.
    if (n > 1) {
      c.add(botonFlecha(this, 110, ALTO_MAPA - 80, -1, () => ir(i - 1), 170, 112));
      c.add(botonFlecha(this, ANCHO - 110, ALTO_MAPA - 80, 1, () => ir(i + 1), 170, 112));
    }
    this.botonVolver(c, volver);
    this.nav = {
      mover: (dir) => {
        if (dir === 'izquierda' || dir === 'derecha') ir(i, (pestana + (dir === 'izquierda' ? -1 : 1) + pestanas.length) % pestanas.length);
        else if (pestana === 2) ir(i, 2, (movimiento + (dir === 'arriba' ? -1 : 1) + cr.movimientos.length) % cr.movimientos.length);
        else if (n > 1) ir(i + (dir === 'arriba' ? -1 : 1));
      },
      aceptar: () => undefined,
    };
  }

  /** Tarjeta de un movimiento con el color de su tipo, como en el combate. */
  private tarjetaMovimiento(mov: Movimiento, pp: number, x: number, y: number, ancho: number, alto: number, marcado: boolean, alPulsar: () => void): Phaser.GameObjects.Container {
    const tipo = DATOS.tipos.tipos.find((t) => t.id === mov.tipo);
    const color = tipo?.color ?? COLOR.tintaSuave;
    const tinta = textoSobre(color);
    const c = this.add.container(0, 0);
    const g = this.add.graphics();
    g.fillStyle(oscurecer(color, 0.3), 1).fillRoundedRect(x, y + 6, ancho, alto, 24);
    g.fillStyle(color, 1).fillRoundedRect(x, y, ancho, alto, 24);
    g.fillStyle(0xffffff, 0.18).fillRoundedRect(x + 6, y + 4, ancho - 12, alto * 0.42, { tl: 20, tr: 20, bl: 0, br: 0 });
    if (marcado) g.lineStyle(6, COLOR.tinta, 1).strokeRoundedRect(x - 3, y - 3, ancho + 6, alto + 12, 26);
    c.add(g);
    c.add(this.add.text(x + 22, y + 34, mov.nombre, estiloTexto(32, tinta, true)).setOrigin(0, 0.5));
    c.add(this.add.text(x + 22, y + 76, tipo?.nombre ?? '', estiloTexto(24, tinta, true)).setOrigin(0, 0.5).setAlpha(0.85));
    c.add(this.add.text(x + ancho - 22, y + 76, `PP ${pp}/${mov.pp}`, estiloTexto(24, tinta, true)).setOrigin(1, 0.5));
    const zona = this.add.rectangle(x + ancho / 2, y + alto / 2, ancho, alto, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
    zona.on('pointerup', alPulsar);
    c.add(zona);
    return c;
  }

  private pantallaBestiario(p: Partida, volver: () => void, pagina = 0): void {
    const c = this.abrirCapa('Bestiario', { icono: 'bestiario', color: COLOR.rojo });
    c.add(pildora(this, ANCHO - 360, 66, `Vistas ${p.vistos.length} · Pactos ${p.capturados.length}`, COLOR.tinta, 24));
    const todas = Object.values(DATOS.especies).sort((a, b) => a.numero - b.numero);
    const porPagina = 20;
    const paginas = Math.ceil(todas.length / porPagina);
    const ids = todas.slice(pagina * porPagina, (pagina + 1) * porPagina).map((e) => e.id);
    const columnas = 4;
    const ancho = 243;
    const alto = 176;
    ids.forEach((id, i) => {
      const x = 24 + (i % columnas) * (ancho + 12);
      const y = 140 + Math.floor(i / columnas) * (alto + 12);
      const visto = p.vistos.includes(id);
      const capturado = p.capturados.includes(id);
      c.add(visto ? ventana(this, x, y, ancho, alto, { radio: 26 }) : ventana(this, x, y, ancho, alto, { color: COLOR.panel, opacidad: 0.14, borde: null, sombra: false, radio: 26 }));
      c.add(this.add.text(x + 16, y + 20, String(DATOS.especies[id].numero).padStart(3, '0'), estiloTexto(20, visto ? COLOR.tintaSuave : COLOR.panel, true)).setOrigin(0, 0.5));
      if (visto) {
        const circulo = this.add.graphics();
        circulo.fillStyle(colorPedestal(id), 1).fillCircle(x + ancho / 2, y + 74, 52);
        c.add(circulo);
        c.add(crearCriaturaVisual(this, id, x + ancho / 2, y + 70, 104));
        c.add(this.add.text(x + ancho / 2, y + 150, DATOS.especies[id].nombre, estiloTexto(24, COLOR.tinta, true)).setOrigin(0.5));
        if (capturado) c.add(pildora(this, x + ancho - 56, y + 20, '✓', COLOR.verde, 18));
        const zona = this.add.rectangle(x + ancho / 2, y + alto / 2, ancho, alto, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
        zona.on('pointerup', () => this.pantallaEspecie(p, id, () => this.pantallaBestiario(p, volver, pagina)));
        c.add(zona);
      } else {
        c.add(this.add.text(x + ancho / 2, y + alto / 2 + 6, '?', estiloTexto(64, COLOR.panel, true)).setOrigin(0.5).setAlpha(0.5));
      }
    });
    const ir = (k: number) => this.pantallaBestiario(p, volver, k);
    if (paginas > 1) {
      c.add(botonFlecha(this, 110, ALTO_MAPA - 80, -1, () => ir(pagina - 1), 170, 112).setActivo(pagina > 0));
      c.add(botonFlecha(this, ANCHO - 110, ALTO_MAPA - 80, 1, () => ir(pagina + 1), 170, 112).setActivo(pagina < paginas - 1));
      c.add(pildora(this, ANCHO / 2 - 70, ALTO_MAPA - 168, `Página ${pagina + 1} de ${paginas}`, COLOR.tinta, 22));
    }
    this.botonVolver(c, volver);
    this.nav = {
      mover: (dir) => {
        if (dir === 'izquierda' && pagina > 0) ir(pagina - 1);
        else if (dir === 'derecha' && pagina < paginas - 1) ir(pagina + 1);
      },
      aceptar: () => undefined,
    };
  }

  private pantallaEspecie(p: Partida, id: string, volver: () => void, pestana = 0): void {
    const e = DATOS.especies[id];
    const color = colorTipoDe(id);
    const c = this.abrirCapa(e.nombre, { icono: 'bestiario', color });
    this.pestanas(c, ['Datos', 'Zona de captura'], pestana, 140, (k) => this.pantallaEspecie(p, id, volver, k));
    this.nav = { mover: (dir) => (dir === 'izquierda' || dir === 'derecha' ? this.pantallaEspecie(p, id, volver, 1 - pestana) : undefined), aceptar: () => undefined };
    c.add(ventana(this, 24, 248, ANCHO - 48, ALTO_MAPA - 248 - 170, { radio: 36 }));
    c.add(pildora(this, 56, 284, `Nº ${String(e.numero).padStart(3, '0')}`, COLOR.tinta, 24));
    if (pestana === 1) {
      this.zonaDeCaptura(c, id, 330, ALTO_MAPA - 170);
      this.botonVolver(c, volver);
      return;
    }
    const circulo = this.add.graphics();
    circulo.fillStyle(aclarar(color, 0.55), 1).fillCircle(ANCHO / 2, 420, 150);
    circulo.fillStyle(0xffffff, 0.35).fillCircle(ANCHO / 2, 420, 116);
    c.add(circulo);
    c.add(crearCriaturaVisual(this, id, ANCHO / 2, 412, 280));
    const tipos = this.add.container(0, 0);
    const anchoTipos = filaTipos(this, tipos, 0, 600, e.tipos, 30);
    tipos.x = ANCHO / 2 - anchoTipos / 2;
    c.add(tipos);
    const texto = p.capturados.includes(id) ? e.descripcion : 'Sella un pacto con esta criatura para saber más de ella.';
    c.add(this.add.text(ANCHO / 2, 650, texto, { ...estiloTexto(30, COLOR.tinta), align: 'center', wordWrap: { width: ANCHO - 160 }, lineSpacing: 6 }).setOrigin(0.5, 0));
    // Debilidades y resistencias, en píldoras del color de cada tipo.
    const d = debilidades(DATOS.tipos, e.tipos);
    const def = (t: string) => DATOS.tipos.tipos.find((x) => x.id === t);
    const grupos: [string, (m: number) => boolean][] = [
      ['Débil a', (m) => m > 1],
      ['Resiste', (m) => m > 0 && m < 1],
      ['Inmune a', (m) => m === 0],
    ];
    let y = 840;
    for (const [etiqueta, f] of grupos) {
      const lista = d.filter((x) => f(x.multiplicador));
      if (lista.length === 0) continue;
      c.add(this.add.text(64, y, etiqueta, estiloTexto(26, COLOR.tintaSuave, true)).setOrigin(0, 0.5));
      let x = 210;
      for (const t of lista) {
        const tp = def(t.tipo);
        const pil = pildora(this, x, y, `${tp?.nombre ?? t.tipo} ${textoMultiplicador(t.multiplicador)}`, tp?.color ?? COLOR.tintaSuave, 22, textoSobre(tp?.color ?? COLOR.tintaSuave));
        if (x + pil.width > ANCHO - 60) {
          y += 50;
          x = 210;
          pil.x = x + pil.width / 2;
          pil.y = y;
        }
        c.add(pil);
        x += pil.width + 10;
      }
      y += 60;
    }
    const pasiva = e.pasiva ? DATOS.pasivas[e.pasiva] : undefined;
    if (pasiva && p.capturados.includes(id)) {
      c.add(this.add.text(64, y, 'Pasiva', estiloTexto(26, COLOR.tintaSuave, true)).setOrigin(0, 0.5));
      c.add(this.add.text(210, y, pasiva.nombre, estiloTexto(30, COLOR.tinta, true)).setOrigin(0, 0.5));
      c.add(this.add.text(210, y + 26, pasiva.descripcion, { ...estiloTexto(24, COLOR.tintaSuave), wordWrap: { width: ANCHO - 280 } }));
    }
    c.add(
      new Boton(this, 790, ALTO_MAPA - 80, {
        ancho: 440,
        alto: 112,
        texto: 'Tabla de tipos',
        tamano: 32,
        icono: { ui: 'tipos', tam: 60 },
        alPulsar: () => this.pantallaTipos(() => this.pantallaEspecie(p, id, volver), e.tipos[0]),
      }),
    );
    this.botonVolver(c, volver, 290);
  }

  /**
   * El mapa del menú: dónde estás y los lugares que conoces. Con una criatura que sepa Vuelo, y
   * al aire libre, se elige un lugar visitado, de cualquier época, y se vuela allí.
   */
  private pantallaMapa(p: Partida, volver: () => void, viajar: (pos: Posicion, texto?: string) => void, exterior: boolean, elegido?: string): void {
    const c = this.abrirCapa('Mapa', { icono: 'mapa', color: COLOR.azul });
    const visitadas = zonasVisitadas(p);
    const aqui = lugarDe(p.posicion.zona);
    const destinos = [...new Set(visitadas.map(lugarDe).filter((l): l is string => Boolean(l && l !== aqui && LUGARES[l].llegada)))];
    const volador = quienSabe(p, 'vuelo');
    const puede = Boolean(volador) && exterior && destinos.length > 0;
    const sel = puede ? (elegido && destinos.includes(elegido) ? elegido : destinos[0]) : undefined;
    const ir = (l?: string) => this.pantallaMapa(p, volver, viajar, exterior, l);

    const escala = escalaMapa(ANCHO - 96, ALTO_MAPA - 150 - 400);
    const yMapa = 164;
    c.add(
      mapaZonas(this, (ANCHO - MAPA_ANCHO * escala) / 2, yMapa, escala, {
        conocidas: visitadas,
        aqui: p.posicion.zona,
        elegido: sel,
        tocables: puede ? destinos : [],
        alTocar: (l) => ir(l),
      }),
    );
    const yT = yMapa + MAPA_ALTO * escala + 40;
    c.add(pildora(this, 40, yT, `Estás en ${ZONAS[p.posicion.zona].nombre}`, COLOR.tinta, 28));
    const ayuda = !volador
      ? 'Con una criatura que sepa Vuelo (MO02) podrás viajar a los lugares que ya conoces.'
      : !exterior
        ? `Sal al aire libre para que ${nombreDe(volador, DATOS)} pueda volar.`
        : destinos.length === 0
          ? 'Todavía no conoces otro lugar al que volar.'
          : `Elige un lugar y ${nombreDe(volador, DATOS)} te llevará volando.`;
    c.add(this.add.text(40, yT + 56, ayuda, { ...estiloTexto(28, COLOR.panel, true), wordWrap: { width: ANCHO - 80 } }));
    const volar = () => {
      if (!sel || !volador) return;
      const lugar = LUGARES[sel];
      this.cerrarCapa();
      viajar(lugar.llegada!, `¡${nombreDe(volador, DATOS)} te lleva volando a ${lugar.nombre}!`);
    };
    if (sel) {
      c.add(new Boton(this, 790, ALTO_MAPA - 80, { ancho: 440, alto: 112, texto: `Volar a ${LUGARES[sel].nombre}`, tamano: 30, color: COLOR.verde, icono: { ui: 'mapa', tam: 56 }, alPulsar: volar }));
      this.botonVolver(c, volver, 290);
    } else {
      this.botonVolver(c, volver);
    }
    this.nav = {
      mover: (dir) => {
        if (!sel || destinos.length < 2) return;
        const k = destinos.indexOf(sel) + (dir === 'izquierda' || dir === 'arriba' ? -1 : 1);
        ir(destinos[(k + destinos.length) % destinos.length]);
      },
      aceptar: volar,
    };
  }

  /** Control segmentado de pestañas, con la elegida en azul noche. */
  private pestanas(c: Phaser.GameObjects.Container, nombres: string[], actual: number, y: number, alElegir: (k: number) => void): void {
    const ancho = (ANCHO - 48 - 16) / nombres.length;
    c.add(ventana(this, 24, y, ANCHO - 48, 92, { radio: 46 }));
    nombres.forEach((nombre, k) => {
      const x = 32 + k * ancho;
      if (k === actual) {
        const g = this.add.graphics();
        g.fillStyle(COLOR.tinta, 1).fillRoundedRect(x, y + 8, ancho, 76, 38);
        c.add(g);
      }
      c.add(this.add.text(x + ancho / 2, y + 46, nombre, estiloTexto(30, k === actual ? COLOR.panel : COLOR.tintaSuave, true)).setOrigin(0.5));
      const zona = this.add.rectangle(x + ancho / 2, y + 46, ancho, 92, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      zona.on('pointerup', () => alElegir(k));
      c.add(zona);
    });
  }

  /**
   * Zona de captura, entre `y` y `yFin`: el mapa de la península con las zonas donde sale la
   * especie y, debajo, cada zona con sus niveles y lo a menudo que sale.
   */
  private zonaDeCaptura(c: Phaser.GameObjects.Container, especie: string, y: number, yFin: number): void {
    const donde = dondeSale(ZONAS, especie);
    const filas = Math.min(donde.length, 5);
    const altoFila = 54;
    const altoLista = Math.max(1, filas) * altoFila + 30;
    const escala = escalaMapa(ANCHO - 112, yFin - y - altoLista - 40);
    const anchoMapa = MAPA_ANCHO * escala;
    c.add(mapaZonas(this, (ANCHO - anchoMapa) / 2, y + 24, escala, { resaltadas: donde.map((d) => d.zona) }));
    let yl = y + 24 + MAPA_ALTO * escala + 30 + altoFila / 2;
    if (donde.length === 0) {
      const origen = Object.values(DATOS.especies).find((e) => e.evoluciona?.a === especie);
      const texto = origen
        ? `No vive en libertad: se consigue haciendo evolucionar a ${origen.nombre}.`
        : INICIALES.includes(especie as (typeof INICIALES)[number])
          ? 'No vive en libertad: es una de las compañeras que entrega Isabel la Católica.'
          : 'Todavía no se ha visto en libertad en ninguna zona.';
      c.add(this.add.text(ANCHO / 2, yl, texto, { ...estiloTexto(28, COLOR.tintaSuave, true), align: 'center', wordWrap: { width: ANCHO - 160 } }).setOrigin(0.5, 0.5));
      return;
    }
    for (const d of donde.slice(0, filas)) {
      const punto = this.add.graphics();
      punto.fillStyle(COLOR.rojo, 1).fillCircle(76, yl, 10);
      c.add(punto);
      c.add(this.add.text(100, yl, `${ZONAS[d.zona].nombre}${d.agua ? ' (con Pleamar)' : d.pesca ? ' (pescando)' : ''}`, estiloTexto(30, COLOR.tinta, true)).setOrigin(0, 0.5));
      const niveles = d.min === d.max ? `Nv ${d.min}` : `Nv ${d.min}–${d.max}`;
      c.add(this.add.text(ANCHO - 72, yl, `${niveles} · ${d.porcentaje} %`, estiloTexto(26, COLOR.tintaSuave, true)).setOrigin(1, 0.5));
      yl += altoFila;
    }
    if (donde.length > filas) c.add(this.add.text(100, yl, `y ${donde.length - filas} zonas más`, estiloTexto(24, COLOR.tintaSuave)).setOrigin(0, 0.5));
  }

  private pantallaTipos(volver: () => void, tipo?: string): void {
    const c = this.abrirCapa('Tabla de tipos', { icono: 'tipos', color: COLOR.morado });
    construirTablaTipos(this, c, 130, tipo);
    this.botonVolver(c, volver);
  }

  /**
   * Mochila por bolsillos, como en los juegos actuales: arriba, un icono por bolsillo; en
   * medio, la lista; abajo, la descripción del objeto marcado y lo que se puede hacer con él.
   */
  private pantallaMochila(p: Partida, volver: () => void, bolsilloId?: string, sel = 0): void {
    const c = this.abrirCapa('Mochila', { icono: 'mochila', color: COLOR.bronce });
    // Ordenados: por categoría y, dentro, como en la lista de objetos.
    const orden = Object.keys(DATOS.objetos);
    const categorias = CATEGORIAS.map((k) => k.id);
    const tengo = Object.entries(p.objetos)
      .filter(([id, n]) => n > 0 && DATOS.objetos[id])
      .sort(([a], [b]) => categorias.indexOf(DATOS.objetos[a].categoria) - categorias.indexOf(DATOS.objetos[b].categoria) || orden.indexOf(a) - orden.indexOf(b));
    const en = (b: (typeof BOLSILLOS)[number], id: string) => b.categorias.includes(DATOS.objetos[id].categoria);
    if (tengo.length === 0) {
      c.add(ventana(this, 24, 150, ANCHO - 48, 140));
      c.add(this.add.text(ANCHO / 2, 220, 'La mochila está vacía.', estiloTexto(38, COLOR.tinta, true)).setOrigin(0.5));
      this.botonVolver(c, volver);
      return;
    }
    const bolsillos = BOLSILLOS.filter((b) => tengo.some(([id]) => en(b, id)));
    const k = Math.max(0, bolsillos.findIndex((b) => b.id === bolsilloId));
    const bolsillo = bolsillos[k];
    const objetos = tengo.filter(([id]) => en(bolsillo, id));
    const actual = Math.min(sel, objetos.length - 1);
    const ir = (bk: number, s = 0) => this.pantallaMochila(p, volver, bolsillos[(bk + bolsillos.length) % bolsillos.length].id, s);

    // Bolsillos: un círculo con el icono de su primer objeto; el actual, grande y con nombre.
    const paso = Math.min(140, (ANCHO - 48) / bolsillos.length);
    const x0 = ANCHO / 2 - ((bolsillos.length - 1) * paso) / 2;
    bolsillos.forEach((b, j) => {
      const x = x0 + j * paso;
      const primero = tengo.find(([id]) => en(b, id))![0];
      const g = this.add.graphics();
      if (j === k) {
        g.fillStyle(0x000000, 0.2).fillCircle(x, 206, 58);
        g.fillStyle(COLOR.panel, 1).fillCircle(x, 200, 58);
        g.lineStyle(5, COLOR.oro, 1).strokeCircle(x, 200, 58);
      } else {
        g.fillStyle(COLOR.panel, 0.3).fillCircle(x, 200, 44);
      }
      c.add(g);
      const icono = iconoObjeto(this, x, 200, primero, j === k ? 84 : 62);
      if (j !== k) (icono as Phaser.GameObjects.Image).setAlpha(0.75);
      c.add(icono);
      const zona = this.add.circle(x, 200, 58, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      zona.on('pointerup', () => ir(j));
      c.add(zona);
    });
    const nombreBolsillo = pildora(this, 0, 292, bolsillo.nombre, COLOR.tinta, 28);
    nombreBolsillo.x = ANCHO / 2;
    c.add(nombreBolsillo);

    // Lista de objetos del bolsillo.
    const yD = ALTO_MAPA - 400;
    const yL = 336;
    const altoFila = 96;
    const filas = Math.max(1, Math.floor((yD - 24 - yL - 28) / altoFila));
    const inicio = Math.floor(actual / filas) * filas;
    c.add(ventana(this, 24, yL, ANCHO - 48, filas * altoFila + 28, { radio: 36 }));
    objetos.slice(inicio, inicio + filas).forEach(([id, cantidad], j) => {
      const indice = inicio + j;
      const y = yL + 14 + j * altoFila;
      if (indice === actual) c.add(franja(this, 38, y + 6, ANCHO - 76, altoFila - 12));
      c.add(iconoObjeto(this, 100, y + altoFila / 2, id, 72));
      c.add(this.add.text(156, y + altoFila / 2, DATOS.objetos[id].nombre, estiloTexto(34, COLOR.tinta, true)).setOrigin(0, 0.5));
      const contador = pildora(this, 0, y + altoFila / 2, `×${cantidad}`, COLOR.tinta, 24);
      contador.x = ANCHO - 70 - contador.width / 2;
      c.add(contador);
      const zona = this.add.rectangle(ANCHO / 2, y + altoFila / 2, ANCHO - 84, altoFila, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      zona.on('pointerup', () => ir(k, indice));
      c.add(zona);
    });
    if (inicio > 0) c.add(this.add.text(ANCHO / 2, yL + 2, '▲', estiloTexto(26, COLOR.tintaSuave, true)).setOrigin(0.5));
    if (inicio + filas < objetos.length) c.add(this.add.text(ANCHO / 2, yL + filas * altoFila + 24, '▼', estiloTexto(26, COLOR.tintaSuave, true)).setOrigin(0.5));

    // Descripción y acción del objeto marcado.
    const [id] = objetos[actual];
    const obj = DATOS.objetos[id];
    const uso = usoDe(obj);
    const interruptor = obj.tipo === 'clave' ? obj.interruptor : undefined;
    const accion = interruptor ? (p.banderas[interruptor.apagado] ? 'Encender' : 'Apagar') : uso.equipable ? 'Dar' : uso.fuera ? 'Usar' : null;
    c.add(ventana(this, 24, yD, ANCHO - 48, 216, { radio: 36 }));
    const circulo = this.add.graphics();
    circulo.fillStyle(COLOR.panelSuave, 1).fillCircle(112, yD + 108, 72);
    c.add(circulo);
    c.add(iconoObjeto(this, 112, yD + 108, id, 112));
    const ancho = accion ? ANCHO - 480 : ANCHO - 260;
    const nota = !accion ? (obj.tipo === 'clave' ? 'Objeto importante.' : 'Se usa en los combates.') : '';
    c.add(this.add.text(204, yD + 50, obj.nombre, estiloTexto(32, COLOR.tinta, true)).setOrigin(0, 0.5));
    c.add(
      this.add.text(204, yD + 84, nota ? `${obj.descripcion} ${nota}` : obj.descripcion, {
        ...estiloTexto(25, COLOR.tintaSuave),
        wordWrap: { width: ancho },
        lineSpacing: 4,
      }),
    );
    const usar = () => this.accionesObjeto(p, id, () => this.pantallaMochila(p, volver, bolsillo.id, actual));
    if (accion) c.add(new Boton(this, ANCHO - 158, yD + 108, { ancho: 220, alto: 120, texto: accion, tamano: 40, color: COLOR.verde, alPulsar: usar }));
    if (p.repelente > 0) {
      const aviso = pildora(this, 0, yD - 32, `Repelente: quedan ${p.repelente} pasos`, COLOR.tinta, 22);
      aviso.x = ANCHO / 2;
      c.add(aviso);
    }
    this.botonVolver(c, volver);
    this.nav = {
      mover: (dir) => {
        if (dir === 'izquierda' || dir === 'derecha') {
          if (bolsillos.length > 1) ir(k + (dir === 'izquierda' ? -1 : 1));
        } else {
          const destino = actual + (dir === 'arriba' ? -1 : 1);
          if (destino >= 0 && destino < objetos.length) ir(k, destino);
        }
      },
      aceptar: () => {
        if (accion) usar();
      },
    };
  }

  /** Qué hacer con un objeto de la mochila fuera del combate. */
  private accionesObjeto(p: Partida, id: string, volver: () => void): void {
    const obj = DATOS.objetos[id];
    const uso = usoDe(obj);
    if (uso.equipable) {
      this.elegirCriatura(p, `¿Quién lleva ${obj.nombre}?`, volver, (cr) => {
        const antes = cr.objeto ? DATOS.objetos[cr.objeto]?.nombre : null;
        equipar(p, cr, id, DATOS);
        this.aviso(`${nombreDe(cr, DATOS)} lleva ${obj.nombre}${antes ? `; ${antes} vuelve a la mochila` : ''}`);
        volver();
      });
      return;
    }
    if (obj.tipo === 'clave' && obj.interruptor) {
      const bandera = obj.interruptor.apagado;
      if (p.banderas[bandera]) delete p.banderas[bandera];
      else p.banderas[bandera] = true;
      this.aviso(`${obj.nombre}: ${p.banderas[bandera] ? 'apagado' : 'encendido'}`);
      volver();
      return;
    }
    if (!uso.fuera) {
      this.aviso(obj.tipo === 'clave' ? 'Es un objeto importante: guárdalo bien' : 'Se usa durante los combates');
      return;
    }
    if (obj.tipo === 'repelente') {
      if (p.repelente > 0) {
        this.aviso(`Todavía te dura: quedan ${p.repelente} pasos`);
        return;
      }
      p.repelente = obj.pasos;
      darObjeto(p, id, -1);
      this.aviso(`Usas ${conArticulo(obj.nombre)}: ${obj.pasos} pasos sin criaturas débiles`);
      volver();
      return;
    }
    if (obj.tipo === 'huida') {
      if (!this.ovilloPermitido) {
        this.aviso('Aquí no sirve: solo en los caminos');
        return;
      }
      darObjeto(p, id, -1);
      this.alUsarOvillo?.();
      return;
    }
    if (!seAplicaACriatura(obj)) return;
    const pregunta = obj.tipo === 'maquina' ? `¿Quién aprende ${DATOS.movimientos[obj.movimiento].nombre}?` : `¿A quién aplicas ${obj.nombre}?`;
    this.elegirCriatura(p, pregunta, volver, (cr) => {
      const motivo = motivoNoUsable(obj, cr, DATOS);
      if (motivo) {
        this.aviso(motivo);
        return;
      }
      void this.aplicarFuera(p, cr, id).then(volver);
    });
  }

  private elegirCriatura(p: Partida, titulo: string, volver: () => void, alElegir: (c: Criatura) => void): void {
    const c = this.abrirCapa(titulo, { icono: 'mochila', color: COLOR.bronce });
    const ancho = 504;
    const alto = 262;
    const marcos = p.equipo.map((cr, i) => {
      const x = 24 + (i % 2) * (ancho + 24);
      const y = 140 + Math.floor(i / 2) * (alto + 24);
      const marco = this.add.graphics();
      marco.lineStyle(10, COLOR.celeste, 1).strokeRoundedRect(x - 8, y - 8, ancho + 16, alto + 16, 38);
      c.add(marco);
      this.ranuraCriatura(c, cr, x, y, ancho, alto, { primera: i === 0 });
      const zona = this.add.rectangle(x + ancho / 2, y + alto / 2, ancho, alto, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      zona.on('pointerup', () => alElegir(cr));
      c.add(zona);
      return marco;
    });
    this.botonVolver(c, volver);
    let actual = 0;
    const marcar = (i: number) => {
      actual = i;
      marcos.forEach((m, j) => m.setVisible(j === i));
    };
    marcar(0);
    this.nav = {
      mover: (dir) => {
        const destino = actual + { izquierda: -1, derecha: 1, arriba: -2, abajo: 2 }[dir];
        if (destino >= 0 && destino < marcos.length) marcar(destino);
      },
      aceptar: () => {
        if (p.equipo[actual]) alElegir(p.equipo[actual]);
      },
    };
  }

  /** Aplica un objeto a una criatura fuera del combate, con sus consecuencias (niveles, evolución). */
  private async aplicarFuera(p: Partida, cr: Criatura, id: string): Promise<void> {
    const obj = DATOS.objetos[id];
    const nombre = nombreDe(cr, DATOS);
    if (obj.tipo === 'maquina') {
      // Las MT y MO no se gastan.
      const indice = cr.movimientos.length < 4 ? cr.movimientos.length : await this.preguntarOlvido(cr, obj.movimiento);
      if (indice < 0) return;
      Object.assign(cr, aprenderMovimiento(cr, obj.movimiento, indice, DATOS));
      this.aviso(`¡${nombre} ha aprendido ${DATOS.movimientos[obj.movimiento].nombre}!`);
      return;
    }
    darObjeto(p, id, -1);
    if (obj.tipo === 'curar' || obj.tipo === 'remedio' || obj.tipo === 'revivir' || obj.tipo === 'pp') {
      const recuperada = aplicarCuracion(obj, cr, DATOS);
      this.aviso(
        obj.tipo === 'remedio'
          ? `${nombre} se ha curado`
          : obj.tipo === 'revivir'
            ? `${nombre} se reanima`
            : obj.tipo === 'pp'
              ? `Los PP de ${nombre} se han recuperado`
              : `${nombre} recupera ${recuperada} de Vida`,
      );
      return;
    }
    if (obj.tipo === 'nivel') {
      const { criatura, subidas } = subirNivel(cr, DATOS);
      Object.assign(cr, criatura);
      this.aviso(`¡${nombre} sube al nivel ${cr.nivel}!`);
      for (const s of subidas) {
        for (const m of s.aprendidos) this.aviso(`¡${nombre} ha aprendido ${DATOS.movimientos[m].nombre}!`);
        for (const m of s.pendientes) {
          const indice = await this.preguntarOlvido(cr, m);
          if (indice >= 0) Object.assign(cr, aprenderMovimiento(cr, m, indice, DATOS));
        }
      }
      if (evolucionPendiente(cr, DATOS)) this.evolucionarFuera(p, cr);
      return;
    }
    if (obj.tipo === 'evolucion') this.evolucionarFuera(p, cr, destinoConObjeto(cr, id, DATOS));
  }

  private evolucionarFuera(p: Partida, cr: Criatura, destino?: string | null): void {
    const antes = nombreDe(cr, DATOS);
    Object.assign(cr, evolucionar(cr, DATOS, destino ?? undefined));
    marcarCapturado(p, cr.especie);
    this.aviso(`¡${antes} ha evolucionado en ${DATOS.especies[cr.especie].nombre}!`);
  }

  /** Ya sabe cuatro movimientos: ¿cuál olvida para aprender el nuevo? −1 si no lo aprende. */
  private preguntarOlvido(cr: Criatura, movimiento: string): Promise<number> {
    return new Promise((resolve) => {
      const nuevo = DATOS.movimientos[movimiento];
      const c = this.abrirCapa(`Aprender ${nuevo.nombre}`, { icono: 'tarjeta', color: colorTipoDe(cr.especie) });
      c.add(ventana(this, 24, 140, ANCHO - 48, 110, { color: COLOR.tinta, opacidad: 0.9, borde: null, radio: 55 }));
      c.add(this.add.text(64, 195, `${nombreDe(cr, DATOS)} ya sabe cuatro movimientos. ¿Cuál olvida?`, { ...estiloTexto(30, COLOR.panel, true), wordWrap: { width: ANCHO - 128 } }).setOrigin(0, 0.5));
      const ancho = (ANCHO - 96 - 20) / 2;
      cr.movimientos.forEach((m, i) => {
        const mov = DATOS.movimientos[m.id];
        c.add(this.tarjetaMovimiento(mov, m.pp, 48 + (i % 2) * (ancho + 20), 290 + Math.floor(i / 2) * 130, ancho, 110, false, () => resolve(i)));
      });
      c.add(pildora(this, 48, 590, 'Nuevo', COLOR.verde, 24));
      c.add(this.tarjetaMovimiento(nuevo, nuevo.pp, 48, 620, ANCHO - 96, 110, true, () => undefined));
      c.add(new Boton(this, ANCHO / 2, 830, { ancho: 520, alto: 112, texto: 'No aprenderlo', tamano: 36, color: COLOR.rojo, alPulsar: () => resolve(-1) }));
      this.alAtras = () => resolve(-1);
    });
  }

  // ---------- Modo desarrollador ----------

  /**
   * Herramientas para probar el juego sin jugarlo entero. Solo salen en la partida del modo
   * desarrollador (`p.dev`). `viajar` cierra el menú y lleva al jugador a otra zona.
   */
  private pantallaDesarrollador(p: Partida, volver: () => void, viajar: (pos: Posicion, texto?: string) => void, sel = 0): void {
    const c = this.abrirCapa('Desarrollador', { icono: 'opciones', color: COLOR.morado });
    const volverAqui = (k: number) => () => this.pantallaDesarrollador(p, volver, viajar, k);
    const sinEncuentros = Boolean(p.banderas['dev:sin_encuentros']);
    const opciones: { texto: string; ayuda: string; icono: IconoUI; accion: () => void }[] = [
      { texto: 'Dar objetos', ayuda: 'Cualquier objeto, en la cantidad que quieras.', icono: 'mochila', accion: () => this.pantallaDevObjetos(p, volverAqui(0)) },
      { texto: 'Dar criaturas', ayuda: 'Cualquier especie, al nivel que quieras.', icono: 'bestiario', accion: () => this.pantallaDevCriaturas(p, volverAqui(1)) },
      { texto: 'Viajar', ayuda: 'A cualquier zona de cualquier capítulo.', icono: 'mapa', accion: () => this.pantallaDevViajar(p, volverAqui(2), viajar) },
      {
        texto: 'Curar el equipo',
        ayuda: 'Vida, estados y usos de los movimientos, como en un mesón.',
        icono: 'equipo',
        accion: () => {
          curarEquipo(p, DATOS);
          this.aviso('Equipo curado');
        },
      },
      {
        texto: '+10 000 maravedís',
        ayuda: `Tienes ${p.dinero} ${MONEDA}.`,
        icono: 'dinero',
        accion: () => {
          p.dinero += 10000;
          this.aviso(`Ahora tienes ${p.dinero} ${MONEDA}`);
          volverAqui(4)();
        },
      },
      {
        texto: sinEncuentros ? 'Encuentros: no' : 'Encuentros: sí',
        ayuda: 'Quita o devuelve los combates con criaturas salvajes en la hierba alta.',
        icono: 'huir',
        accion: () => {
          p.banderas['dev:sin_encuentros'] = !sinEncuentros;
          volverAqui(5)();
        },
      },
      {
        texto: 'Ver todo el Bestiario',
        ayuda: 'Marca todas las especies como vistas, para mirar sus fichas y zonas.',
        icono: 'bestiario',
        accion: () => {
          for (const id of Object.keys(DATOS.especies)) marcarVisto(p, id);
          this.aviso('Bestiario visto entero');
        },
      },
    ];
    const y0 = 160;
    const paso = 124;
    const alto = 108;
    const marcas = opciones.map((o, i) => {
      const y = y0 + i * paso;
      const marca = franja(this, 32, y - 8, ANCHO - 64, alto + 16);
      c.add(marca);
      c.add(ventana(this, 40, y, ANCHO - 80, alto, { radio: alto / 2 }));
      const circulo = this.add.graphics();
      circulo.fillStyle(COLOR.morado, 1).fillCircle(100, y + alto / 2, 42);
      c.add(circulo);
      c.add(iconoUI(this, o.icono, 100, y + alto / 2, 70));
      c.add(this.add.text(166, y + alto / 2, o.texto, estiloTexto(38, COLOR.tinta, true)).setOrigin(0, 0.5));
      const zona = this.add.rectangle(ANCHO / 2, y + alto / 2, ANCHO - 80, alto, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      zona.on('pointerup', () => elegir(i));
      c.add(zona);
      return marca;
    });
    const ayuda = this.barraAyuda(c, '', 600);
    let actual = sel;
    const marcar = (i: number) => {
      actual = i;
      marcas.forEach((m, k) => m.setVisible(k === i));
      ayuda.setText(opciones[i].ayuda);
    };
    const elegir = (i: number) => {
      marcar(i);
      opciones[i].accion();
    };
    marcar(Math.min(sel, opciones.length - 1));
    c.add(new Boton(this, ANCHO - 190, ALTO_MAPA - 77, { ancho: 300, alto: 112, texto: 'Volver', tamano: 36, icono: { ui: 'cerrar', tam: 52 }, alPulsar: volver }));
    this.alAtras = volver;
    this.nav = {
      mover: (dir) => {
        if (dir === 'arriba' || dir === 'abajo') marcar((actual + (dir === 'arriba' ? -1 : 1) + opciones.length) % opciones.length);
      },
      aceptar: () => elegir(actual),
    };
  }

  /** Todos los objetos en una cuadrícula: cada toque da la cantidad elegida arriba. */
  private pantallaDevObjetos(p: Partida, volver: () => void, pagina = 0, cantidad = 1): void {
    const c = this.abrirCapa('Dar objetos', { icono: 'mochila', color: COLOR.bronce });
    const orden = CATEGORIAS.map((k) => k.id);
    const todos = Object.values(DATOS.objetos).sort((a, b) => orden.indexOf(a.categoria) - orden.indexOf(b.categoria) || a.nombre.localeCompare(b.nombre, 'es'));
    const porPagina = 18;
    const paginas = Math.ceil(todos.length / porPagina);
    const ir = (k: number, n = cantidad) => this.pantallaDevObjetos(p, volver, Math.max(0, Math.min(paginas - 1, k)), n);
    [1, 10, 99].forEach((n, k) => {
      c.add(new Boton(this, ANCHO - 396 + k * 126, 66, { ancho: 114, alto: 76, texto: `×${n}`, tamano: 30, color: n === cantidad ? COLOR.morado : COLOR.panel, alPulsar: () => ir(pagina, n) }));
    });
    const columnas = 3;
    const ancho = 328;
    const alto = 150;
    todos.slice(pagina * porPagina, (pagina + 1) * porPagina).forEach((o, i) => {
      const x = 24 + (i % columnas) * (ancho + 12);
      const y = 140 + Math.floor(i / columnas) * (alto + 12);
      c.add(ventana(this, x, y, ancho, alto, { radio: 26 }));
      c.add(iconoObjeto(this, x + 64, y + alto / 2, o.id, 84));
      c.add(this.add.text(x + 120, y + 52, o.nombre, { ...estiloTexto(26, COLOR.tinta, true), wordWrap: { width: ancho - 132 } }).setOrigin(0, 0.5));
      c.add(this.add.text(x + 120, y + 112, `Tienes ${p.objetos[o.id] ?? 0}`, estiloTexto(22, COLOR.tintaSuave, true)).setOrigin(0, 0.5));
      const zona = this.add.rectangle(x + ancho / 2, y + alto / 2, ancho, alto, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      zona.on('pointerup', () => {
        darObjeto(p, o.id, cantidad);
        this.aviso(`${o.nombre} ×${cantidad}`);
        ir(pagina);
      });
      c.add(zona);
    });
    this.paginacion(c, pagina, paginas, ir);
    this.botonVolver(c, volver);
    this.nav = { mover: (dir) => (dir === 'izquierda' ? ir(pagina - 1) : dir === 'derecha' ? ir(pagina + 1) : undefined), aceptar: () => undefined };
  }

  /** Todas las especies, como en el Bestiario; al elegir una se decide su nivel. */
  private pantallaDevCriaturas(p: Partida, volver: () => void, pagina = 0): void {
    const c = this.abrirCapa('Dar criaturas', { icono: 'bestiario', color: COLOR.verde });
    const todas = Object.values(DATOS.especies).sort((a, b) => a.numero - b.numero);
    const porPagina = 20;
    const paginas = Math.ceil(todas.length / porPagina);
    const ir = (k: number) => this.pantallaDevCriaturas(p, volver, Math.max(0, Math.min(paginas - 1, k)));
    c.add(pildora(this, ANCHO - 330, 66, `Equipo ${p.equipo.length}/${MAX_EQUIPO}`, COLOR.tinta, 24));
    const columnas = 4;
    const ancho = 243;
    const alto = 176;
    todas.slice(pagina * porPagina, (pagina + 1) * porPagina).forEach((e, i) => {
      const x = 24 + (i % columnas) * (ancho + 12);
      const y = 140 + Math.floor(i / columnas) * (alto + 12);
      c.add(ventana(this, x, y, ancho, alto, { radio: 26 }));
      c.add(this.add.text(x + 16, y + 20, String(e.numero).padStart(3, '0'), estiloTexto(20, COLOR.tintaSuave, true)).setOrigin(0, 0.5));
      const circulo = this.add.graphics();
      circulo.fillStyle(colorPedestal(e.id), 1).fillCircle(x + ancho / 2, y + 74, 52);
      c.add(circulo);
      c.add(crearCriaturaVisual(this, e.id, x + ancho / 2, y + 70, 104));
      c.add(this.add.text(x + ancho / 2, y + 150, e.nombre, estiloTexto(24, COLOR.tinta, true)).setOrigin(0.5));
      const zona = this.add.rectangle(x + ancho / 2, y + alto / 2, ancho, alto, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      zona.on('pointerup', () => this.pantallaDevNivel(p, e.id, () => ir(pagina)));
      c.add(zona);
    });
    this.paginacion(c, pagina, paginas, ir);
    this.botonVolver(c, volver);
    this.nav = { mover: (dir) => (dir === 'izquierda' ? ir(pagina - 1) : dir === 'derecha' ? ir(pagina + 1) : undefined), aceptar: () => undefined };
  }

  private pantallaDevNivel(p: Partida, especie: string, volver: () => void, nivel = 5): void {
    const e = DATOS.especies[especie];
    const color = colorTipoDe(especie);
    const c = this.abrirCapa(e.nombre, { icono: 'bestiario', color });
    const ir = (n: number) => this.pantallaDevNivel(p, especie, volver, Math.max(1, Math.min(100, n)));
    c.add(ventana(this, 24, 140, ANCHO - 48, ALTO_MAPA - 140 - 170, { radio: 36 }));
    const circulo = this.add.graphics();
    circulo.fillStyle(aclarar(color, 0.55), 1).fillCircle(ANCHO / 2, 360, 170);
    circulo.fillStyle(0xffffff, 0.35).fillCircle(ANCHO / 2, 360, 130);
    c.add(circulo);
    c.add(crearCriaturaVisual(this, especie, ANCHO / 2, 350, 310));
    const tipos = this.add.container(0, 0);
    tipos.x = ANCHO / 2 - filaTipos(this, tipos, 0, 580, e.tipos, 30) / 2;
    c.add(tipos);
    c.add(this.add.text(ANCHO / 2, 690, 'Nivel', estiloTexto(30, COLOR.tintaSuave, true)).setOrigin(0.5));
    c.add(this.add.text(ANCHO / 2, 770, String(nivel), estiloTexto(80, COLOR.tinta, true)).setOrigin(0.5));
    [-10, -1, 1, 10].forEach((d, k) => {
      const x = [130, 290, 790, 950][k];
      c.add(new Boton(this, x, 770, { ancho: 140, alto: 110, texto: d > 0 ? `+${d}` : `${d}`, tamano: 36, alPulsar: () => ir(nivel + d) }));
    });
    c.add(
      new Boton(this, ANCHO / 2, 960, {
        ancho: 640,
        alto: 130,
        texto: p.equipo.length < MAX_EQUIPO ? 'Añadir al equipo' : 'Añadir (va al Bestiario)',
        tamano: 38,
        color: COLOR.verde,
        alPulsar: () => {
          const cr = crearCriatura(DATOS, especie, nivel, p.rng);
          const donde = anadirCriatura(p, cr);
          this.aviso(donde === 'equipo' ? `${e.nombre} (Nv ${nivel}) se une al equipo` : `${e.nombre} va al Bestiario: el equipo está lleno`);
          ir(nivel);
        },
      }),
    );
    this.botonVolver(c, volver);
    this.nav = { mover: (dir) => ir(nivel + ({ izquierda: -1, derecha: 1, arriba: 10, abajo: -10 } as const)[dir]), aceptar: () => undefined };
  }

  /** Una página por capítulo, con sus zonas. */
  private pantallaDevViajar(p: Partida, volver: () => void, viajar: (pos: Posicion) => void, pagina?: number): void {
    const actual = CAPITULOS.findIndex((k) => k.zonas.includes(p.posicion.zona));
    const k = Math.max(0, Math.min(CAPITULOS.length - 1, pagina ?? Math.max(0, actual)));
    const cap = CAPITULOS[k];
    const c = this.abrirCapa('Viajar', { icono: 'mapa', color: COLOR.azul });
    const ir = (n: number) => this.pantallaDevViajar(p, volver, viajar, n);
    c.add(pildora(this, 40, 176, cap.nombre, COLOR.tinta, 28));
    cap.zonas.forEach((id, i) => {
      const destino = ENTRADAS[id];
      const x = i % 2 === 0 ? 282 : 798;
      const y = 290 + Math.floor(i / 2) * 140;
      c.add(
        new Boton(this, x, y, {
          ancho: 500,
          alto: 120,
          texto: ZONAS[id].nombre,
          subtexto: id === p.posicion.zona ? 'Estás aquí' : undefined,
          tamano: 30,
          color: id === p.posicion.zona ? COLOR.celeste : COLOR.panel,
          alPulsar: () => {
            if (!destino) return;
            this.cerrarCapa();
            viajar(destino);
          },
        }).setActivo(Boolean(destino)),
      );
    });
    this.paginacion(c, k, CAPITULOS.length, ir);
    this.botonVolver(c, volver);
    this.nav = { mover: (dir) => (dir === 'izquierda' ? ir(k - 1) : dir === 'derecha' ? ir(k + 1) : undefined), aceptar: () => undefined };
  }

  /** Flechas y número de página abajo, junto al botón de volver. */
  private paginacion(c: Phaser.GameObjects.Container, pagina: number, paginas: number, ir: (k: number) => void): void {
    if (paginas <= 1) return;
    c.add(botonFlecha(this, 110, ALTO_MAPA - 80, -1, () => ir(pagina - 1), 170, 112).setActivo(pagina > 0));
    c.add(botonFlecha(this, ANCHO - 110, ALTO_MAPA - 80, 1, () => ir(pagina + 1), 170, 112).setActivo(pagina < paginas - 1));
    c.add(pildora(this, ANCHO / 2 - 70, ALTO_MAPA - 168, `Página ${pagina + 1} de ${paginas}`, COLOR.tinta, 22));
  }

  // ---------- Tienda y almacén ----------

  /** Tienda: los precios salen de los datos de cada objeto. Cuatro productos por página. */
  tienda(productos: string[], p: Partida): Promise<void> {
    this.cerrarDialogo();
    const porPagina = 4;
    return new Promise((resolve) => {
      const pintar = (pagina: number) => {
        const c = this.abrirCapa('Tienda', { icono: 'tienda', color: COLOR.verde });
        this.alAtras = () => {
          this.cerrarCapa();
          resolve();
        };
        const bolsa = pildora(this, 0, 66, `${p.dinero} ${MONEDA}`, COLOR.tinta, 26);
        bolsa.x = ANCHO - 40 - bolsa.width / 2;
        c.add(bolsa);
        c.add(iconoUI(this, 'dinero', bolsa.x - bolsa.width / 2 - 30, 66, 52));
        productos.slice(pagina * porPagina, (pagina + 1) * porPagina).forEach((id, i) => {
          const obj = DATOS.objetos[id];
          const precio = obj.precio ?? 0;
          const y = 150 + i * 214;
          c.add(ventana(this, 24, y, ANCHO - 48, 196, { radio: 34 }));
          const circulo = this.add.graphics();
          circulo.fillStyle(COLOR.panelSuave, 1).fillCircle(110, y + 98, 64);
          c.add(circulo);
          c.add(iconoObjeto(this, 110, y + 98, id, 100));
          c.add(this.add.text(196, y + 40, obj.nombre, estiloTexto(34, COLOR.tinta, true)).setOrigin(0, 0.5));
          c.add(pildora(this, 196, y + 88, `${precio} ${MONEDA}`, COLOR.oro, 22, COLOR.tinta));
          c.add(this.add.text(196, y + 120, obj.descripcion, { ...estiloTexto(22, COLOR.tintaSuave), wordWrap: { width: 470 } }));
          c.add(this.add.text(ANCHO - 190, y + 40, `Tienes ${p.objetos[id] ?? 0}`, estiloTexto(24, COLOR.tintaSuave, true)).setOrigin(0.5));
          for (const [k, cantidad] of [1, 5].entries()) {
            c.add(
              new Boton(this, ANCHO - 262 + k * 150, y + 124, {
                ancho: 136,
                alto: 96,
                texto: `+${cantidad}`,
                tamano: 36,
                color: COLOR.verde,
                alPulsar: () => {
                  const coste = precio * cantidad;
                  if (p.dinero < coste) {
                    this.aviso('No te llega el dinero');
                    return;
                  }
                  p.dinero -= coste;
                  darObjeto(p, id, cantidad);
                  this.aviso(`Compras ${obj.nombre} ×${cantidad}`);
                  pintar(pagina);
                },
              }).setActivo(p.dinero >= precio * cantidad),
            );
          }
        });
        const paginas = Math.ceil(productos.length / porPagina);
        if (paginas > 1) {
          c.add(botonFlecha(this, 110, ALTO_MAPA - 80, -1, () => pintar(pagina - 1), 170, 112).setActivo(pagina > 0));
          c.add(botonFlecha(this, ANCHO - 110, ALTO_MAPA - 80, 1, () => pintar(pagina + 1), 170, 112).setActivo(pagina < paginas - 1));
        }
        c.add(new Boton(this, ANCHO / 2, ALTO_MAPA - 80, { ancho: 360, alto: 112, texto: 'Salir', tamano: 38, icono: { ui: 'cerrar', tam: 56 }, alPulsar: () => this.alAtras?.() }));
      };
      pintar(0);
    });
  }

  /**
   * El almacén: el equipo arriba y, debajo, las páginas del Bestiario con 30 huecos (6 × 5),
   * como las cajas de los juegos del género. Se toca una criatura y luego el sitio adonde va; si
   * está ocupado, se cambian. La cruceta mueve el cursor (y pasa de página por los lados) y A
   * hace lo mismo que tocar.
   */
  almacen(p: Partida): Promise<void> {
    this.cerrarDialogo();
    return new Promise((resolve) => {
      let pagina = 0;
      let seleccion: Lugar | null = null;
      let cursor: Lugar = { equipo: 0 };
      const igual = (a: Lugar | null, b: Lugar) =>
        !!a && ('equipo' in a ? 'equipo' in b && a.equipo === b.equipo : !('equipo' in b) && a.pagina === b.pagina && a.hueco === b.hueco);
      const salir = () => {
        this.cerrarCapa();
        resolve();
      };
      const cambiarPagina = (delta: number) => {
        pagina = (pagina + delta + p.paginas.length) % p.paginas.length;
        if (!('equipo' in cursor)) cursor = { pagina, hueco: cursor.hueco };
        pintar();
      };
      const tocar = (l: Lugar) => {
        cursor = l;
        if (!seleccion) {
          if (enLugar(p, l)) seleccion = l;
        } else if (igual(seleccion, l)) {
          seleccion = null;
        } else {
          const motivo = mover(p, seleccion, l);
          if (motivo) this.aviso(motivo);
          seleccion = null;
        }
        pintar();
      };
      const verFicha = () => {
        const cr = seleccion && enLugar(p, seleccion);
        if (!cr) return;
        const lista = 'equipo' in seleccion! ? p.equipo : p.paginas[pagina].filter((x): x is Criatura => x !== null);
        this.pantallaFicha(p, lista.indexOf(cr), () => pintar(), 0, 0, lista);
      };
      const soltar = async () => {
        const l = seleccion;
        const cr = l && enLugar(p, l);
        if (!l || !cr) return;
        const r = await this.elegir(`¿Dejas en libertad a ${nombreDe(cr, DATOS)}? No volverá.`, ['Liberar', 'Cancelar']);
        this.cerrarDialogo();
        if (r === 0) {
          const motivo = liberar(p, l);
          if (motivo) this.aviso(motivo);
          else this.aviso(`${nombreDe(cr, DATOS)} vuelve a su tierra. ¡Adiós!`);
        }
        seleccion = null;
        pintar();
      };

      const pintar = () => {
        const c = this.abrirCapa('Almacén', { icono: 'equipo', color: COLOR.verde });
        this.alAtras = () => {
          if (seleccion) {
            seleccion = null;
            pintar();
          } else salir();
        };
        const celda = 160;
        const x0 = ANCHO / 2 - (COLUMNAS_PAGINA * celda) / 2 + celda / 2;
        const hueco = (l: Lugar, cr: Criatura | null, x: number, y: number) => {
          const g = this.add.graphics();
          if (igual(seleccion, l)) g.fillStyle(COLOR.oro, 0.55).fillRoundedRect(x - 74, y - 68, 148, 136, 26);
          if (igual(cursor, l)) g.lineStyle(8, COLOR.celeste, 1).strokeRoundedRect(x - 74, y - 68, 148, 136, 26);
          if (cr) {
            g.fillStyle(colorPedestal(cr.especie), 1).fillCircle(x, y + 4, 52);
            c.add(g);
            const figura = crearCriaturaVisual(this, cr.especie, x, y, 100, true);
            if (cr.vida <= 0) figura.setAlpha(0.45);
            c.add(figura);
            c.add(this.add.text(x + 60, y + 52, `${cr.nivel}`, estiloTexto(22, COLOR.tinta, true)).setOrigin(1, 0.5));
          } else {
            g.fillStyle(COLOR.panelSuave, 1).fillCircle(x, y + 4, 40);
            c.add(g);
          }
          const zona = this.add.rectangle(x, y, celda, 140, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
          zona.on('pointerup', () => tocar(l));
          c.add(zona);
        };

        // El equipo.
        c.add(ventana(this, 24, 136, ANCHO - 48, 176, { radio: 36 }));
        for (let i = 0; i < MAX_EQUIPO; i++) hueco({ equipo: i }, p.equipo[i] ?? null, x0 + i * celda, 224);

        // La página.
        const pg = p.paginas[pagina];
        c.add(botonFlecha(this, 110, 366, -1, () => cambiarPagina(-1), 150, 84));
        c.add(botonFlecha(this, ANCHO - 110, 366, 1, () => cambiarPagina(1), 150, 84));
        const ocupados = pg.filter(Boolean).length;
        const titulo = pildora(this, 0, 366, `Página ${pagina + 1} de ${p.paginas.length} · ${ocupados}/${HUECOS_PAGINA}`, COLOR.tinta, 28);
        titulo.x = ANCHO / 2;
        c.add(titulo);
        c.add(ventana(this, 24, 420, ANCHO - 48, 5 * 146 + 24, { radio: 36 }));
        pg.forEach((cr, i) => hueco({ pagina, hueco: i }, cr, x0 + (i % COLUMNAS_PAGINA) * celda, 506 + Math.floor(i / COLUMNAS_PAGINA) * 146));

        // Lo que está elegido y qué hacer con ello.
        const elegida = seleccion && enLugar(p, seleccion);
        const ayuda = elegida
          ? `${nombreDe(elegida, DATOS)} · Nv ${elegida.nivel}. Toca otro sitio para moverla.`
          : 'Toca una criatura para moverla, ver su ficha o liberarla.';
        c.add(this.add.text(ANCHO / 2, 420 + 5 * 146 + 64, ayuda, { ...estiloTexto(28, COLOR.panel, true), align: 'center', wordWrap: { width: ANCHO - 80 } }).setOrigin(0.5));
        const yB = ALTO_MAPA - 80;
        if (elegida) {
          c.add(new Boton(this, 190, yB, { ancho: 320, alto: 112, texto: 'Volver', tamano: 34, icono: { ui: 'cerrar', tam: 50 }, alPulsar: () => this.alAtras?.() }));
          c.add(new Boton(this, 540, yB, { ancho: 320, alto: 112, texto: 'Ficha', tamano: 34, icono: { ui: 'tarjeta', tam: 50 }, alPulsar: verFicha }));
          c.add(new Boton(this, 890, yB, { ancho: 320, alto: 112, texto: 'Liberar', tamano: 34, color: COLOR.rojo, alPulsar: () => void soltar() }));
        } else {
          c.add(new Boton(this, ANCHO / 2, yB, { ancho: 360, alto: 112, texto: 'Listo', tamano: 38, color: COLOR.verde, alPulsar: salir }));
        }

        this.nav = {
          mover: (dir) => {
            if ('equipo' in cursor) {
              if (dir === 'izquierda') cursor = { equipo: Math.max(0, cursor.equipo - 1) };
              else if (dir === 'derecha') cursor = { equipo: Math.min(MAX_EQUIPO - 1, cursor.equipo + 1) };
              else if (dir === 'abajo') cursor = { pagina, hueco: cursor.equipo };
            } else {
              const col = cursor.hueco % COLUMNAS_PAGINA;
              const fila = Math.floor(cursor.hueco / COLUMNAS_PAGINA);
              if (dir === 'arriba') cursor = fila === 0 ? { equipo: col } : { pagina, hueco: cursor.hueco - COLUMNAS_PAGINA };
              else if (dir === 'abajo') cursor = { pagina, hueco: Math.min(HUECOS_PAGINA - 1, cursor.hueco + COLUMNAS_PAGINA) };
              else if (dir === 'izquierda') {
                if (col === 0) return cambiarPagina(-1);
                cursor = { pagina, hueco: cursor.hueco - 1 };
              } else {
                if (col === COLUMNAS_PAGINA - 1) return cambiarPagina(1);
                cursor = { pagina, hueco: cursor.hueco + 1 };
              }
            }
            pintar();
          },
          aceptar: () => tocar(cursor),
        };
      };
      pintar();
    });
  }
}
