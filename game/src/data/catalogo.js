import { FICHAS, TIPOS_MOVIMIENTO } from './fichas.js';

export { FICHAS, TIPOS_MOVIMIENTO };

/** Valor de `fichaId` para un ejercicio que no quiere ficha aunque el nombre encaje. */
export const SIN_FICHA = 'ninguna';

const VACIAS = new Set(['de', 'del', 'con', 'en', 'al', 'a', 'la', 'el', 'los', 'las', 'y', 'por', 'o']);

/**
 * Palabras de un nombre, sin tildes ni plurales: «Elevaciones laterales» y «elevación
 * lateral» tienen que ser el mismo ejercicio. El singular es tosco a propósito; basta con
 * que los dos lados se recorten igual.
 */
function palabras(nombre) {
  return String(nombre)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((p) => p && !VACIAS.has(p))
    .map((p) => (/[nlr]es$/.test(p) && p.length > 4 ? p.slice(0, -2) : p.length > 3 ? p.replace(/s$/, '') : p));
}

const INDICE = FICHAS.map((f) => ({ ficha: f, palabras: palabras(f.nombre) }));
const clave = (lista) => [...lista].sort().join(' ');
const contiene = (grande, pequena) => pequena.every((p) => grande.includes(p));

/**
 * La ficha que corresponde a un nombre escrito a mano, o null.
 *
 * Primero el nombre exacto. Si no, la ficha más corta que contenga todo lo escrito
 * («Curl femoral» → «Curl femoral sentado»), siempre que lo escrito sea al menos la mitad
 * de su nombre: «Tríceps polea» no basta para decidir que es la extensión por encima de
 * la cabeza. Si no, la más larga contenida en lo escrito
 * («Press banca agarre cerrado» → «Press banca»). Mejor sin ficha que con una equivocada,
 * así que no se adivina más allá.
 */
export function buscarFicha(nombre) {
  const buscadas = palabras(nombre);
  if (!buscadas.length) return null;

  const exacta = INDICE.find((x) => clave(x.palabras) === clave(buscadas));
  if (exacta) return exacta.ficha;

  const porNombre = (a, b) => a.ficha.nombre.localeCompare(b.ficha.nombre, 'es');
  const mas = INDICE.filter((x) => contiene(x.palabras, buscadas) && buscadas.length * 2 >= x.palabras.length)
    .sort((a, b) => a.palabras.length - b.palabras.length || porNombre(a, b));
  if (mas.length) return mas[0].ficha;

  const menos = INDICE.filter((x) => x.palabras.length > 1 && contiene(buscadas, x.palabras))
    .sort((a, b) => b.palabras.length - a.palabras.length || porNombre(a, b));
  return menos[0]?.ficha ?? null;
}

export const fichaPorId = (id) => FICHAS.find((f) => f.id === id) ?? null;

/** La ficha de un ejercicio de la rutina: la elegida a mano, o la que encaje por nombre. */
export function fichaDe(ejercicio) {
  if (ejercicio.fichaId === SIN_FICHA) return null;
  if (ejercicio.fichaId) return fichaPorId(ejercicio.fichaId) ?? buscarFicha(ejercicio.nombre);
  return buscarFicha(ejercicio.nombre);
}
