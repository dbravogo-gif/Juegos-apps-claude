// El almacén: las criaturas que no van en el equipo viven en las páginas del Bestiario, como
// las cajas de los juegos del género. Cada página tiene 30 huecos fijos (6 × 5), que pueden
// estar vacíos. Las funciones modifican la partida.

import type { Criatura } from './modelo';
import { darObjeto, MAX_EQUIPO, type Partida } from './partida';

export const PAGINAS = 10;
export const HUECOS_PAGINA = 30;
export const COLUMNAS_PAGINA = 6;

export type Pagina = (Criatura | null)[];

/** Un sitio donde puede estar una criatura: un puesto del equipo o un hueco de una página. */
export type Lugar = { equipo: number } | { pagina: number; hueco: number };

export function paginasVacias(n = PAGINAS): Pagina[] {
  return Array.from({ length: n }, () => Array<Criatura | null>(HUECOS_PAGINA).fill(null));
}

/** Reparte una lista de criaturas en páginas, por orden (para migrar partidas antiguas). */
export function enPaginas(criaturas: Criatura[]): Pagina[] {
  const paginas = paginasVacias(Math.max(PAGINAS, Math.ceil(criaturas.length / HUECOS_PAGINA)));
  criaturas.forEach((c, i) => (paginas[Math.floor(i / HUECOS_PAGINA)][i % HUECOS_PAGINA] = c));
  return paginas;
}

/** Todas las criaturas guardadas, sin huecos. */
export function guardadas(p: Partida): Criatura[] {
  return p.paginas.flat().filter((c): c is Criatura => c !== null);
}

/** Guarda una criatura en el primer hueco libre. Si no queda ninguno, abre una página nueva. */
export function guardar(p: Partida, c: Criatura): { pagina: number; hueco: number } {
  for (let pagina = 0; pagina < p.paginas.length; pagina++) {
    const hueco = p.paginas[pagina].indexOf(null);
    if (hueco >= 0) {
      p.paginas[pagina][hueco] = c;
      return { pagina, hueco };
    }
  }
  p.paginas.push(...paginasVacias(1));
  p.paginas[p.paginas.length - 1][0] = c;
  return { pagina: p.paginas.length - 1, hueco: 0 };
}

export function enLugar(p: Partida, l: Lugar): Criatura | null {
  return 'equipo' in l ? (p.equipo[l.equipo] ?? null) : (p.paginas[l.pagina]?.[l.hueco] ?? null);
}

/** El equipo tiene que quedarse con alguna criatura en pie. */
function equipoValido(equipo: Criatura[]): boolean {
  return equipo.some((c) => c.vida > 0);
}

/**
 * Mueve la criatura de `desde` a `hasta`. Si `hasta` está ocupado, se cambian de sitio. Devuelve
 * por qué no se puede, o `null` si se ha movido.
 */
export function mover(p: Partida, desde: Lugar, hasta: Lugar): string | null {
  const a = enLugar(p, desde);
  if (!a) return 'Ahí no hay ninguna criatura';
  const equipo: (Criatura | null)[] = [...p.equipo];
  const paginas = p.paginas.map((pg) => [...pg]);
  if ('equipo' in hasta && hasta.equipo >= p.equipo.length) {
    // A un puesto libre del equipo: va al final.
    if ('equipo' in desde) return null;
    if (p.equipo.length >= MAX_EQUIPO) return `El equipo ya tiene ${MAX_EQUIPO} criaturas`;
    paginas[desde.pagina][desde.hueco] = null;
    equipo.push(a);
  } else {
    // Se cambian de sitio. Si un puesto del equipo se queda vacío, el equipo se cierra.
    const b = enLugar(p, hasta);
    const poner = (l: Lugar, c: Criatura | null) => {
      if ('equipo' in l) equipo[l.equipo] = c;
      else paginas[l.pagina][l.hueco] = c;
    };
    poner(hasta, a);
    poner(desde, b);
  }
  const final = equipo.filter((c): c is Criatura => c !== null);
  if (final.length === 0) return 'El equipo no puede quedarse vacío';
  if (!equipoValido(final)) return 'El equipo necesita alguna criatura en pie';
  p.equipo = final;
  p.paginas = paginas;
  return null;
}

/** La deja en libertad. Su objeto vuelve a la mochila. Devuelve por qué no se puede, o `null`. */
export function liberar(p: Partida, l: Lugar): string | null {
  const c = enLugar(p, l);
  if (!c) return 'Ahí no hay ninguna criatura';
  if ('equipo' in l) {
    const equipo = p.equipo.filter((_, i) => i !== l.equipo);
    if (equipo.length === 0) return 'Es la única criatura de tu equipo';
    if (!equipoValido(equipo)) return 'El equipo necesita alguna criatura en pie';
    p.equipo = equipo;
  } else p.paginas[l.pagina][l.hueco] = null;
  if (c.objeto) darObjeto(p, c.objeto, 1);
  return null;
}
