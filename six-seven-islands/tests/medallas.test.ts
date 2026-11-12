// El medallero (autor, 2026-11-12): una pintadera por isla, que se gana en su gimnasio.
import { describe, expect, it } from 'vitest';
import { ISLAS_CON_PINTADERA, svgPintadera } from '../src/arte/pintaderas';
import { MEDALLAS, medallasGanadas } from '../src/data/medallas';

describe('medallero', () => {
  it('hay una medalla por cada una de las 6 islas, en orden, y cada una tiene su pintadera', () => {
    expect(MEDALLAS.map((m) => m.isla)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const m of MEDALLAS) expect(ISLAS_CON_PINTADERA).toContain(m.isla);
  });

  it('cada isla tiene un dibujo distinto, en barro si se ha ganado y en gris si no', () => {
    const dibujos = MEDALLAS.map((m) => svgPintadera(m.isla, true));
    expect(new Set(dibujos).size).toBe(MEDALLAS.length);
    for (const m of MEDALLAS) {
      expect(svgPintadera(m.isla, true)).toMatch(/^<svg viewBox="0 0 100 100"/);
      expect(svgPintadera(m.isla, true)).not.toBe(svgPintadera(m.isla, false));
    }
    expect(() => svgPintadera(9, true)).toThrow();
  });

  it('la de Lanzarote se gana al vencer al gimnasio de Roca', () => {
    expect(medallasGanadas([])).toEqual([]);
    expect(medallasGanadas(['inicial-elegida', 'gimnasio-vencido']).map((m) => m.nombre)).toEqual(['Lanzarote']);
  });
});
