import { describe, expect, it } from 'vitest';
import { DATOS } from '../src/data';
import { INICIALES } from '../src/data/especies';

// Comprueba que el contenido es coherente, para poder añadir criaturas sin miedo.
describe('datos', () => {
  const tipos = new Set(DATOS.tipos.tipos.map((t) => t.id));

  it('cada especie usa tipos y movimientos que existen', () => {
    for (const e of Object.values(DATOS.especies)) {
      for (const t of e.tipos) expect(tipos.has(t), `${e.id}: tipo ${t}`).toBe(true);
      for (const a of e.aprende) expect(DATOS.movimientos[a.movimiento], `${e.id}: ${a.movimiento}`).toBeDefined();
      expect(e.aprende.some((a) => a.nivel === 1), `${e.id} no aprende nada a nivel 1`).toBe(true);
      expect(e.ratioCaptura).toBeGreaterThanOrEqual(1);
      expect(e.ratioCaptura).toBeLessThanOrEqual(255);
    }
  });

  it('las evoluciones apuntan a especies que existen y a un nivel mayor que 1', () => {
    for (const e of Object.values(DATOS.especies)) {
      if (!e.evoluciona) continue;
      expect(DATOS.especies[e.evoluciona.a], `${e.id} → ${e.evoluciona.a}`).toBeDefined();
      expect(e.evoluciona.nivel).toBeGreaterThan(1);
    }
  });

  it('los iniciales tienen tres formas', () => {
    for (const id of INICIALES) {
      let actual = DATOS.especies[id];
      let formas = 1;
      while (actual.evoluciona) {
        actual = DATOS.especies[actual.evoluciona.a];
        formas++;
      }
      expect(formas, id).toBe(3);
    }
  });

  it('cada movimiento usa un tipo que existe y tiene PP', () => {
    for (const m of Object.values(DATOS.movimientos)) {
      expect(tipos.has(m.tipo), `${m.id}: ${m.tipo}`).toBe(true);
      expect(m.pp).toBeGreaterThan(0);
      if (m.categoria !== 'estado') expect(m.poder).toBeGreaterThan(0);
    }
  });

  it('hay 25 temperamentos y 5 son neutros', () => {
    expect(DATOS.temperamentos).toHaveLength(25);
    expect(DATOS.temperamentos.filter((t) => t.sube === t.baja)).toHaveLength(5);
    expect(new Set(DATOS.temperamentos.map((t) => t.id)).size).toBe(25);
  });
});
