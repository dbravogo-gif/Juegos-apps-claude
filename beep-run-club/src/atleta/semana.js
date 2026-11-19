// Pantalla de la semana: de lunes a domingo, con hoy resaltado.

import { h, icono, montar } from '../comun/ui.js';
import { agruparPorDia } from '../nucleo/plan.js';
import { estadoSesion, ESFUERZO } from '../nucleo/registro.js';
import { etiquetaDia, rangoSemana, sumarDias, diferenciaDias, fechaLarga } from '../nucleo/fechas.js';

export function cabecera(ctx, { atras = null } = {}) {
  return h('header', { class: 'cabecera' },
    atras
      ? h('button', { type: 'button', class: 'boton-icono', 'aria-label': atras.etiqueta, onclick: atras.accion }, icono('atras'))
      : h('div', { class: 'logo', role: 'img', 'aria-label': 'Beep Run Club' }),
    atras ? h('div', { class: 'logo', role: 'img', 'aria-label': 'Beep Run Club' }) : null,
    atras ? h('span', { style: { width: '48px' } })
      : h('button', { type: 'button', class: 'boton-icono', 'aria-label': 'Ajustes', onclick: () => ctx.ir('#/ajustes') }, icono('ajustes')));
}

function textoSemana(dif) {
  if (dif === 0) return 'Esta semana';
  if (dif === 1) return 'La semana que viene';
  if (dif === -1) return 'La semana pasada';
  return dif > 0 ? `Dentro de ${dif} semanas` : `Hace ${-dif} semanas`;
}

export async function pantallaSemana(ctx, lunes) {
  const { atletaId, nombre } = ctx.sesion;
  const hoy = ctx.hoy();
  const dif = Math.round(diferenciaDias(ctx.lunesHoy(), lunes) / 7);
  const lista = h('ul', { class: 'dias', 'aria-busy': 'true' }, h('li', { class: 'descanso' }, 'Cargando tu semana…'));

  montar(
    cabecera(ctx),
    h('h1', { class: 'saludo' }, `Hola, ${nombre}`),
    ctx.almacen.tipo === 'demo' ? h('p', { class: 'aviso-demo' }, 'Modo demo: datos de ejemplo guardados en este móvil.') : null,
    h('nav', { class: 'selector-semana', 'aria-label': 'Semanas' },
      h('button', { type: 'button', class: 'boton-icono', 'aria-label': 'Semana anterior', onclick: () => ctx.ir(`#/semana/${sumarDias(lunes, -7)}`) }, icono('atras')),
      h('div', { class: 'rango', 'aria-live': 'polite' }, rangoSemana(lunes), h('small', {}, textoSemana(dif))),
      h('button', { type: 'button', class: 'boton-icono', 'aria-label': 'Semana siguiente', onclick: () => ctx.ir(`#/semana/${sumarDias(lunes, 7)}`) }, icono('adelante'))),
    dif !== 0 ? h('p', { style: { textAlign: 'center', margin: '0 0 8px' } },
      h('button', { type: 'button', class: 'boton-texto', onclick: () => ctx.ir('#/') }, 'Volver a esta semana')) : null,
    lista,
  );

  let sesiones, registros;
  try {
    sesiones = await ctx.almacen.sesionesEntre(atletaId, lunes, sumarDias(lunes, 6));
    registros = await ctx.almacen.registros(atletaId, sesiones.map((s) => s.id));
  } catch (e) {
    if (await ctx.siCodigoInvalido(e?.estado)) return;
    lista.replaceChildren(h('li', { class: 'descanso' }, 'No se ha podido cargar la semana. Revisa tu conexión.'));
    return;
  }

  const dias = agruparPorDia(sesiones, lunes).map(({ fecha, sesiones: delDia }) => {
    const e = etiquetaDia(fecha);
    const esHoy = fecha === hoy;
    return h('li', { class: `dia${esHoy ? ' es-hoy' : ''}`, 'aria-current': esHoy ? 'date' : null },
      h('div', { class: 'dia-etiqueta', 'aria-hidden': 'true' }, h('b', {}, e.corto), h('span', {}, e.num)),
      h('div', {},
        h('span', { class: 'oculto-visual' }, esHoy ? `Hoy, ${fechaLarga(fecha)}` : fechaLarga(fecha)),
        delDia.length === 0
          ? h('p', { class: 'descanso' }, 'Descanso')
          : delDia.map((s) => tarjeta(ctx, s, registros[s.id], fecha < hoy))));
  });
  lista.replaceChildren(...dias);
  lista.removeAttribute('aria-busy');
}

function tarjeta(ctx, sesion, registro, pasada) {
  const estado = estadoSesion(sesion, registro);
  const n = sesion.ejercicios.length;
  const etiquetaEstado = {
    hecha: h('span', { class: 'etiqueta' }, icono('check'), 'Hecha'),
    parcial: h('span', { class: 'etiqueta' }, 'A medias'),
    pendiente: pasada ? h('span', { class: 'etiqueta' }, 'Sin valorar') : null,
  }[estado];
  return h('button', { type: 'button', class: 'tarjeta-sesion', onclick: () => ctx.ir(`#/sesion/${sesion.id}`) },
    h('h3', {}, sesion.titulo),
    h('span', { class: 'meta' },
      h('span', {}, `${n} ${n === 1 ? 'ejercicio' : 'ejercicios'}`),
      etiquetaEstado,
      registro ? h('span', {}, `Esfuerzo ${registro.esfuerzo} · ${ESFUERZO[registro.esfuerzo]}`) : null));
}
