// El gimnasio de Roca de Lanzarote, hecho a mano (autor, 2026-11-13: «hay que hacer el gimnasio
// bien bien»). Una cueva volcánica en terrazas separadas por coladas de lava (`L`), que se cruzan
// por un puente de basalto (`u`). Los tres aprendices te ven en el único camino, así que no se
// esquivan. Las dos primeras coladas tenían compuertas que se abrían al vencer al aprendiz: no
// servían de nada, porque ya hay que vencerlo, y no se veían (autor, 2026-11-19). Queda la última
// (`X`), que no tiene cerradura: la mueve una palanca (`p`) en un saliente que vigila el tercer
// aprendiz. Arriba espera la líder.
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
    '|LLLLLLLuLLLLLLL|',
    '|mmmmmmmmmmmmmmm|',
    '|m#mmm#mmm#mmm#m|',
    '|mmmmmmmmmmmmmmm|',
    '|LLLLLLLuLLLLLLL|',
    '|mmmmmmmmmmmmmmm|',
    '|mmmmmmmmmmmmmmm|',
    '||||||||d||||||||',
  ],
  entrada: { x: 8, y: 14 },
  personajes: [
    { id: 'vigilante-gimnasio', x: 6, y: 14, mira: 'e' },
    { id: 'aprendiz-roca-1', x: 12, y: 13, mira: 'o', entrenador: { vision: 4, obligatorio: true }, frase: '¡Alto ahí! Para cruzar la colada tendrás que vencerme.' },
    { id: 'aprendiz-roca-2', x: 4, y: 9, mira: 'e', entrenador: { vision: 5, obligatorio: true }, frase: 'Estas columnas salieron de la última erupción. ¡Y mis criaturas son igual de duras!' },
    { id: 'aprendiz-roca-3', x: 14, y: 5, mira: 's', entrenador: { vision: 2, obligatorio: true }, frase: '¿Buscas la palanca? Está detrás de mí. Antes, a ver qué tal luchas.' },
    { id: 'lider-gimnasio', x: 8, y: 2, mira: 's' },
  ],
  cierres: {
    '8,4': { condicion: 'palanca:gimnasio-roca', aviso: 'Esta compuerta no tiene cerradura. Tiene que haber una palanca en algún sitio.' },
  },
  palancas: { '15,6': 'gimnasio-roca' },
};
