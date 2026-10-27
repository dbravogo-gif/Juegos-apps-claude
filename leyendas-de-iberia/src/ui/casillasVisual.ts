import Phaser from 'phaser';
import type { EstiloZona, Zona } from '../core/mundo';
import hoja from '../assets/mundo/iberia.json';
import urlHoja from '../assets/mundo/iberia.png?url';

// Aspecto de las casillas con el tileset propio del juego (`arte/mapa/tileset.py`, ver
// `src/assets/LEEME.md`), al estilo de los juegos de criaturas de GBA.
//
// - El suelo de cada zona se pinta una vez en un lienzo a tamaño real (16 px por casilla) y se
//   muestra ampliado: una sola imagen por zona. Caminos, agua y alfombras se componen con cuatro
//   cuartos de 8 × 8 según sus vecinos, como los autotiles de RPG Maker.
// - Lo que es más alto que una casilla (árboles, columnas, estanterías, banderolas, la fuente) va
//   aparte y se ordena por profundidad, para tapar a quien pase por detrás.
// - El agua se mueve repintando sus casillas en el lienzo.

const PX = hoja.px;
/** Se escala a un número entero de veces para que el pixel art quede nítido. */
export const ESCALA = 5;
export const TAM_CASILLA = PX * ESCALA;

const CLAVE = 'mundo-iberia';
const PIEZAS: Record<string, number[]> = hoja.piezas;

export function cargarHojasMundo(load: Phaser.Loader.LoaderPlugin): void {
  load.image(CLAVE, urlHoja);
}

export function prepararHojasMundo(scene: Phaser.Scene): void {
  const textura = scene.textures.get(CLAVE);
  textura.setFilter(Phaser.Textures.FilterMode.NEAREST);
  for (const [nombre, [x, y, w, h]] of Object.entries(PIEZAS)) textura.add(nombre, 0, x, y, w, h);
}

/** Imagen de una pieza del tileset, ya ampliada. */
export function imagenPieza(scene: Phaser.Scene, nombre: string, x: number, y: number): Phaser.GameObjects.Image {
  return scene.add.image(x, y, CLAVE, nombre).setScale(ESCALA);
}

// ---------- Familias de casillas ----------

const CAMINO = new Set(['.', 'S', 'G', '=', 'P']);
/** Con quién se junta el camino sin dejar borde: también la fuente de una plaza. */
const JUNTO_CAMINO = new Set([...CAMINO, 'A']);
const JUNTO_EMPEDRADO = new Set(['S', 'G', 'P', 'A']);
const ACEQUIA = new Set(['~', '=', 'O', 'N', 'V', 'x']);
const MURALLA = new Set(['M', 'G', 'P']);
const PAREDES = new Set(['W', 'Z', 'L']);

/** Número fijo por casilla, para variar la hierba o los adornos sin azar. */
function ruido(x: number, y: number): number {
  return ((x * 73856093) ^ (y * 19349663)) >>> 0;
}

function estiloDe(zona: Zona): EstiloZona {
  return zona.estilo ?? (zona.interior ? 'meson' : 'campo');
}

const SUELO_INTERIOR: Record<EstiloZona, string> = {
  campo: 'suelo.tablas',
  pueblo: 'suelo.tablas',
  alhambra: 'suelo.marmol',
  meson: 'suelo.barro',
  pabellon: 'suelo.tablas',
  patio: 'suelo.marmol',
  meseta: 'suelo.tablas',
  toledo: 'suelo.losas',
  alcazar: 'suelo.losas',
  sierra: 'suelo.tablas',
  escorial: 'suelo.losas',
  sevilla: 'suelo.barro',
  galeon: 'cubierta.seca',
};

/** Estilos con muralla de ladrillo y cipreses en vez de tapial y árboles redondos. */
const ESTILO_LADRILLO = new Set<EstiloZona>(['alhambra', 'toledo']);

/** Lectura de la zona alrededor de una casilla. Fuera del mapa, `fuera`. */
class Vecindad {
  constructor(
    private readonly zona: Zona,
    readonly x: number,
    readonly y: number,
  ) {}

  en(dx: number, dy: number, fuera = ''): string {
    const fila = this.zona.mapa[this.y + dy];
    const c = fila?.[this.x + dx];
    return c ?? fuera;
  }

  /** ¿Es de la familia la casilla vecina? Fuera del mapa cuenta como `fuera`. */
  es(familia: Set<string>, dx: number, dy: number, fuera: boolean): boolean {
    const c = this.en(dx, dy);
    return c === '' ? fuera : familia.has(c);
  }

  /** ¿Es pared de casa (fachada encalada)? La que tiene un tejado justo encima. */
  fachada(dx: number): boolean {
    return (this.en(dx, 0) === 'M' || this.en(dx, 0) === 'P') && this.en(dx, -1) === 'T';
  }
}

/** Una capa del suelo de una casilla: una pieza entera o un material que se junta con sus vecinos. */
type Capa = { pieza: string } | { material: string; familia: Set<string>; fuera: boolean };

const pieza = (nombre: string): Capa => ({ pieza: nombre });
const bits = (...b: boolean[]) => b.map((x) => (x ? '1' : '0')).join('');

/** Capas del suelo de una casilla, de abajo arriba. `f` es el fotograma del agua. */
function capasDe(zona: Zona, x: number, y: number, f: number): Capa[] {
  const v = new Vecindad(zona, x, y);
  const c = v.en(0, 0);
  const estilo = estiloDe(zona);
  const r = ruido(x, y);
  const variante = r % 11 === 0 ? 1 : r % 13 === 0 ? 2 : r % 7 === 0 ? 3 : 0;
  const hierba = `${estilo === 'meseta' ? 'hierba_meseta' : 'hierba'}.${variante}`;
  const base = zona.interior ? SUELO_INTERIOR[estilo] : hierba;
  const capas: Capa[] = [pieza(base)];

  if (zona.interior) {
    if (PAREDES.has(c)) {
      const pos = y > 0 ? 'borde' : x === 0 ? 'esquina_i' : x === zona.mapa[0].length - 1 ? 'esquina_d' : 'cara';
      const material = c === 'Z' ? 'patio' : c === 'L' ? 'pabellon' : estilo === 'alcazar' ? 'alcazar' : 'meson';
      capas.push(pieza(`pared.${material}.${pos}`));
      return capas;
    }
    if (c === 'P') return [pieza(`felpudo.${base.split('.')[1]}`)];
  } else if (CAMINO.has(c) || c === 'A') {
    // La fuente de una plaza se asienta sobre el empedrado.
    capas.push({ material: 'camino', familia: JUNTO_CAMINO, fuera: true });
    if (c === 'S' || c === 'A') capas.push({ material: 'empedrado', familia: JUNTO_EMPEDRADO, fuera: true });
  }

  switch (c) {
    case 'h':
      capas.push(pieza('hierba_alta'));
      break;
    case 'w':
      capas.push(pieza('trigal'));
      break;
    case '*':
      capas.push(pieza(`flores.${r % 3}`));
      break;
    case '~':
    case 'O':
    case 'N':
    case 'x':
      capas.push({ material: `acequia.${f}`, familia: ACEQUIA, fuera: true });
      // Donde cae una cascada, espuma.
      if (v.en(0, -1) === 'V') capas.push(pieza(`espuma.${f}`));
      break;
    case 'V':
      capas.push(pieza(`cascada.${f}`));
      break;
    case 'D':
      capas.push(pieza('cubierta.mojada'));
      break;
    case 'k':
      capas.push(pieza(v.en(0, -1) === 'k' || v.en(0, -1) === 'V' ? 'risco.medio' : 'risco.alto'));
      break;
    case '=': {
      // Sobre un agua que corre de este a oeste, el puente va de norte a sur, y al revés.
      const deLado = v.es(ACEQUIA, -1, 0, false) || v.es(ACEQUIA, 1, 0, false);
      capas.push({ material: `acequia.${f}`, familia: ACEQUIA, fuera: true }, pieza(deLado ? 'puente' : 'puente.horizontal'));
      break;
    }
    case 'A':
      capas.push({ material: `fuente.${f}`, familia: new Set(['A']), fuera: false });
      break;
    case 'R':
      capas.push({ material: 'alfombra', familia: new Set(['R']), fuera: false });
      break;
    case 'K':
      capas.push(pieza('barril'));
      break;
    case 'r':
      capas.push(pieza('roca'));
      break;
    case 'u':
      capas.push({ material: 'huerto', familia: new Set(['u']), fuera: false });
      break;
    case 'f':
    case 'v': {
      const igual = (dx: number, dy: number) => v.en(dx, dy) === c;
      capas.push(pieza(`${c === 'f' ? 'valla' : 'seto'}.${bits(igual(0, -1), igual(0, 1), igual(-1, 0), igual(1, 0))}`));
      break;
    }
    case 'X': {
      const adorno = r % 5 === 0 ? 1 : r % 7 === 0 ? 2 : 0;
      capas.push(pieza(`mostrador.${bits(v.en(-1, 0) === 'X', v.en(1, 0) === 'X')}.${adorno}`));
      break;
    }
    case 'T':
      capas.push(pieza(`tejado.${bits(v.en(0, -1) === 'T', v.en(0, 1) === 'T', v.en(-1, 0) === 'T', v.en(1, 0) === 'T')}`));
      break;
    case 'L': {
      const lona = new Set(['L', 'P']);
      capas.push(pieza(`lona.${bits(v.en(0, -1) === 'L', lona.has(v.en(0, 1)), lona.has(v.en(-1, 0)), lona.has(v.en(1, 0)))}`));
      break;
    }
    case 'M':
    case 'P':
    case 'G':
      capas.push(...muro(v, c, estilo));
      break;
  }
  return capas;
}

function muro(v: Vecindad, c: string, estilo: EstiloZona): Capa[] {
  if (v.fachada(0)) {
    const izq = v.fachada(-1);
    const der = v.fachada(1);
    const junto = v.en(-1, 0) === 'P' || v.en(1, 0) === 'P';
    const hueco = c === 'P' ? 'puerta' : !junto && v.x % 2 === 1 ? 'ventana' : 'lisa';
    return [pieza(`fachada.${hueco}.${bits(izq, der)}`)];
  }
  if (c === 'P' && (v.en(-1, 0) === 'L' || v.en(1, 0) === 'L')) {
    return [pieza(`lona.puerta.${bits(v.en(-1, 0) === 'L', v.en(1, 0) === 'L')}`)];
  }
  const horizontal = v.es(MURALLA, -1, 0, false) || v.es(MURALLA, 1, 0, false);
  const vertical = v.es(MURALLA, 0, -1, false) || v.es(MURALLA, 0, 1, false);
  // Un portón entre árboles no es más que camino.
  if (c === 'G' && !horizontal) return [];
  const piedra = ESTILO_LADRILLO.has(estilo) ? 'roja' : estilo === 'escorial' ? 'granito' : 'tapial';
  const forma = c === 'G' ? 'puerta' : c === 'P' ? 'arco' : horizontal || !vertical ? 'horizontal' : 'vertical';
  return [pieza(`muro.${piedra}.${forma}`)];
}

// ---------- Pintar el suelo ----------

const FORMA_CUARTO = (h: boolean, v: boolean, d: boolean) =>
  !h && !v ? 'esquina' : h && !v ? 'horizontal' : !h && v ? 'vertical' : d ? 'lleno' : 'interior';

function pintarCasilla(ctx: CanvasRenderingContext2D, img: CanvasImageSource, zona: Zona, x: number, y: number, f: number): void {
  const v = new Vecindad(zona, x, y);
  for (const capa of capasDe(zona, x, y, f)) {
    if ('pieza' in capa) {
      const [px, py] = PIEZAS[capa.pieza];
      ctx.drawImage(img, px, py, PX, PX, x * PX, y * PX, PX, PX);
      continue;
    }
    const igual = (dx: number, dy: number) => v.es(capa.familia, dx, dy, capa.fuera);
    for (const [qx, qy] of [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]) {
      const sx = qx ? 1 : -1;
      const sy = qy ? 1 : -1;
      const forma = FORMA_CUARTO(igual(sx, 0), igual(0, sy), igual(sx, sy));
      const [px, py] = PIEZAS[`${capa.material}.${forma}`];
      const m = PX / 2;
      ctx.drawImage(img, px + qx * m, py + qy * m, m, m, x * PX + qx * m, y * PX + qy * m, m, m);
    }
  }
}

const ANIMADAS = new Set(['~', '=', 'O', 'A', 'V', 'N']);

// ---------- Objetos altos ----------

interface Objeto {
  nombre: string;
  /** Punto de apoyo, en píxeles del tileset: centro abajo. */
  x: number;
  y: number;
  profundidad: number;
  origenX?: number;
  /** Se anima con el agua: un nombre de pieza por fotograma. */
  fotogramas?: string[];
}

/** Piezas que ocupan un bloque de casillas del mismo carácter. */
const PIEZA_GRANDE: Record<string, string> = { g: 'giralda', t: 'torre_oro', x: 'galeon' };

function objetosDe(zona: Zona): Objeto[] {
  const estilo = estiloDe(zona);
  const lista: Objeto[] = [];
  const apoyo = (nombre: string, x: number, y: number, extra = 0.9): Objeto => ({
    nombre,
    x: x * PX + PX / 2,
    y: (y + 1) * PX,
    profundidad: y + extra,
  });
  zona.mapa.forEach((fila, y) => {
    for (let x = 0; x < fila.length; x++) {
      const v = new Vecindad(zona, x, y);
      const c = fila[x];
      if (c === '#') {
        // Junto a un camino, un arbusto: la copa de un árbol taparía el paso.
        const junto = v.es(CAMINO, -1, 0, false) || v.es(CAMINO, 1, 0, false);
        const arbol = ESTILO_LADRILLO.has(estilo)
          ? 'cipres'
          : junto
            ? 'arbusto'
            : estilo === 'meseta'
              ? 'encina'
              : estilo === 'sierra'
                ? 'pino'
                : estilo === 'sevilla'
                  ? 'naranjo'
                  : 'arbol';
        lista.push(apoyo(arbol, x, y));
      } else if (c === 'o') lista.push(apoyo('olivo', x, y));
      else if (c === 'Y') lista.push(apoyo('armadura', x, y));
      else if (c === 'J') lista.push(apoyo('armero', x, y));
      else if (c === 'n') lista.push(apoyo('naranjo', x, y));
      else if (c === 'Q') lista.push(apoyo('pozo', x, y));
      else if (c === 'C') lista.push(apoyo('columna', x, y));
      else if (c === 'E') lista.push(apoyo('estanteria', x, y));
      else if (c === 'I') lista.push(apoyo('atalaya', x, y));
      else if (c === 'U') lista.push(apoyo('mastil', x, y));
      else if (c === 'H') lista.push(apoyo('canon', x, y));
      else if (c === 's') lista.push(apoyo('sillares', x, y));
      else if (c === 'a') lista.push(apoyo('andamio', x, y));
      else if (c in PIEZA_GRANDE && v.en(-1, 0) !== c && v.en(0, 1) !== c) {
        // Una pieza grande ocupa un bloque de casillas: se pone una vez, centrada en el bloque y
        // apoyada en su fila de abajo.
        let ancho = 1;
        while (v.en(ancho, 0) === c) ancho++;
        lista.push({ nombre: PIEZA_GRANDE[c], x: (x + ancho / 2) * PX, y: (y + 1) * PX, profundidad: y + 0.9 });
      }
      else if (c === 'N') lista.push({ ...apoyo('noria.0', x, y), fotogramas: [0, 1, 2, 3].map((f) => `noria.${f}`) });
      else if (c === 'h' || c === 'w') {
        const delante = c === 'h' ? 'hierba_alta.delante' : 'trigal.delante';
        lista.push({ nombre: delante, x: x * PX + PX / 2, y: (y + 1) * PX, profundidad: y + 0.7 });
      }
      else if (c === 'L' && !zona.interior && v.en(0, -1) !== 'L' && (v.en(-1, 0) !== 'L' || v.en(1, 0) !== 'L')) {
        lista.push({ nombre: 'banderola', x: x * PX + PX / 2, y: y * PX + 6, profundidad: y + 0.95, origenX: 3.5 / 16 });
      }
    }
  });
  // La fuente: la taza con el surtidor en medio y, en el Patio de los Leones, los leones delante.
  const fuente: [number, number][] = [];
  zona.mapa.forEach((fila, y) => [...fila].forEach((c, x) => c === 'A' && fuente.push([x, y])));
  if (fuente.length > 0) {
    const xs = fuente.map(([x]) => x);
    const ys = fuente.map(([, y]) => y);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    if (estilo === 'patio') {
      for (let x = x0 * PX + 8; x <= (x1 + 1) * PX - 8; x += 12) {
        lista.push({ nombre: 'leon', x, y: (y1 + 1) * PX + 2, profundidad: y1 + 0.85 });
      }
    }
    lista.push({ nombre: 'surtidor', x: ((x0 + x1 + 1) / 2) * PX, y: ((y0 + y1 + 1) / 2) * PX + 8, profundidad: y1 + 0.8 });
  }
  return lista;
}

/**
 * Dibuja la zona en `capa`: el suelo a profundidad −1 y los objetos altos a la de su fila más un
 * poco, para que tapen a quien esté justo detrás (al norte) y no a quien esté delante.
 */
export function dibujarZona(scene: Phaser.Scene, zona: Zona, capa: Phaser.GameObjects.Container): void {
  const ancho = zona.mapa[0].length;
  const alto = zona.mapa.length;
  const clave = `suelo-${zona.id}`;
  if (scene.textures.exists(clave)) scene.textures.remove(clave);
  const lienzo = scene.textures.createCanvas(clave, ancho * PX, alto * PX)!;
  const ctx = lienzo.context;
  const img = scene.textures.get(CLAVE).getSourceImage() as CanvasImageSource;
  const animadas: [number, number][] = [];
  zona.mapa.forEach((fila, y) => {
    for (let x = 0; x < ancho; x++) {
      pintarCasilla(ctx, img, zona, x, y, 0);
      if (ANIMADAS.has(fila[x])) animadas.push([x, y]);
    }
  });
  lienzo.setFilter(Phaser.Textures.FilterMode.NEAREST);
  lienzo.refresh();
  capa.add(scene.add.image(0, 0, clave).setOrigin(0).setScale(ESCALA).setDepth(-1));

  const conFotogramas: [Phaser.GameObjects.Image, string[]][] = [];
  for (const o of objetosDe(zona)) {
    const imagen = imagenPieza(scene, o.nombre, o.x * ESCALA, o.y * ESCALA)
      .setOrigin(o.origenX ?? 0.5, 1)
      .setDepth(o.profundidad);
    capa.add(imagen);
    if (o.fotogramas) conFotogramas.push([imagen, o.fotogramas]);
  }

  if (animadas.length > 0) {
    let f = 0;
    const evento = scene.time.addEvent({
      delay: 260,
      loop: true,
      callback: () => {
        f = (f + 1) % 4;
        for (const [x, y] of animadas) pintarCasilla(ctx, img, zona, x, y, f);
        lienzo.refresh();
        for (const [imagen, fotogramas] of conFotogramas) imagen.setFrame(fotogramas[f]);
      },
    });
    capa.once(Phaser.GameObjects.Events.DESTROY, () => evento.remove());
  }
}

/** Cartel de madera, apoyado en el borde inferior de su casilla. */
export function dibujarCartel(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Image {
  return imagenPieza(scene, 'cartel', (x + 0.5) * TAM_CASILLA, (y + 1) * TAM_CASILLA).setOrigin(0.5, 1).setDepth(y + 0.4);
}

/** Recipiente registrable, apoyado en el borde inferior de su casilla. */
export function dibujarRecipiente(scene: Phaser.Scene, x: number, y: number, abierto: boolean): Phaser.GameObjects.Image {
  return imagenPieza(scene, abierto ? 'tinaja.abierta' : 'tinaja', x, y).setOrigin(0.5, 1);
}

export function abrirRecipiente(figura: Phaser.GameObjects.Image): void {
  // Si la zona se ha vuelto a dibujar mientras tanto, la figura ya no existe.
  if (!figura.scene) return;
  figura.setFrame('tinaja.abierta');
}

/**
 * La oscuridad de las zonas sin luz, como las cuevas del género: todo negro salvo un círculo de
 * `radio` casillas alrededor del jugador, con el borde difuminado. Es una imagen pequeña con el
 * agujero y cuatro rectángulos negros que tapan el resto; la escena la mueve con el jugador.
 */
export function crearOscuridad(scene: Phaser.Scene, radio: number): Phaser.GameObjects.Container {
  const clave = 'oscuridad';
  const L = 128;
  if (!scene.textures.exists(clave)) {
    const lienzo = scene.textures.createCanvas(clave, L, L)!;
    const ctx = lienzo.context;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, L, L);
    // Se ve del todo hasta el 70 % del radio y se va oscureciendo hasta el borde.
    ctx.globalCompositeOperation = 'destination-out';
    const luz = ctx.createRadialGradient(L / 2, L / 2, L * 0.35, L / 2, L / 2, L / 2);
    luz.addColorStop(0, 'rgba(0,0,0,1)');
    luz.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = luz;
    ctx.fillRect(0, 0, L, L);
    lienzo.refresh();
  }
  const lado = 2 * radio * TAM_CASILLA;
  const medio = lado / 2;
  // Lo bastante para tapar la pantalla entera esté donde esté el jugador; se solapan un poco con
  // la imagen para que no asome ninguna rendija.
  const lejos = 8000;
  const negro = (x: number, y: number, w: number, h: number) => scene.add.rectangle(x, y, w, h, 0x000000).setOrigin(0);
  return scene.add
    .container(0, 0, [
      scene.add.image(0, 0, clave).setDisplaySize(lado, lado),
      negro(-lejos, -lejos, 2 * lejos, lejos - medio + 2),
      negro(-lejos, medio - 2, 2 * lejos, lejos),
      negro(-lejos, -medio, lejos - medio + 2, lado),
      negro(medio - 2, -medio, lejos, lado),
    ])
    .setDepth(10000);
}
