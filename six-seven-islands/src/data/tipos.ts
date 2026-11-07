// Los 15 tipos y su tabla, decididos por el autor: los mismos que en Leyendas de Iberia.
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
 * es ×1. Con dos tipos, los multiplicadores se multiplican. Es la tabla de Leyendas de Iberia, ya
 * equilibrada con el autor: los tipos sin inmunidad son muy eficaces contra tantos tipos como
 * los que les resisten, y nadie es débil a más de tres ni resiste a más de tres. Una prueba la
 * compara con la de Leyendas.
 */
const RELACIONES: Record<TipoId, Relacion> = {
  comun: { eficaz: [], pocoEficaz: ['tierra', 'acero'], sinEfecto: ['espectral'] },
  agua: { eficaz: ['infernal', 'tierra'], pocoEficaz: ['agua', 'planta'], sinEfecto: [] },
  tierra: { eficaz: ['electrico', 'infernal', 'acero'], pocoEficaz: ['planta'], sinEfecto: ['aire'] },
  planta: { eficaz: ['agua', 'tierra', 'oscuridad'], pocoEficaz: ['planta', 'infernal', 'aire'], sinEfecto: [] },
  aire: { eficaz: ['planta', 'comun', 'plasma'], pocoEficaz: ['electrico', 'tierra', 'ancestral'], sinEfecto: [] },
  electrico: { eficaz: ['agua', 'aire'], pocoEficaz: ['electrico'], sinEfecto: ['tierra'] },
  hielo: { eficaz: ['planta', 'aire', 'ancestral'], pocoEficaz: ['agua', 'infernal', 'plasma'], sinEfecto: [] },
  infernal: { eficaz: ['planta', 'hielo', 'acero'], pocoEficaz: ['agua', 'infernal', 'luz'], sinEfecto: [] },
  plasma: { eficaz: ['agua', 'aire', 'acero'], pocoEficaz: ['tierra', 'electrico', 'plasma'], sinEfecto: [] },
  mental: { eficaz: ['oscuridad', 'espectral'], pocoEficaz: ['luz', 'ancestral'], sinEfecto: [] },
  luz: { eficaz: ['oscuridad', 'espectral', 'ancestral'], pocoEficaz: ['plasma', 'mental', 'acero'], sinEfecto: [] },
  oscuridad: { eficaz: ['mental', 'luz'], pocoEficaz: ['oscuridad', 'espectral'], sinEfecto: [] },
  espectral: { eficaz: ['mental', 'espectral'], pocoEficaz: ['oscuridad'], sinEfecto: ['comun'] },
  acero: { eficaz: ['hielo', 'luz'], pocoEficaz: ['oscuridad', 'espectral'], sinEfecto: [] },
  ancestral: { eficaz: ['ancestral', 'plasma'], pocoEficaz: ['acero', 'luz'], sinEfecto: [] },
};

export const TABLA_TIPOS: DefTablaTipos = {
  tipos: TIPOS.map((t) => ({ ...t })),
  relaciones: RELACIONES,
};
