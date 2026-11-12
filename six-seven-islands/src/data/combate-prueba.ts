// Datos PROVISIONALES del combate (2026-11-10, ampliados el 2026-11-12 para jugarlo): las 4
// iniciales, 4 criaturas salvajes de relleno, sus ataques y los primeros objetos. Las
// estadísticas de las iniciales las pasará el autor y las criaturas de verdad llegarán con sus
// modelos; los nombres de las criaturas y de los ataques son de relleno, propios y sin copiar los
// de otros juegos (R8).

import type { DatosJuego, Especie, Estadisticas, Movimiento } from '../core/modelo';
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
  { id: 'caparazon', nombre: 'Caparazón', tipo: 'comun', categoria: 'estado', poder: 0, precision: null, pp: 20, objetivo: 'propio', efectos: [{ tipo: 'etapa', a: 'propio', estadistica: 'escudo', cambio: 1, prob: 100 }] },
];

const aprende = (...ids: string[]) => ids.map((movimiento) => ({ nivel: 1, movimiento }));

const especies: Especie[] = [
  // Salvajes de relleno, fáciles de capturar. Hasta que lleguen las del autor, usan el modelo de la
  // inicial de su tipo (MODELO_DE, abajo).
  { id: 'cangrejo-de-charco', nombre: 'Cangrejo de charco', tipos: ['agua'], base: base(40, 45, 55, 35, 40, 45), expBase: 50, ratioCaptura: 200, aprende: aprende('topetazo', 'remojon'), descripcion: '' },
  { id: 'lagartija-de-picon', nombre: 'Lagartija de picón', tipos: ['roca'], base: base(40, 50, 50, 30, 35, 55), expBase: 50, ratioCaptura: 200, aprende: aprende('topetazo', 'polvo-de-picon'), descripcion: '' },
  { id: 'tabaiba-andante', nombre: 'Tabaiba andante', tipos: ['planta'], base: base(45, 40, 45, 45, 45, 35), expBase: 50, ratioCaptura: 200, aprende: aprende('topetazo', 'latigazo-de-musgo'), descripcion: '' },
  { id: 'chispa-de-colada', nombre: 'Chispa de colada', tipos: ['infernal'], base: base(35, 40, 35, 55, 40, 60), expBase: 55, ratioCaptura: 190, aprende: aprende('mirada-fija', 'soplo-de-brasas'), descripcion: '' },
  { id: 'inicial-agua', nombre: 'Inicial de Agua', tipos: ['agua'], base: base(50, 50, 55, 55, 55, 45), expBase: 60, ratioCaptura: 45, aprende: aprende('remojon', 'ola-de-cresta', 'topetazo', 'mirada-fija'), descripcion: '' },
  { id: 'inicial-planta', nombre: 'Inicial de Planta', tipos: ['planta'], base: base(50, 50, 50, 55, 55, 50), expBase: 60, ratioCaptura: 45, aprende: aprende('latigazo-de-musgo', 'esporas-de-hoja', 'topetazo', 'mirada-fija'), descripcion: '' },
  { id: 'inicial-infernal', nombre: 'Inicial Infernal', tipos: ['infernal'], base: base(50, 55, 50, 55, 45, 55), expBase: 60, ratioCaptura: 45, aprende: aprende('soplo-de-brasas', 'orejazo-ardiente', 'topetazo', 'barrito'), descripcion: '' },
  { id: 'inicial-roca', nombre: 'Inicial de Roca', tipos: ['roca'], base: base(55, 55, 60, 40, 50, 40), expBase: 60, ratioCaptura: 45, aprende: aprende('rodada-de-piedra', 'polvo-de-picon', 'topetazo', 'caparazon'), descripcion: '' },
];

export const DATOS_COMBATE_PRUEBA: DatosJuego = {
  especies: Object.fromEntries(especies.map((e) => [e.id, e])),
  movimientos: Object.fromEntries(movimientos.map((m) => [m.id, m])),
  temperamentos: TEMPERAMENTOS,
  tipos: TABLA_TIPOS,
  // Pocos y flojos al principio (autor, 2026-11-11).
  objetos: {
    pocion: { id: 'pocion', nombre: 'Poción', descripcion: 'Cura 20 puntos de vida.', tipo: 'curar', cantidad: 20, precio: 300 },
    'cubo-blanco': { id: 'cubo-blanco', nombre: 'Cubo blanco', descripcion: 'El cubo de captura más sencillo.', tipo: 'captura', bonus: 1, precio: 200 },
  },
};

/** El modelo de cada especie. Las salvajes de relleno llevan el de la inicial de su tipo. */
export const MODELO_DE: Readonly<Record<string, string>> = {
  'inicial-agua': 'iniciales/inicial-agua-1.glb',
  'inicial-planta': 'iniciales/inicial-planta-1.glb',
  'inicial-infernal': 'iniciales/inicial-infernal-1.glb',
  'inicial-roca': 'iniciales/inicial-roca-1.glb',
  'cangrejo-de-charco': 'iniciales/inicial-agua-1.glb',
  'lagartija-de-picon': 'iniciales/inicial-roca-1.glb',
  'tabaiba-andante': 'iniciales/inicial-planta-1.glb',
  'chispa-de-colada': 'iniciales/inicial-infernal-1.glb',
};

/** Con lo que empieza la mochila al elegir la inicial: poco (autor, 2026-11-11). */
export const MOCHILA_INICIAL: Readonly<Record<string, number>> = { pocion: 2, 'cubo-blanco': 5 };

/** La especie de combate de cada inicial, por su id. */
export const ESPECIE_INICIAL: Readonly<Record<string, string>> = {
  agua: 'inicial-agua',
  planta: 'inicial-planta',
  infernal: 'inicial-infernal',
  roca: 'inicial-roca',
};

/**
 * La inicial del primer entrenador: la que pierde contra la tuya en el ciclo del autor (el agua
 * desgasta la roca, la roca sepulta el fuego, el fuego quema lo verde y lo verde bebe el agua),
 * para que el primer combate enseñe un «¡Es muy eficaz!».
 */
export const RIVAL_DE: Readonly<Record<string, string>> = { agua: 'roca', roca: 'infernal', infernal: 'planta', planta: 'agua' };

/** Quién lanza el combate de prueba: el primer entrenador de El Golfo, el de la barrera. */
export const ENTRENADOR_PRUEBA = 'entrenador-barrera';
