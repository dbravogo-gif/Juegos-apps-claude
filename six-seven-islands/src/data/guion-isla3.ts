// Diálogos de la isla 3, Gran Canaria (2026-11-22), por id de personaje (src/core/guion.ts). Los
// personajes sin diálogo aquí dicen su `frase` del mapa.

import type { Guion } from '../core/guion';

export const GUION_ISLA3: Guion = {
  'marinero-palmas': [
    {
      dialogo: {
        lineas: [{ quien: 'Marinero', texto: '¡Bienvenido a Las Palmas! Este barco va y viene de Morro Jable.' }],
        pregunta: { quien: 'Marinero', texto: '¿Vuelves a Fuerteventura?' },
        efecto: { viaje: 2 },
        tras: [{ quien: 'Marinero', texto: '¡Levamos anclas!' }],
      },
    },
  ],
  'enfermera-palmas': [
    { dialogo: { lineas: [{ quien: 'Enfermera', texto: 'Bienvenido al refugio de Las Palmas. En la ciudad grande también curamos gratis.' }] } },
  ],
  'tendero-palmas': [
    { dialogo: { lineas: [{ quien: 'Tendero', texto: '¡Buenas! Esto es una ciudad: aquí hay de todo. Bueno, casi de todo.' }] } },
  ],
  'vigilante-electrico': [
    {
      sin: 'vencido:aprendiz-electrico-3',
      dialogo: {
        lineas: [
          { quien: 'Vigilante', texto: '¡Bienvenido al gimnasio Eléctrico! Aquí dentro está todo a oscuras.' },
          { quien: 'Vigilante', texto: 'Con cada relámpago se ve el laberinto un instante. Fíjate bien y recuerda el camino.' },
          { quien: 'Vigilante', texto: 'Y cuidado: los aprendices esperan en la oscuridad.' },
          { quien: 'Vigilante', texto: 'Un consejo: a lo Eléctrico le hace mucho daño la Tierra. Y aquí dentro, el campo eléctrico da más fuerza a sus rayos.' },
          { quien: 'Vigilante', texto: 'Del líder… mejor que te lo cuenten arriba.' },
        ],
      },
    },
    {
      dialogo: {
        lineas: [
          { quien: 'Vigilante', texto: 'Ya lo sabes: el líder se fue a Agaete. Dicen que la líder de Lucha y él te esperan juntos.' },
          { quien: 'Vigilante', texto: 'Las dos mitades de la pintadera de Gran Canaria se ganan allí, en el terrero.' },
        ],
      },
    },
  ],
  'guia-vegueta': [
    {
      dialogo: {
        lineas: [
          { quien: 'Guía', texto: 'Esta es la catedral de Santa Ana. Tardaron casi cuatrocientos años en terminarla.' },
          { quien: 'Guía', texto: 'Por eso tiene un poco de todos los estilos: cada siglo le puso lo suyo.' },
          { quien: 'Guía', texto: 'Desde las torres se ven las cumbres. Allí arriba está el Roque Nublo, una roca enorme entre las nubes.' },
        ],
      },
    },
  ],
  'enfermera-guayadeque': [
    { dialogo: { lineas: [{ quien: 'Enfermera', texto: 'Bienvenido al refugio de Guayadeque. Descansa, que la subida a las cumbres es larga.' }] } },
  ],
  // El comandante de la rama que te persigue (HISTORIA.md, Gran Canaria): te para antes de la cima.
  'comandante-nublo': [
    {
      dialogo: {
        lineas: [
          { quien: '{comandante}', texto: 'Vaya, vaya. El elegido de {pueblo}. El jefe dijo que acabarías subiendo hasta aquí.' },
          { quien: '{comandante}', texto: 'Soy {comandante}, comandante de {rama}. Desde esta roca se ve lo que buscamos, al oeste, sobre las nubes.' },
          { quien: '{comandante}', texto: 'Y tú no lo vas a ver. ¡En guardia!' },
        ],
      },
    },
  ],
  // El segundo amigo (HISTORIA.md): llega cuando el comandante se va. Lleva una de las iniciales que
  // quedan. En Agaete será tu compañero en el dos contra dos contra los líderes (fase 3).
  'amigo2-nublo': [
    {
      sin: 'amigo2-conocido',
      dialogo: {
        lineas: [
          { quien: '{amigo2}', texto: '¡Uf, llego tarde! Vi a los soldados de {rama} subir y vine corriendo. ¿Estás bien?' },
          { quien: '{amigo2}', texto: 'Me eligió una cría de {inicialAmigo2} hace poco. Desde entonces no paro de recorrer islas.' },
          { quien: '{amigo2}', texto: '¿Has oído lo de Agaete? Los dos líderes de la isla te esperan juntos: dos contra dos.' },
          { quien: '{amigo2}', texto: 'Tú solo no puedes con los dos. ¿Vamos juntos? Te espero en el terrero.' },
        ],
        efecto: { condicion: 'amigo2-conocido' },
      },
    },
    { dialogo: { lineas: [{ quien: '{amigo2}', texto: 'Nos vemos en Agaete. ¡Entrena, que esos dos pegan fuerte!' }] } },
  ],
  // Fase 3.
  'enfermera-tejeda': [{ dialogo: { lineas: [{ quien: 'Enfermera', texto: 'Bienvenido a Tejeda. Aquí arriba se cura todo: el aire, el queso y yo.' }] } }],
  'tendero-tejeda': [{ dialogo: { lineas: [{ quien: 'Tendero', texto: '¡Buenas! Para el pinar, pociones. La niebla cansa más de lo que parece.' }] } }],
  'enfermera-agaete': [{ dialogo: { lineas: [{ quien: 'Enfermera', texto: 'Bienvenido a Agaete. Antes del terrero, deja a tu equipo como nuevo.' }] } }],
  'tendero-agaete': [{ dialogo: { lineas: [{ quien: 'Tendero', texto: '¡Buenas! Los luchadores del terrero no dan tregua: llévate de todo.' }] } }],
  'marinero-agaete': [
    {
      dialogo: {
        lineas: [
          { quien: 'Marinero', texto: 'Este barco va a Tenerife. Saldrá en cuanto el capitán vuelva del terrero.' },
          { quien: 'Marinero', texto: 'Dicen que en Tenerife hay una puerta en el Teide que nadie abre desde hace años.' },
        ],
      },
    },
  ],
  'vigilante-lucha': [
    {
      sin: 'vencido:luchador-3',
      dialogo: {
        lineas: [
          { quien: 'Vigilante', texto: '¡Bienvenido al terrero de Agaete! Aquí se lucha como en la lucha canaria: con fuerza y con maña.' },
          { quien: 'Vigilante', texto: 'Los luchadores salen de uno en uno. Antes de cada combate te preguntan si estás listo: si no, ve a curarte.' },
          { quien: 'Vigilante', texto: 'Un consejo: dentro del terrero te agarran, y tus criaturas pueden quedar confusas. A lo de Lucha le hacen daño el Aire y lo Mental.' },
        ],
      },
    },
    { dialogo: { lineas: [{ quien: 'Vigilante', texto: 'Has vencido a los tres. Ahora, los líderes: el Eléctrico de Las Palmas y la de Lucha, juntos.' }] } },
  ],
  'luchador-1': [
    {
      sin: 'listo:luchador-1',
      dialogo: {
        lineas: [
          { quien: 'Luchador', texto: '¡Bienvenido al terrero! Soy el primero de los tres luchadores. Saludo y respeto, como manda la lucha.' },
          { quien: 'Luchador', texto: 'Si antes quieres curar a tus criaturas, dime que no y vuelve cuando estés.' },
        ],
        pregunta: { quien: 'Luchador', texto: '¿Luchamos ya?' },
        efecto: { condicion: 'listo:luchador-1' },
        tras: [{ quien: 'Luchador', texto: '¡Eso es! ¡Al centro del terrero!' }],
      },
    },
    { dialogo: { lineas: [{ quien: 'Luchador', texto: '¡Al centro! Esta vez no te suelto.' }] } },
  ],
  'luchador-2': [
    {
      sin: 'listo:luchador-2',
      dialogo: {
        lineas: [
          { quien: 'Luchador', texto: 'Soy el segundo. Mi compañero dice que agarras bien. Ya veremos.' },
          { quien: 'Luchador', texto: 'Si antes quieres curarte, dime que no y vuelve cuando estés.' },
        ],
        pregunta: { quien: 'Luchador', texto: '¿Luchamos ya?' },
        efecto: { condicion: 'listo:luchador-2' },
        tras: [{ quien: 'Luchador', texto: '¡Al centro!' }],
      },
    },
    { dialogo: { lineas: [{ quien: 'Luchador', texto: '¿Vuelves? Me gusta. ¡Al centro!' }] } },
  ],
  'luchador-3': [
    {
      sin: 'listo:luchador-3',
      dialogo: {
        lineas: [
          { quien: 'Luchador', texto: 'El último. Si me vences, los líderes saldrán a por ti. Los dos.' },
          { quien: 'Luchador', texto: 'Si antes quieres curarte, dime que no y vuelve cuando estés.' },
        ],
        pregunta: { quien: 'Luchador', texto: '¿Luchamos ya?' },
        efecto: { condicion: 'listo:luchador-3' },
        tras: [{ quien: 'Luchador', texto: '¡Pues adelante!' }],
      },
    },
    { dialogo: { lineas: [{ quien: 'Luchador', texto: '¡Revancha! Esta vez me toca ganar a mí.' }] } },
  ],
  // La entrada de los dos líderes en el terrero (fase 3b).
  'lider-lucha': [
    {
      con: 'gimnasio3-vencido',
      dialogo: {
        lineas: [
          { quien: 'Líder', texto: '¡Qué luchada! Hacía años que nadie nos tumbaba a los dos juntos.' },
          { quien: 'Líder', texto: 'El barco de Tenerife sale de aquí, de Agaete. Allí os espera el gimnasio de Agua.' },
        ],
      },
    },
    {
      sin: 'listo:lider-lucha',
      dialogo: {
        lineas: [
          { quien: 'Líder', texto: '¡Así que tú has tumbado a mis tres luchadores! Soy la líder del terrero, la de Lucha.' },
          { quien: 'Líder', texto: 'Y este es el líder Eléctrico de Las Palmas. Lleva días aquí, esperándote.' },
          { quien: 'Líder', texto: 'En Gran Canaria la pintadera se gana con los dos gimnasios a la vez. Dos contra dos: vosotros contra nosotros.' },
          { quien: 'Líder', texto: 'Si antes queréis curaros, decidme que no y volved cuando estéis.' },
        ],
        pregunta: { quien: 'Líder', texto: '¿Empezamos ya?' },
        efecto: { condicion: 'listo:lider-lucha' },
        tras: [{ quien: 'Líder', texto: '¡Al centro del terrero! ¡Que empiece la luchada!' }],
      },
    },
    { dialogo: { lineas: [{ quien: 'Líder', texto: '¡Al centro del terrero!' }] } },
  ],
  'lider-electrico': [
    {
      con: 'gimnasio3-vencido',
      dialogo: { lineas: [{ quien: 'Líder', texto: 'Me vuelvo a Las Palmas. Si pasas por allí, mis aprendices ya saben quién eres.' }] },
    },
    {
      dialogo: {
        lineas: [
          { quien: 'Líder', texto: 'Perdona por no estar en mi gimnasio. Quería ver cómo luchabas con alguien a tu lado.' },
          { quien: 'Líder', texto: 'Cuando estéis listos, habla con ella. Luchamos los dos a la vez.' },
        ],
      },
    },
  ],
  'amigo2-terrero': [
    {
      con: 'gimnasio3-vencido',
      dialogo: { lineas: [{ quien: '{amigo2}', texto: '¡Lo hemos conseguido! Media pintadera cada uno... no, toda para ti. Te la has ganado.' }, { quien: '{amigo2}', texto: 'Yo me quedo entrenando por aquí. ¡Nos vemos en Tenerife!' }] },
    },
    {
      dialogo: {
        lineas: [
          { quien: '{amigo2}', texto: '¡Aquí estoy! Tú manda a la tuya, que yo me encargo de la mía.' },
          { quien: '{amigo2}', texto: 'Cuando estés listo, habla con la líder de Lucha. ¡A por ellos!' },
        ],
      },
    },
  ],
  'amigo2-agaete': [
    {
      dialogo: {
        lineas: [
          { quien: '{amigo2}', texto: '¡Aquí estás! Entra cuando quieras: vence a los tres luchadores y saldrán los líderes.' },
          { quien: '{amigo2}', texto: 'Yo entro contigo al final. Dos contra dos: tú y yo contra los dos líderes.' },
        ],
      },
    },
  ],
  'farera-isleta': [
    {
      dialogo: {
        lineas: [
          { quien: 'Farera', texto: 'Desde lo alto del faro se ven Tenerife y el Teide, casi todos los días.' },
          { quien: 'Farera', texto: 'Y algunas mañanas, muy temprano, algo más allá del Teide. Una isla que luego no está.' },
          { quien: 'Farera', texto: 'Mi abuelo decía que desde el Roque Nublo se ve mejor. Él subía a mirarla.' },
        ],
      },
    },
  ],
};
