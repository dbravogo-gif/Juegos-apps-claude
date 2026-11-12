// Encuentros en la hierba (2026-11-12): se sortean con la semilla, solo salen las especies de la
// zona y a sus niveles, y la exploración avisa al pisar terreno de encuentros.
import { describe, expect, it } from 'vitest';
import { sortearEncuentro, PROB_ENCUENTRO } from '../src/core/encuentros';
import { crearRng } from '../src/core/rng';
import { avanzar, crearExploracion, PASOS_POR_CASILLA } from '../src/core/explorar';
import { DE_ENCUENTROS, clave, construirMundo, TODAS_LAS_CONDICIONES } from '../src/core/mundo';
import { ISLA_1 } from '../src/data/isla1';
import { ENCUENTROS_ISLA1 } from '../src/data/encuentros-isla1';
import { DATOS_COMBATE_PRUEBA, MODELO_DE } from '../src/data/combate-prueba';

describe('encuentros', () => {
  it('con la misma semilla sale lo mismo, y solo especies de la zona a sus niveles', () => {
    const a = crearRng(7);
    const b = crearRng(7);
    let salidas = 0;
    for (let i = 0; i < 2000; i++) {
      const x = sortearEncuentro(ENCUENTROS_ISLA1, 'combates', a);
      expect(sortearEncuentro(ENCUENTROS_ISLA1, 'combates', b)).toEqual(x);
      if (!x) continue;
      salidas++;
      const e = ENCUENTROS_ISLA1.combates.find((y) => y.especie === x.especie)!;
      expect(e).toBeDefined();
      expect(x.nivel).toBeGreaterThanOrEqual(e.nivel[0]);
      expect(x.nivel).toBeLessThanOrEqual(e.nivel[1]);
    }
    // Más o menos uno de cada diez pasos.
    expect(salidas / 2000).toBeGreaterThan(PROB_ENCUENTRO / 100 - 0.03);
    expect(salidas / 2000).toBeLessThan(PROB_ENCUENTRO / 100 + 0.03);
  });

  it('en una zona sin tabla no sale nada', () => {
    const rng = crearRng(1);
    for (let i = 0; i < 200; i++) expect(sortearEncuentro(ENCUENTROS_ISLA1, 'inicial', rng)).toBeNull();
  });

  it('las tablas solo usan especies que existen, con su modelo, y cubren cada zona con hierba', () => {
    const m = construirMundo(ISLA_1);
    const conHierba = new Set([...m.casillas.values()].filter((v) => DE_ENCUENTROS.has(v.c)).map((v) => v.zona));
    for (const z of conHierba) expect(ENCUENTROS_ISLA1[z]?.length, z).toBeGreaterThan(0);
    for (const entradas of Object.values(ENCUENTROS_ISLA1)) {
      for (const e of entradas) {
        expect(DATOS_COMBATE_PRUEBA.especies[e.especie], e.especie).toBeDefined();
        expect(MODELO_DE[e.especie], e.especie).toBeDefined();
      }
    }
  });

  it('al terminar un paso sobre la hierba, la exploración avisa', () => {
    const m = construirMundo(ISLA_1);
    // Una casilla de hierba con hierba al norte.
    const [k] = [...m.casillas].find(([kk, v]) => v.c === '"' && m.casillas.get(kk - 4096)?.c === '"')!;
    const e = crearExploracion(m, [...TODAS_LAS_CONDICIONES]);
    e.x = k % 4096;
    e.y = Math.floor(k / 4096) + 0;
    e.zona = m.casillas.get(k)!.zona;
    const eventos = [];
    for (let i = 0; i <= PASOS_POR_CASILLA; i++) eventos.push(...avanzar(m, e, i === 0 ? 'n' : null));
    expect(clave(e.x, e.y)).toBe(k - 4096);
    expect(eventos).toContainEqual({ tipo: 'hierba', zona: e.zona });
  });
});
