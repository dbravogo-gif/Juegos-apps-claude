// Los 16 tipos y su tabla. Parten de los 15 de Leyendas de Iberia (decisión del autor) con un
// cambio pequeño, también suyo (2026-11-08): Plasma se funde en Eléctrico y entran Bicho y
// Veneno, para que los bosques y las cuevas tengan su fauna. Solo se tocó lo necesario; los
// cambios están anotados en RELACIONES y las reglas de equilibrio, en tests/nucleo.test.ts.
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
  { id: 'mental', nombre: 'Mental', color: 0xec4899 },
  { id: 'luz', nombre: 'Luz', color: 0xfde68a },
  { id: 'oscuridad', nombre: 'Oscuridad', color: 0x57534e },
  { id: 'espectral', nombre: 'Espectral', color: 0x7c3aed },
  { id: 'acero', nombre: 'Acero', color: 0x94a3b8 },
  { id: 'ancestral', nombre: 'Ancestral', color: 0xb45309 },
  { id: 'bicho', nombre: 'Bicho', color: 0x84cc16 },
  { id: 'veneno', nombre: 'Veneno', color: 0xa21caf },
] as const;

export type TipoId = (typeof TIPOS)[number]['id'];

type Relacion = { eficaz: TipoId[]; pocoEficaz: TipoId[]; sinEfecto: TipoId[] };

/**
 * Tabla de eficacias: tipo del movimiento atacante contra el tipo del defensor. Lo que no aparece
 * es ×1. Con dos tipos, los multiplicadores se multiplican. Parte de la tabla de Leyendas de
 * Iberia, equilibrada con el autor, y conserva sus reglas: los tipos sin inmunidad son muy
 * eficaces contra tantos tipos como los que les resisten, y nadie es débil a más de tres ni
 * resiste a más de tres. Unas pruebas lo vigilan.
 */
const RELACIONES: Record<TipoId, Relacion> = {
  comun: { eficaz: [], pocoEficaz: ['tierra', 'acero'], sinEfecto: ['espectral'] },
  agua: { eficaz: ['infernal', 'tierra'], pocoEficaz: ['agua', 'planta'], sinEfecto: [] },
  tierra: { eficaz: ['electrico', 'infernal', 'acero'], pocoEficaz: ['planta'], sinEfecto: ['aire'] },
  planta: { eficaz: ['agua', 'tierra', 'oscuridad'], pocoEficaz: ['planta', 'infernal', 'aire'], sinEfecto: [] },
  // Cambio: era eficaz contra Plasma; ahora contra Bicho (las aves comen insectos).
  aire: { eficaz: ['planta', 'comun', 'bicho'], pocoEficaz: ['electrico', 'tierra', 'ancestral'], sinEfecto: [] },
  electrico: { eficaz: ['agua', 'aire'], pocoEficaz: ['electrico'], sinEfecto: ['tierra'] },
  // Cambio: Plasma le resistía; ahora se resiste a sí mismo.
  hielo: { eficaz: ['planta', 'aire', 'ancestral'], pocoEficaz: ['agua', 'infernal', 'hielo'], sinEfecto: [] },
  // Cambio: quema a Bicho, y Ancestral (seres antiguos, como los dragones) le resiste.
  infernal: { eficaz: ['planta', 'hielo', 'acero', 'bicho'], pocoEficaz: ['agua', 'infernal', 'luz', 'ancestral'], sinEfecto: [] },
  // Cambio: eficaz contra Veneno; Bicho, sin mente que doblegar, le resiste.
  mental: { eficaz: ['oscuridad', 'espectral', 'veneno'], pocoEficaz: ['luz', 'ancestral', 'bicho'], sinEfecto: [] },
  // Cambio: lo que resistía Plasma lo resiste ahora Eléctrico, que la absorbe.
  luz: { eficaz: ['oscuridad', 'espectral', 'ancestral'], pocoEficaz: ['electrico', 'mental', 'acero'], sinEfecto: [] },
  oscuridad: { eficaz: ['mental', 'luz'], pocoEficaz: ['oscuridad', 'espectral'], sinEfecto: [] },
  espectral: { eficaz: ['mental', 'espectral'], pocoEficaz: ['oscuridad'], sinEfecto: ['comun'] },
  acero: { eficaz: ['hielo', 'luz'], pocoEficaz: ['oscuridad', 'espectral'], sinEfecto: [] },
  // Cambio: era eficaz contra Plasma; pasa a Eléctrico, que la absorbe.
  ancestral: { eficaz: ['ancestral', 'electrico'], pocoEficaz: ['acero', 'luz'], sinEfecto: [] },
  // Nuevo: los enjambres tapan la luz, socavan la tierra y no se dejan doblegar la mente.
  // Les resisten el Veneno, las aves y lo Espectral.
  bicho: { eficaz: ['mental', 'tierra', 'luz'], pocoEficaz: ['veneno', 'aire', 'espectral'], sinEfecto: [] },
  // Nuevo: acaba con los bichos y con los animales comunes; la Tierra y él mismo le resisten.
  // No es eficaz contra Agua, para no castigar a esa inicial en el primer bosque.
  veneno: { eficaz: ['bicho', 'comun'], pocoEficaz: ['tierra', 'veneno'], sinEfecto: [] },
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
 * medio van a L 0,54–0,66 y los claros (aire, eléctrico, hielo y luz) a 0,86–0,94.
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
  mental: 0xed499a,
  luz: 0xffeb9e,
  oscuridad: 0x504c47,
  espectral: 0x7c39ed,
  acero: 0x91a0b5,
  ancestral: 0xbc5b18,
  bicho: 0x6aa706,
  veneno: 0xa31db0,
};
