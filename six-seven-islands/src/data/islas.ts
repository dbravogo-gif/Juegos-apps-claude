// Las islas del juego (2026-11-13, al empezar Fuerteventura): todo lo propio de cada una en un
// sitio, para que «partida», «combate» y el mapa no conozcan una isla concreta. Se viaja entre
// ellas en barco: se guarda la partida en la isla de destino y se recarga la página.

import type { Campo } from '../core/combate';
import { RECADOS_ISLA1 } from './recados-isla1';
import type { DefRecado } from '../core/recados';
import type { Condicion, DefInterior, DefIsla } from '../core/mundo';
import type { Guion } from '../core/guion';
import type { TablaEncuentros } from '../core/encuentros';
import type { DefEntrenador } from './entrenadores-isla1';
import { ISLA_1, PUERTAS_ISLA1 } from './isla1';
import { INTERIORES_ISLA1, SALA_INICIAL } from './interiores-isla1';
import { ENCUENTROS_ISLA1 } from './encuentros-isla1';
import { ENTRENADORES_ISLA1 } from './entrenadores-isla1';
import { GUION_ISLA1 } from './guion-isla1';
import { OBJETIVOS } from './textos-isla1';
import { ISLA_2, PUERTAS_ISLA2 } from './isla2';
import { INTERIORES_ISLA2 } from './interiores-isla2';
import { ENCUENTROS_ISLA2 } from './encuentros-isla2';
import { ENTRENADORES_ISLA2 } from './entrenadores-isla2';
import { GUION_ISLA2 } from './guion-isla2';
import { ISLA_3, PUERTAS_ISLA3 } from './isla3';
import { INTERIORES_ISLA3 } from './interiores-isla3';
import { ENCUENTROS_ISLA3 } from './encuentros-isla3';
import { ENTRENADORES_ISLA3 } from './entrenadores-isla3';
import { GUION_ISLA3 } from './guion-isla3';

export interface DatosIsla {
  numero: number;
  nombre: string;
  def: DefIsla;
  /** A qué sala lleva cada puerta, por zona y casilla (`"x,y"` de la zona). */
  puertas: Readonly<Record<string, Readonly<Record<string, string>>>>;
  interiores: readonly DefInterior[];
  encuentros: TablaEncuentros;
  entrenadores: Readonly<Record<string, DefEntrenador>>;
  guion: Guion;
  /** El objetivo que se enseña en pantalla: el primero cuya condición no se ha cumplido. */
  objetivos: readonly { hasta: Condicion; texto: string }[];
  /** Quién cura al equipo al hablarle, y el refugio al que se vuelve al perder desde entonces. */
  curanderos: Readonly<Record<string, string>>;
  /** Quién abre la tienda al acabar de hablarle. */
  tenderos: ReadonlySet<string>;
  /** El refugio al que se vuelve al perder si aún no te han curado en esta isla. */
  refugio: string;
  /** Dónde se aparece al llegar en barco: zona y casilla (de la zona) junto al muelle. */
  llegada: { zona: string; x: number; y: number };
  /** Si se llega desde otra isla por otro muelle: por el número de la isla de la que se viene. */
  llegadas?: Readonly<Record<number, { zona: string; x: number; y: number }>>;
  /** Solo la isla 1: la sala donde empieza la partida. */
  salaInicial?: string;
  /** El campo de cada gimnasio, por su sala (autor, 2026-11-15): dura todos sus combates. */
  campos?: Readonly<Record<string, Campo>>;
  /**
   * El fondo de combate de cada zona o sala (por su id): el nombre del archivo de
   * src/assets/fondos/, sin extensión. Sin fondo propio, los de Lanzarote (exterior y gimnasio).
   */
  fondos?: Readonly<Record<string, string>>;
  /** Los recados, por el id del personaje que los da (HISTORIA.md). */
  recados?: Readonly<Record<string, DefRecado>>;
}

export const LANZAROTE: DatosIsla = {
  numero: 1,
  nombre: 'Lanzarote',
  def: ISLA_1,
  puertas: PUERTAS_ISLA1,
  interiores: INTERIORES_ISLA1,
  encuentros: ENCUENTROS_ISLA1,
  entrenadores: ENTRENADORES_ISLA1,
  guion: GUION_ISLA1,
  objetivos: OBJETIVOS,
  curanderos: { madre: 'casa-jugador', enfermera: 'refugio-geria', 'enfermera-capital': 'refugio-capital' },
  tenderos: new Set(['tendero']),
  refugio: SALA_INICIAL,
  llegada: { zona: 'capital', x: 24, y: 13 },
  salaInicial: SALA_INICIAL,
  // El gimnasio de Roca, con tormenta de arena permanente.
  campos: { gimnasio: { clima: 'arena' } },
  recados: RECADOS_ISLA1,
};

/** Fuerteventura (ISLA-2.md). Fases 1 a 3: de Corralejo a Morro Jable, con el gimnasio de Aire. */
export const FUERTEVENTURA: DatosIsla = {
  numero: 2,
  nombre: 'Fuerteventura',
  def: ISLA_2,
  puertas: PUERTAS_ISLA2,
  interiores: INTERIORES_ISLA2,
  encuentros: ENCUENTROS_ISLA2,
  entrenadores: ENTRENADORES_ISLA2,
  guion: GUION_ISLA2,
  objetivos: [
    { hasta: 'vencido:guarda-betancuria', texto: 'Cruza las dunas y Puerto del Rosario hasta el valle de Betancuria' },
    { hasta: 'gimnasio2-vencido', texto: 'Baja por Ajuy y Sotavento a Morro Jable y vence al gimnasio de Aire' },
    { hasta: 'isla2-completada', texto: 'Toma el barco a Gran Canaria en el muelle de Morro Jable' },
  ],
  curanderos: { 'enfermera-corralejo': 'refugio-corralejo', 'enfermera-puerto': 'refugio-puerto', 'enfermera-betancuria': 'refugio-betancuria', 'enfermera-morro': 'refugio-morro' },
  tenderos: new Set(['tendero-corralejo', 'tendero-puerto', 'tendero-morro']),
  refugio: 'refugio-corralejo',
  llegada: { zona: 'corralejo', x: 12, y: 5 },
  // Desde Gran Canaria se llega al muelle de Morro Jable (probador, 2026-11-22: llegaba a Corralejo).
  llegadas: { 3: { zona: 'morro', x: 19, y: 19 } },
  // El gimnasio de Aire, con el viento a favor de sus entrenadores (el lado 1).
  campos: { 'gimnasio-aire': { vientoAFavor: 1 } },
  // Un fondo por paisaje, no por zona (autor, 2026-11-22: pintarlos cuesta).
  fondos: {
    dunas: 'fv-dunas',
    corralejo: 'fv-costa',
    puerto: 'fv-costa',
    ajuy: 'fv-costa',
    sotavento: 'fv-costa',
    morro: 'fv-costa',
    cofete: 'fv-costa',
    betancuria: 'fv-interior',
    tindaya: 'fv-interior',
    'cueva-ajuy': 'fv-cueva',
    'gimnasio-aire': 'fv-gimnasio-aire',
  },
};

/** Gran Canaria (ISLA-3.md). Fase 1: Las Palmas, con el gimnasio Eléctrico, y La Isleta. */
export const GRAN_CANARIA: DatosIsla = {
  numero: 3,
  nombre: 'Gran Canaria',
  def: ISLA_3,
  puertas: PUERTAS_ISLA3,
  interiores: INTERIORES_ISLA3,
  encuentros: ENCUENTROS_ISLA3,
  entrenadores: ENTRENADORES_ISLA3,
  guion: GUION_ISLA3,
  objetivos: [
    { hasta: 'vencido:aprendiz-electrico-3', texto: 'Vence a los aprendices del gimnasio Eléctrico, en Las Palmas' },
    { hasta: 'amigo2-conocido', texto: 'Sube por Guayadeque y las cumbres hasta el Roque Nublo' },
    { hasta: 'vencido:luchador-3', texto: 'Cruza Tejeda y el pinar de Tamadaba hasta el terrero de Agaete' },
    { hasta: 'gimnasio3-vencido', texto: 'En el terrero de Agaete, lucha con tu amigo contra los dos líderes' },
    { hasta: 'isla3-completada', texto: 'El barco de Agaete a Tenerife saldrá pronto' },
  ],
  curanderos: { 'enfermera-palmas': 'refugio-palmas', 'enfermera-guayadeque': 'refugio-guayadeque', 'enfermera-tejeda': 'refugio-tejeda', 'enfermera-agaete': 'refugio-agaete' },
  tenderos: new Set(['tendero-palmas', 'tendero-tejeda', 'tendero-agaete']),
  refugio: 'refugio-palmas',
  llegada: { zona: 'palmas', x: 26, y: 4 },
  // El gimnasio Eléctrico, con su campo eléctrico (autor, 2026-11-15).
  // El agarre del terrero: tus criaturas pueden quedar confusas (autor, 2026-11-15).
  campos: { 'gimnasio-electrico': { terreno: 'electrico' }, 'gimnasio-lucha': { agarre: true } },
  fondos: { palmas: 'gc-ciudad', isleta: 'gc-isleta', 'gimnasio-electrico': 'gc-gimnasio-electrico', guayadeque: 'gc-barranco', cumbres: 'gc-cumbres', nublo: 'gc-cumbres', tejeda: 'gc-cumbres', tamadaba: 'gc-pinar', agaete: 'gc-isleta', 'gimnasio-lucha': 'gc-terrero', bandama: 'gc-cumbres', maspalomas: 'fv-dunas' },
};

/** Las islas por su número, de este a oeste. */
export const ISLAS: Readonly<Record<number, DatosIsla>> = { 1: LANZAROTE, 2: FUERTEVENTURA, 3: GRAN_CANARIA };
