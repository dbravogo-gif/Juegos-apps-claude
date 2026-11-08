// Subsistema «depuracion»: los ganchos de prueba de window.__JUEGO__ y el panel de ajustes.
// El panel sale en desarrollo y, en la web publicada, con ?depurar: así el autor puede medir
// los FPS en su iPhone, que es donde valen.

import { crearRng } from '../../core/rng';
import { CALIDADES, type NivelCalidad } from '../../motor/calidad';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Contadores, Render } from '../render/render';

export interface EstadoVisible {
  fotograma: number;
  pasos: number;
  modo: string;
  zona: string | null;
  posicion: { x: number; y: number } | null;
  condiciones: string[];
  calidad: NivelCalidad;
  backend: string;
}

export interface GanchosJuego {
  estado(): EstadoVisible;
  semilla(n: number | string): void;
  poner(estado: unknown): void;
  contadores(): Contadores;
  calidad(nivel: NivelCalidad): void;
}

declare global {
  interface Window {
    __JUEGO__?: GanchosJuego;
  }
}

/** Un subsistema que sabe cargar un estado y resumir el suyo («partida»). */
interface ConPoner {
  poner(estado: unknown): void;
}
interface ConVisible {
  visible(): { modo: string; zona: string; posicion: { x: number; y: number }; condiciones: string[] };
}

export class Depuracion implements Subsistema {
  static readonly id = 'depuracion';
  static readonly deps: readonly string[] = ['render'];

  private panel: HTMLElement | null = null;
  private texto: HTMLElement | null = null;
  private render!: Render;
  private acumulado = 0;
  private fotogramas = 0;

  init(ctx: Ctx): void {
    this.render = ctx.get<Render>('render');
    const cambiarCalidad = (nivel: NivelCalidad) => {
      if (!CALIDADES[nivel]) throw new Error(`Nivel de calidad desconocido: «${nivel}»`);
      ctx.config.calidad = CALIDADES[nivel];
      ctx.eventos.emit('calidad:cambio', { nivel });
    };

    window.__JUEGO__ = {
      estado: () => {
        const p = ctx.tiene('partida') ? ctx.get<Subsistema & ConVisible>('partida').visible() : null;
        return {
          fotograma: ctx.tiempo.fotograma,
          pasos: ctx.tiempo.pasos,
          modo: p?.modo ?? 'vitrina',
          zona: p?.zona ?? null,
          posicion: p?.posicion ?? null,
          condiciones: p?.condiciones ?? [],
          calidad: ctx.config.calidad.nivel,
          backend: this.render.backend,
        };
      },
      semilla: (n) => {
        ctx.rng.s = crearRng(n).s;
      },
      poner: (estado) => {
        if (!ctx.tiene('partida')) throw new Error('En la vitrina no hay partida');
        ctx.get<Subsistema & ConPoner>('partida').poner(estado);
      },
      contadores: () => this.render.contadores(),
      calidad: cambiarCalidad,
    };

    const conPanel = import.meta.env.DEV || new URLSearchParams(location.search).has('depurar');
    if (conPanel) this.crearPanel(ctx, cambiarCalidad);
  }

  private crearPanel(ctx: Ctx, cambiarCalidad: (n: NivelCalidad) => void): void {
    const panel = document.createElement('div');
    panel.className = 'panel-depuracion';
    const selector = document.createElement('select');
    selector.setAttribute('aria-label', 'Calidad');
    for (const nivel of Object.keys(CALIDADES) as NivelCalidad[]) {
      const opcion = document.createElement('option');
      opcion.value = nivel;
      opcion.textContent = `Calidad ${nivel}`;
      opcion.selected = nivel === ctx.config.calidad.nivel;
      selector.append(opcion);
    }
    selector.addEventListener('change', () => cambiarCalidad(selector.value as NivelCalidad));
    const texto = document.createElement('pre');
    panel.append(selector, texto);
    document.body.append(panel);
    this.panel = panel;
    this.texto = texto;
  }

  actualizar(dt: number): void {
    if (!this.texto) return;
    this.acumulado += dt;
    this.fotogramas++;
    // El texto se rehace dos veces por segundo, no en cada fotograma.
    if (this.acumulado < 0.5) return;
    const c = this.render.contadores();
    const fps = Math.round(this.fotogramas / this.acumulado);
    this.texto.textContent =
      `${c.backend} · ${fps} FPS · densidad ${c.densidad}\n` +
      `llamadas ${c.llamadas} · triángulos ${c.triangulos}\n` +
      `geometrías ${c.geometrias} · texturas ${c.texturas} (${c.memoriaTexturasMB} MB)`;
    this.acumulado = 0;
    this.fotogramas = 0;
  }

  dispose(): void {
    this.panel?.remove();
    delete window.__JUEGO__;
  }
}
