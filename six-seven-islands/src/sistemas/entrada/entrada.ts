// Subsistema «entrada»: el teclado, que es el único control del juego (sin ratón ni mando).
// Como una consola (autor, 2026-11-19): flechas para andar y elegir; A (o E, Enter, Espacio) para
// confirmar; Z (o Esc) para abrir el menú; X (o Retroceso) para volver, como el botón B. En los
// menús, Z y Esc también vuelven. Del 1 al 9, atajo a una opción del menú de combate.
// WASD ya no anda: la A es confirmar.
// Un toque corto cuenta como un paso aunque se suelte antes de que el juego lo lea, y aunque
// llegue mientras el jugador termina el paso anterior: así no se pierde ninguno.

import type { Direccion } from '../../core/mundo';
import type { Ctx, Subsistema } from '../../motor/motor';

/**
 * `menu`: abre el menú al explorar; en todo lo demás vale lo mismo que `cancelar`.
 * `tabla`: la T, que en combate abre la tabla de tipos (autor, 2026-11-15).
 */
export type Accion = 'confirmar' | 'cancelar' | 'menu' | 'tabla';

export const DIRECCIONES: Readonly<Record<string, Direccion>> = {
  ArrowUp: 'n',
  ArrowDown: 's',
  ArrowRight: 'e',
  ArrowLeft: 'o',
};
export const ACCIONES: Readonly<Record<string, Accion>> = {
  KeyA: 'confirmar',
  KeyE: 'confirmar',
  Enter: 'confirmar',
  NumpadEnter: 'confirmar',
  Space: 'confirmar',
  KeyZ: 'menu',
  Escape: 'menu',
  KeyX: 'cancelar',
  Backspace: 'cancelar',
  KeyT: 'tabla',
};

export class Entrada implements Subsistema {
  static readonly id = 'entrada';
  static readonly deps: readonly string[] = [];

  /** Direcciones pulsadas, la más reciente al final. */
  private pulsadas: Direccion[] = [];
  /** Un toque que aún no se ha leído. */
  private toque: Direccion | null = null;
  /** El toque viene de la repetición del teclado (tecla mantenida): se borra al soltarla. */
  private toqueRepetido = false;
  private pendientes = new Set<Accion>();
  /** Un número pulsado (del 1 al 9, como índice desde 0) que aún no se ha leído. */
  private numero: number | null = null;
  private quitar: (() => void) | null = null;

  init(_ctx: Ctx): void {
    const abajo = (ev: KeyboardEvent) => {
      // En un cuadro de texto (importar la partida) se escribe: el juego no lee esas teclas.
      if ((ev.target as HTMLElement | null)?.closest?.('input, textarea')) return;
      const d = DIRECCIONES[ev.code];
      const a = ACCIONES[ev.code];
      const n = /^(?:Digit|Numpad)([1-9])$/.exec(ev.code);
      if (n && !ev.repeat) this.numero = Number(n[1]) - 1;
      if (!d && !a) return;
      ev.preventDefault();
      if (ev.repeat) {
        // Mantener una flecha repite en los menús (pulsacion); al andar no cambia nada, porque
        // manda la tecla apretada, y al soltarla se borra para no dar un paso de más.
        if (d) {
          this.toque = d;
          this.toqueRepetido = true;
        }
        return;
      }
      if (d) {
        this.toqueRepetido = false;
        this.pulsadas = this.pulsadas.filter((x) => x !== d);
        this.pulsadas.push(d);
        this.toque = d;
      }
      if (a) this.pendientes.add(a);
    };
    const arriba = (ev: KeyboardEvent) => {
      const d = DIRECCIONES[ev.code];
      if (d) this.pulsadas = this.pulsadas.filter((x) => x !== d);
      if (d && this.toqueRepetido && this.toque === d) {
        this.toque = null;
        this.toqueRepetido = false;
      }
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

  /**
   * ¿Se ha pulsado esta acción desde la última vez que se preguntó? `cancelar` también se lleva
   * la de `menu` (Z o Esc vuelven en los menús); `menu` solo la suya.
   */
  consumir(a: Accion): boolean {
    if (a !== 'cancelar') return this.pendientes.delete(a);
    const menu = this.pendientes.delete('menu');
    return this.pendientes.delete('cancelar') || menu;
  }

  /** El número pulsado desde la última vez (0 para el 1), o null. */
  consumirNumero(): number | null {
    const n = this.numero;
    this.numero = null;
    return n;
  }

  /** Olvida lo pulsado (al cambiar de modo, para que no se cuele una pulsación vieja). */
  olvidar(): void {
    this.pendientes.clear();
    this.toque = null;
    this.numero = null;
  }

  dispose(): void {
    this.quitar?.();
  }
}
