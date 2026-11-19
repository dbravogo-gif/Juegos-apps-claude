// Registra el service worker (funcionar sin conexión) y avisa cuando hay una versión nueva.
import { tostada } from './ui.js';

export function registrarServiceWorker(ruta) {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  let recargando = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recargando) return;
    recargando = true;
    location.reload();
  });
  navigator.serviceWorker.register(ruta).then((reg) => {
    const avisar = (sw) => tostada('Hay una versión nueva de Beep', {
      accion: 'Actualizar', duracion: 0, alPulsar: () => sw.postMessage({ tipo: 'actualizar' }),
    });
    if (reg.waiting && navigator.serviceWorker.controller) avisar(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const nuevo = reg.installing;
      nuevo?.addEventListener('statechange', () => {
        if (nuevo.state === 'installed' && navigator.serviceWorker.controller) avisar(nuevo);
      });
    });
  }).catch(() => { /* sin service worker la app funciona igual, solo que no sin conexión */ });
}
