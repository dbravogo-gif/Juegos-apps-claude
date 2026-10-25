import Phaser from 'phaser';
import type { Dir } from '../core/mundo';
import { ASPECTOS } from '../data/aspectos';
import { ESCALA, imagenPieza, TAM_CASILLA } from './casillasVisual';

// Personas del mapa con las hojas del paquete Ninja Adventure (`src/assets/personajes/`). Cada
// hoja tiene una columna por dirección y cuatro filas con los pasos.

const URLS = import.meta.glob('../assets/personajes/*.png', { eager: true, query: '?url', import: 'default' }) as Record<
  string,
  string
>;

const COLUMNA: Record<Dir, number> = { abajo: 0, arriba: 1, izquierda: 2, derecha: 3 };

const claveAspecto = (aspecto: string) => `persona-${aspecto}`;
const claveAnimacion = (aspecto: string, dir: Dir) => `persona-${aspecto}-${dir}`;

export function cargarPersonas(load: Phaser.Loader.LoaderPlugin): void {
  for (const a of ASPECTOS) {
    load.spritesheet(claveAspecto(a), URLS[`../assets/personajes/${a}.png`], { frameWidth: 16, frameHeight: 16 });
  }
}

/** Filtro nítido y una animación de paso por aspecto y dirección. Se llama una vez al arrancar. */
export function prepararPersonas(scene: Phaser.Scene): void {
  for (const a of ASPECTOS) {
    scene.textures.get(claveAspecto(a)).setFilter(Phaser.Textures.FilterMode.NEAREST);
    for (const dir of Object.keys(COLUMNA) as Dir[]) {
      const c = COLUMNA[dir];
      scene.anims.create({
        key: claveAnimacion(a, dir),
        frames: scene.anims.generateFrameNumbers(claveAspecto(a), { frames: [c + 4, c + 8, c + 12, c] }),
        frameRate: 10,
        repeat: -1,
      });
    }
  }
}

export class Persona extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Sprite;
  private readonly aspecto: string;
  dir: Dir;
  andando = false;

  constructor(scene: Phaser.Scene, x: number, y: number, aspecto: string, dir: Dir) {
    super(scene, x, y);
    this.aspecto = (ASPECTOS as readonly string[]).includes(aspecto) ? aspecto : ASPECTOS[0];
    this.dir = dir;
    const t = TAM_CASILLA;
    const sombra = imagenPieza(scene, 'sombra', 0, t * 0.36);
    this.sprite = scene.add.sprite(0, -t * 0.08, claveAspecto(this.aspecto), COLUMNA[dir]).setScale(ESCALA);
    this.add([sombra, this.sprite]);
    scene.add.existing(this);
  }

  /** Mira hacia `dir` sin andar. */
  setDir(dir: Dir): void {
    this.dir = dir;
    if (this.andando) this.sprite.play(claveAnimacion(this.aspecto, dir), true);
    else this.sprite.setFrame(COLUMNA[dir]);
  }

  /** Empieza (o sigue) la animación de paso. */
  andar(dir: Dir): void {
    this.dir = dir;
    this.andando = true;
    this.sprite.play(claveAnimacion(this.aspecto, dir), true);
  }

  parar(): void {
    if (!this.andando) return;
    this.andando = false;
    this.sprite.stop();
    this.sprite.setFrame(COLUMNA[this.dir]);
  }
}
