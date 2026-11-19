// Utilidades de interfaz: crear elementos sin innerHTML (nada de inyectar texto del usuario),
// iconos de línea, avisos breves y diálogos de confirmación accesibles.

/** h('button', { class: 'boton', onclick }, 'Texto', otroNodo) */
export function h(etiqueta, atributos = {}, ...hijos) {
  const el = document.createElement(etiqueta);
  for (const [k, v] of Object.entries(atributos ?? {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') {
      for (const [prop, valor] of Object.entries(v)) {
        if (prop.startsWith('--')) el.style.setProperty(prop, String(valor)); else el.style[prop] = valor;
      }
    }
    else if (k in el && typeof v !== 'string') el[k] = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  agregar(el, hijos);
  return el;
}

/** Añade hijos a un elemento ignorando null y false (el append nativo escribiría «null»). */
export function agregar(el, hijos) {
  for (const hijo of hijos.flat(Infinity)) {
    if (hijo == null || hijo === false) continue;
    el.append(hijo instanceof Node ? hijo : document.createTextNode(String(hijo)));
  }
}

const SVG = 'http://www.w3.org/2000/svg';
const ICONOS = {
  atras: ['M15 5l-7 7 7 7'],
  adelante: ['M9 5l7 7-7 7'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  ajustes: ['M4 7h10', 'M18 7h2', 'M4 17h2', 'M10 17h10', 'M16 4.5v5', 'M8 14.5v5'],
  rayo: ['M13 3L5 14h6l-1 7 8-11h-6l1-7z'],
  reloj: ['M12 7v5l3 2', 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z'],
  bandera: ['M5 21V4', 'M5 4h11l-2 4 2 4H5'],
  salir: ['M10 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4', 'M14 8l4 4-4 4', 'M18 12H9'],
  mas: ['M12 5v14', 'M5 12h14'],
  menos: ['M5 12h14'],
};

export function icono(nombre, etiqueta) {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'icono');
  if (etiqueta) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', etiqueta); }
  else svg.setAttribute('aria-hidden', 'true');
  for (const d of ICONOS[nombre] ?? []) {
    const p = document.createElementNS(SVG, 'path');
    p.setAttribute('d', d);
    svg.append(p);
  }
  return svg;
}

let tostadaActual = null;
/** Aviso breve abajo. Opcional: un botón de acción. */
export function tostada(texto, { accion, alPulsar, duracion = 3500 } = {}) {
  tostadaActual?.remove();
  const el = h('div', { class: 'tostada', role: 'status' }, h('span', {}, texto),
    accion ? h('button', { type: 'button', onclick: () => { el.remove(); alPulsar?.(); } }, accion) : null);
  document.body.append(el);
  tostadaActual = el;
  if (duracion) setTimeout(() => el.remove(), duracion);
  return el;
}

/** Diálogo de confirmación. Devuelve una promesa con true (aceptar) o false. */
export function confirmar({ titulo, texto, aceptar = 'Aceptar', cancelar = 'Cancelar' }) {
  return new Promise((resolver) => {
    const cerrar = (valor) => { dlg.close(); dlg.remove(); resolver(valor); };
    const dlg = h('dialog', { class: 'dialogo', 'aria-labelledby': 'dialogo-titulo' },
      h('h2', { id: 'dialogo-titulo' }, titulo),
      texto ? h('p', {}, texto) : null,
      h('div', { class: 'dialogo-botones' },
        h('button', { type: 'button', class: 'boton boton-principal', onclick: () => cerrar(true) }, aceptar),
        cancelar ? h('button', { type: 'button', class: 'boton', autofocus: true, onclick: () => cerrar(false) }, cancelar) : null));
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); cerrar(false); });
    document.body.append(dlg);
    dlg.showModal();
  });
}

/** Sustituye el contenido de #app y lleva el foco al título, para lectores de pantalla y teclado. */
export function montar(...nodos) {
  const app = document.getElementById('app');
  app.replaceChildren(...nodos.flat(Infinity).filter((n) => n != null && n !== false));
  window.scrollTo(0, 0);
  const titulo = app.querySelector('h1');
  if (titulo) { titulo.setAttribute('tabindex', '-1'); titulo.focus({ preventScroll: true }); }
}
