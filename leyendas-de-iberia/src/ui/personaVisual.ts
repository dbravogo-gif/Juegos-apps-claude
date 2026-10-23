import Phaser from 'phaser';
import type { Dir, Pnj } from '../core/mundo';
import { TAM_CASILLA } from './casillasVisual';
import { oscurecer } from './tema';

// Figura provisional de personas: cuerpo del color de su ropa, cabeza y un tocado que las
// distingue (corona, casco, turbante…). Mira hacia donde camina.

const PIEL = 0xe3b58e;
const PELO = 0x4a2f1a;

export class Persona extends Phaser.GameObjects.Container {
  private cara: Phaser.GameObjects.Graphics;
  dir: Dir;

  constructor(scene: Phaser.Scene, x: number, y: number, color: number, tocado: Pnj['tocado'], dir: Dir) {
    super(scene, x, y);
    this.dir = dir;
    const t = TAM_CASILLA;
    const cuerpo = scene.add.graphics();
    // Sombra.
    cuerpo.fillStyle(0x000000, 0.2);
    cuerpo.fillEllipse(0, t * 0.36, t * 0.6, t * 0.16);
    // Ropa.
    cuerpo.fillStyle(oscurecer(color, 0.35), 1);
    cuerpo.fillRoundedRect(-t * 0.27, -t * 0.06, t * 0.54, t * 0.42, 10);
    cuerpo.fillStyle(color, 1);
    cuerpo.fillRoundedRect(-t * 0.24, -t * 0.06, t * 0.48, t * 0.38, 10);
    // Cabeza.
    cuerpo.fillStyle(PIEL, 1);
    cuerpo.fillCircle(0, -t * 0.2, t * 0.19);
    this.add(cuerpo);
    this.cara = scene.add.graphics();
    this.add(this.cara);
    const sombrero = scene.add.graphics();
    dibujarTocado(sombrero, tocado, t);
    this.add(sombrero);
    this.setDir(dir);
    scene.add.existing(this);
  }

  setDir(dir: Dir): void {
    this.dir = dir;
    const t = TAM_CASILLA;
    const g = this.cara;
    g.clear();
    const y = -t * 0.2;
    if (dir === 'arriba') {
      g.fillStyle(PELO, 1);
      g.fillCircle(0, y, t * 0.17);
      return;
    }
    g.fillStyle(PELO, 1);
    g.fillEllipse(0, y - t * 0.12, t * 0.36, t * 0.14);
    g.fillStyle(0x1d1611, 1);
    if (dir === 'abajo') {
      g.fillCircle(-t * 0.07, y + 2, 3.5);
      g.fillCircle(t * 0.07, y + 2, 3.5);
    } else {
      const lado = dir === 'derecha' ? 1 : -1;
      g.fillCircle(lado * t * 0.09, y + 2, 3.5);
    }
  }
}

function dibujarTocado(g: Phaser.GameObjects.Graphics, tocado: Pnj['tocado'], t: number): void {
  const y = -t * 0.36;
  switch (tocado) {
    case 'corona':
      g.fillStyle(0xd4a62a, 1);
      g.fillRect(-t * 0.16, y, t * 0.32, t * 0.07);
      for (const x of [-0.16, -0.05, 0.06]) g.fillTriangle(t * x, y, t * (x + 0.05), y - t * 0.1, t * (x + 0.1), y);
      break;
    case 'casco':
      g.fillStyle(0x9aa3ad, 1);
      g.slice(0, y + t * 0.08, t * 0.21, Math.PI, 0, false);
      g.fillPath();
      g.fillRect(-t * 0.24, y + t * 0.06, t * 0.48, t * 0.04);
      break;
    case 'turbante':
      g.fillStyle(0xf2ece0, 1);
      g.fillEllipse(0, y + t * 0.04, t * 0.42, t * 0.2);
      g.fillStyle(0x2f7a5a, 1);
      g.fillCircle(0, y + t * 0.02, t * 0.035);
      break;
    case 'sombrero':
      g.fillStyle(0x6b4423, 1);
      g.fillEllipse(0, y + t * 0.07, t * 0.56, t * 0.08);
      g.fillRect(-t * 0.13, y - t * 0.04, t * 0.26, t * 0.11);
      break;
    case 'toca':
      g.fillStyle(0xf2ece0, 1);
      g.fillEllipse(0, y + t * 0.1, t * 0.44, t * 0.26);
      break;
    case 'gorro':
      g.fillStyle(0x7a2f2f, 1);
      g.fillEllipse(0, y + t * 0.05, t * 0.38, t * 0.16);
      break;
    default:
      break;
  }
}
