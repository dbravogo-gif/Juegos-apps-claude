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
  IcosahedronGeometry,
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
}

export interface Decorado {
  fijo?: (c: CtxFijo) => void;
  vivo?: (c: CtxVivo) => void;
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

export const DECORADOS: Record<string, Decorado> = {
  // ——— Lucha: un terrero de lucha canaria, con su borde de madera, un muñeco de entrenamiento que
  // se balancea como si le pegaran y un saco colgado.
  terrero: {
    fijo: ({ M, r, y, R_LISO }) => {
      // El borde del terrero, de tablas de madera, rodeando la arena del centro.
      const tablas = 44;
      for (let i = 0; i < tablas; i++) {
        const a = (i / tablas) * Math.PI * 2;
        const rr = R_LISO + 0.04;
        const x = Math.cos(a) * rr;
        const z = Math.sin(a) * rr;
        M.pon(new BoxGeometry(0.22, 0.09, 0.06).rotateY(-a + Math.PI / 2).translate(x, y(x, z) + 0.045, z), i % 2 ? '#8B5A2B' : '#7A4E25');
      }
      // El poste del saco, detrás a la derecha, con su brazo.
      const px = 1.05;
      const pz = -1.0;
      M.pon(new CylinderGeometry(0.045, 0.055, 1.25, 8).translate(px, y(px, pz) + 0.62, pz), '#6B4423');
      M.pon(new BoxGeometry(0.42, 0.06, 0.06).translate(px - 0.18, y(px, pz) + 1.22, pz), '#6B4423');
      // Unas mancuernas de piedra y una cuerda enrollada, por el borde.
      for (let i = 0; i < 2; i++) {
        const x = -1.3 + i * 0.2;
        const z = 0.55 + r() * 0.1;
        M.pon(new CylinderGeometry(0.02, 0.02, 0.22, 6).rotateZ(Math.PI / 2).translate(x, y(x, z) + 0.06, z), '#5C4A3A');
        for (const s of [-1, 1]) M.pon(new SphereGeometry(0.06, 8, 6).translate(x + s * 0.11, y(x, z) + 0.06, z), '#7D7A74');
      }
      M.pon(new TorusGeometry(0.1, 0.03, 6, 14).rotateX(Math.PI / 2).translate(1.35, y(1.35, 0.4) + 0.03, 0.4), '#C9A66B');
    },
    vivo: (c) => {
      const { grupo, y } = c;
      // El muñeco: poste, cuerpo de saco atado con cuerdas, brazos de palo y cabeza.
      const mx = -0.75;
      const mz = -1.12;
      const muneco = mallaLuz(c, (M) => {
        M.pon(new CylinderGeometry(0.05, 0.06, 0.55, 8).translate(0, 0.27, 0), '#6B4423');
        M.ponDegradado(new CylinderGeometry(0.15, 0.17, 0.5, 12).translate(0, 0.78, 0), '#B08A55', '#D2B07A');
        for (const h of [0.6, 0.78, 0.96]) M.pon(new CylinderGeometry(0.162, 0.162, 0.03, 12).translate(0, h, 0), '#5C3D22');
        M.pon(new CylinderGeometry(0.025, 0.025, 0.7, 6).rotateZ(Math.PI / 2).translate(0, 0.88, 0), '#6B4423');
        M.ponDegradado(new SphereGeometry(0.12, 12, 8).translate(0, 1.15, 0), '#B08A55', '#D2B07A');
        M.pon(new CylinderGeometry(0.1, 0.1, 0.02, 10).rotateX(Math.PI / 2).translate(0, 1.15, 0.11), '#5C3D22');
      });
      muneco.position.set(mx, y(mx, mz), mz);
      grupo.add(muneco);
      // El saco colgado, que oscila.
      const saco = mallaLuz(c, (M) => {
        M.pon(new CylinderGeometry(0.008, 0.008, 0.25, 4).translate(0, -0.12, 0), '#C9A66B');
        M.ponDegradado(new CylinderGeometry(0.12, 0.11, 0.42, 12).translate(0, -0.46, 0), '#7A3B2E', '#A04E3C');
      });
      saco.position.set(1.05 - 0.36, y(1.05, -1.0) + 1.19, -1.0);
      grupo.add(saco);
      // El destello de cada golpe: una estrella plana, blanca, que crece y se va.
      const estrella = new Mesh(c.geo(new OctahedronGeometry(0.16, 0).scale(1, 1, 0.15)), brillo(c, '#FFF6D8', 0.9));
      estrella.position.set(mx + 0.12, y(mx, mz) + 0.85, mz + 0.2);
      grupo.add(estrella);
      // Polvo que salta del suelo con el golpe.
      const polvo = Array.from({ length: 5 }, () => {
        const m = new Mesh(c.geo(new SphereGeometry(0.05, 6, 4)), brillo(c, '#E4C79C', 0.7));
        grupo.add(m);
        return m;
      });
      const CADA = 1.3;
      c.vivos.push((t) => {
        // Un golpe cada 1,3 s: el muñeco se inclina hacia atrás y vuelve, amortiguado.
        const tt = t % CADA;
        const golpe = Math.floor(t / CADA);
        const lado = golpe % 2 ? 1 : -1;
        muneco.rotation.z = lado * 0.28 * Math.exp(-tt * 3.2) * Math.sin(tt * 11);
        muneco.rotation.x = -0.12 * Math.exp(-tt * 3.2) * Math.sin(tt * 11);
        const k = tt / 0.18;
        estrella.visible = k < 1;
        estrella.scale.setScalar(0.4 + k * 1.2);
        estrella.rotation.z = golpe * 0.7;
        (estrella.material as MeshBasicNodeMaterial).opacity = 0.9 * (1 - k);
        polvo.forEach((m, i) => {
          const a = (i / polvo.length) * Math.PI * 2 + golpe;
          const kk = Math.min(1, tt / 0.6);
          m.visible = kk < 1;
          m.position.set(mx + Math.cos(a) * (0.15 + kk * 0.35), y(mx, mz) + 0.04 + Math.sin(kk * Math.PI) * 0.18, mz + Math.sin(a) * (0.1 + kk * 0.25));
          m.scale.setScalar(0.6 + kk * 1.4);
          (m.material as MeshBasicNodeMaterial).opacity = 0.6 * (1 - kk);
        });
        saco.rotation.z = Math.sin(t * 2.1) * 0.12;
        saco.rotation.x = Math.sin(t * 1.4 + 1) * 0.06;
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
      const charcos = Array.from({ length: 5 }, (_, i) => {
        const [x, z] = i === 0 ? [-0.55, -1.32] : sitio(0.6);
        const radio = 0.11 + r() * 0.08;
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
          return { ch, m, gotas, periodo: 1.6 + ((i * 2 + k) % 5) * 0.35, fase: (i * 0.37 + k * 0.5) % 1, dx: (k ? 0.3 : -0.25) * ch.radio, tam: ch.radio * (0.45 + k * 0.15) };
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
    },
  },

  // ——— Mental: suelo rosado con anillos grabados, prismas que orbitan alrededor y piedras que
  // levitan.
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
      const { grupo, y } = c;
      const geoPrisma = c.geo(new OctahedronGeometry(0.11, 0).scale(0.7, 1.8, 0.7));
      const prismas = Array.from({ length: 5 }, (_, i) => {
        const m = new Mesh(geoPrisma, brillo(c, i % 2 ? '#E07BBE' : '#B48CF0', 0.85));
        grupo.add(m);
        return { m, fase: (i / 5) * Math.PI * 2 };
      });
      const piedras = [-0.9, 0.95].map((x, i) => {
        const z = -1.25;
        const m = mallaLuz(c, (M) => M.ponDegradado(abollar(new IcosahedronGeometry(0.12 + i * 0.04, 1), 0.25, 7 + i), '#8E7189', '#C9A8C9'));
        m.position.set(x, y(x, z) + 0.5, z);
        grupo.add(m);
        return { m, base: y(x, z) + 0.45, fase: i * 1.7 };
      });
      c.vivos.push((t) => {
        for (const { m, fase } of prismas) {
          const a = fase + t * 0.6;
          // Solo por detrás y los lados: por delante taparían a la criatura.
          const x = Math.cos(a) * 1.45;
          const z = -Math.abs(Math.sin(a)) * 1.2;
          m.position.set(x, 0.9 + Math.sin(t * 1.3 + fase) * 0.15, z);
          m.rotation.y = t * 1.5 + fase;
        }
        for (const p of piedras) {
          p.m.position.y = p.base + Math.sin(t * 1.1 + p.fase) * 0.08;
          p.m.rotation.y = t * 0.4 + p.fase;
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
      const { grupo, y, r } = c;
      // Pares de ojos detrás, entre las agujas: parpadean y, de vez en cuando, cambian de sitio.
      // Grandes y con un halo: a 0,022 no se veían desde la cámara.
      const geoOjo = c.geo(new SphereGeometry(0.045, 10, 8).scale(1.4, 0.75, 0.4));
      const geoHalo = c.geo(new SphereGeometry(0.09, 10, 8).scale(1.5, 0.8, 0.3));
      const ojos = Array.from({ length: 4 }, (_, i) => {
        const par = new Group();
        for (const s of [-1, 1]) {
          const m = new Mesh(geoOjo, brillo(c, i % 2 ? '#FFE066' : '#D2A8FF'));
          m.position.x = s * 0.085;
          const halo = new Mesh(geoHalo, brillo(c, i % 2 ? '#F2D14C' : '#9B6BFF', 0.3));
          halo.position.x = s * 0.085;
          par.add(m, halo);
        }
        grupo.add(par);
        return { par, fase: r() * 10, sitio: -1 };
      });
      const sitios = Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI + 0.3 + (i / 8) * (Math.PI - 0.6);
        const rr = 1.35 + (i % 3) * 0.12;
        return new Vector3(Math.cos(a) * rr, y(Math.cos(a) * rr, Math.sin(a) * rr) + 0.22 + (i % 2) * 0.16, Math.sin(a) * rr);
      });
      const bruma = Array.from({ length: 8 }, (_, i) => {
        const m = new Mesh(c.geo(new SphereGeometry(1, 12, 6).scale(0.4, 0.06, 0.2)), brillo(c, '#1E1A26', 0.35));
        grupo.add(m);
        return { m, a: (i / 8) * Math.PI * 2 };
      });
      c.vivos.push((t) => {
        ojos.forEach((o, i) => {
          const ciclo = Math.floor((t + o.fase) / 4);
          const sitio = (ciclo * 3 + i * 2) % sitios.length;
          if (sitio !== o.sitio) {
            o.sitio = sitio;
            o.par.position.copy(sitios[sitio]);
            o.par.lookAt(o.par.position.x * 0.2, o.par.position.y, 8);
          }
          const k = (t + o.fase) % 4;
          // Se abren, parpadean una vez y se cierran antes de irse.
          const abierto = k < 0.3 ? k / 0.3 : k > 3.6 ? Math.max(0, (3.9 - k) / 0.3) : Math.abs(k - 2) < 0.08 ? 0.1 : 1;
          o.par.scale.set(1, Math.max(0.05, abierto), 1);
          o.par.visible = abierto > 0.02;
        });
        for (const b of bruma) {
          const a = b.a - t * 0.1;
          b.m.position.set(Math.cos(a) * 1.55, 0.06, Math.sin(a) * 1.4);
          b.m.rotation.y = -a;
        }
      });
    },
  },

  // ——— Ancestral: ruinas de piedra: columnas rotas, un arco y runas doradas que laten.
  ruinas: {
    fijo: ({ M, r, y, plano }) => {
      // El arco, detrás, en el centro.
      const z = -1.42;
      for (const s of [-1, 1]) {
        const x = s * 0.42;
        M.ponDegradado(acanalar(new CylinderGeometry(0.09, 0.1, 0.85, 12), 8, 0.12).translate(x, y(x, z) + 0.43, z), '#A68F68', '#D2BF98');
        M.pon(new BoxGeometry(0.26, 0.08, 0.26).translate(x, y(x, z) + 0.04, z), '#9A8460');
      }
      M.pon(new BoxGeometry(1.1, 0.16, 0.24).translate(0, y(0, z) + 0.93, z), '#B9A27A');
      // Columnas rotas y caídas, y sillares sueltos.
      for (const [a, alto] of [
        [Math.PI + 0.55, 0.5],
        [Math.PI + 0.95, 0.3],
        [2 * Math.PI - 0.6, 0.62],
        [2 * Math.PI - 0.95, 0.22],
      ] as [number, number][]) {
        const rr = 1.38;
        const x = Math.cos(a) * rr;
        const zz = Math.sin(a) * rr;
        M.ponDegradado(acanalar(new CylinderGeometry(0.08, 0.09, alto, 10), 8, 0.12).translate(x, y(x, zz) + alto / 2, zz), '#A68F68', '#C9B38A');
        M.pon(plano(abollar(new CylinderGeometry(0.075, 0.08, 0.05, 10), 0.1, a * 10).translate(x, y(x, zz) + alto + 0.02, zz)), '#B9A27A');
      }
      M.ponDegradado(acanalar(new CylinderGeometry(0.08, 0.08, 0.6, 10), 8, 0.12).rotateZ(Math.PI / 2).rotateY(0.4).translate(1.15, y(1.15, 0.45) + 0.08, 0.45), '#A68F68', '#C9B38A');
      for (let i = 0; i < 5; i++) {
        const a = r() * Math.PI * 2;
        const rr = 1.25 + r() * 0.3;
        const x = Math.cos(a) * rr;
        const zz = Math.sin(a) * rr;
        M.pon(plano(abollar(new BoxGeometry(0.14, 0.1, 0.12), 0.1, i)).rotateY(r() * 3).translate(x, y(x, zz) + 0.05, zz), '#A68F68');
      }
    },
    vivo: (c) => {
      const { grupo, y } = c;
      // Runas doradas: en el arco y en un anillo del suelo. Laten a destiempo.
      const geoRuna = c.geo(new BoxGeometry(0.05, 0.08, 0.01));
      const geoRunaSuelo = c.geo(new BoxGeometry(0.06, 0.006, 0.1));
      const runas: { m: Mesh; fase: number }[] = [];
      for (let i = 0; i < 5; i++) {
        const m = new Mesh(geoRuna, brillo(c, '#FFD45E'));
        m.position.set(-0.32 + i * 0.16, y(0, -1.42) + 0.93, -1.42 + 0.125);
        m.rotation.z = i % 2 ? 0.5 : -0.3;
        grupo.add(m);
        runas.push({ m, fase: i * 0.7 });
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
      c.vivos.push((t) => {
        for (const { m, fase } of runas) (m.material as MeshBasicNodeMaterial).color.set(new Color('#FFD45E').multiplyScalar(0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 2.2 + fase))));
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
      c.vivos.push((t) => {
        tela.rotation.y = Math.sin(t * 0.9) * 0.08;
      });
    },
  },
};

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
