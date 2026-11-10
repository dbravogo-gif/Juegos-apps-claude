// Los cubos de captura (src/arte/cubos.ts): cinco niveles por color, la figura completa para la
// imagen y la de dos figuras para lanzarla, sin gastar de más.

import { describe, expect, it } from 'vitest';
import { Group, MeshBasicMaterial, type Mesh } from 'three/webgpu';
import { CUBOS, figuraCubo, geometriaCubo } from '../src/arte/cubos';

const triangulos = (g: { getAttribute(n: string): { count: number } }) => g.getAttribute('position').count / 3;

describe('cubos de captura', () => {
  it('son cinco niveles, del blanco al morado', () => {
    expect(CUBOS.map((c) => c.nombre)).toEqual(['Blanco', 'Verde', 'Azul', 'Rojo', 'Morado']);
  });

  for (const [i, c] of CUBOS.entries()) {
    it(`${c.nombre}: completo con la red y los cinco sólidos; al lanzarlo, solo dos figuras`, () => {
      const mat = new MeshBasicMaterial();
      const completo = figuraCubo(i, mat, true);
      const lanzar = figuraCubo(i, mat);
      expect(completo).toBeInstanceOf(Group);
      expect(completo.children).toHaveLength(6);
      expect(lanzar.children).toHaveLength(2);
      const tri = (g: Group) => g.children.reduce((s, m) => s + triangulos((m as Mesh).geometry), 0);
      // Dos cubos en pantalla no deben pesar más que una criatura (unos 15.000 triángulos).
      expect(tri(lanzar)).toBeLessThan(6000);
      expect(triangulos(geometriaCubo(i))).toBeLessThan(16000);
    });
  }
});
