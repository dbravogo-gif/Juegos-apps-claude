import { test } from 'node:test';
import assert from 'node:assert/strict';

import { AEROPUERTOS, POR_ID, abiertoEn, pistaEn } from '../src/data/aeropuertos.js';
import { TIPOS } from '../src/data/aviones.js';
import { MOTORES } from '../src/data/motores.js';
import { AVERIAS } from '../src/data/averias.js';
import { TECNOLOGIAS, equipoDeSerie, puedeInstalar } from '../src/data/tecnologias.js';
import { generador, hash } from '../src/core/azar.js';
import { climaEn, probabilidades } from '../src/core/clima.js';
import { esTierra, fraccionSobreMar, distanciaKm } from '../src/core/geo.js';
import { evaluarTramo, evaluarRuta } from '../src/core/operaciones.js';
import { amenazas, estimar, minimos } from '../src/core/riesgo.js';
import { inspeccionar, diagnosticar, aplicarRevision, revisarMotor, irregularidades } from '../src/core/mantenimiento.js';
import { crearAvion, nuevaAveria, ofertaSegundaMano, valorMercado } from '../src/core/flota.js';
import { indice, precioCombustibleKg, costeCatering } from '../src/core/economia.js';
import { investigar } from '../src/core/investigacion.js';
import {
  nuevaPartida, avanzar, comprarNuevo, crearRuta, asignar, decidir, contextoVuelo, inspeccionar as inspeccionarOferta,
  pedirRetrofit, informeDespacho, debePreguntar,
} from '../src/core/sim.js';
import { MIN_DIA } from '../src/core/tiempo.js';

const estadoMin = () => ({ siguienteId: 1, t: 0, base: 'LPA', pais: 'ES' });

// ---------------------------------------------------------------- datos

test('datos: aeropuertos únicos, Canarias completa y datos verificados', () => {
  const ids = AEROPUERTOS.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ['LPA', 'TFN', 'TFS', 'ACE', 'FUE', 'SPC', 'VDE', 'GMZ']) assert.ok(POR_ID[id], id);
  assert.equal(POR_ID.TFN.ils, 1, 'Tenerife Norte tiene ILS desde 1971');
  assert.equal(pistaEn(POR_ID.VDE, 1976), 1000);
  assert.equal(pistaEn(POR_ID.VDE, 1995), 1205);
  assert.equal(pistaEn(POR_ID.FNC, 1990), 1800);
  assert.equal(abiertoEn(POR_ID.TFS, 1976), false);
});

test('datos: los aviones son coherentes por dentro', () => {
  for (const t of Object.values(TIPOS)) {
    assert.ok(MOTORES[t.motor], `${t.id}: motor ${t.motor}`);
    assert.ok(t.alcance <= t.alcanceMax, `${t.id}: alcance`);
    assert.ok(t.pistaMin < t.pistaMTOW, `${t.id}: pistas`);
    assert.ok(t.mtow > 0 && t.consumo > 0 && t.plazas > 0, t.id);
    assert.ok(t.entrada <= t.finProduccion, t.id);
  }
  // El 727 lleva mecánico de vuelo; el 737, no.
  assert.equal(TIPOS.b727.tecnica, 3);
  assert.equal(TIPOS.b737.tecnica, 2);
  assert.equal(TIPOS.concorde.entrada, 1976);
});

test('tecnologías: fechas y equipo de serie según la época', () => {
  assert.equal(TECNOLOGIAS.gpws.desde, 1974);
  assert.equal(TECNOLOGIAS.tcas.estandarDesde, 1993);
  assert.equal(equipoDeSerie(TIPOS.b737, 1976).gpws, false);
  assert.equal(equipoDeSerie(TIPOS.b737, 1985).gpws, true);
  assert.equal(equipoDeSerie(TIPOS.b737, 1976).radar, true);
  assert.equal(equipoDeSerie(TIPOS.c212, 1976).radar, false);
  const a = { equipo: { gpws: false } };
  assert.equal(puedeInstalar('gpws', a, 1976), null);
  assert.match(puedeInstalar('tcas', a, 1976), /No existe/);
  assert.match(puedeInstalar('egpws', { equipo: { gpws: false } }, 2000), /Necesita/);
});

test('economía: índices y catering sin regla absurda', () => {
  assert.equal(indice(1976), 1);
  assert.ok(indice(1990) > 2);
  assert.ok(precioCombustibleKg(1980) > precioCombustibleKg(1976) * 2, 'la crisis del petróleo');
  // Un gran aeropuerto de un país caro puede salir a cuenta con volumen.
  const zurichConVolumen = costeCatering('estandar', 2, POR_ID.ZRH, 12, 1976);
  const zurichSinVolumen = costeCatering('estandar', 2, POR_ID.ZRH, 1, 1976);
  assert.ok(zurichConVolumen < zurichSinVolumen);
});

// ---------------------------------------------------------------- geografía y operación

test('geo: máscara de tierra y mar', () => {
  assert.equal(esTierra(40.4, -3.7), 1);
  assert.equal(esTierra(30, -40), 0);
  assert.ok(fraccionSobreMar(POR_ID.LHR, POR_ID.JFK) > 0.6);
  assert.ok(fraccionSobreMar(POR_ID.MAD, POR_ID.LHR) < fraccionSobreMar(POR_ID.LHR, POR_ID.JFK));
});

test('operación: el F27 opera en El Hierro; el 737 no; el 727 entra en Madeira', () => {
  const f27 = evaluarRuta('f27', 'TFN', 'VDE', 1976);
  assert.ok(f27.posible, f27.motivo);
  assert.ok(evaluarRuta('b727', 'LIS', 'FNC', 1976).posible, 'TAP operaba 727 en Madeira');
  // Desde una pista corta, cuanto más largo el tramo, menos pasajeros.
  assert.ok(evaluarTramo('f27', 'VDE', 'LIS', 1976).plazasMax < TIPOS.f27.plazas);
  const b737 = evaluarRuta('b737', 'TFN', 'VDE', 1976);
  assert.equal(b737.posible, false);
  assert.match(b737.motivo, /Pista/);
});

test('operación: alcance, bimotores sobre el mar y Concorde en Nueva York', () => {
  assert.equal(evaluarRuta('b737', 'LPA', 'JFK', 1976).posible, false);
  const caracas = evaluarRuta('a300', 'LPA', 'CCS', 1976);
  assert.equal(caracas.posible, false, 'un bimotor no cruza el Atlántico en 1976');
  assert.ok(evaluarRuta('dc10', 'LPA', 'CCS', 1976).posible, 'un trirreactor sí');
  assert.equal(evaluarTramo('concorde', 'LHR', 'JFK', 1977.5).posible, false);
  assert.ok(evaluarTramo('concorde', 'LHR', 'JFK', 1978).posible);
  const concorde = evaluarTramo('concorde', 'LHR', 'JFK', 1978);
  const b707 = evaluarTramo('b707', 'LHR', 'JFK', 1978);
  assert.ok(concorde.duracion < b707.duracion * 0.62);
  assert.ok(evaluarRuta('b737', 'LPA', 'LGW', 1976).posible, 'los 737 hacían Canarias–Reino Unido');
});

// ---------------------------------------------------------------- riesgo

function ctxPrueba({ destino = 'TFN', clima = { tipo: 'niebla', sev: 3 }, equipo = {}, extra = false, averias = [], revisiones = {}, irregularidades = [] } = {}) {
  const tipo = TIPOS.b727;
  const avion = {
    averias, equipo: { radar: true, gpws: false, ...equipo }, inop: {},
    revisiones: { A: 0, C: 0, D: 0, ...revisiones },
    motores: Array.from({ length: tipo.nMotores }, (_, i) => ({ pos: i + 1, horasRG: 0 })),
  };
  const c = { origen: { tipo: 'despejado', sev: 0 }, destino: clima, ruta: { tipo: 'despejado', sev: 0 } };
  return {
    avion, tipo, origen: POR_ID.LPA, destino: POR_ID[destino], anio: 1976, t: 0, duracion: 45,
    clima: c, prevision: c, combustibleExtra: extra, jornada: 6, noche: false,
    cargaPorPista: 1, pistaDestino: 3400, irregularidades, despachoIrregular: irregularidades.length > 0,
  };
}

const riesgoTotal = (ctx, vision = 'real') => amenazas(ctx, vision).reduce((s, e) => s + e.p * (e.esc ?? 0), 0);

test('riesgo: niebla por debajo de mínimos suele acabar en desvío, no en accidente', () => {
  const ctx = ctxPrueba();
  assert.ok(150 < minimos(POR_ID.TFN, TIPOS.b727));
  const e = amenazas(ctx).find((x) => x.id === 'bajoMinimos');
  assert.ok(e, 'hay amenaza de mínimos');
  assert.ok(e.esc < 0.02, `escalada ${e.esc}`);
});

test('riesgo: el GPWS reduce el CFIT y el combustible extra reduce la presión', () => {
  const sin = amenazas(ctxPrueba()).find((x) => x.id === 'bajoMinimos');
  const con = amenazas(ctxPrueba({ equipo: { gpws: true } })).find((x) => x.id === 'bajoMinimos');
  assert.ok(con.esc < sin.esc * 0.5);
  const extra = amenazas(ctxPrueba({ extra: true })).find((x) => x.id === 'bajoMinimos');
  assert.ok(extra.continuar < sin.continuar);
});

test('riesgo: el radar meteorológico reduce la turbulencia en tormenta', () => {
  const base = ctxPrueba({ clima: { tipo: 'despejado', sev: 0 } });
  base.clima = { ...base.clima, ruta: { tipo: 'tormenta', sev: 2 } };
  base.prevision = base.clima;
  const con = amenazas(base).find((x) => x.id === 'turbulencia');
  base.avion.equipo.radar = false;
  const sin = amenazas(base).find((x) => x.id === 'turbulencia');
  assert.ok(sin.p > con.p * 3);
});

test('riesgo: un vuelo normal tiene riesgo grave muy bajo', () => {
  const ctx = ctxPrueba({ clima: { tipo: 'despejado', sev: 0 } });
  const est = estimar(ctx);
  assert.ok(est.pAccidente < 0.0001, String(est.pAccidente));
});

test('riesgo: una avería oculta no la ve el despacho pero sí cuenta', () => {
  const averia = { id: 1, codigo: 'egt', motor: 1, progreso: 0.95, fase: 'oculta' };
  const ctx = ctxPrueba({ clima: { tipo: 'despejado', sev: 0 }, averias: [averia] });
  const real = amenazas(ctx, 'real').filter((x) => x.averia === 1);
  const despacho = amenazas(ctx, 'despacho').filter((x) => x.averia === 1);
  assert.ok(real.length > 0);
  assert.equal(despacho.length, 0);
});

test('riesgo: escala de conducta, del avión cuidado al abandonado', () => {
  const despejado = { tipo: 'despejado', sev: 0 };
  const cuidado = riesgoTotal(ctxPrueba({ clima: despejado }));
  // Revisión A pasada un 30 %: algo peor, nada dramático.
  const descuido = riesgoTotal(ctxPrueba({ clima: despejado, revisiones: { A: 200 } }));
  // Todo vencido desde hace mucho: A, C y la general de los motores.
  const abandonado = ctxPrueba({ clima: despejado, revisiones: { A: 1500, C: 6000 } });
  for (const m of abandonado.avion.motores) m.horasRG = 12000;
  const malo = riesgoTotal(abandonado);
  assert.ok(cuidado < 0.0001, `cuidado ${cuidado}`);
  assert.ok(descuido > cuidado && descuido < cuidado * 5, `descuido ${descuido}`);
  assert.ok(malo > 0.005 && malo < 0.05, `abandonado ${malo}`);
  // El despacho lo ve: un avión abandonado no sale como «muy bajo».
  assert.ok(estimar(abandonado).pAccidente > 0.003);
});

test('riesgo: despachar con la previsión bajo mínimos multiplica el riesgo', () => {
  const legal = riesgoTotal(ctxPrueba());
  const irregular = riesgoTotal(ctxPrueba({ irregularidades: [{ codigo: 'minimos', texto: 'x' }] }));
  assert.ok(irregular > legal * 4, `${legal} → ${irregular}`);
});

// ---------------------------------------------------------------- mantenimiento

test('mantenimiento: la inspección es fiable por umbrales', () => {
  const e = estadoMin();
  const r = generador(1);
  const a = crearAvion(e, r, 'b737', { anio: 1976 });
  const temprana = nuevaAveria(e, r, 'egt', { motor: 1, progreso: 0.1 });
  const visible = nuevaAveria(e, r, 'egt', { motor: 2, progreso: 0.5 });
  a.averias.push(temprana, visible);
  assert.equal(inspeccionar(a, temprana, 1976).resultado, 'nada');
  assert.equal(inspeccionar(a, visible, 1976).resultado, 'anomalia');
  // La anomalía necesita una segunda comprobación para saber si está dentro de límites.
  const d = diagnosticar(a, visible);
  assert.equal(d.fuera, false);
  assert.equal(visible.fase, 'confirmada');
});

test('mantenimiento: la revisión C encuentra lo que debe y deja el resto', () => {
  const e = estadoMin();
  const r = generador(2);
  const a = crearAvion(e, r, 'b737', { anio: 1976 });
  a.averias.push(nuevaAveria(e, r, 'corrosion', { progreso: 0.3 }));
  a.averias.push(nuevaAveria(e, r, 'corrosion', { progreso: 0.1 }));
  const res = aplicarRevision(a, 'C', 1976);
  assert.equal(a.averias.length, 1);
  assert.ok(res.reparaciones > 0);
  assert.equal(a.revisiones.C, 0);
});

test('mantenimiento: revisión general del motor y legalidad', () => {
  const e = estadoMin();
  const r = generador(3);
  const a = crearAvion(e, r, 'b737', { anio: 1976 });
  a.motores[1].horasRG = MOTORES.jt8d.intervalo * 1.2;
  a.averias.push(nuevaAveria(e, r, 'rodamiento', { motor: 2, progreso: 0.5 }));
  assert.ok(irregularidades(a, 0).some((x) => x.codigo === 'motorRG'));
  revisarMotor(a, 2);
  assert.equal(a.motores[1].horasRG, 0);
  assert.equal(a.averias.length, 0);
  assert.equal(irregularidades(a, 0).length, 0);
});

test('flota: el precio de segunda mano no descuenta lo oculto; la inspección lo revela', () => {
  const e = { ...estadoMin(), caja: 1e8, mercado: [], diario: [], cuentas: { hoy: { ingresos: 0, gastos: 0 } } };
  const r = generador(5);
  let o = null;
  for (let i = 0; i < 40 && !o; i++) {
    const x = ofertaSegundaMano(e, r, 1976, POR_ID.LPA);
    if (x.avion.averias.some((a) => AVERIAS[a.codigo].metodo === 'visual' && a.progreso >= AVERIAS[a.codigo].umbrales.inspeccion)) o = x;
  }
  assert.ok(o, 'hay una oferta con algo visible');
  const sinDefectos = valorMercado({ ...o.avion, averias: [] }, 1976);
  assert.ok(Math.abs(o.precio / sinDefectos - 1) < 0.13);
  e.mercado = [o];
  assert.equal(inspeccionarOferta(e, o.id, 'basica'), null);
  assert.ok(o.avion.averias.some((a) => a.fase !== 'oculta'));
});

// ---------------------------------------------------------------- investigación

test('investigación: causa, factores y negligencia ligados a la partida', () => {
  const ctx = ctxPrueba();
  ctx.jornada = 14;
  ctx.irregularidades = [{ codigo: 'revisionA', texto: 'Revisión A vencida' }];
  ctx.despachoIrregular = true;
  const evento = amenazas(ctx).find((x) => x.id === 'bajoMinimos');
  const inf = investigar(ctx, evento);
  assert.match(inf.causa, /mínimos/);
  assert.ok(inf.factores.length >= 1 && inf.factores.length <= 3);
  assert.equal(inf.negligencia, true);
});

// ---------------------------------------------------------------- partida

function partida(semilla = 123) {
  const e = nuevaPartida({ nombre: 'Atlántica', base: 'LPA', semilla });
  e.caja = 50e6;
  assert.equal(comprarNuevo(e, 'b737'), null);
  assert.equal(crearRuta(e, 'MAD'), null);
  assert.equal(asignar(e, e.aviones[0].id, e.rutas[0].id), null);
  return e;
}

test('partida: vuela, gasta, ingresa y es determinista', () => {
  const a = partida();
  const b = partida();
  a.ajustes.consulta = 'nunca';
  b.ajustes.consulta = 'nunca';
  avanzar(a, 20 * MIN_DIA);
  avanzar(b, 20 * MIN_DIA);
  assert.ok(a.rutas[0].stats.vuelos > 20);
  assert.equal(a.caja, b.caja);
});

test('partida: se para a preguntar y la hoja de despacho tiene lo necesario', () => {
  const e = partida();
  e.ajustes.consulta = 'siempre';
  avanzar(e, 2 * MIN_DIA);
  assert.equal(e.decisiones.length, 1);
  const inf = informeDespacho(e, e.decisiones[0]);
  assert.ok(inf.grave.texto && inf.incidencia.texto);
  const t = e.t;
  avanzar(e, 60);
  assert.equal(e.t, t, 'el reloj no avanza con una decisión pendiente');
  decidir(e, e.decisiones[0].id, 'despegar');
  assert.equal(e.aviones[0].estado, 'vuelo');
});

test('partida: un retrofit de GPWS se pide, se hace en el taller y queda instalado', () => {
  const e = partida();
  e.ajustes.consulta = 'nunca';
  assert.equal(pedirRetrofit(e, e.aviones[0].id, 'gpws'), null);
  avanzar(e, 6 * MIN_DIA);
  assert.equal(e.aviones[0].equipo.gpws, true);
});

test('partida: un avión abandonado acaba con averías que se notan', () => {
  const e = partida(9);
  e.ajustes.consulta = 'nunca';
  e.ajustes.revisionesAuto = false;
  let consultas = 0;
  for (let d = 0; d < 200 && e.aviones.length; d++) {
    for (const dec of [...e.decisiones]) { consultas++; decidir(e, dec.id, 'despegar'); }
    avanzar(e, MIN_DIA);
  }
  const a = e.aviones[0];
  if (a) {
    assert.ok(a.revisiones.A > 150, 'sin revisiones automáticas se acumulan horas');
    assert.ok(irregularidades(a, e.t).length > 0);
    assert.ok(consultas > 0, 'lo que está fuera de norma por el avión se consulta aunque el modo sea «nunca»');
  }
  assert.ok(e.diario.length > 5);
});

test('despacho: en modo «nunca» el despachador retiene los vuelos con previsión bajo mínimos', () => {
  const e = nuevaPartida({ nombre: 'Atlántica', base: 'LPA', semilla: 3 });
  e.caja = 50e6;
  assert.equal(comprarNuevo(e, 'f27'), null);
  assert.equal(crearRuta(e, 'TFN'), null);
  assert.equal(asignar(e, e.aviones[0].id, e.rutas[0].id), null);
  e.ajustes.consulta = 'nunca';
  let retenidos = 0;
  let irregulares = 0;
  for (let paso = 0; paso < 90 * 288 && e.aviones.length; paso++) {
    const tope = e.diario[0];
    avanzar(e, 5);
    for (const x of e.diario) { if (x === tope) break; if (/retenido/.test(x.texto)) retenidos++; }
    for (const av of e.aviones) if (av.estado === 'vuelo' && av.vuelo.irregular) irregulares++;
    for (const dec of [...e.decisiones]) decidir(e, dec.id, 'cancelar');
  }
  assert.equal(irregulares, 0, 'nunca despega fuera de norma por su cuenta');
  assert.ok(retenidos > 0, 'la niebla de Los Rodeos obliga a retener algún vuelo');
});

test('contexto: incluye pista efectiva y legalidad', () => {
  const e = partida();
  const ctx = contextoVuelo(e, e.aviones[0], 'MAD');
  assert.ok(ctx.pistaDestino > 3000);
  assert.ok(Array.isArray(ctx.irregularidades));
  assert.ok(distanciaKm(ctx.origen, ctx.destino) > 1500);
});

test('clima: estable por franja y estacional', () => {
  const lhr = POR_ID.LHR;
  assert.deepEqual(climaEn(lhr, 1000, 7), climaEn(lhr, 1000, 7));
  assert.ok(probabilidades(lhr, 0).niebla > probabilidades(lhr, 6).niebla);
  assert.notEqual(hash(1, 'x'), hash(2, 'x'));
});

test('despacho: una avería ya autorizada no vuelve a pedir la hoja hasta que cambie', () => {
  const estado = { ajustes: { consulta: 'anormal' } };
  const avion = { averias: [{ id: 7, fase: 'indicio' }, { id: 9, fase: 'oculta' }] };
  const ctx = { avion, despachoIrregular: false, irregularidades: [] };
  const tranquilo = { pIncidencia: 0.01, pAccidente: 0.00001 };
  assert.equal(debePreguntar(estado, ctx, tranquilo), true, 'avería nueva: pregunta');
  avion.averiasAutorizadas = '7:indicio';
  assert.equal(debePreguntar(estado, ctx, tranquilo), false, 'la misma avería ya autorizada: no pregunta');
  avion.averias[0].fase = 'anomalia';
  assert.equal(debePreguntar(estado, ctx, tranquilo), true, 'la avería avanza de fase: pregunta');
  avion.averias = [];
  assert.equal(debePreguntar(estado, ctx, tranquilo), false, 'sin averías conocidas: no pregunta');
  assert.equal(debePreguntar(estado, ctx, { pIncidencia: 0.2, pAccidente: 0.00001 }), true, 'el tiempo feo sigue preguntando');
});
