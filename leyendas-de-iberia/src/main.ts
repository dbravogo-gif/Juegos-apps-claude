import Phaser from 'phaser';
import { Arranque } from './escenas/Arranque';
import { Combate } from './escenas/Combate';
import { Laboratorio } from './escenas/Laboratorio';
import { ALTO, ANCHO, COLOR, css } from './ui/tema';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'juego',
  width: ANCHO,
  height: ALTO,
  backgroundColor: css(COLOR.fondo),
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Arranque, Laboratorio, Combate],
});
