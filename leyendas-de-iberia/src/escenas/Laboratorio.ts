import Phaser from 'phaser';
import { DATOS } from '../data';
import { Boton, panel } from '../ui/componentes';
import { crearCriaturaVisual } from '../ui/criaturaVisual';
import { ANCHO, COLOR, estiloTexto, oscurecer } from '../ui/tema';

// Laboratorio de combate: eliges tu equipo y el del rival y combates. Sirve para probar el
// motor y ajustar cifras antes de tener el mapa.

export interface ConfigLaboratorio {
  jugador: string[];
  rival: string[];
  nivelJugador: number;
  nivelRival: number;
  salvaje: boolean;
}

const CLAVE_GUARDADO = 'leyendas-de-iberia:laboratorio';
const MAX_EQUIPO = 6;

const POR_DEFECTO: ConfigLaboratorio = {
  jugador: ['retono_drago'],
  rival: ['topillo'],
  nivelJugador: 10,
  nivelRival: 8,
  salvaje: true,
};

function cargarConfig(): ConfigLaboratorio {
  try {
    const texto = localStorage.getItem(CLAVE_GUARDADO);
    if (!texto) return structuredClone(POR_DEFECTO);
    const c = JSON.parse(texto) as ConfigLaboratorio;
    const valida = (ids: unknown) => Array.isArray(ids) && ids.every((id) => typeof id === 'string' && DATOS.especies[id]);
    if (!valida(c.jugador) || !valida(c.rival) || c.jugador.length === 0 || c.rival.length === 0) {
      return structuredClone(POR_DEFECTO);
    }
    return { ...POR_DEFECTO, ...c };
  } catch {
    return structuredClone(POR_DEFECTO);
  }
}

function guardarConfig(c: ConfigLaboratorio): void {
  try {
    localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(c));
  } catch {
    // Sin almacenamiento (modo privado): no pasa nada, solo no se recuerda.
  }
}

type LadoLab = 'jugador' | 'rival';

export class Laboratorio extends Phaser.Scene {
  private config!: ConfigLaboratorio;
  private ladoActivo: LadoLab = 'jugador';
  private capaEquipos?: Phaser.GameObjects.Container;
  private botonCombatir?: Boton;

  constructor() {
    super('Laboratorio');
  }

  create(): void {
    this.config = cargarConfig();
    this.cameras.main.setBackgroundColor(COLOR.fondo);

    this.add.text(ANCHO / 2, 70, 'Laboratorio de combate', estiloTexto(64, COLOR.pergamino, true)).setOrigin(0.5);
    this.add.text(ANCHO / 2, 135, 'Leyendas de Iberia · herramienta de pruebas', estiloTexto(34, COLOR.oro)).setOrigin(0.5);
    new Boton(this, 110, 70, { ancho: 160, alto: 80, texto: '‹ Salir', tamano: 30, alPulsar: () => this.scene.start('Titulo') });

    this.dibujarEquipos();
    this.dibujarCatalogo();

    new Boton(this, 270, 1790, {
      ancho: 440,
      alto: 150,
      texto: 'Al azar',
      alPulsar: () => this.alAzar(),
    });
    this.botonCombatir = new Boton(this, 810, 1790, {
      ancho: 440,
      alto: 150,
      texto: '¡Combatir!',
      color: COLOR.rojo,
      tamano: 52,
      alPulsar: () => this.combatir(),
    });
    this.actualizarBotonCombatir();
  }

  private dibujarEquipos(): void {
    this.capaEquipos?.destroy();
    const capa = this.add.container(0, 0);
    this.capaEquipos = capa;
    this.dibujarLado(capa, 'jugador', 190);
    this.dibujarLado(capa, 'rival', 520);
    const destino = this.ladoActivo === 'jugador' ? 'tu equipo' : 'el rival';
    capa.add(
      this.add
        .text(ANCHO / 2, 880, `Toca una criatura para añadirla a ${destino}`, estiloTexto(34, COLOR.pergaminoOscuro))
        .setOrigin(0.5),
    );
  }

  private dibujarLado(capa: Phaser.GameObjects.Container, lado: LadoLab, y: number): void {
    const activo = this.ladoActivo === lado;
    const alto = 300;
    const fondo = panel(this, 40, y, ANCHO - 80, alto, activo ? COLOR.pergamino : COLOR.pergaminoOscuro);
    if (activo) fondo.setStrokeStyle(10, COLOR.oro);
    fondo.setInteractive({ useHandCursor: true }).on('pointerup', () => {
      if (this.ladoActivo !== lado) {
        this.ladoActivo = lado;
        this.dibujarEquipos();
      }
    });
    capa.add(fondo);

    const titulo = lado === 'jugador' ? 'Tu equipo' : 'Rival';
    capa.add(this.add.text(70, y + 45, titulo, estiloTexto(42, COLOR.tinta, true)).setOrigin(0, 0.5));

    // Nivel: −5 −1 N +1 +5
    const claveNivel = lado === 'jugador' ? 'nivelJugador' : 'nivelRival';
    const nivel = this.config[claveNivel];
    const cambiar = (d: number) => {
      this.config[claveNivel] = Phaser.Math.Clamp(this.config[claveNivel] + d, 1, 100);
      guardarConfig(this.config);
      this.dibujarEquipos();
    };
    const xs = [600, 690, 800, 910, 1000];
    capa.add(new Boton(this, xs[0], y + 45, { ancho: 80, alto: 70, texto: '−5', tamano: 30, alPulsar: () => cambiar(-5) }));
    capa.add(new Boton(this, xs[1], y + 45, { ancho: 80, alto: 70, texto: '−1', tamano: 30, alPulsar: () => cambiar(-1) }));
    capa.add(this.add.text(xs[2], y + 45, `Nv ${nivel}`, estiloTexto(38, COLOR.tinta, true)).setOrigin(0.5));
    capa.add(new Boton(this, xs[3], y + 45, { ancho: 80, alto: 70, texto: '+1', tamano: 30, alPulsar: () => cambiar(1) }));
    capa.add(new Boton(this, xs[4], y + 45, { ancho: 80, alto: 70, texto: '+5', tamano: 30, alPulsar: () => cambiar(5) }));

    if (lado === 'rival') {
      capa.add(
        new Boton(this, 330, y + 45, {
          ancho: 220,
          alto: 70,
          texto: this.config.salvaje ? 'Salvaje' : 'Entrenador',
          tamano: 30,
          alPulsar: () => {
            this.config.salvaje = !this.config.salvaje;
            if (this.config.salvaje) this.config.rival = this.config.rival.slice(0, 1);
            guardarConfig(this.config);
            this.dibujarEquipos();
          },
        }),
      );
    }

    // Huecos del equipo: tocar uno lo quita.
    const ids = this.config[lado];
    const maximo = lado === 'rival' && this.config.salvaje ? 1 : MAX_EQUIPO;
    for (let i = 0; i < maximo; i++) {
      const cx = 125 + i * 166;
      const cy = y + 185;
      const hueco = this.add.rectangle(cx, cy, 150, 160, oscurecer(COLOR.pergaminoOscuro, 0.08)).setRounded(18);
      capa.add(hueco);
      const id = ids[i];
      if (!id) continue;
      capa.add(crearCriaturaVisual(this, id, cx, cy - 18, 115, lado === 'jugador'));
      capa.add(
        this.add
          .text(cx, cy + 58, DATOS.especies[id].nombre, { ...estiloTexto(22, COLOR.tinta), align: 'center', wordWrap: { width: 150 } })
          .setOrigin(0.5, 0.5),
      );
      hueco.setInteractive({ useHandCursor: true }).on('pointerup', () => {
        this.config[lado].splice(i, 1);
        guardarConfig(this.config);
        this.dibujarEquipos();
        this.actualizarBotonCombatir();
      });
    }
    if (ids.length === 0) {
      capa.add(this.add.text(ANCHO / 2, y + 185, 'Vacío', estiloTexto(34, COLOR.tintaSuave)).setOrigin(0.5));
    }
  }

  private dibujarCatalogo(): void {
    const ids = Object.keys(DATOS.especies);
    const columnas = 4;
    const ancho = 240;
    const alto = 140;
    const x0 = (ANCHO - columnas * ancho - (columnas - 1) * 12) / 2;
    ids.forEach((id, i) => {
      const col = i % columnas;
      const fila = Math.floor(i / columnas);
      const x = x0 + col * (ancho + 12) + ancho / 2;
      const y = 930 + fila * (alto + 10) + alto / 2;
      const fondo = this.add
        .rectangle(x, y, ancho, alto, COLOR.pergamino)
        .setRounded(18)
        .setStrokeStyle(4, COLOR.tintaSuave);
      crearCriaturaVisual(this, id, x, y - 18, 92);
      this.add
        .text(x, y + 46, DATOS.especies[id].nombre, { ...estiloTexto(24, COLOR.tinta, true), align: 'center', wordWrap: { width: ancho - 16 } })
        .setOrigin(0.5);
      fondo.setInteractive({ useHandCursor: true }).on('pointerup', () => this.anadir(id));
    });
  }

  private anadir(id: string): void {
    const lado = this.ladoActivo;
    if (lado === 'rival' && this.config.salvaje) this.config.rival = [id];
    else if (this.config[lado].length < MAX_EQUIPO) this.config[lado].push(id);
    else return;
    guardarConfig(this.config);
    this.dibujarEquipos();
    this.actualizarBotonCombatir();
  }

  private alAzar(): void {
    const ids = Object.keys(DATOS.especies);
    const azar = () => ids[Math.floor(Math.random() * ids.length)];
    this.config.jugador = Array.from({ length: 3 }, azar);
    this.config.rival = this.config.salvaje ? [azar()] : Array.from({ length: 3 }, azar);
    guardarConfig(this.config);
    this.dibujarEquipos();
    this.actualizarBotonCombatir();
  }

  private actualizarBotonCombatir(): void {
    this.botonCombatir?.setActivo(this.config.jugador.length > 0 && this.config.rival.length > 0);
  }

  private combatir(): void {
    // La semilla es lo único al azar: con la misma semilla el combate se repite igual.
    const semilla = Math.floor(Math.random() * 1e9);
    this.scene.start('Combate', { modo: 'laboratorio', config: structuredClone(this.config), semilla });
  }
}
