// Los ataques que aprende cada criatura (autor, 2026-11-19): era raro que las iniciales empezaran
// con ataques de su tipo, y la de Roca con dos. Las primeras formas empiezan solo con ataques
// comunes y aprenden los de su tipo a los pocos niveles: entre el 7 y el 9 (autor, 2026-11-26, D1).
// La excepción, Cronti, la de Agua: empieza con Chapoteo, flojo (30), para poder ganar su primer
// combate contra la de Roca.
import { describe, expect, it } from 'vitest';
import { crearCriatura } from '../src/core/criatura';
import { MAX_MOVIMIENTOS } from '../src/core/progreso';
import { crearRng } from '../src/core/rng';
import { DATOS_COMBATE_PRUEBA as DATOS, ESPECIE_INICIAL } from '../src/data/combate-prueba';

const especies = Object.values(DATOS.especies);
const evolucionadas = new Set(especies.flatMap((e) => (e.evoluciona ?? []).map((ev) => ev.a)));
const primeras = especies.filter((e) => !evolucionadas.has(e.id));
/** Los ataques de tipo que se permiten desde el principio, por especie (autor, 2026-11-26). */
const DESDE_EL_PRINCIPIO: Record<string, string> = { 'inicial-agua': 'chapoteo' };

describe('ataques que se aprenden', () => {
  it('las primeras formas empiezan con ataques comunes (y al menos uno que hace daño)', () => {
    for (const e of primeras) {
      const delPrincipio = e.aprende.filter((a) => a.nivel === 1).map((a) => DATOS.movimientos[a.movimiento]);
      const conDanio = delPrincipio.filter((m) => m.categoria !== 'estado');
      expect(conDanio.length, e.id).toBeGreaterThan(0);
      for (const m of conDanio) {
        if (DESDE_EL_PRINCIPIO[e.id] === m.id) expect(m.poder, `${e.id}: ${m.id}, flojo`).toBeLessThanOrEqual(30);
        else expect(m.tipo, `${e.id}: ${m.id}`).toBe('comun');
      }
    }
  });

  it('ninguna aprende más de cuatro: aún no hay pantalla para olvidar uno', () => {
    for (const e of especies) expect(new Set(e.aprende.map((a) => a.movimiento)).size, e.id).toBeLessThanOrEqual(MAX_MOVIMIENTOS);
  });

  it('las iniciales aprenden su primer ataque de tipo entre el 7 y el 9, antes del gimnasio de Roca', () => {
    for (const id of Object.values(ESPECIE_INICIAL)) {
      const e = DATOS.especies[id];
      const deTipo = e.aprende.filter((a) => DATOS.movimientos[a.movimiento].tipo === e.tipos[0] && DESDE_EL_PRINCIPIO[id] !== a.movimiento);
      const primero = Math.min(...deTipo.map((a) => a.nivel));
      expect(primero, id).toBeGreaterThanOrEqual(7);
      expect(primero, id).toBeLessThanOrEqual(9);
      const aLos9 = crearCriatura(DATOS, id, 9, crearRng(1)).movimientos.map((m) => DATOS.movimientos[m.id].tipo);
      expect(aLos9, id).toContain(e.tipos[0]);
    }
  });
});
