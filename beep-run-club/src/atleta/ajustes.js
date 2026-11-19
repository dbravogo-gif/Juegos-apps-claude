// Ajustes: tema, código, cerrar sesión y privacidad.

import { h, montar, confirmar, tostada } from '../comun/ui.js';
import { TEMAS, temaGuardado, guardarTema } from '../comun/tema.js';
import { VERSION } from '../version.js';
import { cabecera } from './semana.js';

export function pantallaAjustes(ctx) {
  const demo = ctx.almacen.tipo === 'demo';
  const botonesTema = TEMAS.map(([valor, texto]) => h('button', {
    type: 'button', role: 'radio', 'aria-checked': String(temaGuardado() === valor),
    onclick: () => {
      guardarTema(valor);
      botonesTema.forEach((b, i) => b.setAttribute('aria-checked', String(TEMAS[i][0] === valor)));
    },
  }, texto));

  montar(
    cabecera(ctx, { atras: { etiqueta: 'Volver a la semana', accion: () => ctx.ir('#/') } }),
    h('h1', { class: 'saludo' }, 'Ajustes'),
    h('ul', { class: 'lista-ajustes' },
      h('li', {},
        h('h2', { id: 'titulo-tema' }, 'Tema'),
        h('div', { class: 'segmentado', role: 'radiogroup', 'aria-labelledby': 'titulo-tema' }, botonesTema)),
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
      h('li', {},
        h('h2', {}, 'Privacidad'),
        h('p', {}, 'Tu entrenador guarda tu nombre, tu plan y tus valoraciones (esfuerzo, ejercicios duros, tiempos y comentarios) para ajustar tus entrenamientos. No se guarda tu email ni tu teléfono.'),
        h('p', {}, demo
          ? 'En el modo demo todo se queda en este móvil.'
          : 'Los datos se guardan en servidores de la Unión Europea. Si te das de baja, puedes pedirle que lo borre todo.')),
      demo ? h('li', {},
        h('button', {
          type: 'button', class: 'boton-texto',
          onclick: async () => { await ctx.almacen.reiniciar(); tostada('Datos de ejemplo reiniciados'); },
        }, 'Reiniciar los datos de ejemplo')) : null,
      h('li', { class: 'suave' }, `Beep Run Club · versión ${VERSION}`)),
  );
}
