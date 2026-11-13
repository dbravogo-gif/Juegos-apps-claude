// Qué criaturas salen en cada zona de la isla 2, Fuerteventura (PROVISIONAL, 2026-11-13): las
// salvajes de relleno, hasta las del autor. En Las Dunas, como en los desiertos, sale algo en toda
// la arena: cuatro especies, una rara, a niveles del 10 al 13; en la fase 2, hasta el 15 (ISLA-2.md).

import type { TablaEncuentros } from '../core/encuentros';

export const ENCUENTROS_ISLA2: TablaEncuentros = {
  dunas: [
    { especie: 'lagartija-de-picon', nivel: [10, 12], peso: 40 },
    { especie: 'chispa-de-colada', nivel: [10, 12], peso: 30 },
    { especie: 'tabaiba-andante', nivel: [11, 12], peso: 20 },
    { especie: 'cangrejo-de-charco', nivel: [12, 13], peso: 10 },
  ],
  // Fase 2: las laderas de Betancuria y lo alto de los acantilados de Ajuy.
  betancuria: [
    { especie: 'tabaiba-andante', nivel: [12, 14], peso: 35 },
    { especie: 'lagartija-de-picon', nivel: [12, 14], peso: 30 },
    { especie: 'cangrejo-de-charco', nivel: [12, 13], peso: 20 },
    { especie: 'chispa-de-colada', nivel: [13, 14], peso: 15 },
  ],
  // Fase 3: la hierba seca de Sotavento.
  sotavento: [
    { especie: 'lagartija-de-picon', nivel: [15, 17], peso: 30 },
    { especie: 'remolino-de-jable', nivel: [15, 17], peso: 25 },
    { especie: 'chispa-de-colada', nivel: [15, 17], peso: 20 },
    { especie: 'cangrejo-de-charco', nivel: [15, 16], peso: 15 },
    { especie: 'tabaiba-andante', nivel: [16, 17], peso: 10 },
  ],
  ajuy: [
    { especie: 'cangrejo-de-charco', nivel: [13, 15], peso: 40 },
    { especie: 'tabaiba-andante', nivel: [13, 14], peso: 30 },
    { especie: 'lagartija-de-picon', nivel: [13, 15], peso: 20 },
    { especie: 'chispa-de-colada', nivel: [14, 15], peso: 10 },
  ],
  // Fase 4, las opcionales: la hierba seca de Tindaya y la hierba alta de Cofete, más fuertes.
  tindaya: [
    { especie: 'tabaiba-andante', nivel: [14, 16], peso: 35 },
    { especie: 'lagartija-de-picon', nivel: [14, 16], peso: 30 },
    { especie: 'chispa-de-colada', nivel: [15, 16], peso: 25 },
    { especie: 'cangrejo-de-charco', nivel: [15, 16], peso: 10 },
  ],
  cofete: [
    { especie: 'cangrejo-de-charco', nivel: [17, 19], peso: 35 },
    { especie: 'lagartija-de-picon', nivel: [17, 19], peso: 30 },
    { especie: 'tabaiba-andante', nivel: [18, 19], peso: 20 },
    { especie: 'chispa-de-colada', nivel: [18, 19], peso: 15 },
  ],
};
