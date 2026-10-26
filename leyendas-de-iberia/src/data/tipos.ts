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
 * Tercera versión, equilibrada a petición del autor (2026-10-25) siguiendo cómo lo hace Pokémon:
 * - Cada tipo sin inmunidad es muy eficaz contra tantos tipos como los que le resisten (dos y
 *   dos, o tres y tres). Los que anulan a alguno (Común, Tierra, Eléctrico y Espectral) tienen
 *   menos.
 * - Nadie es débil a más de tres tipos ni resiste a más de tres.
 * - Cambios pedidos por el autor: Planta es poco eficaz contra Aire y ya no contra Acero; Aire ya
 *   no es eficaz contra Tierra y gana dos tipos (Común, como las rapaces que cazan la fauna
 *   corriente, y Plasma, porque el viento dispersa el gas).
 * - Infernal ya no es poco eficaz contra Tierra: el fuego sufría demasiado con tanta Tierra.
 * - Mental, Luz, Oscuridad y Espectral se relacionan también con los demás: la ruda y el romero
 *   (Planta) contra el mal de ojo (Oscuridad), lo sagrado (Luz) contra los dragones y gigantes
 *   (Ancestral), como San Jorge, y el acero que atraviesa a las ánimas sin herirlas.
 * - Siguen las cuatro inmunidades y los que se resisten a sí mismos (Agua, Planta, Infernal,
 *   Eléctrico, Plasma y Oscuridad).
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
