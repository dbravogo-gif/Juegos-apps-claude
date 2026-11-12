// Qué criaturas salen en cada zona de la isla 1 y de qué nivel (PROVISIONAL, 2026-11-12): las
// salvajes de relleno de `combate-prueba.ts`, hasta que el autor decida dónde aparece cada criatura
// (PENDIENTES.md). Los niveles suben con el recorrido: la inicial empieza en el 5.
// En El Golfo, la primera hierba, casi no sale la de Planta y sale floja: con la inicial de Agua
// era muy difícil empezar (probador, 2026-11-12).

import type { TablaEncuentros } from '../core/encuentros';

export const ENCUENTROS_ISLA1: TablaEncuentros = {
  combates: [
    { especie: 'cangrejo-de-charco', nivel: [3, 4], peso: 45 },
    { especie: 'lagartija-de-picon', nivel: [3, 4], peso: 45 },
    { especie: 'tabaiba-andante', nivel: [3, 3], peso: 10 },
  ],
  fuego: [
    { especie: 'chispa-de-colada', nivel: [5, 7], peso: 50 },
    { especie: 'lagartija-de-picon', nivel: [5, 7], peso: 50 },
  ],
  jable: [
    { especie: 'tabaiba-andante', nivel: [6, 8], peso: 50 },
    { especie: 'lagartija-de-picon', nivel: [6, 7], peso: 30 },
    { especie: 'chispa-de-colada', nivel: [6, 8], peso: 20 },
  ],
  famara: [
    { especie: 'cangrejo-de-charco', nivel: [6, 8], peso: 60 },
    { especie: 'tabaiba-andante', nivel: [6, 7], peso: 40 },
  ],
};
