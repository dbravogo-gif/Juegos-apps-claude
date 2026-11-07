// Generador de criaturas por piezas (ARTE.md): convierte una ficha de aspecto en geometría.
// Cada pieza se modela con primitivos (tornos, esferas, tubos), se coloca sobre la superficie del
// cuerpo o de la cabeza y se fusiona con las demás que se mueven juntas: un «hueso» es un grupo de
// piezas que se anima como una sola malla. Así cada criatura cuesta pocas llamadas de dibujo.
//
// Atributos de cada vértice, además de posición y normal:
//   color      color base (lineal)
//   emision    0 a 1: cuánto brilla por sí mismo (llamas, brillos de los ojos)
//   patron     1 donde se pinta el patrón (cuerpo y cabeza), 0 en el resto
//   posPatron  posición en el espacio de la criatura, en radios del cuerpo y con el origen en su
//              centro: el patrón no se mueve aunque la pieza se anime.

import {
  BufferAttribute,
  Color,
  CapsuleGeometry,
  LatheGeometry,
  Matrix4,
  OctahedronGeometry,
  QuadraticBezierCurve3,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  type BufferGeometry,
} from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { AspectoCriatura, ColorPieza, FormaCuerpo } from '../../core/aspecto';
import { COLORES } from '../../arte/paleta';

/** Los grupos que se animan por separado. */
export const HUESOS = ['cuerpo', 'cabeza', 'ojos', 'copete', 'cola', 'apendiceI', 'apendiceD'] as const;
export type Hueso = (typeof HUESOS)[number];

/** Padre de cada hueso en la jerarquía. «cuerpo» cuelga de la raíz de la criatura. */
export const PADRE: Record<Hueso, Hueso | null> = {
  cuerpo: null,
  cabeza: 'cuerpo',
  ojos: 'cabeza',
  copete: 'cabeza',
  cola: 'cuerpo',
  apendiceI: 'cuerpo',
  apendiceD: 'cuerpo',
};

export interface ColoresCriatura {
  principal: Color;
  secundario: Color;
  claro: Color;
  oscuro: Color;
  hueso: Color;
  vientre: Color;
  ojo: Color;
  brillo: Color;
  mejilla: Color;
  boca: Color;
}

export interface PlanoCriatura {
  /** Geometría de cada hueso en su espacio local (el origen es su pivote), o null si no lleva. */
  geometrias: Record<Hueso, BufferGeometry | null>;
  /** Pivote de cada hueso en el espacio de la criatura. */
  pivotes: Record<Hueso, Vector3>;
  colores: ColoresCriatura;
  /** Radio y alto del cuerpo, sin la escala de la ficha. */
  radio: number;
  alto: number;
  /** Altura total con las piezas, sin la escala de la ficha. */
  altoTotal: number;
  /** Óvalo de la tripa en el espacio del patrón: centro en Y y semiejes. Siempre bajo la boca. */
  vientre: { y: number; rx: number; ry: number };
}

const SEG_RADIAL = 28;
const SEG_PERFIL = 20;
const HUNDIDO = 0.03; // fracción del alto que el cuerpo se hunde en el suelo para asentarse

function lerpSrgb(a: number | string, b: number | string, t: number): Color {
  // Mezcla en sRGB (más parecida a como se ve) y devuelve el color en lineal.
  const ca = new Color(a).convertLinearToSRGB();
  const cb = new Color(b).convertLinearToSRGB();
  return ca.lerp(cb, t).convertSRGBToLinear();
}

export function coloresDe(a: AspectoCriatura, principal: number): ColoresCriatura {
  return {
    principal: new Color(principal),
    secundario: new Color(a.secundario),
    claro: lerpSrgb(principal, COLORES.crema, 0.55),
    oscuro: lerpSrgb(principal, '#3B2F5E', 0.42),
    hueso: new Color('#F6EAD2'),
    vientre: lerpSrgb(principal, COLORES.crema, 0.72),
    ojo: new Color(COLORES.ojo),
    brillo: new Color('#FFFFFF'),
    mejilla: lerpSrgb(principal, '#FF9FB0', 0.6),
    boca: lerpSrgb(principal, COLORES.ojo, 0.8),
  };
}

/**
 * Perfil del torno de un cuerpo: de abajo arriba, con el radio normalizado a 1 como máximo y la
 * altura de 0 a 1. «anguloso» da hombros a la cápsula y más punta a la gota.
 */
export function perfil(forma: FormaCuerpo, anguloso: number, n = SEG_PERFIL): Vector2[] {
  const pts: Vector2[] = [];
  let maxR = 0;
  for (let i = 0; i <= n; i++) {
    const phi = (i / n) * Math.PI;
    const s = Math.sin(phi);
    const c = Math.cos(phi);
    let r = s;
    let y = (1 - c) / 2;
    if (forma === 'capsula') {
      const e = 2.6 + anguloso * 1.6;
      r = Math.pow(s, 2 / e);
      y = (1 - Math.sign(c) * Math.pow(Math.abs(c), 2 / e)) / 2;
    } else if (forma === 'pera') {
      r = s * (1 + 0.38 * c);
    } else if (forma === 'gota') {
      r = s * Math.pow((1 + c) / 2, 0.75 + anguloso * 0.5);
    }
    if (i === 0 || i === n) r = 0;
    maxR = Math.max(maxR, r);
    pts.push(new Vector2(r, y));
  }
  for (const p of pts) p.x /= maxR;
  return pts;
}

/** Superficie de revolución (cuerpo o cabeza) donde se apoyan las piezas. */
class Superficie {
  constructor(
    private readonly pts: Vector2[],
    readonly radio: number,
    readonly alto: number,
    readonly base: Vector3,
  ) {}

  /**
   * Punto y normal a la altura relativa `v` (0 abajo, 1 arriba) y con el acimut dado (0 = de
   * frente, hacia +z; positivo hacia +x).
   */
  punto(v: number, acimut: number): { p: Vector3; n: Vector3 } {
    const pts = this.pts;
    let i = 0;
    while (i < pts.length - 2 && pts[i + 1].y < v) i++;
    const a = pts[i];
    const b = pts[i + 1];
    const t = b.y === a.y ? 0 : Math.min(1, Math.max(0, (v - a.y) / (b.y - a.y)));
    const r = (a.x + (b.x - a.x) * t) * this.radio;
    const dr = (b.x - a.x) * this.radio;
    const dy = (b.y - a.y) * this.alto;
    const largo = Math.hypot(dr, dy) || 1;
    const nr = dy / largo;
    const ny = -dr / largo;
    const sx = Math.sin(acimut);
    const sz = Math.cos(acimut);
    return {
      p: new Vector3(sx * r, v * this.alto, sz * r).add(this.base),
      n: new Vector3(sx * nr, ny, sz * nr).normalize(),
    };
  }

  geometria(segmentos = SEG_RADIAL): BufferGeometry {
    const g = new LatheGeometry(
      this.pts.map((p) => new Vector2(p.x * this.radio, p.y * this.alto)),
      segmentos,
    );
    g.translate(this.base.x, this.base.y, this.base.z);
    return g;
  }
}

/**
 * Matriz que coloca una pieza modelada a lo largo de +Y (con la base en el origen): su eje Y va a
 * `arriba` y su cara (+Z) mira hacia `cara` en lo posible.
 */
function orientar(origen: Vector3, arriba: Vector3, cara: Vector3, escala: Vector3): Matrix4 {
  const y = arriba.clone().normalize();
  let z = cara.clone().sub(y.clone().multiplyScalar(cara.dot(y)));
  if (z.lengthSq() < 1e-6) z = new Vector3(0, 0, 1).sub(y.clone().multiplyScalar(y.z));
  z.normalize();
  const x = new Vector3().crossVectors(y, z).normalize();
  return new Matrix4().makeBasis(x, y, z).setPosition(origen).scale(escala);
}

/** Gota de altura 1 y radio 0,5, de abajo (redonda) a arriba (punta). Base en el origen. */
function gota(punta: number, seg = 14, perfilSeg = 12): BufferGeometry {
  const pts = perfil('gota', punta, perfilSeg).map((p) => new Vector2(p.x * 0.5, p.y));
  return new LatheGeometry(pts, seg);
}

/** Hoja: gota aplastada y un poco curvada hacia atrás (−Z). */
function hoja(punta: number): BufferGeometry {
  const g = gota(0.6 + punta * 0.6, 12, 12);
  g.scale(1, 1, 0.24);
  const pos = g.attributes.position as BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) - 0.18 * pos.getY(i) ** 2);
  g.computeVertexNormals();
  return g;
}

/** Tubo que se estrecha a lo largo de una curva: colas. */
function tuboConico(curva: QuadraticBezierCurve3, r0: number, r1: number, seg = 10, radial = 10): BufferGeometry {
  const g = new TubeGeometry(curva, seg, 1, radial, false);
  const pos = g.attributes.position as BufferAttribute;
  const centro = new Vector3();
  const v = new Vector3();
  for (let i = 0; i <= seg; i++) {
    curva.getPointAt(i / seg, centro);
    const r = r0 + (r1 - r0) * (i / seg);
    for (let j = 0; j <= radial; j++) {
      const k = i * (radial + 1) + j;
      v.fromBufferAttribute(pos, k).sub(centro).multiplyScalar(r).add(centro);
      pos.setXYZ(k, v.x, v.y, v.z);
    }
  }
  g.computeVertexNormals();
  return g;
}

interface Opciones {
  emision?: number;
  patron?: 0 | 1;
  /** Color de cada vértice a partir de su posición local antes de colocarlo (degradados). */
  colorVertice?: (local: Vector3) => Color;
}

/** Junta las piezas de cada hueso, con sus atributos, y las fusiona al final. */
class Montaje {
  private readonly partes = new Map<Hueso, BufferGeometry[]>();

  constructor(
    private readonly pivotes: Record<Hueso, Vector3>,
    private readonly centro: Vector3,
    private readonly radio: number,
  ) {}

  anadir(hueso: Hueso, g: BufferGeometry, m: Matrix4, color: Color, op: Opciones = {}): void {
    g.deleteAttribute('uv');
    // Para fusionar, todas con índice: a las que no lo traen (poliedros) se les pone el trivial.
    if (!g.index) g.setIndex([...Array(g.attributes.position.count).keys()]);
    const pos = g.attributes.position as BufferAttribute;
    const n = pos.count;
    const colores = new Float32Array(n * 3);
    const local = new Vector3();
    for (let i = 0; i < n; i++) {
      const c = op.colorVertice ? op.colorVertice(local.fromBufferAttribute(pos, i)) : color;
      colores[i * 3] = c.r;
      colores[i * 3 + 1] = c.g;
      colores[i * 3 + 2] = c.b;
    }
    g.applyMatrix4(m);
    const posPatron = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      posPatron[i * 3] = (pos.getX(i) - this.centro.x) / this.radio;
      posPatron[i * 3 + 1] = (pos.getY(i) - this.centro.y) / this.radio;
      posPatron[i * 3 + 2] = (pos.getZ(i) - this.centro.z) / this.radio;
    }
    g.setAttribute('color', new BufferAttribute(colores, 3));
    g.setAttribute('emision', new BufferAttribute(new Float32Array(n).fill(op.emision ?? 0), 1));
    g.setAttribute('patron', new BufferAttribute(new Float32Array(n).fill(op.patron ?? 0), 1));
    g.setAttribute('posPatron', new BufferAttribute(posPatron, 3));
    const p = this.pivotes[hueso];
    g.translate(-p.x, -p.y, -p.z);
    const lista = this.partes.get(hueso) ?? [];
    lista.push(g);
    this.partes.set(hueso, lista);
  }

  fusionar(): Record<Hueso, BufferGeometry | null> {
    const salida = {} as Record<Hueso, BufferGeometry | null>;
    for (const h of HUESOS) {
      const lista = this.partes.get(h);
      if (!lista || lista.length === 0) {
        salida[h] = null;
        continue;
      }
      const g = mergeGeometries(lista, false);
      if (!g) throw new Error(`No se han podido fusionar las piezas del hueso «${h}»`);
      for (const parte of lista) parte.dispose();
      g.computeBoundingSphere();
      salida[h] = g;
    }
    return salida;
  }
}

const ARRIBA = new Vector3(0, 1, 0);
const FRENTE = new Vector3(0, 0, 1);

/** Construye la geometría de una criatura a partir de su ficha y del color de su tipo. */
export function construir(a: AspectoCriatura, colorTipo: number): PlanoCriatura {
  const col = coloresDe(a, colorTipo);
  const colorDe = (c: ColorPieza): Color => col[c];
  const ang = a.anguloso;

  const R = a.cuerpo.ancho / 2;
  const H = a.cuerpo.alto;
  const hundido = H * HUNDIDO;
  const cuerpo = new Superficie(perfil(a.cuerpo.forma, ang), R, H, new Vector3(0, -hundido, 0));
  const centro = new Vector3(0, H / 2 - hundido, 0);

  // La cara va en la cabeza si la hay; si no, en el propio cuerpo.
  const cab = a.piezas.cabeza;
  const Rc = cab ? cab.tamano * R : R;
  const cara = cab
    ? new Superficie(perfil('esfera', 0), Rc, 2 * Rc, new Vector3(0, H * 0.92 - hundido - Rc * 0.45, R * 0.1))
    : cuerpo;
  const altoCara = cara.base.y + cara.alto;

  const ojoIzq = cara.punto(a.ojos.altura, -a.ojos.separacion);
  const ojoDer = cara.punto(a.ojos.altura, a.ojos.separacion);
  const cima = cara.punto(0.985, 0);
  const pivotes: Record<Hueso, Vector3> = {
    cuerpo: new Vector3(0, 0, 0),
    cabeza: cab ? new Vector3(0, H * 0.82 - hundido, R * 0.05) : centro.clone(),
    ojos: ojoIzq.p.clone().add(ojoDer.p).multiplyScalar(0.5),
    copete: cima.p.clone(),
    cola: cuerpo.punto(0.28, Math.PI).p,
    apendiceI: new Vector3(),
    apendiceD: new Vector3(),
  };
  const lateral = (lado: number, v: number, giro: number) => cuerpo.punto(v, lado * (Math.PI / 2 + giro));
  if (a.piezas.aletas) {
    pivotes.apendiceI = lateral(-1, 0.42, 0.25).p;
    pivotes.apendiceD = lateral(1, 0.42, 0.25).p;
  } else if (a.piezas.brazos) {
    pivotes.apendiceI = lateral(-1, 0.5, -0.25).p;
    pivotes.apendiceD = lateral(1, 0.5, -0.25).p;
  }
  const montaje = new Montaje(pivotes, centro, R);
  const ident = new Matrix4();

  // Cuerpo y cabeza: llevan el patrón.
  montaje.anadir('cuerpo', cuerpo.geometria(), ident, col.principal, { patron: 1 });
  if (cab) montaje.anadir('cabeza', cara.geometria(24), ident, col.principal, { patron: 1 });

  // Ojos: grandes y oscuros, aplanados contra la cara, con dos puntos de luz fijos.
  const re = a.ojos.tamano * Rc * 1.45;
  for (const { p, n } of [ojoIzq, ojoDer]) {
    // El arriba del ojo es la vertical proyectada sobre la cara; su frente, la normal.
    const arribaOjo = ARRIBA.clone().sub(n.clone().multiplyScalar(n.y)).normalize();
    const centroOjo = p.clone().addScaledVector(n, -re * 0.18);
    const m = orientar(centroOjo, arribaOjo, n, new Vector3(re, re * 1.18, re * 0.5));
    montaje.anadir('ojos', new SphereGeometry(1, 18, 14), m, col.ojo);
    const brillo = (x: number, y: number, s: number) => {
      const mb = orientar(centroOjo, arribaOjo, n, new Vector3(1, 1, 1))
        .multiply(new Matrix4().makeTranslation(x * re, y * re, re * 0.44))
        .multiply(new Matrix4().makeScale(s * re, s * re * 1.1, s * re * 0.35));
      montaje.anadir('ojos', new SphereGeometry(1, 10, 8), mb, col.brillo, { emision: 1 });
    };
    brillo(-0.3, 0.42, 0.3);
    brillo(0.32, -0.36, 0.13);
  }

  // Boca.
  const vBoca = a.ojos.altura - (cab ? 0.2 : 0.17);
  const boca = cara.punto(vBoca, 0);
  const arribaBoca = ARRIBA.clone().sub(boca.n.clone().multiplyScalar(boca.n.y)).normalize();
  if (a.boca !== 'ninguna') {
    const radioBoca = re * (a.boca === 'colmillos' ? 0.5 : 0.42);
    const arco = Math.PI * (a.boca === 'colmillos' ? 0.5 : 0.7);
    const t = new TorusGeometry(radioBoca, re * 0.075, 6, 14, arco);
    t.rotateZ(-Math.PI / 2 - arco / 2);
    t.translate(0, radioBoca, 0);
    const m = orientar(boca.p.clone().addScaledVector(boca.n, -re * 0.03), arribaBoca, boca.n, new Vector3(1, 1, 1));
    montaje.anadir('cabeza', t, m, col.boca);
    if (a.boca === 'colmillos') {
      for (const lado of [-1, 1]) {
        const g = gota(1, 8, 6);
        g.rotateZ(Math.PI);
        const mc = m
          .clone()
          .multiply(new Matrix4().makeTranslation(lado * radioBoca * 0.62, radioBoca * 0.3, re * 0.02))
          .multiply(new Matrix4().makeScale(re * 0.22, re * 0.32, re * 0.18));
        montaje.anadir('cabeza', g, mc, col.hueso);
      }
    }
  }

  // Mejillas: discos rosados bajo los ojos.
  if (a.mejillas) {
    for (const lado of [-1, 1]) {
      const { p, n } = cara.punto(a.ojos.altura - 0.13, lado * (a.ojos.separacion + 0.3));
      const arribaM = ARRIBA.clone().sub(n.clone().multiplyScalar(n.y)).normalize();
      const m = orientar(p.clone().addScaledVector(n, -re * 0.02), arribaM, n, new Vector3(re * 0.55, re * 0.36, re * 0.1));
      montaje.anadir('cabeza', new SphereGeometry(1, 12, 8), m, col.mejilla);
    }
  }

  // Orejas.
  const or = a.piezas.orejas;
  if (or) {
    const h = or.tamano * Rc * 2.4;
    // Encima y por fuera de los ojos, para que no se amontonen con el copete.
    const vOreja = Math.min(0.9, a.ojos.altura + 0.24);
    const acOreja = a.ojos.separacion + 0.45;
    for (const lado of [-1, 1]) {
      const { p, n } = cara.punto(vOreja, lado * acOreja);
      const arriba = n.clone().multiplyScalar(0.7).add(ARRIBA).normalize();
      const g = or.forma === 'puntiaguda' ? gota(0.8 + ang * 0.7, 12, 10) : new SphereGeometry(0.5, 14, 10).translate(0, 0.5, 0);
      const m = orientar(p.clone().addScaledVector(n, -h * 0.12), arriba, FRENTE, new Vector3(h * 0.62, h, h * 0.3));
      montaje.anadir('cabeza', g, m, colorDe(or.color));
    }
  }

  // Cuernos: conos curvados hacia atrás.
  const cu = a.piezas.cuernos;
  if (cu) {
    const h = cu.tamano * Rc * 2.2;
    for (const lado of [-1, 1]) {
      const { p, n } = cara.punto(0.9, lado * 0.42);
      const g = gota(1 + ang, 10, 10);
      const pos = g.attributes.position as BufferAttribute;
      for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) - 0.35 * pos.getY(i) ** 2);
      g.computeVertexNormals();
      const arriba = n.clone().multiplyScalar(0.35).add(ARRIBA).normalize();
      const m = orientar(p.clone().addScaledVector(n, -h * 0.1), arriba, FRENTE, new Vector3(h * 0.42, h, h * 0.42));
      montaje.anadir('cabeza', g, m, colorDe(cu.color));
    }
  }

  // Copete: la pieza característica en lo alto.
  const co = a.piezas.copete;
  if (co) {
    const h = co.tamano * Rc * 2;
    const raiz = cima.p.clone().addScaledVector(cima.n, -h * 0.08);
    if (co.forma === 'hoja') {
      const tallo = new CapsuleGeometry(h * 0.045, h * 0.18, 4, 6).translate(0, h * 0.1, 0);
      montaje.anadir('copete', tallo, new Matrix4().setPosition(raiz), col.oscuro);
      for (let k = 0; k < co.cantidad; k++) {
        const giro = co.cantidad === 1 ? 0 : (k / (co.cantidad - 1) - 0.5) * 1.5;
        const arriba = new Vector3(Math.sin(giro), Math.cos(giro), -0.15).normalize();
        const s = 1 - Math.abs(giro) * 0.18;
        const m = orientar(raiz.clone().add(new Vector3(0, h * 0.2, 0)), arriba, FRENTE, new Vector3(h * 0.55 * s, h * s, h));
        montaje.anadir('copete', hoja(ang), m, colorDe(co.color));
      }
    } else if (co.forma === 'llama') {
      const base = col.secundario;
      const punta = new Color('#FFE45C');
      const degradado = (l: Vector3) => base.clone().lerp(punta, Math.min(1, Math.max(0, l.y)));
      const lenguas: [number, number][] = [[0, 1], [-0.55, 0.62], [0.55, 0.62]];
      for (const [giro, s] of lenguas.slice(0, Math.max(1, co.cantidad === 1 ? 3 : co.cantidad))) {
        const arriba = new Vector3(Math.sin(giro), Math.cos(giro), -0.25).normalize();
        const m = orientar(raiz, arriba, FRENTE, new Vector3(h * 0.62 * s, h * s, h * 0.62 * s));
        montaje.anadir('copete', gota(0.9, 12, 10), m, base, { emision: 1, colorVertice: degradado });
      }
    } else if (co.forma === 'aleta') {
      const m = orientar(raiz, new Vector3(0, 1, -0.45), new Vector3(1, 0, 0), new Vector3(h * 0.9, h, h * 0.18));
      montaje.anadir('copete', gota(0.7 + ang * 0.5, 12, 10), m, colorDe(co.color));
    } else {
      for (let k = 0; k < co.cantidad; k++) {
        const giro = co.cantidad === 1 ? 0 : (k / (co.cantidad - 1) - 0.5) * 1.1;
        const s = 1 - Math.abs(giro) * 0.3;
        const g = new OctahedronGeometry(0.5, 0).translate(0, 0.5, 0);
        const m = orientar(raiz, new Vector3(Math.sin(giro), Math.cos(giro), 0), FRENTE, new Vector3(h * 0.38 * s, h * s, h * 0.38 * s));
        montaje.anadir('copete', g, m, colorDe(co.color), { emision: 0.15 });
      }
    }
  }

  // Cresta a lo largo del lomo.
  const cr = a.piezas.cresta;
  if (cr) {
    const h = cr.tamano * R * 2;
    for (let k = 0; k < cr.cantidad; k++) {
      const v = 0.78 - (k / Math.max(1, cr.cantidad - 1)) * 0.36;
      const { p, n } = cuerpo.punto(v, Math.PI);
      const arriba = n.clone().add(new Vector3(0, 0.6, 0)).normalize();
      const s = 1 - k * 0.15;
      const g = cr.forma === 'hoja' ? hoja(ang) : gota(1 + ang, 10, 8);
      const m = orientar(p.clone().addScaledVector(n, -h * 0.15), arriba, new Vector3(1, 0, 0), new Vector3(h * 0.5 * s, h * s, h * s));
      montaje.anadir('cuerpo', g, m, colorDe(cr.color));
    }
  }

  // Patas: dos almohadillas delante, apoyadas en el suelo.
  const pa = a.piezas.patas;
  if (pa) {
    const fw = pa.tamano * R * 1.6;
    for (const lado of [-1, 1]) {
      const { p } = cuerpo.punto(0.12, lado * 0.55);
      const m = new Matrix4().makeTranslation(p.x * 0.95, fw * 0.32, p.z + fw * 0.25).multiply(new Matrix4().makeScale(fw * 0.8, fw * 0.5, fw));
      montaje.anadir('cuerpo', new SphereGeometry(0.5, 12, 8), m, colorDe(pa.color));
    }
  }

  // Aletas o brazos: apéndices laterales que se animan.
  const al = a.piezas.aletas;
  const br = a.piezas.brazos;
  for (const [lado, hueso] of [
    [-1, 'apendiceI'],
    [1, 'apendiceD'],
  ] as const) {
    const pivote = pivotes[hueso];
    if (al) {
      const L = al.tamano * R * 2;
      const fuera = new Vector3(lado, -0.35, -0.25).normalize();
      const m = orientar(pivote.clone().addScaledVector(fuera, -L * 0.15), fuera, FRENTE, new Vector3(L * 0.62, L, L * 0.22));
      montaje.anadir(hueso, gota(0.55 + ang * 0.6, 12, 10), m, colorDe(al.color));
    } else if (br) {
      const L = br.tamano * R * 2;
      const fuera = new Vector3(lado * 0.4, -0.9, 0.35).normalize();
      const g = new CapsuleGeometry(0.5, 1, 4, 8).translate(0, 0.9, 0);
      const m = orientar(pivote.clone().addScaledVector(fuera, -L * 0.2), fuera, FRENTE, new Vector3(L * 0.36, L * 0.55, L * 0.36));
      montaje.anadir(hueso, g, m, colorDe(br.color), { patron: 0 });
    }
  }

  // Cola: tubo cónico curvado hacia arriba y atrás, con su remate.
  const cl = a.piezas.cola;
  if (cl) {
    const L = cl.tamano * R * 2.2;
    const r0 = L * 0.16;
    const pc = pivotes.cola;
    const curva = new QuadraticBezierCurve3(
      new Vector3(0, 0, R * 0.08),
      new Vector3(0, -L * 0.05, -L * 0.6),
      new Vector3(0, L * 0.5, -L * 0.85),
    );
    const fin = curva.getPoint(1);
    const t = tuboConico(curva, r0, r0 * (cl.forma === 'punta' ? 0.25 : 0.4));
    montaje.anadir('cola', t, new Matrix4().setPosition(pc), colorDe(cl.color));
    const extremo = pc.clone().add(fin);
    if (cl.forma === 'punta') {
      const m = orientar(extremo, new Vector3(0, 1, -0.4), FRENTE, new Vector3(r0 * 0.6, r0 * (1.2 + ang * 1.4), r0 * 0.6));
      montaje.anadir('cola', gota(1 + ang, 8, 6), m, colorDe(cl.color));
    } else {
      // Abanico de dos lóbulos (aleta) u hoja.
      const lobulos = cl.forma === 'aleta' ? [-0.6, 0.6] : [0];
      for (const giro of lobulos) {
        const arriba = new Vector3(Math.sin(giro), Math.cos(giro), -0.3).normalize();
        const m = orientar(extremo, arriba, FRENTE, new Vector3(L * 0.34, L * 0.5, L * 0.5));
        montaje.anadir('cola', hoja(ang), m, cl.forma === 'aleta' ? col.secundario : colorDe(cl.color));
      }
    }
  }

  // La tripa va del suelo a un poco por debajo de la boca (o del cuello, si hay cabeza): así nunca
  // tapa la cara.
  const aPatron = (y: number) => (y - centro.y) / R;
  const techo = cab ? aPatron(H * 0.66 - hundido) : aPatron(boca.p.y - re * 0.35);
  const suelo = aPatron(H * 0.06 - hundido);
  const vientre = { y: (techo + suelo) / 2, ry: Math.max(0.1, (techo - suelo) / 2), rx: cab ? 0.5 : 0.6 };

  const geometrias = montaje.fusionar();
  const copeteAlto = co ? co.tamano * Rc * 2 : 0;
  return {
    geometrias,
    pivotes,
    colores: col,
    radio: R,
    alto: H,
    altoTotal: Math.max(H, altoCara) + copeteAlto * 0.8 - hundido,
    vientre,
  };
}
