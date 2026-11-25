// El recorrido de cada isla para el simulador de partida (2026-11-25): las zonas en el orden en que
// las cruza un jugador, con sus entrenadores. `forzoso`: hay que vencerlo para seguir (historia o
// gimnasio). Las zonas `opcional` solo las hace el perfil «completo». Los combates de hierba no van
// aquí: el simulador cuenta las casillas de encuentros del camino más corto con el mapa de verdad.
// Una prueba (tests/equilibrio.test.ts) exige que todo entrenador de cada isla esté en su recorrido.

export interface Tramo {
  zona: string;
  /** Una zona fuera del camino (Famara, Tindaya, Cofete…): solo el perfil «completo». */
  opcional?: boolean;
  entrenadores: readonly { id: string; forzoso?: boolean }[];
}

export interface Recorrido {
  isla: number;
  tramos: readonly Tramo[];
  /** Los combates que se miden con la probabilidad de ganar a la primera, en orden. */
  jefes: readonly string[];
}

const f = (id: string) => ({ id, forzoso: true });
const o = (id: string) => ({ id });

export const RECORRIDOS: readonly Recorrido[] = [
  {
    isla: 1,
    tramos: [
      { zona: 'inicial', entrenadores: [] },
      { zona: 'combates', entrenadores: [f('entrenador-barrera'), o('entrenador-llano')] },
      { zona: 'pueblo', entrenadores: [] },
      { zona: 'fuego', entrenadores: [o('excursionista'), o('entrenador-centro'), o('entrenador-caldera'), f('entrenador-salida-fuego')] },
      { zona: 'famara', opcional: true, entrenadores: [o('pescador-famara'), o('pulpero-famara')] },
      { zona: 'jable', entrenadores: [o('entrenador-jable')] },
      { zona: 'capital', entrenadores: [] },
      { zona: 'gimnasio', entrenadores: [f('aprendiz-roca-1'), f('aprendiz-roca-2'), f('aprendiz-roca-3'), f('lider-gimnasio'), f('amigo-muelle')] },
    ],
    jefes: ['entrenador-barrera', 'lider-gimnasio'],
  },
  {
    isla: 2,
    tramos: [
      { zona: 'corralejo', entrenadores: [] },
      { zona: 'dunas', entrenadores: [o('perdido-dunas-1'), o('perdido-dunas-2'), o('buscador-dunas'), f('soldado-dunas-1')] },
      { zona: 'tindaya', opcional: true, entrenadores: [o('montanera-tindaya'), o('peregrino-tindaya')] },
      { zona: 'puerto', entrenadores: [o('paseante-puerto')] },
      { zona: 'betancuria', entrenadores: [f('guarda-betancuria'), o('cabrero-betancuria')] },
      { zona: 'ajuy', entrenadores: [o('pescador-ajuy')] },
      { zona: 'cueva-ajuy', opcional: true, entrenadores: [o('explorador-cueva')] },
      { zona: 'sotavento', entrenadores: [o('kite-sotavento-1'), o('kite-sotavento-2'), o('corredor-sotavento')] },
      { zona: 'morro', entrenadores: [] },
      { zona: 'cofete', opcional: true, entrenadores: [o('pastor-jandia'), o('surfista-cofete')] },
      { zona: 'gimnasio-aire', entrenadores: [f('aprendiz-aire-1'), f('aprendiz-aire-2'), f('aprendiz-aire-3'), f('lider-aire')] },
    ],
    jefes: ['lider-aire'],
  },
  {
    isla: 3,
    tramos: [
      { zona: 'palmas', entrenadores: [o('surfista-canteras'), o('estudiante-triana')] },
      { zona: 'gimnasio-electrico', entrenadores: [f('aprendiz-electrico-1'), f('aprendiz-electrico-2'), f('aprendiz-electrico-3')] },
      { zona: 'isleta', entrenadores: [o('pescador-isleta'), o('excursionista-isleta'), o('buscador-isleta')] },
      { zona: 'bandama', opcional: true, entrenadores: [o('excursionista-bandama')] },
      { zona: 'guayadeque', entrenadores: [o('cabrero-guayadeque'), o('excursionista-guayadeque')] },
      { zona: 'cumbres', entrenadores: [o('montanera-cumbres'), o('corredor-cumbres')] },
      { zona: 'nublo', entrenadores: [f('comandante-nublo')] },
      { zona: 'maspalomas', opcional: true, entrenadores: [o('surfista-maspalomas'), o('buscador-maspalomas')] },
      { zona: 'tejeda', entrenadores: [o('paseante-tejeda'), o('pastor-tejeda')] },
      { zona: 'tamadaba', entrenadores: [o('excursionista-tamadaba'), o('buscador-tamadaba'), o('guarda-tamadaba')] },
      { zona: 'agaete', entrenadores: [o('pescador-agaete')] },
      // El líder Eléctrico no lucha solo: va con la de Lucha en el dos contra dos (`pareja`).
      { zona: 'gimnasio-lucha', entrenadores: [f('luchador-1'), f('luchador-2'), f('luchador-3'), f('lider-lucha')] },
    ],
    jefes: ['aprendiz-electrico-3', 'comandante-nublo', 'lider-lucha'],
  },
];

/** Los entrenadores que no se luchan por separado (van con otro en un dos contra dos). */
export const SOLO_EN_PAREJA: ReadonlySet<string> = new Set(['lider-electrico']);
