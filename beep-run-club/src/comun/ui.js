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
  arriba: ['M5 15l7-7 7 7'],
  abajo: ['M5 9l7 7 7-7'],
  cerrar: ['M6 6l12 12', 'M18 6L6 18'],
  compartir: ['M12 3v12', 'M8 7l4-4 4 4', 'M7 10H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1'],
  anadirInicio: ['M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z', 'M12 8v8', 'M8 12h8'],
  puntos: ['M12 5.5v.01', 'M12 12v.01', 'M12 18.5v.01'],
  candado: ['M7 11V8a5 5 0 0 1 10 0v3', 'M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z'],
  enlace: ['M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1', 'M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1'],
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

/**
 * Diálogo modal. `botones`: [{ texto, valor, principal }]. Devuelve una promesa con el valor del
 * botón pulsado (o null si se cierra con Escape). El foco va al botón marcado con `foco`, o al
 * último (el de cancelar, que es el seguro).
 */
export function dialogo({ titulo, texto = null, cuerpo = [], botones, alAceptar = null }) {
  return new Promise((resolver) => {
    const cerrar = (valor) => { dlg.close(); dlg.remove(); resolver(valor); };
    const nodosBotones = botones.map((b) => h('button', {
      type: b.principal ? 'submit' : 'button',
      class: `boton${b.principal ? ' boton-principal' : ''}`,
      autofocus: !!b.foco,
      onclick: async (e) => {
        e.preventDefault();
        if (b.principal && alAceptar) {
          const seguir = await alAceptar();
          if (seguir === false) return; // validación fallida: el diálogo sigue abierto
        }
        cerrar(b.valor);
      },
    }, b.texto));
    if (!botones.some((b) => b.foco)) nodosBotones[nodosBotones.length - 1].autofocus = true;
    const dlg = h('dialog', { class: 'dialogo', 'aria-labelledby': 'dialogo-titulo' },
      h('form', { method: 'dialog', onsubmit: (e) => e.preventDefault() },
        h('h2', { id: 'dialogo-titulo' }, titulo),
        texto ? h('p', {}, texto) : null,
        cuerpo,
        h('div', { class: 'dialogo-botones' }, nodosBotones)));
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); cerrar(null); });
    document.body.append(dlg);
    dlg.showModal();
  });
}

/** Confirmación de sí o no. Devuelve true o false. */
export async function confirmar({ titulo, texto, aceptar = 'Aceptar', cancelar = 'Cancelar' }) {
  const botones = [{ texto: aceptar, valor: true, principal: true }];
  if (cancelar) botones.push({ texto: cancelar, valor: false });
  return (await dialogo({ titulo, texto, botones })) === true;
}

/**
 * Grupo de opciones excluyentes (role=radiogroup) con flechas y un solo punto de Tab.
 * `opciones`: [[valor, texto]]. Devuelve el elemento.
 */
export function grupoRadio({ etiqueta, opciones, valor, alElegir, clase = 'segmentado' }) {
  const id = `grupo-${Math.abs([...etiqueta].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7))}`;
  let actual = valor;
  const botones = opciones.map(([v, texto]) => h('button', {
    type: 'button', role: 'radio', onclick: () => elegir(v),
  }, texto));
  const pintar = () => botones.forEach((b, i) => {
    const marcado = opciones[i][0] === actual;
    b.setAttribute('aria-checked', String(marcado));
    b.tabIndex = marcado || (actual == null && i === 0) ? 0 : -1;
  });
  const elegir = (v, foco = false) => {
    actual = v;
    pintar();
    if (foco) botones[opciones.findIndex(([x]) => x === v)].focus();
    alElegir(v);
  };
  pintar();
  return h('div', {},
    h('h2', { id }, etiqueta),
    h('div', {
      class: clase, role: 'radiogroup', 'aria-labelledby': id,
      onkeydown: (e) => {
        const paso = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!paso) return;
        e.preventDefault();
        const i = Math.max(0, opciones.findIndex(([x]) => x === actual));
        elegir(opciones[(i + paso + opciones.length) % opciones.length][0], true);
      },
    }, botones));
}

/** Sustituye el contenido de #app y lleva el foco al título, para lectores de pantalla y teclado. */
export function montar(...nodos) {
  const app = document.getElementById('app');
  app.replaceChildren(...nodos.flat(Infinity).filter((n) => n != null && n !== false));
  window.scrollTo(0, 0);
  const titulo = app.querySelector('h1');
  if (titulo) { titulo.setAttribute('tabindex', '-1'); titulo.focus({ preventScroll: true }); }
}
