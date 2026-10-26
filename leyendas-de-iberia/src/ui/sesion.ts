import { ajustarADatos, type Partida } from '../core/partida';
import { deserializar, serializar } from '../core/guardado';
import { DATOS } from '../data';
import { ESPECIES_RETIRADAS } from '../data/especies';

// La partida en curso y su guardado en el navegador. El almacenamiento puede fallar (modo
// privado, datos borrados): el juego sigue funcionando, solo que sin guardar.

const CLAVE = 'leyendas-de-iberia:partida';
/** La partida del modo desarrollador va aparte, para no tocar la de verdad. */
const CLAVE_DEV = 'leyendas-de-iberia:partida-dev';

export const sesion: { partida: Partida | null } = { partida: null };

export function guardarPartida(p: Partida): boolean {
  try {
    localStorage.setItem(p.dev ? CLAVE_DEV : CLAVE, serializar(p));
    return true;
  } catch {
    return false;
  }
}

export function cargarPartida(dev = false): Partida | null {
  try {
    const texto = localStorage.getItem(dev ? CLAVE_DEV : CLAVE);
    const p = texto ? deserializar(texto) : null;
    if (p) ajustarADatos(p, DATOS, ESPECIES_RETIRADAS);
    return p;
  } catch {
    return null;
  }
}

export function hayPartidaGuardada(): boolean {
  return cargarPartida() !== null;
}
