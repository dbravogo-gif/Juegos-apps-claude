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
//   estado               escribe lo que devuelve window.__JUEGO__.estado(), si el juego lo tiene
// Sin --pasos: espera 1500 ms y hace una captura llamada «inicio».
//
// De cada captura se dan métricas de imagen, para la rúbrica visual (skill juego-3d):
//   entropía de color   bits del histograma RGB a 4 bits por canal (0 a 12). Baja = plana o vacía
//   densidad de bordes  % de píxeles con gradiente de luminancia (Sobel) marcado. Baja = sin forma
//   contraste           desviación típica de la luminancia (0 a 0,5). Baja = deslavada
// y, si el juego expone window.__JUEGO__.contadores(), los contadores del render en ese momento
// (llamadas de dibujo, triángulos, geometrías, texturas), para el presupuesto de rendimiento.
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
// Una segunda página en blanco decodifica las capturas para medirlas, sin tocar la del juego.
const analizador = await contexto.newPage();

async function medir(png) {
  return analizador.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const lienzo = new OffscreenCanvas(w, h);
    const g = lienzo.getContext('2d');
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, w, h).data;
    const lum = new Float32Array(w * h);
    const hist = new Uint32Array(4096);
    let suma = 0;
    for (let i = 0, p = 0; p < lum.length; i += 4, p++) {
      const r = d[i], v = d[i + 1], a = d[i + 2];
      lum[p] = (0.2126 * r + 0.7152 * v + 0.0722 * a) / 255;
      suma += lum[p];
      hist[((r >> 4) << 8) | ((v >> 4) << 4) | (a >> 4)]++;
    }
    let entropia = 0;
    for (const n of hist) if (n) entropia -= (n / lum.length) * Math.log2(n / lum.length);
    const media = suma / lum.length;
    let varianza = 0;
    for (const l of lum) varianza += (l - media) ** 2;
    let bordes = 0;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const k = y * w + x;
        const gx = lum[k - w + 1] + 2 * lum[k + 1] + lum[k + w + 1] - lum[k - w - 1] - 2 * lum[k - 1] - lum[k + w - 1];
        const gy = lum[k + w - 1] + 2 * lum[k + w] + lum[k + w + 1] - lum[k - w - 1] - 2 * lum[k - w] - lum[k - w + 1];
        if (gx * gx + gy * gy > 0.0625) bordes++;
      }
    }
    return {
      entropia: entropia.toFixed(1),
      bordes: ((100 * bordes) / ((w - 2) * (h - 2))).toFixed(1),
      contraste: Math.sqrt(varianza / lum.length).toFixed(2),
    };
  }, png.toString('base64'));
}

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
const estados = [];
try {
  await pagina.goto(url, { waitUntil: 'load', timeout: 30000 });
  for (const paso of pasos) {
    const i = paso.indexOf(':');
    const tipo = i < 0 ? paso : paso.slice(0, i);
    const valor = i < 0 ? '' : paso.slice(i + 1);
    if (tipo === 'espera') await pagina.waitForTimeout(Number(valor) || 500);
    else if (tipo === 'captura') {
      const archivo = join(salida, `${valor || `captura-${capturas.length + 1}`}.png`);
      const png = await pagina.screenshot({ path: archivo });
      const m = await medir(png);
      const contadores = await pagina.evaluate(() => window.__JUEGO__?.contadores?.() ?? null);
      capturas.push(
        `${archivo}\n    entropía ${m.entropia} bits · bordes ${m.bordes} % · contraste ${m.contraste}` +
          (contadores ? `\n    render: ${JSON.stringify(contadores)}` : ''),
      );
    } else if (tipo === 'tecla') await pagina.keyboard.press(valor);
    else if (tipo === 'toque') {
      const [x, y] = valor.split('x').map(Number);
      await pagina.touchscreen.tap(x, y);
    } else if (tipo === 'clic') await pagina.click(valor, { timeout: 5000 });
    else if (tipo === 'texto') await pagina.keyboard.type(valor);
    else if (tipo === 'estado') {
      const estado = await pagina.evaluate(() => window.__JUEGO__?.estado?.() ?? null);
      estados.push(estado ? JSON.stringify(estado) : 'el juego no expone window.__JUEGO__.estado()');
    }
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
if (estados.length) {
  console.log(`Estados (${estados.length}):`);
  for (const e of estados) console.log(`  ${e}`);
}
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
