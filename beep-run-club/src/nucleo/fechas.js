// Fechas de calendario como texto 'AAAA-MM-DD', sin hora ni zona horaria.
// Sin reloj: la fecha de hoy siempre llega de fuera.

const RE_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;
const DIA_MS = 86400000;

export const DIAS_CORTOS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
export const DIAS_LARGOS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
export const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
export const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
  'septiembre', 'octubre', 'noviembre', 'diciembre'];

const dos = (n) => String(n).padStart(2, '0');

/** Construye 'AAAA-MM-DD' a partir de año, mes (1-12) y día. */
export function formatear(anio, mes, dia) {
  return `${anio}-${dos(mes)}-${dos(dia)}`;
}

function partes(t) {
  const m = RE_FECHA.exec(t);
  if (!m) return null;
  return { anio: Number(m[1]), mes: Number(m[2]), dia: Number(m[3]) };
}

/** true si el texto es una fecha real (rechaza 2026-02-30). */
export function esFecha(t) {
  if (typeof t !== 'string') return false;
  const p = partes(t);
  if (!p || p.mes < 1 || p.mes > 12 || p.dia < 1) return false;
  const d = new Date(Date.UTC(p.anio, p.mes - 1, p.dia));
  return d.getUTCMonth() === p.mes - 1 && d.getUTCDate() === p.dia;
}

function aMs(t) {
  if (!esFecha(t)) throw new Error(`Fecha no válida: ${t}`);
  const p = partes(t);
  return Date.UTC(p.anio, p.mes - 1, p.dia);
}

function deMs(ms) {
  const d = new Date(ms);
  return formatear(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

export function sumarDias(t, n) {
  return deMs(aMs(t) + n * DIA_MS);
}

/** Días de b menos días de a. */
export function diferenciaDias(a, b) {
  return Math.round((aMs(b) - aMs(a)) / DIA_MS);
}

/** 0 = lunes … 6 = domingo. */
export function diaSemana(t) {
  return (new Date(aMs(t)).getUTCDay() + 6) % 7;
}

export function lunesDe(t) {
  return sumarDias(t, -diaSemana(t));
}

export function diasDeSemana(lunes) {
  return Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
}

export function etiquetaDia(t) {
  const p = partes(t);
  return { corto: DIAS_CORTOS[diaSemana(t)], num: p.dia, mes: MESES_CORTOS[p.mes - 1] };
}

/** «17 – 23 NOV», «29 DIC – 4 ENE». */
export function rangoSemana(lunes) {
  const a = partes(lunes);
  const b = partes(sumarDias(lunes, 6));
  if (a.mes === b.mes) return `${a.dia} – ${b.dia} ${MESES_CORTOS[b.mes - 1]}`;
  return `${a.dia} ${MESES_CORTOS[a.mes - 1]} – ${b.dia} ${MESES_CORTOS[b.mes - 1]}`;
}

/** «jueves 20 de noviembre». */
export function fechaLarga(t) {
  const p = partes(t);
  return `${DIAS_LARGOS[diaSemana(t)]} ${p.dia} de ${MESES_LARGOS[p.mes - 1]}`;
}
