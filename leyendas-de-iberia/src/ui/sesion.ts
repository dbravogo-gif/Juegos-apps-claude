import type { Partida } from '../core/partida';
import { deserializar, serializar } from '../core/guardado';

// La partida en curso y su guardado en el navegador. El almacenamiento puede fallar (modo
// privado, datos borrados): el juego sigue funcionando, solo que sin guardar.

const CLAVE = 'leyendas-de-iberia:partida';

export const sesion: { partida: Partida | null } = { partida: null };

export function guardarPartida(p: Partida): boolean {
  try {
    localStorage.setItem(CLAVE, serializar(p));
    return true;
  } catch {
    return false;
  }
}

export function cargarPartida(): Partida | null {
  try {
    const texto = localStorage.getItem(CLAVE);
    return texto ? deserializar(texto) : null;
  } catch {
    return null;
  }
}

export function hayPartidaGuardada(): boolean {
  return cargarPartida() !== null;
}
