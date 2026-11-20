// Música grabada (autor, 2026-11-20): pistas de Pixabay que eligió el autor, por situación. Si una
// carpeta está vacía, o una pista no se puede leer, suena la música hecha con código (sonido.ts).
// Las pistas van en src/assets/musica/<lista>/ y el build solo incluye las que haya.
// Aquí, lo puro: qué lista toca y qué pista de la lista. El reproductor está en sonido.ts.

export const LISTAS = ['combate', 'importante', 'lugares'] as const;
export type ListaMusica = (typeof LISTAS)[number];

/**
 * Ciudades y pueblos con música propia, también dentro de sus casas. Los gimnasios, siempre.
 * Lanzarote: La Geria (`pueblo`) y la capital. Fuerteventura: Corralejo, Puerto del Rosario
 * (`puerto`) y Betancuria.
 */
export const ZONAS_CON_MUSICA: ReadonlySet<string> = new Set(['pueblo', 'capital', 'corralejo', 'puerto', 'betancuria']);

/** Combates importantes: líderes de gimnasio, la liga y los jefes de la facción enemiga. */
export const esCombateImportante = (entrenador: string | null): boolean => !!entrenador && /^(lider|liga|jefe)-/.test(entrenador);

export interface Situacion {
  modo: string;
  /** El rival del combate en curso (null, una salvaje). */
  entrenador: string | null;
  /** Una evolución fuera de combate (almendrado): sigue lo que sonaba. */
  soloEvolucion?: boolean;
  zona?: string;
  dentro?: string | null;
}

/** Qué lista toca: 'igual' si no hay que cambiar lo que suena; null, la música hecha con código. */
export function listaPara(s: Situacion): ListaMusica | 'igual' | null {
  if (s.modo === 'combate') {
    if (s.soloEvolucion) return 'igual';
    return esCombateImportante(s.entrenador) ? 'importante' : 'combate';
  }
  if (s.dentro?.startsWith('gimnasio')) return 'lugares';
  return s.zona && ZONAS_CON_MUSICA.has(s.zona) ? 'lugares' : null;
}

/** Una pista de la lista según la semilla, siempre la misma para la misma semilla. */
export function elegirPista(pistas: readonly string[], semilla: number): string | undefined {
  if (!pistas.length) return undefined;
  const h = Math.imul(semilla ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
  return pistas[h % pistas.length];
}

/** Una semilla para un texto: cada ciudad, siempre su canción. */
export const semillaDe = (texto: string): number => [...texto].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);

/** Reparte las rutas del build (`…/musica/<lista>/<archivo>` → url) en sus listas, por orden. */
export function agrupar(rutas: Record<string, string>): Record<ListaMusica, string[]> {
  const listas: Record<ListaMusica, string[]> = { combate: [], importante: [], lugares: [] };
  for (const ruta of Object.keys(rutas).sort()) {
    const lista = /\/musica\/([^/]+)\/[^/]+$/.exec(ruta)?.[1] as ListaMusica | undefined;
    if (lista && lista in listas) listas[lista].push(rutas[ruta]!);
  }
  return listas;
}
