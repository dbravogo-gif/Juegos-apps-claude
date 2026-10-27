import type { CategoriaObjeto, Objeto } from '../core/modelo';

// Objetos del juego. Por decisión del autor (2026-10-24), casi todos se llaman como en los
// juegos del género, para que se reconozcan al momento. Tienen nombre propio solo las téseras
// (para capturar), el Turrón (sube un nivel), el Gorro colorado y los objetos importantes.
// Un objeto sin `precio` no se vende: se encuentra, se gana o lo regala alguien.
// El icono de cada uno está en `src/assets/objetos/<id>.webp`. Los `id` son los de antes de
// cambiar los nombres, para no romper las partidas guardadas.

export const CATEGORIAS: { id: CategoriaObjeto; nombre: string }[] = [
  { id: 'captura', nombre: 'Captura' },
  { id: 'curacion', nombre: 'Curación' },
  { id: 'estados', nombre: 'Estados' },
  { id: 'reanimacion', nombre: 'Reanimación' },
  { id: 'exploracion', nombre: 'Exploración' },
  { id: 'progresion', nombre: 'Progresión' },
  { id: 'evolucion', nombre: 'Evolución' },
  { id: 'combate', nombre: 'Combate' },
  { id: 'equipo', nombre: 'Para equipar' },
  { id: 'bayas', nombre: 'Bayas' },
  { id: 'maquinas', nombre: 'MT y MO' },
  { id: 'clave', nombre: 'Importantes' },
];

/**
 * Los bolsillos de la mochila, como en los juegos del género: cada uno junta varias categorías.
 * Dentro de cada bolsillo, los objetos van en el orden de las categorías y luego en el de esta
 * lista.
 */
export const BOLSILLOS: { id: string; nombre: string; categorias: CategoriaObjeto[] }[] = [
  { id: 'objetos', nombre: 'Objetos', categorias: ['exploracion', 'progresion', 'evolucion', 'equipo'] },
  { id: 'botiquin', nombre: 'Botiquín', categorias: ['curacion', 'estados', 'reanimacion'] },
  { id: 'teseras', nombre: 'Téseras', categorias: ['captura'] },
  { id: 'combate', nombre: 'Combate', categorias: ['combate'] },
  { id: 'bayas', nombre: 'Bayas', categorias: ['bayas'] },
  { id: 'maquinas', nombre: 'MT y MO', categorias: ['maquinas'] },
  { id: 'clave', nombre: 'Importantes', categorias: ['clave'] },
];

const lista: Objeto[] = [
  // Captura: las téseras de hospitalidad eran pactos celtíberos de metal.
  {
    id: 'tesera',
    nombre: 'Tésera',
    articulo: 'una',
    categoria: 'captura',
    tipo: 'captura',
    bonus: 1,
    precio: 50,
    descripcion: 'Pacto de bronce, como los de hospitalidad celtíberos. Sirve para capturar criaturas salvajes.',
  },
  {
    id: 'tesera_plata',
    nombre: 'Tésera de plata',
    articulo: 'una',
    categoria: 'captura',
    tipo: 'captura',
    bonus: 1.5,
    precio: 150,
    descripcion: 'Un pacto más firme: captura mejor que la de bronce.',
  },
  {
    id: 'tesera_oro',
    nombre: 'Tésera de oro',
    articulo: 'una',
    categoria: 'captura',
    tipo: 'captura',
    bonus: 2,
    precio: 350,
    descripcion: 'Pacto de oro: el doble de eficaz que la de bronce.',
  },
  {
    id: 'tesera_real',
    nombre: 'Tésera real',
    articulo: 'una',
    categoria: 'captura',
    tipo: 'captura',
    bonus: 1,
    segura: true,
    descripcion: 'Lleva el sello de la reina. Ninguna criatura salvaje rechaza este pacto. Solo hay una.',
  },
  {
    id: 'tesera_rapida',
    nombre: 'Tésera rápida',
    articulo: 'una',
    categoria: 'captura',
    tipo: 'captura',
    bonus: 1,
    bonusSi: { bonus: 5, primerTurno: true },
    precio: 250,
    descripcion: 'Un pacto que se sella al vuelo: lanzada en el primer turno, captura muchísimo mejor.',
  },
  {
    id: 'tesera_red',
    nombre: 'Tésera de red',
    articulo: 'una',
    categoria: 'captura',
    tipo: 'captura',
    bonus: 1,
    bonusSi: { bonus: 3, tipos: ['agua', 'aire'] },
    precio: 250,
    descripcion: 'Atada a una red de pescador: captura mucho mejor a las criaturas de Agua y de Aire.',
  },
  // Curación
  { id: 'unguento', nombre: 'Poción', articulo: 'una', categoria: 'curacion', tipo: 'curar', cantidad: 20, precio: 60, descripcion: 'Devuelve 20 puntos de Vida.' },
  { id: 'emplasto', nombre: 'Superpoción', articulo: 'una', categoria: 'curacion', tipo: 'curar', cantidad: 60, precio: 180, descripcion: 'Devuelve 60 puntos de Vida.' },
  { id: 'triaca', nombre: 'Hiperpoción', articulo: 'una', categoria: 'curacion', tipo: 'curar', cantidad: 120, precio: 450, descripcion: 'Devuelve 120 puntos de Vida.' },
  { id: 'balsamo_fierabras', nombre: 'Poción máxima', articulo: 'una', categoria: 'curacion', tipo: 'curar', cantidad: 'toda', descripcion: 'Devuelve toda la Vida.' },
  // Estados
  { id: 'aloe', nombre: 'Antiquemar', articulo: 'un', categoria: 'estados', tipo: 'remedio', estados: ['quemado'], precio: 80, descripcion: 'Cura las quemaduras.' },
  { id: 'sales', nombre: 'Despertar', articulo: 'un', categoria: 'estados', tipo: 'remedio', estados: ['dormido'], precio: 80, descripcion: 'Despierta a una criatura dormida.' },
  { id: 'antiparalizador', nombre: 'Antiparalizador', articulo: 'un', categoria: 'estados', tipo: 'remedio', estados: ['paralizado'], precio: 100, descripcion: 'Cura la parálisis.' },
  { id: 'tila', nombre: 'Tila', articulo: 'una', categoria: 'estados', tipo: 'remedio', estados: ['colera'], precio: 100, descripcion: 'Una taza de tila: calma a una criatura en cólera.' },
  { id: 'antidoto', nombre: 'Antídoto', articulo: 'un', categoria: 'estados', tipo: 'remedio', estados: ['envenenado', 'intoxicado'], precio: 80, descripcion: 'Cura el envenenamiento.' },
  {
    id: 'panacea',
    nombre: 'Cura total',
    articulo: 'una',
    categoria: 'estados',
    tipo: 'remedio',
    estados: ['quemado', 'dormido', 'paralizado', 'envenenado', 'intoxicado', 'colera'],
    precio: 250,
    descripcion: 'Cura cualquier estado alterado.',
  },
  // PP
  { id: 'elixir', nombre: 'Elixir', articulo: 'un', categoria: 'curacion', tipo: 'pp', cantidad: 10, descripcion: 'Devuelve 10 PP a cada movimiento.' },
  { id: 'elixir_maximo', nombre: 'Elixir máximo', articulo: 'un', categoria: 'curacion', tipo: 'pp', cantidad: 'toda', descripcion: 'Devuelve todos los PP de todos los movimientos.' },
  // Reanimación
  { id: 'aliento', nombre: 'Revivir', articulo: 'un', categoria: 'reanimacion', tipo: 'revivir', fraccion: 0.5, precio: 500, descripcion: 'Reanima a una criatura debilitada con la mitad de su Vida.' },
  { id: 'aliento_pleno', nombre: 'Revivir máximo', articulo: 'un', categoria: 'reanimacion', tipo: 'revivir', fraccion: 1, descripcion: 'Reanima a una criatura debilitada con toda su Vida.' },
  // Exploración
  { id: 'ruda', nombre: 'Repelente', articulo: 'un', categoria: 'exploracion', tipo: 'repelente', pasos: 100, precio: 120, descripcion: 'Durante 100 pasos no aparecen criaturas más débiles que la primera de tu equipo.' },
  { id: 'romero', nombre: 'Superrepelente', articulo: 'un', categoria: 'exploracion', tipo: 'repelente', pasos: 200, precio: 220, descripcion: 'Como el Repelente, pero dura 200 pasos.' },
  { id: 'sahumerio', nombre: 'Máximo repelente', articulo: 'un', categoria: 'exploracion', tipo: 'repelente', pasos: 250, precio: 300, descripcion: 'Como el Repelente, pero dura 250 pasos.' },
  {
    id: 'ovillo',
    nombre: 'Cuerda huida',
    articulo: 'una',
    categoria: 'exploracion',
    tipo: 'huida',
    precio: 150,
    descripcion: 'Te lleva de vuelta al último mesón. Solo sirve en los caminos, no en pueblos ni casas.',
  },
  // Progresión
  { id: 'turron', nombre: 'Turrón', articulo: 'un', categoria: 'progresion', tipo: 'nivel', descripcion: 'Un dulce tan bueno que la criatura sube un nivel.' },
  // Evolución: las piedras hacen evolucionar a algunas especies (`evoluciona.objeto`). Las de
  // fuego, agua, hoja y trueno esperan en `arte/objetos-reserva/` a sus líneas (BESTIARIO.md).
  { id: 'piedra_lunar', nombre: 'Piedra lunar', articulo: 'una', categoria: 'evolucion', tipo: 'evolucion', descripcion: 'Una piedra pálida que brilla en las noches de ánimas. Lobregón evoluciona a Lobánima con ella.' },
  { id: 'piedra_solar', nombre: 'Piedra solar', articulo: 'una', categoria: 'evolucion', tipo: 'evolucion', descripcion: 'Una piedra roja que quema como el sol de Castilla. Aquilín evoluciona a Imperión con ella.' },
  {
    id: 'gorro_colorado',
    nombre: 'Gorro colorado',
    articulo: 'un',
    categoria: 'evolucion',
    tipo: 'evolucion',
    descripcion: 'El gorro rojo de los trasgos del norte. Si se lo das a Brezuco, evoluciona a Trasgorn.',
  },
  // Combate: solo durante el combate y sobre la criatura que está luchando.
  { id: 'brebaje_fuerza', nombre: 'Fuerza X', articulo: 'un', categoria: 'combate', tipo: 'potenciador', estadistica: 'fuerza', cambio: 1, precio: 120, descripcion: 'Sube la Fuerza durante el combate.' },
  { id: 'brebaje_escudo', nombre: 'Escudo X', articulo: 'un', categoria: 'combate', tipo: 'potenciador', estadistica: 'escudo', cambio: 1, precio: 120, descripcion: 'Sube el Escudo durante el combate.' },
  { id: 'brebaje_magia', nombre: 'Magia X', articulo: 'un', categoria: 'combate', tipo: 'potenciador', estadistica: 'magia', cambio: 1, precio: 120, descripcion: 'Sube la Magia durante el combate.' },
  {
    id: 'brebaje_resistencia',
    nombre: 'Resistencia X',
    articulo: 'un',
    categoria: 'combate',
    tipo: 'potenciador',
    estadistica: 'resMagica',
    cambio: 1,
    precio: 120,
    descripcion: 'Sube la Resistencia mágica durante el combate.',
  },
  { id: 'brebaje_celeridad', nombre: 'Celeridad X', articulo: 'un', categoria: 'combate', tipo: 'potenciador', estadistica: 'celeridad', cambio: 1, precio: 120, descripcion: 'Sube la Celeridad durante el combate.' },
  // Para equipar
  { id: 'tarro_miel', nombre: 'Restos', articulo: 'unos', categoria: 'equipo', tipo: 'equipo', efecto: { tipo: 'regenerar', fraccion: 1 / 16 }, descripcion: 'Equipados: recupera 1/16 de la Vida al final de cada turno.' },
  {
    id: 'amuleto_tanit',
    nombre: 'Banda focus',
    articulo: 'una',
    categoria: 'equipo',
    tipo: 'equipo',
    efecto: { tipo: 'aguantar' },
    consumible: true,
    descripcion: 'Equipada y con la Vida llena, aguanta con 1 un golpe que la debilitaría. Se rompe al usarse.',
  },
  {
    id: 'polvora',
    nombre: 'Vidasfera',
    articulo: 'una',
    categoria: 'equipo',
    tipo: 'equipo',
    efecto: { tipo: 'potenciar', multiplicador: 1.3, coste: 0.1 },
    descripcion: 'Equipada: sus ataques hacen un 30 % más de daño, pero pierde 1/10 de su Vida al golpear.',
  },
  { id: 'caracola', nombre: 'Campana concha', articulo: 'una', categoria: 'equipo', tipo: 'equipo', efecto: { tipo: 'robarVida', fraccion: 1 / 8 }, descripcion: 'Equipada: recupera 1/8 del daño que hace.' },
  { id: 'azabache', nombre: 'Huevo suerte', articulo: 'un', categoria: 'equipo', tipo: 'equipo', efecto: { tipo: 'experiencia', multiplicador: 1.5 }, descripcion: 'Equipado: gana la mitad más de experiencia.' },
  { id: 'garra_rapida', nombre: 'Garra rápida', articulo: 'una', categoria: 'equipo', tipo: 'equipo', efecto: { tipo: 'primero', prob: 20 }, descripcion: 'Equipada: a veces (20 %) actúa la primera.' },
  { id: 'periscopio', nombre: 'Periscopio', articulo: 'un', categoria: 'equipo', tipo: 'equipo', efecto: { tipo: 'critico', multiplicador: 2 }, descripcion: 'Equipado: da golpes críticos el doble de a menudo.' },
  { id: 'lente_amplia', nombre: 'Lupa', articulo: 'una', categoria: 'equipo', tipo: 'equipo', efecto: { tipo: 'precision', multiplicador: 1.1 }, descripcion: 'Equipada: sus movimientos aciertan un 10 % más.' },
  { id: 'bola_humo', nombre: 'Bola humo', articulo: 'una', categoria: 'equipo', tipo: 'equipo', efecto: { tipo: 'huida' }, descripcion: 'Equipada: siempre consigue huir de las criaturas salvajes.' },
  // Potenciadores de tipo (equipados, un 20 % más con los ataques de su tipo).
  ...([
    ['panuelo_seda', 'Pañuelo seda', 'un', 'comun', 'Común'],
    ['agua_mistica', 'Agua mística', 'un', 'agua', 'Agua'],
    ['carbon', 'Carbón', 'un', 'infernal', 'Infernal'],
    ['semilla_milagro', 'Semilla milagro', 'una', 'planta', 'Planta'],
    ['arena_fina', 'Arena fina', 'una', 'tierra', 'Tierra'],
    ['pico_afilado', 'Pico afilado', 'un', 'aire', 'Aire'],
    ['iman', 'Imán', 'un', 'electrico', 'Eléctrico'],
    ['velo_negro', 'Velo negro', 'un', 'oscuridad', 'Oscuridad'],
    ['revestimiento_metalico', 'Revestimiento metálico', 'un', 'acero', 'Acero'],
    ['cuchara_torcida', 'Cuchara torcida', 'una', 'mental', 'Mental'],
    ['antiderretir', 'Antiderretir', 'un', 'hielo', 'Hielo'],
    ['hechizo', 'Hechizo', 'un', 'espectral', 'Espectral'],
  ] as const).map(
    ([id, nombre, articulo, tipoMov, nombreTipo]): Objeto => ({
      id,
      nombre,
      articulo,
      categoria: 'equipo',
      tipo: 'equipo',
      efecto: { tipo: 'potenciarTipo', tipoMov, multiplicador: 1.2 },
      descripcion: `Equipado: sus ataques de tipo ${nombreTipo} pegan un 20 % más.`,
    }),
  ),
  // Bayas: se equipan y se comen solas cuando hacen falta.
  {
    id: 'higo',
    nombre: 'Baya Zidra',
    articulo: 'una',
    categoria: 'bayas',
    tipo: 'equipo',
    efecto: { tipo: 'baya', umbral: 0.5, cura: 0.25 },
    consumible: true,
    descripcion: 'Equipada: al bajar de la mitad de la Vida, se la come y recupera 1/4.',
  },
  { id: 'baya_aranja', nombre: 'Baya Aranja', articulo: 'una', categoria: 'bayas', tipo: 'equipo', efecto: { tipo: 'baya', umbral: 0.5, puntos: 10 }, consumible: true, descripcion: 'Equipada: al bajar de la mitad de la Vida, se la come y recupera 10 de Vida.' },
  { id: 'tuno', nombre: 'Baya Safre', articulo: 'una', categoria: 'bayas', tipo: 'equipo', efecto: { tipo: 'bayaEstado', estados: ['quemado'] }, consumible: true, descripcion: 'Equipada: se la come y se cura si se quema.' },
  { id: 'endrina', nombre: 'Baya Atania', articulo: 'una', categoria: 'bayas', tipo: 'equipo', efecto: { tipo: 'bayaEstado', estados: ['dormido'] }, consumible: true, descripcion: 'Equipada: se la come y se despierta si se duerme.' },
  { id: 'baya_zreza', nombre: 'Baya Zreza', articulo: 'una', categoria: 'bayas', tipo: 'equipo', efecto: { tipo: 'bayaEstado', estados: ['paralizado'] }, consumible: true, descripcion: 'Equipada: se la come y se cura si la paralizan.' },
  { id: 'baya_meloc', nombre: 'Baya Meloc', articulo: 'una', categoria: 'bayas', tipo: 'equipo', efecto: { tipo: 'bayaEstado', estados: ['envenenado', 'intoxicado'] }, consumible: true, descripcion: 'Equipada: se la come y se cura si la envenenan.' },
  { id: 'baya_perasi', nombre: 'Baya Perasi', articulo: 'una', categoria: 'bayas', tipo: 'equipo', efecto: { tipo: 'bayaEstado', estados: ['cegado'] }, consumible: true, descripcion: 'Equipada: se la come y recupera la vista si la ciegan.' },
  { id: 'baya_caquic', nombre: 'Baya Caquic', articulo: 'una', categoria: 'bayas', tipo: 'equipo', efecto: { tipo: 'bayaEstado', estados: ['colera'] }, consumible: true, descripcion: 'Equipada: se la come y se calma si monta en cólera.' },
  {
    id: 'baya_ziuela',
    nombre: 'Baya Ziuela',
    articulo: 'una',
    categoria: 'bayas',
    tipo: 'equipo',
    efecto: { tipo: 'bayaEstado', estados: ['quemado', 'dormido', 'paralizado', 'envenenado', 'intoxicado', 'colera', 'cegado'] },
    consumible: true,
    descripcion: 'Equipada: se la come y se cura de cualquier estado alterado o de la ceguera.',
  },
  // MT: las dan los líderes o están por el suelo. No se gastan. Su icono es el de `mt` o `mo`.
  {
    id: 'mt_noche_cerrada',
    nombre: 'MT01 Noche cerrada',
    articulo: 'una',
    categoria: 'maquinas',
    tipo: 'maquina',
    movimiento: 'noche_cerrada',
    aprenden: { tipos: ['oscuridad', 'espectral', 'mental'] },
    descripcion: 'Enseña Noche cerrada (Oscuridad). Te la da Boabdil. No se gasta.',
  },
  {
    id: 'mt_hoja_toledana',
    nombre: 'MT02 Hoja toledana',
    articulo: 'una',
    categoria: 'maquinas',
    tipo: 'maquina',
    movimiento: 'hoja_toledana',
    aprenden: { tipos: ['acero'], especies: ['lagarto', 'lagarto_muralla', 'cangrejo', 'necora', 'escarabajo_pelotero'] },
    descripcion: 'Enseña Hoja toledana (Acero), templada como las espadas de Toledo. Te la da María Pacheco. No se gasta.',
  },
  {
    id: 'mt_mocarabe',
    nombre: 'MT03 Mocárabe',
    articulo: 'una',
    categoria: 'maquinas',
    tipo: 'maquina',
    movimiento: 'mocarabe',
    aprenden: { tipos: ['luz', 'mental'], especies: ['leon_fuente', 'duende'] },
    descripcion: 'Enseña Mocárabe (Luz). No se gasta.',
  },
  {
    id: 'mt_pisoton',
    nombre: 'MT04 Pisotón',
    articulo: 'una',
    categoria: 'maquinas',
    tipo: 'maquina',
    movimiento: 'pisoton',
    aprenden: { todos: true },
    descripcion: 'Enseña Pisotón (Común). Cualquier criatura puede aprenderlo. No se gasta.',
  },
  {
    id: 'mt_temblor',
    nombre: 'MT05 Temblor',
    articulo: 'una',
    categoria: 'maquinas',
    tipo: 'maquina',
    movimiento: 'temblor',
    aprenden: { tipos: ['tierra'] },
    descripcion: 'Enseña Temblor (Tierra). No se gasta.',
  },
  {
    id: 'mt_rodela',
    nombre: 'MT06 Rodela',
    articulo: 'una',
    categoria: 'maquinas',
    tipo: 'maquina',
    movimiento: 'rodela',
    aprenden: { todos: true },
    descripcion: 'Enseña Rodela (Común): se protege de todo durante un turno. Cualquier criatura puede aprenderlo. No se gasta.',
  },
  {
    id: 'mt_resaca',
    nombre: 'MT07 Resaca',
    articulo: 'una',
    categoria: 'maquinas',
    tipo: 'maquina',
    movimiento: 'resaca',
    aprenden: { tipos: ['agua'] },
    descripcion: 'Enseña Resaca (Agua): puede bajar la Celeridad del rival. No se gasta.',
  },
  // MO: las dan personajes importantes. Sus movimientos también se usan fuera de combate.
  {
    id: 'mo_surf',
    nombre: 'MO01 Pleamar',
    articulo: 'una',
    categoria: 'maquinas',
    tipo: 'maquina',
    movimiento: 'surf',
    oculta: true,
    // Solo las criaturas que viven en el agua: Alhambrón es de tipo Agua, pero es una estatua.
    aprenden: { acuaticas: true },
    descripcion: 'Enseña Pleamar (Agua) a una criatura acuática. Fuera de combate, te lleva por ríos y mares. No se gasta.',
  },
  {
    id: 'mo_vuelo',
    nombre: 'MO02 Vuelo',
    articulo: 'una',
    categoria: 'maquinas',
    tipo: 'maquina',
    movimiento: 'vuelo',
    oculta: true,
    // Solo las aves y los seres alados capaces de llevar a una persona.
    aprenden: { aladas: true },
    descripcion: 'Enseña Vuelo (Aire). Fuera de combate, la criatura te lleva volando a un lugar que ya conoces. No se gasta.',
  },
  // Importantes
  {
    id: 'cana',
    nombre: 'Caña',
    articulo: 'una',
    categoria: 'clave',
    tipo: 'clave',
    descripcion: 'Una caña de pescar de cañavera. Ponte delante del agua y pulsa A para echarla.',
  },
  {
    id: 'repartir_exp',
    nombre: 'Repartir experiencia',
    articulo: 'un',
    categoria: 'clave',
    tipo: 'clave',
    interruptor: { apagado: 'repartir_exp:apagado' },
    descripcion: 'Encendido, las criaturas del equipo que no luchan ganan la mitad de experiencia. Se enciende y se apaga desde la mochila.',
  },
  {
    id: 'alpargatas',
    nombre: 'Alpargatas',
    articulo: 'unas',
    categoria: 'clave',
    tipo: 'clave',
    descripcion: 'Alpargatas de esparto, regalo del rey Fernando. Con ellas puedes correr: mantén pulsado B mientras andas.',
  },
  {
    id: 'mapa',
    nombre: 'Mapa',
    articulo: 'un',
    categoria: 'clave',
    tipo: 'clave',
    descripcion: 'La carta de los reinos que te dio Colón. Se mira desde el menú; con Vuelo, sirve para viajar.',
  },
  {
    id: 'fosil_colmillo',
    nombre: 'Colmillo de sable',
    articulo: 'un',
    categoria: 'clave',
    tipo: 'clave',
    descripcion: 'Un colmillo enorme y curvo encontrado en Orce. Quizá algún sabio sepa qué bestia lo llevaba.',
  },
];

export const OBJETOS: Record<string, Objeto> = Object.fromEntries(lista.map((o) => [o.id, o]));

/**
 * Objetos demasiado buenos para el principio, como en el género: el capítulo desde el que se pueden
 * esconder, dar, vender o ganar (decisión del autor, 2026-10-27). Los que no están, desde el
 * capítulo 1. Las pruebas lo comprueban en mapas, guiones, tiendas, premios y tinajas.
 */
export const CAPITULO_MINIMO: Record<string, number> = {
  // Capítulo 2: la Lupa y los potenciadores de tipo, que solo suben un 20 %.
  lente_amplia: 2,
  ...Object.fromEntries(lista.filter((o) => o.tipo === 'equipo' && o.efecto.tipo === 'potenciarTipo').map((o) => [o.id, 2])),
  // Capítulo 3: los equipables que deciden combates, las curas máximas y la Tésera de oro.
  amuleto_tanit: 3,
  garra_rapida: 3,
  tarro_miel: 3,
  polvora: 3,
  caracola: 3,
  azabache: 3,
  periscopio: 3,
  triaca: 3,
  balsamo_fierabras: 3,
  aliento_pleno: 3,
  elixir_maximo: 3,
  tesera_oro: 3,
  // La Tésera real, la que no falla, casi al final (propuesta).
  tesera_real: 6,
};
