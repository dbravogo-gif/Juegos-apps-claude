// Subsistema «entrada»: el teclado, que es el único control del juego (sin ratón ni mando).
// Flechas o WASD para andar; E, Enter o Espacio para interactuar (hablar, pasar los diálogos y
// confirmar); Escape para volver.
// Un toque corto cuenta como un paso aunque se suelte antes de que el juego lo lea, y aunque
// llegue mientras el jugador termina el paso anterior: así no se pierde ninguno.

import type { Direccion } from '../../core/mundo';
import type { Ctx, Subsistema } from '../../motor/motor';

export type Accion = 'confirmar' | 'cancelar';

const DIRECCIONES: Record<string, Direccion> = {
  ArrowUp: 'n',
  ArrowDown: 's',
  ArrowRight: 'e',
  ArrowLeft: 'o',
  KeyW: 'n',
  KeyS: 's',
  KeyD: 'e',
  KeyA: 'o',
};
const ACCIONES: Record<string, Accion> = {
  KeyE: 'confirmar',
  Enter: 'confirmar',
  NumpadEnter: 'confirmar',
  Space: 'confirmar',
  Escape: 'cancelar',
  Backspace: 'cancelar',
};

export class Entrada implements Subsistema {
  static readonly id = 'entrada';
  static readonly deps: readonly string[] = [];

  /** Direcciones pulsadas, la más reciente al final. */
  private pulsadas: Direccion[] = [];
  /** Un toque que aún no se ha leído. */
  private toque: Direccion | null = null;
  private pendientes = new Set<Accion>();
  private quitar: (() => void) | null = null;

  init(_ctx: Ctx): void {
    const abajo = (ev: KeyboardEvent) => {
      const d = DIRECCIONES[ev.code];
      const a = ACCIONES[ev.code];
      if (!d && !a) return;
      ev.preventDefault();
      if (ev.repeat) return;
      if (d) {
        this.pulsadas = this.pulsadas.filter((x) => x !== d);
        this.pulsadas.push(d);
        this.toque = d;
      }
      if (a) this.pendientes.add(a);
    };
    const arriba = (ev: KeyboardEvent) => {
      const d = DIRECCIONES[ev.code];
      if (d) this.pulsadas = this.pulsadas.filter((x) => x !== d);
    };
    const soltarTodo = () => {
      this.pulsadas = [];
    };
    window.addEventListener('keydown', abajo);
    window.addEventListener('keyup', arriba);
    window.addEventListener('blur', soltarTodo);
    this.quitar = () => {
      window.removeEventListener('keydown', abajo);
      window.removeEventListener('keyup', arriba);
      window.removeEventListener('blur', soltarTodo);
    };
  }

  /**
   * La dirección que manda ahora: la última pulsada que sigue apretada, o un toque sin usar.
   * Con `usarToque` a false (el jugador aún termina un paso), el toque se guarda para después.
   */
  direccion(usarToque = true): Direccion | null {
    const d = this.pulsadas[this.pulsadas.length - 1] ?? this.toque;
    if (usarToque) this.toque = null;
    return d;
  }

  /** Una pulsación nueva de dirección (no las que se mantienen), para elegir en los menús. */
  pulsacion(): Direccion | null {
    const d = this.toque;
    this.toque = null;
    return d;
  }

  /** ¿Se ha pulsado esta acción desde la última vez que se preguntó? */
  consumir(a: Accion): boolean {
    return this.pendientes.delete(a);
  }

  /** Olvida lo pulsado (al cambiar de modo, para que no se cuele una pulsación vieja). */
  olvidar(): void {
    this.pendientes.clear();
    this.toque = null;
  }

  dispose(): void {
    this.quitar?.();
  }
}
