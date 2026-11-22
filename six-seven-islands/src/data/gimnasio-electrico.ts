// El gimnasio Eléctrico de Las Palmas (autor, 2026-11-22: «a oscuras con relámpagos»; distinto de
// los de Roca y Aire, que se parecían). Un laberinto de muros bajos de chapa (`=`), a oscuras: solo
// se ve un poco alrededor del jugador y, con cada relámpago, todo un instante (`oscura`; lo dibuja
// el subsistema «oscuridad»). Sin palancas. Los aprendices esperan en recovecos junto al camino y
// te sorprenden al pasar; el tercero, al final, no se esquiva. Arriba, el sitio del líder, vacío:
// no está (autor, 2026-11-15). Se ha ido a Agaete y te espera en el terrero, con la de Lucha.
// El laberinto salió de un generador con semilla (algoritmo de Prim, semilla 294): 28 casillas de
// camino y 10 desvíos, varios desde la entrada.

import type { DefInterior } from '../core/mundo';

export const GIMNASIO_ELECTRICO: DefInterior = {
  id: 'gimnasio-electrico',
  nombre: 'Gimnasio Eléctrico',
  oscura: true,
  mapa: [
    '|||||||||||||||||||',
    '|mmmmmmmmmmmmmmmmm|',
    '|mmmmmmmmmmmmmmmmm|',
    '|mmmmmmmmmmmmmmmmm|',
    '|========m========|',
    '|m=mmmmmmm=m=m=m=m|',
    '|m=======m=m=m=m=m|',
    '|m=mmm=m=mmmmmmm=m|',
    '|m===m=m===m===m=m|',
    '|m=m=mmm=m=m=m=mmm|',
    '|m=m===m=m===m===m|',
    '|mmmmmmmmm=mmm=m=m|',
    '|m=======m===m=m=m|',
    '|m=mmmmmmmmm=mmmmm|',
    '|==========m===m==|',
    '|mmmmmmmmmmmmmmmmm|',
    '|||||||||d|||||||||',
  ],
  entrada: { x: 9, y: 15 },
  personajes: [
    { id: 'vigilante-electrico', x: 8, y: 15, mira: 'e' },
    { id: 'aprendiz-electrico-1', x: 16, y: 15, mira: 'o', entrenador: { vision: 3, obligatorio: true }, frase: '¡Bu! ¿Te he asustado? Aquí dentro, las criaturas eléctricas se ven antes que las personas.' },
    { id: 'aprendiz-electrico-2', x: 15, y: 6, mira: 's', entrenador: { vision: 3, obligatorio: true }, frase: '¡Te pillé! Con el último relámpago te vi venir de lejos.' },
    { id: 'aprendiz-electrico-3', x: 8, y: 5, mira: 'e', entrenador: { vision: 2, obligatorio: true }, frase: 'Ya casi llegas a la sala del líder. Bueno… a donde estaría el líder.' },
  ],
  objetos: [{ id: 'superpocion-laberinto', x: 1, y: 5, objeto: 'superpocion' }],
};
