// El material base compartido: la receta de la skill juego-3d (estilo.md), de un material propio
// en lugar de luz realista. Mate como el plástico o la arcilla, con:
//   1. color base de la paleta (o de los vértices),
//   2. rebote falso del suelo en las caras que miran abajo cerca de él,
//   3. luz multiplicada por su color,
//   4. sombra propia con un smoothstep del ángulo con la luz, de banda dura a suave,
//   5. sombra proyectada combinada con la propia,
//   6. sombras de color: en la sombra solo queda el relleno del cielo (colorBase × relleno),
//   7. niebla hacia el cielo (la pone la escena).
// Las criaturas añaden un brillo especular suave, el contraluz cálido y el destello de golpe.
// Es una biblioteca: la usan «mundo», «criaturas» y la escena de prueba; no importa subsistemas.

import {
  Color,
  LightingModel,
  MeshLambertNodeMaterial,
  type ColorRepresentation,
  type PhongLightingModel,
} from 'three/webgpu';
import type { LightingModelDirectInput } from 'three/src/nodes/core/LightingModel.js';
import type NodeBuilder from 'three/src/nodes/core/NodeBuilder.js';
import {
  BRDF_Lambert,
  diffuseColor,
  float,
  max,
  normalView,
  normalWorld,
  positionViewDirection,
  positionWorld,
  pow,
  smoothstep,
  uniform,
  vec3,
} from 'three/tsl';
import { COLORES } from './paleta';

/**
 * Un nodo de TSL. Los tipos de @types/three para TSL no cubren bien las operaciones encadenadas
 * dentro de un modelo de luz propio, así que aquí se trabaja sin tipo fino. La comprobación de
 * verdad es la compilación del shader al arrancar (WebGPU y WebGL2).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Nodo = any;

export interface OpcionesMaterial {
  color?: ColorRepresentation;
  /** Bordes del smoothstep de la sombra propia sobre N·L: juntos, banda dura; separados, suave. */
  bordes?: readonly [number, number];
  /** Brillo especular suave (criaturas). 0 = mate. */
  especular?: number;
  /** Dureza del brillo especular (Blinn-Phong). */
  dureza?: number;
  /** Contraluz cálido en el borde de la silueta (criaturas y jugador). */
  contraluz?: number;
  /** Rebote falso del color del suelo en las caras que miran abajo, cerca de él. */
  rebote?: number;
}

/** Los ajustes vivos de un material, para el panel de depuración y las animaciones. */
export interface AjustesMaterial {
  borde0: Nodo;
  borde1: Nodo;
  especular: Nodo;
  dureza: Nodo;
  contraluz: Nodo;
  rebote: Nodo;
  /** Destello blanco de 0 a 1, para el golpe. */
  destello: Nodo;
}

/** Altura del suelo para el rebote falso. La escena la fija. */
export const sueloY: Nodo = uniform(0);
const colorSuelo: Nodo = uniform(new Color(COLORES.hierbaMenta));
const colorContraluz: Nodo = uniform(new Color(COLORES.sol));

/** Cambia el color del rebote del suelo (la hierba al explorar, la arena en combate). */
export function fijarColorSuelo(c: ColorRepresentation): void {
  colorSuelo.value.set(c);
}

class LuzDiorama extends LightingModel {
  constructor(private readonly a: AjustesMaterial) {
    super();
  }

  direct(datos: LightingModelDirectInput): void {
    const { lightDirection, lightColor } = datos as Nodo;
    const reflectedLight = datos.reflectedLight as Nodo;
    const nl = normalView.dot(lightDirection);
    // Sombra propia (4); lightColor ya trae la proyectada (5) multiplicada.
    const luz = lightColor.mul(smoothstep(this.a.borde0, this.a.borde1, nl));
    reflectedLight.directDiffuse.addAssign(luz.mul(BRDF_Lambert({ diffuseColor: diffuseColor.rgb })));
    const medio = lightDirection.add(positionViewDirection).normalize();
    const brillo = pow(max(normalView.dot(medio), float(0)), this.a.dureza).mul(this.a.especular);
    reflectedLight.directSpecular.addAssign(luz.mul(brillo));
  }

  indirect(builder: NodeBuilder): void {
    const contexto = builder.context as unknown as { irradiance: Nodo; reflectedLight: { indirectDiffuse: Nodo } };
    // Relleno del cielo: es lo único que queda en la sombra, así que la tiñe (6).
    contexto.reflectedLight.indirectDiffuse.addAssign(
      contexto.irradiance.mul(BRDF_Lambert({ diffuseColor: diffuseColor.rgb })),
    );
  }
}

export class MaterialDiorama extends MeshLambertNodeMaterial {
  readonly ajustes: AjustesMaterial;

  /**
   * @param colorNodo color base por fragmento (patrones de las criaturas); si falta, `op.color`.
   * @param emisionExtra emisión propia (llamas, brillos de los ojos), que se suma al final.
   */
  constructor(op: OpcionesMaterial = {}, colorNodo?: Nodo, emisionExtra?: Nodo) {
    super({ color: op.color ?? '#ffffff' });
    const [b0, b1] = op.bordes ?? [-0.05, 0.45];
    const a: AjustesMaterial = {
      borde0: uniform(b0),
      borde1: uniform(b1),
      especular: uniform(op.especular ?? 0),
      dureza: uniform(op.dureza ?? 24),
      contraluz: uniform(op.contraluz ?? 0),
      rebote: uniform(op.rebote ?? 0.25),
      destello: uniform(0),
    };
    this.ajustes = a;
    if (colorNodo) this.colorNode = colorNodo;
    // Rebote falso (2): las caras que miran abajo y cerca del suelo toman su color.
    const abajo = smoothstep(0.1, -0.7, normalWorld.y);
    const cerca = smoothstep(0.9, 0.0, positionWorld.y.sub(sueloY));
    const rebote = colorSuelo.mul(diffuseColor.rgb).mul(abajo.mul(cerca).mul(a.rebote));
    // Contraluz: Fresnel cálido en el borde de la silueta.
    const fresnel = pow(float(1).sub(max(normalView.dot(positionViewDirection), float(0))), float(3));
    let emision = rebote.add(colorContraluz.mul(fresnel.mul(a.contraluz))).add(vec3(1, 0.96, 0.9).mul(a.destello));
    if (emisionExtra) emision = emision.add(emisionExtra);
    this.emissiveNode = emision;
  }

  // El tipo de la clase base pide su modelo Phong; el renderizador solo usa la interfaz común.
  setupLightingModel(): PhongLightingModel {
    return new LuzDiorama(this.ajustes) as unknown as PhongLightingModel;
  }
}
