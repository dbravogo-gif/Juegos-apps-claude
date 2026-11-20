import { test } from 'node:test';
import assert from 'node:assert/strict';
import { semanasDelMes, sumarMeses, mesDe, leerMes, claveMes, tituloMes, colorDia } from '../src/nucleo/calendario.js';
import { limpiarEnlaceStrava, validarRegistro } from '../src/nucleo/registro.js';
import { validarSesion } from '../src/nucleo/plan.js';
import { necesitaAceptar, VERSION_PRIVACIDAD } from '../src/nucleo/privacidad.js';
import { plataforma } from '../src/nucleo/plataforma.js';

test('noviembre de 2026 empieza en domingo: 6 semanas, de lunes 26 de octubre a domingo 6 de diciembre', () => {
  const s = semanasDelMes({ anio: 2026, mes: 11 });
  assert.equal(s.length, 6);
  assert.equal(s[0][0].fecha, '2026-10-26');
  assert.equal(s[0][6].fecha, '2026-11-01');
  assert.equal(s[0][0].delMes, false);
  assert.equal(s[0][6].delMes, true);
  assert.equal(s[5][6].fecha, '2026-12-06');
  assert.ok(s.every((sem) => sem.length === 7));
});

test('febrero de 2027 cabe en 4 semanas', () => {
  assert.equal(semanasDelMes({ anio: 2027, mes: 2 }).length, 4);
});

test('sumar meses cruza años', () => {
  assert.deepEqual(sumarMeses({ anio: 2026, mes: 12 }, 1), { anio: 2027, mes: 1 });
  assert.deepEqual(sumarMeses({ anio: 2026, mes: 1 }, -1), { anio: 2025, mes: 12 });
  assert.deepEqual(mesDe('2026-11-20'), { anio: 2026, mes: 11 });
  assert.equal(claveMes({ anio: 2026, mes: 3 }), '2026-03');
  assert.deepEqual(leerMes('2026-03'), { anio: 2026, mes: 3 });
  assert.equal(leerMes('2026-13'), null);
  assert.equal(tituloMes({ anio: 2026, mes: 11 }), 'Noviembre 2026');
});

test('solo dos colores', () => {
  assert.equal(colorDia([]), null);
  assert.equal(colorDia([{ intensidad: 'suave' }]), 'suave');
  assert.equal(colorDia([{}]), 'suave');
  assert.equal(colorDia([{ intensidad: 'suave' }, { intensidad: 'exigente' }]), 'exigente');
});

test('enlace de Strava: solo strava y solo https', () => {
  assert.deepEqual(limpiarEnlaceStrava(''), { ok: true, url: '' });
  assert.equal(limpiarEnlaceStrava('https://www.strava.com/activities/123').url, 'https://www.strava.com/activities/123');
  assert.equal(limpiarEnlaceStrava('strava.app.link/AbC123').url, 'https://strava.app.link/AbC123');
  assert.equal(limpiarEnlaceStrava('http://strava.com/activities/1').url, 'https://strava.com/activities/1');
  assert.equal(limpiarEnlaceStrava('https://strava.com.malo.es/x').ok, false);
  assert.equal(limpiarEnlaceStrava('https://evilstrava.com/x').ok, false);
  assert.equal(limpiarEnlaceStrava('javascript:alert(1)').ok, false);
  assert.equal(limpiarEnlaceStrava('https://user:pw@www.strava.com/x').ok, false);
  assert.equal(limpiarEnlaceStrava('no es un enlace').ok, false);
});

test('la valoración guarda el enlace de Strava limpio o avisa', () => {
  const sesion = { id: 's', fecha: '2026-11-20', ejercicios: [{ id: 'e', nombre: 'Rodaje' }] };
  assert.equal(validarRegistro({ esfuerzo: 5, strava: ' strava.app.link/x ' }, sesion).registro.strava, 'https://strava.app.link/x');
  assert.equal(validarRegistro({ esfuerzo: 5, strava: 'https://otra.web/x' }, sesion).ok, false);
  assert.equal(validarRegistro({ esfuerzo: 5 }, sesion).registro.strava, '');
});

test('intensidad de la sesión: suave por defecto', () => {
  const base = { id: 's', fecha: '2026-11-20', titulo: 'T', ejercicios: [{ id: 'e', nombre: 'X' }] };
  assert.equal(validarSesion(base).sesion.intensidad, 'suave');
  assert.equal(validarSesion({ ...base, intensidad: 'exigente' }).sesion.intensidad, 'exigente');
  assert.equal(validarSesion({ ...base, intensidad: 'loquesea' }).sesion.intensidad, 'suave');
});

test('privacidad: se pide si no hay aceptación o si cambió la versión', () => {
  assert.equal(necesitaAceptar(null), true);
  assert.equal(necesitaAceptar({ version: '2020-01-01', fecha: 'x' }), true);
  assert.equal(necesitaAceptar({ version: VERSION_PRIVACIDAD, fecha: '2026-11-20T10:00:00Z' }), false);
});

test('plataforma para el tutorial de instalación', () => {
  const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
  assert.equal(plataforma(iphone, 5), 'ios-safari');
  assert.equal(plataforma(iphone.replace('Version/26.1', 'CriOS/131.0'), 5), 'ios-otro');
  assert.equal(plataforma('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/26.1 Safari/605.1.15', 5), 'ios-safari');
  assert.equal(plataforma('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/26.1 Safari/605.1.15', 0), 'escritorio');
  assert.equal(plataforma('Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36', 5), 'android');
  assert.equal(plataforma('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0', 0), 'escritorio');
});
