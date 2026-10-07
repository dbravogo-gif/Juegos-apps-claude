// Pruebas de la versión 3: mercado, competencia, acontecimientos y reputación.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { POR_ID } from '../src/data/aeropuertos.js';
import { AEROLINEAS, AEROLINEA, MAX_ACTIVAS } from '../src/data/aerolineas.js';
import { HISTORICOS } from '../src/data/acontecimientos.js';
import { demandaBase, repartir, infoMercado, paxJugador, estimarJugador } from '../src/core/mercado.js';
import { crearCompetencia, cicloCompetencia, permitido, activas } from '../src/core/competencia.js';
import { crearMundoNoticias, avanzarMundo, factorDemanda, cierre } from '../src/core/mundo.js';
import { precioTarifa, liberalizado } from '../src/core/economia.js';
import * as Reputacion from '../src/core/reputacion.js';
import { nuevaPartida, comprarNuevo, crearRuta, asignar, cambiarTarifa, avanzar } from '../src/core/sim.js';
import { MIN_DIA, anioDecimal } from '../src/core/tiempo.js';

const enAnio = (anio, dias = 110) => ((anio - 1976) * 365.25 + dias) * MIN_DIA;
const d = (o, x, anio) => demandaBase(POR_ID[o], POR_ID[x], enAnio(anio));

test('mercado: demanda de 1976 cerca de las rutas de referencia', () => {
  const casos = [['MAD', 'BCN', 1600], ['LPA', 'TFN', 1200], ['LPA', 'MAD', 900], ['LHR', 'CDG', 3000], ['LHR', 'JFK', 3400]];
  for (const [o, x, objetivo] of casos) {
    const v = d(o, x, 1976);
    assert.ok(v > objetivo * 0.6 && v < objetivo * 1.5, `${o}-${x}: ${Math.round(v)} frente a ~${objetivo}`);
  }
});

test('mercado: los mercados emergentes crecen y los de nicho siguen pequeños', () => {
  assert.ok(d('BCN', 'PRG', 2010) > d('BCN', 'PRG', 1976) * 5, 'Barcelona–Praga despega tras 1990');
  assert.ok(d('PNA', 'CDG', 2010) < 400, 'Pamplona–París es un nicho');
  assert.ok(d('LPA', 'TFN', 2010) < 6000, 'el crecimiento es razonable');
});

test('mercado: el reparto no inventa pasajeros y el precio bajo atrae', () => {
  const ops = [
    { id: 'a', asientos: 1000, precio: 1, nota: 60, servicio: 'estandar' },
    { id: 'b', asientos: 300, precio: 0.8, nota: 50, servicio: 'basico' },
  ];
  const { total, ops: con } = repartir(900, ops, 'turistica');
  const suma = con.reduce((s, x) => s + x.pax, 0);
  assert.ok(suma <= total + 1e-6);
  for (const x of con) assert.ok(x.pax <= x.asientos * 0.97 + 1e-6);
  assert.ok(con[1].pax / con[1].asientos > con[0].pax / con[0].asientos, 'el barato llena más');
});

test('competencia: regulación por época', () => {
  const castilla = AEROLINEA.castilla;
  assert.equal(permitido(castilla, POR_ID.FRA, POR_ID.CDG, 1985), false, 'antes de 1993 no vuela entre dos países extranjeros');
  assert.equal(permitido(castilla, POR_ID.FRA, POR_ID.CDG, 1995), true, 'con el mercado único sí');
  assert.equal(permitido(AEROLINEA.depie, POR_ID.MAD, POR_ID.BCN, 1995), false, 'sin cabotaje todavía');
  assert.equal(permitido(AEROLINEA.depie, POR_ID.MAD, POR_ID.BCN, 1998), true, 'cabotaje desde 1997');
  assert.equal(permitido(AEROLINEA.burkirates, POR_ID.MAD, POR_ID.LHR, 2010), false, 'las de fuera, solo desde su país');
});

test('competencia: precios regulados hasta la liberalización', () => {
  assert.equal(liberalizado(POR_ID.LPA, POR_ID.MAD, 1980), false);
  assert.ok(Math.abs(precioTarifa('economica', 1980, POR_ID.LPA, POR_ID.MAD) - 0.9) < 1e-9);
  assert.ok(Math.abs(precioTarifa('economica', 1995, POR_ID.LPA, POR_ID.MAD) - 0.8) < 1e-9);
  assert.equal(liberalizado(POR_ID.JFK, POR_ID.MIA, 1980), true, 'EE. UU. desregula en 1978');
});

test('competencia: 22 compañías y nunca más de 15 activas en 50 años', () => {
  assert.equal(AEROLINEAS.length, 22);
  const estado = { semilla: 5, t: 8 * 60, nombre: 'T', base: 'LPA', pais: 'ES', rutas: [], aviones: [], siguienteId: 1, reputacion: Reputacion.reputacionInicial() };
  estado.mundo = crearMundoNoticias();
  crearCompetencia(estado);
  assert.equal(activas(estado).length, 13);
  let maximo = 0;
  const noticiasAntes = estado.mundo.noticias.length;
  for (let mes = 0; mes < 50 * 12; mes += 3) {
    estado.t = enAnio(1976, mes * 30.44 + 15);
    avanzarMundo(estado, estado.t);
    cicloCompetencia(estado, estado.t);
    maximo = Math.max(maximo, activas(estado).length);
  }
  assert.ok(maximo <= MAX_ACTIVAS, `máximo ${maximo}`);
  assert.equal(estado.mundo.aerolineas.breadam.activa, false, 'Bread Am quiebra en 1991');
  assert.equal(estado.mundo.aerolineas.aviacutre.activa, false, 'Aviacutre se integra en Castilla');
  assert.equal(estado.mundo.aerolineas.flyando.activa, true);
  assert.ok(estado.mundo.noticias.length > noticiasAntes);
});

test('mundo: acontecimientos graduales y cierres', () => {
  const mundo = crearMundoNoticias();
  const antes = factorDemanda(mundo, POR_ID.MAD, POR_ID.SVQ, enAnio(1990));
  const despues = factorDemanda(mundo, POR_ID.MAD, POR_ID.SVQ, enAnio(1994));
  assert.ok(despues / antes < 0.6, 'el AVE resta pasaje a Madrid–Sevilla');
  assert.ok(cierre(mundo, POR_ID.LHR, POR_ID.MAD, enAnio(2010, 0.295 * 365.25)), 'la ceniza del volcán cierra Londres');
  assert.ok(cierre(mundo, POR_ID.LHR, POR_ID.JFK, enAnio(2001, 0.1 * 365.25), true), 'el Concorde está en tierra tras el accidente');
  assert.equal(cierre(mundo, POR_ID.LHR, POR_ID.JFK, enAnio(2001, 0.1 * 365.25), false), null);
  const fechas = HISTORICOS.map((h) => h.fecha);
  assert.deepEqual(fechas, [...fechas].sort((a, b) => a - b), 'históricos en orden');
});

test('mundo: las noticias locales se anuncian y luego pasan o no', () => {
  const estado = { semilla: 9, t: 8 * 60, nombre: 'T', base: 'LPA', pais: 'ES', rutas: [], aviones: [], siguienteId: 1 };
  estado.mundo = crearMundoNoticias();
  let anuncios = 0;
  let resueltos = 0;
  for (let dia = 0; dia < 365 * 4; dia++) {
    estado.t = dia * MIN_DIA + 8 * 60;
    avanzarMundo(estado, estado.t);
  }
  for (const ev of estado.mundo.eventos) { anuncios++; if (ev.fase !== 'anunciado') resueltos++; }
  assert.ok(anuncios > 5, `${anuncios} acontecimientos`);
  assert.ok(resueltos > 0);
  const porAnio = estado.mundo.noticias.length / 4;
  assert.ok(porAnio < 30, `${porAnio} noticias al año`);
});

test('reputación: puntualidad, seguridad y etiquetas', () => {
  const rep = Reputacion.reputacionInicial();
  for (let i = 0; i < 100; i++) Reputacion.trasVuelo(rep, { retraso: 120 });
  assert.ok(rep.puntualidad < 40, 'los retrasos hunden la puntualidad');
  const seguridad = rep.seguridad;
  Reputacion.trasAccidente(rep);
  assert.ok(rep.seguridad < seguridad - 30);
  assert.equal(Reputacion.etiqueta(85), 'excelente');
  assert.equal(Reputacion.etiqueta(20), 'mala');
});

test('partida: el jugador compite por el pasaje y la tarifa económica le da más', () => {
  const e = nuevaPartida({ nombre: 'Atlántica', base: 'LPA', semilla: 11 });
  e.caja = 50e6;
  assert.equal(comprarNuevo(e, 'b737'), null);
  assert.equal(crearRuta(e, 'MAD'), null);
  assert.equal(asignar(e, e.aviones[0].id, e.rutas[0].id), null);
  avanzar(e, 2 * MIN_DIA);
  const normal = paxJugador(e, POR_ID.LPA, POR_ID.MAD, e.t);
  assert.ok(normal > 0 && normal < 2 * 120, `${normal}`);
  cambiarTarifa(e, e.rutas[0].id, 'economica');
  const barata = paxJugador(e, POR_ID.LPA, POR_ID.MAD, e.t);
  assert.ok(barata > normal);
  const info = infoMercado(e, POR_ID.LPA, POR_ID.MAD);
  assert.ok(info.operadores.some((x) => x.id === 'jugador'));
  assert.ok(info.operadores.some((x) => x.nombre === 'Castilla'));
  assert.ok(estimarJugador(e, POR_ID.LPA, POR_ID.BCN, { asientos: 120 }) > 0);
});
