// Interiores según el exterior (autor, 2026-11-10): del tamaño de la casa, con escalera tapada por
// juguetes en las de dos plantas y uno distinto para cada edificio.

import { describe, expect, it } from 'vitest';
import { generarInterior, tamanoInterior } from '../src/data/generar-interior';
import { INTERIORES_ISLA1 } from '../src/data/interiores-isla1';
import { PUERTAS_ISLA1 } from '../src/data/isla1';

describe('interiores generados', () => {
  it('una casa más grande por fuera es más grande por dentro', () => {
    const peq = tamanoInterior(3, 3);
    const med = tamanoInterior(4, 3);
    const gra = tamanoInterior(8, 6);
    expect(med.w).toBeGreaterThan(peq.w);
    expect(gra.w).toBeGreaterThan(med.w);
    expect(gra.d).toBeGreaterThan(med.d);
  });

  it('las de dos plantas tienen escalera con juguetes delante; las de una, no', () => {
    for (const semilla of [0, 1, 2, 3]) {
      const dos = generarInterior({ tipo: 'casa', ancho: 4, fondo: 3, plantas: 2, semilla }).mapa;
      const una = generarInterior({ tipo: 'casa', ancho: 4, fondo: 3, plantas: 1, semilla }).mapa;
      const e = dos.findIndex((f) => f.includes('e'));
      expect(e).toBeGreaterThan(0);
      expect(dos[e + 1][dos[e].indexOf('e')]).toBe('j');
      expect(una.join('')).not.toMatch(/[ej]/);
    }
  });

  it('cada puerta lleva a una sala propia, que existe', () => {
    const ids = INTERIORES_ISLA1.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    const destinos = Object.values(PUERTAS_ISLA1).flatMap((p) => Object.values(p));
    for (const d of destinos) expect(ids, d).toContain(d);
    // Las cuatro casas de la capital, con su escalera; las de La Geria, sin ella.
    for (const d of INTERIORES_ISLA1) {
      const escalera = d.mapa.join('').includes('e');
      if (d.id.startsWith('casa-capital')) expect(escalera, d.id).toBe(true);
      if (d.id.startsWith('casa-geria')) expect(escalera, d.id).toBe(false);
    }
  });
});
