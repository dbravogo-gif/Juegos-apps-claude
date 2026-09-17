import test from 'node:test';
import assert from 'node:assert/strict';

import { construirHistorial, planDelDia, diaDeLaSemana, evaluarDia, esEditable } from '../src/data/history.js';
import { estadoInicial, migrar, importar, exportar, VERSION_ESQUEMA } from '../src/data/storage.js';
import { clasificarEntreno } from '../src/core/scoring/streaks.js';

// 2026-09-14 es lunes.
test('la semana del plan empieza en lunes', () => {
  assert.equal(diaDeLaSemana('2026-09-14'), 0);
  assert.equal(diaDeLaSemana('2026-09-20'), 6);
});

test('el plan decide si un día se exige o es descanso', () => {
  const plan = { diasEntreno: [0, 1, 3, 4] };
  assert.equal(planDelDia(plan, '2026-09-14'), 'entreno');
  assert.equal(planDelDia(plan, '2026-09-16'), 'descanso');
});

test('los días sin abrir la app se rellenan y cuentan como fallados', () => {
  const db = {
    plan: { diasEntreno: [0, 1, 2, 3, 4, 5, 6] },
    dias: {
      '2026-09-14': { ejercicios: [{ id: 'a', importancia: 'principal', estado: 'completado' }] },
    },
  };

  const historial = construirHistorial(db, '2026-09-18');
  assert.equal(historial.length, 5);
  assert.equal(historial[0].fecha, '2026-09-14');
  assert.equal(historial[4].fecha, '2026-09-18');

  assert.equal(clasificarEntreno(historial[0]), 'cumplido');
  assert.equal(clasificarEntreno(historial[1]), 'fallado', 'el hueco debe contar como fallado');
});

test('un hueco en un día de descanso no penaliza', () => {
  const db = {
    plan: { diasEntreno: [0] },
    dias: { '2026-09-14': { ejercicios: [{ id: 'a', importancia: 'principal', estado: 'completado' }] } },
  };
  const historial = construirHistorial(db, '2026-09-16');
  assert.equal(clasificarEntreno(historial[2]), 'no_exigido');
});

test('un historial sin registros no produce días', () => {
  const db = { plan: { diasEntreno: [0] }, dias: {} };
  assert.deepEqual(construirHistorial(db, '2026-09-16'), [
    { fecha: '2026-09-16', planEntreno: 'descanso', entreno: null, comida: null, extras: [] },
  ]);
});

test('evaluarDia puntúa ejercicios y comidas del registro', () => {
  const registro = {
    ejercicios: [
      { id: 'a', importancia: 'principal', estado: 'completado' },
      { id: 'b', importancia: 'secundario', estado: 'omitido' },
    ],
    comidas: [{ id: 'c1', estado: 'completo' }, { id: 'c2', estado: 'incumplido' }],
  };
  const dia = evaluarDia(registro, 'entreno', '2026-09-16');
  assert.equal(dia.entreno.cumplimiento, 3 / 5);
  assert.equal(dia.comida.puntuacion, 0.5);
});

test('el registro puede sobreescribir el plan de ese día', () => {
  const dia = evaluarDia({ planEntreno: 'descanso' }, 'entreno', '2026-09-16');
  assert.equal(dia.planEntreno, 'descanso');
});

test('un documento desconocido se migra al esquema actual sin perder datos', () => {
  const antiguo = { dias: { '2026-09-14': {} }, monedasGastadas: 30 };
  const migrado = migrar(antiguo);

  assert.equal(migrado.version, VERSION_ESQUEMA);
  assert.equal(migrado.monedasGastadas, 30);
  assert.deepEqual(Object.keys(migrado.dias), ['2026-09-14']);
  assert.ok(Array.isArray(migrado.plan.diasEntreno), 'los campos nuevos reciben su valor por defecto');
});

test('la copia de seguridad va y vuelve', () => {
  const db = { ...estadoInicial(), monedasGastadas: 55 };
  const resultado = importar(exportar(db));

  assert.equal(resultado.ok, true);
  assert.equal(resultado.db.monedasGastadas, 55);
});

test('una copia corrupta se rechaza en lugar de romper la app', () => {
  assert.equal(importar('no es json').motivo, 'json');
  assert.equal(importar('{"algo":1}').motivo, 'formato');
});

test('explotación: solo se puede registrar hoy y ayer', () => {
  assert.equal(esEditable('2026-09-16', '2026-09-16'), true);
  assert.equal(esEditable('2026-09-15', '2026-09-16'), true);
  assert.equal(esEditable('2026-09-14', '2026-09-16'), false, 'no se rellenan semanas a posteriori');
  assert.equal(esEditable('2026-09-17', '2026-09-16'), false, 'ni se registra el futuro');
});

// --- Rutina y dieta planificadas ---

const RUTINA = {
  id: 'r',
  nombre: 'Torso',
  ejercicios: [
    { id: 'a', nombre: 'Press', importancia: 'principal', series: 3 },
    { id: 'b', nombre: 'Remo', importancia: 'principal', series: 3 },
    { id: 'c', nombre: 'Curl', importancia: 'secundario', series: 3 },
  ],
};

const dbConRutina = (dias) => ({
  plan: { diasEntreno: [0], rutinaPorDia: { 0: 'r' }, comidasPorDia: {} },
  rutinas: [RUTINA],
  dias,
});

test('explotación: registrar solo un ejercicio no firma la sesión entera', () => {
  const registro = { ejercicios: [{ id: 'c', importancia: 'secundario', estado: 'completado' }] };
  const db = dbConRutina({ '2026-09-14': registro });

  const abierto = evaluarDia(registro, 'entreno', '2026-09-14', { db, hoy: '2026-09-14' });
  assert.equal(abierto.entreno.cumplimiento, 1, 'mientras el día sigue abierto no se le da por omitido');

  const cerrado = evaluarDia(registro, 'entreno', '2026-09-14', { db, hoy: '2026-09-15' });
  assert.ok(cerrado.entreno.cumplimiento < 0.3, `firmó ${cerrado.entreno.cumplimiento} haciendo un ejercicio de tres`);
});

test('las comidas del día salen del plan semanal aunque no se haya tocado nada', () => {
  const db = {
    plan: { diasEntreno: [], comidasPorDia: { 0: ['Desayuno', 'Comida', 'Cena'] } },
    rutinas: [],
    dias: {},
  };

  const dia = evaluarDia(undefined, 'descanso', '2026-09-14', { db, hoy: '2026-09-14' });
  assert.equal(dia.comida.puntuacion, null, 'sin marcar nada el día abierto no puntúa');

  const marcado = { comidas: [{ id: 'p0', nombre: 'Desayuno', estado: 'completo' }] };
  const parcial = evaluarDia(marcado, 'descanso', '2026-09-14', { db, hoy: '2026-09-15' });
  assert.equal(parcial.comida.comidasComputadas, 1, 'al cerrar solo cuenta lo que quedó guardado');
});

test('editar la rutina no borra lo que ya se registró de un ejercicio retirado', () => {
  const registro = {
    ejercicios: [
      { id: 'a', importancia: 'principal', estado: 'completado' },
      { id: 'viejo', importancia: 'secundario', estado: 'completado' },
    ],
  };
  const db = dbConRutina({ '2026-09-14': registro });
  const dia = evaluarDia(registro, 'entreno', '2026-09-14', { db, hoy: '2026-09-14' });

  assert.equal(dia.entreno.pesoTotal, 3 + 2, 'el ejercicio fuera de rutina sigue contando');
});
