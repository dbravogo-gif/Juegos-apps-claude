// La vista ?mapa: el plano de la isla 1 a pantalla completa, sin el 3D. Para revisar el diseño de
// nivel y sacar el mapa en imagen; el mapa dentro del juego usará el mismo dibujo. Con ?mapa=10,
// 10 píxeles por casilla (si no, los que quepan en la ventana).

import { construirMundo } from '../../core/mundo';
import { ISLA_1 } from '../../data/isla1';
import { dibujarPlano } from './dibujo';
import { planoIsla } from './plano';

export function mostrarMapa(pedido: string | null): void {
  const plano = planoIsla(construirMundo(ISLA_1));
  const cabe = Math.floor(Math.min(window.innerWidth / plano.ancho, window.innerHeight / plano.alto));
  const px = Math.max(3, Number(pedido) || cabe);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const lienzo = document.createElement('canvas');
  lienzo.width = plano.ancho * px * dpr;
  lienzo.height = plano.alto * px * dpr;
  lienzo.style.cssText = `display:block;margin:0 auto;width:${plano.ancho * px}px;height:${plano.alto * px}px`;
  document.body.style.overflow = 'auto';
  document.body.style.background = '#123F57';
  document.body.append(lienzo);
  const ctx = lienzo.getContext('2d')!;
  ctx.scale(dpr, dpr);
  dibujarPlano(ctx, plano, { px, titulo: 'Lanzarote', leyenda: true });
  document.body.dataset.mapa = 'listo';
}
