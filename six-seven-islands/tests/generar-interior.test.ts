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

  it('las de dos plantas tienen escalera; las de una, no', () => {
    for (const semilla of [0, 1, 2, 3]) {
      const dos = generarInterior({ tipo: 'casa', ancho: 4, fondo: 3, plantas: 2, semilla }).mapa;
      const una = generarInterior({ tipo: 'casa', ancho: 4, fondo: 3, plantas: 1, semilla });
      expect(dos.join('')).toContain('e');
      expect(una.mapa.join('')).not.toMatch(/[ej]/);
      expect(una.arriba).toBeNull();
    }
  });

  it('juguetes en algunas escaleras, no en todas (autor, 2026-11-19); sin ellos, se sube a un dormitorio', () => {
    const casas = [0, 1, 2, 3, 4, 5].map((semilla) => generarInterior({ tipo: 'casa', ancho: 5, fondo: 4, plantas: 2, semilla }));
    const tapadas = casas.filter((c) => !c.arriba);
    expect(tapadas.length).toBeGreaterThan(0);
    expect(tapadas.length).toBeLessThan(casas.length);
    for (const c of casas) {
      const fila = c.mapa.findIndex((f) => f.includes('e'));
      const x = c.mapa[fila].indexOf('e');
      const delante = c.mapa[fila + 1][x];
      if (!c.arriba) {
        expect(delante).toBe('j');
        continue;
      }
      // Libre delante; arriba, el hueco en la misma columna, y se aparece justo al norte de él.
      expect(delante).toBe('m');
      const { mapa, llegada } = c.arriba;
      expect(mapa[llegada.y + 1][llegada.x]).toBe('z');
      expect(llegada.x).toBe(x);
      expect(mapa[llegada.y][llegada.x]).toBe('m');
      expect(mapa.length).toBe(c.mapa.length);
    }
    // Se puede forzar: la casa del niño que no quiere que subas.
    expect(generarInterior({ tipo: 'casa', ancho: 5, fondo: 4, plantas: 2, semilla: 1, juguetes: true }).arriba).toBeNull();
  });

  it('en el refugio y la tienda, la escalera es del personal: siempre tapada', () => {
    for (const semilla of [0, 1, 2]) {
      expect(generarInterior({ tipo: 'refugio', ancho: 5, fondo: 4, plantas: 2, semilla }).arriba).toBeNull();
      expect(generarInterior({ tipo: 'tienda', ancho: 5, fondo: 5, plantas: 2, semilla }).arriba).toBeNull();
    }
  });

  it('cada puerta lleva a una sala propia, que existe', () => {
    const ids = INTERIORES_ISLA1.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    const destinos = Object.values(PUERTAS_ISLA1).flatMap((p) => Object.values(p));
    for (const d of destinos) expect(ids, d).toContain(d);
    // Las cuatro casas de la capital, con su escalera; las de La Geria, sin ella.
    for (const d of INTERIORES_ISLA1) {
      // Los pisos de arriba son de una sala de abajo que existe.
      if (d.id.endsWith('-arriba')) {
        expect(ids, d.id).toContain(d.id.slice(0, -'-arriba'.length));
        continue;
      }
      const escalera = d.mapa.join('').includes('e');
      if (d.id.startsWith('casa-capital')) expect(escalera, d.id).toBe(true);
      if (d.id.startsWith('casa-geria')) expect(escalera, d.id).toBe(false);
    }
  });
});
