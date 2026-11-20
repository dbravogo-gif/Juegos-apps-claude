// Los equipos de los entrenadores de la isla 1. Los niveles suben con el recorrido; los premios, en
// dinero, también. El primer entrenador saca la inicial que pierde contra la tuya (`RIVAL_DE`).

import type { Condicion } from '../core/mundo';

export interface DefEntrenador {
  /** Especie y nivel de cada criatura. Vacío: se decide en el combate (el primer entrenador). */
  equipo: readonly { especie: string; nivel: number }[];
  premio: number;
  /** Lo que dice si se le habla después de vencerle. */
  tras: string;
  /** Lo que se consigue al vencerle (la líder abre el barco). */
  condicion?: Condicion;
  /** Lo que dice nada más vencerle, al volver del combate (abrir una compuerta, dar la pintadera). */
  alVencer?: readonly string[];
  /** La isla cuya pintadera da (los líderes de gimnasio). */
  medalla?: number;
  /**
   * Tu rival (el amigo): saca la inicial del pueblo al que ataca el tuyo, a este nivel, y después las
   * de `extra` (HISTORIA.md). Su `equipo` va vacío: depende de tu inicial.
   */
  rival?: { nivel: number; extra?: readonly { especie: string; nivel: number }[] };
  /** Un soldado de la rama que te persigue: lucha con criaturas de su pueblo, a estos niveles. */
  rama?: { niveles: readonly number[] };
}

/** Cómo se presenta cada clase de entrenador en el diálogo, por el principio de su id. */
const OFICIO: Readonly<Record<string, string>> = {
  aprendiz: 'Aprendiz',
  buscador: 'Buscador',
  cabrero: 'Cabrero',
  corredor: 'Corredor',
  entrenador: 'Entrenador',
  excursionista: 'Excursionista',
  explorador: 'Explorador',
  guarda: 'Guarda',
  kite: 'Kitesurfista',
  lider: 'Líder',
  montanera: 'Montañera',
  paseante: 'Paseante',
  pastor: 'Pastor',
  perdido: 'Excursionista perdido',
  peregrino: 'Peregrino',
  pescador: 'Pescador',
  pulpero: 'Pulpero',
  surfista: 'Surfista',
  soldado: 'Soldado de {rama}',
  // Tu amigo habla con el nombre que le pusiste.
  amigo: '{amigo}',
};

/** El nombre con que habla un entrenador (probador, 2026-11-13: sus frases no decían quién hablaba). */
export function quienEs(id: string): string | undefined {
  return OFICIO[id.split('-')[0]];
}

export const ENTRENADORES_ISLA1: Readonly<Record<string, DefEntrenador>> = {
  'entrenador-barrera': { equipo: [], premio: 100, tras: 'Vale, vale: puedes subir. ¡Pero que conste que la ladera es mía!' },
  'entrenador-llano': { equipo: [{ especie: 'c031-1', nivel: 5 }, { especie: 'c037-1', nivel: 4 }], premio: 120, tras: 'En la hierba seca hay más criaturas de las que se ven.' },
  excursionista: { equipo: [{ especie: 'c013-1', nivel: 7 }], premio: 160, tras: 'Desde aquí arriba se ve medio Timanfaya. Merece la pena, ¿eh?' },
  'entrenador-centro': { equipo: [{ especie: 'c043-1', nivel: 7 }, { especie: 'c013-1', nivel: 6 }], premio: 180, tras: 'Tendré que entrenar con más calor todavía.' },
  'entrenador-caldera': { equipo: [{ especie: 'c007-1', nivel: 8 }], premio: 200, tras: 'Quédate la poción, anda. Te la has ganado.' },
  'entrenador-salida-fuego': { equipo: [{ especie: 'c013-1', nivel: 8 }, { especie: 'c031-1', nivel: 8 }], premio: 240, tras: 'Sigue hacia El Jable. La capital está al otro lado.' },
  'entrenador-jable': { equipo: [{ especie: 'c034-1', nivel: 8 }, { especie: 'c005-1', nivel: 9 }], premio: 240, tras: 'El viento borra las huellas. Mañana nadie sabrá que me ganaste.' },
  'pescador-famara': { equipo: [{ especie: 'c018-1', nivel: 8 }, { especie: 'c037-1', nivel: 9 }], premio: 260, tras: 'Hoy no pican ni las viejas ni las criaturas. Qué le vamos a hacer.' },
  'pulpero-famara': { equipo: [{ especie: 'c035-1', nivel: 9 }, { especie: 'c007-1', nivel: 8 }], premio: 260, tras: 'Ni un pulpo y encima pierdo. ¡Qué día!' },
  // Los aprendices del gimnasio de Roca (gimnasio-roca.ts): te ven en el único camino.
  // Solo Roca y Tierra, y ninguna criatura más de dos veces en todo el gimnasio (autor, 2026-11-19).
  'aprendiz-roca-1': {
    equipo: [{ especie: 'c012-1', nivel: 9 }],
    premio: 270,
    tras: 'La líder dice que la roca aguanta lo que le echen. Contigo no ha aguantado.',
  },
  'aprendiz-roca-2': {
    equipo: [{ especie: 'c034-1', nivel: 9 }],
    premio: 300,
    tras: 'Mira bien las columnas: son hexagonales. Así se enfría el basalto.',
  },
  'aprendiz-roca-3': {
    equipo: [{ especie: 'c012-1', nivel: 10 }, { especie: 'c062-1', nivel: 10 }],
    premio: 320,
    tras: 'La palanca está ahí al lado. Bájala, que la líder te espera.',
  },
  // La revancha en el muelle, al vencer al gimnasio (HISTORIA.md, parte 3).
  'amigo-muelle': {
    equipo: [],
    rival: { nivel: 13, extra: [{ especie: 'c043-1', nivel: 11 }] },
    premio: 400,
    tras: 'Vale, vale: la ventana es tuya. ¡Nos vemos en Fuerteventura!',
  },
  'lider-gimnasio': {
    // Ishiro e Ishiradon, el dinosaurio de casco: la única 2.ª forma del gimnasio, la de la líder
    // (autor, 2026-11-19). Las iniciales no las lleva ningún entrenador, salvo tu amigo.
    equipo: [{ especie: 'c034-1', nivel: 11 }, { especie: 'c062-1', nivel: 11 }, { especie: 'c062-2', nivel: 12 }],
    premio: 600,
    tras: 'Me has vencido con justicia. El barco te espera en el puerto.',
    condicion: 'gimnasio-vencido',
    alVencer: [
      '¡Qué combate! Tienes la cabeza tan dura como el basalto.',
      'Toma: la pintadera de Lanzarote. Con ella, todo el archipiélago sabrá que has vencido al gimnasio de Roca.',
      'Esta pintadera es una pieza de algo más grande. Guárdala bien: hay quien lleva años buscándolas.',
      '{nombre} recibe la pintadera de Lanzarote.',
      'Ve al puerto: con la pintadera, el marinero te llevará a Fuerteventura.',
    ],
    medalla: 1,
  },
};
