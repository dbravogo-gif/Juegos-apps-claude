import { describe, expect, it } from 'vitest';
import { DATOS } from '../src/data';
import { ESPECIES_RETIRADAS, INICIALES } from '../src/data/especies';

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

  it('las evoluciones apuntan a especies que existen, por nivel mayor que 1 o con un objeto de evolución', () => {
    for (const e of Object.values(DATOS.especies)) {
      if (!e.evoluciona) continue;
      const { a, nivel, objeto } = e.evoluciona;
      expect(DATOS.especies[a], `${e.id} → ${a}`).toBeDefined();
      expect(nivel !== undefined || objeto !== undefined, e.id).toBe(true);
      if (nivel !== undefined) expect(nivel).toBeGreaterThan(1);
      if (objeto !== undefined) expect(DATOS.objetos[objeto]?.tipo, objeto).toBe('evolucion');
    }
  });

  it('cada objeto de evolución sirve al menos a una especie', () => {
    for (const o of Object.values(DATOS.objetos)) {
      if (o.tipo !== 'evolucion') continue;
      expect(Object.values(DATOS.especies).some((e) => e.evoluciona?.objeto === o.id), o.id).toBe(true);
    }
  });

  it('los iniciales tienen tres formas, salvo el drago, que tiene dos', () => {
    const formas = INICIALES.map((id) => {
      let actual = DATOS.especies[id];
      let n = 1;
      while (actual.evoluciona) {
        actual = DATOS.especies[actual.evoluciona.a];
        n++;
      }
      return n;
    });
    expect(formas).toEqual([3, 3, 2]);
  });

  it('cada especie tiene un número del Bestiario distinto, de 1 a 150', () => {
    const numeros = Object.values(DATOS.especies).map((e) => e.numero);
    expect(new Set(numeros).size).toBe(numeros.length);
    for (const n of numeros) expect(n >= 1 && n <= 150, String(n)).toBe(true);
  });

  it('cada imagen de criatura es de una especie que existe, de frente o en la vista del jugador', () => {
    const archivos = Object.keys(import.meta.glob('../src/assets/criaturas/*.png')).map((r) => r.split('/').pop()!.replace(/\.png$/, ''));
    for (const a of archivos) expect(DATOS.especies[a.replace(/_jugador$/, '')], a).toBeDefined();
  });

  it('las especies retiradas pasan a especies que existen', () => {
    for (const [id, opciones] of Object.entries(ESPECIES_RETIRADAS)) {
      expect(DATOS.especies[id], id).toBeUndefined();
      for (const o of opciones) expect(DATOS.especies[o.a], o.a).toBeDefined();
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
