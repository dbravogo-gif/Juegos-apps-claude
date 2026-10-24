import Phaser from 'phaser';

// Iconos de los objetos: `src/assets/objetos/<id>.png`, del paquete Ninja Adventure (CC0).

const URLS = import.meta.glob('../assets/objetos/*.png', { eager: true, query: '?url', import: 'default' }) as Record<
  string,
  string
>;

const ICONOS: Record<string, string> = Object.fromEntries(
  Object.entries(URLS).map(([ruta, url]) => [ruta.split('/').pop()!.replace(/\.png$/, ''), url]),
);

const claveIcono = (id: string) => `objeto-${id}`;

export function cargarIconos(load: Phaser.Loader.LoaderPlugin): void {
  for (const [id, url] of Object.entries(ICONOS)) load.image(claveIcono(id), url);
}

export function prepararIconos(scene: Phaser.Scene): void {
  for (const id of Object.keys(ICONOS)) scene.textures.get(claveIcono(id)).setFilter(Phaser.Textures.FilterMode.NEAREST);
}

/** Icono de un objeto, escalado a `tam` píxeles de lado. Sin icono, un círculo. */
export function iconoObjeto(scene: Phaser.Scene, x: number, y: number, id: string, tam: number): Phaser.GameObjects.GameObject {
  if (!ICONOS[id]) return scene.add.circle(x, y, tam * 0.35, 0xc9a227);
  const img = scene.add.image(x, y, claveIcono(id));
  img.setScale(tam / Math.max(img.width, img.height));
  return img;
}
