// El kit canario de naturaleza, hecho por código en el estilo de juguete de ARTE.md: siete
// plantas, cuatro rocas y el muro de piedra seca. Cada pieza tiene unas pocas variantes por
// semilla y se repite por toda la isla, instanciada (ARTE.md, «Modelos del mundo»). Funciones
// puras y deterministas, con el origen en la base de la pieza, a ras de suelo.

import { BoxGeometry, ConeGeometry, CylinderGeometry, SphereGeometry, Vector3, type BufferGeometry } from 'three/webgpu';
import { COLORES } from '../../arte/paleta';
import { Montaje, abollar, acanalar, apuntar, azar, doblar, elegir, ruido } from '../../arte/montaje';

/** Una hoja de juguete tumbada a lo largo de +z desde el origen: un huso aplastado con la punta caída. */
function hoja(largo: number, ancho: number, grueso: number, caida: number, lados = 6, anillos = 4): BufferGeometry {
  const g = new SphereGeometry(0.5, lados, anillos).rotateX(Math.PI / 2).scale(ancho, grueso, largo).translate(0, 0, largo / 2);
  return doblar(g, largo, caida);
}

/** Una hoja en dos mitades dobladas por el nervio, en V: la de las palmeras y las plataneras. */
function hojaDoble(largo: number, ancho: number, grueso: number, caida: number, pliegue = 0.35): BufferGeometry[] {
  return [-1, 1].map((s) => {
    const g = new SphereGeometry(0.5, 5, 4)
      .rotateX(Math.PI / 2)
      .scale(ancho / 2, grueso, largo)
      .translate((s * ancho) / 4, 0, largo / 2)
      .rotateZ(s * pliegue);
    return doblar(g, largo, caida);
  });
}

/** Levanta una hoja tumbada `sube` radianes, la gira `rumbo` alrededor de la vertical y la lleva a `en`. */
const orientar = (g: BufferGeometry, sube: number, rumbo: number, en: Vector3): BufferGeometry => g.rotateX(-sube).rotateY(rumbo).translate(en.x, en.y, en.z);

/** Un cilindro de `largo` que sale de `desde` hacia `dir`, más estrecho en la punta. */
const rama = (desde: Vector3, dir: Vector3, largo: number, base: number, punta: number, lados = 6): BufferGeometry =>
  apuntar(new CylinderGeometry(punta, base, largo, lados).translate(0, largo / 2, 0), desde, dir);

/** Palmera canaria: tronco grueso de anillos algo curvado, copa de catorce hojas y dátiles. */
export function palmera(semilla: number): BufferGeometry {
  const r = azar(semilla);
  const M = new Montaje();
  const alto = 2.1 + r() * 0.6;
  const curva = (r() - 0.5) * 0.6;
  const tramos = 7;
  const h = alto / tramos;
  for (let i = 0; i < tramos; i++) {
    const t0 = i / tramos;
    const t1 = (i + 1) / tramos;
    const x0 = curva * t0 * t0;
    const x1 = curva * t1 * t1;
    const rad = 0.21 - 0.04 * t0;
    const tramo = new CylinderGeometry(rad * 1.1, rad * 0.9, h * 1.04, 8).translate(0, (h * 1.04) / 2, 0);
    M.pon(apuntar(tramo, new Vector3(x0, t0 * alto, 0), new Vector3(x1 - x0, h, 0)), COLORES.troncoPalmera, i % 2 ? 0.9 : 1.04);
  }
  const cima = new Vector3(curva, alto, 0);
  M.pon(abollar(new SphereGeometry(0.26, 8, 6), 0.1, semilla).translate(cima.x, cima.y + 0.06, cima.z), COLORES.troncoPalmera, 0.8);
  const hojas = 14;
  for (let i = 0; i < hojas; i++) {
    const alta = i % 2 === 0;
    const largo = 1.25 + r() * 0.35;
    const rumbo = (i / hojas) * Math.PI * 2 + r() * 0.25;
    const sube = alta ? 0.75 + r() * 0.2 : 0.15 + r() * 0.2;
    hojaDoble(largo, 0.34, 0.035, alta ? 0.7 : 0.9).forEach((g, n) => M.pon(orientar(g, sube, rumbo, cima), n ? COLORES.verdePalmera : COLORES.verdePalmeraHondo, 0.94 + r() * 0.12));
  }
  for (const s of [-1, 1]) {
    M.pon(abollar(new SphereGeometry(0.11, 6, 4), 0.3, semilla + s).scale(1, 1.4, 1).translate(cima.x + s * 0.17, cima.y - 0.12, 0.08 * s), COLORES.datil);
  }
  return M.fusionar();
}

/** Platanera: tallo verde, seis hojas grandes dobladas por el nervio, el racimo y la bellota morada. */
export function platanera(semilla: number): BufferGeometry {
  const r = azar(semilla);
  const M = new Montaje();
  const alto = 0.85 + r() * 0.3;
  M.ponDegradado(new CylinderGeometry(0.08, 0.13, alto, 7).translate(0, alto / 2, 0), COLORES.troncoPlatanera, COLORES.hojaPlataneraHonda);
  const cima = new Vector3(0, alto - 0.05, 0);
  const hojas = 6;
  for (let i = 0; i < hojas; i++) {
    const largo = 0.85 + r() * 0.25;
    const rumbo = (i / hojas) * Math.PI * 2 + r() * 0.4;
    const sube = 0.65 + r() * 0.35;
    hojaDoble(largo, 0.54, 0.03, 0.55 + r() * 0.2, 0.25).forEach((g, n) => M.pon(orientar(g, sube, rumbo, cima), n ? COLORES.hojaPlatanera : COLORES.hojaPlataneraHonda, 0.95 + r() * 0.1));
  }
  const lado = r() * Math.PI * 2;
  const rx = Math.cos(lado) * 0.16;
  const rz = Math.sin(lado) * 0.16;
  M.pon(abollar(new SphereGeometry(0.11, 7, 5), 0.18, semilla).scale(1, 1.5, 1).translate(rx, alto - 0.3, rz), COLORES.racimo);
  M.pon(new ConeGeometry(0.05, 0.16, 6).rotateX(Math.PI).translate(rx, alto - 0.55, rz), COLORES.bellota);
  return M.fusionar();
}

/** Penacho de hojas de espada del drago: un corazón redondo y hojas largas en abanico hacia arriba. */
function penacho(M: Montaje, r: () => number, en: Vector3): void {
  M.pon(new SphereGeometry(0.12, 6, 4).translate(en.x, en.y, en.z), COLORES.verdeDragoHondo);
  const n = 9;
  for (let i = 0; i < n; i++) {
    const g = hoja(0.5 + r() * 0.12, 0.1, 0.025, 0.14, 5, 3);
    M.pon(orientar(g, 0.25 + r() * 1.05, (i / n) * Math.PI * 2 + r() * 0.3, en), i % 2 ? COLORES.verdeDrago : COLORES.verdeDragoHondo, 0.95 + r() * 0.1);
  }
}

/**
 * Drago: tronco liso y grueso con raíces, cinco ramas que se abren en dos y un penacho en cada
 * punta, todos a una altura parecida: la copa en paraguas que lo distingue.
 */
export function drago(semilla: number): BufferGeometry {
  const r = azar(semilla);
  const M = new Montaje();
  const alto = 0.9 + r() * 0.2;
  // Tronco liso de un solo color, que se ensancha en la base: con otro color abajo parecía una maceta.
  M.pon(new CylinderGeometry(0.2, 0.27, alto, 10).translate(0, alto / 2, 0), COLORES.troncoDrago);
  M.pon(new CylinderGeometry(0.27, 0.38, 0.22, 10).translate(0, 0.11, 0), COLORES.troncoDrago, 0.94);
  const base = new Vector3(0, alto - 0.05, 0);
  const ramas = 5;
  for (let i = 0; i < ramas; i++) {
    const rumbo = (i / ramas) * Math.PI * 2 + r() * 0.4;
    const dir = new Vector3(Math.cos(rumbo) * 0.8, 0.6, Math.sin(rumbo) * 0.8).normalize();
    const l1 = 0.45 + r() * 0.15;
    M.pon(rama(base, dir, l1, 0.12, 0.085, 7), COLORES.troncoDrago);
    const p1 = base.clone().addScaledVector(dir, l1);
    for (const s of [-1, 1]) {
      const r2 = rumbo + s * 0.5;
      const dir2 = new Vector3(Math.cos(r2) * 0.5, 0.85, Math.sin(r2) * 0.5).normalize();
      const l2 = 0.3 + r() * 0.1;
      M.pon(rama(p1, dir2, l2, 0.08, 0.06), COLORES.troncoDrago, 1.04);
      penacho(M, r, p1.clone().addScaledVector(dir2, l2));
    }
  }
  return M.fusionar();
}

/** Cardón: un macizo apretado de columnas gruesas con cinco costillas, más altas en el centro. */
export function cardon(semilla: number): BufferGeometry {
  const r = azar(semilla);
  const M = new Montaje();
  const n = 8 + Math.floor(r() * 4);
  for (let i = 0; i < n; i++) {
    // Reparto en girasol: las columnas se aprietan sin pisarse.
    const ang = i * 2.39996 + r() * 0.3;
    const d = 0.04 + 0.3 * Math.sqrt(i / n);
    const alto = 0.75 + r() * 0.45 + (1 - d / 0.34) * 0.35;
    const rad = 0.12 + r() * 0.025;
    const inclina = d * 0.4;
    const desde = new Vector3(Math.cos(ang) * d, 0, Math.sin(ang) * d);
    const dir = new Vector3(Math.cos(ang) * inclina, 1, Math.sin(ang) * inclina);
    const columna = acanalar(new CylinderGeometry(rad, rad * 1.06, alto, 10, 2, true).translate(0, alto / 2, 0), 5, 0.26);
    const tapa = acanalar(new SphereGeometry(rad, 10, 3, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, alto, 0), 5, 0.26);
    M.ponDegradado(apuntar(columna, desde, dir), COLORES.verdeCardonHondo, COLORES.verdeCardon, 0.94 + r() * 0.1);
    M.pon(apuntar(tapa, desde, dir), COLORES.verdeCardon, 1.05);
  }
  return M.fusionar();
}

/** Tabaiba: un arbusto en cúpula de ramas grises que acaban en rosetas redondas verde amarillento. */
export function tabaiba(semilla: number): BufferGeometry {
  const r = azar(semilla);
  const M = new Montaje();
  M.pon(new CylinderGeometry(0.07, 0.1, 0.16, 6).translate(0, 0.08, 0), COLORES.ramaTabaiba);
  const base = new Vector3(0, 0.12, 0);
  const n = 7 + Math.floor(r() * 2);
  for (let i = 0; i < n; i++) {
    const rumbo = (i / n) * Math.PI * 2 + r() * 0.4;
    const dir = new Vector3(Math.cos(rumbo) * 0.9, 0.55 + r() * 0.45, Math.sin(rumbo) * 0.9).normalize();
    const l = 0.25 + r() * 0.13;
    M.pon(rama(base, dir, l, 0.045, 0.03, 5), COLORES.ramaTabaiba);
    const p = base.clone().addScaledVector(dir, l);
    M.pon(abollar(new SphereGeometry(0.17 + r() * 0.05, 7, 5), 0.15, semilla + i).scale(1, 0.65, 1).translate(p.x, p.y + 0.04, p.z), COLORES.verdeTabaiba, 0.9 + r() * 0.16);
  }
  for (let i = 0; i < 2; i++) {
    M.pon(abollar(new SphereGeometry(0.19, 7, 5), 0.15, semilla + 50 + i).scale(1, 0.65, 1).translate((i - 0.5) * 0.16, 0.42, (r() - 0.5) * 0.1), COLORES.verdeTabaiba, 1.04);
  }
  return M.fusionar();
}

/**
 * Tajinaste azul gigante, endémico de La Palma: roseta de hojas plateadas y una espiga alta hecha
 * de racimos de flores, azul abajo y más clara arriba.
 */
export function tajinaste(semilla: number): BufferGeometry {
  const r = azar(semilla);
  const M = new Montaje();
  const hojas = 9;
  for (let i = 0; i < hojas; i++) {
    const g = hoja(0.38 + r() * 0.1, 0.11, 0.03, 0.1, 5, 3);
    M.pon(orientar(g, 0.2 + r() * 0.35, (i / hojas) * Math.PI * 2 + r() * 0.3, new Vector3(0, 0.06, 0)), COLORES.hojaTajinaste, 0.92 + r() * 0.14);
  }
  const alto = 1.2 + r() * 0.6;
  const lado = new Vector3((r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.3);
  const racimos = 9;
  for (let i = 0; i < racimos; i++) {
    const t = i / (racimos - 1);
    const rad = 0.21 * (1 - 0.72 * t) + 0.03;
    const y = 0.32 + t * (alto - 0.35);
    const g = abollar(new SphereGeometry(rad, 7, 5), 0.2, semilla + i).scale(1, 1.3, 1).translate(lado.x * t * t, y, lado.z * t * t);
    M.pon(g, t < 0.55 ? COLORES.florTajinaste : COLORES.florTajinasteClaro, 0.92 + r() * 0.16);
  }
  M.pon(new ConeGeometry(0.13, 0.3, 7).translate(0, 0.18, 0), COLORES.hojaTajinaste, 0.85);
  return M.fusionar();
}

/** Roca de basalto redondeada, a veces con una piedra pequeña al lado; oscura abajo y clara arriba. */
export function rocaBasaltica(semilla: number): BufferGeometry {
  const r = azar(semilla);
  const M = new Montaje();
  const piedra = (rad: number, x: number, z: number, s: number) => {
    const g = abollar(new SphereGeometry(rad, 8, 6), 0.2, s)
      .scale(1, 0.6 + r() * 0.2, 0.85 + r() * 0.2)
      .rotateY(r() * Math.PI);
    g.computeBoundingBox();
    g.translate(x, -g.boundingBox!.min.y - rad * 0.12, z);
    M.ponDegradado(g, COLORES.basalto, COLORES.basaltoClaro);
  };
  piedra(0.34 + r() * 0.08, 0, 0, semilla);
  if (r() < 0.6) piedra(0.16 + r() * 0.06, 0.32, 0.12, semilla + 1);
  return M.fusionar();
}

/** Órganos: columnas hexagonales de basalto encajadas en panal, de alturas distintas. */
export function organos(semilla: number): BufferGeometry {
  const r = azar(semilla);
  const M = new Montaje();
  const R = 0.12;
  const paso = Math.sqrt(3) * R * 1.02;
  const celdas: [number, number][] = [[0, 0]];
  for (let k = 0; k < 6; k++) celdas.push([Math.cos((k * Math.PI) / 3) * paso, Math.sin((k * Math.PI) / 3) * paso]);
  celdas.forEach(([x, z], i) => {
    if (i > 0 && r() < 0.25) return;
    const alto = i === 0 ? 0.95 + r() * 0.3 : 0.35 + r() * 0.55;
    M.ponDegradado(new CylinderGeometry(R, R, alto, 6).translate(x, alto / 2, z), COLORES.basalto, COLORES.basaltoClaro, 0.92 + r() * 0.12);
    M.pon(new CylinderGeometry(R * 0.78, R, 0.05, 6).translate(x, alto + 0.025, z), COLORES.basaltoClaro, 1.05);
  });
  return M.fusionar();
}

/** Escoria volcánica: dos o tres terrones rojizos y porosos. */
export function escoria(semilla: number): BufferGeometry {
  const r = azar(semilla);
  const M = new Montaje();
  const n = 2 + Math.floor(r() * 2);
  for (let i = 0; i < n; i++) {
    const rad = i === 0 ? 0.26 : 0.12 + r() * 0.07;
    const g = abollar(new SphereGeometry(rad, 7, 5), 0.32, semilla + i * 13).scale(1, 0.7, 1);
    g.computeBoundingBox();
    const ang = r() * Math.PI * 2;
    const d = i === 0 ? 0 : 0.28;
    g.translate(Math.cos(ang) * d, -g.boundingBox!.min.y - rad * 0.15, Math.sin(ang) * d);
    M.ponDegradado(g, COLORES.escoriaHonda, COLORES.escoria);
  }
  return M.fusionar();
}

/** Un tramo de muro de piedra seca de una casilla, a lo largo de x (de -0,5 a 0,5): tres hiladas. */
export function muroPiedra(semilla: number): BufferGeometry {
  const r = azar(semilla);
  const M = new Montaje();
  const colores = [COLORES.basalto, COLORES.basaltoClaro, COLORES.basaltoClaro, COLORES.piedraParda, COLORES.piedraParda];
  const hilada = (y: number, alto: number, n: number) => {
    const largo = 1 / n;
    for (let i = 0; i < n; i++) {
      const g = abollar(new SphereGeometry(0.5, 6, 4), 0.12, semilla + i * 7 + Math.round(y * 100))
        .scale(largo * 1.25, alto * 1.35, 0.36 + r() * 0.06)
        .translate(-0.5 + largo * (i + 0.5), y + alto / 2, (r() - 0.5) * 0.04);
      M.pon(g, elegir(r, colores), 0.9 + r() * 0.2);
    }
  };
  hilada(0, 0.24, 4);
  hilada(0.2, 0.2, 3);
  hilada(0.38, 0.12, 4);
  return M.fusionar();
}

/** Un laurel de la laurisilva: tronco algo torcido y una copa redonda de varias bolas abolladas. */
export function laurel(semilla: number): BufferGeometry {
  const r = azar(semilla);
  const M = new Montaje();
  const alto = 0.75 + r() * 0.35;
  const inclina = (r() - 0.5) * 0.25;
  M.pon(new CylinderGeometry(0.06, 0.1, alto, 5).translate(0, alto / 2, 0).rotateZ(inclina), COLORES.troncoLaurel);
  const cx = -Math.sin(inclina) * alto;
  const cy = Math.cos(inclina) * alto;
  const verdes = [COLORES.laurelHondo, COLORES.laurel, COLORES.laurelClaro];
  const bolas = 5;
  for (let i = 0; i < bolas; i++) {
    const centro = i === 0;
    const a = (i / bolas) * Math.PI * 2 + r();
    const rad = centro ? 0.44 + r() * 0.08 : 0.28 + r() * 0.1;
    const d = centro ? 0 : 0.3 + r() * 0.08;
    const y = cy + (centro ? 0.34 : 0.04 + r() * 0.2);
    const bola = abollar(new SphereGeometry(rad, 7, 5).scale(1, 0.82, 1), 0.12, semilla * 7 + i);
    M.pon(bola.translate(cx + Math.cos(a) * d, y, Math.sin(a) * d), centro ? COLORES.laurel : verdes[i % 3], 0.94 + r() * 0.12);
  }
  return M.fusionar();
}

/**
 * Lajas de lava del malpaís para una casilla: piedras dentadas negras, pardas y rojizas, una
 * punta y alguna mancha de liquen. Caben en la casilla (de -0,5 a 0,5) y salen del suelo (y = 0).
 */
export function lajasMalpais(semilla: number, colores: readonly string[] = [COLORES.lavaNegra, COLORES.lavaNegra, COLORES.lavaParda, COLORES.lavaRojiza]): BufferGeometry {
  const r = azar(semilla);
  const M = new Montaje();
  // Una laja por celda de una rejilla de 3 × 3 desordenada, para que cubran el suelo.
  for (let i = 0; i < 9; i++) {
    if (r() < 0.2) continue;
    const rad = 0.12 + r() * 0.06;
    const alto = 0.06 + r() * 0.14;
    const g = new CylinderGeometry(rad * (0.45 + r() * 0.3), rad, alto, 5 + Math.floor(r() * 2), 1);
    const pos = g.getAttribute('position');
    for (let v = 0; v < pos.count; v++) {
      if (pos.getY(v) <= 0) continue;
      pos.setY(v, pos.getY(v) + ruido(pos.getX(v), 1, pos.getZ(v), semilla + i) * alto * 0.45);
    }
    g.computeVertexNormals();
    const x = ((i % 3) - 1) * 0.27 + (r() - 0.5) * 0.08;
    const z = (Math.floor(i / 3) - 1) * 0.27 + (r() - 0.5) * 0.08;
    g.rotateY(r() * Math.PI)
      .rotateX((r() - 0.5) * 0.4)
      .rotateZ((r() - 0.5) * 0.4)
      .translate(x, alto / 2 - 0.03, z);
    M.pon(g, elegir(r, colores), 0.88 + r() * 0.24);
  }
  const punta = 0.24 + r() * 0.14;
  M.pon(new ConeGeometry(0.07, punta, 4).rotateY(r()).translate((r() - 0.5) * 0.6, punta / 2 - 0.02, (r() - 0.5) * 0.6), COLORES.lavaNegra, 0.85);
  if (r() < 0.7) M.pon(new SphereGeometry(0.06, 5, 3).scale(1, 0.35, 1).translate((r() - 0.5) * 0.6, 0.01, (r() - 0.5) * 0.6), COLORES.liquen);
  return M.fusionar();
}

/**
 * Viña de La Geria (Lanzarote): la vid baja en su hoyo de picón negro, con el muro de piedra en
 * media luna que la protege del viento, al norte (de espaldas a la cámara).
 */
export function vid(semilla: number): BufferGeometry {
  const r = azar(semilla);
  const M = new Montaje();
  M.pon(new CylinderGeometry(0.4, 0.3, 0.04, 14).translate(0, 0.01, 0), COLORES.picon, 0.7);
  const piedras = 7;
  for (let i = 0; i < piedras; i++) {
    const a = Math.PI + (i / (piedras - 1) - 0.5) * Math.PI * 1.1;
    const g = abollar(new SphereGeometry(0.5, 6, 4), 0.12, semilla + i)
      .scale(0.17, 0.14 + r() * 0.06, 0.12)
      .rotateY(a)
      .translate(Math.sin(a) * 0.4, 0.07, Math.cos(a) * 0.4);
    M.pon(g, elegir(r, [COLORES.basalto, COLORES.basaltoClaro, COLORES.piedraParda]), 0.9 + r() * 0.2);
  }
  M.pon(rama(new Vector3(), new Vector3(0.15, 1, 0.05), 0.24, 0.04, 0.03, 5), COLORES.troncoLaurel);
  M.pon(abollar(new SphereGeometry(0.2, 8, 6), 0.18, semilla).scale(1.25, 0.6, 1.1).translate(0.04, 0.3, 0.02), COLORES.verdeVid, 0.95 + r() * 0.1);
  for (const s of [-1, 1]) M.pon(abollar(new SphereGeometry(0.05, 6, 4), 0.3, semilla + s).scale(1, 1.4, 1).translate(s * 0.12, 0.2, 0.12), COLORES.uva);
  return M.fusionar();
}

/** Tunera (chumbera): palas planas y redondas que salen unas de otras, con higos picos en el borde. */
export function tunera(semilla: number): BufferGeometry {
  const r = azar(semilla);
  const M = new Montaje();
  const pala = (c: Vector3, giro: number, inclina: number, tam: number) => {
    const g = abollar(new SphereGeometry(0.5, 8, 6), 0.05, semilla).scale(tam * 0.75, tam, 0.11).rotateZ(inclina).rotateY(giro).translate(c.x, c.y, c.z);
    M.ponDegradado(g, COLORES.verdeTuneraHondo, COLORES.verdeTunera, 0.94 + r() * 0.1);
  };
  const base = 0.42;
  pala(new Vector3(0, base / 2 + 0.02, 0), r() * Math.PI, 0, base);
  pala(new Vector3(0.05, base / 2, 0.02), r() * Math.PI + 1.4, 0.1, base * 0.9);
  const arriba = 3 + Math.floor(r() * 3);
  for (let i = 0; i < arriba; i++) {
    const a = (i / arriba) * Math.PI * 2 + r();
    const t = 0.3 + r() * 0.06;
    const c = new Vector3(Math.cos(a) * 0.14, base + t * 0.35, Math.sin(a) * 0.14);
    pala(c, a + Math.PI / 2, (r() - 0.5) * 0.9, t);
    if (r() < 0.6) M.pon(new SphereGeometry(0.035, 6, 4).scale(1, 1.3, 1).translate(c.x, c.y + t * 0.5, c.z), COLORES.higoPico);
  }
  return M.fusionar();
}

/** Volcán de las cumbres: un cono de escorias con su cráter, ocre abajo y rojizo arriba. Mide 2 de ancho. */
export function volcan(semilla: number): BufferGeometry {
  const r = azar(semilla);
  const M = new Montaje();
  const alto = 0.75 + r() * 0.25;
  M.ponDegradado(abollar(new CylinderGeometry(0.32, 1, alto, 18, 4, true).translate(0, alto / 2, 0), 0.05, semilla), COLORES.conoOcre, COLORES.conoRojo);
  M.pon(new CylinderGeometry(0.3, 0.33, 0.06, 18, 1, true).translate(0, alto, 0), COLORES.conoRojo, 0.85);
  M.pon(new CylinderGeometry(0.3, 0.3, 0.02, 18).translate(0, alto - 0.08, 0), COLORES.crater);
  return M.fusionar();
}

/** Nube: unas bolas blancas aplastadas, juntas. Flota: su centro está en el origen. */
export function nube(semilla: number): BufferGeometry {
  const r = azar(semilla);
  const M = new Montaje();
  const n = 4 + Math.floor(r() * 2);
  for (let i = 0; i < n; i++) {
    const rad = 0.28 + r() * 0.18;
    M.pon(new SphereGeometry(rad, 9, 6).scale(1, 0.62, 0.85).translate((i - (n - 1) / 2) * 0.32, r() * 0.08, (r() - 0.5) * 0.25), COLORES.nube, 0.97 + r() * 0.03);
  }
  return M.fusionar();
}

/**
 * Colada de lava (no se pisa): las lajas del malpaís en negros y grises de basalto, sin el rojizo,
 * para que no se confunda con el malpaís, que sí se pisa.
 */
export const colada = (semilla: number): BufferGeometry => lajasMalpais(semilla, [COLORES.lavaNegra, COLORES.lavaNegra, COLORES.basalto, COLORES.crater]);

/** Sombrilla de playa: palo y tela a gajos de dos colores. */
export function sombrilla(semilla: number): BufferGeometry {
  const M = new Montaje();
  const color = [COLORES.toldoAzul, COLORES.geranio][semilla % 2];
  M.pon(new CylinderGeometry(0.025, 0.025, 1.25, 6).translate(0, 0.62, 0), COLORES.cal, 0.85);
  // La tela: un cono bajo, con gajos alternos de color y de blanco.
  const gajos = 8;
  for (let i = 0; i < gajos; i++) {
    const gajo = new ConeGeometry(0.62, 0.26, 2, 1, true, (i / gajos) * Math.PI * 2, (Math.PI * 2) / gajos).translate(0, 1.32, 0);
    M.pon(gajo, i % 2 ? COLORES.cal : color);
  }
  M.pon(new SphereGeometry(0.035, 6, 4).translate(0, 1.46, 0), COLORES.cal);
  // Clavada en la arena, nunca del todo recta.
  return M.fusionar().rotateZ(semilla % 2 ? 0.1 : -0.07);
}

/** Toalla de playa, a rayas, tendida en la arena: más larga que la casilla, hacia el norte. */
export function toalla(semilla: number): BufferGeometry {
  const M = new Montaje();
  const color = [COLORES.toldoAzul, COLORES.geranio, COLORES.carpinteriaVerde][semilla % 3];
  for (let i = 0; i < 5; i++) M.caja(0.62, 0.02, 0.27, 0, 0.01, 0.4 - i * 0.27, i % 2 ? COLORES.cal : color);
  // Tendida a mano: cada una, con su giro.
  return M.fusionar().rotateY(((semilla % 3) - 1) * 0.08);
}

/** Boya roja y blanca, flotando: bola, banda y un mástil con su luz. */
export function boya(_semilla: number): BufferGeometry {
  const M = new Montaje();
  M.pon(new SphereGeometry(0.18, 12, 8).translate(0, 0.08, 0), COLORES.geranio);
  M.pon(new CylinderGeometry(0.185, 0.185, 0.06, 12, 1, true).translate(0, 0.12, 0), COLORES.cal);
  M.pon(new CylinderGeometry(0.025, 0.035, 0.3, 6).translate(0, 0.38, 0), COLORES.cal, 0.9);
  M.pon(new SphereGeometry(0.045, 8, 6).translate(0, 0.55, 0), COLORES.amarilloLuz);
  return M.fusionar();
}

/** Barca de pescadores canaria: casco blanco, borda de color, cubierta de madera y dos bancos. */
export function barca(semilla: number): BufferGeometry {
  const r = azar(semilla);
  const M = new Montaje();
  const franja = elegir(r, [COLORES.toldoAzul, COLORES.carpinteriaVerde, COLORES.geranio]);
  // Cada barca, de un largo y con los bancos en su sitio.
  const largo = 1.3 + r() * 0.4;
  const banco = -0.35 + r() * 0.15;
  /** Lo estrecha hacia proa y popa (y lo hace menos hondo), igual que el casco. */
  const estrechar = (g: BufferGeometry, hondo = false): BufferGeometry => {
    const pos = g.getAttribute('position');
    for (let i = 0; i < pos.count; i++) {
      const k = 1 - Math.pow(Math.min(1, Math.abs(pos.getX(i)) / (largo / 2)), 3) * 0.75;
      pos.setZ(i, pos.getZ(i) * k);
      if (hondo) pos.setY(i, pos.getY(i) * (0.8 + 0.2 * k));
    }
    g.computeVertexNormals();
    return g;
  };
  // Casco: media caña tumbada a lo largo de x y abierta hacia arriba (de θ = π a 2π queda abajo).
  const casco = new CylinderGeometry(0.32, 0.32, largo, 10, 8, false, Math.PI, Math.PI).rotateZ(Math.PI / 2);
  M.pon(estrechar(casco, true).translate(0, 0.2, 0), COLORES.cal);
  M.pon(estrechar(new BoxGeometry(largo - 0.04, 0.04, 0.6, 8, 1, 1)).translate(0, 0.17, 0), COLORES.maderaTostada);
  // La borda, de color: es lo que se ve desde arriba.
  for (const lado of [1, -1]) M.pon(estrechar(new BoxGeometry(largo - 0.02, 0.06, 0.07, 8, 1, 1).translate(0, 0, lado * 0.285)).translate(0, 0.23, 0), franja);
  for (const x of [banco, banco + 0.55]) M.caja(0.1, 0.04, 0.5, x, 0.25, 0, COLORES.maderaTostada, 0.9);
  return M.fusionar();
}

/**
 * La estatua que desentierra la arqueóloga en las dunas (Fuerteventura, 2026-11-13; provisional,
 * «ya veremos cómo ponemos la estatua»): un bloque de piedra medio enterrado e inclinado, con una
 * cabeza tallada de criatura ancestral, y alrededor las estacas y la cuerda de la excavación.
 */
export function estatuaEnterrada(semilla: number): BufferGeometry {
  const M = new Montaje();
  const piedra = '#B9AE9C';
  M.pon(new BoxGeometry(0.62, 0.7, 0.5).rotateZ(0.18).translate(0.02, 0.29, 0), piedra, 0.95);
  // La cabeza, con el hocico hacia delante y dos cuernos hacia atrás.
  M.pon(new SphereGeometry(0.24, 9, 7).scale(1, 0.9, 1.1).translate(0.12, 0.72, 0.02), piedra);
  M.pon(new BoxGeometry(0.2, 0.14, 0.26).translate(0.14, 0.66, 0.24), piedra, 0.92);
  for (const s of [-1, 1]) M.pon(new ConeGeometry(0.05, 0.3, 6).rotateX(-0.9).translate(0.12 + s * 0.12, 0.92, -0.12), piedra, 0.88);
  // Las estacas en las esquinas y la cuerda roja entre ellas.
  const esquinas: [number, number][] = [[-0.46, -0.46], [0.46, -0.46], [0.46, 0.46], [-0.46, 0.46]];
  for (const [x, z] of esquinas) M.pon(new CylinderGeometry(0.02, 0.02, 0.42, 5).translate(x, 0.21, z), COLORES.maderaTostada);
  for (let i = 0; i < 4; i++) {
    const [x0, z0] = esquinas[i];
    const [x1, z1] = esquinas[(i + 1) % 4];
    const largo = Math.hypot(x1 - x0, z1 - z0);
    M.pon(new BoxGeometry(largo, 0.015, 0.015).rotateY(-Math.atan2(z1 - z0, x1 - x0)).translate((x0 + x1) / 2, 0.36, (z0 + z1) / 2), COLORES.geranio);
  }
  return M.fusionar().rotateY((semilla % 4) * 0.2);
}

/** Todas las piezas del kit, por nombre. */
export const KIT = {
  laurel,
  palmera,
  drago,
  platanera,
  cardon,
  tabaiba,
  tajinaste,
  roca: rocaBasaltica,
  organos,
  escoria,
  lajas: (s: number) => lajasMalpais(s),
  colada,
  muro: muroPiedra,
  vid,
  tunera,
  volcan,
  nube,
  boya,
  barca,
  sombrilla,
  toalla,
  estatua: estatuaEnterrada,
} satisfies Record<string, (semilla: number) => BufferGeometry>;

export type PiezaKit = keyof typeof KIT;

/** Cuántas variantes de cada pieza se usan en la isla. */
// Cada variante es una llamada de dibujo más por trozo de la isla: pocas, y las justas para que
// no se vean repetidas (con giro y escala distintos ya varían bastante).
export const VARIANTES: Record<PiezaKit, number> = {
  laurel: 3,
  palmera: 2,
  drago: 1,
  platanera: 2,
  cardon: 2,
  tabaiba: 2,
  tajinaste: 2,
  roca: 3,
  organos: 1,
  escoria: 2,
  lajas: 3,
  colada: 3,
  muro: 2,
  vid: 2,
  tunera: 2,
  volcan: 3,
  nube: 2,
  boya: 1,
  barca: 2,
  sombrilla: 2,
  toalla: 3,
  estatua: 1,
};

/** La geometría de una variante de una pieza del kit. */
export const piezaKit = (tipo: PiezaKit, variante: number): BufferGeometry => KIT[tipo](variante * 131 + 7);
