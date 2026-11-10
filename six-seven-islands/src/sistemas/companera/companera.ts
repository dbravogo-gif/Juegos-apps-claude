// Subsistema «companera»: la inicial elegida va detrás del jugador por la isla y por los
// interiores, por su mismo camino y a una casilla (autor, 2026-11-10). Es el modelo de Meshy con
// su luz pintada (src/arte/criaturas3d.ts). Lee «partida» y «personaje»; no cambia nada.

import { type Group } from 'three/webgpu';
import { MODELO_INICIAL, figuraCriatura } from '../../arte/criaturas3d';
import type { Direccion } from '../../core/mundo';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Partida } from '../partida/partida';
import type { Personaje } from '../personaje/personaje';
import { Rastro, type Punto } from './rastro';

/** A cuánto va detrás del jugador, en casillas. */
const DISTANCIA = 1;
/** Tamaño de las primeras formas, más pequeñas que las personas (1,25). */
export const TAMANO_COMPANERA = 0.6;
/** Un salto más largo que esto (entrar en una sala, aparecer) recoloca a la compañera detrás. */
const SALTO = 2.5;
const DETRAS: Record<Direccion, [number, number]> = { n: [0, 1], s: [0, -1], e: [-1, 0], o: [1, 0] };

export class Companera implements Subsistema {
  static readonly id = 'companera';
  static readonly deps: readonly string[] = ['render', 'partida', 'personaje'];

  private partida!: Partida;
  private personaje!: Personaje;
  private ctx!: Ctx;
  private figura: Group | null = null;
  private cargada: string | null = null;
  private pedida: string | null = null;
  private rastro = new Rastro();
  private anterior: Punto | null = null;
  private giro = 0;
  private reloj = 0;
  private marcha = 0;

  init(ctx: Ctx): void {
    this.ctx = ctx;
    this.partida = ctx.get<Partida>('partida');
    this.personaje = ctx.get<Personaje>('personaje');
  }

  /** Carga el modelo de la inicial si cambia (al elegirla en el museo). */
  private preparar(inicial: string): void {
    if (this.pedida === inicial) return;
    this.pedida = inicial;
    const modelo = MODELO_INICIAL[inicial];
    if (!modelo) return;
    void figuraCriatura(modelo, 'color', TAMANO_COMPANERA).then((f) => {
      if (this.pedida !== inicial) return;
      this.figura?.removeFromParent();
      this.figura = f;
      this.cargada = inicial;
      this.rastro = new Rastro();
      this.ctx.escena.add(f);
    });
  }

  actualizar(dt: number): void {
    const inicial = this.partida.estado.inicial;
    if (inicial) this.preparar(inicial);
    const f = this.figura;
    if (!f) return;
    f.visible = !!inicial && this.cargada === inicial && this.partida.modo !== 'combate';
    if (!f.visible) return;

    const p = this.personaje.posicion;
    const actual = { x: p.x, y: p.y, z: p.z };
    const u = this.rastro.ultimo();
    if (this.rastro.vacio || !u || Math.hypot(actual.x - u.x, actual.z - u.z) > SALTO) {
      const [dx, dz] = DETRAS[this.partida.estado.mira];
      this.rastro.reiniciar({ x: actual.x + dx * DISTANCIA, y: actual.y, z: actual.z + dz * DISTANCIA }, actual);
      this.anterior = null;
    }
    this.rastro.anadir(actual);
    const q = this.rastro.atras(actual, DISTANCIA);

    // Mira hacia donde anda; parada, sigue mirando igual.
    const a = this.anterior;
    const movida = a ? Math.hypot(q.x - a.x, q.z - a.z) : 0;
    if (a && movida > 0.002) {
      let objetivo = Math.atan2(q.x - a.x, q.z - a.z);
      while (objetivo - this.giro > Math.PI) objetivo -= Math.PI * 2;
      while (objetivo - this.giro < -Math.PI) objetivo += Math.PI * 2;
      this.giro += (objetivo - this.giro) * Math.min(1, dt * 12);
    }
    this.anterior = q;
    // Saltitos al andar y una respiración suave parada.
    this.reloj += dt;
    this.marcha += ((movida > 0.002 ? 1 : 0) - this.marcha) * Math.min(1, dt * 10);
    const salto = Math.abs(Math.sin(this.reloj * 11)) * 0.07 * this.marcha;
    const respira = 1 + Math.sin(this.reloj * 2.2) * 0.02 * (1 - this.marcha);
    f.position.set(q.x, q.y + salto, q.z);
    f.rotation.y = this.giro;
    f.scale.set(1, respira, 1);
  }

  dispose(): void {
    this.figura?.removeFromParent();
  }
}
