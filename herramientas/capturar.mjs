#!/usr/bin/env node
// Abre una app del repositorio en un móvil simulado (390 × 844, táctil), hace capturas y
// recoge los errores de consola, de página y de red. Sirve a Claude (y a ti) para comprobar
// un cambio con pruebas de verdad: si hay errores, termina con código 1.
//
// Uso:
//   node herramientas/capturar.mjs <carpeta|url> [--salida dir] [--pasos "..."]
//        [--dispositivo iphone16 | iphone16-app | escritorio] [--ancho 390 --alto 844]
//
// Dispositivos (el autor juega en un iPhone 16):
//   iphone16       393 × 659: lo que se ve en Safari con sus barras
//   iphone16-app   393 × 852: instalado en la pantalla de inicio (hay que respetar las zonas seguras)
//   escritorio     1280 × 800
// Sin --dispositivo: 390 × 844. --ancho y --alto mandan sobre el dispositivo.
// Aquí solo hay Chromium: lo propio de Safari (WebKit) se comprueba en el iPhone del autor.
//
// Ejemplos:
//   node herramientas/capturar.mjs gymlog-fase1
//   node herramientas/capturar.mjs aerolinea --pasos "espera:1500,captura:inicio,toque:195x700,espera:500,captura:tras-toque"
//   (cd leyendas-de-iberia && npm run build) && node herramientas/capturar.mjs leyendas-de-iberia/dist \
//     --pasos "espera:3000,captura:titulo,tecla:Enter,espera:1500,captura:partida"
//
// Pasos, separados por comas:
//   espera:<ms>          espera
//   captura:<nombre>     guarda <salida>/<nombre>.png
//   tecla:<Tecla>        pulsa una tecla (Enter, Escape, ArrowUp, m…)
//   toque:<x>x<y>        toca en esas coordenadas CSS
//   clic:<selector>      hace clic en el primer elemento que coincide con el selector CSS
//   texto:<texto>        escribe ese texto
// Sin --pasos: espera 1500 ms y hace una captura llamada «inicio».
//
// Playwright no es una dependencia del repositorio: en las sesiones de Claude en la nube ya
// viene instalado. En otro equipo: `npm i -g playwright && npx playwright install chromium`.

import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { join, extname, resolve, normalize, sep } from 'node:path';
import { tmpdir } from 'node:os';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('No encuentro Playwright. Instálalo con: npm i -g playwright && npx playwright install chromium');
  process.exit(2);
}

const args = process.argv.slice(2);
const objetivo = args.find((a, i) => !a.startsWith('--') && !(args[i - 1] || '').startsWith('--'));
const opcion = (nombre, porDefecto) => {
  const i = args.indexOf(`--${nombre}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : porDefecto;
};

if (!objetivo) {
  console.error('Falta la carpeta o la URL. Ejemplo: node herramientas/capturar.mjs gymlog-fase1');
  process.exit(2);
}

const salida = resolve(opcion('salida', join(tmpdir(), 'capturas', objetivo.replace(/[^\w.-]+/g, '_'))));
const DISPOSITIVOS = {
  iphone16: { ancho: 393, alto: 659, tactil: true },
  'iphone16-app': { ancho: 393, alto: 852, tactil: true },
  escritorio: { ancho: 1280, alto: 800, tactil: false },
};
const nombreDispositivo = opcion('dispositivo', null);
if (nombreDispositivo && !DISPOSITIVOS[nombreDispositivo]) {
  console.error(`Dispositivo desconocido «${nombreDispositivo}». Usa: ${Object.keys(DISPOSITIVOS).join(', ')}.`);
  process.exit(2);
}
const dispositivo = DISPOSITIVOS[nombreDispositivo] || { ancho: 390, alto: 844, tactil: true };
const ancho = Number(opcion('ancho', dispositivo.ancho));
const alto = Number(opcion('alto', dispositivo.alto));
const pasos = opcion('pasos', 'espera:1500,captura:inicio')
  .split(',')
  .map((p) => p.trim())
  .filter(Boolean);

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
};

// Servidor estático mínimo para una carpeta del repositorio.
async function servir(carpeta) {
  const raiz = resolve(carpeta);
  const servidor = createServer(async (pet, res) => {
    try {
      const ruta = decodeURIComponent(new URL(pet.url, 'http://x').pathname);
      let archivo = normalize(join(raiz, ruta));
      if (archivo !== raiz && !archivo.startsWith(raiz + sep)) {
        res.writeHead(403).end();
        return;
      }
      if ((await stat(archivo)).isDirectory()) archivo = join(archivo, 'index.html');
      const datos = await readFile(archivo);
      res.writeHead(200, { 'Content-Type': TIPOS[extname(archivo).toLowerCase()] || 'application/octet-stream' });
      res.end(datos);
    } catch {
      res.writeHead(404).end('No encontrado');
    }
  });
  await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
  return { servidor, url: `http://127.0.0.1:${servidor.address().port}/` };
}

const esUrl = /^https?:\/\//.test(objetivo);
let servidor = null;
let url = objetivo;
if (!esUrl) {
  try {
    if (!(await stat(objetivo)).isDirectory()) throw new Error();
  } catch {
    console.error(`No existe la carpeta «${objetivo}».`);
    process.exit(2);
  }
  ({ servidor, url } = await servir(objetivo));
}

await mkdir(salida, { recursive: true });
const navegador = await chromium.launch();
const contexto = await navegador.newContext({
  viewport: { width: ancho, height: alto },
  deviceScaleFactor: 1,
  hasTouch: dispositivo.tactil,
  isMobile: dispositivo.tactil,
  serviceWorkers: 'block', // un service worker con caché vieja falsea la comprobación
});
const pagina = await contexto.newPage();

const errores = [];
const avisos = [];
pagina.on('console', (m) => {
  if (m.type() === 'error') errores.push(`consola: ${m.text()}`);
  else if (m.type() === 'warning') avisos.push(`aviso: ${m.text()}`);
});
pagina.on('pageerror', (e) => errores.push(`excepción: ${e.message}`));
pagina.on('requestfailed', (p) => errores.push(`red: ${p.url()} (${p.failure()?.errorText})`));
pagina.on('response', (r) => {
  if (r.status() >= 400) errores.push(`red: ${r.url()} respondió ${r.status()}`);
});

const capturas = [];
try {
  await pagina.goto(url, { waitUntil: 'load', timeout: 30000 });
  for (const paso of pasos) {
    const i = paso.indexOf(':');
    const tipo = i < 0 ? paso : paso.slice(0, i);
    const valor = i < 0 ? '' : paso.slice(i + 1);
    if (tipo === 'espera') await pagina.waitForTimeout(Number(valor) || 500);
    else if (tipo === 'captura') {
      const archivo = join(salida, `${valor || `captura-${capturas.length + 1}`}.png`);
      await pagina.screenshot({ path: archivo });
      capturas.push(archivo);
    } else if (tipo === 'tecla') await pagina.keyboard.press(valor);
    else if (tipo === 'toque') {
      const [x, y] = valor.split('x').map(Number);
      await pagina.touchscreen.tap(x, y);
    } else if (tipo === 'clic') await pagina.click(valor, { timeout: 5000 });
    else if (tipo === 'texto') await pagina.keyboard.type(valor);
    else errores.push(`paso desconocido: «${paso}»`);
  }
} catch (e) {
  errores.push(`fallo al ejecutar los pasos: ${e.message.split('\n')[0]}`);
}

await navegador.close();
servidor?.close();

console.log(`URL: ${url}`);
console.log(`Pantalla: ${ancho} × ${alto}${dispositivo.tactil ? ', táctil' : ''}${nombreDispositivo ? ` (${nombreDispositivo})` : ''}`);
console.log(`Capturas (${capturas.length}):`);
for (const c of capturas) console.log(`  ${c}`);
if (avisos.length) {
  console.log(`Avisos (${avisos.length}):`);
  for (const a of avisos.slice(0, 20)) console.log(`  ${a}`);
}
if (errores.length) {
  console.log(`ERRORES (${errores.length}):`);
  for (const e of errores.slice(0, 50)) console.log(`  ${e}`);
  process.exit(1);
}
console.log('Sin errores.');
