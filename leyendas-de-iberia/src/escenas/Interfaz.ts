import Phaser from 'phaser';
import type { Dir } from '../core/mundo';
import type { Partida } from '../core/partida';
import { darObjeto, MAX_EQUIPO } from '../core/partida';
import { calcularEstadisticas } from '../core/estadisticas';
import { nombreDe } from '../core/criatura';
import { expParaNivel } from '../core/progreso';
import type { Criatura } from '../core/modelo';
import { NOMBRE_ESTADISTICA, type EstadisticaCombate } from '../core/modelo';
import { DATOS } from '../data';
import { INICIALES } from '../data/especies';
import { Barra, Boton, filaTipos, panel } from '../ui/componentes';
import { crearCriaturaVisual } from '../ui/criaturaVisual';
import { describirMovimiento } from '../ui/textos';
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
            const tarjeta = this.add.rectangle(x, 560, ancho, 620, COLOR.pergamino).setRounded(24).setStrokeStyle(6, COLOR.tinta);
            tarjeta.setInteractive({ useHandCursor: true }).on('pointerup', () => resolve(id));
            c.add(tarjeta);
            c.add(crearCriaturaVisual(this, id, x, 400, 230, true));
            c.add(this.add.text(x, 570, e.nombre, { ...estiloTexto(38, COLOR.tinta, true), align: 'center', wordWrap: { width: ancho - 30 } }).setOrigin(0.5));
            const tipos = this.add.container(0, 0);
            filaTipos(this, tipos, x - 60, 650, e.tipos, 28);
            c.add(tipos);
            c.add(
              this.add
                .text(x, 760, e.descripcion, { ...estiloTexto(24, COLOR.tintaSuave), align: 'center', wordWrap: { width: ancho - 40 } })
                .setOrigin(0.5, 0.5),
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

  /** Menú de pausa: equipo, Bestiario, mochila y guardar. */
  menu(p: Partida): Promise<void> {
    return new Promise((resolve) => {
      const principal = () => {
        const c = this.abrirCapa(p.nombre);
        this.alAtras = () => {
          this.cerrarCapa();
          resolve();
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
          c.add(new Boton(this, ANCHO / 2, 280 + i * 170, { ancho: 700, alto: 140, texto, tamano: 46, alPulsar: accion }).setActivo(activo));
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
    ];
    c.add(this.add.text(380, 240, lineas.join('\n'), { ...estiloTexto(30, COLOR.tinta), lineSpacing: 10, wordWrap: { width: 640 } }));
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

  private pantallaBestiario(p: Partida, volver: () => void): void {
    const c = this.abrirCapa('Bestiario');
    c.add(this.add.text(ANCHO / 2, 135, `Vistas ${p.vistos.length} · Capturadas ${p.capturados.length}`, estiloTexto(32, COLOR.oro)).setOrigin(0.5));
    const ids = Object.keys(DATOS.especies);
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
      c.add(this.add.text(x - ancho / 2 + 12, y - alto / 2 + 8, String(i + 1).padStart(3, '0'), estiloTexto(22, COLOR.tintaSuave)));
      if (visto) {
        c.add(crearCriaturaVisual(this, id, x, y - 16, 90));
        c.add(this.add.text(x, y + 52, `${DATOS.especies[id].nombre}${capturado ? ' ✓' : ''}`, { ...estiloTexto(22, COLOR.tinta, true), align: 'center', wordWrap: { width: ancho - 12 } }).setOrigin(0.5));
        fondo.setInteractive({ useHandCursor: true }).on('pointerup', () => this.pantallaEspecie(p, id, () => this.pantallaBestiario(p, volver)));
      } else {
        c.add(this.add.text(x, y, '???', estiloTexto(40, COLOR.tintaSuave, true)).setOrigin(0.5));
      }
    });
    this.botonVolver(c, volver);
  }

  private pantallaEspecie(p: Partida, id: string, volver: () => void): void {
    const e = DATOS.especies[id];
    const c = this.abrirCapa(e.nombre);
    c.add(panel(this, 60, 140, ANCHO - 120, 820));
    c.add(crearCriaturaVisual(this, id, ANCHO / 2, 400, 360));
    const tipos = this.add.container(0, 0);
    filaTipos(this, tipos, ANCHO / 2 - 90, 640, e.tipos, 30);
    c.add(tipos);
    const texto = p.capturados.includes(id) ? e.descripcion : 'Sella un pacto con esta criatura para saber más de ella.';
    c.add(this.add.text(ANCHO / 2, 790, texto, { ...estiloTexto(34, COLOR.tinta), align: 'center', wordWrap: { width: ANCHO - 200 }, lineSpacing: 8 }).setOrigin(0.5));
    this.botonVolver(c, volver);
  }

  private pantallaMochila(p: Partida, volver: () => void): void {
    const c = this.abrirCapa('Mochila');
    const objetos = Object.entries(p.objetos).filter(([, n]) => n > 0);
    if (objetos.length === 0) c.add(this.add.text(ANCHO / 2, 400, 'La mochila está vacía.', estiloTexto(38, COLOR.pergaminoOscuro)).setOrigin(0.5));
    objetos.forEach(([id, n], i) => {
      const obj = DATOS.objetos[id];
      c.add(
        new Boton(this, ANCHO / 2, 220 + i * 190, {
          ancho: 980,
          alto: 170,
          texto: `${obj.nombre} ×${n}`,
          subtexto: obj.descripcion.length > 62 ? `${obj.descripcion.slice(0, 59)}…` : obj.descripcion,
          tamano: 38,
          alPulsar: () => {
            if (obj.tipo === 'curar') this.usarCuracion(p, id, () => this.pantallaMochila(p, volver));
            else this.aviso(obj.tipo === 'captura' ? 'Se usa en combate contra criaturas salvajes' : obj.descripcion.slice(0, 50));
          },
        }),
      );
    });
    this.botonVolver(c, volver);
  }

  private usarCuracion(p: Partida, objeto: string, volver: () => void): void {
    const obj = DATOS.objetos[objeto];
    if (obj.tipo !== 'curar') return;
    const c = this.abrirCapa(`¿A quién aplicas ${obj.nombre}?`);
    p.equipo.forEach((cr, i) => {
      const x = i % 2 === 0 ? 285 : 795;
      const y = 200 + Math.floor(i / 2) * 290;
      this.tarjetaCriatura(c, cr, x, y, () => {
        const max = calcularEstadisticas(cr, DATOS).vida;
        if (cr.vida <= 0 || cr.vida >= max) {
          this.aviso(cr.vida <= 0 ? 'Está debilitada: llévala al mesón' : 'Ya tiene la Vida al máximo');
          return;
        }
        const antes = cr.vida;
        cr.vida = Math.min(max, cr.vida + obj.cantidad);
        darObjeto(p, objeto, -1);
        this.aviso(`${nombreDe(cr, DATOS)} recupera ${cr.vida - antes} de Vida`);
        volver();
      });
    });
    this.botonVolver(c, volver);
  }

  // ---------- Tienda y almacén ----------

  tienda(productos: { objeto: string; precio: number }[], p: Partida): Promise<void> {
    this.cerrarDialogo();
    return new Promise((resolve) => {
      const pintar = () => {
        const c = this.abrirCapa('Tienda');
        this.alAtras = () => {
          this.cerrarCapa();
          resolve();
        };
        c.add(this.add.text(ANCHO / 2, 140, `Tienes ${p.dinero} ${MONEDA}`, estiloTexto(36, COLOR.oro, true)).setOrigin(0.5));
        productos.forEach((prod, i) => {
          const obj = DATOS.objetos[prod.objeto];
          const y = 280 + i * 230;
          c.add(panel(this, 40, y - 80, ANCHO - 80, 200));
          c.add(this.add.text(80, y - 40, `${obj.nombre} · ${prod.precio} ${MONEDA}`, estiloTexto(38, COLOR.tinta, true)));
          c.add(this.add.text(80, y + 10, `Tienes ${p.objetos[prod.objeto] ?? 0}`, estiloTexto(30, COLOR.tintaSuave)));
          for (const [k, cantidad] of [1, 5].entries()) {
            c.add(
              new Boton(this, 700 + k * 200, y + 20, {
                ancho: 180,
                alto: 100,
                texto: `+${cantidad}`,
                tamano: 38,
                alPulsar: () => {
                  const coste = prod.precio * cantidad;
                  if (p.dinero < coste) {
                    this.aviso('No te llega el dinero');
                    return;
                  }
                  p.dinero -= coste;
                  darObjeto(p, prod.objeto, cantidad);
                  this.aviso(`Compras ${obj.nombre} ×${cantidad}`);
                  pintar();
                },
              }).setActivo(p.dinero >= prod.precio * cantidad),
            );
          }
        });
        c.add(new Boton(this, ANCHO / 2, ALTO_MAPA - 80, { ancho: 400, alto: 110, texto: 'Salir', alPulsar: () => this.alAtras?.() }));
      };
      pintar();
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
