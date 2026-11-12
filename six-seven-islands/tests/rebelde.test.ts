// La inicial rebelde (F25): desobedece cerca del 45 % de sus turnos, nada si no es rebelde, y con
// la misma semilla pasa lo mismo.
import { describe, expect, it } from 'vitest';
import { iniciarCombate, resolverTurno, PROB_DESOBEDIENCIA, type Evento } from '../src/core/combate';
import { crearCriatura } from '../src/core/criatura';
import { crearRng } from '../src/core/rng';
import { DATOS_COMBATE_PRUEBA as D } from '../src/data/combate-prueba';

/** Un turno con la inicial atacando a una rival de su nivel: ninguna cae de un golpe y las dos actúan. */
function turno(semilla: number, rebelde: boolean): Evento[] {
  const rng = crearRng(semilla);
  const inicial = crearCriatura(D, 'inicial-agua', 5, rng);
  const rival = crearCriatura(D, 'inicial-roca', 5, rng);
  const r = iniciarCombate({ equipos: [[inicial], [rival]], formato: 1, salvaje: true, control: ['jugador', 'ia'], rng, experiencia: false, rebeldes: rebelde ? [inicial.uid] : [] }, D);
  return resolverTurno(r.estado, { 0: [{ tipo: 'movimiento', indice: 0, objetivo: { lado: 1, hueco: 0 } }] }, D).eventos;
}

describe('inicial rebelde', () => {
  it('desobedece cerca del 45 % de sus turnos, a veces con otro movimiento y a veces sin hacer nada', () => {
    let no = 0;
    let otro = 0;
    const n = 3000;
    for (let i = 0; i < n; i++) {
      const d = turno(i, true).find((e) => e.tipo === 'desobedece');
      if (d) {
        no++;
        if (d.tipo === 'desobedece' && d.como === 'otro') otro++;
      }
    }
    expect(no / n).toBeGreaterThan(PROB_DESOBEDIENCIA / 100 - 0.03);
    expect(no / n).toBeLessThan(PROB_DESOBEDIENCIA / 100 + 0.03);
    expect(otro).toBeGreaterThan(no * 0.35);
    expect(otro).toBeLessThan(no * 0.65);
  });

  it('si no es rebelde (tras el anciano), obedece siempre', () => {
    for (let i = 0; i < 500; i++) expect(turno(i, false).some((e) => e.tipo === 'desobedece')).toBe(false);
  });

  it('con la misma semilla pasa lo mismo', () => {
    for (let i = 0; i < 50; i++) expect(turno(i, true)).toEqual(turno(i, true));
  });
});
