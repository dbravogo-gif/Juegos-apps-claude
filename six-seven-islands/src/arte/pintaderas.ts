// Las medallas son pintaderas (autor, 2026-11-12): los sellos de barro con dibujos geométricos de
// los antiguos canarios. Una por isla, dibujada aquí en SVG por código. Los diseños son nuestros:
// toman el estilo (triángulos, damero, círculos, zigzag y espiral), no copian ninguna pieza
// concreta de un museo (R8). Funciones puras que devuelven texto, para probarlas sin DOM.

/** Colores de barro cocido; la que no se ha ganado sale en gris, como un hueco. */
const BARRO = { fondo: '#b5532f', dibujo: '#f6dfc3', borde: '#5a2412' };
const HUECO = { fondo: '#544a60', dibujo: '#857a94', borde: '#2c2533' };

type Colores = typeof BARRO;

/** Puntos de un polígono regular, empezando arriba. */
function poligono(n: number, r: number, cx = 50, cy = 50, giro = -Math.PI / 2): string {
  return Array.from({ length: n }, (_, i) => {
    const a = giro + (i * 2 * Math.PI) / n;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

/** Un zigzag horizontal de `x0` a `x1` a la altura `y`, con dientes de `alto`. */
function zigzag(x0: number, x1: number, y: number, dientes: number, alto: number): string {
  const paso = (x1 - x0) / dientes;
  const pts = Array.from({ length: dientes + 1 }, (_, i) => `${(x0 + i * paso).toFixed(1)},${(y + (i % 2 ? -alto : alto)).toFixed(1)}`);
  return `<polyline points="${pts.join(' ')}" />`;
}

/** Cada isla, su pintadera: la forma del sello y su dibujo. */
const DISENOS: Record<number, (c: Colores) => string> = {
  // Lanzarote: un sol de ocho triángulos alrededor de un cráter.
  1: (c) => {
    const triangulos = Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4 - Math.PI / 2;
      const p = (r: number, d: number) => `${(50 + r * Math.cos(a + d)).toFixed(1)},${(50 + r * Math.sin(a + d)).toFixed(1)}`;
      return `<polygon points="${p(40, 0)} ${p(22, 0.32)} ${p(22, -0.32)}" fill="${c.dibujo}" />`;
    }).join('');
    return `<circle cx="50" cy="50" r="46" fill="${c.fondo}" stroke="${c.borde}" stroke-width="4" />${triangulos}<circle cx="50" cy="50" r="14" fill="none" stroke="${c.dibujo}" stroke-width="4" /><circle cx="50" cy="50" r="5" fill="${c.dibujo}" />`;
  },
  // Fuerteventura: un damero en un sello cuadrado.
  2: (c) => {
    const casillas: string[] = [];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2 === 0) casillas.push(`<rect x="${22 + i * 14}" y="${22 + j * 14}" width="14" height="14" fill="${c.dibujo}" />`);
    return `<rect x="6" y="6" width="88" height="88" rx="10" fill="${c.fondo}" stroke="${c.borde}" stroke-width="4" /><rect x="16" y="16" width="68" height="68" rx="4" fill="none" stroke="${c.dibujo}" stroke-width="3" />${casillas.join('')}`;
  },
  // Gran Canaria: círculos que se repiten y una cruz con un punto en cada cuarto.
  3: (c) => {
    const puntos = [
      [32, 32],
      [68, 32],
      [32, 68],
      [68, 68],
    ]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${c.dibujo}" />`)
      .join('');
    return `<circle cx="50" cy="50" r="46" fill="${c.fondo}" stroke="${c.borde}" stroke-width="4" /><g fill="none" stroke="${c.dibujo}" stroke-width="3.5"><circle cx="50" cy="50" r="37" /><circle cx="50" cy="50" r="11" /><line x1="50" y1="13" x2="50" y2="39" /><line x1="50" y1="61" x2="50" y2="87" /><line x1="13" y1="50" x2="39" y2="50" /><line x1="61" y1="50" x2="87" y2="50" /></g>${puntos}`;
  },
  // Tenerife: un sello triangular, como el Teide, con bandas en zigzag.
  4: (c) =>
    `<polygon points="50,5 95,90 5,90" fill="${c.fondo}" stroke="${c.borde}" stroke-width="4" stroke-linejoin="round" /><g fill="none" stroke="${c.dibujo}" stroke-width="3.5" stroke-linejoin="round">${zigzag(38, 62, 40, 4, 4)}${zigzag(28, 72, 58, 6, 4)}${zigzag(18, 82, 76, 8, 4)}</g>`,
  // La Gomera: un sello alargado con cheurones, como sus barrancos.
  5: (c) => {
    const cheurones = [26, 42, 58, 74].map((y) => `<polyline points="24,${y + 8} 50,${y - 4} 76,${y + 8}" />`).join('');
    return `<rect x="16" y="4" width="68" height="92" rx="14" fill="${c.fondo}" stroke="${c.borde}" stroke-width="4" /><g fill="none" stroke="${c.dibujo}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${cheurones}</g>`;
  },
  // La Palma: una espiral, como sus grabados en la piedra.
  6: (c) => {
    const pts: string[] = [];
    for (let i = 0; i <= 150; i++) {
      const a = (i / 150) * Math.PI * 7;
      const r = 3 + (i / 150) * 33;
      pts.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`);
    }
    return `<polygon points="${poligono(12, 47)}" fill="${c.fondo}" stroke="${c.borde}" stroke-width="4" stroke-linejoin="round" /><polyline points="${pts.join(' ')}" fill="none" stroke="${c.dibujo}" stroke-width="4" stroke-linecap="round" />`;
  },
};

/** Las islas que tienen pintadera, en orden. */
export const ISLAS_CON_PINTADERA = Object.keys(DISENOS).map(Number);

/** El SVG de la pintadera de una isla, en barro si se ha ganado o en gris si no. */
export function svgPintadera(isla: number, ganada: boolean): string {
  const diseno = DISENOS[isla];
  if (!diseno) throw new Error(`La isla ${isla} no tiene pintadera`);
  const nombre = ganada ? `Pintadera de la isla ${isla}` : `Pintadera de la isla ${isla}, sin ganar`;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${nombre}">${diseno(ganada ? BARRO : HUECO)}</svg>`;
}
