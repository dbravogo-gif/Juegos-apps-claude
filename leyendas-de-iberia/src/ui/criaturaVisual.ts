import Phaser from 'phaser';
import type { DatosJuego } from '../core/modelo';
import { DATOS } from '../data';
import { aclarar, COLOR, estiloTexto, oscurecer } from './tema';

// Arte de las criaturas. Si existe `src/assets/criaturas/<id>.png`, se usa esa imagen; si no,
// se dibuja una figura provisional con el color de su tipo. Para cambiar el arte basta con
// añadir el PNG: no hay que tocar código.

const PNGS = import.meta.glob('../assets/criaturas/*.png', { eager: true, query: '?url', import: 'default' }) as Record<
  string,
  string
>;

export const SPRITES: Record<string, string> = Object.fromEntries(
  Object.entries(PNGS).map(([ruta, url]) => [ruta.split('/').pop()!.replace(/\.png$/, ''), url]),
);

export const claveSprite = (especie: string) => `criatura-${especie}`;

/** 1, 2 o 3: en qué forma de su línea evolutiva está la especie. */
export function formaEvolutiva(especie: string, datos: DatosJuego = DATOS): number {
  let forma = 1;
  let actual = especie;
  for (;;) {
    const previa = Object.values(datos.especies).find((e) => e.evoluciona?.a === actual);
    if (!previa) return forma;
    forma++;
    actual = previa.id;
  }
}

function colorTipo(tipo: string | undefined): number {
  return DATOS.tipos.tipos.find((t) => t.id === tipo)?.color ?? COLOR.tintaSuave;
}

function iniciales(nombre: string): string {
  const palabras = nombre.split(/\s+/).filter((p) => p.length > 2 || /^[A-ZÁÉÍÓÚÑ]/.test(p));
  const letras = (palabras.length > 1 ? palabras.slice(0, 2).map((p) => p[0]) : [nombre[0], nombre[1]]).join('');
  return letras.toUpperCase();
}

/**
 * Dibuja la criatura centrada en (x, y) dentro de un cuadrado de lado `tam`. `mirandoDerecha`
 * gira la figura hacia la derecha (la criatura del jugador mira al rival).
 */
export function crearCriaturaVisual(
  scene: Phaser.Scene,
  especieId: string,
  x: number,
  y: number,
  tam: number,
  mirandoDerecha = false,
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const clave = claveSprite(especieId);
  if (scene.textures.exists(clave)) {
    const img = scene.add.image(0, 0, clave);
    const escala = tam / Math.max(img.width, img.height);
    img.setScale(escala).setFlipX(mirandoDerecha);
    c.add(img);
    return c;
  }

  const especie = DATOS.especies[especieId];
  const forma = formaEvolutiva(especieId);
  const principal = colorTipo(especie.tipos[0]);
  const segundo = especie.tipos[1] ? colorTipo(especie.tipos[1]) : oscurecer(principal, 0.35);
  const dir = mirandoDerecha ? 1 : -1;
  // Cuanto más evolucionada, más grande y con más adornos.
  const cuerpo = tam * (0.5 + 0.12 * forma);
  const g = scene.add.graphics();

  // Sombra en el suelo.
  g.fillStyle(0x000000, 0.18);
  g.fillEllipse(0, cuerpo * 0.48, cuerpo * 0.95, cuerpo * 0.2);

  if (forma >= 2) {
    // Cuernos u orejas.
    g.fillStyle(segundo, 1);
    const h = cuerpo * (forma === 3 ? 0.42 : 0.3);
    g.fillTriangle(-cuerpo * 0.32, -cuerpo * 0.28, -cuerpo * 0.12, -cuerpo * 0.4, -cuerpo * 0.36, -cuerpo * 0.4 - h);
    g.fillTriangle(cuerpo * 0.32, -cuerpo * 0.28, cuerpo * 0.12, -cuerpo * 0.4, cuerpo * 0.36, -cuerpo * 0.4 - h);
  }
  if (forma === 3) {
    // Corona de púas: las formas finales son las más épicas.
    g.fillStyle(COLOR.oro, 1);
    for (let i = -2; i <= 2; i++) {
      const bx = i * cuerpo * 0.11;
      g.fillTriangle(bx - cuerpo * 0.06, -cuerpo * 0.44, bx + cuerpo * 0.06, -cuerpo * 0.44, bx, -cuerpo * (0.62 + (i === 0 ? 0.08 : 0)));
    }
  }

  // Cuerpo y tripa.
  g.fillStyle(oscurecer(principal, 0.4), 1);
  g.fillEllipse(0, 0, cuerpo * 1.04, cuerpo * 0.94);
  g.fillStyle(principal, 1);
  g.fillEllipse(0, 0, cuerpo, cuerpo * 0.9);
  g.fillStyle(aclarar(principal, 0.55), 1);
  g.fillEllipse(dir * cuerpo * 0.05, cuerpo * 0.14, cuerpo * 0.58, cuerpo * 0.5);
  if (especie.tipos[1]) {
    // Segundo tipo: manchas.
    g.fillStyle(segundo, 1);
    g.fillCircle(-dir * cuerpo * 0.34, -cuerpo * 0.05, cuerpo * 0.08);
    g.fillCircle(-dir * cuerpo * 0.28, cuerpo * 0.18, cuerpo * 0.06);
  }

  // Ojos mirando al frente.
  const ojoY = -cuerpo * 0.14;
  for (const ox of [-0.13, 0.13]) {
    const cx = dir * cuerpo * 0.12 + ox * cuerpo;
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx, ojoY, cuerpo * 0.085);
    g.fillStyle(COLOR.tinta, 1);
    g.fillCircle(cx + dir * cuerpo * 0.03, ojoY, cuerpo * 0.045);
  }
  c.add(g);

  const letras = scene.add
    .text(dir * cuerpo * 0.05, cuerpo * 0.16, iniciales(especie.nombre), estiloTexto(Math.round(cuerpo * 0.16), oscurecer(principal, 0.55), true))
    .setOrigin(0.5);
  c.add(letras);
  return c;
}
