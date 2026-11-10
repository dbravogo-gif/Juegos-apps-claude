// El rastro del jugador: los puntos por donde ha pasado, para que la compañera vaya detrás por el
// mismo camino. Puro y sin Three.js, para probarlo.

export interface Punto {
  x: number;
  y: number;
  z: number;
}

/** Distancia mínima entre puntos guardados. */
const PASO = 0.05;
/** Lo que se guarda de rastro, de sobra para ir una casilla detrás. */
const LARGO = 4;

export class Rastro {
  private puntos: Punto[] = [];

  get vacio(): boolean {
    return this.puntos.length === 0;
  }

  /** El último punto guardado. */
  ultimo(): Punto | undefined {
    return this.puntos[this.puntos.length - 1];
  }

  /** Empieza de cero con el rastro de `desde` a `hasta` (al aparecer o tras un salto). */
  reiniciar(desde: Punto, hasta: Punto): void {
    this.puntos = [{ ...desde }, { ...hasta }];
  }

  /** Añade la posición del jugador si se ha movido lo bastante, y recorta lo viejo. */
  anadir(p: Punto): void {
    const u = this.ultimo();
    if (u && Math.hypot(p.x - u.x, p.z - u.z) < PASO) return;
    this.puntos.push({ ...p });
    let largo = 0;
    for (let i = this.puntos.length - 1; i > 0; i--) {
      largo += distancia(this.puntos[i], this.puntos[i - 1]);
      if (largo > LARGO) {
        this.puntos.splice(0, i - 1);
        break;
      }
    }
  }

  /** El punto del rastro a `d` de distancia por detrás de `actual` (la posición del jugador ahora). */
  atras(actual: Punto, d: number): Punto {
    let resto = d;
    let a: Punto = actual;
    for (let i = this.puntos.length - 1; i >= 0; i--) {
      const b = this.puntos[i];
      const tramo = distancia(a, b);
      if (tramo >= resto && tramo > 0) {
        const t = resto / tramo;
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
      }
      resto -= tramo;
      a = b;
    }
    return { ...(this.puntos[0] ?? actual) };
  }
}

function distancia(a: Punto, b: Punto): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}
