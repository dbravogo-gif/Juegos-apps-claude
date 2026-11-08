// Niveles de calidad. El juego es solo para ordenador (portátiles, algunos Mac con pantalla de
// densidad 2): empieza en «medio» hasta medir en sus equipos; el panel de depuración y ?calidad
// permiten cambiarlo. Presupuesto: .claude/skills/juego-3d/referencias/rendimiento.md

export type NivelCalidad = 'bajo' | 'medio' | 'alto';

export interface Calidad {
  nivel: NivelCalidad;
  /** Densidad de píxeles máxima. El iPhone tiene 3; nunca se pasa de 2. */
  densidadMax: number;
  /** Lado del mapa de sombras de la única luz con sombra. */
  sombras: number;
  /** Brillo solo en lo emisivo: sin, a media resolución o completo. */
  bloom: 'no' | 'media' | 'completo';
  /** Desenfoque de profundidad real del efecto miniatura: solo en escritorio. */
  desenfoque: boolean;
}

export const CALIDADES: Record<NivelCalidad, Calidad> = {
  bajo: { nivel: 'bajo', densidadMax: 1.5, sombras: 1024, bloom: 'no', desenfoque: false },
  medio: { nivel: 'medio', densidadMax: 2, sombras: 1024, bloom: 'media', desenfoque: false },
  alto: { nivel: 'alto', densidadMax: 2, sombras: 2048, bloom: 'completo', desenfoque: true },
};

/**
 * Nivel inicial: «medio». Son portátiles que mueven juegos ligeros, a menudo con gráfica integrada
 * y pantalla de densidad 2. Se revisa cuando se midan los FPS en sus equipos.
 */
export function nivelInicial(): NivelCalidad {
  return 'medio';
}
