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
};
