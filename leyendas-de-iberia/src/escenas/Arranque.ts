import Phaser from 'phaser';
import { claveSprite, SPRITES } from '../ui/criaturaVisual';

/** Carga el arte que exista y pasa al laboratorio. */
export class Arranque extends Phaser.Scene {
  constructor() {
    super('Arranque');
  }

  preload(): void {
    for (const [id, url] of Object.entries(SPRITES)) this.load.image(claveSprite(id), url);
  }

  create(): void {
    // Pixel art nítido al escalar.
    for (const id of Object.keys(SPRITES)) {
      this.textures.get(claveSprite(id)).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    this.scene.start('Laboratorio');
  }
}
