// Elige el almacén: Firebase si está configurado; si no, el modo demo.
import { FIREBASE } from '../config.js';
import { crearAlmacenDemo } from './demo.js';
import { hoy } from '../comun/entorno.js';

export async function crearAlmacen() {
  if (FIREBASE) {
    const { crearAlmacenFirebase } = await import('./firebase.js');
    return crearAlmacenFirebase(FIREBASE);
  }
  return crearAlmacenDemo({ almacenamiento: localStorage, hoy: hoy() });
}
