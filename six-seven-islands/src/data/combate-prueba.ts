// Datos PROVISIONALES del combate (2026-11-10, ampliados el 2026-11-12 para jugarlo): las 4
// iniciales, 4 criaturas salvajes de relleno, sus ataques y los primeros objetos. Las
// estadísticas de las iniciales las pasará el autor y las criaturas de verdad llegarán con sus
// modelos; los nombres de las criaturas y de los ataques son de relleno, propios y sin copiar los
// de otros juegos (R8).

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
  { id: 'remojon', nombre: 'Remojón', tipo: 'agua', categoria: 'magico', poder: 40, precision: 100, pp: 25 },
  { id: 'ola-de-cresta', nombre: 'Ola de cresta', tipo: 'agua', categoria: 'fisico', poder: 55, precision: 95, pp: 15 },
  { id: 'latigazo-de-musgo', nombre: 'Latigazo de musgo', tipo: 'planta', categoria: 'fisico', poder: 45, precision: 100, pp: 25 },
  { id: 'esporas-de-hoja', nombre: 'Esporas de hoja', tipo: 'planta', categoria: 'magico', poder: 50, precision: 95, pp: 15 },
  { id: 'soplo-de-brasas', nombre: 'Soplo de brasas', tipo: 'infernal', categoria: 'magico', poder: 40, precision: 100, pp: 25, efectos: [{ tipo: 'estado', estado: 'quemado', prob: 10 }] },
  { id: 'orejazo-ardiente', nombre: 'Orejazo ardiente', tipo: 'infernal', categoria: 'fisico', poder: 55, precision: 95, pp: 15 },
  { id: 'barrito', nombre: 'Barrito', tipo: 'comun', categoria: 'estado', poder: 0, precision: 100, pp: 30, objetivo: 'rivales', efectos: [{ tipo: 'etapa', a: 'objetivo', estadistica: 'fuerza', cambio: -1, prob: 100 }] },
  { id: 'rodada-de-piedra', nombre: 'Rodada de piedra', tipo: 'roca', categoria: 'fisico', poder: 50, precision: 95, pp: 20 },
  { id: 'polvo-de-picon', nombre: 'Polvo de picón', tipo: 'roca', categoria: 'magico', poder: 40, precision: 100, pp: 25 },
  // La quinta inicial, de Tierra (autor, 2026-11-13).
  // De Acero, flojo: para que la inicial de fuego no se quede sin nada contra el gimnasio de Roca,
  // donde todos sus otros ataques están resistidos (autor, 2026-11-15).
  { id: 'trompazo-de-hierro', nombre: 'Trompazo de hierro', tipo: 'acero', categoria: 'fisico', poder: 35, precision: 100, pp: 30 },
  // De Aire, para las de relleno del gimnasio de Aire (probador, 2026-11-13).
  // De Lucha, para las criaturas de Lucha del autor (2026-11-19). Agarrón: la presa de la lucha canaria.
  { id: 'agarron', nombre: 'Agarrón', tipo: 'lucha', categoria: 'fisico', poder: 50, precision: 100, pp: 20 },
  { id: 'rafaga', nombre: 'Ráfaga', tipo: 'aire', categoria: 'magico', poder: 40, precision: 100, pp: 25 },
  { id: 'picado', nombre: 'Picado', tipo: 'aire', categoria: 'fisico', poder: 55, precision: 95, pp: 15 },
  { id: 'pisoton', nombre: 'Pisotón', tipo: 'tierra', categoria: 'fisico', poder: 50, precision: 95, pp: 20 },
  { id: 'arenazo', nombre: 'Arenazo', tipo: 'tierra', categoria: 'magico', poder: 40, precision: 100, pp: 25 },
  { id: 'caparazon', nombre: 'Caparazón', tipo: 'comun', categoria: 'estado', poder: 0, precision: null, pp: 20, objetivo: 'propio', efectos: [{ tipo: 'etapa', a: 'propio', estadistica: 'escudo', cambio: 1, prob: 100 }] },
];

const aprende = (...ids: string[]) => ids.map((movimiento) => ({ nivel: 1, movimiento }));

const especies: Especie[] = [
  // Salvajes de relleno, fáciles de capturar. Hasta que lleguen las del autor, usan el modelo de la
  // inicial de su tipo (MODELO_DE, abajo).
  { id: 'cangrejo-de-charco', nombre: 'Cangrejo de charco', tipos: ['agua'], base: base(40, 45, 55, 35, 40, 45), expBase: 50, ratioCaptura: 200, aprende: aprende('topetazo', 'remojon'), descripcion: '' },
  { id: 'lagartija-de-picon', nombre: 'Lagartija de picón', tipos: ['roca'], base: base(40, 50, 50, 30, 35, 55), expBase: 50, ratioCaptura: 200, aprende: aprende('topetazo', 'polvo-de-picon'), descripcion: '' },
  { id: 'tabaiba-andante', nombre: 'Tabaiba andante', tipos: ['planta'], base: base(45, 40, 45, 45, 45, 35), expBase: 50, ratioCaptura: 200, aprende: aprende('topetazo', 'latigazo-de-musgo'), descripcion: '' },
  // De Aire (provisionales, para el gimnasio de Aire y Sotavento; probador, 2026-11-13): sin ellas,
  // el gimnasio no tenía ni una criatura de su tipo.
  { id: 'remolino-de-jable', nombre: 'Remolino de jable', tipos: ['aire'], base: base(40, 40, 35, 55, 40, 65), expBase: 55, ratioCaptura: 190, aprende: aprende('mirada-fija', 'rafaga'), descripcion: '' },
  { id: 'guirre-de-viento', nombre: 'Guirre de viento', tipos: ['aire'], base: base(55, 60, 45, 50, 45, 65), expBase: 70, ratioCaptura: 90, aprende: aprende('rafaga', 'picado', 'mirada-fija'), descripcion: '' },
  { id: 'chispa-de-colada', nombre: 'Chispa de colada', tipos: ['infernal'], base: base(35, 40, 35, 55, 40, 60), expBase: 55, ratioCaptura: 190, aprende: aprende('mirada-fija', 'soplo-de-brasas'), descripcion: '' },
  // Las iniciales: estadísticas con el carácter que pidió el autor (FORMAS_INICIALES, abajo).
  { id: 'inicial-agua', nombre: 'Cronti', tipos: ['agua'], base: base(50, 65, 64, 44, 48, 43), expBase: 60, ratioCaptura: 45, aprende: aprende('remojon', 'ola-de-cresta', 'topetazo', 'mirada-fija'), altura: 0.4, descripcion: '' },
  { id: 'inicial-planta', nombre: 'Lisza', tipos: ['planta'], base: base(36, 39, 36, 77, 50, 76), expBase: 60, ratioCaptura: 45, aprende: aprende('latigazo-de-musgo', 'esporas-de-hoja', 'topetazo', 'mirada-fija'), altura: 0.4, descripcion: '' },
  { id: 'inicial-infernal', nombre: 'Nokoribi', tipos: ['infernal'], base: base(59, 33, 59, 65, 62, 36), expBase: 60, ratioCaptura: 45, aprende: aprende('soplo-de-brasas', 'orejazo-ardiente', 'trompazo-de-hierro', 'barrito'), altura: 0.4, descripcion: '' },
  { id: 'inicial-tierra', nombre: 'Tsubomi', tipos: ['tierra'], base: base(48, 36, 48, 63, 57, 62), expBase: 60, ratioCaptura: 45, aprende: aprende('pisoton', 'arenazo', 'topetazo', 'mirada-fija'), altura: 0.4, descripcion: '' },
  { id: 'inicial-roca', nombre: 'Armalito', tipos: ['roca'], base: base(59, 71, 68, 33, 54, 29), expBase: 60, ratioCaptura: 45, aprende: aprende('rodada-de-piedra', 'polvo-de-picon', 'topetazo', 'caparazon'), altura: 0.4, descripcion: '' },
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
    // En Fuerteventura, solo como premio de las zonas opcionales (Tindaya y Cofete), no en tiendas.
    superpocion: { id: 'superpocion', nombre: 'Superpoción', descripcion: 'Cura 50 puntos de vida.', tipo: 'curar', cantidad: 50, precio: 700 },
    // Solo en el modo desarrollador (autor, 2026-11-19): el dulce de almendra canario.
    almendrado: { id: 'almendrado', nombre: 'Almendrado', descripcion: 'Dulce de almendra: sube un nivel. Solo en el modo desarrollador.', tipo: 'nivel' },
    'cubo-blanco': { id: 'cubo-blanco', nombre: 'Cubo blanco', descripcion: 'El cubo de captura más sencillo.', tipo: 'captura', bonus: 1, precio: 200 },
  },
};

/** El modelo de cada especie. Las salvajes de relleno llevan el de la inicial de su tipo; las del autor, el suyo. */
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
  'cangrejo-de-charco': 'iniciales/inicial-agua-1.glb',
  'lagartija-de-picon': 'iniciales/inicial-roca-1.glb',
  'tabaiba-andante': 'iniciales/inicial-planta-1.glb',
  'chispa-de-colada': 'iniciales/inicial-infernal-1.glb',
  'remolino-de-jable': 'iniciales/inicial-planta-1.glb',
  'guirre-de-viento': 'iniciales/inicial-agua-1.glb',
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
 * desgasta la roca, la roca sepulta el fuego, el fuego quema lo verde y lo verde bebe el agua),
 * para que el primer combate enseñe un «¡Es muy eficaz!».
 */
export const RIVAL_DE: Readonly<Record<string, string>> = { agua: 'roca', roca: 'infernal', infernal: 'planta', planta: 'agua', tierra: 'infernal' };

/** Quién lanza el combate de prueba: el primer entrenador de El Golfo, el de la barrera. */
export const ENTRENADOR_PRUEBA = 'entrenador-barrera';
