import { esc, plural } from '../util.js';
import { ETIQUETA_ESTADO, ETIQUETA_COMIDA } from '../../data/defaults.js';
import { exencionesComidaDisponibles } from '../../core/scoring/nutrition.js';
import { sumarDias } from '../../core/scoring/exemptions.js';
import { esEditable } from '../../data/history.js';
import { recompensaDelDia } from '../../core/economy/rewards.js';

const ESTADOS = [
  ['completado', ''],
  ['parcial', 'medio'],
  ['sustituido', ''],
  ['justificado', 'medio'],
  ['omitido', 'malo'],
];

const CLASE_COMIDA = { completo: 'ok', excepcion_menor: 'leve', incumplido: 'no' };
const pct = (v) => (typeof v === 'number' ? `${Math.round(v * 100)} %` : '—');

export function subtitulo(ctx) {
  const dia = new Date(`${ctx.fecha}T00:00:00`);
  const etiqueta = ctx.fecha === ctx.hoy ? 'Hoy' : dia.toLocaleDateString('es-ES', { weekday: 'long' });
  return `${etiqueta} · ${dia.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`;
}

function ejercicioHTML(ejercicio, estadoActual, bloqueado) {
  const botones = ESTADOS.map(
    ([valor, clase]) => `
    <button class="${clase}" aria-pressed="${estadoActual === valor}" ${bloqueado ? 'disabled' : ''}
      data-accion="estado" data-ejercicio="${esc(ejercicio.id)}" data-valor="${valor}">
      ${ETIQUETA_ESTADO[valor]}
    </button>`,
  ).join('');

  return `
  <div class="ejercicio">
    <div class="cab">
      <span class="nom">${esc(ejercicio.nombre)}</span>
      <span class="etiqueta">${ejercicio.importancia}</span>
    </div>
    <div class="estados">${botones}</div>
  </div>`;
}

function comidaHTML(comida, indice, bloqueado) {
  return `
  <div class="comida">
    <span class="punto ${comida.exenta ? 'exenta' : CLASE_COMIDA[comida.estado]}"></span>
    <div class="txt">
      <b>${ETIQUETA_COMIDA[comida.estado]}${comida.exenta ? ' · exenta' : ''}</b>
      ${comida.nota ? `<small>${esc(comida.nota)}</small>` : ''}
    </div>
    ${
      bloqueado
        ? ''
        : `<button class="mini" data-accion="alternarExenta" data-indice="${indice}">${comida.exenta ? 'Quitar' : 'Eximir'}</button>
           <button class="mini" data-accion="borrarComida" data-indice="${indice}">✕</button>`
    }
  </div>`;
}

export function render(ctx) {
  const { fecha, hoy } = ctx;
  const bloqueado = !esEditable(fecha, hoy);
  const registro = ctx.registroDe(fecha);
  const plan = ctx.planDe(fecha);
  const rutina = ctx.rutinaDe(fecha);
  const evaluacion = ctx.evaluacionDe(fecha);

  const estados = Object.fromEntries((registro.ejercicios ?? []).map((e) => [e.id, e.estado]));
  const comidas = registro.comidas ?? [];
  const exentasRestantes = exencionesComidaDisponibles(
    Object.entries(ctx.db.dias).map(([f, d]) => ({ fecha: f, comidas: d.comidas ?? [] })),
    fecha,
  );

  const previsto = recompensaDelDia({
    cumplimientoEntreno: evaluacion.entreno?.cumplimiento ?? null,
    puntuacionComida: evaluacion.comida?.puntuacion ?? null,
    multiplicador: ctx.estado.rachas?.multiplicador ?? 1,
  });

  const exceso = evaluacion.entreno?.justificadosExcedidos ?? [];

  return `
  <div class="fila" style="margin-bottom:14px">
    <button class="boton secundario fino" data-accion="dia" data-delta="-1">‹ Anterior</button>
    <button class="boton secundario fino" data-accion="dia" data-delta="1" ${fecha === hoy ? 'disabled' : ''}>Siguiente ›</button>
  </div>

  ${bloqueado ? '<div class="aviso ojo">Solo se puede registrar el día de hoy y el anterior.</div>' : ''}

  <div class="titulo-seccion">Entrenamiento</div>
  <div class="tarjeta">
    <div class="entre" style="margin-bottom:10px">
      <div>
        <b>${plan === 'entreno' ? rutina?.nombre ?? 'Sesión' : 'Descanso'}</b>
        <div class="mini">${plan === 'entreno' ? `Cumplimiento ${pct(evaluacion.entreno?.cumplimiento)}` : 'Día libre según tu plan'}</div>
      </div>
      ${bloqueado ? '' : `<button class="mini" data-accion="alternarPlan">${plan === 'entreno' ? 'Marcar descanso' : 'Marcar entreno'}</button>`}
    </div>
    ${
      plan === 'entreno' && rutina
        ? rutina.ejercicios.map((e) => ejercicioHTML(e, estados[e.id], bloqueado)).join('')
        : '<div class="vacio">Hoy no toca entrenar. Disfruta del descanso.</div>'
    }
  </div>

  ${
    exceso.length
      ? `<div class="aviso ojo">Has marcado muchas molestias. Si no has podido entrenar de verdad, marca el día como descanso o gasta una exención desde Ajustes: así no te penaliza.</div>`
      : ''
  }

  <div class="titulo-seccion">Alimentación</div>
  <div class="tarjeta">
    ${comidas.length ? comidas.map((c, i) => comidaHTML(c, i, bloqueado)).join('') : '<div class="vacio">Sin comidas registradas.</div>'}
    ${
      bloqueado
        ? ''
        : `
      <label class="campo" style="margin:14px 0 10px">
        <span>¿Qué has comido? (opcional, solo para ti)</span>
        <input type="text" id="notaComida" placeholder="Arroz con pollo y verduras">
      </label>
      <div class="fila" style="gap:6px">
        <button class="boton fino" data-accion="comida" data-estado="completo">Según dieta</button>
        <button class="boton fino secundario" data-accion="comida" data-estado="excepcion_menor">Algo extra</button>
        <button class="boton fino secundario" data-accion="comida" data-estado="incumplido">Fuera</button>
      </div>
      <div class="mini" style="margin-top:8px">Puntuación del día: ${pct(evaluacion.comida?.puntuacion)} · ${plural(exentasRestantes, 'exención', 'exenciones')} esta semana</div>`
    }
  </div>

  <div class="tarjeta plana">
    <div class="entre">
      <span class="mini">Este día te da</span>
      <b>${previsto.total.xp} XP · ${previsto.total.monedas} 🪙</b>
    </div>
  </div>`;
}

function editarDia(ctx, cambio) {
  ctx.actualizar((db) => {
    const actual = db.dias[ctx.fecha] ?? {};
    db.dias[ctx.fecha] = cambio({ ejercicios: [], comidas: [], extras: [], ...actual });
  });
}

export const acciones = {
  dia: (el, ctx) => ctx.verFecha(sumarDias(ctx.fecha, Number(el.dataset.delta))),

  alternarPlan: (_, ctx) =>
    editarDia(ctx, (dia) => ({
      ...dia,
      planEntreno: (dia.planEntreno ?? ctx.planDe(ctx.fecha)) === 'entreno' ? 'descanso' : 'entreno',
    })),

  estado: (el, ctx) => {
    const { ejercicio, valor } = el.dataset;
    const rutina = ctx.rutinaDe(ctx.fecha);
    const ficha = rutina.ejercicios.find((e) => e.id === ejercicio);

    editarDia(ctx, (dia) => {
      const resto = dia.ejercicios.filter((e) => e.id !== ejercicio);
      const yaEstaba = dia.ejercicios.find((e) => e.id === ejercicio)?.estado === valor;
      return {
        ...dia,
        ejercicios: yaEstaba
          ? resto
          : [...resto, { id: ejercicio, importancia: ficha.importancia, estado: valor }],
      };
    });
  },

  comida: (el, ctx) => {
    const campo = document.getElementById('notaComida');
    const nota = campo ? campo.value.trim() : '';
    editarDia(ctx, (dia) => ({
      ...dia,
      comidas: [...dia.comidas, { id: `c${Date.now()}`, estado: el.dataset.estado, nota }],
    }));
  },

  borrarComida: (el, ctx) =>
    editarDia(ctx, (dia) => ({
      ...dia,
      comidas: dia.comidas.filter((_, i) => i !== Number(el.dataset.indice)),
    })),

  alternarExenta: (el, ctx) => {
    const indice = Number(el.dataset.indice);
    const disponibles = exencionesComidaDisponibles(
      Object.entries(ctx.db.dias).map(([f, d]) => ({ fecha: f, comidas: d.comidas ?? [] })),
      ctx.fecha,
    );
    const comida = (ctx.registroDe(ctx.fecha).comidas ?? [])[indice];
    if (!comida.exenta && disponibles === 0) {
      alert('No te quedan exenciones de comida esta semana.');
      return;
    }

    editarDia(ctx, (dia) => ({
      ...dia,
      comidas: dia.comidas.map((c, i) => (i === indice ? { ...c, exenta: !c.exenta } : c)),
    }));
  },
};
