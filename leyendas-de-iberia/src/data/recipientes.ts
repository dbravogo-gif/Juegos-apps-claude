// Recipientes que se pueden registrar por el mapa. El brief los llama papeleras; en 1492 son
// tinajas, y en los capítulos modernos serán papeleras. La mecánica es la misma.

/** Probabilidades, sobre 100, de lo que sale al registrar un recipiente. Deben sumar 100. */
export const PROB_RECIPIENTE = { objeto: 60, nada: 30, mimico: 10 };

/** Objetos que pueden salir en cada zona, con su peso. Van con la progresión del capítulo. */
export const OBJETOS_RECIPIENTE: Record<string, { objeto: string; peso: number }[]> = {
  santa_fe: [
    { objeto: 'unguento', peso: 30 },
    { objeto: 'tesera', peso: 25 },
    { objeto: 'aloe', peso: 12 },
    { objeto: 'sales', peso: 12 },
    { objeto: 'ruda', peso: 10 },
    { objeto: 'higo', peso: 6 },
    { objeto: 'emplasto', peso: 5 },
  ],
  vega: [
    { objeto: 'unguento', peso: 25 },
    { objeto: 'tesera', peso: 20 },
    { objeto: 'emplasto', peso: 12 },
    { objeto: 'aloe', peso: 10 },
    { objeto: 'sales', peso: 10 },
    { objeto: 'ruda', peso: 8 },
    { objeto: 'endrina', peso: 5 },
    { objeto: 'tuno', peso: 5 },
    { objeto: 'polvora', peso: 3 },
    { objeto: 'aliento', peso: 2 },
  ],
  alhambra: [
    { objeto: 'emplasto', peso: 25 },
    { objeto: 'tesera_plata', peso: 20 },
    { objeto: 'unguento', peso: 15 },
    { objeto: 'panacea', peso: 8 },
    { objeto: 'romero', peso: 8 },
    { objeto: 'brebaje_magia', peso: 8 },
    { objeto: 'brebaje_celeridad', peso: 8 },
    { objeto: 'aliento', peso: 5 },
    { objeto: 'tesera_oro', peso: 3 },
  ],
};

/** Lo que da el Papemímico al vencerlo o capturarlo, una vez por encuentro. */
export const RECOMPENSA_MIMICO = { objeto: 'turron', cantidad: 3 };
