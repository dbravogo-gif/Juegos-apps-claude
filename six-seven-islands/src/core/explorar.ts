// Exploración por casillas: el jugador va de casilla en casilla a paso fijo, choca con lo que no
// se pisa, recibe el aviso de los pasos cerrados, cambia de zona, entra por las puertas y recoge
// objetos. Puro y determinista: el resultado solo depende del estado y de la entrada de cada paso
// (60 por segundo), así que un bot puede jugar con él sin mirar la pantalla.

import { clave, transitable, type Condicion, type Direccion, type Mundo } from './mundo';

/** Pasos fijos que se tarda en cruzar una casilla: 11 a 60 Hz, unos 0,18 s. */
export const PASOS_POR_CASILLA = 11;

export const DESPLAZAMIENTO: Record<Direccion, readonly [number, number]> = {
  n: [0, -1],
  s: [0, 1],
  e: [1, 0],
  o: [-1, 0],
};

export interface EstadoExplorar {
  /** Casilla actual en la isla. Mientras se mueve, es la de destino. */
  x: number;
  y: number;
  mira: Direccion;
  /** Casilla de la que viene, para interpolar el dibujo. */
  desdeX: number;
  desdeY: number;
  /** Pasos dados hacia la casilla actual; 0 = parado en ella. */
  paso: number;
  zona: string;
  condiciones: Condicion[];
  /** Ids de los objetos ya recogidos. */
  recogidos: string[];
  /** Casilla del último aviso, para no repetirlo mientras se empuja contra el mismo paso. */
  avisoEn: number | null;
}

export type EventoExplorar =
  | { tipo: 'zona'; zona: string }
  | { tipo: 'aviso'; texto: string }
  | { tipo: 'objeto'; id: string; objeto: string }
  | { tipo: 'puerta'; x: number; y: number }
  | { tipo: 'hablar'; zona: string; personaje: string };

export function crearExploracion(m: Mundo, condiciones: Condicion[] = []): EstadoExplorar {
  const { zona, x, y } = m.isla.inicio;
  const z = m.zonas.get(zona);
  if (!z) throw new Error(`El inicio está en una zona que no existe: «${zona}»`);
  const gx = z.origen.x + x;
  const gy = z.origen.y + y;
  return { x: gx, y: gy, mira: 's', desdeX: gx, desdeY: gy, paso: 0, zona, condiciones: [...condiciones], recogidos: [], avisoEn: null };
}

/** Avanza un paso fijo con la dirección pulsada (o ninguna). Devuelve lo que ha pasado. */
export function avanzar(m: Mundo, e: EstadoExplorar, dir: Direccion | null): EventoExplorar[] {
  const eventos: EventoExplorar[] = [];
  if (e.paso > 0) {
    e.paso++;
    if (e.paso >= PASOS_POR_CASILLA) {
      e.paso = 0;
      e.desdeX = e.x;
      e.desdeY = e.y;
      llegar(m, e, eventos);
    }
    return eventos;
  }
  if (!dir) {
    e.avisoEn = null;
    return eventos;
  }
  e.mira = dir;
  const [dx, dy] = DESPLAZAMIENTO[dir];
  const nx = e.x + dx;
  const ny = e.y + dy;
  if (transitable(m, nx, ny, { condiciones: new Set(e.condiciones) })) {
    e.desdeX = e.x;
    e.desdeY = e.y;
    e.x = nx;
    e.y = ny;
    e.paso = 1;
    e.avisoEn = null;
    return eventos;
  }
  const k = clave(nx, ny);
  const cm = m.casillas.get(k);
  if (cm?.c === 'X' && e.avisoEn !== k) {
    const aviso = m.zonas.get(cm.zona)?.cierre?.aviso;
    if (aviso) eventos.push({ tipo: 'aviso', texto: aviso });
    e.avisoEn = k;
  }
  return eventos;
}

/** Lo que pasa al terminar de llegar a una casilla. */
function llegar(m: Mundo, e: EstadoExplorar, eventos: EventoExplorar[]): void {
  const k = clave(e.x, e.y);
  const cm = m.casillas.get(k)!;
  if (cm.zona !== e.zona) {
    e.zona = cm.zona;
    eventos.push({ tipo: 'zona', zona: cm.zona });
  }
  const o = m.objetos.get(k);
  if (o && !e.recogidos.includes(o.objeto.id)) {
    e.recogidos.push(o.objeto.id);
    eventos.push({ tipo: 'objeto', id: o.objeto.id, objeto: o.objeto.objeto });
  }
  if (cm.c === 'd') eventos.push({ tipo: 'puerta', x: e.x, y: e.y });
}

/** Pulsar «confirmar» parado: habla con el personaje que tiene delante, si lo hay. */
export function interactuar(m: Mundo, e: EstadoExplorar): EventoExplorar[] {
  if (e.paso > 0) return [];
  const [dx, dy] = DESPLAZAMIENTO[e.mira];
  const p = m.ocupadas.get(clave(e.x + dx, e.y + dy));
  return p ? [{ tipo: 'hablar', zona: p.zona, personaje: p.personaje.id }] : [];
}

/** Cumple una condición (elegir la inicial, el anciano, el gimnasio): abre sus pasos. */
export function cumplir(e: EstadoExplorar, c: Condicion): void {
  if (!e.condiciones.includes(c)) e.condiciones.push(c);
}

/** Posición para dibujar, en casillas, con la fracción del paso en curso (alfa de 0 a 1). */
export function posicionVisual(e: EstadoExplorar, alfa: number): { x: number; y: number } {
  if (e.paso === 0) return { x: e.x, y: e.y };
  const t = Math.min(1, (e.paso + alfa) / PASOS_POR_CASILLA);
  return { x: e.desdeX + (e.x - e.desdeX) * t, y: e.desdeY + (e.y - e.desdeY) * t };
}
