// Cada tipo tiene su escenario de evolución (autor, 2026-11-20: «ve haciendo las del resto de
// tipos»): ninguno se queda con uno genérico, y no hay dos tipos con el mismo decorado salvo Común,
// que es el de las piedras.
import { describe, expect, it } from 'vitest';
import { TIPOS } from '../src/data/tipos';
import { DECORADOS } from '../src/sistemas/combate/decorados-evolucion';
import { PALETAS } from '../src/sistemas/combate/escenario-evolucion';

describe('escenarios de evolución', () => {
  it('cada tipo tiene el suyo, y cada decorado lo usa un solo tipo', () => {
    const decorados = TIPOS.map((t) => {
      expect(PALETAS[t.id], t.id).toBeDefined();
      return PALETAS[t.id].props;
    });
    expect(new Set(decorados).size).toBe(decorados.length);
  });

  it('los decorados con partes vivas existen: el muñeco de Lucha y las burbujas de Veneno, entre otros', () => {
    expect(DECORADOS[PALETAS.lucha.props]?.vivo).toBeDefined();
    expect(DECORADOS[PALETAS.veneno.props]?.vivo).toBeDefined();
    for (const t of ['electrico', 'acero', 'mental', 'espectral', 'oscuridad', 'ancestral', 'bicho']) expect(DECORADOS[PALETAS[t].props], t).toBeDefined();
  });
});
