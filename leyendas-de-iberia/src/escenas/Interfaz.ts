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
import { Barra, Boton, filaTipos, panel } from '../ui/componentes';
import { crearCriaturaVisual } from '../ui/criaturaVisual';
import { conArticulo, describirMovimiento } from '../ui/textos';
import { iconoObjeto } from '../ui/objetoVisual';
import { construirTablaTipos, textoMultiplicador } from '../ui/tablaTipos';
import { debilidades } from '../core/tipos';
import { guardarPartida } from '../ui/sesion';
import { aclarar, ALTO, ANCHO, COLOR, estiloTexto } from '../ui/tema';

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
    const fondo = panel(this, 24, ALTO_MAPA - 270, ANCHO - 48, 250);
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
      c.add(panel(this, ANCHO - ancho - 44, y0 - 16, ancho + 20, opciones.length * (alto + 12) + 20));
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

  private abrirCapa(titulo: string): Phaser.GameObjects.Container {
    this.capaMenu?.destroy();
    const c = this.add.container(0, 0).setDepth(25);
    c.add(this.add.rectangle(0, 0, ANCHO, ALTO_MAPA, COLOR.fondo, 0.96).setOrigin(0, 0).setInteractive());
    c.add(this.add.text(ANCHO / 2, 70, titulo, estiloTexto(52, COLOR.pergamino, true)).setOrigin(0.5));
    this.capaMenu = c;
    return c;
  }

  private cerrarCapa(): void {
    this.capaMenu?.destroy();
    this.capaMenu = undefined;
    this.alAtras = null;
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
      const principal = () => {
        const c = this.abrirCapa(p.nombre);
        this.alAtras = () => {
          this.cerrarCapa();
          resolve(undefined);
        };
        c.add(
          this.add
            .text(ANCHO / 2, 140, `${p.dinero} ${MONEDA} · Blasones: ${p.blasones.length} · Bestiario: ${p.capturados.length}`, estiloTexto(32, COLOR.oro))
            .setOrigin(0.5),
        );
        const opciones: [string, () => void, boolean][] = [
          ['Equipo', () => this.pantallaEquipo(p, principal), p.equipo.length > 0],
          ['Bestiario', () => this.pantallaBestiario(p, principal), true],
          ['Mochila', () => this.pantallaMochila(p, principal), true],
          ['Tipos', () => this.pantallaTipos(principal), true],
          [
            'Guardar',
            () => {
              this.aviso(guardarPartida(p) ? 'Partida guardada' : 'No se ha podido guardar');
            },
            true,
          ],
          ['Volver al juego', () => this.alAtras?.(), true],
        ];
        opciones.forEach(([texto, accion, activo], i) => {
          const x = i % 2 === 0 ? 285 : 795;
          const y = 290 + Math.floor(i / 2) * 180;
          c.add(new Boton(this, x, y, { ancho: 480, alto: 150, texto, tamano: 44, alPulsar: accion }).setActivo(activo));
        });
      };
      principal();
    });
  }

  private botonVolver(c: Phaser.GameObjects.Container, volver: () => void): void {
    this.alAtras = volver;
    c.add(new Boton(this, ANCHO / 2, ALTO_MAPA - 80, { ancho: 400, alto: 110, texto: 'Volver', alPulsar: volver }));
  }

  private pantallaEquipo(p: Partida, volver: () => void): void {
    const c = this.abrirCapa('Equipo');
    p.equipo.forEach((cr, i) => {
      const x = i % 2 === 0 ? 285 : 795;
      const y = 230 + Math.floor(i / 2) * 290;
      this.tarjetaCriatura(c, cr, x, y, () => this.pantallaFicha(p, i, () => this.pantallaEquipo(p, volver)));
    });
    this.botonVolver(c, volver);
  }

  private tarjetaCriatura(c: Phaser.GameObjects.Container, cr: Criatura, x: number, y: number, alPulsar: () => void): void {
    const max = calcularEstadisticas(cr, DATOS).vida;
    const fondo = this.add.rectangle(x, y + 100, 490, 260, cr.vida > 0 ? COLOR.pergamino : COLOR.pergaminoOscuro).setRounded(20).setStrokeStyle(5, COLOR.tinta);
    fondo.setInteractive({ useHandCursor: true }).on('pointerup', alPulsar);
    c.add(fondo);
    c.add(crearCriaturaVisual(this, cr.especie, x - 160, y + 85, 140, true));
    c.add(this.add.text(x - 70, y + 20, nombreDe(cr, DATOS), { ...estiloTexto(32, COLOR.tinta, true), wordWrap: { width: 300 } }));
    c.add(this.add.text(x - 70, y + 100, `Nv ${cr.nivel}${cr.estado ? ` · ${cr.estado.tipo}` : ''}`, estiloTexto(28, COLOR.tintaSuave)));
    const barra = new Barra(this, x - 70, y + 165, 300, 24, true);
    void barra.setFraccion(cr.vida / max, false);
    c.add(barra);
    c.add(this.add.text(x + 230, y + 200, `${cr.vida}/${max}`, estiloTexto(26, COLOR.tinta, true)).setOrigin(1, 0.5));
  }

  private pantallaFicha(p: Partida, i: number, volver: () => void): void {
    const cr = p.equipo[i];
    const e = DATOS.especies[cr.especie];
    const c = this.abrirCapa(nombreDe(cr, DATOS));
    const stats = calcularEstadisticas(cr, DATOS);
    const temp = DATOS.temperamentos.find((t) => t.id === cr.temperamento);
    c.add(panel(this, 30, 130, ANCHO - 60, 960));
    c.add(crearCriaturaVisual(this, cr.especie, 200, 300, 260, true));
    const tipos = this.add.container(0, 0);
    filaTipos(this, tipos, 380, 190, e.tipos, 28);
    c.add(tipos);
    const desde = expParaNivel(cr.nivel);
    const hasta = expParaNivel(cr.nivel + 1);
    const lineas = [
      `Nivel ${cr.nivel} · Exp ${cr.exp - desde}/${hasta - desde}`,
      `Valía ${cr.valia}/14`,
      temp
        ? temp.sube === temp.baja
          ? `${temp.nombre}: temperamento neutro`
          : `${temp.nombre}: +${NOMBRE_ESTADISTICA[temp.sube]}, −${NOMBRE_ESTADISTICA[temp.baja]}`
        : '',
      `Lleva: ${cr.objeto ? (DATOS.objetos[cr.objeto]?.nombre ?? cr.objeto) : 'nada'}`,
    ];
    c.add(this.add.text(380, 240, lineas.join('\n'), { ...estiloTexto(30, COLOR.tinta), lineSpacing: 10, wordWrap: { width: 640 } }));
    if (cr.objeto) {
      c.add(
        new Boton(this, 930, 425, {
          ancho: 200,
          alto: 64,
          texto: 'Quitar',
          tamano: 28,
          alPulsar: () => {
            const nombre = DATOS.objetos[cr.objeto!]?.nombre;
            quitarObjeto(p, cr);
            this.aviso(`${nombre} vuelve a la mochila`);
            this.pantallaFicha(p, i, volver);
          },
        }),
      );
    }
    const orden: (keyof typeof stats)[] = ['vida', 'fuerza', 'escudo', 'magia', 'resMagica', 'celeridad'];
    orden.forEach((k, j) => {
      const x = j % 2 === 0 ? 70 : 560;
      const y = 470 + Math.floor(j / 2) * 60;
      const valor = k === 'vida' ? `${cr.vida}/${stats.vida}` : `${stats[k]}`;
      const marca = temp && temp.sube !== temp.baja ? (temp.sube === (k as EstadisticaCombate) ? ' ▲' : temp.baja === (k as EstadisticaCombate) ? ' ▼' : '') : '';
      c.add(this.add.text(x, y, `${NOMBRE_ESTADISTICA[k]}${marca}`, estiloTexto(30, COLOR.tintaSuave)));
      c.add(this.add.text(x + 440, y, valor, estiloTexto(32, COLOR.tinta, true)).setOrigin(1, 0));
    });
    const ayuda = this.add
      .text(70, 920, 'Toca un movimiento para ver qué hace.', { ...estiloTexto(28, COLOR.tinta), wordWrap: { width: ANCHO - 140 }, lineSpacing: 6 })
      .setDepth(1);
    c.add(ayuda);
    cr.movimientos.forEach((m, j) => {
      const mov = DATOS.movimientos[m.id];
      const tipo = DATOS.tipos.tipos.find((t) => t.id === mov.tipo);
      c.add(
        new Boton(this, j % 2 === 0 ? 290 : 790, 700 + Math.floor(j / 2) * 110, {
          ancho: 470,
          alto: 96,
          texto: mov.nombre,
          subtexto: `${tipo?.nombre ?? ''} · PP ${m.pp}/${mov.pp}`,
          tamano: 32,
          color: aclarar(tipo?.color ?? COLOR.pergaminoOscuro, 0.35),
          alPulsar: () => {
            const d = describirMovimiento(mov, m.pp);
            ayuda.setText(`${d.titulo}\n${d.cifras}\n${d.efecto}`);
          },
        }),
      );
    });
    if (i > 0) {
      c.add(
        new Boton(this, 290, ALTO_MAPA - 80, {
          ancho: 440,
          alto: 110,
          texto: 'Poner primera',
          tamano: 36,
          alPulsar: () => {
            const [x] = p.equipo.splice(i, 1);
            p.equipo.unshift(x);
            this.pantallaFicha(p, 0, volver);
          },
        }),
      );
      this.alAtras = volver;
      c.add(new Boton(this, 790, ALTO_MAPA - 80, { ancho: 440, alto: 110, texto: 'Volver', alPulsar: volver }));
    } else {
      this.botonVolver(c, volver);
    }
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
    c.add(panel(this, 60, 130, ANCHO - 120, 900));
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

  private pantallaMochila(p: Partida, volver: () => void, categoria?: CategoriaObjeto): void {
    const c = this.abrirCapa('Mochila');
    const tengo = Object.entries(p.objetos).filter(([id, n]) => n > 0 && DATOS.objetos[id]);
    if (tengo.length === 0) {
      c.add(this.add.text(ANCHO / 2, 400, 'La mochila está vacía.', estiloTexto(38, COLOR.pergaminoOscuro)).setOrigin(0.5));
      this.botonVolver(c, volver);
      return;
    }
    const categorias = CATEGORIAS.filter((k) => tengo.some(([id]) => DATOS.objetos[id].categoria === k.id));
    const actual = categorias.find((k) => k.id === categoria) ?? categorias[0];
    categorias.forEach((k, i) => {
      const x = 150 + (i % 4) * 260;
      const y = 150 + Math.floor(i / 4) * 84;
      c.add(
        new Boton(this, x, y, {
          ancho: 248,
          alto: 72,
          texto: k.nombre,
          tamano: 26,
          color: k.id === actual.id ? COLOR.oro : COLOR.pergaminoOscuro,
          alPulsar: () => this.pantallaMochila(p, volver, k.id),
        }),
      );
    });
    const y0 = 150 + Math.ceil(categorias.length / 4) * 84;
    tengo
      .filter(([id]) => DATOS.objetos[id].categoria === actual.id)
      .forEach(([id, n], i) => {
        const obj = DATOS.objetos[id];
        const y = y0 + i * 148;
        const fondo = this.add.rectangle(ANCHO / 2, y + 66, ANCHO - 60, 136, COLOR.pergamino).setRounded(18).setStrokeStyle(4, COLOR.tintaSuave);
        fondo.setInteractive({ useHandCursor: true }).on('pointerup', () => this.accionesObjeto(p, id, () => this.pantallaMochila(p, volver, actual.id)));
        c.add(fondo);
        c.add(iconoObjeto(this, 100, y + 66, id, 80));
        c.add(this.add.text(165, y + 14, `${obj.nombre} ×${n}`, estiloTexto(34, COLOR.tinta, true)));
        c.add(this.add.text(165, y + 58, obj.descripcion, { ...estiloTexto(23, COLOR.tintaSuave), wordWrap: { width: ANCHO - 240 } }));
      });
    if (p.repelente > 0) {
      c.add(this.add.text(ANCHO / 2, ALTO_MAPA - 165, `Repelente: quedan ${p.repelente} pasos`, estiloTexto(28, COLOR.oro)).setOrigin(0.5));
    }
    this.botonVolver(c, volver);
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
    p.equipo.forEach((cr, i) => {
      const x = i % 2 === 0 ? 285 : 795;
      const y = 200 + Math.floor(i / 2) * 290;
      this.tarjetaCriatura(c, cr, x, y, () => alElegir(cr));
    });
    this.botonVolver(c, volver);
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
          c.add(panel(this, 40, y - 90, ANCHO - 80, 200));
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
