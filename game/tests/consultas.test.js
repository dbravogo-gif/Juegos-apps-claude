import test from 'node:test';
import assert from 'node:assert/strict';

import {
  mesesConRegistro,
  diasDelMes,
  huecoInicial,
  calendarioDelMes,
  detalleDelDia,
  ejerciciosConHistorial,
  progresionEjercicio,
} from '../src/data/consultas.js';

const RUTINA = {
  id: 'r',
  nombre: 'Torso',
  ejercicios: [
    { id: 'e1', nombre: 'Press banca', importancia: 'principal', series: 3 },
    { id: 'e2', nombre: 'Remo', importancia: 'principal', series: 3 },
  ],
};

const serie = (peso, reps) => ({ peso, reps, hecha: true });

const db = {
  plan: { diasPorSemana: 4, comidasPorDia: { 0: ['Desayuno', 'Comida'] } },
  rutinas: [RUTINA],
  dias: {
    // 2026-09-14 es lunes.
    '2026-09-14': {
      sesion: 'r',
      ejercicios: [
        { id: 'e1', nombre: 'Press banca', importancia: 'principal', estado: 'completado', series: [serie('80', '8'), serie('80', '8')] },
        { id: 'e2', nombre: 'Remo', importancia: 'principal', estado: 'completado', series: [serie('60', '10')] },
      ],
      comidas: [{ id: 'p0', nombre: 'Desayuno', estado: 'completo' }, { id: 'p1', nombre: 'Comida', estado: 'incumplido' }],
    },
    '2026-09-16': { sesion: 'descanso' },
    '2026-09-21': {
      sesion: 'r',
      ejercicios: [
        { id: 'e1', nombre: 'Press banca', importancia: 'principal', estado: 'completado', series: [serie('82,5', '8'), serie('85', '6')] },
      ],
    },
    '2026-08-31': { sesion: 'otra' },
  },
};

test('los meses con registro salen del más reciente al más antiguo', () => {
  assert.deepEqual(mesesConRegistro(db), ['2026-09', '2026-08']);
});

test('el calendario coloca el día 1 en su columna', () => {
  assert.equal(diasDelMes('2026-09').length, 30);
  assert.equal(diasDelMes('2026-02').length, 28, 'febrero de un año normal');
  assert.equal(diasDelMes('2024-02').length, 29, 'y el bisiesto');
  // 2026-09-01 es martes: un hueco antes.
  assert.equal(huecoInicial('2026-09'), 1);
});

test('un día sin registro no cuenta como fallado en el calendario', () => {
  const mes = calendarioDelMes(db, '2026-09', '2026-09-30');
  const dia1 = mes.find((d) => d.fecha === '2026-09-01');

  assert.equal(dia1.entreno, 'sin_datos', 'el calendario cuenta lo que pasó, no juzga');
  assert.equal(mes.find((d) => d.fecha === '2026-09-14').entreno, 'cumplido');
  assert.equal(mes.find((d) => d.fecha === '2026-09-16').entreno, 'no_exigido');
});

test('el detalle de un día trae lo anotado serie a serie', () => {
  const dia = detalleDelDia(db, '2026-09-14');

  assert.equal(dia.rutina, 'Torso');
  assert.equal(dia.cumplimiento, 1);
  assert.equal(dia.ejercicios.length, 2);
  assert.deepEqual(dia.ejercicios[0].series.map((s) => s.peso), ['80', '80']);
  assert.equal(dia.comidas.length, 2);
  assert.equal(detalleDelDia(db, '2026-09-15'), null, 'un día sin registro no inventa nada');
});

test('el detalle sobrevive a que se borre la rutina', () => {
  const sinRutinas = { ...db, rutinas: [] };
  const dia = detalleDelDia(sinRutinas, '2026-09-14');

  assert.equal(dia.rutina, null);
  assert.equal(dia.ejercicios[0].nombre, 'Press banca', 'el nombre guardado en el registro aguanta');
});

test('solo entran en la progresión los ejercicios con peso anotado', () => {
  const lista = ejerciciosConHistorial(db);
  assert.deepEqual(lista.map((e) => [e.nombre, e.dias]), [['Press banca', 2], ['Remo', 1]]);
});

test('la progresión va en orden y coge el mejor peso de cada día', () => {
  const progreso = progresionEjercicio(db, 'e1');

  assert.deepEqual(progreso.map((p) => p.fecha), ['2026-09-14', '2026-09-21']);
  assert.equal(progreso[0].mejorPeso, 80);
  assert.equal(progreso[1].mejorPeso, 85, 'el mejor de la sesión, no el último');
  assert.equal(progreso[0].volumen, 80 * 8 * 2);
});

test('la coma decimal del teclado español cuenta como número', () => {
  // Si "82,5" se leyera como texto, el mejor peso de ese día sería 85 por casualidad y
  // el volumen se iría a cero.
  const [, segundo] = progresionEjercicio(db, 'e1');
  assert.equal(segundo.volumen, Math.round(82.5 * 8 + 85 * 6));
});

test('una serie anotada pero sin marcar no cuenta como levantada', () => {
  const conPendiente = {
    ...db,
    dias: { '2026-09-28': { sesion: 'r', ejercicios: [{ id: 'e1', nombre: 'Press banca', series: [{ peso: '200', reps: '10' }] }] } },
  };
  assert.deepEqual(progresionEjercicio(conPendiente, 'e1'), []);
  assert.deepEqual(ejerciciosConHistorial(conPendiente), []);
});
