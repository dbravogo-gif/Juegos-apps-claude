const VERSION = 'v0.1.0';
const CACHE = `constant-${VERSION}`;
const ESENCIALES = [
  '.',
  'index.html',
  'manifest.webmanifest',
  'icon.svg',
  'src/ui/app.js',
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ESENCIALES)));
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c))),
    ),
  );
  self.clients.claim();
});

// Red primero para que una versión nueva se recoja al momento; la caché es el respaldo sin conexión.
self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET') return;

  evento.respondWith(
    fetch(evento.request)
      .then((respuesta) => {
        const copia = respuesta.clone();
        caches.open(CACHE).then((cache) => cache.put(evento.request, copia));
        return respuesta;
      })
      .catch(() => caches.match(evento.request).then((r) => r ?? caches.match('index.html'))),
  );
});
