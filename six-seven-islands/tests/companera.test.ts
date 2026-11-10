// La compañera va una casilla detrás del jugador, por su mismo camino (src/sistemas/companera).

import { describe, expect, it } from 'vitest';
import { Rastro } from '../src/sistemas/companera/rastro';

describe('rastro de la compañera', () => {
  it('en línea recta, va justo una casilla detrás', () => {
    const r = new Rastro();
    r.reiniciar({ x: -1, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
    for (let x = 0; x <= 3; x += 0.1) r.anadir({ x, y: 0, z: 0 });
    const q = r.atras({ x: 3, y: 0, z: 0 }, 1);
    expect(q.x).toBeCloseTo(2, 5);
    expect(q.z).toBeCloseTo(0, 5);
  });

  it('al doblar una esquina, sigue el camino y no corta por la diagonal', () => {
    const r = new Rastro();
    r.reiniciar({ x: -1, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
    for (let x = 0; x <= 2; x += 0.1) r.anadir({ x, y: 0, z: 0 });
    for (let z = 0; z <= 0.5; z += 0.1) r.anadir({ x: 2, y: 0, z });
    const q = r.atras({ x: 2, y: 0, z: 0.5 }, 1);
    expect(q.x).toBeCloseTo(1.5, 1);
    expect(q.z).toBeCloseTo(0, 1);
  });

  it('interpola también la altura, al subir un escalón', () => {
    const r = new Rastro();
    r.reiniciar({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 });
    r.anadir({ x: 2, y: 0.5, z: 0 });
    const q = r.atras({ x: 2, y: 0.5, z: 0 }, 0.5);
    expect(q.y).toBeCloseTo(0.25, 5);
  });

  it('con un rastro corto, se queda en su principio', () => {
    const r = new Rastro();
    r.reiniciar({ x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 0.8 });
    expect(r.atras({ x: 0, y: 0, z: 0.8 }, 1)).toEqual({ x: 0, y: 0, z: 1 });
  });
});
