// Pantalla de entrada: el atleta escribe su código.

import { h, montar } from '../comun/ui.js';
import { normalizarCodigo } from '../nucleo/codigos.js';
import { CODIGOS_DEMO } from '../datos/ejemplo.js';

export function pantallaEntrar(ctx, { aviso = null, codigo = '', cambiando = false } = {}) {
  const entrada = h('input', {
    id: 'codigo', class: 'entrada entrada-codigo', name: 'codigo', value: codigo,
    autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', enterkeyhint: 'go',
    placeholder: 'NOMBRE-XXXXXX', 'aria-describedby': 'error-codigo',
  });
  const error = h('p', { id: 'error-codigo', class: 'error', 'aria-live': 'polite' }, aviso && aviso !== 'cancelado' ? aviso : '');
  const boton = h('button', { type: 'submit', class: 'boton boton-principal boton-ancho' }, 'Entrar');

  const formulario = h('form', {
    class: 'pila', novalidate: true,
    onsubmit: async (e) => {
      e.preventDefault();
      const c = normalizarCodigo(entrada.value);
      if (!c) {
        error.textContent = 'Ese código no tiene buena pinta: son letras, un guion y 6 caracteres.';
        entrada.setAttribute('aria-invalid', 'true');
        entrada.focus();
        return;
      }
      if (cambiando && c === ctx.sesion?.codigo) { ctx.ir('#/'); return; }
      boton.disabled = true;
      boton.textContent = 'Entrando…';
      const fallo = await ctx.entrarCon(c);
      boton.disabled = false;
      boton.textContent = 'Entrar';
      if (fallo && fallo !== 'cancelado') {
        error.textContent = fallo;
        entrada.setAttribute('aria-invalid', 'true');
      }
    },
  },
  h('label', { class: 'oculto-visual', for: 'codigo' }, 'Tu código'),
  entrada, error, boton);

  const demo = ctx.almacen?.tipo === 'demo'
    ? h('p', { class: 'aviso-demo' }, 'Modo demo. Prueba con ',
      h('button', { type: 'button', class: 'boton-texto', onclick: () => { entrada.value = CODIGOS_DEMO.laura; entrada.focus(); } }, CODIGOS_DEMO.laura),
      ' o con ',
      h('button', { type: 'button', class: 'boton-texto', onclick: () => { entrada.value = CODIGOS_DEMO.pablo; entrada.focus(); } }, CODIGOS_DEMO.pablo),
      '.')
    : null;

  montar(h('main', { class: 'entrada-pantalla' },
    h('div', { class: 'logo-completo', role: 'img', 'aria-label': 'Beep Run Club' }),
    h('h1', {}, cambiando ? 'Entrar con otro código' : 'Tu plan de entrenamiento'),
    h('p', { class: 'intro suave' }, 'Escribe el código que te ha dado tu entrenador.'),
    formulario,
    demo,
    cambiando ? h('button', { type: 'button', class: 'boton-texto', style: { marginTop: '12px' }, onclick: () => ctx.ir('#/') }, 'Volver a mi plan') : null));
  if (aviso) entrada.setAttribute('aria-invalid', 'true');
}
