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
  { id: 'c013-3', nombre: 'Quimfernum', tipos: ['infernal'], base: base(95, 117, 80, 65, 70, 92), expBase: 170, ratioCaptura: 60, aprende: [{ nivel: 1, movimiento: 'orejazo-ardiente' }, { nivel: 1, movimiento: 'soplo-de-brasas' }, { nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'barrito' }], altura: 1.4, descripcion: '' },
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
  // Pok35: Venipede (Q1, TF).
  { id: 'c005-1', nombre: 'Cicadot', tipos: ['bicho'], base: base(30, 45, 59, 30, 39, 57), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 6, movimiento: 'chirrido-de-elitros' }, { nivel: 12, movimiento: 'savia-toxica' }], evoluciona: [{ a: 'c005-2', nivel: 22 }], altura: 0.3, descripcion: '' },
  // Pok36: Whirlipede (Q2, TF).
  { id: 'c005-2', nombre: 'Chitick', tipos: ['bicho', 'veneno'], base: base(40, 55, 99, 40, 79, 47), expBase: 75, ratioCaptura: 150, aprende: [{ nivel: 1, movimiento: 'chirrido-de-elitros' }, { nivel: 1, movimiento: 'savia-toxica' }, { nivel: 1, movimiento: 'tenaza-de-quitina' }, { nivel: 1, movimiento: 'caparazon' }], evoluciona: [{ a: 'c005-3', nivel: 30 }], altura: 0.6, descripcion: '' },
  // Pok37: Scolipede (Q3, AF).
  { id: 'c005-3', nombre: 'Cicadread', tipos: ['bicho', 'veneno'], base: base(60, 100, 89, 55, 69, 112), expBase: 140, ratioCaptura: 90, aprende: [{ nivel: 1, movimiento: 'tenaza-de-quitina' }, { nivel: 1, movimiento: 'savia-toxica' }, { nivel: 1, movimiento: 'chirrido-de-elitros' }, { nivel: 1, movimiento: 'caparazon' }], altura: 1.5, descripcion: '' },
  // Pok38: Wingull (Q1, AE).
  { id: 'c035-1', nombre: 'Gullit', tipos: ['aire'], base: base(40, 30, 30, 55, 30, 85), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 6, movimiento: 'rafaga' }, { nivel: 12, movimiento: 'remojon' }], evoluciona: [{ a: 'c035-2', nivel: 25 }], altura: 0.4, descripcion: '' },
  // Pok39: Pelipper (Q3, TF).
  { id: 'c035-2', nombre: 'Seaglide', tipos: ['aire', 'agua'], base: base(60, 50, 100, 95, 70, 65), expBase: 140, ratioCaptura: 90, aprende: [{ nivel: 1, movimiento: 'rafaga' }, { nivel: 1, movimiento: 'picado' }, { nivel: 1, movimiento: 'remojon' }, { nivel: 1, movimiento: 'ola-de-cresta' }], altura: 1.8, descripcion: '' },
  // Pok40: Spheal (Q1, EN).
  { id: 'c018-1', nombre: 'Salmite', tipos: ['agua'], base: base(70, 40, 50, 55, 50, 25), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'caparazon' }, { nivel: 6, movimiento: 'remojon' }, { nivel: 14, movimiento: 'escarcha' }], evoluciona: [{ a: 'c018-2', nivel: 32 }], altura: 0.5, descripcion: '' },
  // Pok41: Sealeo (Q3, EN).
  { id: 'c018-2', nombre: 'Salmastar', tipos: ['agua'], base: base(90, 60, 70, 75, 70, 45), expBase: 140, ratioCaptura: 90, aprende: [{ nivel: 1, movimiento: 'remojon' }, { nivel: 1, movimiento: 'escarcha' }, { nivel: 1, movimiento: 'ola-de-cresta' }, { nivel: 1, movimiento: 'caparazon' }], evoluciona: [{ a: 'c018-3', nivel: 44 }], altura: 1.1, descripcion: '' },
  // Pok42: Walrein (Q4, TE).
  { id: 'c018-3', nombre: 'Koralsalm', tipos: ['agua', 'hielo'], base: base(110, 80, 90, 95, 90, 65), expBase: 170, ratioCaptura: 60, aprende: [{ nivel: 1, movimiento: 'ola-de-cresta' }, { nivel: 1, movimiento: 'escarcha' }, { nivel: 1, movimiento: 'remojon' }, { nivel: 1, movimiento: 'caparazon' }], altura: 1.8, descripcion: '' },
  // Pok48: Cottonee (Q1, TF).
  { id: 'c044-1', nombre: 'Aerund', tipos: ['aire'], base: base(40, 27, 60, 37, 50, 66), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 5, movimiento: 'rafaga' }, { nivel: 10, movimiento: 'arenazo' }], evoluciona: [{ a: 'c044-2', nivel: 24 }], altura: 0.4, descripcion: '' },
  // Pok49: Whimsicott (Q4, TF).
  { id: 'c044-2', nombre: 'Tailsan', tipos: ['aire', 'tierra'], base: base(60, 67, 85, 77, 75, 116), expBase: 170, ratioCaptura: 60, aprende: [{ nivel: 1, movimiento: 'rafaga' }, { nivel: 1, movimiento: 'arenazo' }, { nivel: 1, movimiento: 'picado' }, { nivel: 1, movimiento: 'pisoton' }], altura: 1.2, descripcion: '' },
  // Pok50: Trapinch (Q1, AF).
  { id: 'c009-1', nombre: 'Lisa de duna', tipos: ['tierra'], base: base(45, 100, 45, 45, 45, 10), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 7, movimiento: 'arenazo' }, { nivel: 12, movimiento: 'pisoton' }], evoluciona: [{ a: 'c009-2', nivel: 20 }], altura: 0.5, descripcion: '' },
  // Pok51: Vibrava (Q2, EN).
  { id: 'c009-2', nombre: 'Lisa de duna', tipos: ['tierra'], base: base(50, 70, 50, 50, 50, 70), expBase: 75, ratioCaptura: 150, aprende: [{ nivel: 1, movimiento: 'arenazo' }, { nivel: 1, movimiento: 'pisoton' }, { nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }], evoluciona: [{ a: 'c009-3', nivel: 32 }], altura: 1.1, descripcion: '' },
  // Pok52: Flygon (Q4, EN).
  { id: 'c009-3', nombre: 'Lisa de duna', tipos: ['aire'], base: base(80, 100, 80, 80, 80, 100), expBase: 170, ratioCaptura: 60, aprende: [{ nivel: 1, movimiento: 'rafaga' }, { nivel: 1, movimiento: 'picado' }, { nivel: 1, movimiento: 'arenazo' }, { nivel: 1, movimiento: 'pisoton' }], altura: 2.0, descripcion: '' },
  // Pok53: Bidoof (Q1, EN).
  { id: 'c038-1', nombre: 'Conejo de jable', tipos: ['comun'], base: base(59, 45, 40, 35, 40, 31), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 6, movimiento: 'barrito' }], evoluciona: [{ a: 'c038-2', nivel: 15 }], altura: 0.4, descripcion: '' },
  // Pok54: Bibarel (Q3, AF).
  { id: 'c038-2', nombre: 'Conejo de jable', tipos: ['comun', 'oscuridad'], base: base(79, 85, 60, 55, 60, 71), expBase: 140, ratioCaptura: 90, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'barrito' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 1, movimiento: 'caparazon' }], altura: 0.9, descripcion: '' },
  // Pok55: Kricketot (Q1, TF).
  { id: 'c029-1', nombre: 'Chestil', tipos: ['bicho'], base: base(37, 25, 41, 25, 41, 25), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 7, movimiento: 'chirrido-de-elitros' }], evoluciona: [{ a: 'c029-2', nivel: 14 }], altura: 0.3, descripcion: '' },
  // Pok56: Kricketune (Q2, AF).
  { id: 'c029-2', nombre: 'Winstal', tipos: ['bicho'], base: base(77, 85, 51, 55, 51, 65), expBase: 75, ratioCaptura: 150, aprende: [{ nivel: 1, movimiento: 'chirrido-de-elitros' }, { nivel: 1, movimiento: 'tenaza-de-quitina' }, { nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }], altura: 0.8, descripcion: '' },
  // Pok57: Deerling (Q2, AF).
  { id: 'c054-1', nombre: 'Marach', tipos: ['comun'], base: base(60, 60, 50, 40, 50, 75), expBase: 75, ratioCaptura: 150, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 8, movimiento: 'pisoton' }], evoluciona: [{ a: 'c054-2', nivel: 22 }], altura: 1.0, descripcion: '' },
  // Pok58: Sawsbuck (Q3, AF).
  { id: 'c054-2', nombre: 'Camwee', tipos: ['comun'], base: base(80, 100, 70, 60, 70, 95), expBase: 140, ratioCaptura: 90, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'pisoton' }, { nivel: 1, movimiento: 'barrito' }, { nivel: 1, movimiento: 'mirada-fija' }], altura: 2.2, descripcion: '' },
  // Pok59: Lillipup (Q1, AF).
  { id: 'c011-1', nombre: 'Perstin', tipos: ['comun'], base: base(45, 60, 45, 25, 45, 55), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 6, movimiento: 'barrito' }], evoluciona: [{ a: 'c011-2', nivel: 16 }], altura: 0.4, descripcion: '' },
  // Pok60: Herdier (Q2, AF).
  { id: 'c011-2', nombre: 'Presin', tipos: ['comun'], base: base(65, 80, 65, 35, 65, 60), expBase: 75, ratioCaptura: 150, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'barrito' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 1, movimiento: 'pisoton' }], evoluciona: [{ a: 'c011-3', nivel: 30 }], altura: 0.8, descripcion: '' },
  // Pok61: Stoutland (Q4, AF).
  { id: 'c011-3', nombre: 'Presarox', tipos: ['comun'], base: base(85, 110, 90, 45, 90, 80), expBase: 170, ratioCaptura: 60, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'barrito' }, { nivel: 1, movimiento: 'pisoton' }, { nivel: 1, movimiento: 'mirada-fija' }], altura: 1.3, descripcion: '' },
  // Pok62: Starly (Q1, AF).
  { id: 'c004-1', nombre: 'Gare', tipos: ['aire'], base: base(40, 55, 30, 30, 30, 60), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 6, movimiento: 'rafaga' }], evoluciona: [{ a: 'c004-2', nivel: 14 }], altura: 0.3, descripcion: '' },
  // Pok63: Staravia (Q2, AF).
  { id: 'c004-2', nombre: 'Guirral', tipos: ['aire'], base: base(55, 75, 50, 40, 40, 80), expBase: 75, ratioCaptura: 150, aprende: [{ nivel: 1, movimiento: 'rafaga' }, { nivel: 1, movimiento: 'picado' }, { nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }], evoluciona: [{ a: 'c004-3', nivel: 30 }], altura: 0.8, descripcion: '' },
  // Pok64: Staraptor (Q3, AF).
  { id: 'c004-3', nombre: 'Guirrenton', tipos: ['aire'], base: base(85, 120, 70, 50, 60, 100), expBase: 140, ratioCaptura: 90, aprende: [{ nivel: 1, movimiento: 'picado' }, { nivel: 1, movimiento: 'rafaga' }, { nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'barrito' }], altura: 1.5, descripcion: '' },
  // Pok65: Corphish (Q2, AF).
  { id: 'c051-1', nombre: 'Seacumber', tipos: ['agua'], base: base(43, 80, 65, 50, 35, 35), expBase: 75, ratioCaptura: 150, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'caparazon' }, { nivel: 6, movimiento: 'remojon' }], evoluciona: [{ a: 'c051-2', nivel: 24 }], altura: 0.3, descripcion: '' },
  // Pok66: Crawdaunt (Q3, AF).
  { id: 'c051-2', nombre: 'Seabrune', tipos: ['agua', 'oscuridad'], base: base(63, 120, 85, 90, 55, 55), expBase: 140, ratioCaptura: 90, aprende: [{ nivel: 1, movimiento: 'remojon' }, { nivel: 1, movimiento: 'ola-de-cresta' }, { nivel: 1, movimiento: 'caparazon' }, { nivel: 1, movimiento: 'topetazo' }], altura: 0.8, descripcion: '' },
  // Pok67: Zubat (Q1, EN).
  { id: 'c017-1', nombre: 'Pioto', tipos: ['veneno'], base: base(40, 45, 35, 30, 40, 55), expBase: 55, ratioCaptura: 200, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 6, movimiento: 'savia-toxica' }], evoluciona: [{ a: 'c017-2', nivel: 20 }], altura: 0.3, descripcion: '' },
  // Pok68: Golbat (Q3, EN).
  { id: 'c017-2', nombre: 'Pitohui', tipos: ['veneno', 'aire'], base: base(75, 80, 70, 65, 75, 90), expBase: 140, ratioCaptura: 90, aprende: [{ nivel: 1, movimiento: 'savia-toxica' }, { nivel: 1, movimiento: 'rafaga' }, { nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }], evoluciona: [{ a: 'c017-3', nivel: 32 }], altura: 0.8, descripcion: '' },
  // Pok69: Crobat (Q4, EN).
  { id: 'c017-3', nombre: 'Pitox', tipos: ['veneno', 'aire'], base: base(85, 90, 80, 70, 80, 130), expBase: 170, ratioCaptura: 60, aprende: [{ nivel: 1, movimiento: 'savia-toxica' }, { nivel: 1, movimiento: 'picado' }, { nivel: 1, movimiento: 'rafaga' }, { nivel: 1, movimiento: 'mirada-fija' }], altura: 1.5, descripcion: '' },
  // Pok70: Anorith (Q2, AF).
  { id: 'c061-1', nombre: 'Geods', tipos: ['roca'], base: base(45, 95, 50, 40, 50, 75), expBase: 75, ratioCaptura: 150, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'caparazon' }, { nivel: 6, movimiento: 'rodada-de-piedra' }], evoluciona: [{ a: 'c061-2', nivel: 26 }], altura: 0.5, descripcion: '' },
  // Pok71: Armaldo (Q4, AF).
  { id: 'c061-2', nombre: 'Beetlex', tipos: ['roca', 'bicho'], base: base(75, 125, 100, 70, 80, 45), expBase: 170, ratioCaptura: 60, aprende: [{ nivel: 1, movimiento: 'rodada-de-piedra' }, { nivel: 1, movimiento: 'tenaza-de-quitina' }, { nivel: 1, movimiento: 'polvo-de-picon' }, { nivel: 1, movimiento: 'caparazon' }], altura: 1.4, descripcion: '' },
  // Pok72: Seviper (Q3, AE).
  { id: 'c079', nombre: 'Escolper', tipos: ['veneno', 'bicho'], base: base(73, 100, 60, 100, 60, 65), expBase: 140, ratioCaptura: 90, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 5, movimiento: 'savia-toxica' }, { nivel: 8, movimiento: 'tenaza-de-quitina' }], altura: 1.8, descripcion: '' },
  // Pok73: Shellos (Q2, EN).
  { id: 'c052-1', nombre: 'Fisilla', tipos: ['veneno'], base: base(76, 48, 48, 57, 62, 34), expBase: 75, ratioCaptura: 150, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'mirada-fija' }, { nivel: 6, movimiento: 'savia-toxica' }], evoluciona: [{ a: 'c052-2', nivel: 24 }], altura: 0.4, descripcion: '' },
  // Pok74: Gastrodon (Q3, TE).
  { id: 'c052-2', nombre: 'Polisilla', tipos: ['veneno', 'agua'], base: base(111, 83, 68, 92, 82, 39), expBase: 140, ratioCaptura: 90, aprende: [{ nivel: 1, movimiento: 'savia-toxica' }, { nivel: 1, movimiento: 'remojon' }, { nivel: 1, movimiento: 'ola-de-cresta' }, { nivel: 1, movimiento: 'mirada-fija' }], altura: 1.2, descripcion: '' },
  // Pok75: Lunatone (Q3, AE).
  { id: 'c082', nombre: 'Petrowstal', tipos: ['roca', 'mental'], base: base(90, 55, 65, 95, 85, 70), expBase: 140, ratioCaptura: 90, aprende: [{ nivel: 1, movimiento: 'topetazo' }, { nivel: 1, movimiento: 'caparazon' }, { nivel: 5, movimiento: 'rodada-de-piedra' }, { nivel: 8, movimiento: 'polvo-de-picon' }], altura: 1.0, descripcion: '' },
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
  'c005-1': 'criaturas/005-1.glb',
  'c005-2': 'criaturas/005-2.glb',
  'c005-3': 'criaturas/005-3.glb',
  'c035-1': 'criaturas/035-1.glb',
  'c035-2': 'criaturas/035-2.glb',
  'c018-1': 'criaturas/018-1.glb',
  'c018-2': 'criaturas/018-2.glb',
  'c018-3': 'criaturas/018-3.glb',
  'c044-1': 'criaturas/044-1.glb',
  'c044-2': 'criaturas/044-2.glb',
  'c009-1': 'criaturas/009-1.glb',
  'c009-2': 'criaturas/009-2.glb',
  'c009-3': 'criaturas/009-3.glb',
  'c038-1': 'criaturas/038-1.glb',
  'c038-2': 'criaturas/038-2.glb',
  'c029-1': 'criaturas/029-1.glb',
  'c029-2': 'criaturas/029-2.glb',
  'c054-1': 'criaturas/054-1.glb',
  'c054-2': 'criaturas/054-2.glb',
  'c011-1': 'criaturas/011-1.glb',
  'c011-2': 'criaturas/011-2.glb',
  'c011-3': 'criaturas/011-3.glb',
  'c004-1': 'criaturas/004-1.glb',
  'c004-2': 'criaturas/004-2.glb',
  'c004-3': 'criaturas/004-3.glb',
  'c051-1': 'criaturas/051-1.glb',
  'c051-2': 'criaturas/051-2.glb',
  'c017-1': 'criaturas/017-1.glb',
  'c017-2': 'criaturas/017-2.glb',
  'c017-3': 'criaturas/017-3.glb',
  'c061-1': 'criaturas/061-1.glb',
  'c061-2': 'criaturas/061-2.glb',
  'c079': 'criaturas/079.glb',
  'c052-1': 'criaturas/052-1.glb',
  'c052-2': 'criaturas/052-2.glb',
  'c082': 'criaturas/082.glb',
  'c062-1': 'criaturas/062-1.glb',
  'c062-2': 'criaturas/062-2.glb',
};
