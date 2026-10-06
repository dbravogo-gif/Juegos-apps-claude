// Demanda, tarifas y costes. Dólares de 1976.

import { verano } from './clima.js';
import { distanciaKm } from './geo.js';
import { mes } from './tiempo.js';

export const CAJA_INICIAL = 3e6;
export const INTERES_ANUAL = 0.09;
export const CUOTA_MAXIMA = 0.1;

// Cuanto más grande es el aeropuerto, más competencia establecida hay y menos te toca.
const COMPETENCIA = { 1: 1.4, 2: 1.2, 3: 1, 4: 0.8, 5: 0.55 };

export const TARIFAS = {
  economica: { nombre: 'Económica', precio: 0.8 },
  normal: { nombre: 'Normal', precio: 1 },
  alta: { nombre: 'Alta', precio: 1.25 },
};

// Los vuelos largos salen más baratos por km: compiten con los chárter.
export const tarifaBase = (distancia) => (distancia <= 1000 ? 35 + 0.085 * distancia : 120 + 0.06 * (distancia - 1000));

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

export function factorReputacion(rep) {
  return Math.max(0.3, Math.min(1.6, rep / 50));
}

// Lo que te toca a ti al día en ese sentido.
export function demandaPropia(o, d, t, reputacion, tarifa = 'normal') {
  const elasticidad = Math.pow(TARIFAS[tarifa].precio, -1.6);
  const competencia = COMPETENCIA[Math.max(o.tam, d.tam)];
  return demandaMercado(o, d, t) * CUOTA_MAXIMA * competencia * factorReputacion(reputacion) * elasticidad;
}

export function precioBillete(distancia, tarifa = 'normal') {
  return Math.round(tarifaBase(distancia) * TARIFAS[tarifa].precio);
}

export function costeVuelo(tipo, horas, destino, pax, ingreso, combustibleExtra = false) {
  const operacion = horas * tipo.costeHora * (combustibleExtra ? 1.07 : 1);
  const tasas = destino.tam * 90 * (tipo.plazas / 100);
  const pasaje = pax * 6 + ingreso * 0.08;
  return Math.round(operacion + tasas + pasaje);
}

export const costeBaseDiario = (aeropuerto) => aeropuerto.tam * 150;
export const costeTripulacionDiario = (tipo) => tipo.plazas * 5 + 200;
export const seguroDiario = (valor) => (valor * 0.0018) / 30;
