import Phaser from 'phaser';
import { DATOS } from '../data';
import { aclarar, ANCHO, COLOR, estiloTexto, oscurecer } from './tema';

// Piezas de los menús, al estilo de los juegos del género: ventanas con doble marco, fondo con
// rayas, cabecera de banda e iconos dibujados. Todo se dibuja con Graphics, sin imágenes.

export interface OpcionesVentana {
  /** Color del interior. */
  color?: number;
  /** Color del filete interior. */
  filete?: number;
  sombra?: boolean;
  /** Brillo claro en la parte de arriba. */
  brillo?: boolean;
}

/** Ventana con borde oscuro, filete dorado, interior claro y un brillo arriba. */
export function ventana(scene: Phaser.Scene, x: number, y: number, ancho: number, alto: number, op: OpcionesVentana = {}): Phaser.GameObjects.Graphics {
  const color = op.color ?? COLOR.pergamino;
  const r = Math.min(26, alto / 2);
  const g = scene.add.graphics();
  if (op.sombra !== false) {
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(x + 6, y + 9, ancho, alto, r);
  }
  g.fillStyle(COLOR.tinta, 1);
  g.fillRoundedRect(x, y, ancho, alto, r);
  g.fillStyle(op.filete ?? COLOR.oro, 1);
  g.fillRoundedRect(x + 5, y + 5, ancho - 10, alto - 10, Math.max(2, r - 4));
  g.fillStyle(color, 1);
  g.fillRoundedRect(x + 10, y + 10, ancho - 20, alto - 20, Math.max(2, r - 8));
  const brillo = Math.min(alto * 0.4, 70);
  if (op.brillo !== false && brillo > 16) {
    const rb = Math.max(2, r - 8);
    g.fillStyle(0xffffff, 0.22);
    g.fillRoundedRect(x + 10, y + 10, ancho - 20, brillo, { tl: rb, tr: rb, bl: 0, br: 0 });
  }
  return g;
}

/** Fondo de pantalla de menú: rayas en diagonal sobre el color oscuro del juego. */
export function fondoMenu(scene: Phaser.Scene, alto: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(COLOR.fondo, 1);
  g.fillRect(0, 0, ANCHO, alto);
  g.fillStyle(0x2a2019, 1);
  const paso = 90;
  for (let x = -alto; x < ANCHO; x += paso) {
    g.fillPoints(
      [
        new Phaser.Math.Vector2(x, alto),
        new Phaser.Math.Vector2(x + 40, alto),
        new Phaser.Math.Vector2(x + 40 + alto, 0),
        new Phaser.Math.Vector2(x + alto, 0),
      ],
      true,
    );
  }
  return g;
}

/** Banda roja de título arriba de la pantalla, con filete dorado y rombos a los lados. */
export function cabecera(scene: Phaser.Scene, contenedor: Phaser.GameObjects.Container, titulo: string): void {
  const g = scene.add.graphics();
  g.fillStyle(oscurecer(COLOR.rojo, 0.35), 1);
  g.fillRect(0, 0, ANCHO, 112);
  g.fillStyle(COLOR.rojo, 1);
  g.fillRect(0, 0, ANCHO, 100);
  g.fillStyle(0xffffff, 0.12);
  g.fillRect(0, 0, ANCHO, 40);
  g.fillStyle(COLOR.oro, 1);
  g.fillRect(0, 104, ANCHO, 6);
  contenedor.add(g);
  const texto = scene.add.text(ANCHO / 2, 54, titulo, estiloTexto(50, COLOR.pergamino, true)).setOrigin(0.5);
  texto.setShadow(0, 4, '#000000', 0, false, true);
  contenedor.add(texto);
  if (texto.width < ANCHO - 260) {
    const rombos = scene.add.graphics();
    rombos.fillStyle(COLOR.oro, 1);
    for (const lado of [-1, 1]) {
      const cx = ANCHO / 2 + lado * (texto.width / 2 + 44);
      rombos.fillPoints([new Phaser.Math.Vector2(cx, 34), new Phaser.Math.Vector2(cx + 16, 54), new Phaser.Math.Vector2(cx, 74), new Phaser.Math.Vector2(cx - 16, 54)], true);
    }
    contenedor.add(rombos);
  }
}

/** Cursor ▶ que se mece, para marcar la opción elegida con el teclado o la cruceta. */
export function cursor(scene: Phaser.Scene, x: number, y: number, tam = 40): Phaser.GameObjects.Text {
  const t = scene.add.text(x, y, '▶', estiloTexto(tam, COLOR.rojo, true)).setOrigin(0.5);
  scene.tweens.add({ targets: t, x: x + 8, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  return t;
}

export type IconoMenu = 'equipo' | 'bestiario' | 'mochila' | 'tipos' | 'guardar' | 'cerrar';

/** Icono vectorial de una opción de menú, centrado en (x, y) en un cuadrado de lado `tam`. */
export function iconoMenu(scene: Phaser.Scene, icono: IconoMenu, x: number, y: number, tam: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics({ x, y });
  const s = tam / 64;
  const T = COLOR.tinta;
  const linea = Math.max(2, 3 * s);
  switch (icono) {
    case 'equipo': {
      // Huella: almohadilla y cuatro dedos.
      g.fillStyle(COLOR.bronce, 1).lineStyle(linea, T, 1);
      g.fillEllipse(0, 10 * s, 30 * s, 24 * s).strokeEllipse(0, 10 * s, 30 * s, 24 * s);
      for (const [dx, dy] of [
        [-20, -8],
        [-8, -20],
        [8, -20],
        [20, -8],
      ]) {
        g.fillCircle(dx * s, dy * s, 7.5 * s).strokeCircle(dx * s, dy * s, 7.5 * s);
      }
      break;
    }
    case 'bestiario': {
      // Libro rojo con lomo y cantoneras de oro.
      g.fillStyle(COLOR.pergamino, 1).lineStyle(linea, T, 1);
      g.fillRoundedRect(-20 * s, -24 * s, 44 * s, 50 * s, 4 * s).strokeRoundedRect(-20 * s, -24 * s, 44 * s, 50 * s, 4 * s);
      g.fillStyle(COLOR.rojo, 1);
      g.fillRoundedRect(-24 * s, -28 * s, 42 * s, 50 * s, 5 * s).strokeRoundedRect(-24 * s, -28 * s, 42 * s, 50 * s, 5 * s);
      g.fillStyle(COLOR.oro, 1);
      g.fillRect(-18 * s, -28 * s, 5 * s, 50 * s);
      g.fillCircle(3 * s, -3 * s, 8 * s);
      break;
    }
    case 'mochila': {
      // Zurrón de cuero con solapa y hebilla.
      g.lineStyle(linea, T, 1);
      g.strokeEllipse(0, -22 * s, 30 * s, 20 * s);
      g.fillStyle(0x8a5a2b, 1);
      g.fillRoundedRect(-24 * s, -14 * s, 48 * s, 42 * s, 9 * s).strokeRoundedRect(-24 * s, -14 * s, 48 * s, 42 * s, 9 * s);
      g.fillStyle(0xa8713a, 1);
      g.fillRoundedRect(-24 * s, -14 * s, 48 * s, 20 * s, { tl: 9 * s, tr: 9 * s, bl: 4 * s, br: 4 * s }).strokeRoundedRect(-24 * s, -14 * s, 48 * s, 20 * s, {
        tl: 9 * s,
        tr: 9 * s,
        bl: 4 * s,
        br: 4 * s,
      });
      g.fillStyle(COLOR.oro, 1);
      g.fillRect(-5 * s, 2 * s, 10 * s, 9 * s);
      break;
    }
    case 'tipos': {
      // Rueda con los colores de cuatro tipos.
      const colores = ['infernal', 'agua', 'planta', 'electrico'].map((id) => DATOS.tipos.tipos.find((t) => t.id === id)?.color ?? COLOR.oro);
      colores.forEach((c, i) => {
        g.fillStyle(c, 1);
        g.slice(0, 0, 26 * s, Phaser.Math.DegToRad(i * 90 - 90), Phaser.Math.DegToRad(i * 90), false);
        g.fillPath();
      });
      g.lineStyle(linea, T, 1).strokeCircle(0, 0, 26 * s);
      g.fillStyle(COLOR.pergamino, 1).fillCircle(0, 0, 8 * s).strokeCircle(0, 0, 8 * s);
      break;
    }
    case 'guardar': {
      // Pergamino enrollado con sello de lacre.
      g.fillStyle(COLOR.pergamino, 1).lineStyle(linea, T, 1);
      g.fillRect(-20 * s, -22 * s, 40 * s, 44 * s).strokeRect(-20 * s, -22 * s, 40 * s, 44 * s);
      g.fillStyle(COLOR.pergaminoOscuro, 1);
      g.fillRoundedRect(-26 * s, -28 * s, 52 * s, 12 * s, 6 * s).strokeRoundedRect(-26 * s, -28 * s, 52 * s, 12 * s, 6 * s);
      g.fillRoundedRect(-26 * s, 16 * s, 52 * s, 12 * s, 6 * s).strokeRoundedRect(-26 * s, 16 * s, 52 * s, 12 * s, 6 * s);
      g.lineStyle(linea * 0.7, COLOR.tintaSuave, 1);
      for (const ly of [-8, 0, 8]) g.lineBetween(-13 * s, ly * s, 8 * s, ly * s);
      g.fillStyle(COLOR.rojo, 1).fillCircle(12 * s, 10 * s, 8 * s);
      break;
    }
    case 'cerrar': {
      // Puerta entornada.
      g.fillStyle(0x6b4423, 1).lineStyle(linea, T, 1);
      g.fillRoundedRect(-18 * s, -28 * s, 36 * s, 56 * s, { tl: 16 * s, tr: 16 * s, bl: 0, br: 0 });
      g.strokeRoundedRect(-18 * s, -28 * s, 36 * s, 56 * s, { tl: 16 * s, tr: 16 * s, bl: 0, br: 0 });
      g.lineStyle(linea * 0.7, oscurecer(0x6b4423, 0.4), 1);
      g.lineBetween(-6 * s, -20 * s, -6 * s, 26 * s);
      g.lineBetween(6 * s, -20 * s, 6 * s, 26 * s);
      g.fillStyle(COLOR.oro, 1).fillCircle(11 * s, 4 * s, 4 * s);
      break;
    }
  }
  return g;
}

/** Píldora de texto: etiquetas como «VIDA», estados o contadores. */
export function pildora(scene: Phaser.Scene, x: number, y: number, texto: string, fondo: number, tam = 22, color: number = COLOR.pergamino): Phaser.GameObjects.Container {
  const t = scene.add.text(0, 0, texto, estiloTexto(tam, color, true)).setOrigin(0.5);
  const ancho = t.width + tam * 1.1;
  const alto = tam * 1.45;
  const g = scene.add.graphics();
  g.fillStyle(fondo, 1);
  g.fillRoundedRect(-ancho / 2, -alto / 2, ancho, alto, alto / 2);
  g.lineStyle(3, oscurecer(fondo, 0.45), 1);
  g.strokeRoundedRect(-ancho / 2, -alto / 2, ancho, alto, alto / 2);
  const c = scene.add.container(x + ancho / 2, y, [g, t]);
  c.setSize(ancho, alto);
  return c;
}

/** Color claro para el pedestal de una criatura, según su primer tipo. */
export function colorPedestal(especie: string): number {
  const tipo = DATOS.especies[especie]?.tipos[0];
  const color = DATOS.tipos.tipos.find((t) => t.id === tipo)?.color ?? COLOR.pergaminoOscuro;
  return aclarar(color, 0.45);
}
