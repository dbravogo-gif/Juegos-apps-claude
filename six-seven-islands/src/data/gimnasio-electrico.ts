// El gimnasio Eléctrico de Las Palmas (2026-11-22; ISLA-3.md), hecho a mano. Tres salas, una
// encima de otra, separadas por paredes con una barrera de rayos (`X`) cada una. Cada barrera la
// apaga una palanca (`p`): la de abajo está en la sala de la entrada y la de en medio, en la sala
// de en medio. El tercer aprendiz vigila el paso a la última sala, así que no se esquiva.
// Arriba, los generadores (`k`) y el sitio del líder, vacío: no está (autor, 2026-11-15). Se ha
// ido a Agaete y te espera en el terrero, con la líder de Lucha (fase 3).

import type { DefInterior } from '../core/mundo';

export const GIMNASIO_ELECTRICO: DefInterior = {
  id: 'gimnasio-electrico',
  nombre: 'Gimnasio Eléctrico',
  mapa: [
    '|||||||||||||||||',
    '|kmmmmmmmmmmmmmk|',
    '|mmmmmmmmmmmmmmm|',
    '|kmmmmmmmmmmmmmk|',
    '|||||||||X|||||||',
    '|mmmmmmmmmmmmmmm|',
    '|mmmkmmmmmmmkmmm|',
    '|mmmmmmmmmmmmmmp|',
    '|mmmmmmmmmmmmmmm|',
    '|||||||X|||||||||',
    '|mmmmmmmmmmmmmmm|',
    '|pmmmmmmmmmmmmmm|',
    '|mmmkmmmmmmmkmmm|',
    '|mmmmmmmmmmmmmmm|',
    '|mmmmmmmmmmmmmmm|',
    '||||||||d||||||||',
  ],
  entrada: { x: 8, y: 14 },
  personajes: [
    { id: 'vigilante-electrico', x: 6, y: 14, mira: 'e' },
    { id: 'aprendiz-electrico-1', x: 4, y: 10, mira: 'o', entrenador: { vision: 3, obligatorio: false }, frase: '¿La palanca? Detrás de mí. Pero antes, una descarga.' },
    { id: 'aprendiz-electrico-2', x: 12, y: 7, mira: 'e', entrenador: { vision: 2, obligatorio: false }, frase: 'Esta palanca apaga la barrera de arriba. Si me vences, claro.' },
    { id: 'aprendiz-electrico-3', x: 12, y: 5, mira: 'o', entrenador: { vision: 4, obligatorio: true }, frase: 'Por aquí se sube a ver al líder. Bueno… a ver dónde estaría el líder.' },
  ],
  cierres: {
    '7,9': { condicion: 'palanca:electrico-1', aviso: 'Una barrera de rayos cierra el paso. Zumba que da miedo. Tiene que haber una palanca.' },
    '9,4': { condicion: 'palanca:electrico-2', aviso: 'Otra barrera de rayos. La palanca de abajo no la apaga.' },
  },
  palancas: { '1,11': 'electrico-1', '15,7': 'electrico-2' },
};
