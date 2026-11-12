// Subsistema «menu»: el menú de pausa, con Esc mientras se explora, y la tienda.
//
// Diseño del autor (2026-11-12):
// - Menú de pausa: un degradado oscuro de izquierda (menos transparente) a derecha (casi nada),
//   que deja ver el juego. A la derecha, las opciones en una sola columna; a la izquierda, sobre
//   lo oscuro, lo que toca: el equipo, la ficha de una criatura, un objeto, el medallero, el mapa…
// - Tienda (y los menús de su estilo, como confirmar una compra): todo transparente salvo las
//   opciones, a la izquierda.
//
// Pantallas: Equipo (poner a una criatura la primera), Mochila (usar pociones), Medallero (las
// pintaderas de cada isla), Mapa (el plano con tu posición) y Opciones (sonido, exportar e
// importar la partida como código y nueva partida). La tienda (F17) se abre al acabar de hablar
// con el tendero: cada compra se confirma (×1 o ×5), para no comprar sin querer al venir pulsando
// E desde el diálogo. Todo con el teclado: flechas para elegir, E, Enter o Espacio para confirmar
// y Esc para volver.

import { nombreDe, objetoUtil, usarObjeto } from '../../core/criatura';
import { vidaMaxima } from '../../core/estadisticas';
import { exportarCodigo, importarCodigo } from '../../core/guardado';
import type { Criatura } from '../../core/modelo';
import { svgPintadera } from '../../arte/pintaderas';
import { DATOS_COMBATE_PRUEBA as DATOS } from '../../data/combate-prueba';
import { MEDALLAS, medallasGanadas } from '../../data/medallas';
import { TIPOS } from '../../data/tipos';
import { dibujarPlano } from '../mapa/dibujo';
import { planoIsla, type Plano } from '../mapa/plano';
import type { Ctx, Subsistema } from '../../motor/motor';
import type { Entrada } from '../entrada/entrada';
import type { Partida } from '../partida/partida';
import { EFECTOS, sonidoActivo, type NombreEfecto } from '../sonido/sonido';

type Pantalla =
  | 'cerrado'
  | 'principal'
  | 'equipo'
  | 'mochila'
  | 'objetivo'
  | 'medallero'
  | 'mapa'
  | 'opciones'
  | 'exportar'
  | 'importar'
  | 'sonidos'
  | 'nueva'
  | 'tienda'
  | 'compra';

/** Las pantallas con el estilo de la tienda: sin fondo y con las opciones a la izquierda. */
const ESTILO_TIENDA: ReadonlySet<Pantalla> = new Set(['tienda', 'compra']);
/** A dónde vuelve Esc desde cada pantalla (las que no salen aquí cierran el menú). */
const ATRAS: Partial<Record<Pantalla, Pantalla>> = {
  equipo: 'principal',
  mochila: 'principal',
  objetivo: 'mochila',
  medallero: 'principal',
  mapa: 'principal',
  opciones: 'principal',
  exportar: 'opciones',
  importar: 'opciones',
  sonidos: 'opciones',
  nueva: 'opciones',
  compra: 'tienda',
};
/** Las pantallas en las que se recuerda la opción elegida, para volver a ella al regresar. */
const CON_VUELTA: ReadonlySet<Pantalla> = new Set(['principal', 'opciones', 'tienda']);

/** Al abrirse el menú o la tienda, pasos fijos (0,4 s) en que Enter y E no eligen: la pulsación que cerraba el diálogo no compra. */
const ESPERA_AL_ABRIR = 24;

const TIPO = new Map<string, { nombre: string; color: number }>(TIPOS.map((t) => [t.id, t]));
const css = (color: number) => `#${color.toString(16).padStart(6, '0')}`;

interface Opcion {
  texto: string;
  detalle?: string;
  activa: boolean;
  elegir: () => void;
  /** Lo que la opción representa: el índice de una criatura, el id de un objeto o la isla. */
  dato?: number | string;
}

/** Crea un elemento con clase y, si se da, texto (siempre como texto, nunca como HTML). */
function el<K extends keyof HTMLElementTagNameMap>(etiqueta: K, clase?: string, texto?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(etiqueta);
  if (clase) e.className = clase;
  if (texto !== undefined) e.textContent = texto;
  return e;
}

/** Una barra de vida, verde, amarilla o roja según lo que quede. */
function barraVida(vida: number, max: number): HTMLElement {
  const p = Math.max(0, Math.min(1, vida / max));
  const barra = el('span', 'menu-vida');
  const relleno = el('i');
  relleno.style.width = `${p * 100}%`;
  relleno.style.background = p > 0.5 ? '#4cc26e' : p > 0.2 ? '#f2c14e' : '#ef5b4f';
  barra.append(relleno);
  return barra;
}

/** Las etiquetas de los tipos, con su color. */
function chipsTipo(tipos: readonly string[]): HTMLElement {
  const fila = el('span', 'menu-tipos');
  for (const t of tipos) {
    const chip = el('i', undefined, TIPO.get(t)?.nombre ?? t);
    chip.style.background = css(TIPO.get(t)?.color ?? 0xa8a29e);
    fila.append(chip);
  }
  return fila;
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
  private pie!: HTMLElement;
  private contenido!: HTMLElement;
  private nota!: HTMLElement;
  private lienzo!: HTMLCanvasElement;
  private area!: HTMLTextAreaElement;
  private pantalla: Pantalla = 'cerrado';
  private opciones: Opcion[] = [];
  private eleccion = 0;
  /** El objeto que se va a usar (mientras se elige sobre quién) o a comprar (mientras se confirma). */
  private objeto: string | null = null;
  /** La opción elegida en las pantallas con vuelta, para volver a ella al regresar. */
  private vuelta: Partial<Record<Pantalla, number>> = {};
  private espera = 0;
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
      <section class="menu-detalle" aria-live="polite">
        <div class="menu-contenido"></div>
        <canvas class="menu-mapa" hidden></canvas>
        <textarea class="menu-codigo" hidden spellcheck="false"></textarea>
        <p class="menu-nota"></p>
      </section>
      <nav class="menu-columna" role="menu">
        <p class="menu-titulo"></p>
        <div class="menu-lista"></div>
        <p class="menu-pie"></p>
      </nav>`;
    document.body.append(raiz);
    this.raiz = raiz;
    this.titulo = raiz.querySelector('.menu-titulo')!;
    this.lista = raiz.querySelector('.menu-lista')!;
    this.pie = raiz.querySelector('.menu-pie')!;
    this.contenido = raiz.querySelector('.menu-contenido')!;
    this.nota = raiz.querySelector('.menu-nota')!;
    this.lienzo = raiz.querySelector('.menu-mapa')!;
    this.area = raiz.querySelector('.menu-codigo')!;
    // Con el foco en el cuadro del código, la entrada del juego no lee las teclas: aquí Enter
    // copia (exportar) o importa, y Esc vuelve a Opciones.
    this.area.addEventListener('keydown', (ev) => {
      if (this.pantalla !== 'importar' && this.pantalla !== 'exportar') return;
      if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault();
        if (this.pantalla === 'importar') this.importar();
        else this.copiar();
      } else if (ev.key === 'Escape') {
        ev.preventDefault();
        this.abrir('opciones');
      }
    });
    const abrirDesdeFuera = (p: Pantalla) => () => {
      this.vuelta = {};
      this.espera = ESPERA_AL_ABRIR;
      this.abrir(p);
    };
    this.quitar.push(ctx.eventos.on('menu:abrir', abrirDesdeFuera('principal')), ctx.eventos.on('tienda:abrir', abrirDesdeFuera('tienda')));
  }

  private abrir(p: Pantalla): void {
    if (CON_VUELTA.has(this.pantalla) && p !== this.pantalla) this.vuelta[this.pantalla] = this.eleccion;
    this.pantalla = p;
    this.raiz.hidden = p === 'cerrado';
    this.raiz.classList.toggle('estilo-tienda', ESTILO_TIENDA.has(p));
    this.raiz.classList.toggle('estilo-pausa', !ESTILO_TIENDA.has(p));
    this.lienzo.hidden = p !== 'mapa';
    this.area.hidden = p !== 'exportar' && p !== 'importar';
    this.nota.textContent = '';
    this.pie.textContent = p === 'tienda' || p === 'compra' ? '' : '↑ ↓ elegir · Enter aceptar · Esc volver';
    if (p !== 'importar') this.area.blur();
    const equipo = this.partida.equipo;
    const ganadas = medallasGanadas(this.partida.estado.condiciones).length;
    switch (p) {
      case 'cerrado':
        return;
      case 'principal':
        this.titulo.textContent = 'Menú';
        this.opciones = [
          { texto: 'Equipo', detalle: `${equipo.length} de 6 criaturas. Elige quién sale primero a combatir.`, activa: equipo.length > 0, elegir: () => this.abrir('equipo') },
          { texto: 'Mochila', detalle: `Tus objetos y ${this.partida.dinero} de dinero.`, activa: true, elegir: () => this.abrir('mochila') },
          { texto: 'Medallero', detalle: `${ganadas} de ${MEDALLAS.length} pintaderas. Se gana una en el gimnasio de cada isla.`, activa: true, elegir: () => this.abrir('medallero') },
          { texto: 'Mapa', detalle: 'Lanzarote, con tu posición.', activa: true, elegir: () => this.abrir('mapa') },
          { texto: 'Opciones', detalle: 'Sonido, exportar o importar la partida y empezar otra.', activa: true, elegir: () => this.abrir('opciones') },
          { texto: 'Volver al juego', detalle: 'También con Esc.', activa: true, elegir: () => this.cerrar() },
        ];
        break;
      case 'equipo':
        this.titulo.textContent = 'Equipo';
        this.nota.textContent = 'La primera es la que sale a combatir. Elige otra para ponerla la primera.';
        this.opciones = equipo.map((c, i) => ({
          texto: `${nombreDe(c, DATOS)} · Nv. ${c.nivel}`,
          activa: i > 0,
          dato: i,
          elegir: () => {
            equipo.unshift(...equipo.splice(i, 1));
            this.abrir('equipo');
          },
        }));
        break;
      case 'mochila': {
        this.titulo.textContent = 'Mochila';
        const objetos = Object.entries(this.partida.mochila).filter(([id, n]) => n > 0 && DATOS.objetos[id]);
        this.opciones = objetos.map(([id, n]) => {
          const o = DATOS.objetos[id];
          const curativo = o.tipo === 'curar' || o.tipo === 'remedio' || o.tipo === 'revivir';
          return {
            texto: `${o.nombre} ×${n}`,
            activa: curativo && equipo.some((c) => objetoUtil(c, id, DATOS)),
            dato: id,
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
        this.titulo.textContent = `Usar ${DATOS.objetos[id].nombre}`;
        this.nota.textContent = '¿Con quién?';
        this.opciones = equipo.map((c, i) => ({
          texto: `${nombreDe(c, DATOS)} · Nv. ${c.nivel}`,
          activa: objetoUtil(c, id, DATOS),
          dato: i,
          elegir: () => {
            equipo[i] = usarObjeto(c, id, DATOS);
            this.ctx.eventos.emit('sonido:tocar', { nombre: 'curar' });
            this.partida.mochila[id] = Math.max(0, (this.partida.mochila[id] ?? 0) - 1);
            this.abrir('mochila');
            this.nota.textContent = `${nombreDe(c, DATOS)} recupera vida.`;
          },
        }));
        break;
      }
      case 'medallero':
        this.titulo.textContent = 'Medallero';
        // Las islas se recorren para ver cada pintadera; elegir no hace nada.
        this.opciones = MEDALLAS.map((m) => ({ texto: m.nombre, activa: true, dato: m.isla, elegir: () => undefined }));
        break;
      case 'mapa':
        this.titulo.textContent = 'Mapa';
        this.opciones = [{ texto: 'Volver', activa: true, elegir: () => this.abrir('principal') }];
        this.pintarMapa();
        break;
      case 'opciones':
        this.titulo.textContent = 'Opciones';
        this.opciones = [
          {
            texto: `Sonido: ${sonidoActivo() ? 'activado' : 'silenciado'}`,
            detalle: 'Enter para activarlo o silenciarlo. Se recuerda en este navegador.',
            activa: true,
            elegir: () => {
              this.ctx.eventos.emit('sonido:alternar', {});
              const e = this.eleccion;
              this.abrir('opciones');
              this.eleccion = e;
              this.pintar();
            },
          },
          { texto: 'Probar sonidos', detalle: 'Escucha cada efecto, uno a uno, para valorarlo.', activa: true, elegir: () => this.abrir('sonidos') },
          { texto: 'Exportar partida', detalle: 'Un código para llevarte la partida a otro navegador.', activa: true, elegir: () => this.abrir('exportar') },
          { texto: 'Importar partida', detalle: 'Pega un código exportado. Sustituye la partida actual.', activa: true, elegir: () => this.abrir('importar') },
          { texto: 'Nueva partida', detalle: 'Borra esta partida y empieza desde la portada.', activa: true, elegir: () => this.abrir('nueva') },
          { texto: 'Volver', detalle: 'Al menú.', activa: true, elegir: () => this.abrir('principal') },
        ];
        break;
      case 'nueva':
        this.titulo.textContent = '¿Partida nueva?';
        this.opciones = [
          { texto: 'No, seguir con esta', activa: true, elegir: () => this.abrir('opciones') },
          { texto: 'Sí, borrarla', activa: true, elegir: () => this.partida.borrarPartida() },
        ];
        break;
      case 'sonidos':
        this.titulo.textContent = 'Probar sonidos';
        this.nota.textContent = 'Enter: escuchar. Esc: volver. Los parámetros están en EFECTOS (sistemas/sonido).';
        this.opciones = (Object.keys(EFECTOS) as NombreEfecto[]).map((n) => ({
          texto: n,
          activa: true,
          elegir: () => this.ctx.eventos.emit('sonido:tocar', { nombre: n }),
        }));
        break;
      case 'exportar':
        this.titulo.textContent = 'Exportar partida';
        this.opciones = [];
        this.area.readOnly = true;
        this.area.value = exportarCodigo(this.partida.guardado());
        this.area.focus();
        this.area.select();
        this.nota.textContent = 'Enter: copiar el código. Guárdalo en una nota; con él recuperas la partida en otro navegador. Esc: volver.';
        break;
      case 'importar':
        this.titulo.textContent = 'Importar partida';
        this.opciones = [];
        this.area.readOnly = false;
        this.area.value = '';
        this.nota.textContent = 'Pega el código (empieza por SSI1:) y pulsa Enter. Sustituye la partida actual. Esc: volver.';
        this.area.focus();
        break;
      case 'tienda': {
        const dinero = this.partida.dinero;
        this.titulo.textContent = `Tienda · ${dinero} de dinero`;
        this.avisar('Esc: salir');
        this.opciones = [
          ...Object.values(DATOS.objetos)
            .filter((o) => o.precio !== undefined)
            .map((o) => ({
              texto: `${o.nombre} · ${o.precio}`,
              detalle: `${o.descripcion} Tienes ${this.partida.mochila[o.id] ?? 0}.`,
              activa: dinero >= o.precio!,
              elegir: () => {
                this.objeto = o.id;
                this.abrir('compra');
              },
            })),
          { texto: 'Salir', activa: true, elegir: () => this.cerrar() },
        ];
        break;
      }
      case 'compra': {
        const o = DATOS.objetos[this.objeto!];
        const precio = o.precio!;
        const comprar = (n: number) => () => {
          this.partida.dinero -= precio * n;
          this.partida.mochila[o.id] = (this.partida.mochila[o.id] ?? 0) + n;
          this.ctx.eventos.emit('sonido:tocar', { nombre: 'comprar' });
          this.abrir('tienda');
          this.avisar(`Compras ${n === 1 ? o.nombre : `${n} × ${o.nombre}`}. ¡Gracias!`);
        };
        this.titulo.textContent = `Comprar ${o.nombre} · tienes ${this.partida.dinero}`;
        this.opciones = [
          { texto: `×1 · ${precio}`, activa: this.partida.dinero >= precio, elegir: comprar(1) },
          { texto: `×5 · ${precio * 5}`, activa: this.partida.dinero >= precio * 5, elegir: comprar(5) },
          { texto: 'Nada, gracias', activa: true, elegir: () => this.abrir('tienda') },
        ];
        this.avisar('Esc: volver a la tienda');
        break;
      }
    }
    // Se vuelve a la opción de antes (al regresar a una pantalla con vuelta), si se puede elegir;
    // si no, a la primera que se pueda.
    const antes = this.vuelta[p];
    this.eleccion = antes !== undefined && this.opciones[antes]?.activa ? antes : Math.max(0, this.opciones.findIndex((o) => o.activa));
    this.pintar();
  }

  /** Una nota al pie: en la tienda, que no tiene panel, va bajo las opciones. */
  private avisar(texto: string): void {
    if (ESTILO_TIENDA.has(this.pantalla)) this.pie.textContent = texto;
    else this.nota.textContent = texto;
  }

  /** La columna de opciones y, en el menú de pausa, el panel de la izquierda. */
  private pintar(): void {
    const tienda = ESTILO_TIENDA.has(this.pantalla);
    this.lista.replaceChildren(
      ...this.opciones.map((o, i) => {
        const fila = el('div', 'menu-op');
        fila.setAttribute('role', 'menuitem');
        fila.classList.toggle('elegido', i === this.eleccion);
        fila.classList.toggle('apagado', !o.activa);
        fila.append(el('b', undefined, o.texto));
        // En la tienda no hay panel: la descripción va en la opción elegida.
        if (tienda && o.detalle && i === this.eleccion) fila.append(el('small', undefined, o.detalle));
        return fila;
      }),
    );
    if (!tienda) this.pintarDetalle();
  }

  /** Lo de la izquierda, según la pantalla y la opción elegida. */
  private pintarDetalle(): void {
    const o = this.opciones[this.eleccion];
    const equipo = this.partida.equipo;
    const hijos: HTMLElement[] = [];
    switch (this.pantalla) {
      case 'principal':
        hijos.push(this.resumen());
        if (o?.detalle) hijos.push(el('p', 'menu-ayuda', o.detalle));
        break;
      case 'equipo':
      case 'objetivo':
        if (typeof o?.dato === 'number' && equipo[o.dato]) hijos.push(this.ficha(equipo[o.dato], o.dato === 0));
        break;
      case 'mochila':
        if (typeof o?.dato === 'string') {
          const obj = DATOS.objetos[o.dato];
          const caja = el('div', 'menu-ficha');
          caja.append(el('h2', undefined, obj.nombre), el('p', 'menu-ayuda', obj.descripcion), el('p', 'menu-dato', `Tienes ${this.partida.mochila[o.dato] ?? 0}.${o.activa ? '' : ' Ahora no hace falta.'}`));
          hijos.push(caja);
        }
        hijos.push(el('p', 'menu-dato', `Dinero: ${this.partida.dinero}`));
        break;
      case 'medallero':
        hijos.push(this.medallero(typeof o?.dato === 'number' ? o.dato : 1));
        break;
      case 'mapa':
        hijos.push(el('h2', 'menu-encabezado', 'Lanzarote'));
        break;
      case 'nueva':
        hijos.push(el('h2', 'menu-encabezado', '¿Empezar una partida nueva?'), el('p', 'menu-ayuda', 'Se borra la partida de este navegador. Si quieres guardarla, expórtala antes desde Opciones.'));
        break;
      default:
        hijos.push(el('h2', 'menu-encabezado', this.titulo.textContent ?? ''));
        if (o?.detalle) hijos.push(el('p', 'menu-ayuda', o.detalle));
    }
    this.contenido.replaceChildren(...hijos);
  }

  /** El equipo en seis huecos, el dinero y las medallas: lo que se ve al abrir el menú. */
  private resumen(): HTMLElement {
    const caja = el('div', 'menu-resumen');
    caja.append(el('h2', 'menu-encabezado', this.partida.nombre));
    const huecos = el('div', 'menu-huecos');
    for (let i = 0; i < 6; i++) {
      const c = this.partida.equipo[i];
      const hueco = el('div', c ? 'menu-hueco' : 'menu-hueco vacio');
      if (c) {
        const tipo = DATOS.especies[c.especie].tipos[0];
        const punto = el('i', 'menu-punto');
        punto.style.background = css(TIPO.get(tipo)?.color ?? 0xa8a29e);
        const max = vidaMaxima(c, DATOS);
        hueco.append(punto, el('b', undefined, nombreDe(c, DATOS)), el('small', undefined, `Nv. ${c.nivel}`), barraVida(c.vida, max));
      }
      huecos.append(hueco);
    }
    const cifras = el('div', 'menu-cifras');
    cifras.append(el('span', undefined, `Dinero ${this.partida.dinero}`));
    const tira = el('span', 'menu-tira');
    const ganadas = new Set(medallasGanadas(this.partida.estado.condiciones).map((m) => m.isla));
    tira.innerHTML = MEDALLAS.map((m) => svgPintadera(m.isla, ganadas.has(m.isla))).join('');
    cifras.append(tira);
    caja.append(huecos, cifras);
    return caja;
  }

  /** La ficha de una criatura: tipos, vida y movimientos. */
  private ficha(c: Criatura, primera: boolean): HTMLElement {
    const caja = el('div', 'menu-ficha');
    const max = vidaMaxima(c, DATOS);
    const cabeza = el('div', 'menu-cabeza');
    cabeza.append(el('h2', undefined, nombreDe(c, DATOS)), el('span', 'menu-nivel', `Nv. ${c.nivel}`));
    caja.append(cabeza, chipsTipo(DATOS.especies[c.especie].tipos));
    const vida = el('div', 'menu-vida-grande');
    vida.append(barraVida(c.vida, max), el('small', undefined, `Vida ${c.vida} / ${max}${primera ? ' · sale la primera' : ''}`));
    caja.append(vida);
    const movs = el('ul', 'menu-movs');
    for (const m of c.movimientos) {
      const def = DATOS.movimientos[m.id];
      const li = el('li');
      const chip = el('i', undefined, TIPO.get(def.tipo)?.nombre ?? 'Común');
      chip.style.background = css(TIPO.get(def.tipo)?.color ?? 0xa8a29e);
      li.append(el('b', undefined, def.nombre), chip, el('small', undefined, `PP ${m.pp}/${def.pp}`));
      movs.append(li);
    }
    caja.append(movs);
    return caja;
  }

  /** Las pintaderas de todas las islas; la elegida, más grande y con su explicación. */
  private medallero(elegida: number): HTMLElement {
    const caja = el('div', 'menu-medallero');
    const ganadas = new Set(medallasGanadas(this.partida.estado.condiciones).map((m) => m.isla));
    const rejilla = el('div', 'menu-medallas');
    for (const m of MEDALLAS) {
      const fig = el('figure', m.isla === elegida ? 'elegida' : undefined);
      fig.innerHTML = svgPintadera(m.isla, ganadas.has(m.isla));
      fig.append(el('figcaption', undefined, m.nombre));
      rejilla.append(fig);
    }
    const m = MEDALLAS.find((x) => x.isla === elegida)!;
    const estado = ganadas.has(m.isla)
      ? `Ganada al vencer al gimnasio de ${m.gimnasio}.`
      : m.condicion
        ? `Por conseguir: vence al gimnasio de ${m.gimnasio ?? 'la isla'}.`
        : 'Aún no se puede llegar a esta isla.';
    caja.append(el('h2', 'menu-encabezado', `Medallero · ${ganadas.size} de ${MEDALLAS.length}`), rejilla, el('p', 'menu-ayuda', `Pintadera de ${m.nombre}. ${estado}`));
    return caja;
  }

  private pintarMapa(): void {
    this.plano ??= planoIsla(this.partida.mundo);
    const p = this.plano;
    // El mapa ocupa el panel de la izquierda, sin meterse bajo la columna de opciones.
    const ancho = Math.max(200, window.innerWidth - 340 - 48 - 120);
    const alto = Math.max(200, window.innerHeight - 160);
    const px = Math.max(2, Math.floor(Math.min(alto / p.alto, ancho / p.ancho)));
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
    let confirmar = this.entrada.consumir('confirmar');
    const cancelar = this.entrada.consumir('cancelar');
    const dir = this.entrada.pulsacion();
    if (this.espera > 0) {
      this.espera--;
      confirmar = false;
    }
    if (dir === 'n' || dir === 's') {
      const n = this.eleccion + (dir === 's' ? 1 : -1);
      if (n >= 0 && n < this.opciones.length && n !== this.eleccion) {
        this.eleccion = n;
        this.ctx.eventos.emit('sonido:tocar', { nombre: 'seleccion' });
      }
      this.pintar();
    }
    if (cancelar) {
      this.ctx.eventos.emit('sonido:tocar', { nombre: 'atras' });
      const atras = ATRAS[this.pantalla];
      if (atras) this.abrir(atras);
      else this.cerrar();
      return;
    }
    if (!confirmar) return;
    const o = this.opciones[this.eleccion];
    if (!o?.activa) return;
    // Al probar sonidos, solo suena el elegido; en el medallero, elegir no hace nada.
    if (this.pantalla !== 'sonidos' && this.pantalla !== 'medallero') this.ctx.eventos.emit('sonido:tocar', { nombre: 'confirmar' });
    o.elegir();
  }

  dispose(): void {
    for (const q of this.quitar) q();
    this.raiz.remove();
  }
}
