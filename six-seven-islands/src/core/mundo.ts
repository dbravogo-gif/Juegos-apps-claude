// El mundo lógico por casillas: la isla, sus zonas, qué se pisa y qué no, y las comprobaciones de
// sus reglas (hierba obligatoria, entrenadores que no se pueden esquivar y pasos cerrados). Las
// reglas vienen de Leyendas de Iberia (decisión del autor) y valen para todo el juego.
// Puro: sin DOM, sin Three.js, sin azar y sin importar nada, para que también lo usen las
// herramientas con Node.

/** Una letra por casilla. Los mapas se escriben como texto (ISLA-1.md). */
export const LEYENDA = {
  '.': 'hierba corta',
  ',': 'camino',
  ':': 'tierra',
  _: 'picón',
  '"': 'hierba alta',
  ';': 'malpaís',
  '#': 'roca',
  '~': 'agua',
  T: 'árbol',
  Y: 'drago',
  b: 'platanera',
  '=': 'muro bajo',
  C: 'casa',
  M: 'museo',
  R: 'refugio',
  S: 'tienda',
  G: 'gimnasio',
  F: 'faro',
  d: 'puerta',
  X: 'paso cerrado',
  P: 'muelle',
  B: 'barco',
} as const;

export type Casilla = keyof typeof LEYENDA;

/** Se pueden pisar. Las X también, cuando su condición se cumple. */
export const TRANSITABLES: ReadonlySet<string> = new Set(['.', ',', ':', '_', '"', ';', 'd', 'P']);
/** Terreno de encuentros: la hierba alta y el malpaís (y, más adelante, las dunas). */
export const DE_ENCUENTROS: ReadonlySet<string> = new Set(['"', ';']);
/** Las letras de los edificios. Cada grupo de casillas iguales y contiguas es un edificio. */
export const EDIFICIOS: ReadonlySet<string> = new Set(['C', 'M', 'R', 'S', 'G', 'F']);

export type Direccion = 'n' | 's' | 'e' | 'o';
export type Condicion = 'inicial-elegida' | 'anciano' | 'gimnasio-vencido';
export const TODAS_LAS_CONDICIONES: ReadonlySet<Condicion> = new Set(['inicial-elegida', 'anciano', 'gimnasio-vencido']);

export interface Personaje {
  id: string;
  /** En coordenadas de su zona. */
  x: number;
  y: number;
  mira: Direccion;
  entrenador?: { vision: number; obligatorio: boolean };
}

/** Un objeto en el suelo, que se recoge al pisarlo. */
export interface ObjetoEnSuelo {
  id: string;
  /** En coordenadas de su zona. */
  x: number;
  y: number;
  objeto: string;
}

export interface DefZona {
  id: string;
  nombre: string;
  /** Dónde empieza la zona en la isla, en casillas. */
  origen: { x: number; y: number };
  mapa: readonly string[];
  /** Altura de toda la zona (0 = nivel del mar), si no lleva `alturas`. */
  altura?: number;
  /** Altura de cada casilla, un dígito por casilla, con la forma de `mapa`. */
  alturas?: readonly string[];
  objetos?: readonly ObjetoEnSuelo[];
  /** Una zona con hierba obligatoria no se cruza sin pisar terreno de encuentros. */
  hierbaObligatoria: boolean;
  /** Las casillas X de la zona se abren con esta condición. */
  cierre?: { condicion: Condicion; aviso: string };
  personajes: readonly Personaje[];
}

export interface DefIsla {
  id: string;
  /** Las zonas en el orden del recorrido. */
  zonas: readonly DefZona[];
  inicio: { zona: string; x: number; y: number };
}

export interface CasillaMundo {
  c: Casilla;
  zona: string;
  /** Altura, en escalones (0 = nivel del mar). */
  h: number;
}

export interface Mundo {
  isla: DefIsla;
  casillas: ReadonlyMap<number, CasillaMundo>;
  zonas: ReadonlyMap<string, DefZona>;
  /** Casillas ocupadas por personajes (no se pisan). */
  ocupadas: ReadonlyMap<number, { zona: string; personaje: Personaje }>;
  /** Objetos en el suelo (se pisan y se recogen). */
  objetos: ReadonlyMap<number, { zona: string; objeto: ObjetoEnSuelo }>;
  ancho: number;
  alto: number;
}

const ANCHO_CLAVE = 4096;
export const clave = (x: number, y: number): number => y * ANCHO_CLAVE + x;
export const deClave = (k: number): [number, number] => [k % ANCHO_CLAVE, Math.floor(k / ANCHO_CLAVE)];

const PASOS: Record<Direccion, [number, number]> = { n: [0, -1], s: [0, 1], e: [1, 0], o: [-1, 0] };
const VECINOS: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/** Monta la isla a partir de sus zonas. Lanza un error si un mapa está mal escrito o se pisan. */
export function construirMundo(isla: DefIsla): Mundo {
  const casillas = new Map<number, CasillaMundo>();
  const zonas = new Map<string, DefZona>();
  const ocupadas = new Map<number, { zona: string; personaje: Personaje }>();
  const objetos = new Map<number, { zona: string; objeto: ObjetoEnSuelo }>();
  let ancho = 0;
  let alto = 0;
  for (const z of isla.zonas) {
    if (zonas.has(z.id)) throw new Error(`Zona repetida: «${z.id}»`);
    zonas.set(z.id, z);
    const w = z.mapa[0]?.length ?? 0;
    if (z.alturas && (z.alturas.length !== z.mapa.length || z.alturas.some((f) => f.length !== w || !/^[0-9]+$/.test(f)))) {
      throw new Error(`Zona «${z.id}»: las alturas no tienen la forma del mapa o no son dígitos`);
    }
    z.mapa.forEach((fila, y) => {
      if (fila.length !== w) throw new Error(`Zona «${z.id}», fila ${y}: mide ${fila.length} y debería medir ${w}`);
      for (let x = 0; x < w; x++) {
        const c = fila[x] as Casilla;
        if (!(c in LEYENDA)) throw new Error(`Zona «${z.id}», casilla ${x},${y}: «${c}» no está en la leyenda`);
        const gx = z.origen.x + x;
        const gy = z.origen.y + y;
        const k = clave(gx, gy);
        const otra = casillas.get(k);
        if (otra) throw new Error(`Las zonas «${otra.zona}» y «${z.id}» se pisan en ${gx},${gy}`);
        const h = z.alturas ? Number(z.alturas[y][x]) : (z.altura ?? 0);
        casillas.set(k, { c, zona: z.id, h });
        ancho = Math.max(ancho, gx + 1);
        alto = Math.max(alto, gy + 1);
      }
    });
    if (z.mapa.some((f) => f.includes('X')) && !z.cierre) throw new Error(`Zona «${z.id}»: tiene X pero no dice qué la abre`);
    for (const p of z.personajes) {
      const k = clave(z.origen.x + p.x, z.origen.y + p.y);
      const debajo = casillas.get(k);
      if (!debajo || debajo.zona !== z.id || !TRANSITABLES.has(debajo.c)) {
        throw new Error(`Personaje «${p.id}» de «${z.id}» no está sobre suelo de su zona (${p.x},${p.y})`);
      }
      if (ocupadas.has(k)) throw new Error(`Dos personajes en la misma casilla: «${p.id}»`);
      ocupadas.set(k, { zona: z.id, personaje: p });
    }
    for (const o of z.objetos ?? []) {
      const k = clave(z.origen.x + o.x, z.origen.y + o.y);
      const debajo = casillas.get(k);
      if (!debajo || debajo.zona !== z.id || !TRANSITABLES.has(debajo.c) || ocupadas.has(k) || objetos.has(k)) {
        throw new Error(`Objeto «${o.id}» de «${z.id}» no está sobre suelo libre de su zona (${o.x},${o.y})`);
      }
      objetos.set(k, { zona: z.id, objeto: o });
    }
  }
  return { isla, casillas, zonas, ocupadas, objetos, ancho, alto };
}

export interface OpcionesPaso {
  /** Condiciones cumplidas: abren las X de sus zonas. */
  condiciones?: ReadonlySet<Condicion>;
  /** Casillas que no se pueden pisar (para comprobar que algo no se puede esquivar). */
  prohibidas?: ReadonlySet<number>;
  /** No pisar terreno de encuentros (para comprobar la hierba obligatoria). */
  sinEncuentros?: boolean;
  /** No pisar estas letras (para comprobar cada mancha obligatoria por separado). */
  evitar?: ReadonlySet<string>;
}

/** ¿Se puede pisar la casilla x,y de la isla? */
export function transitable(m: Mundo, x: number, y: number, op: OpcionesPaso = {}): boolean {
  const k = clave(x, y);
  const cm = m.casillas.get(k);
  if (!cm) return false;
  if (m.ocupadas.has(k) || op.prohibidas?.has(k)) return false;
  if (cm.c === 'X') {
    const cierre = m.zonas.get(cm.zona)?.cierre;
    return Boolean(cierre && op.condiciones?.has(cierre.condicion));
  }
  if (op.sinEncuentros && DE_ENCUENTROS.has(cm.c)) return false;
  if (op.evitar?.has(cm.c)) return false;
  return TRANSITABLES.has(cm.c);
}

/** Todas las casillas a las que se llega andando desde las de partida. */
export function alcanzables(m: Mundo, desde: readonly number[], op: OpcionesPaso = {}): Set<number> {
  const vistas = new Set<number>();
  const cola: number[] = [];
  for (const k of desde) {
    const [x, y] = deClave(k);
    if (transitable(m, x, y, op) && !vistas.has(k)) {
      vistas.add(k);
      cola.push(k);
    }
  }
  for (let i = 0; i < cola.length; i++) {
    const [x, y] = deClave(cola[i]);
    for (const [dx, dy] of VECINOS) {
      const k = clave(x + dx, y + dy);
      if (!vistas.has(k) && transitable(m, x + dx, y + dy, op)) {
        vistas.add(k);
        cola.push(k);
      }
    }
  }
  return vistas;
}

/** Posición de un personaje en la isla. */
export function enIsla(m: Mundo, zona: string, x: number, y: number): number {
  const z = m.zonas.get(zona);
  if (!z) throw new Error(`No hay zona «${zona}»`);
  return clave(z.origen.x + x, z.origen.y + y);
}

/**
 * Lo que ve un entrenador: las casillas en línea recta hacia donde mira, hasta su alcance o
 * hasta la primera que no se puede pisar (una pared o un árbol tapan la vista).
 */
export function vision(m: Mundo, zona: string, p: Personaje): number[] {
  const alcance = p.entrenador?.vision ?? 0;
  const z = m.zonas.get(zona)!;
  const [dx, dy] = PASOS[p.mira];
  const vistas: number[] = [];
  for (let i = 1; i <= alcance; i++) {
    const x = z.origen.x + p.x + dx * i;
    const y = z.origen.y + p.y + dy * i;
    const cm = m.casillas.get(clave(x, y));
    if (!cm || !(TRANSITABLES.has(cm.c) || cm.c === 'X') || m.ocupadas.has(clave(x, y))) break;
    vistas.push(clave(x, y));
  }
  return vistas;
}

/** Casillas pisables de la zona `a` que tocan una casilla pisable de la zona `b`. */
export function conexiones(m: Mundo, a: string, b: string): number[] {
  const res: number[] = [];
  for (const [k, cm] of m.casillas) {
    if (cm.zona !== a || !(TRANSITABLES.has(cm.c) || cm.c === 'X')) continue;
    const [x, y] = deClave(k);
    for (const [dx, dy] of VECINOS) {
      const v = m.casillas.get(clave(x + dx, y + dy));
      if (v && v.zona === b && (TRANSITABLES.has(v.c) || v.c === 'X')) {
        res.push(k);
        break;
      }
    }
  }
  return res;
}

export interface Edificio {
  tipo: Casilla;
  zona: string;
  casillas: number[];
  puertas: number[];
  ancho: number;
  fondo: number;
}

/** Los edificios de una zona: grupos de casillas con la misma letra, y sus puertas contiguas. */
export function edificios(m: Mundo, zona: string): Edificio[] {
  const vistos = new Set<number>();
  const res: Edificio[] = [];
  for (const [k, cm] of m.casillas) {
    if (cm.zona !== zona || !EDIFICIOS.has(cm.c) || vistos.has(k)) continue;
    const grupo: number[] = [];
    const cola = [k];
    vistos.add(k);
    while (cola.length) {
      const a = cola.pop()!;
      grupo.push(a);
      const [x, y] = deClave(a);
      for (const [dx, dy] of VECINOS) {
        const kb = clave(x + dx, y + dy);
        const v = m.casillas.get(kb);
        if (v && v.zona === zona && v.c === cm.c && !vistos.has(kb)) {
          vistos.add(kb);
          cola.push(kb);
        }
      }
    }
    const puertas = new Set<number>();
    for (const a of grupo) {
      const [x, y] = deClave(a);
      for (const [dx, dy] of VECINOS) {
        const kb = clave(x + dx, y + dy);
        if (m.casillas.get(kb)?.c === 'd') puertas.add(kb);
      }
    }
    const xs = grupo.map((g) => deClave(g)[0]);
    const ys = grupo.map((g) => deClave(g)[1]);
    res.push({
      tipo: cm.c,
      zona,
      casillas: grupo,
      puertas: [...puertas],
      ancho: Math.max(...xs) - Math.min(...xs) + 1,
      fondo: Math.max(...ys) - Math.min(...ys) + 1,
    });
  }
  return res;
}
