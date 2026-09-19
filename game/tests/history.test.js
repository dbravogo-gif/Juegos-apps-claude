import test from 'node:test';
import assert from 'node:assert/strict';

import { construirHistorial, tipoDeSesion, diaDeLaSemana, evaluarDia, esEditable } from '../src/data/history.js';
import { estadoInicial, migrar, importar, exportar, VERSION_ESQUEMA } from '../src/data/storage.js';
import { clasificarEntreno } from '../src/core/scoring/streaks.js';
import { UMBRAL_DIA_CUMPLIDO } from '../src/core/constants.js';

// 2026-09-14 es lunes.
test('la semana empieza en lunes', () => {
  assert.equal(diaDeLaSemana('2026-09-14'), 0);
  assert.equal(diaDeLaSemana('2026-09-20'), 6);
});

test('la sesión del día sale de lo que se eligió, no del calendario', () => {
  assert.equal(tipoDeSesion(undefined), 'sin_decidir');
  assert.equal(tipoDeSesion({}), 'sin_decidir');
  assert.equal(tipoDeSesion({ sesion: 'descanso' }), 'descanso');
  assert.equal(tipoDeSesion({ sesion: 'otra' }), 'otra');
  assert.equal(tipoDeSesion({ sesion: 'r_torso' }), 'entreno');
});

test('los días sin abrir la app se rellenan y no se dan por buenos', () => {
  const db = {
    plan: { comidasPorDia: {} },
    rutinas: [{ id: 'r', nombre: 'R', ejercicios: [{ id: 'a', importancia: 'principal' }] }],
    dias: {
      '2026-09-14': { sesion: 'r', ejercicios: [{ id: 'a', importancia: 'principal', estado: 'completado' }] },
    },
  };

  const historial = construirHistorial(db, '2026-09-18');
  assert.equal(historial.length, 5);
  assert.equal(historial[0].fecha, '2026-09-14');
  assert.equal(historial[4].fecha, '2026-09-18');

  assert.equal(clasificarEntreno(historial[0]), 'cumplido');
  // El hueco no se exige por sí solo; lo que sostiene la racha es la cuota de la ventana.
  assert.equal(clasificarEntreno(historial[1]), 'no_exigido');
  assert.equal(historial[1].sesion, 'sin_decidir');
});

test('un día de descanso no penaliza', () => {
  const db = { plan: { comidasPorDia: {} }, rutinas: [], dias: { '2026-09-14': { sesion: 'descanso' } } };
  assert.equal(clasificarEntreno(construirHistorial(db, '2026-09-14')[0]), 'no_exigido');
});

test('un historial sin registros no produce días', () => {
  const db = { plan: { comidasPorDia: {} }, rutinas: [], dias: {} };
  assert.deepEqual(construirHistorial(db, '2026-09-16'), [
    { fecha: '2026-09-16', sesion: 'sin_decidir', entreno: null, comida: null, extras: [] },
  ]);
});

test('evaluarDia puntúa los ejercicios de la rutina elegida y las comidas', () => {
  const db = {
    plan: { comidasPorDia: {} },
    rutinas: [
      {
        id: 'r',
        ejercicios: [
          { id: 'a', importancia: 'principal' },
          { id: 'b', importancia: 'principal' },
        ],
      },
    ],
  };
  const registro = {
    sesion: 'r',
    ejercicios: [
      { id: 'a', importancia: 'principal', estado: 'completado' },
      { id: 'b', importancia: 'principal', estado: 'omitido' },
    ],
    comidas: [{ id: 'c1', estado: 'completo' }, { id: 'c2', estado: 'incumplido' }],
  };
  const dia = evaluarDia(registro, '2026-09-16', { db });
  assert.equal(dia.entreno.cumplimiento, 1 / 2);
  assert.equal(dia.comida.puntuacion, 0.5);
});

test('marcar descanso descarta lo que hubiera anotado ese día', () => {
  const dia = evaluarDia({ sesion: 'descanso', ejercicios: [{ id: 'a', importancia: 'principal', estado: 'completado' }] }, '2026-09-16');
  assert.equal(dia.sesion, 'descanso');
  assert.equal(dia.entreno, null);
});

test('un documento desconocido se migra al esquema actual sin perder datos', () => {
  const antiguo = { dias: { '2026-09-14': {} }, monedasGastadas: 30 };
  const migrado = migrar(antiguo);

  assert.equal(migrado.version, VERSION_ESQUEMA);
  assert.equal(migrado.monedasGastadas, 30);
  assert.deepEqual(Object.keys(migrado.dias), ['2026-09-14']);
  assert.equal(typeof migrado.plan.diasPorSemana, 'number', 'los campos nuevos reciben su valor por defecto');
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
    { id: 'c', nombre: 'Curl', importancia: 'principal', series: 3 },
  ],
};

const dbConRutina = (dias) => ({
  plan: { diasPorSemana: 4, comidasPorDia: {} },
  rutinas: [RUTINA],
  dias,
});

test('explotación: registrar solo un ejercicio no firma la sesión entera', () => {
  const registro = { sesion: 'r', ejercicios: [{ id: 'c', importancia: 'principal', estado: 'completado' }] };
  const db = dbConRutina({ '2026-09-14': registro });

  const abierto = evaluarDia(registro, '2026-09-14', { db, hoy: '2026-09-14' });
  assert.equal(abierto.entreno.cumplimiento, 1, 'mientras el día sigue abierto no se le da por omitido');

  const cerrado = evaluarDia(registro, '2026-09-14', { db, hoy: '2026-09-15' });
  assert.equal(cerrado.entreno.cumplimiento, 1 / 3, 'un ejercicio de tres es un tercio, no una sesión');
  assert.ok(cerrado.entreno.cumplimiento < UMBRAL_DIA_CUMPLIDO.entreno, 'y no llega a día cumplido');
});

test('las comidas del día salen del plan semanal aunque no se haya tocado nada', () => {
  const db = {
    plan: { diasPorSemana: 4, comidasPorDia: { 0: ['Desayuno', 'Comida', 'Cena'] } },
    rutinas: [],
    dias: {},
  };

  const dia = evaluarDia(undefined, '2026-09-14', { db, hoy: '2026-09-14' });
  assert.equal(dia.comida.puntuacion, null, 'sin marcar nada el día abierto no puntúa');

  const marcado = { comidas: [{ id: 'p0', nombre: 'Desayuno', estado: 'completo' }] };
  const parcial = evaluarDia(marcado, '2026-09-14', { db, hoy: '2026-09-15' });
  assert.equal(parcial.comida.comidasComputadas, 1, 'al cerrar solo cuenta lo que quedó guardado');
});

test('editar la rutina no borra lo que ya se registró de un ejercicio retirado', () => {
  const registro = {
    sesion: 'r',
    ejercicios: [
      { id: 'a', importancia: 'principal', estado: 'completado' },
      { id: 'viejo', importancia: 'principal', estado: 'completado' },
    ],
  };
  const db = dbConRutina({ '2026-09-14': registro });
  const dia = evaluarDia(registro, '2026-09-14', { db, hoy: '2026-09-14' });

  // Con el día abierto solo pesa lo marcado: el de la rutina y el que salió de ella.
  assert.equal(dia.entreno.pesoTotal, 2, 'el ejercicio fuera de rutina sigue contando');
  assert.equal(dia.entreno.cumplimiento, 1);
});

test('borrar una rutina no invalida los días ya registrados con ella', () => {
  const registro = {
    sesion: 'r',
    ejercicios: [
      { id: 'a', nombre: 'Press', importancia: 'principal', estado: 'completado' },
      { id: 'b', nombre: 'Remo', importancia: 'principal', estado: 'completado' },
    ],
  };
  // El mismo día, con la rutina ya borrada del plan.
  const db = { plan: { diasPorSemana: 4, comidasPorDia: {} }, rutinas: [], dias: {} };
  const dia = evaluarDia(registro, '2026-09-14', { db, hoy: '2026-09-15' });

  assert.equal(dia.sesion, 'entreno', 'sigue siendo un día de entreno');
  assert.equal(dia.entreno.cumplimiento, 1, 'lo anotado sigue contando');
  assert.ok(registro.ejercicios.every((e) => e.nombre), 'y sigue siendo legible sin la rutina');
});
