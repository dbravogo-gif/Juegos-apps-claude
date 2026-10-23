import type { EstadisticaCombate, Temperamento } from '../core/modelo';

// Equivalen a las naturalezas de Pokémon, con nombres propios: +10 % en una estadística y
// −10 % en otra. Los cinco de la diagonal son neutros.
const TABLA: [EstadisticaCombate, EstadisticaCombate, string][] = [
  ['fuerza', 'fuerza', 'Sosegado'],
  ['fuerza', 'escudo', 'Bruto'],
  ['fuerza', 'magia', 'Pendenciero'],
  ['fuerza', 'resMagica', 'Arrojado'],
  ['fuerza', 'celeridad', 'Terco'],
  ['escudo', 'fuerza', 'Prudente'],
  ['escudo', 'escudo', 'Corriente'],
  ['escudo', 'magia', 'Tozudo'],
  ['escudo', 'resMagica', 'Recio'],
  ['escudo', 'celeridad', 'Sufrido'],
  ['magia', 'fuerza', 'Soñador'],
  ['magia', 'escudo', 'Ladino'],
  ['magia', 'magia', 'Llano'],
  ['magia', 'resMagica', 'Místico'],
  ['magia', 'celeridad', 'Sabio'],
  ['resMagica', 'fuerza', 'Devoto'],
  ['resMagica', 'escudo', 'Juicioso'],
  ['resMagica', 'magia', 'Estoico'],
  ['resMagica', 'resMagica', 'Discreto'],
  ['resMagica', 'celeridad', 'Grave'],
  ['celeridad', 'fuerza', 'Avispado'],
  ['celeridad', 'escudo', 'Inquieto'],
  ['celeridad', 'magia', 'Vivo'],
  ['celeridad', 'resMagica', 'Nervioso'],
  ['celeridad', 'celeridad', 'Mesurado'],
];

export const TEMPERAMENTOS: Temperamento[] = TABLA.map(([sube, baja, nombre]) => ({
  id: nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''),
  nombre,
  sube,
  baja,
}));
