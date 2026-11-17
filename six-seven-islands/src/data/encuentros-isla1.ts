// Qué criaturas salen en cada zona de la isla 1 y de qué nivel (PROVISIONAL, 2026-11-12): las
// salvajes de relleno de `combate-prueba.ts`, hasta que el autor decida dónde aparece cada criatura
// (PENDIENTES.md). Los niveles suben con el recorrido: la inicial empieza en el 5.
// En El Golfo, la primera hierba, casi no sale la de Planta y sale floja: con la inicial de Agua
// era muy difícil empezar (probador, 2026-11-12).

import type { TablaEncuentros } from '../core/encuentros';

// Con las criaturas del autor que ya tienen modelo (2026-11-17), en sus hierbas de PLAN-CRIATURAS.md;
// las que faltan siguen con las de relleno: la chispa hace del erizo de fuego, la lagartija de la
// musaraña, de Patatín y del Basalto, la tabaiba de Melaní y el cangrejo de Aerund y Salmito.
export const ENCUENTROS_ISLA1: TablaEncuentros = {
  // El Golfo: Civeta 40, Ravich 30, Aculiso 20 y Dragosil 10, la rara (y floja, por la inicial de Agua).
  combates: [
    { especie: 'c031-1', nivel: [3, 4], peso: 40 },
    { especie: 'c032-1', nivel: [3, 4], peso: 30 },
    { especie: 'c037-1', nivel: [3, 4], peso: 20 },
    { especie: 'c007-1', nivel: [3, 3], peso: 10 },
  ],
  fuego: [
    { especie: 'chispa-de-colada', nivel: [5, 7], peso: 40 },
    { especie: 'lagartija-de-picon', nivel: [5, 7], peso: 40 },
    { especie: 'c031-1', nivel: [5, 6], peso: 20 },
  ],
  jable: [
    { especie: 'lagartija-de-picon', nivel: [6, 7], peso: 35 },
    { especie: 'tabaiba-andante', nivel: [6, 8], peso: 30 },
    { especie: 'c032-1', nivel: [6, 8], peso: 25 },
    { especie: 'chispa-de-colada', nivel: [6, 8], peso: 10 },
  ],
  famara: [
    { especie: 'cangrejo-de-charco', nivel: [6, 8], peso: 45 },
    { especie: 'c037-1', nivel: [6, 8], peso: 30 },
    { especie: 'tabaiba-andante', nivel: [6, 7], peso: 15 },
    { especie: 'lagartija-de-picon', nivel: [7, 8], peso: 10 },
  ],
};
