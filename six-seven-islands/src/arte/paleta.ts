// La paleta de ARTE.md. No se improvisan colores: todo lo que se pinta sale de aquí o de los
// colores de criatura de src/data/tipos.ts.

export const COLORES = {
  hierbaMenta: '#7ED6A5',
  arenaCaramelo: '#E8B878',
  acentoCoral: '#FF6B6B',
  sombraLavanda: '#6B7BB8',
  cieloMelocoton: '#FFD8B0',
  aguaTurquesa: '#3CC8D8',
  sol: '#FFE2B8',
  // Relleno del cielo, azul lavanda: es lo que queda en la sombra, así que la tiñe (ARTE.md).
  rellenoCielo: '#C4C6F2',
  // Derivados de los de arriba, para el kit del mundo y las caras de las criaturas.
  hierbaHonda: '#5BBF8A',
  maderaTostada: '#B98A5A',
  piedraLavanda: '#A9AFD6',
  espuma: '#E9FBF7',
  crema: '#FFF4E0',
  ojo: '#2B2340',
} as const;
