import Phaser from 'phaser';
import { COLOR, estiloTexto, oscurecer, textoSobre } from './tema';
import { DATOS } from '../data';

export interface OpcionesBoton {
  ancho: number;
  alto: number;
  texto: string;
  subtexto?: string;
  color?: number;
  tamano?: number;
  alPulsar: () => void;
  /** Mantener pulsado medio segundo: para mostrar ayuda. Funciona aunque el botón esté apagado. */
  alMantener?: () => void;
  /** Al soltar después de mantener. */
  alSoltar?: () => void;
}

const MS_MANTENER = 450;
/** Algunos navegadores mandan el mismo toque dos veces (táctil y ratón): se ignora el segundo. */
const MS_REBOTE = 350;

/** Botón táctil: se activa al soltar el dedo encima, como los botones del sistema. */
export class Boton extends Phaser.GameObjects.Container {
  private fondo: Phaser.GameObjects.Rectangle;
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
    const color = op.color ?? COLOR.pergaminoOscuro;
    const tinta = textoSobre(color);
    this.alPulsar = op.alPulsar;
    this.alMantener = op.alMantener;
    this.alSoltar = op.alSoltar;
    this.fondo = scene.add
      .rectangle(0, 0, op.ancho, op.alto, color)
      .setRounded(22)
      .setStrokeStyle(5, oscurecer(color, 0.45));
    const tam = op.tamano ?? 44;
    this.etiqueta = scene.add
      .text(0, op.subtexto ? -tam * 0.35 : 0, op.texto, { ...estiloTexto(tam, tinta, true), align: 'center' })
      .setOrigin(0.5);
    this.add([this.fondo, this.etiqueta]);
    if (op.subtexto !== undefined) {
      this.sub = scene.add.text(0, tam * 0.55, op.subtexto, estiloTexto(Math.round(tam * 0.68), tinta)).setOrigin(0.5);
      this.add(this.sub);
    }
    this.setSize(op.ancho, op.alto);
    this.fondo.setInteractive({ useHandCursor: true });
    this.fondo.on('pointerdown', () => {
      if (!this.activo && !this.alMantener) return;
      this.pulsado = true;
      this.mantenido = false;
      this.setScale(0.97);
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
      this.setScale(1);
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

  setActivo(activo: boolean): this {
    this.activo = activo;
    this.setAlpha(activo ? 1 : 0.4);
    return this;
  }

  setTexto(texto: string, subtexto?: string): this {
    this.etiqueta.setText(texto);
    if (this.sub && subtexto !== undefined) this.sub.setText(subtexto);
    return this;
  }
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

  /** Devuelve una promesa que se cumple al terminar la animación. */
  setFraccion(fraccion: number, animar: boolean, duracion = 450): Promise<void> {
    const f = Math.max(0, Math.min(1, fraccion));
    const destino = Math.max(0.001, (this.anchoTotal - 6) * f);
    this.relleno.setFillStyle(this.colorPara(f));
    this.relleno.setVisible(f > 0);
    if (!animar) {
      this.relleno.width = destino;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.relleno,
        width: destino,
        duration: duracion,
        ease: 'Sine.easeOut',
        onComplete: () => resolve(),
      });
    });
  }
}

/** Panel de pergamino con borde. */
export function panel(scene: Phaser.Scene, x: number, y: number, ancho: number, alto: number, color: number = COLOR.pergamino): Phaser.GameObjects.Rectangle {
  return scene.add
    .rectangle(x, y, ancho, alto, color)
    .setOrigin(0, 0)
    .setRounded(24)
    .setStrokeStyle(6, COLOR.tinta);
}
