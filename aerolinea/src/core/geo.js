import { ANCHO, ALTO, TIERRA } from '../data/mascara-tierra.js';

const R = 6371;
const rad = (g) => (g * Math.PI) / 180;
const grados = (r) => (r * 180) / Math.PI;

// Distancia de círculo máximo en km.
export function distanciaKm(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Minutos de calzo a calzo para un vuelo subsónico: crucero más media hora de rodaje, ascenso y
// aproximación.
export function duracionMin(distancia, crucero) {
  return Math.round((distancia / crucero) * 60 + 30);
}

// Punto del círculo máximo entre a y b, en la fracción f del recorrido.
export function interpolar(a, b, f) {
  const φ1 = rad(a.lat);
  const λ1 = rad(a.lon);
  const φ2 = rad(b.lat);
  const λ2 = rad(b.lon);
  const d = distanciaKm(a, b) / R;
  if (d === 0) return { lat: a.lat, lon: a.lon };
  const A = Math.sin((1 - f) * d) / Math.sin(d);
  const B = Math.sin(f * d) / Math.sin(d);
  const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
  const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
  const z = A * Math.sin(φ1) + B * Math.sin(φ2);
  return { lat: grados(Math.atan2(z, Math.hypot(x, y))), lon: grados(Math.atan2(y, x)) };
}

export function puntosRuta(a, b, pasoKm = 50) {
  const n = Math.max(2, Math.ceil(distanciaKm(a, b) / pasoKm));
  return Array.from({ length: n + 1 }, (_, i) => interpolar(a, b, i / n));
}

// --- Tierra y mar (rejilla de 1°)

let bits = null;
function mascara() {
  if (!bits) {
    const crudo = atob(TIERRA);
    bits = new Uint8Array(crudo.length);
    for (let i = 0; i < crudo.length; i++) bits[i] = crudo.charCodeAt(i);
  }
  return bits;
}

export function esTierra(lat, lon) {
  const i = ((Math.floor(lon + 180) % ANCHO) + ANCHO) % ANCHO;
  const j = Math.max(0, Math.min(ALTO - 1, Math.floor(lat + 90)));
  const k = j * ANCHO + i;
  return (mascara()[k >> 3] >> (k & 7)) & 1;
}

// Parte del recorrido que va sobre el mar (0–1).
export function fraccionSobreMar(a, b) {
  const puntos = puntosRuta(a, b, 40).slice(1, -1);
  if (!puntos.length) return 0;
  return puntos.filter((p) => !esTierra(p.lat, p.lon)).length / puntos.length;
}

// Aeropuerto costero: alguna celda vecina es mar. Sirve para la corrosión por salitre.
export function esCostero(aeropuerto) {
  for (const [dy, dx] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
    if (!esTierra(aeropuerto.lat + dy, aeropuerto.lon + dx)) return true;
  }
  return false;
}

// La mayor distancia a la que queda un aeropuerto utilizable en algún punto de la ruta.
export function distanciaMaxAlternativo(a, b, alternativos) {
  let peor = 0;
  for (const p of puntosRuta(a, b, 100)) {
    let mejor = Infinity;
    for (const x of alternativos) {
      const d = distanciaKm(p, x);
      if (d < mejor) mejor = d;
    }
    if (mejor > peor) peor = mejor;
  }
  return peor;
}
