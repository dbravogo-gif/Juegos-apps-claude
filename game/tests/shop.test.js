import test from 'node:test';
import assert from 'node:assert/strict';

import { puedeComprar, puedeVender, ranuraDe, articuloPorId } from '../src/core/economy/shop.js';
import { sumaExtras, otorgarExtra, presupuestoExtras } from '../src/core/economy/rewards.js';

test('no se puede comprar por encima del propio nivel', () => {
  const caro = { articuloId: 'arma_sable', nivel: 5, monedas: 99999, inventario: [] };
  assert.equal(puedeComprar(caro).motivo, 'nivel');

  assert.equal(puedeComprar({ ...caro, nivel: 10 }).ok, true);
});

test('no se puede comprar sin monedas ni dos veces lo mismo', () => {
  const base = { articuloId: 'mub_taburete', nivel: 5, monedas: 10, inventario: [] };
  assert.equal(puedeComprar(base).motivo, 'monedas');

  assert.equal(puedeComprar({ ...base, monedas: 500 }).ok, true);
  assert.equal(puedeComprar({ ...base, monedas: 500, inventario: ['mub_taburete'] }).motivo, 'repetido');
});

test('vender devuelve el 25 % y solo funciona con lo que tienes', () => {
  const articulo = articuloPorId('mub_divan');
  const venta = puedeVender({ articuloId: 'mub_divan', inventario: ['mub_divan'] });

  assert.equal(venta.ok, true);
  assert.equal(venta.reembolso, Math.floor(articulo.precio * 0.25));
  assert.equal(puedeVender({ articuloId: 'mub_divan', inventario: [] }).ok, false);
});

test('explotación: comprar y revender no genera monedas', () => {
  const articulo = articuloPorId('arma_hacha');
  const venta = puedeVender({ articuloId: articulo.id, inventario: [articulo.id] });
  assert.ok(venta.reembolso < articulo.precio);
});

test('solo el equipo ocupa ranura', () => {
  assert.equal(ranuraDe('arma_sable'), 'arma');
  assert.equal(ranuraDe('arm_cuero'), 'armadura');
  assert.equal(ranuraDe('acc_amuleto'), 'accesorio');
  assert.equal(ranuraDe('mub_taburete'), null);
});

test('los extras del día se acumulan y topan el presupuesto', () => {
  const total = { xp: 200, monedas: 100 };
  const presupuesto = presupuestoExtras({ cumplimientoEntreno: 1, puntuacionComida: 1 }, total);

  const extras = [];
  let gastado = sumaExtras(extras);
  assert.deepEqual(gastado, { xp: 0, monedas: 0 });

  for (let i = 0; i < 4; i += 1) {
    const premio = otorgarExtra(presupuesto, gastado, { xp: 25, monedas: 12 });
    extras.push(premio);
    gastado = sumaExtras(extras);
  }

  assert.equal(gastado.xp, presupuesto.xp);
  assert.equal(gastado.monedas, presupuesto.monedas);
});

test('sin presupuesto desbloqueado un extra no paga nada', () => {
  const bloqueado = presupuestoExtras({ cumplimientoEntreno: 0.5, puntuacionComida: 0.5 }, { xp: 100, monedas: 50 });
  const premio = otorgarExtra(bloqueado, { xp: 0, monedas: 0 }, { xp: 30, monedas: 20 });

  assert.deepEqual({ xp: premio.xp, monedas: premio.monedas }, { xp: 0, monedas: 0 });
});
