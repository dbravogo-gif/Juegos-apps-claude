import { test } from 'node:test';
import assert from 'node:assert/strict';
import { historialCsv, nombreArchivo, textoCarrera } from '../src/nucleo/exportar.js';

const s1 = { id: 's1', fecha: '2026-11-17', titulo: 'Series; cortas', ejercicios: [
  { id: 'a', nombre: 'Calentamiento', carrera: true }, { id: 'b', nombre: 'Series "400"', carrera: true }] };
const s2 = { id: 's2', fecha: '2026-11-16', titulo: 'Rodaje', ejercicios: [{ id: 'c', nombre: 'Rodaje', carrera: true }] };
const regs = { s1: { hechos: ['a'], esfuerzo: 9, duros: ['b'], carrera: { a: { distancia: 2.4, tiempo: 630, ritmo: 263 } }, comentario: 'Duro\nmucho' } };

test('el CSV tiene BOM, cabecera, una fila por sesión y escapa lo que hace falta', () => {
  const csv = historialCsv({ nombre: 'Laura' }, [s1, s2], regs);
  assert.ok(csv.startsWith('﻿'));
  const lineas = csv.slice(1).split('\r\n');
  assert.equal(lineas[0], 'Atleta: Laura');
  assert.equal(lineas[1].split(';').length, 10);
  assert.ok(lineas[2].startsWith('2026-11-16;Rodaje;'), 'ordenado por fecha');
  assert.match(csv, /"Series; cortas"/);
  assert.match(csv, /"Series ""400"""/);
  assert.match(csv, /9 \(Durísimo\)/);
  assert.match(csv, /"Duro\nmucho"/);
  assert.match(csv, /Sin valorar/);
});

test('texto de carrera legible', () => {
  assert.equal(textoCarrera(s1, regs.s1), 'Calentamiento: 2,4 km, 10:30, 4:23/km');
  assert.equal(textoCarrera(s2, undefined), '');
});

test('nombre de archivo sin tildes ni espacios', () => {
  assert.equal(nombreArchivo({ nombre: 'Íñigo López' }, '2026-11-19'), 'historial-inigo-lopez-2026-11-19.csv');
  assert.equal(nombreArchivo({ nombre: '¿?' }, '2026-11-19'), 'historial-atleta-2026-11-19.csv');
});
