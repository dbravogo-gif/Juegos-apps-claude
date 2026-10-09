import test from 'node:test';
import assert from 'node:assert/strict';
import { hitosNuevos } from '../src/core/hitos.js';
import { pilotoDe } from '../src/data/pilotos.js';

const base = () => ({ t: 480, aviones: [] });

test('hitos: cada uno sale una sola vez y en su momento', () => {
  const e = base();
  assert.deepEqual(hitosNuevos(e), []);
  e.aviones.push({ tipo: 'f27', estado: 'vuelo' });
  assert.deepEqual(hitosNuevos(e), ['primer-vuelo']);
  assert.deepEqual(hitosNuevos(e), []);
  e.aviones.push({ tipo: 'b747', estado: 'tierra' });
  assert.deepEqual(hitosNuevos(e), ['largo-radio']);
  e.t += 10 * 365 * 1440;
  assert.deepEqual(hitosNuevos(e), ['aniversario-10']);
});

test('pilotos: solo los conocidos', () => {
  assert.equal(pilotoDe('pinar').nombre, 'Pinar');
  assert.equal(pilotoDe('toString'), null);
  assert.equal(pilotoDe(undefined), null);
});
