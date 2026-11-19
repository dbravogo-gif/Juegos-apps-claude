import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leerDistancia, leerTiempo, leerRitmo, formatearTiempo, formatearRitmo, formatearDistancia, editarCarrera, estadoCarrera } from '../src/nucleo/ritmo.js';

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
  assert.equal(leerTiempo('45,30'), 2730); // teclado decimal del móvil
  assert.equal(leerTiempo('1,02,15'), 3735);
  assert.equal(leerTiempo('45:75'), null);
  assert.equal(leerTiempo('1:75:00'), null);
  assert.equal(leerTiempo('abc'), null);
});

test('leer ritmo por km', () => {
  assert.equal(leerRitmo('5:12'), 312);
  assert.equal(leerRitmo('5:12/km'), 312);
  assert.equal(leerRitmo('5'), 300);
  assert.equal(leerRitmo('5,12'), 312);
  assert.equal(leerRitmo('0:30'), null);
  assert.equal(leerRitmo('5:99'), null);
});

test('formatear', () => {
  assert.equal(formatearTiempo(2730), '45:30');
  assert.equal(formatearTiempo(3735), '1:02:15');
  assert.equal(formatearRitmo(312), '5:12');
  assert.equal(formatearDistancia(10.5), '10,5');
  assert.equal(formatearDistancia(42.195), '42,195');
  assert.equal(formatearDistancia(null), '');
});

test('tiempo con horas y con cifras seguidas', () => {
  assert.equal(leerTiempo('1h30'), 5400);
  assert.equal(leerTiempo('1h'), 3600);
  assert.equal(leerTiempo('2h05min'), 7500);
  assert.equal(leerTiempo('4530'), 2730);
  assert.equal(leerTiempo('10215'), 3735);
  assert.equal(leerTiempo('120'), 7200); // hasta 3 cifras son minutos
  assert.equal(leerTiempo('4575'), null);
  assert.equal(leerTiempo('1h75'), null);
  assert.equal(leerRitmo('512'), 312);
  assert.equal(leerRitmo('575'), null);
});

const escribir = (estado, ...pasos) => pasos.reduce((e, [c, v]) => editarCarrera(e, c, v), estado);

test('con dos datos se calcula el tercero', () => {
  let e = escribir(null, ['distancia', 10], ['tiempo', 3000]);
  assert.equal(e.valores.ritmo, 300);
  assert.equal(e.calculado, 'ritmo');
  e = escribir(null, ['distancia', 5], ['ritmo', 300]);
  assert.equal(e.valores.tiempo, 1500);
  e = escribir(null, ['tiempo', 1500], ['ritmo', 300]);
  assert.equal(e.valores.distancia, 5);
});

test('si escribe el tercero, se recalcula otro y se conserva la distancia: nunca quedan tres que no cuadran', () => {
  const e = escribir(null, ['distancia', 10], ['tiempo', 3000], ['ritmo', 270]);
  assert.deepEqual(e.valores, { distancia: 10, tiempo: 2700, ritmo: 270 });
  assert.equal(e.calculado, 'tiempo');
  assert.deepEqual(e.orden, ['distancia', 'ritmo']);
  assert.equal(e.valores.distancia * e.valores.ritmo, e.valores.tiempo);
});

test('cambiar un dato suyo recalcula el calculado', () => {
  const e = escribir(null, ['distancia', 10], ['tiempo', 3000], ['tiempo', 3300]);
  assert.equal(e.valores.ritmo, 330);
  assert.equal(e.valores.distancia, 10);
});

test('si borra un dato, el calculado se borra también', () => {
  const e = escribir(null, ['distancia', 10], ['tiempo', 3000], ['tiempo', null]);
  assert.deepEqual(e.valores, { distancia: 10, tiempo: null, ritmo: null });
  assert.equal(e.calculado, null);
});

test('un resultado imposible no se rellena y se avisa', () => {
  const e = escribir(null, ['distancia', 0.01], ['tiempo', 72 * 3600]);
  assert.equal(e.valores.ritmo, null);
  assert.equal(e.imposible, true);
});

test('estado inicial desde una valoración guardada', () => {
  const e = estadoCarrera({ distancia: 10, tiempo: 3000, ritmo: 300 });
  assert.deepEqual(e.orden, ['distancia', 'tiempo']);
  assert.equal(editarCarrera(e, 'tiempo', 3300).valores.ritmo, 330);
});

test('si corrige la distancia con los tres escritos, se recalcula el más antiguo de los otros', () => {
  const e = escribir(null, ['tiempo', 3000], ['ritmo', 300], ['distancia', 12]);
  assert.deepEqual(e.orden, ['ritmo', 'distancia']);
  assert.equal(e.valores.tiempo, 3600);
});
