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
  /** Número en el Bestiario, de 1 a 150. */
  numero: number;
  nombre: string;
  tipos: [string] | [string, string];
  base: Estadisticas;
  expBase: number;
  /** De 1 a 255, como en Pokémon: cuanto más alto, más fácil de capturar. */
  ratioCaptura: number;
  aprende: { nivel: number; movimiento: string }[];
  /** Por nivel o al usar un objeto de evolución (o las dos cosas). */
  evoluciona?: { a: string; nivel?: number; objeto?: string };
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
  /** ×2 */
  eficaz: string[];
  /** ×0,5 */
  pocoEficaz: string[];
  /** ×0 */
  sinEfecto: string[];
}

export interface DefTablaTipos {
  tipos: TipoDef[];
  /** Por tipo atacante. */
  relaciones: Record<string, RelacionTipo>;
}

/** Efecto de un objeto equipado durante el combate. */
export type EfectoEquipo =
  /** Recupera esa fracción de la Vida máxima al final de cada turno. */
  | { tipo: 'regenerar'; fraccion: number }
  /** Con la Vida llena, aguanta con 1 un golpe que lo debilitaría. */
  | { tipo: 'aguantar' }
  /** Sus ataques hacen más daño, pero pierde esa fracción de Vida máxima al golpear. */
  | { tipo: 'potenciar'; multiplicador: number; coste: number }
  /** Recupera esa fracción del daño que hace. */
  | { tipo: 'robarVida'; fraccion: number }
  /** Multiplica la experiencia que gana. */
  | { tipo: 'experiencia'; multiplicador: number }
  /** Al bajar de `umbral` de la Vida, recupera `cura` de la Vida máxima. */
  | { tipo: 'baya'; umbral: number; cura: number }
  /** Cura ese estado en cuanto lo sufre. */
  | { tipo: 'bayaEstado'; estado: EstadoAlterado };

export type CategoriaObjeto =
  | 'captura'
  | 'curacion'
  | 'estados'
  | 'reanimacion'
  | 'exploracion'
  | 'progresion'
  | 'evolucion'
  | 'combate'
  | 'equipo'
  | 'bayas'
  | 'clave';

interface ObjetoBase {
  id: string;
  nombre: string;
  /** Artículo indefinido para los textos: «Usas una Poción», «unos Restos». */
  articulo: 'un' | 'una' | 'unos' | 'unas';
  descripcion: string;
  categoria: CategoriaObjeto;
  /** Precio en tienda. Sin precio, no se vende: se encuentra o se gana. */
  precio?: number;
}

export type Objeto = ObjetoBase &
  (
    | { tipo: 'captura'; bonus: number; segura?: boolean }
    | { tipo: 'curar'; cantidad: number | 'toda' }
    | { tipo: 'remedio'; estados: EstadoAlterado[] }
    | { tipo: 'revivir'; fraccion: number }
    | { tipo: 'repelente'; pasos: number }
    | { tipo: 'huida' }
    | { tipo: 'nivel' }
    | { tipo: 'evolucion' }
    | { tipo: 'potenciador'; estadistica: EstadisticaCombate; cambio: number }
    /** Se lleva equipado. Los consumibles (bayas, amuleto) se gastan al actuar. */
    | { tipo: 'equipo'; efecto: EfectoEquipo; consumible?: boolean }
    /** Objeto de la historia. */
    | { tipo: 'clave' }
  );

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
  /** Objeto equipado (id). */
  objeto?: string;
}
