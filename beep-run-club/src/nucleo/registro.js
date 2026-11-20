// La valoración de una sesión: ejercicios hechos, esfuerzo del 1 al 10, ejercicios demasiado
// duros, distancia, tiempo y ritmo de los ejercicios de carrera, y un comentario.

import { CAMPOS, LIMITES } from './ritmo.js';

export const MAX_COMENTARIO = 1000;

/**
 * Enlace de Strava: solo de strava.com o de los enlaces cortos de la app (strava.app.link), y solo
 * https, para que al entrenador no le llegue cualquier enlace. Devuelve { ok, url } ('' si vacío).
 */
export function limpiarEnlaceStrava(texto) {
  const t = String(texto ?? '').trim();
  if (!t) return { ok: true, url: '' };
  if (t.length > 300) return { ok: false, url: '' };
  let url;
  try { url = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`); } catch { return { ok: false, url: '' }; }
  const host = url.hostname.toLowerCase();
  const deStrava = host === 'strava.com' || host.endsWith('.strava.com') || host === 'strava.app.link';
  if (!deStrava || url.username || url.password) return { ok: false, url: '' };
  url.protocol = 'https:';
  return { ok: true, url: url.toString() };
}

/** Escala de esfuerzo percibido (RPE) del 1 al 10. */
export const ESFUERZO = [
  null,
  'Muy, muy fácil',
  'Muy fácil',
  'Fácil',
  'Cómodo',
  'Moderado',
  'Algo duro',
  'Duro',
  'Muy duro',
  'Durísimo',
  'Al máximo',
];

const esValorCarrera = (campo, v) => v === null || (Number.isFinite(v) && v >= LIMITES[campo].min && v <= LIMITES[campo].max);

/**
 * Valida y limpia una valoración frente a su sesión. Devuelve { ok, errores, registro }.
 * Lo que no pertenece a la sesión (ejercicios que no existen, campos de carrera en un ejercicio
 * que no es de carrera) se descarta.
 */
export function validarRegistro(r, sesion) {
  const errores = [];
  const ids = new Set(sesion.ejercicios.map((e) => e.id));
  const deCarrera = new Set(sesion.ejercicios.filter((e) => e.carrera).map((e) => e.id));
  const lista = (v) => [...new Set(Array.isArray(v) ? v : [])].filter((id) => ids.has(id));

  const registro = {
    sesion: sesion.id,
    fecha: sesion.fecha,
    hechos: lista(r?.hechos),
    esfuerzo: r?.esfuerzo,
    duros: lista(r?.duros),
    carrera: {},
    comentario: typeof r?.comentario === 'string' ? r.comentario.trim() : '',
    strava: '',
  };
  const enlace = limpiarEnlaceStrava(r?.strava);
  if (enlace.ok) registro.strava = enlace.url;
  else errores.push('El enlace de Strava no es válido: cópialo desde «Compartir» en la actividad de Strava.');
  if (!Number.isInteger(registro.esfuerzo) || registro.esfuerzo < 1 || registro.esfuerzo > 10) {
    errores.push('Indica cuánto te ha costado, del 1 al 10.');
  }
  if (registro.comentario.length > MAX_COMENTARIO) errores.push(`El comentario pasa de ${MAX_COMENTARIO} caracteres.`);
  for (const [id, valores] of Object.entries(r?.carrera ?? {})) {
    if (!deCarrera.has(id) || !valores) continue;
    const limpio = {};
    for (const c of CAMPOS) {
      const v = valores[c] ?? null;
      if (!esValorCarrera(c, v)) errores.push(`Revisa ${c === 'distancia' ? 'la distancia' : `el ${c}`}.`);
      else limpio[c] = v;
    }
    if (CAMPOS.some((c) => limpio[c] != null)) registro.carrera[id] = limpio;
  }
  return { ok: errores.length === 0, errores, registro };
}

/** 'pendiente' (sin valorar), 'hecha' (todos los ejercicios) o 'parcial'. */
export function estadoSesion(sesion, registro) {
  if (!registro) return 'pendiente';
  return registro.hechos.length >= sesion.ejercicios.length ? 'hecha' : 'parcial';
}

/** Para el entrenador: una sesión que conviene mirar. */
export function esDura(registro) {
  return !!registro && (registro.esfuerzo >= 9 || registro.duros.length > 0);
}
