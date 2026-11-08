// Subsistema «mundo»: la isla en 3D. Terreno en terrazas por alturas (propio), mar, y los modelos
// de KayKit (CC0): edificios, árboles, rocas, vallas, montañas y nubes. Lo que KayKit no tiene
// (plataneras, drago, matas de hierba alta y piedras del malpaís) sigue siendo procedural. Lee el
// estado de «partida» para abrir los pasos y quitar los objetos recogidos; no lo cambia.

import { BoxGeometry, InstancedMesh, Matrix4, Mesh, PlaneGeometry, Quaternion, SphereGeometry, Vector3, type BufferGeometry, type Material } from 'three/webgpu';
import { attribute } from 'three/tsl';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { clave, deClave, edificios, type Casilla } from '../../core/mundo';
import { MaterialDiorama, sueloY } from '../../arte/material';
import { COLORES } from '../../arte/paleta';
import { NIVEL_MAR, alturaSuelo } from '../../arte/escala';
import { cargarModelo, escalaPara, materialConTextura, nodo, pieza, rutaModelo, type Pieza } from '../../arte/modelos';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Partida } from '../partida/partida';
import { alturaCara, cumbres, decoracion, geometriaTerreno, pseudo } from './terreno';

const OCULTA = new Matrix4().makeScale(0, 0, 0);
const TROZO = 12;

/** Qué modelo hace de cada edificio, por zona y en orden de aparición. */
const MODELO_EDIFICIO: Record<string, Partial<Record<Casilla, string[]>>> = {
  inicial: { C: ['building_home_A_red', 'building_home_A_red'], M: ['building_barracks_blue'] },
  pueblo: { C: ['building_home_A_yellow', 'building_home_B_blue'], R: ['building_tavern_red'], S: ['building_market_blue'] },
  capital: {
    C: ['building_home_A_blue', 'building_home_B_red', 'building_home_A_green', 'building_home_B_yellow'],
    R: ['building_tavern_red'],
    G: ['building_castle_yellow'],
    F: ['building_tower_A_yellow'],
  },
};
/** Alto máximo de cada edificio, para que no tape media pantalla con la cámara a 50°. */
// Con la silueta del jugador ya no se le pierde de vista detrás de una casa.
const ALTO_MAX: Partial<Record<Casilla, number>> = { C: 3.3, M: 3.6, R: 3.4, S: 3.1, G: 6.2, F: 5.5 };
// Reparto del bosque por peso: sobre todo pinos sueltos (50 y 220 triángulos) y algunos grupos
// (430 y 480) para dar volumen. Los grupos grandes (660 a 1.100) disparaban los triángulos.
const ARBOLES = [
  'tree_single_A', 'tree_single_A', 'tree_single_A', 'tree_single_A', 'tree_single_A',
  'tree_single_B', 'tree_single_B', 'tree_single_B', 'trees_A_small', 'trees_A_medium',
];
const ROCAS = ['rock_single_A', 'rock_single_C', 'rock_single_E'];
const MONTANAS = ['mountain_A_grass_trees', 'mountain_B_grass', 'mountain_C_grass_trees', 'hills_A_trees'];

/**
 * La textura de KayKit es una paleta de 8 × 4 degradados. La hierba de las montañas usa el
 * amarillo oliva (columna 0, fila 2), que con el sol cálido sale amarillo chillón: se cambia por
 * el verde de la hierba (columna 4, fila 1).
 */
function hierbaVerde(g: BufferGeometry): void {
  const uv = g.getAttribute('uv');
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i);
    const v = uv.getY(i);
    if (u < 1 / 8 && v >= 2 / 4 && v < 3 / 4) uv.setXY(i, u + 4 / 8, v - 1 / 4);
  }
  uv.needsUpdate = true;
}

export class Mundo implements Subsistema {
  static readonly id = 'mundo';
  static readonly deps: readonly string[] = ['render', 'partida'];

  private partida!: Partida;
  private ctx!: Ctx;
  private geometrias: BufferGeometry[] = [];
  private materiales: Material[] = [];
  private mallas: Mesh[] = [];
  private piezas = new Map<string, Pieza>();
  private kaykit!: GLTF;
  private materialKaykit!: MaterialDiorama;
  private pasos: { malla: InstancedMesh; zonas: string[]; matrices: Matrix4[] } | null = null;
  private objetos: { malla: InstancedMesh; ids: string[]; matrices: Matrix4[] } | null = null;
  private vistoCondiciones = -1;
  private vistoRecogidos = -1;

  async init(ctx: Ctx): Promise<void> {
    this.ctx = ctx;
    this.partida = ctx.get<Partida>('partida');
    const m = this.partida.mundo;
    sueloY.value = alturaSuelo(0);
    this.kaykit = await cargarModelo(rutaModelo('kaykit/medieval.glb'));
    this.materialKaykit = materialConTextura(this.pieza('tree_single_A').mapa, { bordes: [-0.1, 0.4], especular: 0.06, rebote: 0.12 });
    this.materiales.push(this.materialKaykit);

    // Terreno y cumbres en una sola malla.
    const terreno = new MaterialDiorama({ bordes: [-0.02, 0.32], rebote: 0.1 }, attribute('color', 'vec3'));
    this.materiales.push(terreno);
    const cumbre = cumbres(m);
    this.anadir(new Mesh(geometriaTerreno(m, cumbre), terreno));

    // El mar, bajo toda la isla y alrededor.
    const mar = new Mesh(new PlaneGeometry(m.ancho + 160, m.alto + 160), this.liso(COLORES.aguaTurquesa, { rebote: 0 }));
    mar.rotation.x = -Math.PI / 2;
    mar.position.set(m.ancho / 2, NIVEL_MAR, m.alto / 2);
    this.anadir(mar, false);

    this.colocarEdificios();
    this.colocarNaturaleza(cumbre);

    // Decoración procedural (lo que KayKit no tiene).
    const materialesDeco = new Map<string, MaterialDiorama>();
    for (const d of decoracion(m)) {
      if (!materialesDeco.has(d.color)) materialesDeco.set(d.color, this.liso(d.color));
      this.instanciar(d.geometria, materialesDeco.get(d.color)!, d.matrices);
    }

    // Pasos cerrados: una barrera por casilla X, que desaparece al cumplir su condición.
    const xs = [...m.casillas].filter(([, v]) => v.c === 'X');
    if (xs.length) {
      const matrices = xs.map(([k, v]) => {
        const [x, y] = deClave(k);
        return new Matrix4().makeTranslation(x, alturaSuelo(v.h) + 0.35, y);
      });
      const im = this.instanciar(new BoxGeometry(0.92, 0.55, 0.2), this.liso(COLORES.acentoCoral, { especular: 0.1 }), matrices);
      this.pasos = { malla: im, zonas: xs.map(([, v]) => v.zona), matrices };
    }

    // Objetos en el suelo: una bola amarilla hasta que se recogen.
    const objs = [...m.objetos];
    if (objs.length) {
      const matrices = objs.map(([k]) => {
        const [x, y] = deClave(k);
        return new Matrix4().makeTranslation(x, alturaSuelo(m.casillas.get(k)!.h) + 0.25, y);
      });
      const im = this.instanciar(new SphereGeometry(0.22, 14, 10), this.liso('#FFE45C', { especular: 0.3, contraluz: 0.3 }), matrices);
      this.objetos = { malla: im, ids: objs.map(([, o]) => o.objeto.id), matrices };
    }
    this.sincronizar();
  }

  private pieza(nombre: string): Pieza {
    let p = this.piezas.get(nombre);
    if (!p) {
      p = pieza(nodo(this.kaykit, nombre));
      if (MONTANAS.includes(nombre)) hierbaVerde(p.geometria);
      this.piezas.set(nombre, p);
      this.geometrias.push(p.geometria);
    }
    return p;
  }

  private liso(color: string, op: ConstructorParameters<typeof MaterialDiorama>[0] = {}): MaterialDiorama {
    const mat = new MaterialDiorama({ color, bordes: [-0.02, 0.32], rebote: 0.1, ...op });
    this.materiales.push(mat);
    return mat;
  }

  private anadir(malla: Mesh, sombra = true): Mesh {
    malla.castShadow = sombra;
    malla.receiveShadow = true;
    this.ctx.escena.add(malla);
    this.mallas.push(malla);
    if (!this.geometrias.includes(malla.geometry)) this.geometrias.push(malla.geometry);
    return malla;
  }

  private instanciar(g: BufferGeometry, mat: Material, matrices: Matrix4[]): InstancedMesh {
    const im = new InstancedMesh(g, mat, matrices.length);
    matrices.forEach((mt, i) => im.setMatrixAt(i, mt));
    im.computeBoundingSphere();
    this.anadir(im);
    return im;
  }

  /** Cada edificio, con su modelo a la medida del solar y apoyado en el suelo. */
  private colocarEdificios(): void {
    const m = this.partida.mundo;
    for (const zona of m.zonas.keys()) {
      const usados: Partial<Record<Casilla, number>> = {};
      for (const e of edificios(m, zona)) {
        const lista = MODELO_EDIFICIO[zona]?.[e.tipo];
        const i = usados[e.tipo] ?? 0;
        usados[e.tipo] = i + 1;
        const nombre = lista?.[i % lista.length];
        if (!nombre) continue;
        const p = this.pieza(nombre);
        const xs = e.casillas.map((k) => deClave(k)[0]);
        const ys = e.casillas.map((k) => deClave(k)[1]);
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
        const cz = (Math.min(...ys) + Math.max(...ys)) / 2;
        const s = escalaPara(p.caja, e.ancho * 1.05, e.fondo * 1.05, ALTO_MAX[e.tipo]);
        const base = alturaSuelo(m.casillas.get(e.casillas[0])!.h);
        const malla = new Mesh(p.geometria, this.materialKaykit);
        malla.scale.setScalar(s);
        const centro = p.caja.getCenter(new Vector3());
        malla.position.set(cx - centro.x * s, base - p.caja.min.y * s, cz - centro.z * s);
        this.anadir(malla);
      }
    }
  }

  /** Árboles, rocas, vallas, montañas y nubes de KayKit, instanciados por trozos de la isla. */
  private colocarNaturaleza(cumbre: Map<number, number>): void {
    const m = this.partida.mundo;
    const grupos = new Map<string, { nombre: string; matrices: Matrix4[] }>();
    const q = new Quaternion();
    const eje = new Vector3(0, 1, 0);
    const colocarEn = (nombre: string, x: number, y: number, altura: number, ancho: number, giro: number) => {
      const p = this.pieza(nombre);
      const s = escalaPara(p.caja, ancho, ancho);
      const c = p.caja.getCenter(new Vector3());
      q.setFromAxisAngle(eje, giro);
      const mt = new Matrix4().compose(new Vector3(x, altura - p.caja.min.y * s, y), q, new Vector3(s, s, s));
      mt.multiply(new Matrix4().makeTranslation(-c.x, 0, -c.z));
      const id = `${nombre}:${Math.floor(x / TROZO)},${Math.floor(y / TROZO)}`;
      const g = grupos.get(id) ?? { nombre, matrices: [] };
      g.matrices.push(mt);
      grupos.set(id, g);
    };

    for (const [k, cm] of m.casillas) {
      const [x, y] = deClave(k);
      const r = pseudo(k);
      const suelo = alturaSuelo(cm.h);
      if (cm.c === 'T') {
        // En el pueblo, laureles sueltos; en el bosque, grupos variados.
        const nombre = cm.zona === 'bosque' ? ARBOLES[r % ARBOLES.length] : 'tree_single_B';
        const dx = ((r >>> 8) % 5) * 0.04 - 0.08;
        const dz = ((r >>> 12) % 5) * 0.04 - 0.08;
        colocarEn(nombre, x + dx, y + dz, suelo, 1.15 + ((r >>> 4) & 3) * 0.1, ((r >>> 16) % 6) * (Math.PI / 3));
      } else if (cm.c === '#' && r % 3 === 0) {
        colocarEn(ROCAS[(r >>> 4) % ROCAS.length], x, y, alturaCara(cm, undefined), 0.7 + ((r >>> 8) & 3) * 0.12, (r % 7) * 0.9);
      } else if (cm.c === '=') {
        const horizontal = m.casillas.get(clave(x - 1, y))?.c === '=' || m.casillas.get(clave(x + 1, y))?.c === '=';
        colocarEn('fence_stone_straight', x, y, suelo, 1.02, horizontal ? 0 : Math.PI / 2);
      }
    }
    // Montañas sobre las cumbres, espaciadas, y algunas nubes sobre el mar.
    for (const [k, h] of cumbre) {
      const [x, y] = deClave(k);
      if (x % 6 !== 0 || y % 6 !== 0) continue;
      const r = pseudo(k);
      colocarEn(MONTANAS[r % MONTANAS.length], x, y, alturaSuelo(h) - 0.3, 6 + (r % 3), (r % 6) * (Math.PI / 3));
    }
    for (let i = 0; i < 8; i++) {
      const r = pseudo(i * 7919 + 13);
      colocarEn(i % 2 ? 'cloud_big' : 'cloud_small', -12 + (r % (m.ancho + 24)), -10 + ((r >>> 9) % (m.alto + 20)), 9 + (r % 4), 5 + (r % 3), 0);
    }
    for (const g of grupos.values()) this.instanciar(this.pieza(g.nombre).geometria, this.materialKaykit, g.matrices);
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

  dispose(): void {
    for (const m of this.mallas) m.removeFromParent();
    for (const g of this.geometrias) g.dispose();
    for (const m of this.materiales) m.dispose();
  }
}
