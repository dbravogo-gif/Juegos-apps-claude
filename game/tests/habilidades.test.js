import test from 'node:test';
import assert from 'node:assert/strict';
import { HABILIDADES } from '../src/data/content.js';
import {
  cargaDeHabilidades,
  potencia,
  describirPotencia,
  habilidadesLlevadas,
  CARGA_VACIA,
} from '../src/core/combat/habilidades.js';
import { iniciarCombate, turno, generador } from '../src/core/combat/battle.js';
import { statsPersonaje } from '../src/core/progression/character.js';
import { habilidadesAbiertas } from '../src/core/progression/unlocks.js';

const LLENA = { entrenos: 6, dieta: 7, otras: 3, rachaEntreno: 40, rachaComida: 40 };
const dia = (sesion, cumplimiento, puntuacion) => ({
  fecha: '2026-10-01', sesion, entreno: cumplimiento == null ? null : { cumplimiento }, comida: { puntuacion },
});

test('la carga cuenta los hábitos de la última semana y de las dos últimas', () => {
  const dias = [
    ...Array.from({ length: 7 }, () => dia('otra', null, 1)), // hace más de una semana
    dia('entreno', 1, 1), dia('entreno', 1, 0), dia('descanso', null, 1), dia('entreno', 0.2, 1),
    dia('otra', null, 1), dia('entreno', 1, 1), dia('entreno', 1, 0),
  ];
  const carga = cargaDeHabilidades(dias, { entreno: { activa: true, longitud: 9 }, comida: { activa: false, longitud: 5 } });
  assert.equal(carga.entrenos, 4);
  assert.equal(carga.dieta, 5);
  assert.equal(carga.otras, 8);
  assert.equal(carga.rachaEntreno, 9);
  assert.equal(carga.rachaComida, 0, 'una racha rota no carga');
});

test('toda habilidad sirve sin carga y crece con ella sin pasarse de los topes', () => {
  for (const id of Object.keys(HABILIDADES)) {
    const vacia = potencia(id, CARGA_VACIA);
    const llena = potencia(id, LLENA);
    assert.ok(Object.keys(vacia).length, `${id} sin efecto`);
    assert.ok(describirPotencia(id, LLENA).length > 0);
    if (vacia.multiplicador) {
      assert.ok(vacia.multiplicador >= 1, `${id} vacía no puede pegar menos que atacar`);
      assert.ok(llena.multiplicador * llena.golpes <= 3, `${id} rompe el combate`);
      assert.ok(llena.multiplicador * llena.golpes > vacia.multiplicador * vacia.golpes, `${id} no crece`);
    }
  }
  assert.ok(potencia('guardia_ferrea', LLENA).pasa >= 0.1, 'la guardia nunca es invulnerable');
  assert.ok(potencia('paso_peregrino', LLENA).esquiva < 1, 'esquivar nunca es seguro');
  assert.ok(potencia('segundo_aliento', LLENA).cura > potencia('segundo_aliento', CARGA_VACIA).cura);
});

const combateCon = (carga, nivel = 18) => {
  const c = iniciarCombate(statsPersonaje(nivel), 'cangrejo_coloso', carga);
  return { ...c, jugador: { ...c.jugador, energia: 30, energiaMax: 30 } };
};

test('más carga, más daño con la misma tirada', () => {
  const flojo = turno(combateCon(CARGA_VACIA), { tipo: 'habilidad', habilidad: 'embestida' }, generador(7));
  const fuerte = turno(combateCon(LLENA), { tipo: 'habilidad', habilidad: 'embestida' }, generador(7));
  assert.ok(fuerte.enemigo.vida < flojo.enemigo.vida);
});

test('segundo aliento cura una sola vez por combate', () => {
  let c = combateCon(LLENA);
  c = { ...c, jugador: { ...c.jugador, vida: 10 } };
  const curado = turno(c, { tipo: 'habilidad', habilidad: 'segundo_aliento' }, generador(2));
  assert.equal(curado.efecto.tipo, 'cura');
  assert.ok(curado.efecto.valor > 0);
  const otra = turno({ ...curado, jugador: { ...curado.jugador, vida: 10 } }, { tipo: 'habilidad', habilidad: 'segundo_aliento' }, generador(2));
  assert.ok(otra.registro.some((l) => l.includes('ya lo has usado')));
  assert.equal(otra.jugador.energia, curado.jugador.energia, 'no gasta energía si no hace nada');
});

test('la guardia férrea con racha aguanta más que cubrirse', () => {
  const base = combateCon(LLENA);
  const cubierto = turno(base, { tipo: 'defender' }, generador(9));
  const guardia = turno(base, { tipo: 'habilidad', habilidad: 'guardia_ferrea' }, generador(9));
  assert.ok(guardia.jugador.vida > cubierto.jugador.vida);
});

test('paso de peregrino hace fallar golpes, no todos', () => {
  let esquivados = 0;
  for (let s = 1; s <= 200; s += 1) {
    const r = turno(combateCon({ ...CARGA_VACIA }), { tipo: 'habilidad', habilidad: 'paso_peregrino' }, generador(s * 104729));
    if (r.efecto?.esquivado) esquivados += 1;
  }
  assert.ok(esquivados > 40 && esquivados < 160, `esquivados ${esquivados}/200`);
});

test('tajo doble suma un tercer corte con la dieta de la semana', () => {
  assert.equal(potencia('tajo_doble', { ...CARGA_VACIA, dieta: 4 }).golpes, 2);
  assert.equal(potencia('tajo_doble', { ...CARGA_VACIA, dieta: 5 }).golpes, 3);
});

test('se llevan tres: las elegidas o, si no se ha elegido, las más recientes', () => {
  const abiertas = habilidadesAbiertas(20);
  assert.deepEqual(habilidadesLlevadas(abiertas, undefined).map((h) => h.id), ['guardia_ferrea', 'tajo_doble', 'golpe_constante']);
  assert.deepEqual(habilidadesLlevadas(abiertas, ['embestida', 'tajo_doble']).map((h) => h.id), ['embestida', 'tajo_doble']);
  assert.deepEqual(habilidadesLlevadas(habilidadesAbiertas(4), ['tajo_doble', 'embestida']).map((h) => h.id), ['embestida'],
    'una elegida que aún no está abierta no cuenta');
});
