// Competencia: las aerolíneas rivales y cómo se mueven (CRITERIOS 26–28).
//
// Cada compañía tiene una red de rutas desde sus bases. Una vez al mes:
//   1. mira cómo le va cada ruta (ocupación y margen, con lo que le toca del reparto);
//   2. recorta o cierra las que pierden dinero, más tarde cuanto más terca es;
//   3. busca huecos: estima la demanda con error y, si le sale a cuenta, prepara la entrada,
//      que tarda meses en llegar (el jugador tiene una ventana de ventaja);
//   4. a veces copia las rutas del jugador que se ven llenas;
//   5. cuadra sus cuentas: si pierde mucho, recorta; si sigue, quiebra (salvo que el Estado la
//      rescate, como a las de bandera antes de la liberalización).
// Se equivocan a propósito: el ruido de sus estimaciones las hace entrar en rutas saturadas o
// no ver oportunidades.
//
// Las rutas respetan la regulación de cada época: antes del mercado único europeo (1993), una
// compañía solo vuela rutas que tocan su país; después, entre países de la Comunidad; desde
// 1997, también rutas nacionales de otro país comunitario.

import { AEROLINEAS, AEROLINEA, MAX_ACTIVAS, plazasPorVuelo } from '../data/aerolineas.js';
import { AEROPUERTOS, POR_ID, abiertoEn } from '../data/aeropuertos.js';
import { enMercadoUnico } from '../data/paises.js';
import { distanciaKm } from './geo.js';
import { precioBillete, indice, precioCombustibleKg } from './economia.js';
import { anioDecimal, MIN_DIA } from './tiempo.js';
import { hash, generador, entre, normal, ponderado } from './azar.js';
import { clave, demandaConEventos, tipoRuta, repartir, operadores, mercadoRuta, otrasObjetivo } from './mercado.js';
import { publicar } from './mundo.js';
import { notaReputacion } from './reputacion.js';

const DIAS_MES = 30.4;
const ALCANCE = { regional: 2200, charter: 4500, bajoCoste: 3500, ultraBajoCoste: 3500, tradicional: 15000, largoRadio: 15000 };
const OCUPACION_OBJETIVO = 0.62;

// --- Reglas

export function permitido(def, o, d, anio) {
  if (o.id === d.id) return false;
  if (o.pais === def.pais || d.pais === def.pais) return true;
  if (!enMercadoUnico(def.pais, anio) || !enMercadoUnico(o.pais, anio) || !enMercadoUnico(d.pais, anio)) return false;
  return o.pais !== d.pais || anio >= 1997.3;
}

function encaja(def, o, d, anio) {
  const dist = distanciaKm(o, d);
  if (dist > ALCANCE[def.tipo] * (def.tipo === 'charter' && anio >= 1990 ? 1.5 : 1)) return false;
  if (def.tipo === 'charter' && (o.tur + d.tur) / 2 < 1.35) return false;
  if (def.tipo === 'regional' && o.pais !== def.pais && d.pais !== def.pais) return false;
  return true;
}

function zonaFactor(def, a) {
  if (def.zonas.includes(a.pais)) return 1.6;
  if (def.zonas.includes(a.region)) return 1.2;
  return 0.5;
}

// --- Economía de una ruta para una compañía

export function costePlaza(distancia, anio, costes) {
  const combustible = precioCombustibleKg(anio) / indice(anio) / precioCombustibleKg(1976);
  return (15 + 0.015 * distancia) * indice(anio) * (0.75 + 0.25 * combustible) * costes;
}

export function tarifa(def, distancia, anio) {
  return precioBillete(distancia, 'normal', anio) * def.precio;
}

// --- Creación

function estadoAerolinea(def) {
  return {
    id: def.id, activa: false, retirada: false, entrada: null, salida: null,
    caja: 0, crisis: 0, rescate: -99, rep: { ...def.rep },
    bases: [...def.hubs, ...def.bases], rutas: {}, proyectos: [],
  };
}

export function crearCompetencia(estado) {
  const mundo = estado.mundo;
  mundo.aerolineas = Object.fromEntries(AEROLINEAS.map((def) => [def.id, estadoAerolinea(def)]));
  mundo.oferta = {};
  mundo.otras = {};
  const t = estado.t;
  const anio = anioDecimal(t);
  const r = generador(hash(estado.semilla, 'competencia', 'inicio'));
  const fundadoras = AEROLINEAS.filter((def) => def.desde <= anio && (!def.fin || def.fin.anio > anio));
  // Qué rutas querría cada una y cuánta gente hay en cada mercado.
  const porRuta = new Map();
  for (const def of fundadoras) {
    const al = mundo.aerolineas[def.id];
    al.activa = true;
    al.entrada = t;
    al.caja = 30e6 * def.tamano * indice(anio);
    for (const [base, n] of basesConCupo(def)) {
      for (const destino of mejoresDestinos(estado, def, POR_ID[base], t, n, r)) {
        const k = clave(base, destino.id);
        if (!porRuta.has(k)) porRuta.set(k, { o: POR_ID[base], d: destino, quien: new Set() });
        porRuta.get(k).quien.add(def.id);
      }
    }
  }
  // Las fundadoras se reparten cada mercado, con más peso para la que tiene allí su base.
  for (const [k, { o, d, quien }] of porRuta) {
    const demanda = demandaConEventos(estado, o, d, t);
    const objetivo = demanda / OCUPACION_OBJETIVO * entre(r, 0.85, 1.15);
    const pesos = [...quien].map((id) => {
      const def = AEROLINEA[id];
      const enCasa = def.hubs.includes(o.id) || def.hubs.includes(d.id) ? 2 : 1;
      return [id, def.tamano * enCasa * (def.tipo === 'charter' ? 1.3 : 1)];
    });
    const suma = pesos.reduce((s, [, p]) => s + p, 0);
    for (const [id, p] of pesos) {
      const def = AEROLINEA[id];
      const plazas = plazasPorVuelo(def, anio, distanciaKm(o, d));
      const frecuencia = Math.max(1, Math.min(12, Math.round(objetivo * p / suma / plazas)));
      abrirRuta(estado, mundo.aerolineas[id], o, d, frecuencia, t, { silenciosa: true, k });
    }
  }
  return mundo;
}

function basesConCupo(def) {
  const n = Math.round(6 + 34 * def.tamano);
  return [...def.hubs.map((h) => [h, Math.round(n / def.hubs.length)]), ...def.bases.map((b) => [b, Math.round(2 + 8 * def.tamano)])];
}

// Los mejores destinos para una compañía desde una base, según demanda, zonas y tipo.
function mejoresDestinos(estado, def, base, t, n, r) {
  const anio = anioDecimal(t);
  const lista = [];
  for (const d of AEROPUERTOS) {
    if (d.id === base.id || !abiertoEn(d, Math.floor(anio)) || !permitido(def, base, d, anio) || !encaja(def, base, d, anio)) continue;
    const dist = distanciaKm(base, d);
    const demanda = demandaConEventos(estado, base, d, t);
    if (dist > 4000 && demanda < 150) continue;
    let puntos = demanda * zonaFactor(def, d) * (0.85 + 0.3 * r());
    if (def.tipo === 'largoRadio') puntos *= dist > 2500 ? 1.5 : 0.25;
    if (def.tipo === 'bajoCoste' || def.tipo === 'ultraBajoCoste') puntos *= tipoRuta(base, d) === 'negocios' ? 0.7 : 1.2;
    lista.push([d, puntos]);
  }
  return lista.sort((a, b) => b[1] - a[1]).slice(0, n).filter(([, p]) => p > 15).map(([d]) => d);
}

// --- Rutas

function precioRuta(def, o, d, anio) {
  // Las de bandera cobraban más mientras el mercado estaba regulado.
  const regulado = anio < 1993 && def.tipo === 'tradicional' && !(o.pais === 'US' && d.pais === 'US' && anio >= 1979) ? 1.1 : 1;
  return def.precio * regulado;
}

function abrirRuta(estado, al, o, d, frecuencia, t, { silenciosa = false, k = clave(o.id, d.id) } = {}) {
  const def = AEROLINEA[al.id];
  const anio = anioDecimal(t);
  const plazas = plazasPorVuelo(def, anio, distanciaKm(o, d));
  al.rutas[k] = { o: o.id, d: d.id, frecuencia, plazas, desde: t, lf: OCUPACION_OBJETIVO, margen: 0, malos: 0, precio: precioRuta(def, o, d, anio) };
  sincronizar(estado, al, k);
  return silenciosa ? null : al.rutas[k];
}

function cerrarRuta(estado, al, k) {
  delete al.rutas[k];
  sincronizar(estado, al, k);
}

// Mantiene el índice de oferta por mercado al día.
function sincronizar(estado, al, k) {
  const mundo = estado.mundo;
  const ruta = al.rutas[k];
  if (!ruta) {
    if (mundo.oferta[k]) {
      delete mundo.oferta[k][al.id];
      if (!Object.keys(mundo.oferta[k]).length) delete mundo.oferta[k];
    }
    return;
  }
  const def = AEROLINEA[al.id];
  mundo.oferta[k] ??= {};
  ruta.precio ??= precioRuta(def, POR_ID[ruta.o], POR_ID[ruta.d], anioDecimal(estado.t));
  mundo.oferta[k][al.id] = { asientos: ruta.frecuencia * ruta.plazas, precio: ruta.precio };
}

// --- Ciclo mensual

export function cicloCompetencia(estado, t) {
  const mundo = estado.mundo;
  const anio = anioDecimal(t);
  const noticias = [];
  const r = generador(hash(estado.semilla, 'competencia', Math.floor(t / MIN_DIA)));
  // Salidas y entradas que marca la historia.
  for (const def of AEROLINEAS) {
    const al = mundo.aerolineas[def.id];
    if (al.activa && def.fin && anio >= def.fin.anio) retirar(estado, al, def.fin.tipo, def.fin.con, noticias, t);
  }
  for (const def of AEROLINEAS) {
    const al = mundo.aerolineas[def.id];
    const activas = Object.values(mundo.aerolineas).filter((x) => x.activa).length;
    if (!al.activa && !al.retirada && anio >= def.desde && activas < MAX_ACTIVAS) entrar(estado, al, noticias, t, r);
  }
  for (const al of Object.values(mundo.aerolineas)) {
    if (!al.activa) continue;
    const resultado = revisarRutas(estado, al, t, r, noticias);
    cuentas(estado, al, resultado, t, noticias);
    if (!al.activa) continue;
    buscarHuecos(estado, al, t, r, noticias);
    copiarAlJugador(estado, al, t, r, noticias);
    proyectosListos(estado, al, t, r, noticias);
    nuevaBase(estado, al, t, r, noticias);
    al.rep.seguridad += (AEROLINEA[al.id].rep.seguridad - al.rep.seguridad) * 0.05;
  }
  ajustarOtras(estado, t);
  return noticias;
}

// Cómo le va a cada ruta este mes y qué hace con ella. Devuelve el resultado del mes.
function revisarRutas(estado, al, t, r, noticias) {
  const def = AEROLINEA[al.id];
  const anio = anioDecimal(t);
  const paciencia = 3 + Math.round(12 * def.terquedad);
  let resultado = 0;
  for (const [k, ruta] of Object.entries(al.rutas)) {
    const o = POR_ID[ruta.o];
    const d = POR_ID[ruta.d];
    const m = mercadoRuta(estado, o, d, t);
    const yo = m.ops.find((x) => x.id === al.id);
    const asientos = ruta.frecuencia * ruta.plazas;
    const pax = yo?.pax ?? 0;
    const dist = distanciaKm(o, d);
    const precio = estado.mundo.oferta[k]?.[al.id]?.precio ?? def.precio;
    const ingreso = pax * 2 * DIAS_MES * precioBillete(dist, 'normal', anio) * precio;
    const coste = asientos * 2 * DIAS_MES * costePlaza(dist, anio, def.costes);
    const margen = ingreso > 0 ? (ingreso - coste) / ingreso : -1;
    ruta.lf = 0.6 * ruta.lf + 0.4 * (pax / asientos);
    ruta.margen = 0.6 * ruta.margen + 0.4 * margen;
    resultado += ingreso - coste;
    reaccionarPrecio(estado, al, k, ruta, m, t, r, noticias);
    const protegidaEnCasa = def.protegida && anio < def.protegida && (o.pais === def.pais && d.pais === def.pais);
    if (ruta.margen < -0.05) ruta.malos++;
    else ruta.malos = Math.max(0, ruta.malos - 1);
    if (ruta.malos >= paciencia) {
      if (ruta.frecuencia > 1) {
        ruta.frecuencia--;
        ruta.malos = Math.floor(paciencia / 2);
        sincronizar(estado, al, k);
      } else if (!protegidaEnCasa) {
        cerrarRuta(estado, al, k);
        noticia(estado, noticias, t, o, d, `${def.nombre} deja de volar entre ${o.ciudad} y ${d.ciudad}`);
      }
    } else if (((ruta.lf > 0.78 && ruta.margen > 0.08) || (ruta.lf > 0.66 && ruta.margen > 0.22)) && r() < 0.25 + def.expansion * 0.5) {
      const tope = dist > 4000 ? 14 : dist < 500 ? 30 : 16;
      if (ruta.frecuencia < tope) {
        ruta.frecuencia = Math.min(tope, ruta.frecuencia + (ruta.lf > 0.92 ? 2 : 1));
        sincronizar(estado, al, k);
        if (enRutaDelJugador(estado, o, d)) noticia(estado, noticias, t, o, d, `${def.nombre} añade vuelos entre ${o.ciudad} y ${d.ciudad}`);
      }
    }
  }
  return resultado;
}

// Si el jugador le roba pasaje con precios más bajos, la compañía puede responder bajando los
// suyos en esa ruta (más las que defienden su mercado). Cuando el jugador deja de apretar, los
// precios vuelven poco a poco a su nivel.
const DEFIENDE = { tradicional: 0.35, regional: 0.3, charter: 0.25, bajoCoste: 0.45, ultraBajoCoste: 0.55, largoRadio: 0.2 };

function reaccionarPrecio(estado, al, k, ruta, m, t, r, noticias) {
  const def = AEROLINEA[al.id];
  const base = precioRuta(def, POR_ID[ruta.o], POR_ID[ruta.d], anioDecimal(t));
  const jugador = m.ops.find((x) => x.id === 'jugador');
  const aprieta = jugador && jugador.precio < ruta.precio - 0.05 && ruta.lf < 0.65;
  if (aprieta && ruta.precio > base * 0.78 && r() < DEFIENDE[def.tipo] * (def.protegida && anioDecimal(t) < def.protegida ? 1.5 : 1)) {
    ruta.precio = Math.max(base * 0.78, ruta.precio * 0.93);
    sincronizar(estado, al, k);
    const o = POR_ID[ruta.o];
    const d = POR_ID[ruta.d];
    noticia(estado, noticias, t, o, d, `${def.nombre} baja sus precios entre ${o.ciudad} y ${d.ciudad}`);
  } else if (!aprieta && ruta.precio < base) {
    ruta.precio = Math.min(base, ruta.precio * 1.02);
    sincronizar(estado, al, k);
  }
}

// Estimación (con error) de cómo le iría a una compañía una ruta con cierta frecuencia.
function estimar(estado, def, o, d, t, frecuencia, error, r) {
  const anio = anioDecimal(t);
  const tipo = tipoRuta(o, d);
  const dist = distanciaKm(o, d);
  const plazas = plazasPorVuelo(def, anio, dist);
  const ops = operadores(estado, o, d, t, tipo).filter((x) => x.id !== def.id);
  ops.push({ id: def.id, asientos: frecuencia * plazas, precio: def.precio, servicio: def.servicio, nota: notaReputacion(estado.mundo.aerolineas[def.id].rep, tipo) });
  const demanda = demandaConEventos(estado, o, d, t) * Math.exp(error * normal(r));
  const { ops: con } = repartir(demanda, ops, tipo);
  const pax = con.find((x) => x.id === def.id).pax;
  const ingreso = pax * tarifa(def, dist, anio);
  const coste = frecuencia * plazas * costePlaza(dist, anio, def.costes);
  return { margen: ingreso > 0 ? (ingreso - coste) / ingreso : -1, ocupacion: pax / (frecuencia * plazas) };
}

function umbral(def) {
  return 0.12 - 0.15 * def.riesgo;
}

function buscarHuecos(estado, al, t, r, noticias) {
  const def = AEROLINEA[al.id];
  const intentos = r() < 0.4 + def.expansion * 0.6 ? 1 + Math.floor(2 * def.expansion * r()) : 0;
  for (let i = 0; i < intentos; i++) {
    const base = POR_ID[ponderado(r, al.bases.map((b) => [b, def.hubs.includes(b) ? 3 : 1]))];
    const candidatos = mejoresDestinos(estado, def, base, t, 25, r).filter((d) => {
      const k = clave(base.id, d.id);
      return !al.rutas[k] && !al.proyectos.some((p) => p.k === k);
    });
    if (!candidatos.length) continue;
    const destino = candidatos[Math.floor(r() * Math.min(candidatos.length, 12))];
    const frecuencia = 1 + Math.floor(r() * 2);
    const e = estimar(estado, def, base, destino, t, frecuencia, 0.35, r);
    if (e.margen > umbral(def)) prepararEntrada(estado, al, base, destino, frecuencia, t, r, noticias);
  }
}

// Las rutas del jugador que se ven llenas llaman la atención, sobre todo de las que copian.
function copiarAlJugador(estado, al, t, r, noticias) {
  const def = AEROLINEA[al.id];
  if (r() >= def.copia * 0.25) return;
  const anio = anioDecimal(t);
  const llenas = estado.rutas.filter((x) => (x.lfReciente ?? 0) > 0.72);
  if (!llenas.length) return;
  const ruta = llenas[Math.floor(r() * llenas.length)];
  const o = POR_ID[ruta.origen];
  const d = POR_ID[ruta.destino];
  const k = clave(o.id, d.id);
  if (al.rutas[k] || al.proyectos.some((p) => p.k === k)) return;
  const base = al.bases.includes(o.id) ? o : al.bases.includes(d.id) ? d : null;
  if (!base || !permitido(def, o, d, anio) || !encaja(def, o, d, anio)) return;
  const otro = base === o ? d : o;
  const e = estimar(estado, def, base, otro, t, 1, 0.15, r);
  if (e.margen > umbral(def) - 0.05) prepararEntrada(estado, al, base, otro, 1, t, r, noticias, true);
}

function prepararEntrada(estado, al, o, d, frecuencia, t, r, noticias, copia = false) {
  const def = AEROLINEA[al.id];
  const listo = t + entre(r, 2, 8) * DIAS_MES * MIN_DIA;
  al.proyectos.push({ k: clave(o.id, d.id), o: o.id, d: d.id, frecuencia, listo });
  // A veces se filtra: es la señal que puede ver el jugador antes de que llegue.
  if (r() < (copia ? 0.6 : 0.25)) {
    noticia(estado, noticias, t, o, d, `Se rumorea que ${def.nombre} estudia volar entre ${o.ciudad} y ${d.ciudad}`);
  }
}

function proyectosListos(estado, al, t, r, noticias) {
  const def = AEROLINEA[al.id];
  const quedan = [];
  for (const p of al.proyectos) {
    if (t < p.listo) { quedan.push(p); continue; }
    const o = POR_ID[p.o];
    const d = POR_ID[p.d];
    if (al.rutas[p.k] || !permitido(def, o, d, anioDecimal(t))) continue;
    // Una vez decidido, casi siempre siguen adelante aunque los números hayan cambiado.
    const e = estimar(estado, def, o, d, t, p.frecuencia, 0.2, r);
    if (e.margen > umbral(def) - 0.1 || r() < 0.25 * def.riesgo) {
      abrirRuta(estado, al, o, d, p.frecuencia, t);
      noticia(estado, noticias, t, o, d, `${def.nombre} empieza a volar entre ${o.ciudad} y ${d.ciudad}`);
    }
  }
  al.proyectos = quedan;
}

function cuentas(estado, al, resultado, t, noticias) {
  const def = AEROLINEA[al.id];
  const anio = anioDecimal(t);
  al.caja += resultado;
  const limite = -25e6 * def.tamano * indice(anio);
  if (al.caja > limite) { al.crisis = Math.max(0, al.crisis - 1); return; }
  // Tras el 11-S y en la pandemia, los gobiernos rescataron a casi todas.
  const rescateGeneral = (anio >= 2001.7 && anio < 2002.6) || (anio >= 2020.2 && anio < 2022.5);
  if ((def.protegida && anio < def.protegida) || rescateGeneral) {
    if (anio - al.rescate > 3) {
      const titular = def.protegida && anio < def.protegida ? `El Gobierno vuelve a rescatar a ${def.nombre}` : `${def.nombre} recibe ayudas públicas para sobrevivir a la crisis`;
      publicar(estado.mundo, t, { tipo: 'competencia', escala: 'regional', titular });
      noticias.push(estado.mundo.noticias[0]);
      al.rescate = anio;
    }
    al.caja = 0;
    return;
  }
  al.crisis++;
  if (al.crisis === 3 || al.crisis === 6) {
    // Recorta las peores rutas.
    const peores = Object.entries(al.rutas).sort((a, b) => a[1].margen - b[1].margen);
    for (const [k] of peores.slice(0, Math.ceil(peores.length / 4))) cerrarRuta(estado, al, k);
    publicar(estado.mundo, t, { tipo: 'competencia', escala: 'regional', titular: `${def.nombre}, en apuros, recorta su red` });
    noticias.push(estado.mundo.noticias[0]);
  }
  if (al.crisis >= 9) retirar(estado, al, 'quiebra', null, noticias, t);
}

// Las de bajo coste y las chárter abren bases fuera de casa cuando la regulación lo permite.
function nuevaBase(estado, al, t, r, noticias) {
  const def = AEROLINEA[al.id];
  const anio = anioDecimal(t);
  if (!['bajoCoste', 'ultraBajoCoste', 'charter'].includes(def.tipo) || anio < 1997.3 || !enMercadoUnico(def.pais, anio)) return;
  if (al.bases.length >= 2 + Math.floor(8 * def.expansion) || r() >= 0.03 * def.expansion) return;
  const candidatas = AEROPUERTOS.filter((a) => a.tam >= 3 && !al.bases.includes(a.id) && abiertoEn(a, Math.floor(anio)) && enMercadoUnico(a.pais, anio));
  if (!candidatas.length) return;
  const base = ponderado(r, candidatas.map((a) => [a, (a.tur + 0.5) * a.tam * zonaFactor(def, a)]));
  al.bases.push(base.id);
  publicar(estado.mundo, t, { tipo: 'competencia', escala: base.pais === estado.pais ? 'local' : 'regional', titular: `${def.nombre} abre una base en ${base.ciudad}`, importante: base.id === estado.base });
  noticias.push(estado.mundo.noticias[0]);
}

function entrar(estado, al, noticias, t, r) {
  const def = AEROLINEA[al.id];
  const anio = anioDecimal(t);
  al.activa = true;
  al.entrada = t;
  al.caja = 20e6 * def.tamano * indice(anio);
  const n = Math.round(2 + 10 * def.tamano);
  for (const hub of def.hubs) {
    for (const d of mejoresDestinos(estado, def, POR_ID[hub], t, n, r)) {
      const e = estimar(estado, def, POR_ID[hub], d, t, 1, 0.2, r);
      if (e.margen > umbral(def) - 0.1) abrirRuta(estado, al, POR_ID[hub], d, 1 + (e.ocupacion > 0.85 ? 1 : 0), t, { silenciosa: true });
    }
  }
  const casa = POR_ID[def.hubs[0]];
  publicar(estado.mundo, t, {
    tipo: 'competencia', escala: casa.pais === estado.pais ? 'local' : 'regional',
    titular: `Nace ${def.nombre}, una nueva compañía con base en ${casa.ciudad}`, texto: def.descripcion,
    importante: casa.pais === estado.pais,
  });
  noticias.push(estado.mundo.noticias[0]);
}

function retirar(estado, al, tipo, con, noticias, t) {
  const def = AEROLINEA[al.id];
  const destino = con ? estado.mundo.aerolineas[con] : null;
  for (const [k, ruta] of Object.entries(al.rutas)) {
    if (destino?.activa && !destino.rutas[k]) {
      destino.rutas[k] = { ...ruta, plazas: plazasPorVuelo(AEROLINEA[con], anioDecimal(t), distanciaKm(POR_ID[ruta.o], POR_ID[ruta.d])) };
      sincronizar(estado, destino, k);
    }
    cerrarRuta(estado, al, k);
  }
  for (const b of al.bases) if (destino && !destino.bases.includes(b)) destino.bases.push(b);
  al.activa = false;
  al.retirada = true;
  al.salida = t;
  al.proyectos = [];
  const titular = tipo === 'fusion' ? `${def.nombre} se integra en ${AEROLINEA[con].nombre}`
    : tipo === 'cierre' ? `${def.nombre} deja de volar después de décadas de pérdidas`
      : `Quiebra ${def.nombre}`;
  publicar(estado.mundo, t, { tipo: 'competencia', escala: 'regional', titular, importante: true });
  noticias.push(estado.mundo.noticias[0]);
  // Bread Am deja el Atlántico a Delfín Air Lines, como Pan Am a Delta en 1991.
  if (al.id === 'breadam') heredarAtlantico(estado, t, noticias);
}

function heredarAtlantico(estado, t, noticias) {
  const delfin = estado.mundo.aerolineas.delfin;
  if (!delfin?.activa) return;
  const r = generador(hash(estado.semilla, 'atlantico'));
  for (const destino of mejoresDestinos(estado, AEROLINEA.delfin, POR_ID.JFK, t, 12, r)) {
    if (distanciaKm(POR_ID.JFK, destino) > 4000) abrirRuta(estado, delfin, POR_ID.JFK, destino, 1, t, { silenciosa: true });
  }
  publicar(estado.mundo, t, { tipo: 'competencia', escala: 'regional', titular: 'Delfín Air Lines se queda con las rutas atlánticas de Bread Am' });
  noticias.push(estado.mundo.noticias[0]);
}

// El resto de compañías se acerca poco a poco a lo que pide cada mercado.
function ajustarOtras(estado, t) {
  const mundo = estado.mundo;
  const claves = new Set([...Object.keys(mundo.oferta), ...estado.rutas.map((x) => clave(x.origen, x.destino))]);
  for (const k of claves) {
    const [a, b] = k.split('-');
    const o = POR_ID[a];
    const d = POR_ID[b];
    let nombradas = Object.values(mundo.oferta[k] ?? {}).reduce((s, x) => s + x.asientos, 0);
    const jugador = operadores(estado, o, d, t, tipoRuta(o, d)).find((x) => x.id === 'jugador');
    if (jugador) nombradas += jugador.asientos;
    const objetivo = otrasObjetivo(estado, o, d, t, nombradas);
    const actual = mundo.otras[k] ?? objetivo;
    mundo.otras[k] = Math.max(0, actual + (objetivo - actual) * 0.06);
  }
  for (const k of Object.keys(mundo.otras)) if (!claves.has(k)) delete mundo.otras[k];
}

// --- Noticias de la competencia

export function tocaAlJugador(estado, o, d) {
  return o.id === estado.base || d.id === estado.base || enRutaDelJugador(estado, o, d);
}

export function enRutaDelJugador(estado, o, d) {
  return estado.rutas.some((x) => clave(x.origen, x.destino) === clave(o.id, d.id));
}

function noticia(estado, noticias, t, o, d, titular) {
  if (!tocaAlJugador(estado, o, d)) return;
  publicar(estado.mundo, t, { tipo: 'competencia', escala: 'local', titular, importante: enRutaDelJugador(estado, o, d) });
  noticias.push(estado.mundo.noticias[0]);
}

// --- Para la interfaz

export function activas(estado) {
  return Object.values(estado.mundo.aerolineas).filter((x) => x.activa);
}

export function resumenAerolinea(estado, al) {
  const def = AEROLINEA[al.id];
  const rutas = Object.values(al.rutas);
  const anio = anioDecimal(estado.t);
  const limite = -25e6 * def.tamano * indice(anio);
  return {
    def, al,
    rutas: rutas.length,
    plazas: rutas.reduce((s, x) => s + x.frecuencia * x.plazas, 0),
    situacion: al.caja < limite * 0.5 ? 'en apuros' : al.caja < 0 ? 'ajustada' : 'sólida',
    enTuPais: rutas.filter((x) => POR_ID[x.o].pais === estado.pais || POR_ID[x.d].pais === estado.pais).length,
  };
}
