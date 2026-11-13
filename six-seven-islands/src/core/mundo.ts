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
  // Lanzarote (2026-11-10).
  V: 'viña en su hoyo',
  U: 'tunera',
  L: 'colada de lava',
  w: 'charco verde',
  a: 'arena de playa',
  Q: 'cono volcánico',
  // Famara (2026-11-11): la playa de los bañistas.
  O: 'sombrilla',
  t: 'toalla',
  // Fuerteventura (2026-11-13): las dunas, donde toda la arena tiene criaturas, sus crestas, que
  // no se pisan, y la estatua que desentierra la arqueóloga.
  D: 'arena de duna',
  K: 'cresta de duna',
  E: 'estatua enterrada',
  // La boca de una cueva en el acantilado (Ajuy): se entra por su puerta, como en un edificio.
  J: 'boca de cueva',
  // El gimnasio de Aire (Fuerteventura): corrientes que empujan hasta chocar y aspas de molino
  // que, al girarlas, cambian hacia dónde sopla una corriente.
  W: 'corriente de viento',
  H: 'aspas de molino',
  g: 'roca grabada',
  // Interiores: salas pequeñas aparte (ISLA-1.md, «Decisiones técnicas»).
  m: 'suelo',
  '|': 'pared',
  o: 'mesa',
  h: 'estantería',
  c: 'mostrador',
  k: 'ordenador',
  l: 'cama',
  v: 'maceta',
  e: 'escalera',
  j: 'juguetes',
  n: 'cocina',
  q: 'sofá',
  // Gimnasios (2026-11-13): una palanca que abre una compuerta (no se pisa; se usa con E).
  p: 'palanca',
} as const;

export type Casilla = keyof typeof LEYENDA;

/** Se pueden pisar. Las X también, cuando su condición se cumple. */
export const TRANSITABLES: ReadonlySet<string> = new Set(['.', ',', ':', '_', '"', ';', 'a', 'd', 'P', 'm', 't', 'D', 'W']);
/** Muebles de los interiores: no se pisan y se dibujan como piezas. */
export const MUEBLES: ReadonlySet<string> = new Set(['o', 'h', 'c', 'k', 'l', 'v', 'e', 'j', 'n', 'q']);
/** Terreno de encuentros: la hierba alta, el malpaís y la arena de las dunas (como los desiertos). */
export const DE_ENCUENTROS: ReadonlySet<string> = new Set(['"', ';', 'D']);
/** Las letras de los edificios. Cada grupo de casillas iguales y contiguas es un edificio. */
export const EDIFICIOS: ReadonlySet<string> = new Set(['C', 'M', 'R', 'S', 'G', 'F', 'J']);

export type Direccion = 'n' | 's' | 'e' | 'o';
/**
 * Lo que abre pasos y cambia diálogos. Además de los hitos con nombre: `vencido:<id>`, al vencer
 * a un entrenador, y `palanca:<id>`, al bajar una palanca (las compuertas de los gimnasios).
 */
export type Condicion =
  | 'inicial-elegida'
  | 'anciano'
  | 'gimnasio-vencido'
  /** Aún no se cumple: llegará con el barco de Morro Jable a Gran Canaria. */
  | 'isla2-completada'
  | 'isla1-completada'
  | 'gimnasio2-vencido'
  | `vencido:${string}`
  | `palanca:${string}`
  | `aspas:${string}`;
export const TODAS_LAS_CONDICIONES: ReadonlySet<Condicion> = new Set(['inicial-elegida', 'anciano', 'gimnasio-vencido']);

export interface Personaje {
  id: string;
  /** En coordenadas de su zona. */
  x: number;
  y: number;
  mira: Direccion;
  entrenador?: { vision: number; obligatorio: boolean };
  /** Tumbado en el suelo (los bañistas de Famara), y con la piel quemada por el sol. */
  postura?: 'tumbado';
  quemado?: boolean;
  /** Lo que dice al hablarle, mientras no lleguen los diálogos de verdad (F15). */
  frase?: string;
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
  cierre?: Cierre;
  /** Compuertas con su propia condición, por casilla (`"x,y"` de la zona): mandan sobre `cierre`. */
  cierres?: Readonly<Record<string, Cierre>>;
  /** Palancas (`p`), por casilla (`"x,y"` de la zona): bajarla cumple `palanca:<id>`. */
  palancas?: Readonly<Record<string, string>>;
  /** Corrientes de viento (`W`), por casilla (`"x,y"` de la zona). */
  corrientes?: Readonly<Record<string, Corriente>>;
  /** Aspas de molino (`H`), por casilla: girarlas activa o desactiva `aspas:<id>`. */
  aspas?: Readonly<Record<string, string>>;
  /** Lo que se lee al mirar una roca grabada (`g`), por casilla. */
  letreros?: Readonly<Record<string, string>>;
  personajes: readonly Personaje[];
  /** Cómo se dibujan sus casas (por defecto, rurales; en la capital, de balcones). */
  casas?: EstiloCasas;
  /** Qué árbol son sus `T` (por defecto, palmeras). */
  arboles?: 'palmera' | 'laurel';
  /** Qué crece entre sus rocas: secano (por defecto), humedad o volcán. */
  flora?: 'seca' | 'humeda' | 'volcan';
  /** El tiempo que hace: la calima de Las Dunas (unas partículas de polvo; solo se ve). */
  clima?: 'calima' | 'viento';
  /** Colores propios del suelo de la zona, por letra; mandan sobre los de la isla. */
  suelo?: Partial<Record<string, string>>;
}

/**
 * Una corriente de viento: hacia dónde empuja y, si unas aspas la gobiernan, hacia dónde empuja
 * cuando están giradas.
 */
export interface Corriente {
  dir: Direccion;
  alterna?: Direccion;
  aspas?: string;
}

/** Lo que abre una casilla X y lo que se dice al chocar con ella cerrada. */
export interface Cierre {
  condicion: Condicion;
  aviso: string;
}

/** Estilos de casa canaria: rural de teja, de balcones, o la blanca de azotea de Lanzarote. */
export type EstiloCasas = 'rural' | 'balcones' | 'lanzarote' | 'balcones-blanca';

export interface DefIsla {
  id: string;
  /** Las zonas en el orden del recorrido. */
  zonas: readonly DefZona[];
  inicio: { zona: string; x: number; y: number };
  /** El tipo de su gimnasio (decide el emblema pintado en la azotea). */
  gimnasio?: string;
  /** Colores propios de la isla: suelo por letra, las cumbres del centro y las matas de la hierba alta. */
  colores?: { suelo?: Partial<Record<string, string>>; cumbre?: string; ladoCumbre?: string; matas?: string };
  /**
   * La costa de la isla, como polígono en casillas (x, y). Lo que queda dentro y no es de ninguna
   * zona es tierra que no se pisa. Sin silueta, la tierra solo rellena los huecos entre zonas.
   */
  silueta?: readonly (readonly [number, number])[];
  /** Islotes que se ven desde la costa y no se pisan (Lobos), con polígonos como la silueta. */
  islotes?: readonly (readonly (readonly [number, number])[])[];
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
    z.mapa.forEach((f, y) =>
      [...f].forEach((c, x) => {
        if (c === 'X' && !z.cierre && !z.cierres?.[`${x},${y}`]) throw new Error(`Zona «${z.id}»: la X de ${x},${y} no dice qué la abre`);
        if (c === 'p' && !z.palancas?.[`${x},${y}`]) throw new Error(`Zona «${z.id}»: la palanca de ${x},${y} no tiene id`);
        if (c === 'W' && !z.corrientes?.[`${x},${y}`]) throw new Error(`Zona «${z.id}»: la corriente de ${x},${y} no dice hacia dónde sopla`);
        if (c === 'H' && !z.aspas?.[`${x},${y}`]) throw new Error(`Zona «${z.id}»: las aspas de ${x},${y} no tienen id`);
        if (c === 'g' && !z.letreros?.[`${x},${y}`]) throw new Error(`Zona «${z.id}»: la roca grabada de ${x},${y} no tiene texto`);
      }),
    );
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
  // La silueta puede salirse de las zonas: el mundo llega hasta ella.
  for (const [x, y] of [...(isla.silueta ?? []), ...(isla.islotes ?? []).flat()]) {
    ancho = Math.max(ancho, Math.ceil(x) + 1);
    alto = Math.max(alto, Math.ceil(y) + 1);
  }
  return { isla, casillas, zonas, ocupadas, objetos, ancho, alto };
}

/** Un interior: una sala pequeña aparte, con su propio mapa (ISLA-1.md, «Decisiones técnicas»). */
export interface DefInterior {
  id: string;
  nombre: string;
  /** La salida es una `d` en el borde de abajo: se sale andando hacia el sur. */
  mapa: readonly string[];
  personajes: readonly Personaje[];
  /** Dónde aparece el jugador al entrar, en coordenadas de la sala. */
  entrada: { x: number; y: number };
  /** Compuertas y palancas (los gimnasios), como en `DefZona`. */
  cierres?: Readonly<Record<string, Cierre>>;
  /** Objetos en el suelo (la cueva de Ajuy), como en `DefZona`. */
  objetos?: readonly ObjetoEnSuelo[];
  /** Corrientes y aspas (el gimnasio de Aire), como en `DefZona`. */
  corrientes?: Readonly<Record<string, Corriente>>;
  aspas?: Readonly<Record<string, string>>;
  palancas?: Readonly<Record<string, string>>;
}

/**
 * Monta un interior como un mundo de una sola zona. Se coloca lejos de la isla (`origen`), así
 * que sus casillas tienen claves propias y se dibuja aparte sin estorbar.
 */
export function construirInterior(def: DefInterior, origen: { x: number; y: number }): Mundo {
  const zona: DefZona = { id: def.id, nombre: def.nombre, origen, mapa: def.mapa, altura: 0, hierbaObligatoria: false, personajes: def.personajes, cierres: def.cierres, palancas: def.palancas, objetos: def.objetos, corrientes: def.corrientes, aspas: def.aspas };
  return construirMundo({ id: def.id, zonas: [zona], inicio: { zona: def.id, ...def.entrada } });
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
    const cierre = cierreEn(m, k);
    return Boolean(cierre && op.condiciones?.has(cierre.condicion));
  }
  if (op.sinEncuentros && DE_ENCUENTROS.has(cm.c)) return false;
  if (op.evitar?.has(cm.c)) return false;
  return TRANSITABLES.has(cm.c);
}

/** Lo que abre la casilla X de la clave `k`: su compuerta propia o el cierre de su zona. */
export function cierreEn(m: Mundo, k: number): Cierre | undefined {
  const cm = m.casillas.get(k);
  const z = cm ? m.zonas.get(cm.zona) : undefined;
  if (!z) return undefined;
  const [x, y] = deClave(k);
  return z.cierres?.[`${x - z.origen.x},${y - z.origen.y}`] ?? z.cierre;
}

/** Hacia dónde empuja la corriente de la casilla `k` con estas condiciones, o null si no hay. */
export function corrienteEn(m: Mundo, k: number, condiciones: readonly string[]): Direccion | null {
  const cm = m.casillas.get(k);
  const z = cm?.c === 'W' ? m.zonas.get(cm.zona) : undefined;
  if (!z) return null;
  const [x, y] = deClave(k);
  const c = z.corrientes?.[`${x - z.origen.x},${y - z.origen.y}`];
  if (!c) return null;
  return c.aspas && c.alterna && condiciones.includes(`aspas:${c.aspas}`) ? c.alterna : c.dir;
}

/** El texto de la roca grabada de la casilla `k`, si la hay. */
export function letreroEn(m: Mundo, k: number): string | undefined {
  const cm = m.casillas.get(k);
  const z = cm?.c === 'g' ? m.zonas.get(cm.zona) : undefined;
  if (!z) return undefined;
  const [x, y] = deClave(k);
  return z.letreros?.[`${x - z.origen.x},${y - z.origen.y}`];
}

/** El id de las aspas de la casilla `k`, si las hay. */
export function aspasEn(m: Mundo, k: number): string | undefined {
  const cm = m.casillas.get(k);
  const z = cm?.c === 'H' ? m.zonas.get(cm.zona) : undefined;
  if (!z) return undefined;
  const [x, y] = deClave(k);
  return z.aspas?.[`${x - z.origen.x},${y - z.origen.y}`];
}

/** El id de la palanca de la casilla `k`, si la hay. */
export function palancaEn(m: Mundo, k: number): string | undefined {
  const cm = m.casillas.get(k);
  const z = cm?.c === 'p' ? m.zonas.get(cm.zona) : undefined;
  if (!z) return undefined;
  const [x, y] = deClave(k);
  return z.palancas?.[`${x - z.origen.x},${y - z.origen.y}`];
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

/** El primer entrenador no vencido de la zona que ve la casilla x, y, o null (F16). */
export function entrenadorQueVe(m: Mundo, x: number, y: number, vencidos: readonly string[]): { zona: string; personaje: string } | null {
  const k = clave(x, y);
  const zona = m.casillas.get(k)?.zona;
  const z = zona ? m.zonas.get(zona) : undefined;
  if (!z || !zona) return null;
  for (const p of z.personajes) {
    if (p.entrenador && !vencidos.includes(p.id) && vision(m, zona, p).includes(k)) return { zona, personaje: p.id };
  }
  return null;
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
