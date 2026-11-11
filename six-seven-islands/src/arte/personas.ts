// Las personas de Meshy (autor, 2026-11-11): el jugador y algunos personajes, hechos por el autor
// a partir de un dibujo. Como las criaturas, llevan la luz pintada en la textura y se dibujan sin
// la del juego. Los demás personajes siguen con los de KayKit hasta que lleguen los suyos. Cada
// amigo tendrá su persona: por eso no hace falta personalizar al protagonista.

export interface DefPersona {
  /** Dentro de public/modelos. */
  archivo: string;
  /**
   * El clip con el que se mueve y lo rápido que va su pie apoyado, en metros por segundo a su
   * tamaño de Meshy: con eso se acelera el clip para que los pies no patinen a la velocidad del
   * jugador. Medido con la cinemática del esqueleto (Running de Dani: 4,1 m/s; Walking: 1,4).
   */
  mover?: { clip: string; pie: number };
  /** La postura de parado: un fotograma de un clip, mientras el modelo no traiga uno propio. */
  parado?: { clip: string; fotograma: number };
}

export const PERSONAS = {
  // Corre: el jugador va a unas 5,5 casillas por segundo, que es paso de carrera. El fotograma 0
  // del andar tiene los pies juntos (uno, 7 cm en el aire): hace de «parado» hasta tener uno.
  dani: { archivo: 'personas/dani.glb', mover: { clip: 'Running', pie: 4.1 }, parado: { clip: 'Walking', fotograma: 0 } },
  pescador: { archivo: 'personas/pescador.glb' },
  informatico: { archivo: 'personas/informatico.glb' },
} as const satisfies Record<string, DefPersona>;

export type NombrePersona = keyof typeof PERSONAS;

/** El jugador. Cuando lleguen los amigos, cada uno elegirá el suyo. */
export const PERSONA_JUGADOR: NombrePersona = 'dani';

/** Qué personajes de la isla y de los interiores llevan una persona de Meshy, por su id. */
export const PERSONA_DE: Readonly<Record<string, NombrePersona>> = {
  informatico: 'informatico',
  'pescador-famara': 'pescador',
};
