import { describe, expect, it } from 'vitest';
import type { BufferGeometry } from 'three';
import { casaCanaria, lajasMalpais, laurel, type OpcionesCasa } from '../src/sistemas/mundo/canario';

const triangulos = (g: BufferGeometry) => g.getAttribute('position').count / 3;

describe('piezas canarias hechas por código', () => {
  const casas: OpcionesCasa[] = [
    { estilo: 'rural', ancho: 4, fondo: 3, puerta: -0.5, semilla: 3 },
    { estilo: 'rural', uso: 'refugio', ancho: 5, fondo: 4, puerta: 0, semilla: 5 },
    { estilo: 'rural', uso: 'tienda', ancho: 4, fondo: 3, puerta: -0.5, semilla: 8 },
    { estilo: 'balcones', ancho: 4, fondo: 3, puerta: -0.5, semilla: 1 },
    { estilo: 'balcones', ancho: 3, fondo: 3, puerta: 0, semilla: 2 },
    { estilo: 'balcones', uso: 'refugio', ancho: 5, fondo: 4, puerta: 0, semilla: 13 },
  ];

  it('las casas caben en su solar, se apoyan en el suelo y no gastan de más', () => {
    for (const op of casas) {
      const g = casaCanaria(op);
      const c = g.boundingBox!;
      const nombre = `${op.estilo} ${op.uso ?? 'casa'} ${op.ancho}x${op.fondo}`;
      expect(c.min.y, nombre).toBeCloseTo(0, 5);
      // El alero sobresale un poco por los lados y por detrás; el escalón y el balcón, por delante.
      expect(c.max.x, nombre).toBeLessThanOrEqual(op.ancho / 2 + 0.15);
      expect(c.min.x, nombre).toBeGreaterThanOrEqual(-op.ancho / 2 - 0.15);
      expect(c.min.z, nombre).toBeGreaterThanOrEqual(-op.fondo / 2 - 0.15);
      expect(c.max.z, nombre).toBeLessThanOrEqual(op.fondo / 2 + 0.35);
      expect(c.max.y, nombre).toBeLessThan(op.estilo === 'rural' ? 3 : 4.2);
      expect(triangulos(g), nombre).toBeLessThan(3500);
      expect(g.getAttribute('color'), nombre).toBeDefined();
    }
  });

  it('la misma semilla da la misma casa, y otra semilla puede cambiarla', () => {
    const a = casaCanaria(casas[3]).getAttribute('position').array;
    const b = casaCanaria(casas[3]).getAttribute('position').array;
    expect(Array.from(a)).toEqual(Array.from(b));
    const colores = new Set([1, 2, 3, 4, 5, 6].map((s) => casaCanaria({ ...casas[3], semilla: s }).getAttribute('color').getX(0).toFixed(3)));
    expect(colores.size).toBeGreaterThan(1);
  });

  it('el laurel y las lajas del malpaís son ligeros, porque se repiten cientos de veces', () => {
    for (let s = 1; s <= 4; s++) {
      const l = laurel(s);
      expect(triangulos(l)).toBeLessThanOrEqual(320);
      expect(l.boundingBox!.max.y).toBeGreaterThan(1.3);
      const lajas = lajasMalpais(s * 11);
      expect(triangulos(lajas)).toBeLessThanOrEqual(260);
      const c = lajas.boundingBox!;
      expect(Math.max(-c.min.x, c.max.x, -c.min.z, c.max.z)).toBeLessThanOrEqual(0.55);
      expect(c.max.y).toBeLessThan(0.5);
    }
  });
});
