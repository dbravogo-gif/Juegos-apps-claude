// Diálogos de la isla 1, por id de personaje (src/core/guion.ts). Contenido propio. Las tres
// leyendas forman un triángulo: el agua apaga el fuego, el fuego quema el bosque y el bosque le
// roba el agua a los nacientes. Los personajes sin diálogo aquí dicen su `frase` del mapa.

import type { Dialogo, Guion, Linea } from '../core/guion';

const DOCTORA = 'Doctora';

/** La historia de cada leyenda, la que cuenta su estatua. */
const HISTORIA: Record<string, readonly Linea[]> = {
  planta: [
    { texto: 'Una placa dice: «La leyenda verde dormía bajo la niebla de la cumbre, donde los laureles nunca se secan».' },
    { texto: '«Cuando la lava bajaba del volcán, hacía crecer el bosque para frenarla».' },
    { texto: '«Su eterna rival fue la leyenda infernal, que quemó sus bosques mil veces».' },
  ],
  agua: [
    { texto: 'Una placa dice: «La leyenda del agua vivía en los nacientes del norte, donde el agua brota de la roca».' },
    { texto: '«Guardaba las fuentes de la isla y apagaba los incendios con la lluvia».' },
    { texto: '«Luchó contra el bosque, que le robaba el agua de los nacientes con sus raíces».' },
  ],
  infernal: [
    { texto: 'Una placa dice: «La leyenda infernal nació dentro del volcán del sur, entre el picón y el malpaís».' },
    { texto: '«Cada erupción hacía crecer la isla un poco más hacia el mar».' },
    { texto: '«Su enemiga fue la leyenda del agua, que enfriaba su lava antes de llegar a la costa».' },
  ],
};

const NOMBRE_TIPO: Record<string, string> = { planta: 'Planta', agua: 'Agua', infernal: 'Infernal' };

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
  planta: 'Su abuela, la leyenda verde, tardó siglos en confiar en la gente. Solo respetaba a quien plantaba árboles después de cada erupción.',
  agua: 'Su abuela, la leyenda del agua, solo bebía de las fuentes que la gente cuidaba. A quien ensuciaba un naciente, no le volvía a hablar.',
  infernal: 'Su abuela, la leyenda infernal, era orgullosa como el volcán. Solo respetaba a quien no huía cuando la tierra temblaba.',
};

function anciano(tipo: string | undefined): Dialogo {
  return {
    lineas: [
      { quien: 'Anciano', texto: 'Esa criatura no te hace caso, ¿verdad? Siéntate, que te cuento su historia.' },
      { quien: 'Anciano', texto: tipo ? ABUELA[tipo] : 'Las tres leyendas eran orgullosas. Ninguna obedecía a quien no la conocía.' },
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
          { quien: DOCTORA, texto: '¡Por fin llegas! Soy la doctora del museo de las tres leyendas.' },
          { quien: DOCTORA, texto: 'Hace siglos, tres criaturas protegieron esta isla. Hoy sus descendientes esperan a alguien que las acompañe.' },
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
  informatica: [
    {
      sin: 'inicial-elegida',
      dialogo: { lineas: [{ quien: 'Informática', texto: 'Estoy pasando al ordenador todo lo que se sabe de las criaturas de la isla. ¡Hay más de las que crees!' }] },
    },
    {
      dialogo: { lineas: [{ quien: 'Informática', texto: 'Cada criatura nueva que veas se apuntará sola. Algún día quiero tenerlas todas.' }] },
    },
  ],
  madre: [
    {
      sin: 'inicial-elegida',
      dialogo: { lineas: [{ quien: 'Mamá', texto: '¿Hoy es el día? ¡La doctora te espera en el museo, aquí al lado!' }] },
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
          { quien: 'Vecina', texto: 'Dicen que en la niebla del bosque se esconden criaturas que no se ven en ningún otro sitio.' },
        ],
      },
    },
  ],
  enfermera: [
    {
      dialogo: {
        lineas: [
          { quien: 'Enfermera', texto: 'Te damos la bienvenida al refugio. Aquí cuidamos de tu equipo sin cobrar nada.' },
          { quien: 'Enfermera', texto: 'Ahora mismo tus criaturas están perfectamente. Vuelve cuando estén cansadas.' },
        ],
      },
    },
  ],
  tendero: [
    {
      dialogo: {
        lineas: [{ quien: 'Tendero', texto: '¡Buenas! Estoy esperando el barco con la mercancía. Pásate más adelante.' }],
      },
    },
  ],
  'lider-gimnasio': [
    {
      sin: 'gimnasio-vencido',
      dialogo: {
        lineas: [
          { quien: 'Líder', texto: 'Soy la líder de este gimnasio. Mis criaturas brillan como el sol de la tarde.' },
          { quien: 'Líder', texto: 'Cuando quieras, combatiremos. Antes, entrena a tu equipo en la hierba alta del bosque.' },
        ],
      },
    },
    {
      dialogo: { lineas: [{ quien: 'Líder', texto: 'Me has vencido con justicia. El barco te espera en el puerto.' }] },
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
    { con: 'anciano', dialogo: { lineas: [{ quien: 'Anciano', texto: 'Ya te escucha, ¿ves? Ahora el bosque no os confundirá.' }] } },
    { inicial: 'planta', dialogo: anciano('planta') },
    { inicial: 'agua', dialogo: anciano('agua') },
    { inicial: 'infernal', dialogo: anciano('infernal') },
    { dialogo: anciano(undefined) },
  ],
};
