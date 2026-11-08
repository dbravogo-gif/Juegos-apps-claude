// Subsistema «mundo»: la isla en 3D con formas simples (maqueta de F05). Terreno en terrazas por
// alturas, mar, edificios, decoración instanciada, pasos cerrados y objetos en el suelo. Lee el
// estado de «partida» para abrir los pasos y quitar los objetos recogidos; no lo cambia.

import { BoxGeometry, InstancedMesh, Matrix4, Mesh, PlaneGeometry, SphereGeometry, type BufferGeometry, type Material } from 'three/webgpu';
import { attribute } from 'three/tsl';
import { clave, deClave } from '../../core/mundo';
import { MaterialDiorama, sueloY } from '../../arte/material';
import { COLORES } from '../../arte/paleta';
import { NIVEL_MAR, alturaSuelo } from '../../arte/escala';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Partida } from '../partida/partida';
import { cumbres, decoracion, geometriaEdificios, geometriaTerreno } from './terreno';

const OCULTA = new Matrix4().makeScale(0, 0, 0);

export class Mundo implements Subsistema {
  static readonly id = 'mundo';
  static readonly deps: readonly string[] = ['render', 'partida'];

  private partida!: Partida;
  private geometrias: BufferGeometry[] = [];
  private materiales: Material[] = [];
  private mallas: Mesh[] = [];
  private pasos: { malla: InstancedMesh; zonas: string[]; matrices: Matrix4[] } | null = null;
  private objetos: { malla: InstancedMesh; ids: string[]; matrices: Matrix4[] } | null = null;
  private vistoCondiciones = -1;
  private vistoRecogidos = -1;

  init(ctx: Ctx): void {
    this.partida = ctx.get<Partida>('partida');
    const m = this.partida.mundo;
    sueloY.value = alturaSuelo(0);

    const conColor = (op: ConstructorParameters<typeof MaterialDiorama>[0] = {}) => {
      const mat = new MaterialDiorama({ bordes: [-0.02, 0.32], rebote: 0.1, ...op }, attribute('color', 'vec3'));
      this.materiales.push(mat);
      return mat;
    };
    const liso = (color: string, op: ConstructorParameters<typeof MaterialDiorama>[0] = {}) => {
      const mat = new MaterialDiorama({ color, bordes: [-0.02, 0.32], rebote: 0.1, ...op });
      this.materiales.push(mat);
      return mat;
    };
    const anadir = (malla: Mesh, sombra = true) => {
      malla.castShadow = sombra;
      malla.receiveShadow = true;
      ctx.escena.add(malla);
      this.mallas.push(malla);
      this.geometrias.push(malla.geometry);
      return malla;
    };

    // Terreno y cumbres en una sola malla; edificios en otra.
    anadir(new Mesh(geometriaTerreno(m, cumbres(m)), conColor()));
    anadir(new Mesh(geometriaEdificios(m), conColor({ especular: 0.05 })));

    // El mar, bajo toda la isla y alrededor.
    const mar = new Mesh(new PlaneGeometry(m.ancho + 160, m.alto + 160), liso(COLORES.aguaTurquesa, { rebote: 0 }));
    mar.rotation.x = -Math.PI / 2;
    mar.position.set(m.ancho / 2, NIVEL_MAR, m.alto / 2);
    anadir(mar, false);

    // Decoración repetida: una malla instanciada por pieza y zona (las zonas que no se ven se
    // descartan enteras). Las geometrías se comparten entre zonas; se liberan una vez.
    const materialesDeco = new Map<string, MaterialDiorama>();
    for (const d of decoracion(m)) {
      if (!materialesDeco.has(d.color)) materialesDeco.set(d.color, liso(d.color));
      const im = new InstancedMesh(d.geometria, materialesDeco.get(d.color)!, d.matrices.length);
      d.matrices.forEach((mat, i) => im.setMatrixAt(i, mat));
      im.computeBoundingSphere();
      im.castShadow = true;
      im.receiveShadow = true;
      ctx.escena.add(im);
      this.mallas.push(im);
      if (!this.geometrias.includes(d.geometria)) this.geometrias.push(d.geometria);
    }

    // Pasos cerrados: una barrera por casilla X, que desaparece al cumplir su condición.
    const xs = [...m.casillas].filter(([, v]) => v.c === 'X');
    if (xs.length) {
      const im = new InstancedMesh(new BoxGeometry(0.92, 0.55, 0.2), liso(COLORES.acentoCoral, { especular: 0.1 }), xs.length);
      const matrices = xs.map(([k, v]) => {
        const [x, y] = deClave(k);
        return new Matrix4().makeTranslation(x, alturaSuelo(v.h) + 0.35, y);
      });
      this.pasos = { malla: im, zonas: xs.map(([, v]) => v.zona), matrices };
      anadir(im);
    }

    // Objetos en el suelo: una bola amarilla hasta que se recogen.
    const objs = [...m.objetos];
    if (objs.length) {
      const im = new InstancedMesh(new SphereGeometry(0.22, 14, 10), liso('#FFE45C', { especular: 0.3, contraluz: 0.3 }), objs.length);
      const matrices = objs.map(([k]) => {
        const [x, y] = deClave(k);
        return new Matrix4().makeTranslation(x, alturaSuelo(m.casillas.get(k)!.h) + 0.25, y);
      });
      this.objetos = { malla: im, ids: objs.map(([, o]) => o.objeto.id), matrices };
      anadir(im);
    }
    this.sincronizar();
  }

  /** Abre los pasos cumplidos y quita los objetos recogidos. Solo trabaja cuando algo cambia. */
  private sincronizar(): void {
    const e = this.partida.estado;
    if (this.pasos && e.condiciones.length !== this.vistoCondiciones) {
      this.vistoCondiciones = e.condiciones.length;
      const m = this.partida.mundo;
      this.pasos.zonas.forEach((zona, i) => {
        const cond = m.zonas.get(zona)?.cierre?.condicion;
        const abierto = cond !== undefined && e.condiciones.includes(cond);
        this.pasos!.malla.setMatrixAt(i, abierto ? OCULTA : this.pasos!.matrices[i]);
      });
      this.pasos.malla.instanceMatrix.needsUpdate = true;
    }
    if (this.objetos && e.recogidos.length !== this.vistoRecogidos) {
      this.vistoRecogidos = e.recogidos.length;
      this.objetos.ids.forEach((id, i) => this.objetos!.malla.setMatrixAt(i, e.recogidos.includes(id) ? OCULTA : this.objetos!.matrices[i]));
      this.objetos.malla.instanceMatrix.needsUpdate = true;
    }
  }

  actualizar(): void {
    this.sincronizar();
  }

  /** Altura del suelo que se pisa en una casilla de la isla (para «personaje»). */
  alturaEn(x: number, y: number): number {
    const cm = this.partida.mundo.casillas.get(clave(Math.round(x), Math.round(y)));
    return alturaSuelo(cm?.h ?? 0);
  }

  dispose(): void {
    for (const m of this.mallas) m.removeFromParent();
    for (const g of this.geometrias) g.dispose();
    for (const m of this.materiales) m.dispose();
  }
}


