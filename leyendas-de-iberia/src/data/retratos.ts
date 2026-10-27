/**
 * Retrato de quien habla en los diálogos: el nombre que sale en el cuadro (el `quien` de cada
 * texto, o el nombre del entrenador) → el archivo de `src/assets/retratos/<id>.webp`.
 * Solo los personajes importantes: los históricos de la trama y los líderes de gimnasio
 * (decisión del autor, 2026-10-25). El resto habla sin retrato.
 */
export const RETRATOS: Record<string, string> = {
  Isabel: 'isabel',
  Fernando: 'fernando',
  'Gran Capitán': 'gran_capitan',
  Colón: 'colon',
  Boabdil: 'boabdil',
  'Juan de Padilla': 'padilla',
  'María Pacheco': 'maria_pacheco',
  'Felipe II': 'felipe_ii',
  'Menéndez de Avilés': 'menendez',
};
