// Subsistema «inicio»: la portada de una partida nueva (autor, 2026-11-12). Se elige la persona
// (cada amigo tiene la suya, hecha con Meshy) y se escribe el nombre. Se enseña mientras «partida»
// está en modo «titulo»: con una partida guardada no sale, porque se sigue donde se dejó.
// Teclado: flechas para elegir, E, Enter o Espacio para seguir y Esc para volver.

import { JUGABLES } from '../../arte/personas';
import { rutaModelo } from '../../arte/modelos';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Entrada } from '../entrada/entrada';
import type { Partida } from '../partida/partida';

type Paso = 'portada' | 'persona' | 'nombre';

export class Inicio implements Subsistema {
  static readonly id = 'inicio';
  static readonly deps: readonly string[] = ['entrada', 'partida'];

  private ctx!: Ctx;
  private entrada!: Entrada;
  private partida!: Partida;
  private raiz!: HTMLDivElement;
  private paso: Paso = 'portada';
  private eleccion = 0;
  private cartas: HTMLElement[] = [];
  private campo!: HTMLInputElement;
  private pista!: HTMLElement;

  init(ctx: Ctx): void {
    this.ctx = ctx;
    this.entrada = ctx.get<Entrada>('entrada');
    this.partida = ctx.get<Partida>('partida');
    const raiz = document.createElement('div');
    raiz.className = 'inicio';
    raiz.hidden = true;
    raiz.innerHTML = `
      <div class="inicio-panel">
        <h1 class="inicio-titulo">Six-seven islands</h1>
        <div class="inicio-portada"><p>Un archipiélago de criaturas por descubrir.</p></div>
        <div class="inicio-personas" hidden></div>
        <label class="inicio-nombre" hidden>¿Cómo te llamas?<input maxlength="16" spellcheck="false" autocomplete="off" /></label>
        <p class="inicio-pista"></p>
      </div>`;
    document.body.append(raiz);
    this.raiz = raiz;
    this.campo = raiz.querySelector('.inicio-nombre input')!;
    this.pista = raiz.querySelector('.inicio-pista')!;
    const personas = raiz.querySelector('.inicio-personas')!;
    this.cartas = JUGABLES.map(([, d]) => {
      const carta = document.createElement('figure');
      carta.className = 'inicio-carta';
      carta.innerHTML = `<img alt="" /><figcaption></figcaption>`;
      carta.querySelector('img')!.src = rutaModelo(d.jugable!.foto);
      carta.querySelector('figcaption')!.textContent = d.jugable!.nombre;
      personas.append(carta);
      return carta;
    });
    // En el cuadro del nombre se escribe: Enter empieza y Esc vuelve (la entrada del juego no lo lee).
    this.campo.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        this.partida.empezarPartida(this.campo.value, JUGABLES[this.eleccion][0]);
      } else if (ev.key === 'Escape') {
        ev.preventDefault();
        this.ir('persona');
      }
    });
    this.ir('portada');
  }

  private ir(p: Paso): void {
    this.paso = p;
    this.raiz.querySelector<HTMLElement>('.inicio-portada')!.hidden = p !== 'portada';
    this.raiz.querySelector<HTMLElement>('.inicio-personas')!.hidden = p !== 'persona';
    this.raiz.querySelector<HTMLElement>('.inicio-nombre')!.hidden = p !== 'nombre';
    this.pista.textContent = {
      portada: 'Pulsa Enter para empezar',
      persona: '¿Quién eres? Flechas para elegir, Enter para seguir',
      nombre: 'Escribe tu nombre y pulsa Enter. Esc: volver',
    }[p];
    if (p === 'persona') this.pintar();
    if (p === 'nombre') {
      this.campo.value = JUGABLES[this.eleccion][1].jugable!.nombre;
      this.campo.focus();
      this.campo.select();
    } else this.campo.blur();
  }

  private pintar(): void {
    this.cartas.forEach((c, i) => c.classList.toggle('elegida', i === this.eleccion));
  }

  pasoFijo(): void {
    const visible = this.partida.modo === 'titulo';
    if (this.raiz.hidden === visible) this.raiz.hidden = !visible;
    if (!visible || this.paso === 'nombre') return;
    const confirmar = this.entrada.consumir('confirmar');
    const cancelar = this.entrada.consumir('cancelar');
    const dir = this.entrada.pulsacion();
    const sonar = (nombre: string) => this.ctx.eventos.emit('sonido:tocar', { nombre });
    if (this.paso === 'portada') {
      if (confirmar) {
        sonar('confirmar');
        this.ir('persona');
      }
      return;
    }
    if (dir === 'e' || dir === 'o') {
      this.eleccion = (this.eleccion + (dir === 'e' ? 1 : -1) + this.cartas.length) % this.cartas.length;
      sonar('seleccion');
      this.pintar();
    }
    if (confirmar) {
      sonar('confirmar');
      this.ir('nombre');
    } else if (cancelar) {
      sonar('atras');
      this.ir('portada');
    }
  }

  dispose(): void {
    this.raiz.remove();
  }
}
