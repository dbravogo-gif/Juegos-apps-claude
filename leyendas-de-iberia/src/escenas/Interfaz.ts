import Phaser from 'phaser';
import type { Dir } from '../core/mundo';
import type { Partida } from '../core/partida';
import { darObjeto, marcarCapturado, MAX_EQUIPO } from '../core/partida';
import { aplicarCuracion, equipar, motivoNoUsable, quitarObjeto, seAplicaACriatura, usoDe } from '../core/objetos';
import { calcularEstadisticas } from '../core/estadisticas';
import { nombreDe } from '../core/criatura';
import { aprenderMovimiento, destinoConObjeto, evolucionar, evolucionPendiente, expParaNivel, subirNivel } from '../core/progreso';
import type { CategoriaObjeto, Criatura } from '../core/modelo';
import { NOMBRE_ESTADISTICA, type EstadisticaCombate } from '../core/modelo';
import { DATOS } from '../data';
import { INICIALES } from '../data/especies';
import { CATEGORIAS } from '../data/objetos';
import { Barra, Boton, filaTipos } from '../ui/componentes';
import { crearCriaturaVisual } from '../ui/criaturaVisual';
import { conArticulo, describirMovimiento } from '../ui/textos';
import { iconoObjeto } from '../ui/objetoVisual';
import { construirTablaTipos, textoMultiplicador } from '../ui/tablaTipos';
import { debilidades } from '../core/tipos';
import { guardarPartida } from '../ui/sesion';
import { aclarar, ALTO, ANCHO, COLOR, estiloTexto } from '../ui/tema';
import { cabecera, colorPedestal, cursor, fondoMenu, iconoMenu, pildora, ventana, type IconoMenu } from '../ui/ventanas';

/** Alto del mando, abajo del todo. El mapa ocupa el resto. */
const ALTO_MANDO = 680;

// Capa de interfaz del modo historia, por encima del mapa: mando táctil, teclado, diálogos,
// elecciones y menús. El mapa le pregunta por la dirección pulsada y escucha los eventos «a» y
// «menu». Todo lo que espera al jugador devuelve una promesa.

/** Alto de la zona del mapa; debajo va el mando. En móviles alargados el mapa gana alto. */
export const ALTO_MAPA = ALTO - ALTO_MANDO;
export const MONEDA = 'maravedís';

const CRUCETA = { x: 250, y: ALTO_MAPA + 320, radio: 200 };
const BOTON_A = { x: 880, y: ALTO_MAPA + 250, radio: 100 };
const BOTON_B = { x: 690, y: ALTO_MAPA + 400, radio: 82 };
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
  private teclas!: Record<'arriba' | 'abajo' | 'izquierda' | 'derecha' | 'w' | 'a' | 's' | 'd', Phaser.Input.Keyboard.Key>;
  private flechas: Partial<Record<Dir, Phaser.GameObjects.Graphics>> = {};

  private capaDialogo!: Phaser.GameObjects.Container;
  private textoDialogo!: Phaser.GameObjects.Text;
  private nombreDialogo!: Phaser.GameObjects.Text;
  private fondoNombre!: Phaser.GameObjects.Rectangle;
  private indicador!: Phaser.GameObjects.Text;
  private alAvanzar: (() => void) | null = null;

  private capaEleccion?: Phaser.GameObjects.Container;
  private opciones: { boton: Boton; elegir: () => void }[] = [];
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
  }

  // ---------- Mando ----------

  private crearMando(): void {
    this.add.rectangle(0, ALTO_MAPA, ANCHO, ALTO - ALTO_MAPA, COLOR.fondo).setOrigin(0, 0);
    this.add.rectangle(0, ALTO_MAPA, ANCHO, 8, COLOR.oro).setOrigin(0, 0);

    // Cruceta: una sola zona circular; la dirección sale del ángulo del dedo.
    const { x, y, radio } = CRUCETA;
    this.add.circle(x, y, radio, 0x2b211a).setStrokeStyle(6, 0x4a3a2c);
    const brazo = 120;
    const grosor = 120;
    this.add.rectangle(x, y, grosor, brazo * 2 + grosor, 0x4a3a2c).setRounded(18);
    this.add.rectangle(x, y, brazo * 2 + grosor, grosor, 0x4a3a2c).setRounded(18);
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
    this.botonRedondo(BOTON_B.x, BOTON_B.y, BOTON_B.radio, COLOR.bronce, 'B', 'Volver', () => this.pulsarB());
    new Boton(this, 880, ALTO_MAPA + 570, { ancho: 260, alto: 100, texto: 'Menú', tamano: 38, alPulsar: () => this.pulsarMenu() });
  }

  private dibujarFlecha(g: Phaser.GameObjects.Graphics, x: number, y: number, dir: Dir, activa: boolean): void {
    g.clear();
    g.fillStyle(activa ? COLOR.oro : COLOR.pergaminoOscuro, 1);
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
    const brazo = 120;
    const pos: Record<Dir, [number, number]> = { arriba: [0, -brazo], abajo: [0, brazo], izquierda: [-brazo, 0], derecha: [brazo, 0] };
    for (const d of [anterior, dir]) {
      if (!d) continue;
      this.dibujarFlecha(this.flechas[d]!, CRUCETA.x + pos[d][0], CRUCETA.y + pos[d][1], d, d === dir);
    }
    // En menús y elecciones, la cruceta mueve la selección.
    if (dir && this.capaEleccion) this.moverSeleccion(dir === 'arriba' || dir === 'izquierda' ? -1 : 1);
    else if (dir && this.capaMenu) this.nav?.mover(dir);
  }

  private botonRedondo(x: number, y: number, r: number, color: number, letra: string, etiqueta: string, accion: () => void): void {
    const c = this.add.circle(x, y, r, color).setStrokeStyle(6, 0x1d1611).setInteractive({ useHandCursor: true });
    this.add.text(x, y, letra, estiloTexto(Math.round(r * 0.8), COLOR.pergamino, true)).setOrigin(0.5);
    this.add.text(x, y + r + 28, etiqueta, estiloTexto(28, COLOR.pergaminoOscuro)).setOrigin(0.5);
    let ultima = -Infinity;
    c.on('pointerdown', () => {
      c.setScale(0.94);
      if (this.time.now - ultima < 150) return;
      ultima = this.time.now;
      accion();
    });
    c.on('pointerup', () => c.setScale(1));
    c.on('pointerout', () => c.setScale(1));
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
    const fondo = ventana(this, 24, ALTO_MAPA - 270, ANCHO - 48, 250);
    this.fondoNombre = this.add.rectangle(48, ALTO_MAPA - 300, 300, 64, COLOR.rojo).setOrigin(0, 0).setRounded(14);
    this.nombreDialogo = this.add.text(70, ALTO_MAPA - 268, '', estiloTexto(34, COLOR.pergamino, true)).setOrigin(0, 0.5);
    this.textoDialogo = this.add.text(64, ALTO_MAPA - 238, '', {
      ...estiloTexto(42, COLOR.tinta),
      wordWrap: { width: ANCHO - 140 },
      lineSpacing: 8,
    });
    this.indicador = this.add.text(ANCHO - 70, ALTO_MAPA - 50, '▼', estiloTexto(32, COLOR.rojo)).setOrigin(0.5);
    this.tweens.add({ targets: this.indicador, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 });
    c.add([zona, fondo, this.fondoNombre, this.nombreDialogo, this.textoDialogo, this.indicador]);
    c.setVisible(false);
    this.capaDialogo = c;
  }

  private mostrarTexto(texto: string, quien?: string, indicador = true): void {
    this.capaDialogo.setVisible(true);
    this.textoDialogo.setText(texto);
    this.nombreDialogo.setText(quien ?? '');
    this.fondoNombre.setVisible(Boolean(quien));
    this.nombreDialogo.setVisible(Boolean(quien));
    if (quien) this.fondoNombre.width = this.nombreDialogo.width + 44;
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
  elegir(pregunta: string, opciones: string[], quien?: string): Promise<number> {
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
      const alto = 110;
      const ancho = 480;
      const y0 = ALTO_MAPA - 300 - opciones.length * (alto + 12);
      c.add(ventana(this, ANCHO - ancho - 44, y0 - 16, ancho + 20, opciones.length * (alto + 12) + 20));
      this.opciones = opciones.map((texto, i) => {
        const boton = new Boton(this, ANCHO - ancho / 2 - 34, y0 + i * (alto + 12) + alto / 2, {
          ancho,
          alto,
          texto,
          tamano: 38,
          alPulsar: () => terminar(i),
        });
        c.add(boton);
        return { boton, elegir: () => terminar(i) };
      });
      this.seleccion = 0;
      this.marcarSeleccion();
      this.alCancelar = () => terminar(opciones.length - 1);
    });
  }

  private moverSeleccion(delta: number): void {
    if (this.opciones.length === 0) return;
    this.seleccion = (this.seleccion + delta + this.opciones.length) % this.opciones.length;
    this.marcarSeleccion();
  }

  private marcarSeleccion(): void {
    this.opciones.forEach((o, i) => o.boton.setScale(i === this.seleccion ? 1.04 : 1).setAlpha(i === this.seleccion ? 1 : 0.85));
  }

  /** Aviso breve arriba del mapa que no detiene el juego. */
  aviso(texto: string): void {
    this.avisos?.destroy();
    const t = this.add.text(0, 0, texto, estiloTexto(36, COLOR.pergamino, true)).setOrigin(0, 0.5);
    const fondo = this.add.rectangle(-24, 0, t.width + 48, 76, COLOR.fondo, 0.85).setOrigin(0, 0.5).setRounded(16);
    const c = this.add.container(40, 70, [fondo, t]).setDepth(40).setAlpha(0);
    this.avisos = c;
    this.tweens.add({ targets: c, alpha: 1, duration: 200, yoyo: true, hold: 1500, onComplete: () => c.destroy() });
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
          const c = this.abrirCapa('Elige compañera');
          const ancho = 320;
          INICIALES.forEach((id, i) => {
            const e = DATOS.especies[id];
            const x = 40 + ancho / 2 + i * (ancho + 20);
            const tarjeta = this.add.rectangle(x, 600, ancho, 700, COLOR.pergamino).setRounded(24).setStrokeStyle(6, COLOR.tinta);
            tarjeta.setInteractive({ useHandCursor: true }).on('pointerup', () => resolve(id));
            c.add(tarjeta);
            c.add(crearCriaturaVisual(this, id, x, 400, 230, true));
            c.add(this.add.text(x, 570, e.nombre, { ...estiloTexto(38, COLOR.tinta, true), align: 'center', wordWrap: { width: ancho - 30 } }).setOrigin(0.5));
            const tipos = this.add.container(0, 0);
            filaTipos(this, tipos, x - 60, 650, e.tipos, 28);
            c.add(tipos);
            c.add(
              this.add
                .text(x, 695, e.descripcion, { ...estiloTexto(22, COLOR.tintaSuave), align: 'center', wordWrap: { width: ancho - 36 } })
                .setOrigin(0.5, 0),
            );
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
   * oscurecido detrás (el menú de pausa); si no, la tapa un fondo con rayas y una cabecera.
   */
  private abrirCapa(titulo: string, op: { superpuesta?: boolean } = {}): Phaser.GameObjects.Container {
    this.capaMenu?.destroy();
    this.nav = null;
    const c = this.add.container(0, 0).setDepth(25);
    if (op.superpuesta) {
      c.add(this.add.rectangle(0, 0, ANCHO, ALTO_MAPA, 0x000000, 0.45).setOrigin(0, 0).setInteractive());
    } else {
      c.add(this.add.rectangle(0, 0, ANCHO, ALTO_MAPA, COLOR.fondo).setOrigin(0, 0).setInteractive());
      c.add(fondoMenu(this, ALTO_MAPA));
      cabecera(this, c, titulo);
    }
    this.capaMenu = c;
    return c;
  }

  private cerrarCapa(): void {
    this.capaMenu?.destroy();
    this.capaMenu = undefined;
    this.alAtras = null;
    this.nav = null;
  }

  /**
   * Menú de pausa: equipo, Bestiario, mochila, tipos y guardar. Devuelve `'ovillo'` si se ha
   * usado una Cuerda huida, para que el mapa lleve al jugador al mesón.
   */
  menu(p: Partida, op: { ovilloPermitido: boolean } = { ovilloPermitido: false }): Promise<'ovillo' | undefined> {
    this.ovilloPermitido = op.ovilloPermitido;
    return new Promise((resolve) => {
      this.alUsarOvillo = () => {
        this.cerrarCapa();
        resolve('ovillo');
      };
      const principal = (inicial = 0) => {
        const c = this.abrirCapa(p.nombre, { superpuesta: true });
        this.alAtras = () => {
          this.cerrarCapa();
          resolve(undefined);
        };
        this.tarjetaJugador(c, p);
        const volverAqui = (i: number) => () => principal(i);
        const opciones: { texto: string; icono: IconoMenu; ayuda: string; activo: boolean; accion: (i: number) => void }[] = [
          {
            texto: 'Equipo',
            icono: 'equipo',
            ayuda: 'Mira cómo están tus criaturas, cámbialas de orden y quítales lo que llevan.',
            activo: p.equipo.length > 0,
            accion: (i) => this.pantallaEquipo(p, volverAqui(i)),
          },
          {
            texto: 'Bestiario',
            icono: 'bestiario',
            ayuda: 'Las criaturas que has visto y con las que has sellado un pacto.',
            activo: true,
            accion: (i) => this.pantallaBestiario(p, volverAqui(i)),
          },
          { texto: 'Mochila', icono: 'mochila', ayuda: 'Tus objetos, ordenados por bolsillos.', activo: true, accion: (i) => this.pantallaMochila(p, volverAqui(i)) },
          { texto: 'Tipos', icono: 'tipos', ayuda: 'Qué tipo es fuerte o débil contra cuál.', activo: true, accion: (i) => this.pantallaTipos(volverAqui(i)) },
          {
            texto: 'Guardar',
            icono: 'guardar',
            ayuda: 'Guarda la partida en este dispositivo. También se guarda sola al cambiar de zona.',
            activo: true,
            accion: () => this.aviso(guardarPartida(p) ? 'Partida guardada' : 'No se ha podido guardar'),
          },
          { texto: 'Cerrar', icono: 'cerrar', ayuda: 'Vuelve al camino.', activo: true, accion: () => this.alAtras?.() },
        ];

        // Lista de opciones a la derecha, como en los juegos del género.
        const x0 = 590;
        const ancho = ANCHO - x0 - 24;
        const altoFila = 116;
        const y0 = 24;
        c.add(ventana(this, x0, y0, ancho, opciones.length * altoFila + 44));
        const marcas: Phaser.GameObjects.Graphics[] = [];
        opciones.forEach((o, i) => {
          const y = y0 + 22 + i * altoFila;
          const marca = this.add.graphics();
          marca.fillStyle(aclarar(COLOR.oro, 0.5), 1);
          marca.fillRoundedRect(x0 + 18, y + 6, ancho - 36, altoFila - 12, 18);
          marca.setVisible(false);
          marcas.push(marca);
          c.add(marca);
          const icono = iconoMenu(this, o.icono, x0 + 104, y + altoFila / 2, 68);
          const texto = this.add.text(x0 + 160, y + altoFila / 2, o.texto, estiloTexto(44, COLOR.tinta, true)).setOrigin(0, 0.5);
          if (!o.activo) {
            icono.setAlpha(0.35);
            texto.setAlpha(0.35);
          }
          c.add([icono, texto]);
          const zona = this.add.rectangle(x0 + ancho / 2, y + altoFila / 2, ancho - 20, altoFila, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
          zona.on('pointerup', () => elegir(i));
          c.add(zona);
        });
        const flecha = cursor(this, x0 + 46, 0, 40);
        c.add(flecha);

        // Ventana de ayuda abajo: qué hace la opción marcada.
        const altoAyuda = 170;
        c.add(ventana(this, 24, ALTO_MAPA - altoAyuda - 24, ANCHO - 48, altoAyuda));
        const ayuda = this.add.text(64, ALTO_MAPA - altoAyuda - 24 + altoAyuda / 2, '', {
          ...estiloTexto(34, COLOR.tinta),
          wordWrap: { width: ANCHO - 128 },
          lineSpacing: 6,
        });
        ayuda.setOrigin(0, 0.5);
        c.add(ayuda);

        let sel = inicial;
        const marcar = (i: number) => {
          sel = i;
          marcas.forEach((m, j) => m.setVisible(j === i));
          flecha.y = y0 + 22 + i * altoFila + altoFila / 2;
          ayuda.setText(opciones[i].ayuda);
        };
        const elegir = (i: number) => {
          marcar(i);
          if (opciones[i].activo) opciones[i].accion(i);
        };
        marcar(sel);
        this.nav = {
          mover: (dir) => {
            if (dir === 'arriba' || dir === 'abajo') marcar((sel + (dir === 'arriba' ? -1 : 1) + opciones.length) % opciones.length);
          },
          aceptar: () => elegir(sel),
        };
      };
      principal();
    });
  }

  /** Tarjeta del jugador en el menú de pausa: nombre, dinero, Bestiario y blasones. */
  private tarjetaJugador(c: Phaser.GameObjects.Container, p: Partida): void {
    const x = 24;
    const y = 24;
    const ancho = 540;
    c.add(ventana(this, x, y, ancho, 330, { color: aclarar(COLOR.pergaminoOscuro, 0.2) }));
    c.add(this.add.text(x + 40, y + 52, p.nombre, estiloTexto(48, COLOR.tinta, true)).setOrigin(0, 0.5));
    const moneda = this.add.graphics();
    moneda.fillStyle(COLOR.oro, 1).lineStyle(3, COLOR.tinta, 1);
    moneda.fillCircle(x + 56, y + 122, 16).strokeCircle(x + 56, y + 122, 16);
    c.add(moneda);
    c.add(this.add.text(x + 86, y + 122, `${p.dinero} ${MONEDA}`, estiloTexto(32, COLOR.tinta)).setOrigin(0, 0.5));
    c.add(this.add.text(x + 40, y + 176, `Bestiario: ${p.capturados.length} pactos, ${p.vistos.length} vistas`, estiloTexto(28, COLOR.tintaSuave)).setOrigin(0, 0.5));
    c.add(this.add.text(x + 40, y + 228, 'Blasones', estiloTexto(26, COLOR.tintaSuave, true)).setOrigin(0, 0.5));
    // Ocho huecos, uno por gimnasio: los ganados, en oro.
    const g = this.add.graphics();
    for (let i = 0; i < 8; i++) {
      const cx = x + 62 + i * 58;
      const cy = y + 280;
      const ganado = i < p.blasones.length;
      g.fillStyle(ganado ? COLOR.oro : aclarar(COLOR.tintaSuave, 0.55), 1);
      g.lineStyle(3, COLOR.tinta, ganado ? 1 : 0.4);
      const pts = [new Phaser.Math.Vector2(cx, cy - 22), new Phaser.Math.Vector2(cx + 20, cy), new Phaser.Math.Vector2(cx, cy + 22), new Phaser.Math.Vector2(cx - 20, cy)];
      g.fillPoints(pts, true);
      g.strokePoints(pts, true);
    }
    c.add(g);
  }

  private botonVolver(c: Phaser.GameObjects.Container, volver: () => void): void {
    this.alAtras = volver;
    c.add(new Boton(this, ANCHO / 2, ALTO_MAPA - 80, { ancho: 400, alto: 110, texto: 'Volver', alPulsar: volver }));
  }

  /**
   * El equipo: seis huecos en dos columnas, como en los juegos del género. Al elegir una
   * criatura sale un menú pequeño (ficha, mover, quitar objeto). `moviendo` es la criatura que se
   * está cambiando de sitio.
   */
  private pantallaEquipo(p: Partida, volver: () => void, sel = 0, moviendo: number | null = null): void {
    const c = this.abrirCapa('Equipo');
    const ancho = 504;
    const alto = 268;
    const pos = (i: number) => ({ x: 24 + (i % 2) * (ancho + 24), y: 136 + Math.floor(i / 2) * (alto + 22) });
    const marcos: Phaser.GameObjects.Graphics[] = [];
    for (let i = 0; i < MAX_EQUIPO; i++) {
      const { x, y } = pos(i);
      const cr = p.equipo[i];
      if (!cr) {
        c.add(ventana(this, x, y, ancho, alto, { color: 0x3a2e24, filete: 0x5a4a3a, sombra: false, brillo: false }));
        continue;
      }
      const marco = this.add.graphics();
      marco.lineStyle(10, moviendo === i ? COLOR.rojo : COLOR.oro, 1);
      marco.strokeRoundedRect(x - 8, y - 8, ancho + 16, alto + 16, 32);
      marco.setVisible(false);
      marcos.push(marco);
      c.add(marco);
      this.ranuraCriatura(c, cr, x, y, ancho, alto, { primera: i === 0, moviendo: moviendo === i });
      const zona = this.add.rectangle(x + ancho / 2, y + alto / 2, ancho, alto, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      zona.on('pointerup', () => elegir(i));
      c.add(zona);
    }

    // Ventana de mensaje y botón de salir, abajo.
    const yMensaje = ALTO_MAPA - 190;
    c.add(ventana(this, 24, yMensaje, ANCHO - 340, 166));
    const mensaje = moviendo !== null ? `¿Con quién cambias a ${nombreDe(p.equipo[moviendo], DATOS)}?` : 'Elige una criatura.';
    c.add(this.add.text(64, yMensaje + 83, mensaje, { ...estiloTexto(36, COLOR.tinta), wordWrap: { width: ANCHO - 430 } }).setOrigin(0, 0.5));
    const cancelar = moviendo !== null ? () => this.pantallaEquipo(p, volver, moviendo) : volver;
    this.alAtras = cancelar;
    c.add(
      new Boton(this, ANCHO - 162, yMensaje + 83, {
        ancho: 270,
        alto: 140,
        texto: moviendo !== null ? 'Cancelar' : 'Salir',
        tamano: 38,
        color: COLOR.bronce,
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
        const paso = { izquierda: -1, derecha: 1, arriba: -2, abajo: 2 }[dir];
        const destino = actual + paso;
        if (destino >= 0 && destino < n) marcar(destino);
      },
      aceptar: () => elegir(actual),
    };
  }

  /** Lo que se puede hacer con una criatura del equipo: una ventanita sobre la pantalla. */
  private menuRanura(p: Partida, i: number, volver: () => void): void {
    const cr = p.equipo[i];
    const opciones: [string, () => void][] = [['Ficha', () => this.pantallaFicha(p, i, () => this.pantallaEquipo(p, volver, i))]];
    if (p.equipo.length > 1) opciones.push(['Mover', () => this.pantallaEquipo(p, volver, i, i)]);
    if (cr.objeto) {
      opciones.push([
        'Quitar objeto',
        () => {
          const nombre = DATOS.objetos[cr.objeto!]?.nombre;
          quitarObjeto(p, cr);
          this.aviso(`${nombre} vuelve a la mochila`);
          this.pantallaEquipo(p, volver, i);
        },
      ]);
    }
    opciones.push(['Cancelar', () => this.pantallaEquipo(p, volver, i)]);
    const ancho = 420;
    const altoFila = 96;
    const alto = opciones.length * altoFila + 40;
    const x = ANCHO - ancho - 24;
    const y = ALTO_MAPA - 210 - alto;
    const sub = this.add.container(0, 0);
    sub.add(this.add.rectangle(0, 0, ANCHO, ALTO_MAPA, 0x000000, 0.35).setOrigin(0, 0).setInteractive());
    sub.add(ventana(this, x, y, ancho, alto));
    const titulo = this.add.text(x + 24, y - 36, nombreDe(cr, DATOS), estiloTexto(36, COLOR.pergamino, true)).setOrigin(0, 0.5);
    titulo.setShadow(0, 3, '#000000', 0, false, true);
    sub.add(titulo);
    const marcas = opciones.map(([texto, accion], j) => {
      const fy = y + 20 + j * altoFila;
      const marca = this.add.graphics();
      marca.fillStyle(aclarar(COLOR.oro, 0.5), 1).fillRoundedRect(x + 16, fy + 6, ancho - 32, altoFila - 12, 16);
      sub.add(marca);
      sub.add(this.add.text(x + 80, fy + altoFila / 2, texto, estiloTexto(38, COLOR.tinta, true)).setOrigin(0, 0.5));
      const zona = this.add.rectangle(x + ancho / 2, fy + altoFila / 2, ancho - 20, altoFila, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      zona.on('pointerup', accion);
      sub.add(zona);
      return marca;
    });
    const flecha = cursor(this, x + 46, 0, 34);
    sub.add(flecha);
    this.capaMenu!.add(sub);
    let actual = 0;
    const marcar = (j: number) => {
      actual = j;
      marcas.forEach((m, k) => m.setVisible(k === j));
      flecha.y = y + 20 + j * altoFila + altoFila / 2;
    };
    marcar(0);
    this.alAtras = () => this.pantallaEquipo(p, volver, i);
    this.nav = {
      mover: (dir) => {
        if (dir === 'arriba' || dir === 'abajo') marcar((actual + (dir === 'arriba' ? -1 : 1) + opciones.length) % opciones.length);
      },
      aceptar: () => opciones[actual][1](),
    };
  }

  /**
   * Hueco de una criatura: pedestal del color de su tipo, nombre, nivel, tipos, estado, objeto
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
    const color = debilitada ? aclarar(COLOR.rojo, 0.62) : op.moviendo ? aclarar(COLOR.rojo, 0.75) : op.primera ? aclarar(COLOR.oro, 0.62) : COLOR.pergamino;
    c.add(ventana(this, x, y, ancho, alto, { color }));
    const px = x + 112;
    const py = y + alto / 2 - 8;
    const pedestal = this.add.graphics();
    pedestal.fillStyle(colorPedestal(cr.especie), 1).fillCircle(px, py, 86);
    pedestal.lineStyle(4, COLOR.tinta, 0.6).strokeCircle(px, py, 86);
    pedestal.fillStyle(0x000000, 0.15).fillEllipse(px, py + 56, 120, 26);
    c.add(pedestal);
    const figura = crearCriaturaVisual(this, cr.especie, px, py - 4, 160, true);
    if (debilitada) figura.setAlpha(0.55);
    else this.tweens.add({ targets: figura, y: figura.y - 6, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    c.add(figura);
    if (cr.objeto) {
      const fondo = this.add.graphics();
      fondo.fillStyle(COLOR.pergamino, 1).fillCircle(px + 70, py + 64, 26);
      fondo.lineStyle(3, COLOR.tinta, 1).strokeCircle(px + 70, py + 64, 26);
      c.add(fondo);
      c.add(iconoObjeto(this, px + 70, py + 64, cr.objeto, 38));
    }
    const tx = x + 222;
    c.add(this.add.text(tx, y + 44, nombreDe(cr, DATOS), estiloTexto(34, COLOR.tinta, true)).setOrigin(0, 0.5));
    c.add(this.add.text(tx, y + 92, `Nv ${cr.nivel}`, estiloTexto(30, COLOR.tintaSuave, true)).setOrigin(0, 0.5));
    if (debilitada) c.add(pildora(this, tx + 110, y + 92, 'Debilitada', COLOR.rojo, 20));
    else if (cr.estado) {
      const quemada = cr.estado.tipo === 'quemado';
      c.add(pildora(this, tx + 110, y + 92, quemada ? 'Quemada' : 'Dormida', quemada ? 0xc8551e : 0x5b6f9a, 20));
    }
    const tipos = this.add.container(0, 0);
    filaTipos(this, tipos, tx, y + 144, DATOS.especies[cr.especie].tipos, 20);
    c.add(tipos);
    c.add(pildora(this, tx, y + 196, 'VIDA', COLOR.tinta, 18, COLOR.oro));
    const barra = new Barra(this, tx + 92, y + 196, ancho - (tx - x) - 120, 24, true);
    void barra.setFraccion(cr.vida / max, false);
    c.add(barra);
    c.add(this.add.text(x + ancho - 30, y + 236, `${Math.max(0, cr.vida)}/${max}`, estiloTexto(28, COLOR.tinta, true)).setOrigin(1, 0.5));
  }

  /**
   * Ficha de una criatura del equipo, en tres pestañas como en los juegos del género: datos,
   * estadísticas y movimientos. Izquierda y derecha cambian de pestaña; arriba y abajo, de
   * criatura.
   */
  private pantallaFicha(p: Partida, i: number, volver: () => void, pestana = 0, movimiento = 0): void {
    const cr = p.equipo[i];
    const e = DATOS.especies[cr.especie];
    const c = this.abrirCapa(nombreDe(cr, DATOS));
    const stats = calcularEstadisticas(cr, DATOS);
    const temp = DATOS.temperamentos.find((t) => t.id === cr.temperamento);
    const n = p.equipo.length;
    const ir = (j: number, k = pestana, m = 0) => this.pantallaFicha(p, (j + n) % n, volver, k, m);

    // Arriba: la criatura en su pedestal, con nombre, nivel, tipos, estado y objeto.
    c.add(ventana(this, 24, 130, ANCHO - 48, 300));
    const px = 180;
    const py = 278;
    const pedestal = this.add.graphics();
    pedestal.fillStyle(colorPedestal(cr.especie), 1).fillCircle(px, py, 118);
    pedestal.lineStyle(5, COLOR.tinta, 0.6).strokeCircle(px, py, 118);
    pedestal.fillStyle(0x000000, 0.15).fillEllipse(px, py + 80, 170, 34);
    c.add(pedestal);
    const figura = crearCriaturaVisual(this, cr.especie, px, py - 6, 230, true);
    if (cr.vida <= 0) figura.setAlpha(0.55);
    else this.tweens.add({ targets: figura, y: figura.y - 8, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    c.add(figura);
    const tx = 340;
    c.add(this.add.text(tx, 190, nombreDe(cr, DATOS), estiloTexto(44, COLOR.tinta, true)).setOrigin(0, 0.5));
    c.add(this.add.text(tx, 248, `Nv ${cr.nivel}`, estiloTexto(34, COLOR.tintaSuave, true)).setOrigin(0, 0.5));
    if (cr.vida <= 0) c.add(pildora(this, tx + 130, 248, 'Debilitada', COLOR.rojo, 22));
    else if (cr.estado) {
      const quemada = cr.estado.tipo === 'quemado';
      c.add(pildora(this, tx + 130, 248, quemada ? 'Quemada' : 'Dormida', quemada ? 0xc8551e : 0x5b6f9a, 22));
    }
    const tipos = this.add.container(0, 0);
    filaTipos(this, tipos, tx, 304, e.tipos, 24);
    c.add(tipos);
    if (cr.objeto) {
      c.add(iconoObjeto(this, tx + 24, 370, cr.objeto, 44));
      c.add(this.add.text(tx + 60, 370, DATOS.objetos[cr.objeto]?.nombre ?? cr.objeto, estiloTexto(30, COLOR.tinta)).setOrigin(0, 0.5));
      c.add(
        new Boton(this, ANCHO - 150, 370, {
          ancho: 200,
          alto: 72,
          texto: 'Quitar',
          tamano: 28,
          alPulsar: () => {
            const nombre = DATOS.objetos[cr.objeto!]?.nombre;
            quitarObjeto(p, cr);
            this.aviso(`${nombre} vuelve a la mochila`);
            ir(i);
          },
        }),
      );
    } else {
      c.add(this.add.text(tx, 370, 'No lleva nada', estiloTexto(30, COLOR.tintaSuave)).setOrigin(0, 0.5));
    }

    // Pestañas.
    const pestanas = ['Datos', 'Estadísticas', 'Movimientos'];
    pestanas.forEach((nombre, k) => {
      c.add(
        new Boton(this, 24 + 168 + k * 348, 498, {
          ancho: 336,
          alto: 88,
          texto: nombre,
          tamano: 32,
          color: k === pestana ? COLOR.oro : COLOR.pergaminoOscuro,
          alPulsar: () => ir(i, k),
        }),
      );
    });

    const yC = 566;
    const altoC = ALTO_MAPA - 170 - yC;
    c.add(ventana(this, 24, yC, ANCHO - 48, altoC));
    if (pestana === 0) {
      // Datos: número, temperamento, valía, experiencia y el texto del Bestiario.
      const desde = expParaNivel(cr.nivel);
      const hasta = expParaNivel(cr.nivel + 1);
      const temperamento = temp
        ? temp.sube === temp.baja
          ? `${temp.nombre}: temperamento neutro`
          : `${temp.nombre}: más ${NOMBRE_ESTADISTICA[temp.sube]}, menos ${NOMBRE_ESTADISTICA[temp.baja]}`
        : '';
      const filas: [string, string][] = [
        ['Bestiario', `Nº ${String(e.numero).padStart(3, '0')} · ${e.nombre}`],
        ['Temperamento', temperamento],
        ['Valía', `${cr.valia} de 14`],
      ];
      filas.forEach(([etiqueta, valor], k) => {
        const y = yC + 56 + k * 62;
        c.add(this.add.text(64, y, etiqueta, estiloTexto(28, COLOR.tintaSuave, true)).setOrigin(0, 0.5));
        c.add(this.add.text(300, y, valor, { ...estiloTexto(30, COLOR.tinta), wordWrap: { width: ANCHO - 360 } }).setOrigin(0, 0.5));
      });
      const yExp = yC + 56 + 3 * 62;
      c.add(this.add.text(64, yExp, 'Experiencia', estiloTexto(28, COLOR.tintaSuave, true)).setOrigin(0, 0.5));
      const barra = new Barra(this, 300, yExp, ANCHO - 380, 24, false);
      void barra.setFraccion((cr.exp - desde) / Math.max(1, hasta - desde), false);
      c.add(barra);
      c.add(
        this.add
          .text(ANCHO - 80, yExp + 42, `Le faltan ${Math.max(0, hasta - cr.exp)} para el nivel ${cr.nivel + 1}`, estiloTexto(26, COLOR.tintaSuave))
          .setOrigin(1, 0.5),
      );
      const yTexto = yExp + 92;
      const linea = this.add.graphics();
      linea.lineStyle(3, COLOR.oro, 1).lineBetween(64, yTexto, ANCHO - 64, yTexto);
      c.add(linea);
      c.add(
        this.add.text(64, yTexto + 24, e.descripcion, {
          ...estiloTexto(29, COLOR.tinta),
          fontStyle: 'italic',
          wordWrap: { width: ANCHO - 128 },
          lineSpacing: 6,
        }),
      );
    } else if (pestana === 1) {
      // Estadísticas, con barras. ▲ y ▼ marcan lo que sube y baja su temperamento.
      const orden: (keyof typeof stats)[] = ['vida', 'fuerza', 'escudo', 'magia', 'resMagica', 'celeridad'];
      const tope = Math.max(...orden.filter((k) => k !== 'vida').map((k) => stats[k]), 1);
      const alto = Math.min(84, (altoC - 60) / orden.length);
      orden.forEach((k, j) => {
        const y = yC + 40 + j * alto + alto / 2;
        const marca = temp && temp.sube !== temp.baja ? (temp.sube === (k as EstadisticaCombate) ? ' ▲' : temp.baja === (k as EstadisticaCombate) ? ' ▼' : '') : '';
        const colorMarca = marca === ' ▲' ? COLOR.rojo : marca === ' ▼' ? COLOR.exp : COLOR.tintaSuave;
        c.add(this.add.text(64, y, NOMBRE_ESTADISTICA[k], estiloTexto(30, COLOR.tintaSuave, true)).setOrigin(0, 0.5));
        if (marca) c.add(this.add.text(64 + 300, y, marca.trim(), estiloTexto(28, colorMarca, true)).setOrigin(0.5));
        const valor = k === 'vida' ? `${Math.max(0, cr.vida)}/${stats.vida}` : `${stats[k]}`;
        c.add(this.add.text(540, y, valor, estiloTexto(32, COLOR.tinta, true)).setOrigin(1, 0.5));
        if (k === 'vida') {
          const barra = new Barra(this, 580, y, ANCHO - 660, 26, true);
          void barra.setFraccion(cr.vida / stats.vida, false);
          c.add(barra);
        } else {
          const g = this.add.graphics();
          const largo = ANCHO - 660;
          g.fillStyle(COLOR.tinta, 1).fillRoundedRect(580, y - 13, largo, 26, 13);
          g.fillStyle(COLOR.oro, 1).fillRoundedRect(583, y - 10, Math.max(20, (largo - 6) * (stats[k] / tope)), 20, 10);
          c.add(g);
        }
      });
    } else {
      // Movimientos: tócalos para ver qué hacen.
      const actual = Math.min(movimiento, cr.movimientos.length - 1);
      const anchoMov = (ANCHO - 96 - 20) / 2;
      cr.movimientos.forEach((m, j) => {
        const mov = DATOS.movimientos[m.id];
        const tipo = DATOS.tipos.tipos.find((t) => t.id === mov.tipo);
        const x = 48 + (j % 2) * (anchoMov + 20);
        const y = yC + 30 + Math.floor(j / 2) * 116;
        const g = this.add.graphics();
        g.fillStyle(aclarar(tipo?.color ?? COLOR.pergaminoOscuro, j === actual ? 0.25 : 0.55), 1);
        g.fillRoundedRect(x, y, anchoMov, 104, 18);
        g.lineStyle(j === actual ? 6 : 3, j === actual ? COLOR.rojo : COLOR.tintaSuave, 1).strokeRoundedRect(x, y, anchoMov, 104, 18);
        c.add(g);
        c.add(this.add.text(x + 22, y + 32, mov.nombre, estiloTexto(32, COLOR.tinta, true)).setOrigin(0, 0.5));
        const chip = this.add.container(0, 0);
        filaTipos(this, chip, x + 22, y + 76, [mov.tipo], 20);
        c.add(chip);
        c.add(this.add.text(x + anchoMov - 22, y + 76, `PP ${m.pp}/${mov.pp}`, estiloTexto(26, COLOR.tinta, true)).setOrigin(1, 0.5));
        const zona = this.add.rectangle(x + anchoMov / 2, y + 52, anchoMov, 104, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
        zona.on('pointerup', () => ir(i, 2, j));
        c.add(zona);
      });
      const m = cr.movimientos[actual];
      if (m) {
        const d = describirMovimiento(DATOS.movimientos[m.id], m.pp);
        const y = yC + 30 + 2 * 116 + 6;
        const linea = this.add.graphics();
        linea.lineStyle(3, COLOR.oro, 1).lineBetween(64, y, ANCHO - 64, y);
        c.add(linea);
        c.add(
          this.add.text(64, y + 20, `${d.titulo}\n${d.cifras}\n${d.efecto}`, {
            ...estiloTexto(28, COLOR.tinta),
            wordWrap: { width: ANCHO - 128 },
            lineSpacing: 6,
          }),
        );
      }
    }

    // Abajo: criatura anterior, volver y siguiente.
    if (n > 1) {
      c.add(new Boton(this, 120, ALTO_MAPA - 80, { ancho: 180, alto: 110, texto: '‹', tamano: 56, alPulsar: () => ir(i - 1) }));
      c.add(new Boton(this, ANCHO - 120, ALTO_MAPA - 80, { ancho: 180, alto: 110, texto: '›', tamano: 56, alPulsar: () => ir(i + 1) }));
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

  private pantallaBestiario(p: Partida, volver: () => void, pagina = 0): void {
    const c = this.abrirCapa('Bestiario');
    c.add(this.add.text(ANCHO / 2, 135, `Vistas ${p.vistos.length} · Capturadas ${p.capturados.length}`, estiloTexto(32, COLOR.oro)).setOrigin(0.5));
    const todas = Object.values(DATOS.especies).sort((a, b) => a.numero - b.numero);
    const porPagina = 20;
    const paginas = Math.ceil(todas.length / porPagina);
    const ids = todas.slice(pagina * porPagina, (pagina + 1) * porPagina).map((e) => e.id);
    const columnas = 4;
    const ancho = 240;
    const alto = 160;
    ids.forEach((id, i) => {
      const x = 32 + (i % columnas) * (ancho + 12) + ancho / 2;
      const y = 200 + Math.floor(i / columnas) * (alto + 10) + alto / 2;
      const visto = p.vistos.includes(id);
      const capturado = p.capturados.includes(id);
      const fondo = this.add.rectangle(x, y, ancho, alto, visto ? COLOR.pergamino : COLOR.pergaminoOscuro).setRounded(16).setStrokeStyle(4, COLOR.tintaSuave);
      c.add(fondo);
      c.add(this.add.text(x - ancho / 2 + 12, y - alto / 2 + 8, String(DATOS.especies[id].numero).padStart(3, '0'), estiloTexto(22, COLOR.tintaSuave)));
      if (visto) {
        c.add(crearCriaturaVisual(this, id, x, y - 16, 90));
        c.add(this.add.text(x, y + 52, `${DATOS.especies[id].nombre}${capturado ? ' ✓' : ''}`, { ...estiloTexto(22, COLOR.tinta, true), align: 'center', wordWrap: { width: ancho - 12 } }).setOrigin(0.5));
        fondo.setInteractive({ useHandCursor: true }).on('pointerup', () => this.pantallaEspecie(p, id, () => this.pantallaBestiario(p, volver, pagina)));
      } else {
        c.add(this.add.text(x, y, '???', estiloTexto(40, COLOR.tintaSuave, true)).setOrigin(0.5));
      }
    });
    if (paginas > 1) {
      const y = ALTO_MAPA - 80;
      c.add(new Boton(this, 120, y, { ancho: 180, alto: 110, texto: '‹', tamano: 56, alPulsar: () => this.pantallaBestiario(p, volver, pagina - 1) }).setActivo(pagina > 0));
      c.add(new Boton(this, ANCHO - 120, y, { ancho: 180, alto: 110, texto: '›', tamano: 56, alPulsar: () => this.pantallaBestiario(p, volver, pagina + 1) }).setActivo(pagina < paginas - 1));
    }
    this.botonVolver(c, volver);
  }

  private pantallaEspecie(p: Partida, id: string, volver: () => void): void {
    const e = DATOS.especies[id];
    const c = this.abrirCapa(e.nombre);
    c.add(ventana(this, 60, 130, ANCHO - 120, 900));
    c.add(crearCriaturaVisual(this, id, ANCHO / 2, 380, 340));
    const tipos = this.add.container(0, 0);
    filaTipos(this, tipos, ANCHO / 2 - 90, 640, e.tipos, 30);
    c.add(tipos);
    const texto = p.capturados.includes(id) ? e.descripcion : 'Sella un pacto con esta criatura para saber más de ella.';
    c.add(this.add.text(ANCHO / 2, 760, texto, { ...estiloTexto(32, COLOR.tinta), align: 'center', wordWrap: { width: ANCHO - 200 }, lineSpacing: 8 }).setOrigin(0.5));
    const d = debilidades(DATOS.tipos, e.tipos);
    const nombre = (t: string) => DATOS.tipos.tipos.find((x) => x.id === t)?.nombre ?? t;
    const grupo = (f: (m: number) => boolean) =>
      d.filter((x) => f(x.multiplicador)).map((x) => `${nombre(x.tipo)} ${textoMultiplicador(x.multiplicador)}`).join(', ') || 'nada';
    c.add(
      this.add.text(
        90,
        880,
        [`Débil a: ${grupo((m) => m > 1)}`, `Resiste: ${grupo((m) => m > 0 && m < 1)}`, `Inmune a: ${grupo((m) => m === 0)}`].join('\n'),
        { ...estiloTexto(28, COLOR.tinta), wordWrap: { width: ANCHO - 180 }, lineSpacing: 6 },
      ),
    );
    c.add(
      new Boton(this, 790, ALTO_MAPA - 80, { ancho: 440, alto: 110, texto: 'Tabla de tipos', tamano: 34, alPulsar: () => this.pantallaTipos(() => this.pantallaEspecie(p, id, volver), e.tipos[0]) }),
    );
    this.alAtras = volver;
    c.add(new Boton(this, 290, ALTO_MAPA - 80, { ancho: 440, alto: 110, texto: 'Volver', alPulsar: volver }));
  }

  private pantallaTipos(volver: () => void, tipo?: string): void {
    const c = this.abrirCapa('Tabla de tipos');
    construirTablaTipos(this, c, 130, tipo);
    this.botonVolver(c, volver);
  }

  /**
   * Mochila por bolsillos, como en los juegos del género: uno por categoría, que se cambian con
   * las flechas. Abajo, la descripción del objeto marcado y lo que se puede hacer con él.
   */
  private pantallaMochila(p: Partida, volver: () => void, categoria?: CategoriaObjeto, sel = 0): void {
    const c = this.abrirCapa('Mochila');
    const tengo = Object.entries(p.objetos).filter(([id, n]) => n > 0 && DATOS.objetos[id]);
    if (tengo.length === 0) {
      c.add(ventana(this, 24, 136, ANCHO - 48, 140));
      c.add(this.add.text(ANCHO / 2, 206, 'La mochila está vacía.', estiloTexto(38, COLOR.tinta)).setOrigin(0.5));
      this.botonVolver(c, volver);
      return;
    }
    const bolsillos = CATEGORIAS.filter((k) => tengo.some(([id]) => DATOS.objetos[id].categoria === k.id));
    const k = Math.max(0, bolsillos.findIndex((b) => b.id === categoria));
    const bolsillo = bolsillos[k];
    const objetos = tengo.filter(([id]) => DATOS.objetos[id].categoria === bolsillo.id);
    const actual = Math.min(sel, objetos.length - 1);
    const ir = (bk: number, s = 0) => this.pantallaMochila(p, volver, bolsillos[(bk + bolsillos.length) % bolsillos.length].id, s);

    // Bolsillo actual, con flechas para cambiar y puntos que dicen cuántos hay.
    c.add(ventana(this, 170, 132, ANCHO - 340, 112));
    c.add(iconoObjeto(this, 250, 188, objetos[0][0], 64));
    c.add(this.add.text(ANCHO / 2 + 30, 188, bolsillo.nombre, estiloTexto(42, COLOR.tinta, true)).setOrigin(0.5));
    if (bolsillos.length > 1) {
      c.add(new Boton(this, 90, 188, { ancho: 130, alto: 104, texto: '‹', tamano: 56, alPulsar: () => ir(k - 1) }));
      c.add(new Boton(this, ANCHO - 90, 188, { ancho: 130, alto: 104, texto: '›', tamano: 56, alPulsar: () => ir(k + 1) }));
    }
    const puntos = this.add.graphics();
    bolsillos.forEach((_, j) => {
      const x = ANCHO / 2 - ((bolsillos.length - 1) * 30) / 2 + j * 30;
      puntos.fillStyle(j === k ? COLOR.oro : 0x5a4a3a, 1).fillCircle(x, 270, j === k ? 10 : 7);
    });
    c.add(puntos);

    // Lista de objetos del bolsillo.
    const yD = ALTO_MAPA - 360;
    const yL = 300;
    const altoFila = 100;
    const filas = Math.max(1, Math.floor((yD - 24 - yL - 40) / altoFila));
    const inicio = Math.floor(actual / filas) * filas;
    c.add(ventana(this, 24, yL, ANCHO - 48, filas * altoFila + 40));
    objetos.slice(inicio, inicio + filas).forEach(([id, cantidad], j) => {
      const indice = inicio + j;
      const y = yL + 20 + j * altoFila;
      if (indice === actual) {
        const marca = this.add.graphics();
        marca.fillStyle(aclarar(COLOR.oro, 0.5), 1).fillRoundedRect(42, y + 6, ANCHO - 84, altoFila - 12, 16);
        c.add(marca);
        c.add(cursor(this, 72, y + altoFila / 2, 34));
      }
      c.add(iconoObjeto(this, 140, y + altoFila / 2, id, 64));
      c.add(this.add.text(196, y + altoFila / 2, DATOS.objetos[id].nombre, estiloTexto(36, COLOR.tinta, true)).setOrigin(0, 0.5));
      c.add(this.add.text(ANCHO - 70, y + altoFila / 2, `×${cantidad}`, estiloTexto(34, COLOR.tinta, true)).setOrigin(1, 0.5));
      const zona = this.add.rectangle(ANCHO / 2, y + altoFila / 2, ANCHO - 84, altoFila, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      zona.on('pointerup', () => ir(k, indice));
      c.add(zona);
    });
    if (inicio > 0) c.add(this.add.text(ANCHO / 2, yL + 4, '▲', estiloTexto(28, COLOR.rojo, true)).setOrigin(0.5));
    if (inicio + filas < objetos.length) c.add(this.add.text(ANCHO / 2, yL + filas * altoFila + 36, '▼', estiloTexto(28, COLOR.rojo, true)).setOrigin(0.5));

    // Descripción y acción del objeto marcado.
    const [id] = objetos[actual];
    const obj = DATOS.objetos[id];
    const uso = usoDe(obj);
    const accion = uso.equipable ? 'Dar' : uso.fuera ? 'Usar' : null;
    c.add(ventana(this, 24, yD, ANCHO - 48, 216));
    c.add(iconoObjeto(this, 100, yD + 108, id, 88));
    const ancho = accion ? ANCHO - 460 : ANCHO - 230;
    const nota = !accion ? (obj.tipo === 'clave' ? 'Objeto importante.' : 'Se usa en los combates.') : '';
    c.add(
      this.add.text(170, yD + 108, nota ? `${obj.descripcion}\n${nota}` : obj.descripcion, {
        ...estiloTexto(27, COLOR.tinta),
        wordWrap: { width: ancho },
        lineSpacing: 4,
      }).setOrigin(0, 0.5),
    );
    const usar = () => this.accionesObjeto(p, id, () => this.pantallaMochila(p, volver, bolsillo.id, actual));
    if (accion) c.add(new Boton(this, ANCHO - 160, yD + 108, { ancho: 220, alto: 120, texto: accion, tamano: 40, color: COLOR.oro, alPulsar: usar }));
    if (p.repelente > 0) {
      c.add(this.add.text(ANCHO / 2, yD - 22, `Repelente: quedan ${p.repelente} pasos`, estiloTexto(26, COLOR.oro)).setOrigin(0.5));
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
    this.elegirCriatura(p, `¿A quién aplicas ${obj.nombre}?`, volver, (cr) => {
      const motivo = motivoNoUsable(obj, cr, DATOS);
      if (motivo) {
        this.aviso(motivo);
        return;
      }
      void this.aplicarFuera(p, cr, id).then(volver);
    });
  }

  private elegirCriatura(p: Partida, titulo: string, volver: () => void, alElegir: (c: Criatura) => void): void {
    const c = this.abrirCapa(titulo);
    const ancho = 504;
    const alto = 268;
    const marcos = p.equipo.map((cr, i) => {
      const x = 24 + (i % 2) * (ancho + 24);
      const y = 136 + Math.floor(i / 2) * (alto + 22);
      const marco = this.add.graphics();
      marco.lineStyle(10, COLOR.oro, 1).strokeRoundedRect(x - 8, y - 8, ancho + 16, alto + 16, 32);
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
    darObjeto(p, id, -1);
    if (obj.tipo === 'curar' || obj.tipo === 'remedio' || obj.tipo === 'revivir') {
      const recuperada = aplicarCuracion(obj, cr, DATOS);
      this.aviso(
        obj.tipo === 'remedio' ? `${nombre} se ha curado` : obj.tipo === 'revivir' ? `${nombre} se reanima` : `${nombre} recupera ${recuperada} de Vida`,
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
      const c = this.abrirCapa(`${nombreDe(cr, DATOS)} quiere aprender ${DATOS.movimientos[movimiento].nombre}`);
      c.add(this.add.text(ANCHO / 2, 150, '¿Qué movimiento olvida?', estiloTexto(34, COLOR.oro)).setOrigin(0.5));
      cr.movimientos.forEach((m, i) => {
        c.add(
          new Boton(this, ANCHO / 2, 280 + i * 150, {
            ancho: 800,
            alto: 130,
            texto: DATOS.movimientos[m.id].nombre,
            tamano: 38,
            alPulsar: () => resolve(i),
          }),
        );
      });
      c.add(new Boton(this, ANCHO / 2, 280 + 4 * 150 + 40, { ancho: 800, alto: 120, texto: 'No aprenderlo', tamano: 36, alPulsar: () => resolve(-1) }));
      this.alAtras = () => resolve(-1);
    });
  }

  // ---------- Tienda y almacén ----------

  /** Tienda: los precios salen de los datos de cada objeto. Cuatro productos por página. */
  tienda(productos: string[], p: Partida): Promise<void> {
    this.cerrarDialogo();
    const porPagina = 4;
    return new Promise((resolve) => {
      const pintar = (pagina: number) => {
        const c = this.abrirCapa('Tienda');
        this.alAtras = () => {
          this.cerrarCapa();
          resolve();
        };
        c.add(this.add.text(ANCHO / 2, 140, `Tienes ${p.dinero} ${MONEDA}`, estiloTexto(36, COLOR.oro, true)).setOrigin(0.5));
        productos.slice(pagina * porPagina, (pagina + 1) * porPagina).forEach((id, i) => {
          const obj = DATOS.objetos[id];
          const precio = obj.precio ?? 0;
          const y = 290 + i * 220;
          c.add(ventana(this, 40, y - 90, ANCHO - 80, 200));
          c.add(iconoObjeto(this, 105, y - 20, id, 72));
          c.add(this.add.text(160, y - 66, `${obj.nombre} · ${precio} ${MONEDA}`, estiloTexto(34, COLOR.tinta, true)));
          c.add(this.add.text(160, y - 20, obj.descripcion, { ...estiloTexto(22, COLOR.tintaSuave), wordWrap: { width: 470 } }));
          c.add(this.add.text(160, y + 62, `Tienes ${p.objetos[id] ?? 0}`, estiloTexto(26, COLOR.tintaSuave)));
          for (const [k, cantidad] of [1, 5].entries()) {
            c.add(
              new Boton(this, 760 + k * 170, y + 10, {
                ancho: 150,
                alto: 96,
                texto: `+${cantidad}`,
                tamano: 36,
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
          c.add(new Boton(this, 170, ALTO_MAPA - 80, { ancho: 260, alto: 110, texto: '‹ Antes', tamano: 34, alPulsar: () => pintar(pagina - 1) }).setActivo(pagina > 0));
          c.add(
            new Boton(this, 910, ALTO_MAPA - 80, { ancho: 260, alto: 110, texto: 'Más ›', tamano: 34, alPulsar: () => pintar(pagina + 1) }).setActivo(pagina < paginas - 1),
          );
        }
        c.add(new Boton(this, ANCHO / 2, ALTO_MAPA - 80, { ancho: 300, alto: 110, texto: 'Salir', alPulsar: () => this.alAtras?.() }));
      };
      pintar(0);
    });
  }

  /** Mover criaturas entre el equipo y las páginas del Bestiario. */
  almacen(p: Partida): Promise<void> {
    this.cerrarDialogo();
    return new Promise((resolve) => {
      const pintar = () => {
        const c = this.abrirCapa('Ordenar el equipo');
        this.alAtras = () => {
          this.cerrarCapa();
          resolve();
        };
        c.add(this.add.text(285, 140, `Equipo (${p.equipo.length}/${MAX_EQUIPO})`, estiloTexto(34, COLOR.oro, true)).setOrigin(0.5));
        c.add(this.add.text(795, 140, `En el Bestiario (${p.almacen.length})`, estiloTexto(34, COLOR.oro, true)).setOrigin(0.5));
        p.equipo.forEach((cr, i) => {
          c.add(
            new Boton(this, 285, 230 + i * 130, {
              ancho: 480,
              alto: 116,
              texto: `${nombreDe(cr, DATOS)} Nv ${cr.nivel}`,
              subtexto: 'Dejar en el Bestiario →',
              tamano: 32,
              alPulsar: () => {
                p.almacen.push(...p.equipo.splice(i, 1));
                pintar();
              },
            }).setActivo(p.equipo.length > 1),
          );
        });
        p.almacen.slice(0, 7).forEach((cr, i) => {
          c.add(
            new Boton(this, 795, 230 + i * 130, {
              ancho: 480,
              alto: 116,
              texto: `${nombreDe(cr, DATOS)} Nv ${cr.nivel}`,
              subtexto: '← Llevar al equipo',
              tamano: 32,
              alPulsar: () => {
                p.equipo.push(...p.almacen.splice(i, 1));
                pintar();
              },
            }).setActivo(p.equipo.length < MAX_EQUIPO),
          );
        });
        if (p.almacen.length > 7) {
          c.add(this.add.text(795, 1150, `y ${p.almacen.length - 7} más`, estiloTexto(28, COLOR.pergaminoOscuro)).setOrigin(0.5));
        }
        c.add(new Boton(this, ANCHO / 2, ALTO_MAPA - 80, { ancho: 400, alto: 110, texto: 'Listo', alPulsar: () => this.alAtras?.() }));
      };
      pintar();
    });
  }
}
