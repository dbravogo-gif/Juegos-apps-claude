// El modo desarrollador (autor, 2026-11-19): se entra con un código y juega en una partida aparte,
// que no pisa la normal. Puro: sin DOM ni almacenamiento.
//
// El código no va escrito: solo su huella (FNV-1a de 32 bits). No es seguridad de verdad (son
// 8 cifras), pero no se lee mirando el código de la web.

const HUELLA_CODIGO = 0x18aefd4f;

/** FNV-1a de 32 bits de un texto. */
export function huella(texto: string): number {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(texto)) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Si el código abre el modo desarrollador. Los espacios de alrededor no cuentan. */
export function esCodigoDesarrollador(codigo: string): boolean {
  return huella(codigo.trim()) === HUELLA_CODIGO;
}

/** Dónde se guarda cada partida: la del modo desarrollador, aparte. */
export function claveGuardado(desarrollador: boolean): string {
  return desarrollador ? 'six-seven-islands:partida-desarrollador' : 'six-seven-islands:partida';
}
