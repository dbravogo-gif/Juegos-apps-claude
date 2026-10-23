import Phaser from 'phaser';
import { Arranque } from './escenas/Arranque';
import { Combate } from './escenas/Combate';
import { Interfaz } from './escenas/Interfaz';
import { Laboratorio } from './escenas/Laboratorio';
import { Mundo } from './escenas/Mundo';
import { Titulo } from './escenas/Titulo';
import { ALTO, ANCHO, COLOR, css } from './ui/tema';

const juego = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'juego',
  width: ANCHO,
  height: ALTO,
  backgroundColor: css(COLOR.fondo),
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: { activePointers: 3 },
  // El orden decide qué se pinta encima: la interfaz sobre el mapa y el combate sobre todo.
  scene: [Arranque, Titulo, Mundo, Interfaz, Combate, Laboratorio],
});

// Acceso desde la consola del navegador, para depurar y para las pruebas automáticas.
(window as unknown as { juego?: Phaser.Game }).juego = juego;

// Para poder instalarlo y jugar sin conexión. Donde no se permite (vistas previas), no pasa nada.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
