import { test } from 'node:test';
import assert from 'node:assert/strict';

import { AEROPUERTOS, POR_ID, abiertoEn } from '../src/data/aeropuertos.js';
import { TIPOS } from '../src/data/aviones.js';
import { generador, hash } from '../src/core/azar.js';
import { climaEn, probabilidades } from '../src/core/clima.js';
import { distanciaKm } from '../src/core/geo.js';
import { evaluarVuelo, resolverVuelo, factorEpoca } from '../src/core/riesgo.js';
import { demandaMercado } from '../src/core/economia.js';
import {
  nuevaPartida, avanzar, comprar, crearRuta, asignar, decidir, puedeOperar, inspeccionar,
} from '../src/core/sim.js';
import { MIN_DIA } from '../src/core/tiempo.js';

const avionSano = (extra = {}) => ({
  partes: { motores: 95, tren: 95, fuselaje: 95 }, defectos: [], horasDesdeRevision: 0, horasHoy: 0, ...extra,
});

function evaluar({ avion = avionSano(), tipo = 'b737', origen = 'MAD', destino = 'LPA', t = 0, semilla = 1, extra = false } = {}) {
  const o = POR_ID[origen];
  const d = POR_ID[destino];
  return evaluarVuelo({
    avion, tipo: TIPOS[tipo], origen: o, destino: d, t, semilla, distancia: distanciaKm(o, d), duracion: 150, combustibleExtra: extra,
  });
}

// Busca una franja con el tiempo pedido en un aeropuerto.
function franjaCon(aeropuerto, tipo, sev = 3) {
  for (let t = 0; t < 400 * MIN_DIA; t += 360) {
    const c = climaEn(aeropuerto, t + 150, 1);
    if (c.tipo === tipo && c.sev >= sev) return t;
  }
  throw new Error(`No hay ${tipo} en ${aeropuerto.id}`);
}

test('datos: aeropuertos únicos, Canarias completa y aperturas posteriores', () => {
  const ids = AEROPUERTOS.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ['LPA', 'TFN', 'TFS', 'ACE', 'FUE', 'SPC', 'VDE', 'GMZ']) assert.ok(POR_ID[id], id);
  assert.equal(abiertoEn(POR_ID.TFS, 1976), false);
  assert.equal(abiertoEn(POR_ID.TFS, 1978), true);
  assert.equal(abiertoEn(POR_ID.GMZ, 1990), false);
});

test('azar: misma semilla, misma secuencia', () => {
  const a = generador(42);
  const b = generador(42);
  for (let i = 0; i < 10; i++) assert.equal(a(), b());
  assert.notEqual(hash(1, 'x'), hash(2, 'x'));
});

test('clima: estable por franja y estacional', () => {
  const lhr = POR_ID.LHR;
  assert.deepEqual(climaEn(lhr, 1000, 7), climaEn(lhr, 1000, 7));
  assert.ok(probabilidades(lhr, 0).niebla > probabilidades(lhr, 6).niebla, 'más niebla en invierno en Londres');
  // Hemisferio sur: en julio es invierno en Buenos Aires.
  assert.ok(probabilidades(POR_ID.EZE, 6).niebla > probabilidades(POR_ID.EZE, 0).niebla);
});

test('riesgo: la niebla sin ILS es mucho peor que con ILS', () => {
  const tSin = franjaCon(POR_ID.TFN, 'niebla');
  const sinIls = evaluar({ destino: 'TFN', t: tSin });
  const tCon = franjaCon(POR_ID.LHR, 'niebla');
  const conIls = evaluar({ destino: 'LHR', t: tCon });
  assert.ok(sinIls.porCausa.aproximacion > conIls.porCausa.aproximacion * 5);
});

test('riesgo: el combustible extra reduce el riesgo meteorológico en destino', () => {
  const t = franjaCon(POR_ID.TFN, 'niebla');
  const sin = evaluar({ destino: 'TFN', t });
  const con = evaluar({ destino: 'TFN', t, extra: true });
  assert.ok(con.total < sin.total * 0.6);
});

test('riesgo: un avión gastado y con la revisión vencida es más peligroso', () => {
  const sano = evaluar();
  const viejo = evaluar({ avion: avionSano({ partes: { motores: 40, tren: 50, fuselaje: 60 }, horasDesdeRevision: 700 }) });
  assert.ok(viejo.total > sano.total * 5);
});

test('riesgo: los defectos ocultos cuentan pero no se ven', () => {
  const avion = avionSano({ defectos: [{ id: 1, pieza: 'motores', gravedad: 3, texto: 'x', descubierto: false }] });
  const e = evaluar({ avion });
  assert.ok(e.total > e.visible);
});

test('riesgo: la época abarata el riesgo', () => {
  assert.ok(factorEpoca(20 * 365 * MIN_DIA) < factorEpoca(0) * 0.6);
});

test('resolver: con riesgo cero nunca hay accidente', () => {
  const e = { total: 0, porCausa: { aproximacion: 0, pista: 0, vuelo: 0 }, meteoDestino: 0, combustibleExtra: false };
  const r = generador(3);
  for (let i = 0; i < 1000; i++) assert.equal(resolverVuelo(e, r).resultado, 'normal');
});

test('resolver: la frecuencia de accidentes se acerca al riesgo', () => {
  const e = { total: 0.1, porCausa: { aproximacion: 0.1, pista: 0, vuelo: 0 }, meteoDestino: 0, combustibleExtra: false };
  const r = generador(9);
  let n = 0;
  for (let i = 0; i < 5000; i++) if (resolverVuelo(e, r).resultado === 'accidente') n++;
  assert.ok(n > 400 && n < 600, String(n));
});

test('demanda: más entre ciudades grandes y entre islas', () => {
  assert.ok(demandaMercado(POR_ID.MAD, POR_ID.LHR, 0) > demandaMercado(POR_ID.MAD, POR_ID.VDE, 0));
  assert.ok(demandaMercado(POR_ID.LPA, POR_ID.TFN, 0) > demandaMercado(POR_ID.LPA, POR_ID.DKR, 0));
});

function partidaConAvion(base = 'LPA', destino = 'TFN') {
  const e = nuevaPartida({ nombre: 'Atlántica', base, semilla: 123 });
  const oferta = e.mercado.find((o) => puedeOperar(e, o.avion, destino) === null && o.precio <= e.caja);
  assert.ok(oferta, 'hay una oferta que puede volar la ruta');
  assert.equal(comprar(e, oferta.id), null);
  assert.equal(crearRuta(e, destino), null);
  assert.equal(asignar(e, oferta.avion.id, e.rutas[0].id), null);
  return e;
}

test('partida: nueva, con mercado y en 1976', () => {
  const e = nuevaPartida({ nombre: 'Atlántica', base: 'LPA', semilla: 1 });
  assert.equal(e.codigo, 'AT');
  assert.equal(e.mercado.length, 6);
  assert.equal(e.caja, 3e6);
});

test('partida: no se puede abrir ruta a un aeropuerto que aún no existe', () => {
  const e = nuevaPartida({ nombre: 'Atlántica', base: 'LPA', semilla: 1 });
  assert.match(crearRuta(e, 'GMZ'), /todavía no existe/);
});

test('partida: inspeccionar revela los defectos', () => {
  const e = nuevaPartida({ nombre: 'Atlántica', base: 'LPA', semilla: 5 });
  const o = e.mercado[0];
  assert.equal(inspeccionar(e, o.id), null);
  assert.ok(o.avion.defectos.every((d) => d.descubierto));
});

test('partida: los aviones vuelan, ganan dinero y se paran a preguntar', () => {
  const e = partidaConAvion();
  e.ajustes.umbral = 1; // nunca preguntar
  avanzar(e, 5 * MIN_DIA);
  const a = e.aviones[0] ?? null;
  assert.ok(e.rutas[0].stats.vuelos > 4 || e.accidentes.length, 'ha volado');
  if (a) assert.ok(a.horas > 0);

  const e2 = partidaConAvion();
  e2.ajustes.umbral = 0; // preguntar siempre
  const eventos = avanzar(e2, 2 * MIN_DIA);
  assert.equal(e2.decisiones.length, 1);
  assert.ok(eventos.some((x) => x.tipo === 'decision'));
  const t = e2.t;
  avanzar(e2, 60);
  assert.equal(e2.t, t, 'el reloj no avanza con una decisión pendiente');
  decidir(e2, e2.decisiones[0].id, 'despegar');
  assert.equal(e2.decisiones.length, 0);
  assert.equal(e2.aviones[0].estado, 'vuelo');
});

test('partida: un accidente quita el avión, hunde la reputación y abre investigación', () => {
  const e = partidaConAvion();
  e.ajustes.umbral = 1;
  const a = e.aviones[0];
  a.partes = { motores: 5, tren: 5, fuselaje: 5 };
  a.horasDesdeRevision = 900;
  let accidente = null;
  for (let i = 0; i < 400 && !accidente; i++) {
    accidente = avanzar(e, 60).find((x) => x.tipo === 'accidente')?.accidente ?? null;
    if (e.aviones[0]) Object.assign(e.aviones[0].partes, { motores: 5, tren: 5, fuselaje: 5 });
  }
  assert.ok(accidente, 'acaba estrellándose');
  assert.equal(e.aviones.length, 0);
  assert.ok(e.reputacion < 30);
  assert.ok(accidente.fallecidos + accidente.heridos <= accidente.pax + accidente.tripulantes);
  assert.ok(accidente.negligencia, 'volar con la revisión vencida es negligencia');
  const eventos = avanzar(e, 31 * MIN_DIA);
  assert.ok(eventos.some((x) => x.tipo === 'investigacion') || e.quiebra);
});

test('partida: determinista con la misma semilla', () => {
  const a = partidaConAvion();
  const b = partidaConAvion();
  a.ajustes.umbral = 1;
  b.ajustes.umbral = 1;
  avanzar(a, 10 * MIN_DIA);
  avanzar(b, 10 * MIN_DIA);
  assert.equal(a.caja, b.caja);
  assert.equal(a.t, b.t);
});
