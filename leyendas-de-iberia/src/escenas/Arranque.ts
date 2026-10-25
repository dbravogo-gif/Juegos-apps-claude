import Phaser from 'phaser';
import { claveSprite, SPRITES } from '../ui/criaturaVisual';
import { cargarHojasMundo, prepararHojasMundo } from '../ui/casillasVisual';
import { cargarPersonas, prepararPersonas } from '../ui/personaVisual';
import { cargarIconos } from '../ui/objetoVisual';
import { cargarRetratos } from '../ui/retratoVisual';

/** Carga el arte, prepara las animaciones y pasa al título. */
export class Arranque extends Phaser.Scene {
  constructor() {
    super('Arranque');
  }

  preload(): void {
    for (const [id, url] of Object.entries(SPRITES)) this.load.image(claveSprite(id), url);
    cargarHojasMundo(this.load);
    cargarPersonas(this.load);
    cargarIconos(this.load);
    cargarRetratos(this.load);
  }

  create(): void {
    // Las criaturas, los iconos y los retratos son ilustraciones: se escalan con suavizado (el filtro por defecto).
    prepararHojasMundo(this);
    prepararPersonas(this);
    this.scene.start('Titulo');
  }
}
