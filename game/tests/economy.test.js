import test from 'node:test';
import assert from 'node:assert/strict';

import {
  recompensaDelDia,
  presupuestoExtras,
  otorgarExtra,
  valorReventa,
} from '../src/core/economy/rewards.js';
import { xpParaSubirDe, nivelDesdeXp } from '../src/core/economy/levels.js';
import { mediaReciente } from '../src/core/day.js';
import { TOPE_EXTRAS } from '../src/core/constants.js';

test('un día cumplido cobra proporcionalmente al cumplimiento', () => {
  const pleno = recompensaDelDia({ cumplimientoEntreno: 1, puntuacionComida: 1 });
  const justo = recompensaDelDia({ cumplimientoEntreno: 0.8, puntuacionComida: 0.8 });
  assert.equal(justo.entreno.xp, Math.round(pleno.entreno.xp * 0.8));
  assert.equal(justo.comida.xp, Math.round(pleno.comida.xp * 0.8));
});

test('un día por debajo del umbral rinde la mitad', () => {
  const fallado = recompensaDelDia({ cumplimientoEntreno: 0.4, puntuacionComida: null });
  assert.equal(fallado.entreno.xp, Math.round(100 * 0.4 * 0.5));
});

test('el salto de penalización cae justo en el umbral del día cumplido', () => {
  const cumplido = recompensaDelDia({ cumplimientoEntreno: 0.75, puntuacionComida: null });
  const fallado = recompensaDelDia({ cumplimientoEntreno: 0.74, puntuacionComida: null });
  assert.equal(cumplido.entreno.xp, 75);
  assert.equal(fallado.entreno.xp, 37);
});

test('al que empieza y cumple al 80 % no se le penaliza', () => {
  const principiante = recompensaDelDia({ cumplimientoEntreno: 0.8, puntuacionComida: 0.8 });
  assert.equal(principiante.entreno.xp, 80);
  assert.equal(principiante.comida.xp, 32);
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

test('superar la propia media reciente también abre los extras', () => {
  const total = { xp: 100, monedas: 50 };
  const dia = { cumplimientoEntreno: 0.8, puntuacionComida: 0.6, mediaEntreno: 0.7, mediaComida: 0.6 };
  const presupuesto = presupuestoExtras(dia, total);
  assert.equal(presupuesto.desbloqueado, true);
  assert.equal(presupuesto.via, 'mejora');
});

test('la constancia abre los extras aunque el cumplimiento no mejore nunca', () => {
  const total = { xp: 100, monedas: 50 };
  const estable = {
    cumplimientoEntreno: 0.8,
    puntuacionComida: 0.8,
    mediaEntreno: 0.8,
    mediaComida: 0.8,
    rachaEntrenoActiva: true,
    rachaComidaActiva: true,
  };
  const presupuesto = presupuestoExtras(estable, total);
  assert.equal(presupuesto.desbloqueado, true);
  assert.equal(presupuesto.via, 'constancia');

  // Sin racha viva, ese mismo día estable no abre nada.
  assert.equal(
    presupuestoExtras({ ...estable, rachaEntrenoActiva: false, rachaComidaActiva: false }, total)
      .desbloqueado,
    false,
  );
});

test('la mejora sobre la media exige un margen real, no milésimas', () => {
  const total = { xp: 100, monedas: 50 };
  const porPelos = { cumplimientoEntreno: 0.8, mediaEntreno: 0.7999, puntuacionComida: null };
  assert.equal(presupuestoExtras(porPelos, total).desbloqueado, false);

  const deVerdad = { cumplimientoEntreno: 0.8, mediaEntreno: 0.75, puntuacionComida: null };
  assert.equal(presupuestoExtras(deVerdad, total).desbloqueado, true);
});

test('mejorar la media no basta si el día no llega a cumplido', () => {
  const total = { xp: 100, monedas: 50 };
  const dia = { cumplimientoEntreno: 0.6, puntuacionComida: 0.4, mediaEntreno: 0.3, mediaComida: 0.2 };
  assert.equal(presupuestoExtras(dia, total).desbloqueado, false);
});

test('la media reciente no cuenta el propio día y exige historial suficiente', () => {
  const historial = [0.9, 0.9, 0.9, 0.5].map((c) => ({ entreno: { cumplimiento: c } }));
  const extraer = (d) => (d.entreno ? d.entreno.cumplimiento : null);

  assert.equal(mediaReciente(historial, 2, extraer), null, 'con 2 registros previos aún no hay media');
  assert.equal(mediaReciente(historial, 3, extraer), 0.9);
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
