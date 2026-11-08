// Carga de modelos glTF (KayKit, CC0) y su paso al material del juego. Los modelos se descargan
// una vez y se reutilizan; sus materiales se cambian por MaterialDiorama con su textura, para que
// tengan la misma luz que el resto (sombras de color, contraluz y rebote).

import { Box3, Matrix4, Mesh, Vector3, type BufferGeometry, type Material, type Object3D, type Texture } from 'three/webgpu';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { texture } from 'three/tsl';
import { MaterialDiorama, type OpcionesMaterial } from './material';

const cache = new Map<string, Promise<GLTF>>();
const cargador = new GLTFLoader();

/** Ruta de un modelo dentro de public/modelos. */
export const rutaModelo = (nombre: string): string => `${import.meta.env.BASE_URL}modelos/${nombre}`;

export function cargarModelo(ruta: string): Promise<GLTF> {
  let p = cache.get(ruta);
  if (!p) {
    p = cargador.loadAsync(ruta);
    cache.set(ruta, p);
  }
  return p;
}

/** Busca un nodo por nombre en un glTF. */
export function nodo(gltf: GLTF, nombre: string): Object3D {
  const n = gltf.scene.getObjectByName(nombre);
  if (!n) throw new Error(`El modelo no tiene el nodo «${nombre}»`);
  return n;
}

export interface Pieza {
  /** Geometría fusionada de todas las mallas del nodo, en el espacio del nodo. */
  geometria: BufferGeometry;
  /** Textura de su material, si la tiene. */
  mapa: Texture | null;
  /** Caja envolvente, para escalarla al hueco donde va. */
  caja: Box3;
}

/** Fusiona las mallas de un nodo en una geometría, lista para instanciar o colocar. */
export function pieza(raiz: Object3D): Pieza {
  raiz.updateWorldMatrix(true, true);
  const inversa = new Matrix4().copy(raiz.matrixWorld).invert();
  const partes: BufferGeometry[] = [];
  let mapa: Texture | null = null;
  raiz.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh) return;
    const g = m.geometry.clone();
    g.applyMatrix4(new Matrix4().multiplyMatrices(inversa, m.matrixWorld));
    for (const nombre of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(nombre)) g.deleteAttribute(nombre);
    partes.push(g.index ? g.toNonIndexed() : g);
    const mat = (Array.isArray(m.material) ? m.material[0] : m.material) as Material & { map?: Texture | null };
    mapa ??= mat.map ?? null;
  });
  if (!partes.length) throw new Error(`El nodo «${raiz.name}» no tiene mallas`);
  const geometria = mergeGeometries(partes, false)!;
  for (const p of partes) p.dispose();
  geometria.computeBoundingBox();
  return { geometria, mapa, caja: geometria.boundingBox!.clone() };
}

/** Material del juego con la textura del modelo. */
export function materialConTextura(mapa: Texture | null, op: OpcionesMaterial = {}): MaterialDiorama {
  return mapa ? new MaterialDiorama(op, texture(mapa).rgb) : new MaterialDiorama(op);
}

/** Cambia los materiales de un objeto (por ejemplo, un personaje) por MaterialDiorama con su textura. */
export function aMaterialDelJuego(raiz: Object3D, op: OpcionesMaterial = {}): MaterialDiorama[] {
  const hechos = new Map<Material, MaterialDiorama>();
  raiz.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh) return;
    const viejo = (Array.isArray(m.material) ? m.material[0] : m.material) as Material & { map?: Texture | null };
    let nuevo = hechos.get(viejo);
    if (!nuevo) {
      nuevo = materialConTextura(viejo.map ?? null, op);
      hechos.set(viejo, nuevo);
    }
    m.material = nuevo;
    m.castShadow = true;
    m.receiveShadow = true;
  });
  return [...hechos.values()];
}

/** Escala que hace caber una caja en un hueco de ancho × fondo, sin pasar de un alto máximo. */
export function escalaPara(caja: Box3, ancho: number, fondo: number, altoMax = Infinity): number {
  const t = caja.getSize(new Vector3());
  return Math.min(ancho / t.x, fondo / t.z, altoMax / t.y);
}
