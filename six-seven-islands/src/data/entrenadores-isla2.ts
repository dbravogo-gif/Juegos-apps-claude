// Los entrenadores de la isla 2, Fuerteventura (PROVISIONAL, 2026-11-13): equipos con las salvajes
// de relleno, por encima de la líder de Lanzarote (niveles 11 y 12).

import type { DefEntrenador } from './entrenadores-isla1';

export const ENTRENADORES_ISLA2: Readonly<Record<string, DefEntrenador>> = {
  'perdido-dunas-1': {
    equipo: [{ especie: 'lagartija-de-picon', nivel: 12 }, { especie: 'chispa-de-colada', nivel: 11 }],
    premio: 320,
    tras: 'Creo que Corralejo queda… ¿hacia allí? ¿O era hacia allá?',
  },
  'perdido-dunas-2': {
    equipo: [{ especie: 'tabaiba-andante', nivel: 13 }],
    premio: 340,
    tras: 'Si ves el horno de cal, ya casi has cruzado la mitad. Eso me dijeron.',
  },
  // Fase 2.
  'paseante-puerto': {
    equipo: [{ especie: 'cangrejo-de-charco', nivel: 13 }, { especie: 'tabaiba-andante', nivel: 13 }],
    premio: 360,
    tras: 'Mañana vuelvo a pasear. Y a retar. Me gusta perder con estilo.',
  },
  'guarda-betancuria': {
    equipo: [{ especie: 'lagartija-de-picon', nivel: 14 }, { especie: 'inicial-roca', nivel: 15 }],
    premio: 420,
    tras: 'Pasa, pasa. El camino de Ajuy baja por el barranco hasta el mar.',
  },
  'cabrero-betancuria': {
    equipo: [{ especie: 'tabaiba-andante', nivel: 14 }],
    premio: 380,
    tras: 'Mis cabras ni se han enterado. Siguen comiendo aulagas tan tranquilas.',
  },
  'pescador-ajuy': {
    equipo: [{ especie: 'cangrejo-de-charco', nivel: 15 }, { especie: 'cangrejo-de-charco', nivel: 14 }],
    premio: 420,
    tras: 'Dentro de la cueva el mar entra con las mareas. Ten cuidado con las pozas.',
  },
  'explorador-cueva': {
    equipo: [{ especie: 'chispa-de-colada', nivel: 15 }, { especie: 'lagartija-de-picon', nivel: 16 }],
    premio: 460,
    tras: 'Lo que brilla está al fondo, a la izquierda. Yo ya me he cansado de buscar.',
  },
  'buscador-dunas': {
    equipo: [{ especie: 'chispa-de-colada', nivel: 12 }, { especie: 'lagartija-de-picon', nivel: 13 }],
    premio: 380,
    tras: 'Hoy solo he encontrado arena. Y a ti, que me has ganado.',
  },
};
