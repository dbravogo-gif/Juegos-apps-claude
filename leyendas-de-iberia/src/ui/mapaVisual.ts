import Phaser from 'phaser';
import urlMapa from '../assets/mundo/mapa_iberia.png?url';
import { ZONAS } from '../data/mundo';
import { aPixel, LUGARES, MAPA_ALTO, MAPA_ANCHO } from '../data/lugares';
import { COLOR, css, estiloTexto, oscurecer } from './tema';

// El mapa de la península de la zona de captura: la imagen de `arte/mapa/mapa_iberia.py`, en
// píxeles grandes, con los lugares y caminos de las zonas encima. Los que se resaltan laten.

const CLAVE = 'mapa_iberia';
export { MAPA_ALTO, MAPA_ANCHO };

export function cargarMapa(load: Phaser.Loader.LoaderPlugin): void {
  load.image(CLAVE, urlMapa);
}

/** Píxeles grandes, sin suavizado. */
export function prepararMapa(scene: Phaser.Scene): void {
  scene.textures.get(CLAVE).setFilter(Phaser.Textures.FilterMode.NEAREST);
}

/** La escala entera más grande con la que el mapa cabe en `ancho` × `alto` (como mínimo 1). */
export function escalaMapa(ancho: number, alto: number): number {
  return Math.max(1, Math.floor(Math.min(ancho / MAPA_ANCHO, alto / MAPA_ALTO)));
}

/**
 * El mapa con todos los lugares y caminos conocidos; los de las zonas de `resaltadas` van en rojo
 * y laten, con su nombre. La esquina de arriba a la izquierda queda en (x, y).
 */
export function mapaZonas(scene: Phaser.Scene, x: number, y: number, escala: number, resaltadas: readonly string[]): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const marco = scene.add.graphics();
  marco.fillStyle(COLOR.tinta, 1).fillRoundedRect(-8, -8, MAPA_ANCHO * escala + 16, MAPA_ALTO * escala + 16, 14);
  c.add(marco);
  c.add(scene.add.image(0, 0, CLAVE).setOrigin(0, 0).setScale(escala));

  const lugares = new Set<string>();
  const rutas = new Map<string, [string, string]>();
  const lugaresMarcados = new Set<string>();
  const rutasMarcadas = new Set<string>();
  for (const z of Object.values(ZONAS)) {
    const m = z.enMapa;
    if (!m) continue;
    const marcada = resaltadas.includes(z.id);
    if ('lugar' in m) {
      lugares.add(m.lugar);
      if (marcada) lugaresMarcados.add(m.lugar);
    } else {
      const clave = m.ruta.join('-');
      rutas.set(clave, m.ruta);
      m.ruta.forEach((l) => lugares.add(l));
      if (marcada) rutasMarcadas.add(clave);
    }
  }
  const punto = (id: string) => {
    const l = LUGARES[id];
    const p = aPixel(l.lat, l.lon);
    return { x: Math.round(p.x) * escala, y: Math.round(p.y) * escala };
  };

  // Caminos: una franja clara con borde oscuro; los marcados, en rojo.
  const lineas = scene.add.graphics();
  for (const [clave, [a, b]] of rutas) {
    const pa = punto(a);
    const pb = punto(b);
    const marcada = rutasMarcadas.has(clave);
    lineas.lineStyle(escala * 3, 0x3a2f1d, 1).lineBetween(pa.x, pa.y, pb.x, pb.y);
    lineas.lineStyle(escala * 1.6, marcada ? COLOR.rojo : 0xf3e2a6, 1).lineBetween(pa.x, pa.y, pb.x, pb.y);
  }
  c.add(lineas);

  const latir = (obj: Phaser.GameObjects.GameObject) =>
    scene.tweens.add({ targets: obj, scale: { from: 0.6, to: 1.5 }, alpha: { from: 0.9, to: 0 }, duration: 900, repeat: -1 });

  for (const [clave, [a, b]] of rutas) {
    if (!rutasMarcadas.has(clave)) continue;
    const pa = punto(a);
    const pb = punto(b);
    const anillo = scene.add.circle((pa.x + pb.x) / 2, (pa.y + pb.y) / 2, escala * 5).setStrokeStyle(escala, COLOR.rojo);
    c.add(anillo);
    latir(anillo);
  }

  // Lugares: cuadraditos blancos; los marcados, rojos, con su nombre y un anillo que late.
  const lado = escala * 4;
  for (const id of lugares) {
    const p = punto(id);
    const marcado = lugaresMarcados.has(id);
    if (marcado) {
      const anillo = scene.add.circle(p.x, p.y, lado).setStrokeStyle(escala, COLOR.rojo);
      c.add(anillo);
      latir(anillo);
    }
    const g = scene.add.graphics();
    g.fillStyle(0x26324f, 1).fillRect(p.x - lado / 2 - escala, p.y - lado / 2 - escala, lado + 2 * escala, lado + 2 * escala);
    g.fillStyle(marcado ? COLOR.rojo : 0xffffff, 1).fillRect(p.x - lado / 2, p.y - lado / 2, lado, lado);
    if (marcado) g.fillStyle(oscurecer(COLOR.rojo, 0.3), 1).fillRect(p.x - lado / 2, p.y + lado / 2 - escala, lado, escala);
    c.add(g);
    if (marcado) {
      const derecha = p.x < (MAPA_ANCHO * escala) / 2;
      c.add(
        scene.add
          .text(p.x + (derecha ? 1 : -1) * (lado + 6), p.y, LUGARES[id].nombre, { ...estiloTexto(Math.max(20, escala * 6), COLOR.panel, true), stroke: css(COLOR.tinta), strokeThickness: 6 })
          .setOrigin(derecha ? 0 : 1, 0.5),
      );
    }
  }
  return c;
}
