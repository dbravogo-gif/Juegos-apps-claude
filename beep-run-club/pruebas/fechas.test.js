import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esFecha, sumarDias, diaSemana, lunesDe, diasDeSemana, rangoSemana, fechaLarga, etiquetaDia, diferenciaDias, formatear } from '../src/nucleo/fechas.js';

test('esFecha rechaza fechas imposibles y formatos raros', () => {
  assert.equal(esFecha('2026-11-19'), true);
  assert.equal(esFecha('2028-02-29'), true);
  assert.equal(esFecha('2026-02-29'), false);
  assert.equal(esFecha('2026-13-01'), false);
  assert.equal(esFecha('2026-1-1'), false);
  assert.equal(esFecha(null), false);
});

test('sumarDias cruza meses y años', () => {
  assert.equal(sumarDias('2026-11-30', 1), '2026-12-01');
  assert.equal(sumarDias('2026-12-31', 1), '2027-01-01');
  assert.equal(sumarDias('2026-03-01', -1), '2026-02-28');
  assert.equal(diferenciaDias('2026-12-28', '2027-01-04'), 7);
});

test('las semanas van de lunes a domingo', () => {
  assert.equal(diaSemana('2026-11-16'), 0); // lunes
  assert.equal(diaSemana('2026-11-22'), 6); // domingo
  assert.equal(lunesDe('2026-11-22'), '2026-11-16');
  assert.equal(lunesDe('2026-11-16'), '2026-11-16');
  assert.equal(lunesDe('2027-01-01'), '2026-12-28');
  assert.deepEqual(diasDeSemana('2026-11-16').slice(-1), ['2026-11-22']);
});

test('textos de fechas en español', () => {
  assert.equal(rangoSemana('2026-11-16'), '16 – 22 NOV');
  assert.equal(rangoSemana('2026-12-28'), '28 DIC – 3 ENE');
  assert.equal(fechaLarga('2026-11-19'), 'jueves 19 de noviembre');
  assert.deepEqual(etiquetaDia('2026-11-21'), { corto: 'SÁB', num: 21, mes: 'NOV' });
  assert.equal(formatear(2026, 3, 7), '2026-03-07');
});
