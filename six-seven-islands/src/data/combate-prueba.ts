// Datos PROVISIONALES para ver el combate (autor, 2026-11-10: «solo quiero ver cómo será
// visualmente»). Las estadísticas de las iniciales las pasará el autor y los ataques definitivos
// llegarán con su sistema; los nombres de las criaturas y de los ataques son de relleno, propios
// y sin copiar los de otros juegos (R8).

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
  objetos: {},
};

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
