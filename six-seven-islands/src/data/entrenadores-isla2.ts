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
  // Fase 3: Sotavento y el gimnasio de Aire (Morro Jable), con las dos de Aire de relleno.
  'kite-sotavento-1': { equipo: [{ especie: 'remolino-de-jable', nivel: 16 }], premio: 440, tras: 'Mañana sopla más. ¡Revancha con más viento!' },
  'kite-sotavento-2': {
    equipo: [{ especie: 'cangrejo-de-charco', nivel: 16 }, { especie: 'lagartija-de-picon', nivel: 17 }],
    premio: 460,
    tras: 'El gimnasio está en Morro Jable. Allí el viento sí que manda.',
  },
  'corredor-sotavento': { equipo: [{ especie: 'lagartija-de-picon', nivel: 17 }], premio: 460, tras: 'Contra el viento corro más despacio. Contra ti, también he perdido.' },
  'aprendiz-aire-1': { equipo: [{ especie: 'remolino-de-jable', nivel: 17 }], premio: 480, tras: 'La corriente del centro solo sube hacia la líder si alguien gira las aspas de arriba a la derecha.' },
  'aprendiz-aire-2': { equipo: [{ especie: 'remolino-de-jable', nivel: 18 }], premio: 500, tras: 'Gira esas aspas de ahí y la corriente del centro te subirá hasta la líder.' },
  'aprendiz-aire-3': {
    equipo: [{ especie: 'remolino-de-jable', nivel: 18 }, { especie: 'guirre-de-viento', nivel: 17 }],
    premio: 520,
    tras: 'Si el pasillo te devuelve, es que las aspas de arriba siguen sin girar.',
  },
  'lider-aire': {
    equipo: [{ especie: 'remolino-de-jable', nivel: 20 }, { especie: 'guirre-de-viento', nivel: 21 }],
    premio: 900,
    tras: 'El viento sopla hacia Gran Canaria. Cuando salga el barco, ahí estarás.',
    condicion: 'gimnasio2-vencido',
    alVencer: [
      '¡Me has dejado sin aliento! Has dominado el viento de mi gimnasio.',
      'Toma: la pintadera de Fuerteventura. Ya llevas dos.',
      '{nombre} recibe la pintadera de Fuerteventura.',
      'El barco a Gran Canaria aún no sale… pero el viento ya sopla hacia allí.',
    ],
    medalla: 2,
  },
  'buscador-dunas': {
    equipo: [{ especie: 'chispa-de-colada', nivel: 12 }, { especie: 'lagartija-de-picon', nivel: 13 }],
    premio: 380,
    tras: 'Hoy solo he encontrado arena. Y a ti, que me has ganado.',
  },
  // Fase 4: las zonas opcionales, algo más fuertes que el camino (Tindaya, 15 y 16; Cofete, 18 y 19).
  'montanera-tindaya': {
    equipo: [{ especie: 'tabaiba-andante', nivel: 15 }, { especie: 'lagartija-de-picon', nivel: 15 }],
    premio: 450,
    tras: 'Arriba, en la cima, hay pies grabados en la roca. Sube a verlos.',
  },
  'peregrino-tindaya': { equipo: [{ especie: 'chispa-de-colada', nivel: 16 }], premio: 480, tras: 'Desde aquí arriba, a veces se ve algo en el mar, hacia el oeste. Hoy no.' },
  'pastor-jandia': {
    equipo: [{ especie: 'cangrejo-de-charco', nivel: 18 }, { especie: 'tabaiba-andante', nivel: 18 }],
    premio: 540,
    tras: 'Abajo está Cofete. Las criaturas de esa hierba no son como las de Morro Jable.',
  },
  'surfista-cofete': {
    equipo: [{ especie: 'lagartija-de-picon', nivel: 18 }, { especie: 'chispa-de-colada', nivel: 19 }],
    premio: 560,
    tras: 'Si vienes por aquí, que sea con buen equipo. Este mar no perdona.',
  },
};
