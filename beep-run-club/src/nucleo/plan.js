// El plan: sesiones con fecha, título, nota y ejercicios. Validar, agrupar por días y copiar.

import { esFecha, diasDeSemana, diferenciaDias, sumarDias } from './fechas.js';

export const MAX = { titulo: 80, nombre: 80, detalle: 300, nota: 500 };

const texto = (v) => (typeof v === 'string' ? v.trim() : '');

/**
 * Valida y limpia una sesión. Devuelve { ok, errores, sesion }.
 * Una sesión: { id, fecha, titulo, nota, ejercicios: [{ id, nombre, detalle, nota, carrera }] }.
 */
export function validarSesion(s) {
  const errores = [];
  if (!s || typeof s !== 'object') return { ok: false, errores: ['La sesión está vacía.'], sesion: null };
  const sesion = {
    id: texto(s.id),
    fecha: texto(s.fecha),
    titulo: texto(s.titulo),
    nota: texto(s.nota),
    ejercicios: [],
  };
  if (!sesion.id) errores.push('Falta el identificador de la sesión.');
  if (!esFecha(sesion.fecha)) errores.push('La fecha no es válida.');
  if (!sesion.titulo) errores.push('Ponle un título a la sesión.');
  if (sesion.titulo.length > MAX.titulo) errores.push(`El título pasa de ${MAX.titulo} caracteres.`);
  if (sesion.nota.length > MAX.nota) errores.push(`La nota pasa de ${MAX.nota} caracteres.`);
  const lista = Array.isArray(s.ejercicios) ? s.ejercicios : [];
  if (lista.length === 0) errores.push('Añade al menos un ejercicio.');
  const ids = new Set();
  lista.forEach((e, i) => {
    const ej = {
      id: texto(e?.id),
      nombre: texto(e?.nombre),
      detalle: texto(e?.detalle),
      nota: texto(e?.nota),
      carrera: e?.carrera === true,
    };
    const n = i + 1;
    if (!ej.id || ids.has(ej.id)) errores.push(`El ejercicio ${n} no tiene un identificador único.`);
    ids.add(ej.id);
    if (!ej.nombre) errores.push(`El ejercicio ${n} no tiene nombre.`);
    if (ej.nombre.length > MAX.nombre) errores.push(`El nombre del ejercicio ${n} es demasiado largo.`);
    if (ej.detalle.length > MAX.detalle) errores.push(`El detalle del ejercicio ${n} es demasiado largo.`);
    if (ej.nota.length > MAX.nota) errores.push(`La nota del ejercicio ${n} es demasiado larga.`);
    sesion.ejercicios.push(ej);
  });
  return { ok: errores.length === 0, errores, sesion };
}

/** Ordena por fecha y, dentro del mismo día, por título. */
export function ordenarSesiones(sesiones) {
  return [...sesiones].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.titulo.localeCompare(b.titulo, 'es'));
}

/** Los 7 días de la semana con sus sesiones: [{ fecha, sesiones }]. */
export function agruparPorDia(sesiones, lunes) {
  const orden = ordenarSesiones(sesiones);
  return diasDeSemana(lunes).map((fecha) => ({ fecha, sesiones: orden.filter((s) => s.fecha === fecha) }));
}

/**
 * Copia las sesiones de la semana que empieza en `lunesOrigen` a la que empieza en `lunesDestino`.
 * `nuevoId()` da ids nuevos para sesiones y ejercicios.
 */
export function copiarSemana(sesiones, lunesOrigen, lunesDestino, nuevoId) {
  const desplazamiento = diferenciaDias(lunesOrigen, lunesDestino);
  const fin = sumarDias(lunesOrigen, 6);
  return ordenarSesiones(sesiones.filter((s) => s.fecha >= lunesOrigen && s.fecha <= fin))
    .map((s) => copiarSesion(s, sumarDias(s.fecha, desplazamiento), nuevoId));
}

export function copiarSesion(sesion, fecha, nuevoId) {
  return {
    ...sesion,
    id: nuevoId(),
    fecha,
    ejercicios: sesion.ejercicios.map((e) => ({ ...e, id: nuevoId() })),
  };
}

/** Nombres de ejercicio ya usados, sin repetir y en orden alfabético, para autocompletar. */
export function nombresUsados(sesiones) {
  const vistos = new Map();
  for (const s of sesiones) {
    for (const e of s.ejercicios ?? []) {
      const clave = e.nombre.trim().toLowerCase();
      if (clave && !vistos.has(clave)) vistos.set(clave, { nombre: e.nombre.trim(), carrera: e.carrera === true });
    }
  }
  return [...vistos.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}
