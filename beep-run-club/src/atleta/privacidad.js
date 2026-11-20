// Protección de datos: hay que aceptarla antes de entrar por primera vez en este móvil (y otra vez
// si cambia el texto). La aceptación se guarda en el móvil y se registra con él en el almacén.

import { h, icono, montar } from '../comun/ui.js';
import { leerLocal, guardarLocal } from '../comun/entorno.js';
import { RESPONSABLE } from '../config.js';
import { VERSION_PRIVACIDAD, necesitaAceptar } from '../nucleo/privacidad.js';
import { resumenPrivacidad, textoPrivacidad } from '../datos/textos-privacidad.js';
import { cabecera } from './semana.js';

const CLAVE = 'beep_privacidad';

export const aceptacionGuardada = () => leerLocal(CLAVE);
export const faltaAceptar = () => necesitaAceptar(aceptacionGuardada());

function textoCompleto() {
  return textoPrivacidad(RESPONSABLE).map(({ titulo, parrafos }) =>
    h('section', { class: 'texto-legal' }, h('h3', {}, titulo), parrafos.map((p) => h('p', {}, p))));
}

/** Pinta la pantalla y espera: devuelve la aceptación { version, fecha } o null si no acepta. */
export function pedirPrivacidad() {
  return new Promise((resolver) => {
    const casilla = h('input', { type: 'checkbox', id: 'acepto' });
    const aceptar = h('button', { type: 'button', class: 'boton boton-principal boton-ancho', disabled: true }, 'Aceptar y continuar');
    const aviso = h('p', { class: 'error', 'aria-live': 'polite' });
    casilla.addEventListener('change', () => { aceptar.disabled = !casilla.checked; aviso.textContent = ''; });
    aceptar.addEventListener('click', () => {
      const aceptacion = { version: VERSION_PRIVACIDAD, fecha: new Date().toISOString() };
      guardarLocal(CLAVE, aceptacion);
      resolver(aceptacion);
    });
    montar(h('main', { class: 'privacidad pila' },
      h('div', { class: 'logo', role: 'img', 'aria-label': 'Beep Run Club', style: { width: '96px', margin: '24px auto 8px' } }),
      h('h1', { style: { textAlign: 'center' } }, 'Antes de empezar'),
      h('p', { style: { textAlign: 'center' } }, 'Tu entrenador va a guardar algunos datos para preparar tus entrenamientos.'),
      h('ul', { class: 'resumen-legal' }, resumenPrivacidad().map((t) => h('li', {}, icono('check'), h('span', {}, t)))),
      h('details', { class: 'detalle-legal' }, h('summary', {}, 'Leer la información completa'), textoCompleto()),
      h('label', { class: 'casilla casilla-legal', for: 'acepto' }, casilla,
        h('span', {}, 'He leído la información y acepto que mi entrenador trate mis datos, incluidos los de salud que yo le cuente (esfuerzo, molestias, comentarios), para preparar mis entrenamientos.')),
      aviso,
      aceptar,
      h('button', {
        type: 'button', class: 'boton boton-ancho',
        onclick: () => resolver(null),
      }, 'No acepto')));
  });
}

/** Consulta desde Ajustes: el texto completo y cuándo se aceptó. */
export function pantallaPrivacidad(ctx) {
  const a = aceptacionGuardada();
  const fecha = a?.fecha ? new Date(a.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  montar(
    cabecera(ctx, { atras: { etiqueta: 'Volver a ajustes', accion: () => ctx.volver('#/ajustes') } }),
    h('h1', { class: 'saludo' }, 'Protección de datos'),
    fecha ? h('p', { class: 'suave' }, `La aceptaste el ${fecha}.`) : null,
    h('div', { class: 'pila' }, textoCompleto()),
    h('p', { class: 'suave bloque' }, 'Para retirar tu permiso o pedir que se borren tus datos, habla con tu entrenador. Al cerrar sesión en este móvil se borra lo que guarda la app en él.'));
}
