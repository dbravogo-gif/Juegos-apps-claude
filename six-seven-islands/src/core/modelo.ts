// Tipos de datos del núcleo. Todo lo que se guarda o viaja por la red es JSON plano: nada de
// clases ni funciones. Las reglas vienen de Leyendas de Iberia (obra del autor); el contenido
// (especies, movimientos, objetos) es propio de este juego y va en src/data.

export const ESTADISTICAS = ['vida', 'fuerza', 'escudo', 'magia', 'resMagica', 'celeridad'] as const;
export type Estadistica = (typeof ESTADISTICAS)[number];
export type EstadisticaCombate = Exclude<Estadistica, 'vida'>;
export const ESTADISTICAS_COMBATE: readonly EstadisticaCombate[] = ['fuerza', 'escudo', 'magia', 'resMagica', 'celeridad'];
export type Estadisticas = Record<Estadistica, number>;
/** Etapas de combate, de −6 a +6, de cada estadística salvo la Vida. */
export type Etapas = Record<EstadisticaCombate, number>;

export type Categoria = 'fisico' | 'magico' | 'estado';
export type EstadoAlterado = 'quemado' | 'dormido' | 'paralizado' | 'envenenado' | 'intoxicado';

export type Efecto =
  /** Provoca un estado alterado al objetivo. `prob` en tanto por ciento. */
  | { tipo: 'estado'; estado: EstadoAlterado; prob: number }
  /** El objetivo pierde el turno si todavía no ha actuado. */
  | { tipo: 'retroceso'; prob: number }
  /** Sube o baja etapas de una estadística. */
  | { tipo: 'etapa'; a: 'propio' | 'objetivo'; estadistica: EstadisticaCombate; cambio: number; prob: number }
  /** Recupera esa fracción del daño causado. */
  | { tipo: 'drenar'; fraccion: number }
  /** Recupera esa fracción de la Vida máxima propia. */
  | { tipo: 'curar'; fraccion: number }
  /** Se protege de todos los ataques este turno. Usarlo seguido sale cada vez peor. */
  | { tipo: 'proteger' };

/**
 * A quién va un movimiento:
 * - `uno`: una criatura rival, la que se elija.
 * - `rivales`: todos los rivales en el campo. Con más de uno, cada golpe hace ×0,75.
 * - `propio`: quien lo usa.
 */
export type ObjetivoMovimiento = 'uno' | 'rivales' | 'propio';

export interface Movimiento {
  id: string;
  nombre: string;
  /** Id del tipo. Cadena vacía: sin tipo. */
  tipo: string;
  categoria: Categoria;
  poder: number;
  /** De 1 a 100. `null`: no falla nunca. */
  precision: number | null;
  pp: number;
  prioridad?: number;
  /** Si no se dice: `propio` para los de estado sin efectos sobre el rival, `uno` para el resto. */
  objetivo?: ObjetivoMovimiento;
  efectos?: Efecto[];
  descripcion?: string;
}

export interface Evolucion {
  a: string;
  nivel: number;
}

export interface Especie {
  id: string;
  nombre: string;
  tipos: [string] | [string, string];
  base: Estadisticas;
  expBase: number;
  /** De 1 a 255: cuanto más alto, más fácil de capturar. */
  ratioCaptura: number;
  aprende: { nivel: number; movimiento: string }[];
  /** Varias entradas: evolución ramificada (el jugador elige). */
  evoluciona?: Evolucion[];
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

/** Lo que hace un tipo al atacar. Los tipos que no aparecen reciben ×1. */
export interface RelacionTipo {
  eficaz: string[];
  pocoEficaz: string[];
  sinEfecto: string[];
}

export interface DefTablaTipos {
  tipos: TipoDef[];
  relaciones: Record<string, RelacionTipo>;
}

interface ObjetoBase {
  id: string;
  nombre: string;
  descripcion: string;
  /** Precio en tienda. Sin precio, no se vende. */
  precio?: number;
}

export type Objeto = ObjetoBase &
  (
    | { tipo: 'captura'; bonus: number }
    | { tipo: 'curar'; cantidad: number | 'toda' }
    | { tipo: 'remedio'; estados: EstadoAlterado[] }
    | { tipo: 'revivir'; fraccion: number }
    /** Objeto de la historia, para los recados: no se vende ni se usa en combate. */
    | { tipo: 'clave' }
  );

export interface DatosJuego {
  especies: Record<string, Especie>;
  movimientos: Record<string, Movimiento>;
  temperamentos: Temperamento[];
  tipos: DefTablaTipos;
  objetos: Record<string, Objeto>;
}

export type EstadoCriatura =
  | { tipo: 'quemado' }
  | { tipo: 'dormido'; turnos: number }
  | { tipo: 'paralizado' }
  | { tipo: 'envenenado' }
  /** Veneno grave: cada turno hace más daño (`turnos`/16). */
  | { tipo: 'intoxicado'; turnos: number };

export interface MovimientoAprendido {
  id: string;
  pp: number;
}

/** Un ejemplar concreto. Es lo que se guarda en la partida y viaja en los intercambios. */
export interface Criatura {
  uid: string;
  especie: string;
  mote?: string;
  nivel: number;
  exp: number;
  /** De 1 a 14: lo buena que es. Hace de IV común a todas las estadísticas. */
  valia: number;
  temperamento: string;
  vida: number;
  movimientos: MovimientoAprendido[];
  estado: EstadoCriatura | null;
}
