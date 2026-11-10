// Los 16 tipos y su tabla. Parten de los 15 de Leyendas de Iberia (decisión del autor); el
// 2026-11-08 Plasma se fundió en Eléctrico y entraron Bicho y Veneno, y el 2026-11-10 el autor
// eligió la tabla revisada «C»: Roca sustituye a Luz (archipiélago volcánico), con las
// correcciones de Claude anotadas abajo para que ningún tipo acumule debilidades o
// resistencias. Las reglas de equilibrio están en tests/nucleo.test.ts.
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
 * es ×1. Con dos tipos, los multiplicadores se multiplican (×4 o ×0,25). Es la tabla «C» del
 * autor (2026-11-10). Las correcciones de Claude, anotadas, quitan contradicciones y evitan que
 * un tipo tenga 5 debilidades o 5 resistencias: como mucho 4, y en pocos tipos.
 */
const RELACIONES: Record<TipoId, Relacion> = {
  comun: { eficaz: [], pocoEficaz: ['roca', 'acero'], sinEfecto: ['espectral'] },
  agua: { eficaz: ['tierra', 'roca', 'infernal', 'ancestral'], pocoEficaz: ['agua', 'planta'], sinEfecto: [] },
  tierra: { eficaz: ['electrico', 'acero', 'veneno'], pocoEficaz: ['planta', 'bicho'], sinEfecto: ['aire'] },
  planta: { eficaz: ['agua', 'tierra', 'roca'], pocoEficaz: ['planta', 'aire', 'infernal', 'veneno'], sinEfecto: [] },
  // Corrección: el Acero ya no le resiste (Acero llegaba a 5 resistencias).
  aire: { eficaz: ['planta', 'bicho'], pocoEficaz: ['electrico', 'roca'], sinEfecto: [] },
  electrico: { eficaz: ['agua', 'aire'], pocoEficaz: ['electrico', 'planta', 'ancestral'], sinEfecto: ['tierra'] },
  // Corrección: ya no es muy eficaz contra Planta (Planta llegaba a 5 debilidades y Hielo
  // atacaba bien a 4 tipos con solo 2 que le resistían).
  hielo: { eficaz: ['aire', 'tierra', 'ancestral'], pocoEficaz: ['agua', 'hielo'], sinEfecto: [] },
  infernal: { eficaz: ['planta', 'hielo', 'acero', 'comun'], pocoEficaz: ['agua', 'roca', 'infernal', 'ancestral'], sinEfecto: [] },
  // Corrección: el Acero ya no le resiste.
  mental: { eficaz: ['infernal', 'veneno'], pocoEficaz: ['mental'], sinEfecto: [] },
  // Corrección: Mental salía a la vez como ×2 y ×0,5; se queda en ×2.
  oscuridad: { eficaz: ['mental', 'espectral'], pocoEficaz: ['oscuridad', 'bicho'], sinEfecto: [] },
  // Corrección: Oscuridad salía como ×2 y ×0,5; se queda en ×2. Para que su ataque tenga quien
  // le resista, el Acero le resiste. Sigue sin afectar a Común, como hasta ahora.
  espectral: { eficaz: ['mental', 'oscuridad', 'ancestral'], pocoEficaz: ['acero'], sinEfecto: ['comun'] },
  acero: { eficaz: ['hielo', 'roca', 'bicho'], pocoEficaz: ['infernal', 'electrico'], sinEfecto: [] },
  // Nuevo. Corrección: el Acero ya no le resiste.
  roca: { eficaz: ['aire', 'infernal', 'hielo'], pocoEficaz: ['tierra'], sinEfecto: [] },
  // Corrección: Planta y Roca ya no le resisten (las dos llegaban a 5 resistencias).
  ancestral: { eficaz: ['electrico', 'acero'], pocoEficaz: ['ancestral'], sinEfecto: [] },
  bicho: { eficaz: ['planta', 'mental', 'oscuridad'], pocoEficaz: ['infernal', 'aire', 'acero', 'veneno'], sinEfecto: [] },
  veneno: { eficaz: ['planta', 'bicho', 'ancestral'], pocoEficaz: ['tierra', 'roca', 'veneno', 'espectral'], sinEfecto: ['acero'] },
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
  mental: 0xed499a,
  oscuridad: 0x504c47,
  espectral: 0x7c39ed,
  acero: 0x91a0b5,
  roca: 0x94775c,
  ancestral: 0xbc5b18,
  bicho: 0x6aa706,
  veneno: 0xa31db0,
};
