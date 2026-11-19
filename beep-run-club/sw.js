// Service worker de Beep Run Club: guarda la app para que abra sin conexión.
// Al publicar un cambio, sube VERSION (y la de src/version.js: una prueba comprueba que coinciden).
const VERSION = '0.2.1';
const CACHE = `beep-run-club-${VERSION}`;

// Toda la app (atleta y entrenador) en la misma versión, para no mezclar módulos viejos y nuevos
// tras una actualización. Una prueba comprueba que no falta nada.
const ARCHIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'fuentes/bricolage-grotesque-latin-700-normal.woff2',
  'fuentes/bricolage-grotesque-latin-800-normal.woff2',
  'fuentes/dm-sans-latin-300-normal.woff2',
  'fuentes/dm-sans-latin-400-normal.woff2',
  'fuentes/dm-sans-latin-600-normal.woff2',
  'icons/icono.svg',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'img/logo-texto.svg',
  'img/logo-completo.svg',
  'img/mascota.svg',
  'src/config.js',
  'src/version.js',
  'src/comun/estilos.css',
  'src/comun/ui.js',
  'src/comun/tema.js',
  'src/comun/entorno.js',
  'src/comun/registrar-sw.js',
  'src/datos/almacen.js',
  'src/datos/demo.js',
  'src/datos/ejemplo.js',
  'src/nucleo/azar.js',
  'src/nucleo/codigos.js',
  'src/nucleo/entrada.js',
  'src/nucleo/exportar.js',
  'src/nucleo/fechas.js',
  'src/nucleo/plan.js',
  'src/nucleo/registro.js',
  'src/nucleo/ritmo.js',
  'src/atleta/app.js',
  'src/atleta/entrar.js',
  'src/atleta/semana.js',
  'src/atleta/sesion.js',
  'src/atleta/ajustes.js',
  'entrenador/',
  'entrenador/index.html',
  'src/entrenador/panel.css',
  'src/entrenador/app.js',
  'src/entrenador/comun.js',
  'src/entrenador/novedades.js',
  'src/entrenador/atletas.js',
  'src/entrenador/editor.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // Solo borra sus propias cachés: en el mismo dominio viven otras apps del autor.
    const nombres = await caches.keys();
    await Promise.all(nombres.filter((n) => n.startsWith('beep-run-club-') && n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => {
  if (e.data?.tipo === 'actualizar') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin || !url.pathname.startsWith(new URL('./', location).pathname)) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Las páginas se buscan sin la consulta (?c=CODIGO&hoy=…).
    const guardada = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
    if (guardada) return guardada;
    try {
      return await fetch(request);
    } catch (error) {
      if (request.mode === 'navigate') return (await cache.match('index.html')) ?? Response.error();
      throw error;
    }
  })());
});
