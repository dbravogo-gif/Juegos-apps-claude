import test from 'node:test';
import assert from 'node:assert/strict';
import { accionDespacho } from '../src/core/sim.js';
import { resumirAmenazas } from '../src/core/riesgo.js';

const estado = (consulta = 'anormal') => ({ ajustes: { consulta } });
const avion = (averias = []) => ({ averias, averiasAutorizadas: '' });
const ctx = ({ irregularidades = [], averias = [] } = {}) => ({ irregularidades, despachoIrregular: irregularidades.length > 0, avion: avion(averias) });
const niebla = { id: 'bajoMinimos', origen: 'meteo', p: 1, esc: 0.01, motivo: 'Niebla en TFN, por debajo de mínimos' };
const tormenta = { id: 'tormentaDestino', origen: 'meteo', p: 0.25, esc: 0, motivo: 'Tormenta en TFN' };
const est = (...lista) => resumirAmenazas(lista);
const minimos = { codigo: 'minimos', texto: 'Previsión en TFN por debajo de los mínimos' };

test('despacho: sin reglas propias se comporta como antes', () => {
  assert.equal(accionDespacho(estado(), ctx(), est()), 'salir');
  assert.equal(accionDespacho(estado(), ctx(), est(tormenta)), 'preguntar');
  assert.equal(accionDespacho(estado('nunca'), ctx(), est(tormenta)), 'salirExtra');
  assert.equal(accionDespacho(estado('nunca'), ctx({ irregularidades: [minimos] }), est(niebla)), 'retrasar');
  assert.equal(accionDespacho(estado(), ctx({ irregularidades: [{ codigo: 'revisionA', texto: 'Revisión A vencida' }] }), est()), 'preguntar');
});

test('despacho: las reglas de la ruta deciden sin preguntar', () => {
  assert.equal(accionDespacho(estado(), ctx(), est(tormenta), { meteo: 'salir' }), 'salir');
  assert.equal(accionDespacho(estado(), ctx(), est(tormenta), { meteo: 'salirExtra' }), 'salirExtra');
  assert.equal(accionDespacho(estado(), ctx({ irregularidades: [minimos] }), est(niebla), { bajoMinimos: 'salir' }), 'salirExtra');
  assert.equal(accionDespacho(estado(), ctx({ irregularidades: [minimos] }), est(niebla), { bajoMinimos: 'cancelar' }), 'cancelar');
  // «En cada vuelo» no pisa a una ruta con reglas propias.
  assert.equal(accionDespacho(estado('siempre'), ctx(), est(tormenta), { meteo: 'salir' }), 'salir');
});

test('despacho: si se juntan dos situaciones gana la más prudente', () => {
  const ojo = [{ id: 1, fase: 'anomalia' }];
  assert.equal(accionDespacho(estado(), ctx({ averias: ojo }), est(tormenta), { meteo: 'salir' }), 'preguntar');
  assert.equal(accionDespacho(estado(), ctx({ averias: ojo }), est(tormenta), { meteo: 'salir', averias: 'salir' }), 'salir');
  assert.equal(accionDespacho(estado(), ctx({ irregularidades: [minimos] }), est(niebla, tormenta), { bajoMinimos: 'salir', meteo: 'retrasar' }), 'retrasar');
  const vencida = { codigo: 'revisionC', texto: 'Revisión C vencida' };
  assert.equal(accionDespacho(estado(), ctx({ irregularidades: [vencida] }), est(), { fueraNorma: 'cancelar' }), 'cancelar');
});

test('informes: se pagan, el de mercado caduca y la base se conoce gratis', async () => {
  const { nuevaPartida, informesDe, comprarInforme, precioInforme } = await import('../src/core/sim.js');
  const e = nuevaPartida({ nombre: 'Prueba', base: 'LPA' });
  assert.deepEqual([informesDe(e, 'LPA').clima, informesDe(e, 'LPA').mercado], [true, true]);
  assert.deepEqual([informesDe(e, 'TFN').clima, informesDe(e, 'TFN').mercado], [false, false]);
  const caja = e.caja;
  assert.equal(comprarInforme(e, 'TFN', 'ambos'), null);
  assert.equal(caja - e.caja, precioInforme(e, 'ambos'));
  assert.ok(precioInforme(e, 'ambos') < precioInforme(e, 'clima') + precioInforme(e, 'mercado'));
  assert.deepEqual([informesDe(e, 'TFN').clima, informesDe(e, 'TFN').mercado], [true, true]);
  e.t += 366 * 1440;
  assert.deepEqual([informesDe(e, 'TFN').clima, informesDe(e, 'TFN').mercado], [true, false]);
  e.caja = 10;
  assert.equal(comprarInforme(e, 'MAD', 'clima'), 'No tienes caja suficiente');
});
