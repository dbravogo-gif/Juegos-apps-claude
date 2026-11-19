import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearAlmacenDemo, CLAVE_DEMO } from '../src/datos/demo.js';
import { CODIGOS_DEMO } from '../src/datos/ejemplo.js';
import { conSemilla } from '../src/nucleo/azar.js';
import { esCodigo } from '../src/nucleo/codigos.js';

const memoria = () => {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
};
const HOY = '2026-11-19';
const nuevo = () => {
  let t = Date.parse('2026-11-19T21:00:00Z'); // después de las valoraciones de ejemplo
  return crearAlmacenDemo({ almacenamiento: memoria(), hoy: HOY, ahora: () => (t += 1000) });
};

test('alta de un atleta con código válido que ya sirve para entrar', async () => {
  const a = nuevo();
  const rng = conSemilla(5);
  assert.equal((await a.crearAtleta('  ', rng)).ok, false);
  const r = await a.crearAtleta('Íñigo Ruiz', rng);
  assert.equal(r.ok, true);
  assert.ok(esCodigo(r.atleta.codigo));
  assert.match(r.atleta.codigo, /^INIGO-/);
  assert.equal((await a.entrar(r.atleta.codigo, 'm1')).ok, true);
  const lista = await a.listarAtletas();
  assert.equal(lista.find((x) => x.id === r.atleta.id).dispositivos, 1);
});

test('desactivar echa al atleta y reactivar lo deja volver', async () => {
  const a = nuevo();
  const [laura] = (await a.listarAtletas()).filter((x) => x.nombre === 'Laura');
  await a.cambiarActivo(laura.id, false);
  assert.equal(await a.comprobar(laura.codigo), 'desactivado');
  await a.cambiarActivo(laura.id, true);
  assert.equal(await a.comprobar(laura.codigo), 'activo');
});

test('regenerar el código anula el anterior y borra los móviles', async () => {
  const a = nuevo();
  const [laura] = (await a.listarAtletas()).filter((x) => x.nombre === 'Laura');
  await a.entrar(laura.codigo, 'm1');
  const r = await a.regenerarCodigo(laura.id, conSemilla(9));
  assert.notEqual(r.atleta.codigo, laura.codigo);
  assert.equal(r.atleta.dispositivos, 0);
  assert.equal(await a.comprobar(laura.codigo), 'no-existe');
  assert.equal(await a.comprobar(r.atleta.codigo), 'activo');
});

test('editar el plan: guardar valida, borrar quita también la valoración', async () => {
  const a = nuevo();
  const { atleta } = await a.entrar(CODIGOS_DEMO.laura, 'm');
  assert.equal((await a.guardarSesion(atleta.id, { id: 'x', fecha: HOY, titulo: '', ejercicios: [] })).ok, false);
  const r = await a.guardarSesion(atleta.id, { id: 'nueva', fecha: HOY, titulo: 'Cuestas', ejercicios: [{ id: 'e', nombre: 'Cuestas', detalle: '8 × 30 s', carrera: true }] });
  assert.equal(r.ok, true);
  await a.guardarRegistro(atleta.id, CODIGOS_DEMO.laura, { sesion: 'nueva', esfuerzo: 7 });
  await a.borrarSesion(atleta.id, 'nueva');
  assert.equal(await a.sesion(atleta.id, 'nueva'), null);
  assert.deepEqual(await a.registros(atleta.id, ['nueva']), {});
});

test('copiar la semana a la siguiente y una sesión a otro atleta', async () => {
  const a = nuevo();
  const lista = await a.listarAtletas();
  const laura = lista.find((x) => x.nombre === 'Laura');
  const pablo = lista.find((x) => x.nombre === 'Pablo');
  const antes = await a.sesionesEntre(laura.id, '2026-11-30', '2026-12-06');
  const r = await a.copiarSemana(laura.id, '2026-11-16', '2026-11-30', conSemilla(1));
  assert.equal(r.copiadas, 4);
  assert.equal((await a.sesionesEntre(laura.id, '2026-11-30', '2026-12-06')).length, antes.length + 4);
  const [s] = await a.sesionesEntre(laura.id, HOY, HOY);
  const c = await a.copiarSesionA(laura.id, s.id, pablo.id, '2026-11-21', conSemilla(2));
  assert.equal(c.ok, true);
  assert.equal((await a.sesionesEntre(pablo.id, '2026-11-21', '2026-11-21')).some((x) => x.titulo === s.titulo), true);
});

test('novedades: la valoración más reciente va primero, con atleta y sesión', async () => {
  const a = nuevo();
  const { atleta } = await a.entrar(CODIGOS_DEMO.laura, 'm');
  const [s] = await a.sesionesEntre(atleta.id, HOY, HOY);
  await a.guardarRegistro(atleta.id, CODIGOS_DEMO.laura, { sesion: s.id, esfuerzo: 9 });
  const n = await a.novedades();
  assert.equal(n[0].sesion.id, s.id);
  assert.equal(n[0].atleta.nombre, 'Laura');
  assert.equal(n.length, 3);
});

test('biblioteca de ejercicios sin repetir', async () => {
  const nombres = (await nuevo().biblioteca()).map((x) => x.nombre);
  assert.equal(new Set(nombres).size, nombres.length);
  assert.ok(nombres.includes('Series de 400 m'));
});

test('archivar desactiva; borrar no deja rastro del atleta', async () => {
  const al = memoria();
  const a = crearAlmacenDemo({ almacenamiento: al, hoy: HOY });
  const laura = (await a.listarAtletas()).find((x) => x.nombre === 'Laura');
  await a.archivarAtleta(laura.id);
  assert.equal((await a.atleta(laura.id)).archivado, true);
  assert.equal(await a.comprobar(laura.codigo), 'desactivado');
  const todo = await a.todoDelAtleta(laura.id);
  assert.equal(todo.sesiones.length, 12);
  await a.borrarAtleta(laura.id);
  const texto = al.getItem(CLAVE_DEMO);
  assert.equal(texto.includes(laura.id), false);
  assert.equal(texto.includes(laura.codigo), false);
});
