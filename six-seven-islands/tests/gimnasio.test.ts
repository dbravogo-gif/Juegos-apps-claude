// El gimnasio de Roca (autor, 2026-11-13): terrazas separadas por coladas de lava, con puentes de
// basalto, y la líder arriba, tras la compuerta de la palanca. Ningún aprendiz se puede esquivar.
// Las compuertas que abrían los aprendices se quitaron: ya había que vencerlos (autor, 2026-11-19).
import { describe, expect, it } from 'vitest';
import { avanzar, crearExploracion, interactuar } from '../src/core/explorar';
import { alcanzables, clave, construirInterior, transitable, vision, type Condicion, type Direccion } from '../src/core/mundo';
import { GIMNASIO_ROCA } from '../src/data/gimnasio-roca';
import { DATOS_COMBATE_PRUEBA } from '../src/data/combate-prueba';
import { ENTRENADORES_ISLA1 } from '../src/data/entrenadores-isla1';
import { INTERIORES_ISLA1 } from '../src/data/interiores-isla1';

const m = construirInterior(GIMNASIO_ROCA, { x: 0, y: 0 });
const k = (x: number, y: number) => clave(x, y);
const entrada = k(GIMNASIO_ROCA.entrada.x, GIMNASIO_ROCA.entrada.y);
const desde = (condiciones: Condicion[], prohibidas?: Set<number>) => alcanzables(m, [entrada], { condiciones: new Set(condiciones), prohibidas });
const persona = (id: string) => GIMNASIO_ROCA.personajes.find((p) => p.id === id)!;
/** Las casillas desde las que se habla con alguien (las de al lado). */
const alLado = (x: number, y: number) => [k(x, y + 1), k(x, y - 1), k(x + 1, y), k(x - 1, y)];

describe('gimnasio de Roca', () => {
  it('es el interior del gimnasio de Lanzarote', () => {
    expect(INTERIORES_ISLA1.find((d) => d.id === 'gimnasio')).toBe(GIMNASIO_ROCA);
  });

  it('sus entrenadores solo llevan Roca o Tierra, y ninguna criatura sale más de dos veces (autor, 2026-11-19)', () => {
    const quienes = ['aprendiz-roca-1', 'aprendiz-roca-2', 'aprendiz-roca-3', 'lider-gimnasio'];
    const veces = new Map<string, number>();
    for (const q of quienes) {
      for (const { especie } of ENTRENADORES_ISLA1[q]!.equipo) {
        const tipos = DATOS_COMBATE_PRUEBA.especies[especie]!.tipos;
        expect(tipos.some((t) => t === 'roca' || t === 'tierra'), `${q}: ${especie}`).toBe(true);
        veces.set(especie, (veces.get(especie) ?? 0) + 1);
      }
    }
    for (const [especie, n] of veces) expect(n, especie).toBeLessThanOrEqual(2);
  });

  it('solo queda la compuerta de la palanca, y la líder está detrás', () => {
    const lider = persona('lider-gimnasio');
    const llegaLider = (c: Condicion[]) => alLado(lider.x, lider.y).some((a) => desde(c).has(a));
    expect(Object.keys(GIMNASIO_ROCA.cierres!)).toEqual(['8,4']);
    // Los puentes se cruzan sin vencer a nadie: lo que obliga a luchar es que te vean.
    expect(desde([]).has(k(8, 5))).toBe(true);
    expect(llegaLider([])).toBe(false);
    expect(transitable(m, 8, 4, { condiciones: new Set(['vencido:aprendiz-roca-1', 'vencido:aprendiz-roca-2', 'vencido:aprendiz-roca-3']) })).toBe(false);
    expect(llegaLider(['palanca:gimnasio-roca'])).toBe(true);
  });

  it('ningún aprendiz se esquiva: sin pisar lo que ve, no se llega a su puente ni a la palanca', () => {
    const casos: [string, Condicion[], number[]][] = [
      ['aprendiz-roca-1', [], [k(8, 12)]],
      ['aprendiz-roca-2', [], [k(8, 8)]],
      ['aprendiz-roca-3', [], [k(14, 6), k(15, 7), k(15, 5)]],
    ];
    for (const [id, condiciones, metas] of casos) {
      const ve = new Set(vision(m, 'gimnasio', persona(id)));
      expect(ve.size, id).toBeGreaterThan(0);
      const r = desde(condiciones, ve);
      for (const meta of metas) expect(r.has(meta), `${id}: ${meta}`).toBe(false);
    }
  });

  it('la palanca se usa de frente y cuenta si ya estaba bajada', () => {
    const e = { ...crearExploracion(m), x: 14, y: 6, mira: 'e' as Direccion, zona: 'gimnasio' };
    expect(interactuar(m, e)).toEqual([{ tipo: 'palanca', id: 'gimnasio-roca', ya: false }]);
    e.condiciones = ['palanca:gimnasio-roca'];
    expect(interactuar(m, e)).toEqual([{ tipo: 'palanca', id: 'gimnasio-roca', ya: true }]);
  });

  it('la compuerta cerrada avisa de que hace falta una palanca', () => {
    const e = { ...crearExploracion(m), x: 8, y: 5, desdeX: 8, desdeY: 5, mira: 'n' as Direccion, zona: 'gimnasio' };
    const ev = avanzar(m, e, 'n');
    expect(ev).toEqual([{ tipo: 'aviso', texto: GIMNASIO_ROCA.cierres!['8,4'].aviso }]);
  });

  it('los aprendices y la líder tienen equipo; la líder da la pintadera de Lanzarote', () => {
    for (const p of GIMNASIO_ROCA.personajes.filter((x) => x.entrenador || x.id === 'lider-gimnasio')) {
      expect(ENTRENADORES_ISLA1[p.id]?.equipo.length, p.id).toBeGreaterThan(0);
    }
    expect(ENTRENADORES_ISLA1['lider-gimnasio'].medalla).toBe(1);
    expect(ENTRENADORES_ISLA1['lider-gimnasio'].alVencer?.some((l) => l.includes('pintadera'))).toBe(true);
  });
});
