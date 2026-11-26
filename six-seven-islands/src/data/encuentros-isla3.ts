// Qué criaturas salen en cada zona de la isla 3, Gran Canaria (PROVISIONAL): las del autor que ya
// tienen modelo, a los niveles de la isla (18 a 25), hasta que lleguen las suyas (PLAN-CRIATURAS.md:
// en La Isleta, Tembladera, Chispa de cable y Farito, todas eléctricas). Mientras, las que más
// pegan con un barrio de pescadores entre volcanes: gaviotas, peces, bichos y, rara, una brasa.
// Ninguna sale evolucionada antes de tiempo.

import type { TablaEncuentros } from '../core/encuentros';

export const ENCUENTROS_ISLA3: TablaEncuentros = {
  isleta: [
    { especie: 'c035-1', nivel: [18, 20], peso: 30 },
    { especie: 'c018-1', nivel: [18, 20], peso: 25 },
    { especie: 'c005-1', nivel: [18, 20], peso: 20 },
    { especie: 'c043-1', nivel: [18, 19], peso: 15 },
    { especie: 'c013-2', nivel: [19, 20], peso: 10 },
  ],
  // Fase 2 (PLAN-CRIATURAS.md: Veneno, Oscuridad, Tierra y Lucha; mientras, las que hay).
  guayadeque: [
    { especie: 'c012-2', nivel: [20, 22], peso: 30 },
    { especie: 'c034-1', nivel: [20, 22], peso: 30 },
    { especie: 'c005-1', nivel: [20, 21], peso: 25 },
    { especie: 'c062-1', nivel: [21, 22], peso: 15 },
  ],
  cumbres: [
    { especie: 'c031-2', nivel: [21, 23], peso: 30 },
    { especie: 'c007-2', nivel: [21, 23], peso: 25 },
    { especie: 'c043-2', nivel: [21, 23], peso: 25 },
    { especie: 'c032-2', nivel: [22, 23], peso: 20 },
  ],
  nublo: [
    { especie: 'c032-2', nivel: [22, 24], peso: 35 },
    { especie: 'c044-2', nivel: [24, 24], peso: 20 },
    { especie: 'c012-2', nivel: [22, 24], peso: 25 },
    { especie: 'c062-1', nivel: [22, 24], peso: 20 },
  ],
  // Fase 3: Tejeda, el pinar de Tamadaba (las salvajes más fuertes del camino) y Agaete.
  tejeda: [
    { especie: 'c043-2', nivel: [22, 25], peso: 30 },
    { especie: 'c031-2', nivel: [22, 25], peso: 25 },
    { especie: 'c034-2', nivel: [24, 25], peso: 25 },
    { especie: 'c012-2', nivel: [22, 25], peso: 20 },
  ],
  tamadaba: [
    { especie: 'c007-2', nivel: [24, 27], peso: 30 },
    { especie: 'c044-2', nivel: [24, 27], peso: 20 },
    { especie: 'c032-2', nivel: [24, 27], peso: 20 },
    { especie: 'c035-2', nivel: [25, 27], peso: 15 },
    { especie: 'c005-2', nivel: [24, 27], peso: 15 },
  ],
  // Fase 4, las opcionales: el fondo de la caldera de Bandama y las dunas de Maspalomas.
  bandama: [
    { especie: 'c007-2', nivel: [23, 26], peso: 30 },
    { especie: 'c031-2', nivel: [23, 26], peso: 25 },
    { especie: 'c038-2', nivel: [24, 26], peso: 25 },
    { especie: 'c062-1', nivel: [24, 26], peso: 20 },
  ],
  maspalomas: [
    { especie: 'c044-2', nivel: [25, 27], peso: 30 },
    { especie: 'c009-2', nivel: [25, 27], peso: 25 },
    { especie: 'c005-2', nivel: [25, 27], peso: 25 },
    { especie: 'c013-2', nivel: [25, 27], peso: 20 },
  ],
  agaete: [
    { especie: 'c018-1', nivel: [25, 27], peso: 35 },
    { especie: 'c035-2', nivel: [25, 27], peso: 35 },
    { especie: 'c037-1', nivel: [25, 27], peso: 30 },
  ],
};
