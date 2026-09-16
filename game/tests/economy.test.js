import test from 'node:test';
import assert from 'node:assert/strict';

import {
  recompensaDelDia,
  presupuestoExtras,
  otorgarExtra,
  valorReventa,
} from '../src/core/economy/rewards.js';
import { xpParaSubirDe, nivelDesdeXp } from '../src/core/economy/levels.js';
import { TOPE_EXTRAS } from '../src/core/constants.js';

test('la recompensa es proporcional al cumplimiento', () => {
  const pleno = recompensaDelDia({ cumplimientoEntreno: 1, puntuacionComida: 1 });
  const medio = recompensaDelDia({ cumplimientoEntreno: 0.5, puntuacionComida: 0.5 });
  assert.equal(medio.total.xp, pleno.total.xp / 2);
});

test('un día sin registro no da recompensa', () => {
  const nada = recompensaDelDia({ cumplimientoEntreno: null, puntuacionComida: null });
  assert.deepEqual(nada.total, { xp: 0, monedas: 0 });
});

test('el multiplicador de racha se aplica a XP y monedas', () => {
  const sinRacha = recompensaDelDia({ cumplimientoEntreno: 1, puntuacionComida: 1 });
  const conRacha = recompensaDelDia({
    cumplimientoEntreno: 1,
    puntuacionComida: 1,
    multiplicador: 1.6,
  });
  assert.equal(conRacha.total.xp, Math.round(sinRacha.total.xp * 1.6));
  assert.equal(conRacha.total.monedas, Math.round(sinRacha.total.monedas * 1.6));
});

test('los extras exigen un día por encima del 85 %', () => {
  const total = { xp: 100, monedas: 50 };
  const flojo = presupuestoExtras({ cumplimientoEntreno: 0.8, puntuacionComida: 0.6 }, total);
  assert.equal(flojo.desbloqueado, false);
  assert.equal(flojo.xp, 0);

  const bueno = presupuestoExtras({ cumplimientoEntreno: 0.9, puntuacionComida: 0.6 }, total);
  assert.equal(bueno.desbloqueado, true);
});

test('una comida ejemplar basta para desbloquear extras aunque no se entrene', () => {
  const soloComida = presupuestoExtras(
    { cumplimientoEntreno: null, puntuacionComida: 1 },
    { xp: 40, monedas: 20 },
  );
  assert.equal(soloComida.desbloqueado, true);
});

test('los extras no superan el 30 % de lo ganado ese día', () => {
  const total = { xp: 200, monedas: 100 };
  const presupuesto = presupuestoExtras({ cumplimientoEntreno: 1, puntuacionComida: 1 }, total);
  assert.equal(presupuesto.xp, total.xp * TOPE_EXTRAS);
  assert.ok(presupuesto.xp < total.xp);
});

test('explotación: encadenar extras se recorta al llegar al tope', () => {
  const presupuesto = { desbloqueado: true, xp: 60, monedas: 30 };
  let gastado = { xp: 0, monedas: 0 };

  for (let i = 0; i < 5; i += 1) {
    const premio = otorgarExtra(presupuesto, gastado, { xp: 25, monedas: 12 });
    gastado = { xp: gastado.xp + premio.xp, monedas: gastado.monedas + premio.monedas };
  }

  assert.equal(gastado.xp, 60);
  assert.equal(gastado.monedas, 30);
});

test('explotación: comprar y vender en bucle empobrece, no enriquece', () => {
  let monedas = 1000;
  for (let i = 0; i < 3; i += 1) {
    monedas -= 100;
    monedas += valorReventa(100);
  }
  assert.equal(monedas, 775);
  assert.ok(monedas < 1000);
});

test('cada nivel cuesta más que el anterior', () => {
  for (let nivel = 1; nivel < 20; nivel += 1) {
    assert.ok(xpParaSubirDe(nivel + 1) > xpParaSubirDe(nivel));
  }
});

test('el nivel derivado de la XP es coherente con el coste de cada nivel', () => {
  assert.deepEqual(nivelDesdeXp(0), { nivel: 1, xpEnNivel: 0, xpParaSiguiente: xpParaSubirDe(1) });

  const justoAntes = xpParaSubirDe(1) - 1;
  assert.equal(nivelDesdeXp(justoAntes).nivel, 1);
  assert.equal(nivelDesdeXp(xpParaSubirDe(1)).nivel, 2);

  const hastaNivel4 = xpParaSubirDe(1) + xpParaSubirDe(2) + xpParaSubirDe(3);
  assert.equal(nivelDesdeXp(hastaNivel4).nivel, 4);
  assert.equal(nivelDesdeXp(hastaNivel4).xpEnNivel, 0);
});
