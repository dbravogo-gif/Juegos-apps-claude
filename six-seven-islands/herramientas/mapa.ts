// Dibuja el mapa de una isla, desde sus datos, como SVG: para revisar el diseño de nivel sin
// abrir el juego. Se ejecuta con Node, que entiende TypeScript:
//   node herramientas/mapa.ts [salida.svg]
// Colores de la paleta de ARTE.md. Marca los entrenadores con lo que ven, los pasos cerrados y
// el inicio.
import { writeFileSync } from 'node:fs';
import { clave, construirMundo, deClave, edificios, enIsla, vision, type Casilla } from '../src/core/mundo.ts';
import { ISLA_1 } from '../src/data/isla1.ts';

const T = 12; // píxeles por casilla
const COLOR: Record<Casilla, string> = {
  '.': '#7ED6A5',
  ',': '#E8B878',
  ':': '#b58a5e',
  _: '#5b555a',
  '"': '#57b86e',
  ';': '#8a4a3c',
  '#': '#A9AFD6',
  '~': '#3CC8D8',
  T: '#1d5c3a',
  Y: '#5d8a3a',
  b: '#9fcf5a',
  '=': '#9a8f88',
  C: '#FFF4E0',
  M: '#f6d7a6',
  R: '#ffb3b3',
  S: '#b8d8ff',
  G: '#FFEB9E',
  F: '#ffffff',
  d: '#B98A5A',
  X: '#FF6B6B',
  P: '#B98A5A',
  B: '#ffffff',
};
const NOMBRE: Partial<Record<Casilla, string>> = { C: 'casa', M: 'museo', R: 'refugio', S: 'tienda', G: 'gimnasio', F: 'faro' };

const m = construirMundo(ISLA_1);
const margen = 2;
const w = (m.ancho + margen * 2) * T;
const h = (m.alto + margen * 2) * T + 100;
const px = (x: number) => (x + margen) * T;
const partes: string[] = [];
partes.push(`<rect width="${w}" height="${h}" fill="#bfeef3"/>`);
for (const [k, cm] of m.casillas) {
  const [x, y] = deClave(k);
  partes.push(`<rect x="${px(x)}" y="${px(y)}" width="${T}" height="${T}" fill="${COLOR[cm.c]}"/>`);
  // Altura: cuanto más bajo, más sombra; y una línea donde cambia, como las curvas de nivel.
  if (cm.c !== '~' && cm.h < 4) partes.push(`<rect x="${px(x)}" y="${px(y)}" width="${T}" height="${T}" fill="#2b2340" opacity="${(4 - cm.h) * 0.035}"/>`);
  const norte = m.casillas.get(clave(x, y - 1));
  if (norte && norte.h !== cm.h) partes.push(`<path d="M${px(x)} ${px(y)}h${T}" stroke="#3b2a20" stroke-width="1.5"/>`);
  const oeste = m.casillas.get(clave(x - 1, y));
  if (oeste && oeste.h !== cm.h) partes.push(`<path d="M${px(x)} ${px(y)}v${T}" stroke="#3b2a20" stroke-width="1.5"/>`);
  if (cm.c === 'X') partes.push(`<path d="M${px(x)} ${px(y) + T}L${px(x) + T} ${px(y)}" stroke="#fff" stroke-width="2"/>`);
}
// Bordes de los edificios y su nombre.
for (const z of ISLA_1.zonas) {
  for (const e of edificios(m, z.id)) {
    const xs = e.casillas.map((c) => deClave(c)[0]);
    const ys = e.casillas.map((c) => deClave(c)[1]);
    const x0 = Math.min(...xs);
    const y0 = Math.min(...ys);
    partes.push(
      `<rect x="${px(x0)}" y="${px(y0)}" width="${e.ancho * T}" height="${e.fondo * T}" fill="none" stroke="#3b2a20" stroke-width="1.5"/>`,
    );
    const nombre = NOMBRE[e.tipo];
    if (nombre && e.ancho >= 3) {
      partes.push(
        `<text x="${px(x0) + (e.ancho * T) / 2}" y="${px(y0) + (e.fondo * T) / 2 + 4}" font-size="9" text-anchor="middle" fill="#3b2a20">${nombre}</text>`,
      );
    }
  }
  // Nombre de la zona y su borde.
  const zw = z.mapa[0].length;
  const zh = z.mapa.length;
  partes.push(
    `<rect x="${px(z.origen.x)}" y="${px(z.origen.y)}" width="${zw * T}" height="${zh * T}" fill="none" stroke="#3b2a20" stroke-dasharray="4 3"/>`,
  );
  partes.push(
    `<text x="${px(z.origen.x) + 4}" y="${px(z.origen.y) - 4}" font-size="12" font-weight="700" fill="#3b2a20">${z.nombre}</text>`,
  );
  // Personajes y lo que ven los entrenadores.
  for (const p of z.personajes) {
    for (const v of vision(m, z.id, p)) {
      const [vx, vy] = deClave(v);
      partes.push(`<rect x="${px(vx) + 2}" y="${px(vy) + 2}" width="${T - 4}" height="${T - 4}" fill="#FF6B6B" opacity="0.45"/>`);
    }
    const [cx, cy] = deClave(enIsla(m, z.id, p.x, p.y));
    const color = p.entrenador ? (p.entrenador.obligatorio ? '#c0392b' : '#e67e22') : '#6B7BB8';
    partes.push(`<circle cx="${px(cx) + T / 2}" cy="${px(cy) + T / 2}" r="${T / 2 - 1}" fill="${color}" stroke="#fff" stroke-width="1.5"/>`);
  }
}
for (const k of m.objetos.keys()) {
  const [ox, oy] = deClave(k);
  partes.push(`<circle cx="${px(ox) + T / 2}" cy="${px(oy) + T / 2}" r="${T / 3}" fill="#FFEB3B" stroke="#3b2a20" stroke-width="1.5"/>`);
}
const [ix, iy] = deClave(enIsla(m, ISLA_1.inicio.zona, ISLA_1.inicio.x, ISLA_1.inicio.y));
partes.push(`<path d="M${px(ix) + T / 2} ${px(iy) + 1}l5 ${T - 2}h-10z" fill="#FF6B6B" stroke="#3b2a20"/>`);
// Leyenda.
const ly = h - 84;
const leyenda: [string, string][] = [
  ['#7ED6A5', 'hierba corta'],
  ['#b58a5e', 'tierra'],
  ['#5b555a', 'arena negra'],
  ['#E8B878', 'camino'],
  ['#57b86e', 'hierba alta'],
  ['#8a4a3c', 'malpaís'],
  ['#FF6B6B', 'paso cerrado'],
  ['#c0392b', 'entrenador obligatorio'],
  ['#e67e22', 'entrenador opcional'],
  ['#6B7BB8', 'personaje'],
  ['#FFEB3B', 'objeto'],
];
leyenda.forEach(([c, t], i) => {
  const x = 10 + (i % 4) * 190;
  const y = ly + Math.floor(i / 4) * 22;
  partes.push(`<rect x="${x}" y="${y}" width="14" height="14" fill="${c}" stroke="#3b2a20" stroke-width="0.5"/>`);
  partes.push(`<text x="${x + 20}" y="${y + 11}" font-size="12" fill="#3b2a20">${t}</text>`);
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="system-ui, sans-serif">${partes.join('')}</svg>`;
const salida = process.argv[2] ?? 'isla-1-casillas.svg';
writeFileSync(salida, svg);
console.log(`Mapa escrito en ${salida} (${m.ancho} × ${m.alto} casillas).`);
