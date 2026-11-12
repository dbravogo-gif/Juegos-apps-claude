// Subsistema «menu»: el menú de pausa, con Esc mientras se explora (F10 y punto 5 de la lista del
// autor, 2026-11-12). Equipo (poner a una criatura la primera), Mochila (usar pociones), Mapa (el
// plano con tu posición), Exportar e Importar la partida como código, y Volver. También la tienda
// (F17), al acabar de hablar con el tendero. Todo con el teclado: flechas para elegir, E, Enter o
// Espacio para confirmar y Esc para volver atrás.

import { nombreDe, objetoUtil, usarObjeto } from '../../core/criatura';
import { vidaMaxima } from '../../core/estadisticas';
import { exportarCodigo, importarCodigo } from '../../core/guardado';
import { DATOS_COMBATE_PRUEBA as DATOS } from '../../data/combate-prueba';
import { dibujarPlano } from '../mapa/dibujo';
import { planoIsla, type Plano } from '../mapa/plano';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Entrada } from '../entrada/entrada';
import type { Partida } from '../partida/partida';

type Pantalla = 'cerrado' | 'principal' | 'equipo' | 'mochila' | 'objetivo' | 'mapa' | 'exportar' | 'importar' | 'tienda';

interface Opcion {
  texto: string;
  detalle?: string;
  activa: boolean;
  elegir: () => void;
}

export class Menu implements Subsistema {
  static readonly id = 'menu';
  static readonly deps: readonly string[] = ['entrada', 'partida'];

  private ctx!: Ctx;
  private entrada!: Entrada;
  private partida!: Partida;
  private raiz!: HTMLDivElement;
  private titulo!: HTMLElement;
  private lista!: HTMLElement;
  private nota!: HTMLElement;
  private lienzo!: HTMLCanvasElement;
  private area!: HTMLTextAreaElement;
  private pantalla: Pantalla = 'cerrado';
  private opciones: Opcion[] = [];
  private eleccion = 0;
  /** El objeto que se va a usar, mientras se elige sobre quién. */
  private objeto: string | null = null;
  private plano: Plano | null = null;
  private quitar: (() => void)[] = [];

  init(ctx: Ctx): void {
    this.ctx = ctx;
    this.entrada = ctx.get<Entrada>('entrada');
    this.partida = ctx.get<Partida>('partida');
    const raiz = document.createElement('div');
    raiz.className = 'menu-juego';
    raiz.hidden = true;
    raiz.innerHTML = `
      <div class="menu-panel" role="dialog" aria-live="polite">
        <p class="menu-titulo"></p>
        <div class="menu-lista"></div>
        <canvas class="menu-mapa" hidden></canvas>
        <textarea class="menu-codigo" hidden spellcheck="false"></textarea>
        <p class="menu-nota"></p>
      </div>`;
    document.body.append(raiz);
    this.raiz = raiz;
    this.titulo = raiz.querySelector('.menu-titulo')!;
    this.lista = raiz.querySelector('.menu-lista')!;
    this.nota = raiz.querySelector('.menu-nota')!;
    this.lienzo = raiz.querySelector('.menu-mapa')!;
    this.area = raiz.querySelector('.menu-codigo')!;
    // Con el foco en el cuadro del código, la entrada del juego no lee las teclas: aquí Enter
    // copia (exportar) o importa, y Esc vuelve al menú.
    this.area.addEventListener('keydown', (ev) => {
      if (this.pantalla !== 'importar' && this.pantalla !== 'exportar') return;
      if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault();
        if (this.pantalla === 'importar') this.importar();
        else this.copiar();
      } else if (ev.key === 'Escape') {
        ev.preventDefault();
        this.abrir('principal');
      }
    });
    this.quitar.push(
      ctx.eventos.on('menu:abrir', () => this.abrir('principal')),
      ctx.eventos.on('tienda:abrir', () => this.abrir('tienda')),
    );
  }

  private abrir(p: Pantalla): void {
    this.pantalla = p;
    this.raiz.hidden = p === 'cerrado';
    this.lienzo.hidden = p !== 'mapa';
    this.area.hidden = p !== 'exportar' && p !== 'importar';
    this.nota.textContent = '';
    if (p !== 'importar') this.area.blur();
    const equipo = this.partida.equipo;
    switch (p) {
      case 'cerrado':
        return;
      case 'principal':
        this.titulo.textContent = 'Menú';
        this.opciones = [
          { texto: 'Equipo', detalle: `${equipo.length} de 6`, activa: equipo.length > 0, elegir: () => this.abrir('equipo') },
          { texto: 'Mochila', detalle: `${this.partida.dinero} de dinero`, activa: true, elegir: () => this.abrir('mochila') },
          { texto: 'Mapa', activa: true, elegir: () => this.abrir('mapa') },
          { texto: 'Exportar partida', detalle: 'Un código para llevártela a otro navegador', activa: true, elegir: () => this.abrir('exportar') },
          { texto: 'Importar partida', detalle: 'Pega un código exportado', activa: true, elegir: () => this.abrir('importar') },
          { texto: 'Volver al juego', activa: true, elegir: () => this.cerrar() },
        ];
        break;
      case 'equipo':
        this.titulo.textContent = 'Equipo';
        this.nota.textContent = 'La primera es la que sale a combatir. Elige una para ponerla la primera.';
        this.opciones = equipo.map((c, i) => ({
          texto: `${nombreDe(c, DATOS)} · Nv. ${c.nivel}`,
          detalle: `Vida ${c.vida}/${vidaMaxima(c, DATOS)} · ${DATOS.especies[c.especie].tipos.join(' / ')}${i === 0 ? ' · la primera' : ''}`,
          activa: i > 0,
          elegir: () => {
            equipo.unshift(...equipo.splice(i, 1));
            this.abrir('equipo');
          },
        }));
        break;
      case 'mochila': {
        this.titulo.textContent = `Mochila · ${this.partida.dinero} de dinero`;
        const objetos = Object.entries(this.partida.mochila).filter(([id, n]) => n > 0 && DATOS.objetos[id]);
        this.opciones = objetos.map(([id, n]) => {
          const o = DATOS.objetos[id];
          const curativo = o.tipo === 'curar' || o.tipo === 'remedio' || o.tipo === 'revivir';
          return {
            texto: `${o.nombre} ×${n}`,
            detalle: o.descripcion,
            activa: curativo && equipo.some((c) => objetoUtil(c, id, DATOS)),
            elegir: () => {
              this.objeto = id;
              this.abrir('objetivo');
            },
          };
        });
        if (!objetos.length) this.nota.textContent = 'La mochila está vacía.';
        break;
      }
      case 'objetivo': {
        const id = this.objeto!;
        this.titulo.textContent = `¿Con quién usas ${DATOS.objetos[id].nombre}?`;
        this.opciones = equipo.map((c, i) => ({
          texto: `${nombreDe(c, DATOS)} · Nv. ${c.nivel}`,
          detalle: `Vida ${c.vida}/${vidaMaxima(c, DATOS)}`,
          activa: objetoUtil(c, id, DATOS),
          elegir: () => {
            equipo[i] = usarObjeto(c, id, DATOS);
            this.partida.mochila[id] = Math.max(0, (this.partida.mochila[id] ?? 0) - 1);
            this.abrir('mochila');
            this.nota.textContent = `${nombreDe(c, DATOS)} recupera vida.`;
          },
        }));
        break;
      }
      case 'tienda': {
        const dinero = this.partida.dinero;
        this.titulo.textContent = `Tienda · ${dinero} de dinero`;
        if (!this.nota.textContent) this.nota.textContent = 'Elige qué comprar. Esc: salir.';
        this.opciones = Object.values(DATOS.objetos)
          .filter((o) => o.precio !== undefined)
          .map((o) => ({
            texto: `${o.nombre} · ${o.precio}`,
            detalle: `${o.descripcion} Tienes ${this.partida.mochila[o.id] ?? 0}.`,
            activa: dinero >= o.precio!,
            elegir: () => {
              this.partida.dinero -= o.precio!;
              this.partida.mochila[o.id] = (this.partida.mochila[o.id] ?? 0) + 1;
              const eleccion = this.eleccion;
              this.abrir('tienda');
              this.nota.textContent = `Compras ${o.nombre}. ¡Gracias!`;
              this.eleccion = this.opciones[eleccion]?.activa ? eleccion : this.eleccion;
              this.pintar();
            },
          }));
        break;
      }
      case 'mapa':
        this.titulo.textContent = 'Lanzarote';
        this.opciones = [];
        this.pintarMapa();
        break;
      case 'exportar': {
        this.titulo.textContent = 'Exportar partida';
        this.opciones = [];
        this.area.readOnly = true;
        this.area.value = exportarCodigo(this.partida.guardado());
        this.area.focus();
        this.area.select();
        this.nota.textContent = 'Enter: copiar el código. Guárdalo en una nota; con él recuperas la partida en otro navegador.';
        break;
      }
      case 'importar':
        this.titulo.textContent = 'Importar partida';
        this.opciones = [];
        this.area.readOnly = false;
        this.area.value = '';
        this.nota.textContent = 'Pega el código (empieza por SSI1:) y pulsa Enter. Esc: volver. Sustituye la partida actual.';
        this.area.focus();
        break;
    }
    this.eleccion = Math.max(0, this.opciones.findIndex((o) => o.activa));
    this.pintar();
  }

  private pintar(): void {
    this.lista.replaceChildren(
      ...this.opciones.map((o, i) => {
        const el = document.createElement('div');
        el.className = 'menu-op';
        el.classList.toggle('elegido', i === this.eleccion);
        el.classList.toggle('apagado', !o.activa);
        el.innerHTML = `<b></b>${o.detalle ? '<small></small>' : ''}`;
        el.querySelector('b')!.textContent = o.texto;
        if (o.detalle) el.querySelector('small')!.textContent = o.detalle;
        return el;
      }),
    );
  }

  private pintarMapa(): void {
    this.plano ??= planoIsla(this.partida.mundo);
    const p = this.plano;
    const alto = Math.min(window.innerHeight * 0.8, 760);
    const px = Math.max(2, Math.floor(alto / p.alto));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.lienzo.width = p.ancho * px * dpr;
    this.lienzo.height = p.alto * px * dpr;
    this.lienzo.style.width = `${p.ancho * px}px`;
    this.lienzo.style.height = `${p.alto * px}px`;
    const g = this.lienzo.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Dentro de un edificio, el jugador está en la puerta por la que entró.
    const e = this.partida.estado;
    const donde = e.dentro && e.fuera ? e.fuera : { x: e.x, y: e.y };
    dibujarPlano(g, p, { px, jugador: donde });
    this.nota.textContent = 'Esc: volver.';
  }

  private copiar(): void {
    void navigator.clipboard?.writeText(this.area.value).then(
      () => (this.nota.textContent = 'Copiado. Guárdalo en una nota.'),
      () => (this.nota.textContent = 'No se ha podido copiar: está seleccionado, cópialo con Ctrl+C o Cmd+C.'),
    );
  }

  private importar(): void {
    const g = importarCodigo(this.area.value);
    if (!g) {
      this.nota.textContent = 'Ese código no es válido. Comprueba que esté entero.';
      return;
    }
    this.partida.aplicarGuardado(g);
    this.partida.guardar();
    this.ctx.eventos.emit('zona:entrar', { zonaId: this.partida.estado.zona });
    this.cerrar();
  }

  private cerrar(): void {
    this.abrir('cerrado');
    this.partida.cerrarMenu();
  }

  pasoFijo(): void {
    // En exportar e importar manda el cuadro del código, que tiene el foco.
    if (this.pantalla === 'cerrado' || this.pantalla === 'importar' || this.pantalla === 'exportar') return;
    const confirmar = this.entrada.consumir('confirmar');
    const cancelar = this.entrada.consumir('cancelar');
    const dir = this.entrada.pulsacion();
    if (dir === 'n' || dir === 's') {
      const n = this.eleccion + (dir === 's' ? 1 : -1);
      if (n >= 0 && n < this.opciones.length) this.eleccion = n;
      this.pintar();
    }
    if (cancelar) {
      if (this.pantalla === 'principal' || this.pantalla === 'tienda') this.cerrar();
      else if (this.pantalla === 'objetivo') this.abrir('mochila');
      else this.abrir('principal');
      return;
    }
    if (!confirmar) return;
    const o = this.opciones[this.eleccion];
    if (o?.activa) o.elegir();
  }

  dispose(): void {
    for (const q of this.quitar) q();
    this.raiz.remove();
  }
}
