// Qué criaturas salen en cada zona de la isla 2, Fuerteventura (PROVISIONAL): las del autor que ya
// tienen modelo, a los niveles de cada zona, hasta que lleguen las de esta isla (PLAN-CRIATURAS.md).
// Hace de cada una la que más se le parece de las previstas: Ravich, del «Remolino de jable»; Kine,
// del «Conejo de jable»; Aculiso, de la «Lisa de duna» y del «Erizo negro». En Las Dunas, como en los
// desiertos, sale algo en toda la arena: cuatro especies, una rara (ISLA-2.md). Ninguna hierba saca
// una inicial, y ninguna sale evolucionada antes de tiempo.

import type { TablaEncuentros } from '../core/encuentros';

export const ENCUENTROS_ISLA2: TablaEncuentros = {
  dunas: [
    { especie: 'c032-1', nivel: [10, 12], peso: 40 },
    { especie: 'c034-1', nivel: [10, 12], peso: 30 },
    { especie: 'c013-1', nivel: [11, 12], peso: 20 },
    { especie: 'c043-1', nivel: [12, 13], peso: 10 },
  ],
  // Fase 2: las laderas de Betancuria y lo alto de los acantilados de Ajuy.
  betancuria: [
    { especie: 'c031-1', nivel: [12, 14], peso: 35 },
    { especie: 'c034-1', nivel: [12, 14], peso: 30 },
    { especie: 'c032-1', nivel: [12, 13], peso: 20 },
    { especie: 'c012-1', nivel: [13, 14], peso: 15 },
  ],
  // Fase 3: la hierba seca de Sotavento.
  sotavento: [
    { especie: 'c032-1', nivel: [15, 17], peso: 30 },
    { especie: 'c037-1', nivel: [15, 17], peso: 25 },
    { especie: 'c013-1', nivel: [15, 17], peso: 20 },
    { especie: 'c034-1', nivel: [15, 16], peso: 15 },
    { especie: 'c007-2', nivel: [16, 17], peso: 10 },
  ],
  ajuy: [
    { especie: 'c037-1', nivel: [13, 15], peso: 40 },
    { especie: 'c031-1', nivel: [13, 14], peso: 30 },
    { especie: 'c012-1', nivel: [13, 15], peso: 20 },
    { especie: 'c043-1', nivel: [14, 15], peso: 10 },
  ],
  // Fase 4, las opcionales: la hierba seca de Tindaya y la hierba alta de Cofete, más fuertes.
  tindaya: [
    { especie: 'c031-1', nivel: [14, 16], peso: 35 },
    { especie: 'c034-1', nivel: [14, 16], peso: 30 },
    { especie: 'c032-1', nivel: [15, 16], peso: 25 },
    { especie: 'c062-1', nivel: [15, 16], peso: 10 },
  ],
  cofete: [
    { especie: 'c037-1', nivel: [17, 19], peso: 35 },
    { especie: 'c034-1', nivel: [17, 19], peso: 30 },
    { especie: 'c007-2', nivel: [18, 19], peso: 20 },
    { especie: 'c013-2', nivel: [18, 19], peso: 15 },
  ],
};
