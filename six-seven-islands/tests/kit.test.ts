import { describe, expect, it } from 'vitest';
import type { BufferGeometry } from 'three';
import { KIT, VARIANTES, piezaKit, type PiezaKit } from '../src/sistemas/mundo/kit';

const triangulos = (g: BufferGeometry) => g.getAttribute('position').count / 3;

/** Triángulos como mucho por pieza: las que más se repiten son las más ligeras. */
const PRESUPUESTO: Record<PiezaKit, number> = {
  laurel: 320,
  palmera: 1300,
  drago: 3000,
  platanera: 800,
  cardon: 1300,
  tabaiba: 750,
  tajinaste: 800,
  roca: 200,
  organos: 400,
  escoria: 300,
  lajas: 260,
  colada: 260,
  muro: 600,
  vid: 500,
  tunera: 800,
  volcan: 400,
  nube: 700,
  boya: 400,
  barca: 700,
  sombrilla: 300,
  toalla: 200,
  estatua: 600,
  grabado: 300,
};
/** Lo que puede salirse de su casilla cada pieza, desde el centro: las copas grandes se salen. */
const RADIO: Record<PiezaKit, number> = {
  laurel: 1.1,
  palmera: 1.9,
  drago: 1.6,
  platanera: 1.3,
  cardon: 0.6,
  tabaiba: 0.6,
  tajinaste: 0.6,
  roca: 0.6,
  organos: 0.5,
  escoria: 0.6,
  lajas: 0.55,
  colada: 0.55,
  muro: 0.62,
  vid: 0.55,
  tunera: 0.6,
  volcan: 1.1,
  nube: 1.3,
  boya: 0.3,
  barca: 0.9,
  sombrilla: 0.8,
  toalla: 0.85,
  estatua: 0.7,
  grabado: 0.55,
};

describe('kit canario de naturaleza', () => {
  const tipos = Object.keys(KIT) as PiezaKit[];

  it('cada variante sale del suelo, cabe en su sitio y no gasta de más', () => {
    for (const tipo of tipos) {
      for (let v = 0; v < VARIANTES[tipo]; v++) {
        const g = piezaKit(tipo, v);
        const c = g.boundingBox!;
        const nombre = `${tipo} ${v}`;
        // Todas salen del suelo, salvo la nube, que flota.
        if (tipo !== 'nube') {
          expect(c.min.y, nombre).toBeGreaterThan(-0.12);
          expect(c.min.y, nombre).toBeLessThan(0.1);
        }
        expect(Math.max(-c.min.x, c.max.x, -c.min.z, c.max.z), nombre).toBeLessThanOrEqual(RADIO[tipo]);
        expect(triangulos(g), nombre).toBeLessThanOrEqual(PRESUPUESTO[tipo]);
        expect(g.getAttribute('color'), nombre).toBeDefined();
      }
    }
  });

  it('es determinista y las variantes son distintas entre sí', () => {
    for (const tipo of tipos) {
      const a = Array.from(piezaKit(tipo, 0).getAttribute('position').array);
      expect(Array.from(piezaKit(tipo, 0).getAttribute('position').array), tipo).toEqual(a);
      if (VARIANTES[tipo] > 1) expect(Array.from(piezaKit(tipo, 1).getAttribute('position').array), tipo).not.toEqual(a);
    }
  });

  it('los árboles son altos y las matas bajas, para leerse por la silueta', () => {
    const alto = (t: PiezaKit) => piezaKit(t, 0).boundingBox!.max.y;
    expect(alto('palmera')).toBeGreaterThan(2);
    expect(alto('laurel')).toBeGreaterThan(1.3);
    expect(alto('tajinaste')).toBeGreaterThan(1.2);
    expect(alto('tabaiba')).toBeLessThan(0.8);
    expect(alto('muro')).toBeLessThan(0.65);
  });
});
