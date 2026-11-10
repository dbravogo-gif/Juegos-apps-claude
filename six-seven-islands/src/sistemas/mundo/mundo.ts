// Subsistema «mundo»: la isla en 3D, toda por código: el terreno en terrazas por alturas, las
// casas canarias (`canario.ts`) y el kit de naturaleza (`kit.ts`: plantas, rocas, muros, volcanes
// y nubes). Cada isla elige sus estilos por zona (casas, árboles y flora) y sus colores. Lee el
// estado de «partida» para abrir los pasos y quitar los objetos recogidos; no lo cambia.

import { BoxGeometry, InstancedMesh, Matrix4, Mesh, PlaneGeometry, Quaternion, SphereGeometry, Vector3, type BufferGeometry, type Material } from 'three/webgpu';
import { attribute } from 'three/tsl';
import { TRANSITABLES, clave, deClave, edificios, type Casilla, type DefZona } from '../../core/mundo';
import { MaterialDiorama, sueloY } from '../../arte/material';
import { COLORES } from '../../arte/paleta';
import { NIVEL_MAR, alturaSuelo } from '../../arte/escala';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Partida } from '../partida/partida';
import { alturaCara, cumbres, decoracion, geometriaTerreno, pseudo } from './terreno';
import { casaCanaria, faro, type OpcionesCasa, type UsoCasa } from './canario';
import { VARIANTES, piezaKit, type PiezaKit } from './kit';

const OCULTA = new Matrix4().makeScale(0, 0, 0);
const TROZO = 12;

/** Uso de cada casa canaria según su casilla. El museo y el gimnasio son casonas provisionales. */
const USO_CASA: Partial<Record<Casilla, UsoCasa>> = { C: 'casa', R: 'refugio', S: 'tienda', M: 'museo', G: 'gimnasio' };

/** Qué crece en las casillas de roca (`#`), con su peso sobre 100, según la flora de la zona. */
type Reparto = [PiezaKit | null, number][];
const RISCO: Record<NonNullable<DefZona['flora']>, Reparto> = {
  seca: [['roca', 28], ['organos', 6], ['escoria', 8], ['cardon', 12], ['tabaiba', 14], ['tunera', 6], [null, 26]],
  humeda: [['roca', 30], ['escoria', 5], ['tajinaste', 14], ['tabaiba', 8], [null, 43]],
  volcan: [['roca', 25], ['escoria', 35], ['organos', 12], [null, 28]],
};
/** Escala mínima y máxima de cada pieza del kit en las rocas. */
const ESCALA_RISCO: Partial<Record<PiezaKit, [number, number]>> = {
  roca: [0.8, 1.3],
  organos: [0.9, 1.2],
  escoria: [0.9, 1.3],
  cardon: [0.85, 1.15],
  tabaiba: [1, 1.4],
  tajinaste: [0.85, 1.15],
  tunera: [0.9, 1.2],
};

function repartir(lista: Reparto, n: number): PiezaKit | null {
  let a = n % 100;
  for (const [pieza, peso] of lista) {
    if (a < peso) return pieza;
    a -= peso;
  }
  return null;
}

/** Las opciones de casa de una zona: rural de teja por defecto y de balcones en la capital. */
function estiloDe(z: DefZona): Pick<OpcionesCasa, 'estilo' | 'blanca'> {
  switch (z.casas ?? (z.id === 'capital' ? 'balcones' : 'rural')) {
    case 'lanzarote':
      return { estilo: 'lanzarote' };
    case 'balcones-blanca':
      return { estilo: 'balcones', blanca: true };
    case 'balcones':
      return { estilo: 'balcones' };
    default:
      return { estilo: 'rural' };
  }
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
  private piezas = new Map<string, BufferGeometry>();
  /** Material de todo lo hecho por código con color por vértice: casas, kit y malpaís. */
  private materialColores!: MaterialDiorama;
  private pasos: { malla: InstancedMesh; zonas: string[]; matrices: Matrix4[] } | null = null;
  private objetos: { malla: InstancedMesh; ids: string[]; matrices: Matrix4[] } | null = null;
  private vistoCondiciones = -1;
  private vistoRecogidos = -1;

  init(ctx: Ctx): void {
    this.ctx = ctx;
    this.partida = ctx.get<Partida>('partida');
    const m = this.partida.mundo;
    sueloY.value = alturaSuelo(0);
    this.materialColores = new MaterialDiorama({ bordes: [-0.1, 0.4], especular: 0.06, rebote: 0.12 }, attribute('color', 'vec3'));
    this.materiales.push(this.materialColores);

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

  /** La geometría de una variante del kit («tipo_variante»), hecha una sola vez. */
  private pieza(nombre: string): BufferGeometry {
    let g = this.piezas.get(nombre);
    if (!g) {
      const [tipo, variante] = nombre.split('_');
      g = piezaKit(tipo as PiezaKit, Number(variante));
      this.piezas.set(nombre, g);
      this.geometrias.push(g);
    }
    return g;
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
   * son casas canarias, del estilo de su zona. El museo es de una planta y el gimnasio, una
   * casona de balcones con azotea; el faro, una torre blanca con bandas rojas. Todas las puertas
   * dan al sur, hacia la cámara (lo comprueba una prueba del mapa).
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
          const deZona = estiloDe(m.zonas.get(zona)!);
          // El museo, de una planta: de dos tapaba al jugador al empezar (probador, 2026-11-08).
          // El gimnasio, con azotea: más bajo, para no tapar tanto el camino de detrás, y con el
          // emblema de su tipo pintado (Roca en Lanzarote).
          const estilo: Omit<OpcionesCasa, 'ancho' | 'fondo'> =
            uso === 'museo'
              ? { estilo: deZona.estilo === 'lanzarote' ? 'lanzarote' : 'rural', techo: 'teja' }
              : uso === 'gimnasio'
                ? { estilo: 'balcones', blanca: deZona.blanca, techo: 'azotea', emblema: m.isla.gimnasio === 'roca' ? 'volcan' : 'sol' }
                : deZona;
          const geometria = casaCanaria({ ...estilo, uso, ancho: e.ancho, fondo: e.fondo, puerta, semilla: pseudo(e.casillas[0]) });
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

  /** Plantas, rocas, muros, volcanes y nubes del kit, instanciados por trozos de la isla. */
  private colocarNaturaleza(cumbre: Map<number, number>): void {
    const m = this.partida.mundo;
    const grupos = new Map<string, { nombre: string; matrices: Matrix4[] }>();
    const q = new Quaternion();
    const eje = new Vector3(0, 1, 0);
    /** Coloca una variante del kit (con la base en el origen) a su escala; devuelve su altura máxima. */
    const colocarKit = (tipo: PiezaKit, r: number, x: number, y: number, altura: number, escala: number, giro: number): number => {
      const nombre = `${tipo}_${r % VARIANTES[tipo]}`;
      const g = this.pieza(nombre);
      q.setFromAxisAngle(eje, giro);
      const mt = new Matrix4().compose(new Vector3(x, altura, y), q, new Vector3(escala, escala, escala));
      const id = `${nombre}:${Math.floor(x / TROZO)},${Math.floor(y / TROZO)}`;
      const grupo = grupos.get(id) ?? { nombre, matrices: [] };
      grupo.matrices.push(mt);
      grupos.set(id, grupo);
      return altura + g.boundingBox!.max.y * escala;
    };

    for (const [k, cm] of m.casillas) {
      const [x, y] = deClave(k);
      const r = pseudo(k);
      const suelo = alturaSuelo(cm.h);
      const dx = ((r >>> 8) % 5) * 0.04 - 0.08;
      const dz = ((r >>> 12) % 5) * 0.04 - 0.08;
      const giro = ((r >>> 16) % 6) * (Math.PI / 3);
      const zona = m.zonas.get(cm.zona)!;
      if (cm.c === 'T' && zona.arboles === 'laurel') {
        // Laureles de la laurisilva. Los que tienen un camino justo al norte son bajos: si no,
        // con la cámara a 50° tapan la última fila del camino.
        const orilla = TRANSITABLES.has(m.casillas.get(clave(x, y - 1))?.c ?? '');
        const escala = orilla ? 0.5 : 0.85 + ((r >>> 4) & 3) * 0.07;
        this.subirTapa(k, colocarKit('laurel', r, x + dx, y + dz, suelo, escala, giro));
      } else if (cm.c === 'T') {
        // Si no, palmeras canarias.
        this.subirTapa(k, colocarKit('palmera', r, x + dx, y + dz, suelo, 0.9 + ((r >>> 4) & 3) * 0.07, giro));
      } else if (cm.c === 'b') {
        this.subirTapa(k, colocarKit('platanera', r, x + dx, y + dz, suelo, 0.9 + ((r >>> 4) & 7) * 0.04, giro));
      } else if (cm.c === 'Y') {
        this.subirTapa(k, colocarKit('drago', r, x, y, suelo, 1, giro));
      } else if (cm.c === 'V') {
        this.subirTapa(k, colocarKit('vid', r, x, y, suelo, 1, (r % 3) * 0.2 - 0.2));
      } else if (cm.c === 'U') {
        this.subirTapa(k, colocarKit('tunera', r, x + dx, y + dz, suelo, 1 + ((r >>> 4) & 3) * 0.1, giro));
      } else if (cm.c === 'L' && r % 6 === 0) {
        // En las coladas, alguna escoria o roca suelta sobre las lajas.
        colocarKit(r & 64 ? 'escoria' : 'roca', r >>> 5, x + dx, y + dz, alturaCara(cm, undefined), 0.8, giro);
      } else if (cm.c === '#') {
        const tipo = repartir(RISCO[zona.flora ?? 'seca'], r >>> 3);
        if (!tipo) continue;
        const [min, max] = ESCALA_RISCO[tipo] ?? [1, 1];
        const escala = min + (((r >>> 20) & 15) / 15) * (max - min);
        this.subirTapa(k, colocarKit(tipo, r >>> 5, x + dx, y + dz, alturaCara(cm, undefined), escala, giro));
      } else if (cm.c === '=') {
        const horizontal = m.casillas.get(clave(x - 1, y))?.c === '=' || m.casillas.get(clave(x + 1, y))?.c === '=';
        this.subirTapa(k, colocarKit('muro', r, x, y, suelo, 1, horizontal ? 0 : Math.PI / 2));
      }
    }
    // Volcanes sobre las cumbres, espaciados, y algunas nubes sobre el mar.
    for (const [k, h] of cumbre) {
      const [x, y] = deClave(k);
      if (x % 6 !== 0 || y % 6 !== 0) continue;
      const r = pseudo(k);
      colocarKit('volcan', r, x, y, alturaSuelo(h) - 0.3, (6 + (r % 3)) / 2, (r % 6) * (Math.PI / 3));
    }
    for (let i = 0; i < 8; i++) {
      const r = pseudo(i * 7919 + 13);
      colocarKit('nube', r, -12 + (r % (m.ancho + 24)), -10 + ((r >>> 9) % (m.alto + 20)), 9 + (r % 4), 2.3 + (r % 3) * 0.4, 0);
    }
    for (const g of grupos.values()) this.instanciar(this.pieza(g.nombre), this.materialColores, g.matrices);
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
