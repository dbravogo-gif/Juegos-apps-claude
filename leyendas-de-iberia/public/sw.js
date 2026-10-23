// Service worker de Leyendas de Iberia: permite instalar el juego y jugar sin conexión.
// Las páginas van primero a la red (para recoger versiones nuevas al momento); el resto de
// archivos llevan un hash en el nombre, así que se sirven de la caché si ya están.

const CACHE = 'leyendas-de-iberia-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((c) => c.startsWith('leyendas-de-iberia-') && c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

function guardar(peticion, respuesta) {
  if (respuesta.ok) {
    const copia = respuesta.clone();
    caches.open(CACHE).then((cache) => cache.put(peticion, copia));
  }
  return respuesta;
}

self.addEventListener('fetch', (evento) => {
  const peticion = evento.request;
  if (peticion.method !== 'GET' || new URL(peticion.url).origin !== self.location.origin) return;
  if (peticion.mode === 'navigate') {
    evento.respondWith(
      fetch(peticion)
        .then((r) => guardar(peticion, r))
        .catch(() => caches.match(peticion).then((r) => r ?? caches.match('./'))),
    );
    return;
  }
  evento.respondWith(caches.match(peticion).then((r) => r ?? fetch(peticion).then((res) => guardar(peticion, res))));
});
