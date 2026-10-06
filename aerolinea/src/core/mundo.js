// Mundo: acontecimientos y noticias (CRITERIOS 30 y 31).
//
// Los acontecimientos históricos están en src/data/acontecimientos.js y pasan en su fecha. Los
// locales se generan cerca del jugador a partir de plantillas: se anuncian, y al cabo de un
// tiempo pasan o no. Su efecto sobre la demanda es gradual.
//
// Las noticias son pocas a propósito: las globales y regionales, las locales que tocan al
// jugador y los movimientos de la competencia que le afectan.

import { HISTORICOS, PLANTILLAS } from '../data/acontecimientos.js';
import { AEROPUERTOS, POR_ID, abiertoEn } from '../data/aeropuertos.js';
import { PAISES } from '../data/paises.js';
import { distanciaKm, fraccionSobreMar } from './geo.js';
import { anioDecimal, MIN_DIA } from './tiempo.js';
import { hash, generador, entre, elegir, ponderado } from './azar.js';

const ANIO = 365.25 * MIN_DIA;
const MAX_NOTICIAS = 200;

export function crearMundoNoticias() {
  return { noticias: [], eventos: [], historicos: 0, siguienteLocal: 0 };
}

// --- Efectos

// Efectos de demanda de los históricos, aplanados una vez.
const EFECTOS_HISTORICOS = HISTORICOS.flatMap((h) => h.efectos.map((e) => ({ ...e, de: h.id })));

// `ambos`: el efecto solo vale si los dos extremos de la ruta están dentro (por ejemplo, la
// liberalización europea no toca un Londres–Nueva York).
function afecta(e, o, d) {
  switch (e.ambito) {
    case 'global': return true;
    case 'region': return e.ambos ? e.objetivo.includes(o.region) && e.objetivo.includes(d.region) : e.objetivo.includes(o.region) || e.objetivo.includes(d.region);
    case 'pais': return e.ambos ? e.objetivo.includes(o.pais) && e.objetivo.includes(d.pais) : e.objetivo.includes(o.pais) || e.objetivo.includes(d.pais);
    case 'aeropuerto': return e.objetivo.includes(o.id) || e.objetivo.includes(d.id);
    case 'ruta': return e.objetivo.some(([a, b]) => (a === o.id && b === d.id) || (a === d.id && b === o.id));
    default: return false;
  }
}

function valor(e, anio) {
  if (anio < e.desde || (e.hasta != null && anio >= e.hasta)) return 1;
  let progreso = e.rampa ? Math.min(1, (anio - e.desde) / e.rampa) : 1;
  // Los acontecimientos locales se desvanecen poco a poco al final.
  if (e.desvanece && e.hasta != null) progreso = Math.min(progreso, (e.hasta - anio) / e.desvanece);
  return 1 + (e.factor - 1) * Math.max(0, progreso);
}

// Multiplicador de la demanda de un par de aeropuertos en un instante.
export function factorDemanda(mundo, o, d, t) {
  const anio = anioDecimal(t);
  let f = 1;
  for (const e of EFECTOS_HISTORICOS) {
    if (e.tipo === 'demanda' && anio >= e.desde && afecta(e, o, d)) f *= valor(e, anio);
  }
  for (const ev of mundo?.eventos ?? []) {
    if (!ev.pasa || !ev.efecto || ev.efecto.tipo !== 'demanda' || anio < ev.efecto.desde) continue;
    if (afecta(ev.efecto, o, d)) f *= valor(ev.efecto, anio);
  }
  return f;
}

// Si un vuelo entre o y d no puede salir en ese instante, el motivo.
export function cierre(mundo, o, d, t, supersonico = false) {
  const anio = anioDecimal(t);
  for (const e of EFECTOS_HISTORICOS) {
    if (e.tipo !== 'cierre' || anio < e.desde || anio >= e.hasta) continue;
    if (e.ambito === 'supersonico' ? supersonico : afecta(e, o, d)) return e.motivo;
  }
  for (const ev of mundo?.eventos ?? []) {
    const e = ev.efecto;
    if (!ev.pasa || !e || e.tipo !== 'cierre' || anio < e.desde || anio >= e.hasta) continue;
    if (afecta(e, o, d)) return e.motivo;
  }
  return null;
}

// Recargo de costes (seguros, seguridad) en un año.
export function factorCoste(anio) {
  let f = 1;
  for (const e of EFECTOS_HISTORICOS) if (e.tipo === 'coste' && anio >= e.desde && anio < e.hasta) f *= e.factor;
  return f;
}

// --- Noticias

export function publicar(mundo, t, noticia) {
  const n = { t, escala: 'local', tipo: 'mundo', importante: false, ...noticia };
  mundo.noticias.unshift(n);
  if (mundo.noticias.length > MAX_NOTICIAS) mundo.noticias.length = MAX_NOTICIAS;
  return n;
}

// --- Ciclo diario

// Publica los históricos que tocan y hace avanzar los acontecimientos locales. Devuelve las
// noticias nuevas para que la interfaz destaque las importantes.
export function avanzarMundo(estado, t) {
  const mundo = estado.mundo;
  const nuevas = [];
  const anio = anioDecimal(t);
  while (mundo.historicos < HISTORICOS.length && HISTORICOS[mundo.historicos].fecha <= anio) {
    const h = HISTORICOS[mundo.historicos++];
    if (h.fecha < 1976.01) continue;
    nuevas.push(publicar(mundo, t, { escala: h.escala, titular: h.titular, texto: h.texto, importante: Boolean(h.importante) || h.escala === 'global', de: h.id }));
  }
  for (const ev of mundo.eventos) {
    if (ev.fase === 'anunciado' && t >= ev.resuelve) {
      ev.fase = ev.pasa ? 'activo' : 'descartado';
      const x = lugarTexto(ev);
      const plantilla = PLANTILLAS.find((p) => p.id === ev.plantilla);
      nuevas.push(publicar(mundo, t, { escala: ev.escala, titular: ev.pasa ? plantilla.pasa(x) : plantilla.noPasa(x), de: ev.id }));
    }
  }
  // Los acontecimientos acabados se olvidan al cabo de unos años.
  mundo.eventos = mundo.eventos.filter((ev) => ev.fase === 'anunciado' || anio - anioDecimal(ev.anuncio) < 5
    || (ev.pasa && (ev.efecto?.hasta == null || anio < ev.efecto.hasta)));
  if (t >= mundo.siguienteLocal) {
    const r = generador(hash(estado.semilla, 'local', Math.floor(t / MIN_DIA)));
    const ev = generarLocal(estado, t, r);
    if (ev) {
      mundo.eventos.push(ev);
      nuevas.push(publicar(mundo, t, { escala: ev.escala, titular: PLANTILLAS.find((p) => p.id === ev.plantilla).anuncio(lugarTexto(ev)), de: ev.id }));
    }
    mundo.siguienteLocal = t + entre(r, 30, 75) * MIN_DIA;
  }
  return nuevas;
}

function lugarTexto(ev) {
  const a = POR_ID[ev.lugar.a];
  const b = ev.lugar.b ? POR_ID[ev.lugar.b] : null;
  return { ciudad: a?.ciudad ?? '', ciudad2: b?.ciudad ?? '', pais: PAISES[ev.lugar.pais]?.nombre ?? '' };
}

// Zona del jugador: su país, los aeropuertos a los que vuela y los que tiene a mano.
function zona(estado, anio) {
  const base = POR_ID[estado.base];
  const destinos = new Set(estado.rutas.map((r) => r.destino));
  return AEROPUERTOS.filter((a) => abiertoEn(a, anio) && (a.pais === base.pais || destinos.has(a.id) || distanciaKm(base, a) < 3500));
}

function generarLocal(estado, t, r) {
  const anio = Math.floor(anioDecimal(t));
  const cerca = zona(estado, anio);
  if (!cerca.length) return null;
  const plantilla = ponderado(r, PLANTILLAS.map((p) => [p, p.peso]));
  const base = POR_ID[estado.base];
  // Más probable cuanto más cerca de casa.
  const recientes = new Set(estado.mundo.eventos.filter((ev) => t - ev.anuncio < 5 * ANIO).flatMap((ev) => [ev.lugar.a, ev.lugar.b]));
  const elegirAeropuerto = (filtro) => {
    const lista = cerca.filter((a) => filtro(a) && !recientes.has(a.id));
    if (!lista.length) return null;
    return ponderado(r, lista.map((a) => [a, (a.pais === base.pais ? 3 : 1) * (a.tam + 1)]));
  };
  let lugar = null;
  switch (plantilla.donde) {
    case 'ciudad': { const a = elegirAeropuerto((a) => a.tam >= 3); if (a) lugar = { a: a.id, pais: a.pais }; break; }
    case 'turistico': { const a = elegirAeropuerto((a) => a.tur >= 1.4); if (a) lugar = { a: a.id, pais: a.pais }; break; }
    case 'aeropuerto': { const a = elegirAeropuerto(() => true); if (a) lugar = { a: a.id, pais: a.pais }; break; }
    case 'pais': {
      const paises = [...new Set(cerca.map((a) => a.pais))].filter((p) => p !== base.pais && (PAISES[p]?.renta[0] ?? 1) < 0.6);
      if (paises.length) { const p = elegir(r, paises); lugar = { a: cerca.find((a) => a.pais === p).id, pais: p }; }
      break;
    }
    case 'par': {
      const pares = [];
      for (const a of cerca) for (const b of cerca) {
        if (a.id < b.id && a.pais === b.pais && !a.grupo && !b.grupo && distanciaKm(a, b) < 650 && fraccionSobreMar(a, b) < 0.1) pares.push([a, b]);
      }
      if (pares.length) { const [a, b] = elegir(r, pares); lugar = { a: a.id, b: b.id, pais: a.pais }; }
      break;
    }
    default: break;
  }
  if (!lugar) return null;
  const pasa = r() < plantilla.certeza;
  const resuelve = t + entre(r, plantilla.espera[0], plantilla.espera[1]) * ANIO;
  const desde = anioDecimal(resuelve);
  let efecto = null;
  if (plantilla.cierre) {
    efecto = { tipo: 'cierre', ambito: 'aeropuerto', objetivo: [lugar.a], desde, hasta: desde + entre(r, plantilla.cierre[0], plantilla.cierre[1]) / 365, motivo: `huelga de controladores en ${POR_ID[lugar.a].ciudad}` };
  } else {
    const factor = entre(r, plantilla.factor[0], plantilla.factor[1]);
    const ambito = plantilla.donde === 'par' ? 'ruta' : plantilla.donde === 'pais' ? 'pais' : 'aeropuerto';
    const objetivo = ambito === 'ruta' ? [[lugar.a, lugar.b]] : ambito === 'pais' ? [lugar.pais] : [lugar.a];
    efecto = {
      tipo: 'demanda', ambito, objetivo, factor, desde, rampa: plantilla.rampa,
      hasta: plantilla.duracion == null ? null : desde + plantilla.duracion,
      desvanece: plantilla.duracion > 1 ? Math.max(1, plantilla.rampa) : 0,
    };
  }
  return {
    id: `L${estado.siguienteId++}`, plantilla: plantilla.id, lugar, escala: 'local',
    fase: 'anunciado', anuncio: t, resuelve, pasa, efecto,
  };
}
