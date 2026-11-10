// Las juntas que parpadeaban al moverse la cámara (autor, 2026-11-10): paredes de los interiores
// en tramos sin solapes, y la sombra que se mueve de texel en texel.

import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three/webgpu';
import { clave, construirInterior, deClave } from '../src/core/mundo';
import { INTERIORES_ISLA1 } from '../src/data/interiores-isla1';
import { tramosDePared } from '../src/sistemas/salas/salas';
import { ajustarATexel } from '../src/sistemas/render/render';

describe('paredes de los interiores', () => {
  for (const [i, def] of INTERIORES_ISLA1.entries()) {
    const sala = construirInterior(def, { x: 200 + i * 20, y: 0 });
    it(`${def.id}: los tramos cubren cada pared una sola vez y son pocos`, () => {
      const tramos = tramosDePared(sala);
      const cubiertas = new Map<number, number>();
      for (const t of tramos) {
        for (let y = t.y0; y <= t.y1; y++) {
          for (let x = t.x0; x <= t.x1; x++) cubiertas.set(clave(x, y), (cubiertas.get(clave(x, y)) ?? 0) + 1);
        }
      }
      const paredes = [...sala.casillas].filter(([, c]) => c.c === '|').map(([k]) => k);
      expect(cubiertas.size).toBe(paredes.length);
      for (const k of paredes) expect(cubiertas.get(k), `pared ${deClave(k)}`).toBe(1);
      // Fondo, dos lados y el frente partido por la puerta.
      expect(tramos.length).toBeLessThanOrEqual(5);
    });
  }
});

describe('sombra fija a la rejilla de texeles', () => {
  const texel = 32 / 2048;
  it('mueve el punto menos de un texel en el plano de la luz y nada hacia el sol', () => {
    const p = new Vector3(103.37, 2.25, 41.81);
    const q = ajustarATexel(p, texel);
    expect(q.distanceTo(p)).toBeLessThan(texel);
    const haciaSol = new Vector3(-22, 28, 12).normalize();
    expect(Math.abs(q.dot(haciaSol) - p.dot(haciaSol))).toBeLessThan(1e-9);
  });

  it('en el plano de la luz, dos puntos ajustados quedan a un número entero de texeles', () => {
    const z = new Vector3(-22, 28, 12).normalize();
    const x = new Vector3(0, 1, 0).cross(z).normalize();
    const y = z.clone().cross(x);
    const a = ajustarATexel(new Vector3(10, 1, 10), texel);
    for (const d of [0.001, 0.004, 0.0071, 0.37]) {
      const b = ajustarATexel(new Vector3(10 + d, 1, 10 - d / 2), texel);
      for (const eje of [x, y]) {
        const salto = b.clone().sub(a).dot(eje) / texel;
        expect(Math.abs(salto - Math.round(salto))).toBeLessThan(1e-6);
      }
    }
  });
});

