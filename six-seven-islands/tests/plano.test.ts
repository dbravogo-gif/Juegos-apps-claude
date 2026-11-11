// El plano de la isla 1 (autor, 2026-11-11): sale de los datos del mundo, es determinista y lleva
// todos los edificios y el nombre de cada zona dentro de ella.
import { describe, expect, it } from 'vitest';
import { construirMundo, edificios } from '../src/core/mundo';
import { ISLA_1 } from '../src/data/isla1';
import { MARGEN_PLANO, planoIsla } from '../src/sistemas/mapa/plano';
import { TEJADOS } from '../src/sistemas/mapa/dibujo';

const m = construirMundo(ISLA_1);
const p = planoIsla(m);

describe('plano de Lanzarote', () => {
  it('es determinista y tiene la isla más su margen de mar', () => {
    expect(planoIsla(m)).toEqual(p);
    expect([p.ancho, p.alto]).toEqual([m.ancho + 2 * MARGEN_PLANO, m.alto + 2 * MARGEN_PLANO]);
    expect(p.color.length).toBe(p.ancho * p.alto);
  });

  it('el borde es mar hondo y la orilla lleva espuma', () => {
    expect(Number.isNaN(p.altura[0])).toBe(true);
    expect(p.orilla.reduce((a, b) => a + b, 0)).toBeGreaterThan(300);
    // La orilla, siempre en el mar.
    p.orilla.forEach((o, i) => o && expect(Number.isNaN(p.altura[i])).toBe(true));
  });

  it('lleva todos los edificios, cada uno con su tejado en la leyenda', () => {
    const total = [...m.zonas.keys()].reduce((n, z) => n + edificios(m, z).length, 0);
    expect(p.edificios.length).toBe(total);
    for (const e of p.edificios) expect(TEJADOS[e.tipo], e.tipo).toBeDefined();
  });

  it('el nombre de cada zona cae dentro de ella', () => {
    expect(p.etiquetas.map((e) => e.zona).sort()).toEqual([...m.zonas.keys()].sort());
    for (const e of p.etiquetas) {
      const z = m.zonas.get(e.zona)!;
      const [x, y] = [e.x - MARGEN_PLANO, e.y - MARGEN_PLANO];
      expect(x).toBeGreaterThan(z.origen.x);
      expect(y).toBeGreaterThan(z.origen.y);
      expect(x).toBeLessThan(z.origen.x + z.mapa[0].length);
      expect(y).toBeLessThan(z.origen.y + z.mapa.length);
    }
  });
});
