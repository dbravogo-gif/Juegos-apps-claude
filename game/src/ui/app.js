import { cargar, guardar } from '../data/storage.js';
import { construirHistorial, planDelDia, evaluarDia } from '../data/history.js';
import { estadoDesdeHistorial } from '../core/state.js';

import * as inicio from './vistas/inicio.js';
import * as registrar from './vistas/registrar.js';
import * as progreso from './vistas/progreso.js';
import * as ajustes from './vistas/ajustes.js';

const VISTAS = { inicio, registrar, progreso, ajustes };
const TITULOS = { inicio: 'Hoy', registrar: 'Registrar', progreso: 'Progreso', ajustes: 'Ajustes' };

/** Fecha local, no UTC: pasada la medianoche en UTC+2 el día ISO aún sería el anterior. */
export function hoyISO() {
  const ahora = new Date();
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export const esc = (texto) =>
  String(texto ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const plural = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;

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
    evaluacionDe: (fecha) => evaluarDia(db.dias[fecha], planDelDia(db.plan, fecha), fecha),
    rutinaDe: (fecha) => {
      const dia = new Date(`${fecha}T00:00:00Z`).getUTCDay();
      const indice = (dia + 6) % 7;
      const id = db.plan.rutinaPorDia?.[indice];
      return db.rutinas.find((r) => r.id === id) ?? db.rutinas[0] ?? null;
    },
    actualizar,
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

function verFecha(fecha) {
  fechaSeleccionada = fecha;
  render();
}

function ir(vista) {
  vistaActual = vista;
  if (vista === 'registrar') fechaSeleccionada = hoyISO();
  render();
}

function render() {
  const ctx = contexto();
  const vista = VISTAS[vistaActual];

  document.getElementById('tituloVista').textContent = TITULOS[vistaActual];
  document.getElementById('subtitulo').textContent = vista.subtitulo ? vista.subtitulo(ctx) : '';
  document.getElementById('saldo').textContent = `🪙 ${estado.monedas.disponibles}`;
  document.getElementById('vista').innerHTML = vista.render(ctx);

  document.querySelectorAll('#nav button').forEach((boton) => {
    const activa = boton.dataset.vista === vistaActual;
    boton.toggleAttribute('aria-current', activa);
    if (activa) boton.setAttribute('aria-current', 'page');
  });

  window.scrollTo(0, 0);
}

function manejar(evento) {
  const elemento = evento.target.closest('[data-accion]');
  if (!elemento) return;

  const accion = VISTAS[vistaActual].acciones?.[elemento.dataset.accion];
  if (!accion) return;

  evento.preventDefault();
  accion(elemento, contexto());
}

document.getElementById('vista').addEventListener('click', manejar);
document.getElementById('vista').addEventListener('change', manejar);
document.getElementById('nav').addEventListener('click', (evento) => {
  const boton = evento.target.closest('button[data-vista]');
  if (boton) ir(boton.dataset.vista);
});

render();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
