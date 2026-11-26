// Datos del combate: las iniciales y sus formas, los ataques y los primeros objetos. Las demás
// criaturas, las del autor, están en criaturas.ts (generado). Los nombres de los ataques son
// propios, sin copiar los de otros juegos (R8). Las de relleno se quitaron el 2026-11-19: tomaban
// prestado el modelo de una inicial y parecía que salían iniciales en hierbas y entrenadores.

import type { DatosJuego, Especie, Estadisticas, Movimiento } from '../core/modelo';
import { ESPECIES_CRIATURAS, MODELO_CRIATURA } from './criaturas';
import { TEMPERAMENTOS } from './temperamentos';
import { TABLA_TIPOS } from './tipos';

const base = (vida: number, fuerza: number, escudo: number, magia: number, resMagica: number, celeridad: number): Estadisticas => ({
  vida,
  fuerza,
  escudo,
  magia,
  resMagica,
  celeridad,
});

const movimientos: Movimiento[] = [
  { id: 'topetazo', nombre: 'Topetazo', tipo: 'comun', categoria: 'fisico', poder: 40, precision: 100, pp: 35 },
  { id: 'mirada-fija', nombre: 'Mirada fija', tipo: 'comun', categoria: 'estado', poder: 0, precision: 100, pp: 30, objetivo: 'rivales', efectos: [{ tipo: 'etapa', a: 'objetivo', estadistica: 'escudo', cambio: -1, prob: 100 }] },
  // El ataque flojo de Agua con que empieza Cronti (autor, 2026-11-26, D1): sin él perdía siempre su
  // primer combate, contra uno de Roca, con solo ataques comunes.
  { id: 'chapoteo', nombre: 'Chapoteo', tipo: 'agua', categoria: 'fisico', poder: 30, precision: 100, pp: 30 },
  { id: 'remojon', nombre: 'Remojón', tipo: 'agua', categoria: 'magico', poder: 40, precision: 100, pp: 25 },
  { id: 'ola-de-cresta', nombre: 'Ola de cresta', tipo: 'agua', categoria: 'fisico', poder: 55, precision: 95, pp: 15 },
  { id: 'latigazo-de-musgo', nombre: 'Latigazo de musgo', tipo: 'planta', categoria: 'fisico', poder: 45, precision: 100, pp: 25 },
  { id: 'esporas-de-hoja', nombre: 'Esporas de hoja', tipo: 'planta', categoria: 'magico', poder: 50, precision: 95, pp: 15 },
  { id: 'soplo-de-brasas', nombre: 'Soplo de brasas', tipo: 'infernal', categoria: 'magico', poder: 40, precision: 100, pp: 25, efectos: [{ tipo: 'estado', estado: 'quemado', prob: 10 }] },
  { id: 'orejazo-ardiente', nombre: 'Orejazo ardiente', tipo: 'infernal', categoria: 'fisico', poder: 55, precision: 95, pp: 15 },
  { id: 'barrito', nombre: 'Barrito', tipo: 'comun', categoria: 'estado', poder: 0, precision: 100, pp: 30, objetivo: 'rivales', efectos: [{ tipo: 'etapa', a: 'objetivo', estadistica: 'fuerza', cambio: -1, prob: 100 }] },
  { id: 'rodada-de-piedra', nombre: 'Rodada de piedra', tipo: 'roca', categoria: 'fisico', poder: 50, precision: 95, pp: 20 },
  { id: 'polvo-de-picon', nombre: 'Polvo de picón', tipo: 'roca', categoria: 'magico', poder: 40, precision: 100, pp: 25 },
  // De Acero, flojo: para que la inicial de fuego no se quede sin nada contra el gimnasio de Roca,
  // donde todos sus otros ataques están resistidos (autor, 2026-11-15).
  { id: 'trompazo-de-hierro', nombre: 'Trompazo de hierro', tipo: 'acero', categoria: 'fisico', poder: 35, precision: 100, pp: 30 },
  // De Lucha, para las criaturas de Lucha del autor (2026-11-19). Agarrón: la presa de la lucha canaria.
  { id: 'agarron', nombre: 'Agarrón', tipo: 'lucha', categoria: 'fisico', poder: 50, precision: 100, pp: 20 },
  // De Bicho, Veneno y Hielo, para las criaturas del autor (2026-11-20): nombres propios.
  { id: 'chirrido-de-elitros', nombre: 'Chirrido de élitros', tipo: 'bicho', categoria: 'magico', poder: 45, precision: 100, pp: 25 },
  { id: 'tenaza-de-quitina', nombre: 'Tenaza de quitina', tipo: 'bicho', categoria: 'fisico', poder: 55, precision: 95, pp: 15 },
  { id: 'savia-toxica', nombre: 'Savia tóxica', tipo: 'veneno', categoria: 'magico', poder: 40, precision: 100, pp: 25, efectos: [{ tipo: 'estado', estado: 'envenenado', prob: 20 }] },
  { id: 'escarcha', nombre: 'Escarcha', tipo: 'hielo', categoria: 'magico', poder: 50, precision: 95, pp: 15 },
  // De Aire (los usa la línea de Ravich).
  { id: 'rafaga', nombre: 'Ráfaga', tipo: 'aire', categoria: 'magico', poder: 40, precision: 100, pp: 25 },
  { id: 'picado', nombre: 'Picado', tipo: 'aire', categoria: 'fisico', poder: 55, precision: 95, pp: 15 },
  // De Tierra (la quinta inicial, autor, 2026-11-13).
  { id: 'pisoton', nombre: 'Pisotón', tipo: 'tierra', categoria: 'fisico', poder: 50, precision: 95, pp: 20 },
  { id: 'arenazo', nombre: 'Arenazo', tipo: 'tierra', categoria: 'magico', poder: 40, precision: 100, pp: 25 },
  { id: 'caparazon', nombre: 'Caparazón', tipo: 'comun', categoria: 'estado', poder: 0, precision: null, pp: 20, objetivo: 'propio', efectos: [{ tipo: 'etapa', a: 'propio', estadistica: 'escudo', cambio: 1, prob: 100 }] },
];

/** Los ataques que aprende, con su nivel. */
const enNiveles = (...pares: [number, string][]) => pares.map(([nivel, movimiento]) => ({ nivel, movimiento }));

const especies: Especie[] = [
  // Las iniciales: estadísticas con el carácter que pidió el autor (FORMAS_INICIALES, abajo).
  // Empiezan con un ataque común y uno de estado; el de su tipo llega al nivel 7 y el segundo al 13
  // (autor, 2026-11-19). La de fuego aprende al 9 su ataque flojo de Acero, antes del gimnasio de
  // Roca. Cuatro como mucho: aún no hay pantalla para olvidar uno (tests/ataques.test.ts).
  { id: 'inicial-agua', nombre: 'Cronti', tipos: ['agua'], base: base(50, 65, 64, 44, 48, 43), expBase: 60, ratioCaptura: 45, aprende: enNiveles([1, 'topetazo'], [1, 'chapoteo'], [9, 'remojon'], [13, 'ola-de-cresta']), altura: 0.4, descripcion: '' },
  { id: 'inicial-planta', nombre: 'Lisza', tipos: ['planta'], base: base(36, 39, 36, 77, 50, 76), expBase: 60, ratioCaptura: 45, aprende: enNiveles([1, 'topetazo'], [1, 'mirada-fija'], [7, 'latigazo-de-musgo'], [13, 'esporas-de-hoja']), altura: 0.4, descripcion: '' },
  { id: 'inicial-infernal', nombre: 'Nokoribi', tipos: ['infernal'], base: base(59, 33, 59, 65, 62, 36), expBase: 60, ratioCaptura: 45, aprende: enNiveles([1, 'topetazo'], [1, 'barrito'], [8, 'soplo-de-brasas'], [9, 'trompazo-de-hierro']), altura: 0.4, descripcion: '' },
  { id: 'inicial-tierra', nombre: 'Tsubomi', tipos: ['tierra'], base: base(48, 36, 48, 63, 57, 62), expBase: 60, ratioCaptura: 45, aprende: enNiveles([1, 'topetazo'], [1, 'mirada-fija'], [8, 'arenazo'], [13, 'pisoton']), altura: 0.4, descripcion: '' },
  { id: 'inicial-roca', nombre: 'Armalito', tipos: ['roca'], base: base(59, 71, 68, 33, 54, 29), expBase: 60, ratioCaptura: 45, aprende: enNiveles([1, 'topetazo'], [1, 'caparazon'], [9, 'rodada-de-piedra'], [13, 'pisoton']), altura: 0.4, descripcion: '' },
];

/** A qué nivel evolucionan las iniciales: a la 2.ª forma y a la 3.ª. */
export const NIVELES_EVOLUCION_INICIAL = [16, 34] as const;

/**
 * Las formas 2.ª y 3.ª de las iniciales, con los modelos del autor (2026-11-19) y sus nombres.
 * Estadísticas propuestas por Claude con el carácter que pidió el autor (2026-11-19), sumando todas
 * lo mismo en cada forma (314, 405 y 530):
 * - Agua: las de su referencia (Totodile, Croconaw y Feraligatr), atacante física;
 * - Infernal: tanque lenta y atacante especial;
 * - Planta: muy rápida y muy buena atacante especial, con poca vida;
 * - Roca: luchadora tanque, bastante lenta;
 * - Tierra: atacante especial bastante rápida, más tanque y peor atacante que la de Planta.
 * Aprenden lo mismo que la 1.ª forma.
 */
const FORMAS_INICIALES: Readonly<
  Record<string, { nombres: [string, string]; tipos: [Especie['tipos'], Especie['tipos']]; alturas: [number, number]; bases: [Estadisticas, Estadisticas] }>
> = {
  agua: { nombres: ['Chicront', 'Krantacor'], tipos: [['agua'], ['agua']], alturas: [0.9, 1.6], bases: [base(65, 80, 80, 59, 63, 58), base(85, 105, 100, 79, 83, 78)] },
  planta: { nombres: ['Sporecko', 'Transcecko'], tipos: [['planta'], ['planta', 'mental']], alturas: [0.9, 1.7], bases: [base(46, 50, 46, 99, 65, 99), base(60, 65, 60, 130, 85, 130)] },
  infernal: { nombres: ['Hinozö', 'Dumbotron'], tipos: [['infernal'], ['infernal']], alturas: [0.9, 1.7], bases: [base(76, 42, 76, 84, 80, 47), base(100, 55, 100, 110, 105, 60)] },
  roca: { nombres: ['Uralito', 'Reactolito'], tipos: [['roca', 'veneno'], ['roca', 'veneno']], alturas: [1.0, 1.8], bases: [base(76, 92, 88, 42, 69, 38), base(100, 120, 115, 55, 90, 50)] },
  tierra: { nombres: ['Tsuborei', 'Sunaiki'], tipos: [['tierra', 'espectral'], ['tierra', 'espectral']], alturas: [0.9, 1.7], bases: [base(61, 46, 61, 80, 73, 84), base(80, 60, 80, 105, 95, 110)] },
};

function formasDeInicial(primera: Especie, tipo: string): Especie[] {
  const f = FORMAS_INICIALES[tipo]!;
  const segunda: Especie = {
    ...primera,
    id: `${primera.id}-2`,
    nombre: f.nombres[0],
    tipos: f.tipos[0],
    base: f.bases[0],
    expBase: 140,
    altura: f.alturas[0],
    evoluciona: [{ a: `${primera.id}-3`, nivel: NIVELES_EVOLUCION_INICIAL[1] }],
  };
  const tercera: Especie = { ...primera, id: `${primera.id}-3`, nombre: f.nombres[1], tipos: f.tipos[1], base: f.bases[1], expBase: 240, altura: f.alturas[1] };
  delete tercera.evoluciona;
  return [{ ...primera, evoluciona: [{ a: segunda.id, nivel: NIVELES_EVOLUCION_INICIAL[0] }] }, segunda, tercera];
}

const conFormas = especies.flatMap((e) => {
  const tipo = Object.keys(FORMAS_INICIALES).find((t) => e.id === `inicial-${t}`);
  return tipo ? formasDeInicial(e, tipo) : [e];
});

export const DATOS_COMBATE_PRUEBA: DatosJuego = {
  especies: Object.fromEntries([...conFormas, ...ESPECIES_CRIATURAS].map((e) => [e.id, e])),
  movimientos: Object.fromEntries(movimientos.map((m) => [m.id, m])),
  temperamentos: TEMPERAMENTOS,
  tipos: TABLA_TIPOS,
  // Pocos y flojos al principio (autor, 2026-11-11).
  objetos: {
    pocion: { id: 'pocion', nombre: 'Poción', descripcion: 'Cura 20 puntos de vida.', tipo: 'curar', cantidad: 20, precio: 300 },
    // En Fuerteventura, solo como premio de las zonas opcionales (Tindaya y Cofete); en las tiendas,
    // desde Gran Canaria.
    superpocion: { id: 'superpocion', nombre: 'Superpoción', descripcion: 'Cura 50 puntos de vida.', tipo: 'curar', cantidad: 50, precio: 700, desdeIsla: 3 },
    // Solo en el modo desarrollador (autor, 2026-11-19): el dulce de almendra canario.
    almendrado: { id: 'almendrado', nombre: 'Almendrado', descripcion: 'Dulce de almendra: sube un nivel. Solo en el modo desarrollador.', tipo: 'nivel' },
    'cubo-blanco': { id: 'cubo-blanco', nombre: 'Cubo blanco', descripcion: 'El cubo de captura más sencillo.', tipo: 'captura', bonus: 1, precio: 200 },
  },
};

/**
 * Las especies quitadas del juego y la que ocupa su sitio, para las partidas guardadas con alguna
 * (las de relleno, quitadas el 2026-11-19).
 */
export const ESPECIES_RETIRADAS: Readonly<Record<string, string>> = {
  'cangrejo-de-charco': 'c037-1',
  'lagartija-de-picon': 'c012-1',
  'tabaiba-andante': 'c007-1',
  'chispa-de-colada': 'c013-1',
  'remolino-de-jable': 'c032-1',
  'guirre-de-viento': 'c032-2',
};

/** El modelo de cada especie: el de las iniciales es solo suyo (ninguna otra lo toma prestado). */
export const MODELO_DE: Readonly<Record<string, string>> = {
  'inicial-agua': 'iniciales/inicial-agua-1.glb',
  'inicial-planta': 'iniciales/inicial-planta-1.glb',
  'inicial-infernal': 'iniciales/inicial-infernal-1.glb',
  'inicial-roca': 'iniciales/inicial-roca-1.glb',
  'inicial-tierra': 'iniciales/inicial-tierra-1.glb',
  // Sus formas 2.ª y 3.ª.
  ...Object.fromEntries(
    ['agua', 'planta', 'infernal', 'roca', 'tierra'].flatMap((t) => [2, 3].map((n) => [`inicial-${t}-${n}`, `iniciales/inicial-${t}-${n}.glb`])),
  ),
  // Las del autor, con su modelo (criaturas.ts, generado).
  ...MODELO_CRIATURA,
};

/** Con lo que empieza la mochila al elegir la inicial: poco (autor, 2026-11-11). */
export const MOCHILA_INICIAL: Readonly<Record<string, number>> = { pocion: 2, 'cubo-blanco': 5 };

/** La especie de combate de cada inicial, por su id. */
export const ESPECIE_INICIAL: Readonly<Record<string, string>> = {
  agua: 'inicial-agua',
  planta: 'inicial-planta',
  infernal: 'inicial-infernal',
  roca: 'inicial-roca',
  tierra: 'inicial-tierra',
};

/**
 * La inicial del primer entrenador: la que pierde contra la tuya en el ciclo del autor (el agua
 * desgasta la roca, la roca sepulta el fuego, el fuego quema lo verde y lo verde bebe el agua).
 * Al nivel 5 las dos solo tienen ataques comunes; el «¡Es muy eficaz!» llega con el de tipo, al 7.
 */
export const RIVAL_DE: Readonly<Record<string, string>> = { agua: 'roca', roca: 'infernal', infernal: 'planta', planta: 'agua', tierra: 'infernal' };

/** Quién lanza el combate de prueba: el primer entrenador de El Golfo, el de la barrera. */
export const ENTRENADOR_PRUEBA = 'entrenador-barrera';
