// Las criaturas del autor que ya están en el juego (src/data/criaturas.ts, generado por
// herramientas/criaturas/juego.py) y su escala por altura (ARTE.md, «Escala de las criaturas»).
import { describe, expect, it } from 'vitest';
import { MODELO_FINAL_INICIAL, MODELO_INICIAL } from '../src/arte/criaturas3d';
import { ESCALA_MAXIMA, ESCALA_MINIMA, escalaPorAltura } from '../src/arte/escala-criaturas';
import { DATOS_COMBATE_PRUEBA as DATOS, MODELO_DE } from '../src/data/combate-prueba';
import { ESPECIES_CRIATURAS } from '../src/data/criaturas';

// Los modelos que hay en public/modelos, con import.meta.glob de Vite (sin los tipos de Node).
const MODELOS = Object.keys(import.meta.glob('../public/modelos/**/*.glb')).map((r) => r.replace('../public/modelos/', ''));

describe('criaturas del autor', () => {
  it('cada una tiene su modelo en public/modelos y está en los datos del juego', () => {
    expect(ESPECIES_CRIATURAS.length).toBeGreaterThan(0);
    for (const e of ESPECIES_CRIATURAS) {
      expect(DATOS.especies[e.id]).toBe(e);
      expect(MODELO_DE[e.id]).toBeDefined();
      expect(MODELOS).toContain(MODELO_DE[e.id]);
    }
  });

  it('las cinco iniciales tienen modelo, y las estatuas del museo, el de su forma final', () => {
    for (const t of ['agua', 'planta', 'infernal', 'roca', 'tierra']) expect(MODELOS).toContain(MODELO_INICIAL[t]);
    for (const m of Object.values(MODELO_FINAL_INICIAL)) expect(MODELOS).toContain(m);
  });

  it('sus tipos, ataques y evoluciones existen, y ninguna evolución encoge ni llega antes de tiempo', () => {
    for (const e of ESPECIES_CRIATURAS) {
      for (const t of e.tipos) expect(DATOS.tipos.tipos.map((x) => x.id)).toContain(t);
      for (const a of e.aprende) expect(DATOS.movimientos[a.movimiento], a.movimiento).toBeDefined();
      expect(e.altura).toBeGreaterThan(0);
      for (const ev of e.evoluciona ?? []) {
        const siguiente = DATOS.especies[ev.a]!;
        expect(siguiente, ev.a).toBeDefined();
        expect(siguiente.altura!).toBeGreaterThanOrEqual(e.altura!);
        for (const ev2 of siguiente.evoluciona ?? []) expect(ev2.nivel).toBeGreaterThan(ev.nivel);
      }
    }
  });
});

describe('escala por altura', () => {
  it('sin altura, el tamaño de siempre', () => {
    expect(escalaPorAltura(undefined)).toBe(1);
    expect(escalaPorAltura(0.6)).toBeCloseTo(1);
  });

  it('comprime la diferencia: 0,3 m frente a 3 m se ve unas 3 veces, no 10', () => {
    const razon = escalaPorAltura(1.8) / escalaPorAltura(0.3);
    expect(razon).toBeCloseTo(Math.sqrt(6), 5);
    expect(escalaPorAltura(3) / escalaPorAltura(0.3)).toBeLessThan(3.5);
  });

  it('ni la más pequeña desaparece ni la más grande se sale', () => {
    expect(escalaPorAltura(0.05)).toBe(ESCALA_MINIMA);
    expect(escalaPorAltura(9)).toBe(ESCALA_MAXIMA);
  });
});
