// El barco de Lanzarote (F23): el marinero solo deja subir tras vencer a la líder, y decir que sí
// cumple «isla1-completada» y zarpa a Fuerteventura, sin pantalla de final (autor, 2026-11-22).
import { describe, expect, it } from 'vitest';
import { elegirDialogo } from '../src/core/guion';
import { GUION_ISLA1 } from '../src/data/guion-isla1';

describe('el barco de la isla 1', () => {
  it('sin vencer a la líder, el marinero no deja subir', () => {
    const d = elegirDialogo(GUION_ISLA1, 'marinero', ['inicial-elegida', 'anciano'], 'agua')!;
    expect(d.efecto?.viaje).toBeUndefined();
    expect(d.pregunta).toBeUndefined();
  });

  it('tras vencerla, pregunta si subes y decir que sí zarpa a Fuerteventura', () => {
    const d = elegirDialogo(GUION_ISLA1, 'marinero', ['inicial-elegida', 'anciano', 'gimnasio-vencido'], 'agua')!;
    expect(d.pregunta?.texto).toMatch(/barco/);
    expect(d.efecto).toEqual({ viaje: 2, condicion: 'isla1-completada' });
  });
});
