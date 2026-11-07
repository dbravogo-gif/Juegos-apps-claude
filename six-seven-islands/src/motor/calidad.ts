// Niveles de calidad. El móvil empieza en «bajo» y el escritorio en «alto»; el panel de
// depuración permite cambiarlo en vivo. Presupuesto: .claude/skills/juego-3d/referencias/rendimiento.md

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

/** Nivel inicial: «bajo» si el puntero principal es un dedo, «alto» si es un ratón. */
export function nivelInicial(punteroGrueso: boolean): NivelCalidad {
  return punteroGrueso ? 'bajo' : 'alto';
}
