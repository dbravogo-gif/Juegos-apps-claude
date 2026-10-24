import Phaser from 'phaser';
import { DATOS } from '../data';
import { ASPECTO_JUGADOR } from '../data/aspectos';
import { CASILLAS, ENTRENADORES, ZONAS } from '../data/mundo';
import { crearCriatura, nombreDe } from '../core/criatura';
import type { Criatura } from '../core/modelo';
import type { ResultadoCombate } from '../core/combate';
import {
  DELTA,
  enLineaDeVision,
  esHierba,
  esSolida,
  OPUESTA,
  type DefEntrenador,
  type Dir,
  type Paso,
  type Pnj,
  type Salida,
  type Zona,
} from '../core/mundo';
import {
  anadirCriatura,
  aplicarCombate,
  curarEquipo,
  darObjeto,
  equipoEnPie,
  equipoEntrenador,
  pasoRepelente,
  repelida,
  semillaCombate,
  tirarEncuentro,
  type Partida,
  type Posicion,
} from '../core/partida';
import { abrirRecipiente, dibujarRecipiente, dibujarZona, ESCALA, TAM_CASILLA } from '../ui/casillasVisual';
import { registrarRecipiente, revisado } from '../core/recipientes';
import { OBJETOS_RECIPIENTE, PROB_RECIPIENTE, RECOMPENSA_MIMICO } from '../data/recipientes';
import { Persona } from '../ui/personaVisual';
import { guardarPartida, sesion } from '../ui/sesion';
import { conArticulo } from '../ui/textos';
import { ANCHO, COLOR, estiloTexto } from '../ui/tema';
import { ALTO_MAPA, MONEDA, type Interfaz } from './Interfaz';
import type { ResultadoHistoria } from './Combate';

// El mapa del modo historia: dibuja la zona, mueve al jugador por casillas y ejecuta los
// guiones de los personajes. Las reglas viven en src/core; aquí solo hay presentación y orden.

const T = TAM_CASILLA;
const MS_PASO = 170;

interface PersonaEnMapa {
  pnj: Pnj;
  figura: Persona;
  x: number;
  y: number;
}

export class Mundo extends Phaser.Scene {
  private ui!: Interfaz;
  private zona!: Zona;
  private capa?: Phaser.GameObjects.Container;
  private jugador!: Persona;
  private personas: PersonaEnMapa[] = [];
  private recipientes: { def: NonNullable<Zona['recipientes']>[number]; figura: Phaser.GameObjects.Image }[] = [];
  private moviendo = false;
  private ocupado = false;
  /** Dinero perdido en la última derrota, para contarlo al volver al mesón. */
  private perdido = 0;
  /** El último Papemímico ha soltado su premio (para contarlo al volver del combate). */
  private premioMimico = false;
  /** Objetos regalados por el último entrenador vencido. */
  private regalos: Record<string, number> = {};
  /** A pulsado a mitad de un paso: se atiende al llegar. */
  private aPendiente = false;
  private listo = false;

  constructor() {
    super('Mundo');
  }

  private get p(): Partida {
    if (!sesion.partida) throw new Error('No hay partida en curso');
    return sesion.partida;
  }

  create(): void {
    this.listo = false;
    this.moviendo = false;
    this.ocupado = false;
    this.aPendiente = false;
    this.cameras.main.setViewport(0, 0, ANCHO, ALTO_MAPA);
    this.scene.launch('Interfaz');
    this.ui = this.scene.get('Interfaz') as Interfaz;
    this.ui.events.once(Phaser.Scenes.Events.CREATE, () => void this.empezar());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.ui.events.off('a', this.alPulsarA, this);
      this.ui.events.off('menu', this.alPulsarMenu, this);
    });
  }

  private async empezar(): Promise<void> {
    this.ui.events.on('a', this.alPulsarA, this);
    this.ui.events.on('menu', this.alPulsarMenu, this);
    this.cargarZona(this.p.posicion);
    this.listo = true;
    await this.conBloqueo(() => this.alEntrarZona());
  }

  update(): void {
    if (!this.listo || this.moviendo) return;
    const dir = this.ocupado || this.ui.ocupado ? null : this.ui.direccion();
    if (dir) this.intentarMover(dir);
    else this.jugador?.parar();
  }

  /** Ejecuta algo con el mapa bloqueado (sin moverse ni abrir menús). */
  private async conBloqueo<T>(f: () => Promise<T>): Promise<T> {
    this.ocupado = true;
    try {
      return await f();
    } finally {
      this.ocupado = false;
    }
  }

  // ---------- Dibujo de la zona ----------

  private cargarZona(pos: Posicion): void {
    this.capa?.destroy();
    this.personas = [];
    const zona = ZONAS[pos.zona];
    this.zona = zona;
    const capa = this.add.container(0, 0);
    this.capa = capa;
    dibujarZona(this, zona, capa);
    for (const cartel of zona.carteles) capa.add(this.dibujarCartel(cartel.x, cartel.y));
    this.recipientes = [];
    for (const r of zona.recipientes ?? []) {
      const abierto = revisado(this.p, zona.id, r.id);
      const figura = dibujarRecipiente(this, r.x * T + T / 2, (r.y + 1) * T, abierto).setDepth(r.y + 0.4);
      figura.setInteractive({ useHandCursor: true }).on('pointerup', () => this.tocarRecipiente(r));
      capa.add(figura);
      this.recipientes.push({ def: r, figura });
    }

    for (const pnj of zona.pnj) {
      if (!this.pnjVisible(pnj)) continue;
      const figura = new Persona(this, pnj.x * T + T / 2, pnj.y * T + T / 2, pnj.aspecto, pnj.dir);
      capa.add(figura);
      this.personas.push({ pnj, figura, x: pnj.x, y: pnj.y });
    }
    this.jugador = new Persona(this, pos.x * T + T / 2, pos.y * T + T / 2, ASPECTO_JUGADOR, pos.dir);
    capa.add(this.jugador);
    this.ordenarProfundidad();

    const cam = this.cameras.main;
    cam.setBackgroundColor(zona.interior ? COLOR.fondo : 0x2f4a2a);
    const w = zona.mapa[0].length * T;
    const h = zona.mapa.length * T;
    cam.stopFollow();
    cam.setRoundPixels(true);
    cam.setBounds(Math.min(0, (w - ANCHO) / 2), Math.min(0, (h - ALTO_MAPA) / 2), Math.max(w, ANCHO), Math.max(h, ALTO_MAPA));
    cam.startFollow(this.jugador, true);
  }

  private dibujarCartel(x: number, y: number): Phaser.GameObjects.Container {
    const g = this.add.graphics();
    g.fillStyle(0x5c3a1a, 1);
    g.fillRect(-5, -6, 10, 34);
    g.fillStyle(0x8b5a2b, 1);
    g.fillRoundedRect(-28, -30, 56, 34, 6);
    g.lineStyle(3, 0x3a2410, 1);
    g.strokeRoundedRect(-28, -30, 56, 34, 6);
    return this.add.container(x * T + T / 2, y * T + T / 2, [g]);
  }

  private ordenarProfundidad(): void {
    for (const pe of this.personas) pe.figura.setDepth(pe.y);
    this.jugador.setDepth(this.p.posicion.y + 0.5);
    this.capa?.sort('depth');
  }

  private pnjVisible(pnj: Pnj): boolean {
    const b = this.p.banderas;
    if (pnj.visibleSi && !b[pnj.visibleSi]) return false;
    if (pnj.ocultoSi && b[pnj.ocultoSi]) return false;
    return true;
  }

  /** Quita o añade personajes según las banderas, sin recargar la zona. */
  private refrescarPersonajes(): void {
    for (const pe of [...this.personas]) {
      if (!this.pnjVisible(pe.pnj)) {
        pe.figura.destroy();
        this.personas = this.personas.filter((x) => x !== pe);
      }
    }
  }

  // ---------- Movimiento ----------

  private ocupadaPorAlguien(x: number, y: number): boolean {
    return (
      this.personas.some((pe) => pe.x === x && pe.y === y) ||
      this.zona.carteles.some((c) => c.x === x && c.y === y) ||
      (this.zona.recipientes ?? []).some((r) => r.x === x && r.y === y)
    );
  }

  private intentarMover(dir: Dir): void {
    const pos = this.p.posicion;
    if (this.jugador.dir !== dir) this.jugador.setDir(dir);
    pos.dir = dir;
    const [dx, dy] = DELTA[dir];
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (esSolida(this.zona, nx, ny, CASILLAS) || this.ocupadaPorAlguien(nx, ny)) {
      this.jugador.parar();
      return;
    }
    this.moviendo = true;
    this.jugador.andar(dir);
    pos.x = nx;
    pos.y = ny;
    this.ordenarProfundidad();
    this.tweens.add({
      targets: this.jugador,
      x: nx * T + T / 2,
      y: ny * T + T / 2,
      duration: MS_PASO,
      onComplete: () => {
        this.moviendo = false;
        void this.alLlegar().then(() => {
          if (this.aPendiente) {
            this.aPendiente = false;
            this.alPulsarA();
          }
        });
      },
    });
  }

  private async alLlegar(): Promise<void> {
    const p = this.p;
    p.pasos += 1;
    const salida = this.zona.salidas.find((s) => s.x === p.posicion.x && s.y === p.posicion.y);
    if (salida) {
      await this.conBloqueo(() => this.cambiarZona(salida));
      return;
    }
    if (pasoRepelente(p)) await this.conBloqueo(async () => {
      await this.ui.decir('El repelente ha dejado de hacer efecto.');
      this.ui.cerrarDialogo();
    });
    if (await this.comprobarEntrenadores()) return;
    if (this.zona.encuentros && esHierba(this.zona, p.posicion.x, p.posicion.y, CASILLAS) && equipoEnPie(p)) {
      const salvaje = tirarEncuentro(p, this.zona.encuentros, DATOS);
      if (salvaje && !repelida(p, salvaje)) await this.conBloqueo(() => this.combateSalvaje(salvaje));
    }
  }

  private async cambiarZona(s: Salida): Promise<void> {
    const cam = this.cameras.main;
    cam.fadeOut(180, 0, 0, 0);
    await this.esperar(200);
    this.p.posicion = { zona: s.zona, x: s.ax, y: s.ay, dir: s.dir };
    this.cargarZona(this.p.posicion);
    cam.fadeIn(180, 0, 0, 0);
    guardarPartida(this.p);
    this.ui.aviso(this.zona.nombre);
    await this.alEntrarZona();
  }

  private async alEntrarZona(): Promise<void> {
    const z = this.zona;
    const clave = `visto:${z.id}`;
    if (z.alEntrar && !this.p.banderas[clave]) {
      this.p.banderas[clave] = true;
      await this.ejecutarGuion(z.alEntrar);
    }
  }

  private esperar(ms: number): Promise<void> {
    return new Promise((resolve) => this.time.delayedCall(ms, resolve));
  }

  // ---------- Hablar e interactuar ----------

  private alPulsarA(): void {
    if (this.moviendo) {
      this.aPendiente = true;
      return;
    }
    if (!this.listo || this.ocupado) return;
    const pos = this.p.posicion;
    const [dx, dy] = DELTA[pos.dir];
    const tx = pos.x + dx;
    const ty = pos.y + dy;
    const pe = this.personas.find((x) => x.x === tx && x.y === ty);
    if (pe) {
      void this.conBloqueo(() => this.hablarCon(pe));
      return;
    }
    const cartel = this.zona.carteles.find((c) => c.x === tx && c.y === ty);
    if (cartel) {
      void this.conBloqueo(() => this.ejecutarGuion(cartel.texto.map((texto) => ({ tipo: 'decir', texto }) as Paso)));
      return;
    }
    const recipiente = this.recipientes.find((r) => r.def.x === tx && r.def.y === ty);
    if (recipiente) {
      void this.conBloqueo(() => this.registrar(recipiente));
      return;
    }
    const oculto = (this.zona.ocultos ?? []).find((o) => o.x === tx && o.y === ty && !this.p.banderas[`oculto:${this.zona.id}:${o.id}`]);
    if (oculto) void this.conBloqueo(() => this.encontrarOculto(oculto));
  }

  /** Tocar un recipiente con el dedo o el ratón: si está al lado, te giras hacia él y lo registras. */
  private tocarRecipiente(def: NonNullable<Zona['recipientes']>[number]): void {
    if (!this.listo || this.moviendo || this.ocupado || this.ui.ocupado) return;
    const pos = this.p.posicion;
    const dir = (Object.keys(DELTA) as Dir[]).find((d) => pos.x + DELTA[d][0] === def.x && pos.y + DELTA[d][1] === def.y);
    if (!dir) {
      this.ui.aviso('Acércate para registrarla');
      return;
    }
    pos.dir = dir;
    this.jugador.setDir(dir);
    this.alPulsarA();
  }

  private async registrar(r: { def: NonNullable<Zona['recipientes']>[number]; figura: Phaser.GameObjects.Image }): Promise<void> {
    const p = this.p;
    const zona = this.zona;
    if (revisado(p, zona.id, r.def.id)) {
      await this.ui.decir('Ya has registrado esta tinaja: está vacía.');
      this.ui.cerrarDialogo();
      return;
    }
    await this.sacudir(r.figura, 4, 6);
    const res = registrarRecipiente(
      p,
      zona.id,
      r.def.id,
      { prob: PROB_RECIPIENTE, objetos: OBJETOS_RECIPIENTE[zona.id] ?? [], encuentros: zona.encuentros },
      DATOS,
    );
    if (res.tipo === 'objeto') {
      darObjeto(p, res.objeto, 1);
      abrirRecipiente(r.figura);
      await this.ui.decir(`Rebuscas en la tinaja… ¡Hay ${conArticulo(DATOS.objetos[res.objeto].nombre)}!`);
    } else if (res.tipo === 'nada') {
      abrirRecipiente(r.figura);
      await this.ui.decir(`Rebuscas en la tinaja… No hay nada aquí.`);
    } else {
      await this.emboscada(r.figura);
      const clave = `mimico:${zona.id}:${r.def.id}`;
      const resultado = await this.combatir([res.criatura], true, undefined, {
        iaAstuta: true,
        // La recompensa se apunta antes de guardar: no se puede duplicar recargando.
        alGanar: () => {
          if (p.banderas[clave]) return;
          p.banderas[clave] = true;
          darObjeto(p, RECOMPENSA_MIMICO.objeto, RECOMPENSA_MIMICO.cantidad);
          this.premioMimico = true;
        },
      });
      abrirRecipiente(r.figura);
      if (resultado === 'derrota') {
        await this.trasDerrota();
        return;
      }
      if (this.premioMimico) {
        this.premioMimico = false;
        const obj = DATOS.objetos[RECOMPENSA_MIMICO.objeto];
        await this.ui.decir(`Dentro del Papemímico había ${obj.nombre} ×${RECOMPENSA_MIMICO.cantidad}.`);
      } else if (resultado === 'huida') {
        await this.ui.decir(`Te alejas a toda prisa. El Papemímico vuelve a fingir que es una tinaja… pero ya no engaña a nadie.`);
      }
    }
    this.ui.cerrarDialogo();
    guardarPartida(p);
  }

  private sacudir(figura: Phaser.GameObjects.Image, veces: number, px: number): Promise<void> {
    const x = figura.x;
    return new Promise((resolve) =>
      this.tweens.add({
        targets: figura,
        x: x + px,
        duration: 45,
        yoyo: true,
        repeat: veces,
        onComplete: () => {
          figura.x = x;
          resolve();
        },
      }),
    );
  }

  /** La tinaja tiembla, se abre de golpe y salta: era un Papemímico. */
  private async emboscada(figura: Phaser.GameObjects.Image): Promise<void> {
    await this.sacudir(figura, 10, 10);
    abrirRecipiente(figura);
    const marca = this.add.text(figura.x, figura.y - T * 1.3, '!', estiloTexto(64, COLOR.rojo, true)).setOrigin(0.5).setDepth(1000);
    this.capa?.add(marca);
    const y = figura.y;
    await new Promise<void>((resolve) =>
      this.tweens.add({ targets: figura, y: y - T * 0.5, scaleX: ESCALA * 1.3, scaleY: ESCALA * 1.3, duration: 160, yoyo: true, repeat: 1, onComplete: () => resolve() }),
    );
    figura.y = y;
    this.cameras.main.flash(220, 170, 20, 20);
    this.cameras.main.shake(320, 0.012);
    await this.ui.decir(`¡La tinaja tenía dientes! ¡Era un Papemímico!`);
    marca.destroy();
    this.ui.cerrarDialogo();
  }

  private async encontrarOculto(o: NonNullable<Zona['ocultos']>[number]): Promise<void> {
    const p = this.p;
    p.banderas[`oculto:${this.zona.id}:${o.id}`] = true;
    darObjeto(p, o.objeto, o.cantidad ?? 1);
    await this.ui.decir(`¡Has encontrado ${conArticulo(DATOS.objetos[o.objeto].nombre)}!`);
    this.ui.cerrarDialogo();
    guardarPartida(p);
  }

  private alPulsarMenu(): void {
    if (!this.listo || this.moviendo || this.ocupado) return;
    void this.conBloqueo(async () => {
      const ovilloPermitido = Boolean(this.zona.encuentros) && !this.zona.interior;
      const accion = await this.ui.menu(this.p, { ovilloPermitido });
      if (accion === 'ovillo') await this.usarOvillo();
    });
  }

  /** La Cuerda huida devuelve al último mesón. */
  private async usarOvillo(): Promise<void> {
    const cam = this.cameras.main;
    await this.ui.decir('Usas la Cuerda huida y vuelves al último mesón…');
    this.ui.cerrarDialogo();
    cam.fadeOut(250, 0, 0, 0);
    await this.esperar(280);
    this.p.posicion = { ...this.p.regreso };
    this.cargarZona(this.p.posicion);
    cam.fadeIn(250, 0, 0, 0);
    guardarPartida(this.p);
  }

  private async hablarCon(pe: PersonaEnMapa): Promise<void> {
    pe.figura.setDir(OPUESTA[this.p.posicion.dir]);
    if (pe.pnj.entrenador) await this.retoEntrenador(pe.pnj.entrenador);
    else await this.ejecutarGuion(pe.pnj.guion);
    pe.figura.setDir(pe.pnj.dir);
  }

  private async retoEntrenador(id: string): Promise<void> {
    const def = ENTRENADORES[id];
    if (this.p.vencidos.includes(id)) {
      await this.ejecutarGuion(def.despues.map((texto) => ({ tipo: 'decir', texto, quien: def.nombre }) as Paso));
      return;
    }
    await this.ejecutarGuion([{ tipo: 'combate', entrenador: id }]);
  }

  /** Si un entrenador te ve, se acerca y te reta. Devuelve `true` si ha habido combate. */
  private async comprobarEntrenadores(): Promise<boolean> {
    const p = this.p;
    for (const pe of this.personas) {
      const id = pe.pnj.entrenador;
      if (!id || p.vencidos.includes(id) || !pe.pnj.vision || !equipoEnPie(p)) continue;
      const otros = (x: number, y: number) => this.personas.some((o) => o !== pe && o.x === x && o.y === y);
      if (!enLineaDeVision(this.zona, CASILLAS, { x: pe.x, y: pe.y, dir: pe.figura.dir }, pe.pnj.vision, p.posicion, otros)) continue;
      await this.conBloqueo(async () => {
        await this.exclamacion(pe);
        await this.acercarse(pe);
        this.jugador.setDir(OPUESTA[pe.figura.dir]);
        p.posicion.dir = OPUESTA[pe.figura.dir];
        await this.retoEntrenador(id);
      });
      return true;
    }
    return false;
  }

  private async exclamacion(pe: PersonaEnMapa): Promise<void> {
    const t = this.add
      .text(pe.figura.x, pe.figura.y - T * 0.75, '!', estiloTexto(56, COLOR.rojo, true))
      .setOrigin(0.5)
      .setDepth(1000);
    this.capa?.add(t);
    await this.esperar(650);
    t.destroy();
  }

  private async acercarse(pe: PersonaEnMapa): Promise<void> {
    const [dx, dy] = DELTA[pe.figura.dir];
    const pos = this.p.posicion;
    pe.figura.andar(pe.figura.dir);
    while (Math.abs(pos.x - pe.x) + Math.abs(pos.y - pe.y) > 1) {
      pe.x += dx;
      pe.y += dy;
      await new Promise<void>((resolve) =>
        this.tweens.add({ targets: pe.figura, x: pe.x * T + T / 2, y: pe.y * T + T / 2, duration: MS_PASO, onComplete: () => resolve() }),
      );
    }
    pe.figura.parar();
    this.ordenarProfundidad();
  }

  // ---------- Guiones ----------

  private formatear(texto: string): string {
    return texto.replaceAll('{nombre}', this.p.nombre);
  }

  private async ejecutarGuion(guion: Paso[]): Promise<void> {
    await this.ejecutar(guion);
    this.ui.cerrarDialogo();
    this.refrescarPersonajes();
    guardarPartida(this.p);
  }

  /** Devuelve `false` si el guion se corta (has perdido un combate). */
  private async ejecutar(guion: Paso[]): Promise<boolean> {
    const p = this.p;
    for (const paso of guion) {
      switch (paso.tipo) {
        case 'decir':
          await this.ui.decir(this.formatear(paso.texto), paso.quien);
          break;
        case 'elegir': {
          const i = await this.ui.elegir(this.formatear(paso.pregunta), paso.opciones.map((o) => o.texto), paso.quien);
          if (!(await this.ejecutar(paso.opciones[i].pasos))) return false;
          break;
        }
        case 'si':
          if (!(await this.ejecutar(p.banderas[paso.bandera] ? paso.entonces : (paso.sino ?? [])))) return false;
          break;
        case 'bandera':
          p.banderas[paso.nombre] = paso.valor ?? true;
          break;
        case 'curar':
          curarEquipo(p, DATOS);
          this.cameras.main.flash(350, 255, 240, 200);
          break;
        case 'dar':
          darObjeto(p, paso.objeto, paso.cantidad);
          await this.ui.decir(`Recibes ${DATOS.objetos[paso.objeto].nombre} ×${paso.cantidad}.`);
          break;
        case 'dinero':
          p.dinero += paso.cantidad;
          break;
        case 'elegirInicial': {
          this.ui.cerrarDialogo();
          const especie = await this.ui.elegirInicial();
          const c = crearCriatura(DATOS, especie, 5, p.rng);
          anadirCriatura(p, c);
          await this.ui.decir(`¡${nombreDe(c, DATOS)} se une a tu equipo!`);
          break;
        }
        case 'combate':
          if (!(await this.combateEntrenador(ENTRENADORES[paso.entrenador]))) return false;
          break;
        case 'tienda':
          await this.ui.tienda(paso.productos, p);
          break;
        case 'almacen':
          await this.ui.almacen(p);
          break;
        case 'regreso':
          p.regreso = { ...p.posicion };
          break;
        case 'blason':
          if (!p.blasones.includes(paso.id)) p.blasones.push(paso.id);
          await this.ui.decir(`Has conseguido el ${paso.nombre}.`);
          break;
        case 'guardar':
          if (guardarPartida(p)) this.ui.aviso('Partida guardada');
          break;
        case 'fin':
          await this.ui.pantallaFin(paso.texto);
          break;
      }
    }
    return true;
  }

  // ---------- Combates ----------

  private async combateEntrenador(def: DefEntrenador): Promise<boolean> {
    const p = this.p;
    if (p.vencidos.includes(def.id)) {
      p.banderas[`vencido:${def.id}`] = true;
      return true;
    }
    for (const t of def.antes) await this.ui.decir(t, def.nombre);
    this.ui.cerrarDialogo();
    const resultado = await this.combatir(equipoEntrenador(def, DATOS), false, def);
    if (resultado !== 'victoria') {
      await this.trasDerrota();
      return false;
    }
    p.banderas[`vencido:${def.id}`] = true;
    for (const t of def.derrota) await this.ui.decir(t, def.nombre);
    await this.ui.decir(`Recibes ${def.premio} ${MONEDA}.`);
    for (const [id, n] of Object.entries(this.regalos)) {
      await this.ui.decir(`${def.nombre} te da ${n > 1 ? `${DATOS.objetos[id].nombre} ×${n}` : conArticulo(DATOS.objetos[id].nombre)}.`);
    }
    this.regalos = {};
    return true;
  }

  private async combateSalvaje(salvaje: Criatura): Promise<void> {
    const resultado = await this.combatir([salvaje], true);
    if (resultado === 'derrota') await this.trasDerrota();
  }

  private combatir(
    rival: Criatura[],
    salvaje: boolean,
    def?: DefEntrenador,
    op: { iaAstuta?: boolean; alGanar?: () => void } = {},
  ): Promise<ResultadoCombate> {
    const p = this.p;
    return new Promise((resolve) => {
      this.cameras.main.flash(250, 255, 255, 255);
      this.cameras.main.shake(250, 0.006);
      this.time.delayedCall(320, () => {
        this.scene.sleep('Interfaz');
        this.scene.sleep();
        this.scene.launch('Combate', {
          modo: 'historia',
          semilla: semillaCombate(p),
          equipo: p.equipo,
          objetos: p.objetos,
          rival,
          salvaje,
          nombreRival: def?.nombre ?? 'Salvaje',
          iaAstuta: op.iaAstuta,
          alTerminar: (r: ResultadoHistoria) => {
            this.scene.stop('Combate');
            this.scene.wake();
            this.scene.wake('Interfaz');
            const aplicado = aplicarCombate(p, { ...r, entrenador: def }, DATOS);
            this.perdido = aplicado.perdido;
            this.regalos = aplicado.regalos;
            if (r.resultado === 'victoria' || r.resultado === 'captura') op.alGanar?.();
            guardarPartida(p);
            resolve(r.resultado);
          },
        });
      });
    });
  }

  private async trasDerrota(): Promise<void> {
    const perdida = this.perdido > 0 ? ` Por el camino pierdes ${this.perdido} ${MONEDA}.` : '';
    await this.ui.decir(`No te quedan criaturas en pie… Vuelves a toda prisa al último mesón.${perdida}`);
    this.ui.cerrarDialogo();
    this.cargarZona(this.p.posicion);
    guardarPartida(this.p);
  }
}
