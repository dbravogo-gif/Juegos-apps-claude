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
  'buscador-dunas': {
    equipo: [{ especie: 'chispa-de-colada', nivel: 12 }, { especie: 'lagartija-de-picon', nivel: 13 }],
    premio: 380,
    tras: 'Hoy solo he encontrado arena. Y a ti, que me has ganado.',
  },
};
