// Distancia (km), tiempo (segundos) y ritmo (segundos por km): leer lo que escribe el atleta,
// formatearlo y calcular el tercer valor a partir de los otros dos.

export const LIMITES = {
  distancia: { min: 0.01, max: 500 },      // km
  tiempo: { min: 1, max: 72 * 3600 },      // s
  ritmo: { min: 60, max: 30 * 60 },        // s/km: de 1:00 a 30:00
};

export const CAMPOS = ['distancia', 'tiempo', 'ritmo'];

function dentro(campo, v) {
  return Number.isFinite(v) && v >= LIMITES[campo].min && v <= LIMITES[campo].max;
}

function limpiar(texto) {
  return String(texto ?? '').trim().toLowerCase().replace(/\s+/g, '');
}

/** «10,5» «10.5» «10,5km» → 10.5; «800m» → 0.8. null si no se entiende o está fuera de rango. */
export function leerDistancia(texto) {
  const t = limpiar(texto);
  if (!t) return null;
  const m = /^(\d+(?:[.,]\d+)?)(km|m)?$/.exec(t);
  if (!m) return null;
  let v = Number(m[1].replace(',', '.'));
  if (m[2] === 'm') v /= 1000;
  return dentro('distancia', v) ? Math.round(v * 1000) / 1000 : null;
}

/** «45:30» → 2730; «1:02:15» → 3735; «45» → 45 minutos. */
export function leerTiempo(texto) {
  const t = limpiar(texto).replace(/[.'h]/g, ':').replace(/:+$/, '');
  if (!t) return null;
  let v;
  if (/^\d+$/.test(t)) v = Number(t) * 60;
  else {
    const m = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/.exec(t);
    if (!m) return null;
    const [h, min, s] = [Number(m[1] ?? 0), Number(m[2]), Number(m[3])];
    if (s > 59 || (m[1] !== undefined && min > 59)) return null;
    v = h * 3600 + min * 60 + s;
  }
  return dentro('tiempo', v) ? v : null;
}

/** «5:12» «5:12/km» → 312; «5» → 300. */
export function leerRitmo(texto) {
  const t = limpiar(texto).replace(/\/?km$/, '').replace(/[.']/g, ':');
  if (!t) return null;
  let v;
  if (/^\d+$/.test(t)) v = Number(t) * 60;
  else {
    const m = /^(\d{1,2}):(\d{2})$/.exec(t);
    if (!m || Number(m[2]) > 59) return null;
    v = Number(m[1]) * 60 + Number(m[2]);
  }
  return dentro('ritmo', v) ? v : null;
}

const dos = (n) => String(n).padStart(2, '0');

export function formatearTiempo(s) {
  if (!Number.isFinite(s)) return '';
  const r = Math.round(s);
  const h = Math.floor(r / 3600), m = Math.floor((r % 3600) / 60), seg = r % 60;
  return h > 0 ? `${h}:${dos(m)}:${dos(seg)}` : `${m}:${dos(seg)}`;
}

export function formatearRitmo(s) {
  if (!Number.isFinite(s)) return '';
  const r = Math.round(s);
  return `${Math.floor(r / 60)}:${dos(r % 60)}`;
}

export function formatearDistancia(km) {
  if (!Number.isFinite(km)) return '';
  return String(Math.round(km * 100) / 100).replace('.', ',');
}

export const leer = { distancia: leerDistancia, tiempo: leerTiempo, ritmo: leerRitmo };
export const formatearCampo = { distancia: formatearDistancia, tiempo: formatearTiempo, ritmo: formatearRitmo };

/**
 * Calcula el valor que falta. `valores` tiene distancia, tiempo y ritmo (número o null);
 * `calculado` es el campo que se calculó la última vez (o null), para poder recalcularlo.
 * Devuelve { valores, calculado }.
 */
export function completar(valores, calculado = null) {
  const v = { distancia: null, tiempo: null, ritmo: null, ...valores };
  const delAtleta = CAMPOS.filter((c) => v[c] != null && c !== calculado);
  if (delAtleta.length === 2) {
    const falta = CAMPOS.find((c) => !delAtleta.includes(c));
    let r = null;
    if (falta === 'ritmo') r = v.tiempo / v.distancia;
    if (falta === 'tiempo') r = v.ritmo * v.distancia;
    if (falta === 'distancia') r = v.tiempo / v.ritmo;
    r = falta === 'distancia' ? Math.round(r * 100) / 100 : Math.round(r);
    if (dentro(falta, r)) return { valores: { ...v, [falta]: r }, calculado: falta };
    return { valores: { ...v, [falta]: null }, calculado: null };
  }
  if (delAtleta.length < 2 && calculado) return { valores: { ...v, [calculado]: null }, calculado: null };
  return { valores: v, calculado: delAtleta.length === 3 ? null : calculado };
}
