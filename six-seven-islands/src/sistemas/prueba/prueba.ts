// Subsistema «prueba», TEMPORAL: una isla de formas simples para comprobar el andamiaje (render,
// sombras, niebla, contadores y capturas). Desaparece cuando lleguen «mundo» y «camara» (F05).

import {
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
  type BufferGeometry,
  type Material,
} from 'three/webgpu';
import type { Ctx, Subsistema } from '../../motor/motor';
import { COLORES } from '../render/render';

export class Prueba implements Subsistema {
  static readonly id = 'prueba';
  static readonly deps: readonly string[] = ['render'];

  private geometrias: BufferGeometry[] = [];
  private materiales: Material[] = [];
  private mallas: Mesh[] = [];

  init(ctx: Ctx): void {
    const lambert = (color: string) => {
      const m = new MeshLambertMaterial({ color });
      this.materiales.push(m);
      return m;
    };
    const malla = (g: BufferGeometry, m: Material | Material[], x = 0, y = 0, z = 0) => {
      this.geometrias.push(g);
      const me = new Mesh(g, m);
      me.position.set(x, y, z);
      me.castShadow = true;
      me.receiveShadow = true;
      ctx.escena.add(me);
      this.mallas.push(me);
      return me;
    };

    const hierba = lambert(COLORES.hierbaMenta);
    const arena = lambert(COLORES.arenaCaramelo);
    // Isla: cilindro con el canto de arena y la cara de arriba de hierba.
    malla(new CylinderGeometry(9, 8.4, 2, 48), [arena, hierba, arena], 0, -1, 0);
    const mar = malla(new CircleGeometry(120, 48), lambert(COLORES.aguaTurquesa), 0, -1.6, 0);
    mar.rotation.x = -Math.PI / 2;
    mar.castShadow = false;

    // Unos árboles y una «criatura» de marcador.
    const tronco = lambert(COLORES.arenaCaramelo);
    const copa = lambert('#5DBB8A');
    for (const [x, z, s] of [
      [-4, -3, 1.2],
      [-5.5, 1, 0.9],
      [3.5, -4.5, 1],
      [5.5, 2.5, 1.3],
    ]) {
      malla(new CylinderGeometry(0.18 * s, 0.25 * s, 1.2 * s, 8), tronco, x, 0.6 * s, z);
      malla(new ConeGeometry(1.1 * s, 2.4 * s, 10), copa, x, 2.2 * s, z);
    }
    malla(new SphereGeometry(0.8, 24, 16), lambert(COLORES.acentoCoral), 0.5, 0.8, 1);

    // Cámara de diorama: alta (~50°) y con lente larga (30°).
    const camara = ctx.camara;
    camara.fov = 30;
    camara.near = 0.5;
    camara.far = 200;
    const distancia = 42;
    const elevacion = (50 * Math.PI) / 180;
    camara.position.set(0, Math.sin(elevacion) * distancia, Math.cos(elevacion) * distancia);
    camara.lookAt(0, 0, 0);
    camara.updateProjectionMatrix();
  }

  dispose(): void {
    for (const m of this.mallas) m.removeFromParent();
    for (const g of this.geometrias) g.dispose();
    for (const m of this.materiales) m.dispose();
  }
}
