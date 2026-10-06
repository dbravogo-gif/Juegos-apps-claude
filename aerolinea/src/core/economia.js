// Demanda, tarifas y costes.
//
// El dinero es nominal: los precios de cada año en dólares de ese año. Las tarifas y los
// costes de servicios siguen el IPC de EE. UU. y el combustible tiene su propia serie, que es
// la que trae las crisis del petróleo. Las cifras de tasas, catering y tarifas son
// aproximaciones de juego (ver FUENTES.md).

import { verano } from './clima.js';
import { distanciaKm } from './geo.js';
import { mes } from './tiempo.js';
import { nivelCostes } from '../data/aeropuertos.js';

export const CAJA_INICIAL = 3e6;
export const INTERES_ANUAL = 0.09;
export const CUOTA_MAXIMA = 0.1;

// IPC de EE. UU., media anual (CPI-U, 1982-84 = 100).
const IPC = {
  1976: 56.9, 1977: 60.6, 1978: 65.2, 1979: 72.6, 1980: 82.4, 1981: 90.9, 1982: 96.5, 1983: 99.6,
  1984: 103.9, 1985: 107.6, 1986: 109.6, 1987: 113.6, 1988: 118.3, 1989: 124.0, 1990: 130.7,
  1991: 136.2, 1992: 140.3, 1993: 144.5, 1994: 148.2, 1995: 152.4, 1996: 156.9, 1997: 160.5,
  1998: 163.0, 1999: 166.6, 2000: 172.2, 2001: 177.1, 2002: 179.9, 2003: 184.0, 2004: 188.9,
  2005: 195.3, 2006: 201.6, 2007: 207.3, 2008: 215.3, 2009: 214.5, 2010: 218.1, 2011: 224.9,
  2012: 229.6, 2013: 233.0, 2014: 236.7, 2015: 237.0, 2016: 240.0, 2017: 245.1, 2018: 251.1,
  2019: 255.7, 2020: 258.8, 2021: 271.0, 2022: 292.7, 2023: 304.7, 2024: 313.7, 2025: 322, 2026: 330,
};

// Queroseno de aviación para aerolíneas de EE. UU., dólares por galón. 1978 (40 ¢), finales de
// 1979 (80 ¢) y 1980 (86,8 ¢) tienen fuente; el resto es aproximado.
const QUEROSENO = {
  1976: 0.33, 1977: 0.37, 1978: 0.40, 1979: 0.60, 1980: 0.87, 1981: 1.02, 1982: 0.97, 1983: 0.88,
  1984: 0.83, 1985: 0.79, 1986: 0.54, 1987: 0.53, 1988: 0.48, 1989: 0.55, 1990: 0.77, 1991: 0.66,
  1992: 0.59, 1993: 0.55, 1994: 0.50, 1995: 0.53, 1996: 0.63, 1997: 0.60, 1998: 0.44, 1999: 0.52,
  2000: 0.88, 2001: 0.78, 2002: 0.71, 2003: 0.85, 2004: 1.15, 2005: 1.65, 2006: 1.93, 2007: 2.10,
  2008: 3.03, 2009: 1.88, 2010: 2.24, 2011: 3.00, 2012: 3.06, 2013: 2.98, 2014: 2.86, 2015: 1.87,
  2016: 1.42, 2017: 1.65, 2018: 2.17, 2019: 2.01, 2020: 1.33, 2021: 1.80, 2022: 3.20, 2023: 2.80,
  2024: 2.50, 2025: 2.30, 2026: 2.30,
};
const KG_POR_GALON = 3.03;

const acotar = (anio) => Math.max(1976, Math.min(2026, Math.floor(anio)));
export const indice = (anio) => IPC[acotar(anio)] / IPC[1976];
export const precioCombustibleKg = (anio) => QUEROSENO[acotar(anio)] / KG_POR_GALON;
export const precioGalon = (anio) => QUEROSENO[acotar(anio)];

// Precio de un avión nuevo en un año: el de catálogo en su año de entrada, actualizado.
export const precioNuevo = (tipo, anio) => tipo.precio * indice(anio) / indice(Math.max(1976, tipo.entrada));

export const TARIFAS = {
  economica: { nombre: 'Económica', precio: 0.8 },
  normal: { nombre: 'Normal', precio: 1 },
  alta: { nombre: 'Alta', precio: 1.25 },
};

// Billete en dólares de 1976: los tramos cortos son caros por km; los largos compiten con los
// chárter. El Concorde cobra como una primera clase con recargo.
export function tarifaBase(distancia) {
  return distancia <= 1000 ? 25 + 0.06 * distancia : 85 + 0.045 * (distancia - 1000);
}

export function precioBillete(distancia, tarifa, anio, supersonico = false) {
  const p = tarifaBase(distancia) * TARIFAS[tarifa].precio * indice(anio);
  return Math.round(supersonico ? p * 3.2 : p);
}

function estacional(aeropuerto, t) {
  if (!aeropuerto.temporada) return 1;
  const s = verano(mes(t), aeropuerto.lat);
  const pico = aeropuerto.temporada === 'verano' ? s : 1 - s;
  return 1 + 0.4 * (pico - 0.5) * 2 * Math.min(1, aeropuerto.tur - 0.5);
}

// Pasajeros al día en cada sentido para todo el mercado, no solo para ti.
export function demandaMercado(o, d, t) {
  const dist = distanciaKm(o, d);
  const pob = Math.pow(Math.max(0.05, o.pob) * Math.max(0.05, d.pob), 0.4);
  const turismo = ((o.tur + d.tur) / 2) ** 2;
  const temporada = (estacional(o, t) + estacional(d, t)) / 2;
  // Sin alternativa por tierra: islas y vuelos nacionales largos.
  const islas = o.grupo || d.grupo ? (o.grupo === d.grupo ? 1.5 : 1.4) : 1;
  const nacional = o.pais === d.pais ? 1.3 : 1;
  return (300 * pob * turismo * temporada * islas * nacional) / (1 + dist / 2500);
}

// Pasaje dispuesto a pagar el Concorde: una fracción pequeña del mercado de largo radio entre
// ciudades grandes.
export function demandaPremium(o, d, t) {
  const dist = distanciaKm(o, d);
  if (dist < 2500 || Math.min(o.tam, d.tam) < 4) return 0;
  return demandaMercado(o, d, t) * 0.03;
}

export function factorReputacion(rep) {
  return Math.max(0.3, Math.min(1.6, rep / 50));
}

// Cuanto más grande es el aeropuerto, más competencia establecida hay y menos te toca.
const COMPETENCIA = { 1: 1.4, 2: 1.2, 3: 1, 4: 0.8, 5: 0.55 };

// Lo que te toca a ti al día en ese sentido.
export function demandaPropia(o, d, t, reputacion, tarifa = 'normal', servicio = 'estandar', horas = 1) {
  const elasticidad = Math.pow(TARIFAS[tarifa].precio, -1.6);
  const competencia = COMPETENCIA[Math.max(o.tam, d.tam)];
  const atencion = horas > 1.5 ? 1 + SERVICIOS[servicio].demanda : 1;
  return demandaMercado(o, d, t) * CUOTA_MAXIMA * competencia * factorReputacion(reputacion) * elasticidad * atencion;
}

// --- Catering y servicio a bordo

export const SERVICIOS = {
  basico: { nombre: 'Básico', coste: 2, demanda: -0.06, reputacion: -0.01 },
  estandar: { nombre: 'Estándar', coste: 4.5, demanda: 0, reputacion: 0 },
  superior: { nombre: 'Superior', coste: 9, demanda: 0.06, reputacion: 0.02 },
};

// Coste del catering por pasajero en un aeropuerto. El país pesa, pero también la competencia
// entre proveedores (los grandes aeropuertos tienen varios) y el volumen que contratas allí.
export function costeCatering(servicio, horas, aeropuerto, salidasDiarias, anio, supersonico = false) {
  const pais = 0.8 + 0.25 * nivelCostes(aeropuerto);
  const proveedores = aeropuerto.tam >= 5 ? 0.9 : aeropuerto.tam <= 2 ? 1.15 : 1;
  const volumen = salidasDiarias >= 10 ? 0.85 : salidasDiarias >= 4 ? 0.92 : 1;
  const base = SERVICIOS[supersonico ? 'superior' : servicio].coste * (supersonico ? 3 : 1);
  return base * (0.4 + 0.6 * horas) * pais * proveedores * volumen * indice(anio);
}

// --- Costes de aeropuerto

const ESCALA_HANDLING = { regional: 0.5, estrecho: 1, cuatrimotor: 1.6, ancho: 3, supersonico: 3 };

export function tasasAeropuerto(tipo, aeropuerto, paxSalida, anio) {
  const nivel = nivelCostes(aeropuerto);
  const i = indice(anio);
  const aterrizaje = tipo.mtow * 2.5 * nivel * (0.7 + 0.15 * aeropuerto.tam) * i;
  const handling = 120 * ESCALA_HANDLING[tipo.clase] * nivel * i;
  const pasajeros = paxSalida * 1.5 * nivel * (0.5 + 0.25 * aeropuerto.tam) * i;
  return { aterrizaje, handling, pasajeros, total: aterrizaje + handling + pasajeros };
}

export const pernocta = (tipo, aeropuerto, anio) =>
  40 * ESCALA_HANDLING[tipo.clase] * nivelCostes(aeropuerto) * (0.5 + 0.2 * aeropuerto.tam) * indice(anio);

// --- Costes del vuelo

const LINEA_HORA = { regional: 40, estrecho: 80, cuatrimotor: 120, ancho: 220, supersonico: 600 };

export function tripulacionHora(tipo, anio) {
  return ((tipo.tecnica === 3 ? 160 : 130) + Math.ceil(tipo.plazas / 50) * 14) * indice(anio);
}

export function costeVuelo({ tipo, horas, origen, destino, pax, ingreso, anio, combustibleExtra = false, catering = 0 }) {
  const combustible = tipo.consumo * horas * precioCombustibleKg(anio) * (combustibleExtra ? 1.06 : 1);
  const tripulacion = tripulacionHora(tipo, anio) * horas;
  const linea = LINEA_HORA[tipo.clase] * horas * indice(anio);
  const tasasOrigen = tasasAeropuerto(tipo, origen, pax, anio);
  const tasasDestino = tasasAeropuerto(tipo, destino, 0, anio);
  const aeropuertos = tasasOrigen.pasajeros + tasasOrigen.handling + tasasDestino.aterrizaje;
  const comision = ingreso * 0.09;
  const total = combustible + tripulacion + linea + aeropuertos + catering + comision;
  return {
    total: Math.round(total),
    desglose: { combustible, tripulacion, mantenimiento: linea, aeropuertos, catering, comision },
  };
}

// --- Costes fijos diarios

export const costeBaseDiario = (aeropuerto, anio) => aeropuerto.tam * 150 * nivelCostes(aeropuerto) * indice(anio);
export const administracionDiaria = (tipo, anio) => 250 * ESCALA_HANDLING[tipo.clase] * indice(anio);
// Sueldos que se pagan aunque el avión no vuele: unas tres horas de tripulación al día.
export const tripulacionFijaDiaria = (tipo, anio) => tripulacionHora(tipo, anio) * 3;
export const seguroDiario = (valor) => (valor * 0.015) / 365;
