// Modelo del mundo explorable: zonas dibujadas como texto, personajes, salidas y guiones.
// Todo son datos JSON; la escena de Phaser solo los pinta y los recorre.

import type { EstadoAlterado } from './modelo';

export type Dir = 'arriba' | 'abajo' | 'izquierda' | 'derecha';

export const DELTA: Record<Dir, [number, number]> = {
  arriba: [0, -1],
  abajo: [0, 1],
  izquierda: [-1, 0],
  derecha: [1, 0],
};

export const OPUESTA: Record<Dir, Dir> = { arriba: 'abajo', abajo: 'arriba', izquierda: 'derecha', derecha: 'izquierda' };

/** Cómo se comporta un carácter del mapa. El aspecto lo decide la interfaz. */
export interface DefCasilla {
  nombre: string;
  solido: boolean;
  /** Hierba alta: puede saltar un encuentro. */
  hierba?: boolean;
  /** Agua profunda: sólida a pie, pero se cruza con Pleamar. */
  navegable?: boolean;
  /** Agua donde se puede pescar con la Caña. */
  pesca?: boolean;
  /** Suelo resbaladizo: quien entra sigue deslizándose en la misma dirección (`seDesliza`). */
  resbala?: boolean;
}

export type Paso =
  | { tipo: 'decir'; texto: string; quien?: string }
  | { tipo: 'elegir'; pregunta: string; quien?: string; opciones: { texto: string; pasos: Paso[] }[] }
  | { tipo: 'si'; bandera: string; entonces: Paso[]; sino?: Paso[] }
  | { tipo: 'bandera'; nombre: string; valor?: boolean }
  | { tipo: 'curar' }
  | { tipo: 'dar'; objeto: string; cantidad: number }
  | { tipo: 'dinero'; cantidad: number }
  | { tipo: 'elegirInicial' }
  /** Aparece un rival por primera vez: el jugador le pone nombre (si aún no lo tiene). */
  | { tipo: 'conocerRival'; rival: 'a' | 'b' }
  | { tipo: 'combate'; entrenador: string }
  /** Castigo fuera de combate: una criatura al azar pierde esa fracción de su Vida, sin debilitarse. */
  | { tipo: 'herir'; fraccion: number }
  /** Castigo fuera de combate: una criatura al azar de las que pueden sufrirlo coge el estado. */
  | { tipo: 'alterar'; estado: EstadoAlterado }
  /** Ids de objeto; el precio sale de los datos del objeto. */
  | { tipo: 'tienda'; productos: string[] }
  | { tipo: 'regreso' }
  /** Ordenar el equipo con las criaturas guardadas en el Bestiario. */
  | { tipo: 'almacen' }
  | { tipo: 'blason'; id: string; nombre: string }
  /** Lleva al jugador a otra zona, como una salida: para pasar de capítulo. */
  | { tipo: 'viajar'; zona: string; x: number; y: number; dir: Dir }
  | { tipo: 'guardar' }
  | { tipo: 'fin'; texto: string[] };

export type Guion = Paso[];

export interface DefEntrenador {
  id: string;
  nombre: string;
  equipo: { especie: string; nivel: number }[];
  /** Valía fija de sus criaturas: lo entrenadas que están. */
  valia: number;
  premio: number;
  /** Objetos que regala la primera vez que se le vence. */
  objetos?: Record<string, number>;
  antes: string[];
  derrota: string[];
  /** Lo que dice si le hablas cuando ya le has vencido. */
  despues: string[];
  /**
   * Es uno de los dos rivales: se llama como lo bautizó el jugador (`{rival}` en los textos) y al
   * final de su equipo lleva la inicial que le tocó, en la forma que tenga a ese nivel.
   */
  rival?: { cual: 'a' | 'b'; nivel: number };
  /**
   * Pregunta antes del primer combate, en los gimnasios de preguntas. Se hace una sola vez
   * (`pregunta:<id>`): si pierdes y vuelves, solo queda el combate. Fallarla trae el castigo
   * (`herir`, `alterar`…), que ya se nota en ese combate. `correcta` es su índice en `respuestas`.
   */
  pregunta?: { texto: string; respuestas: string[]; correcta: number; castigo: Paso[] };
}

export interface Pnj {
  id: string;
  nombre: string;
  x: number;
  y: number;
  dir: Dir;
  /** Hoja de sprites con la que se dibuja (`ASPECTOS` en `src/data/aspectos.ts`). */
  aspecto: string;
  guion: Guion;
  /** Id de un entrenador: si te ve, te reta. */
  entrenador?: string;
  /** Casillas que alcanza su vista. */
  vision?: number;
  /** Solo aparece si la bandera está puesta. */
  visibleSi?: string;
  /** Desaparece cuando la bandera está puesta. */
  ocultoSi?: string;
  /**
   * Es una criatura que espera de pie (un legendario en su guarida): al hablarle, tras su guion,
   * empieza el combate. Si la vences o la capturas, desaparece (bandera `fijo:<zona>:<id>`); si
   * huyes, sigue ahí. Con esto, `aspecto` no se usa.
   */
  criatura?: { especie: string; nivel: number };
  /** Pasea solo, sin alejarse más de estas casillas de su sitio. Solo para quien no reta. */
  pasea?: number;
}

export interface Salida {
  x: number;
  y: number;
  zona: string;
  ax: number;
  ay: number;
  dir: Dir;
  /**
   * Para entrar hace falta un objeto o una bandera (las guaridas de legendarios que se abren más
   * adelante). Si no se cumple, no se pasa y sale `texto`.
   */
  requiere?: { objeto?: string; bandera?: string; texto: string };
}

/** Si la partida cumple lo que pide una salida (objetos y banderas, como `p.objetos` y `p.banderas`). */
export function cumpleRequisito(req: NonNullable<Salida['requiere']>, objetos: Record<string, number>, banderas: Record<string, boolean>): boolean {
  return (!req.objeto || (objetos[req.objeto] ?? 0) > 0) && (!req.bandera || Boolean(banderas[req.bandera]));
}

export interface TablaEncuentros {
  /** Probabilidad, sobre 100, de que salte un encuentro en cada paso por hierba alta. */
  tasa: number;
  especies: { especie: string; min: number; max: number; peso: number }[];
}

/** Aspecto del mapa: qué árboles, muros, suelos y paredes se dibujan. Lo interpreta la interfaz. */
export type EstiloZona =
  | 'campo'
  | 'pueblo'
  | 'alhambra'
  | 'meson'
  | 'pabellon'
  | 'patio'
  /** Castilla: hierba más seca, encinas y trigales. */
  | 'meseta'
  /** Ciudad de muralla de ladrillo mudéjar y cipreses. */
  | 'toledo'
  /** Interior de sillería, con armaduras y armeros. */
  | 'alcazar'
  /** Montaña: pinos, peñas de granito y arroyos. */
  | 'sierra'
  /** Las obras de El Escorial: muros de sillares de granito. */
  | 'escorial'
  /** Sevilla: casas encaladas y naranjos. */
  | 'sevilla'
  /** La cubierta de un galeón (interior): tablas, mástiles y cañones. */
  | 'galeon';

export interface Zona {
  id: string;
  nombre: string;
  /** Filas de caracteres, todas del mismo ancho. */
  mapa: string[];
  interior?: boolean;
  /** Si no se dice: `meson` en interiores y `campo` fuera. */
  estilo?: EstiloZona;
  /** Color del suelo fuera del mapa y de fondo. */
  fondo?: number;
  /**
   * Zona a oscuras, como las cuevas del género: solo se ve un círculo de este radio (en casillas)
   * alrededor del jugador.
   */
  oscuridad?: number;
  encuentros?: TablaEncuentros;
  /** Encuentros al surcar el agua profunda con Pleamar (cada paso por el agua). */
  encuentrosAgua?: TablaEncuentros;
  /** Lo que pica al pescar con la Caña. `tasa`: probabilidad de que pique algo. */
  encuentrosPesca?: TablaEncuentros;
  pnj: Pnj[];
  salidas: Salida[];
  carteles: { x: number; y: number; texto: string[] }[];
  /**
   * Objetos en el suelo: se recogen mirando la casilla y pulsando A (bandera `oculto:<zona>:<id>`).
   * Sin `visible` están escondidos; con `visible` se ve un zurrón que estorba el paso hasta que
   * se recoge (las MT, por ejemplo).
   */
  ocultos?: { id: string; x: number; y: number; objeto: string; cantidad?: number; visible?: boolean }[];
  /**
   * Tinajas que se pueden registrar una vez (`src/data/recipientes.ts`). Bloquean el paso. Solo
   * en ciudades e interiores. Con `objeto`, siempre dan ese objeto en vez de echarlo a suertes.
   */
  recipientes?: { id: string; x: number; y: number; objeto?: string }[];
  /** Guion que se ejecuta la primera vez que se entra (usa la bandera `visto:<id>`). */
  alEntrar?: Guion;
  /**
   * Dónde se dibuja en el mapa de la península (`src/data/lugares.ts`): en un lugar o, si es un
   * camino, entre dos.
   */
  enMapa?: { lugar: string } | { ruta: [string, string] };
}

/** Una zona donde sale una especie, con sus niveles y la probabilidad de cada encuentro. */
export interface ZonaDeEspecie {
  zona: string;
  min: number;
  max: number;
  /** Porcentaje de los encuentros de la zona que son de esta especie. */
  porcentaje: number;
  /** Sale al surcar el agua, no en la hierba. */
  agua?: boolean;
  /** Sale pescando. */
  pesca?: boolean;
}

/** Las zonas donde se encuentra una especie en libertad, en el orden de `zonas`. */
export function dondeSale(zonas: Record<string, Zona>, especie: string): ZonaDeEspecie[] {
  const lista: ZonaDeEspecie[] = [];
  for (const z of Object.values(zonas)) {
    for (const [tabla, donde] of [[z.encuentros, ''], [z.encuentrosAgua, 'agua'], [z.encuentrosPesca, 'pesca']] as const) {
      if (!tabla) continue;
      const total = tabla.especies.reduce((s, e) => s + e.peso, 0);
      const propias = tabla.especies.filter((e) => e.especie === especie);
      if (propias.length === 0 || total <= 0) continue;
      const d: ZonaDeEspecie = {
        zona: z.id,
        min: Math.min(...propias.map((e) => e.min)),
        max: Math.max(...propias.map((e) => e.max)),
        porcentaje: Math.max(1, Math.round((propias.reduce((s, e) => s + e.peso, 0) / total) * 100)),
      };
      if (donde === 'agua') d.agua = true;
      if (donde === 'pesca') d.pesca = true;
      lista.push(d);
    }
  }
  return lista;
}

export function ancho(z: Zona): number {
  return z.mapa[0]?.length ?? 0;
}

export function alto(z: Zona): number {
  return z.mapa.length;
}

/** Carácter de la casilla; fuera del mapa cuenta como muro. */
export function casillaEn(z: Zona, x: number, y: number): string {
  if (y < 0 || y >= z.mapa.length || x < 0 || x >= z.mapa[y].length) return '#';
  return z.mapa[y][x];
}

export function esSolida(z: Zona, x: number, y: number, casillas: Record<string, DefCasilla>): boolean {
  return casillas[casillaEn(z, x, y)]?.solido ?? true;
}

export function esResbaladiza(z: Zona, x: number, y: number, casillas: Record<string, DefCasilla>): boolean {
  return Boolean(casillas[casillaEn(z, x, y)]?.resbala);
}

/**
 * Adónde llega quien entra andando en `desde` hacia `dir`, como en el hielo del género: si la
 * casilla resbala, sigue en la misma dirección hasta chocar con algo (y se queda en la última
 * casilla resbaladiza) o hasta pisar suelo que no resbala. Devuelve todas las casillas que
 * recorre, la última es donde se para. `libre` dice si se puede entrar en una casilla.
 */
export function deslizamiento(
  z: Zona,
  desde: { x: number; y: number },
  dir: Dir,
  casillas: Record<string, DefCasilla>,
  libre: (x: number, y: number) => boolean,
): { x: number; y: number }[] {
  const [dx, dy] = DELTA[dir];
  const camino = [{ ...desde }];
  let { x, y } = desde;
  while (esResbaladiza(z, x, y, casillas) && libre(x + dx, y + dy) && camino.length < 200) {
    x += dx;
    y += dy;
    camino.push({ x, y });
  }
  return camino;
}

export function esHierba(z: Zona, x: number, y: number, casillas: Record<string, DefCasilla>): boolean {
  return Boolean(casillas[casillaEn(z, x, y)]?.hierba);
}

export function esNavegable(z: Zona, x: number, y: number, casillas: Record<string, DefCasilla>): boolean {
  return Boolean(casillas[casillaEn(z, x, y)]?.navegable);
}

export function esPescable(z: Zona, x: number, y: number, casillas: Record<string, DefCasilla>): boolean {
  return Boolean(casillas[casillaEn(z, x, y)]?.pesca);
}

/** ¿Está el jugador en línea recta delante del entrenador, sin nada sólido en medio? */
export function enLineaDeVision(
  z: Zona,
  casillas: Record<string, DefCasilla>,
  desde: { x: number; y: number; dir: Dir },
  vision: number,
  objetivo: { x: number; y: number },
  bloqueos: (x: number, y: number) => boolean = () => false,
): boolean {
  const [dx, dy] = DELTA[desde.dir];
  for (let i = 1; i <= vision; i++) {
    const x = desde.x + dx * i;
    const y = desde.y + dy * i;
    if (x === objetivo.x && y === objetivo.y) return true;
    if (esSolida(z, x, y, casillas) || bloqueos(x, y)) return false;
  }
  return false;
}

/** Errores de coherencia de una zona. Lista vacía si todo está bien. */
export function validarZona(
  z: Zona,
  casillas: Record<string, DefCasilla>,
  zonas: Record<string, Zona>,
  entrenadores: Record<string, DefEntrenador>,
): string[] {
  const errores: string[] = [];
  const w = ancho(z);
  z.mapa.forEach((fila, y) => {
    if (fila.length !== w) errores.push(`${z.id}: la fila ${y} mide ${fila.length} y no ${w}`);
    for (const c of fila) if (!casillas[c]) errores.push(`${z.id}: carácter desconocido «${c}» en la fila ${y}`);
  });
  for (const s of z.salidas) {
    const destino = zonas[s.zona];
    if (!destino) {
      errores.push(`${z.id}: salida a una zona que no existe (${s.zona})`);
      continue;
    }
    if (esSolida(destino, s.ax, s.ay, casillas)) errores.push(`${z.id}: la salida a ${s.zona} cae en una casilla sólida`);
  }
  for (const o of z.ocultos ?? []) {
    if (esSolida(z, o.x, o.y, casillas)) errores.push(`${z.id}: el objeto oculto ${o.id} está en una casilla sólida`);
  }
  const ocupadas = new Set([...z.pnj, ...z.carteles, ...(z.ocultos ?? [])].map((o) => `${o.x},${o.y}`));
  for (const r of z.recipientes ?? []) {
    if (esSolida(z, r.x, r.y, casillas)) errores.push(`${z.id}: el recipiente ${r.id} está en una casilla sólida`);
    if (ocupadas.has(`${r.x},${r.y}`)) errores.push(`${z.id}: el recipiente ${r.id} pisa a otro elemento`);
  }
  for (const p of z.pnj) {
    if (esSolida(z, p.x, p.y, casillas)) errores.push(`${z.id}: ${p.id} está sobre una casilla sólida`);
    if (p.entrenador && !entrenadores[p.entrenador]) errores.push(`${z.id}: ${p.id} usa un entrenador que no existe`);
  }
  return errores;
}

/**
 * Una casilla por la que se entra en cada zona: la llegada de la primera salida que lleva a ella.
 * La usa el modo desarrollador para viajar a cualquier zona. `extra` son entradas que no salen
 * de ninguna salida (el principio de cada capítulo).
 */
/**
 * La posición guardada si sigue valiendo. Si el mapa ha cambiado y ha quedado dentro de un muro o
 * fuera del mapa, la entrada de su zona; si la zona ya no existe, `porDefecto`.
 */
export function posicionValida<P extends { zona: string; x: number; y: number; dir: Dir }>(
  pos: P,
  zonas: Record<string, Zona>,
  casillas: Record<string, DefCasilla>,
  entradas: Record<string, { zona: string; x: number; y: number; dir: Dir }>,
  porDefecto: { zona: string; x: number; y: number; dir: Dir },
): { zona: string; x: number; y: number; dir: Dir } {
  const z = zonas[pos.zona];
  if (!z) return { ...porDefecto };
  const dentro = pos.y >= 0 && pos.y < z.mapa.length && pos.x >= 0 && pos.x < ancho(z);
  if (dentro && (!esSolida(z, pos.x, pos.y, casillas) || esNavegable(z, pos.x, pos.y, casillas))) return pos;
  return { ...(entradas[pos.zona] ?? porDefecto) };
}

export function entradasDeZonas(
  zonas: Record<string, Zona>,
  extra: { zona: string; x: number; y: number; dir: Dir }[] = [],
): Record<string, { zona: string; x: number; y: number; dir: Dir }> {
  const entradas: Record<string, { zona: string; x: number; y: number; dir: Dir }> = {};
  for (const e of extra) entradas[e.zona] ??= { ...e };
  for (const z of Object.values(zonas)) {
    for (const s of z.salidas) entradas[s.zona] ??= { zona: s.zona, x: s.ax, y: s.ay, dir: s.dir };
  }
  return entradas;
}
