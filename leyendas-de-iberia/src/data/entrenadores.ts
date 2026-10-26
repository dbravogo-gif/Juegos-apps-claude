import type { DefEntrenador } from '../core/mundo';

// Capítulo 1, a petición del autor (2026-10-25): cinco entrenadores entre la Vega y la Alhambra,
// cada uno con una sola criatura y nivel bajo, para que la primera zona sea fácil con cualquier
// inicial. Las criaturas varían de tipo para que ninguna inicial tenga todos los combates en
// contra; Infernal sufre contra Agua y Tierra, así que hay pocas. Boabdil no lleva nada de Agua ni
// de Tierra en lo alto: con Ignibue sería imposible. Las zonas difíciles vendrán más adelante.

const LISTA: DefEntrenador[] = [
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
    objetos: { tarro_miel: 1 },
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
    objetos: { amuleto_tanit: 1 },
    antes: ['Nadie llega hasta el emir sin pasar antes por mí.'],
    derrota: ['Pasa. El emir te espera junto a la fuente.'],
    despues: [
      'El emir pelea con los duendes de la Alhambra. Dicen que no soportan la luz, la mente… ni la ruda.',
      'Pocos han visto el Patio de los Leones. Míralo bien: quizá sea la última vez que es nuestro.',
    ],
  },
  // ---------- Patio de los Leones ----------
  {
    id: 'boabdil',
    nombre: 'Boabdil',
    equipo: [
      { especie: 'duende', nivel: 7 },
      { especie: 'trasgo', nivel: 8 },
    ],
    valia: 7,
    premio: 600,
    objetos: { caracola: 1 },
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
    id: 'herbolaria',
    nombre: 'Herbolaria',
    equipo: [{ especie: 'vibora', nivel: 11 }],
    valia: 5,
    premio: 200,
    objetos: { aloe: 1 },
    antes: ['Busco hierbas por los cerros. Y a veces me encuentro otras cosas. ¿Lo ves?'],
    derrota: ['Toma, para las heridas. Yo ya tengo más.'],
    despues: ['La ruda espanta el mal de ojo. A las víboras, no tanto.'],
  },
  // ---------- Alcázar de Toledo ----------
  {
    id: 'escudero',
    nombre: 'Escudero',
    equipo: [{ especie: 'lagarto', nivel: 12 }],
    valia: 6,
    premio: 240,
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
    objetos: { emplasto: 2 },
    antes: ['En guardia. Toledo pelea con piedra y acero.'],
    derrota: ['Juan estaría orgulloso de un rival así.'],
    despues: ['Toledo resistirá lo que pueda.'],
  },
];

export const ENTRENADORES: Record<string, DefEntrenador> = Object.fromEntries(LISTA.map((e) => [e.id, e]));
