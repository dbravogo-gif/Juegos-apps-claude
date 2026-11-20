// Qué criaturas salen en cada zona de la isla 1 y de qué nivel. Los niveles suben con el recorrido:
// la inicial empieza en el 5.
// En El Golfo, la primera hierba, casi no sale la de Planta y sale floja: con la inicial de Agua
// era muy difícil empezar (probador, 2026-11-12).

import type { TablaEncuentros } from '../core/encuentros';

// Con las criaturas del autor que ya tienen modelo (2026-11-19), en sus hierbas de PLAN-CRIATURAS.md;
// las que aún no tienen modelo (Melaní, Aerund y Salmito) no salen, y su parte se reparte entre las
// demás. Ninguna hierba saca una inicial.
export const ENCUENTROS_ISLA1: TablaEncuentros = {
  // El Golfo: Civeta 40, Ravich 30, Aculiso 20 y Dragosil 10, la rara (y floja, por la inicial de Agua).
  combates: [
    { especie: 'c031-1', nivel: [3, 4], peso: 40 },
    { especie: 'c032-1', nivel: [3, 4], peso: 30 },
    { especie: 'c037-1', nivel: [3, 4], peso: 20 },
    { especie: 'c007-1', nivel: [3, 3], peso: 10 },
  ],
  // Montañas del Fuego: Quillflare 40, Kotono 30, Civeta 20 y Oreps 10, la rara.
  fuego: [
    { especie: 'c013-1', nivel: [5, 7], peso: 40 },
    { especie: 'c043-1', nivel: [5, 7], peso: 30 },
    { especie: 'c031-1', nivel: [5, 6], peso: 20 },
    { especie: 'c012-1', nivel: [5, 6], peso: 10 },
  ],
  // El Jable: Kine 50, Ravich 40 y Kotono 10, el raro.
  jable: [
    { especie: 'c034-1', nivel: [6, 8], peso: 50 },
    { especie: 'c032-1', nivel: [6, 8], peso: 40 },
    { especie: 'c043-1', nivel: [6, 7], peso: 10 },
  ],
  // Famara: Aculiso 90 y Oreps 10, la rara.
  famara: [
    { especie: 'c037-1', nivel: [6, 8], peso: 90 },
    { especie: 'c012-1', nivel: [7, 8], peso: 10 },
  ],
};
