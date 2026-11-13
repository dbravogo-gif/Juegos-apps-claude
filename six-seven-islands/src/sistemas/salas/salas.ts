// Subsistema «salas»: los interiores en 3D, hechos por código en el estilo de juguete de ARTE.md.
// Cada sala es un diorama pequeño, lejos de la isla, como una casa de muñecas: suelo de tablas,
// pared del fondo y de los lados altas y blancas, y la de delante baja para que la cámara vea
// dentro. Los muebles salen de las letras del mapa (LEYENDA) y las estatuas del museo, de sus
// personajes. Una malla por sala. Lee «partida»; no la cambia.

import { BoxGeometry, ConeGeometry, CylinderGeometry, Group, Mesh, MeshBasicNodeMaterial, PlaneGeometry, SphereGeometry, type BufferGeometry, type Object3D } from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MODELO_INICIAL, figuraCriatura } from '../../arte/criaturas3d';
import { attribute } from 'three/tsl';
import { aspasEn, cierreEn, clave, corrienteEn, deClave, palancaEn, type Condicion, type Direccion, type Mundo } from '../../core/mundo';
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
        // Los libros asoman 3 cm: con el lomo a ras del mueble, titilaban (autor, 2026-11-10).
        for (let i = 0; i < 5; i++) M.caja(0.13, 0.28, 0.3, x - 0.32 + i * 0.16, y + 0.12 + fila * 0.46, z - 0.17, libros[(i + fila + n) % libros.length]);
      }
      break;
    }
    // 'c', el mostrador, va por tramos en geometriaSala.
    case 'e': { // escalera hacia el piso de arriba, contra la pared del fondo, con barandilla
      for (let i = 0; i < 5; i++) M.caja(0.86, 0.2 * (i + 1), 0.2, x, y, z + 0.4 - i * 0.2, i % 2 ? COLORES.maderaSuelo : COLORES.maderaSueloOscura);
      M.caja(0.05, 0.08, 1.04, x + 0.45, y + 1.0, z - 0.02, COLORES.balcon, 0.85);
      for (let i = 0; i < 3; i++) M.caja(0.04, 0.95 - i * 0.05, 0.04, x + 0.45, y + 0.2 * (i * 2 + 1), z + 0.4 - i * 0.4, COLORES.balcon, 0.9);
      break;
    }
    case 'j': { // juguetes delante de la escalera: no dejan subir
      const colores = [COLORES.geranio, COLORES.toldoAzul, COLORES.fachadaAmarilla, COLORES.verdePalmera];
      M.cajaRedonda(0.24, 0.24, 0.24, x - 0.2, y, z + 0.1, colores[n % 4], 0.04);
      M.cajaRedonda(0.2, 0.2, 0.2, x - 0.18, y + 0.24, z + 0.12, colores[(n + 1) % 4], 0.04);
      M.cajaRedonda(0.22, 0.22, 0.22, x + 0.12, y, z - 0.18, colores[(n + 2) % 4], 0.04);
      M.pon(new SphereGeometry(0.15, 12, 8).translate(x + 0.22, y + 0.15, z + 0.22), colores[(n + 3) % 4]);
      // Un osito: cuerpo, cabeza y orejas.
      M.pon(new SphereGeometry(0.13, 10, 8).scale(1, 1.1, 0.9).translate(x + 0.2, y + 0.14, z - 0.05), COLORES.balcon, 1.2);
      M.pon(new SphereGeometry(0.1, 10, 8).translate(x + 0.2, y + 0.36, z - 0.03), COLORES.balcon, 1.25);
      for (const s of [-1, 1]) M.pon(new SphereGeometry(0.04, 6, 4).translate(x + 0.2 + s * 0.07, y + 0.45, z - 0.04), COLORES.balcon, 1.1);
      break;
    }
    case 'n': // cocina: encimera con fogones y la puerta del horno
      M.caja(0.88, 0.8, 0.55, x, y, z - 0.2, COLORES.cal, 0.95);
      M.caja(0.94, 0.05, 0.61, x, y + 0.8, z - 0.2, COLORES.canteria);
      M.caja(0.56, 0.36, 0.02, x, y + 0.18, z + 0.085, COLORES.ojo, 1.3);
      for (const [dx, dz] of [[-0.2, -0.3], [0.2, -0.3], [-0.2, -0.1], [0.2, -0.1]]) M.pon(new CylinderGeometry(0.08, 0.08, 0.02, 12).translate(x + dx, y + 0.86, z + dz), COLORES.ojo, 1.4);
      break;
    case 'q': // sofá con brazos y cojín
      M.cajaRedonda(0.86, 0.3, 0.6, x, y, z - 0.05, COLORES.toldoAzul, 0.06);
      M.cajaRedonda(0.86, 0.45, 0.15, x, y + 0.3, z - 0.29, COLORES.toldoAzul, 0.05, 0.92);
      for (const s of [-1, 1]) M.cajaRedonda(0.12, 0.45, 0.62, x + s * 0.47, y, z - 0.05, COLORES.toldoAzul, 0.05, 0.85);
      M.cajaRedonda(0.3, 0.2, 0.08, x + 0.15, y + 0.34, z - 0.18, COLORES.crema, 0.04);
      break;
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

/** Alto del pedestal de las estatuas del museo. */
const PEDESTAL = 0.55;

/**
 * Estatua de una inicial: pedestal de cantería con una placa de su color. Encima va su modelo en
 * piedra (`Salas`); si su inicial aún no tiene modelo, una figura provisional con los adornos de
 * su tipo.
 */
function estatua(M: Montaje, tipo: string, x: number, z: number): void {
  const y = SUELO;
  const color = hex(COLOR_CRIATURA[tipo as keyof typeof COLOR_CRIATURA] ?? 0x888888);
  M.cajaRedonda(0.84, PEDESTAL, 0.84, x, y, z, COLORES.canteria, 0.06);
  M.caja(0.42, 0.16, 0.04, x, y + 0.2, z + 0.43, color);
  if (MODELO_INICIAL[tipo]) return;
  const base = y + PEDESTAL;
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
  // Suelo: una losa para toda la sala y, encima, un cuadrado de madera por casilla en dos tonos,
  // sin juntas. Las tablas con rendija dejaban ver el fondo, y con fondo oscuro, rayas negras a
  // través de cada casilla (autor, 2026-11-10).
  // El gimnasio de Roca es una cueva volcánica (gimnasio-roca.ts): basalto en vez de tablas y de
  // cal, y lava que brilla en sus coladas (la pone `Salas`, sin luz, para que se vea encendida).
  // También las cuevas (la de Ajuy), con pozas de agua (`~`) en vez de lava.
  const volcanica = [...sala.casillas.values()].some((c) => c.c === 'L' || c.c === '~');
  const suelo = volcanica ? [COLORES.basalto, COLORES.lavaNegra] : [COLORES.maderaSuelo, COLORES.maderaSueloOscura];
  M.caja(maxX - minX + 1, 0.1, maxY - minY + 1, centroX, SUELO - 0.1, centroY, volcanica ? COLORES.lavaNegra : COLORES.maderaSueloOscura, 0.8);
  // Paredes por tramos, lisas: un solo color, sin juntas entre casillas.
  for (const t of tramosDePared(sala)) {
    const alto = t.y0 === minY ? ALTO_PARED : t.y1 === maxY ? ALTO_DELANTE : ALTO_LADO;
    const an = t.x1 - t.x0 + 1;
    const fo = t.y1 - t.y0 + 1;
    const cx = (t.x0 + t.x1) / 2;
    const cz = (t.y0 + t.y1) / 2;
    const fila = t.y0 === t.y1;
    M.caja(an, alto, fo, cx, SUELO, cz, volcanica ? COLORES.lavaParda : COLORES.cal);
    // El zócalo sobresale solo hacia los lados de la pared; en las columnas se queda 1 cm corto
    // por cada punta para no solaparse con el de la fila en la esquina.
    if (alto > ALTO_DELANTE) M.caja(fila ? an - 0.02 : 1.02, 0.45, fila ? 1.02 : fo - 0.02, cx, SUELO, cz, volcanica ? COLORES.escoriaHonda : COLORES.zocaloOcre);
    // El remate, 1 cm más alto que la pared: con la cara de arriba a la misma altura, las dos
    // se peleaban por cada píxel.
    if (t.y0 === minY && fila) M.caja(an + 0.02, 0.13, 1.02, cx, SUELO + alto - 0.12, cz, volcanica ? COLORES.basalto : COLORES.balcon);
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
    // 2 mm por encima de la losa: con la misma altura, las dos caras se pelearían por el píxel.
    // En la lava no hay suelo: brilla la colada (la pone `Salas`) con costras negras flotando.
    if (cm.c === 'L') {
      for (const [dx, dz, s] of [[-0.22, -0.18, 0.34], [0.24, 0.2, 0.26]]) M.pon(abollar(new SphereGeometry(0.5, 7, 4), 0.25, n + dx * 10).scale(s, 0.04, s * 0.8).translate(x + dx, SUELO + 0.012, y + dz), COLORES.lavaNegra);
      continue;
    }
    // Las pozas de la cueva: el agua la pone `Salas`, sin luz; aquí, solo alguna piedra.
    if (cm.c === '~') {
      if (n % 3 === 0) M.pon(abollar(new SphereGeometry(0.5, 7, 4), 0.25, n).scale(0.2, 0.08, 0.16).translate(x + 0.2, SUELO - 0.02, y - 0.15), COLORES.basalto);
      continue;
    }
    // Bajo las compuertas, un puente de basalto más claro sobre la colada.
    M.pon(new PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(x, SUELO + 0.002, y), cm.c === 'X' ? COLORES.basaltoClaro : (x + y) % 2 ? suelo[0] : suelo[1], 0.96 + (n % 3) * 0.03);
    if (cm.c === '#' && volcanica) {
      // Columna de basalto hexagonal, de altura variable, como las de los acantilados.
      const alto = 1.2 + ((x * 5 + y * 3) % 4) * 0.25;
      M.pon(new CylinderGeometry(0.4, 0.44, alto, 6).translate(x, SUELO + alto / 2, y), COLORES.basalto, 0.95 + (n % 3) * 0.04);
      M.pon(new CylinderGeometry(0.4, 0.4, 0.04, 6).translate(x, SUELO + alto + 0.02, y), COLORES.basaltoClaro);
    } else if (cm.c === '#') {
      // Fuera de las cuevas (el gimnasio de Aire), un tabique blanco y bajo, con su zócalo: no tapa
      // la sala ni parece una cueva.
      M.caja(1, 0.85, 1, x, SUELO, y, COLORES.cal);
      M.caja(1.02, 0.18, 1.02, x, SUELO, y, COLORES.zocaloOcre);
    } else if (cm.c === 'p') {
      // El pedestal de la palanca (la palanca la mueve `Salas`).
      M.cajaRedonda(0.5, 0.55, 0.42, x, SUELO, y, COLORES.basalto, 0.05);
      M.caja(0.12, 0.02, 0.3, x, SUELO + 0.55, y, COLORES.lavaNegra);
    } else if (cm.c === 'W') {
      // Corriente de viento (gimnasio de Aire): el suelo, azul claro; la flecha la mueve `Salas`.
      M.caja(0.92, 0.008, 0.92, x, SUELO + 0.002, y, '#CDE9F5');
    } else if (cm.c === 'H') {
      // Molino: peana y poste; las aspas, que giran, las pone `Salas`.
      M.cajaRedonda(0.56, 0.28, 0.56, x, SUELO, y, COLORES.balcon, 0.05);
      M.pon(new CylinderGeometry(0.06, 0.09, 1.25, 8).translate(x, SUELO + 0.28 + 0.62, y), COLORES.cal);
    } else if (cm.c === 'X') {
      // La compuerta la pone `Salas`, que la hunde al abrirse.
    } else if (cm.c === '|') {
      if (y === minY && !volcanica) {
        // Ventanas en la pared del fondo, una de cada tres casillas.
        if ((x - minX) % 3 === 2 && x < maxX) {
          M.caja(0.62, 0.72, 0.06, x, SUELO + 0.95, y + 0.5, COLORES.canteria);
          M.caja(0.5, 0.6, 0.08, x, SUELO + 1.01, y + 0.5, COLORES.cristal);
          M.caja(0.035, 0.58, 0.1, x, SUELO + 1.02, y + 0.5, COLORES.carpinteriaVerde);
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
    // La alfombra, de la puerta a las estatuas, alineada con la puerta.
    const puerta = [...sala.casillas].find(([, c]) => c.c === 'd');
    const px = puerta ? deClave(puerta[0])[0] : centroX;
    const largo = maxY - (minY + 3);
    M.caja(0.8, 0.015, largo, px, SUELO, minY + 3 + (largo - 1) / 2, COLORES.alfombra, 0.95);
  }
  if (id === 'gimnasio' && volcanica) {
    // Un volcán en relieve en la pared del fondo, detrás de la líder, con su cráter encendido, y
    // una alfombra de picón rojizo de la última compuerta a la líder.
    M.pon(new ConeGeometry(2.2, 2.6, 9).translate(centroX, SUELO + 1.3, minY + 0.55), COLORES.lavaRojiza);
    M.pon(new ConeGeometry(1.2, 1.4, 9).translate(centroX, SUELO + 1.95, minY + 0.62), COLORES.lavaParda);
    M.pon(new CylinderGeometry(0.34, 0.3, 0.1, 9).translate(centroX, SUELO + 2.62, minY + 0.66), COLORES.lava, 1.2);
    M.caja(1, 0.012, 2, centroX, SUELO, minY + 2.5, COLORES.escoria, 0.95);
  } else if (id === 'gimnasio') {
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
  private estatuas: Object3D[] = [];
  private material!: MaterialDiorama;
  private partida!: Partida;
  /** Las compuertas de basalto: bajan cuando se cumple su condición. */
  private compuertas: { malla: Mesh; condicion: Condicion; abierta: number }[] = [];
  /** Las palancas: su mango baja cuando se usan. */
  private palancas: { mango: Group; condicion: Condicion; bajada: number }[] = [];
  /** Las flechas de las corrientes de viento: giran si cambia hacia dónde soplan. */
  private flechas: { malla: Mesh; sala: Mundo; k: number; x: number; y: number }[] = [];
  /** Las aspas de los molinos: giran siempre; su eje se enciende cuando están giradas. */
  private molinos: { aspas: Group; eje: Mesh; condicion: Condicion }[] = [];
  private reloj = 0;
  private geometrias: BufferGeometry[] = [];
  private materialesExtra: { dispose(): void }[] = [];

  async init(ctx: Ctx): Promise<void> {
    const partida = ctx.get<Partida>('partida');
    this.partida = partida;
    this.material = new MaterialDiorama({ bordes: [-0.1, 0.4], especular: 0.06, rebote: 0.12 }, attribute('color', 'vec3'));
    const piedra = new MaterialDiorama({ color: COLORES.basalto, bordes: [-0.1, 0.4], especular: 0.05, rebote: 0.12 });
    const lava = new MeshBasicNodeMaterial({ color: COLORES.lava });
    const agua = new MeshBasicNodeMaterial({ color: '#2E7F9A' });
    const viento = new MeshBasicNodeMaterial({ color: '#5BB8DE' });
    const piedraClara = new MaterialDiorama({ color: COLORES.cal, bordes: [-0.1, 0.4], especular: 0.05, rebote: 0.12 });
    this.materialesExtra.push(piedra, lava, agua, viento, piedraClara);
    this.lavaMaterial = lava;
    this.piedraMaterial = piedra;
    const cargas: Promise<void>[] = [];
    for (const [id, sala] of partida.interiores) {
      const malla = new Mesh(geometriaSala(sala, id), this.material);
      malla.castShadow = true;
      malla.receiveShadow = true;
      ctx.escena.add(malla);
      this.mallas.push(malla);
      // La lava de las coladas, sin luz: brilla aunque la sala esté en sombra.
      const charcos = [...sala.casillas].filter(([, c]) => c.c === 'L').map(([k]) => {
        const [x, y] = deClave(k);
        return new PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(x, SUELO + 0.004, y);
      });
      if (charcos.length) {
        const g = mergeGeometries(charcos);
        for (const c of charcos) c.dispose();
        const m = new Mesh(g, lava);
        ctx.escena.add(m);
        this.mallas.push(m);
      }
      // Las pozas de agua de las cuevas, igual: sin luz, sobre la losa (en el hueco del suelo).
      const pozas = [...sala.casillas].filter(([, c]) => c.c === '~').map(([k]) => {
        const [x, y] = deClave(k);
        return new PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(x, SUELO + 0.003, y);
      });
      if (pozas.length) {
        const g = mergeGeometries(pozas);
        for (const c of pozas) c.dispose();
        const m = new Mesh(g, agua);
        ctx.escena.add(m);
        this.mallas.push(m);
      }
      for (const [k, c] of sala.casillas) {
        const [x, y] = deClave(k);
        if (c.c === 'X') {
          const cierre = cierreEn(sala, k);
          if (!cierre) continue;
          // Una losa de basalto de una casilla, con vetas: sube del puente.
          const g = new BoxGeometry(0.98, 1.3, 0.5).translate(0, 0.65, 0);
          const losa = new Mesh(g, piedra);
          losa.position.set(x, SUELO, y);
          losa.castShadow = true;
          ctx.escena.add(losa);
          this.geometrias.push(g);
          this.compuertas.push({ malla: losa, condicion: cierre.condicion, abierta: partida.estado.condiciones.includes(cierre.condicion) ? 1 : 0 });
        } else if (c.c === 'W') {
          // Una flecha de viento, plana, que apunta hacia donde sopla.
          const g = new ConeGeometry(0.22, 0.42, 3).rotateX(-Math.PI / 2).scale(1, 0.25, 1);
          const flecha = new Mesh(g, viento);
          flecha.position.set(x, SUELO + 0.05, y);
          ctx.escena.add(flecha);
          this.geometrias.push(g);
          this.flechas.push({ malla: flecha, sala, k, x, y });
        } else if (c.c === 'H') {
          const id = aspasEn(sala, k);
          if (!id) continue;
          const pala = new BoxGeometry(0.12, 0.62, 0.03).translate(0, 0.33, 0);
          const ejeG = new SphereGeometry(0.08, 8, 6);
          const aspas = new Group();
          for (let i = 0; i < 4; i++) {
            const p = new Mesh(pala, piedraClara);
            p.rotation.z = (i * Math.PI) / 2;
            aspas.add(p);
          }
          const eje = new Mesh(ejeG, piedra);
          aspas.add(eje);
          aspas.position.set(x, SUELO + 1.5, y + 0.12);
          ctx.escena.add(aspas);
          this.geometrias.push(pala, ejeG);
          this.molinos.push({ aspas, eje, condicion: `aspas:${id}` });
        } else if (c.c === 'p') {
          const id = palancaEn(sala, k);
          if (!id) continue;
          const g = new BoxGeometry(0.07, 0.5, 0.07).translate(0, 0.25, 0);
          const pomo = new SphereGeometry(0.07, 8, 6).translate(0, 0.52, 0);
          const mango = new Group();
          mango.add(new Mesh(g, piedra), new Mesh(pomo, lava));
          mango.position.set(x, SUELO + 0.56, y);
          ctx.escena.add(mango);
          this.geometrias.push(g, pomo);
          const condicion: Condicion = `palanca:${id}`;
          this.palancas.push({ mango, condicion, bajada: partida.estado.condiciones.includes(condicion) ? 1 : 0 });
        }
      }
      // Las estatuas: el modelo de cada inicial, en piedra, sobre su pedestal.
      for (const [k, { personaje }] of sala.ocupadas) {
        const modelo = personaje.id.startsWith('estatua-') ? MODELO_INICIAL[personaje.id.slice(8)] : undefined;
        if (!modelo) continue;
        const [x, y] = deClave(k);
        cargas.push(
          figuraCriatura(modelo, 'piedra', 0.8).then((f) => {
            f.position.set(x, SUELO + PEDESTAL, y);
            ctx.escena.add(f);
            this.estatuas.push(f);
          }),
        );
      }
    }
    await Promise.all(cargas);
    this.actualizar(0);
  }

  private lavaMaterial: MeshBasicNodeMaterial | null = null;
  private piedraMaterial: MaterialDiorama | null = null;

  /** Las compuertas se hunden en la lava y las palancas bajan, poco a poco, al cumplirse lo suyo. */
  actualizar(dt: number): void {
    const hechas = this.partida.estado.condiciones;
    this.reloj += dt;
    // Las flechas del viento: hacia donde sopla cada corriente, y avanzando un poco, en bucle.
    const giro: Record<Direccion, number> = { n: 0, o: Math.PI / 2, s: Math.PI, e: -Math.PI / 2 };
    const paso: Record<Direccion, [number, number]> = { n: [0, -1], s: [0, 1], e: [1, 0], o: [-1, 0] };
    for (const f of this.flechas) {
      const d = corrienteEn(f.sala, f.k, hechas);
      if (!d) continue;
      f.malla.rotation.y = giro[d];
      const t = ((this.reloj * 1.4 + (f.x + f.y) * 0.25) % 1) - 0.5;
      f.malla.position.x = f.x + paso[d][0] * t * 0.5;
      f.malla.position.z = f.y + paso[d][1] * t * 0.5;
    }
    for (const mo of this.molinos) {
      const giradas = hechas.includes(mo.condicion);
      mo.aspas.rotation.z -= dt * (giradas ? 4 : 1.2);
      mo.eje.material = giradas && this.lavaMaterial ? this.lavaMaterial : (this.piedraMaterial ?? mo.eje.material);
    }
    // En combate no se mueven: la compuerta se hunde al volver, mientras el vencido lo cuenta, y no
    // durante el fundido (probador, 2026-11-13).
    const quietas = this.partida.modo === 'combate';
    for (const c of this.compuertas) {
      if (quietas) break;
      const objetivo = hechas.includes(c.condicion) ? 1 : 0;
      c.abierta += Math.sign(objetivo - c.abierta) * Math.min(Math.abs(objetivo - c.abierta), dt * 0.8);
      // Un temblor mientras baja.
      const temblor = c.abierta > 0 && c.abierta < 1 ? Math.sin(c.abierta * 90) * 0.02 : 0;
      c.malla.position.y = SUELO - c.abierta * 1.32;
      c.malla.position.x = Math.round(c.malla.position.x) + temblor;
      c.malla.visible = c.abierta < 1;
    }
    for (const p of this.palancas) {
      const objetivo = hechas.includes(p.condicion) ? 1 : 0;
      p.bajada += Math.sign(objetivo - p.bajada) * Math.min(Math.abs(objetivo - p.bajada), dt * 3);
      p.mango.rotation.x = -0.7 + p.bajada * 1.4;
    }
  }

  dispose(): void {
    for (const m of this.mallas) {
      m.removeFromParent();
      m.geometry.dispose();
    }
    for (const e of this.estatuas) e.removeFromParent();
    for (const c of this.compuertas) c.malla.removeFromParent();
    for (const p of this.palancas) p.mango.removeFromParent();
    for (const f of this.flechas) f.malla.removeFromParent();
    for (const mo of this.molinos) mo.aspas.removeFromParent();
    for (const g of this.geometrias) g.dispose();
    for (const m of this.materialesExtra) m.dispose();
    this.material.dispose();
  }
}
