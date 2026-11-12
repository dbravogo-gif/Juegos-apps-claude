// Los bolsillos de la mochila (autor, 2026-11-12): cada clase de objeto va en su bolsillo, y la
// pantalla de la mochila los enseña como partes de una mochila dibujada (src/arte/mochila.ts).
// «Técnicas» es un nombre provisional: el bolsillo de las máquinas que enseñan movimientos, que
// aún no existen.

import type { Objeto } from '../core/modelo';

export type IdBolsillo = 'botiquin' | 'cubos' | 'clave' | 'tecnicas';

export interface DefBolsillo {
  id: IdBolsillo;
  nombre: string;
  /** Lo que se dice si está vacío. */
  vacio: string;
}

/** En el orden en que se recorren con ← y →. */
export const BOLSILLOS: readonly DefBolsillo[] = [
  { id: 'botiquin', nombre: 'Botiquín', vacio: 'No llevas nada para curar. En la tienda hay pociones.' },
  { id: 'cubos', nombre: 'Cubos', vacio: 'No te quedan cubos. En la tienda los venden.' },
  { id: 'clave', nombre: 'Objetos clave', vacio: 'Aún no llevas ningún objeto clave.' },
  { id: 'tecnicas', nombre: 'Técnicas', vacio: 'Aún no tienes ninguna técnica que enseñar.' },
];

/** En qué bolsillo va un objeto. */
export function bolsilloDe(o: Objeto): IdBolsillo {
  switch (o.tipo) {
    case 'captura':
      return 'cubos';
    case 'clave':
      return 'clave';
    default:
      return 'botiquin';
  }
}
