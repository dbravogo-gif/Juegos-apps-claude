// Subsistema «camara»: la cámara de diorama de ARTE.md. Alta (50°) y con lente larga (30°),
// sigue al jugador con suavidad y no gira nunca. A esa distancia el jugador mide en torno al 9 %
// del alto de la pantalla. También le dice al render dónde está la acción, para que la sombra
// del sol cubra esa parte de la isla.
//
// Dentro de un interior encuadra la sala entera, quieta, en vez de seguir al jugador. Al hablar
// con alguien se acerca y sube a 72°, entre los dos: a 50°, el jugador, que habla desde el sur,
// tapaba a quien tenía delante (probador, 2026-11-08).

import { Vector3 } from 'three/webgpu';
import { deClave } from '../../core/mundo';
import { alturaSuelo } from '../../arte/escala';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Partida } from '../partida/partida';
import type { Personaje } from '../personaje/personaje';
import type { Render } from '../render/render';

const GRADO = Math.PI / 180;
const ELEVACION = 50 * GRADO;
const DISTANCIA = 20;
/** Al hablar: más alta y más cerca. */
const ELEVACION_DIALOGO = 72 * GRADO;
const DISTANCIA_DIALOGO = 14;
/** Distancia a partir de la cual la cámara corta en vez de seguir al jugador. */
const SALTO = 12;
const CAMPO = 30;

export class Camara implements Subsistema {
  static readonly id = 'camara';
  static readonly deps: readonly string[] = ['render', 'partida', 'personaje'];

  private personaje!: Personaje;
  private partida!: Partida;
  private render!: Render;
  private mira = new Vector3();
  private objetivo = new Vector3();
  private elevacion = ELEVACION;
  private distancia = DISTANCIA;
  /** Con quién se habla ahora, si tiene figura. */
  private hablante: string | null = null;
  /** El centro de cada sala, para encuadrarla. */
  private centros = new Map<string, Vector3>();
  private quitar: (() => void)[] = [];

  init(ctx: Ctx): void {
    this.personaje = ctx.get<Personaje>('personaje');
    this.partida = ctx.get<Partida>('partida');
    this.render = ctx.get<Render>('render');
    for (const [id, sala] of this.partida.interiores) {
      const c = new Vector3();
      for (const k of sala.casillas.keys()) {
        const [x, y] = deClave(k);
        c.x += x;
        c.z += y;
      }
      c.divideScalar(sala.casillas.size);
      c.y = alturaSuelo(0);
      this.centros.set(id, c);
    }
    const c = ctx.camara;
    c.fov = CAMPO;
    c.near = 1;
    c.far = 160;
    c.updateProjectionMatrix();
    this.quitar.push(
      ctx.eventos.on('dialogo:abrir', ({ guionId }) => (this.hablante = this.personaje.posicionDe(guionId) ? guionId : null)),
      ctx.eventos.on('dialogo:cerrar', () => (this.hablante = null)),
    );
    this.apuntar();
    this.mira.copy(this.objetivo);
    this.colocar(ctx);
  }

  /** A dónde mira la cámara ahora: los dos que hablan, la sala o el jugador. */
  private apuntar(): void {
    const quien = this.hablante ? this.personaje.posicionDe(this.hablante) : null;
    const dentro = this.partida.estado.dentro;
    if (quien) this.objetivo.copy(this.personaje.posicion).add(quien).multiplyScalar(0.5);
    else if (dentro) this.objetivo.copy(this.centros.get(dentro)!);
    else this.objetivo.copy(this.personaje.posicion);
  }

  private colocar(ctx: Ctx): void {
    ctx.camara.position.set(this.mira.x, this.mira.y + Math.sin(this.elevacion) * this.distancia, this.mira.z + Math.cos(this.elevacion) * this.distancia);
    ctx.camara.lookAt(this.mira);
    this.render.enfocar(this.mira.x, this.mira.y, this.mira.z);
  }

  actualizar(dt: number, ctx: Ctx): void {
    // En combate, la cámara la coloca «combate», quieta ante la arena.
    if (this.partida.modo === 'combate') return;
    this.apuntar();
    const k = 1 - Math.exp(-dt * 8);
    // Un salto largo (entrar en un interior, que está lejos de la isla) no se recorre: se corta.
    if (this.mira.distanceTo(this.objetivo) > SALTO) this.mira.copy(this.objetivo);
    else this.mira.lerp(this.objetivo, k);
    const hablando = this.hablante !== null;
    this.elevacion += ((hablando ? ELEVACION_DIALOGO : ELEVACION) - this.elevacion) * k;
    this.distancia += ((hablando ? DISTANCIA_DIALOGO : DISTANCIA) - this.distancia) * k;
    this.colocar(ctx);
  }

  dispose(): void {
    for (const q of this.quitar) q();
  }
}
