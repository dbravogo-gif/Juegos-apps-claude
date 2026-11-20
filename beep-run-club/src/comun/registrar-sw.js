// Registra el service worker (funcionar sin conexión) y avisa cuando hay una versión nueva.
import { tostada } from './ui.js';

export function registrarServiceWorker(ruta) {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  // Solo se recarga cuando el usuario pide actualizar: la primera instalación también cambia de
  // controlador y recargar ahí haría perder lo que estuviera escribiendo.
  let pidioActualizar = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!pidioActualizar) return;
    pidioActualizar = false;
    location.reload();
  });
  navigator.serviceWorker.register(ruta).then((reg) => {
    // Arriba: un aviso que se queda abajo tapa los botones principales y «se come» los toques.
    const avisar = (sw) => tostada('Hay una versión nueva de Beep', {
      accion: 'Actualizar', duracion: 0, arriba: true, alPulsar: () => { pidioActualizar = true; sw.postMessage({ tipo: 'actualizar' }); },
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
