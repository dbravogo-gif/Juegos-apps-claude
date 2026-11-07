import { describe, expect, it } from 'vitest';
import { bifurcar, crearRng, entero, siguiente } from '../src/core/rng';

describe('generador con semilla', () => {
  it('la misma semilla da la misma secuencia', () => {
    const a = crearRng(67);
    const b = crearRng(67);
    const sa = Array.from({ length: 50 }, () => entero(a, 1, 100));
    const sb = Array.from({ length: 50 }, () => entero(b, 1, 100));
    expect(sa).toEqual(sb);
  });

  it('bifurcar da un generador estable que no consume del original', () => {
    const base = crearRng('isla');
    const copia = { s: [...base.s] as [number, number, number, number] };
    const f1 = bifurcar(base, 'encuentros');
    const f2 = bifurcar(base, 'encuentros');
    expect(base.s).toEqual(copia.s);
    expect(siguiente(f1)).toBe(siguiente(f2));
    expect(siguiente(bifurcar(base, 'otra'))).not.toBe(siguiente(bifurcar(base, 'encuentros')));
  });
});
