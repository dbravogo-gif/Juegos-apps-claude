import Phaser from 'phaser';
import { COLOR, estiloTexto, oscurecer, textoSobre } from './tema';
import { DATOS } from '../data';
import { iconoObjeto, iconoUI, type IconoUI } from './objetoVisual';
import type { Sexo } from '../core/modelo';

export interface OpcionesBoton {
  ancho: number;
  alto: number;
  texto: string;
  subtexto?: string;
  color?: number;
  tamano?: number;
  /** Icono: de menú (`ui`) o de un objeto (`objeto`). Si el botón es casi cuadrado va encima
   * del texto; si no, a la izquierda. */
  icono?: { ui?: IconoUI; objeto?: string; tam?: number };
  alPulsar: () => void;
  /** Mantener pulsado medio segundo: para mostrar ayuda. Funciona aunque el botón esté apagado. */
  alMantener?: () => void;
  /** Al soltar después de mantener. */
  alSoltar?: () => void;
}

const MS_MANTENER = 450;
/** Algunos navegadores mandan el mismo toque dos veces (táctil y ratón): se ignora el segundo. */
const MS_REBOTE = 350;

/** Alto del canto inferior que da relieve a los botones. */
const CANTO = 7;

/**
 * Botón táctil con relieve, como los de los juegos actuales: se hunde al pulsarlo y se activa al
 * soltar el dedo encima.
 */
export class Boton extends Phaser.GameObjects.Container {
  private fondo: Phaser.GameObjects.Rectangle;
  private cara: Phaser.GameObjects.Container;
  private etiqueta: Phaser.GameObjects.Text;
  private sub?: Phaser.GameObjects.Text;
  private activo = true;
  private pulsado = false;
  private mantenido = false;
  private temporizador?: Phaser.Time.TimerEvent;
  private ultimaPulsacion = -Infinity;
  private alPulsar: () => void;
  private alMantener?: () => void;
  private alSoltar?: () => void;

  constructor(scene: Phaser.Scene, x: number, y: number, op: OpcionesBoton) {
    super(scene, x, y);
    const color = op.color ?? COLOR.panel;
    const tinta = textoSobre(color);
    this.alPulsar = op.alPulsar;
    this.alMantener = op.alMantener;
    this.alSoltar = op.alSoltar;
    const radio = Math.min(op.alto / 2, 30);
    // El canto, más oscuro, asoma por debajo; la cara se hunde sobre él al pulsar.
    const canto = scene.add.rectangle(0, CANTO / 2, op.ancho, op.alto, oscurecer(color, color === COLOR.panel ? 0.16 : 0.28)).setRounded(radio);
    this.fondo = scene.add.rectangle(0, -CANTO / 2, op.ancho, op.alto - CANTO, color).setRounded(radio);
    if (color === COLOR.panel) this.fondo.setStrokeStyle(3, COLOR.borde);
    this.cara = scene.add.container(0, -CANTO / 2);
    const tam = op.tamano ?? 44;
    const cuadrado = op.alto >= op.ancho * 0.8;
    let tx = 0;
    let ty = 0;
    if (op.icono && (op.icono.ui || op.icono.objeto)) {
      const lado = op.icono.tam ?? Math.round(Math.min(op.alto, op.ancho) * (cuadrado ? 0.5 : 0.62));
      const ix = cuadrado ? 0 : -op.ancho / 2 + lado / 2 + 18;
      const iy = cuadrado ? -op.alto * 0.14 : 0;
      const icono = op.icono.ui ? iconoUI(scene, op.icono.ui, ix, iy, lado) : iconoObjeto(scene, ix, iy, op.icono.objeto!, lado);
      this.cara.add(icono);
      if (cuadrado) ty = op.alto * 0.3;
      else tx = lado / 2 + 10;
    }
    this.etiqueta = scene.add
      .text(tx, ty + (op.subtexto ? -tam * 0.35 : 0), op.texto, { ...estiloTexto(tam, tinta, true), align: 'center' })
      .setOrigin(0.5);
    this.cara.add(this.etiqueta);
    if (op.subtexto !== undefined) {
      this.sub = scene.add.text(tx, ty + tam * 0.55, op.subtexto, estiloTexto(Math.round(tam * 0.68), tinta)).setOrigin(0.5);
      this.cara.add(this.sub);
    }
    this.add([canto, this.fondo, this.cara]);
    this.setSize(op.ancho, op.alto);
    this.fondo.setInteractive({ useHandCursor: true });
    this.fondo.on('pointerdown', () => {
      if (!this.activo && !this.alMantener) return;
      this.pulsado = true;
      this.mantenido = false;
      this.hundir(true);
      if (this.alMantener) {
        this.temporizador = scene.time.delayedCall(MS_MANTENER, () => {
          if (!this.pulsado) return;
          this.mantenido = true;
          this.alMantener?.();
        });
      }
    });
    const soltar = (pulsar: boolean) => {
      const pulsado = this.pulsado;
      this.pulsado = false;
      this.temporizador?.remove(false);
      this.hundir(false);
      if (this.mantenido) {
        this.mantenido = false;
        this.alSoltar?.();
        return;
      }
      if (!pulsar || !pulsado || !this.activo) return;
      const ahora = this.scene.time.now;
      if (ahora - this.ultimaPulsacion < MS_REBOTE) return;
      this.ultimaPulsacion = ahora;
      this.alPulsar();
    };
    this.fondo.on('pointerout', () => soltar(false));
    this.fondo.on('pointerup', () => soltar(true));
    scene.add.existing(this);
  }

  private hundir(abajo: boolean): void {
    const dy = abajo ? CANTO / 2 : -CANTO / 2;
    this.fondo.y = dy;
    this.cara.y = dy;
  }

  /** Añade dibujos a la cara del botón, para que se hundan con él. */
  agregar(...objetos: Phaser.GameObjects.GameObject[]): this {
    this.cara.add(objetos);
    return this;
  }

  setActivo(activo: boolean): this {
    this.activo = activo;
    this.setAlpha(activo ? 1 : 0.45);
    return this;
  }

  get estaActivo(): boolean {
    return this.activo;
  }

  get texto(): string {
    return this.etiqueta.text;
  }

  /** Lo mismo que tocarlo: para el teclado. */
  pulsar(): void {
    if (this.activo) this.alPulsar();
  }

  setTexto(texto: string, subtexto?: string): this {
    this.etiqueta.setText(texto);
    if (this.sub && subtexto !== undefined) this.sub.setText(subtexto);
    return this;
  }
}

/** Botón con una flecha dibujada (‹ o ›), para pasar páginas o criaturas. */
export function botonFlecha(scene: Phaser.Scene, x: number, y: number, dir: -1 | 1, alPulsar: () => void, ancho = 170, alto = 112): Boton {
  const b = new Boton(scene, x, y, { ancho, alto, texto: '', alPulsar });
  const g = scene.add.graphics();
  const s = 22;
  g.lineStyle(12, COLOR.tinta, 1);
  g.beginPath();
  g.moveTo(-dir * s * 0.5, -s);
  g.lineTo(dir * s * 0.5, 0);
  g.lineTo(-dir * s * 0.5, s);
  g.strokePath();
  return b.agregar(g);
}

/** Etiqueta de tipo con su color. */
export function chipTipo(scene: Phaser.Scene, x: number, y: number, tipo: string, tam = 30): Phaser.GameObjects.Container {
  const def = DATOS.tipos.tipos.find((t) => t.id === tipo);
  const color = def?.color ?? COLOR.tintaSuave;
  const texto = scene.add.text(0, 0, def?.nombre ?? tipo, estiloTexto(tam, textoSobre(color), true)).setOrigin(0.5);
  const ancho = texto.width + tam;
  const fondo = scene.add.rectangle(0, 0, ancho, tam * 1.5, color).setRounded(tam * 0.5);
  const c = scene.add.container(x + ancho / 2, y, [fondo, texto]);
  c.setSize(ancho, tam * 1.5);
  return c;
}

/** Fila de chips de tipo empezando en x (borde izquierdo). Devuelve el ancho ocupado. */
export function filaTipos(scene: Phaser.Scene, contenedor: Phaser.GameObjects.Container, x: number, y: number, tipos: readonly string[], tam = 28): number {
  let cx = x;
  for (const t of tipos) {
    const chip = chipTipo(scene, cx, y, t, tam);
    contenedor.add(chip);
    cx += chip.width + 10;
  }
  return cx - x;
}

/** Barra de Vida o de experiencia, anclada a la izquierda. */
export class Barra extends Phaser.GameObjects.Container {
  private relleno: Phaser.GameObjects.Rectangle;
  private anchoTotal: number;
  private esVida: boolean;
  private animacion?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, ancho: number, alto: number, esVida = true) {
    super(scene, x, y);
    this.anchoTotal = ancho;
    this.esVida = esVida;
    const fondo = scene.add.rectangle(0, 0, ancho, alto, COLOR.tinta).setOrigin(0, 0.5).setRounded(alto / 2);
    this.relleno = scene.add
      .rectangle(3, 0, ancho - 6, alto - 6, esVida ? COLOR.vidaAlta : COLOR.exp)
      .setOrigin(0, 0.5)
      .setRounded((alto - 6) / 2);
    this.add([fondo, this.relleno]);
    scene.add.existing(this);
  }

  private colorPara(fraccion: number): number {
    if (!this.esVida) return COLOR.exp;
    if (fraccion > 0.5) return COLOR.vidaAlta;
    if (fraccion > 0.2) return COLOR.vidaMedia;
    return COLOR.vidaBaja;
  }

  /** Pone el relleno a `ancho` píxeles, con el color que toca. */
  private rellenar(ancho: number): void {
    const alto = this.relleno.height;
    const lleno = this.anchoTotal - 6;
    // Cambiar `width` a mano no redibuja el rectángulo: hay que pasar por `setSize`.
    this.relleno.setSize(Math.max(0.001, ancho), alto);
    this.relleno.setRounded(Math.min(alto / 2, ancho / 2));
    this.relleno.setFillStyle(this.colorPara(ancho / lleno));
    this.relleno.setVisible(ancho > 0.5);
  }

  /**
   * Lleva la barra a `fraccion` (de 0 a 1). Animada, baja o sube poco a poco y cambia de color al
   * cruzar la mitad y la quinta parte. Devuelve una promesa que se cumple al terminar.
   */
  setFraccion(fraccion: number, animar: boolean, duracion?: number): Promise<void> {
    const f = Math.max(0, Math.min(1, fraccion));
    const destino = (this.anchoTotal - 6) * f;
    const desde = this.relleno.visible ? this.relleno.width : 0;
    this.animacion?.stop();
    this.animacion = undefined;
    if (!animar || Math.abs(destino - desde) < 0.5) {
      this.rellenar(destino);
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.animacion = this.scene.tweens.addCounter({
        from: desde,
        to: destino,
        // Como en el género: cuanto más daño, más tarda en bajar.
        duration: duracion ?? 300 + (Math.abs(destino - desde) / (this.anchoTotal - 6)) * 900,
        ease: 'Linear',
        onUpdate: (tween) => this.rellenar(tween.getValue() ?? destino),
        onComplete: () => {
          this.rellenar(destino);
          resolve();
        },
      });
    });
  }
}

/** Panel blanco redondeado con un borde fino. */
export function panel(scene: Phaser.Scene, x: number, y: number, ancho: number, alto: number, color: number = COLOR.panel): Phaser.GameObjects.Rectangle {
  return scene.add
    .rectangle(x, y, ancho, alto, color)
    .setOrigin(0, 0)
    .setRounded(28)
    .setStrokeStyle(4, COLOR.borde);
}

/** Color con que se pinta cada símbolo de sexo: azul ♂, rojo ♀ y morado ⚥. */
const COLOR_SEXO: Record<Exclude<Sexo, 'ninguno'>, number> = { macho: COLOR.azul, hembra: COLOR.rojo, hermafrodita: COLOR.morado };

/** Nombre del sexo para los textos. */
export const NOMBRE_SEXO: Record<Sexo, string> = { macho: 'Macho', hembra: 'Hembra', hermafrodita: 'Hermafrodita', ninguno: 'Sin sexo' };

/**
 * ♂, ♀ o ⚥ dibujados con líneas, centrados en (x, y), de `tam` de alto: la fuente del juego no
 * trae esos caracteres y el móvil los pintaría como emojis. Sin sexo no se dibuja nada.
 */
export function simboloSexo(scene: Phaser.Scene, x: number, y: number, sexo: Sexo, tam = 40): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics({ x, y });
  if (sexo === 'ninguno') return g;
  g.lineStyle(Math.max(3, tam * 0.12), COLOR_SEXO[sexo], 1);
  const t = tam;
  const flecha = (cx: number, cy: number, r: number, largo: number) => {
    const d = Math.SQRT1_2;
    const punta = { x: cx + largo * d, y: cy - largo * d };
    g.lineBetween(cx + r * d, cy - r * d, punta.x, punta.y);
    g.lineBetween(punta.x, punta.y, punta.x - t * 0.22, punta.y);
    g.lineBetween(punta.x, punta.y, punta.x, punta.y + t * 0.22);
  };
  const cruz = (cx: number, cy: number, r: number, largo: number) => {
    g.lineBetween(cx, cy + r, cx, cy + largo);
    g.lineBetween(cx - t * 0.16, cy + (r + largo) / 2, cx + t * 0.16, cy + (r + largo) / 2);
  };
  if (sexo === 'macho') {
    g.strokeCircle(-t * 0.1, t * 0.12, t * 0.26);
    flecha(-t * 0.1, t * 0.12, t * 0.26, t * 0.62);
  } else if (sexo === 'hembra') {
    g.strokeCircle(0, -t * 0.16, t * 0.26);
    cruz(0, -t * 0.16, t * 0.26, t * 0.62);
  } else {
    g.strokeCircle(-t * 0.06, -t * 0.04, t * 0.22);
    flecha(-t * 0.06, -t * 0.04, t * 0.22, t * 0.54);
    cruz(-t * 0.06, -t * 0.04, t * 0.22, t * 0.56);
  }
  return g;
}
