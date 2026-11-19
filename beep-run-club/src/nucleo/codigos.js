// Códigos de acceso de los atletas: «LAURA-7K3QXP».
// Prefijo con el nombre (para reconocerlo) y 6 caracteres al azar sin los que se confunden
// (ni I, L, O, 0 ni 1). El azar llega de fuera: rng() devuelve un número en [0, 1).

export const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const LARGO_AZAR = 6;
const RE_CODIGO = new RegExp(`^[A-Z]{1,8}-[${ALFABETO}]{${LARGO_AZAR}}$`);

function sinTildes(t) {
  return String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** «Laura Gómez» → «LAURA»; «Mª José» → «MJOSE». Si no queda nada, «BEEP». */
export function prefijo(nombre) {
  const primera = sinTildes(nombre).toUpperCase().trim().split(/\s+/)[0] ?? '';
  const letras = primera.replace(/[^A-Z]/g, '').slice(0, 8);
  return letras || 'BEEP';
}

export function azar(rng, largo = LARGO_AZAR, alfabeto = ALFABETO) {
  let s = '';
  for (let i = 0; i < largo; i++) s += alfabeto[Math.floor(rng() * alfabeto.length) % alfabeto.length];
  return s;
}

export function generarCodigo(nombre, rng) {
  return `${prefijo(nombre)}-${azar(rng)}`;
}

/** Id interno para documentos: 16 caracteres al azar. */
export function generarId(rng) {
  return azar(rng, 16, 'abcdefghijkmnpqrstuvwxyz23456789');
}

export function esCodigo(t) {
  return typeof t === 'string' && RE_CODIGO.test(t);
}

/**
 * Pasa lo que teclea el atleta a la forma canónica: « laura 7k3qxp » → «LAURA-7K3QXP».
 * Acepta el código sin guion. Devuelve null si no tiene forma de código.
 */
export function normalizarCodigo(texto) {
  const t = sinTildes(texto).toUpperCase().replace(/[\s_]+/g, '');
  if (esCodigo(t)) return t;
  if (t.includes('-')) return null; // con guion, solo vale la forma exacta
  const m = /^([A-Z]{1,8})([A-Z0-9]{6})$/.exec(t);
  if (m && esCodigo(`${m[1]}-${m[2]}`)) return `${m[1]}-${m[2]}`;
  return null;
}
