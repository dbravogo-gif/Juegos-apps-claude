// El campo de los gimnasios (autor, 2026-11-15): tormenta de arena (Roca), viento a favor (Aire),
// campo eléctrico (Eléctrico) y el agarre que confunde (Lucha), en el núcleo del combate.
import { describe, expect, it } from 'vitest';
import { iniciarCombate, resolverTurno, type Campo, type Evento } from '../src/core/combate';
import { crearCriatura } from '../src/core/criatura';
import { crearRng } from '../src/core/rng';
import type { Criatura, DatosJuego } from '../src/core/modelo';
import { DATOS_COMBATE_PRUEBA } from '../src/data/combate-prueba';

// Un ataque eléctrico de prueba, que los datos de relleno no tienen.
const DATOS: DatosJuego = {
  ...DATOS_COMBATE_PRUEBA,
  movimientos: { ...DATOS_COMBATE_PRUEBA.movimientos, chispazo: { id: 'chispazo', nombre: 'Chispazo', tipo: 'electrico', categoria: 'magico', poder: 40, precision: null, pp: 30 } },
};
const ATACA = { 0: [{ tipo: 'movimiento' as const, indice: 0, objetivo: { lado: 1 as const, hueco: 0 } }] };

function combate(a: Criatura, b: Criatura, campo?: Campo, semilla = 'campo') {
  return iniciarCombate({ equipos: [[a], [b]], formato: 1, salvaje: false, control: ['jugador', 'ia'], rng: crearRng(semilla), experiencia: false, ...(campo ? { campo } : {}) }, DATOS);
}
const criatura = (especie: string, nivel = 20, semilla = 'c') => crearCriatura(DATOS, especie, nivel, crearRng(semilla));

describe('el campo de los gimnasios', () => {
  it('la tormenta de arena hace 1/16 al final del turno, salvo a Roca, Tierra y Acero', () => {
    const agua = criatura('inicial-agua');
    const roca = criatura('inicial-roca');
    let r = combate(agua, roca, { clima: 'arena' });
    expect(r.eventos.some((e) => e.tipo === 'campo')).toBe(true);
    r = resolverTurno(r.estado, ATACA, DATOS);
    const arena = r.eventos.filter((e): e is Extract<Evento, { tipo: 'danio' }> => e.tipo === 'danio' && e.causa === 'arena');
    expect(arena.map((e) => e.ref.lado)).toEqual([0]);
    expect(arena[0].cantidad).toBe(Math.floor(arena[0].vidaMax / 16));
  });

  it('el viento a favor hace que ese lado mueva antes, aunque sea más lento', () => {
    const rapida = criatura('remolino-de-jable', 20);
    const lenta = criatura('inicial-roca', 20);
    const orden = (campo?: Campo) => {
      const r = resolverTurno(combate(rapida, lenta, campo).estado, ATACA, DATOS);
      return r.eventos.filter((e): e is Extract<Evento, { tipo: 'usa' }> => e.tipo === 'usa').map((e) => e.ref.lado);
    };
    expect(orden()[0]).toBe(0);
    expect(orden({ vientoAFavor: 1 })[0]).toBe(1);
  });

  it('el campo eléctrico hace que los ataques eléctricos peguen más', () => {
    const danio = (campo?: Campo) => {
      const a = criatura('inicial-agua');
      a.movimientos = [{ id: 'chispazo', pp: 30 }];
      const r = resolverTurno(combate(a, criatura('inicial-planta'), campo, 'mismo').estado, ATACA, DATOS);
      return r.eventos.find((e): e is Extract<Evento, { tipo: 'danio' }> => e.tipo === 'danio' && e.ref.lado === 1)!.cantidad;
    };
    expect(danio({ terreno: 'electrico' })).toBeGreaterThan(danio());
  });

  it('el agarre deja confusas a tus criaturas al empezar; a veces se hieren y al rato se les pasa', () => {
    let r = combate(criatura('inicial-agua', 30), criatura('inicial-roca', 30), { agarre: true });
    expect(r.eventos.some((e) => e.tipo === 'confuso' && e.inicio && e.ref.lado === 0)).toBe(true);
    const eventos: Evento[] = [];
    for (let i = 0; i < 8 && !r.estado.fin; i++) {
      r = resolverTurno(r.estado, ATACA, DATOS);
      eventos.push(...r.eventos);
    }
    expect(eventos.some((e) => e.tipo === 'desconfusa' && e.ref.lado === 0)).toBe(true);
    // El rival nunca está confuso.
    expect(eventos.some((e) => e.tipo === 'confuso' && e.ref.lado === 1)).toBe(false);
    // En muchos combates, alguna vez se hiere sola.
    let heridas = 0;
    for (let s = 0; s < 30; s++) {
      let q = combate(criatura('inicial-agua', 30), criatura('inicial-roca', 30), { agarre: true }, `agarre-${s}`);
      for (let i = 0; i < 4 && !q.estado.fin; i++) {
        q = resolverTurno(q.estado, ATACA, DATOS);
        heridas += q.eventos.filter((e) => e.tipo === 'seHiere').length;
      }
    }
    expect(heridas).toBeGreaterThan(0);
  });
});
