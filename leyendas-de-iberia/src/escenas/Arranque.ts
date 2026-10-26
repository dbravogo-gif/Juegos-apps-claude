import Phaser from 'phaser';
import { claveSprite, SPRITES } from '../ui/criaturaVisual';
import { cargarHojasMundo, prepararHojasMundo } from '../ui/casillasVisual';
import { cargarLegendarios, cargarPersonas, prepararLegendarios, prepararPersonas } from '../ui/personaVisual';
import { cargarIconos } from '../ui/objetoVisual';
import { cargarRetratos } from '../ui/retratoVisual';
import { cargarMapa, prepararMapa } from '../ui/mapaVisual';

/** Carga el arte, prepara las animaciones y pasa al título. */
export class Arranque extends Phaser.Scene {
  constructor() {
    super('Arranque');
  }

  preload(): void {
    for (const [id, url] of Object.entries(SPRITES)) this.load.image(claveSprite(id), url);
    cargarHojasMundo(this.load);
    cargarPersonas(this.load);
    cargarLegendarios(this.load);
    cargarIconos(this.load);
    cargarRetratos(this.load);
    cargarMapa(this.load);
  }

  create(): void {
    // Las criaturas, los iconos y los retratos son ilustraciones: se escalan con suavizado (el filtro por defecto).
    prepararHojasMundo(this);
    prepararPersonas(this);
    prepararLegendarios(this);
    prepararMapa(this);
    this.scene.start('Titulo');
  }
}
