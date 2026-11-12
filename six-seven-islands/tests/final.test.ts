// El final de la versión (F23): el marinero solo deja subir al barco tras vencer a la líder, y
// decir que sí acaba la isla 1.
import { describe, expect, it } from 'vitest';
import { elegirDialogo } from '../src/core/guion';
import { GUION_ISLA1 } from '../src/data/guion-isla1';

describe('final de la isla 1', () => {
  it('sin vencer a la líder, el marinero no deja subir', () => {
    const d = elegirDialogo(GUION_ISLA1, 'marinero', ['inicial-elegida', 'anciano'], 'agua')!;
    expect(d.efecto?.fin).toBeUndefined();
    expect(d.pregunta).toBeUndefined();
  });

  it('tras vencerla, pregunta si subes al barco y decir que sí acaba la versión', () => {
    const d = elegirDialogo(GUION_ISLA1, 'marinero', ['inicial-elegida', 'anciano', 'gimnasio-vencido'], 'agua')!;
    expect(d.pregunta?.texto).toMatch(/barco/);
    expect(d.efecto?.fin).toBe(true);
  });
});
