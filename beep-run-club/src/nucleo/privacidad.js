// Política de protección de datos: validar lo que edita el entrenador, publicarla y saber si un
// móvil tiene que aceptarla. La versión solo cambia cuando el entrenador pide que se acepte de nuevo.

export const VERSION_PRIVACIDAD = '2026-11-20'; // la del texto original incluido en la app
export const MAX_POLITICA = { resumen: 8, linea: 300, secciones: 20, titulo: 80, texto: 3000, nombre: 120 };

/** true si este móvil no ha aceptado esa versión. */
export function necesitaAceptar(guardada, version = VERSION_PRIVACIDAD) {
  return !guardada || guardada.version !== version || !guardada.fecha;
}

const limpio = (v) => (typeof v === 'string' ? v.trim() : '');
const esEmail = (t) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);

/**
 * Valida la política que guarda el entrenador: { responsable: { nombre, email }, resumen: [texto],
 * secciones: [{ titulo, texto }] }. Devuelve { ok, errores, politica } sin versión ni fecha.
 */
export function validarPolitica(p) {
  const errores = [];
  const responsable = { nombre: limpio(p?.responsable?.nombre), email: limpio(p?.responsable?.email).toLowerCase() };
  if (!responsable.nombre) errores.push('Escribe el nombre del responsable de los datos.');
  if (responsable.nombre.length > MAX_POLITICA.nombre) errores.push('El nombre del responsable es demasiado largo.');
  if (!esEmail(responsable.email)) errores.push('Escribe un email de contacto válido.');
  const resumen = (Array.isArray(p?.resumen) ? p.resumen : []).map(limpio).filter(Boolean);
  if (resumen.length === 0) errores.push('El resumen necesita al menos una línea.');
  if (resumen.length > MAX_POLITICA.resumen) errores.push(`El resumen admite como mucho ${MAX_POLITICA.resumen} líneas.`);
  if (resumen.some((l) => l.length > MAX_POLITICA.linea)) errores.push(`Cada línea del resumen admite ${MAX_POLITICA.linea} caracteres.`);
  const secciones = (Array.isArray(p?.secciones) ? p.secciones : [])
    .map((s) => ({ titulo: limpio(s?.titulo), texto: limpio(s?.texto) }))
    .filter((s) => s.titulo || s.texto);
  if (secciones.length === 0) errores.push('La política necesita al menos un apartado.');
  if (secciones.length > MAX_POLITICA.secciones) errores.push(`Como mucho ${MAX_POLITICA.secciones} apartados.`);
  secciones.forEach((s, i) => {
    if (!s.titulo || !s.texto) errores.push(`El apartado ${i + 1} necesita título y texto.`);
    if (s.titulo.length > MAX_POLITICA.titulo || s.texto.length > MAX_POLITICA.texto) errores.push(`El apartado ${i + 1} es demasiado largo.`);
  });
  return { ok: errores.length === 0, errores, politica: { responsable, resumen, secciones } };
}

/**
 * Publica una política ya validada. Con `pedirDeNuevo`, la versión pasa a ser la fecha de
 * publicación y todos los móviles tendrán que aceptarla; si no, se mantiene la versión anterior.
 */
export function publicarPolitica(anterior, politica, { pedirDeNuevo, fecha }) {
  return {
    ...politica,
    version: pedirDeNuevo || !anterior?.version ? fecha : anterior.version,
    publicada: fecha,
  };
}
