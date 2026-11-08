// Textos provisionales de la isla 1 mientras no llegan los interiores (F14) y los objetos (F17).
// Contenido propio; los diálogos de verdad irán en el sistema de guion (F15).
import type { Casilla } from '../core/mundo';

/** Lo que pone al llegar a la puerta de cada tipo de edificio. */
export const TEXTO_PUERTA: Partial<Record<Casilla, string>> = {
  C: 'La puerta está cerrada. Las casas se podrán visitar más adelante.',
  M: 'El museo de las tres leyendas. Dentro te esperan el doctor y tu futuro compañero (llega pronto).',
  R: 'El refugio: aquí curarán a tu equipo gratis (llega pronto).',
  S: 'La tienda abrirá cuando haya objetos que vender (llega pronto).',
  G: 'El gimnasio de Luz. Su líder te espera para el combate que abre el puerto (llega pronto).',
};

/** Nombre con artículo de cada objeto, para «Has encontrado…». */
export const NOMBRE_OBJETO: Record<string, string> = {
  pocion: 'una Poción',
};
