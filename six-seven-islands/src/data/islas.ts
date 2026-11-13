// Las islas del juego (2026-11-13, al empezar Fuerteventura): todo lo propio de cada una en un
// sitio, para que «partida», «combate» y el mapa no conozcan una isla concreta. Se viaja entre
// ellas en barco: se guarda la partida en la isla de destino y se recarga la página.

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
  /** Solo la isla 1: la sala donde empieza la partida. */
  salaInicial?: string;
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
    { hasta: 'gimnasio2-vencido', texto: 'Cruza la isla hasta Morro Jable y vence al gimnasio de Aire' },
    // El barco a Gran Canaria aún no sale (la isla 3 está por aprobar, ISLA-3.md).
    { hasta: 'isla2-completada', texto: 'Explora Tindaya y Cofete mientras el barco a Gran Canaria se prepara' },
  ],
  curanderos: { 'enfermera-corralejo': 'refugio-corralejo', 'enfermera-puerto': 'refugio-puerto', 'enfermera-betancuria': 'refugio-betancuria', 'enfermera-morro': 'refugio-morro' },
  tenderos: new Set(['tendero-corralejo', 'tendero-puerto', 'tendero-morro']),
  refugio: 'refugio-corralejo',
  llegada: { zona: 'corralejo', x: 12, y: 5 },
};

/** Las islas por su número, de este a oeste. */
export const ISLAS: Readonly<Record<number, DatosIsla>> = { 1: LANZAROTE, 2: FUERTEVENTURA };
