import Phaser from 'phaser';
import { claveSprite, SPRITES } from '../ui/criaturaVisual';
import { cargarHojasMundo, prepararHojasMundo } from '../ui/casillasVisual';
import { cargarPersonas, prepararPersonas } from '../ui/personaVisual';

/** Carga el arte, prepara las animaciones y pasa al título. */
export class Arranque extends Phaser.Scene {
  constructor() {
    super('Arranque');
  }

  preload(): void {
    for (const [id, url] of Object.entries(SPRITES)) this.load.image(claveSprite(id), url);
    cargarHojasMundo(this.load);
    cargarPersonas(this.load);
  }

  create(): void {
    // Pixel art nítido al escalar.
    for (const id of Object.keys(SPRITES)) {
      this.textures.get(claveSprite(id)).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    prepararHojasMundo(this);
    prepararPersonas(this);
    this.scene.start('Titulo');
  }
}
