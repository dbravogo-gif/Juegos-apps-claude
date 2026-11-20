// Barreras de publicación: que el service worker guarde todo lo necesario y que las versiones
// coincidan (si no, la app no abre sin conexión o no avisa de la versión nueva).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const sw = readFileSync(join(raiz, 'sw.js'), 'utf8');
const listados = [...sw.matchAll(/^\s+'([^']+)',$/gm)].map((m) => m[1]);

function archivos(dir) {
  return readdirSync(join(raiz, dir)).flatMap((n) => {
    const r = join(dir, n);
    return statSync(join(raiz, r)).isDirectory() ? archivos(r) : [r];
  });
}

test('el service worker guarda todos los archivos de la app', () => {
  const necesarios = [...archivos('src'), 'entrenador/index.html', ...archivos('fuentes').filter((f) => f.endsWith('.woff2')), ...archivos('img'),
    ...archivos('icons'), ...archivos('vendor').filter((f) => f.endsWith('.js'))];
  const faltan = necesarios.filter((f) => !listados.includes(f));
  assert.deepEqual(faltan, [], `Añade a ARCHIVOS de sw.js: ${faltan.join(', ')}`);
});

test('todo lo que lista el service worker existe', () => {
  const noExisten = listados.filter((f) => !f.endsWith('/') && !existsSync(join(raiz, f)));
  assert.deepEqual(noExisten, []);
});

test('la versión del service worker y la de la app coinciden', () => {
  const vSw = /const VERSION = '([^']+)'/.exec(sw)[1];
  const vApp = /VERSION = '([^']+)'/.exec(readFileSync(join(raiz, 'src/version.js'), 'utf8'))[1];
  assert.equal(vSw, vApp);
});

test('el manifest sirve para instalar en Android e iPhone', () => {
  const m = JSON.parse(readFileSync(join(raiz, 'manifest.webmanifest'), 'utf8'));
  assert.equal(m.short_name, 'Beep');
  assert.equal(m.display, 'standalone');
  const tamanos = m.icons.map((i) => `${i.sizes}:${i.purpose}`);
  for (const t of ['192x192:any', '512x512:any', '512x512:maskable']) assert.ok(tamanos.includes(t), t);
  for (const i of m.icons) assert.ok(existsSync(join(raiz, i.src)), i.src);
  assert.match(readFileSync(join(raiz, 'index.html'), 'utf8'), /apple-touch-icon/);
});

