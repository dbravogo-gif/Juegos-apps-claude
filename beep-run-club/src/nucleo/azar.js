// Generador con semilla (mulberry32) para pruebas y datos de ejemplo. En la app real, el azar de
// los códigos viene de crypto.getRandomValues (ver src/comun/azar-seguro.js).
export function conSemilla(semilla) {
  let a = semilla >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
