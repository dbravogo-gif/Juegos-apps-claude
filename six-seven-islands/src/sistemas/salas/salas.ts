// Subsistema «salas»: los interiores en 3D, hechos por código en el estilo de juguete de ARTE.md.
// Cada sala es un diorama pequeño, lejos de la isla, como una casa de muñecas: suelo de tablas,
// pared del fondo y de los lados altas y blancas, y la de delante baja para que la cámara vea
// dentro. Los muebles salen de las letras del mapa (LEYENDA) y las estatuas del museo, de sus
// personajes. Una malla por sala. Lee «partida»; no la cambia.

import { CylinderGeometry, Mesh, SphereGeometry, type BufferGeometry } from 'three/webgpu';
import { attribute } from 'three/tsl';
import { clave, deClave, type Mundo } from '../../core/mundo';
import { MaterialDiorama } from '../../arte/material';
import { COLORES } from '../../arte/paleta';
import { alturaSuelo } from '../../arte/escala';
import { Montaje, abollar } from '../../arte/montaje';
import { COLOR_CRIATURA } from '../../data/tipos';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Partida } from '../partida/partida';

const SUELO = alturaSuelo(0);
const ALTO_PARED = 2.3;
const ALTO_LADO = 1.9;
const ALTO_DELANTE = 0.35;

const hex = (n: number): string => `#${n.toString(16).padStart(6, '0')}`;

/** Un mueble de una casilla, con la base en el suelo de la sala. */
function mueble(M: Montaje, c: string, x: number, z: number, n: number): void {
  const y = SUELO;
  switch (c) {
    case 'o': // mesa con un jarrón
      M.cajaRedonda(0.8, 0.07, 0.8, x, y + 0.5, z, COLORES.balcon, 0.03);
      for (const [dx, dz] of [[-0.32, -0.32], [0.32, -0.32], [-0.32, 0.32], [0.32, 0.32]]) M.caja(0.07, 0.5, 0.07, x + dx, y, z + dz, COLORES.balcon, 0.85);
      M.pon(new CylinderGeometry(0.07, 0.09, 0.2, 8).translate(x, y + 0.67, z), COLORES.toldoAzul);
      M.pon(abollar(new SphereGeometry(0.09, 6, 4), 0.2, n).translate(x, y + 0.82, z), COLORES.geranio);
      break;
    case 'h': { // estantería con libros de colores
      M.cajaRedonda(0.9, 1.5, 0.4, x, y, z - 0.25, COLORES.balcon, 0.03);
      const libros = [COLORES.toldoAzul, COLORES.geranio, COLORES.verdePalmera, COLORES.fachadaOcre, COLORES.crema];
      for (let fila = 0; fila < 3; fila++) {
        for (let i = 0; i < 5; i++) M.caja(0.13, 0.28, 0.3, x - 0.32 + i * 0.16, y + 0.12 + fila * 0.46, z - 0.2, libros[(i + fila + n) % libros.length]);
      }
      break;
    }
    // 'c', el mostrador, va por tramos en geometriaSala.
    case 'k': // mesa con ordenador
      M.caja(0.85, 0.06, 0.6, x, y + 0.6, z, COLORES.balcon);
      M.caja(0.08, 0.6, 0.5, x - 0.35, y, z, COLORES.balcon, 0.85);
      M.caja(0.08, 0.6, 0.5, x + 0.35, y, z, COLORES.balcon, 0.85);
      M.caja(0.5, 0.36, 0.06, x, y + 0.72, z - 0.15, COLORES.ojo);
      M.caja(0.44, 0.3, 0.02, x, y + 0.75, z - 0.11, COLORES.pantalla);
      M.caja(0.4, 0.03, 0.15, x, y + 0.66, z + 0.1, COLORES.ojo, 1.4);
      break;
    case 'l': // cama
      M.cajaRedonda(0.9, 0.3, 1, x, y, z, COLORES.balcon, 0.04);
      M.cajaRedonda(0.84, 0.14, 0.94, x, y + 0.3, z, COLORES.cal, 0.05);
      M.cajaRedonda(0.86, 0.06, 0.6, x, y + 0.42, z + 0.2, COLORES.toldoAzul, 0.03);
      M.cajaRedonda(0.5, 0.1, 0.22, x, y + 0.44, z - 0.32, COLORES.crema, 0.04);
      break;
    case 'v': // maceta con planta
      M.pon(new CylinderGeometry(0.22, 0.16, 0.36, 9).translate(x, y + 0.18, z), COLORES.terracota);
      M.pon(abollar(new SphereGeometry(0.3, 8, 6), 0.18, n).scale(1, 1.2, 1).translate(x, y + 0.66, z), COLORES.laurel);
      break;
  }
}

/** Estatua provisional de una inicial: pedestal de cantería, figura de piedra y adornos de su tipo. */
function estatua(M: Montaje, tipo: string, x: number, z: number): void {
  const y = SUELO;
  const color = hex(COLOR_CRIATURA[tipo as keyof typeof COLOR_CRIATURA] ?? 0x888888);
  M.cajaRedonda(0.84, 0.55, 0.84, x, y, z, COLORES.canteria, 0.06);
  M.caja(0.42, 0.16, 0.04, x, y + 0.2, z + 0.43, color);
  const base = y + 0.55;
  M.pon(abollar(new SphereGeometry(0.32, 12, 9), 0.06, 3).scale(1, 1.05, 0.9).translate(x, base + 0.32, z), COLORES.piedraEstatua);
  M.pon(abollar(new SphereGeometry(0.24, 12, 9), 0.05, 4).translate(x, base + 0.78, z + 0.04), COLORES.piedraEstatua, 1.04);
  if (tipo === 'planta') {
    for (const s of [-1, 1]) M.pon(new SphereGeometry(0.5, 8, 5).scale(0.16, 0.05, 0.42).rotateX(-1.1).rotateZ(s * 0.5).translate(x + s * 0.1, base + 1.05, z - 0.05), color);
  } else if (tipo === 'agua') {
    M.pon(new SphereGeometry(0.5, 8, 5).scale(0.05, 0.36, 0.3).translate(x, base + 1.0, z - 0.06), color);
    M.pon(new SphereGeometry(0.5, 8, 5).scale(0.06, 0.24, 0.5).rotateX(0.5).translate(x, base + 0.25, z - 0.4), color);
  } else {
    for (const s of [-1, 1]) M.pon(new CylinderGeometry(0, 0.06, 0.3, 6).rotateZ(-s * 0.4).translate(x + s * 0.14, base + 1.05, z), color);
    M.pon(new CylinderGeometry(0, 0.12, 0.42, 7).rotateX(-0.9).translate(x, base + 0.38, z - 0.42), color);
  }
}

/** Un tramo recto de casillas iguales, de la (x0, y0) a la (x1, y1), ambas incluidas. */
interface Tramo {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * Las paredes en tramos rectos: primero las filas (de 2 casillas o más) y después las columnas
 * con lo que queda. Una caja por casilla dejaba caras pegadas y zócalos solapados en cada junta,
 * que parpadeaban como líneas al moverse la cámara (autor, 2026-11-10).
 */
export function tramosDePared(sala: Mundo): Tramo[] {
  return tramosDe(sala, '|');
}

/** Tramos de una letra: filas de 2 casillas o más y, con lo que queda, columnas. */
export function tramosDe(sala: Mundo, letra: string): Tramo[] {
  const pared = (x: number, y: number) => sala.casillas.get(clave(x, y))?.c === letra;
  const usadas = new Set<number>();
  const tramos: Tramo[] = [];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const k of sala.casillas.keys()) {
    const [x, y] = deClave(k);
    [minX, maxX, minY, maxY] = [Math.min(minX, x), Math.max(maxX, x), Math.min(minY, y), Math.max(maxY, y)];
  }
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (!pared(x, y)) continue;
      let x1 = x;
      while (pared(x1 + 1, y)) x1++;
      if (x1 > x) {
        tramos.push({ x0: x, y0: y, x1, y1: y });
        for (let i = x; i <= x1; i++) usadas.add(clave(i, y));
      }
      x = x1;
    }
  }
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      if (!pared(x, y) || usadas.has(clave(x, y))) continue;
      let y1 = y;
      while (pared(x, y1 + 1) && !usadas.has(clave(x, y1 + 1))) y1++;
      tramos.push({ x0: x, y0: y, x1: x, y1 });
      y = y1;
    }
  }
  return tramos;
}

/** La sala entera, en sus casillas de mundo: suelo, paredes, muebles, alfombra y estatuas. */
export function geometriaSala(sala: Mundo, id: string): BufferGeometry {
  const M = new Montaje();
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const k of sala.casillas.keys()) {
    const [x, y] = deClave(k);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const centroX = (minX + maxX) / 2;
  const centroY = (minY + maxY) / 2;
  // Una losa oscura bajo las tablas: por sus juntas se veía el fondo, que parpadeaba en líneas.
  M.caja(maxX - minX + 1, 0.1, maxY - minY + 1, centroX, SUELO - 0.12, centroY, COLORES.maderaSueloOscura, 0.6);
  // Paredes por tramos, lisas: un solo color, sin juntas entre casillas.
  for (const t of tramosDePared(sala)) {
    const alto = t.y0 === minY ? ALTO_PARED : t.y1 === maxY ? ALTO_DELANTE : ALTO_LADO;
    const an = t.x1 - t.x0 + 1;
    const fo = t.y1 - t.y0 + 1;
    const cx = (t.x0 + t.x1) / 2;
    const cz = (t.y0 + t.y1) / 2;
    const fila = t.y0 === t.y1;
    M.caja(an, alto, fo, cx, SUELO, cz, COLORES.cal);
    // El zócalo sobresale solo hacia los lados de la pared; en las columnas se queda 1 cm corto
    // por cada punta para no solaparse con el de la fila en la esquina.
    if (alto > ALTO_DELANTE) M.caja(fila ? an : 1.02, 0.45, fila ? 1.02 : fo - 0.02, cx, SUELO, cz, COLORES.zocaloOcre);
    // El remate, 1 cm más alto que la pared: con la cara de arriba a la misma altura, las dos
    // se peleaban por cada píxel.
    if (t.y0 === minY && fila) M.caja(an + 0.02, 0.13, 1.02, cx, SUELO + alto - 0.12, cz, COLORES.balcon);
  }
  // Mostradores: cada tramo seguido, de una pieza, por lo mismo que las paredes.
  for (const t of tramosDe(sala, 'c')) {
    const an = t.x1 - t.x0 + 1;
    const cx = (t.x0 + t.x1) / 2;
    M.caja(an, 0.8, 0.6, cx, SUELO, t.y0, COLORES.balcon);
    M.caja(an + 0.02, 0.06, 0.66, cx, SUELO + 0.8, t.y0, COLORES.crema);
  }
  for (const [k, cm] of sala.casillas) {
    const [x, y] = deClave(k);
    const n = (x * 7 + y * 13) % 5;
    // Suelo de tablas, dos por casilla, en dos tonos.
    for (const s of [-1, 1]) {
      M.caja(0.49, 0.1, 0.98, x + s * 0.25, SUELO - 0.1, y, (x + y + (s > 0 ? 1 : 0)) % 2 ? COLORES.maderaSuelo : COLORES.maderaSueloOscura, 0.96 + (n % 3) * 0.03);
    }
    if (cm.c === '|') {
      if (y === minY) {
        // Ventanas en la pared del fondo, una de cada tres casillas.
        if ((x - minX) % 3 === 2 && x < maxX) {
          M.caja(0.62, 0.72, 0.06, x, SUELO + 0.95, y + 0.5, COLORES.canteria);
          M.caja(0.5, 0.6, 0.08, x, SUELO + 1.01, y + 0.5, COLORES.cristal);
          M.caja(0.035, 0.6, 0.1, x, SUELO + 1.01, y + 0.5, COLORES.carpinteriaVerde);
        }
      }
    } else if (cm.c === 'd') {
      M.caja(0.8, 0.02, 0.7, x, SUELO, y, COLORES.alfombra);
      for (const s of [-1, 1]) M.caja(0.14, 0.9, 0.3, x + s * 0.55, SUELO, y + 0.2, COLORES.balcon);
    } else {
      mueble(M, cm.c, x, y, n);
    }
  }
  // Alfombra del museo, de la puerta a las estatuas, y un volcán en el suelo del gimnasio de Roca.
  if (id === 'museo') {
    const largo = maxY - (minY + 3);
    M.caja(0.8, 0.015, largo, centroX, SUELO, minY + 3 + (largo - 1) / 2, COLORES.alfombra, 0.95);
  }
  if (id === 'gimnasio') {
    const cy = (minY + maxY) / 2;
    M.pon(new CylinderGeometry(1.1, 1.1, 0.02, 24).translate(centroX, SUELO + 0.01, cy), COLORES.rocaGimnasio);
    M.pon(new CylinderGeometry(0.4, 0.4, 0.025, 18).translate(centroX, SUELO + 0.015, cy), COLORES.lava);
  }
  for (const [k, { personaje }] of sala.ocupadas) {
    if (!personaje.id.startsWith('estatua-')) continue;
    const [x, y] = deClave(k);
    estatua(M, personaje.id.slice(8), x, y);
  }
  return M.fusionar();
}

export class Salas implements Subsistema {
  static readonly id = 'salas';
  static readonly deps: readonly string[] = ['render', 'partida'];

  private mallas: Mesh[] = [];
  private material!: MaterialDiorama;

  init(ctx: Ctx): void {
    const partida = ctx.get<Partida>('partida');
    this.material = new MaterialDiorama({ bordes: [-0.1, 0.4], especular: 0.06, rebote: 0.12 }, attribute('color', 'vec3'));
    for (const [id, sala] of partida.interiores) {
      const malla = new Mesh(geometriaSala(sala, id), this.material);
      malla.castShadow = true;
      malla.receiveShadow = true;
      ctx.escena.add(malla);
      this.mallas.push(malla);
    }
  }

  dispose(): void {
    for (const m of this.mallas) {
      m.removeFromParent();
      m.geometry.dispose();
    }
    this.material.dispose();
  }
}
