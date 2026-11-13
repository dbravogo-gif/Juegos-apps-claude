// Suavizado del movimiento entre pasos fijos (autor, 2026-11-13: «correr sigue un poco trabado»).
//
// La lógica avanza a 60 pasos fijos por segundo y la pantalla va a su ritmo. Antes se dibujaba
// adelantando la posición con la fracción del paso siguiente, pero al llegar a cada casilla (paso
// 0) no se adelantaba: un instante congelado por casilla. Encadenar el paso siguiente lo cambió
// por un salto. Aquí se hace lo estándar: guardar dónde quedó el jugador en los dos últimos pasos
// fijos y dibujarlo entre ellos. Va a velocidad constante con un retraso de 1/60 s, que no se nota.
// Puro y sin Three.js, para probarlo.

export interface Punto3 {
  x: number;
  y: number;
  z: number;
}

export class Suavizado {
  private antes: Punto3 | null = null;
  private ahora: Punto3 | null = null;

  /** `salto`: más distancia que esta entre dos pasos fijos (una puerta, aparecer) no se recorre. */
  constructor(private readonly salto = 2) {}

  /** Tras cada paso fijo: la posición exacta en que ha quedado. */
  paso(p: Punto3): void {
    const a = this.ahora;
    if (!a || Math.hypot(p.x - a.x, p.y - a.y, p.z - a.z) > this.salto) {
      this.antes = { ...p };
      this.ahora = { ...p };
      return;
    }
    this.antes = a;
    this.ahora = { ...p };
  }

  /** Dónde dibujarlo: entre los dos últimos pasos fijos, según `alfa` (de 0 a 1). Null si aún no hay. */
  en(alfa: number): Punto3 | null {
    const a = this.antes;
    const b = this.ahora;
    if (!a || !b) return null;
    const t = Math.max(0, Math.min(1, alfa));
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
  }
}
