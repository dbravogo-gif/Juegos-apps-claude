// Los entrenadores de la isla 3, Gran Canaria (PROVISIONAL): por encima de la líder de
// Fuerteventura, del 20 al 24 en esta fase, con las criaturas del autor que ya hay.
// El gimnasio Eléctrico todavía no tiene criaturas eléctricas: sus aprendices sacan, mientras tanto,
// criaturas de Aire y de Agua (las que más le pegan a un gimnasio de rayos y tormentas). En cuanto
// lleguen Voltéro, Briso, Tembladera o Chispa de cable (PLAN-CRIATURAS.md), se cambian.

import type { DefEntrenador } from './entrenadores-isla1';

export const ENTRENADORES_ISLA3: Readonly<Record<string, DefEntrenador>> = {
  'surfista-canteras': {
    equipo: [{ especie: 'c018-1', nivel: 20 }, { especie: 'c035-1', nivel: 21 }],
    premio: 540,
    tras: 'La ola de La Cicer rompe a la izquierda. Tu equipo, a la derecha. ¡Qué bárbaro!',
  },
  'estudiante-triana': {
    equipo: [{ especie: 'c044-2', nivel: 24 }],
    premio: 560,
    tras: 'Conclusión del experimento: tú cargas más energía que yo. Lo apunto.',
  },
  'pescador-isleta': {
    equipo: [{ especie: 'c037-1', nivel: 21 }, { especie: 'c018-1', nivel: 21 }],
    premio: 560,
    tras: 'Hoy la mar está picada. Mis criaturas, más.',
  },
  'excursionista-isleta': {
    equipo: [{ especie: 'c013-2', nivel: 21 }, { especie: 'c012-2', nivel: 22 }],
    premio: 580,
    tras: 'Desde el volcán grande se ve el puerto entero. Sube, que merece la pena.',
  },
  'buscador-isleta': {
    equipo: [{ especie: 'c043-2', nivel: 22 }, { especie: 'c005-2', nivel: 22 }],
    premio: 600,
    tras: 'Vale, sigue hacia el faro. Mi tradición se ha quedado sin tradición.',
  },
  // El gimnasio Eléctrico (gimnasio-electrico.ts): el líder no está.
  'aprendiz-electrico-1': {
    equipo: [{ especie: 'c035-1', nivel: 22 }, { especie: 'c018-1', nivel: 22 }],
    premio: 620,
    tras: 'Baja la palanca y la barrera se apaga. ¡Sin tocar los hilos!',
    alVencer: ['Venga, la palanca es tuya. Bájala con E.'],
  },
  'aprendiz-electrico-2': {
    equipo: [{ especie: 'c032-2', nivel: 23 }],
    premio: 640,
    tras: 'La palanca de aquí apaga la barrera de arriba. La de abajo ya la apagaste tú.',
  },
  'aprendiz-electrico-3': {
    equipo: [{ especie: 'c044-2', nivel: 24 }, { especie: 'c035-2', nivel: 25 }],
    premio: 700,
    tras: 'El líder está en Agaete, en el terrero. Allí te esperan los dos líderes de la isla.',
    alVencer: [
      'Uf… Me toca decírtelo: el líder no está.',
      'Se fue a Agaete, al terrero de lucha. Dice que esta vez lucharán los dos líderes juntos.',
      'Cruza la isla hasta el oeste. Y lleva a alguien que te ayude: van a ser dos contra dos.',
    ],
  },
};
