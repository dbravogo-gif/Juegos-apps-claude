import type { DefTablaTipos } from '../core/modelo';

export const TIPOS = [
  { id: 'comun', nombre: 'Común', color: 0xa8a29e },
  { id: 'agua', nombre: 'Agua', color: 0x3b82f6 },
  { id: 'tierra', nombre: 'Tierra', color: 0xa16207 },
  { id: 'planta', nombre: 'Planta', color: 0x16a34a },
  { id: 'aire', nombre: 'Aire', color: 0x7dd3fc },
  { id: 'electrico', nombre: 'Eléctrico', color: 0xeab308 },
  { id: 'hielo', nombre: 'Hielo', color: 0x67e8f9 },
  { id: 'infernal', nombre: 'Infernal', color: 0xdc2626 },
  { id: 'plasma', nombre: 'Plasma', color: 0xd946ef },
  { id: 'mental', nombre: 'Mental', color: 0xec4899 },
  { id: 'luz', nombre: 'Luz', color: 0xfde68a },
  { id: 'oscuridad', nombre: 'Oscuridad', color: 0x57534e },
  { id: 'espectral', nombre: 'Espectral', color: 0x7c3aed },
  { id: 'acero', nombre: 'Acero', color: 0x94a3b8 },
  { id: 'ancestral', nombre: 'Ancestral', color: 0xb45309 },
] as const;

export type TipoId = (typeof TIPOS)[number]['id'];

type Relacion = { eficaz: TipoId[]; pocoEficaz: TipoId[]; sinEfecto: TipoId[] };

/**
 * Tabla de eficacias: tipo del movimiento atacante contra el tipo del defensor. Lo que no aparece
 * es ×1. Con dos tipos, los multiplicadores se multiplican.
 *
 * Parte de la tabla del autor (2026-10-23) y la reduce a petición suya (2026-10-24), porque
 * tenía demasiadas debilidades y resistencias:
 * - Solo se resisten a sí mismos Agua, Planta, Infernal, Eléctrico y Plasma, para que una
 *   criatura Agua/Tierra no sea débil al Agua.
 * - Ancestral ya no resiste nada; sigue siendo débil a Hielo y a Ancestral.
 * - Acero solo resiste a Común, Planta y Ancestral.
 * - Cada tipo es muy eficaz contra tres como mucho, y resiste a tres como mucho.
 * - Se quedan las cuatro inmunidades.
 */
const RELACIONES: Record<TipoId, Relacion> = {
  comun: { eficaz: [], pocoEficaz: ['acero'], sinEfecto: ['espectral'] },
  agua: { eficaz: ['infernal', 'tierra'], pocoEficaz: ['agua', 'planta'], sinEfecto: [] },
  tierra: { eficaz: ['electrico', 'infernal', 'acero'], pocoEficaz: ['planta'], sinEfecto: ['aire'] },
  planta: { eficaz: ['agua', 'tierra'], pocoEficaz: ['planta', 'infernal', 'acero'], sinEfecto: [] },
  aire: { eficaz: ['planta', 'tierra'], pocoEficaz: ['electrico'], sinEfecto: [] },
  electrico: { eficaz: ['agua', 'aire'], pocoEficaz: ['electrico'], sinEfecto: ['tierra'] },
  hielo: { eficaz: ['planta', 'aire', 'ancestral'], pocoEficaz: ['infernal'], sinEfecto: [] },
  infernal: { eficaz: ['planta', 'hielo', 'acero'], pocoEficaz: ['infernal', 'agua', 'tierra'], sinEfecto: [] },
  plasma: { eficaz: ['agua', 'aire', 'acero'], pocoEficaz: ['tierra', 'plasma'], sinEfecto: [] },
  mental: { eficaz: ['oscuridad', 'espectral'], pocoEficaz: [], sinEfecto: [] },
  luz: { eficaz: ['oscuridad', 'espectral'], pocoEficaz: [], sinEfecto: [] },
  oscuridad: { eficaz: ['mental', 'luz'], pocoEficaz: [], sinEfecto: [] },
  espectral: { eficaz: ['mental', 'espectral'], pocoEficaz: ['oscuridad'], sinEfecto: ['comun'] },
  acero: { eficaz: ['hielo', 'luz'], pocoEficaz: ['agua'], sinEfecto: [] },
  ancestral: { eficaz: ['ancestral', 'plasma'], pocoEficaz: ['acero'], sinEfecto: [] },
};

export const TABLA_TIPOS: DefTablaTipos = {
  tipos: TIPOS.map((t) => ({ ...t })),
  relaciones: RELACIONES,
};
