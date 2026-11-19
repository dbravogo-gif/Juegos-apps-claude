// Lo que depende del navegador y del reloj, fuera del núcleo: la fecha de hoy, el azar seguro
// y el identificador de este móvil.
import { formatear, esFecha } from '../nucleo/fechas.js';
import { generarId } from '../nucleo/codigos.js';

let hoyFijado = null;
const consulta = new URLSearchParams(location.search);
if (esFecha(consulta.get('hoy'))) hoyFijado = consulta.get('hoy'); // para capturas y pruebas

export function hoy() {
  if (hoyFijado) return hoyFijado;
  const d = new Date();
  return formatear(d.getFullYear(), d.getMonth() + 1, d.getDate());
}
export function fijarHoy(fecha) { hoyFijado = esFecha(fecha) ? fecha : null; }

/** rng() en [0, 1) con crypto.getRandomValues. */
export function rngSeguro() {
  const u = new Uint32Array(1);
  crypto.getRandomValues(u);
  return u[0] / 4294967296;
}

export function leerLocal(clave, porDefecto = null) {
  try { const t = localStorage.getItem(clave); return t == null ? porDefecto : JSON.parse(t); } catch { return porDefecto; }
}
export function guardarLocal(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); return true; } catch { return false; }
}
export function borrarLocal(clave) {
  try { localStorage.removeItem(clave); } catch { /* nada */ }
}

/** Id de este móvil (solo para el almacén demo; en la nube, el uid anónimo de Firebase). */
export function idDispositivo() {
  let id = leerLocal('beep_dispositivo');
  if (!id) { id = generarId(rngSeguro); guardarLocal('beep_dispositivo', id); }
  return id;
}
