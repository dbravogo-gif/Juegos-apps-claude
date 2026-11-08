// Subsistema «personaje»: el jugador y los personajes de la isla, con formas simples (maqueta de
// F05; el generador de personajes llega en F12). Dibuja al jugador donde dice «partida»,
// interpolado entre pasos fijos, con un pequeño bote al andar. Los entrenadores enseñan su línea
// de visión en el suelo (ARTE.md, «Peligros»).

import {
  CapsuleGeometry,
  GreaterDepth,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicNodeMaterial,
  PlaneGeometry,
  SphereGeometry,
  Vector3,
  type BufferGeometry,
  type Material,
} from 'three/webgpu';
import { PASOS_POR_CASILLA, posicionVisual } from '../../core/explorar';
import { clave, deClave, enIsla, vision, type Direccion } from '../../core/mundo';
import { MaterialDiorama } from '../../arte/material';
import { COLORES } from '../../arte/paleta';
import { alturaSuelo } from '../../arte/escala';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Partida } from '../partida/partida';

const GIRO: Record<Direccion, number> = { s: 0, e: Math.PI / 2, n: Math.PI, o: -Math.PI / 2 };

export class Personaje implements Subsistema {
  static readonly id = 'personaje';
  static readonly deps: readonly string[] = ['render', 'partida'];

  /** Posición del jugador en el mundo, para la cámara. */
  readonly posicion = new Vector3();
  private partida!: Partida;
  private jugador = new Group();
  private giro = 0;
  private reloj = 0;
  private geometrias: BufferGeometry[] = [];
  private materiales: Material[] = [];
  private objetos: (Mesh | Group)[] = [];

  init(ctx: Ctx): void {
    this.partida = ctx.get<Partida>('partida');
    const m = this.partida.mundo;
    const mat = (color: string, contraluz = 0.35) => {
      const x = new MaterialDiorama({ color, bordes: [-0.25, 0.5], especular: 0.12, dureza: 16, contraluz });
      this.materiales.push(x);
      return x;
    };
    const cuerpo = new CapsuleGeometry(0.26, 0.42, 4, 10).translate(0, 0.47, 0);
    const cabeza = new SphereGeometry(0.27, 16, 12).translate(0, 1.0, 0);
    const nariz = new SphereGeometry(0.07, 8, 6).translate(0, 0.98, 0.26);
    this.geometrias.push(cuerpo, cabeza, nariz);

    // Jugador: figurita de cabeza grande con la ropa de su color (ARTE.md).
    const piel = mat('#F2C9A0');
    for (const [g, mt] of [
      [cuerpo, mat('#3A6EA5', 0.45)],
      [cabeza, piel],
      [nariz, piel],
    ] as const) {
      const malla = new Mesh(g, mt);
      malla.castShadow = true;
      this.jugador.add(malla);
    }
    // Silueta: solo se dibuja la parte del jugador que queda tapada (prueba de profundidad al
    // revés), para que siempre se vea por dónde se camina aunque haya una casa delante.
    const silueta = new MeshBasicNodeMaterial({ color: '#3A6EA5', transparent: true, opacity: 0.55, depthWrite: false });
    silueta.depthFunc = GreaterDepth;
    this.materiales.push(silueta);
    for (const g of [cuerpo, cabeza]) {
      // Un poco más grande que el jugador: así queda por delante de su propia superficie y solo
      // aparece donde algo lo tapa de verdad.
      const malla = new Mesh(g, silueta);
      malla.scale.setScalar(1.04);
      malla.renderOrder = 10;
      this.jugador.add(malla);
    }
    ctx.escena.add(this.jugador);
    this.objetos.push(this.jugador);

    // Personajes: lavanda los que solo hablan; rojo los entrenadores obligatorios, naranja los demás.
    const visiones: Matrix4[] = [];
    for (const z of m.zonas.values()) {
      for (const p of z.personajes) {
        const g = new Group();
        const color = p.entrenador ? (p.entrenador.obligatorio ? '#C0392B' : '#E67E22') : '#8E7CC3';
        for (const [geo, mt] of [
          [cuerpo, mat(color)],
          [cabeza, piel],
          [nariz, piel],
        ] as const) {
          const malla = new Mesh(geo, mt);
          malla.castShadow = true;
          g.add(malla);
        }
        const [x, y] = deClave(enIsla(m, z.id, p.x, p.y));
        g.position.set(x, alturaSuelo(m.casillas.get(enIsla(m, z.id, p.x, p.y))!.h), y);
        g.rotation.y = GIRO[p.mira];
        ctx.escena.add(g);
        this.objetos.push(g);
        for (const v of vision(m, z.id, p)) {
          const [vx, vy] = deClave(v);
          visiones.push(new Matrix4().makeTranslation(vx, alturaSuelo(m.casillas.get(v)!.h) + 0.14, vy));
        }
      }
    }
    if (visiones.length) {
      const plano = new PlaneGeometry(0.8, 0.8).rotateX(-Math.PI / 2);
      const mv = new MeshBasicNodeMaterial({ color: COLORES.acentoCoral, transparent: true, opacity: 0.35, depthWrite: false });
      this.geometrias.push(plano);
      this.materiales.push(mv);
      const im = new InstancedMesh(plano, mv, visiones.length);
      visiones.forEach((mt, i) => im.setMatrixAt(i, mt));
      im.computeBoundingSphere();
      ctx.escena.add(im);
      this.objetos.push(im as unknown as Mesh);
    }
    this.colocar(0, 0);
  }

  private colocar(dt: number, alfa: number): void {
    const m = this.partida.mundo;
    const e = this.partida.estado;
    const p = posicionVisual(e, alfa);
    const h0 = alturaSuelo(m.casillas.get(clave(e.desdeX, e.desdeY))?.h ?? 0);
    const h1 = alturaSuelo(m.casillas.get(clave(e.x, e.y))?.h ?? 0);
    const t = e.paso === 0 ? 1 : Math.min(1, (e.paso + alfa) / PASOS_POR_CASILLA);
    const andando = e.paso > 0;
    this.reloj += dt;
    const bote = andando ? Math.abs(Math.sin(this.reloj * 18)) * 0.08 : 0;
    this.posicion.set(p.x, h0 + (h1 - h0) * t, p.y);
    this.jugador.position.set(p.x, this.posicion.y + bote, p.y);
    // Giro suave hacia donde mira.
    let objetivo = GIRO[e.mira];
    while (objetivo - this.giro > Math.PI) objetivo -= Math.PI * 2;
    while (objetivo - this.giro < -Math.PI) objetivo += Math.PI * 2;
    this.giro += (objetivo - this.giro) * Math.min(1, dt * 18 || 1);
    this.jugador.rotation.y = this.giro;
  }

  actualizar(dt: number, ctx: Ctx): void {
    this.colocar(dt, ctx.tiempo.alfa);
  }

  dispose(): void {
    for (const o of this.objetos) o.removeFromParent();
    for (const g of this.geometrias) g.dispose();
    for (const m of this.materiales) m.dispose();
  }
}
