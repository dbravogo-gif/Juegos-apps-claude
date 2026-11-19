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

/**
 * Tiempo en segundos. Acepta «45:30» o «45,30» (el teclado decimal del iPhone no tiene «:»),
 * «1:02:15», «1h30», «45» (minutos) y cifras seguidas: «4530» → 45:30, «10215» → 1:02:15.
 */
export function leerTiempo(texto) {
  const t0 = limpiar(texto);
  if (!t0) return null;
  let v = null;
  const horas = /^(\d{1,2})h(?:(\d{1,2})(?:m|min)?)?$/.exec(t0);
  if (horas) {
    const min = Number(horas[2] ?? 0);
    if (min > 59) return null;
    v = Number(horas[1]) * 3600 + min * 60;
  } else if (/^\d+$/.test(t0)) {
    if (t0.length <= 3) v = Number(t0) * 60;
    else v = desdeCifras(t0);
  } else {
    const t = t0.replace(/[.,']/g, ':').replace(/:+$/, '');
    const m = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/.exec(t);
    if (!m) return null;
    const [h, min, s] = [Number(m[1] ?? 0), Number(m[2]), Number(m[3])];
    if (s > 59 || (m[1] !== undefined && min > 59)) return null;
    v = h * 3600 + min * 60 + s;
  }
  return v != null && dentro('tiempo', v) ? v : null;
}

/** «4530» → 45:30; «10215» → 1:02:15; «010215» → 1:02:15. null si minutos o segundos pasan de 59. */
function desdeCifras(t) {
  if (t.length > 6) return null;
  const s = Number(t.slice(-2));
  const min = Number(t.slice(-4, -2));
  const h = t.length > 4 ? Number(t.slice(0, -4)) : 0;
  if (s > 59 || (t.length > 4 && min > 59)) return null;
  return h * 3600 + min * 60 + s;
}

/** Ritmo en s/km: «5:12», «5,12», «5:12/km» → 312; «5» → 300; «512» → 5:12. */
export function leerRitmo(texto) {
  const t = limpiar(texto).replace(/\/?km$/, '').replace(/[.,']/g, ':');
  if (!t) return null;
  let v;
  if (/^\d{1,2}$/.test(t)) v = Number(t) * 60;
  else if (/^\d{3,4}$/.test(t)) {
    const seg = Number(t.slice(-2));
    if (seg > 59) return null;
    v = Number(t.slice(0, -2)) * 60 + seg;
  } else {
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
  return String(Math.round(km * 1000) / 1000).replace('.', ',');
}

export const leer = { distancia: leerDistancia, tiempo: leerTiempo, ritmo: leerRitmo };
export const formatearCampo = { distancia: formatearDistancia, tiempo: formatearTiempo, ritmo: formatearRitmo };

/**
 * El atleta escribe un dato. `estado` = { valores, orden }: `orden` son los campos que ha escrito
 * él, del más antiguo al más reciente. Con dos datos suyos, el tercero se calcula; si escribe el
 * tercero, se recalcula otro, conservando la distancia. Así los tres siempre cuadran.
 * Devuelve { valores, orden, calculado, imposible }: `imposible` si el tercero sale fuera de rango.
 */
export function editarCarrera(estado, campo, valor) {
  const valores = { distancia: null, tiempo: null, ritmo: null, ...(estado?.valores ?? {}) };
  let orden = (estado?.orden ?? []).filter((c) => c !== campo && valores[c] != null);
  valores[campo] = valor;
  if (valor != null) {
    orden = [...orden, campo];
    // Con tres datos se queda el recién escrito y la distancia (la da el GPS: es la más fiable).
    if (orden.length > 2) orden = campo !== 'distancia' && orden.includes('distancia') ? ['distancia', campo] : orden.slice(-2);
  }
  const resultado = { valores, orden, calculado: null, imposible: false };
  const libre = CAMPOS.filter((c) => !orden.includes(c));
  if (orden.length < 2) {
    for (const c of libre) if (c !== campo) valores[c] = null; // sin dos datos no hay calculado
    return resultado;
  }
  const falta = libre[0];
  let r;
  if (falta === 'ritmo') r = Math.round(valores.tiempo / valores.distancia);
  if (falta === 'tiempo') r = Math.round(valores.ritmo * valores.distancia);
  if (falta === 'distancia') r = Math.round((valores.tiempo / valores.ritmo) * 100) / 100;
  resultado.calculado = falta;
  if (dentro(falta, r)) valores[falta] = r;
  else { valores[falta] = null; resultado.imposible = true; }
  return resultado;
}

/** Estado inicial a partir de valores guardados (los de una valoración ya hecha). */
export function estadoCarrera(valores) {
  const v = { distancia: null, tiempo: null, ritmo: null, ...(valores ?? {}) };
  const orden = CAMPOS.filter((c) => v[c] != null).slice(0, 2);
  return { valores: v, orden };
}
