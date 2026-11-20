// Piezas compartidas del panel: cabecera, enlace del atleta y bloque de valoración.
import { h, icono, tostada } from '../comun/ui.js';
import { ESFUERZO, esDura } from '../nucleo/registro.js';
import { textoCarrera } from '../nucleo/exportar.js';

export function cabeceraPanel(ctx, { atras = null } = {}) {
  return h('header', { class: 'cabecera' },
    atras
      ? h('button', { type: 'button', class: 'boton-icono', 'aria-label': atras.etiqueta, onclick: atras.accion }, icono('atras'))
      : h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        h('div', { class: 'logo', role: 'img', 'aria-label': 'Beep Run Club' }), h('span', { class: 'rol' }, 'Entrenador')),
    atras ? h('div', { class: 'logo', role: 'img', 'aria-label': 'Beep Run Club' }) : null,
    h('button', { type: 'button', class: 'boton-icono', 'aria-label': 'Salir del panel', onclick: () => ctx.salir() }, icono('salir')));
}

export function pestanas(activa) {
  const enlace = (ruta, texto, id) => h('a', { href: ruta, 'aria-current': activa === id ? 'page' : null }, texto);
  return h('nav', { class: 'pestanas', 'aria-label': 'Secciones' }, enlace('#/novedades', 'Novedades', 'novedades'), enlace('#/atletas', 'Atletas', 'atletas'));
}

/** Enlace que abre la app del atleta ya con su código. */
export function enlaceAtleta(codigo) {
  const url = new URL('../', location.href);
  url.search = `?c=${encodeURIComponent(codigo)}`;
  url.hash = '';
  return url.toString();
}

async function copiar(texto) {
  try { await navigator.clipboard.writeText(texto); return true; } catch {
    const t = h('textarea', { style: { position: 'fixed', opacity: '0' } }, texto);
    document.body.append(t); t.select();
    const ok = document.execCommand?.('copy'); t.remove();
    return !!ok;
  }
}

export function botonesEnlace(atleta) {
  const url = enlaceAtleta(atleta.codigo);
  const texto = `Hola, ${atleta.nombre}: aquí tienes tu plan de Beep Run Club. Ábrelo y añádelo a la pantalla de inicio. Tu código es ${atleta.codigo}.`;
  return [
    h('button', { type: 'button', class: 'boton', onclick: async () => tostada(await copiar(url) ? 'Enlace copiado' : `Copia este enlace: ${url}`) }, 'Copiar enlace'),
    navigator.share ? h('button', {
      type: 'button', class: 'boton',
      onclick: () => navigator.share({ title: 'Beep Run Club', text: texto, url }).catch(() => {}),
    }, 'Compartir') : null,
  ];
}

export function insigniaEsfuerzo(n) {
  return h('span', { class: 'insignia', style: { '--n': n }, 'aria-label': `Esfuerzo ${n}: ${ESFUERZO[n]}` }, String(n));
}

/** La valoración del atleta, completa y de solo lectura. */
export function bloqueValoracion(nombre, sesion, registro) {
  const nombreDe = (id) => sesion.ejercicios.find((e) => e.id === id)?.nombre ?? '?';
  const carrera = textoCarrera(sesion, registro);
  return h('section', { class: `valoracion${esDura(registro) ? ' dura' : ''}`, 'aria-label': `Valoración de ${nombre}` },
    h('div', { class: 'linea1', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
      h('h3', {}, `Valoración de ${nombre}`), insigniaEsfuerzo(registro.esfuerzo)),
    h('dl', {},
      h('dt', {}, 'Esfuerzo'), h('dd', {}, `${registro.esfuerzo} · ${ESFUERZO[registro.esfuerzo]}`),
      h('dt', {}, 'Hechos'), h('dd', {}, `${registro.hechos.length} de ${sesion.ejercicios.length}`),
      registro.duros.length ? [h('dt', {}, 'Demasiado duro'), h('dd', { style: { fontWeight: '600' } }, registro.duros.map(nombreDe).join(', '))] : null,
      carrera ? [h('dt', {}, 'Carrera'), h('dd', {}, carrera)] : null,
      registro.comentario ? [h('dt', {}, 'Comentario'), h('dd', {}, `«${registro.comentario}»`)] : null));
}
