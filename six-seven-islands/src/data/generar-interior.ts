// Genera el interior de un edificio a partir de su exterior (autor, 2026-11-10): las casas grandes
// por fuera lo son por dentro, y las de dos plantas tienen escalera, con juguetes delante que no
// dejan subir (así no hay que hacer el piso de arriba). Puro y determinista: la misma casa da
// siempre la misma sala. Las letras de los muebles, en LEYENDA (src/core/mundo.ts).

export type TipoSala = 'casa' | 'refugio' | 'tienda' | 'gimnasio' | 'museo';

export interface OpcionesInterior {
  tipo: TipoSala;
  /** Ancho de la fachada y fondo del edificio, en casillas. */
  ancho: number;
  fondo: number;
  plantas: 1 | 2;
  /** Cambia la colocación de los muebles entre casas iguales. */
  semilla: number;
}

export interface Punto {
  x: number;
  y: number;
}

export interface InteriorGenerado {
  mapa: string[];
  /** Donde aparece el jugador al entrar: justo dentro de la puerta. */
  entrada: Punto;
  /** Quien vive o trabaja aquí (en la tienda y el refugio, detrás del mostrador). */
  residente: Punto;
  /** Solo en el museo: los pedestales, de izquierda a derecha, y su ordenador. */
  estatuas: Punto[];
  ordenador: Punto | null;
}

/** El tamaño de dentro (sin paredes), proporcional al de fuera. */
export function tamanoInterior(ancho: number, fondo: number): { w: number; d: number } {
  const w = Math.min(15, Math.max(5, Math.round(ancho * 1.7)));
  const d = Math.min(10, Math.max(4, Math.round(fondo * 1.5) + 1));
  return { w, d };
}

export function generarInterior(op: OpcionesInterior): InteriorGenerado {
  const { w, d } = tamanoInterior(op.ancho, op.fondo);
  // Rejilla con paredes alrededor; dentro, x de 1 a w e y de 1 a d.
  const g: string[][] = Array.from({ length: d + 2 }, (_, y) => Array.from({ length: w + 2 }, (_, x) => (x === 0 || x === w + 1 || y === 0 || y === d + 1 ? '|' : 'm')));
  const cx = Math.floor((w + 2) / 2);
  g[d + 1][cx] = 'd';
  const espejo = op.semilla % 2 === 1;
  /** Pone un mueble; con espejo, en el lado contrario. Nunca en el pasillo de la puerta. */
  const pon = (x: number, y: number, c: string) => {
    const xx = espejo ? w + 1 - x : x;
    if (xx === cx || x < 1 || x > w || y < 1 || y > d) return;
    if (g[y][xx] === 'm') g[y][xx] = c;
  };
  const res: InteriorGenerado = { mapa: [], entrada: { x: cx, y: d }, residente: { x: cx, y: 2 }, estatuas: [], ordenador: null };
  const plantas = () => {
    pon(1, d - 1, 'v');
    pon(w, d - 1, 'v');
  };
  /** La escalera en una esquina del fondo y los juguetes delante, que no dejan subir. */
  const escalera = (x: number, y: number) => {
    pon(x, y, 'e');
    pon(x, y + 1, 'j');
  };

  switch (op.tipo) {
    case 'casa': {
      pon(1, 1, 'l');
      if (w >= 7) pon(2, 1, 'l');
      if (op.plantas === 2) escalera(w, 1);
      else pon(w, 1, 'h');
      if (w >= 6) pon(w - 1, 1, 'n');
      if (d >= 5 && cx - 2 >= 2) pon(cx - 2, Math.ceil(d / 2), 'o');
      if (w >= 7 && d >= 5) pon(w, Math.ceil(d / 2) + 1, 'q');
      plantas();
      res.residente = { x: espejo ? cx - 1 : cx + 1, y: 2 };
      break;
    }
    case 'refugio': {
      // Mostrador de pared a pared: a la enfermera se le habla por encima.
      for (let x = 1; x <= w; x++) g[2][x] = 'c';
      pon(1, 1, 'h');
      pon(w, 1, 'h');
      if (d >= 6) pon(1, d - 2, 'l');
      if (op.plantas === 2 && d >= 5) escalera(w, 3);
      plantas();
      res.residente = { x: cx, y: 1 };
      break;
    }
    case 'tienda': {
      // Mostrador en medio y estanterías en todo el fondo: detrás solo cabe el tendero.
      for (let x = cx - 1; x <= cx + 1; x++) g[2][x] = 'c';
      for (let x = 1; x <= w; x++) if (Math.abs(x - cx) > 1) g[1][x] = 'h';
      if (d >= 5) {
        pon(1, 3, 'h');
        pon(w, 3, 'h');
      }
      if (op.plantas === 2 && d >= 6) escalera(w, 4);
      plantas();
      res.residente = { x: cx, y: 1 };
      break;
    }
    case 'gimnasio': {
      pon(1, 1, 'v');
      pon(w, 1, 'v');
      plantas();
      const cy = Math.ceil(d / 2);
      pon(1, cy, 'q');
      pon(w, cy, 'q');
      res.residente = { x: cx, y: 2 };
      break;
    }
    case 'museo': {
      // Cuatro pedestales repartidos por el fondo, sin tapar el pasillo de la alfombra.
      for (let i = 0; i < 4; i++) {
        let x = Math.round(((i + 1) * (w + 1)) / 5);
        if (x === cx) x += i < 2 ? -1 : 1;
        res.estatuas.push({ x, y: 2 });
      }
      g[Math.min(4, d - 1)][1] = 'k';
      res.ordenador = { x: 2, y: Math.min(4, d - 1) };
      g[Math.min(4, d - 1)][w] = 'h';
      plantas();
      res.residente = { x: cx, y: Math.min(4, d - 1) };
      break;
    }
  }
  res.mapa = g.map((f) => f.join(''));
  return res;
}
