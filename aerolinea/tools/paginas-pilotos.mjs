// Crea la página de cada comandante (piloto/<id>/) a partir de index.html: el mismo juego, con
// su icono y su nombre para la pantalla de inicio y <meta name="piloto"> para que salga en la
// partida. Se ejecuta al publicar, sobre la copia del sitio:
//   node tools/paginas-pilotos.mjs <carpeta-del-sitio>
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PILOTOS } from '../src/data/pilotos.js';

const sitio = process.argv[2] ?? '.';
const index = readFileSync(join(sitio, 'index.html'), 'utf8');

for (const [id, p] of Object.entries(PILOTOS)) {
  const corto = `Cmte. ${p.nombre}`;
  const html = index
    // Todo lo relativo (scripts, imágenes, mapas) se resuelve desde la raíz del juego.
    .replace('<head>', `<head>\n<base href="../../">\n<meta name="piloto" content="${id}">\n<meta name="apple-mobile-web-app-title" content="${corto}">`)
    .replace(/<link rel="manifest"[^>]*>/, `<link rel="manifest" href="piloto/${id}/manifest.webmanifest">`)
    .replace(/<link rel="icon"[^>]*>/, `<link rel="icon" href="img/pilotos/${id}-192.png" type="image/png">\n<link rel="apple-touch-icon" href="img/pilotos/${id}-180.png">`);
  if (!html.includes(`content="${id}"`) || !html.includes(`piloto/${id}/manifest`)) throw new Error(`No se pudo preparar la página de ${id}`);
  const manifiesto = {
    id: './',
    name: `App viación · ${corto}`,
    short_name: corto,
    description: `Simulador de aerolínea desde 1976, con el comandante ${p.nombre}.`,
    lang: 'es',
    start_url: './',
    scope: './',
    display: 'standalone',
    background_color: '#0f1a24',
    theme_color: '#0f1a24',
    icons: [
      { src: `../../img/pilotos/${id}-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `../../img/pilotos/${id}-512.png`, sizes: '512x512', type: 'image/png' },
    ],
  };
  const carpeta = join(sitio, 'piloto', id);
  mkdirSync(carpeta, { recursive: true });
  writeFileSync(join(carpeta, 'index.html'), html);
  writeFileSync(join(carpeta, 'manifest.webmanifest'), `${JSON.stringify(manifiesto, null, 2)}\n`);
  console.log(`piloto/${id}/`);
}
