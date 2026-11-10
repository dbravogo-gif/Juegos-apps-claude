// Carga de modelos glTF (los personajes de KayKit, CC0, y más adelante los de Meshy) y su paso al
// material del juego. Se descargan una vez y se reutilizan; sus materiales se cambian por
// MaterialDiorama con su textura, para que tengan la misma luz que el resto.

import { type Material, type Mesh, type Object3D, type Texture } from 'three/webgpu';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
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
