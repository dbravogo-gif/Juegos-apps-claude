// Mercado de cada ruta: cuánta gente quiere volar entre dos aeropuertos, cuántas plazas
// ofrecen las compañías y cómo se reparte el pasaje (CRITERIOS 26 y 28).
//
// La demanda sale de un modelo de gravedad: el peso económico de cada ciudad (población por
// renta, que cambia con los años), la distancia, el turismo, si hay alternativa por tierra y
// si hay frontera de por medio. Después se multiplica por los acontecimientos del mundo.
//
// El reparto no es binario: cada compañía atrae pasaje según sus plazas, su precio, su
// reputación y su servicio. Una ruta con exceso de oferta puede seguir siendo rentable para
// quien tenga mejores precios o mejor reputación.
//
// Cifras calibradas para 1976 con rutas de referencia (Madrid–Barcelona ~1.600 pasajeros al
// día en cada sentido, Gran Canaria–Madrid ~800, Londres–Nueva York ~3.000). Aprox.

import { POR_ID } from '../data/aeropuertos.js';
import { rentaEn, poblacionEn, PAISES } from '../data/paises.js';
import { distanciaKm, fraccionSobreMar } from './geo.js';
import { estacional, precioTarifa } from './economia.js';
import { anioDecimal, MIN_DIA, dia } from './tiempo.js';
import { hash, generador } from './azar.js';
import { factorDemanda } from './mundo.js';
import { PREFERENCIAS, notaReputacion, etiqueta, etiquetaPrecio } from './reputacion.js';
import { AEROLINEA } from '../data/aerolineas.js';
import { TIPOS } from '../data/aviones.js';
import { evaluarTramo } from './operaciones.js';

const K = 773;
const LF_REFERENCIA = 0.64;

// Grandes centros de conexión: atraen pasaje internacional de todas partes.
const HUBS_GLOBALES = { LHR: 1976, JFK: 1976, CDG: 1976, FRA: 1976, AMS: 1976, NRT: 1978, HKG: 1982, SIN: 1985, DXB: 1998, IST: 2010, DOH: 2010 };
const ESTE = new Set(['PL', 'CS', 'HU', 'RO', 'YU', 'SU']);
const TAMANO = { 1: 0.3, 2: 0.6, 3: 0.85, 4: 1, 5: 1 };

export const clave = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

// Peso económico de un aeropuerto en 1976: población por renta, con rendimientos
// decrecientes en las ciudades enormes (sus viajeros se reparten entre muchos destinos).
export function peso(a) {
  const p = a.pob * rentaEn(a.pais, 1976);
  return p / (1 + p / 8);
}

// Cuánto ha crecido la economía de su país desde 1976 (población por renta).
export function crecimiento(a, anio) {
  return poblacionEn(a.pais, anio) * rentaEn(a.pais, anio) / rentaEn(a.pais, 1976);
}

const memoMar = new Map();
function sobreMar(o, d) {
  const k = clave(o.id, d.id);
  if (!memoMar.has(k)) memoMar.set(k, fraccionSobreMar(o, d));
  return memoMar.get(k);
}

// Integración entre dos países: 0 si hay frontera de verdad, 1 si es como viajar en casa.
function frontera(o, d, anio, dist) {
  if (o.pais === d.pais) return 1;
  let f = dist > 3000 ? 0.4 : 0.2;
  const pa = PAISES[o.pais];
  const pb = PAISES[d.pais];
  if (pa?.ce != null && pb?.ce != null) {
    const desde = Math.max(pa.ce, pb.ce, 1976);
    f += 0.15 * Math.min(1, Math.max(0, (anio - desde) / 20));
  }
  if ((ESTE.has(o.pais) || ESTE.has(d.pais)) && anio < 1990) f *= 0.3;
  return f;
}

function hub(a, anio) {
  return HUBS_GLOBALES[a.id] != null && anio >= HUBS_GLOBALES[a.id] ? 1.5 : 1;
}

// Pasajeros al día en cada sentido para todo el mercado, antes de acontecimientos y precios.
export function demandaBase(o, d, t) {
  const anio = anioDecimal(t);
  const dist = distanciaKm(o, d);
  // El tamaño relativo de las ciudades pesa más que su crecimiento con los años: el tráfico
  // crece algo menos que la economía.
  const masa = Math.pow(peso(o) * peso(d), 0.6) * Math.pow(crecimiento(o, anio) * crecimiento(d, anio), 0.35);
  const turismo = ((o.tur + d.tur) / 2) ** 2;
  const islas = o.grupo && o.grupo === d.grupo ? 2.6 : o.grupo || d.grupo ? 1.1 : 1;
  // Por tierra y a menos de 500 km, el coche y el tren se quedan con parte del viaje.
  const tierra = o.grupo || d.grupo || sobreMar(o, d) > 0.1 ? 1 : Math.min(1, dist / 500);
  const lejania = 1 / (1 + dist / 5000);
  const internacional = o.pais !== d.pais ? hub(o, anio) * hub(d, anio) : 1;
  const propension = 1 + 0.005 * Math.max(0, anio - 1976);
  const temporada = (estacional(o, t) + estacional(d, t)) / 2;
  // Un aeropuerto pequeño atrae menos de lo que su ciudad sugiere: parte de su gente va por
  // carretera al aeropuerto grande más cercano.
  const pequeno = TAMANO[Math.min(o.tam, d.tam)];
  let demanda = K * masa * turismo * islas * tierra * frontera(o, d, anio, dist) * lejania * internacional * propension * pequeno;
  // Entre islas del mismo archipiélago el avión es casi la única forma de viajar: hasta la
  // isla más pequeña tiene un mínimo de pasaje.
  if (o.grupo && o.grupo === d.grupo) demanda = Math.max(demanda, 60 * propension);
  return demanda * temporada;
}

// Pasaje dispuesto a pagar el Concorde: una fracción pequeña del mercado de largo radio entre
// ciudades grandes.
export function demandaPremium(o, d, t) {
  if (distanciaKm(o, d) < 2500 || Math.min(o.tam, d.tam) < 4) return 0;
  return demandaBase(o, d, t) * 0.03;
}

// Los Concorde de la competencia (uno al día en cada ruta), que se reparten ese pasaje.
const CONCORDES_RIVALES = [
  { ruta: ['LHR', 'JFK'], desde: 1977.85, hasta: 2003.83 },
  { ruta: ['CDG', 'JFK'], desde: 1977.85, hasta: 2003.83 },
  { ruta: ['CDG', 'CCS'], desde: 1976.3, hasta: 1982.3 },
  { ruta: ['CDG', 'GIG'], desde: 1976.0, hasta: 1982.3 },
];

export function concordesRivales(o, d, t) {
  const anio = anioDecimal(t);
  if (anio >= 2000.57 && anio < 2001.86) return 0;
  return CONCORDES_RIVALES.filter((x) => x.ruta.includes(o.id) && x.ruta.includes(d.id) && anio >= x.desde && anio < x.hasta).length * 100;
}

// --- Tipo de ruta: cambia lo que pesa al elegir compañía

export function tipoRuta(o, d) {
  const tur = (o.tur + d.tur) / 2;
  if (tur >= 1.5) return 'turistica';
  if (Math.min(o.tam, d.tam) >= 4 && tur < 1.35) return 'negocios';
  return 'mixta';
}

const NIVEL_SERVICIO = { basico: 0, estandar: 0.5, superior: 1 };
const CURVA_S = { turistica: 1.05, mixta: 1.15, negocios: 1.3 };

// --- Reparto

// Reparte la demanda entre las compañías. `ops`: [{ id, asientos, precio, nota, servicio }]
// (precio relativo al normal; nota de reputación 0–100; servicio basico|estandar|superior).
// Devuelve el mismo array con `pax` y la demanda total tras el efecto del precio medio.
export function repartir(demanda, ops, tipo) {
  const pref = PREFERENCIAS[tipo];
  const asientos = ops.reduce((s, x) => s + x.asientos, 0);
  if (!asientos) return { total: demanda, ops: ops.map((x) => ({ ...x, pax: 0 })) };
  // Si los billetes bajan, vuela más gente (el efecto de las de bajo coste).
  const precioMedio = ops.reduce((s, x) => s + x.asientos * x.precio, 0) / asientos;
  const total = demanda * Math.pow(precioMedio, -pref.mercado);
  // Curva en S: quien más vuela una ruta se lleva más que su parte de plazas (horarios, fama,
  // agencias), sobre todo en las de negocios. «Otras» son muchas pequeñas y no la aprovechan.
  const nombradas = ops.filter((x) => x.id !== 'otras').length || 1;
  const curva = (x) => (x.id === 'otras' ? 1 : Math.pow(Math.max(0.02, x.asientos / asientos * nombradas), CURVA_S[tipo] - 1));
  const atractivo = ops.map((x) => x.asientos * curva(x) * Math.pow(x.precio, -pref.precio)
    * Math.exp(1.2 * (x.nota - 50) / 50) * (1 + 0.15 * (NIVEL_SERVICIO[x.servicio] ?? 0.5)));
  const pax = ops.map(() => 0);
  let restante = total;
  let libres = ops.map((_, i) => i);
  // Quien se llena, cede el resto a los demás (dos pasadas bastan).
  for (let pasada = 0; pasada < 3 && restante > 0.5 && libres.length; pasada++) {
    const suma = libres.reduce((s, i) => s + atractivo[i], 0);
    if (suma <= 0) break;
    let sobra = 0;
    const siguen = [];
    for (const i of libres) {
      const quiere = restante * atractivo[i] / suma;
      const hueco = ops[i].asientos * 0.97 - pax[i];
      if (quiere >= hueco) { pax[i] += Math.max(0, hueco); sobra += quiere - Math.max(0, hueco); }
      else { pax[i] += quiere; siguen.push(i); }
    }
    restante = sobra;
    libres = siguen;
  }
  return { total, ops: ops.map((x, i) => ({ ...x, pax: pax[i] })) };
}

// --- Estado del mercado de una ruta

// Cobertura de «otras compañías» en un mercado: unas veces van cortas (hay hueco) y otras
// sobradas (mercado saturado). Cambia cada cinco años.
function cobertura(estado, k, anio) {
  const r = generador(hash(estado.semilla, 'cobertura', k, Math.floor(anio / 5)));
  return 0.7 + 0.55 * r();
}

// Plazas al día en cada sentido que el resto de compañías (las que no seguimos una a una)
// pondrían en un mercado sin historia: lo que pide la demanda de hace año y medio.
export function otrasObjetivo(estado, o, d, t, nombradas) {
  const k = clave(o.id, d.id);
  const atras = Math.max(0, t - 1.5 * 365 * MIN_DIA);
  const anio = anioDecimal(t);
  const objetivo = demandaConEventos(estado, o, d, atras) / LF_REFERENCIA * cobertura(estado, k, anio);
  // Donde una compañía que seguimos tiene su base, el resto apenas cuenta: crece ella.
  const enCasa = Object.keys(ofertaNombrada(estado, k)).some((id) => {
    const al = estado.mundo.aerolineas[id];
    return al?.bases.includes(o.id) || al?.bases.includes(d.id);
  });
  return Math.max(0, objetivo - nombradas) * (enCasa ? 0.35 : 1);
}

// Demanda con los acontecimientos del mundo (sin el efecto del precio).
export function demandaConEventos(estado, o, d, t) {
  return demandaBase(o, d, t) * (estado.mundo ? factorDemanda(estado.mundo, o, d, t) : 1);
}

export function ofertaNombrada(estado, k) {
  return estado.mundo?.oferta?.[k] ?? {};
}

// --- Quién opera una ruta

// Plazas al día en cada sentido que pone el jugador en una ruta, con su tarifa y su servicio.
export function ofertaJugador(estado, o, d) {
  const ruta = estado.rutas.find((r) => (r.origen === o.id && r.destino === d.id) || (r.origen === d.id && r.destino === o.id));
  const avion = ruta && estado.aviones.find((a) => a.id === ruta.avion);
  if (!ruta || !avion) return null;
  const tipo = TIPOS[avion.tipo];
  if (tipo.clase === 'supersonico') return null;
  const tramo = evaluarTramo(tipo.id, o.id, d.id, anioDecimal(estado.t));
  if (!tramo.posible) return null;
  return { asientos: ruta.frecuencia * tramo.plazasMax, precio: precioTarifa(ruta.tarifa, anioDecimal(estado.t), o, d), servicio: ruta.servicio ?? 'estandar', ruta };
}

// Operadores de una ruta con lo que hace falta para repartir: compañías de la competencia,
// el resto («otras») y el jugador.
export function operadores(estado, o, d, t, tipo, { sinJugador = false } = {}) {
  const k = clave(o.id, d.id);
  const ops = [];
  let nombradas = 0;
  for (const [id, x] of Object.entries(ofertaNombrada(estado, k))) {
    const al = estado.mundo.aerolineas[id];
    ops.push({ id, nombre: AEROLINEA[id].nombre, asientos: x.asientos, precio: x.precio, servicio: AEROLINEA[id].servicio, nota: notaReputacion(al.rep, tipo) });
    nombradas += x.asientos;
  }
  const jugador = sinJugador ? null : ofertaJugador(estado, o, d);
  if (jugador) {
    ops.push({ id: 'jugador', nombre: estado.nombre, asientos: jugador.asientos, precio: jugador.precio, servicio: jugador.servicio, nota: notaReputacion(estado.reputacion, tipo) });
    nombradas += jugador.asientos;
  }
  const otras = estado.mundo?.otras?.[k] ?? otrasObjetivo(estado, o, d, t, nombradas);
  if (otras > 1) ops.push({ id: 'otras', nombre: 'Otras compañías', asientos: otras, precio: 1, servicio: 'estandar', nota: 50 });
  return ops;
}

// Reparto del día en una ruta: demanda total, tipo y pasajeros de cada operador por sentido.
export function mercadoRuta(estado, o, d, t, opciones) {
  const tipo = tipoRuta(o, d);
  const demanda = demandaConEventos(estado, o, d, t);
  const ops = operadores(estado, o, d, t, tipo, opciones);
  const { total, ops: con } = repartir(demanda, ops, tipo);
  return { tipo, demanda, total, ops: con };
}

// Pasajeros al día (en cada sentido) que le tocan al jugador en una ruta. Se calcula una vez
// al día por ruta y configuración.
const cache = new Map();
export function paxJugador(estado, o, d, t) {
  const j = ofertaJugador(estado, o, d);
  if (!j) return 0;
  const k = `${estado.semilla}|${dia(t)}|${clave(o.id, d.id)}|${j.asientos}|${j.precio}|${j.servicio}|${Math.round(notaReputacion(estado.reputacion))}`;
  if (!cache.has(k)) {
    if (cache.size > 500) cache.clear();
    const m = mercadoRuta(estado, o, d, t);
    cache.set(k, m.ops.find((x) => x.id === 'jugador')?.pax ?? 0);
  }
  return cache.get(k);
}

// Lo que le tocaría al jugador si entrara (o cambiara) en una ruta con cierta oferta. Con el
// mismo error que el estudio de mercado.
export function estimarJugador(estado, o, d, { asientos, precio = 1, servicio = 'estandar' }, t = estado.t) {
  const tipo = tipoRuta(o, d);
  const ops = operadores(estado, o, d, t, tipo, { sinJugador: true });
  ops.push({ id: 'jugador', asientos, precio, servicio, nota: notaReputacion(estado.reputacion, tipo) });
  const demanda = demandaConEventos(estado, o, d, t) * ruidoEstudio(estado, clave(o.id, d.id), anioDecimal(t));
  const { ops: con } = repartir(demanda, ops, tipo);
  return con.find((x) => x.id === 'jugador').pax;
}

// --- Lo que ve el jugador de un mercado (aproximado)

// Ruido fijo por mercado y año: el estudio de mercado no es exacto.
function ruidoEstudio(estado, k, anio) {
  const r = generador(hash(estado.semilla, 'estudio', k, Math.floor(anio)));
  return 0.88 + 0.24 * r();
}

const redondear = (x) => {
  if (x < 20) return Math.round(x);
  const m = Math.pow(10, Math.floor(Math.log10(x)) - 1);
  return Math.round(x / m) * m;
};

export function infoMercado(estado, o, d, t = estado.t) {
  const k = clave(o.id, d.id);
  const anio = anioDecimal(t);
  const m = mercadoRuta(estado, o, d, t);
  const ruido = ruidoEstudio(estado, k, anio);
  const hace = demandaConEventos(estado, o, d, Math.max(0, t - 365 * MIN_DIA));
  const crecimiento = hace > 0 ? m.demanda / hace - 1 : 0;
  const asientos = m.ops.reduce((s, x) => s + x.asientos, 0);
  const precioMedio = asientos ? m.ops.reduce((s, x) => s + x.asientos * x.precio, 0) / asientos : 1;
  const operadores = m.ops.map((x) => ({
    id: x.id,
    nombre: x.nombre,
    precio: etiquetaPrecio(x.precio / precioMedio),
    servicio: x.servicio,
    reputacion: etiqueta(x.nota),
    presencia: x.asientos / asientos > 0.4 ? 'alta' : x.asientos / asientos > 0.15 ? 'media' : 'baja',
    ocupacion: x.asientos ? x.pax / x.asientos : 0,
  })).sort((a, b) => (a.id === 'otras') - (b.id === 'otras'));
  return {
    tipo: m.tipo,
    demanda: redondear(m.total * ruido),
    oferta: redondear(asientos),
    tendencia: crecimiento > 0.05 ? 'creciendo' : crecimiento < -0.05 ? 'bajando' : 'estable',
    operadores,
  };
}
