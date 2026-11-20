// Genera el interior de un edificio a partir de su exterior (autor, 2026-11-10): las casas grandes
// por fuera lo son por dentro, y las de dos plantas tienen escalera. En algunas, juguetes delante
// que no dejan subir; en las demás se sube a un dormitorio (autor, 2026-11-19: «tampoco todas»).
// En el refugio y la tienda, la escalera es del personal: siempre tapada. Puro y determinista: la
// misma casa da siempre la misma sala. Las letras de los muebles, en LEYENDA (src/core/mundo.ts).

export type TipoSala = 'casa' | 'refugio' | 'tienda' | 'gimnasio' | 'museo' | 'bar';

export interface OpcionesInterior {
  tipo: TipoSala;
  /** Ancho de la fachada y fondo del edificio, en casillas. */
  ancho: number;
  fondo: number;
  plantas: 1 | 2;
  /** Cambia la colocación de los muebles entre casas iguales. */
  semilla: number;
  /** Si los juguetes tapan la escalera de una casa. Si no se dice, una de cada tres. */
  juguetes?: boolean;
}

/** El piso de arriba: el mapa y dónde se aparece al subir (delante del hueco, de espaldas a él). */
export interface PisoDeArriba {
  mapa: string[];
  llegada: Punto;
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
  /** Solo en el bar: el sitio de quien desayuna, junto a una mesa. */
  cliente: Punto | null;
  /** El piso de arriba, si la escalera no está tapada. */
  arriba: PisoDeArriba | null;
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
  const res: InteriorGenerado = { mapa: [], entrada: { x: cx, y: d }, residente: { x: cx, y: 2 }, estatuas: [], ordenador: null, cliente: null, arriba: null };
  const plantas = () => {
    pon(1, d - 1, 'v');
    pon(w, d - 1, 'v');
  };
  /** La escalera en una esquina del fondo; con `tapada`, juguetes delante que no dejan subir. */
  const escalera = (x: number, y: number, tapada = true) => {
    pon(x, y, 'e');
    if (tapada) pon(x, y + 1, 'j');
    else res.arriba = generarArriba(w, d, espejo ? w + 1 - x : x, op.semilla);
  };

  switch (op.tipo) {
    case 'casa': {
      pon(1, 1, 'l');
      if (w >= 7) pon(2, 1, 'l');
      if (op.plantas === 2) escalera(w, 1, op.juguetes ?? op.semilla % 3 === 0);
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
    case 'bar': {
      // La barra delante del fondo, con el camarero detrás y botellas en estanterías; dos mesas
      // junto a las paredes, y en una desayuna tu amigo (HISTORIA.md, el bar del principio).
      for (let x = cx - 2; x <= cx + 2; x++) if (x >= 1 && x <= w) g[2][x] = 'c';
      for (let x = 1; x <= w; x++) if (Math.abs(x - cx) > 2) g[1][x] = 'h';
      const fila = Math.max(3, d - 1);
      pon(1, fila, 'o');
      pon(w, fila, 'o');
      res.cliente = { x: espejo ? w - 1 : 2, y: fila };
      res.residente = { x: cx, y: 1 };
      break;
    }
    case 'museo': {
      // Cinco pedestales repartidos por el fondo (autor, 2026-11-13: se une una quinta inicial).
      // El del medio queda al final de la alfombra; los demás, fuera de su pasillo.
      for (let i = 0; i < 5; i++) {
        let x = Math.round(((i + 1) * (w + 1)) / 6);
        if (x === cx && i !== 2) x += i < 2 ? -1 : 1;
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

/**
 * El dormitorio de arriba, del mismo tamaño que la planta baja. El hueco de la escalera (`z`) queda
 * delante, en la columna de la escalera de abajo, y se aparece justo detrás de él mirando al norte:
 * así, si se sigue pulsando hacia arriba, se entra en el cuarto en vez de volver a bajar.
 */
function generarArriba(w: number, d: number, xEscalera: number, semilla: number): PisoDeArriba {
  const g: string[][] = Array.from({ length: d + 2 }, (_, y) => Array.from({ length: w + 2 }, (_, x) => (x === 0 || x === w + 1 || y === 0 || y === d + 1 ? '|' : 'm')));
  g[d][xEscalera] = 'z';
  const llegada = { x: xEscalera, y: d - 1 };
  // Los muebles, lejos del hueco: se refleja todo si la escalera está a la izquierda.
  const izquierda = xEscalera <= w / 2;
  const pon = (x: number, y: number, c: string) => {
    const xx = izquierda ? w + 1 - x : x;
    if (x < 1 || x > w || y < 1 || y > d || (xx === llegada.x && y === llegada.y)) return;
    if (g[y][xx] === 'm') g[y][xx] = c;
  };
  pon(1, 1, 'l');
  if (w >= 6) pon(3, 1, 'l');
  pon(w, 1, 'h');
  if (w >= 7 && semilla % 2 === 0) pon(w - 1, 1, 'h');
  pon(1, d, 'v');
  if (d >= 4) pon(1, Math.ceil(d / 2) + 1, 'o');
  if (w >= 6 && d >= 5) pon(Math.ceil(w / 2), Math.ceil(d / 2), 'j');
  return { mapa: g.map((f) => f.join('')), llegada };
}
