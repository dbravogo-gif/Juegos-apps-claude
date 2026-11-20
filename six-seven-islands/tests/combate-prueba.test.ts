// El primer combate: cada inicial contra la de su amigo termina. Al nivel 5 solo tienen ataques
// comunes; al 7 aprenden el de su tipo, que es muy eficaz contra la de su amigo.

import { describe, expect, it } from 'vitest';
import { iniciarCombate, resolverTurno, type Evento } from '../src/core/combate';
import { crearCriatura } from '../src/core/criatura';
import { crearRng } from '../src/core/rng';
import { eficacia } from '../src/core/tipos';
import { DATOS_COMBATE_PRUEBA as DATOS, ESPECIE_INICIAL, MODELO_DE, RIVAL_DE } from '../src/data/combate-prueba';
import { MODELO_INICIAL } from '../src/arte/criaturas3d';

describe('combate de prueba', () => {
  for (const inicial of Object.keys(ESPECIE_INICIAL)) {
    it(`${inicial} contra ${RIVAL_DE[inicial]}: termina, y al 7 su ataque de tipo es muy eficaz`, () => {
      // Cada inicial tiene modelo; la de Tierra, provisional en combate hasta que llegue el suyo.
      expect(MODELO_INICIAL[inicial] ?? (inicial === 'tierra' ? MODELO_DE[ESPECIE_INICIAL[inicial]] : undefined)).toBeDefined();
      const rng = crearRng(`prueba-${inicial}`);
      const a = crearCriatura(DATOS, ESPECIE_INICIAL[inicial], 5, rng);
      const b = crearCriatura(DATOS, ESPECIE_INICIAL[RIVAL_DE[inicial]], 5, rng);
      expect(a.movimientos).toHaveLength(2);
      let r = iniciarCombate({ equipos: [[a], [b]], formato: 1, salvaje: false, control: ['jugador', 'ia'], rng, experiencia: false }, DATOS);
      const eventos: Evento[] = [...r.eventos];
      for (let turno = 0; turno < 60 && !r.estado.fin; turno++) {
        r = resolverTurno(r.estado, { 0: [{ tipo: 'movimiento', indice: 0, objetivo: { lado: 1, hueco: 0 } }] }, DATOS);
        eventos.push(...r.eventos);
      }
      expect(r.estado.fin).not.toBeNull();
      // El evento «usa» trae el id del movimiento, no su nombre: la pantalla busca el nombre.
      for (const e of eventos) if (e.tipo === 'usa') expect(DATOS.movimientos[e.movimiento], e.movimiento).toBeDefined();
      expect(eventos.some((e) => e.tipo === 'danio' && e.ref.lado === 1)).toBe(true);
      const deTipo = crearCriatura(DATOS, ESPECIE_INICIAL[inicial], 7, rng).movimientos.map((m) => DATOS.movimientos[m.id]).find((m) => m.tipo !== 'comun')!;
      expect(eficacia(DATOS.tipos, deTipo.tipo, DATOS.especies[b.especie].tipos)).toBeGreaterThan(1);
    });
  }

  it('la inicial de fuego llega al gimnasio de Roca (aprendices al 9) con algo que hace ×2 a la Roca: un ataque flojo de Acero', () => {
    const c = crearCriatura(DATOS, ESPECIE_INICIAL.infernal, 9, crearRng(1));
    const contraRoca = c.movimientos.map((m) => DATOS.movimientos[m.id]).filter((m) => eficacia(DATOS.tipos, m.tipo, ['roca']) > 1);
    expect(contraRoca.map((m) => m.tipo)).toEqual(['acero']);
    expect(contraRoca[0].poder).toBeLessThanOrEqual(40);
  });
});
