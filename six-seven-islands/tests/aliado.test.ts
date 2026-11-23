// Dos contra dos con un amigo (el terrero de Agaete, ISLA-3.md): desde `aliadoDesde`, las criaturas
// del lado 0 son del aliado. La IA decide por ellas y las reemplaza; tú solo sacas las tuyas, y ellas
// no ganan experiencia.
import { describe, expect, it } from 'vitest';
import { banquillo, delAliado, iniciarCombate, reemplazar, resolverTurno, type EstadoCombate } from '../src/core/combate';
import { crearCriatura } from '../src/core/criatura';
import type { Criatura } from '../src/core/modelo';
import { crearRng } from '../src/core/rng';
import { DATOS_PRUEBA as D } from './utiles/datos-prueba';

let n = 0;
const cr = (especie: string, nivel = 20, extra: Partial<Criatura> = {}): Criatura => ({
  ...crearCriatura(D, especie, nivel, crearRng(`al-${n++}`), { valia: 8, temperamento: 'equilibrado' }),
  ...extra,
});

/** Tus dos criaturas (0 y 1), las dos del aliado (2 y 3), y dos rivales. */
function combate(tuyas: Criatura[], suyas: Criatura[], rivales: Criatura[]): EstadoCombate {
  return iniciarCombate(
    {
      equipos: [[...tuyas, ...suyas], rivales],
      formato: 2,
      salvaje: false,
      control: ['jugador', 'ia'],
      rng: crearRng('aliado'),
      experiencia: true,
      aliadoDesde: tuyas.length,
      activosIniciales: [[0, tuyas.length], [0, 1]],
    },
    D,
  ).estado;
}

describe('dos contra dos con un aliado', () => {
  it('empiezan tu primera y la primera del aliado; el aliado decide solo', () => {
    const e = combate([cr('agua1'), cr('agua1')], [cr('planta1'), cr('planta1')], [cr('rama'), cr('rama')]);
    expect(e.lados[0].activos).toEqual([0, 2]);
    expect(delAliado(e.lados[0], 2)).toBe(true);
    expect(delAliado(e.lados[0], 1)).toBe(false);
    // Solo se manda tu acción: la del aliado la pone la IA.
    const r = resolverTurno(e, { 0: [{ tipo: 'movimiento', indice: 0, objetivo: { lado: 1, hueco: 0 } }] }, D);
    const usan = r.eventos.filter((x) => x.tipo === 'usa' && x.ref.lado === 0).map((x) => (x as { ref: { hueco: number } }).ref.hueco);
    expect(usan).toContain(0);
    expect(usan).toContain(1);
  });

  it('no puedes sacar una criatura del aliado', () => {
    const e = combate([cr('agua1'), cr('agua1')], [cr('planta1'), cr('planta1')], [cr('rama'), cr('rama')]);
    expect(banquillo(e, 0)).toContain(3);
    expect(() => resolverTurno(e, { 0: [{ tipo: 'cambio', indice: 3 }] }, D)).toThrow(/aliado/);
  });

  it('cuando cae la del aliado, la IA saca otra suya sin esperar; cuando cae la tuya, esperas tú y solo de las tuyas', () => {
    let e = combate([cr('agua1', 5), cr('agua1', 60)], [cr('planta1', 5), cr('planta1', 60)], [cr('rama', 80), cr('rama', 80)]);
    for (let i = 0; i < 30 && !e.fin; i++) {
      if (e.pendientes.length) {
        // Solo tus huecos esperan, y solo con tus criaturas.
        for (const p of e.pendientes) expect(delAliado(e.lados[0], e.lados[0].activos[p.hueco]!)).toBe(false);
        const libre = banquillo(e, 0).find((j) => !delAliado(e.lados[0], j));
        expect(libre).toBeDefined();
        e = reemplazar(e, e.pendientes[0]!, libre!, D).estado;
        continue;
      }
      e = resolverTurno(e, { 0: [{ tipo: 'movimiento', indice: 0, objetivo: { lado: 1, hueco: 0 } }] }, D).estado;
      // El hueco del aliado, si tiene criatura, es siempre del aliado.
      const i = e.lados[0].activos[1]!;
      if (i >= 0) expect(delAliado(e.lados[0], i)).toBe(true);
    }
    expect(e.lados[0].equipo[2]!.vida).toBe(0);
  });

  it('las criaturas del aliado no ganan experiencia', () => {
    const tuya = cr('agua1', 30);
    const suya = cr('planta1', 30);
    let e = combate([tuya], [suya], [cr('rama', 2), cr('rama', 2)]);
    const antes = e.lados[0].equipo[1]!.exp;
    for (let i = 0; i < 10 && !e.fin; i++) e = resolverTurno(e, { 0: [{ tipo: 'movimiento', indice: 0, objetivo: { lado: 1, hueco: i % 2 } }] }, D).estado;
    expect(e.fin).toBe('victoria');
    expect(e.lados[0].equipo[1]!.exp).toBe(antes);
    expect(e.lados[0].equipo[0]!.exp).toBeGreaterThan(tuya.exp);
  });
});
