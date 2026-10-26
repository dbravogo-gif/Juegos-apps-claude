import Phaser from 'phaser';
import { nuevaPartida, type Partida } from '../core/partida';
import { INICIO } from '../data/mundo';
import { Boton } from '../ui/componentes';
import { crearCriaturaVisual } from '../ui/criaturaVisual';
import { pedirNombre } from '../ui/pedirNombre';
import { cargarPartida, guardarPartida, sesion } from '../ui/sesion';
import { ALTO_DISENO as ALTO, ANCHO, COLOR, estiloTexto, MARGEN_VERTICAL } from '../ui/tema';

export class Titulo extends Phaser.Scene {
  private confirmando = false;
  private empezando = false;

  constructor() {
    super('Titulo');
  }

  create(): void {
    this.confirmando = false;
    this.empezando = false;
    this.cameras.main.setBackgroundColor(COLOR.fondo);
    this.cameras.main.setScroll(0, -MARGEN_VERTICAL);
    this.add.text(ANCHO / 2, 300, 'Leyendas', estiloTexto(130, COLOR.panel, true)).setOrigin(0.5);
    this.add.text(ANCHO / 2, 430, 'de Iberia', estiloTexto(96, COLOR.oro, true)).setOrigin(0.5);
    this.add.text(ANCHO / 2, 540, 'Capítulo 1 · Granada, 1492', estiloTexto(40, COLOR.panelSuave)).setOrigin(0.5);

    crearCriaturaVisual(this, 'becerro_igneo', 250, 800, 230, true);
    crearCriaturaVisual(this, 'retono_drago', 540, 760, 250);
    crearCriaturaVisual(this, 'cangrejo', 830, 800, 230);

    const guardada = cargarPartida();
    let y = 1120;
    if (guardada) {
      new Boton(this, ANCHO / 2, y, {
        ancho: 700,
        alto: 160,
        texto: 'Continuar',
        subtexto: `${guardada.nombre} · ${guardada.capturados.length} criaturas · ${guardada.blasones.length} blasones`,
        color: COLOR.rojo,
        tamano: 52,
        alPulsar: () => {
          if (this.empezando) return;
          this.empezando = true;
          sesion.partida = guardada;
          this.scene.start('Mundo');
        },
      });
      y += 200;
    }
    new Boton(this, ANCHO / 2, y, {
      ancho: 700,
      alto: 150,
      texto: 'Nueva partida',
      color: guardada ? undefined : COLOR.rojo,
      tamano: 48,
      alPulsar: () => void this.nuevaPartida(Boolean(guardada)),
    });

    this.add
      .text(ANCHO / 2, ALTO - 170, 'Modo desarrollador', estiloTexto(30, COLOR.tintaSuave))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.modoDesarrollador());
    this.add
      .text(ANCHO / 2, ALTO - 110, 'Laboratorio de combate', estiloTexto(30, COLOR.tintaSuave))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('Laboratorio'));
    this.add.text(ANCHO / 2, ALTO - 50, 'Prototipo · arte provisional', estiloTexto(26, COLOR.tintaSuave)).setOrigin(0.5);
  }

  private async nuevaPartida(hayGuardada: boolean): Promise<void> {
    if (this.confirmando || this.empezando) return;
    if (hayGuardada) {
      this.confirmando = true;
      const ok = await this.confirmar('Se perderá la partida guardada. ¿Empezar otra?');
      this.confirmando = false;
      if (!ok) return;
    }
    this.empezando = true;
    const nombre = await pedirNombre();
    const p = nuevaPartida(nombre, Date.now(), INICIO);
    guardarPartida(p);
    sesion.partida = p;
    this.scene.start('Mundo');
  }

  /**
   * El modo historia con herramientas para probar el juego (objetos, criaturas, viajes). Usa su
   * propia partida guardada, así que no toca la de verdad.
   */
  private modoDesarrollador(): void {
    if (this.confirmando || this.empezando) return;
    this.confirmando = true;
    const guardada = cargarPartida(true);
    const c = this.add.container(0, 0).setDepth(10);
    c.add(this.add.rectangle(0, -MARGEN_VERTICAL, ANCHO, ALTO + 2 * MARGEN_VERTICAL, 0x000000, 0.7).setOrigin(0, 0).setInteractive());
    c.add(this.add.rectangle(ANCHO / 2, ALTO / 2 - 40, 900, 760, COLOR.panel).setRounded(24).setStrokeStyle(6, COLOR.tinta));
    c.add(this.add.text(ANCHO / 2, ALTO / 2 - 340, 'Modo desarrollador', estiloTexto(48, COLOR.tinta, true)).setOrigin(0.5));
    c.add(
      this.add
        .text(ANCHO / 2, ALTO / 2 - 250, 'El modo historia con un menú para darte objetos y criaturas y viajar a cualquier zona. Se guarda aparte.', {
          ...estiloTexto(30, COLOR.tintaSuave),
          align: 'center',
          wordWrap: { width: 780 },
        })
        .setOrigin(0.5),
    );
    const empezar = (p: Partida) => {
      this.empezando = true;
      sesion.partida = p;
      this.scene.start('Mundo');
    };
    let y = ALTO / 2 - 110;
    if (guardada) {
      c.add(
        new Boton(this, ANCHO / 2, y, {
          ancho: 760,
          alto: 140,
          texto: 'Continuar',
          subtexto: `${guardada.capturados.length} criaturas · ${guardada.blasones.length} blasones`,
          color: COLOR.morado,
          alPulsar: () => empezar(guardada),
        }),
      );
      y += 170;
    }
    c.add(
      new Boton(this, ANCHO / 2, y, {
        ancho: 760,
        alto: 130,
        texto: guardada ? 'Empezar otra' : 'Empezar',
        color: guardada ? undefined : COLOR.morado,
        alPulsar: () => {
          const p = nuevaPartida('Pruebas', Date.now(), INICIO);
          p.dev = true;
          guardarPartida(p);
          empezar(p);
        },
      }),
    );
    c.add(
      new Boton(this, ANCHO / 2, ALTO / 2 + 250, {
        ancho: 400,
        alto: 110,
        texto: 'Cancelar',
        alPulsar: () => {
          this.confirmando = false;
          c.destroy();
        },
      }),
    );
  }

  private confirmar(pregunta: string): Promise<boolean> {
    return new Promise((resolve) => {
      const c = this.add.container(0, 0).setDepth(10);
      c.add(this.add.rectangle(0, -MARGEN_VERTICAL, ANCHO, ALTO + 2 * MARGEN_VERTICAL, 0x000000, 0.7).setOrigin(0, 0).setInteractive());
      c.add(this.add.rectangle(ANCHO / 2, ALTO / 2 - 60, 900, 480, COLOR.panel).setRounded(24).setStrokeStyle(6, COLOR.tinta));
      c.add(this.add.text(ANCHO / 2, ALTO / 2 - 170, pregunta, { ...estiloTexto(44, COLOR.tinta, true), align: 'center', wordWrap: { width: 780 } }).setOrigin(0.5));
      const fin = (v: boolean) => {
        c.destroy();
        resolve(v);
      };
      c.add(new Boton(this, ANCHO / 2 - 210, ALTO / 2 + 50, { ancho: 380, alto: 140, texto: 'Sí, empezar', color: COLOR.rojo, alPulsar: () => fin(true) }));
      c.add(new Boton(this, ANCHO / 2 + 210, ALTO / 2 + 50, { ancho: 380, alto: 140, texto: 'No', alPulsar: () => fin(false) }));
    });
  }
}
