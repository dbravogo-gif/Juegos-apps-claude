// Los cinco pueblos y su círculo (HISTORIA.md, decidido por el autor el 2026-11-15). Cada pueblo
// ataca a otro, y en la tabla de tipos pierde contra él (una prueba lo vigila). Para quien elige una
// inicial: su rival (el amigo) lleva la del pueblo al que ataca el suyo, y le persigue la rama del
// pueblo que ataca al suyo. Los nombres los propuso Claude; el autor puede cambiarlos.

import { TIPOS } from './tipos';

export type TipoInicial = 'planta' | 'infernal' | 'roca' | 'tierra' | 'agua';

export interface DefPueblo {
  /** Como se dice en la calle: «los del Hoyo». */
  nombre: string;
  /** El pueblo al que ataca. */
  ataca: TipoInicial;
  /** Su rama radical y el comandante que da la cara. */
  rama: string;
  comandante: string;
}

export const PUEBLOS: Readonly<Record<TipoInicial, DefPueblo>> = {
  planta: { nombre: 'los del Hoyo', ataca: 'infernal', rama: 'La Raíz', comandante: 'Domingo' },
  infernal: { nombre: 'los de la Colada', ataca: 'roca', rama: 'La Brasa', comandante: 'Yeray' },
  roca: { nombre: 'los del Risco', ataca: 'tierra', rama: 'El Basalto', comandante: 'Candelaria' },
  tierra: { nombre: 'los del Llano', ataca: 'agua', rama: 'Los Sepultados', comandante: 'Kevin' },
  agua: { nombre: 'los del Jameo', ataca: 'planta', rama: 'La Marea', comandante: 'Guacimara' },
};

/** La inicial de tu rival: la del pueblo al que ataca el tuyo, que te gana en tipos. */
export function inicialDelRival(tuya: TipoInicial): TipoInicial {
  return PUEBLOS[tuya].ataca;
}

/** El pueblo cuya rama te persigue: el que ataca al tuyo. */
export function puebloQueTePersigue(tuya: TipoInicial): TipoInicial {
  return (Object.keys(PUEBLOS) as TipoInicial[]).find((p) => PUEBLOS[p].ataca === tuya)!;
}

/**
 * El tinte del uniforme de la rama de un pueblo: el color de su tipo (data/tipos.ts), en 0..1, para
 * multiplicar la ropa de la figura (la cabeza no se tiñe).
 */
export function colorUniforme(pueblo: TipoInicial): [number, number, number] {
  const hex = TIPOS.find((t) => t.id === pueblo)!.color;
  return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
}

/**
 * La especie con la que luchan los soldados de cada rama (provisional: las de relleno, hasta que
 * lleguen las criaturas del autor). La de Tierra no tiene de relleno: usa su inicial.
 */
export const ESPECIE_RAMA: Readonly<Record<TipoInicial, string>> = {
  planta: 'tabaiba-andante',
  infernal: 'chispa-de-colada',
  roca: 'lagartija-de-picon',
  tierra: 'inicial-tierra',
  agua: 'cangrejo-de-charco',
};
