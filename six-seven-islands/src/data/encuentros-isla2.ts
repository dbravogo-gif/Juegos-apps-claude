// Qué criaturas salen en cada zona de la isla 2, Fuerteventura (PROVISIONAL): las del autor que ya
// tienen modelo, a los niveles de cada zona, hasta que lleguen las de esta isla (PLAN-CRIATURAS.md).
// Hace de cada una la que más se le parece de las previstas. Aerund, el
// remolino de jable, ya es la suya (2026-11-20), y desde el 2026-11-26 también la lisa de duna (c009), el
// conejo de jable (c038), Chestil (c029), Marach (c054), el presa canario (c011) y, el 2026-11-27, Gare
// (c004), Seacumber (c051), Fisilla (c052), Escolper (c079) y Petrowstal (c082), que pasó Claude con
// Meshy desde las imágenes del autor. En Las Dunas, como en los
// desiertos, sale algo en toda la arena: cuatro especies, una rara (ISLA-2.md). Ninguna hierba saca
// una inicial, y ninguna sale evolucionada antes de tiempo.

import type { TablaEncuentros } from '../core/encuentros';

export const ENCUENTROS_ISLA2: TablaEncuentros = {
  dunas: [
    { especie: 'c044-1', nivel: [10, 12], peso: 40 },
    { especie: 'c009-1', nivel: [10, 12], peso: 30 },
    { especie: 'c038-1', nivel: [11, 12], peso: 20 },
    { especie: 'c029-1', nivel: [12, 13], peso: 10 },
  ],
  // Fase 2: las laderas de Betancuria y lo alto de los acantilados de Ajuy.
  betancuria: [
    { especie: 'c038-1', nivel: [12, 14], peso: 30 },
    { especie: 'c054-1', nivel: [12, 14], peso: 25 },
    { especie: 'c011-1', nivel: [12, 14], peso: 25 },
    { especie: 'c004-1', nivel: [12, 13], peso: 12 },
    { especie: 'c029-1', nivel: [13, 14], peso: 8 },
  ],
  // Fase 3: la hierba seca de Sotavento.
  sotavento: [
    { especie: 'c044-1', nivel: [15, 17], peso: 30 },
    { especie: 'c051-1', nivel: [15, 17], peso: 25 },
    { especie: 'c052-1', nivel: [15, 17], peso: 20 },
    { especie: 'c009-1', nivel: [15, 16], peso: 15 },
    { especie: 'c007-2', nivel: [16, 17], peso: 10 },
  ],
  ajuy: [
    { especie: 'c051-1', nivel: [13, 15], peso: 35 },
    { especie: 'c035-1', nivel: [13, 15], peso: 25 },
    { especie: 'c011-1', nivel: [13, 14], peso: 10 },
    { especie: 'c012-1', nivel: [13, 15], peso: 20 },
    { especie: 'c029-1', nivel: [14, 15], peso: 10 },
  ],
  // Fase 4, las opcionales: la hierba seca de Tindaya y la hierba alta de Cofete, más fuertes.
  tindaya: [
    { especie: 'c054-1', nivel: [14, 16], peso: 35 },
    { especie: 'c011-1', nivel: [14, 16], peso: 30 },
    { especie: 'c004-1', nivel: [15, 16], peso: 25 },
    { especie: 'c082', nivel: [15, 16], peso: 10 },
  ],
  cofete: [
    { especie: 'c051-1', nivel: [17, 19], peso: 35 },
    { especie: 'c009-1', nivel: [17, 19], peso: 30 },
    { especie: 'c007-2', nivel: [18, 19], peso: 20 },
    { especie: 'c079', nivel: [18, 19], peso: 15 },
  ],
};
