// Diálogos de la isla 1, Lanzarote, por id de personaje (src/core/guion.ts). Contenido propio.
// Las cinco leyendas guiaban cinco naciones enfrentadas en círculo (autor, 2026-11-13): el fuego
// ataca a la roca, la roca avanza sobre la tierra, la tierra lucha con el agua, el agua con la
// planta y la planta odia al fuego. Textos provisionales hasta la historia del autor
// (PROMPT-HISTORIA.md). Los personajes sin diálogo aquí dicen su `frase` del mapa.

import type { Dialogo, Guion, Linea } from '../core/guion';

const DOCTORA = 'Doctora';

/** La historia de cada leyenda, la que cuenta su estatua. */
const HISTORIA: Record<string, readonly Linea[]> = {
  planta: [
    { texto: 'Una placa dice: «La leyenda verde vivía en los hoyos de picón, donde la vid crece sin apenas lluvia».' },
    { texto: '«Cuando el volcán cubrió la isla de ceniza, hizo brotar la vida otra vez entre la lava».' },
    { texto: '«Su pueblo odiaba al de la leyenda infernal, que sepultó sus campos bajo el fuego».' },
  ],
  agua: [
    { texto: 'Una placa dice: «La leyenda del agua dormía en los jameos, las cuevas de lava donde entra el mar».' },
    { texto: '«Traía la humedad del océano a una isla casi sin lluvia, y apagaba las coladas al llegar a la costa».' },
    { texto: '«Su pueblo luchó contra el de la leyenda verde, que le robaba con sus raíces la poca agua de la isla».' },
  ],
  infernal: [
    { texto: 'Una placa dice: «La leyenda infernal nació bajo las Montañas del Fuego, donde la tierra aún quema».' },
    { texto: '«Durante seis años hizo arder la isla y la hizo crecer hacia el mar».' },
    { texto: '«Su pueblo, el más agresivo, atacó sin descanso al de la leyenda de roca, que sepultaba sus coladas».' },
  ],
  roca: [
    { texto: 'Una placa dice: «La leyenda de roca dormía en el risco del norte, el acantilado más alto de la isla».' },
    { texto: '«Cuando una colada bajaba hacia los pueblos, se ponía delante y la sepultaba bajo su caparazón de piedra».' },
    { texto: '«Su pueblo avanzaba sin descanso: cada colada enfriada cubría los campos del pueblo de la leyenda de tierra».' },
  ],
  // La quinta (autor, 2026-11-13): de tierra, y al evolucionar también espectral.
  tierra: [
    { texto: 'Una placa dice: «La leyenda de tierra vivía bajo los campos y las aldeas que sepultó el volcán».' },
    { texto: '«Cuando la lava enterró los pueblos, se quedó con ellos. Dicen que aún se oyen sus pasos bajo el picón».' },
    { texto: '«Su pueblo luchó contra el de la leyenda del agua, que con cada tormenta arrastraba su tierra al mar».' },
  ],
};

const NOMBRE_TIPO: Record<string, string> = { planta: 'Planta', agua: 'Agua', infernal: 'Infernal', roca: 'Roca', tierra: 'Tierra' };

/** La estatua: su historia y, mientras no se haya elegido, la pregunta para elegirla. */
function estatua(tipo: string): Guion[string] {
  const elegir: Dialogo = {
    lineas: HISTORIA[tipo],
    pregunta: { texto: `¿Eliges a la criatura de tipo ${NOMBRE_TIPO[tipo]} como compañera?` },
    efecto: { condicion: 'inicial-elegida', inicial: tipo },
    tras: [
      { quien: DOCTORA, texto: '¡Buena elección! Su descendiente es todavía una cría, pero tiene el mismo carácter.' },
      { quien: DOCTORA, texto: 'Vaya… no parece hacerte mucho caso. Al principio les pasa a todas. El anciano del pueblo te ayudará.' },
      { texto: 'Ya puedes salir de la zona inicial.' },
    ],
  };
  return [{ sin: 'inicial-elegida', dialogo: elegir }, { dialogo: { lineas: HISTORIA[tipo] } }];
}

/** Lo que el anciano cuenta de la abuela de cada inicial. */
const ABUELA: Record<string, string> = {
  planta: 'Su abuela, la leyenda verde, tardó siglos en confiar en la gente. Solo respetaba a quien cavaba un hoyo en el picón y plantaba una vid.',
  agua: 'Su abuela, la leyenda del agua, solo visitaba a quien cuidaba cada gota. A quien la malgastaba, no le volvía a hablar.',
  infernal: 'Su abuela, la leyenda infernal, era orgullosa como el volcán. Solo respetaba a quien no huía cuando la tierra temblaba.',
  roca: 'Su abuela, la leyenda de roca, era terca como el risco. Solo se movía por quien tenía paciencia para esperarla.',
  tierra: 'Su abuela, la leyenda de tierra, era callada como un campo en invierno. Solo se dejaba ver por quien sabía escuchar el suelo.',
};

function anciano(tipo: string | undefined): Dialogo {
  return {
    lineas: [
      { quien: 'Anciano', texto: 'Esa criatura no te hace caso, ¿verdad? Siéntate, que te cuento su historia.' },
      { quien: 'Anciano', texto: tipo ? ABUELA[tipo] : 'Las cinco leyendas eran orgullosas. Ninguna obedecía a quien no la conocía.' },
      { quien: 'Anciano', texto: 'Háblale de lo que te importa. Verás como poco a poco te escucha.' },
      { texto: 'Tu compañera te mira de otra manera. Ahora sí te hace caso.' },
    ],
    efecto: { condicion: 'anciano' },
  };
}

export const GUION_ISLA1: Guion = {
  doctora: [
    {
      sin: 'inicial-elegida',
      dialogo: {
        lineas: [
          { quien: DOCTORA, texto: '¡Por fin llegas! Soy la doctora del museo de las cinco leyendas.' },
          { quien: DOCTORA, texto: 'Hace siglos, cinco criaturas protegieron esta isla. Hoy sus descendientes esperan a alguien que las acompañe.' },
          { quien: DOCTORA, texto: 'Acércate a las estatuas, lee su historia y elige con cuál quieres empezar. Tómate tu tiempo.' },
        ],
      },
    },
    {
      dialogo: {
        lineas: [{ quien: DOCTORA, texto: 'Cuida bien de tu compañera. Si no te hace caso, no te enfades: el anciano del pueblo conoce su historia mejor que nadie.' }],
      },
    },
  ],
  'estatua-planta': estatua('planta'),
  'estatua-agua': estatua('agua'),
  'estatua-infernal': estatua('infernal'),
  'estatua-roca': estatua('roca'),
  'estatua-tierra': estatua('tierra'),
  informatico: [
    {
      sin: 'inicial-elegida',
      dialogo: { lineas: [{ quien: 'Informático', texto: 'Estoy pasando al ordenador todo lo que se sabe de las criaturas de la isla. ¡Hay más de las que crees!' }] },
    },
    {
      dialogo: { lineas: [{ quien: 'Informático', texto: 'Cada criatura nueva que veas se apuntará sola. Algún día quiero tenerlas todas.' }] },
    },
  ],
  madre: [
    {
      sin: 'inicial-elegida',
      dialogo: { lineas: [{ quien: 'Mamá', texto: '¡{nombre}! ¿Hoy es el día? ¡La doctora te espera en el museo, aquí al lado!' }] },
    },
    {
      dialogo: {
        lineas: [
          { quien: 'Mamá', texto: '¡Qué compañera más bonita! Cuídala mucho.' },
          { quien: 'Mamá', texto: 'Si os cansáis por el camino, en el refugio del pueblo os curan sin cobrar nada.' },
        ],
      },
    },
  ],
  'vecina-casa': [
    {
      dialogo: {
        lineas: [
          { quien: 'Vecina', texto: '¡Hola! Pasa, pasa. En esta isla siempre hay sitio para uno más.' },
          { quien: 'Vecina', texto: 'Dicen que entre la lava de las Montañas del Fuego viven criaturas que no se ven en ningún otro sitio.' },
        ],
      },
    },
  ],
  // Con equipo, «partida» cura y añade «Tu equipo está como nuevo» (probador, 2026-11-12: antes
  // decía también que estaban perfectamente, aunque llegaran agotadas).
  enfermera: [
    {
      sin: 'inicial-elegida',
      dialogo: {
        lineas: [
          { quien: 'Enfermera', texto: 'Te damos la bienvenida al refugio. Aquí cuidamos de tu equipo sin cobrar nada.' },
          { quien: 'Enfermera', texto: 'Cuando tengas criaturas, tráelas y te las dejamos como nuevas.' },
        ],
      },
    },
    {
      dialogo: { lineas: [{ quien: 'Enfermera', texto: 'Te damos la bienvenida al refugio. Aquí cuidamos de tu equipo sin cobrar nada.' }] },
    },
  ],
  // La enfermera del refugio de la capital dice lo mismo que la de La Geria.
  get 'enfermera-capital'() {
    return GUION_ISLA1.enfermera;
  },
  tendero: [
    {
      dialogo: {
        lineas: [{ quien: 'Tendero', texto: '¡Buenas! Poca cosa tengo hasta que llegue el barco, pero lo básico no falta. ¿Qué te pongo?' }],
      },
    },
  ],
  // El vigilante de la entrada del gimnasio: cómo funciona y contra qué es débil la Roca.
  'vigilante-gimnasio': [
    {
      sin: 'gimnasio-vencido',
      dialogo: {
        lineas: [
          { quien: 'Vigilante', texto: '¡Bienvenido al gimnasio de Roca! Lo excavaron dentro de una colada, como los jameos.' },
          { quien: 'Vigilante', texto: 'Las compuertas de basalto se hunden cuando vences a los aprendices. La última, con una palanca.' },
          { quien: 'Vigilante', texto: 'Un consejo: a la Roca le hacen mucho daño el Agua y la Planta. El fuego, casi nada.' },
        ],
      },
    },
    {
      dialogo: { lineas: [{ quien: 'Vigilante', texto: '¡Lo has conseguido! Esa pintadera te abre el barco. Buen viaje, campeón.' }] },
    },
  ],
  'lider-gimnasio': [
    {
      sin: 'gimnasio-vencido',
      dialogo: {
        lineas: [
          { quien: 'Líder', texto: 'Soy la líder de este gimnasio. Mis criaturas son duras como la lava cuando se enfría.' },
          { quien: 'Líder', texto: '¿Vienes a por el barco? Primero tendrás que vencerme. ¡En guardia!' },
        ],
      },
    },
    {
      dialogo: { lineas: [{ quien: 'Líder', texto: 'Me has vencido con justicia. El barco te espera en el puerto.' }] },
    },
  ],
  marinero: [
    {
      sin: 'gimnasio-vencido',
      dialogo: { lineas: [{ quien: 'Marinero', texto: 'El barco va a la isla siguiente, pero solo con quien ha vencido al gimnasio.' }] },
    },
    {
      // La primera vez, el final de la isla y, con Enter, a Fuerteventura (isla 2).
      sin: 'isla1-completada',
      dialogo: {
        lineas: [{ quien: 'Marinero', texto: '¡Has vencido a la líder! El barco sale hacia Fuerteventura cuando tú digas.' }],
        pregunta: { quien: 'Marinero', texto: '¿Subes al barco?' },
        efecto: { fin: true, viaje: 2, condicion: 'isla1-completada' },
        tras: [{ quien: 'Marinero', texto: '¡Pues arriba! ¡Levamos anclas!' }],
      },
    },
    {
      dialogo: {
        lineas: [{ quien: 'Marinero', texto: 'El barco a Fuerteventura sale cuando tú digas. Las dunas no se mueven… mucho.' }],
        pregunta: { quien: 'Marinero', texto: '¿Vuelves a Fuerteventura?' },
        efecto: { viaje: 2 },
        tras: [{ quien: 'Marinero', texto: '¡Levamos anclas!' }],
      },
    },
  ],
  'vecino-salida': [
    {
      sin: 'inicial-elegida',
      dialogo: { lineas: [{ quien: 'Vecino', texto: '¡Eh! Sin una criatura que te acompañe no se sale de aquí. La doctora te espera en el museo.' }] },
    },
    {
      dialogo: { lineas: [{ quien: 'Vecino', texto: '¡Ya tienes compañera! Sigue el camino hacia la playa de arena negra.' }] },
    },
  ],
  anciano: [
    { con: 'anciano', dialogo: { lineas: [{ quien: 'Anciano', texto: 'Ya te escucha, ¿ves? Ahora las Montañas del Fuego no os confundirán.' }] } },
    { inicial: 'planta', dialogo: anciano('planta') },
    { inicial: 'agua', dialogo: anciano('agua') },
    { inicial: 'infernal', dialogo: anciano('infernal') },
    { inicial: 'roca', dialogo: anciano('roca') },
    { dialogo: anciano(undefined) },
  ],
};
