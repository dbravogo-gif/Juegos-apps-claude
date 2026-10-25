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
  { id: 'clave', nombre: 'Importantes' },
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
  // Curación
  { id: 'unguento', nombre: 'Poción', articulo: 'una', categoria: 'curacion', tipo: 'curar', cantidad: 20, precio: 60, descripcion: 'Devuelve 20 puntos de Vida.' },
  { id: 'emplasto', nombre: 'Superpoción', articulo: 'una', categoria: 'curacion', tipo: 'curar', cantidad: 60, precio: 180, descripcion: 'Devuelve 60 puntos de Vida.' },
  { id: 'triaca', nombre: 'Hiperpoción', articulo: 'una', categoria: 'curacion', tipo: 'curar', cantidad: 120, precio: 450, descripcion: 'Devuelve 120 puntos de Vida.' },
  { id: 'balsamo_fierabras', nombre: 'Poción máxima', articulo: 'una', categoria: 'curacion', tipo: 'curar', cantidad: 'toda', descripcion: 'Devuelve toda la Vida.' },
  // Estados
  { id: 'aloe', nombre: 'Antiquemar', articulo: 'un', categoria: 'estados', tipo: 'remedio', estados: ['quemado'], precio: 80, descripcion: 'Cura las quemaduras.' },
  { id: 'sales', nombre: 'Despertar', articulo: 'un', categoria: 'estados', tipo: 'remedio', estados: ['dormido'], precio: 80, descripcion: 'Despierta a una criatura dormida.' },
  {
    id: 'panacea',
    nombre: 'Cura total',
    articulo: 'una',
    categoria: 'estados',
    tipo: 'remedio',
    estados: ['quemado', 'dormido'],
    precio: 250,
    descripcion: 'Cura cualquier estado alterado.',
  },
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
  // Evolución
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
  { id: 'tuno', nombre: 'Baya Safre', articulo: 'una', categoria: 'bayas', tipo: 'equipo', efecto: { tipo: 'bayaEstado', estado: 'quemado' }, consumible: true, descripcion: 'Equipada: se la come y se cura si se quema.' },
  { id: 'endrina', nombre: 'Baya Atania', articulo: 'una', categoria: 'bayas', tipo: 'equipo', efecto: { tipo: 'bayaEstado', estado: 'dormido' }, consumible: true, descripcion: 'Equipada: se la come y se despierta si se duerme.' },
  // Importantes
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
