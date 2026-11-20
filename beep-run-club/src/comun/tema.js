// Tema claro, oscuro o automático (el del sistema). Se guarda en el móvil.
const CLAVE = 'beep_tema';
export const TEMAS = [['auto', 'Automático'], ['claro', 'Claro'], ['oscuro', 'Noche']];

export function temaGuardado() {
  try { return localStorage.getItem(CLAVE) || 'auto'; } catch { return 'auto'; }
}

export function aplicarTema(tema = temaGuardado()) {
  const raiz = document.documentElement;
  if (tema === 'auto') delete raiz.dataset.tema; else raiz.dataset.tema = tema;
  const oscuro = tema === 'oscuro' || (tema === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', oscuro ? '#1A1512' : '#F7F7F7');
}

export function guardarTema(tema) {
  try { localStorage.setItem(CLAVE, tema); } catch { /* modo privado: solo para esta visita */ }
  aplicarTema(tema);
}

matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => aplicarTema());
