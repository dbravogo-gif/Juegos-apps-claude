// Subsistema «mundo»: la isla en 3D. Casi todo es propio, por código: el terreno en terrazas por
// alturas, las casas canarias (`canario.ts`) y el kit de naturaleza (`kit.ts`: plantas, rocas y
// muros de La Palma). De KayKit (CC0) quedan las montañas de las cumbres y las nubes. Lee el
// estado de «partida» para abrir los pasos y quitar los objetos recogidos; no lo cambia.

import { BoxGeometry, InstancedMesh, Matrix4, Mesh, PlaneGeometry, Quaternion, SphereGeometry, Vector3, type BufferGeometry, type Material } from 'three/webgpu';
import { attribute } from 'three/tsl';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { TRANSITABLES, clave, deClave, edificios, type Casilla } from '../../core/mundo';
import { MaterialDiorama, sueloY } from '../../arte/material';
import { COLORES } from '../../arte/paleta';
import { NIVEL_MAR, alturaSuelo } from '../../arte/escala';
import { cargarModelo, escalaPara, materialConTextura, nodo, pieza, rutaModelo, type Pieza } from '../../arte/modelos';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Partida } from '../partida/partida';
import { alturaCara, cumbres, decoracion, geometriaTerreno, pseudo } from './terreno';
import { casaCanaria, faro, type UsoCasa } from './canario';
import { VARIANTES, piezaKit, type PiezaKit } from './kit';

const OCULTA = new Matrix4().makeScale(0, 0, 0);
const TROZO = 12;

/** Uso de cada casa canaria según su casilla. El museo y el gimnasio son casonas provisionales. */
const USO_CASA: Partial<Record<Casilla, UsoCasa>> = { C: 'casa', R: 'refugio', S: 'tienda', M: 'museo', G: 'gimnasio' };

/** Qué crece en las casillas de roca (`#`), con su peso sobre 100: secano en el sur, humedad en el norte. */
type Reparto = [PiezaKit | null, number][];
const RISCO_SECO: Reparto = [['roca', 30], ['organos', 6], ['escoria', 8], ['cardon', 14], ['tabaiba', 16], [null, 26]];
const RISCO_HUMEDO: Reparto = [['roca', 30], ['escoria', 5], ['tajinaste', 14], ['tabaiba', 8], [null, 43]];
const ZONAS_HUMEDAS = new Set(['pueblo', 'bosque']);
/** Escala mínima y máxima de cada pieza del kit en las rocas. */
const ESCALA_RISCO: Partial<Record<PiezaKit, [number, number]>> = {
  roca: [0.8, 1.3],
  organos: [0.9, 1.2],
  escoria: [0.9, 1.3],
  cardon: [0.85, 1.15],
  tabaiba: [1, 1.4],
  tajinaste: [0.85, 1.15],
};

function repartir(lista: Reparto, n: number): PiezaKit | null {
  let a = n % 100;
  for (const [pieza, peso] of lista) {
    if (a < peso) return pieza;
    a -= peso;
  }
  return null;
}

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

  /**
   * Altura (y del mundo) de lo más alto de cada casilla: suelo, cumbre, edificio o árbol. La usa
   * «personaje» para saber si algo tapa al jugador y mostrar su silueta.
   */
  readonly tapas = new Map<number, number>();
  private partida!: Partida;
  private ctx!: Ctx;
  private geometrias: BufferGeometry[] = [];
  private materiales: Material[] = [];
  private mallas: Mesh[] = [];
  private piezas = new Map<string, Pieza>();
  private kaykit!: GLTF;
  private materialKaykit!: MaterialDiorama;
  /** Material de lo hecho por código con color por vértice: casas, laureles y malpaís. */
  private materialColores!: MaterialDiorama;
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
    this.materialKaykit = materialConTextura(this.pieza(MONTANAS[0]).mapa, { bordes: [-0.1, 0.4], especular: 0.06, rebote: 0.12 });
    this.materialColores = new MaterialDiorama({ bordes: [-0.1, 0.4], especular: 0.06, rebote: 0.12 }, attribute('color', 'vec3'));
    this.materiales.push(this.materialKaykit, this.materialColores);

    // Terreno y cumbres en una sola malla.
    const terreno = new MaterialDiorama({ bordes: [-0.02, 0.32], rebote: 0.1 }, attribute('color', 'vec3'));
    this.materiales.push(terreno);
    const cumbre = cumbres(m);
    this.anadir(new Mesh(geometriaTerreno(m, cumbre), terreno));
    for (const [k, cm] of m.casillas) this.tapas.set(k, alturaCara(cm, undefined));
    for (const [k, h] of cumbre) this.tapas.set(k, alturaSuelo(h));

    // El mar, bajo toda la isla y alrededor.
    const mar = new Mesh(new PlaneGeometry(m.ancho + 160, m.alto + 160), this.liso(COLORES.aguaTurquesa, { rebote: 0 }));
    mar.rotation.x = -Math.PI / 2;
    mar.position.set(m.ancho / 2, NIVEL_MAR, m.alto / 2);
    this.anadir(mar, false);

    this.colocarEdificios();
    this.colocarNaturaleza(cumbre);

    // Decoración del suelo: hierba alta, malpaís y flores. Sin sombra propia: es tan baja que
    // apenas se ve, y cada malla con sombra es otra llamada de dibujo.
    const materialesDeco = new Map<string, MaterialDiorama>();
    for (const d of decoracion(m)) {
      if (d.color !== null && !materialesDeco.has(d.color)) materialesDeco.set(d.color, this.liso(d.color));
      this.instanciar(d.geometria, d.color === null ? this.materialColores : materialesDeco.get(d.color)!, d.matrices, false);
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
      const im = this.instanciar(new SphereGeometry(0.22, 14, 10), this.liso(COLORES.amarilloLuz, { especular: 0.3, contraluz: 0.3 }), matrices);
      this.objetos = { malla: im, ids: objs.map(([, o]) => o.objeto.id), matrices };
    }
    this.sincronizar();
  }

  private pieza(nombre: string): Pieza {
    let p = this.piezas.get(nombre);
    if (!p && nombre.startsWith('kit:')) {
      const [tipo, variante] = nombre.slice(4).split('_');
      const geometria = piezaKit(tipo as PiezaKit, Number(variante));
      p = { geometria, mapa: null, caja: geometria.boundingBox!.clone() };
      this.piezas.set(nombre, p);
      this.geometrias.push(geometria);
    }
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

  private subirTapa(k: number, y: number): void {
    this.tapas.set(k, Math.max(this.tapas.get(k) ?? -Infinity, y));
  }

  private anadir(malla: Mesh, sombra = true): Mesh {
    malla.castShadow = sombra;
    malla.receiveShadow = true;
    this.ctx.escena.add(malla);
    this.mallas.push(malla);
    if (!this.geometrias.includes(malla.geometry)) this.geometrias.push(malla.geometry);
    return malla;
  }

  private instanciar(g: BufferGeometry, mat: Material, matrices: Matrix4[], sombra = true): InstancedMesh {
    const im = new InstancedMesh(g, mat, matrices.length);
    matrices.forEach((mt, i) => im.setMatrixAt(i, mt));
    im.computeBoundingSphere();
    this.anadir(im, sombra);
    return im;
  }

  /**
   * Cada edificio a la medida de su solar y apoyado en el suelo. Las casas, refugios y tiendas
   * son casas canarias: rurales en el campo y de balcones en la capital. El museo y el gimnasio
   * son casonas de balcones, y el faro, una torre blanca con bandas rojas. Todas las puertas dan
   * al sur, hacia la cámara (lo comprueba una prueba del mapa).
   */
  private colocarEdificios(): void {
    const m = this.partida.mundo;
    for (const zona of m.zonas.keys()) {
      for (const e of edificios(m, zona)) {
        const xs = e.casillas.map((k) => deClave(k)[0]);
        const ys = e.casillas.map((k) => deClave(k)[1]);
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
        const cz = (Math.min(...ys) + Math.max(...ys)) / 2;
        const base = alturaSuelo(m.casillas.get(e.casillas[0])!.h);
        const uso = USO_CASA[e.tipo];
        if (uso) {
          const puerta = e.puertas.length ? deClave(e.puertas[0])[0] - cx : 0;
          const estilo = zona === 'capital' || uso === 'museo' || uso === 'gimnasio' ? 'balcones' : 'rural';
          // El gimnasio, con azotea: más bajo, para no tapar tanto el camino de detrás.
          const techo = uso === 'gimnasio' ? 'azotea' : uso === 'museo' ? 'teja' : undefined;
          const geometria = casaCanaria({ estilo, uso, techo, ancho: e.ancho, fondo: e.fondo, puerta, semilla: pseudo(e.casillas[0]) });
          const casa = new Mesh(geometria, this.materialColores);
          casa.position.set(cx, base, cz);
          this.anadir(casa);
          for (const k of e.casillas) this.subirTapa(k, base + geometria.boundingBox!.max.y);
          continue;
        }
        if (e.tipo !== 'F') continue;
        const geometria = faro();
        const torre = new Mesh(geometria, this.materialColores);
        torre.position.set(cx, base, cz);
        this.anadir(torre);
        for (const k of e.casillas) this.subirTapa(k, base + geometria.boundingBox!.max.y);
      }
    }
  }

  /** Plantas, rocas y muros del kit, y montañas y nubes de KayKit, instanciados por trozos de la isla. */
  private colocarNaturaleza(cumbre: Map<number, number>): void {
    const m = this.partida.mundo;
    const grupos = new Map<string, { nombre: string; matrices: Matrix4[] }>();
    const q = new Quaternion();
    const eje = new Vector3(0, 1, 0);
    /** Coloca una pieza apoyada en `altura` y devuelve la altura de su punto más alto. */
    const colocarEn = (nombre: string, x: number, y: number, altura: number, ancho: number, giro: number): number => {
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
      return altura + (p.caja.max.y - p.caja.min.y) * s;
    };
    /** Coloca una variante del kit (con la base en el origen) a su escala; devuelve su altura máxima. */
    const colocarKit = (tipo: PiezaKit, r: number, x: number, y: number, altura: number, escala: number, giro: number): number => {
      const nombre = `kit:${tipo}_${r % VARIANTES[tipo]}`;
      const p = this.pieza(nombre);
      q.setFromAxisAngle(eje, giro);
      const mt = new Matrix4().compose(new Vector3(x, altura, y), q, new Vector3(escala, escala, escala));
      const id = `${nombre}:${Math.floor(x / TROZO)},${Math.floor(y / TROZO)}`;
      const g = grupos.get(id) ?? { nombre, matrices: [] };
      g.matrices.push(mt);
      grupos.set(id, g);
      return altura + p.caja.max.y * escala;
    };

    for (const [k, cm] of m.casillas) {
      const [x, y] = deClave(k);
      const r = pseudo(k);
      const suelo = alturaSuelo(cm.h);
      const dx = ((r >>> 8) % 5) * 0.04 - 0.08;
      const dz = ((r >>> 12) % 5) * 0.04 - 0.08;
      const giro = ((r >>> 16) % 6) * (Math.PI / 3);
      if (cm.c === 'T' && cm.zona === 'bosque') {
        // Laureles de la laurisilva. Los que tienen un camino justo al norte son bajos: si no,
        // con la cámara a 50° tapan la última fila del camino.
        const orilla = TRANSITABLES.has(m.casillas.get(clave(x, y - 1))?.c ?? '');
        const escala = orilla ? 0.5 : 0.85 + ((r >>> 4) & 3) * 0.07;
        this.subirTapa(k, colocarKit('laurel', r, x + dx, y + dz, suelo, escala, giro));
      } else if (cm.c === 'T') {
        // Fuera del bosque, palmeras canarias.
        this.subirTapa(k, colocarKit('palmera', r, x + dx, y + dz, suelo, 0.9 + ((r >>> 4) & 3) * 0.07, giro));
      } else if (cm.c === 'b') {
        this.subirTapa(k, colocarKit('platanera', r, x + dx, y + dz, suelo, 0.9 + ((r >>> 4) & 7) * 0.04, giro));
      } else if (cm.c === 'Y') {
        this.subirTapa(k, colocarKit('drago', r, x, y, suelo, 1, giro));
      } else if (cm.c === '#') {
        const tipo = repartir(ZONAS_HUMEDAS.has(cm.zona) ? RISCO_HUMEDO : RISCO_SECO, r >>> 3);
        if (!tipo) continue;
        const [min, max] = ESCALA_RISCO[tipo] ?? [1, 1];
        const escala = min + (((r >>> 20) & 15) / 15) * (max - min);
        this.subirTapa(k, colocarKit(tipo, r >>> 5, x + dx, y + dz, alturaCara(cm, undefined), escala, giro));
      } else if (cm.c === '=') {
        const horizontal = m.casillas.get(clave(x - 1, y))?.c === '=' || m.casillas.get(clave(x + 1, y))?.c === '=';
        this.subirTapa(k, colocarKit('muro', r, x, y, suelo, 1, horizontal ? 0 : Math.PI / 2));
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
    for (const g of grupos.values()) {
      const p = this.pieza(g.nombre);
      this.instanciar(p.geometria, p.geometria.getAttribute('color') ? this.materialColores : this.materialKaykit, g.matrices);
    }
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
