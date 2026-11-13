// Los 17 tipos y su tabla. Parten de los 15 de Leyendas de Iberia (decisión del autor); el
// 2026-11-08 Plasma se fundió en Eléctrico y entraron Bicho y Veneno; el 2026-11-10 Roca sustituyó
// a Luz, y el 2026-11-12 el autor rehízo la tabla, porque estaba descompensada, y añadió Lucha. Es
// su tabla (fotos en conceptos/tipos/) con el ajuste del 2026-11-13: Acero ya no resiste Planta,
// Aire ni Mental; Bicho ya no es eficaz contra Planta, e Infernal ya no resiste a Acero. Las
// pruebas de tests/nucleo.test.ts la vigilan.
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
  { id: 'lucha', nombre: 'Lucha', color: 0x9f1239 },
  { id: 'mental', nombre: 'Mental', color: 0xec4899 },
  { id: 'oscuridad', nombre: 'Oscuridad', color: 0x57534e },
  { id: 'espectral', nombre: 'Espectral', color: 0x7c3aed },
  { id: 'acero', nombre: 'Acero', color: 0x94a3b8 },
  { id: 'roca', nombre: 'Roca', color: 0x9a7e64 },
  { id: 'ancestral', nombre: 'Ancestral', color: 0xb45309 },
  { id: 'bicho', nombre: 'Bicho', color: 0x84cc16 },
  { id: 'veneno', nombre: 'Veneno', color: 0xa21caf },
] as const;

export type TipoId = (typeof TIPOS)[number]['id'];

type Relacion = { eficaz: TipoId[]; pocoEficaz: TipoId[]; sinEfecto: TipoId[] };

/**
 * Tabla de eficacias: tipo del movimiento atacante contra el tipo del defensor. Lo que no aparece
 * es ×1. Con dos tipos, los multiplicadores se multiplican (×4 o ×0,25). Es la tabla del autor del
 * 2026-11-12. Ancestral, al defender, sigue la foto de sus interacciones especiales (lo pidió el
 * autor): Agua, Hielo y Veneno le hacen ×2, y Eléctrico, Infernal y Ancestral, ×½.
 */
const RELACIONES: Record<TipoId, Relacion> = {
  comun: { eficaz: [], pocoEficaz: ['roca', 'acero'], sinEfecto: ['espectral'] },
  agua: { eficaz: ['infernal', 'tierra', 'roca', 'ancestral'], pocoEficaz: ['agua', 'planta'], sinEfecto: [] },
  tierra: { eficaz: ['infernal', 'electrico', 'veneno', 'acero'], pocoEficaz: ['planta', 'bicho'], sinEfecto: ['aire'] },
  planta: { eficaz: ['agua', 'tierra', 'roca'], pocoEficaz: ['infernal', 'planta', 'veneno', 'aire', 'bicho'], sinEfecto: [] },
  aire: { eficaz: ['planta', 'lucha', 'bicho'], pocoEficaz: ['electrico', 'roca'], sinEfecto: [] },
  electrico: { eficaz: ['agua', 'aire'], pocoEficaz: ['electrico', 'planta', 'ancestral'], sinEfecto: ['tierra'] },
  hielo: { eficaz: ['planta', 'tierra', 'aire', 'ancestral'], pocoEficaz: ['infernal', 'agua', 'hielo', 'acero'], sinEfecto: [] },
  infernal: { eficaz: ['planta', 'hielo', 'bicho', 'acero'], pocoEficaz: ['infernal', 'agua', 'roca', 'ancestral'], sinEfecto: [] },
  lucha: { eficaz: ['comun', 'hielo', 'roca', 'oscuridad', 'acero'], pocoEficaz: ['veneno', 'aire', 'mental', 'bicho'], sinEfecto: ['espectral'] },
  mental: { eficaz: ['lucha', 'veneno'], pocoEficaz: ['mental'], sinEfecto: ['oscuridad'] },
  oscuridad: { eficaz: ['mental', 'espectral'], pocoEficaz: ['lucha', 'oscuridad'], sinEfecto: [] },
  espectral: { eficaz: ['mental', 'espectral'], pocoEficaz: ['oscuridad'], sinEfecto: ['comun'] },
  acero: { eficaz: ['hielo', 'roca'], pocoEficaz: ['agua', 'electrico', 'acero'], sinEfecto: [] },
  roca: { eficaz: ['infernal', 'hielo', 'aire', 'bicho'], pocoEficaz: ['tierra', 'acero', 'lucha'], sinEfecto: [] },
  ancestral: { eficaz: ['acero'], pocoEficaz: ['ancestral'], sinEfecto: [] },
  bicho: { eficaz: ['mental', 'oscuridad'], pocoEficaz: ['infernal', 'lucha', 'veneno', 'aire', 'espectral', 'acero'], sinEfecto: [] },
  veneno: { eficaz: ['planta', 'ancestral'], pocoEficaz: ['veneno', 'tierra', 'roca', 'espectral'], sinEfecto: ['acero'] },
};

export const TABLA_TIPOS: DefTablaTipos = {
  tipos: TIPOS.map((t) => ({ ...t })),
  relaciones: RELACIONES,
};

/**
 * Color principal de las criaturas de cada tipo (ARTE.md): el de la tabla de arriba con la
 * luminosidad ajustada en la prueba de arte (F04). Se ajusta en OKLCH: se fija la luminosidad,
 * se conserva el tono y se recorta el croma solo si se sale de sRGB. Criterio: contraste de
 * valor con la hierba menta (L ≈ 0,81), para que se lean también en gris. Los tipos de tono
 * medio van a L 0,54–0,66 y los claros (aire, eléctrico y hielo) a 0,86–0,94.
 */
export const COLOR_CRIATURA: Record<TipoId, number> = {
  comun: 0xa9a39f,
  agua: 0x3a81f5,
  tierra: 0xa96a17,
  planta: 0x1fa74e,
  aire: 0x96dcff,
  electrico: 0xffc83e,
  hielo: 0x8bf1ff,
  infernal: 0xe4312e,
  lucha: 0xbf2f4c,
  mental: 0xed499a,
  oscuridad: 0x504c47,
  espectral: 0x7c39ed,
  acero: 0x91a0b5,
  roca: 0x94775c,
  ancestral: 0xbc5b18,
  bicho: 0x6aa706,
  veneno: 0xa31db0,
};
