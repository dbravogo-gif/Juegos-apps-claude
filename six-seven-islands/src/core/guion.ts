// Diálogos: líneas de texto que se pasan con la tecla de interactuar, con una pregunta de sí o no
// opcional y un efecto (cumplir una condición, elegir la inicial). El texto sale letra a letra;
// interactuar mientras sale lo completa, y otra vez pasa a la línea siguiente.
// Puro y determinista: el contenido está en los datos (src/data/guion-*.ts).

import type { Condicion } from './mundo';

export interface Linea {
  /** Quién habla; sin él, es un aviso o lo que lee el jugador. */
  quien?: string;
  texto: string;
}

export interface Efecto {
  condicion?: Condicion;
  /** El tipo de la inicial que se elige. */
  inicial?: string;
}

export interface Dialogo {
  lineas: readonly Linea[];
  /** Pregunta de sí o no al final. El efecto solo se aplica si se dice que sí. */
  pregunta?: Linea;
  /** Lo que pasa al terminar, o al decir que sí si hay pregunta. */
  efecto?: Efecto;
  /** Lo que se dice después de decir que sí. */
  tras?: readonly Linea[];
}

/** Un diálogo que solo vale en cierto momento de la partida. Gana el primero que encaja. */
export interface Variante {
  /** Solo si esta condición está cumplida. */
  con?: Condicion;
  /** Solo si esta condición NO está cumplida. */
  sin?: Condicion;
  /** Solo si la inicial elegida es de este tipo. */
  inicial?: string;
  dialogo: Dialogo;
}

/** Los diálogos de cada personaje, por su id. */
export type Guion = Readonly<Record<string, readonly Variante[]>>;

/** El diálogo de un personaje según el momento de la partida, o null si no tiene ninguno que encaje. */
export function elegirDialogo(guion: Guion, id: string, condiciones: readonly Condicion[], inicial: string | null): Dialogo | null {
  for (const v of guion[id] ?? []) {
    if (v.con && !condiciones.includes(v.con)) continue;
    if (v.sin && condiciones.includes(v.sin)) continue;
    if (v.inicial && v.inicial !== inicial) continue;
    return v.dialogo;
  }
  return null;
}

/** Letras que aparecen por paso fijo: a 60 Hz, unas 120 por segundo. */
export const LETRAS_POR_PASO = 2;

export interface EstadoDialogo {
  dialogo: Dialogo;
  tramo: 'lineas' | 'pregunta' | 'tras';
  /** Línea actual dentro del tramo. */
  linea: number;
  /** En la pregunta: 0 = sí, 1 = no. */
  opcion: 0 | 1;
  /** Letras ya visibles de la línea actual. */
  revelado: number;
}

export type Tecla = 'confirmar' | 'cancelar' | 'izquierda' | 'derecha';

export interface Resultado {
  /** El diálogo ha terminado. */
  fin: boolean;
  /** Se acaba de decidir: hay que aplicarlo ya. */
  efecto?: Efecto;
}

export function abrirDialogo(dialogo: Dialogo): EstadoDialogo {
  if (!dialogo.lineas.length && !dialogo.pregunta) throw new Error('Un diálogo necesita al menos una línea o una pregunta');
  return { dialogo, tramo: dialogo.lineas.length ? 'lineas' : 'pregunta', linea: 0, opcion: 0, revelado: 0 };
}

/** La línea que se ve ahora (en la pregunta, la propia pregunta). */
export function lineaActual(s: EstadoDialogo): Linea {
  if (s.tramo === 'pregunta') return s.dialogo.pregunta!;
  const lista = s.tramo === 'lineas' ? s.dialogo.lineas : s.dialogo.tras!;
  return lista[s.linea];
}

/** Un paso fijo: aparecen unas letras más. */
export function pasoDialogo(s: EstadoDialogo): void {
  s.revelado = Math.min(lineaActual(s).texto.length, s.revelado + LETRAS_POR_PASO);
}

export function completa(s: EstadoDialogo): boolean {
  return s.revelado >= lineaActual(s).texto.length;
}

/** Lo que hace una tecla en el diálogo. */
export function pulsar(s: EstadoDialogo, t: Tecla): Resultado {
  if (t === 'izquierda' || t === 'derecha') {
    if (s.tramo === 'pregunta') s.opcion = s.opcion === 0 ? 1 : 0;
    return { fin: false };
  }
  // Interactuar con el texto a medias lo completa; cancelar en la pregunta es decir que no.
  if (!completa(s) && !(t === 'cancelar' && s.tramo === 'pregunta')) {
    s.revelado = lineaActual(s).texto.length;
    return { fin: false };
  }
  const d = s.dialogo;
  if (s.tramo === 'pregunta') {
    if (t === 'cancelar' || s.opcion === 1) return { fin: true };
    if (d.tras?.length) siguienteTramo(s, 'tras');
    return { fin: !d.tras?.length, efecto: d.efecto };
  }
  const lista = s.tramo === 'lineas' ? d.lineas : d.tras!;
  if (s.linea + 1 < lista.length) {
    s.linea++;
    s.revelado = 0;
    return { fin: false };
  }
  if (s.tramo === 'lineas' && d.pregunta) {
    siguienteTramo(s, 'pregunta');
    return { fin: false };
  }
  return { fin: true, efecto: s.tramo === 'lineas' ? d.efecto : undefined };
}

function siguienteTramo(s: EstadoDialogo, tramo: EstadoDialogo['tramo']): void {
  s.tramo = tramo;
  s.linea = 0;
  s.revelado = 0;
  s.opcion = 0;
}
