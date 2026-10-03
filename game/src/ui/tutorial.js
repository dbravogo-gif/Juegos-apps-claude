import { esc } from './util.js';
import { figura } from './sprite.js';
import { PASOS, POSES_GUIA } from '../data/tutorial.js';

/**
 * Recorrido guiado de la app, con el héroe de profesor.
 *
 * Vive fuera de las vistas y encima de ellas: cambia de sección por su cuenta, así que no
 * puede depender de que ninguna siga montada. Lo que resalta se busca por `data-guia`.
 */

let paso = 0;
let ir = null;
let alTerminar = null;

const capa = () => document.getElementById('tutorial');

/** Empieza el recorrido. `navegar` es la función que cambia de sección. */
export function empezar(navegar, terminado) {
  ir = navegar;
  alTerminar = terminado;
  paso = 0;
  capa().hidden = false;
  document.body.classList.add('con-tutorial');
  pintar();
}

function terminar() {
  capa().hidden = true;
  capa().innerHTML = '';
  document.body.classList.remove('con-tutorial');
  alTerminar?.();
}

/**
 * Coloca el foco sobre el elemento señalado. El agujero es una sombra enorme alrededor de
 * un recuadro transparente: así se oscurece todo menos lo que se está explicando, sin tener
 * que recortar nada.
 */
function enfocar(guia) {
  const objetivo = guia ? document.querySelector(`[data-guia="${guia}"]`) : null;
  const foco = capa().querySelector('.foco');
  if (!objetivo) {
    foco.hidden = true;
    return null;
  }

  objetivo.scrollIntoView({ block: 'center', behavior: 'instant' });
  const caja = objetivo.getBoundingClientRect();
  const margen = 6;

  foco.hidden = false;
  Object.assign(foco.style, {
    top: `${caja.top - margen}px`,
    left: `${caja.left - margen}px`,
    width: `${caja.width + margen * 2}px`,
    height: `${caja.height + margen * 2}px`,
  });
  return caja;
}

/** El globo se pone donde no tape lo señalado: debajo si hay sitio, y si no, encima. */
function colocarGlobo(caja) {
  const globo = capa().querySelector('.globo');
  if (!caja) {
    globo.style.top = '';
    globo.classList.add('centrado');
    return;
  }

  globo.classList.remove('centrado');
  const alto = globo.offsetHeight;
  const cabeDebajo = caja.bottom + alto + 24 < window.innerHeight;
  globo.style.top = cabeDebajo ? `${caja.bottom + 16}px` : `${Math.max(12, caja.top - alto - 16)}px`;
}

function pintar() {
  const actual = PASOS[paso];
  const ultimo = paso === PASOS.length - 1;

  capa().innerHTML = `
    <div class="foco" hidden></div>
    <div class="globo">
      <div class="quien">
        ${figura('personaje', 'etapa1_guia', 'Tú', { pose: POSES_GUIA[actual.pose] ?? 0, poses: 3 })}
        <b>${esc(actual.titulo)}</b>
      </div>
      <p>${esc(actual.texto)}</p>
      <div class="pasos-guia">
        ${PASOS.map((_, i) => `<i class="${i === paso ? 'aqui' : ''}"></i>`).join('')}
      </div>
      <div class="fila">
        <button class="boton secundario fino" data-guia-accion="saltar">${ultimo ? 'Cerrar' : 'Saltar'}</button>
        ${ultimo ? '' : '<button class="boton fino" data-guia-accion="siguiente">Siguiente</button>'}
      </div>
    </div>`;

  // La sección se pinta primero: hasta que no está, lo que hay que señalar no existe.
  ir(actual.vista);
  requestAnimationFrame(() => colocarGlobo(enfocar(actual.guia)));
}

function avanzar() {
  if (paso >= PASOS.length - 1) return terminar();
  paso += 1;
  pintar();
}

document.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-guia-accion]');
  if (!boton || capa().hidden) return;

  evento.preventDefault();
  evento.stopPropagation();
  if (boton.dataset.guiaAccion === 'saltar') terminar();
  else avanzar();
});

// Al girar el móvil o cambiar el teclado, lo señalado se mueve y el foco se queda colgado.
window.addEventListener('resize', () => {
  if (!capa().hidden) colocarGlobo(enfocar(PASOS[paso].guia));
});
