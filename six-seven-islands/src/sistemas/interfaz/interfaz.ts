// Subsistema «interfaz»: la interfaz en DOM sobre el lienzo. El cartel con el nombre de la zona
// o la sala al entrar (y el de la inicial al elegirla), el objetivo actual, la caja de diálogo
// (quién habla, el texto letra a letra y el sí o no de las preguntas), el fundido a negro al
// cruzar una puerta y la ayuda de teclas. Todo se maneja con el teclado; lee el estado de
// «partida» en cada fotograma y no lo cambia.

import { completa, lineaActual } from '../../core/guion';
import { svgPintadera } from '../../arte/pintaderas';
import { MEDALLAS } from '../../data/medallas';
import { COLOR_CRIATURA, TIPOS } from '../../data/tipos';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Partida } from '../partida/partida';

export class Interfaz implements Subsistema {
  static readonly id = 'interfaz';
  static readonly deps: readonly string[] = ['partida'];

  private raiz: HTMLElement | null = null;
  private partida!: Partida;
  private cartel!: HTMLElement;
  private caja!: HTMLElement;
  private quien!: HTMLElement;
  private texto!: HTMLElement;
  private opciones!: HTMLElement;
  private si!: HTMLElement;
  private no!: HTMLElement;
  private seguir!: HTMLElement;
  private negro!: HTMLElement;
  private objetivo!: HTMLElement;
  private ayuda!: HTMLElement;
  /** La última zona de la isla anunciada: al salir de un edificio no se repite el cartel. */
  private ultimaZona = '';
  private quitar: (() => void)[] = [];
  private temporizador = 0;
  /** La calima (Las Dunas): unas pocas partículas de polvo que cruzan de derecha a izquierda. */
  private calima!: HTMLElement;
  /** La pintadera recién ganada, en grande, y lo que le queda en pantalla. */
  private medalla!: HTMLElement;
  private tMedalla = 0;
  /** Lo último pintado, para no tocar el DOM si no cambia. */
  private pintado = '';

  init(ctx: Ctx): void {
    this.partida = ctx.get<Partida>('partida');
    const raiz = document.createElement('div');
    raiz.className = 'interfaz';
    raiz.innerHTML = `
      <div class="zona-cartel" aria-live="polite"></div>
      <p class="objetivo" aria-live="polite"></p>
      <div class="dialogo" role="dialog" aria-live="assertive" hidden>
        <p class="dialogo-quien"></p>
        <p class="dialogo-texto"></p>
        <p class="dialogo-opciones" hidden><span class="opcion">Sí</span><span class="opcion">No</span></p>
        <span class="dialogo-seguir" aria-hidden="true">▼</span>
      </div>
      <div class="calima" hidden aria-hidden="true"></div>
      <div class="medalla-ganada" hidden><div class="medalla-dibujo"></div><p></p></div>
      <div class="fundido"></div>
      <p class="ayuda">Flechas o WASD: andar · E, Enter o Espacio: hablar y seguir · Esc: menú</p>`;
    document.body.append(raiz);
    this.raiz = raiz;
    this.cartel = raiz.querySelector('.zona-cartel')!;
    this.medalla = raiz.querySelector('.medalla-ganada')!;
    // Pocas, a distintas alturas y velocidades, con su propio retraso: que se note, sin molestar
    // ni tapar nada (autor, 2026-11-13).
    this.calima = raiz.querySelector('.calima')!;
    for (let i = 0; i < 9; i++) {
      const mota = document.createElement('i');
      mota.style.top = `${8 + ((i * 37) % 84)}%`;
      mota.style.setProperty('--d', `${7 + ((i * 5) % 6)}s`);
      mota.style.animationDelay = `${-((i * 2.3) % 9)}s`;
      mota.style.transform = `scale(${0.6 + ((i * 3) % 5) * 0.15})`;
      this.calima.append(mota);
    }
    this.caja = raiz.querySelector('.dialogo')!;
    this.quien = raiz.querySelector('.dialogo-quien')!;
    this.texto = raiz.querySelector('.dialogo-texto')!;
    this.opciones = raiz.querySelector('.dialogo-opciones')!;
    [this.si, this.no] = [...this.opciones.querySelectorAll<HTMLElement>('.opcion')];
    this.seguir = raiz.querySelector('.dialogo-seguir')!;
    this.negro = raiz.querySelector('.fundido')!;
    this.objetivo = raiz.querySelector('.objetivo')!;
    this.ayuda = raiz.querySelector('.ayuda')!;

    this.quitar.push(
      ctx.eventos.on('zona:entrar', ({ zonaId }) => this.anunciar(zonaId)),
      ctx.eventos.on('medalla:ganada', ({ isla }) => {
        const m = MEDALLAS.find((x) => x.isla === isla);
        if (!m) return;
        this.medalla.querySelector('.medalla-dibujo')!.innerHTML = svgPintadera(isla, true);
        this.medalla.querySelector('p')!.textContent = `¡Pintadera de ${m.nombre}!`;
        this.medalla.hidden = false;
        this.medalla.classList.remove('entra');
        void this.medalla.offsetWidth; // reinicia la animación
        this.medalla.classList.add('entra');
        this.tMedalla = 4;
      }),
      ctx.eventos.on('inicial:elegida', ({ tipo }) => {
        const nombre = TIPOS.find((t) => t.id === tipo)?.nombre ?? tipo;
        const color = COLOR_CRIATURA[tipo as keyof typeof COLOR_CRIATURA];
        this.mostrarCartel(`¡Tu compañera es de tipo ${nombre}!`, color === undefined ? undefined : `#${color.toString(16).padStart(6, '0')}`, 3.5);
      }),
    );
    this.anunciar(this.partida.estado.zona);
  }

  /** El cartel de una sala, o de una zona de la isla si es otra que la última anunciada. */
  private anunciar(zona: string): void {
    if (this.partida.mundo.zonas.has(zona)) {
      if (zona === this.ultimaZona) return;
      this.ultimaZona = zona;
    }
    this.mostrarCartel(this.partida.nombreZona(zona));
  }

  private mostrarCartel(texto: string, fondo?: string, segundos = 2.6): void {
    this.cartel.textContent = texto;
    this.cartel.style.background = fondo ?? '';
    this.cartel.style.color = fondo ? '#fff' : '';
    this.cartel.classList.remove('visible');
    void this.cartel.offsetWidth; // reinicia la transición
    this.cartel.classList.add('visible');
    this.temporizador = segundos;
  }

  actualizar(dt: number): void {
    if (this.tMedalla > 0) {
      this.tMedalla -= dt;
      if (this.tMedalla <= 0) this.medalla.hidden = true;
    }
    if (this.temporizador > 0) {
      this.temporizador -= dt;
      if (this.temporizador <= 0) this.cartel.classList.remove('visible');
    }
    this.negro.style.opacity = String(this.partida.fundido);
    const objetivo = this.partida.objetivo();
    const texto = objetivo ? `Objetivo: ${objetivo}` : '';
    if (this.objetivo.textContent !== texto) this.objetivo.textContent = texto;
    // En combate, en la portada y en el final no se ve nada de la exploración.
    const modo = this.partida.modo;
    const oculta = modo === 'combate' || modo === 'titulo' || modo === 'fin';
    // El objetivo tampoco, con el menú o la tienda abiertos.
    this.objetivo.hidden = !objetivo || oculta || modo === 'menu';
    this.pintarDialogo();
    // La calima o el viento, solo fuera y en las zonas que los tienen.
    const e = this.partida.estado;
    const clima = e.dentro ? undefined : this.partida.mundo.zonas.get(e.zona)?.clima;
    const visible = !oculta && modo !== 'menu' && !!clima;
    if (this.calima.hidden === visible) this.calima.hidden = !visible;
    this.calima.classList.toggle('viento', clima === 'viento');
    // La ayuda de las teclas de explorar, tampoco en el menú ni en la tienda (tienen la suya).
    this.ayuda.hidden = this.partida.dialogo !== null || oculta || modo === 'menu';
    if (oculta || modo === 'menu') this.cartel.classList.remove('visible');
  }

  private pintarDialogo(): void {
    const d = this.partida.dialogo;
    if (!d) {
      if (this.pintado) {
        this.caja.hidden = true;
        this.pintado = '';
      }
      return;
    }
    const linea = lineaActual(d);
    const lista = completa(d);
    const pregunta = d.tramo === 'pregunta' && lista;
    const clave = `${d.tramo}|${d.linea}|${d.revelado}|${d.opcion}|${pregunta}`;
    if (clave === this.pintado) return;
    this.pintado = clave;
    this.caja.hidden = false;
    this.quien.hidden = !linea.quien;
    this.quien.textContent = linea.quien ?? '';
    this.texto.textContent = linea.texto.slice(0, d.revelado);
    this.opciones.hidden = !pregunta;
    this.si.classList.toggle('elegida', d.opcion === 0);
    this.no.classList.toggle('elegida', d.opcion === 1);
    this.seguir.hidden = !lista || pregunta;
  }

  dispose(): void {
    for (const q of this.quitar) q();
    this.raiz?.remove();
  }
}
