// Demanda, tarifas y costes.
//
// El dinero es nominal: los precios de cada año en dólares de ese año. Las tarifas y los
// costes de servicios siguen el IPC de EE. UU. y el combustible tiene su propia serie, que es
// la que trae las crisis del petróleo. Las cifras de tasas, catering y tarifas son
// aproximaciones de juego (ver FUENTES.md).

import { verano } from './clima.js';
import { mes } from './tiempo.js';
import { nivelCostes } from '../data/aeropuertos.js';
import { enMercadoUnico, rentaEn } from '../data/paises.js';

export const CAJA_INICIAL = 3e6;
export const INTERES_ANUAL = 0.09;

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

// Billete medio en dólares de 1976 (lo que de verdad se cobra, con descuentos incluidos): los
// tramos cortos son caros por km y los largos compiten con los chárter. Queda cerca del
// rendimiento por pasajero-milla de las aerolíneas de EE. UU. de la época. El Concorde cobra
// como una primera clase con recargo.
export function tarifaBase(distancia) {
  return distancia <= 1000 ? 27 + 0.042 * distancia : 69 + 0.023 * (distancia - 1000);
}

// Hasta la liberalización los precios estaban regulados (gobiernos e IATA): una compañía no
// podía bajar ni subir mucho la tarifa. En Europa llega en 1993, en los vuelos nacionales de
// EE. UU. en 1979 y en el resto, de forma general, hacia 1997.
export function liberalizado(o, d, anio) {
  if (!o || !d) return anio >= 1997;
  if (o.pais === 'US' && d.pais === 'US') return anio >= 1979;
  if (enMercadoUnico(o.pais, anio) && enMercadoUnico(d.pais, anio)) return true;
  return anio >= 1997;
}

// Precio relativo de una tarifa del jugador en una ruta y un año.
export function precioTarifa(tarifa, anio, o, d) {
  const p = TARIFAS[tarifa ?? 'normal'].precio;
  return liberalizado(o, d, anio) ? p : 1 + (p - 1) * 0.5;
}

export function precioBillete(distancia, tarifa, anio, supersonico = false, o = null, d = null) {
  const p = tarifaBase(distancia) * precioTarifa(tarifa, anio, o, d) * indice(anio);
  return Math.round(supersonico ? p * 3.2 : p);
}

export function estacional(aeropuerto, t) {
  if (!aeropuerto.temporada) return 1;
  const s = verano(mes(t), aeropuerto.lat);
  const pico = aeropuerto.temporada === 'verano' ? s : 1 - s;
  return 1 + 0.4 * (pico - 0.5) * 2 * Math.min(1, aeropuerto.tur - 0.5);
}

// --- Catering y servicio a bordo

export const SERVICIOS = {
  basico: { nombre: 'Básico', coste: 0.8, demanda: -0.06, reputacion: -0.01 },
  estandar: { nombre: 'Estándar', coste: 2, demanda: 0, reputacion: 0 },
  superior: { nombre: 'Superior', coste: 4.5, demanda: 0.06, reputacion: 0.02 },
};

// Coste del catering por pasajero en un aeropuerto, en dólares de 1976 para una hora de vuelo
// (unos 3,5 $ una comida en un vuelo de tres horas; en un salto de 40 minutos, casi nada). El
// país pesa, pero también la competencia entre proveedores (los grandes aeropuertos tienen
// varios) y el volumen que contratas allí.
export function costeCatering(servicio, horas, aeropuerto, salidasDiarias, anio, supersonico = false) {
  const pais = 0.8 + 0.25 * nivelCostes(aeropuerto);
  const proveedores = aeropuerto.tam >= 5 ? 0.9 : aeropuerto.tam <= 2 ? 1.15 : 1;
  const volumen = salidasDiarias >= 10 ? 0.85 : salidasDiarias >= 4 ? 0.92 : 1;
  const base = SERVICIOS[supersonico ? 'superior' : servicio].coste * (supersonico ? 3 : 1);
  return base * Math.max(0.15, 0.55 * horas) * pais * proveedores * volumen * indice(anio);
}

// --- Costes de aeropuerto

const ESCALA_HANDLING = { regional: 0.3, estrecho: 1, cuatrimotor: 1.5, ancho: 2.6, supersonico: 2.5 };

export function tasasAeropuerto(tipo, aeropuerto, paxSalida, anio) {
  const nivel = nivelCostes(aeropuerto);
  const i = indice(anio);
  const aterrizaje = tipo.mtow * 2.5 * nivel * (0.7 + 0.15 * aeropuerto.tam) * i;
  // Atención en tierra de cada salida: rampa, equipajes, mostradores, limpieza y personal de
  // escala. En los 70 era una de las partidas grandes de una aerolínea.
  const handling = 520 * ESCALA_HANDLING[tipo.clase] * nivel * i;
  const pasajeros = paxSalida * 1 * nivel * (0.5 + 0.25 * aeropuerto.tam) * i;
  return { aterrizaje, handling, pasajeros, total: aterrizaje + handling + pasajeros };
}

export const pernocta = (tipo, aeropuerto, anio) =>
  40 * ESCALA_HANDLING[tipo.clase] * nivelCostes(aeropuerto) * (0.5 + 0.2 * aeropuerto.tam) * indice(anio);

// --- Costes del vuelo

const LINEA_HORA = { regional: 40, estrecho: 80, cuatrimotor: 120, ancho: 220, supersonico: 600 };

// Sueldos según el país de la compañía: en 1976 una tripulación española costaba bastante
// menos que una de EE. UU. (de eso vivían las chárter españolas). Se acercan con la renta.
export function factorSalarios(pais, anio) {
  return 0.55 + 0.45 * Math.min(1, rentaEn(pais, anio) / rentaEn('US', anio));
}

// Sueldo, cargas y dietas por hora de bloque. Los pilotos de turbohélice cobran menos.
export function tripulacionHora(tipo, anio, pais = 'US') {
  const cabina = (tipo.tecnica === 3 ? 215 : 175) * (tipo.clase === 'regional' ? 0.8 : 1);
  return (cabina + Math.ceil(tipo.plazas / 50) * 20) * indice(anio) * factorSalarios(pais, anio);
}

export function costeVuelo({ tipo, horas, origen, destino, pax, ingreso, anio, combustibleExtra = false, catering = 0, pais = 'US' }) {
  const combustible = tipo.consumo * horas * precioCombustibleKg(anio) * (combustibleExtra ? 1.06 : 1);
  const tripulacion = tripulacionHora(tipo, anio, pais) * horas;
  const linea = LINEA_HORA[tipo.clase] * horas * indice(anio);
  const tasasOrigen = tasasAeropuerto(tipo, origen, pax, anio);
  const tasasDestino = tasasAeropuerto(tipo, destino, 0, anio);
  const aeropuertos = tasasOrigen.pasajeros + tasasOrigen.handling + tasasDestino.aterrizaje;
  // Comisión de agencia y venta, reservas y atención al pasajero.
  const ventas = ingreso * 0.09 + pax * 3 * indice(anio);
  const total = combustible + tripulacion + linea + aeropuertos + catering + ventas;
  return {
    total: Math.round(total),
    desglose: { combustible, tripulacion, mantenimiento: linea, aeropuertos, catering, ventas },
  };
}

// --- Costes fijos diarios

export const costeBaseDiario = (aeropuerto, anio) => aeropuerto.tam * 150 * nivelCostes(aeropuerto) * indice(anio);
// Estructura de la compañía (dirección, administración, oficinas) que crece con la flota.
export const administracionDiaria = (tipo, anio, pais = 'US') => 1400 * ESCALA_HANDLING[tipo.clase] * indice(anio) * factorSalarios(pais, anio);
// Sueldos que se pagan aunque el avión no vuele (reservas, formación, mínimo de tripulaciones):
// hora y media de tripulación al día.
export const tripulacionFijaDiaria = (tipo, anio, pais = 'US') => tripulacionHora(tipo, anio, pais) * 1.5;
export const seguroDiario = (valor) => (valor * 0.015) / 365;
