// Subsistema «render»: dueño del renderizador, la luz, las sombras, la niebla y el cielo.
// WebGPU si el navegador lo tiene; si no, Three.js cae solo a WebGL2. Colores: src/arte/paleta.ts.

import {
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  NeutralToneMapping,
  PCFShadowMap,
  Vector3,
  WebGPURenderer,
} from 'three/webgpu';
import type { Ctx, Subsistema } from '../../motor/motor';
import { COLORES } from '../../arte/paleta';


/** Del punto enfocado al sol: la luz entra siempre igual, de lado y desde arriba. */
const HACIA_SOL = new Vector3(-22, 28, 12);
// Ejes de la cámara de la sombra, como los pone Matrix4.lookAt: z hacia el sol, x = arriba × z.
const EJE_Z = HACIA_SOL.clone().normalize();
const EJE_X = new Vector3(0, 1, 0).cross(EJE_Z).normalize();
const EJE_Y = EJE_Z.clone().cross(EJE_X);

/**
 * Lleva un punto a la rejilla de texeles de la sombra, en el plano de la luz. Si la sombra se
 * mueve de medio texel en medio texel cuando la cámara se desliza (al hablar o al andar), sus
 * bordes y las rayas de las paredes «nadan»; moviéndose de texel en texel, se quedan quietas.
 */
export function ajustarATexel(p: Vector3, texel: number, res = new Vector3()): Vector3 {
  const u = Math.round(p.dot(EJE_X) / texel) * texel;
  const v = Math.round(p.dot(EJE_Y) / texel) * texel;
  return res.copy(EJE_X).multiplyScalar(u).addScaledVector(EJE_Y, v).addScaledVector(EJE_Z, p.dot(EJE_Z));
}

export interface Contadores {
  backend: string;
  llamadas: number;
  triangulos: number;
  geometrias: number;
  texturas: number;
  memoriaTexturasMB: number;
  densidad: number;
}

export class Render implements Subsistema {
  static readonly id = 'render';
  static readonly deps: readonly string[] = [];

  renderer!: WebGPURenderer;
  backend = '';
  sol!: DirectionalLight;
  private relleno!: HemisphereLight;
  private quitarOyente: (() => void) | null = null;

  async init(ctx: Ctx): Promise<void> {
    const lienzo = document.getElementById('lienzo') as HTMLCanvasElement;
    const calidad = ctx.config.calidad;
    const densidad = Math.min(window.devicePixelRatio || 1, calidad.densidadMax);
    // Antialias solo si la densidad es menor que 2 (rendimiento.md).
    this.renderer = new WebGPURenderer({ canvas: lienzo, antialias: densidad < 2 });
    await this.renderer.init();
    const backend = this.renderer.backend as { isWebGPUBackend?: boolean };
    this.backend = backend.isWebGPUBackend ? 'WebGPU' : 'WebGL2';

    this.renderer.setPixelRatio(densidad);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = NeutralToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;

    const escena = ctx.escena;
    escena.background = new Color(COLORES.cieloMelocoton);
    escena.fog = new Fog(COLORES.cieloMelocoton, 45, 110);

    // Relleno azulado del cielo y rebote del suelo; el sol de tarde entra de lado a ~48°
    // (a 35° las casas de KayKit tapaban media calle con su sombra).
    this.relleno = new HemisphereLight(COLORES.rellenoCielo, COLORES.hierbaMenta, 1.5);
    escena.add(this.relleno);
    this.sol = new DirectionalLight(COLORES.sol, 2.3);
    this.sol.position.copy(HACIA_SOL);
    this.sol.castShadow = true;
    const camSombra = this.sol.shadow.camera;
    camSombra.left = -16;
    camSombra.right = 16;
    camSombra.top = 16;
    camSombra.bottom = -16;
    camSombra.near = 1;
    camSombra.far = 80;
    this.sol.shadow.mapSize.set(calidad.sombras, calidad.sombras);
    this.sol.shadow.bias = -0.0005;
    escena.add(this.sol);
    escena.add(this.sol.target);

    this.quitarOyente = ctx.eventos.on('calidad:cambio', () => this.aplicarCalidad(ctx));
  }

  private readonly foco = new Vector3();

  /** Centra el sol y su sombra en un punto de la isla (lo llama la cámara al moverse). */
  enfocar(x: number, y: number, z: number): void {
    const cam = this.sol.shadow.camera;
    const texel = (cam.right - cam.left) / this.sol.shadow.mapSize.x;
    ajustarATexel(this.foco.set(x, y, z), texel, this.sol.target.position);
    this.sol.position.copy(this.sol.target.position).add(HACIA_SOL);
    this.sol.target.updateMatrixWorld();
  }

  private aplicarCalidad(ctx: Ctx): void {
    const calidad = ctx.config.calidad;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, calidad.densidadMax));
    if (this.sol.shadow.mapSize.x !== calidad.sombras) {
      this.sol.shadow.mapSize.set(calidad.sombras, calidad.sombras);
      this.sol.shadow.map?.dispose();
      this.sol.shadow.map = null;
    }
  }

  redimensionar(ancho: number, alto: number, ctx: Ctx): void {
    this.renderer.setSize(ancho, alto);
    ctx.camara.aspect = ancho / alto;
    ctx.camara.updateProjectionMatrix();
  }

  dibujar(ctx: Ctx): void {
    this.renderer.render(ctx.escena, ctx.camara);
    // Foto de los contadores justo al dibujar: el bucle interno de Three.js (Animation.js) los
    // pone a cero al empezar cada fotograma, así que leídos en otro momento salen a 0.
    const info = this.renderer.info;
    const f = this.foto;
    f.backend = this.backend;
    f.llamadas = info.render.drawCalls;
    f.triangulos = info.render.triangles;
    f.geometrias = info.memory.geometries;
    f.texturas = info.memory.textures;
    f.memoriaTexturasMB = Math.round(((info.memory as { texturesSize?: number }).texturesSize ?? 0) / 1048576);
    f.densidad = this.renderer.getPixelRatio();
  }

  private readonly foto: Contadores = {
    backend: '',
    llamadas: 0,
    triangulos: 0,
    geometrias: 0,
    texturas: 0,
    memoriaTexturasMB: 0,
    densidad: 0,
  };

  /** Contadores del último fotograma dibujado, para el presupuesto de rendimiento. */
  contadores(): Contadores {
    return { ...this.foto };
  }

  dispose(): void {
    this.quitarOyente?.();
    this.sol.shadow.map?.dispose();
    this.renderer.dispose();
  }
}
