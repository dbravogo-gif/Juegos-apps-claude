// Ajustes: tema, código, cerrar sesión y privacidad.

import { h, montar, confirmar, tostada, grupoRadio } from '../comun/ui.js';
import { TEMAS, temaGuardado, guardarTema } from '../comun/tema.js';
import { VERSION } from '../version.js';
import { cabecera, esRutaCalendario } from './semana.js';
import { estaInstalada } from './instalar.js';

export function pantallaAjustes(ctx) {
  const demo = ctx.almacen.tipo === 'demo';

  montar(
    cabecera(ctx, { atras: { etiqueta: 'Volver a la semana', accion: () => ctx.volver('#/', esRutaCalendario) } }),
    h('h1', { class: 'saludo' }, 'Ajustes'),
    h('ul', { class: 'lista-ajustes' },
      h('li', {}, grupoRadio({ etiqueta: 'Tema', opciones: TEMAS, valor: temaGuardado(), alElegir: guardarTema })),
      h('li', { class: 'pila' },
        h('h2', {}, 'Tu código'),
        h('p', {}, h('b', { style: { fontFamily: 'var(--titular)', fontSize: '20px', letterSpacing: '0.06em' } }, ctx.sesion.codigo),
          h('span', { class: 'suave' }, ` · ${ctx.sesion.nombre}`)),
        h('button', { type: 'button', class: 'boton boton-ancho', onclick: () => ctx.ir('#/entrar') }, 'Entrar con otro código'),
        h('button', {
          type: 'button', class: 'boton boton-ancho',
          onclick: async () => {
            const si = await confirmar({
              titulo: '¿Cerrar sesión?',
              texto: 'Para volver a entrar necesitarás tu código.',
              aceptar: 'Cerrar sesión',
            });
            if (si) ctx.cerrarSesion();
          },
        }, 'Cerrar sesión')),
      estaInstalada() ? null : h('li', {},
        h('button', { type: 'button', class: 'boton boton-ancho', onclick: () => ctx.ir('#/instalar/pasos') }, 'Instalar en la pantalla de inicio')),
      h('li', {},
        h('h2', {}, 'Privacidad'),
        h('p', {}, 'Tu entrenador guarda tu nombre, tu plan y tus valoraciones (esfuerzo, ejercicios duros, tiempos y comentarios) para ajustar tus entrenamientos. No se guarda tu email ni tu teléfono.'),
        h('p', {}, demo
          ? 'En el modo demo todo se queda en este móvil.'
          : 'Los datos se guardan en servidores de la Unión Europea. Si te das de baja, puedes pedirle que lo borre todo.'),
        h('button', { type: 'button', class: 'boton-texto', onclick: () => ctx.ir('#/privacidad') }, 'Leer la información completa')),
      demo ? h('li', {},
        h('button', {
          type: 'button', class: 'boton-texto',
          onclick: async () => {
            const si = await confirmar({ titulo: '¿Reiniciar la demo?', texto: 'Se borran tus valoraciones y lo que haya cambiado el entrenador en este navegador, y vuelven los datos de ejemplo.', aceptar: 'Reiniciar' });
            if (si) { await ctx.almacen.reiniciar(); tostada('Datos de ejemplo reiniciados'); }
          },
        }, 'Reiniciar los datos de ejemplo')) : null,
      h('li', { class: 'suave' }, `Beep Run Club · versión ${VERSION}`)),
  );
}
