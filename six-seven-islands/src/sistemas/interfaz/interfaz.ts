// Subsistema «interfaz»: la interfaz en DOM sobre el lienzo. El cartel con el nombre de la zona
// o la sala al entrar, la caja de diálogo (quién habla, el texto letra a letra y el sí o no de
// las preguntas), el fundido a negro al cruzar una puerta y la ayuda de teclas. Todo se maneja
// con el teclado; lee el estado de «partida» en cada fotograma y no lo cambia.

import { completa, lineaActual } from '../../core/guion';
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
  private quitar: (() => void)[] = [];
  private temporizador = 0;
  /** Lo último pintado, para no tocar el DOM si no cambia. */
  private pintado = '';

  init(ctx: Ctx): void {
    this.partida = ctx.get<Partida>('partida');
    const raiz = document.createElement('div');
    raiz.className = 'interfaz';
    raiz.innerHTML = `
      <div class="zona-cartel" aria-live="polite"></div>
      <div class="dialogo" role="dialog" aria-live="assertive" hidden>
        <p class="dialogo-quien"></p>
        <p class="dialogo-texto"></p>
        <p class="dialogo-opciones" hidden><span class="opcion">Sí</span><span class="opcion">No</span></p>
        <span class="dialogo-seguir" aria-hidden="true">▼</span>
      </div>
      <div class="fundido"></div>
      <p class="ayuda">Flechas o WASD: andar · E o Enter: hablar y seguir</p>`;
    document.body.append(raiz);
    this.raiz = raiz;
    this.cartel = raiz.querySelector('.zona-cartel')!;
    this.caja = raiz.querySelector('.dialogo')!;
    this.quien = raiz.querySelector('.dialogo-quien')!;
    this.texto = raiz.querySelector('.dialogo-texto')!;
    this.opciones = raiz.querySelector('.dialogo-opciones')!;
    [this.si, this.no] = [...this.opciones.querySelectorAll<HTMLElement>('.opcion')];
    this.seguir = raiz.querySelector('.dialogo-seguir')!;
    this.negro = raiz.querySelector('.fundido')!;

    this.quitar.push(ctx.eventos.on('zona:entrar', ({ zonaId }) => this.mostrarCartel(this.partida.nombreZona(zonaId))));
    this.mostrarCartel(this.partida.nombreZona(this.partida.estado.zona));
  }

  private mostrarCartel(texto: string): void {
    this.cartel.textContent = texto;
    this.cartel.classList.remove('visible');
    void this.cartel.offsetWidth; // reinicia la transición
    this.cartel.classList.add('visible');
    this.temporizador = 2.6;
  }

  actualizar(dt: number): void {
    if (this.temporizador > 0) {
      this.temporizador -= dt;
      if (this.temporizador <= 0) this.cartel.classList.remove('visible');
    }
    this.negro.style.opacity = String(this.partida.fundido);
    this.pintarDialogo();
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
