import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leerDistancia, leerTiempo, leerRitmo, formatearTiempo, formatearRitmo, formatearDistancia, completar } from '../src/nucleo/ritmo.js';

test('leer distancia con coma, punto, km o metros', () => {
  assert.equal(leerDistancia('10,5'), 10.5);
  assert.equal(leerDistancia(' 10.5 km '), 10.5);
  assert.equal(leerDistancia('800 m'), 0.8);
  assert.equal(leerDistancia(''), null);
  assert.equal(leerDistancia('diez'), null);
  assert.equal(leerDistancia('0'), null);
  assert.equal(leerDistancia('900'), null);
});

test('leer tiempo en minutos, mm:ss o h:mm:ss', () => {
  assert.equal(leerTiempo('45'), 2700);
  assert.equal(leerTiempo('45:30'), 2730);
  assert.equal(leerTiempo('1:02:15'), 3735);
  assert.equal(leerTiempo("45'30"), 2730);
  assert.equal(leerTiempo('45:75'), null);
  assert.equal(leerTiempo('1:75:00'), null);
  assert.equal(leerTiempo('abc'), null);
});

test('leer ritmo por km', () => {
  assert.equal(leerRitmo('5:12'), 312);
  assert.equal(leerRitmo('5:12/km'), 312);
  assert.equal(leerRitmo('5'), 300);
  assert.equal(leerRitmo('0:30'), null);
  assert.equal(leerRitmo('5:99'), null);
});

test('formatear', () => {
  assert.equal(formatearTiempo(2730), '45:30');
  assert.equal(formatearTiempo(3735), '1:02:15');
  assert.equal(formatearRitmo(312), '5:12');
  assert.equal(formatearDistancia(10.5), '10,5');
  assert.equal(formatearDistancia(null), '');
});

test('con dos valores se calcula el tercero', () => {
  let r = completar({ distancia: 10, tiempo: 3000 });
  assert.equal(r.valores.ritmo, 300);
  assert.equal(r.calculado, 'ritmo');
  r = completar({ distancia: 5, ritmo: 300 });
  assert.equal(r.valores.tiempo, 1500);
  r = completar({ tiempo: 1500, ritmo: 300 });
  assert.equal(r.valores.distancia, 5);
});

test('si el atleta cambia un dato se recalcula el calculado, no lo suyo', () => {
  let r = completar({ distancia: 10, tiempo: 3000 });
  r = completar({ ...r.valores, tiempo: 3300 }, r.calculado);
  assert.equal(r.valores.ritmo, 330);
  assert.equal(r.valores.distancia, 10);
});

test('si borra un dato, el calculado se borra también', () => {
  let r = completar({ distancia: 10, tiempo: 3000 });
  r = completar({ ...r.valores, tiempo: null }, r.calculado);
  assert.deepEqual(r.valores, { distancia: 10, tiempo: null, ritmo: null });
  assert.equal(r.calculado, null);
});

test('un resultado imposible no se rellena', () => {
  const r = completar({ distancia: 0.01, tiempo: 72 * 3600 });
  assert.equal(r.valores.ritmo, null);
});
