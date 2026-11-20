import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearAlmacenDemo, CLAVE_DEMO } from '../src/datos/demo.js';
import { CODIGOS_DEMO } from '../src/datos/ejemplo.js';
import { decidirEntrada, trasComprobar } from '../src/nucleo/entrada.js';

const memoria = () => {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m };
};
const LUNES = '2026-11-16';

test('entrar con un código activo registra el móvil', async () => {
  const al = memoria();
  const a = crearAlmacenDemo({ almacenamiento: al, hoy: LUNES });
  const aceptacion = { version: '2026-11-20', fecha: '2026-11-20T10:00:00.000Z' };
  const r = await a.entrar(CODIGOS_DEMO.laura, 'movil-1', aceptacion);
  assert.equal(r.ok, true);
  assert.equal(r.atleta.nombre, 'Laura');
  const db = JSON.parse(al.getItem(CLAVE_DEMO));
  assert.deepEqual(Object.keys(db.dispositivos[CODIGOS_DEMO.laura]), ['movil-1']);
  assert.deepEqual(db.dispositivos[CODIGOS_DEMO.laura]['movil-1'].privacidad, aceptacion, 'queda la prueba del consentimiento');
});

test('códigos que no existen o desactivados no entran', async () => {
  const a = crearAlmacenDemo({ almacenamiento: memoria(), hoy: LUNES });
  assert.deepEqual(await a.entrar('NADIE-AAAAAA', 'm'), { ok: false, motivo: 'no-existe' });
  assert.deepEqual(await a.entrar(CODIGOS_DEMO.baja, 'm'), { ok: false, motivo: 'desactivado' });
  assert.equal(await a.comprobar(CODIGOS_DEMO.baja), 'desactivado');
  assert.equal(await a.comprobar(CODIGOS_DEMO.laura), 'activo');
});

test('el plan de la semana y las valoraciones de ejemplo', async () => {
  const a = crearAlmacenDemo({ almacenamiento: memoria(), hoy: LUNES });
  const { atleta } = await a.entrar(CODIGOS_DEMO.laura, 'm');
  const semana = await a.sesionesEntre(atleta.id, LUNES, '2026-11-22');
  assert.equal(semana.length, 4);
  const pasada = await a.sesionesEntre(atleta.id, '2026-11-09', '2026-11-15');
  const regs = await a.registros(atleta.id, pasada.map((s) => s.id));
  assert.equal(Object.keys(regs).length, 2);
});

test('guardar una valoración la valida y la deja guardada', async () => {
  const al = memoria();
  const a = crearAlmacenDemo({ almacenamiento: al, hoy: LUNES });
  const { atleta } = await a.entrar(CODIGOS_DEMO.laura, 'm');
  const [s] = await a.sesionesEntre(atleta.id, LUNES, LUNES);
  assert.equal((await a.guardarRegistro(atleta.id, CODIGOS_DEMO.laura, { sesion: s.id, esfuerzo: 11 })).ok, false);
  const r = await a.guardarRegistro(atleta.id, CODIGOS_DEMO.laura, { sesion: s.id, esfuerzo: 6, hechos: [s.ejercicios[0].id] });
  assert.equal(r.ok, true);
  const otra = crearAlmacenDemo({ almacenamiento: al, hoy: LUNES });
  const regs = await otra.registros(atleta.id, [s.id]);
  assert.equal(regs[s.id].esfuerzo, 6);
});

test('un código que no es del atleta no puede guardar', async () => {
  const a = crearAlmacenDemo({ almacenamiento: memoria(), hoy: LUNES });
  const { atleta } = await a.entrar(CODIGOS_DEMO.laura, 'm');
  const [s] = await a.sesionesEntre(atleta.id, LUNES, LUNES);
  const r = await a.guardarRegistro(atleta.id, CODIGOS_DEMO.pablo, { sesion: s.id, esfuerzo: 5 });
  assert.equal(r.ok, false);
});

test('los datos corruptos se regeneran', async () => {
  const al = memoria();
  al.setItem(CLAVE_DEMO, '{no es json');
  const a = crearAlmacenDemo({ almacenamiento: al, hoy: LUNES });
  assert.equal(await a.comprobar(CODIGOS_DEMO.laura), 'activo');
});

test('decidir qué hacer al abrir la app', () => {
  assert.equal(decidirEntrada(null, null), 'pedir-codigo');
  assert.equal(decidirEntrada(null, 'A-AAAAAA'), 'entrar');
  assert.equal(decidirEntrada({ codigo: 'A-AAAAAA' }, null), 'continuar');
  assert.equal(decidirEntrada({ codigo: 'A-AAAAAA' }, 'A-AAAAAA'), 'continuar');
  assert.equal(decidirEntrada({ codigo: 'A-AAAAAA' }, 'B-BBBBBB'), 'confirmar-cambio');
  assert.equal(trasComprobar('desactivado'), 'cerrar-con-aviso');
  assert.equal(trasComprobar('no-existe'), 'cerrar-con-aviso');
  assert.equal(trasComprobar('sin-conexion'), 'seguir');
});

test('en la demo siempre hay sesión el día de hoy', async () => {
  for (const hoy of ['2026-11-16', '2026-11-19', '2026-11-22']) {
    const a = crearAlmacenDemo({ almacenamiento: memoria(), hoy });
    const { atleta } = await a.entrar(CODIGOS_DEMO.laura, 'm');
    assert.equal((await a.sesionesEntre(atleta.id, hoy, hoy)).length, 1, hoy);
  }
});
