// El gimnasio de Roca de Lanzarote, hecho a mano (autor, 2026-11-13: «hay que hacer el gimnasio
// bien bien»). Una cueva volcánica en tres terrazas separadas por coladas de lava (`L`), cada una
// con su compuerta de basalto (`X`):
// - la primera se hunde al vencer al aprendiz de la entrada;
// - la segunda, al vencer al de las columnas;
// - la tercera no tiene cerradura: la mueve una palanca (`p`) en un saliente que vigila el
//   tercer aprendiz.
// Arriba espera la líder. Los tres aprendices te ven en el único camino, así que no se esquivan.
// Las columnas (`#`) son de basalto. En este gimnasio la historia no cierra la puerta: se entra
// desde el principio (autor, 2026-11-13).

import type { DefInterior } from '../core/mundo';

export const GIMNASIO_ROCA: DefInterior = {
  id: 'gimnasio',
  nombre: 'Gimnasio de Roca',
  mapa: [
    '|||||||||||||||||',
    '|##mmmmmmmmmmm##|',
    '|#mmmmmmmmmmmmm#|',
    '|mmmmmmmmmmmmmmm|',
    '|LLLLLLLXLLLLLLL|',
    '|mmmmmmmmmmm#mmm|',
    '|mmmmmmmmmmm#mmp|',
    '|mmmmmmmmmmmmmmm|',
    '|LLLLLLLXLLLLLLL|',
    '|mmmmmmmmmmmmmmm|',
    '|m#mmm#mmm#mmm#m|',
    '|mmmmmmmmmmmmmmm|',
    '|LLLLLLLXLLLLLLL|',
    '|mmmmmmmmmmmmmmm|',
    '|mmmmmmmmmmmmmmm|',
    '||||||||d||||||||',
  ],
  entrada: { x: 8, y: 14 },
  personajes: [
    { id: 'vigilante-gimnasio', x: 6, y: 14, mira: 'e' },
    { id: 'aprendiz-roca-1', x: 12, y: 13, mira: 'o', entrenador: { vision: 4, obligatorio: true }, frase: '¡Alto ahí! Para cruzar la primera colada tendrás que vencerme.' },
    { id: 'aprendiz-roca-2', x: 4, y: 9, mira: 'e', entrenador: { vision: 5, obligatorio: true }, frase: 'Estas columnas salieron de la última erupción. ¡Y mis criaturas son igual de duras!' },
    { id: 'aprendiz-roca-3', x: 14, y: 5, mira: 's', entrenador: { vision: 2, obligatorio: true }, frase: '¿Buscas la palanca? Está detrás de mí. Antes, a ver qué tal luchas.' },
    { id: 'lider-gimnasio', x: 8, y: 2, mira: 's' },
  ],
  cierres: {
    '8,12': { condicion: 'vencido:aprendiz-roca-1', aviso: 'Una compuerta de basalto corta el paso. Se hundirá cuando venzas al aprendiz.' },
    '8,8': { condicion: 'vencido:aprendiz-roca-2', aviso: 'Otra compuerta de basalto. El aprendiz de las columnas tiene la llave… en sus criaturas.' },
    '8,4': { condicion: 'palanca:gimnasio-roca', aviso: 'Esta compuerta no tiene cerradura. Tiene que haber una palanca en algún sitio.' },
  },
  palancas: { '15,6': 'gimnasio-roca' },
};
