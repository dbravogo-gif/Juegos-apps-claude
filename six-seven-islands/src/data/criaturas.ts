// GENERADO por herramientas/criaturas/juego.py desde PLAN-CRIATURAS.md: no se edita a mano.
// Las criaturas del autor que ya tienen modelo. Estadísticas exactas de su referencia
// (herramientas/criaturas/estadisticas.py), altura en metros (ARTE.md, «Escala de las criaturas»).

import type { Especie, Estadisticas } from '../core/modelo';

const base = (vida: number, fuerza: number, escudo: number, magia: number, resMagica: number, celeridad: number): Estadisticas => ({
  vida,
  fuerza,
  escudo,
  magia,
  resMagica,
  celeridad,
});

export const ESPECIES_CRIATURAS: readonly Especie[] = [
  // Pok16: Zigzagoon (Q1, AF).
  { id: 'c031-1', nombre: 'Civeta', tipos: ['comun'], base: base(38, 30, 41, 30, 41, 60), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 9, movimiento: 'barrito' }], evoluciona: [{ a: 'c031-2', nivel: 20 }], altura: 0.4, descripcion: '' },
  // Pok17: Linoone (Q3, AF).
  { id: 'c031-2', nombre: 'Civeta adulta', tipos: ['comun'], base: base(78, 70, 61, 50, 61, 100), expBase: 140, ratioCaptura: 90, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 1, movimiento: 'barrito' }], altura: 0.8, descripcion: '' },
  // Pok18: Taillow (Q1, AF).
  { id: 'c032-1', nombre: 'Ravich', tipos: ['aire'], base: base(40, 55, 30, 30, 30, 85), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 6, movimiento: 'picado' }], evoluciona: [{ a: 'c032-2', nivel: 22 }], altura: 0.3, descripcion: '' },
  // Pok19: Swellow (Q3, AF).
  { id: 'c032-2', nombre: 'Azurvan', tipos: ['aire'], base: base(60, 85, 60, 75, 50, 125), expBase: 140, ratioCaptura: 90, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'picado' }, { nivel: 1, movimiento: 'rafaga' }, { nivel: 1, movimiento: 'mirada-fija' }], altura: 1.2, descripcion: '' },
  // Pok20: Barboach (Q1, EN).
  { id: 'c037-1', nombre: 'Aculiso', tipos: ['agua'], base: base(50, 48, 43, 46, 41, 60), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'remojon' }, { nivel: 7, movimiento: 'arenazo' }], evoluciona: [{ a: 'c037-2', nivel: 30 }], altura: 0.3, descripcion: '' },
  // Pok21: Whiscash (Q3, EN).
  { id: 'c037-2', nombre: 'Sierpajable', tipos: ['agua', 'tierra'], base: base(110, 78, 73, 76, 71, 60), expBase: 140, ratioCaptura: 90, aprende: [{ nivel: 1, movimiento: 'remojon' }, { nivel: 1, movimiento: 'ola-de-cresta' }, { nivel: 1, movimiento: 'arenazo' }, { nivel: 1, movimiento: 'pisoton' }], altura: 1.0, descripcion: '' },
  // Pok22: Lotad (Q1, TE).
  { id: 'c007-1', nombre: 'Dragosil', tipos: ['planta'], base: base(40, 30, 30, 40, 50, 30), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'caparazon' }, { nivel: 1, movimiento: 'esporas-de-hoja' }], evoluciona: [{ a: 'c007-2', nivel: 14 }], altura: 0.5, descripcion: '' },
  // Pok23: Lombre (Q2, TE).
  { id: 'c007-2', nombre: 'Dragombo', tipos: ['planta'], base: base(60, 50, 50, 60, 70, 50), expBase: 75, ratioCaptura: 150, aprende: [{ nivel: 1, movimiento: 'caparazon' }, { nivel: 1, movimiento: 'esporas-de-hoja' }, { nivel: 1, movimiento: 'latigazo-de-musgo' }], evoluciona: [{ a: 'c007-3', nivel: 32 }], altura: 1.4, descripcion: '' },
  // Pok24: Ludicolo (Q4, TE).
  { id: 'c007-3', nombre: 'Dragalis', tipos: ['planta'], base: base(80, 70, 70, 90, 100, 70), expBase: 170, ratioCaptura: 60, aprende: [{ nivel: 1, movimiento: 'caparazon' }, { nivel: 1, movimiento: 'esporas-de-hoja' }, { nivel: 1, movimiento: 'latigazo-de-musgo' }, { nivel: 1, movimiento: 'mirada-fija' }], altura: 3.0, descripcion: '' },
  // Pok131: Cranidos (Q2, AF).
  { id: 'c062-1', nombre: 'Dino de casco', tipos: ['roca'], base: base(67, 125, 40, 30, 30, 58), expBase: 75, ratioCaptura: 150, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 1, movimiento: 'rodada-de-piedra' }], evoluciona: [{ a: 'c062-2', nivel: 30 }], altura: 0.9, descripcion: '' },
  // Pok132: Rampardos (Q4, AF).
  { id: 'c062-2', nombre: 'Dino de casco adulto', tipos: ['roca'], base: base(97, 165, 60, 65, 50, 58), expBase: 170, ratioCaptura: 60, aprende: [{ nivel: 1, movimiento: 'rodada-de-piedra' }, { nivel: 1, movimiento: 'pisoton' }, { nivel: 1, movimiento: 'barrito' }, { nivel: 1, movimiento: 'topetazo' }], altura: 1.6, descripcion: '' },
];

/** El modelo de cada una, en public/modelos/. */
export const MODELO_CRIATURA: Readonly<Record<string, string>> = {
  'c031-1': 'criaturas/031-1.glb',
  'c031-2': 'criaturas/031-2.glb',
  'c032-1': 'criaturas/032-1.glb',
  'c032-2': 'criaturas/032-2.glb',
  'c037-1': 'criaturas/037-1.glb',
  'c037-2': 'criaturas/037-2.glb',
  'c007-1': 'criaturas/007-1.glb',
  'c007-2': 'criaturas/007-2.glb',
  'c007-3': 'criaturas/007-3.glb',
  'c062-1': 'criaturas/062-1.glb',
  'c062-2': 'criaturas/062-2.glb',
};
