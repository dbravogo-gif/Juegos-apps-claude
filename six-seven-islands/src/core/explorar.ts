// Exploración por casillas: el jugador va de casilla en casilla a paso fijo, choca con lo que no
// se pisa, recibe el aviso de los pasos cerrados, cambia de zona, entra y sale de los interiores
// por sus puertas y recoge objetos. Puro y determinista: el resultado solo depende del estado y
// de la entrada de cada paso (60 por segundo), así que un bot puede jugar sin mirar la pantalla.
//
// Las funciones reciben el mapa activo: la isla o el interior donde está el jugador.

import { DE_ENCUENTROS, EDIFICIOS, aspasEn, cierreEn, clave, corrienteEn, palancaEn, transitable, type Condicion, type Direccion, type Mundo } from './mundo';

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
  /** El interior donde está, o null si está en la isla. */
  dentro: string | null;
  /** Dónde estaba en la isla antes de entrar: la casilla de la puerta. */
  fuera: { x: number; y: number; zona: string } | null;
  /** El tipo de la inicial elegida en el museo, o null. */
  inicial: string | null;
  /** Una corriente de viento le empuja hacia aquí (gimnasio de Aire): no manda el teclado. */
  empuje?: Direccion | null;
}

export type EventoExplorar =
  | { tipo: 'zona'; zona: string }
  | { tipo: 'aviso'; texto: string }
  | { tipo: 'objeto'; id: string; objeto: string }
  /** Entrar en el edificio de la puerta x,y (de la isla). */
  | { tipo: 'puerta'; x: number; y: number }
  /** Salir del interior por su puerta. */
  | { tipo: 'salida' }
  | { tipo: 'hablar'; zona: string; personaje: string }
  /** Usar la palanca que se tiene delante (`ya`: estaba bajada). */
  | { tipo: 'palanca'; id: string; ya: boolean }
  /** Girar las aspas que se tienen delante (`activas`: estaban giradas). */
  | { tipo: 'aspas'; id: string; activas: boolean }
  /** Ha terminado un paso sobre terreno de encuentros: quien juega sortea si sale una criatura. */
  | { tipo: 'hierba'; zona: string };

export function crearExploracion(m: Mundo, condiciones: Condicion[] = []): EstadoExplorar {
  const { zona, x, y } = m.isla.inicio;
  const z = m.zonas.get(zona);
  if (!z) throw new Error(`El inicio está en una zona que no existe: «${zona}»`);
  const gx = z.origen.x + x;
  const gy = z.origen.y + y;
  return { x: gx, y: gy, mira: 's', desdeX: gx, desdeY: gy, paso: 0, zona, condiciones: [...condiciones], recogidos: [], avisoEn: null, dentro: null, fuera: null, inicial: null };
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
  // Empujado por una corriente: va hacia donde sopla, mande lo que mande el teclado. Si choca,
  // se para ahí y vuelve a mandar el jugador.
  if (e.empuje) {
    const [ex, ey] = DESPLAZAMIENTO[e.empuje];
    if (transitable(m, e.x + ex, e.y + ey, { condiciones: new Set(e.condiciones) })) dir = e.empuje;
    else e.empuje = null;
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
  const puerta = cruzarPuerta(m, e, dir);
  if (puerta) {
    eventos.push(puerta);
    return eventos;
  }
  const k = clave(nx, ny);
  const cm = m.casillas.get(k);
  if (cm?.c === 'X' && e.avisoEn !== k) {
    const aviso = cierreEn(m, k)?.aviso;
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
  if (DE_ENCUENTROS.has(cm.c)) eventos.push({ tipo: 'hierba', zona: cm.zona });
  // Sobre una corriente, lo siguiente es dejarse llevar; fuera de ellas, vuelve a mandar el jugador.
  e.empuje = corrienteEn(m, k, e.condiciones);
  const puerta = cruzarPuerta(m, e, e.mira);
  if (puerta) eventos.push(puerta);
}

/**
 * Las puertas solo se cruzan andando hacia ellas, no al pasar por delante: desde una `d`, hacia
 * su edificio se entra, y hacia fuera del mapa (en un interior) se sale.
 */
function cruzarPuerta(m: Mundo, e: EstadoExplorar, dir: Direccion): EventoExplorar | null {
  if (m.casillas.get(clave(e.x, e.y))?.c !== 'd') return null;
  const [dx, dy] = DESPLAZAMIENTO[dir];
  const delante = m.casillas.get(clave(e.x + dx, e.y + dy));
  if (!delante) return { tipo: 'salida' };
  return EDIFICIOS.has(delante.c) ? { tipo: 'puerta', x: e.x, y: e.y } : null;
}

/** Entra en un interior: recuerda la puerta de la isla y aparece en la entrada de la sala, mirando al norte. */
export function entrar(e: EstadoExplorar, id: string, sala: Mundo): void {
  e.fuera = { x: e.x, y: e.y, zona: e.zona };
  const { zona, x, y } = sala.isla.inicio;
  const z = sala.zonas.get(zona)!;
  e.dentro = id;
  e.zona = zona;
  e.x = e.desdeX = z.origen.x + x;
  e.y = e.desdeY = z.origen.y + y;
  e.paso = 0;
  e.mira = 'n';
  e.avisoEn = null;
}

/** Sale del interior: vuelve a la puerta de la isla, mirando al sur. */
export function salir(e: EstadoExplorar): void {
  if (!e.fuera) return;
  e.x = e.desdeX = e.fuera.x;
  e.y = e.desdeY = e.fuera.y;
  e.zona = e.fuera.zona;
  e.dentro = null;
  e.fuera = null;
  e.paso = 0;
  e.mira = 's';
  e.avisoEn = null;
}

/**
 * Pulsar «interactuar» parado: habla con el personaje que tiene delante, si lo hay. Por encima
 * de un mostrador también se habla, con quien está detrás.
 */
export function interactuar(m: Mundo, e: EstadoExplorar): EventoExplorar[] {
  if (e.paso > 0) return [];
  const [dx, dy] = DESPLAZAMIENTO[e.mira];
  const aspas = aspasEn(m, clave(e.x + dx, e.y + dy));
  if (aspas) return [{ tipo: 'aspas', id: aspas, activas: e.condiciones.includes(`aspas:${aspas}`) }];
  const palanca = palancaEn(m, clave(e.x + dx, e.y + dy));
  if (palanca) return [{ tipo: 'palanca', id: palanca, ya: e.condiciones.includes(`palanca:${palanca}`) }];
  const mostrador = m.casillas.get(clave(e.x + dx, e.y + dy))?.c === 'c';
  const p = m.ocupadas.get(mostrador ? clave(e.x + 2 * dx, e.y + 2 * dy) : clave(e.x + dx, e.y + dy));
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
