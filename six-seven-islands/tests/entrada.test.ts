// Las teclas (autor, 2026-11-19): como una consola. A confirma, Z abre el menú (como Esc) y X
// vuelve atrás, como el botón B. Se anda con las flechas: WASD chocaba con la A.
import { describe, expect, it } from 'vitest';
import { ACCIONES, DIRECCIONES } from '../src/sistemas/entrada/entrada';

describe('teclas', () => {
  it('A confirma, Z abre el menú y X vuelve', () => {
    expect(ACCIONES.KeyA).toBe('confirmar');
    expect(ACCIONES.Enter).toBe('confirmar');
    expect(ACCIONES.KeyZ).toBe('menu');
    expect(ACCIONES.Escape).toBe('menu');
    expect(ACCIONES.KeyX).toBe('cancelar');
  });

  it('ninguna tecla es a la vez dirección y acción', () => {
    for (const tecla of Object.keys(DIRECCIONES)) expect(ACCIONES[tecla], tecla).toBeUndefined();
  });
});
