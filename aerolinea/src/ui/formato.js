// Formatos y utilidades de interfaz.

export function dinero(n) {
  const signo = n < 0 ? '−' : '';
  const a = Math.abs(n);
  if (a >= 1e6) return `${signo}$${(a / 1e6).toLocaleString('es-ES', { maximumFractionDigits: a >= 1e7 ? 1 : 2 })} M`;
  if (a >= 1e4) return `${signo}$${Math.round(a / 1e3).toLocaleString('es-ES')} k`;
  return `${signo}$${Math.round(a).toLocaleString('es-ES')}`;
}

export function porcentaje(p) {
  const v = p * 100;
  if (v < 0.01) return '< 0,01 %';
  return `${v.toLocaleString('es-ES', { maximumFractionDigits: v < 1 ? 2 : 1 })} %`;
}

export function nivelRiesgo(p) {
  if (p < 0.001) return { clase: 'bajo', texto: 'Bajo' };
  if (p < 0.005) return { clase: 'moderado', texto: 'Moderado' };
  if (p < 0.02) return { clase: 'alto', texto: 'Alto' };
  return { clase: 'extremo', texto: 'Muy alto' };
}

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const km = (n) => `${Math.round(n).toLocaleString('es-ES')} km`;

export function clasePieza(v) {
  return v >= 75 ? 'bien' : v >= 50 ? 'regular' : 'mal';
}

export function barra(valor, max = 100, clase = clasePieza(valor)) {
  const p = Math.max(0, Math.min(100, (valor / max) * 100));
  return `<span class="barra ${clase}"><span style="width:${p.toFixed(1)}%"></span></span>`;
}
