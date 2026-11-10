// El terreno de Lanzarote: lo que se pisa y lo que no se distingue por su altura, las plantas no
// dejan cuadros de otro color y las manchas de Timanfaya son suaves (probador, 2026-11-10).

import { describe, expect, it } from 'vitest';
import { Color } from 'three/webgpu';
import { clave, construirMundo, type Casilla } from '../src/core/mundo';
import { ISLA_1 } from '../src/data/isla1';
import { alturaCara, colorDeCasilla, manchas } from '../src/sistemas/mundo/terreno';
import { NIVEL_MAR } from '../src/arte/escala';

const m = construirMundo(ISLA_1);
const cara = (c: Casilla, h = 0) => alturaCara({ c, zona: 'x', h }, undefined);

describe('terreno de Lanzarote', () => {
  it('la colada (no se pisa) va claramente más alta que el malpaís y el camino (sí se pisan)', () => {
    expect(cara('L') - cara(';')).toBeGreaterThanOrEqual(0.3);
    expect(cara(';')).toBeGreaterThan(cara('_'));
    expect(cara('Q')).toBe(cara('L'));
  });

  it('el charco verde queda por encima del mar, también en la playa (si no, titila en azul)', () => {
    for (const h of [0, 1, 2]) expect(cara('w', h)).toBeGreaterThan(NIVEL_MAR + 0.05);
  });

  it('bajo una planta, el suelo es del color del de alrededor', () => {
    let vistas = 0;
    for (const [k, cm] of m.casillas) {
      if (cm.c !== 'T' && cm.c !== 'U') continue;
      const [x, y] = [k % 4096, Math.floor(k / 4096)];
      const vecinos = [clave(x - 1, y), clave(x + 1, y), clave(x, y - 1), clave(x, y + 1)].filter((v) => m.casillas.get(v)?.c === '.');
      if (vecinos.length < 3) continue;
      expect(colorDeCasilla(m, k).getHex(), `${cm.c} en ${cm.zona} ${x},${y}`).toBe(colorDeCasilla(m, vecinos[0]).getHex());
      vistas++;
    }
    expect(vistas).toBeGreaterThan(3);
  });

  it('la playa dorada no se confunde con el jable', () => {
    const playa = [...m.casillas].find(([, v]) => v.c === 'a')!;
    const jable = [...m.casillas].find(([, v]) => v.c === '.' && v.zona === 'inicial')!;
    const a = colorDeCasilla(m, playa[0]);
    const b = colorDeCasilla(m, jable[0]);
    const hsl = (c: Color) => c.getHSL({ h: 0, s: 0, l: 0 });
    expect(hsl(a).s - hsl(b).s).toBeGreaterThan(0.2);
  });

  it('La Geria tiene suelo de picón negro, más oscuro que el jable del resto', () => {
    const geria = [...m.casillas].find(([, v]) => v.c === '.' && v.zona === 'pueblo')!;
    const jable = [...m.casillas].find(([, v]) => v.c === '.' && v.zona === 'inicial')!;
    const l = (k: number) => colorDeCasilla(m, k).getHSL({ h: 0, s: 0, l: 0 }).l;
    expect(l(jable[0]) - l(geria[0])).toBeGreaterThan(0.3);
  });

  it('las manchas de Timanfaya van de 0 a 1 y cambian poco de una casilla a la vecina', () => {
    let min = 1;
    let max = 0;
    for (let y = 0; y < 40; y++) {
      for (let x = 0; x < 40; x++) {
        const n = manchas(x, y, 5);
        min = Math.min(min, n);
        max = Math.max(max, n);
        expect(Math.abs(manchas(x + 1, y, 5) - n)).toBeLessThan(0.35);
      }
    }
    expect(min).toBeGreaterThanOrEqual(0);
    expect(max).toBeLessThan(1);
    expect(max - min).toBeGreaterThan(0.5);
  });
});
