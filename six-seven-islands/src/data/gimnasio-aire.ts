// El gimnasio de Aire de Fuerteventura, en Morro Jable (fase 3; 2026-11-13), hecho a mano: una nave
// de molino con corrientes de viento en el suelo (`W`) que empujan hasta chocar, y dos aspas de
// molino (`H`) que, al girarlas, cambian hacia dónde sopla una corriente.
// - El pasillo de la líder (x 8) sopla hacia abajo: hay que girar las aspas A para que suba.
// - Las aspas A están en la sala de arriba a la derecha; se llega por la columna de la derecha
//   (x 15), que sopla hacia abajo hasta girar las aspas B, en la esquina de arriba a la izquierda.
// - Bajadas de un solo sentido (x 9 y x 11) para no quedarse atrapado arriba.
// Comprobado con tests/gimnasio-aire.test.ts: tiene solución, hace falta girar las dos aspas y no
// hay ningún sitio del que no se pueda volver a la puerta. La historia no lo cierra (autor).

import type { Corriente, DefInterior } from '../core/mundo';

const corrientes: Record<string, Corriente> = {};
for (let y = 2; y <= 7; y++) corrientes[`8,${y}`] = { dir: 's', alterna: 'n', aspas: 'aire-a' };
for (let y = 2; y <= 7; y++) corrientes[`9,${y}`] = { dir: 's' };
for (let y = 5; y <= 7; y++) corrientes[`11,${y}`] = { dir: 's' };
for (let y = 5; y <= 9; y++) corrientes[`15,${y}`] = { dir: 's', alterna: 'n', aspas: 'aire-b' };

export const GIMNASIO_AIRE: DefInterior = {
  id: 'gimnasio-aire',
  nombre: 'Gimnasio de Aire',
  mapa: [
    '|||||||||||||||||',
    '|#######m#######|',
    '|Hmmmmm#WW#mmmmm|',
    '|mmmmmm#WW#mmmmH|',
    '|mmmmmm#WW#mmmmm|',
    '|mmmmmm#WW#W###W|',
    '|mmmmmm#WW#W###W|',
    '|mmmmmm#WW#W###W|',
    '|mmmmmmmmmmmmm#W|',
    '|mmmmmmmmmmmmm#W|',
    '|mmmmmmmmmmmmmmm|',
    '|mmmmmmmmmmmmmmm|',
    '|mmmmmmmmmmmmmmm|',
    '||||||||d||||||||',
  ],
  entrada: { x: 8, y: 12 },
  personajes: [
    { id: 'vigilante-aire', x: 10, y: 12, mira: 'o' },
    { id: 'aprendiz-aire-1', x: 12, y: 10, mira: 'e', entrenador: { vision: 3, obligatorio: true }, frase: '¿Quieres subir por la columna del viento? Antes, tendrás que vencerme.' },
    { id: 'aprendiz-aire-2', x: 13, y: 2, mira: 's', entrenador: { vision: 2, obligatorio: true }, frase: '¡Has llegado volando! Pues ahora toca aterrizar… contra mis criaturas.' },
    { id: 'aprendiz-aire-3', x: 5, y: 8, mira: 'e', entrenador: { vision: 3, obligatorio: true }, frase: 'El pasillo de la líder sopla hacia abajo. A no ser que alguien gire las aspas…' },
    { id: 'lider-aire', x: 8, y: 1, mira: 's' },
  ],
  corrientes,
  aspas: { '15,3': 'aire-a', '1,2': 'aire-b' },
};
