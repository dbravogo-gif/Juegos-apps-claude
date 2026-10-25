import Phaser from 'phaser';
import { RETRATOS } from '../data/retratos';

// Retratos de los personajes para los diálogos (OpenArt, 2026-10-25), en
// `src/assets/retratos/<id>.webp`: bustos sobre fondo transparente, apoyados abajo.

const URLS = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/retratos/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>,
  ).map(([ruta, url]) => [ruta.split('/').pop()!.replace(/\.webp$/, ''), url]),
);

const clave = (id: string) => `retrato-${id}`;

export function cargarRetratos(load: Phaser.Loader.LoaderPlugin): void {
  for (const [id, url] of Object.entries(URLS)) load.image(clave(id), url);
}

/** Clave de la textura del retrato de quien habla, o null si no tiene. */
export function claveRetrato(quien: string | undefined): string | null {
  const id = quien ? RETRATOS[quien] : undefined;
  return id && URLS[id] ? clave(id) : null;
}
