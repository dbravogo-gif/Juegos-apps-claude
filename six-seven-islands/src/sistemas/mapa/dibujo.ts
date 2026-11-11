// Dibuja el plano de una isla (plano.ts) en un lienzo 2D: el mapa del juego y la vista ?mapa.
// Estilo de diorama visto desde arriba: relieve con una sombra al sur de cada desnivel, espuma en
// la orilla, tejados por tipo de edificio y el nombre de cada zona.

import { COLORES } from '../../arte/paleta';
import type { Casilla } from '../../core/mundo';
import { Detalle, MARGEN_PLANO, type Plano } from './plano';

export interface OpcionesDibujo {
  /** Píxeles por casilla. */
  px: number;
  titulo?: string;
  /** Dónde está el jugador, en casillas de la isla. */
  jugador?: { x: number; y: number };
  leyenda?: boolean;
}

/** Tejado de cada edificio y su nombre en la leyenda. */
export const TEJADOS: Partial<Record<Casilla, { color: string; nombre: string }>> = {
  C: { color: COLORES.cal, nombre: 'Casa' },
  R: { color: COLORES.acentoCoral, nombre: 'Refugio' },
  S: { color: '#5B8FD9', nombre: 'Tienda' },
  G: { color: '#E9B949', nombre: 'Gimnasio' },
  M: { color: COLORES.tejaCanaria, nombre: 'Museo' },
  F: { color: '#FFFFFF', nombre: 'Faro' },
};

const FUENTE = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`;

export function dibujarPlano(ctx: CanvasRenderingContext2D, p: Plano, op: OpcionesDibujo): void {
  const { px } = op;
  const tierra = (x: number, y: number) => x >= 0 && y >= 0 && x < p.ancho && y < p.alto && !Number.isNaN(p.altura[y * p.ancho + x]);
  const alto = (x: number, y: number) => p.altura[y * p.ancho + x];

  // 1. El color de cada casilla.
  for (let y = 0; y < p.alto; y++) {
    for (let x = 0; x < p.ancho; x++) {
      ctx.fillStyle = hex(p.color[y * p.ancho + x]);
      ctx.fillRect(x * px, y * px, px, px);
    }
  }

  // 2. Detalles, relieve y espuma.
  for (let y = 0; y < p.alto; y++) {
    for (let x = 0; x < p.ancho; x++) {
      const i = y * p.ancho + x;
      const [X, Y] = [x * px, y * px];
      if (p.orilla[i]) {
        ctx.fillStyle = COLORES.espuma;
        const g = Math.max(1, px * 0.2);
        if (tierra(x, y - 1)) ctx.fillRect(X, Y, px, g);
        if (tierra(x, y + 1)) ctx.fillRect(X, Y + px - g, px, g);
        if (tierra(x - 1, y)) ctx.fillRect(X, Y, g, px);
        if (tierra(x + 1, y)) ctx.fillRect(X + px - g, Y, g, px);
        continue;
      }
      if (!tierra(x, y)) continue;
      detalle(ctx, p.detalle[i] as Detalle, X, Y, px, x + y);
      // Desnivel hacia el sur (o el mar): la cara que da a la cámara, en sombra.
      if (!tierra(x, y + 1) || alto(x, y + 1) < alto(x, y) - 0.15) {
        ctx.fillStyle = 'rgba(43, 35, 64, 0.38)';
        ctx.fillRect(X, Y + px * 0.72, px, px * 0.28);
      }
      // Desnivel hacia el norte: el borde de arriba, con luz.
      if (tierra(x, y - 1) && alto(x, y - 1) < alto(x, y) - 0.15) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(X, Y, px, Math.max(1, px * 0.14));
      }
      // A los lados, una línea fina.
      for (const dx of [-1, 1]) {
        if (!tierra(x + dx, y) || alto(x + dx, y) < alto(x, y) - 0.15) {
          ctx.fillStyle = 'rgba(43, 35, 64, 0.22)';
          ctx.fillRect(dx < 0 ? X : X + px - Math.max(1, px * 0.12), Y, Math.max(1, px * 0.12), px);
        }
      }
    }
  }

  // 3. Edificios, con su sombra y la puerta.
  for (const e of p.edificios) {
    const t = TEJADOS[e.tipo];
    if (!t) continue;
    const [X, Y, W, H] = [e.x * px + 1, e.y * px + 1, e.ancho * px - 2, e.fondo * px - 2];
    ctx.fillStyle = 'rgba(43, 35, 64, 0.35)';
    ctx.fillRect(X + px * 0.3, Y + px * 0.35, W, H);
    ctx.fillStyle = t.color;
    ctx.fillRect(X, Y, W, H);
    if (e.tipo === 'F') {
      ctx.fillStyle = COLORES.acentoCoral;
      ctx.fillRect(X, Y + H * 0.4, W, H * 0.2);
    }
    ctx.strokeStyle = 'rgba(43, 35, 64, 0.65)';
    ctx.lineWidth = Math.max(1, px * 0.12);
    ctx.strokeRect(X, Y, W, H);
    ctx.fillStyle = '#5A3A2A';
    for (const d of e.puertas) ctx.fillRect(d.x * px + px * 0.3, d.y * px - px * 0.2, px * 0.4, px * 0.35);
  }

  // 4. Nombres de las zonas.
  for (const e of p.etiquetas) etiqueta(ctx, e.texto, e.x * px, e.y * px, Math.max(10, px * 1.5));

  // 5. El jugador.
  if (op.jugador) {
    const [X, Y] = [(op.jugador.x + MARGEN_PLANO + 0.5) * px, (op.jugador.y + MARGEN_PLANO + 0.5) * px];
    ctx.beginPath();
    ctx.arc(X, Y, Math.max(4, px * 0.8), 0, Math.PI * 2);
    ctx.fillStyle = COLORES.acentoCoral;
    ctx.fill();
    ctx.lineWidth = Math.max(2, px * 0.25);
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
  }

  // 6. Título, norte y leyenda.
  const borde = px * 1.5;
  const tamTitulo = Math.max(14, px * 2.4);
  if (op.titulo) etiqueta(ctx, op.titulo, borde, borde + tamTitulo * 0.8, tamTitulo, 'izquierda');
  const tamNorte = Math.max(10, px * 1.4);
  norte(ctx, p.ancho * px - borde - tamNorte * 1.3, borde + tamNorte * 1.3, tamNorte);
  if (op.leyenda) leyenda(ctx, borde, p.alto * px - borde, Math.max(10, px * 1.3));
}

function detalle(ctx: CanvasRenderingContext2D, d: Detalle, X: number, Y: number, px: number, paridad: number): void {
  switch (d) {
    case Detalle.Arbol: {
      ctx.beginPath();
      ctx.arc(X + px / 2, Y + px / 2, px * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = '#2F7A4A';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(X + px * 0.4, Y + px * 0.38, px * 0.16, 0, Math.PI * 2);
      ctx.fillStyle = '#5DB07A';
      ctx.fill();
      break;
    }
    case Detalle.Hierba: {
      // Matas en V: la hierba alta, donde salen criaturas.
      ctx.strokeStyle = '#2E6E46';
      ctx.lineWidth = Math.max(1, px * 0.12);
      ctx.beginPath();
      for (const [a, b] of [
        [0.28, 0.42],
        [0.68, 0.3],
        [0.5, 0.78],
      ]) {
        ctx.moveTo(X + (a - 0.1) * px, Y + (b - 0.12) * px);
        ctx.lineTo(X + a * px, Y + b * px);
        ctx.lineTo(X + (a + 0.1) * px, Y + (b - 0.12) * px);
      }
      ctx.stroke();
      break;
    }
    case Detalle.Malpais:
    case Detalle.Colada: {
      ctx.fillStyle = d === Detalle.Colada ? 'rgba(255, 140, 90, 0.35)' : 'rgba(30, 18, 20, 0.55)';
      for (const [a, b] of paridad % 2 ? [[0.25, 0.3], [0.7, 0.6]] : [[0.6, 0.25], [0.3, 0.7]]) ctx.fillRect(X + a * px, Y + b * px, px * 0.18, px * 0.18);
      break;
    }
    case Detalle.Cono:
      ctx.fillStyle = 'rgba(140, 50, 30, 0.3)';
      ctx.fillRect(X, Y, px, px);
      break;
    case Detalle.Cumbre:
      if (paridad % 3 === 0) {
        ctx.strokeStyle = 'rgba(70, 60, 110, 0.3)';
        ctx.lineWidth = Math.max(1, px * 0.1);
        ctx.beginPath();
        ctx.moveTo(X + px * 0.2, Y + px * 0.75);
        ctx.lineTo(X + px * 0.5, Y + px * 0.3);
        ctx.lineTo(X + px * 0.8, Y + px * 0.75);
        ctx.stroke();
      }
      break;
    case Detalle.Muro:
      ctx.strokeStyle = 'rgba(43, 35, 64, 0.4)';
      ctx.lineWidth = Math.max(1, px * 0.1);
      ctx.strokeRect(X + 0.5, Y + 0.5, px - 1, px - 1);
      break;
  }
}

function etiqueta(ctx: CanvasRenderingContext2D, texto: string, x: number, y: number, tam: number, alinear: 'centro' | 'izquierda' = 'centro'): void {
  ctx.font = `700 ${tam}px ${FUENTE}`;
  const w = ctx.measureText(texto).width + tam * 1.1;
  const h = tam * 1.6;
  const x0 = alinear === 'centro' ? x - w / 2 : x;
  ctx.fillStyle = 'rgba(43, 35, 64, 0.78)';
  ctx.beginPath();
  ctx.roundRect(x0, y - h / 2, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(texto, x0 + w / 2, y + tam * 0.05);
}

function norte(ctx: CanvasRenderingContext2D, x: number, y: number, tam: number): void {
  ctx.fillStyle = 'rgba(43, 35, 64, 0.78)';
  ctx.beginPath();
  ctx.arc(x, y, tam * 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORES.acentoCoral;
  ctx.beginPath();
  ctx.moveTo(x, y - tam * 1.05);
  ctx.lineTo(x + tam * 0.35, y - tam * 0.35);
  ctx.lineTo(x - tam * 0.35, y - tam * 0.35);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 ${tam}px ${FUENTE}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', x, y + tam * 0.3);
}

function leyenda(ctx: CanvasRenderingContext2D, x: number, y: number, tam: number): void {
  const filas = Object.values(TEJADOS).filter((t) => t!.nombre !== 'Casa' && t!.nombre !== 'Faro');
  ctx.font = `600 ${tam}px ${FUENTE}`;
  const w = Math.max(...filas.map((t) => ctx.measureText(t!.nombre).width)) + tam * 3;
  const h = filas.length * tam * 1.6 + tam * 0.8;
  ctx.fillStyle = 'rgba(43, 35, 64, 0.78)';
  ctx.beginPath();
  ctx.roundRect(x, y - h, w, h, tam * 0.6);
  ctx.fill();
  filas.forEach((t, i) => {
    const fy = y - h + tam * 0.4 + i * tam * 1.6 + tam * 0.8;
    ctx.fillStyle = t!.color;
    ctx.fillRect(x + tam * 0.6, fy - tam * 0.45, tam * 0.9, tam * 0.9);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(t!.nombre, x + tam * 1.9, fy);
  });
}
