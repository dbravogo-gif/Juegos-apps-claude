// Subsistema «personaje»: el jugador y los personajes de la isla y de sus interiores, con los
// personajes de KayKit (CC0) sin armas y animados (parado y andando). Dibuja al jugador donde dice
// «partida», interpolado entre pasos fijos. Si algo lo tapa (según las alturas de «mundo»), se ve
// su silueta. Quien habla con el jugador se gira hacia él. Los entrenadores enseñan su línea de
// visión en el suelo (ARTE.md, «Peligros»). Las estatuas las dibuja «salas». El generador de
// personajes llega en F12.

import {
  AnimationMixer,
  Box3,
  CapsuleGeometry,
  GreaterDepth,
  Group,
  InstancedMesh,
  LoopRepeat,
  Matrix4,
  Mesh,
  MeshBasicNodeMaterial,
  PlaneGeometry,
  SphereGeometry,
  Vector3,
  type AnimationAction,
  type BufferGeometry,
  type Material,
  type Object3D,
} from 'three/webgpu';
import { clone as clonarConEsqueleto } from 'three/addons/utils/SkeletonUtils.js';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { PASOS_POR_CASILLA, posicionVisual } from '../../core/explorar';
import { clave, deClave, enIsla, vision, type Direccion, type Personaje as DefPersonaje } from '../../core/mundo';
import { COLORES } from '../../arte/paleta';
import { alturaSuelo } from '../../arte/escala';
import { aMaterialDelJuego, cargarModelo, rutaModelo } from '../../arte/modelos';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Partida } from '../partida/partida';
import type { Mundo } from '../mundo/mundo';

const GIRO: Record<Direccion, number> = { s: 0, e: Math.PI / 2, n: Math.PI, o: -Math.PI / 2 };
/** Alto de las figuritas en el mundo (la casilla mide 1). */
const ALTO = 1.25;
/** Lo que sube la línea de vista hacia la cámara por cada casilla hacia el sur (cámara a 50°). */
const PENDIENTE = Math.tan((50 * Math.PI) / 180);
/** Altura del pecho del jugador: si algo la tapa, se enseña la silueta. */
const PECHO = 0.7;
const OPACIDAD_SILUETA = 0.7;

interface Figura {
  raiz: Group;
  mezclador: AnimationMixer;
  acciones: Map<string, AnimationAction>;
  actual: string;
}

/** Qué modelo de KayKit hace de cada personaje, hasta que lleguen las personas de F12. */
function modeloDe(p: DefPersonaje): string {
  if (p.id === 'anciano' || p.id === 'doctora') return 'Mage';
  if (p.id === 'lider-gimnasio') return 'Knight';
  if (p.entrenador) return p.entrenador.obligatorio ? 'Knight' : 'Barbarian';
  return 'Rogue_Hooded';
}

export class Personaje implements Subsistema {
  static readonly id = 'personaje';
  static readonly deps: readonly string[] = ['render', 'partida', 'mundo'];

  /** Posición del jugador en el mundo, para la cámara. */
  readonly posicion = new Vector3();
  private partida!: Partida;
  private mundo!: Mundo;
  private silueta!: MeshBasicNodeMaterial;
  private mallasSilueta: Mesh[] = [];
  private opacidad = 0;
  private jugador!: Figura;
  private figuras: Figura[] = [];
  /** Los personajes por id, con hacia dónde miran normalmente, para girarlos al hablar. */
  private porId = new Map<string, { figura: Figura; giro: number }>();
  private giro = 0;
  private geometrias: BufferGeometry[] = [];
  private materiales: Material[] = [];
  private objetos: Object3D[] = [];
  private quitar: (() => void)[] = [];

  async init(ctx: Ctx): Promise<void> {
    this.partida = ctx.get<Partida>('partida');
    this.mundo = ctx.get<Mundo>('mundo');
    const m = this.partida.mundo;
    const modelos = new Map<string, GLTF>();
    const cargar = async (nombre: string) => {
      if (!modelos.has(nombre)) modelos.set(nombre, await cargarModelo(rutaModelo(`kaykit/${nombre}.glb`)));
      return modelos.get(nombre)!;
    };

    // Jugador, con su silueta: solo se dibuja la parte que algo tapa (prueba de profundidad al
    // revés). Como también se pintaría sobre el propio jugador, solo se enciende cuando algo lo
    // tapa. Es clara (espuma), para que se vea sobre tejados, copas y el tejado azul del museo.
    this.jugador = this.figura(await cargar('Rogue'), 'Rogue');
    const silueta = new MeshBasicNodeMaterial({ color: COLORES.espuma, transparent: true, opacity: 0, depthWrite: false });
    silueta.depthFunc = GreaterDepth;
    this.silueta = silueta;
    const cuerpo = new CapsuleGeometry(0.3, 0.45, 4, 10).translate(0, 0.52, 0);
    const cabeza = new SphereGeometry(0.33, 14, 10).translate(0, 1.0, 0);
    this.geometrias.push(cuerpo, cabeza);
    this.materiales.push(silueta);
    for (const g of [cuerpo, cabeza]) {
      const malla = new Mesh(g, silueta);
      malla.renderOrder = 10;
      malla.visible = false;
      this.jugador.raiz.add(malla);
      this.mallasSilueta.push(malla);
    }
    ctx.escena.add(this.jugador.raiz);
    this.objetos.push(this.jugador.raiz);

    // Personajes de la isla y de los interiores, y lo que ven los entrenadores.
    const visiones: Matrix4[] = [];
    for (const mapa of [m, ...this.partida.interiores.values()]) {
      for (const z of mapa.zonas.values()) {
        for (const p of z.personajes) {
          if (p.id.startsWith('estatua-')) continue;
          const nombre = modeloDe(p);
          const f = this.figura(await cargar(nombre), nombre);
          const k = enIsla(mapa, z.id, p.x, p.y);
          const [x, y] = deClave(k);
          f.raiz.position.set(x, alturaSuelo(mapa.casillas.get(k)!.h), y);
          f.raiz.rotation.y = GIRO[p.mira];
          ctx.escena.add(f.raiz);
          this.objetos.push(f.raiz);
          this.porId.set(p.id, { figura: f, giro: GIRO[p.mira] });
          for (const v of vision(mapa, z.id, p)) {
            const [vx, vy] = deClave(v);
            visiones.push(new Matrix4().makeTranslation(vx, alturaSuelo(mapa.casillas.get(v)!.h) + 0.14, vy));
          }
        }
      }
    }
    // Quien habla con el jugador se gira hacia él, y al acabar vuelve a mirar donde miraba.
    this.quitar.push(
      ctx.eventos.on('dialogo:abrir', ({ guionId }) => {
        const q = this.porId.get(guionId);
        if (!q) return;
        const r = q.figura.raiz.position;
        q.figura.raiz.rotation.y = Math.atan2(this.posicion.x - r.x, this.posicion.z - r.z);
      }),
      ctx.eventos.on('dialogo:cerrar', ({ guionId }) => {
        const q = this.porId.get(guionId);
        if (q) q.figura.raiz.rotation.y = q.giro;
      }),
    );
    if (visiones.length) {
      const plano = new PlaneGeometry(0.8, 0.8).rotateX(-Math.PI / 2);
      const mv = new MeshBasicNodeMaterial({ color: COLORES.acentoCoral, transparent: true, opacity: 0.35, depthWrite: false });
      this.geometrias.push(plano);
      this.materiales.push(mv);
      const im = new InstancedMesh(plano, mv, visiones.length);
      visiones.forEach((mt, i) => im.setMatrixAt(i, mt));
      im.computeBoundingSphere();
      ctx.escena.add(im);
      this.objetos.push(im);
    }
    this.colocar(0, 0);
  }

  /** Una figurita: copia del modelo con su esqueleto, sin armas, a escala y con sus animaciones. */
  private figura(gltf: GLTF, nombre: string): Figura {
    const base = nombre.split('_')[0];
    const copia = clonarConEsqueleto(gltf.scene);
    copia.traverse((o) => {
      if (!(o as Mesh).isMesh) return;
      // Solo las piezas del cuerpo («Rogue_Body», «Mage_Hat»…); fuera armas, escudos y libros.
      o.visible = o.name.startsWith(`${base}_`) && !o.name.includes('Shield');
    });
    this.materiales.push(...aMaterialDelJuego(copia, { bordes: [-0.25, 0.5], especular: 0.1, dureza: 16, contraluz: 0.35 }));
    const caja = new Box3();
    copia.updateWorldMatrix(true, true);
    copia.traverse((o) => {
      if ((o as Mesh).isMesh && o.visible) caja.expandByObject(o);
    });
    const alto = caja.max.y - caja.min.y || 1;
    copia.scale.setScalar(ALTO / alto);
    const raiz = new Group();
    raiz.add(copia);
    const mezclador = new AnimationMixer(copia);
    const acciones = new Map<string, AnimationAction>();
    for (const clip of gltf.animations) acciones.set(clip.name, mezclador.clipAction(clip).setLoop(LoopRepeat, Infinity));
    const f: Figura = { raiz, mezclador, acciones, actual: '' };
    this.animar(f, 'Idle');
    this.figuras.push(f);
    return f;
  }

  private animar(f: Figura, nombre: string): void {
    if (f.actual === nombre) return;
    const nueva = f.acciones.get(nombre);
    if (!nueva) return;
    const vieja = f.acciones.get(f.actual);
    nueva.reset().play();
    if (vieja) nueva.crossFadeFrom(vieja, 0.15, false);
    f.actual = nombre;
  }

  private colocar(dt: number, alfa: number): void {
    const m = this.partida.activo();
    const e = this.partida.estado;
    const p = posicionVisual(e, alfa);
    const h0 = alturaSuelo(m.casillas.get(clave(e.desdeX, e.desdeY))?.h ?? 0);
    const h1 = alturaSuelo(m.casillas.get(clave(e.x, e.y))?.h ?? 0);
    const t = e.paso === 0 ? 1 : Math.min(1, (e.paso + alfa) / PASOS_POR_CASILLA);
    this.posicion.set(p.x, h0 + (h1 - h0) * t, p.y);
    this.jugador.raiz.position.copy(this.posicion);
    this.animar(this.jugador, e.paso > 0 ? 'Walking_A' : 'Idle');
    let objetivo = GIRO[e.mira];
    while (objetivo - this.giro > Math.PI) objetivo -= Math.PI * 2;
    while (objetivo - this.giro < -Math.PI) objetivo += Math.PI * 2;
    this.giro += (objetivo - this.giro) * Math.min(1, dt * 18 || 1);
    this.jugador.raiz.rotation.y = this.giro;

    const tapado = !e.dentro && this.tapado(Math.round(p.x), Math.round(p.y), this.posicion.y);
    this.opacidad += ((tapado ? OPACIDAD_SILUETA : 0) - this.opacidad) * Math.min(1, dt * 10 || 1);
    this.silueta.opacity = this.opacidad;
    for (const malla of this.mallasSilueta) malla.visible = this.opacidad > 0.02;
  }

  /** ¿Tapa algo el pecho del jugador? Mira las casillas al sur, entre él y la cámara. */
  private tapado(x: number, y: number, suelo: number): boolean {
    for (let d = 1; d <= 6; d++) {
      const alto = this.mundo.tapas.get(clave(x, y + d));
      if (alto !== undefined && alto > suelo + PECHO + PENDIENTE * (d - 0.5)) return true;
    }
    return false;
  }

  actualizar(dt: number, ctx: Ctx): void {
    this.colocar(dt, ctx.tiempo.alfa);
    for (const f of this.figuras) f.mezclador.update(dt);
  }

  dispose(): void {
    for (const q of this.quitar) q();
    for (const f of this.figuras) f.mezclador.stopAllAction();
    for (const o of this.objetos) o.removeFromParent();
    for (const g of this.geometrias) g.dispose();
    for (const m of this.materiales) m.dispose();
  }
}
