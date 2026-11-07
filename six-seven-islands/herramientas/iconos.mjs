#!/usr/bin/env node
// Genera los PNG de la web instalable a partir de public/icon.svg, con el Chromium de Playwright.
// Uso: node herramientas/iconos.mjs (desde six-seven-islands/).
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';

const { chromium } = createRequire(import.meta.url)('playwright');
const svg = await readFile('public/icon.svg', 'utf8');
const navegador = await chromium.launch();
const pagina = await navegador.newPage();
// El «maskable» deja un margen del 10 % por lado: los sistemas recortan el icono en círculo.
const salidas = [
  ['public/icon-192.png', 192, 0],
  ['public/icon-512.png', 512, 0],
  ['public/icon-maskable-512.png', 512, 0.1],
  ['public/apple-touch-icon.png', 180, 0],
];
for (const [ruta, lado, margen] of salidas) {
  await pagina.setViewportSize({ width: lado, height: lado });
  const interior = Math.round(lado * (1 - 2 * margen));
  await pagina.setContent(
    `<body style="margin:0;background:#FFD8B0;display:grid;place-items:center;width:${lado}px;height:${lado}px">` +
      `<div style="width:${interior}px;height:${interior}px">${svg.replace('<svg ', `<svg width="${interior}" height="${interior}" `)}</div></body>`,
  );
  await pagina.screenshot({ path: ruta });
  console.log(ruta);
}
await navegador.close();
