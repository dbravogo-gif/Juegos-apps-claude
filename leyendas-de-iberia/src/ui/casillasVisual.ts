import Phaser from 'phaser';
import { CASILLAS } from '../data/casillas';
import { aclarar, oscurecer } from './tema';

// Aspecto provisional de cada casilla, dibujado por código al arrancar. Cuando haya un tileset
// de verdad, basta con cargarlo con las mismas claves (`casilla-<carácter>`).

export const TAM_CASILLA = 72;

export const claveCasilla = (c: string) => `casilla-${c.charCodeAt(0)}`;

type Pintor = (g: Phaser.GameObjects.Graphics, t: number) => void;

const VERDE = 0x7fae5a;
const CAMINO = 0xcdb07a;
const SUELO_INTERIOR = 0xb08a5a;

function base(color: number): Pintor {
  return (g, t) => {
    g.fillStyle(color, 1);
    g.fillRect(0, 0, t, t);
  };
}

function hierba(g: Phaser.GameObjects.Graphics, t: number): void {
  base(VERDE)(g, t);
  g.fillStyle(aclarar(VERDE, 0.25), 1);
  for (const [x, y] of [[12, 18], [44, 10], [30, 44], [58, 52], [8, 58]]) {
    g.fillTriangle(x, y + 8, x + 3, y, x + 6, y + 8);
  }
}

function suelo(color: number, vetas: boolean): Pintor {
  return (g, t) => {
    base(color)(g, t);
    g.lineStyle(2, oscurecer(color, 0.18), 1);
    if (vetas) {
      for (let y = 18; y < t; y += 18) g.lineBetween(0, y, t, y);
    }
  };
}

function copa(colorCopa: number): Pintor {
  return (g, t) => {
    hierba(g, t);
    g.fillStyle(0x6b4423, 1);
    g.fillRect(t / 2 - 6, t * 0.55, 12, t * 0.4);
    g.fillStyle(oscurecer(colorCopa, 0.3), 1);
    g.fillCircle(t / 2, t * 0.42, t * 0.38);
    g.fillStyle(colorCopa, 1);
    g.fillCircle(t / 2 - 4, t * 0.38, t * 0.32);
    g.fillStyle(aclarar(colorCopa, 0.2), 1);
    g.fillCircle(t / 2 - 10, t * 0.3, t * 0.12);
  };
}

function ladrillos(color: number): Pintor {
  return (g, t) => {
    base(color)(g, t);
    g.lineStyle(2, oscurecer(color, 0.3), 1);
    for (let fila = 0; fila < 4; fila++) {
      const y = fila * (t / 4);
      g.lineBetween(0, y, t, y);
      const desfase = fila % 2 === 0 ? 0 : t / 4;
      for (let x = desfase; x < t; x += t / 2) g.lineBetween(x, y, x, y + t / 4);
    }
  };
}

const PINTORES: Record<string, Pintor> = {
  '.': (g, t) => {
    base(CAMINO)(g, t);
    g.fillStyle(oscurecer(CAMINO, 0.12), 1);
    for (const [x, y] of [[14, 20], [50, 14], [36, 50], [60, 60], [20, 60]]) g.fillCircle(x, y, 3);
  },
  ',': hierba,
  h: (g, t) => {
    const c = 0x4e8a3a;
    base(c)(g, t);
    g.fillStyle(aclarar(c, 0.3), 1);
    for (let x = 4; x < t; x += 14) {
      for (const y of [6, 30, 54]) g.fillTriangle(x, y + 16, x + 5, y, x + 10, y + 16);
    }
  },
  '*': (g, t) => {
    hierba(g, t);
    const colores = [0xe25a5a, 0xf2d24b, 0xffffff, 0xc07ad8];
    [[18, 20], [50, 26], [28, 52], [56, 56]].forEach(([x, y], i) => {
      g.fillStyle(colores[i], 1);
      g.fillCircle(x, y, 6);
      g.fillStyle(0xf2d24b, 1);
      g.fillCircle(x, y, 2);
    });
  },
  S: (g, t) => {
    const c = 0xc4b8a2;
    base(c)(g, t);
    g.lineStyle(2, oscurecer(c, 0.22), 1);
    g.strokeRect(2, 2, t / 2 - 4, t / 2 - 4);
    g.strokeRect(t / 2 + 2, 2, t / 2 - 4, t / 2 - 4);
    g.strokeRect(2 + t / 4, t / 2 + 2, t / 2 - 4, t / 2 - 4);
  },
  '=': (g, t) => {
    base(0x4a8ac4)(g, t);
    g.fillStyle(0x8b5a2b, 1);
    g.fillRect(8, 0, t - 16, t);
    g.lineStyle(2, 0x5c3a1a, 1);
    for (let y = 12; y < t; y += 12) g.lineBetween(8, y, t - 8, y);
  },
  P: (g, t) => {
    ladrillos(0x9c8b72)(g, t);
    g.fillStyle(0x4a2f1a, 1);
    g.fillRect(14, 10, t - 28, t - 10);
    g.fillStyle(0xc9a227, 1);
    g.fillCircle(t - 22, t / 2 + 6, 3);
  },
  G: (g, t) => {
    base(CAMINO)(g, t);
    g.fillStyle(0x6b5a45, 1);
    g.fillRect(0, 0, 8, t);
    g.fillRect(t - 8, 0, 8, t);
  },
  B: suelo(SUELO_INTERIOR, true),
  R: (g, t) => {
    const c = 0x8a2b2b;
    base(c)(g, t);
    g.lineStyle(3, 0xc9a227, 1);
    g.strokeRect(6, 6, t - 12, t - 12);
  },
  '#': copa(0x2f6b2a),
  o: copa(0x8a9a6a),
  '~': (g, t) => {
    const c = 0x4a8ac4;
    base(c)(g, t);
    g.lineStyle(3, aclarar(c, 0.35), 1);
    g.lineBetween(10, 22, 30, 18);
    g.lineBetween(38, 48, 60, 44);
  },
  M: ladrillos(0x9c8b72),
  T: (g, t) => {
    const c = 0xb5542c;
    base(c)(g, t);
    g.lineStyle(3, oscurecer(c, 0.3), 1);
    for (let y = 12; y < t; y += 18) g.lineBetween(0, y, t, y);
    g.lineStyle(2, aclarar(c, 0.2), 1);
    for (let x = 9; x < t; x += 18) g.lineBetween(x, 0, x, t);
  },
  L: (g, t) => {
    base(0xe8dcc0)(g, t);
    g.fillStyle(0x9f1d20, 1);
    g.fillRect(0, 0, t / 4, t);
    g.fillRect(t / 2, 0, t / 4, t);
  },
  W: (g, t) => {
    const c = 0x7a5a3a;
    base(c)(g, t);
    g.fillStyle(oscurecer(c, 0.25), 1);
    g.fillRect(0, t * 0.7, t, t * 0.3);
  },
  X: (g, t) => {
    suelo(SUELO_INTERIOR, true)(g, t);
    g.fillStyle(0x6b4423, 1);
    g.fillRect(0, 10, t, t - 20);
    g.fillStyle(0x8b5a2b, 1);
    g.fillRect(0, 10, t, 14);
  },
  E: (g, t) => {
    PINTORES.W(g, t);
    g.fillStyle(0x5c3a1a, 1);
    g.fillRect(6, 10, t - 12, 6);
    g.fillRect(6, 36, t - 12, 6);
    g.fillStyle(0xd9c27a, 1);
    for (const x of [12, 30, 48]) g.fillRect(x, 20, 10, 16);
  },
  K: (g, t) => {
    suelo(SUELO_INTERIOR, true)(g, t);
    g.fillStyle(0x7a4a22, 1);
    g.fillCircle(t * 0.32, t * 0.6, t * 0.22);
    g.fillCircle(t * 0.68, t * 0.42, t * 0.22);
    g.lineStyle(3, 0x3a2410, 1);
    g.strokeCircle(t * 0.32, t * 0.6, t * 0.22);
    g.strokeCircle(t * 0.68, t * 0.42, t * 0.22);
  },
  C: (g, t) => {
    suelo(0xe9e1cf, false)(g, t);
    g.fillStyle(0xf7f3ea, 1);
    g.fillCircle(t / 2, t / 2, t * 0.3);
    g.lineStyle(3, 0xb9ad94, 1);
    g.strokeCircle(t / 2, t / 2, t * 0.3);
  },
  A: (g, t) => {
    base(0xe9e1cf)(g, t);
    g.fillStyle(0x8a8170, 1);
    g.fillRect(4, 4, t - 8, t - 8);
    g.fillStyle(0x5aa0d8, 1);
    g.fillRect(10, 10, t - 20, t - 20);
    g.lineStyle(2, 0xbfe0f5, 1);
    g.lineBetween(18, 30, 40, 26);
  },
  Z: (g, t) => {
    const c = 0xe9e1cf;
    base(c)(g, t);
    const colores = [0x2f7a5a, 0x2f5a9a];
    for (let i = 0; i < 4; i++) {
      const x = (i % 2) * (t / 2) + t / 4;
      const y = Math.floor(i / 2) * (t / 2) + t / 4;
      g.fillStyle(colores[(i + Math.floor(i / 2)) % 2], 1);
      g.fillTriangle(x, y - 12, x + 12, y, x, y + 12);
      g.fillTriangle(x, y - 12, x - 12, y, x, y + 12);
    }
  },
};

/** Genera una textura por cada carácter de la leyenda. Se llama una vez al arrancar. */
export function generarTexturasCasillas(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  for (const c of Object.keys(CASILLAS)) {
    const clave = claveCasilla(c);
    if (scene.textures.exists(clave)) continue;
    g.clear();
    (PINTORES[c] ?? base(0xff00ff))(g, TAM_CASILLA);
    g.generateTexture(clave, TAM_CASILLA, TAM_CASILLA);
  }
  g.destroy();
}
