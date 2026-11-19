import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prefijo, generarCodigo, normalizarCodigo, esCodigo, generarId, ALFABETO } from '../src/nucleo/codigos.js';
import { conSemilla } from '../src/nucleo/azar.js';

test('el prefijo sale del nombre, sin tildes ni símbolos', () => {
  assert.equal(prefijo('Laura Gómez'), 'LAURA');
  assert.equal(prefijo('Ñoño'), 'NONO');
  assert.equal(prefijo('Maximiliano'), 'MAXIMILI');
  assert.equal(prefijo('  '), 'BEEP');
  assert.equal(prefijo('123'), 'BEEP');
});

test('los códigos son deterministas con semilla y válidos', () => {
  const a = generarCodigo('Laura', conSemilla(7));
  const b = generarCodigo('Laura', conSemilla(7));
  assert.equal(a, b);
  assert.ok(esCodigo(a), a);
  assert.match(a, /^LAURA-.{6}$/);
  for (const c of a.slice(6)) assert.ok(ALFABETO.includes(c));
});

test('no se repiten en 2000 códigos seguidos', () => {
  const rng = conSemilla(1);
  const vistos = new Set(Array.from({ length: 2000 }, () => generarCodigo('Ana', rng)));
  assert.equal(vistos.size, 2000);
});

test('normalizar lo que teclea el atleta', () => {
  assert.equal(normalizarCodigo(' laura-7k3qxp '), 'LAURA-7K3QXP');
  assert.equal(normalizarCodigo('laura 7k3qxp'), 'LAURA-7K3QXP');
  assert.equal(normalizarCodigo('LAURA7K3QXP'), 'LAURA-7K3QXP');
  assert.equal(normalizarCodigo('LAURA-7K3QX'), null);
  assert.equal(normalizarCodigo('LAURA-0O1IL2'), null); // caracteres que no se usan
  assert.equal(normalizarCodigo(''), null);
});

test('generarId da 16 caracteres', () => {
  assert.match(generarId(conSemilla(3)), /^[a-z2-9]{16}$/);
});
