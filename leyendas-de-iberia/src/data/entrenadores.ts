import type { DefEntrenador } from '../core/mundo';

const LISTA: DefEntrenador[] = [
  {
    id: 'ballestero_sancho',
    nombre: 'Ballestero Sancho',
    equipo: [
      { especie: 'topillo', nivel: 3 },
      { especie: 'topillo', nivel: 4 },
    ],
    valia: 5,
    premio: 120,
    antes: ['¡Alto ahí! Un ballestero de la reina nunca rechaza un duelo.'],
    derrota: ['Buena puntería… la tuya, quiero decir.'],
    despues: ['En la hierba alta de la Vega saltan criaturas a montones. Ve con cuidado.'],
  },
  {
    id: 'mercader_genoves',
    nombre: 'Mercader genovés',
    equipo: [
      { especie: 'libelula', nivel: 5 },
      { especie: 'barbo', nivel: 6 },
      { especie: 'duende', nivel: 6 },
    ],
    valia: 6,
    premio: 160,
    antes: ['Vengo de Génova a hacer negocios con la corte. ¿Un duelo? ¡Trato hecho!'],
    derrota: ['¡Qué mala inversión!'],
    despues: ['Dicen que otro genovés, un tal Colón, lleva años pidiendo barcos a la reina.'],
  },
  {
    id: 'guardia_alhambra',
    nombre: 'Guardia de la Alhambra',
    equipo: [
      { especie: 'galapago', nivel: 7 },
      { especie: 'duende', nivel: 8 },
    ],
    valia: 7,
    premio: 200,
    antes: ['Nadie llega hasta el emir sin pasar antes por mí.'],
    derrota: ['Pasa. El emir te espera junto a la fuente.'],
    despues: ['Pocos han visto el Patio de los Leones. Míralo bien: quizá sea la última vez que es nuestro.'],
  },
  {
    id: 'boabdil',
    nombre: 'Boabdil',
    equipo: [
      { especie: 'barbo', nivel: 9 },
      { especie: 'galapago', nivel: 10 },
      { especie: 'leon_fuente', nivel: 11 },
    ],
    valia: 10,
    premio: 600,
    antes: [
      'Soy Muhammad, emir de Granada. Los cristianos me llaman Boabdil.',
      'Mañana entregaré la ciudad. Pero antes, las leyendas de la Alhambra merecen un último duelo.',
      '¡Que el agua de los leones decida!',
    ],
    derrota: ['Lo has ganado con justicia. Que las leyendas de Granada no se olviden.'],
    despues: ['Cuida de este patio. Doce leones lo han guardado durante más de cien años.'],
  },
];

export const ENTRENADORES: Record<string, DefEntrenador> = Object.fromEntries(LISTA.map((e) => [e.id, e]));
