// La mochila de la pantalla «Mochila» (autor, 2026-11-12), dibujada en SVG por código: cada
// bolsillo es una parte de la mochila. La solapa de arriba, los objetos clave; el bolsillo de
// delante, el botiquín; los de los lados, los cubos (izquierda) y las técnicas (derecha). El
// elegido se pinta en coral. Función pura que devuelve texto, para probarla sin DOM. Si un día
// llega una mochila de Meshy, se cambia aquí sin tocar el menú.

import type { IdBolsillo } from '../data/bolsillos';

const TELA = '#2e7f86';
const TELA_OSCURA = '#225f65';
const BORDE = '#163f43';
const COSTURA = 'rgb(255 246 234 / 0.45)';
const ELEGIDO = '#ff6b6b';
const ELEGIDO_BORDE = '#b23a3a';
const DIBUJO = '#fff6ea';

/** El dibujo de cada bolsillo: su forma y su emblema, centrado en (cx, cy). */
const EMBLEMAS: Record<IdBolsillo, (cx: number, cy: number) => string> = {
  // Una cruz de botiquín.
  botiquin: (cx, cy) => `<path d="M${cx - 7} ${cy - 20}h14v13h13v14h-13v13h-14v-13h-13v-14h13z" fill="${DIBUJO}" />`,
  // Un cubo en perspectiva.
  cubos: (cx, cy) =>
    `<g fill="none" stroke="${DIBUJO}" stroke-width="3" stroke-linejoin="round"><path d="M${cx} ${cy - 13}l12 7v13l-12 7l-12-7v-13z" /><path d="M${cx - 12} ${cy - 6}l12 7l12-7M${cx} ${cy + 1}v13" /></g>`,
  // Una llave.
  clave: (cx, cy) =>
    `<g fill="none" stroke="${DIBUJO}" stroke-width="4" stroke-linecap="round"><circle cx="${cx - 12}" cy="${cy}" r="7" /><path d="M${cx - 5} ${cy}h22M${cx + 11} ${cy}v6M${cx + 17} ${cy}v5" /></g>`,
  // Un disco.
  tecnicas: (cx, cy) =>
    `<g fill="none" stroke="${DIBUJO}" stroke-width="3"><circle cx="${cx}" cy="${cy}" r="12" /><circle cx="${cx}" cy="${cy}" r="3.5" fill="${DIBUJO}" /></g>`,
};

/** La forma de cada bolsillo y dónde va su emblema. */
const FORMAS: Record<IdBolsillo, { forma: (relleno: string, borde: string) => string; emblema: [number, number] }> = {
  clave: {
    forma: (r, b) => `<path d="M70 92 Q70 52 150 52 Q230 52 230 92 L230 128 Q150 146 70 128 Z" fill="${r}" stroke="${b}" stroke-width="4" stroke-linejoin="round" />`,
    emblema: [150, 100],
  },
  botiquin: {
    forma: (r, b) => `<rect x="94" y="178" width="112" height="100" rx="22" fill="${r}" stroke="${b}" stroke-width="4" /><path d="M106 196h88" stroke="${COSTURA}" stroke-width="2" stroke-dasharray="5 4" />`,
    emblema: [150, 240],
  },
  cubos: {
    forma: (r, b) => `<rect x="28" y="168" width="46" height="112" rx="16" fill="${r}" stroke="${b}" stroke-width="4" />`,
    emblema: [51, 226],
  },
  tecnicas: {
    forma: (r, b) => `<rect x="226" y="168" width="46" height="112" rx="16" fill="${r}" stroke="${b}" stroke-width="4" />`,
    emblema: [249, 226],
  },
};

/** El SVG de la mochila con un bolsillo elegido. */
export function svgMochila(elegido: IdBolsillo): string {
  const bolsillo = (id: IdBolsillo) => {
    const f = FORMAS[id];
    const si = id === elegido;
    return `<g class="bolsillo${si ? ' bolsillo-elegido' : ''}" data-bolsillo="${id}">${f.forma(si ? ELEGIDO : TELA_OSCURA, si ? ELEGIDO_BORDE : BORDE)}${EMBLEMAS[id](...f.emblema)}</g>`;
  };
  return `<svg viewBox="0 0 300 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mochila, bolsillo elegido: ${elegido}">
    <path d="M118 52 Q118 14 150 14 Q182 14 182 52" fill="none" stroke="${BORDE}" stroke-width="12" stroke-linecap="round" />
    <rect x="62" y="56" width="176" height="252" rx="44" fill="${TELA}" stroke="${BORDE}" stroke-width="4" />
    <rect x="74" y="140" width="152" height="156" rx="34" fill="none" stroke="${COSTURA}" stroke-width="2" stroke-dasharray="6 5" />
    ${bolsillo('cubos')}${bolsillo('tecnicas')}${bolsillo('botiquin')}${bolsillo('clave')}
  </svg>`;
}
