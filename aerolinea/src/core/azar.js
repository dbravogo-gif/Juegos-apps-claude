// Azar determinista. Con la misma semilla, la misma partida: imprescindible para los retos
// compartidos.

// FNV-1a de 32 bits sobre las partes unidas. Sirve para sacar números estables a partir de
// (semilla, aeropuerto, franja), sin guardar nada.
export function hash(...partes) {
  const s = partes.join('|');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Un paso de mulberry32. Devuelve [número en [0, 1), estado siguiente].
function paso(a) {
  a = (a + 0x6d2b79f5) >>> 0;
  let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, a];
}

// Generador desechable a partir de una semilla.
export function generador(semilla) {
  let a = semilla >>> 0;
  return () => {
    const [x, sig] = paso(a);
    a = sig;
    return x;
  };
}

// Generador ligado al estado de la partida: avanza `estado.azar`, que se guarda con la partida.
export function azarDe(estado) {
  return () => {
    const [x, sig] = paso(estado.azar);
    estado.azar = sig;
    return x;
  };
}

export const entre = (r, a, b) => a + (b - a) * r();
export const entero = (r, a, b) => Math.floor(entre(r, a, b + 1));
export const elegir = (r, lista) => lista[Math.floor(r() * lista.length)];

export function ponderado(r, pares) {
  const total = pares.reduce((s, [, p]) => s + p, 0);
  let x = r() * total;
  for (const [valor, p] of pares) {
    x -= p;
    if (x <= 0) return valor;
  }
  return pares[pares.length - 1][0];
}

export function normal(r) {
  const u = Math.max(r(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
}
