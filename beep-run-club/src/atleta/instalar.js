// Tutorial para instalar la app en la pantalla de inicio (iPhone y Android). Se ofrece una vez,
// después de aceptar la protección de datos, y queda en Ajustes.

import { h, icono, montar, tostada } from '../comun/ui.js';
import { leerLocal, guardarLocal } from '../comun/entorno.js';
import { plataforma } from '../nucleo/plataforma.js';

const CLAVE_OFRECIDO = 'beep_instalar_ofrecido';
let avisoNativo = null; // el «Instalar» de Chrome en Android, si lo ofrece

export function capturarInstalacion() {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); avisoNativo = e; });
  window.addEventListener('appinstalled', () => { avisoNativo = null; });
}

export function estaInstalada() {
  return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

export const plataformaActual = () => plataforma(navigator.userAgent, navigator.maxTouchPoints || 0);

/** Se ofrece una sola vez, en móvil y si no está ya instalada. */
export function debeOfrecerInstalar() {
  return plataformaActual() !== 'escritorio' && !estaInstalada() && !leerLocal(CLAVE_OFRECIDO);
}

function ilustracion(nombreIcono, etiqueta) {
  return h('div', { class: 'ilustracion', 'aria-hidden': 'true' },
    h('div', { class: 'ilustracion-icono' }, icono(nombreIcono)),
    etiqueta ? h('div', { class: 'ilustracion-boton' }, etiqueta) : null);
}

function pasos(tipo, codigo) {
  const recordatorio = h('div', { class: 'recordatorio-codigo' },
    h('p', { style: { margin: 0 } }, 'Si al abrirla te pide el código, es este:'),
    h('p', { class: 'codigo-grande', style: { margin: '6px 0' } }, codigo),
    h('button', { type: 'button', class: 'boton-texto', onclick: () => copiar(codigo) }, 'Copiar el código'));
  if (tipo === 'ios-safari') {
    return [
      { titulo: 'Toca el botón Compartir', texto: 'Es el cuadrado con una flecha hacia arriba, en la barra de Safari. Si no lo ves, toca primero «···» o la barra de direcciones.', ilustracion: ilustracion('compartir', 'Compartir') },
      { titulo: 'Toca «Añadir a pantalla de inicio»', texto: 'Está en la lista que se abre. Si no aparece, desliza la lista hacia arriba o toca «Ver más».', ilustracion: ilustracion('anadirInicio', 'Añadir a pantalla de inicio') },
      { titulo: 'Toca «Añadir»', texto: 'Arriba a la derecha. Si ves «Abrir como app web», déjalo activado. Ya tienes Beep en tu pantalla de inicio: ábrela desde el icono.', ilustracion: h('img', { class: 'ilustracion-app', src: 'icons/icon-192.png', alt: '' }), extra: recordatorio },
    ];
  }
  if (tipo === 'ios-otro') {
    return [
      { titulo: 'Toca el botón Compartir', texto: 'Es el cuadrado con una flecha hacia arriba. En Chrome está en la barra de direcciones, arriba a la derecha.', ilustracion: ilustracion('compartir', 'Compartir') },
      { titulo: 'Toca «Añadir a pantalla de inicio»', texto: 'Si no aparece, abre este mismo enlace en Safari y sigue allí los pasos.', ilustracion: ilustracion('anadirInicio', 'Añadir a pantalla de inicio'),
        extra: h('button', { type: 'button', class: 'boton boton-ancho', onclick: () => copiar(location.href) }, icono('enlace'), 'Copiar el enlace para Safari') },
      { titulo: 'Toca «Añadir»', texto: 'Ya tienes Beep en tu pantalla de inicio: ábrela desde el icono.', ilustracion: h('img', { class: 'ilustracion-app', src: 'icons/icon-192.png', alt: '' }), extra: recordatorio },
    ];
  }
  return [
    { titulo: 'Toca ⋮ arriba a la derecha', texto: 'Es el menú de tres puntos de Chrome.', ilustracion: ilustracion('puntos', null) },
    { titulo: 'Toca «Instalar aplicación»', texto: 'O «Añadir a pantalla de inicio», según tu móvil.', ilustracion: ilustracion('anadirInicio', 'Instalar aplicación') },
    { titulo: 'Confirma con «Instalar»', texto: 'Ya tienes Beep en tu pantalla de inicio: ábrela desde el icono.', ilustracion: h('img', { class: 'ilustracion-app', src: 'icons/icon-192.png', alt: '' }), extra: recordatorio },
  ];
}

async function copiar(texto) {
  try { await navigator.clipboard.writeText(texto); tostada('Copiado'); } catch { tostada(texto, { duracion: 8000 }); }
}

/**
 * Tutorial: ¿quiere instalarla? → ¿iPhone o Android? → pasos de ese móvil. Desde los pasos se
 * puede volver a elegir el móvil, por si se equivocó. `directo`: desde Ajustes, sin la primera
 * pregunta.
 */
export function pantallaInstalar(ctx, { directo = false } = {}) {
  guardarLocal(CLAVE_OFRECIDO, true);
  const terminar = () => ctx.ir('#/');
  if (directo) elegirMovil(ctx, terminar);
  else ofrecer(ctx, terminar);
}

function ofrecer(ctx, terminar) {
  montar(h('main', { class: 'instalar pila' },
    h('div', { class: 'mascota', role: 'img', 'aria-label': 'La mascota de Beep', style: { width: 'min(70vw, 260px)', marginTop: '32px' } }),
    h('h1', { style: { textAlign: 'center' } }, '¿Quieres Beep como una app?'),
    h('p', { style: { textAlign: 'center' } }, 'Así la abres desde la pantalla de inicio, a pantalla completa y sin buscar el enlace. Te enseñamos cómo en 3 pasos.'),
    h('button', { type: 'button', class: 'boton boton-principal boton-ancho', onclick: () => elegirMovil(ctx, terminar) }, 'Sí, enséñame'),
    h('button', { type: 'button', class: 'boton boton-ancho', onclick: terminar }, 'Ahora no'),
    h('p', { class: 'suave', style: { textAlign: 'center', fontSize: '15px' } }, 'Puedes verlo más tarde en Ajustes.')));
}

function elegirMovil(ctx, terminar) {
  if (estaInstalada()) {
    montar(h('main', { class: 'instalar pila' }, h('h1', { style: { marginTop: '40px' } }, 'Ya la tienes instalada'),
      h('p', {}, 'Estás usando Beep desde la pantalla de inicio. No hay nada más que hacer.'),
      h('button', { type: 'button', class: 'boton boton-principal boton-ancho', onclick: terminar }, 'Volver a mi plan')));
    return;
  }
  const opcion = (movil, texto, detalle) => h('button', {
    type: 'button', class: 'opcion-movil', onclick: () => mostrarPasos(ctx, movil, terminar),
  }, h('span', { class: 'opcion-movil-titulo' }, texto), h('span', { class: 'suave' }, detalle));
  montar(h('main', { class: 'instalar pila' },
    h('p', { class: 'antetitulo', style: { marginTop: '28px', textAlign: 'center' } }, 'Instalar Beep'),
    h('h1', { style: { textAlign: 'center' } }, '¿Qué móvil usas?'),
    h('p', { style: { textAlign: 'center' } }, 'Los pasos cambian según el móvil. Si te equivocas, podrás volver a elegir.'),
    h('div', { class: 'opciones-movil' },
      opcion('iphone', 'iPhone', 'Con Safari, Chrome u otro navegador'),
      opcion('android', 'Android', 'Samsung, Xiaomi, Pixel, Motorola…')),
    h('button', { type: 'button', class: 'boton-texto', style: { alignSelf: 'center', marginTop: 'auto' }, onclick: terminar }, 'Ahora no')));
}

function mostrarPasos(ctx, movil, terminar) {
  const volverAElegir = () => elegirMovil(ctx, terminar);
  const cambiar = h('button', { type: 'button', class: 'boton-texto', style: { alignSelf: 'center' }, onclick: volverAElegir },
    movil === 'iphone' ? '¿No usas iPhone? Cambiar de móvil' : '¿No usas Android? Cambiar de móvil');

  if (movil === 'android' && avisoNativo) {
    montar(h('main', { class: 'instalar pila' },
      h('img', { class: 'ilustracion-app', src: 'icons/icon-192.png', alt: '', style: { marginTop: '40px' } }),
      h('h1', { style: { textAlign: 'center' } }, 'Instálala en un toque'),
      h('p', { style: { textAlign: 'center' } }, 'Tu móvil te preguntará si quieres instalar Beep. Di que sí.'),
      h('button', {
        type: 'button', class: 'boton boton-principal boton-ancho',
        onclick: async () => {
          avisoNativo.prompt();
          const { outcome } = await avisoNativo.userChoice.catch(() => ({ outcome: 'dismissed' }));
          avisoNativo = null;
          if (outcome === 'accepted') { tostada('¡Instalada! Ábrela desde tu pantalla de inicio.'); terminar(); }
        },
      }, 'Instalar'),
      h('button', { type: 'button', class: 'boton boton-ancho', onclick: volverAElegir }, 'Anterior'),
      cambiar));
    return;
  }

  // En iPhone, los pasos de Safari salvo que esté en otro navegador.
  const tipo = movil === 'iphone' ? (plataformaActual() === 'ios-otro' ? 'ios-otro' : 'ios-safari') : 'android';
  const lista = pasos(tipo, ctx.sesion?.codigo ?? '');
  let i = 0;
  const pintar = () => {
    const p = lista[i];
    const ultimo = i === lista.length - 1;
    montar(h('main', { class: 'instalar pila' },
      h('p', { class: 'antetitulo', style: { marginTop: '28px', textAlign: 'center' } }, `${movil === 'iphone' ? 'iPhone' : 'Android'} · paso ${i + 1} de ${lista.length}`),
      p.ilustracion,
      h('h1', { style: { textAlign: 'center' } }, p.titulo),
      h('p', { style: { textAlign: 'center' } }, p.texto),
      p.extra ?? null,
      h('div', { class: 'pasos-botones' },
        // En el paso 1, «Anterior» vuelve a la elección de móvil.
        h('button', { type: 'button', class: 'boton', onclick: () => { if (i === 0) volverAElegir(); else { i -= 1; pintar(); } } }, 'Anterior'),
        h('button', { type: 'button', class: 'boton boton-principal', onclick: () => { if (ultimo) terminar(); else { i += 1; pintar(); } } }, ultimo ? 'Hecho' : 'Siguiente')),
      cambiar,
      h('button', { type: 'button', class: 'boton-texto', style: { alignSelf: 'center' }, onclick: terminar }, 'Ahora no')));
  };
  pintar();
}
