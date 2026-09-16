/* Bulk Up — Service Worker
   Sube APP_VERSION cada vez que publiques cambios: eso invalida la caché
   antigua y hace que la app se actualice sola en el móvil. */
const APP_VERSION = "v1.6.0";
const CACHE = "bulkup-" + APP_VERSION;

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/logo-header.png"
];

self.addEventListener("install", (event)=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(c=> c.addAll(ASSETS))
      // Si algún recurso opcional fallara, no bloqueamos la instalación.
      .catch(err=> console.warn("Precaché parcial:", err))
      .then(()=> self.skipWaiting())
  );
});

self.addEventListener("activate", (event)=>{
  event.waitUntil(
    caches.keys()
      .then(keys=> Promise.all(keys.filter(k=> k!==CACHE).map(k=> caches.delete(k))))
      .then(()=> self.clients.claim())
  );
});

self.addEventListener("message", (event)=>{
  if(event.data === "SKIP_WAITING") self.skipWaiting();
});

/* Estrategia:
   - Documento (la propia app): red primero, para recibir actualizaciones al abrir;
     si no hay conexión, se sirve la copia en caché (offline total en el gimnasio).
   - Resto de recursos: caché primero, que es instantáneo. */
self.addEventListener("fetch", (event)=>{
  const req = event.request;
  if(req.method !== "GET") return;

  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return; // fuentes externas: al navegador

  if(req.mode === "navigate" || req.destination === "document"){
    event.respondWith(
      fetch(req)
        .then(res=>{
          const copy = res.clone();
          caches.open(CACHE).then(c=> c.put("./index.html", copy));
          return res;
        })
        .catch(()=> caches.match("./index.html").then(r=> r || caches.match("./")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached=>{
      if(cached) return cached;
      return fetch(req).then(res=>{
        if(res && res.status === 200 && res.type === "basic"){
          const copy = res.clone();
          caches.open(CACHE).then(c=> c.put(req, copy));
        }
        return res;
      }).catch(()=> cached);
    })
  );
});
