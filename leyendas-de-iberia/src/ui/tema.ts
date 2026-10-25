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

// Paleta de juego actual: paneles blancos, texto azul noche y colores vivos de acento.
export const COLOR = {
  /** Azul noche: el mando y el fondo de los menús. */
  fondo: 0x151a3d,
  /** Paneles y ventanas. */
  panel: 0xffffff,
  /** Botones secundarios y paneles apagados. */
  panelSuave: 0xe9edf6,
  /** Borde fino de los paneles. */
  borde: 0xd3d9ec,
  tinta: 0x1d2240,
  tintaSuave: 0x66708f,
  rojo: 0xec3b4f,
  oro: 0xffbe1e,
  bronce: 0xff8a2a,
  azul: 0x3b6cff,
  celeste: 0x2ec4ff,
  verde: 0x2fbf71,
  morado: 0x8a5cf6,
  vidaAlta: 0x3ccf6e,
  vidaMedia: 0xffc21a,
  vidaBaja: 0xf2414f,
  exp: 0x3d8bff,
  cielo: 0x9ad7ff,
  suelo: 0x93cf6b,
} as const;

/** Tipografía redondeada, como la de los juegos actuales (Nunito, incluida en el juego). */
export const FUENTE = '"Nunito", "Segoe UI", system-ui, sans-serif';

export function css(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

export function estiloTexto(tamano: number, color: number = COLOR.tinta, negrita = false) {
  return {
    fontFamily: FUENTE,
    fontSize: `${tamano}px`,
    color: css(color),
    fontStyle: negrita ? '900' : '700',
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

/** Texto oscuro o blanco, el que mejor se lea sobre `fondo`. */
export function textoSobre(fondo: number): number {
  const r = (fondo >> 16) & 0xff;
  const g = (fondo >> 8) & 0xff;
  const b = fondo & 0xff;
  return 0.299 * r + 0.587 * g + 0.114 * b > 165 ? COLOR.tinta : COLOR.panel;
}
