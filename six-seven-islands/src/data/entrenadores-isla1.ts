// Los equipos de los entrenadores de la isla 1 (PROVISIONAL, 2026-11-12): con las salvajes de
// relleno, hasta que lleguen las criaturas del autor y se decida dónde va cada una. Los niveles
// suben con el recorrido; los premios, en dinero, también. El primer entrenador saca la inicial
// que pierde contra la tuya (`RIVAL_DE`), para que el primer combate enseñe un «¡Es muy eficaz!».

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
}

export const ENTRENADORES_ISLA1: Readonly<Record<string, DefEntrenador>> = {
  'entrenador-barrera': { equipo: [], premio: 100, tras: 'Vale, vale: puedes subir. ¡Pero que conste que la ladera es mía!' },
  'entrenador-llano': { equipo: [{ especie: 'lagartija-de-picon', nivel: 5 }, { especie: 'cangrejo-de-charco', nivel: 4 }], premio: 120, tras: 'En la hierba seca hay más criaturas de las que se ven.' },
  excursionista: { equipo: [{ especie: 'chispa-de-colada', nivel: 7 }], premio: 160, tras: 'Desde aquí arriba se ve medio Timanfaya. Merece la pena, ¿eh?' },
  'entrenador-centro': { equipo: [{ especie: 'lagartija-de-picon', nivel: 7 }, { especie: 'chispa-de-colada', nivel: 6 }], premio: 180, tras: 'Tendré que entrenar con más calor todavía.' },
  'entrenador-caldera': { equipo: [{ especie: 'tabaiba-andante', nivel: 8 }], premio: 200, tras: 'Quédate la poción, anda. Te la has ganado.' },
  'entrenador-salida-fuego': { equipo: [{ especie: 'chispa-de-colada', nivel: 8 }, { especie: 'lagartija-de-picon', nivel: 8 }], premio: 240, tras: 'Sigue hacia El Jable. La capital está al otro lado.' },
  'entrenador-jable': { equipo: [{ especie: 'tabaiba-andante', nivel: 8 }, { especie: 'lagartija-de-picon', nivel: 9 }], premio: 240, tras: 'El viento borra las huellas. Mañana nadie sabrá que me ganaste.' },
  'pescador-famara': { equipo: [{ especie: 'cangrejo-de-charco', nivel: 9 }, { especie: 'cangrejo-de-charco', nivel: 9 }], premio: 260, tras: 'Hoy no pican ni las viejas ni las criaturas. Qué le vamos a hacer.' },
  'pulpero-famara': { equipo: [{ especie: 'cangrejo-de-charco', nivel: 9 }, { especie: 'tabaiba-andante', nivel: 8 }], premio: 260, tras: 'Ni un pulpo y encima pierdo. ¡Qué día!' },
  // Los aprendices del gimnasio de Roca (gimnasio-roca.ts): vencerlos abre sus compuertas.
  'aprendiz-roca-1': {
    equipo: [{ especie: 'lagartija-de-picon', nivel: 9 }],
    premio: 270,
    tras: 'La líder dice que la roca aguanta lo que le echen. Contigo no ha aguantado.',
    alVencer: ['Con un estruendo, la compuerta de basalto se hunde en la lava. ¡El paso está abierto!'],
  },
  'aprendiz-roca-2': {
    equipo: [{ especie: 'inicial-roca', nivel: 9 }, { especie: 'lagartija-de-picon', nivel: 9 }],
    premio: 300,
    tras: 'Mira bien las columnas: son hexagonales. Así se enfría el basalto.',
    alVencer: ['Se oye un crujido al fondo: la segunda compuerta baja.'],
  },
  'aprendiz-roca-3': {
    equipo: [{ especie: 'inicial-roca', nivel: 10 }],
    premio: 320,
    tras: 'La palanca está ahí al lado. Bájala, que la líder te espera.',
  },
  'lider-gimnasio': {
    equipo: [{ especie: 'lagartija-de-picon', nivel: 11 }, { especie: 'inicial-roca', nivel: 12 }],
    premio: 600,
    tras: 'Me has vencido con justicia. El barco te espera en el puerto.',
    condicion: 'gimnasio-vencido',
    alVencer: [
      '¡Qué combate! Tienes la cabeza tan dura como el basalto.',
      'Toma: la pintadera de Lanzarote. Con ella, todo el archipiélago sabrá que has vencido al gimnasio de Roca.',
      '{nombre} recibe la pintadera de Lanzarote.',
      'Ve al puerto: con la pintadera, el marinero te llevará a Fuerteventura.',
    ],
    medalla: 1,
  },
};
