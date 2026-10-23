// Tipos de datos compartidos por todo el motor. Todo lo que se guarda o viaja en un código de
// equipo es JSON plano: nada de clases ni funciones.

export const ESTADISTICAS = ['vida', 'fuerza', 'escudo', 'magia', 'resMagica', 'celeridad'] as const;
export type Estadistica = (typeof ESTADISTICAS)[number];
export type EstadisticaCombate = Exclude<Estadistica, 'vida'>;
export type Estadisticas = Record<Estadistica, number>;
export type Etapas = Record<EstadisticaCombate, number>;

export const NOMBRE_ESTADISTICA: Record<Estadistica, string> = {
  vida: 'Vida',
  fuerza: 'Fuerza',
  escudo: 'Escudo',
  magia: 'Magia',
  resMagica: 'Resistencia mágica',
  celeridad: 'Celeridad',
};

export type Categoria = 'fisico' | 'magico' | 'estado';
export type EstadoAlterado = 'quemado' | 'dormido';

export type Efecto =
  /** Provoca un estado alterado al rival. `prob` en tanto por ciento. */
  | { tipo: 'estado'; estado: EstadoAlterado; prob: number }
  /** Sube o baja etapas de una estadística, de −6 a +6. */
  | { tipo: 'etapa'; objetivo: 'propio' | 'rival'; estadistica: EstadisticaCombate; cambio: number; prob: number }
  /** Recupera una fracción del daño causado. */
  | { tipo: 'drenar'; fraccion: number }
  /** Recupera una fracción de la Vida máxima propia. */
  | { tipo: 'curar'; fraccion: number };

export interface Movimiento {
  id: string;
  nombre: string;
  /** Id del tipo. Cadena vacía: sin tipo (solo el Arrebato). */
  tipo: string;
  categoria: Categoria;
  poder: number;
  /** De 1 a 100. `null`: no falla nunca. */
  precision: number | null;
  pp: number;
  prioridad?: number;
  efectos?: Efecto[];
  descripcion?: string;
}

export interface Especie {
  id: string;
  nombre: string;
  tipos: [string] | [string, string];
  base: Estadisticas;
  expBase: number;
  /** De 1 a 255, como en Pokémon: cuanto más alto, más fácil de capturar. */
  ratioCaptura: number;
  aprende: { nivel: number; movimiento: string }[];
  evoluciona?: { a: string; nivel: number };
  descripcion: string;
}

export interface Temperamento {
  id: string;
  nombre: string;
  /** Si `sube` y `baja` coinciden, el temperamento es neutro. */
  sube: EstadisticaCombate;
  baja: EstadisticaCombate;
}

export interface TipoDef {
  id: string;
  nombre: string;
  color: number;
}

export interface DefTablaTipos {
  tipos: TipoDef[];
  /** [atacante, defensor]: el ataque es eficaz (×2). El reverso queda en ×0,5. */
  eficaces: [string, string][];
  /** [atacante, defensor]: el ataque no afecta (×0). */
  inmunidades: [string, string][];
}

export type Objeto =
  | { id: string; nombre: string; tipo: 'curar'; cantidad: number; descripcion: string }
  | { id: string; nombre: string; tipo: 'captura'; bonus: number; descripcion: string }
  /** Objeto de la historia: no se usa en combate. */
  | { id: string; nombre: string; tipo: 'clave'; descripcion: string };

export interface DatosJuego {
  especies: Record<string, Especie>;
  movimientos: Record<string, Movimiento>;
  temperamentos: Temperamento[];
  tipos: DefTablaTipos;
  objetos: Record<string, Objeto>;
}

export type EstadoCriatura = { tipo: 'quemado' } | { tipo: 'dormido'; turnos: number };

export interface MovimientoAprendido {
  id: string;
  pp: number;
}

/** Un ejemplar concreto. Es lo que se guarda en la partida y en los códigos de equipo. */
export interface Criatura {
  uid: string;
  especie: string;
  mote?: string;
  nivel: number;
  exp: number;
  /** De 1 a 14: lo buena que es la criatura. Sustituye a los IV y los EV. */
  valia: number;
  temperamento: string;
  vida: number;
  movimientos: MovimientoAprendido[];
  estado: EstadoCriatura | null;
}
