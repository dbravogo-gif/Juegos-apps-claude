// El gimnasio de Lucha de Agaete: un terrero de lucha canaria (autor, 2026-11-15). El círculo de
// arena en medio y gradas de madera alrededor (`=`). Los luchadores salen de uno en uno, tres en
// total: cada uno te saluda y te pregunta si luchas ya o prefieres ir antes a curarte (`pregunta`
// en su entrenador). Al vencer al tercero llegan los dos líderes de la isla, el Eléctrico y la de
// Lucha, y se lucha dos contra dos con tu segundo amigo (fase 3b, ISLA-3.md). Dentro, el agarre:
// el rival te agarra y tus criaturas pueden quedar confusas (`agarre` del campo).

import type { DefInterior } from '../core/mundo';

export const GIMNASIO_LUCHA: DefInterior = {
  id: 'gimnasio-lucha',
  nombre: 'Terrero de Agaete',
  mapa: [
    '|||||||||||||||||',
    '|===============|',
    '|=mmmmmmmmmmmmm=|',
    '|=mmmmmmmmmmmmm=|',
    '|=mmmmmmmmmmmmm=|',
    '|=mmmmmmmmmmmmm=|',
    '|=mmmmmmmmmmmmm=|',
    '|=mmmmmmmmmmmmm=|',
    '|=mmmmmmmmmmmmm=|',
    '|======mmm======|',
    '|mmmmmmmmmmmmmmm|',
    '||||||||d||||||||',
  ],
  entrada: { x: 8, y: 10 },
  personajes: [
    { id: 'vigilante-lucha', x: 6, y: 10, mira: 'e' },
    // De uno en uno: el siguiente sale cuando vences al anterior, cada uno desde un lado del círculo.
    // Sin vista: se les habla.
    { id: 'luchador-1', x: 8, y: 4, mira: 's', entrenador: { vision: 0, obligatorio: false }, sin: 'vencido:luchador-1' },
    { id: 'luchador-2', x: 6, y: 4, mira: 's', entrenador: { vision: 0, obligatorio: false }, con: 'vencido:luchador-1', sin: 'vencido:luchador-2' },
    { id: 'luchador-3', x: 10, y: 4, mira: 's', entrenador: { vision: 0, obligatorio: false }, con: 'vencido:luchador-2', sin: 'vencido:luchador-3' },
    // Al vencer al tercero, entran los dos líderes y tu amigo (ISLA-3.md, fase 3b): dos contra dos.
    { id: 'lider-lucha', x: 7, y: 3, mira: 's', entrenador: { vision: 0, obligatorio: false }, con: 'vencido:luchador-3' },
    { id: 'lider-electrico', x: 9, y: 3, mira: 's', entrenador: { vision: 0, obligatorio: false }, con: 'vencido:luchador-3' },
    { id: 'amigo2-terrero', x: 8, y: 6, mira: 'n', con: 'vencido:luchador-3' },
  ],
};
