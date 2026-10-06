/* Chispa — Service Worker
   Sube APP_VERSION cada vez que publiques cambios: invalida la caché
   antigua y la app avisa de que hay versión nueva. */
const APP_VERSION = "v2.0.0";
const CACHE = "chispa-" + APP_VERSION;

const ASSETS = [
  "./",
  "./index.html",
  "./content.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (event)=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(c=> c.addAll(ASSETS))
      .catch(err=> console.warn("Precaché parcial:", err))
  );
});

self.addEventListener("activate", (event)=>{
  event.waitUntil(
    caches.keys()
      .then(keys=> Promise.all(keys.filter(k=> k.startsWith("chispa-") && k!==CACHE).map(k=> caches.delete(k))))
      .then(()=> self.clients.claim())
  );
});

self.addEventListener("message", (event)=>{
  if(event.data === "SKIP_WAITING") self.skipWaiting();
});

/* Estrategia:
   - Documento y contenido: red primero (para recibir cambios), caché si no hay conexión.
   - Fuentes de Google: caché primero (se guardan la primera vez que se cargan).
   - Resto: caché primero. */
self.addEventListener("fetch", (event)=>{
  const req = event.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);

  if(url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com"){
    event.respondWith(
      caches.match(req).then(hit=> hit || fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=> c.put(req, copy));
        return res;
      }))
    );
    return;
  }
  if(url.origin !== self.location.origin) return;

  const fresh = req.mode === "navigate" || url.pathname.endsWith("/content.js") || url.pathname.endsWith("/");
  if(fresh){
    event.respondWith(
      fetch(req).then(res=>{
        if(res && res.ok){ const copy = res.clone(); caches.open(CACHE).then(c=> c.put(req, copy)); }
        return res;
      }).catch(()=> caches.match(req).then(r=> r || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached=> cached || fetch(req).then(res=>{
      if(res && res.status === 200 && res.type === "basic"){
        const copy = res.clone();
        caches.open(CACHE).then(c=> c.put(req, copy));
      }
      return res;
    }))
  );
});
