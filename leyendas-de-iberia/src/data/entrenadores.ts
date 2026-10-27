import type { DefEntrenador, Paso } from '../core/mundo';
import { decir } from './guion';

// Capítulo 1, a petición del autor (2026-10-25): cinco entrenadores entre la Vega y la Alhambra,
// cada uno con una sola criatura y nivel bajo, para que la primera zona sea fácil con cualquier
// inicial. Las criaturas varían de tipo para que ninguna inicial tenga todos los combates en
// contra; Infernal sufre contra Agua y Tierra, así que hay pocas. Boabdil no lleva nada de Agua ni
// de Tierra en lo alto: con Ignibue sería imposible. Las zonas difíciles vendrán más adelante.

// Castigos de los duendes del palacio de Boabdil cuando se falla la pregunta de un entrenador.
const SUSTO: Paso[] = [...decir(undefined, '¡Un duende sale de detrás de un azulejo y os da un buen susto!'), { tipo: 'herir', fraccion: 0.2 }];
const ADORMIDERA: Paso[] = [...decir(undefined, 'Un duende os sopla a la cara polvo de adormidera.'), { tipo: 'alterar', estado: 'dormido' }];
const TIRON_OREJAS: Paso[] = [...decir(undefined, 'Un duende os tira de las orejas hasta sacaros de quicio.'), { tipo: 'alterar', estado: 'colera' }];

const LISTA: DefEntrenador[] = [
  // ---------- Rivales (`{rival}`: el nombre que les puso el jugador) ----------
  {
    id: 'rival_a_santa_fe',
    nombre: '{rival}',
    rival: { cual: 'a', nivel: 4 },
    equipo: [],
    valia: 5,
    premio: 150,
    antes: ['¡{nombre}! Antes de salir de Santa Fe, vamos a ver qué tal se llevan nuestras compañeras.'],
    derrota: ['Has tenido suerte. La próxima vez no será tan fácil.'],
    despues: ['Voy a llenar el Bestiario antes que tú, ya verás.'],
  },
  {
    id: 'rival_b_vega',
    nombre: '{rival}',
    rival: { cual: 'b', nivel: 6 },
    equipo: [{ especie: 'abejaruco', nivel: 5 }],
    valia: 6,
    premio: 300,
    antes: ['¡{nombre}! Dicen que Boabdil espera en la Alhambra.', 'Primero, a ver si estás a la altura.'],
    derrota: ['Vale, pasa tú. Lo apunto en el cuaderno: tu compañera es más fuerte de lo que pensaba.', 'Con Boabdil no te confíes.'],
    despues: ['Iré a la Alhambra después de ti: quiero ver cómo pelea Boabdil.'],
  },
  {
    id: 'rival_a_camino',
    nombre: '{rival}',
    rival: { cual: 'a', nivel: 12 },
    equipo: [{ especie: 'lobo', nivel: 10 }],
    valia: 6,
    premio: 500,
    antes: ['¡{nombre}! Casi treinta años después, y ni una cana. Como yo.', 'He entrenado por la Meseta. ¡Ahora sí!'],
    derrota: ['¿Otra vez? No sé cómo lo haces.'],
    despues: ['Toledo está al otro lado del puente. María Pacheco no se rinde así como así.'],
  },
  {
    id: 'rival_b_toledo',
    nombre: '{rival}',
    rival: { cual: 'b', nivel: 13 },
    equipo: [
      { especie: 'erizo', nivel: 11 },
      { especie: 'avutarda', nivel: 11 },
    ],
    valia: 6,
    premio: 600,
    antes: ['¡{nombre}! Doña María está en el Alcázar. Antes de entrar, un combate entre amigos.'],
    derrota: ['Entra tú primero. Yo todavía tengo que entrenar.'],
    despues: ['Doña María es la última que resiste. Ojalá aguante.'],
  },
  // ---------- La Vega (niveles 3 a 5) ----------
  {
    id: 'ballestero_sancho',
    nombre: 'Ballestero Sancho',
    equipo: [{ especie: 'abejaruco', nivel: 3 }],
    valia: 3,
    premio: 120,
    objetos: { higo: 1 },
    antes: ['¡Alto ahí! Un ballestero de la reina nunca rechaza un duelo.'],
    derrota: ['Buena puntería… la tuya, quiero decir.'],
    despues: ['En la hierba alta de la Vega saltan criaturas a montones. Ve con cuidado.'],
  },
  {
    id: 'labrador',
    nombre: 'Labrador',
    equipo: [{ especie: 'topillo', nivel: 3 }],
    valia: 3,
    premio: 60,
    antes: ['Esta Vega da el mejor trigo del reino… cuando no la pisa un ejército. ¡En guardia!'],
    derrota: ['Me has dejado como un barbecho.'],
    despues: ['Los topillos se comen las raíces de los frutales. Si capturas alguno, que sea lejos de mi huerta.'],
  },
  {
    id: 'mercader_genoves',
    nombre: 'Mercader genovés',
    equipo: [{ especie: 'libelula', nivel: 5 }],
    valia: 4,
    premio: 160,
    objetos: { tesera: 3 },
    antes: ['Vengo de Génova a hacer negocios con la corte. ¿Un duelo? ¡Trato hecho!'],
    derrota: ['¡Qué mala inversión!'],
    despues: ['Dicen que otro genovés, un tal Colón, lleva años pidiendo barcos a la reina.'],
  },
  // ---------- La Alhambra (niveles 5 y 6) ----------
  {
    id: 'jardinero',
    nombre: 'Jardinero',
    equipo: [{ especie: 'mandragora', nivel: 5 }],
    valia: 4,
    premio: 100,
    objetos: { unguento: 1 },
    antes: ['Estos jardines llevan siglos cuidados. No los pisarás sin un duelo.'],
    derrota: ['Que no se entere el emir de que he perdido entre sus arrayanes.'],
    despues: ['Los arrayanes huelen mejor después de la lluvia. La mandrágora, peor.'],
  },
  {
    id: 'guardia_alhambra',
    nombre: 'Guardia de la Alhambra',
    equipo: [{ especie: 'duende', nivel: 6 }],
    valia: 5,
    premio: 200,
    objetos: { ruda: 1 },
    antes: ['Nadie llega hasta el emir sin pasar antes por mí. Pero antes, dime una cosa.'],
    pregunta: { texto: '¿Qué quiere decir «Alhambra» en árabe?', respuestas: ['La blanca', 'La roja', 'La alta'], correcta: 1, castigo: SUSTO },
    derrota: ['Pasa. El emir te espera junto a la fuente.'],
    despues: [
      'El emir pelea con los duendes de la Alhambra. Dicen que no soportan la luz, la mente… ni la ruda.',
      'Pocos han visto el Patio de los Leones. Míralo bien: quizá sea la última vez que es nuestro.',
    ],
  },
  // ---------- Palacios Nazaríes: el gimnasio de Boabdil (el guardia de arriba, y estos dos) ----------
  {
    id: 'poeta_corte',
    nombre: 'Poeta de la corte',
    equipo: [{ especie: 'mandragora', nivel: 6 }],
    valia: 5,
    premio: 180,
    antes: ['Los versos de estas paredes los escribieron poetas de la corte, como yo. A ver si sabes dónde estás.'],
    pregunta: { texto: '¿Qué río corre a los pies de la Alhambra?', respuestas: ['El Genil', 'El Darro', 'El Guadalquivir'], correcta: 1, castigo: ADORMIDERA },
    derrota: ['Me he quedado sin versos. Ve a ver la fuente del patio: la sostienen doce leones de mármol.'],
    despues: [
      'Los reyes nazaríes llenaron estas paredes de versos: hay poemas hasta en la fuente del patio.',
      'El de la fuente lo escribió Ibn Zamrak, visir y poeta.',
    ],
  },
  {
    id: 'alarife',
    nombre: 'Alarife',
    equipo: [{ especie: 'duende', nivel: 7 }],
    valia: 5,
    premio: 220,
    objetos: { unguento: 1 },
    antes: ['Soy alarife: cuido de que estos techos no se caigan. Antes de mi duende, una pregunta.'],
    pregunta: { texto: '¿Cuántos leones sostienen la fuente del patio?', respuestas: ['Doce', 'Ocho', 'Diez'], correcta: 0, castigo: TIRON_OREJAS },
    derrota: ['Ni un mocárabe fuera de su sitio… y aun así he perdido.'],
    despues: ['Las bóvedas de mocárabes parecen panales. Están hechas de miles de piezas de yeso.'],
  },
  {
    id: 'boabdil',
    nombre: 'Boabdil',
    equipo: [
      { especie: 'duende', nivel: 7 },
      { especie: 'trasgo', nivel: 8 },
    ],
    valia: 7,
    premio: 600,
    objetos: { emplasto: 2 },
    antes: [
      'Soy Muhammad, emir de Granada. Los cristianos me llaman Boabdil.',
      'Mañana entregaré la ciudad. Pero antes, las leyendas de la Alhambra merecen un último duelo.',
      'Los duendes de la Alhambra me han servido toda la vida. ¡Que ellos decidan!',
    ],
    derrota: ['Lo has ganado con justicia. Que las leyendas de Granada no se olviden.'],
    despues: ['Cuida de este patio. Doce leones lo han guardado durante más de cien años.'],
  },
  // ---------- Capítulo 2: Villalar y el camino de Toledo (niveles 9 a 12) ----------
  {
    id: 'soldado_imperial',
    nombre: 'Soldado imperial',
    equipo: [{ especie: 'avutarda', nivel: 9 }],
    valia: 5,
    premio: 180,
    antes: ['Hoy hemos ganado en Villalar. ¿Quieres probar suerte tú también?'],
    derrota: ['Vaya. La batalla la ganamos nosotros, pero esta no.'],
    despues: ['El emperador está en Alemania. Aquí mandan los gobernadores.'],
  },
  {
    id: 'comunero',
    nombre: 'Comunero',
    equipo: [{ especie: 'lobo', nivel: 9 }],
    valia: 5,
    premio: 160,
    objetos: { unguento: 1 },
    antes: ['¡Yo no me rindo! Si me han de prender, que les cueste.'],
    derrota: ['Ya está… Me esconderé hasta que pase todo.'],
    despues: ['Si vas a Toledo, di que aún quedamos comuneros en pie.'],
  },
  {
    id: 'pastor_mesta',
    nombre: 'Pastor de la Mesta',
    equipo: [{ especie: 'erizo', nivel: 10 }],
    valia: 5,
    premio: 180,
    antes: ['Subo los rebaños de la Mesta de Extremadura a los pastos de León. ¡Apártate o pelea!'],
    derrota: ['Mis ovejas pelean mejor que yo.'],
    despues: ['Las cañadas reales cruzan Castilla de norte a sur. Por ellas pasan cada año millones de ovejas.'],
  },
  {
    id: 'halconero',
    nombre: 'Halconero',
    equipo: [{ especie: 'aguila', nivel: 9 }],
    valia: 5,
    premio: 200,
    antes: ['Cazo con aves para la corte del emperador. ¿Te atreves con mi águila?'],
    derrota: ['Hoy no hay caza. Mi águila necesita descansar.'],
    despues: ['En la corte, los halconeros acompañan al emperador en sus cacerías.'],
  },
  {
    id: 'herbolaria',
    nombre: 'Herbolaria',
    equipo: [{ especie: 'vibora', nivel: 11 }],
    valia: 5,
    premio: 200,
    objetos: { aloe: 1, baya_meloc: 1 },
    antes: ['Busco hierbas por los cerros. Y a veces me encuentro otras cosas. ¿Lo ves?'],
    derrota: ['Toma, para las heridas. Yo ya tengo más.'],
    despues: ['La ruda espanta el mal de ojo. A las víboras, no tanto.'],
  },
  // ---------- Alcázar de Toledo: el gimnasio de María Pacheco (el escudero, y estos dos) ----------
  {
    id: 'espadero_alcazar',
    nombre: 'Espadero',
    equipo: [{ especie: 'escarabajo_pelotero', nivel: 12 }],
    valia: 6,
    premio: 240,
    antes: ['El acero de Toledo es el mejor del mundo. ¿Probamos el temple de tus criaturas?'],
    derrota: ['Buen temple. Mejor que el de mis hojas.'],
    despues: ['Dicen que las espadas de Toledo se templan en el agua del Tajo. Yo no lo desmiento.'],
  },
  {
    id: 'artillero',
    nombre: 'Artillero comunero',
    equipo: [{ especie: 'escarabajo_bronce', nivel: 11 }],
    valia: 6,
    premio: 260,
    objetos: { emplasto: 1 },
    antes: ['¡Doña María nos ha dado la artillería del Alcázar! Por aquí no pasa nadie.'],
    derrota: ['¡Se me ha mojado la pólvora!'],
    despues: ['Para pagar a los soldados, doña María llegó a sacar la plata de la catedral.'],
  },
  {
    id: 'escudero',
    nombre: 'Escudero',
    equipo: [{ especie: 'lagarto', nivel: 12 }],
    valia: 6,
    premio: 240,
    objetos: { revestimiento_metalico: 1 },
    antes: ['Nadie llega a doña María sin pasar por mí.'],
    derrota: ['Pasa. La señora está al fondo.'],
    despues: ['En el Alcázar se guardan las mejores hojas de Toledo.'],
  },
  {
    id: 'maria_pacheco',
    nombre: 'María Pacheco',
    equipo: [
      { especie: 'escarabajo_bronce', nivel: 12 },
      { especie: 'lagarto_muralla', nivel: 14 },
    ],
    valia: 6,
    premio: 900,
    objetos: { emplasto: 2, arena_fina: 1 },
    antes: ['En guardia. Toledo pelea con piedra y acero.'],
    derrota: ['Juan estaría orgulloso de un rival así.'],
    despues: ['Toledo resistirá lo que pueda.'],
  },
];

/**
 * Los rivales son los otros dos jugadores (GDD §5): dos amigos del protagonista que reciben las
 * otras dos iniciales y reaparecen en cada época. Los tres se criaron en el campamento real,
 * que siguió al ejército de asedio en asedio durante la guerra de Granada. Antes de ponerles
 * nombre, el juego cuenta quiénes son (`presentacion`). Los textos no les dan género: el
 * jugador elige el nombre.
 */
export const RIVALES: Record<'a' | 'b', { porDefecto: string; presentacion: string[]; pregunta: string }> = {
  a: {
    porDefecto: 'Álex',
    presentacion: [
      'Su familia es de arrieros: con sus recuas de mulas llevan trigo, pólvora y noticias de un campamento a otro.',
      'Desde que aprendisteis a andar os lo habéis disputado todo: quién corre más, quién trepa más alto, quién se queda con la última torta. Nunca te ha dejado ganar sin pelear.',
    ],
    pregunta: '¿Cómo se llama quien nunca te deja ganar?',
  },
  b: {
    porDefecto: 'Sam',
    presentacion: [
      'Su madre es la herbolaria del campamento, y le ha enseñado el nombre de cada planta y de cada bicho que encontraban por el camino.',
      'Lo apunta todo en un cuaderno lleno de dibujos. Si alguien sabe más de criaturas que tú, es quien lleva ese cuaderno.',
    ],
    pregunta: '¿Cómo se llama quien lo apunta todo en su cuaderno?',
  },
};

export const NOMBRES_RIVALES = { a: RIVALES.a.porDefecto, b: RIVALES.b.porDefecto };

export const ENTRENADORES: Record<string, DefEntrenador> = Object.fromEntries(LISTA.map((e) => [e.id, e]));
