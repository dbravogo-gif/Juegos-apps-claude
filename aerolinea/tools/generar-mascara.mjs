import { geoContains } from 'd3-geo';
import { feature } from 'topojson-client';
import { readFileSync, writeFileSync } from 'node:fs';
const land = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const tierra = feature(land, land.objects.land);
// Rejilla de 1 grado: celda (i, j) con centro en lon = -179.5 + i, lat = -89.5 + j.
const W = 360, H = 180;
const bits = new Uint8Array(Math.ceil(W * H / 8));
let n = 0;
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
  const lon = -179.5 + i, lat = -89.5 + j;
  if (geoContains(tierra, [lon, lat])) { const k = j * W + i; bits[k >> 3] |= 1 << (k & 7); n++; }
}
const b64 = Buffer.from(bits).toString('base64');
writeFileSync(process.argv[3], `// Máscara tierra/mar en una rejilla de 1° (360 × 180), generada a partir de Natural Earth
// 1:50m (world-atlas). 1 = tierra. Sirve para saber qué parte de una ruta va sobre el mar.
// Regenerar con tools/generar-mascara.mjs.
export const ANCHO = 360;
export const ALTO = 180;
export const TIERRA = '${b64}';
`);
console.log('celdas de tierra', n, 'de', W*H, 'bytes', b64.length);
