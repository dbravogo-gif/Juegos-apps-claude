// El plano de la isla: el mapa en 2D sacado de los datos del mundo (autor, 2026-11-11). Sirve
// para el mapa del juego y para revisar el diseño de nivel. Puro: no toca el DOM ni el reloj; lo
// dibuja `dibujo.ts`. Los colores del suelo son los mismos del 3D (`colorDeCasilla`), para que el
// mapa y la isla se reconozcan.

import { Color } from 'three/webgpu';
import { clave, edificios, type Casilla, type Mundo } from '../../core/mundo';
import { COLORES } from '../../arte/paleta';
import { alturaCara, colorDeCasilla, cumbres } from '../mundo/terreno';
import { claveMar, distanciasMar } from '../mundo/mar';

/** Casillas de mar alrededor de la isla. */
export const MARGEN_PLANO = 4;

/** Lo que se dibuja encima del color de cada casilla. */
export const Detalle = {
  Nada: 0,
  Arbol: 1,
  Hierba: 2,
  Malpais: 3,
  Colada: 4,
  Cono: 5,
  Cumbre: 6,
  Muro: 7,
} as const;
export type Detalle = (typeof Detalle)[keyof typeof Detalle];

export interface EdificioPlano {
  tipo: Casilla;
  /** Esquina de arriba a la izquierda y tamaño, en casillas del plano. */
  x: number;
  y: number;
  ancho: number;
  fondo: number;
  puertas: { x: number; y: number }[];
}

export interface EtiquetaPlano {
  zona: string;
  texto: string;
  /** Centro, en casillas del plano. */
  x: number;
  y: number;
}

export interface Plano {
  ancho: number;
  alto: number;
  /** Color de cada casilla, fila a fila, como 0xRRGGBB. */
  color: Uint32Array;
  /** Altura de la cara de arriba; NaN en el mar. Para el relieve. */
  altura: Float32Array;
  detalle: Uint8Array;
  /** Si la casilla es mar pegado a tierra: lleva espuma. */
  orilla: Uint8Array;
  edificios: EdificioPlano[];
  etiquetas: EtiquetaPlano[];
}

const DETALLE: Partial<Record<Casilla, Detalle>> = {
  T: Detalle.Arbol,
  Y: Detalle.Arbol,
  b: Detalle.Arbol,
  '"': Detalle.Hierba,
  ';': Detalle.Malpais,
  L: Detalle.Colada,
  Q: Detalle.Cono,
  '=': Detalle.Muro,
};

/** Del mar somero de la orilla al hondo: cuanto más lejos de la costa, más oscuro. */
function colorMar(d: number | undefined, c: Color): Color {
  const base = c.set(COLORES.aguaTurquesa);
  if (d === undefined || d >= 6) return base.lerp(new Color('#0E3F5C'), 0.35);
  if (d === 1) return base.lerp(new Color('#FFFFFF'), 0.22);
  if (d === 2) return base.lerp(new Color('#FFFFFF'), 0.1);
  return base.lerp(new Color('#0E3F5C'), (d - 3) * 0.1);
}

/** El plano de una isla. Pasa a coordenadas del plano sumando MARGEN_PLANO. */
export function planoIsla(m: Mundo): Plano {
  const M = MARGEN_PLANO;
  const ancho = m.ancho + 2 * M;
  const alto = m.alto + 2 * M;
  const n = ancho * alto;
  const plano: Plano = {
    ancho,
    alto,
    color: new Uint32Array(n),
    altura: new Float32Array(n).fill(Number.NaN),
    detalle: new Uint8Array(n),
    orilla: new Uint8Array(n),
    edificios: [],
    etiquetas: [],
  };
  const cumbre = cumbres(m);
  const mar = distanciasMar(m, cumbre);
  const c = new Color();
  for (let py = 0; py < alto; py++) {
    for (let px = 0; px < ancho; px++) {
      const [x, y] = [px - M, py - M];
      const i = py * ancho + px;
      const k = x >= 0 && y >= 0 ? clave(x, y) : -1;
      const cm = k >= 0 ? m.casillas.get(k) : undefined;
      const h = k >= 0 ? cumbre.get(k) : undefined;
      if (h !== undefined) {
        plano.color[i] = colorDeCasilla(m, k, true, c).getHex();
        plano.altura[i] = alturaCara(undefined, h);
        plano.detalle[i] = Detalle.Cumbre;
      } else if (cm && cm.c !== '~' && cm.c !== 'B') {
        plano.color[i] = colorDeCasilla(m, k, false, c).getHex();
        plano.altura[i] = alturaCara(cm, undefined);
        plano.detalle[i] = DETALLE[cm.c] ?? Detalle.Nada;
      } else {
        const d = mar.get(claveMar(x, y))?.d;
        plano.color[i] = colorMar(d, c).getHex();
        plano.orilla[i] = d === 1 ? 1 : 0;
      }
    }
  }
  for (const [id, z] of m.zonas) {
    for (const e of edificios(m, id)) {
      const xs = e.casillas.map((k) => k % 4096);
      const ys = e.casillas.map((k) => Math.floor(k / 4096));
      plano.edificios.push({
        tipo: e.tipo,
        x: Math.min(...xs) + M,
        y: Math.min(...ys) + M,
        ancho: e.ancho,
        fondo: e.fondo,
        puertas: e.puertas.map((k) => ({ x: (k % 4096) + M, y: Math.floor(k / 4096) + M })),
      });
    }
    const filas = z.mapa.length;
    const columnas = Math.max(...z.mapa.map((f) => f.length));
    plano.etiquetas.push({ zona: id, texto: z.nombre, x: z.origen.x + columnas / 2 + M, y: z.origen.y + filas / 2 + M });
  }
  return plano;
}
