import { cargar, guardar } from '../data/storage.js';
import { construirHistorial, planDelDia, evaluarDia, rutinaDelDia } from '../data/history.js';
import { estadoDesdeHistorial } from '../core/state.js';
import { hoyISO } from './util.js';

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


let db = cargar();
let vistaActual = 'inicio';
let fechaSeleccionada = hoyISO();
let estado = recalcular();

function recalcular() {
  const historial = construirHistorial(db, hoyISO());
  return estadoDesdeHistorial(historial, {
    exenciones: db.exenciones,
    monedasGastadas: db.monedasGastadas,
  });
}

function contexto() {
  return {
    db,
    estado,
    hoy: hoyISO(),
    fecha: fechaSeleccionada,
    registroDe: (fecha) => db.dias[fecha] ?? {},
    planDe: (fecha) => db.dias[fecha]?.planEntreno ?? planDelDia(db.plan, fecha),
    evaluacionDe: (fecha) => evaluarDia(db.dias[fecha], planDelDia(db.plan, fecha), fecha, { db, hoy: hoyISO() }),
    rutinaDe: (fecha) => rutinaDelDia(db, fecha),
    actualizar,
    actualizarCallado,
    refrescar: render,
    verFecha,
    ir,
  };
}

/** Aplica un cambio sobre los datos, lo persiste y repinta. */
function actualizar(mutador) {
  mutador(db);
  guardar(db);
  estado = recalcular();
  render();
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
  vistaActual = vista;
  if (DIARIAS.includes(vista)) fechaSeleccionada = hoyISO();
  render({ alPrincipio: true });
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
  document.getElementById('vista').innerHTML = vista.render(ctx);

  document.querySelectorAll('#nav button').forEach((boton) => {
    const activa = boton.dataset.vista === vistaActual;
    boton.toggleAttribute('aria-current', activa);
    if (activa) boton.setAttribute('aria-current', 'page');
  });

  restaurarTextos(escrito);
  window.scrollTo(0, alPrincipio ? 0 : desplazamiento);
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
 * Un campo marcado con `data-directo` se guarda en cada pulsación y no espera al `change`:
 * así lo escrito no se pierde si se cambia de pantalla, y no se repinta a media palabra.
 */
function manejar(evento) {
  const elemento = evento.target.closest('[data-accion]');
  if (!elemento) return;

  const directo = elemento.hasAttribute('data-directo');
  if ((evento.type === 'input') !== directo && evento.type !== 'click') return;

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

render();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
