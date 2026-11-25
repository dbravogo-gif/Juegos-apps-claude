// Subsistema «estudio»: la vitrina 3D de la ficha de una criatura (autor, 2026-11-25).
//
// Un estudio lejos de la isla, como los interiores: un fondo degradado del color de su tipo, un
// pedestal y la criatura girando despacio. Con la ficha de Datos abierta sale a la derecha; con →
// ocupa la pantalla: ← → la giran, ↑ ↓ acercan y alejan (al alejarse del todo aparece la silueta
// del jugador a su tamaño de verdad) y A hace una pose. Allí carga su modelo detallado (textura a
// 2K) si lo tiene. Lo manda el menú con los eventos «estudio:*»; las flechas mantenidas las lee
// este subsistema, que va después de la cámara y la recoloca en cada fotograma mientras está abierto.

import {
  AnimationMixer,
  Box3,
  CanvasTexture,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicNodeMaterial,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
  type Color,
  type Fog,
  type Material,
  type PerspectiveCamera,
  type SkinnedMesh,
  type Texture,
} from 'three/webgpu';
import { clone as clonarConEsqueleto } from 'three/addons/utils/SkeletonUtils.js';
import { MaterialDiorama } from '../../arte/material';
import { cargarModelo, rutaModelo } from '../../arte/modelos';
import { figuraCriatura } from '../../arte/criaturas3d';
import { PERSONAS, PERSONA_JUGADOR, type DefPersona, type NombrePersona } from '../../arte/personas';
import { DATOS_COMBATE_PRUEBA as DATOS, MODELO_DE } from '../../data/combate-prueba';
import { MODELO_DETALLE } from '../../data/modelos-detalle';
import { TIPOS } from '../../data/tipos';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Entrada } from '../entrada/entrada';
import type { Partida } from '../partida/partida';
import type { Render } from '../render/render';

/** Dónde está el estudio: lejos de la isla y de la arena del combate (600, 0, 600). */
const ESTUDIO = new Vector3(-600, 0, 600);
/** El alto de la criatura en la vitrina, sea cual sea su tamaño de verdad: así se ven los detalles. */
const ALTO = 1.6;
/** Alto del pedestal. */
const PEDESTAL = 0.18;
/** El jugador mide 1,25 unidades en el juego y unos 1,70 m: unidades por metro. */
const METRO = 1.25 / 1.7;
/** De -0,55 (de cerca) a 1 (alejada del todo, junto a la silueta del jugador); 0, la vista normal. */
const ZOOM_MIN = -0.55;
const ZOOM_MAX = 1;
/** Desde qué zoom se ve la silueta del jugador. */
const ZOOM_SILUETA = 0.35;
/** Ángulo de la cámara sobre el horizonte. */
const ELEVACION = 0.2;
/** En la ficha, la criatura se corre a la derecha (la ficha ocupa la izquierda): parte del ancho. */
const DESPLAZAMIENTO_FICHA = 0.13;
const DURACION_POSE = 0.9;

export type ModoEstudio = 'cerrado' | 'ficha' | 'grande';

export class Estudio implements Subsistema {
  static readonly id = 'estudio';
  static readonly deps: readonly string[] = ['render', 'entrada', 'partida', 'camara'];

  modo: ModoEstudio = 'cerrado';
  private ctx!: Ctx;
  private render!: Render;
  private entrada!: Entrada;
  private partida!: Partida;
  private readonly grupo = new Group();
  private readonly soporte = new Group();
  private pedestal!: Mesh;
  private aro!: Mesh;
  private destello!: Mesh;
  private materialAro = new MeshBasicNodeMaterial({ color: '#ffffff' });
  private materialDestello = new MeshBasicNodeMaterial({ color: '#ffffff', transparent: true, depthWrite: false });
  private materialPedestal = new MaterialDiorama({ color: '#efe6d6', bordes: [-0.3, 0.6] });
  private figura: Group | null = null;
  /** La especie y el modelo que se ven, y el último pedido (para no pisar una carga con otra). */
  private especie = '';
  private modelo = '';
  private pedido = 0;
  private silueta: Group | null = null;
  private altoSilueta = 0;
  private personaSilueta = '';
  private fondos = new Map<string, Texture>();
  private guardado: { fondo: Color | Texture | null; niebla: Fog | null } | null = null;
  private giro = 0;
  private quieto = 0;
  private zoom = 0;
  private pose = -1;
  private readonly quitar: (() => void)[] = [];

  init(ctx: Ctx): void {
    this.ctx = ctx;
    this.render = ctx.get<Render>('render');
    this.entrada = ctx.get<Entrada>('entrada');
    this.partida = ctx.get<Partida>('partida');
    this.grupo.position.copy(ESTUDIO);
    this.grupo.visible = false;
    this.pedestal = new Mesh(new CylinderGeometry(1, 1.06, PEDESTAL, 48), this.materialPedestal);
    this.pedestal.position.y = PEDESTAL / 2;
    this.pedestal.receiveShadow = true;
    this.aro = new Mesh(new TorusGeometry(1, 0.03, 8, 64).rotateX(Math.PI / 2), this.materialAro);
    this.aro.position.y = PEDESTAL;
    this.destello = new Mesh(new TorusGeometry(1, 0.04, 8, 64).rotateX(Math.PI / 2), this.materialDestello);
    this.destello.position.y = PEDESTAL + 0.02;
    this.destello.visible = false;
    this.grupo.add(this.pedestal, this.aro, this.destello, this.soporte);
    ctx.escena.add(this.grupo);
    this.quitar.push(
      ctx.eventos.on('estudio:mostrar', (e) => this.mostrar(e.especie, e.modo)),
      ctx.eventos.on('estudio:cerrar', () => this.cerrar()),
      ctx.eventos.on('estudio:pose', () => {
        if (this.modo !== 'cerrado') this.pose = 0;
      }),
    );
  }

  private mostrar(especie: string, modo: 'ficha' | 'grande'): void {
    const antes = this.modo;
    this.modo = modo;
    this.grupo.visible = true;
    if (antes === 'cerrado') {
      this.guardado = { fondo: this.ctx.escena.background as Color | Texture | null, niebla: this.ctx.escena.fog as Fog | null };
      this.giro = 0.5;
    }
    if (modo === 'ficha') this.zoom = 0;
    this.quieto = 0;
    const tipo = DATOS.especies[especie]?.tipos[0] ?? TIPOS[0]!.id;
    this.ctx.escena.background = this.fondo(tipo);
    this.ctx.escena.fog = null;
    const color = TIPOS.find((t) => t.id === tipo)?.color ?? 0xffffff;
    this.materialAro.color.setHex(color);
    this.materialDestello.color.setHex(color);
    // En la ficha, su modelo del juego (ya está cargado del combate); a pantalla completa, el
    // detallado si lo tiene (autor: «solo mientras la miras»).
    const modelo = (modo === 'grande' && MODELO_DETALLE[especie]) || MODELO_DE[especie] || MODELO_DE['inicial-roca']!;
    if (especie !== this.especie || modelo !== this.modelo) void this.cargar(especie, modelo);
    void this.prepararSilueta();
  }

  private async cargar(especie: string, modelo: string): Promise<void> {
    const pedido = ++this.pedido;
    const cambia = especie !== this.especie;
    this.especie = especie;
    this.modelo = modelo;
    const figura = await figuraCriatura(modelo, 'color', ALTO);
    // Mientras cargaba, se pidió otra: esta ya no hace falta.
    if (pedido !== this.pedido || this.modo === 'cerrado') return;
    if (this.figura) this.soporte.remove(this.figura);
    this.figura = figura;
    figura.position.y = PEDESTAL;
    this.soporte.add(figura);
    // El pedestal, a la medida de su planta.
    const tam = new Box3().setFromObject(figura).getSize(new Vector3());
    const radio = Math.max(0.85, Math.max(tam.x, tam.z) * 0.62);
    this.pedestal.scale.set(radio, 1, radio);
    this.aro.scale.set(radio * 0.97, 1, radio * 0.97);
    this.destello.userData.radio = radio;
    if (cambia) this.colocarSilueta();
  }

  /** La silueta del jugador (su persona elegida), oscura y de pie, para comparar tamaños. */
  private async prepararSilueta(): Promise<void> {
    const persona = (this.partida.persona in PERSONAS ? this.partida.persona : PERSONA_JUGADOR) as NombrePersona;
    if (persona === this.personaSilueta) return;
    this.personaSilueta = persona;
    const def: DefPersona = PERSONAS[persona];
    const gltf = await cargarModelo(rutaModelo(def.archivo));
    const copia = clonarConEsqueleto(gltf.scene);
    const material: Material = new MeshBasicNodeMaterial({ color: '#2b2533' });
    copia.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      m.material = material;
      m.frustumCulled = false;
    });
    // De pie, con la postura de parado que usa el juego.
    const clip = def.parado ? gltf.animations.find((c) => c.name === def.parado!.clip) : undefined;
    if (clip) {
      const mezclador = new AnimationMixer(copia);
      mezclador.clipAction(clip).play();
      mezclador.setTime((def.parado!.fotograma ?? 0) / 30);
    }
    copia.updateWorldMatrix(true, true);
    // Con el esqueleto puesto al día: si no, la caja sale de los huesos sin calcular (demasiado
    // pequeña) y la silueta salía el doble de alta.
    copia.traverse((o) => (o as SkinnedMesh).skeleton?.update());
    const caja = new Box3().setFromObject(copia, true);
    const alto = caja.max.y - caja.min.y || 1;
    const raiz = new Group();
    copia.position.y = -caja.min.y;
    raiz.add(copia);
    raiz.userData.altoModelo = alto;
    if (this.silueta) this.grupo.remove(this.silueta);
    this.silueta = raiz;
    this.grupo.add(raiz);
    this.colocarSilueta();
  }

  /** A la escala de la criatura: si ella mide ALTO, el jugador mide lo que le toca de verdad. */
  private colocarSilueta(): void {
    const s = this.silueta;
    if (!s) return;
    const altura = DATOS.especies[this.especie]?.altura ?? 0.5;
    this.altoSilueta = ALTO * (1.25 / Math.max(0.05, altura * METRO));
    s.scale.setScalar(this.altoSilueta / (s.userData.altoModelo as number));
    const radio = (this.destello.userData.radio as number | undefined) ?? 1;
    s.position.set(-(radio + this.altoSilueta * 0.22), 0, -0.2);
    s.rotation.y = 0.35;
  }

  private cerrar(): void {
    if (this.modo === 'cerrado') return;
    this.modo = 'cerrado';
    this.grupo.visible = false;
    this.pedido++;
    const camara = this.ctx.camara as PerspectiveCamera;
    camara.clearViewOffset();
    if (this.guardado) {
      this.ctx.escena.fog = this.guardado.niebla;
      // El fondo, el de donde se está (el cielo o el de las salas).
      this.render.fondo(this.ctx, !!this.partida.estado?.dentro);
      this.guardado = null;
    }
  }

  /** Un degradado radial del color de su tipo: claro detrás de la criatura y más hondo en los bordes. */
  private fondo(tipo: string): Texture {
    let t = this.fondos.get(tipo);
    if (t) return t;
    const color = TIPOS.find((x) => x.id === tipo)?.color ?? 0x9a7e64;
    const mezcla = (b: number, k: number) => {
      const c = (d: number) => Math.round(((color >> d) & 255) * (1 - k) + ((b >> d) & 255) * k);
      return `rgb(${c(16)}, ${c(8)}, ${c(0)})`;
    };
    const lienzo = document.createElement('canvas');
    lienzo.width = lienzo.height = 512;
    const g = lienzo.getContext('2d')!;
    const r = g.createRadialGradient(330, 230, 20, 300, 260, 420);
    r.addColorStop(0, mezcla(0xfffaf0, 0.86));
    r.addColorStop(0.45, mezcla(0xfff2e0, 0.55));
    r.addColorStop(1, mezcla(0x1d1720, 0.45));
    g.fillStyle = r;
    g.fillRect(0, 0, 512, 512);
    t = new CanvasTexture(lienzo);
    t.colorSpace = SRGBColorSpace;
    this.fondos.set(tipo, t);
    return t;
  }

  actualizar(dt: number, ctx: Ctx): void {
    if (this.modo === 'cerrado') return;
    // A pantalla completa, las flechas mantenidas giran y acercan (las pulsaciones sueltas son del menú).
    if (this.modo === 'grande') {
      const d = this.entrada.direccion(false);
      if (d) this.quieto = 0;
      if (d === 'e') this.giro += 2.2 * dt;
      if (d === 'o') this.giro -= 2.2 * dt;
      if (d === 'n') this.zoom = Math.max(ZOOM_MIN, this.zoom - 1.1 * dt);
      if (d === 's') this.zoom = Math.min(ZOOM_MAX, this.zoom + 1.1 * dt);
    }
    // Sin tocar nada, gira sola, despacio.
    this.quieto += dt;
    if (this.quieto > 1.5) this.giro += 0.45 * dt;
    this.soporte.rotation.y = this.giro;
    this.animarPose(dt);
    if (this.silueta) this.silueta.visible = this.modo === 'grande' && this.zoom > ZOOM_SILUETA;
    this.colocarCamara(ctx);
    this.render.enfocar(ESTUDIO.x, 0.6, ESTUDIO.z);
  }

  /** La pose: un saltito con su aplastamiento al caer y un aro del color de su tipo que se abre. */
  private animarPose(dt: number): void {
    const f = this.figura;
    if (!f) return;
    if (this.pose < 0) {
      f.position.y = PEDESTAL;
      f.scale.set(1, 1, 1);
      this.destello.visible = false;
      return;
    }
    this.pose += dt;
    const t = this.pose;
    const salto = t < 0.5 ? Math.sin((Math.PI * t) / 0.5) : 0;
    f.position.y = PEDESTAL + salto * ALTO * 0.22;
    // Al despegar se estira; al caer, se aplasta y recupera.
    const aplasta = t < 0.08 ? -t / 0.08 : t > 0.5 && t < 0.72 ? Math.sin((Math.PI * (t - 0.5)) / 0.22) : t < 0.5 ? 1 - t / 0.5 : 0;
    const sy = t < 0.5 ? 1 + 0.08 * aplasta : 1 - 0.12 * aplasta;
    f.scale.set(1 / Math.sqrt(sy), sy, 1 / Math.sqrt(sy));
    const radio = (this.destello.userData.radio as number | undefined) ?? 1;
    this.destello.visible = t > 0.45;
    const k = Math.max(0, (t - 0.45) / (DURACION_POSE - 0.45));
    this.destello.scale.setScalar(radio * (1 + k * 1.4));
    this.materialDestello.opacity = 1 - k;
    if (t >= DURACION_POSE) this.pose = -1;
  }

  private colocarCamara(ctx: Ctx): void {
    const camara = ctx.camara as PerspectiveCamera;
    const aspecto = window.innerWidth / Math.max(1, window.innerHeight);
    // Alejada del todo, el encuadre abarca la criatura y la silueta del jugador, a lo alto y a lo ancho.
    const radio = (this.destello.userData.radio as number | undefined) ?? 1;
    const izquierda = this.silueta ? this.silueta.position.x - this.altoSilueta * 0.22 : -radio;
    const anchoJuntos = radio - izquierda;
    const centroJuntos = (radio + izquierda) / 2;
    const altoJuntos = Math.max(ALTO + PEDESTAL, this.altoSilueta || 0);
    const comparar = Math.max(altoJuntos, anchoJuntos / aspecto) * 1.15;
    // En la ficha, algo más lejos: la criatura cabe entre la ficha y la columna de opciones.
    const detalle = ALTO * (this.modo === 'ficha' ? 1.9 : 1.4);
    let alto: number;
    let miraY: number;
    let miraX = 0;
    if (this.zoom < 0) {
      // De cerca: hacia la cabeza.
      const k = this.zoom / ZOOM_MIN;
      alto = detalle * (1 - 0.6 * k);
      miraY = PEDESTAL + ALTO * (0.5 + 0.2 * k);
    } else {
      const k = this.zoom;
      alto = detalle + (comparar - detalle) * k;
      miraY = PEDESTAL + ALTO * 0.5 + (altoJuntos / 2 - ALTO * 0.5) * k;
      miraX = centroJuntos * k;
    }
    const distancia = alto / 2 / Math.tan(((camara.fov / 2) * Math.PI) / 180);
    camara.position.set(ESTUDIO.x + miraX, ESTUDIO.y + miraY + Math.sin(ELEVACION) * distancia, ESTUDIO.z + Math.cos(ELEVACION) * distancia);
    camara.lookAt(ESTUDIO.x + miraX, ESTUDIO.y + miraY, ESTUDIO.z);
    const ancho = window.innerWidth;
    const altoPantalla = window.innerHeight;
    if (this.modo === 'ficha') camara.setViewOffset(ancho, altoPantalla, -ancho * DESPLAZAMIENTO_FICHA, 0, ancho, altoPantalla);
    else camara.clearViewOffset();
  }

  dispose(): void {
    for (const q of this.quitar) q();
    this.cerrar();
    this.ctx.escena.remove(this.grupo);
    this.pedestal.geometry.dispose();
    this.aro.geometry.dispose();
    this.destello.geometry.dispose();
    this.materialAro.dispose();
    this.materialDestello.dispose();
    this.materialPedestal.dispose();
    for (const t of this.fondos.values()) t.dispose();
  }
}
