import { MUEBLES, EQUIPO } from '../../data/content.js';
import { valorReventa } from './rewards.js';

export const CATALOGO = [...MUEBLES, ...EQUIPO];

export const articuloPorId = (id) => CATALOGO.find((a) => a.id === id) ?? null;

export const MOTIVO_COMPRA = {
  desconocido: 'Ese artículo no existe.',
  nivel: 'Aún no tienes nivel para comprarlo.',
  monedas: 'No te llegan las monedas.',
  repetido: 'Ya lo tienes.',
};

/**
 * Solo se permite una unidad de cada artículo: el inventario es un conjunto de identificadores
 * y no necesita llevar cantidades.
 *
 * @returns {{ ok: boolean, motivo?: keyof MOTIVO_COMPRA, articulo?: object }}
 */
export function puedeComprar({ articuloId, nivel, monedas, inventario = [] }) {
  const articulo = articuloPorId(articuloId);
  if (!articulo) return { ok: false, motivo: 'desconocido' };
  if (inventario.includes(articuloId)) return { ok: false, motivo: 'repetido' };
  if (nivel < articulo.nivel) return { ok: false, motivo: 'nivel' };
  if (monedas < articulo.precio) return { ok: false, motivo: 'monedas' };
  return { ok: true, articulo };
}

export function puedeVender({ articuloId, inventario = [] }) {
  const articulo = articuloPorId(articuloId);
  if (!articulo || !inventario.includes(articuloId)) return { ok: false, motivo: 'desconocido' };
  return { ok: true, articulo, reembolso: valorReventa(articulo.precio) };
}

/** Ranura de equipo que ocupa un artículo, o `null` si no es equipable. */
export function ranuraDe(articuloId) {
  const articulo = articuloPorId(articuloId);
  return articulo && ['arma', 'armadura', 'accesorio'].includes(articulo.tipo) ? articulo.tipo : null;
}
