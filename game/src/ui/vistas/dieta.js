import { esc, plural } from '../util.js';
import { ETIQUETA_COMIDA } from '../../data/defaults.js';
import { exencionesComidaDisponibles } from '../../core/scoring/nutrition.js';
import { sumarDias } from '../../core/scoring/exemptions.js';
import { esEditable, comidasDelDia } from '../../data/history.js';

const ESTADOS = [
  ['completo', 'Según plan', ''],
  ['excepcion_menor', 'Algo extra', 'medio'],
  ['incumplido', 'Fuera', 'malo'],
];

const DIA_LARGO = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

let pestana = 'dia';
const pct = (v) => (typeof v === 'number' ? `${Math.round(v * 100)} %` : '—');

export function subtitulo(ctx) {
  if (pestana === 'plan') return 'Lo que te has propuesto comer';
  const dia = new Date(`${ctx.fecha}T00:00:00`);
  const etiqueta = ctx.fecha === ctx.hoy ? 'Hoy' : dia.toLocaleDateString('es-ES', { weekday: 'long' });
  return `${etiqueta} · ${dia.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`;
}

function pestanas() {
  const boton = (id, texto) =>
    `<button aria-pressed="${pestana === id}" data-accion="pestana" data-pestana="${id}">${texto}</button>`;
  return `<div class="pestanas" data-guia="plan-dieta">${boton('dia', 'Hoy')}${boton('plan', 'Mi dieta')}</div>`;
}

function exencionesDisponibles(ctx, fecha) {
  return exencionesComidaDisponibles(
    Object.entries(ctx.db.dias).map(([f, d]) => ({ fecha: f, comidas: d.comidas ?? [] })),
    fecha,
  );
}

function comidaHTML(comida, indice, bloqueado) {
  const botones = ESTADOS.map(
    ([valor, texto, clase]) => `
    <button class="${clase}" aria-pressed="${comida.estado === valor}" ${bloqueado || comida.exenta ? 'disabled' : ''}
      data-accion="marcar" data-indice="${indice}" data-valor="${valor}">${texto}</button>`,
  ).join('');

  return `
  <div class="tarjeta comida-plan ${comida.exenta ? 'exenta' : ''}">
    <div class="entre" style="margin-bottom:9px">
      <div class="txt">
        <b>${esc(comida.nombre || 'Comida')}</b>
        <div class="mini">${comida.exenta ? 'Exenta: no cuenta hoy' : (ETIQUETA_COMIDA[comida.estado] ?? 'Sin marcar')}</div>
      </div>
      ${bloqueado ? '' : `<button class="mini" data-accion="alternarExenta" data-indice="${indice}">${comida.exenta ? 'Quitar' : 'Eximir'}</button>`}
    </div>
    <div class="estados">${botones}</div>
  </div>`;
}

function renderDia(ctx) {
  const { fecha, hoy } = ctx;
  const bloqueado = !esEditable(fecha, hoy);
  const registro = ctx.registroDe(fecha);
  const comidas = comidasDelDia(registro, ctx.db.plan, fecha);
  const evaluacion = ctx.evaluacionDe(fecha);

  return `
  <div class="fila" style="margin-bottom:14px">
    <button class="boton secundario fino" data-accion="dia" data-delta="-1">‹ Anterior</button>
    <button class="boton secundario fino" data-accion="dia" data-delta="1" ${fecha === hoy ? 'disabled' : ''}>Siguiente ›</button>
  </div>

  ${bloqueado ? '<div class="aviso ojo">Solo se puede registrar el día de hoy y el anterior.</div>' : ''}

  ${
    comidas.length
      ? comidas.map((c, i) => comidaHTML(c, i, bloqueado)).join('')
      : '<div class="vacio">No has planificado nada para este día. Ve a «Mi dieta» y añade tus comidas.</div>'
  }

  <div class="tarjeta plana">
    <div class="entre">
      <span class="mini">Puntuación del día</span>
      <b>${pct(evaluacion.comida?.puntuacion)}</b>
    </div>
    <div class="mini" style="margin-top:6px">
      Te quedan ${plural(exencionesDisponibles(ctx, fecha), 'exención', 'exenciones')} esta semana.
      Lo que dejes sin marcar cuenta como fuera de dieta al acabar el día.
    </div>
  </div>`;
}

function renderPlan(ctx) {
  const plan = ctx.db.plan.comidasPorDia ?? {};

  const dias = DIA_LARGO.map((nombre, i) => {
    const comidas = plan[i] ?? [];
    return `
    <div class="tarjeta">
      <div class="entre" style="margin-bottom:10px"><b>${nombre}</b></div>
      ${
        comidas.length
          ? comidas
              .map(
                (texto, j) => `
        <div class="fila" style="margin-bottom:7px">
          <input type="text" value="${esc(texto)}" id="p_${i}_${j}"
            data-accion="editarComida" data-directo data-dia="${i}" data-indice="${j}">
          <button class="mini" style="flex:0 0 auto" data-accion="borrarComida" data-dia="${i}" data-indice="${j}">✕</button>
        </div>`,
              )
              .join('')
          : '<div class="mini">Sin comidas planificadas.</div>'
      }
      <div class="fila" style="margin-top:10px">
        <input type="text" placeholder="Pollo con arroz y tomate" data-nuevo="dieta${i}">
        <button class="boton fino secundario" style="flex:0 0 auto;padding:9px 16px"
          data-accion="anadirComida" data-dia="${i}">Añadir</button>
      </div>
    </div>`;
  }).join('');

  return `
  <div class="aviso ojo">Escribe qué piensas comer cada día. Luego, en «Hoy», solo tienes que decir si lo has cumplido.</div>
  ${dias}`;
}

export function render(ctx) {
  return pestanas() + (pestana === 'plan' ? renderPlan(ctx) : renderDia(ctx));
}

/**
 * Guarda las comidas del día. La primera vez se congela la lista que venía del plan: si no,
 * cambiar el plan semanal reescribiría días ya registrados.
 */
function editarComidas(ctx, cambio) {
  const fecha = ctx.fecha;
  const base = comidasDelDia(ctx.registroDe(fecha), ctx.db.plan, fecha);

  ctx.actualizar((db) => {
    const actual = db.dias[fecha] ?? {};
    db.dias[fecha] = { ejercicios: [], extras: [], ...actual, comidas: cambio(base) };
  });
}

function editarPlan(ctx, dia, cambio, { callado = false } = {}) {
  (callado ? ctx.actualizarCallado : ctx.actualizar)((db) => {
    const comidas = db.plan.comidasPorDia?.[dia] ?? [];
    db.plan.comidasPorDia = { ...db.plan.comidasPorDia, [dia]: cambio(comidas) };
  });
}

export const acciones = {
  pestana: (el, ctx) => {
    pestana = el.dataset.pestana;
    ctx.refrescar({ alPrincipio: true });
  },

  dia: (el, ctx) => ctx.verFecha(sumarDias(ctx.fecha, Number(el.dataset.delta))),

  marcar: (el, ctx) => {
    const indice = Number(el.dataset.indice);
    const valor = el.dataset.valor;
    editarComidas(ctx, (comidas) =>
      comidas.map((c, i) => (i === indice ? { ...c, estado: c.estado === valor ? null : valor } : c)),
    );
  },

  alternarExenta: (el, ctx) => {
    const indice = Number(el.dataset.indice);
    const comida = comidasDelDia(ctx.registroDe(ctx.fecha), ctx.db.plan, ctx.fecha)[indice];
    if (!comida.exenta && exencionesDisponibles(ctx, ctx.fecha) === 0) {
      alert('No te quedan exenciones de comida esta semana.');
      return;
    }

    editarComidas(ctx, (comidas) =>
      comidas.map((c, i) => (i === indice ? { ...c, exenta: !c.exenta } : c)),
    );
  },

  // --- Plan semanal ---

  anadirComida: (el, ctx) => {
    const dia = Number(el.dataset.dia);
    const campo = document.querySelector(`[data-nuevo="dieta${dia}"]`);
    const texto = campo.value.trim();
    if (!texto) return;
    campo.value = '';

    editarPlan(ctx, dia, (comidas) => [...comidas, texto]);
  },

  editarComida: (el, ctx) => {
    const indice = Number(el.dataset.indice);
    editarPlan(
      ctx,
      Number(el.dataset.dia),
      (comidas) => comidas.map((c, i) => (i === indice ? el.value.trim() : c)),
      { callado: true },
    );
  },

  borrarComida: (el, ctx) => {
    const indice = Number(el.dataset.indice);
    editarPlan(ctx, Number(el.dataset.dia), (comidas) => comidas.filter((_, i) => i !== indice));
  },
};
