const R = 6371;
const rad = (g) => (g * Math.PI) / 180;

// Distancia de círculo máximo en km.
export function distanciaKm(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Minutos de calzo a calzo: el vuelo de crucero más media hora de rodaje, ascenso y aproximación.
export function duracionMin(distancia, crucero) {
  return Math.round((distancia / crucero) * 60 + 30);
}
