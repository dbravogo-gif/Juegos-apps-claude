import type { CategoriaObjeto, Objeto } from '../core/modelo';

// Objetos del juego. Las mecánicas son las clásicas del género, pero los nombres son propios y
// de aquí. Un objeto sin `precio` no se vende: se encuentra, se gana o lo regala alguien.
// El icono de cada uno está en `src/assets/objetos/<id>.png`.

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
  { id: 'bayas', nombre: 'Frutos' },
  { id: 'clave', nombre: 'Importantes' },
];

const lista: Objeto[] = [
  // Captura: las téseras de hospitalidad eran pactos celtíberos de metal.
  {
    id: 'tesera',
    nombre: 'Tésera',
    categoria: 'captura',
    tipo: 'captura',
    bonus: 1,
    precio: 50,
    descripcion: 'Pacto de bronce, como los de hospitalidad celtíberos. Sirve para capturar criaturas salvajes.',
  },
  {
    id: 'tesera_plata',
    nombre: 'Tésera de plata',
    categoria: 'captura',
    tipo: 'captura',
    bonus: 1.5,
    precio: 150,
    descripcion: 'Un pacto más firme: captura mejor que la de bronce.',
  },
  {
    id: 'tesera_oro',
    nombre: 'Tésera de oro',
    categoria: 'captura',
    tipo: 'captura',
    bonus: 2,
    precio: 350,
    descripcion: 'Pacto de oro: el doble de eficaz que la de bronce.',
  },
  {
    id: 'tesera_real',
    nombre: 'Tésera real',
    categoria: 'captura',
    tipo: 'captura',
    bonus: 1,
    segura: true,
    descripcion: 'Lleva el sello de la reina. Ninguna criatura salvaje rechaza este pacto. Solo hay una.',
  },
  // Curación
  { id: 'unguento', nombre: 'Ungüento', categoria: 'curacion', tipo: 'curar', cantidad: 20, precio: 60, descripcion: 'Devuelve 20 puntos de Vida.' },
  { id: 'emplasto', nombre: 'Emplasto', categoria: 'curacion', tipo: 'curar', cantidad: 60, precio: 180, descripcion: 'Devuelve 60 puntos de Vida.' },
  { id: 'triaca', nombre: 'Triaca', categoria: 'curacion', tipo: 'curar', cantidad: 120, precio: 450, descripcion: 'El remedio de los boticarios antiguos. Devuelve 120 puntos de Vida.' },
  {
    id: 'balsamo_fierabras',
    nombre: 'Bálsamo de Fierabrás',
    categoria: 'curacion',
    tipo: 'curar',
    cantidad: 'toda',
    descripcion: 'El bálsamo milagroso del Quijote. Devuelve toda la Vida.',
  },
  // Estados
  { id: 'aloe', nombre: 'Áloe', categoria: 'estados', tipo: 'remedio', estados: ['quemado'], precio: 80, descripcion: 'Su savia calma las quemaduras.' },
  { id: 'sales', nombre: 'Sales', categoria: 'estados', tipo: 'remedio', estados: ['dormido'], precio: 80, descripcion: 'Sales aromáticas: despiertan a cualquiera.' },
  {
    id: 'panacea',
    nombre: 'Panacea',
    categoria: 'estados',
    tipo: 'remedio',
    estados: ['quemado', 'dormido'],
    precio: 250,
    descripcion: 'Cura cualquier estado alterado.',
  },
  // Reanimación
  { id: 'aliento', nombre: 'Aliento', categoria: 'reanimacion', tipo: 'revivir', fraccion: 0.5, precio: 500, descripcion: 'Reanima a una criatura debilitada con la mitad de su Vida.' },
  { id: 'aliento_pleno', nombre: 'Aliento pleno', categoria: 'reanimacion', tipo: 'revivir', fraccion: 1, descripcion: 'Reanima a una criatura debilitada con toda su Vida.' },
  // Exploración
  { id: 'ruda', nombre: 'Ruda', categoria: 'exploracion', tipo: 'repelente', pasos: 100, precio: 120, descripcion: 'Su olor espanta a las criaturas más débiles que la primera de tu equipo durante 100 pasos.' },
  { id: 'romero', nombre: 'Romero', categoria: 'exploracion', tipo: 'repelente', pasos: 200, precio: 220, descripcion: 'Espanta a las criaturas más débiles durante 200 pasos.' },
  { id: 'sahumerio', nombre: 'Sahumerio', categoria: 'exploracion', tipo: 'repelente', pasos: 250, precio: 300, descripcion: 'Humo de hierbas: espanta a las criaturas más débiles durante 250 pasos.' },
  {
    id: 'ovillo',
    nombre: 'Ovillo',
    categoria: 'exploracion',
    tipo: 'huida',
    precio: 150,
    descripcion: 'Sigue el hilo de vuelta al último mesón. Solo sirve en los caminos, no en pueblos ni casas.',
  },
  // Progresión
  { id: 'turron', nombre: 'Turrón', categoria: 'progresion', tipo: 'nivel', descripcion: 'Un dulce tan bueno que la criatura sube un nivel.' },
  // Evolución
  {
    id: 'gorro_colorado',
    nombre: 'Gorro colorado',
    categoria: 'evolucion',
    tipo: 'evolucion',
    descripcion: 'El gorro rojo de los trasgos del norte. Hace evolucionar a un duende.',
  },
  // Combate: solo durante el combate y sobre la criatura que está luchando.
  { id: 'brebaje_fuerza', nombre: 'Brebaje de fuerza', categoria: 'combate', tipo: 'potenciador', estadistica: 'fuerza', cambio: 1, precio: 120, descripcion: 'Sube la Fuerza durante el combate.' },
  { id: 'brebaje_escudo', nombre: 'Brebaje de escudo', categoria: 'combate', tipo: 'potenciador', estadistica: 'escudo', cambio: 1, precio: 120, descripcion: 'Sube el Escudo durante el combate.' },
  { id: 'brebaje_magia', nombre: 'Brebaje de magia', categoria: 'combate', tipo: 'potenciador', estadistica: 'magia', cambio: 1, precio: 120, descripcion: 'Sube la Magia durante el combate.' },
  {
    id: 'brebaje_resistencia',
    nombre: 'Brebaje de resistencia',
    categoria: 'combate',
    tipo: 'potenciador',
    estadistica: 'resMagica',
    cambio: 1,
    precio: 120,
    descripcion: 'Sube la Resistencia mágica durante el combate.',
  },
  { id: 'brebaje_celeridad', nombre: 'Brebaje de celeridad', categoria: 'combate', tipo: 'potenciador', estadistica: 'celeridad', cambio: 1, precio: 120, descripcion: 'Sube la Celeridad durante el combate.' },
  // Para equipar
  { id: 'tarro_miel', nombre: 'Tarro de miel', categoria: 'equipo', tipo: 'equipo', efecto: { tipo: 'regenerar', fraccion: 1 / 16 }, descripcion: 'Equipado: recupera 1/16 de la Vida al final de cada turno.' },
  {
    id: 'amuleto_tanit',
    nombre: 'Amuleto de Tanit',
    categoria: 'equipo',
    tipo: 'equipo',
    efecto: { tipo: 'aguantar' },
    consumible: true,
    descripcion: 'Amuleto púnico de Ibiza. Equipado y con la Vida llena, aguanta con 1 un golpe que lo debilitaría. Se rompe al usarse.',
  },
  {
    id: 'polvora',
    nombre: 'Pólvora',
    categoria: 'equipo',
    tipo: 'equipo',
    efecto: { tipo: 'potenciar', multiplicador: 1.3, coste: 0.1 },
    descripcion: 'Equipada: sus ataques hacen un 30 % más de daño, pero pierde 1/10 de su Vida al golpear.',
  },
  { id: 'caracola', nombre: 'Caracola', categoria: 'equipo', tipo: 'equipo', efecto: { tipo: 'robarVida', fraccion: 1 / 8 }, descripcion: 'Equipada: recupera 1/8 del daño que hace.' },
  { id: 'azabache', nombre: 'Azabache', categoria: 'equipo', tipo: 'equipo', efecto: { tipo: 'experiencia', multiplicador: 1.5 }, descripcion: 'Amuleto de piedra negra. Equipado: gana la mitad más de experiencia.' },
  // Frutos: se equipan y se comen solos cuando hacen falta.
  {
    id: 'higo',
    nombre: 'Higo',
    categoria: 'bayas',
    tipo: 'equipo',
    efecto: { tipo: 'baya', umbral: 0.5, cura: 0.25 },
    consumible: true,
    descripcion: 'Equipado: al bajar de la mitad de la Vida, se lo come y recupera 1/4.',
  },
  { id: 'tuno', nombre: 'Tuno', categoria: 'bayas', tipo: 'equipo', efecto: { tipo: 'bayaEstado', estado: 'quemado' }, consumible: true, descripcion: 'Higo chumbo canario. Equipado: se lo come y se cura si se quema.' },
  { id: 'endrina', nombre: 'Endrina', categoria: 'bayas', tipo: 'equipo', efecto: { tipo: 'bayaEstado', estado: 'dormido' }, consumible: true, descripcion: 'Equipada: se la come y se despierta si se duerme.' },
  // Importantes
  {
    id: 'fosil_colmillo',
    nombre: 'Colmillo de sable',
    categoria: 'clave',
    tipo: 'clave',
    descripcion: 'Un colmillo enorme y curvo encontrado en Orce. Quizá algún sabio sepa qué bestia lo llevaba.',
  },
];

export const OBJETOS: Record<string, Objeto> = Object.fromEntries(lista.map((o) => [o.id, o]));
