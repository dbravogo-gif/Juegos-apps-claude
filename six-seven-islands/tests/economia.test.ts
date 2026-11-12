// El dinero y la primera hierba (probador, 2026-11-12): al perder se cae el 10 % del dinero, y en
// El Golfo la criatura de Planta sale poco y floja, para que la inicial de Agua pueda empezar.
import { describe, expect, it } from 'vitest';
import { perdidaPorDerrota } from '../src/core/economia';
import { ENCUENTROS_ISLA1 } from '../src/data/encuentros-isla1';
import { DATOS_COMBATE_PRUEBA as DATOS } from '../src/data/combate-prueba';

describe('dinero', () => {
  it('al perder se cae el 10 %, redondeado hacia abajo, y nunca más de lo que hay', () => {
    expect(perdidaPorDerrota(1000)).toBe(100);
    expect(perdidaPorDerrota(355)).toBe(35);
    expect(perdidaPorDerrota(9)).toBe(0);
    expect(perdidaPorDerrota(0)).toBe(0);
    expect(perdidaPorDerrota(-50)).toBe(0);
  });
});

describe('la primera hierba (El Golfo)', () => {
  it('lo que es eficaz contra la inicial de Agua sale como mucho 1 de cada 10 veces y a nivel 3', () => {
    const tabla = ENCUENTROS_ISLA1.combates;
    const total = tabla.reduce((s, e) => s + e.peso, 0);
    for (const e of tabla) {
      if (!DATOS.especies[e.especie].tipos.includes('planta')) continue;
      expect(e.peso / total, e.especie).toBeLessThanOrEqual(0.1);
      expect(e.nivel[1], e.especie).toBeLessThanOrEqual(3);
    }
  });
});
