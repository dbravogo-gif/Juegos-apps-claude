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
  { id: 'c031-1', nombre: 'Shimari', tipos: ['comun'], base: base(38, 30, 41, 30, 41, 60), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 9, movimiento: 'barrito' }], evoluciona: [{ a: 'c031-2', nivel: 20 }], altura: 0.4, descripcion: '' },
  // Pok17: Linoone (Q3, AF).
  { id: 'c031-2', nombre: 'Shimarō', tipos: ['comun'], base: base(78, 70, 61, 50, 61, 100), expBase: 140, ratioCaptura: 90, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 1, movimiento: 'barrito' }], altura: 0.8, descripcion: '' },
  // Pok18: Taillow (Q1, AF).
  { id: 'c032-1', nombre: 'Ravich', tipos: ['aire'], base: base(40, 55, 30, 30, 30, 85), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 6, movimiento: 'picado' }], evoluciona: [{ a: 'c032-2', nivel: 22 }], altura: 0.3, descripcion: '' },
  // Pok19: Swellow (Q3, AF).
  { id: 'c032-2', nombre: 'Azurvan', tipos: ['aire'], base: base(60, 85, 60, 75, 50, 125), expBase: 140, ratioCaptura: 90, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'picado' }, { nivel: 1, movimiento: 'rafaga' }, { nivel: 1, movimiento: 'mirada-fija' }], altura: 1.2, descripcion: '' },
  // Pok20: Barboach (Q1, EN).
  { id: 'c037-1', nombre: 'Aculiso', tipos: ['agua'], base: base(50, 48, 43, 46, 41, 60), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 5, movimiento: 'remojon' }, { nivel: 9, movimiento: 'arenazo' }], evoluciona: [{ a: 'c037-2', nivel: 30 }], altura: 0.3, descripcion: '' },
  // Pok21: Whiscash (Q3, EN).
  { id: 'c037-2', nombre: 'Sierpajable', tipos: ['agua', 'tierra'], base: base(110, 78, 73, 76, 71, 60), expBase: 140, ratioCaptura: 90, aprende: [{ nivel: 1, movimiento: 'remojon' }, { nivel: 1, movimiento: 'ola-de-cresta' }, { nivel: 1, movimiento: 'arenazo' }, { nivel: 1, movimiento: 'pisoton' }], altura: 1.0, descripcion: '' },
  // Pok22: Lotad (Q1, TE).
  { id: 'c007-1', nombre: 'Dragosil', tipos: ['planta'], base: base(40, 30, 30, 40, 50, 30), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'caparazon' }, { nivel: 6, movimiento: 'latigazo-de-musgo' }, { nivel: 11, movimiento: 'esporas-de-hoja' }], evoluciona: [{ a: 'c007-2', nivel: 14 }], altura: 0.5, descripcion: '' },
  // Pok23: Lombre (Q2, TE).
  { id: 'c007-2', nombre: 'Dragombo', tipos: ['planta'], base: base(60, 50, 50, 60, 70, 50), expBase: 75, ratioCaptura: 150, aprende: [{ nivel: 1, movimiento: 'caparazon' }, { nivel: 1, movimiento: 'esporas-de-hoja' }, { nivel: 1, movimiento: 'latigazo-de-musgo' }, { nivel: 1, movimiento: 'topetazo' }], evoluciona: [{ a: 'c007-3', nivel: 32 }], altura: 1.4, descripcion: '' },
  // Pok24: Ludicolo (Q4, TE).
  { id: 'c007-3', nombre: 'Dragalis', tipos: ['planta'], base: base(80, 70, 70, 90, 100, 70), expBase: 170, ratioCaptura: 60, aprende: [{ nivel: 1, movimiento: 'caparazon' }, { nivel: 1, movimiento: 'esporas-de-hoja' }, { nivel: 1, movimiento: 'latigazo-de-musgo' }, { nivel: 1, movimiento: 'mirada-fija' }], altura: 3.0, descripcion: '' },
  // Pok25: Sandile (Q1, AF).
  { id: 'c013-1', nombre: 'Quillflare', tipos: ['infernal'], base: base(50, 72, 35, 35, 35, 65), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 5, movimiento: 'soplo-de-brasas' }, { nivel: 10, movimiento: 'orejazo-ardiente' }], evoluciona: [{ a: 'c013-2', nivel: 18 }], altura: 0.3, descripcion: '' },
  // Pok26: Krokorok (Q2, AF).
  { id: 'c013-2', nombre: 'Quillfire', tipos: ['infernal'], base: base(60, 82, 45, 45, 45, 74), expBase: 75, ratioCaptura: 150, aprende: [{ nivel: 1, movimiento: 'soplo-de-brasas' }, { nivel: 1, movimiento: 'orejazo-ardiente' }, { nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }], evoluciona: [{ a: 'c013-3', nivel: 36 }], altura: 0.7, descripcion: '' },
  // Pok27: Krookodile (Q4, AF).
  { id: 'c013-3', nombre: 'Quimfernum', tipos: ['infernal', 'tierra'], base: base(95, 117, 80, 65, 70, 92), expBase: 170, ratioCaptura: 60, aprende: [{ nivel: 1, movimiento: 'orejazo-ardiente' }, { nivel: 1, movimiento: 'soplo-de-brasas' }, { nivel: 1, movimiento: 'pisoton' }, { nivel: 1, movimiento: 'barrito' }], altura: 1.4, descripcion: '' },
  // Pok28: Riolu (Q1, AF).
  { id: 'c043-1', nombre: 'Kotono', tipos: ['lucha'], base: base(40, 70, 40, 35, 40, 60), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 5, movimiento: 'agarron' }], evoluciona: [{ a: 'c043-2', nivel: 20 }], altura: 0.3, descripcion: '' },
  // Pok29: Lucario (Q4, AE).
  { id: 'c043-2', nombre: 'Koloi', tipos: ['lucha'], base: base(70, 110, 70, 115, 70, 90), expBase: 170, ratioCaptura: 60, aprende: [{ nivel: 1, movimiento: 'agarron' }, { nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 1, movimiento: 'barrito' }], altura: 1.1, descripcion: '' },
  // Pok30: Roggenrola (Q1, TF).
  { id: 'c012-1', nombre: 'Oreps', tipos: ['roca'], base: base(55, 75, 85, 25, 25, 15), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'caparazon' }, { nivel: 5, movimiento: 'rodada-de-piedra' }], evoluciona: [{ a: 'c012-2', nivel: 16 }], altura: 0.4, descripcion: '' },
  // Pok31: Boldore (Q2, TF).
  { id: 'c012-2', nombre: 'Mineps', tipos: ['roca'], base: base(70, 105, 105, 50, 40, 20), expBase: 75, ratioCaptura: 150, aprende: [{ nivel: 1, movimiento: 'rodada-de-piedra' }, { nivel: 1, movimiento: 'caparazon' }, { nivel: 1, movimiento: 'polvo-de-picon' }, { nivel: 1, movimiento: 'topetazo' }], evoluciona: [{ a: 'c012-3', nivel: 34 }], altura: 1.0, descripcion: '' },
  // Pok32: Gigalith (Q4, TF).
  { id: 'c012-3', nombre: 'Colossoreps', tipos: ['roca'], base: base(85, 135, 130, 60, 80, 25), expBase: 170, ratioCaptura: 60, aprende: [{ nivel: 1, movimiento: 'rodada-de-piedra' }, { nivel: 1, movimiento: 'caparazon' }, { nivel: 1, movimiento: 'polvo-de-picon' }, { nivel: 1, movimiento: 'pisoton' }], altura: 2.0, descripcion: '' },
  // Pok33: Makuhita (Q1, AF).
  { id: 'c034-1', nombre: 'Kine', tipos: ['tierra'], base: base(72, 60, 30, 20, 30, 25), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 5, movimiento: 'arenazo' }, { nivel: 9, movimiento: 'pisoton' }], evoluciona: [{ a: 'c034-2', nivel: 24 }], altura: 0.5, descripcion: '' },
  // Pok34: Hariyama (Q3, AF).
  { id: 'c034-2', nombre: 'Kurokin', tipos: ['tierra'], base: base(144, 120, 60, 40, 60, 50), expBase: 140, ratioCaptura: 90, aprende: [{ nivel: 1, movimiento: 'pisoton' }, { nivel: 1, movimiento: 'arenazo' }, { nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'barrito' }], altura: 1.2, descripcion: '' },
  // Pok131: Cranidos (Q2, AF).
  { id: 'c062-1', nombre: 'Ishiro', tipos: ['roca'], base: base(67, 125, 40, 30, 30, 58), expBase: 75, ratioCaptura: 150, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 7, movimiento: 'rodada-de-piedra' }], evoluciona: [{ a: 'c062-2', nivel: 30 }], altura: 0.9, descripcion: '' },
  // Pok132: Rampardos (Q4, AF).
  { id: 'c062-2', nombre: 'Ishiradon', tipos: ['roca'], base: base(97, 165, 60, 65, 50, 58), expBase: 170, ratioCaptura: 60, aprende: [{ nivel: 1, movimiento: 'rodada-de-piedra' }, { nivel: 1, movimiento: 'pisoton' }, { nivel: 1, movimiento: 'barrito' }, { nivel: 1, movimiento: 'topetazo' }], altura: 1.6, descripcion: '' },
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
  'c013-1': 'criaturas/013-1.glb',
  'c013-2': 'criaturas/013-2.glb',
  'c013-3': 'criaturas/013-3.glb',
  'c043-1': 'criaturas/043-1.glb',
  'c043-2': 'criaturas/043-2.glb',
  'c012-1': 'criaturas/012-1.glb',
  'c012-2': 'criaturas/012-2.glb',
  'c012-3': 'criaturas/012-3.glb',
  'c034-1': 'criaturas/034-1.glb',
  'c034-2': 'criaturas/034-2.glb',
  'c062-1': 'criaturas/062-1.glb',
  'c062-2': 'criaturas/062-2.glb',
};
