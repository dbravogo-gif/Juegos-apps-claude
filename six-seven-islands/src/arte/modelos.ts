// Carga de modelos glTF (los personajes de KayKit, CC0, y más adelante los de Meshy) y su paso al
// material del juego. Se descargan una vez y se reutilizan; sus materiales se cambian por
// MaterialDiorama con su textura, para que tengan la misma luz que el resto.

import { type Material, type Mesh, type Object3D, type Texture } from 'three/webgpu';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { mix, texture, vec3 } from 'three/tsl';
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

/**
 * Material del juego con la textura del modelo, teñida si se pide (r, g, b de 0 a 1). Con `mezcla`,
 * el tinte se mezcla en esa proporción en vez de multiplicar: así un uniforme se ve de su color
 * sobre cualquier ropa, también oscura (multiplicando, la ropa marrón salía casi negra).
 */
export function materialConTextura(mapa: Texture | null, op: OpcionesMaterial = {}, tinte?: readonly [number, number, number], mezcla?: number): MaterialDiorama {
  if (!mapa) return new MaterialDiorama(op);
  const color = texture(mapa).rgb;
  if (!tinte) return new MaterialDiorama(op, color);
  return new MaterialDiorama(op, mezcla ? mix(color, vec3(...tinte), mezcla) : color.mul(vec3(...tinte)));
}

/** Cambia los materiales de un objeto (por ejemplo, un personaje) por MaterialDiorama con su textura. */
export function aMaterialDelJuego(
  raiz: Object3D,
  op: OpcionesMaterial = {},
  tinte?: readonly [number, number, number],
  /** Las mallas que no se tiñen (la cabeza de un uniforme: se tiñe la ropa, no la cara). */
  sinTinte?: (m: Mesh) => boolean,
  /** Mezclar el tinte en esta proporción en vez de multiplicarlo (los uniformes). */
  mezcla?: number,
): MaterialDiorama[] {
  const hechos = new Map<Material, MaterialDiorama>();
  const libres = new Map<Material, MaterialDiorama>();
  raiz.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh) return;
    const viejo = (Array.isArray(m.material) ? m.material[0] : m.material) as Material & { map?: Texture | null };
    const libre = !!tinte && !!sinTinte?.(m);
    const cache = libre ? libres : hechos;
    let nuevo = cache.get(viejo);
    if (!nuevo) {
      nuevo = materialConTextura(viejo.map ?? null, op, libre ? undefined : tinte, libre ? undefined : mezcla);
      cache.set(viejo, nuevo);
    }
    m.material = nuevo;
    m.castShadow = true;
    m.receiveShadow = true;
  });
  return [...hechos.values(), ...libres.values()];
}
