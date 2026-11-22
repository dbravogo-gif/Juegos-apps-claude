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
    tras: 'Antes se subía al volcán grande. Ahora está cerrado, por las piedras sueltas. ¡Una pena!',
  },
  'buscador-isleta': {
    equipo: [{ especie: 'c043-2', nivel: 22 }, { especie: 'c005-2', nivel: 22 }],
    premio: 600,
    tras: 'Vale, sigue hacia el faro. Mi tradición se ha quedado sin tradición.',
  },
  // Fase 2: Guayadeque, las cumbres y el Roque Nublo.
  'cabrero-guayadeque': {
    equipo: [{ especie: 'c034-1', nivel: 22 }, { especie: 'c012-2', nivel: 22 }],
    premio: 620,
    tras: 'Las cabras ya se han ido para arriba. Yo me quedo aquí, a la sombra.',
  },
  'excursionista-guayadeque': {
    equipo: [{ especie: 'c005-2', nivel: 23 }, { especie: 'c062-1', nivel: 22 }],
    premio: 640,
    tras: 'Si tienes hambre, en la cueva del restaurante ponen un queso de flor buenísimo.',
  },
  'montanera-cumbres': {
    equipo: [{ especie: 'c031-2', nivel: 23 }, { especie: 'c032-2', nivel: 24 }],
    premio: 680,
    tras: 'Sigue la senda hacia el norte. El Roque Nublo se ve en cuanto pasas el último muro.',
  },
  'corredor-cumbres': {
    equipo: [{ especie: 'c043-2', nivel: 24 }],
    premio: 680,
    tras: 'Arriba hay gente rara con uniforme. No me han dejado pasar a hacer la foto de siempre.',
  },
  // El comandante de la rama que te persigue (HISTORIA.md): lucha con criaturas de su pueblo.
  'comandante-nublo': {
    equipo: [],
    rama: { niveles: [24, 25, 26] },
    premio: 1200,
    tras: '',
    alVencer: [
      '¡Bah! El jefe dijo que eras un crío con suerte. No me dijo que tuvieras tanta.',
      'Nos vamos… por ahora. Desde aquí ya hemos visto lo que veníamos a ver.',
      'Los de {rama} bajan por la ladera y se pierden entre las nubes.',
    ],
  },
  // Fase 3: Tejeda, Tamadaba y Agaete.
  'paseante-tejeda': { equipo: [{ especie: 'c034-2', nivel: 25 }], premio: 700, tras: 'Los bienmesabes, en la dulcería de la plaza. Ya me contarás.' },
  'pastor-tejeda': {
    equipo: [{ especie: 'c031-2', nivel: 24 }, { especie: 'c043-2', nivel: 25 }],
    premio: 700,
    tras: 'El pinar es largo y hay niebla. Si te pierdes, sigue la senda de piedra.',
  },
  'excursionista-tamadaba': {
    equipo: [{ especie: 'c007-2', nivel: 26 }, { especie: 'c032-2', nivel: 25 }],
    premio: 740,
    tras: 'Cuando se levanta la niebla, desde aquí se ve Tenerife entera. Hoy, nada de nada.',
  },
  'buscador-tamadaba': {
    equipo: [{ especie: 'c044-2', nivel: 26 }, { especie: 'c005-2', nivel: 26 }],
    premio: 760,
    tras: 'Vale, vale. Las piñas, para ti también, si quieres.',
  },
  'guarda-tamadaba': {
    equipo: [{ especie: 'c013-2', nivel: 26 }, { especie: 'c035-2', nivel: 27 }],
    premio: 800,
    tras: 'Respetas el monte. Baja a Agaete: el terrero está junto al mar.',
  },
  'pescador-agaete': {
    equipo: [{ especie: 'c018-1', nivel: 26 }, { especie: 'c037-1', nivel: 27 }],
    premio: 780,
    tras: 'Si vas al terrero, que no te agarren por la cintura. Es lo primero que hacen.',
  },
  // El terrero de Agaete (gimnasio-lucha.ts): tres luchadores, de uno en uno, que preguntan antes.
  // Lucha (Kotono y Koloi, la única línea de Lucha que hay) y, mientras, Tierra y Roca.
  'luchador-1': {
    equipo: [{ especie: 'c043-2', nivel: 25 }, { especie: 'c034-2', nivel: 25 }],
    premio: 800,
    tras: '',
    pregunta: true,
    alVencer: ['¡Qué agarre! Me has tumbado limpio.', 'Ahora sale el segundo. Ese no suelta nunca.'],
  },
  'luchador-2': {
    equipo: [{ especie: 'c043-2', nivel: 26 }, { especie: 'c012-2', nivel: 26 }],
    premio: 840,
    tras: '',
    pregunta: true,
    alVencer: ['¡Me rindo, me rindo! Tienes más maña que fuerza, y eso aquí vale el doble.', 'Queda el último. Es el mejor del terrero después de los líderes.'],
  },
  'luchador-3': {
    equipo: [{ especie: 'c043-2', nivel: 27 }, { especie: 'c062-1', nivel: 27 }, { especie: 'c034-2', nivel: 27 }],
    premio: 900,
    tras: '',
    pregunta: true,
    alVencer: [
      '¡Increíble! Has vencido a los tres luchadores del terrero.',
      'Los líderes ya lo saben. Dicen que vendrán los dos juntos… y que traigas a alguien.',
    ],
  },
  // El gimnasio Eléctrico (gimnasio-electrico.ts): el líder no está.
  'aprendiz-electrico-1': {
    equipo: [{ especie: 'c035-1', nivel: 22 }, { especie: 'c018-1', nivel: 22 }],
    premio: 620,
    tras: 'Un truco: cuando caiga el relámpago, no mires a tus pies. Mira lejos.',
  },
  'aprendiz-electrico-2': {
    equipo: [{ especie: 'c032-2', nivel: 23 }],
    premio: 640,
    tras: 'La sala del líder está arriba, en el centro. El camino da muchas vueltas.',
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
