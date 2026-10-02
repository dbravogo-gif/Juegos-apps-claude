import test from 'node:test';
import assert from 'node:assert/strict';
import { recordatorioCopia, estadoInicial } from '../src/data/storage.js';

const conDias = (n, extra = {}) => {
  const db = { ...estadoInicial(), ...extra };
  for (let i = 1; i <= n; i += 1) db.dias[`2026-09-${String(i).padStart(2, '0')}`] = {};
  return db;
};

test('con pocos días registrados no se pide copia', () => {
  assert.equal(recordatorioCopia(conDias(3), '2026-10-01').toca, false);
});

test('sin ninguna copia y con historial, se pide', () => {
  assert.deepEqual(recordatorioCopia(conDias(10), '2026-10-01'), { toca: true, dias: null });
});

test('una copia reciente calla el aviso y una vieja lo vuelve a sacar', () => {
  assert.equal(recordatorioCopia(conDias(10, { ultimaCopia: '2026-09-25' }), '2026-10-01').toca, false);
  assert.deepEqual(recordatorioCopia(conDias(10, { ultimaCopia: '2026-09-10' }), '2026-10-01'), { toca: true, dias: 21 });
});

test('posponer calla el aviso una semana', () => {
  const db = conDias(10, { copiaPospuesta: '2026-09-28' });
  assert.equal(recordatorioCopia(db, '2026-10-01').toca, false);
  assert.equal(recordatorioCopia(db, '2026-10-05').toca, true);
});
