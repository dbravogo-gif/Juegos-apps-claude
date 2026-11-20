// Elige el almacén: Firebase si está configurado; si no, el modo demo.
import { FIREBASE } from '../config.js';
import { crearAlmacenDemo } from './demo.js';
import { hoy } from '../comun/entorno.js';

/**
 * En local (las pruebas y las capturas, en 127.0.0.1) se usa el modo demo, salvo con ?emulador,
 * que usa los emuladores de Firebase. Publicada, Firebase si está configurado.
 */
function quiereDemo() {
  const local = ['127.0.0.1', 'localhost'].includes(location.hostname);
  return !FIREBASE || (local && !new URLSearchParams(location.search).has('emulador'));
}

export async function crearAlmacen({ rol = 'atleta' } = {}) {
  if (!quiereDemo()) {
    const { crearAlmacenFirebase } = await import('./firebase.js');
    return crearAlmacenFirebase(FIREBASE, { rol });
  }
  return crearAlmacenDemo({ almacenamiento: localStorage, hoy: hoy() });
}
