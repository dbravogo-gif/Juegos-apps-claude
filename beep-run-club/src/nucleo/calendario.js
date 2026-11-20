// Calendario de un mes: semanas de lunes a domingo, con los días de los meses vecinos para
// completar la cuadrícula, y el color de cada día según la intensidad de sus sesiones.

import { formatear, lunesDe, sumarDias, MESES_LARGOS } from './fechas.js';

/** { anio, mes } (mes de 1 a 12) de una fecha 'AAAA-MM-DD'. */
export function mesDe(fecha) {
  return { anio: Number(fecha.slice(0, 4)), mes: Number(fecha.slice(5, 7)) };
}

export function sumarMeses({ anio, mes }, n) {
  const total = anio * 12 + (mes - 1) + n;
  return { anio: Math.floor(total / 12), mes: (total % 12) + 1 };
}

export const claveMes = ({ anio, mes }) => `${anio}-${String(mes).padStart(2, '0')}`;

/** 'AAAA-MM' → { anio, mes }, o null si no tiene esa forma. */
export function leerMes(texto) {
  const m = /^(\d{4})-(\d{2})$/.exec(texto ?? '');
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 12) return null;
  return { anio: Number(m[1]), mes: Number(m[2]) };
}

export function tituloMes({ anio, mes }) {
  const nombre = MESES_LARGOS[mes - 1];
  return `${nombre[0].toUpperCase()}${nombre.slice(1)} ${anio}`;
}

/**
 * Semanas del mes, cada una con 7 días { fecha, delMes }. Empieza en el lunes de la semana del día 1
 * y termina en el domingo de la semana del último día (de 4 a 6 semanas).
 */
export function semanasDelMes({ anio, mes }) {
  const primero = formatear(anio, mes, 1);
  const siguiente = sumarMeses({ anio, mes }, 1);
  const ultimo = sumarDias(formatear(siguiente.anio, siguiente.mes, 1), -1);
  const semanas = [];
  for (let lunes = lunesDe(primero); lunes <= ultimo; lunes = sumarDias(lunes, 7)) {
    semanas.push(Array.from({ length: 7 }, (_, i) => {
      const fecha = sumarDias(lunes, i);
      return { fecha, delMes: fecha.slice(0, 7) === primero.slice(0, 7) };
    }));
  }
  return semanas;
}

/** Solo dos colores: 'exigente' si alguna sesión del día lo es, 'suave' si hay sesiones, null si no. */
export function colorDia(sesionesDelDia) {
  if (!sesionesDelDia?.length) return null;
  return sesionesDelDia.some((s) => s.intensidad === 'exigente') ? 'exigente' : 'suave';
}
