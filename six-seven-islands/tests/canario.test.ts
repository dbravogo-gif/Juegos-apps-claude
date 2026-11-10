import { describe, expect, it } from 'vitest';
import type { BufferGeometry } from 'three';
import { casaCanaria, faro, type OpcionesCasa } from '../src/sistemas/mundo/canario';

const triangulos = (g: BufferGeometry) => g.getAttribute('position').count / 3;

describe('casas canarias hechas por código', () => {
  const casas: OpcionesCasa[] = [
    { estilo: 'rural', ancho: 4, fondo: 3, puerta: -0.5, semilla: 3 },
    { estilo: 'rural', uso: 'refugio', ancho: 5, fondo: 4, puerta: 0, semilla: 5 },
    { estilo: 'rural', uso: 'tienda', ancho: 4, fondo: 3, puerta: -0.5, semilla: 8 },
    { estilo: 'balcones', ancho: 4, fondo: 3, puerta: -0.5, semilla: 1 },
    { estilo: 'balcones', ancho: 3, fondo: 3, puerta: 0, semilla: 2 },
    { estilo: 'balcones', uso: 'refugio', ancho: 5, fondo: 4, puerta: 0, semilla: 13 },
    { estilo: 'balcones', uso: 'museo', techo: 'teja', ancho: 8, fondo: 4, puerta: 0.5, semilla: 21 },
    { estilo: 'balcones', uso: 'gimnasio', techo: 'azotea', ancho: 8, fondo: 6, puerta: 0.5, semilla: 34 },
    { estilo: 'lanzarote', ancho: 4, fondo: 3, puerta: -0.5, semilla: 4 },
    { estilo: 'lanzarote', uso: 'museo', ancho: 8, fondo: 4, puerta: -0.5, semilla: 9 },
    { estilo: 'balcones', blanca: true, emblema: 'volcan', uso: 'gimnasio', techo: 'azotea', ancho: 8, fondo: 6, puerta: 0.5, semilla: 34 },
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
      expect(c.max.y, nombre).toBeLessThan(op.estilo === 'balcones' ? 4.2 : 3);
      expect(triangulos(g), nombre).toBeLessThan(op.ancho > 6 ? 6000 : 3500);
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

  it('el faro es una torre de un solar de 2 × 2', () => {
    const c = faro().boundingBox!;
    expect(c.min.y).toBeCloseTo(0, 5);
    expect(Math.max(-c.min.x, c.max.x, -c.min.z, c.max.z)).toBeLessThanOrEqual(1);
    expect(c.max.y).toBeGreaterThan(4);
  });
});
