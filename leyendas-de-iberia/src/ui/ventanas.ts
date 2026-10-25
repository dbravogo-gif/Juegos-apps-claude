import Phaser from 'phaser';
import { DATOS } from '../data';
import { iconoUI, type IconoUI } from './objetoVisual';
import { aclarar, ANCHO, COLOR, estiloTexto, oscurecer } from './tema';

// Piezas de los menús, con el aspecto de los juegos actuales del género: paneles blancos
// redondeados con sombra suave, fondo con rayas que se mueven, pestaña de título con icono,
// píldoras y franjas de selección.

export interface OpcionesVentana {
  /** Color del interior (blanco si no se dice). */
  color?: number;
  /** Borde fino; `null`, sin borde. */
  borde?: number | null;
  sombra?: boolean;
  /** Opacidad del interior, para paneles translúcidos. */
  opacidad?: number;
  radio?: number;
}

/** Panel redondeado con sombra suave. */
export function ventana(scene: Phaser.Scene, x: number, y: number, ancho: number, alto: number, op: OpcionesVentana = {}): Phaser.GameObjects.Graphics {
  const color = op.color ?? COLOR.panel;
  const r = Math.min(op.radio ?? 30, alto / 2, ancho / 2);
  const g = scene.add.graphics();
  if (op.sombra !== false) {
    g.fillStyle(0x000000, 0.22);
    g.fillRoundedRect(x, y + 8, ancho, alto, r);
  }
  g.fillStyle(color, op.opacidad ?? 1);
  g.fillRoundedRect(x, y, ancho, alto, r);
  const borde = op.borde === undefined ? (color === COLOR.panel ? COLOR.borde : null) : op.borde;
  if (borde !== null) {
    g.lineStyle(3, borde, 1);
    g.strokeRoundedRect(x, y, ancho, alto, r);
  }
  return g;
}

/**
 * Fondo de las pantallas de menú: degradado con rayas claras en diagonal que avanzan despacio,
 * como en los menús de los juegos actuales.
 */
export function fondoMenu(scene: Phaser.Scene, contenedor: Phaser.GameObjects.Container, alto: number, color: number = COLOR.azul): void {
  const g = scene.add.graphics();
  g.fillGradientStyle(aclarar(color, 0.1), oscurecer(color, 0.25), oscurecer(color, 0.55), oscurecer(color, 0.7), 1);
  g.fillRect(0, 0, ANCHO, alto);
  contenedor.add(g);
  const paso = 120;
  const rayas = scene.add.graphics();
  rayas.fillStyle(0xffffff, 0.06);
  for (let x = -alto - paso; x < ANCHO + paso; x += paso) {
    rayas.fillPoints(
      [
        new Phaser.Math.Vector2(x, alto),
        new Phaser.Math.Vector2(x + 54, alto),
        new Phaser.Math.Vector2(x + 54 + alto, 0),
        new Phaser.Math.Vector2(x + alto, 0),
      ],
      true,
    );
  }
  // Las rayas se repiten cada `paso`: moverlas un paso en bucle no deja salto.
  scene.tweens.add({ targets: rayas, x: paso, duration: 6000, repeat: -1 });
  contenedor.add(rayas);
}

/** Pestaña de título arriba a la izquierda, con icono y color de acento. */
export function cabecera(scene: Phaser.Scene, contenedor: Phaser.GameObjects.Container, titulo: string, icono?: IconoUI, color: number = COLOR.rojo): void {
  const texto = scene.add.text(0, 0, titulo, estiloTexto(46, COLOR.panel, true)).setOrigin(0, 0.5);
  const conIcono = icono ? 84 : 0;
  const ancho = Math.min(ANCHO - 40, texto.width + conIcono + 80);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.25).fillRoundedRect(-40, 30, ancho + 40, 88, { tl: 0, bl: 0, tr: 44, br: 44 });
  g.fillStyle(color, 1).fillRoundedRect(-40, 22, ancho + 40, 88, { tl: 0, bl: 0, tr: 44, br: 44 });
  g.fillStyle(0xffffff, 0.16).fillRoundedRect(-40, 22, ancho + 40, 38, { tl: 0, bl: 0, tr: 38, br: 0 });
  contenedor.add(g);
  if (icono) contenedor.add(iconoUI(scene, icono, 64, 66, 72));
  texto.setPosition(30 + conIcono, 66);
  texto.setShadow(0, 3, '#00000055', 0, false, true);
  contenedor.add(texto);
  // Si el texto no cabe, se reduce.
  const sitio = ANCHO - 120 - conIcono;
  if (texto.width > sitio) texto.setScale(sitio / texto.width);
}

/** Franja de selección: rectángulo redondeado del color de acento, con canto y brillo. */
export function franja(scene: Phaser.Scene, x: number, y: number, ancho: number, alto: number, color: number = COLOR.oro): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  const r = Math.min(26, alto / 2);
  g.fillStyle(oscurecer(color, 0.25), 1).fillRoundedRect(x, y + 5, ancho, alto, r);
  g.fillStyle(color, 1).fillRoundedRect(x, y, ancho, alto, r);
  g.fillStyle(0xffffff, 0.25).fillRoundedRect(x + 6, y + 4, ancho - 12, alto * 0.4, { tl: r - 4, tr: r - 4, bl: 0, br: 0 });
  return g;
}

/** Píldora de texto: etiquetas como «VIDA», estados, niveles o contadores. */
export function pildora(scene: Phaser.Scene, x: number, y: number, texto: string, fondo: number, tam = 22, color: number = COLOR.panel): Phaser.GameObjects.Container {
  const t = scene.add.text(0, 0, texto, estiloTexto(tam, color, true)).setOrigin(0.5);
  const ancho = t.width + tam * 1.2;
  const alto = tam * 1.5;
  const g = scene.add.graphics();
  g.fillStyle(fondo, 1);
  g.fillRoundedRect(-ancho / 2, -alto / 2, ancho, alto, alto / 2);
  const c = scene.add.container(x + ancho / 2, y, [g, t]);
  c.setSize(ancho, alto);
  return c;
}

/** Color claro para el círculo detrás de una criatura, según su primer tipo. */
export function colorPedestal(especie: string): number {
  return aclarar(colorTipoDe(especie), 0.55);
}

/** Color del primer tipo de una especie. */
export function colorTipoDe(especie: string): number {
  const tipo = DATOS.especies[especie]?.tipos[0];
  return DATOS.tipos.tipos.find((t) => t.id === tipo)?.color ?? COLOR.tintaSuave;
}
