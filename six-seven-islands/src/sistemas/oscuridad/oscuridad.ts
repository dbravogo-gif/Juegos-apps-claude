// Subsistema «oscuridad»: las salas a oscuras (el gimnasio Eléctrico; autor, 2026-11-22). Una capa
// negra sobre el juego, por debajo de la interfaz, con un círculo de luz alrededor del jugador, y un
// relámpago cada pocos segundos que lo enseña todo un instante, con su trueno. Solo se ve: el mundo
// y sus reglas son los de siempre. Al entrar cae uno enseguida, para ver la sala.

import { Vector3 } from 'three/webgpu';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Partida } from '../partida/partida';
import type { Personaje } from '../personaje/personaje';

/** Segundos entre relámpagos: una serie fija que se repite, para que no caigan a compás. */
export const ENTRE_RAYOS = [3.4, 2.6, 4.2, 3.0, 2.2, 3.8, 1.2, 3.6] as const;
/** Lo que se ve con cada relámpago (s): todo a la vista y después se apaga poco a poco. */
const VISTO = 0.25;
const APAGANDO = 0.55;
/** El radio de luz alrededor del jugador, en píxeles a 800 de alto (se escala con la ventana). */
const RADIO = 85;

/**
 * Lo opaca que está la oscuridad (0, todo a la vista; 1, negra) según el tiempo desde el último
 * relámpago. Pura, para probarla.
 */
export function opacidadTrasRayo(t: number): number {
  if (t < VISTO) return 0;
  return Math.min(1, (t - VISTO) / APAGANDO);
}

export class Oscuridad implements Subsistema {
  static readonly id = 'oscuridad';
  static readonly deps: readonly string[] = ['partida', 'personaje'];

  private partida!: Partida;
  private personaje!: Personaje;
  private capa!: HTMLDivElement;
  private dentro: string | null = null;
  private hastaRayo = 0;
  private desdeRayo = 99;
  private n = 0;
  private quitar: (() => void) | null = null;
  private punto = new Vector3();

  init(ctx: Ctx): void {
    this.partida = ctx.get<Partida>('partida');
    this.personaje = ctx.get<Personaje>('personaje');
    this.capa = document.createElement('div');
    this.capa.className = 'oscuridad';
    this.capa.hidden = true;
    document.body.append(this.capa);
    this.quitar = () => this.capa.remove();
  }

  actualizar(dt: number, ctx: Ctx): void {
    const sala = this.partida.estado.dentro ?? null;
    const modo = this.partida.modo;
    const oscura = !!sala && modo !== 'combate' && modo !== 'titulo' && this.partida.datos.interiores.some((d) => d.id === sala && d.oscura);
    this.capa.hidden = !oscura;
    if (!oscura) {
      this.dentro = null;
      return;
    }
    if (this.dentro !== sala) {
      // Recién entrado: un relámpago enseguida.
      this.dentro = sala;
      this.hastaRayo = 0.5;
      this.desdeRayo = 99;
    }
    this.hastaRayo -= dt;
    this.desdeRayo += dt;
    if (this.hastaRayo <= 0) {
      this.hastaRayo = ENTRE_RAYOS[this.n++ % ENTRE_RAYOS.length]!;
      this.desdeRayo = 0;
      ctx.eventos.emit('sonido:tocar', { nombre: 'rayo' });
    }
    const a = opacidadTrasRayo(this.desdeRayo);
    // El círculo de luz, centrado en el jugador visto por la cámara (a media altura del cuerpo).
    this.punto.copy(this.personaje.posicionJugador()).setY(this.punto.y + 0.5).project(ctx.camara);
    const x = (this.punto.x * 0.5 + 0.5) * innerWidth;
    const y = (-this.punto.y * 0.5 + 0.5) * innerHeight;
    const r = (RADIO * innerHeight) / 800;
    const negro = `rgba(6, 7, 16, ${(0.97 * a).toFixed(3)})`;
    // El fogonazo: un velo blanco azulado las primeras centésimas.
    const blanco = this.desdeRayo < 0.09 ? ', rgba(235, 240, 255, 0.55)' : '';
    this.capa.style.background = `radial-gradient(circle at ${x.toFixed(0)}px ${y.toFixed(0)}px, rgba(6, 7, 16, 0) ${(r * 0.45).toFixed(0)}px, ${negro} ${r.toFixed(0)}px)${blanco}`;
  }

  dispose(): void {
    this.quitar?.();
  }
}
