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
 * Tabla de eficacias del autor (2026-10-23): tipo del movimiento atacante contra el tipo del
 * defensor. Lo que no aparece es ×1. Con dos tipos, los multiplicadores se multiplican.
 *
 * La tabla del autor ponía Ancestral contra Ancestral a la vez como ×2 y ×0,5; se deja en ×2,
 * como los duelos de dragones del GDD.
 */
const RELACIONES: Record<TipoId, Relacion> = {
  comun: { eficaz: [], pocoEficaz: ['acero'], sinEfecto: ['espectral'] },
  agua: { eficaz: ['infernal', 'tierra'], pocoEficaz: ['agua', 'planta', 'ancestral'], sinEfecto: [] },
  tierra: { eficaz: ['electrico', 'acero', 'infernal', 'plasma'], pocoEficaz: ['planta', 'ancestral'], sinEfecto: ['aire'] },
  planta: { eficaz: ['agua', 'tierra'], pocoEficaz: ['planta', 'infernal', 'aire', 'acero'], sinEfecto: [] },
  aire: { eficaz: ['planta', 'tierra'], pocoEficaz: ['electrico', 'acero', 'ancestral'], sinEfecto: [] },
  electrico: { eficaz: ['agua', 'aire'], pocoEficaz: ['electrico', 'planta', 'ancestral'], sinEfecto: ['tierra'] },
  hielo: { eficaz: ['planta', 'aire', 'tierra', 'ancestral'], pocoEficaz: ['agua', 'hielo', 'infernal', 'acero'], sinEfecto: [] },
  infernal: { eficaz: ['planta', 'hielo', 'acero'], pocoEficaz: ['agua', 'tierra', 'infernal', 'ancestral'], sinEfecto: [] },
  plasma: { eficaz: ['agua', 'aire', 'acero'], pocoEficaz: ['tierra', 'electrico', 'plasma', 'ancestral'], sinEfecto: [] },
  mental: { eficaz: ['oscuridad', 'espectral'], pocoEficaz: ['acero', 'mental', 'ancestral'], sinEfecto: [] },
  luz: { eficaz: ['oscuridad', 'espectral'], pocoEficaz: ['acero', 'infernal', 'luz'], sinEfecto: [] },
  oscuridad: { eficaz: ['mental', 'luz'], pocoEficaz: ['oscuridad', 'infernal', 'acero'], sinEfecto: [] },
  espectral: { eficaz: ['mental', 'espectral'], pocoEficaz: ['oscuridad', 'acero'], sinEfecto: ['comun'] },
  acero: { eficaz: ['hielo', 'luz'], pocoEficaz: ['agua', 'electrico', 'infernal', 'acero'], sinEfecto: [] },
  ancestral: { eficaz: ['ancestral', 'plasma'], pocoEficaz: ['acero'], sinEfecto: [] },
};

export const TABLA_TIPOS: DefTablaTipos = {
  tipos: TIPOS.map((t) => ({ ...t })),
  relaciones: RELACIONES,
};
