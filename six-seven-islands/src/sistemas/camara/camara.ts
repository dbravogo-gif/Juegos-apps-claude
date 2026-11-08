// Subsistema «camara»: la cámara de diorama de ARTE.md. Alta (50°) y con lente larga (30°),
// sigue al jugador con suavidad y no gira nunca. A esa distancia el jugador mide en torno al 9 %
// del alto de la pantalla. También le dice al render dónde está la acción, para que la sombra
// del sol cubra esa parte de la isla.

import { Vector3 } from 'three/webgpu';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Personaje } from '../personaje/personaje';
import type { Render } from '../render/render';

const ELEVACION = (50 * Math.PI) / 180;
const DISTANCIA = 20;
const CAMPO = 30;

export class Camara implements Subsistema {
  static readonly id = 'camara';
  static readonly deps: readonly string[] = ['render', 'personaje'];

  private personaje!: Personaje;
  private render!: Render;
  private mira = new Vector3();
  private objetivo = new Vector3();
  private desplazamiento = new Vector3(0, Math.sin(ELEVACION) * DISTANCIA, Math.cos(ELEVACION) * DISTANCIA);

  init(ctx: Ctx): void {
    this.personaje = ctx.get<Personaje>('personaje');
    this.render = ctx.get<Render>('render');
    const c = ctx.camara;
    c.fov = CAMPO;
    c.near = 1;
    c.far = 160;
    c.updateProjectionMatrix();
    this.mira.copy(this.personaje.posicion);
    this.colocar(ctx);
  }

  private colocar(ctx: Ctx): void {
    ctx.camara.position.copy(this.mira).add(this.desplazamiento);
    ctx.camara.lookAt(this.mira);
    this.render.enfocar(this.mira.x, this.mira.y, this.mira.z);
  }

  actualizar(dt: number, ctx: Ctx): void {
    this.objetivo.copy(this.personaje.posicion);
    this.mira.lerp(this.objetivo, 1 - Math.exp(-dt * 8));
    this.colocar(ctx);
  }

  dispose(): void {}
}
