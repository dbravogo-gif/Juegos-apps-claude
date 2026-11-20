// Los decorados de la evolución de los tipos que no tenían escenario propio (autor, 2026-11-20: «ve
// haciendo las animaciones del resto de tipos: para lucha, un dummy de entrenamiento; el de veneno,
// burbujas violetas generándose y rompiéndose…»). Todo dibujo propio, por código (R8).
//
// Cada decorado tiene una parte fija, que se funde con la isla (una sola malla con luz), y otra viva:
// lo que se mueve, en mallas aparte que anima `vivos` con el reloj. Lo de encima va sobre todo
// detrás de la criatura (z negativa), para no taparla. Las utilidades llegan en el contexto: este
// módulo no importa de escenario-evolucion.ts (que sí importa de este).

import {
  BoxGeometry,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicNodeMaterial,
  OctahedronGeometry,
  Quaternion,
  RingGeometry,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  type Material,
} from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Montaje, abollar, acanalar } from '../../arte/montaje';

export interface ColoresDecorado {
  suelo: [string, string, string];
  capas: string[];
  roca: string;
}

export interface CtxFijo {
  M: Montaje;
  c: ColoresDecorado;
  r: () => number;
  s: number;
  R: number;
  R_LISO: number;
  /** Altura del suelo en (x, z). */
  y: (x: number, z: number) => number;
  /** Un sitio en el anillo de fuera; con `detras`, la probabilidad de que caiga al fondo. */
  sitio: (detras?: number) => [number, number];
  brizna: (M: Montaje, x: number, y: number, z: number, alto: number, ang: number, inclina: number, bajo: string, alto2: string) => void;
  plano: (g: BufferGeometry) => BufferGeometry;
}

export interface CtxVivo extends Omit<CtxFijo, 'M' | 'brizna'> {
  grupo: Group;
  /** El material con luz de la isla (color por vértice), para piezas que se mueven. */
  matLuz: Material;
  /** Registra para desecharlo al acabar. */
  mat: <T extends Material>(m: T) => T;
  geo: <T extends BufferGeometry>(g: T) => T;
  vivos: ((t: number) => void)[];
  /** Hace sonar un efecto (los de `sonido`, por su nombre). */
  sonar: (nombre: string) => void;
  /** Cambia el color del fondo; null, el de siempre. */
  fondo: (color: Color | null) => void;
}

export interface Decorado {
  fijo?: (c: CtxFijo) => void;
  vivo?: (c: CtxVivo) => void;
}

/** Une varias geometrías en una (las de las piezas, con los mismos atributos). */
function mezclar(gs: BufferGeometry[]): BufferGeometry {
  const g = mergeGeometries(gs, false)!;
  for (const x of gs) x.dispose();
  return g;
}

/** Un material sin luz, que brilla (llamas, ojos, arcos, burbujas). */
function brillo(c: CtxVivo, color: string, opacidad = 1): MeshBasicNodeMaterial {
  const m = c.mat(new MeshBasicNodeMaterial({ color, transparent: opacidad < 1, opacity: opacidad, depthWrite: opacidad >= 1 }));
  m.toneMapped = false;
  return m;
}

/** Una malla con luz, montada con piezas de colores. */
function mallaLuz(c: CtxVivo, montar: (M: Montaje) => void): Mesh {
  const M = new Montaje();
  montar(M);
  return new Mesh(c.geo(M.fusionar()), c.matLuz);
}

const ARRIBA = new Vector3(0, 1, 0);
/** El fondo un instante, cuando cae un rayo. */
const FOGONAZO = new Color('#FFFDF2');
/** El fondo de la evolución de Eléctrico: de tormenta (sobre el blanco roto, los rayos no se veían). */
const TORMENTA = new Color('#6B7484');
/** Las gradas del terrero: tres escalones en arco por detrás (radio de su canto y alto). */
const GRADAS = [
  { radio: 1.3, alto: 0.12 },
  { radio: 1.44, alto: 0.24 },
  { radio: 1.58, alto: 0.36 },
];
/** De qué ángulo a qué ángulo van las gradas: el fondo, sin los lados de delante. */
const ARCO_GRADAS: [number, number] = [Math.PI + 0.3, 2 * Math.PI - 0.3];

export const DECORADOS: Record<string, Decorado> = {
  // ——— Lucha: un terrero de lucha canaria (autor, 2026-11-20: mejor que el muñeco). La criatura,
  // en la arena del centro, con su borde de madera; detrás, las gradas con el público, que se
  // levanta y aplaude, y banderines.
  terrero: {
    fijo: ({ M, y, R_LISO }) => {
      // El borde del terrero, de tablas de madera, rodeando la arena del centro.
      const tablas = 44;
      for (let i = 0; i < tablas; i++) {
        const a = (i / tablas) * Math.PI * 2;
        const rr = R_LISO + 0.04;
        const x = Math.cos(a) * rr;
        const z = Math.sin(a) * rr;
        M.pon(new BoxGeometry(0.22, 0.09, 0.06).rotateY(-a + Math.PI / 2).translate(x, y(x, z) + 0.045, z), i % 2 ? '#8B5A2B' : '#7A4E25');
      }
      // Las gradas: tres escalones en arco por detrás, de cemento encalado con el canto de madera.
      for (let k = 0; k < GRADAS.length; k++) {
        const { radio, alto } = GRADAS[k];
        const tramos = 26;
        for (let i = 0; i < tramos; i++) {
          const a0 = ARCO_GRADAS[0] + ((ARCO_GRADAS[1] - ARCO_GRADAS[0]) * i) / tramos;
          const a = a0 + (ARCO_GRADAS[1] - ARCO_GRADAS[0]) / tramos / 2;
          const largo = (radio + 0.07) * ((ARCO_GRADAS[1] - ARCO_GRADAS[0]) / tramos) + 0.012;
          const x = Math.cos(a) * (radio + 0.07);
          const z = Math.sin(a) * (radio + 0.07);
          M.pon(new BoxGeometry(largo, alto, 0.15).rotateY(-a + Math.PI / 2).translate(x, alto / 2 - 0.02, z), k % 2 ? '#E2DCCF' : '#D3CCBD');
          M.pon(new BoxGeometry(largo, 0.025, 0.04).rotateY(-a + Math.PI / 2).translate(Math.cos(a) * radio, alto - 0.0075, Math.sin(a) * radio), '#8B5A2B');
        }
      }
      // Los mástiles de los banderines, a los lados de las gradas.
      for (const a of ARCO_GRADAS) {
        const x = Math.cos(a) * 1.6;
        const z = Math.sin(a) * 1.6;
        M.pon(new CylinderGeometry(0.012, 0.015, 0.9, 6).translate(x, 0.45, z), '#6B4423');
      }
    },
    vivo: (c) => {
      const { grupo, r } = c;
      // El público: figuritas sentadas en las gradas, cada una de su color, que se balancean y, a
      // oleadas, se levantan a aplaudir.
      const camisas = ['#E8E2D2', '#2F6FB5', '#F2C94C', '#C0392B', '#3E8E5A', '#FFFFFF', '#7A4E9C'];
      const pieles = ['#F1C9A5', '#D9A47A', '#B07A52', '#8A5A3B'];
      const publico: { m: Mesh; fase: number; a: number }[] = [];
      for (let k = 0; k < GRADAS.length; k++) {
        const { radio, alto } = GRADAS[k];
        const n = 9 + k * 2;
        for (let i = 0; i < n; i++) {
          if (r() < 0.18) continue;
          const a = ARCO_GRADAS[0] + 0.08 + ((ARCO_GRADAS[1] - ARCO_GRADAS[0] - 0.16) * (i + 0.5 + (r() - 0.5) * 0.4)) / n;
          const m = mallaLuz(c, (M) => {
            M.ponDegradado(new CylinderGeometry(0.035, 0.045, 0.11, 8).translate(0, 0.055, 0), camisas[Math.floor(r() * camisas.length)], '#FFFFFF');
            M.pon(new SphereGeometry(0.035, 8, 6).translate(0, 0.145, 0), pieles[Math.floor(r() * pieles.length)]);
          });
          m.position.set(Math.cos(a) * (radio + 0.05), alto, Math.sin(a) * (radio + 0.05));
          m.userData.base = alto;
          grupo.add(m);
          publico.push({ m, fase: r() * 6, a });
        }
      }
      // Banderines de colores colgando entre los dos mástiles, por encima de las gradas.
      const colores = ['#FFFFFF', '#2F6FB5', '#F2C94C'];
      const banderines = Array.from({ length: 13 }, (_, i) => {
        const u = (i + 0.5) / 13;
        const a = ARCO_GRADAS[0] + (ARCO_GRADAS[1] - ARCO_GRADAS[0]) * u;
        const m = new Mesh(c.geo(new ConeGeometry(0.035, 0.09, 3).rotateX(Math.PI)), brillo(c, colores[i % 3]));
        m.position.set(Math.cos(a) * 1.6, 0.86 - Math.sin(u * Math.PI) * 0.12, Math.sin(a) * 1.6);
        grupo.add(m);
        return { m, fase: i * 0.6 };
      });
      c.vivos.push((t) => {
        // Una ola de aplausos cada 3 s, que recorre las gradas de lado a lado.
        const ola = (t % 3) / 1.2;
        for (const p of publico) {
          const u = (p.a - ARCO_GRADAS[0]) / (ARCO_GRADAS[1] - ARCO_GRADAS[0]);
          const salto = Math.max(0, 1 - Math.abs(ola - u) * 5);
          p.m.position.y = (p.m.userData.base as number) + Math.sin(t * 6 + p.fase) * 0.006 + salto * 0.06;
          p.m.scale.y = 1 + salto * 0.25;
        }
        for (const b of banderines) b.m.rotation.x = Math.sin(t * 3 + b.fase) * 0.3;
      });
    },
  },

  // ——— Veneno: una ciénaga violeta con charcos de veneno en los que nacen burbujas que crecen y
  // revientan, salpicando; setas violetas y ramas secas.
  cienaga: {
    fijo: ({ M, r, y, sitio, plano }) => {
      // Setas violetas con motas claras, detrás.
      for (let i = 0; i < 5; i++) {
        const [x, z] = sitio(0.9);
        const alto = 0.08 + r() * 0.12;
        const radio = 0.05 + r() * 0.05;
        M.pon(new CylinderGeometry(radio * 0.3, radio * 0.42, alto, 7).translate(x, y(x, z) + alto / 2, z), '#E6DCEB');
        M.ponDegradado(new SphereGeometry(radio, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.75, 1).translate(x, y(x, z) + alto, z), '#5E2A80', '#9B4DCA');
        for (let k = 0; k < 4; k++) {
          const a = r() * Math.PI * 2;
          M.pon(new SphereGeometry(radio * 0.15, 5, 3).translate(x + Math.cos(a) * radio * 0.5, y(x, z) + alto + radio * 0.48, z + Math.sin(a) * radio * 0.5), '#D9F28C');
        }
      }
      // Ramas secas y retorcidas.
      for (let i = 0; i < 3; i++) {
        const [x, z] = sitio(1);
        let px = x;
        let py = y(x, z);
        let pz = z;
        for (let k = 0; k < 4; k++) {
          const dir = new Vector3((r() - 0.5) * 0.8, 1, (r() - 0.5) * 0.8).normalize();
          const largo = 0.16 - k * 0.025;
          const g = new CylinderGeometry(0.014 - k * 0.002, 0.018 - k * 0.002, largo, 5).translate(0, largo / 2, 0);
          g.applyQuaternion(new Quaternion().setFromUnitVectors(ARRIBA, dir));
          M.pon(plano(g.translate(px, py, pz)), '#3A2E33');
          px += dir.x * largo;
          py += dir.y * largo;
          pz += dir.z * largo;
        }
      }
    },
    vivo: (c) => {
      const { grupo, r, y, sitio } = c;
      // Los charcos: brillan con su borde más oscuro.
      const charcos = Array.from({ length: 4 }, (_, i) => {
        const [x, z] = i === 0 ? [-0.55, -1.32] : sitio(0.6);
        // Charcos y burbujas grandes (autor, 2026-11-20: «burbujas más grandes»).
        const radio = 0.16 + r() * 0.1;
        const borde = new Mesh(c.geo(new SphereGeometry(1, 16, 6).scale(radio + 0.035, 0.012, (radio + 0.035) * 0.75)), brillo(c, '#4B1F66'));
        const charco = new Mesh(c.geo(new SphereGeometry(1, 16, 6).scale(radio, 0.018, radio * 0.75)), brillo(c, '#A445E0'));
        borde.position.set(x, y(x, z) + 0.004, z);
        charco.position.set(x, y(x, z) + 0.008, z);
        grupo.add(borde, charco);
        return { x, z, radio, base: y(x, z) + 0.01 };
      });
      // En cada charco, dos burbujas que crecen y revientan, cada una a su ritmo.
      const geoBurbuja = c.geo(new SphereGeometry(1, 14, 10));
      const geoGota = c.geo(new SphereGeometry(0.018, 6, 4));
      const burbujas = charcos.flatMap((ch, i) =>
        [0, 1].map((k) => {
          const m = new Mesh(geoBurbuja, brillo(c, k ? '#C77DEB' : '#B05CE0', 0.75));
          grupo.add(m);
          const gotas = Array.from({ length: 4 }, () => {
            const g = new Mesh(geoGota, brillo(c, '#D9A3F5', 0.9));
            grupo.add(g);
            return g;
          });
          return { ch, m, gotas, periodo: 1.6 + ((i * 2 + k) % 5) * 0.35, fase: (i * 0.37 + k * 0.5) % 1, dx: (k ? 0.3 : -0.25) * ch.radio, tam: ch.radio * (0.7 + k * 0.25) };
        }),
      );
      c.vivos.push((t) => {
        for (const b of burbujas) {
          const k = (t / b.periodo + b.fase) % 1;
          const x = b.ch.x + b.dx;
          const z = b.ch.z;
          // Crece despacio hasta el 85 % del ciclo; después revienta: se hincha, se aclara y salpica.
          if (k < 0.85) {
            const tam = b.tam * Math.sqrt(k / 0.85);
            b.m.visible = true;
            b.m.scale.set(tam, tam * 0.85, tam);
            b.m.position.set(x, b.ch.base + tam * 0.6, z);
            (b.m.material as MeshBasicNodeMaterial).opacity = 0.75;
            for (const g of b.gotas) g.visible = false;
          } else {
            const kk = (k - 0.85) / 0.15;
            b.m.visible = kk < 0.4;
            b.m.scale.setScalar(b.tam * (1 + kk * 0.8));
            (b.m.material as MeshBasicNodeMaterial).opacity = 0.75 * (1 - kk / 0.4);
            b.gotas.forEach((g, i) => {
              const a = (i / b.gotas.length) * Math.PI * 2 + b.fase * 6;
              g.visible = true;
              const d = kk * b.tam * 2.2;
              g.position.set(x + Math.cos(a) * d, b.ch.base + b.tam * 0.6 + Math.sin(kk * Math.PI) * b.tam * 1.4, z + Math.sin(a) * d * 0.75);
              g.scale.setScalar(1 - kk * 0.7);
            });
          }
        }
      });
    },
  },

  // ——— Eléctrico: dos bobinas de cobre detrás y arcos que saltan entre ellas.
  bobinas: {
    fijo: ({ M, y }) => {
      for (const s of [-1, 1]) {
        const x = s * 0.95;
        const z = -1.15;
        const b = y(x, z);
        M.ponDegradado(new CylinderGeometry(0.16, 0.2, 0.14, 8).translate(x, b + 0.07, z), '#3A3F47', '#5A616B');
        for (let i = 0; i < 9; i++) M.pon(new TorusGeometry(0.085, 0.022, 6, 14).rotateX(Math.PI / 2).translate(x, b + 0.2 + i * 0.065, z), i % 2 ? '#B8692E' : '#D98A45');
        M.pon(new CylinderGeometry(0.06, 0.06, 0.62, 8).translate(x, b + 0.45, z), '#8A5A33');
        M.pon(new SphereGeometry(0.11, 14, 10).translate(x, b + 0.86, z), '#C9D0D8');
      }
    },
    vivo: (c) => {
      const { grupo, y } = c;
      const extremos = [-1, 1].map((s) => new Vector3(s * 0.95, y(s * 0.95, -1.15) + 0.86, -1.15));
      // Un arco son tramos finos que se recolocan en zigzag: lo que dibujan las líneas de WebGL es de
      // un píxel y apenas se vería.
      const tramos = 12;
      const geoTramo = c.geo(new BoxGeometry(0.022, 1, 0.022).translate(0, 0.5, 0));
      const arcos = [0, 1].map((k) =>
        Array.from({ length: tramos }, () => {
          const m = new Mesh(geoTramo, brillo(c, k ? '#FFF6B0' : '#FFE14A'));
          grupo.add(m);
          return m;
        }),
      );
      const brilloBola = extremos.map((p) => {
        const m = new Mesh(c.geo(new SphereGeometry(0.16, 12, 8)), brillo(c, '#FFF3A0', 0.35));
        m.position.copy(p);
        grupo.add(m);
        return m;
      });
      const puntos = Array.from({ length: tramos + 1 }, () => new Vector3());
      const dir = new Vector3();
      let ultimo = -1;
      c.vivos.push((t) => {
        const turno = Math.floor(t / 0.07);
        if (turno === ultimo) return;
        ultimo = turno;
        // Encendido a ratos: tres de cada cuatro turnos.
        const encendido = turno % 4 !== 3;
        arcos.forEach((arco, k) => {
          const semilla = turno * 7 + k * 13;
          for (let i = 0; i <= tramos; i++) {
            const u = i / tramos;
            const curva = Math.sin(u * Math.PI) * (0.25 + k * 0.1);
            const desvio = i === 0 || i === tramos ? 0 : (Math.sin(semilla * 12.9898 + i * 78.233) * 43758.5453) % 1;
            puntos[i].lerpVectors(extremos[0], extremos[1], u);
            puntos[i].y += curva + desvio * 0.12;
            puntos[i].z += ((Math.sin(semilla + i * 3.1) * 1000) % 1) * 0.08;
          }
          arco.forEach((m, i) => {
            m.visible = encendido && (k === 0 || turno % 2 === 0);
            dir.subVectors(puntos[i + 1], puntos[i]);
            m.position.copy(puntos[i]);
            m.scale.set(1, dir.length(), 1);
            m.quaternion.setFromUnitVectors(ARRIBA, dir.normalize());
          });
        });
        for (const b of brilloBola) b.scale.setScalar(encendido ? 1 + (turno % 3) * 0.12 : 0.7);
      });
      // Rayos que caen del cielo cada 1,6 s: detrás de la isla y, uno de cada tres, sobre la criatura,
      // con un fogonazo del fondo y su restallido (autor, 2026-11-20).
      const tramosRayo = 16;
      const geoRayo = c.geo(new BoxGeometry(0.05, 1, 0.05).translate(0, 0.5, 0));
      const rayo = Array.from({ length: tramosRayo }, () => {
        const m = new Mesh(geoRayo, brillo(c, '#FFFBE0'));
        grupo.add(m);
        return m;
      });
      const halo = Array.from({ length: tramosRayo }, () => {
        const m = new Mesh(geoRayo, brillo(c, '#FFE14A', 0.35));
        grupo.add(m);
        return m;
      });
      const puntosRayo = Array.from({ length: tramosRayo + 1 }, () => new Vector3());
      const destinos = [new Vector3(-1.9, -0.3, -2.4), new Vector3(0, 0.05, 0), new Vector3(2.0, -0.3, -2.2), new Vector3(-0.6, -0.3, -3), new Vector3(0, 0.05, 0), new Vector3(1.2, -0.3, -3.1)];
      const CADA = 1.6;
      let ultimoRayo = -1;
      const tramo = new Vector3();
      c.vivos.push((t) => {
        const n = Math.floor(t / CADA);
        const k = (t % CADA) / 0.28;
        const visible = k < 1 && (k < 0.35 || k > 0.5);
        if (n !== ultimoRayo) {
          ultimoRayo = n;
          const fin = destinos[n % destinos.length];
          const inicio = new Vector3(fin.x + Math.sin(n * 7.1) * 0.8, 4.6, fin.z - 0.4);
          for (let i = 0; i <= tramosRayo; i++) {
            const u = i / tramosRayo;
            puntosRayo[i].lerpVectors(inicio, fin, u);
            if (i > 0 && i < tramosRayo) {
              puntosRayo[i].x += Math.sin(n * 13.7 + i * 2.3) * 0.22 * (1 - u * 0.5);
              puntosRayo[i].z += Math.cos(n * 5.3 + i * 1.7) * 0.1;
            }
          }
          rayo.forEach((m, i) => {
            tramo.subVectors(puntosRayo[i + 1], puntosRayo[i]);
            for (const x of [m, halo[i]]) {
              x.position.copy(puntosRayo[i]);
              x.scale.set(1, tramo.length(), 1);
              x.quaternion.setFromUnitVectors(ARRIBA, tramo.clone().normalize());
            }
            halo[i].scale.x = halo[i].scale.z = 3;
          });
          c.sonar('rayo');
        }
        for (const m of rayo) m.visible = visible;
        for (const m of halo) m.visible = visible;
        // Fondo de tormenta, para que los rayos se vean, y casi blanco un instante con cada uno.
        c.fondo(k < 0.12 ? FOGONAZO : TORMENTA);
      });
    },
  },

  // ——— Acero: suelo de chapa con remaches, engranajes que giran detrás y tuercas que caen.
  taller: {
    fijo: ({ M, y, R, R_LISO, r }) => {
      // Juntas de las chapas: una cuadrícula de rayas oscuras por todo el suelo.
      for (let k = -3; k <= 3; k++) {
        const d = k * 0.48;
        const largo = 2 * Math.sqrt(Math.max(0, R * R - d * d)) - 0.1;
        M.pon(new BoxGeometry(largo, 0.006, 0.02).translate(0, 0.004, d), '#5E666F');
        M.pon(new BoxGeometry(0.02, 0.006, largo).translate(d, 0.004, 0), '#5E666F');
      }
      // Remaches en el anillo de fuera.
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        const rr = R_LISO + 0.25 + (i % 2) * 0.2;
        const x = Math.cos(a) * rr;
        const z = Math.sin(a) * rr;
        M.pon(new SphereGeometry(0.022, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).translate(x, y(x, z), z), '#C4CBD3');
      }
      // Una tubería que asoma y se dobla, a un lado.
      M.pon(new CylinderGeometry(0.05, 0.05, 0.5, 10).translate(1.4, y(1.4, -0.3) + 0.25, -0.3), '#7D868F');
      M.pon(new CylinderGeometry(0.05, 0.05, 0.35, 10).rotateZ(Math.PI / 2).translate(1.25, y(1.4, -0.3) + 0.5, -0.3), '#7D868F');
      M.pon(new CylinderGeometry(0.07, 0.07, 0.05, 10).translate(1.4, y(1.4, -0.3) + 0.03, -0.3), '#5E666F');
      for (let i = 0; i < 6; i++) {
        const a = Math.PI + 0.3 + r() * (Math.PI - 0.6);
        const rr = R_LISO + 0.15 + r() * 0.3;
        M.pon(new CylinderGeometry(0.03, 0.03, 0.025, 6).translate(Math.cos(a) * rr, 0.02, Math.sin(a) * rr), '#9AA3AD');
      }
    },
    vivo: (c) => {
      const { grupo, y } = c;
      /** Una rueda dentada de pie, de cara a la cámara. */
      const rueda = (radio: number, dientes: number) =>
        mallaLuz(c, (M) => {
          M.ponDegradado(new CylinderGeometry(radio, radio, 0.08, 28).rotateX(Math.PI / 2), '#6F7882', '#AEB6BF');
          for (let i = 0; i < dientes; i++) {
            const a = (i / dientes) * Math.PI * 2;
            M.pon(new BoxGeometry(radio * 0.28, radio * 0.26, 0.08).rotateZ(a).translate(Math.cos(a + Math.PI / 2) * radio * 1.08, Math.sin(a + Math.PI / 2) * radio * 1.08, 0), '#8A939D');
          }
          M.pon(new CylinderGeometry(radio * 0.28, radio * 0.28, 0.1, 12).rotateX(Math.PI / 2), '#4F5660');
          for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
            M.pon(new CylinderGeometry(radio * 0.12, radio * 0.12, 0.09, 8).rotateX(Math.PI / 2).translate(Math.cos(a) * radio * 0.6, Math.sin(a) * radio * 0.6, 0), '#5E666F');
          }
        });
      // Tres ruedas engranadas: cada una gira al revés que su vecina, a su velocidad.
      const ruedas = [
        { x: -0.7, z: -1.3, radio: 0.32, dientes: 12, vel: 0.6 },
        { x: -0.18, z: -1.38, radio: 0.2, dientes: 8, vel: -0.96 },
        { x: 0.75, z: -1.25, radio: 0.27, dientes: 10, vel: -0.71 },
      ].map((d) => {
        const m = rueda(d.radio, d.dientes);
        m.position.set(d.x, y(d.x, d.z) + d.radio * 1.2 + 0.04, d.z);
        grupo.add(m);
        return { m, vel: d.vel };
      });
      c.vivos.push((t) => {
        for (const { m, vel } of ruedas) m.rotation.z = t * vel;
      });
      // El yunque, a la derecha, y un martillo que lo golpea: en cada golpe saltan chispas y suena el
      // metal (autor, 2026-11-20: «sonidos de metales golpeándose y chispas»).
      const yx = 1.2;
      const yz = -0.75;
      const base = y(yx, yz);
      const yunque = mallaLuz(c, (M) => {
        M.ponDegradado(new CylinderGeometry(0.1, 0.14, 0.2, 8).translate(0, 0.1, 0), '#3A3F47', '#5E666F');
        M.ponDegradado(new BoxGeometry(0.34, 0.1, 0.16).translate(0, 0.25, 0), '#4F5660', '#9AA3AD');
        M.pon(new ConeGeometry(0.06, 0.16, 6).rotateZ(Math.PI / 2).translate(-0.24, 0.26, 0), '#6F7882');
      });
      yunque.position.set(yx, base, yz);
      grupo.add(yunque);
      // El martillo gira sobre un eje detrás del yunque: sube despacio y cae de golpe.
      const brazo = new Group();
      brazo.position.set(yx + 0.32, base + 0.3, yz);
      const martillo = mallaLuz(c, (M) => {
        M.pon(new CylinderGeometry(0.018, 0.02, 0.36, 6).rotateZ(Math.PI / 2).translate(-0.18, 0, 0), '#7A5236');
        M.ponDegradado(new BoxGeometry(0.1, 0.12, 0.1).translate(-0.34, 0, 0), '#4F5660', '#B8C2CC');
      });
      brazo.add(martillo);
      grupo.add(brazo);
      const chispas = Array.from({ length: 12 }, () => {
        const m = new Mesh(c.geo(new BoxGeometry(0.014, 0.014, 0.05)), brillo(c, '#FFC44D'));
        m.visible = false;
        grupo.add(m);
        return { m, vel: new Vector3() };
      });
      const golpe = new Vector3(yx, base + 0.31, yz);
      const CADA = 1.15;
      let ultimoGolpe = -1;
      let anterior = 0;
      c.vivos.push((t) => {
        const dt = Math.min(0.05, Math.max(0, t - anterior));
        anterior = t;
        const n = Math.floor(t / CADA);
        const k = (t % CADA) / CADA;
        // Arriba (−1,1 rad) casi todo el ciclo; cae en el último 12 %.
        brazo.rotation.z = k < 0.88 ? -1.1 * Math.min(1, k / 0.5) : -1.1 * (1 - (k - 0.88) / 0.12) ** 2;
        if (n !== ultimoGolpe && k < 0.5 && n > 0) {
          ultimoGolpe = n;
          c.sonar('metal');
          chispas.forEach((ch, i) => {
            const a = (i / chispas.length) * Math.PI * 2 + n;
            ch.m.visible = true;
            ch.m.position.copy(golpe);
            ch.vel.set(Math.cos(a) * (0.8 + (i % 3) * 0.3), 1.1 + (i % 4) * 0.25, Math.sin(a) * 0.6);
            ch.m.userData.vida = 0.5;
          });
        }
        for (const ch of chispas) {
          if (!ch.m.visible) continue;
          ch.m.userData.vida -= dt;
          ch.vel.y -= 5 * dt;
          ch.m.position.addScaledVector(ch.vel, dt);
          ch.m.lookAt(ch.m.position.clone().add(ch.vel));
          ch.m.scale.setScalar(Math.max(0, ch.m.userData.vida / 0.5));
          if (ch.m.userData.vida <= 0) ch.m.visible = false;
        }
      });
    },
  },

  // ——— Mental: suelo rosado con anillos grabados, prismas que orbitan por detrás y ondas que salen
  // de la criatura (autor, 2026-11-20: «algo que parezca ondas mentales»; nada de piedras volando).
  prismas: {
    fijo: ({ M, R_LISO, R }) => {
      for (const rr of [R_LISO + 0.12, R - 0.12]) M.pon(new RingGeometry(rr - 0.015, rr + 0.015, 72).rotateX(-Math.PI / 2).translate(0, 0.03, 0), '#F2D7EE');
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const rr = (R_LISO + R) / 2;
        M.pon(new OctahedronGeometry(0.04, 0).scale(1, 0.25, 1).translate(Math.cos(a) * rr, 0.035, Math.sin(a) * rr), '#E59BD3');
      }
    },
    vivo: (c) => {
      const { grupo } = c;
      const geoPrisma = c.geo(new OctahedronGeometry(0.11, 0).scale(0.7, 1.8, 0.7));
      const prismas = Array.from({ length: 5 }, (_, i) => {
        const m = new Mesh(geoPrisma, brillo(c, i % 2 ? '#E07BBE' : '#B48CF0', 0.85));
        grupo.add(m);
        return { m, fase: (i / 5) * Math.PI * 2 };
      });
      // Ondas mentales: anillos que nacen a la altura de la cabeza y se abren hacia fuera; unos
      // tumbados, alrededor, y otros de pie, hacia la cámara, como ecos.
      const geoOnda = c.geo(new TorusGeometry(1, 0.012, 6, 64));
      const ondas = Array.from({ length: 6 }, (_, i) => {
        const m = new Mesh(geoOnda, brillo(c, i % 2 ? '#F2A5D2' : '#C9A2FF', 0.7));
        if (i % 2 === 0) m.rotation.x = Math.PI / 2;
        grupo.add(m);
        return { m, fase: i / 6, tumbada: i % 2 === 0 };
      });
      c.vivos.push((t) => {
        for (const { m, fase } of prismas) {
          const a = fase + t * 0.6;
          // Solo por detrás y los lados: por delante taparían a la criatura.
          m.position.set(Math.cos(a) * 1.45, 0.9 + Math.sin(t * 1.3 + fase) * 0.15, -Math.abs(Math.sin(a)) * 1.2);
          m.rotation.y = t * 1.5 + fase;
        }
        for (const o of ondas) {
          const k = (t * 0.45 + o.fase) % 1;
          const radio = 0.2 + k * (o.tumbada ? 1.9 : 1.4);
          o.m.scale.setScalar(radio);
          o.m.position.set(0, o.tumbada ? 0.95 + k * 0.3 : 0.95, o.tumbada ? 0 : -0.3 - k * 0.6);
          (o.m.material as MeshBasicNodeMaterial).opacity = 0.75 * (1 - k) * Math.min(1, k * 6);
        }
      });
    },
  },

  // ——— Espectral: bruma violeta, piedras viejas inclinadas y faroles con llama azul.
  bruma: {
    fijo: ({ M, r, y, plano }) => {
      for (let i = 0; i < 5; i++) {
        const a = Math.PI + 0.35 + (i / 4) * (Math.PI - 0.7);
        const rr = 1.38 + r() * 0.15;
        const x = Math.cos(a) * rr;
        const z = Math.sin(a) * rr;
        const alto = 0.3 + r() * 0.22;
        const losa = abollar(new BoxGeometry(0.2, alto, 0.06, 2, 3, 1), 0.06, i + 3).translate(0, alto / 2, 0);
        losa.rotateY(-a + Math.PI / 2).rotateZ((r() - 0.5) * 0.35).rotateX((r() - 0.5) * 0.2);
        M.ponDegradado(plano(losa.translate(x, y(x, z) - 0.03, z)), '#4E4860', '#8D86A0');
      }
      // Los faroles de piedra (la llama, viva, aparte).
      for (const [x, z] of FAROLES) {
        M.pon(new CylinderGeometry(0.05, 0.07, 0.3, 6).translate(x, y(x, z) + 0.15, z), '#6E6880');
        M.pon(new BoxGeometry(0.16, 0.14, 0.16).translate(x, y(x, z) + 0.37, z), '#5C566D');
        M.pon(new ConeGeometry(0.14, 0.12, 4).rotateY(Math.PI / 4).translate(x, y(x, z) + 0.5, z), '#4E4860');
      }
    },
    vivo: (c) => {
      const { grupo, y } = c;
      const llamas = FAROLES.map(([x, z], i) => {
        const m = new Mesh(c.geo(new SphereGeometry(0.05, 8, 6).scale(1, 1.6, 1)), brillo(c, i % 2 ? '#8FE3FF' : '#B9A2FF'));
        m.position.set(x, y(x, z) + 0.38, z);
        grupo.add(m);
        return { m, fase: i * 1.9 };
      });
      // Jirones de bruma alrededor del borde, que giran despacio.
      const geoBruma = c.geo(new SphereGeometry(1, 12, 6).scale(0.42, 0.05, 0.2));
      const bruma = Array.from({ length: 9 }, (_, i) => {
        const m = new Mesh(geoBruma, brillo(c, '#E2DCF5', 0.22));
        grupo.add(m);
        return { m, a: (i / 9) * Math.PI * 2 };
      });
      // Espectros: sábanas translúcidas con su ojos oscuros, que suben desde el suelo o bajan del cielo
      // y se desvanecen al final (autor, 2026-11-20).
      const cuerpo = new SphereGeometry(0.16, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 0.2, 0);
      const falda = new CylinderGeometry(0.16, 0.2, 0.26, 16, 2, true).translate(0, 0.07, 0);
      const pos = falda.getAttribute('position');
      for (let i = 0; i < pos.count; i++) {
        if (pos.getY(i) < -0.05) pos.setY(i, pos.getY(i) + Math.sin(Math.atan2(pos.getZ(i), pos.getX(i)) * 6) * 0.035);
      }
      const geoEspectro = c.geo(mezclar([cuerpo, falda]));
      const geoOjoEsp = c.geo(new SphereGeometry(0.025, 8, 6).scale(1, 1.5, 0.5));
      const espectros = ESPECTROS.map(([x, z, sube], i) => {
        const g = new Group();
        const m = new Mesh(geoEspectro, brillo(c, i % 2 ? '#E9E4FF' : '#D9F3FF', 0.62));
        g.add(m);
        for (const s of [-1, 1]) {
          const o = new Mesh(geoOjoEsp, brillo(c, '#2A2340'));
          o.position.set(s * 0.055, 0.24, 0.15);
          g.add(o);
        }
        g.position.set(x, 0, z);
        grupo.add(g);
        return { g, m, x, sube, fase: i * 0.31 };
      });
      c.vivos.push((t) => {
        for (const e of espectros) {
          const k = (t * 0.22 + e.fase) % 1;
          const yy = e.sube ? -0.3 + k * 2.6 : 2.3 - k * 2.6;
          e.g.position.y = yy;
          e.g.position.x = e.x + Math.sin(t * 1.4 + e.fase * 10) * 0.12;
          e.g.rotation.z = Math.sin(t * 1.4 + e.fase * 10) * 0.12;
          (e.m.material as MeshBasicNodeMaterial).opacity = 0.62 * Math.min(1, k * 5, (1 - k) * 5);
          e.g.visible = k > 0.02 && k < 0.98;
        }
      });
      c.vivos.push((t) => {
        for (const { m, fase } of llamas) m.scale.set(1 + Math.sin(t * 13 + fase) * 0.12, 1 + Math.sin(t * 9 + fase) * 0.2, 1);
        for (const b of bruma) {
          const a = b.a + t * 0.12;
          b.m.position.set(Math.cos(a) * 1.55, 0.06 + Math.sin(t * 0.7 + b.a) * 0.03, Math.sin(a) * 1.4);
          b.m.rotation.y = -a;
        }
      });
    },
  },

  // ——— Oscuridad: agujas de obsidiana, bruma negra y ojos que parpadean en la sombra.
  obsidiana: {
    fijo: ({ M, r, y, sitio, plano }) => {
      for (let i = 0; i < 6; i++) {
        const [x0, z0] = sitio(1);
        const n = 2 + Math.floor(r() * 2);
        for (let k = 0; k < n; k++) {
          const x = x0 + (r() - 0.5) * 0.2;
          const z = z0 + (r() - 0.5) * 0.12;
          const alto = 0.25 + r() * (k === 0 ? 0.6 : 0.3);
          const aguja = new ConeGeometry(0.06 + r() * 0.05, alto, 5, 1).translate(0, alto / 2, 0);
          aguja.rotateZ((r() - 0.5) * 0.4).rotateX((r() - 0.5) * 0.3);
          M.ponDegradado(plano(aguja.translate(x, y(x, z) - 0.02, z)), '#1A1620', '#5B4A78');
        }
      }
    },
    vivo: (c) => {
      const { grupo, r } = c;
      // La pantalla empieza casi negra y se aclara poco a poco mientras evoluciona; en la oscuridad,
      // ojos brillantes que parpadean por todas partes y se apagan al hacerse la luz (autor, 2026-11-20).
      const geoOjo = c.geo(new SphereGeometry(0.05, 10, 8).scale(1.4, 0.7, 0.4));
      const geoHalo = c.geo(new SphereGeometry(0.1, 10, 8).scale(1.5, 0.8, 0.3));
      const ojos = Array.from({ length: 16 }, (_, i) => {
        const par = new Group();
        const mats: MeshBasicNodeMaterial[] = [];
        for (const s of [-1, 1]) {
          const m = new Mesh(geoOjo, brillo(c, i % 3 === 0 ? '#FFE066' : i % 3 === 1 ? '#D2A8FF' : '#FF6B5E', 0.95));
          m.position.x = s * 0.09;
          const halo = new Mesh(geoHalo, brillo(c, i % 3 === 0 ? '#F2D14C' : i % 3 === 1 ? '#9B6BFF' : '#E0403A', 0.3));
          halo.position.x = s * 0.09;
          par.add(m, halo);
          mats.push(m.material as MeshBasicNodeMaterial, halo.material as MeshBasicNodeMaterial);
        }
        // Repartidos por el fondo y los lados, lejos de la criatura.
        const lado = i % 2 ? 1 : -1;
        const x = lado * (1.2 + r() * 3.2);
        const z = -1.5 - r() * 3;
        par.position.set(x, 0.2 + r() * 3, z);
        par.scale.setScalar(1 + (-z - 1.5) * 0.3);
        par.lookAt(x * 0.3, par.position.y, 8);
        grupo.add(par);
        return { par, mats, fase: r() * 10, periodo: 2.2 + r() * 2 };
      });
      const bruma = Array.from({ length: 8 }, (_, i) => {
        const m = new Mesh(c.geo(new SphereGeometry(1, 12, 6).scale(0.4, 0.06, 0.2)), brillo(c, '#1E1A26', 0.35));
        grupo.add(m);
        return { m, a: (i / 8) * Math.PI * 2 };
      });
      const oscuro = new Color('#0D0B12');
      const claro = new Color('#D6D0DC');
      const fondo = new Color();
      let inicio: number | null = null;
      c.vivos.push((t) => {
        inicio ??= t;
        // De negro a claro en unos 9 s, lo que dura la evolución, primero despacio.
        const k = Math.min(1, (t - inicio) / 9);
        const luz = k * k * (3 - 2 * k);
        c.fondo(fondo.copy(oscuro).lerp(claro, luz));
        for (const o of ojos) {
          const kk = ((t + o.fase) % o.periodo) / o.periodo;
          // Abiertos casi siempre, con un parpadeo rápido; cada vez menos según se aclara.
          const abierto = Math.abs(kk - 0.5) < 0.04 ? 0.08 : 1;
          o.par.scale.y = o.par.scale.x * Math.max(0.05, abierto);
          const intensidad = Math.max(0, 1 - luz * 1.4);
          o.par.visible = intensidad > 0.02;
          o.mats.forEach((m, i) => (m.opacity = (i % 2 ? 0.3 : 0.95) * intensidad));
        }
        for (const b of bruma) {
          const a = b.a - t * 0.1;
          b.m.position.set(Math.cos(a) * 1.55, 0.06, Math.sin(a) * 1.4);
          b.m.rotation.y = -a;
        }
      });
    },
  },

  // ——— Ancestral: algo imponente (autor, 2026-11-20: «habrá pocos que evolucionen; si hay, debe
  // ser algo grande y mitológico, con ofrendas»). Un templo de columnas detrás, más alto que nada,
  // con su frontón y un sol de oro; escalinata, dos braseros encendidos y ofrendas a sus pies.
  ruinas: {
    fijo: ({ M, y }) => {
      const z = TEMPLO_Z;
      const b = y(0, z);
      // Escalinata de tres peldaños, de lado a lado.
      for (let k = 0; k < 3; k++) M.ponDegradado(new BoxGeometry(2.5 - k * 0.12, 0.08, 0.5 - k * 0.1).translate(0, b + 0.04 + k * 0.08, z - k * 0.05), '#A68F68', '#C9B38A');
      // Seis columnas estriadas, con basa y capitel; no más altas, o el frontón se sale de la pantalla.
      const alto = ALTO_COLUMNAS;
      const suelo = b + 0.24;
      for (let i = 0; i < 6; i++) {
        const x = -1.05 + i * 0.42;
        M.pon(new BoxGeometry(0.24, 0.06, 0.24).translate(x, suelo + 0.03, z), '#B39C74');
        M.ponDegradado(acanalar(new CylinderGeometry(0.09, 0.105, alto, 14), 10, 0.12).translate(x, suelo + 0.06 + alto / 2, z), '#B39C74', '#E3D3AE');
        M.pon(new BoxGeometry(0.26, 0.07, 0.26).translate(x, suelo + 0.06 + alto + 0.035, z), '#D2BF98');
      }
      // Arquitrabe, friso y frontón.
      const arriba = suelo + 0.06 + alto + 0.07;
      M.ponDegradado(new BoxGeometry(2.45, 0.16, 0.34).translate(0, arriba + 0.08, z), '#B39C74', '#D2BF98');
      M.pon(new BoxGeometry(2.5, 0.05, 0.38).translate(0, arriba + 0.185, z), '#E3D3AE');
      // El frontón: un prisma de tres lados con la punta arriba, de lado a lado del templo.
      const fronton = new CylinderGeometry(1, 1, 0.3, 3).rotateX(-Math.PI / 2).scale(2.5 / Math.sqrt(3), ALTO_FRONTON / 1.5, 1);
      M.ponDegradado(fronton.translate(0, arriba + 0.21 + ALTO_FRONTON / 3, z), '#B39C74', '#E3D3AE');
      // Dos estatuas guardianas a los lados de la escalinata: un pedestal y una figura sentada.
      for (const s of [-1, 1]) {
        const x = s * 1.35;
        const zz = z + 0.45;
        M.ponDegradado(new BoxGeometry(0.26, 0.3, 0.26).translate(x, y(x, zz) + 0.15, zz), '#9A8460', '#C9B38A');
        M.ponDegradado(new CylinderGeometry(0.08, 0.11, 0.3, 10).translate(x, y(x, zz) + 0.45, zz), '#B39C74', '#E3D3AE');
        M.ponDegradado(new SphereGeometry(0.075, 10, 8).translate(x, y(x, zz) + 0.66, zz), '#B39C74', '#E3D3AE');
        M.pon(new ConeGeometry(0.05, 0.1, 4).translate(x - s * 0.04, y(x, zz) + 0.75, zz), '#C9B38A');
      }
      // Ofrendas al pie: ánforas, cuencos con frutas y pétalos.
      for (const [x, zz] of [[-0.62, z + 0.4], [0.7, z + 0.42]] as [number, number][]) {
        M.ponDegradado(new SphereGeometry(0.075, 10, 8).scale(1, 1.3, 1).translate(x, y(x, zz) + 0.1, zz), '#8A4A2E', '#C7774A');
        M.pon(new CylinderGeometry(0.03, 0.04, 0.08, 8).translate(x, y(x, zz) + 0.22, zz), '#A85C38');
      }
      const frutas = ['#E2533B', '#F2C94C', '#7AB648', '#9B4DCA'];
      for (const [x, zz] of [[-0.3, z + 0.5], [0.35, z + 0.52]] as [number, number][]) {
        M.pon(new SphereGeometry(0.08, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).translate(x, y(x, zz) + 0.07, zz), '#C9A44A');
        for (let k = 0; k < 4; k++) M.pon(new SphereGeometry(0.03, 8, 6).translate(x + Math.cos(k * 1.6) * 0.035, y(x, zz) + 0.08, zz + Math.sin(k * 1.6) * 0.03), frutas[k]);
      }
      for (let k = 0; k < 14; k++) {
        const x = -0.8 + ((k * 37) % 16) * 0.1;
        const zz = z + 0.6 + ((k * 13) % 5) * 0.05;
        M.pon(new SphereGeometry(0.018, 5, 3).scale(1, 0.4, 1).translate(x, y(x, zz) + 0.01, zz), k % 2 ? '#F2A5D2' : '#FFF2B3');
      }
      // Los braseros: trípode y cuenco (la llama, viva, aparte).
      for (const [x, zz] of BRASEROS) {
        for (let k = 0; k < 3; k++) {
          const a = (k / 3) * Math.PI * 2;
          M.pon(new CylinderGeometry(0.012, 0.012, 0.45, 5).rotateZ(Math.cos(a) * 0.2).rotateX(Math.sin(a) * 0.2).translate(x + Math.cos(a) * 0.05, y(x, zz) + 0.22, zz + Math.sin(a) * 0.05), '#6E5A3C');
        }
        M.ponDegradado(new SphereGeometry(0.12, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).translate(x, y(x, zz) + 0.5, zz), '#8A6A2E', '#D9A441');
      }
    },
    vivo: (c) => {
      const { grupo, y } = c;
      // El sol de oro del frontón y las runas del friso y del suelo, que laten.
      const z = TEMPLO_Z;
      const arriba = y(0, z) + 0.24 + 0.06 + ALTO_COLUMNAS + 0.07;
      const sol = new Mesh(c.geo(new CylinderGeometry(0.11, 0.11, 0.03, 20).rotateX(Math.PI / 2)), brillo(c, '#FFD45E'));
      sol.position.set(0, arriba + 0.21 + ALTO_FRONTON * 0.36, z + 0.16);
      grupo.add(sol);
      const geoRuna = c.geo(new BoxGeometry(0.05, 0.08, 0.01));
      const geoRunaSuelo = c.geo(new BoxGeometry(0.06, 0.006, 0.1));
      const runas: { m: Mesh; fase: number }[] = [{ m: sol, fase: 0 }];
      for (let i = 0; i < 11; i++) {
        const m = new Mesh(geoRuna, brillo(c, '#FFD45E'));
        m.position.set(-1.0 + i * 0.2, arriba + 0.08, z + 0.175);
        m.rotation.z = i % 2 ? 0.5 : -0.3;
        grupo.add(m);
        runas.push({ m, fase: i * 0.5 });
      }
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const rr = c.R_LISO + 0.1;
        const m = new Mesh(geoRunaSuelo, brillo(c, '#F2C14C'));
        m.position.set(Math.cos(a) * rr, 0.012, Math.sin(a) * rr);
        m.rotation.y = -a + (i % 3) * 0.4;
        grupo.add(m);
        runas.push({ m, fase: i * 0.45 });
      }
      // Las llamas de los braseros.
      const llamas = BRASEROS.map(([x, zz], i) => {
        const g = new Group();
        g.add(new Mesh(c.geo(new ConeGeometry(0.09, 0.26, 8).translate(0, 0.13, 0)), brillo(c, '#FF8A2A')));
        g.add(new Mesh(c.geo(new ConeGeometry(0.05, 0.18, 8).translate(0, 0.09, 0)), brillo(c, '#FFE07A')));
        g.position.set(x, y(x, zz) + 0.5, zz);
        grupo.add(g);
        return { g, fase: i * 2.3 };
      });
      const oro = new Color('#FFD45E');
      c.vivos.push((t) => {
        for (const { m, fase } of runas) (m.material as MeshBasicNodeMaterial).color.copy(oro).multiplyScalar(0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 2.2 + fase)));
        sol.rotation.z = t * 0.3;
        for (const { g, fase } of llamas) g.scale.set(1 + Math.sin(t * 11 + fase) * 0.1, 1 + Math.sin(t * 8 + fase) * 0.22, 1 + Math.sin(t * 9.5 + fase) * 0.1);
      });
    },
  },

  // ——— Bicho: el jardín (lo pone la isla), con tallos altos y una telaraña entre dos de ellos.
  bosquecillo: {
    fijo: ({ M, r, y }) => {
      for (const [x, z, alto] of TALLOS) {
        M.ponDegradado(new CylinderGeometry(0.012, 0.018, alto, 5).translate(x, y(x, z) + alto / 2, z), '#4A7A2E', '#8DBF4A');
        M.ponDegradado(new SphereGeometry(1, 8, 5).scale(0.07, 0.025, 0.15).rotateY(r() * 3).translate(x, y(x, z) + alto, z), '#4A8436', '#9BCB5A');
      }
    },
    vivo: (c) => {
      const { grupo, y } = c;
      // La telaraña: radios y espiral de hilos finos, plateados, que se mecen un poco.
      const [ax, az, aa] = TALLOS[0];
      const [bx, bz, ba] = TALLOS[1];
      const centro = new Vector3((ax + bx) / 2, (y(ax, az) + aa + y(bx, bz) + ba) / 2 - 0.12, (az + bz) / 2);
      const tela = new Group();
      // Hilos de 1,2 cm: más finos no se veían desde la cámara.
      const matHilo = brillo(c, '#FFFFFF', 0.9);
      const hilo = (p: Vector3, q: Vector3) => {
        const d = new Vector3().subVectors(q, p);
        const m = new Mesh(c.geo(new BoxGeometry(0.012, d.length(), 0.012).translate(0, d.length() / 2, 0)), matHilo);
        m.position.copy(p);
        m.quaternion.setFromUnitVectors(ARRIBA, d.normalize());
        tela.add(m);
      };
      const radioTela = Math.min(0.26, Math.hypot(bx - ax, bz - az) / 2 - 0.01);
      const radios = 8;
      const punto = (i: number, f: number) => new Vector3(Math.cos((i / radios) * Math.PI * 2) * radioTela * f, Math.sin((i / radios) * Math.PI * 2) * radioTela * f, 0);
      for (let i = 0; i < radios; i++) hilo(new Vector3(), punto(i, 1));
      for (const f of [0.35, 0.6, 0.85]) for (let i = 0; i < radios; i++) hilo(punto(i, f), punto(i + 1, f));
      tela.position.copy(centro);
      tela.lookAt(centro.x, centro.y, centro.z + 1);
      grupo.add(tela);
      // Un avispero colgado de una rama curva, a la derecha, con avispas que vuelan alrededor.
      const nido = mallaLuz(c, (M) => {
        M.pon(new CylinderGeometry(0.008, 0.008, 0.12, 4).translate(0, 0.06, 0), '#6B5A3A');
        for (let k = 0; k < 5; k++) M.ponDegradado(new SphereGeometry(0.13 - Math.abs(k - 2) * 0.025, 12, 6).scale(1, 0.32, 1).translate(0, -0.04 - k * 0.055, 0), '#9C8A6A', '#D8C9A4');
        M.pon(new CylinderGeometry(0.03, 0.03, 0.02, 10).rotateX(Math.PI / 2).translate(0, -0.2, 0.1), '#3A2E22');
      });
      const nx = 1.0;
      const nz = -1.05;
      nido.position.set(nx, y(nx, nz) + 0.85, nz);
      grupo.add(nido);
      const rama = mallaLuz(c, (M) => {
        M.pon(new CylinderGeometry(0.02, 0.03, 0.9, 6).translate(0, 0.45, 0), '#5C4A32');
        M.pon(new CylinderGeometry(0.015, 0.02, 0.3, 6).rotateZ(Math.PI / 2.4).translate(-0.12, 0.92, 0), '#5C4A32');
      });
      rama.position.set(nx + 0.24, y(nx, nz), nz);
      grupo.add(rama);
      const geoAvispa = c.geo(mezclar([new SphereGeometry(0.025, 8, 6).scale(1.6, 1, 1), new SphereGeometry(0.018, 6, 4).translate(0.04, 0, 0)]));
      const avispas = Array.from({ length: 4 }, (_, i) => {
        const m = new Mesh(geoAvispa, brillo(c, i % 2 ? '#F2C230' : '#2A2218'));
        grupo.add(m);
        return { m, fase: (i / 4) * Math.PI * 2 };
      });
      // Una segunda telaraña, grande, entre los dos tallos de la derecha.
      const [cx2, cz2, ca2] = TALLOS[2];
      const [dx2, dz2, da2] = TALLOS[3];
      const tela2 = tela.clone();
      tela2.position.set((cx2 + dx2) / 2, (y(cx2, cz2) + ca2 + y(dx2, dz2) + da2) / 2 - 0.14, (cz2 + dz2) / 2);
      tela2.scale.setScalar(0.85);
      tela2.lookAt(tela2.position.x - 0.4, tela2.position.y, tela2.position.z + 1);
      grupo.add(tela2);
      c.vivos.push((t) => {
        tela.rotation.y = Math.sin(t * 0.9) * 0.08;
        nido.rotation.z = Math.sin(t * 1.2) * 0.04;
        for (const a of avispas) {
          const ang = a.fase + t * 2.4;
          a.m.position.set(nx + Math.cos(ang) * 0.3, y(nx, nz) + 0.7 + Math.sin(t * 5 + a.fase) * 0.08, nz + Math.sin(ang) * 0.22);
          a.m.rotation.y = -ang;
        }
      });
    },
  },
};

/** Dónde está el templo de Ancestral (su fachada, de lado a lado, al fondo). */
const TEMPLO_Z = -1.48;
/** Lo alto de sus columnas y de su frontón: con 1,75 el frontón se salía por arriba. */
const ALTO_COLUMNAS = 1.1;
const ALTO_FRONTON = 0.42;
/** Los braseros del templo. */
const BRASEROS: [number, number][] = [
  [-1.05, -0.55],
  [1.05, -0.55],
];
/** Los espectros: [x, z, si suben (si no, bajan)]. */
const ESPECTROS: [number, number, boolean][] = [
  [-1.3, -0.7, true],
  [1.25, -0.9, false],
  [-0.55, -1.45, false],
  [0.6, -1.5, true],
];
/** Dónde van los faroles del escenario espectral. */
const FAROLES: [number, number][] = [
  [-1.25, -0.8],
  [1.2, -0.9],
  [0.2, -1.45],
];
/** Los tallos altos del escenario de Bicho: [x, z, alto]; entre los dos primeros, la telaraña. */
const TALLOS: [number, number, number][] = [
  [-0.95, -1.25, 0.7],
  [-0.48, -1.38, 0.62],
  [0.85, -1.2, 0.55],
  [1.15, -0.85, 0.45],
];
