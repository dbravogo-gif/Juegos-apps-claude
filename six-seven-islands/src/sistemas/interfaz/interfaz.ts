// Subsistema «interfaz»: la interfaz en DOM sobre el lienzo. Por ahora, el cartel con el nombre
// de la zona al entrar, la caja de avisos y la ayuda de teclas. Todo se maneja con el teclado.

import type { Ctx, Subsistema } from '../../motor/motor';
import type { Partida } from '../partida/partida';

export class Interfaz implements Subsistema {
  static readonly id = 'interfaz';
  static readonly deps: readonly string[] = ['partida'];

  private raiz: HTMLElement | null = null;
  private cartel!: HTMLElement;
  private aviso!: HTMLElement;
  private textoAviso!: HTMLElement;
  private quitar: (() => void)[] = [];
  private temporizador = 0;

  init(ctx: Ctx): void {
    const partida = ctx.get<Partida>('partida');
    const raiz = document.createElement('div');
    raiz.className = 'interfaz';
    raiz.innerHTML = `
      <div class="zona-cartel" aria-live="polite"></div>
      <div class="aviso" role="dialog" aria-live="assertive" hidden>
        <p class="aviso-texto"></p>
        <span class="aviso-seguir">Enter ▸</span>
      </div>
      <p class="ayuda">Flechas o WASD: andar · Enter: hablar o seguir</p>`;
    document.body.append(raiz);
    this.raiz = raiz;
    this.cartel = raiz.querySelector('.zona-cartel')!;
    this.aviso = raiz.querySelector('.aviso')!;
    this.textoAviso = raiz.querySelector('.aviso-texto')!;

    const nombre = (zona: string) => partida.mundo.zonas.get(zona)?.nombre ?? zona;
    this.quitar.push(ctx.eventos.on('zona:entrar', ({ zonaId }) => this.mostrarCartel(nombre(zonaId))));
    this.quitar.push(
      ctx.eventos.on('aviso:mostrar', ({ texto }) => {
        this.textoAviso.textContent = texto;
        this.aviso.hidden = false;
      }),
    );
    this.quitar.push(ctx.eventos.on('aviso:cerrar', () => (this.aviso.hidden = true)));
    this.mostrarCartel(nombre(partida.estado.zona));
  }

  private mostrarCartel(texto: string): void {
    this.cartel.textContent = texto;
    this.cartel.classList.remove('visible');
    void this.cartel.offsetWidth; // reinicia la transición
    this.cartel.classList.add('visible');
    this.temporizador = 2.6;
  }

  actualizar(dt: number): void {
    if (this.temporizador <= 0) return;
    this.temporizador -= dt;
    if (this.temporizador <= 0) this.cartel.classList.remove('visible');
  }

  dispose(): void {
    for (const q of this.quitar) q();
    this.raiz?.remove();
  }
}
