// Diálogos de la isla 2, Fuerteventura (2026-11-13), por id de personaje (src/core/guion.ts).
// Provisionales hasta la historia del autor (PROMPT-HISTORIA.md). Los personajes sin diálogo aquí
// dicen su `frase` del mapa.

import type { Guion } from '../core/guion';

export const GUION_ISLA2: Guion = {
  'marinero-corralejo': [
    {
      dialogo: {
        lineas: [{ quien: 'Marinero', texto: '¡Bienvenido a Corralejo! Este barco va y viene de Lanzarote.' }],
        pregunta: { quien: 'Marinero', texto: '¿Vuelves a Lanzarote?' },
        efecto: { viaje: 1 },
        tras: [{ quien: 'Marinero', texto: '¡Levamos anclas!' }],
      },
    },
  ],
  'enfermera-corralejo': [
    {
      dialogo: { lineas: [{ quien: 'Enfermera', texto: 'Bienvenido al refugio de Corralejo. Aquí también cuidamos de tu equipo sin cobrar nada.' }] },
    },
  ],
  'tendero-corralejo': [
    {
      dialogo: {
        lineas: [{ quien: 'Tendero', texto: '¡Buenas! Si vas a cruzar las dunas, llévate pociones. La arena no perdona.' }],
      },
    },
  ],
  // Fase 2: los refugios y la tienda de Puerto del Rosario y Betancuria.
  'enfermera-puerto': [
    { dialogo: { lineas: [{ quien: 'Enfermera', texto: 'Bienvenido al refugio de Puerto del Rosario. Tu equipo, como nuevo, sin cobrar nada.' }] } },
  ],
  'tendero-puerto': [
    { dialogo: { lineas: [{ quien: 'Tendero', texto: '¡Buenas! En la capital no falta de nada… bueno, casi de nada.' }] } },
  ],
  'enfermera-betancuria': [
    { dialogo: { lineas: [{ quien: 'Enfermera', texto: 'Hasta aquí arriba llega poca gente. ¡Descansa, que el camino es largo!' }] } },
  ],
  // Fase 3: Morro Jable y el gimnasio de Aire.
  // El barco a Gran Canaria (2026-11-22), como el de Lanzarote: con la pintadera de Aire.
  'marinero-morro': [
    {
      sin: 'gimnasio2-vencido',
      dialogo: { lineas: [{ quien: 'Marinero', texto: 'El barco a Gran Canaria sale pronto, pero solo con quien ha vencido al gimnasio de Aire.' }] },
    },
    {
      sin: 'isla2-completada',
      dialogo: {
        lineas: [{ quien: 'Marinero', texto: '¡Has vencido a la líder de Aire! El barco sale hacia Gran Canaria cuando tú digas.' }],
        pregunta: { quien: 'Marinero', texto: '¿Subes al barco?' },
        efecto: { fin: true, viaje: 3, condicion: 'isla2-completada' },
        tras: [{ quien: 'Marinero', texto: '¡Pues arriba! Rumbo a Las Palmas.' }],
      },
    },
    {
      dialogo: {
        lineas: [{ quien: 'Marinero', texto: 'El barco a Gran Canaria sale cuando tú digas.' }],
        pregunta: { quien: 'Marinero', texto: '¿Vuelves a Gran Canaria?' },
        efecto: { viaje: 3 },
        tras: [{ quien: 'Marinero', texto: '¡Levamos anclas!' }],
      },
    },
  ],
  'enfermera-morro': [
    { dialogo: { lineas: [{ quien: 'Enfermera', texto: 'Bienvenido a Morro Jable. Antes del gimnasio, deja a tu equipo como nuevo.' }] } },
  ],
  'tendero-morro': [
    { dialogo: { lineas: [{ quien: 'Tendero', texto: '¡Buenas! Para el gimnasio de Aire, pociones. El viento cansa mucho.' }] } },
  ],
  'vigilante-aire': [
    {
      sin: 'gimnasio2-vencido',
      dialogo: {
        lineas: [
          { quien: 'Vigilante', texto: '¡Bienvenido al gimnasio de Aire! Aquí manda el viento: las corrientes del suelo te llevan.' },
          { quien: 'Vigilante', texto: 'Las aspas de los molinos cambian hacia dónde sopla una corriente. Gíralas con E.' },
          { quien: 'Vigilante', texto: 'Un consejo: a lo de Aire le hacen mucho daño la Roca, el Hielo y lo Eléctrico.' },
        ],
      },
    },
    { dialogo: { lineas: [{ quien: 'Vigilante', texto: '¡Dos pintaderas! El viento ya te lleva hacia Gran Canaria.' }] } },
  ],
  'lider-aire': [
    {
      sin: 'gimnasio2-vencido',
      dialogo: {
        lineas: [
          { quien: 'Líder', texto: 'Has subido con el viento a favor. Veamos si aguantas cuando sople en contra.' },
          { quien: 'Líder', texto: 'Soy la líder del gimnasio de Aire. ¡Que empiece la tormenta!' },
        ],
      },
    },
    { dialogo: { lineas: [{ quien: 'Líder', texto: 'Has dominado el viento. El de Gran Canaria es distinto: ya lo verás.' }] } },
  ],
  // La arqueóloga de Las Dunas (autor, 2026-11-13): desentierra una estatua ancestral y cuenta un
  // trozo de la historia. La estatua de verdad, ya se verá.
  // Chano (HISTORIA.md): dice defender a tu pueblo. Es el jefe secreto de la rama que te persigue.
  'chano-corralejo': [
    {
      sin: 'chano-conocido',
      dialogo: {
        lineas: [
          { quien: 'Señor', texto: '¡Eh, tú! Esa cría desciende de una leyenda… Eres el nuevo elegido de {pueblo}, ¿a que sí?' },
          { quien: 'Chano', texto: 'Me llamo Chano. Hace muchos años luché junto al último elegido de tu pueblo. ¡Qué tiempos!' },
          { quien: 'Chano', texto: 'Ándate con ojo: los de {rama} andan revueltos por las dunas. Si me necesitas, por aquí ando.' },
        ],
        efecto: { condicion: 'chano-conocido' },
      },
    },
    { dialogo: { lineas: [{ quien: 'Chano', texto: 'Las dunas están al sur. Allí hay una arqueóloga desenterrando algo muy viejo.' }] } },
  ],
  'chano-dunas': [
    {
      dialogo: {
        lineas: [
          { quien: 'Chano', texto: '¡Uf, llego tarde! He visto a los de {rama} huir por las dunas. ¿Estás bien?' },
          { quien: 'Chano', texto: 'Menos mal que estabas tú. Esa estatua… mejor que no caiga en malas manos.' },
          { quien: 'Chano', texto: 'Sigue hacia el sur, elegido. Yo me quedo vigilando la excavación.' },
        ],
      },
    },
  ],
  'soldado-dunas-1': [
    {
      dialogo: {
        lineas: [
          { quien: 'Soldado de {rama}', texto: '¡Tú otra vez! El jefe dijo que te dejáramos crecer…' },
          { quien: 'Soldado de {rama}', texto: '…¡pero esta estatua es nuestra! ¡A luchar!' },
        ],
      },
    },
  ],
  'soldado-dunas-2': [
    { dialogo: { lineas: [{ quien: 'Soldado de {rama}', texto: '¡Alto! Yo solo vigilo, ¿eh? El que lucha es mi compañero.' }] } },
  ],
  // El señor que te vigila vuelve a aparecer, sin decir quién es.
  'viejo-puerto': [
    {
      dialogo: {
        lineas: [
          { quien: 'Pescador', texto: 'Volvemos a vernos. Aquí también pica bien.' },
          { quien: 'Pescador', texto: 'Dicen que la estatua de las dunas mira al oeste. Las leyendas siempre miran al oeste…' },
        ],
      },
    },
  ],
  arqueologa: [
    {
      con: 'estatua-defendida',
      dialogo: {
        lineas: [
          { quien: 'Arqueóloga', texto: '¡Gracias por echarlos! Querían llevarse la estatua… y no sé para qué.' },
          { quien: 'Arqueóloga', texto: 'Mira lo que había debajo: un grabado con trece círculos. Ocho pequeños y cinco grandes.' },
          { quien: 'Arqueóloga', texto: 'Los pequeños tienen la forma de las pintaderas de los gimnasios. Los grandes, de las cinco leyendas.' },
          { quien: 'Arqueóloga', texto: 'Juntos forman un sello. Dicen que abría algo en el Teide. ¡Ojalá supiera qué!' },
        ],
      },
    },
    {
      dialogo: {
        lineas: [
          { quien: 'Arqueóloga', texto: '¡Cuidado con las cuerdas! Llevo semanas desenterrando esta estatua.' },
          { quien: 'Arqueóloga', texto: 'Es mucho más antigua que las cinco leyendas. Mira la cabeza: es una criatura ancestral.' },
          { quien: 'Arqueóloga', texto: 'Dicen que antes de la guerra de las cinco naciones, las ancestrales cuidaban de todas las islas.' },
          { quien: 'Arqueóloga', texto: 'Y que cuando las naciones empezaron a pelear, una isla entera desapareció del mapa.' },
          { quien: 'Arqueóloga', texto: 'Cuentos de viejos, seguramente… Aunque esta estatua mira justo hacia el oeste.' },
        ],
      },
    },
  ],
};
