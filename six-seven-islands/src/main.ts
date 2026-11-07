// Arranque: crea la escena y la cámara, inicia los subsistemas y pone el bucle del navegador.
// El reloj solo se usa aquí, para medir el tiempo de cada fotograma; la lógica va a paso fijo.

import { PerspectiveCamera, Scene } from 'three/webgpu';
import { nivelInicial, CALIDADES, type NivelCalidad } from './motor/calidad';
import { Motor, type ClaseSubsistema } from './motor/motor';
import { Criaturas } from './sistemas/criaturas/criaturas';
import { Depuracion } from './sistemas/depuracion/depuracion';
import { Prueba } from './sistemas/prueba/prueba';
import { Render } from './sistemas/render/render';
import './estilo.css';

const SUBSISTEMAS: ClaseSubsistema[] = [Render, Criaturas, Prueba, Depuracion];

function mostrarFallo(e: unknown): void {
  const aviso = document.createElement('p');
  aviso.className = 'fallo';
  aviso.textContent = `No se ha podido arrancar el juego: ${e instanceof Error ? e.message : String(e)}`;
  document.body.append(aviso);
  console.error(e);
}

async function arrancar(): Promise<void> {
  const parametros = new URLSearchParams(location.search);
  const pedido = parametros.get('calidad') as NivelCalidad | null;
  const nivel = pedido && CALIDADES[pedido] ? pedido : nivelInicial(matchMedia('(pointer: coarse)').matches);
  const semilla = parametros.get('semilla') ?? 67;

  const camara = new PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.5, 200);
  const motor = new Motor(new Scene(), camara, nivel, semilla);
  await motor.iniciar(SUBSISTEMAS);

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
