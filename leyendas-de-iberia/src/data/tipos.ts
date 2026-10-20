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

/**
 * PROVISIONAL. Son las ideas del GDD (§8), pendientes de decidir. Cada par es
 * [atacante, defensor] eficaz (×2); el reverso queda en ×0,5 automáticamente.
 */
const EFICACES: [TipoId, TipoId][] = [
  ['agua', 'infernal'],
  ['agua', 'tierra'],
  ['tierra', 'infernal'],
  ['tierra', 'electrico'],
  ['infernal', 'planta'],
  ['infernal', 'hielo'],
  ['infernal', 'acero'],
  ['planta', 'agua'],
  ['planta', 'tierra'],
  ['aire', 'planta'],
  ['electrico', 'agua'],
  ['electrico', 'aire'],
  ['electrico', 'acero'],
  ['hielo', 'planta'],
  ['hielo', 'aire'],
  ['acero', 'hielo'],
  ['acero', 'ancestral'],
  ['luz', 'oscuridad'],
  ['luz', 'infernal'],
  ['luz', 'espectral'],
  ['oscuridad', 'mental'],
  ['mental', 'ancestral'],
  ['espectral', 'espectral'],
  ['espectral', 'mental'],
  ['ancestral', 'ancestral'],
];

const INMUNIDADES: [TipoId, TipoId][] = [
  // Lo que vuela no toca el suelo.
  ['tierra', 'aire'],
  // Lo común y lo espectral no se tocan.
  ['comun', 'espectral'],
  ['espectral', 'comun'],
];

export const TABLA_TIPOS: DefTablaTipos = {
  tipos: TIPOS.map((t) => ({ ...t })),
  eficaces: EFICACES,
  inmunidades: INMUNIDADES,
};
