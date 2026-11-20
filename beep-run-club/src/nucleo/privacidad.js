// Aceptación de la información de protección de datos. Si el texto cambia, se sube la versión y
// se vuelve a pedir.
export const VERSION_PRIVACIDAD = '2026-11-20';

/** true si este móvil no ha aceptado la versión actual. */
export function necesitaAceptar(guardada, version = VERSION_PRIVACIDAD) {
  return !guardada || guardada.version !== version || !guardada.fecha;
}
