import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarSesion, agruparPorDia, copiarSemana, nombresUsados } from '../src/nucleo/plan.js';
import { validarRegistro, estadoSesion, esDura } from '../src/nucleo/registro.js';

const sesion = {
  id: 's1', fecha: '2026-11-17', titulo: ' Series cortas ', nota: '',
  ejercicios: [
    { id: 'e1', nombre: 'Calentamiento', detalle: '15 min suave', carrera: true },
    { id: 'e2', nombre: 'Skipping', detalle: '3 × 20 m' },
    { id: 'e3', nombre: 'Series', detalle: '6 × 400 m', carrera: true },
  ],
};

test('validar una sesión la limpia', () => {
  const r = validarSesion(sesion);
  assert.equal(r.ok, true, r.errores.join(' '));
  assert.equal(r.sesion.titulo, 'Series cortas');
  assert.equal(r.sesion.ejercicios[1].carrera, false);
});

test('una sesión sin título, sin ejercicios o con fecha mala no vale', () => {
  const r = validarSesion({ id: 'x', fecha: '2026-02-30', titulo: '', ejercicios: [] });
  assert.equal(r.ok, false);
  assert.equal(r.errores.length, 3);
  assert.equal(validarSesion(null).ok, false);
  const dup = validarSesion({ ...sesion, ejercicios: [sesion.ejercicios[0], sesion.ejercicios[0]] });
  assert.equal(dup.ok, false);
});

test('agrupar por día da siempre 7 días', () => {
  const dias = agruparPorDia([sesion, { ...sesion, id: 's2', fecha: '2026-11-20', titulo: 'Rodaje' }], '2026-11-16');
  assert.equal(dias.length, 7);
  assert.equal(dias[1].sesiones[0].id, 's1');
  assert.equal(dias[4].sesiones[0].id, 's2');
  assert.equal(dias[0].sesiones.length, 0);
});

test('copiar una semana mueve las fechas y da ids nuevos', () => {
  let n = 0;
  const fuera = { ...sesion, id: 'fuera', fecha: '2026-11-24' };
  const copia = copiarSemana([sesion, fuera], '2026-11-16', '2026-11-23', () => `n${++n}`);
  assert.equal(copia.length, 1);
  assert.equal(copia[0].fecha, '2026-11-24');
  assert.equal(copia[0].id, 'n1');
  assert.deepEqual(copia[0].ejercicios.map((e) => e.id), ['n2', 'n3', 'n4']);
  assert.equal(sesion.id, 's1'); // el original no cambia
});

test('nombres usados sin repetir', () => {
  const nombres = nombresUsados([sesion, { ...sesion, ejercicios: [{ id: 'z', nombre: 'series', carrera: true }] }]);
  assert.deepEqual(nombres.map((x) => x.nombre), ['Calentamiento', 'Series', 'Skipping']);
});

test('valoración: esfuerzo obligatorio y se descarta lo que no es de la sesión', () => {
  const r = validarRegistro({
    hechos: ['e1', 'e2', 'e2', 'otro'], esfuerzo: 7, duros: ['e3', 'nada'],
    carrera: { e3: { distancia: 2.4, tiempo: 600, ritmo: 250 }, e2: { distancia: 1 } },
    comentario: '  bien  ',
  }, sesion);
  assert.equal(r.ok, true, r.errores.join(' '));
  assert.deepEqual(r.registro.hechos, ['e1', 'e2']);
  assert.deepEqual(r.registro.duros, ['e3']);
  assert.deepEqual(Object.keys(r.registro.carrera), ['e3']);
  assert.equal(r.registro.comentario, 'bien');
  assert.equal(validarRegistro({ esfuerzo: 0 }, sesion).ok, false);
  assert.equal(validarRegistro({ esfuerzo: 7.5 }, sesion).ok, false);
  assert.equal(validarRegistro({ esfuerzo: 5, carrera: { e1: { ritmo: 10 } } }, sesion).ok, false);
});

test('estado y dureza de una sesión', () => {
  assert.equal(estadoSesion(sesion, null), 'pendiente');
  assert.equal(estadoSesion(sesion, { hechos: ['e1'] }), 'parcial');
  assert.equal(estadoSesion(sesion, { hechos: ['e1', 'e2', 'e3'] }), 'hecha');
  assert.equal(esDura({ esfuerzo: 9, duros: [] }), true);
  assert.equal(esDura({ esfuerzo: 6, duros: ['e1'] }), true);
  assert.equal(esDura({ esfuerzo: 6, duros: [] }), false);
});
