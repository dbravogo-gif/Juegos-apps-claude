// Las criaturas de Meshy en el juego (ARTE.md): llevan la luz pintada en la textura y se dibujan
// sin la luz del juego, iguales en cualquier sitio (autor, 2026-11-10). La misma malla sirve de
// estatua en piedra, esta sí con la luz del juego. Los modelos se descargan una vez y se clonan.

import { Box3, Group, Mesh, MeshBasicNodeMaterial, Vector3, type Material, type Object3D, type Texture } from 'three/webgpu';
import { pow, texture, vec3 } from 'three/tsl';
import { MaterialDiorama } from './material';
import { COLORES } from './paleta';
import { cargarModelo, rutaModelo } from './modelos';

/** El modelo de la primera forma de cada inicial, por su id (el de su tipo principal). */
export const MODELO_INICIAL: Readonly<Record<string, string>> = {
  agua: 'iniciales/inicial-agua-1.glb',
  planta: 'iniciales/inicial-planta-1.glb',
  infernal: 'iniciales/inicial-infernal-1.glb',
  roca: 'iniciales/inicial-roca-1.glb',
};

export type Acabado = 'color' | 'piedra';

/**
 * Retoques de color por modelo, cuando la textura de Meshy sale más oscura que su dibujo. `luz`
 * aclara las sombras (una curva sobre el color lineal: 1 lo deja igual; menos, aclara más lo oscuro
 * que lo claro). La inicial de fuego salió casi negra (gris 23 sobre 255 en pantalla) cuando su
 * dibujo es gris carbón (unos 65): con 0,7 queda en unos 55 y las llamas, igual de naranjas
 * (autor, 2026-11-13).
 */
export const RETOQUE: Readonly<Record<string, { luz: number }>> = {
  'iniciales/inicial-infernal-1.glb': { luz: 0.7 },
};

const materiales = new Map<string, Material>();

/** Unlit con su textura: así se ve como en el visor de Meshy, con su luz pintada. También para las personas. */
export function materialColor(mapa: Texture | null, luz = 1): Material {
  const clave = `color:${mapa?.uuid ?? ''}:${luz}`;
  let m = materiales.get(clave);
  if (!m) {
    const b = new MeshBasicNodeMaterial({ map: mapa ?? undefined });
    if (mapa && luz !== 1) b.colorNode = pow(texture(mapa).rgb, vec3(luz));
    // Sin el mapeo tonal del juego, que apagaba un poco sus colores respecto al visor.
    b.toneMapped = false;
    m = b;
    materiales.set(clave, m);
  }
  return m;
}

/** Piedra con la luz del juego: el brillo de la textura da el relieve de ojos y marcas. */
function materialPiedra(mapa: Texture | null): Material {
  const clave = `piedra:${mapa?.uuid ?? ''}`;
  let m = materiales.get(clave);
  if (!m) {
    if (mapa) {
      const brillo = texture(mapa).rgb.dot(vec3(0.299, 0.587, 0.114));
      m = new MaterialDiorama({ bordes: [-0.1, 0.45], rebote: 0.12 }, vec3(0.62, 0.6, 0.57).mul(brillo.mul(0.7).add(0.55)));
    } else {
      m = new MaterialDiorama({ color: COLORES.piedraEstatua, bordes: [-0.1, 0.45] });
    }
    materiales.set(clave, m);
  }
  return m;
}

/**
 * Una criatura lista para poner en la escena: con la base en el origen, centrada y mirando al sur
 * (hacia la cámara; las de Meshy miran a +z). Se escala a `tamano`: su alto o, si es larga y baja
 * como el lagarto, tres cuartos de su largo, para que todas pesen parecido en pantalla.
 */
export async function figuraCriatura(modelo: string, acabado: Acabado, tamano: number): Promise<Group> {
  const gltf = await cargarModelo(rutaModelo(modelo));
  const copia = gltf.scene.clone(true);
  copia.traverse((o: Object3D) => {
    const malla = o as Mesh;
    if (!malla.isMesh) return;
    const viejo = (Array.isArray(malla.material) ? malla.material[0] : malla.material) as Material & { map?: Texture | null };
    malla.material = acabado === 'color' ? materialColor(viejo.map ?? null, RETOQUE[modelo]?.luz) : materialPiedra(viejo.map ?? null);
    malla.castShadow = true;
    malla.receiveShadow = acabado === 'piedra';
  });
  const caja = new Box3().setFromObject(copia);
  const tam = caja.getSize(new Vector3());
  const escala = tamano / Math.max(tam.y, Math.max(tam.x, tam.z) * 0.75);
  const centro = caja.getCenter(new Vector3());
  copia.scale.setScalar(escala);
  copia.position.set(-centro.x * escala, -caja.min.y * escala, -centro.z * escala);
  const raiz = new Group();
  raiz.add(copia);
  return raiz;
}

/** Suelta los materiales compartidos (al cerrar el juego). */
export function soltarMaterialesCriaturas(): void {
  for (const m of materiales.values()) m.dispose();
  materiales.clear();
}
