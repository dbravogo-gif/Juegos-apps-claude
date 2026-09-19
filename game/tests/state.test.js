import test from 'node:test';
import assert from 'node:assert/strict';

import {
  fechasCubiertas,
  diasExentos,
  exencionesEntrenoDisponibles,
  puedeActivarExencion,
  diasEntre,
  sumarDias,
} from '../src/core/scoring/exemptions.js';
import { estadoDesdeHistorial, aplicarExenciones } from '../src/core/state.js';
import { clasificarEntreno } from '../src/core/scoring/streaks.js';

test('una exención cubre tres días consecutivos', () => {
  assert.deepEqual(fechasCubiertas({ inicio: '2026-07-30' }), [
    '2026-07-30',
    '2026-07-31',
    '2026-08-01',
  ]);
});

test('la aritmética de fechas cruza meses y años', () => {
  assert.equal(sumarDias('2026-12-31', 1), '2027-01-01');
  assert.equal(diasEntre('2026-02-26', '2026-03-01'), 3);
});

test('quedan seis exenciones de entreno al año', () => {
  const exenciones = [{ id: 'a', inicio: '2026-01-10' }, { id: 'b', inicio: '2026-06-01' }];
  assert.equal(exencionesEntrenoDisponibles(exenciones, '2026-09-16'), 4);
  // El año siguiente vuelve a empezar con las seis.
  assert.equal(exencionesEntrenoDisponibles(exenciones, '2027-01-02'), 6);
});

test('explotación: no se puede tapar un día ya fallado con una exención retroactiva', () => {
  const resultado = puedeActivarExencion([], '2026-09-01', '2026-09-16');
  assert.equal(resultado.ok, false);
  assert.equal(resultado.motivo, 'retroactiva');

  // Un día de retraso sí se admite, por si se registra al día siguiente.
  assert.equal(puedeActivarExencion([], '2026-09-15', '2026-09-16').ok, true);
});

test('las exenciones no se pueden solapar ni exceder el cupo anual', () => {
  const existente = [{ id: 'a', inicio: '2026-09-16' }];
  assert.equal(puedeActivarExencion(existente, '2026-09-17', '2026-09-16').motivo, 'solapada');
  assert.equal(puedeActivarExencion(existente, '2026-09-19', '2026-09-16').ok, true);

  const agotadas = Array.from({ length: 6 }, (_, i) => ({ id: `e${i}`, inicio: `2026-0${i + 1}-01` }));
  assert.equal(puedeActivarExencion(agotadas, '2026-09-20', '2026-09-16').motivo, 'sin_exenciones');
});

test('un día exento no se exige aunque se hubiera elegido rutina', () => {
  const historial = [{ fecha: '2026-09-16', sesion: 'entreno', entreno: null }];
  assert.equal(clasificarEntreno(historial[0]), 'fallado');

  const conExencion = aplicarExenciones(historial, [{ id: 'a', inicio: '2026-09-16' }]);
  assert.equal(clasificarEntreno(conExencion[0]), 'no_exigido');
});

const dia = (fecha, cumplimiento, puntuacion) => ({
  fecha,
  sesion: 'entreno',
  entreno: { cumplimiento },
  comida: { puntuacion, comidasExentas: 0 },
  extras: [],
});

test('la XP y las monedas se derivan del historial', () => {
  const historial = [dia('2026-09-14', 1, 1), dia('2026-09-15', 1, 1)];
  const estado = estadoDesdeHistorial(historial);

  assert.equal(estado.xp, 280); // dos días completos sin racha todavía
  assert.equal(estado.monedas.ganadas, 140);
  assert.equal(estado.monedas.disponibles, 140);
  assert.equal(estado.nivel.nivel, 1, 'dos días perfectos no pueden bastar para subir de nivel');
});

test('el primer nivel cuesta varios días, no uno', () => {
  const perfecto = (n) => Array.from({ length: n }, (_, i) => dia(`2026-09-${14 + i}`, 1, 1));

  assert.equal(estadoDesdeHistorial(perfecto(2)).nivel.nivel, 1);
  assert.ok(estadoDesdeHistorial(perfecto(5)).nivel.nivel >= 2, 'tampoco puede ser inalcanzable');
});

test('lo gastado se descuenta de las monedas disponibles pero no de la XP', () => {
  const historial = [dia('2026-09-14', 1, 1), dia('2026-09-15', 1, 1)];
  const estado = estadoDesdeHistorial(historial, { monedasGastadas: 100 });

  assert.equal(estado.monedas.disponibles, 40);
  assert.equal(estado.xp, 280);
});

test('los extras ya otorgados suman al total', () => {
  const historial = [dia('2026-09-14', 1, 1), dia('2026-09-15', 1, 1)];
  historial[1].extras = [{ tipo: 'talar', xp: 20, monedas: 10 }];

  const estado = estadoDesdeHistorial(historial);
  assert.equal(estado.xp, 300);
  assert.equal(estado.monedas.ganadas, 150);
});

test('un historial vacío no rompe el estado', () => {
  const estado = estadoDesdeHistorial([]);
  assert.equal(estado.xp, 0);
  assert.equal(estado.nivel.nivel, 1);
  assert.equal(estado.hoy, null);
  assert.equal(estado.rachas, null);
});
