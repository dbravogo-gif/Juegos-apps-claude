import Phaser from 'phaser';
import type { Zona } from '../core/mundo';

// Aspecto de las casillas con los tilesets del paquete Ninja Adventure (CC0, ver
// `src/assets/LEEME.md`). Cada carácter de la leyenda (`src/data/casillas.ts`) se convierte en
// una o dos capas de suelo y, a veces, un objeto más alto que la casilla (árboles, columnas,
// estanterías) que tapa a quien pase por detrás. Los bordes de caminos, acequias, tejados y
// muros se eligen mirando las casillas vecinas.

/** Lado de un tile en el paquete, en píxeles. */
const PX = 16;
/** Se escala a un número entero de veces para que el pixel art quede nítido. */
export const ESCALA = 5;
export const TAM_CASILLA = PX * ESCALA;

const URLS = import.meta.glob('../assets/mundo/*.png', { eager: true, query: '?url', import: 'default' }) as Record<
  string,
  string
>;

const HOJAS = ['suelo', 'agua', 'naturaleza', 'casas', 'elementos', 'interior_suelo', 'interior_pared', 'campamento'] as const;
type Hoja = (typeof HOJAS)[number];

const claveHoja = (h: Hoja) => `mundo-${h}`;
export const CLAVE_SOMBRA = 'mundo-sombra';

const urlDe = (nombre: string) => URLS[`../assets/mundo/${nombre}.png`];

export function cargarHojasMundo(load: Phaser.Loader.LoaderPlugin): void {
  for (const h of HOJAS) load.image(claveHoja(h), urlDe(h));
  load.image(CLAVE_SOMBRA, urlDe('sombra'));
}

export function prepararHojasMundo(scene: Phaser.Scene): void {
  for (const clave of [...HOJAS.map(claveHoja), CLAVE_SOMBRA]) {
    scene.textures.get(clave).setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
}

/** Un trozo de una hoja: columna y fila en tiles, y tamaño en tiles (1 × 1 si no se dice). */
interface Pieza {
  hoja: Hoja;
  c: number;
  f: number;
  w?: number;
  h?: number;
}

interface Dibujo {
  suelo: Pieza[];
  /** Algo más alto que la casilla: se apoya en su borde inferior y se ordena por profundidad. */
  objeto?: Pieza;
}

const p = (hoja: Hoja, c: number, f: number, w = 1, h = 1): Pieza => ({ hoja, c, f, w, h });

// ---------- Piezas del paquete ----------

const HIERBA = p('suelo', 0, 12);
const HIERBA_VARIANTES = [p('suelo', 1, 12), p('suelo', 2, 12), p('suelo', 3, 12), p('suelo', 4, 12)];
const HIERBA_ALTA = p('naturaleza', 7, 11);
const FLORES = [p('naturaleza', 0, 11), p('naturaleza', 1, 11)];
const EMPEDRADO = p('interior_suelo', 1, 13);
const SUELO_INTERIOR = p('interior_suelo', 12, 1);
const ALFOMBRA = p('interior_suelo', 5, 7);
const PUENTE = p('agua', 1, 13);
const ARCO = p('casas', 9, 3);
const PUERTA_CASA = p('casas', 13, 2);
const PUERTA_TIENDA = p('campamento', 5, 2);
const BARRILES = p('casas', 16, 15);
const ARBOLES = [p('naturaleza', 16, 0, 2, 2), p('naturaleza', 18, 0, 2, 2)];
/** Árbol de una casilla, para no tapar caminos y puertas con la copa. */
const ARBUSTO = p('naturaleza', 10, 9);
const OLIVO = p('naturaleza', 6, 8, 2, 2);
const COLUMNA = p('casas', 0, 15, 1, 2);
const ESTANTERIA = p('elementos', 3, 7, 1, 2);
const MURO_HORIZONTAL = p('casas', 10, 9);
const MURO_VERTICAL = p('casas', 11, 9);

/** Esquina superior izquierda de los bloques de autotile (3 × 3, tira vertical, tira horizontal). */
const BLOQUE_CAMINO = { hoja: 'suelo' as Hoja, c: 0, f: 7 };
const BLOQUE_ACEQUIA = { hoja: 'agua' as Hoja, c: 0, f: 6 };
const BLOQUE_FUENTE = { hoja: 'agua' as Hoja, c: 0, f: 0 };

/** Marcos de pared de interior (5 × 5): madera, estuco y lona. */
const MARCOS: Record<string, { c: number; f: number }> = { W: { c: 0, f: 6 }, Z: { c: 0, f: 0 }, L: { c: 5, f: 0 } };

// ---------- Vecinos ----------

const FAMILIA_CAMINO = new Set(['.', 'S', 'G', '=', 'P']);
const FAMILIA_ACEQUIA = new Set(['~', '=']);

/** Número fijo por casilla, para variar la hierba o los árboles sin azar. */
function ruido(x: number, y: number): number {
  return ((x * 73856093) ^ (y * 19349663)) >>> 0;
}

/**
 * Elige el tile de un bloque de autotile según qué vecinos son de la misma familia. Los bloques del
 * paquete son un 3 × 3 (esquinas, bordes y centro), una tira vertical a su derecha y una tira
 * horizontal debajo, con la pieza suelta al final.
 */
function autotile(b: { hoja: Hoja; c: number; f: number }, u: boolean, d: boolean, l: boolean, r: boolean): Pieza {
  const { c, f } = b;
  if (!l && !r) {
    if (u && d) return p(b.hoja, c + 3, f + 1);
    if (d) return p(b.hoja, c + 3, f);
    if (u) return p(b.hoja, c + 3, f + 2);
    return p(b.hoja, c + 3, f + 3);
  }
  if (!u && !d) return p(b.hoja, l && r ? c + 1 : l ? c + 2 : c, f + 3);
  return p(b.hoja, !l ? c : !r ? c + 2 : c + 1, !u ? f : !d ? f + 2 : f + 1);
}

function dibujoDe(zona: Zona, x: number, y: number): Dibujo {
  const alto = zona.mapa.length;
  const ancho = zona.mapa[0].length;
  // Fuera del mapa se considera que todo continúa, para que caminos y muros no se corten en el borde.
  const en = (dx: number, dy: number): string => {
    const nx = x + dx;
    const ny = y + dy;
    if (ny < 0 || ny >= alto || nx < 0 || nx >= ancho) return zona.mapa[y][x];
    return zona.mapa[ny][nx];
  };
  const c = en(0, 0);
  const vecinos = (familia: Set<string>) =>
    [familia.has(en(0, -1)), familia.has(en(0, 1)), familia.has(en(-1, 0)), familia.has(en(1, 0))] as const;
  const r = ruido(x, y);
  const hierba = r % 7 === 0 ? HIERBA_VARIANTES[r % HIERBA_VARIANTES.length] : HIERBA;
  const base = zona.interior ? SUELO_INTERIOR : hierba;

  if (zona.interior && MARCOS[c]) {
    const m = MARCOS[c];
    const col = x === 0 ? 0 : x === ancho - 1 ? 4 : 1;
    const fil = y === 0 ? 0 : y === alto - 1 ? 4 : 1;
    return { suelo: [base, p('interior_pared', m.c + col, m.f + fil)] };
  }

  switch (c) {
    case ',':
      return { suelo: [hierba] };
    case 'h':
      return { suelo: [hierba, HIERBA_ALTA] };
    case '*':
      return { suelo: [hierba, FLORES[r % FLORES.length]] };
    case '.':
    case 'G': {
      const [u, d, l, rr] = vecinos(FAMILIA_CAMINO);
      return { suelo: [autotile(BLOQUE_CAMINO, u, d, l, rr)] };
    }
    case 'S':
      return { suelo: [EMPEDRADO] };
    case '~': {
      const [u, d, l, rr] = vecinos(FAMILIA_ACEQUIA);
      return { suelo: [hierba, autotile(BLOQUE_ACEQUIA, u, d, l, rr)] };
    }
    case '=':
      return { suelo: [PUENTE] };
    case '#': {
      const junto = FAMILIA_CAMINO.has(en(-1, 0)) || FAMILIA_CAMINO.has(en(1, 0));
      return junto ? { suelo: [hierba, ARBUSTO] } : { suelo: [hierba], objeto: ARBOLES[r % ARBOLES.length] };
    }
    case 'o':
      return { suelo: [hierba], objeto: OLIVO };
    case 'T': {
      const izq = en(-1, 0) !== 'T';
      const der = en(1, 0) !== 'T';
      const col = izq ? 12 : der ? 15 : 13 + (x % 2);
      return { suelo: [hierba, p('casas', col, en(0, -1) === 'T' ? 1 : 0)] };
    }
    case 'L': {
      const col = en(-1, 0) !== 'L' ? 4 : en(1, 0) !== 'L' ? 6 : 5;
      const fil = en(0, -1) !== 'L' ? 0 : en(0, 1) !== 'L' ? 2 : 1;
      return { suelo: [hierba, p('campamento', col, fil === 2 && col === 5 ? 1 : fil)] };
    }
    case 'M':
    case 'P': {
      if (en(0, -1) === 'T') {
        // Fachada de una casa: bajo el tejado.
        if (c === 'P') return { suelo: [hierba, PUERTA_CASA] };
        const izq = en(-1, 0) === 'M' || en(-1, 0) === 'P' ? false : true;
        const der = en(1, 0) === 'M' || en(1, 0) === 'P' ? false : true;
        return { suelo: [hierba, p('casas', izq ? 12 : der ? 15 : 14, 2)] };
      }
      if (c === 'P') {
        if (!zona.interior && (en(-1, 0) === 'L' || en(1, 0) === 'L')) return { suelo: [hierba, PUERTA_TIENDA] };
        return { suelo: [base, ARCO] };
      }
      const horizontal = en(-1, 0) === 'M' || en(1, 0) === 'M';
      const vertical = en(0, -1) === 'M' || en(0, 1) === 'M';
      return { suelo: [hierba, vertical && !horizontal ? MURO_VERTICAL : MURO_HORIZONTAL] };
    }
    case 'B':
      return { suelo: [SUELO_INTERIOR] };
    case 'R':
      return { suelo: [ALFOMBRA] };
    case 'X': {
      const col = en(-1, 0) !== 'X' ? 1 : en(1, 0) !== 'X' ? 4 : 2 + (x % 2);
      return { suelo: [base, p('elementos', col, 10)] };
    }
    case 'E':
      return { suelo: [base], objeto: ESTANTERIA };
    case 'K':
      return { suelo: [base, BARRILES] };
    case 'C':
      return { suelo: [base], objeto: COLUMNA };
    case 'A': {
      const fam = new Set(['A']);
      const [u, d, l, rr] = vecinos(fam);
      return { suelo: [base, autotile(BLOQUE_FUENTE, u, d, l, rr)] };
    }
    default:
      return { suelo: [base] };
  }
}

/** Nombre del frame de una pieza; lo crea en la textura la primera vez. */
function frameDe(scene: Phaser.Scene, pieza: Pieza): string {
  const nombre = `${pieza.c},${pieza.f},${pieza.w ?? 1},${pieza.h ?? 1}`;
  const textura = scene.textures.get(claveHoja(pieza.hoja));
  if (!textura.has(nombre)) {
    textura.add(nombre, 0, pieza.c * PX, pieza.f * PX, (pieza.w ?? 1) * PX, (pieza.h ?? 1) * PX);
  }
  return nombre;
}

/**
 * Dibuja la zona en `capa`. El suelo queda a profundidad −1. Los objetos altos, a la de su fila
 * más 0,9, para que tapen a quien esté justo detrás (al norte) y no a quien esté delante.
 */
export function dibujarZona(scene: Phaser.Scene, zona: Zona, capa: Phaser.GameObjects.Container): void {
  const t = TAM_CASILLA;
  zona.mapa.forEach((fila, y) => {
    for (let x = 0; x < fila.length; x++) {
      const dibujo = dibujoDe(zona, x, y);
      for (const pieza of dibujo.suelo) {
        capa.add(
          scene.add.image(x * t, y * t, claveHoja(pieza.hoja), frameDe(scene, pieza)).setOrigin(0).setScale(ESCALA).setDepth(-1),
        );
      }
      if (dibujo.objeto) {
        const o = dibujo.objeto;
        capa.add(
          scene.add
            .image(x * t + t / 2, (y + 1) * t, claveHoja(o.hoja), frameDe(scene, o))
            .setOrigin(0.5, 1)
            .setScale(ESCALA)
            .setDepth(y + 0.9),
        );
      }
    }
  });
}

const TINAJA = p('elementos', 1, 0);
const TINAJA_ABIERTA = p('elementos', 4, 0);

/** Recipiente registrable, apoyado en el borde inferior de su casilla. */
export function dibujarRecipiente(scene: Phaser.Scene, x: number, y: number, abierto: boolean): Phaser.GameObjects.Image {
  const pieza = abierto ? TINAJA_ABIERTA : TINAJA;
  return scene.add.image(x, y, claveHoja(pieza.hoja), frameDe(scene, pieza)).setOrigin(0.5, 1).setScale(ESCALA);
}

export function abrirRecipiente(figura: Phaser.GameObjects.Image): void {
  // Si la zona se ha vuelto a dibujar mientras tanto, la figura ya no existe.
  if (!figura.scene) return;
  figura.setFrame(frameDe(figura.scene, TINAJA_ABIERTA));
}
