import Phaser from 'phaser';
import { claveSprite, SPRITES } from '../ui/criaturaVisual';
import { generarTexturasCasillas } from '../ui/casillasVisual';

/** Carga el arte que exista, genera las casillas provisionales y pasa al título. */
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
    generarTexturasCasillas(this);
    this.scene.start('Titulo');
  }
}
