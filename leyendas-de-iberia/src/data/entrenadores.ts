import type { DefEntrenador } from '../core/mundo';

// Capítulo 1, a petición del autor (2026-10-25): muchos entrenadores con una sola criatura y
// niveles bajos, para que la primera zona sea fácil con cualquier inicial. Las criaturas varían de
// tipo para que ninguna inicial tenga todos los combates en contra; Infernal sufre contra Agua y
// Tierra, así que hay pocas. Las zonas difíciles vendrán más adelante.

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
    id: 'hortelana',
    nombre: 'Hortelana',
    equipo: [{ especie: 'mandragora', nivel: 4 }],
    valia: 3,
    premio: 80,
    objetos: { unguento: 1 },
    antes: ['Dicen que la mandrágora grita cuando la arrancas. La mía grita cuando pelea.'],
    derrota: ['¡Calla, calla, que ya has ganado!'],
    despues: ['Riego con el agua de la acequia. Estas acequias las trazaron los andalusíes hace siglos.'],
  },
  {
    id: 'mercader_genoves',
    nombre: 'Mercader genovés',
    equipo: [{ especie: 'duende', nivel: 5 }],
    valia: 4,
    premio: 160,
    objetos: { tarro_miel: 1 },
    antes: ['Vengo de Génova a hacer negocios con la corte. ¿Un duelo? ¡Trato hecho!'],
    derrota: ['¡Qué mala inversión!'],
    despues: ['Dicen que otro genovés, un tal Colón, lleva años pidiendo barcos a la reina.'],
  },
  // ---------- La Alhambra (niveles 5 y 6) ----------
  {
    id: 'aguador',
    nombre: 'Aguador',
    equipo: [{ especie: 'barbo', nivel: 5 }],
    valia: 4,
    premio: 90,
    antes: ['¡Agua fresca del Darro! Pero antes, un duelo.'],
    derrota: ['Me has dejado más seco que el cauce en agosto.'],
    despues: ['La Alhambra bebe de la Acequia Real, que trae el agua desde el Darro.'],
  },
  {
    id: 'halconero',
    nombre: 'Halconero',
    equipo: [{ especie: 'abejaruco', nivel: 5 }],
    valia: 4,
    premio: 100,
    antes: ['Los halcones del emir nunca fallan. Mi abejaruco, tampoco.'],
    derrota: ['Hoy la presa he sido yo.'],
    despues: ['Desde las torres se ve toda la Vega. Y el real de Santa Fe, cada día más grande.'],
  },
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
      'El emir confía en sus leones, de agua y de tierra. Una criatura de planta o de aire te vendría bien.',
      'Pocos han visto el Patio de los Leones. Míralo bien: quizá sea la última vez que es nuestro.',
    ],
  },
  // ---------- Patio de los Leones ----------
  {
    id: 'boabdil',
    nombre: 'Boabdil',
    equipo: [
      { especie: 'duende', nivel: 7 },
      { especie: 'leon_fuente', nivel: 8 },
    ],
    valia: 7,
    premio: 600,
    objetos: { caracola: 1 },
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
