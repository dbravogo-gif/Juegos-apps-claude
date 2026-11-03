/* GymLog (fase 1) — Service Worker
   Sube APP_VERSION cada vez que publiques cambios: eso invalida la caché
   antigua y hace que la app se actualice sola en el móvil. */
const APP_VERSION = "v1.2.0";
const CACHE_PREFIX = "gymlog-fase1-";
const CACHE = CACHE_PREFIX + APP_VERSION;

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
    // Solo borra cachés propias: otras apps del mismo dominio (github.io) comparten Cache Storage.
    caches.keys()
      .then(keys=> Promise.all(keys.filter(k=> k.indexOf(CACHE_PREFIX)===0 && k!==CACHE).map(k=> caches.delete(k))))
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
  // Imágenes de los gatos alojadas en OpenArt: se guardan para tenerlas sin conexión.
  if(url.hostname === "cdn.openart.ai"){
    event.respondWith(
      caches.match(req).then(cached=> cached || fetch(req).then(res=>{
        if(res && (res.ok || res.type === "opaque")){
          const copy = res.clone();
          caches.open(CACHE).then(c=> c.put(req, copy));
        }
        return res;
      }))
    );
    return;
  }
  if(url.origin !== self.location.origin) return; // otras fuentes externas: al navegador

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
