// Medidas y colores de la interfaz. El juego se dibuja a 1080 de ancho y se escala a la
// pantalla: en la mayoría de móviles eso queda casi a un píxel por píxel físico.

export const ANCHO = 1080;
/** Alto de diseño de las pantallas fijas (título, combate, laboratorio). */
export const ALTO_DISENO = 1920;

/**
 * Alto real del juego: 1920 como mínimo y más en móviles alargados, para que no queden bandas
 * negras. Se calcula una vez al cargar.
 */
export const ALTO = calcularAlto();

function calcularAlto(): number {
  if (typeof window === 'undefined' || !window.innerWidth) return ALTO_DISENO;
  const proporcion = window.innerHeight / window.innerWidth;
  return Math.round(Math.min(2400, Math.max(ALTO_DISENO, ANCHO * proporcion)));
}

/** Lo que hay que bajar una pantalla de 1920 de alto para centrarla en el alto real. */
export const MARGEN_VERTICAL = Math.round((ALTO - ALTO_DISENO) / 2);

export const COLOR = {
  fondo: 0x1d1611,
  pergamino: 0xf3e6c4,
  pergaminoOscuro: 0xe2cf9f,
  tinta: 0x2b1d12,
  tintaSuave: 0x6b5a45,
  rojo: 0x9f1d20,
  oro: 0xc9a227,
  bronce: 0xb0793a,
  vidaAlta: 0x3f8f3a,
  vidaMedia: 0xd99a1e,
  vidaBaja: 0xc0392b,
  exp: 0x3a6ea5,
  cielo: 0xcfe3e8,
  suelo: 0xb9a27a,
} as const;

export const FUENTE = 'Georgia, "Times New Roman", serif';

export function css(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

export function estiloTexto(tamano: number, color: number = COLOR.tinta, negrita = false) {
  return {
    fontFamily: FUENTE,
    fontSize: `${tamano}px`,
    color: css(color),
    fontStyle: negrita ? 'bold' : 'normal',
  };
}

/** Aclara un color mezclándolo con blanco. `t` de 0 a 1. */
export function aclarar(color: number, t: number): number {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  const m = (c: number) => Math.round(c + (255 - c) * t);
  return (m(r) << 16) | (m(g) << 8) | m(b);
}

/** Oscurece un color. `t` de 0 a 1. */
export function oscurecer(color: number, t: number): number {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  const m = (c: number) => Math.round(c * (1 - t));
  return (m(r) << 16) | (m(g) << 8) | m(b);
}

/** Negro o pergamino, el que mejor se lea sobre `fondo`. */
export function textoSobre(fondo: number): number {
  const r = (fondo >> 16) & 0xff;
  const g = (fondo >> 8) & 0xff;
  const b = fondo & 0xff;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? COLOR.tinta : COLOR.pergamino;
}
