import Phaser from 'phaser';

// Iconos ilustrados (OpenArt, 2026-10-25): los de los objetos, en `src/assets/objetos/<id>.webp`, y
// los de los menús, en `src/assets/iconos/<nombre>.webp`. Se escalan con suavizado.

const leer = (urls: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(urls).map(([ruta, url]) => [ruta.split('/').pop()!.replace(/\.webp$/, ''), url]));

const OBJETOS = leer(import.meta.glob('../assets/objetos/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>);
const MENU = leer(import.meta.glob('../assets/iconos/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>);

/** Los iconos de menú que hay: equipo, bestiario, mochila, tipos, guardar, cerrar, huir, dinero… */
export type IconoUI =
  | 'equipo'
  | 'bestiario'
  | 'mochila'
  | 'tipos'
  | 'guardar'
  | 'cerrar'
  | 'huir'
  | 'dinero'
  | 'tarjeta'
  | 'opciones'
  | 'tienda'
  | 'mapa';

const claveObjeto = (id: string) => `objeto-${id}`;
const claveUI = (nombre: string) => `ui-${nombre}`;

export function cargarIconos(load: Phaser.Loader.LoaderPlugin): void {
  for (const [id, url] of Object.entries(OBJETOS)) load.image(claveObjeto(id), url);
  for (const [nombre, url] of Object.entries(MENU)) load.image(claveUI(nombre), url);
}

function imagen(scene: Phaser.Scene, clave: string, x: number, y: number, tam: number): Phaser.GameObjects.Image {
  const img = scene.add.image(x, y, clave);
  img.setScale(tam / Math.max(img.width, img.height));
  return img;
}

/** Icono de un objeto, escalado a `tam` píxeles de lado. Sin icono, un círculo. */
export function iconoObjeto(scene: Phaser.Scene, x: number, y: number, id: string, tam: number): Phaser.GameObjects.GameObject {
  if (!OBJETOS[id]) return scene.add.circle(x, y, tam * 0.35, 0xffbe1e);
  return imagen(scene, claveObjeto(id), x, y, tam);
}

/** Icono de menú, escalado a `tam` píxeles de lado. */
export function iconoUI(scene: Phaser.Scene, nombre: IconoUI, x: number, y: number, tam: number): Phaser.GameObjects.Image {
  return imagen(scene, claveUI(nombre), x, y, tam);
}
