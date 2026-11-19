// Los ataques que aprende cada criatura (autor, 2026-11-19): era raro que las iniciales empezaran
// con ataques de su tipo, y la de Roca con dos. Las primeras formas empiezan solo con ataques
// comunes y aprenden los de su tipo a los pocos niveles.
import { describe, expect, it } from 'vitest';
import { crearCriatura } from '../src/core/criatura';
import { MAX_MOVIMIENTOS } from '../src/core/progreso';
import { crearRng } from '../src/core/rng';
import { DATOS_COMBATE_PRUEBA as DATOS, ESPECIE_INICIAL } from '../src/data/combate-prueba';

const especies = Object.values(DATOS.especies);
const evolucionadas = new Set(especies.flatMap((e) => (e.evoluciona ?? []).map((ev) => ev.a)));
const primeras = especies.filter((e) => !evolucionadas.has(e.id));

describe('ataques que se aprenden', () => {
  it('las primeras formas empiezan con ataques comunes (y al menos uno que hace daño)', () => {
    for (const e of primeras) {
      const delPrincipio = e.aprende.filter((a) => a.nivel === 1).map((a) => DATOS.movimientos[a.movimiento]);
      const conDanio = delPrincipio.filter((m) => m.categoria !== 'estado');
      expect(conDanio.length, e.id).toBeGreaterThan(0);
      for (const m of conDanio) expect(m.tipo, `${e.id}: ${m.id}`).toBe('comun');
    }
  });

  it('ninguna aprende más de cuatro: aún no hay pantalla para olvidar uno', () => {
    for (const e of especies) expect(new Set(e.aprende.map((a) => a.movimiento)).size, e.id).toBeLessThanOrEqual(MAX_MOVIMIENTOS);
  });

  it('las iniciales aprenden el de su tipo al 7, antes del gimnasio de Roca (aprendices al 9)', () => {
    for (const id of Object.values(ESPECIE_INICIAL)) {
      const e = DATOS.especies[id];
      const aLos5 = crearCriatura(DATOS, id, 5, crearRng(1)).movimientos.map((m) => DATOS.movimientos[m.id].tipo);
      expect(aLos5.every((t) => t === 'comun'), id).toBe(true);
      const aLos7 = crearCriatura(DATOS, id, 7, crearRng(1)).movimientos.map((m) => DATOS.movimientos[m.id].tipo);
      expect(aLos7, id).toContain(e.tipos[0]);
    }
  });
});
