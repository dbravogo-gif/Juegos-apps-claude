import Phaser from 'phaser';
import { DATOS } from '../data';
import { crearRng } from '../core/rng';
import { crearCriatura, nombreDe } from '../core/criatura';
import { calcularEstadisticas } from '../core/estadisticas';
import { aprenderMovimiento, evolucionar, evolucionPendiente, expParaNivel } from '../core/progreso';
import type { Criatura, Movimiento } from '../core/modelo';
import { eficacia } from '../core/tipos';
import {
  accionesDisponibles,
  activoDe,
  iniciarCombate,
  resolverTurno,
  type Accion,
  type EstadoCombate,
  type Evento,
  type FichaCombate,
  type Lado,
  type ResultadoCombate,
} from '../core/combate';
import { Barra, Boton, filaTipos, panel } from '../ui/componentes';
import { crearCriaturaVisual } from '../ui/criaturaVisual';
import { describirMovimiento, textosEvento, type ContextoTextos } from '../ui/textos';
import { aclarar, ANCHO, COLOR, estiloTexto } from '../ui/tema';
import type { ConfigLaboratorio } from './Laboratorio';

const OBJETOS_INICIALES = { tesera: 5, unguento: 3 };

export interface ResultadoHistoria {
  resultado: ResultadoCombate;
  equipo: Criatura[];
  objetos: Record<string, number>;
  capturada: Criatura | null;
  /** Especies rivales que han salido: van al Bestiario como vistas. */
  rivales: string[];
}

export type DatosCombate =
  | { modo: 'laboratorio'; config: ConfigLaboratorio; semilla: number }
  | {
      modo: 'historia';
      semilla: number;
      equipo: Criatura[];
      objetos: Record<string, number>;
      rival: Criatura[];
      salvaje: boolean;
      nombreRival: string;
      alTerminar: (r: ResultadoHistoria) => void;
    };

const POSICION: Record<Lado, { x: number; y: number; tam: number }> = {
  rival: { x: 770, y: 370, tam: 330 },
  jugador: { x: 290, y: 770, tam: 390 },
};

/** Recuadro con nombre, nivel, tipos y Vida de una criatura en el campo. */
class Ficha {
  private capa: Phaser.GameObjects.Container;
  private nombre: Phaser.GameObjects.Text;
  private nivel: Phaser.GameObjects.Text;
  private estado: Phaser.GameObjects.Text;
  private tipos: Phaser.GameObjects.Container;
  private barra: Barra;
  private numeros?: Phaser.GameObjects.Text;
  private barraExp?: Barra;

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    ancho: number,
    esJugador: boolean,
  ) {
    const alto = esJugador ? 270 : 220;
    this.capa = scene.add.container(x, y);
    this.capa.add(panel(scene, 0, 0, ancho, alto));
    this.nombre = scene.add.text(30, 48, '', estiloTexto(44, COLOR.tinta, true)).setOrigin(0, 0.5);
    this.nivel = scene.add.text(ancho - 30, 48, '', estiloTexto(38, COLOR.tinta, true)).setOrigin(1, 0.5);
    this.tipos = scene.add.container(0, 0);
    this.estado = scene.add.text(ancho - 30, 108, '', estiloTexto(28, COLOR.pergamino, true)).setOrigin(1, 0.5);
    this.estado.setBackgroundColor('#9f1d20').setPadding(10, 4, 10, 4);
    const etiqueta = scene.add.text(30, 166, 'Vida', estiloTexto(30, COLOR.tintaSuave, true)).setOrigin(0, 0.5);
    this.barra = new Barra(scene, 110, 166, ancho - 140, 30, true);
    this.capa.add([this.nombre, this.nivel, this.tipos, this.estado, etiqueta, this.barra]);
    if (esJugador) {
      this.numeros = scene.add.text(ancho - 30, 212, '', estiloTexto(34, COLOR.tinta, true)).setOrigin(1, 0.5);
      const etExp = scene.add.text(30, 246, 'Exp', estiloTexto(24, COLOR.tintaSuave, true)).setOrigin(0, 0.5);
      this.barraExp = new Barra(scene, 110, 246, ancho - 140, 14, false);
      this.capa.add([this.numeros, etExp, this.barraExp]);
    }
  }

  mostrar(ficha: FichaCombate): void {
    this.nombre.setText(ficha.nombre);
    this.nivel.setText(`Nv ${ficha.nivel}`);
    this.tipos.removeAll(true);
    filaTipos(this.scene, this.tipos, 30, 108, DATOS.especies[ficha.especie].tipos, 26);
    this.setEstado(ficha.estado);
    void this.setVida(ficha.vida, ficha.vidaMax, false);
    this.capa.setVisible(true);
  }

  setNivel(nivel: number): void {
    this.nivel.setText(`Nv ${nivel}`);
  }

  setEstado(estado: string | null): void {
    const texto = estado === 'quemado' ? 'QUEMADO' : estado === 'dormido' ? 'DORMIDO' : '';
    this.estado.setText(texto).setVisible(texto !== '');
  }

  setVida(vida: number, max: number, animar: boolean): Promise<void> {
    this.numeros?.setText(`${vida} / ${max}`);
    return this.barra.setFraccion(vida / max, animar);
  }

  setExp(fraccion: number): void {
    void this.barraExp?.setFraccion(fraccion, false);
  }

  ocultar(): void {
    this.capa.setVisible(false);
  }
}

export class Combate extends Phaser.Scene {
  private entrada!: DatosCombate;
  private rivalesVistos = new Set<string>();
  private pendientesAprender: { indice: number; movimientoId: string }[] = [];

  private estado!: EstadoCombate;
  private ctx!: ContextoTextos;
  private visual: Record<Lado, Phaser.GameObjects.Container | null> = { jugador: null, rival: null };
  private ficha!: Record<Lado, Ficha>;
  private activoVisual: Record<Lado, number> = { jugador: 0, rival: 0 };
  private texto!: Phaser.GameObjects.Text;
  private info!: Phaser.GameObjects.Text;
  private menu?: Phaser.GameObjects.Container;
  private saltar: (() => void) | null = null;
  private ocupado = false;

  constructor() {
    super('Combate');
  }

  init(data: DatosCombate): void {
    this.entrada = data;
    this.rivalesVistos = new Set();
    this.pendientesAprender = [];
    this.visual = { jugador: null, rival: null };
    this.menu = undefined;
    this.saltar = null;
    this.ocupado = false;
  }

  create(): void {
    const { semilla } = this.entrada;
    this.cameras.main.setBackgroundColor(COLOR.fondo);

    // Campo de batalla.
    this.add.rectangle(0, 0, ANCHO, 990, COLOR.cielo).setOrigin(0, 0);
    this.add.rectangle(0, 560, ANCHO, 430, aclarar(COLOR.suelo, 0.35)).setOrigin(0, 0);
    this.add.ellipse(POSICION.rival.x, POSICION.rival.y + 150, 440, 110, COLOR.suelo);
    this.add.ellipse(POSICION.jugador.x, POSICION.jugador.y + 175, 500, 120, COLOR.suelo);

    this.ficha = {
      rival: new Ficha(this, 30, 40, 560, false),
      jugador: new Ficha(this, 510, 620, 540, true),
    };
    this.ficha.rival.ocultar();
    this.ficha.jugador.ocultar();

    panel(this, 30, 1010, ANCHO - 60, 240);
    this.texto = this.add.text(70, 1045, '', {
      ...estiloTexto(44, COLOR.tinta),
      wordWrap: { width: ANCHO - 140 },
      lineSpacing: 10,
    });
    this.info = this.add
      .text(70, 1035, '', { ...estiloTexto(33, COLOR.tinta), wordWrap: { width: ANCHO - 140 }, lineSpacing: 6 })
      .setVisible(false);

    this.add
      .text(ANCHO - 40, 1900, `Semilla ${semilla}`, estiloTexto(24, COLOR.tintaSuave))
      .setOrigin(1, 1);


    // Tocar la pantalla adelanta el texto.
    this.input.on('pointerdown', () => this.saltar?.());

    let equipoJugador: Criatura[];
    let equipoRival: Criatura[];
    let objetos: Record<string, number>;
    let salvaje: boolean;
    let nombreRival: string;
    if (this.entrada.modo === 'laboratorio') {
      const { config } = this.entrada;
      const rng = crearRng(`${semilla}:criaturas`);
      equipoJugador = config.jugador.map((id) => crearCriatura(DATOS, id, config.nivelJugador, rng));
      equipoRival = config.rival.map((id) => crearCriatura(DATOS, id, config.nivelRival, rng));
      objetos = { ...OBJETOS_INICIALES };
      salvaje = config.salvaje;
      nombreRival = salvaje ? 'Salvaje' : 'El ballestero';
    } else {
      equipoJugador = this.entrada.equipo;
      equipoRival = this.entrada.rival;
      objetos = this.entrada.objetos;
      salvaje = this.entrada.salvaje;
      nombreRival = this.entrada.nombreRival;
    }
    const inicio = iniciarCombate(
      {
        semilla,
        jugador: { nombre: 'Tú', equipo: equipoJugador, objetos },
        rival: { nombre: nombreRival, equipo: equipoRival },
        salvaje,
      },
      DATOS,
    );
    this.estado = inicio.estado;
    this.ctx = { salvaje, nombreRival };
    void this.reproducir(inicio.eventos);
  }

  // ---------- Reproducción de eventos ----------

  private esperar(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timer = this.time.delayedCall(ms, () => {
        this.saltar = null;
        resolve();
      });
      this.saltar = () => {
        timer.remove(false);
        this.saltar = null;
        resolve();
      };
    });
  }

  private tween(config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({ ...config, onComplete: () => resolve() });
    });
  }

  private async decir(texto: string, ms = 1100): Promise<void> {
    this.texto.setText(texto);
    await this.esperar(ms);
  }

  private async reproducir(eventos: Evento[]): Promise<void> {
    this.ocupado = true;
    this.limpiarMenu();
    for (const ev of eventos) await this.reproducirEvento(ev);
    this.ocupado = false;
    this.refrescarFichas();
    if (this.estado.fin) await this.terminar();
    else if (this.estado.pendiente === 'reemplazo') this.menuEquipo('reemplazo');
    else this.menuPrincipal();
  }

  private async reproducirEvento(ev: Evento): Promise<void> {
    const frases = textosEvento(ev, this.ctx);
    if (ev.tipo === 'entrada' && ev.lado === 'rival') this.rivalesVistos.add(ev.ficha.especie);
    if (ev.tipo === 'noAprende') this.pendientesAprender.push({ indice: ev.indice, movimientoId: ev.movimientoId });
    switch (ev.tipo) {
      case 'entrada':
        await this.mostrarEntrada(ev.lado, ev.indice, ev.ficha);
        break;
      case 'retirada':
        await this.decir(frases[0], 700);
        await this.retirar(ev.lado);
        return;
      case 'usa':
        this.texto.setText(frases[0]);
        await this.embestida(ev.lado);
        await this.esperar(500);
        return;
      case 'danio':
        if (ev.causa === 'ataque') await this.parpadeo(ev.lado);
        await this.ficha[ev.lado].setVida(ev.vida, ev.vidaMax, true);
        if (ev.causa !== 'ataque') await this.decir(frases[0]);
        else for (const f of frases) await this.decir(f, 900);
        return;
      case 'curacion':
        if (ev.indice === this.activoVisual[ev.lado]) await this.ficha[ev.lado].setVida(ev.vida, ev.vidaMax, true);
        break;
      case 'estado':
        this.ficha[ev.lado].setEstado(ev.estado);
        break;
      case 'despierta':
        this.ficha[ev.lado].setEstado(null);
        break;
      case 'debilitado':
        this.ficha[ev.lado].setEstado(null);
        await this.caer(ev.lado);
        break;
      case 'nivel':
        this.ficha.jugador.setNivel(ev.nivel);
        await this.ficha.jugador.setVida(ev.vida, ev.vidaMax, true);
        break;
      case 'captura':
        await this.animarCaptura(ev.sacudidas, ev.exito);
        break;
    }
    for (const f of frases) await this.decir(f);
  }

  private async mostrarEntrada(lado: Lado, indice: number, ficha: FichaCombate): Promise<void> {
    this.visual[lado]?.destroy();
    this.activoVisual[lado] = indice;
    const p = POSICION[lado];
    const v = crearCriaturaVisual(this, ficha.especie, p.x, p.y, p.tam, lado === 'jugador');
    this.visual[lado] = v;
    this.ficha[lado].mostrar(ficha);
    v.setScale(0.2).setAlpha(0);
    await this.tween({ targets: v, scale: 1, alpha: 1, duration: 350, ease: 'Back.easeOut' });
  }

  private async retirar(lado: Lado): Promise<void> {
    const v = this.visual[lado];
    if (!v) return;
    await this.tween({ targets: v, scale: 0.2, alpha: 0, duration: 250 });
    v.destroy();
    this.visual[lado] = null;
    this.ficha[lado].ocultar();
  }

  private async embestida(lado: Lado): Promise<void> {
    const v = this.visual[lado];
    if (!v) return;
    const dx = lado === 'jugador' ? 50 : -50;
    const dy = lado === 'jugador' ? -30 : 30;
    await this.tween({ targets: v, x: v.x + dx, y: v.y + dy, duration: 110, yoyo: true, ease: 'Quad.easeOut' });
  }

  private async parpadeo(lado: Lado): Promise<void> {
    const v = this.visual[lado];
    if (!v) return;
    await this.tween({ targets: v, alpha: 0.15, duration: 70, yoyo: true, repeat: 2 });
    v.setAlpha(1);
  }

  private async caer(lado: Lado): Promise<void> {
    const v = this.visual[lado];
    if (!v) return;
    await this.tween({ targets: v, y: v.y + 120, alpha: 0, duration: 450, ease: 'Quad.easeIn' });
    v.destroy();
    this.visual[lado] = null;
    this.ficha[lado].ocultar();
  }

  private async animarCaptura(sacudidas: number, exito: boolean): Promise<void> {
    const presa = this.visual.rival;
    const t = this.add.rectangle(POSICION.jugador.x, POSICION.jugador.y, 70, 90, COLOR.bronce).setRounded(14).setStrokeStyle(5, COLOR.tinta);
    await this.tween({ targets: t, x: POSICION.rival.x, y: POSICION.rival.y + 60, angle: 360, duration: 500, ease: 'Quad.easeOut' });
    if (presa) await this.tween({ targets: presa, scale: 0.05, alpha: 0, duration: 250 });
    for (let i = 0; i < sacudidas; i++) {
      await this.esperar(300);
      await this.tween({ targets: t, angle: 20, duration: 110, yoyo: true });
    }
    await this.esperar(300);
    if (exito) {
      t.setFillStyle(COLOR.oro);
      return;
    }
    t.destroy();
    if (presa) await this.tween({ targets: presa, scale: 1, alpha: 1, duration: 250, ease: 'Back.easeOut' });
  }

  private refrescarFichas(): void {
    for (const lado of ['jugador', 'rival'] as Lado[]) {
      const c = activoDe(this.estado, lado);
      if (c.vida <= 0 || this.visual[lado] === null) continue;
      const max = calcularEstadisticas(c, DATOS).vida;
      void this.ficha[lado].setVida(c.vida, max, false);
      this.ficha[lado].setNivel(c.nivel);
      this.ficha[lado].setEstado(c.estado?.tipo ?? null);
    }
    const j = activoDe(this.estado, 'jugador');
    const desde = expParaNivel(j.nivel);
    const hasta = expParaNivel(j.nivel + 1);
    this.ficha.jugador.setExp((j.exp - desde) / Math.max(1, hasta - desde));
  }

  // ---------- Menús ----------

  private limpiarMenu(): void {
    this.menu?.destroy();
    this.menu = undefined;
  }

  private nuevoMenu(): Phaser.GameObjects.Container {
    this.limpiarMenu();
    this.menu = this.add.container(0, 0);
    return this.menu;
  }

  private menuPrincipal(): void {
    const menu = this.nuevoMenu();
    const yo = activoDe(this.estado, 'jugador');
    const rival = activoDe(this.estado, 'rival');
    const disp = accionesDisponibles(this.estado, DATOS);
    this.texto.setText(`¿Qué hará ${nombreDe(yo, DATOS)}?`);
    menu.add(
      this.add
        .text(ANCHO / 2, 1268, 'Mantén pulsado un movimiento para ver qué hace', estiloTexto(26, COLOR.pergaminoOscuro))
        .setOrigin(0.5, 0.5),
    );

    yo.movimientos.forEach((m, i) => {
      const mov = DATOS.movimientos[m.id];
      const tipo = DATOS.tipos.tipos.find((t) => t.id === mov.tipo);
      const x = i % 2 === 0 ? 280 : 800;
      const y = i < 2 ? 1370 : 1555;
      const b = new Boton(this, x, y, {
        ancho: 500,
        alto: 170,
        texto: mov.nombre,
        subtexto: `${tipo?.nombre ?? ''} · PP ${m.pp}/${mov.pp}`,
        color: aclarar(tipo?.color ?? COLOR.pergaminoOscuro, 0.35),
        tamano: 42,
        alPulsar: () => void this.ejecutar({ tipo: 'movimiento', indice: i }),
        alMantener: () => this.mostrarInfo(mov, m.pp),
        alSoltar: () => this.ocultarInfo(),
      }).setActivo(disp.movimientos[i] || disp.sinPP);
      menu.add(b);
      if (mov.categoria !== 'estado') {
        const ef = eficacia(DATOS.tipos, mov.tipo, DATOS.especies[rival.especie].tipos);
        if (ef !== 1) {
          const marca = ef === 0 ? '×0' : ef < 1 ? `×${ef === 0.25 ? '¼' : '½'}` : `×${ef}`;
          const color = ef > 1 ? COLOR.vidaAlta : COLOR.vidaBaja;
          const t = this.add.text(x + 215, y - 60, marca, estiloTexto(30, COLOR.pergamino, true)).setOrigin(1, 0.5);
          t.setBackgroundColor(`#${color.toString(16).padStart(6, '0')}`).setPadding(8, 2, 8, 2);
          menu.add(t);
        }
      }
    });

    menu.add(
      new Boton(this, 190, 1765, { ancho: 320, alto: 140, texto: 'Mochila', alPulsar: () => this.menuMochila() }).setActivo(
        Object.values(disp.objetos).some(Boolean),
      ),
    );
    menu.add(
      new Boton(this, 540, 1765, { ancho: 320, alto: 140, texto: 'Equipo', alPulsar: () => this.menuEquipo('cambio') }).setActivo(
        disp.cambios.some(Boolean),
      ),
    );
    menu.add(
      new Boton(this, 890, 1765, { ancho: 320, alto: 140, texto: 'Huir', alPulsar: () => void this.ejecutar({ tipo: 'huir' }) }).setActivo(
        disp.huir,
      ),
    );
  }

  private menuMochila(): void {
    const menu = this.nuevoMenu();
    const disp = accionesDisponibles(this.estado, DATOS);
    this.texto.setText('¿Qué objeto usas?');
    const objetos = Object.entries(this.estado.jugador.objetos).filter(
      ([id, n]) => n > 0 && DATOS.objetos[id] && DATOS.objetos[id].tipo !== 'clave',
    );
    objetos.forEach(([id, n], i) => {
      const obj = DATOS.objetos[id];
      const b = new Boton(this, ANCHO / 2, 1360 + i * 190, {
        ancho: 1000,
        alto: 170,
        texto: `${obj.nombre} ×${n}`,
        subtexto: obj.descripcion.length > 60 ? `${obj.descripcion.slice(0, 57)}…` : obj.descripcion,
        alPulsar: () => {
          if (obj.tipo === 'curar') this.menuEquipo('curar', id);
          else void this.ejecutar({ tipo: 'objeto', objeto: id });
        },
      }).setActivo(Boolean(disp.objetos[id]));
      menu.add(b);
    });
    menu.add(new Boton(this, ANCHO / 2, 1790, { ancho: 400, alto: 120, texto: 'Volver', alPulsar: () => this.menuPrincipal() }));
  }

  private menuEquipo(modo: 'cambio' | 'reemplazo' | 'curar', objeto?: string): void {
    const menu = this.nuevoMenu();
    const equipo = this.estado.jugador.equipo;
    this.texto.setText(
      modo === 'reemplazo' ? '¿Quién sale ahora?' : modo === 'curar' ? '¿A quién aplicas el ungüento?' : '¿A quién sacas?',
    );
    equipo.forEach((c, i) => {
      const max = calcularEstadisticas(c, DATOS).vida;
      const x = i % 2 === 0 ? 280 : 800;
      const y = 1350 + Math.floor(i / 2) * 160;
      const estado = c.vida <= 0 ? ' · debilitado' : c.estado ? ` · ${c.estado.tipo}` : '';
      const valido =
        modo === 'curar' ? c.vida > 0 && c.vida < max : c.vida > 0 && i !== this.estado.jugador.activo;
      const b = new Boton(this, x, y, {
        ancho: 500,
        alto: 145,
        texto: `${nombreDe(c, DATOS)} Nv ${c.nivel}`,
        subtexto: `Vida ${c.vida}/${max}${estado}`,
        tamano: 36,
        alPulsar: () => {
          if (modo === 'curar' && objeto) void this.ejecutar({ tipo: 'objeto', objeto, objetivo: i });
          else if (modo === 'reemplazo') void this.ejecutar({ tipo: 'reemplazo', indice: i });
          else void this.ejecutar({ tipo: 'cambio', indice: i });
        },
      }).setActivo(valido);
      menu.add(b);
    });
    if (modo !== 'reemplazo') {
      menu.add(new Boton(this, ANCHO / 2, 1830, { ancho: 400, alto: 110, texto: 'Volver', alPulsar: () => this.menuPrincipal() }));
    }
  }

  private async ejecutar(accion: Accion): Promise<void> {
    if (this.ocupado) return;
    let r;
    try {
      r = resolverTurno(this.estado, accion, DATOS);
    } catch (err) {
      this.texto.setText(err instanceof Error ? err.message : String(err));
      return;
    }
    this.estado = r.estado;
    await this.reproducir(r.eventos);
  }

  // ---------- Ayuda de movimientos ----------

  private mostrarInfo(mov: Movimiento, pp?: number): void {
    const d = describirMovimiento(mov, pp);
    this.info.setText(`${d.titulo}\n${d.cifras}\n${d.efecto}`).setVisible(true);
    this.texto.setVisible(false);
  }

  private ocultarInfo(): void {
    this.info.setVisible(false);
    this.texto.setVisible(true);
  }

  // ---------- Final ----------

  private async terminar(): Promise<void> {
    this.ocupado = true;
    if (this.estado.fin === 'victoria' || this.estado.fin === 'captura') await this.evoluciones();
    await this.aprenderPendientes();
    this.ocupado = false;
    const textos: Record<string, string> = {
      victoria: '¡Victoria!',
      derrota: 'Derrota…',
      huida: 'Has huido.',
      captura: '¡Captura!',
    };
    this.texto.setText(textos[this.estado.fin ?? ''] ?? '');
    const menu = this.nuevoMenu();
    const entrada = this.entrada;
    if (entrada.modo === 'historia') {
      menu.add(
        new Boton(this, ANCHO / 2, 1500, {
          ancho: 600,
          alto: 170,
          texto: 'Continuar',
          color: COLOR.rojo,
          alPulsar: () =>
            entrada.alTerminar({
              resultado: this.estado.fin ?? 'huida',
              equipo: this.estado.jugador.equipo,
              objetos: this.estado.jugador.objetos,
              capturada: this.estado.capturada,
              rivales: [...this.rivalesVistos],
            }),
        }),
      );
      return;
    }
    const config = entrada.config;
    menu.add(
      new Boton(this, 280, 1500, {
        ancho: 500,
        alto: 170,
        texto: 'Otra vez',
        color: COLOR.rojo,
        alPulsar: () => this.scene.start('Combate', { modo: 'laboratorio', config, semilla: Math.floor(Math.random() * 1e9) }),
      }),
    );
    menu.add(
      new Boton(this, 800, 1500, {
        ancho: 500,
        alto: 170,
        texto: 'Laboratorio',
        alPulsar: () => this.scene.start('Laboratorio'),
      }),
    );
  }

  /** Movimientos que no cabían: el jugador elige cuál olvida, o no aprende el nuevo. */
  private async aprenderPendientes(): Promise<void> {
    for (const { indice, movimientoId } of this.pendientesAprender) {
      const c = this.estado.jugador.equipo[indice];
      if (!c || c.movimientos.some((m) => m.id === movimientoId)) continue;
      const nuevo = DATOS.movimientos[movimientoId];
      const nombre = nombreDe(c, DATOS);
      const eleccion = await new Promise<number>((resolve) => {
        const menu = this.nuevoMenu();
        this.texto.setText(`${nombre} quiere aprender ${nuevo.nombre}. ¿Qué movimiento olvida?`);
        c.movimientos.forEach((m, i) => {
          const mov = DATOS.movimientos[m.id];
          const tipo = DATOS.tipos.tipos.find((t) => t.id === mov.tipo);
          menu.add(
            new Boton(this, i % 2 === 0 ? 280 : 800, i < 2 ? 1370 : 1555, {
              ancho: 500,
              alto: 170,
              texto: mov.nombre,
              subtexto: `${tipo?.nombre ?? ''} · PP ${m.pp}/${mov.pp}`,
              color: aclarar(tipo?.color ?? COLOR.pergaminoOscuro, 0.35),
              tamano: 42,
              alPulsar: () => resolve(i),
              alMantener: () => this.mostrarInfo(mov, m.pp),
              alSoltar: () => this.ocultarInfo(),
            }),
          );
        });
        const tipoNuevo = DATOS.tipos.tipos.find((t) => t.id === nuevo.tipo);
        menu.add(
          new Boton(this, 280, 1765, {
            ancho: 500,
            alto: 140,
            texto: `Ver ${nuevo.nombre}`,
            subtexto: tipoNuevo?.nombre ?? '',
            tamano: 34,
            alPulsar: () => this.mostrarInfo(nuevo),
            alMantener: () => this.mostrarInfo(nuevo),
            alSoltar: () => this.ocultarInfo(),
          }),
        );
        menu.add(new Boton(this, 800, 1765, { ancho: 500, alto: 140, texto: 'No aprenderlo', alPulsar: () => resolve(-1) }));
      });
      this.ocultarInfo();
      this.limpiarMenu();
      if (eleccion < 0) {
        await this.decir(`${nombre} no aprende ${nuevo.nombre}.`);
        continue;
      }
      const olvidado = DATOS.movimientos[c.movimientos[eleccion].id].nombre;
      this.estado.jugador.equipo[indice] = aprenderMovimiento(c, movimientoId, eleccion, DATOS);
      await this.decir(`${nombre} olvida ${olvidado} y aprende ${nuevo.nombre}.`, 1600);
    }
    this.pendientesAprender = [];
  }

  /** Como en Pokémon, las evoluciones se ven al acabar el combate. */
  private async evoluciones(): Promise<void> {
    const equipo = this.estado.jugador.equipo;
    for (let i = 0; i < equipo.length; i++) {
      const c = equipo[i];
      if (c.vida <= 0 || !evolucionPendiente(c, DATOS)) continue;
      const antes = nombreDe(c, DATOS);
      const nueva = evolucionar(c, DATOS);
      equipo[i] = nueva;
      const v = this.visual.jugador;
      if (i === this.estado.jugador.activo && v) {
        await this.decir(`¿Eh? ¡${antes} está evolucionando!`, 900);
        await this.tween({ targets: v, alpha: 0.1, duration: 160, yoyo: true, repeat: 5 });
        v.destroy();
        const p = POSICION.jugador;
        this.visual.jugador = crearCriaturaVisual(this, nueva.especie, p.x, p.y, p.tam, true);
      }
      await this.decir(`¡${antes} se ha convertido en ${DATOS.especies[nueva.especie].nombre}!`, 1600);
    }
  }
}
