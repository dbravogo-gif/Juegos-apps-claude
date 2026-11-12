// Arranque: crea la escena y la cámara, inicia los subsistemas y pone el bucle del navegador.
// El reloj solo se usa aquí, para medir el tiempo de cada fotograma; la lógica va a paso fijo.

import { PerspectiveCamera, Scene } from 'three/webgpu';
import { nivelInicial, CALIDADES, type NivelCalidad } from './motor/calidad';
import { Motor, type ClaseSubsistema } from './motor/motor';
import { Camara } from './sistemas/camara/camara';
import { Catalogo } from './sistemas/catalogo/catalogo';
import { Combate } from './sistemas/combate/combate';
import { Companera } from './sistemas/companera/companera';
import { Criaturas } from './sistemas/criaturas/criaturas';
import { Depuracion } from './sistemas/depuracion/depuracion';
import { Entrada } from './sistemas/entrada/entrada';
import { Interfaz } from './sistemas/interfaz/interfaz';
import { Menu } from './sistemas/menu/menu';
import { Inicio } from './sistemas/inicio/inicio';
import { Sonido } from './sistemas/sonido/sonido';
import { Mundo } from './sistemas/mundo/mundo';
import { Partida } from './sistemas/partida/partida';
import { Personaje } from './sistemas/personaje/personaje';
import { Prueba } from './sistemas/prueba/prueba';
import { Render } from './sistemas/render/render';
import { Salas } from './sistemas/salas/salas';
import { mostrarMapa } from './sistemas/mapa/vista';
import './estilo.css';

// El juego: la isla 1 para explorar. Con ?vitrina, la vitrina de criaturas de la prueba de arte;
// con ?catalogo, las piezas propias del mundo en fila para revisarlas; con ?mapa, el plano en 2D.
const JUEGO: ClaseSubsistema[] = [Render, Entrada, Partida, Mundo, Salas, Personaje, Companera, Camara, Combate, Interfaz, Menu, Inicio, Sonido, Depuracion];
const VITRINA: ClaseSubsistema[] = [Render, Criaturas, Prueba, Depuracion];
const CATALOGO: ClaseSubsistema[] = [Render, Catalogo, Depuracion];

function mostrarFallo(e: unknown): void {
  const aviso = document.createElement('p');
  aviso.className = 'fallo';
  aviso.textContent = `No se ha podido arrancar el juego: ${e instanceof Error ? e.message : String(e)}`;
  document.body.append(aviso);
  console.error(e);
}

async function arrancar(): Promise<void> {
  const parametros = new URLSearchParams(location.search);
  if (parametros.has('mapa')) return mostrarMapa(parametros.get('mapa'));
  const pedido = parametros.get('calidad') as NivelCalidad | null;
  const nivel = pedido && CALIDADES[pedido] ? pedido : nivelInicial();
  const semilla = parametros.get('semilla') ?? 67;

  const camara = new PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.5, 200);
  const motor = new Motor(new Scene(), camara, nivel, semilla);
  await motor.iniciar(parametros.has('vitrina') ? VITRINA : parametros.has('catalogo') ? CATALOGO : JUEGO);

  window.addEventListener('resize', () => motor.redimensionar(window.innerWidth, window.innerHeight));

  let anterior = performance.now();
  const bucle = (ahora: number) => {
    motor.fotograma((ahora - anterior) / 1000);
    anterior = ahora;
    requestAnimationFrame(bucle);
  };
  requestAnimationFrame((ahora) => {
    anterior = ahora;
    bucle(ahora);
  });
}

arrancar().catch(mostrarFallo);
