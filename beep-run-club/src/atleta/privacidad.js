// Protección de datos: hay que aceptarla antes de entrar por primera vez en este móvil, y otra vez
// si el entrenador publica una versión nueva pidiendo que se acepte de nuevo. La aceptación se
// guarda en el móvil y se registra con él en el almacén.

import { h, icono, montar } from '../comun/ui.js';
import { leerLocal, guardarLocal } from '../comun/entorno.js';
import { necesitaAceptar } from '../nucleo/privacidad.js';
import { cabecera } from './semana.js';

const CLAVE = 'beep_privacidad';

export const aceptacionGuardada = () => leerLocal(CLAVE);
export const faltaAceptar = (politica) => necesitaAceptar(aceptacionGuardada(), politica.version);

/** Los apartados de la política; arriba, quién es el responsable y cómo contactar. */
export function textoPolitica(politica) {
  const { nombre, email } = politica.responsable ?? {};
  return [
    h('section', { class: 'texto-legal' }, h('h3', {}, 'Quién es el responsable'),
      h('p', {}, nombre ? `${nombre} (Beep Run Club) es responsable de tus datos.` : 'Tu entrenador de Beep Run Club es responsable de tus datos.'),
      h('p', {}, email ? `Email de contacto: ${email}` : 'Para cualquier duda o petición, habla con tu entrenador.')),
    ...politica.secciones.map(({ titulo, texto }) => h('section', { class: 'texto-legal' }, h('h3', {}, titulo),
      texto.split(/\n\s*\n/).map((p) => h('p', {}, p.trim())))),
  ];
}

/**
 * Pinta la pantalla y espera: devuelve la aceptación { version, fecha } o null si no acepta.
 * `actualizada`: ya la había aceptado antes y el entrenador la ha cambiado.
 */
export function pedirPrivacidad(politica, { actualizada = false } = {}) {
  return new Promise((resolver) => {
    const casilla = h('input', { type: 'checkbox', id: 'acepto' });
    const aceptar = h('button', { type: 'button', class: 'boton boton-principal boton-ancho', disabled: true }, 'Aceptar y continuar');
    casilla.addEventListener('change', () => { aceptar.disabled = !casilla.checked; });
    aceptar.addEventListener('click', () => {
      const aceptacion = { version: politica.version, fecha: new Date().toISOString() };
      guardarLocal(CLAVE, aceptacion);
      resolver(aceptacion);
    });
    montar(h('main', { class: 'privacidad pila' },
      h('div', { class: 'logo', role: 'img', 'aria-label': 'Beep Run Club', style: { width: '96px', margin: '24px auto 8px' } }),
      h('h1', { style: { textAlign: 'center' } }, actualizada ? 'Hemos actualizado la protección de datos' : 'Antes de empezar'),
      h('p', { style: { textAlign: 'center' } }, actualizada
        ? 'Tu entrenador ha cambiado la información sobre tus datos. Léela y acéptala para seguir usando la app.'
        : 'Tu entrenador va a guardar algunos datos para preparar tus entrenamientos.'),
      h('ul', { class: 'resumen-legal' }, politica.resumen.map((t) => h('li', {}, icono('check'), h('span', {}, t)))),
      h('details', { class: 'detalle-legal', open: actualizada }, h('summary', {}, 'Leer la información completa'), textoPolitica(politica)),
      h('label', { class: 'casilla casilla-legal', for: 'acepto' }, casilla,
        h('span', {}, 'He leído la información y acepto que mi entrenador trate mis datos, incluidos los de salud que yo le cuente (esfuerzo, molestias, comentarios), para preparar mis entrenamientos.')),
      aceptar,
      h('button', { type: 'button', class: 'boton boton-ancho', onclick: () => resolver(null) }, 'No acepto')));
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
    h('div', { class: 'pila' }, textoPolitica(ctx.politica)),
    h('p', { class: 'suave bloque' }, 'Para retirar tu permiso o pedir que se borren tus datos, escribe al email de contacto o habla con tu entrenador. Al cerrar sesión en este móvil se borra lo que guarda la app en él.'));
}
