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
export type EstadoAlterado = 'quemado' | 'dormido' | 'paralizado' | 'envenenado' | 'intoxicado' | 'colera';
export const ESTADOS_ALTERADOS: EstadoAlterado[] = ['quemado', 'dormido', 'paralizado', 'envenenado', 'intoxicado', 'colera'];

export type Efecto =
  /** Provoca un estado alterado al rival. `prob` en tanto por ciento. */
  | { tipo: 'estado'; estado: EstadoAlterado; prob: number }
  /** Deja cegado al rival unos turnos (como la confusión del género): falla más. */
  | { tipo: 'cegar'; prob: number }
  /** El rival pierde el turno si todavía no ha actuado. */
  | { tipo: 'retroceso'; prob: number }
  /** Siembra al rival: pierde 1/8 de su Vida cada turno y se la lleva quien esté en este lado. */
  | { tipo: 'drenadoras' }
  /** Se protege de todos los ataques este turno. Usarlo seguido sale cada vez peor. */
  | { tipo: 'proteger' }
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
  /**
   * Porcentaje de machos (si no se dice, 50), o `hermafrodita` (plantas con flores de los dos
   * sexos) o `ninguno` (estatuas y objetos).
   */
  sexo?: number | 'hermafrodita' | 'ninguno';
  /** Vive en el agua: solo estas aprenden Pleamar. */
  acuatica?: boolean;
  /** Ave o ser con alas capaz de llevar a una persona: solo estas aprenden Vuelo. */
  alada?: boolean;
  /** Id de su pasiva (`src/data/pasivas.ts`). */
  pasiva?: string;
  descripcion: string;
}

/** Estados volátiles: no son estados alterados, pero hay pasivas que los impiden. */
export type EstadoVolatil = 'cegado' | 'retroceso';

export type EfectoPasiva =
  /** Con un tercio de la Vida o menos, sus ataques de ese tipo pegan ×1,5. */
  | { tipo: 'apuro'; tipoMov: string }
  /** Los ataques de ese tipo no le hacen nada y además le curan, le avivan o le suben la Fuerza. */
  | { tipo: 'absorber'; tipoMov: string; ganancia: 'curar' | 'avivar' | 'fuerza' }
  /** Los ataques de ese tipo no le hacen nada. */
  | { tipo: 'inmuneTipo'; tipoMov: string }
  | { tipo: 'inmuneEstado'; estados: (EstadoAlterado | EstadoVolatil)[] }
  /** Quien le golpea con un ataque físico puede sufrir uno de esos estados (o quedar cegado). */
  | { tipo: 'contacto'; estados: (EstadoAlterado | 'cegado')[]; prob: number }
  /** Sus ataques pueden dejar cegado al rival. */
  | { tipo: 'ataqueCegador'; prob: number }
  | { tipo: 'resistir'; tipos: string[] }
  | {
      tipo:
        | 'pielAspera'
        | 'coraje'
        | 'tecnica'
        | 'afinidad'
        | 'celos'
        | 'punteria'
        | 'buenaEstrella'
        | 'ojoAvizor'
        | 'bendicion'
        | 'corpulencia'
        | 'hedor'
        | 'coraza'
        | 'escamas'
        | 'firme'
        | 'caparazon'
        | 'intimidar'
        | 'petreo'
        | 'garrasDuras'
        | 'carrerilla'
        | 'piesLigeros'
        | 'muda'
        | 'reposo'
        | 'brote'
        | 'espejo'
        | 'imponente'
        | 'escurridizo';
    }
  /** Al acabar un combate, `prob` % de encontrar uno de esos objetos (por peso). */
  | { tipo: 'rebuscar'; prob: number; objetos: { objeto: string; peso: number }[] };

export interface Pasiva {
  id: string;
  nombre: string;
  descripcion: string;
  efecto: EfectoPasiva;
}

export type Sexo = 'macho' | 'hembra' | 'hermafrodita' | 'ninguno';

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
  /** Al bajar de `umbral` de la Vida, recupera `cura` de la Vida máxima (o `puntos` de Vida). */
  | { tipo: 'baya'; umbral: number; cura?: number; puntos?: number }
  /** Cura alguno de esos estados en cuanto lo sufre. */
  | { tipo: 'bayaEstado'; estados: (EstadoAlterado | 'cegado')[] }
  /** `prob` % de actuar la primera entre los movimientos de su misma prioridad. */
  | { tipo: 'primero'; prob: number }
  /** Multiplica la probabilidad de dar un golpe crítico. */
  | { tipo: 'critico'; multiplicador: number }
  /** Multiplica la precisión de sus movimientos. */
  | { tipo: 'precision'; multiplicador: number }
  /** Siempre consigue huir de las criaturas salvajes. */
  | { tipo: 'huida' }
  /** Sus ataques de ese tipo pegan más. */
  | { tipo: 'potenciarTipo'; tipoMov: string; multiplicador: number };

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
  | 'maquinas'
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
    | {
        tipo: 'captura';
        bonus: number;
        segura?: boolean;
        /** Otra bonificación cuando se cumple algo: en el primer turno o contra esos tipos. */
        bonusSi?: { bonus: number; primerTurno?: boolean; tipos?: string[] };
      }
    | { tipo: 'curar'; cantidad: number | 'toda' }
    | { tipo: 'remedio'; estados: EstadoAlterado[] }
    | { tipo: 'revivir'; fraccion: number }
    /** Devuelve PP a todos los movimientos: esa cantidad o todos. */
    | { tipo: 'pp'; cantidad: number | 'toda' }
    | { tipo: 'repelente'; pasos: number }
    | { tipo: 'huida' }
    | { tipo: 'nivel' }
    | { tipo: 'evolucion' }
    | { tipo: 'potenciador'; estadistica: EstadisticaCombate; cambio: number }
    /** Se lleva equipado. Los consumibles (bayas, amuleto) se gastan al actuar. */
    | { tipo: 'equipo'; efecto: EfectoEquipo; consumible?: boolean }
    /**
     * MT o MO: enseña un movimiento y no se gasta. Las MO (`oculta`) enseñan los movimientos que
     * también se usan fuera de combate (Pleamar y Vuelo).
     */
    | {
        tipo: 'maquina';
        movimiento: string;
        oculta?: boolean;
        aprenden: { todos?: boolean; tipos?: string[]; especies?: string[]; acuaticas?: boolean; aladas?: boolean };
      }
    /**
     * Objeto de la historia. Con `interruptor`, se enciende y se apaga desde la mochila: está
     * encendido mientras no esté puesta la bandera `apagado`.
     */
    | { tipo: 'clave'; interruptor?: { apagado: string } }
  );

export interface DatosJuego {
  especies: Record<string, Especie>;
  movimientos: Record<string, Movimiento>;
  temperamentos: Temperamento[];
  tipos: DefTablaTipos;
  objetos: Record<string, Objeto>;
  pasivas: Record<string, Pasiva>;
}

export type EstadoCriatura =
  | { tipo: 'quemado' }
  | { tipo: 'dormido'; turnos: number }
  | { tipo: 'paralizado' }
  | { tipo: 'envenenado' }
  /** Veneno grave: cada turno hace más daño (`turnos`/16). */
  | { tipo: 'intoxicado'; turnos: number }
  /** Fuera de sí: a veces usa otro de sus movimientos en lugar del elegido. */
  | { tipo: 'colera' };

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
  /** Se decide al crearla (`sexoPara`). Las partidas antiguas lo reciben al cargarse. */
  sexo?: Sexo;
}
