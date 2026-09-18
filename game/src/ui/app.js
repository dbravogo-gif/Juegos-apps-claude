import { cargar, guardar } from '../data/storage.js';
import { construirHistorial, evaluarDia, rutinaDelDia, tipoDeSesion } from '../data/history.js';
import { estadoDesdeHistorial } from '../core/state.js';
import { hoyISO } from './util.js';
import { anunciarProgreso } from './aviso.js';
import { empezar as empezarTutorial } from './tutorial.js';

import * as inicio from './vistas/inicio.js';
import * as entreno from './vistas/entreno.js';
import * as dieta from './vistas/dieta.js';
import * as personaje from './vistas/personaje.js';
import * as mundo from './vistas/mundo.js';
import * as ajustes from './vistas/ajustes.js';

const VISTAS = { inicio, entreno, dieta, personaje, mundo, ajustes };
const TITULOS = {
  inicio: 'Hoy',
  entreno: 'Entreno',
  dieta: 'Dieta',
  personaje: 'Héroe',
  mundo: 'Mundo',
  ajustes: 'Ajustes',
};

/** Vistas que trabajan sobre un día concreto y deben volver a hoy al entrar en ellas. */
const DIARIAS = ['entreno', 'dieta'];

/**
 * Entrenar va limpio: ni barra de XP ni avisos flotantes mientras se está en la sesión.
 * Lo ganado no se pierde, se guarda y se anuncia entero al salir de la sección.
 */
const SILENCIOSAS = ['entreno'];
let acumulado = null;


let db = cargar();
let vistaActual = 'inicio';
let fechaSeleccionada = hoyISO();
let estado = recalcular();

function recalcular() {
  const historial = construirHistorial(db, hoyISO());
  return estadoDesdeHistorial(historial, {
    exenciones: db.exenciones,
    monedasGastadas: db.monedasGastadas,
    diasPorSemana: db.plan.diasPorSemana,
  });
}

function contexto() {
  return {
    db,
    estado,
    hoy: hoyISO(),
    fecha: fechaSeleccionada,
    registroDe: (fecha) => db.dias[fecha] ?? {},
    sesionDe: (fecha) => tipoDeSesion(db.dias[fecha]),
    evaluacionDe: (fecha) => evaluarDia(db.dias[fecha], fecha, { db, hoy: hoyISO() }),
    rutinaDe: (fecha) => rutinaDelDia(db, db.dias[fecha]),
    actualizar,
    actualizarCallado,
    verTutorial,
    refrescar: render,
    verFecha,
    ir,
  };
}

/** Foto del progreso, para poder comparar antes y después de un cambio. */
function progreso() {
  const { nivel, xpEnNivel, xpParaSiguiente } = estado.nivel;
  return {
    xp: estado.xp,
    monedas: estado.monedas.ganadas,
    nivel,
    avance: xpParaSiguiente ? (xpEnNivel / xpParaSiguiente) * 100 : 100,
  };
}

/** Aplica un cambio sobre los datos, lo persiste y repinta. */
function actualizar(mutador) {
  const antes = progreso();
  mutador(db);
  guardar(db);
  estado = recalcular();
  render();

  if (SILENCIOSAS.includes(vistaActual)) acumulado ??= antes;
  else anunciarProgreso(antes, progreso());
}

/**
 * Guarda sin repintar. Lo usan los campos de texto que se editan letra a letra: repintar
 * mientras alguien escribe destruye el campo que tiene bajo el dedo y le roba el foco.
 */
function actualizarCallado(mutador) {
  mutador(db);
  guardar(db);
  estado = recalcular();
}

function verFecha(fecha) {
  fechaSeleccionada = fecha;
  render();
}

function ir(vista) {
  const salgoDelSilencio = SILENCIOSAS.includes(vistaActual) && !SILENCIOSAS.includes(vista);
  vistaActual = vista;
  if (DIARIAS.includes(vista)) fechaSeleccionada = hoyISO();
  render({ alPrincipio: true });

  if (salgoDelSilencio && acumulado) {
    anunciarProgreso(acumulado, progreso());
    acumulado = null;
  }
}

/**
 * Repinta la vista entera. Conserva la posición de la página y lo que haya escrito el
 * usuario, porque si no cada clic dentro de una lista larga le devuelve arriba y el botón
 * siguiente se le mueve bajo el dedo. Solo se sube del todo al cambiar de pantalla.
 */
function render({ alPrincipio = false } = {}) {
  const ctx = contexto();
  const vista = VISTAS[vistaActual];
  const desplazamiento = window.scrollY;
  const escrito = textosEscritos();

  document.getElementById('tituloVista').textContent = TITULOS[vistaActual];
  document.getElementById('subtitulo').textContent = vista.subtitulo ? vista.subtitulo(ctx) : '';
  document.getElementById('saldo').textContent = `🪙 ${estado.monedas.disponibles}`;
  document.body.dataset.vista = vistaActual;
  pintarBarraXp();
  document.getElementById('vista').innerHTML = vista.render(ctx);

  document.querySelectorAll('#nav button').forEach((boton) => {
    const activa = boton.dataset.vista === vistaActual;
    boton.toggleAttribute('aria-current', activa);
    if (activa) boton.setAttribute('aria-current', 'page');
  });

  restaurarTextos(escrito);
  window.scrollTo(0, alPrincipio ? 0 : desplazamiento);
}

/** Nivel y avance en la cabecera, visibles desde cualquier sección. */
function pintarBarraXp() {
  const { nivel, xpEnNivel, xpParaSiguiente } = estado.nivel;
  const avance = xpParaSiguiente ? (xpEnNivel / xpParaSiguiente) * 100 : 100;

  document.getElementById('nivelCabecera').textContent = `Nv ${nivel}`;
  document.getElementById('barraXp').firstElementChild.style.width = `${Math.min(100, avance)}%`;
}

/** Lo que el usuario estuviera escribiendo, para que un repintado no se lo borre. */
function textosEscritos() {
  const campos = document.querySelectorAll('#vista input[type="text"], #vista textarea');
  return [...campos]
    .filter((campo) => campo.id || campo.dataset.nuevo)
    .map((campo) => [campo.id || `nuevo:${campo.dataset.nuevo}`, campo.value]);
}

function restaurarTextos(escrito) {
  escrito.forEach(([clave, valor]) => {
    if (!valor) return;
    const campo = clave.startsWith('nuevo:')
      ? document.querySelector(`#vista [data-nuevo="${clave.slice(6)}"]`)
      : document.getElementById(clave);
    if (campo) campo.value = valor;
  });
}

/**
 * Qué evento atiende cada elemento, uno y solo uno.
 *
 * Un `<select>` escucha `change` y nunca el clic: si atendiera el clic, repintaríamos con
 * el desplegable abierto y se cerraría solo al soltar, que es justo lo que pasaba.
 * Un campo con `data-directo` escucha `input`, para guardar lo escrito en cada pulsación
 * sin repintar a media palabra. Todo lo demás son botones y escuchan el clic.
 */
function eventoDe(elemento) {
  if (elemento.hasAttribute('data-directo')) return 'input';
  return elemento.matches('select, input, textarea') ? 'change' : 'click';
}

function manejar(evento) {
  const elemento = evento.target.closest('[data-accion]');
  if (!elemento) return;
  if (evento.type !== eventoDe(elemento)) return;

  const accion = VISTAS[vistaActual].acciones?.[elemento.dataset.accion];
  if (!accion) return;

  evento.preventDefault();
  accion(elemento, contexto());
}

document.getElementById('vista').addEventListener('click', manejar);
document.getElementById('vista').addEventListener('change', manejar);
document.getElementById('vista').addEventListener('input', manejar);
document.getElementById('nav').addEventListener('click', (evento) => {
  const boton = evento.target.closest('button[data-vista]');
  if (boton) ir(boton.dataset.vista);
});

/** El recorrido guiado, desde el arranque la primera vez o a mano desde Ajustes. */
function verTutorial() {
  empezarTutorial(ir, () => {
    actualizar((datos) => {
      datos.tutorialVisto = true;
    });
  });
}

render();

if (!db.tutorialVisto) verTutorial();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
