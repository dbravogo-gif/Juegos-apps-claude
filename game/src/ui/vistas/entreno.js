import { esc, plural } from '../util.js';
import { ETIQUETA_ESTADO } from '../../data/defaults.js';
import { estadoPorSeries } from '../../core/scoring/workout.js';
import { sumarDias, exencionesEntrenoDisponibles } from '../../core/scoring/exemptions.js';
import { esEditable, rutinaDelDia } from '../../data/history.js';
import { minimoCumplidosEntreno } from '../../core/scoring/streaks.js';

/** Estados que no salen de las series y hay que marcar a mano. */
const MANUALES = [
  ['sustituido', ''],
  ['justificado', 'medio'],
  ['omitido', 'malo'],
];

let pestana = 'sesion';
const pct = (v) => (typeof v === 'number' ? `${Math.round(v * 100)} %` : '—');

export function subtitulo(ctx) {
  if (pestana === 'plan') return `${plural(ctx.db.rutinas.length, 'rutina', 'rutinas')} · ${ctx.db.plan.diasPorSemana} días/semana`;
  const dia = new Date(`${ctx.fecha}T00:00:00`);
  const etiqueta = ctx.fecha === ctx.hoy ? 'Hoy' : dia.toLocaleDateString('es-ES', { weekday: 'long' });
  return `${etiqueta} · ${dia.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`;
}

function pestanas() {
  const boton = (id, texto) =>
    `<button aria-pressed="${pestana === id}" data-accion="pestana" data-pestana="${id}">${texto}</button>`;
  return `<div class="pestanas">${boton('sesion', 'Sesión')}${boton('plan', 'Mi rutina')}</div>`;
}

/** Último peso anotado para ese ejercicio antes de hoy, para no tener que recordarlo. */
function ultimaVez(db, ejercicioId, fecha) {
  const anteriores = Object.keys(db.dias)
    .filter((f) => f < fecha)
    .sort()
    .reverse();

  for (const f of anteriores) {
    const series = (db.dias[f].ejercicios ?? []).find((e) => e.id === ejercicioId)?.series ?? [];
    const hechas = series.filter((s) => s.hecha && s.peso);
    if (hechas.length) return hechas.map((s) => `${s.peso}×${s.reps}`).join('  ');
  }
  return null;
}

function serieHTML(ejercicioId, serie, i, bloqueado) {
  const campo = (nombre, valor, modo, marcador) => `
    <input type="text" inputmode="${modo}" autocomplete="off" placeholder="${marcador}"
      id="s_${esc(ejercicioId)}_${i}_${nombre}" value="${esc(valor ?? '')}" ${bloqueado ? 'disabled' : ''}
      data-accion="serie" data-directo data-ejercicio="${esc(ejercicioId)}" data-indice="${i}" data-campo="${nombre}">`;

  return `
  <div class="serie">
    <span class="idx">S${i + 1}</span>
    ${campo('peso', serie.peso, 'decimal', 'kg')}
    ${campo('reps', serie.reps, 'numeric', 'reps')}
    <button class="check ${serie.hecha ? 'hecha' : ''}" aria-pressed="${Boolean(serie.hecha)}"
      ${bloqueado ? 'disabled' : ''} data-accion="hecha"
      data-ejercicio="${esc(ejercicioId)}" data-indice="${i}">${serie.hecha ? '✓' : ''}</button>
  </div>`;
}

function ejercicioHTML(ficha, registro, ctx, bloqueado) {
  const series = registro?.series ?? [];
  const objetivo = ficha.series ?? 3;
  const filas = Array.from({ length: Math.max(objetivo, series.length) }, (_, i) => series[i] ?? {});
  const anterior = ultimaVez(ctx.db, ficha.id, ctx.fecha);

  const manuales = MANUALES.map(
    ([valor, clase]) => `
    <button class="${clase}" aria-pressed="${registro?.estado === valor}" ${bloqueado ? 'disabled' : ''}
      data-accion="estado" data-ejercicio="${esc(ficha.id)}" data-valor="${valor}">${ETIQUETA_ESTADO[valor]}</button>`,
  ).join('');

  return `
  <div class="tarjeta ejercicio ${registro?.estado === 'completado' ? 'listo' : ''}">
    <div class="cab">
      <span class="nom">${esc(ficha.nombre)}</span>
      <span class="etiqueta">${ficha.importancia}</span>
    </div>
    <div class="mini" style="margin-bottom:10px">
      ${objetivo} × ${ficha.repMin ?? 8}-${ficha.repMax ?? 12} reps
      ${anterior ? ` · última vez ${esc(anterior)}` : ''}
    </div>
    ${filas.map((s, i) => serieHTML(ficha.id, s, i, bloqueado)).join('')}
    ${
      bloqueado
        ? ''
        : `<div class="fila" style="gap:6px;margin-top:4px">
            <button class="mini" data-accion="copiarSeries" data-ejercicio="${esc(ficha.id)}">⇣ Repetir la primera</button>
            <button class="mini" data-accion="masSerie" data-ejercicio="${esc(ficha.id)}">+ Serie</button>
          </div>
          <div class="estados" style="margin-top:10px">${manuales}</div>`
    }
  </div>`;
}

/**
 * Tarjetas de elección del día: una por rutina, más descanso y actividad de fuera. Nada de
 * calendario: el día que entrenas eliges qué toca, igual que en Bulk Up.
 */
function eleccionHTML(ctx, bloqueado) {
  const elegida = ctx.registroDe(ctx.fecha).sesion ?? null;

  const tarjeta = (id, nombre, detalle, clase = '') => `
    <button class="opcion ${clase}" aria-pressed="${elegida === id}" ${bloqueado ? 'disabled' : ''}
      data-accion="elegirSesion" data-sesion="${esc(id)}">
      <b>${esc(nombre)}</b>
      <span class="mini">${esc(detalle)}</span>
    </button>`;

  const rutinas = ctx.db.rutinas
    .map((r) => tarjeta(r.id, r.nombre, plural(r.ejercicios.length, 'ejercicio', 'ejercicios')))
    .join('');

  return `
  <div class="opciones">
    ${rutinas}
    ${tarjeta('descanso', 'Descanso', 'Hoy no toca', 'suave')}
    ${tarjeta('otra', 'Otra actividad', 'Fútbol, monte, una clase…', 'suave')}
  </div>`;
}

function renderSesion(ctx) {
  const { fecha, hoy } = ctx;
  const bloqueado = !esEditable(fecha, hoy);
  const registro = ctx.registroDe(fecha);
  const sesion = ctx.sesionDe(fecha);
  const rutina = rutinaDelDia(ctx.db, registro);
  const evaluacion = ctx.evaluacionDe(fecha);
  const porId = new Map((registro.ejercicios ?? []).map((e) => [e.id, e]));
  const exceso = evaluacion.entreno?.justificadosExcedidos ?? [];
  const exenciones = exencionesEntrenoDisponibles(ctx.db.exenciones, hoy);

  const cuerpo = {
    entreno: () =>
      `<div class="entre" style="margin:18px 0 10px">
         <b>${esc(rutina?.nombre ?? '')}</b>
         <span class="mini">Cumplimiento ${pct(evaluacion.entreno?.cumplimiento)}</span>
       </div>` +
      (rutina?.ejercicios ?? []).map((e) => ejercicioHTML(e, porId.get(e.id), ctx, bloqueado)).join(''),
    descanso: () => '<div class="vacio">Día de descanso. No se te exige nada.</div>',
    otra: () =>
      '<div class="vacio">Actividad fuera del gimnasio. No rompe la racha ni cuenta como sesión.</div>',
    sin_decidir: () => '<div class="vacio">Elige arriba qué has hecho hoy.</div>',
  }[sesion]();

  return `
  <div class="fila" style="margin-bottom:14px">
    <button class="boton secundario fino" data-accion="dia" data-delta="-1">‹ Anterior</button>
    <button class="boton secundario fino" data-accion="dia" data-delta="1" ${fecha === hoy ? 'disabled' : ''}>Siguiente ›</button>
  </div>

  ${bloqueado ? '<div class="aviso ojo">Solo se puede registrar el día de hoy y el anterior.</div>' : ''}

  ${eleccionHTML(ctx, bloqueado)}

  <div class="mini" style="margin:10px 0 4px">
    ¿Lesión o viaje? Te quedan ${plural(exenciones, 'exención', 'exenciones')} este año ·
    <button class="enlace" data-accion="irAjustes">gastar una</button>
  </div>

  ${
    exceso.length
      ? '<div class="aviso ojo">Has marcado muchas molestias. Si no has podido entrenar de verdad, marca descanso o gasta una exención: así no te penaliza.</div>'
      : ''
  }

  ${cuerpo}`;
}

function renderPlan(ctx) {
  const { db } = ctx;
  const porSemana = db.plan.diasPorSemana;

  const dias = [1, 2, 3, 4, 5, 6, 7]
    .map(
      (n) => `<button aria-pressed="${porSemana === n}" data-accion="diasPorSemana" data-dias="${n}">${n}</button>`,
    )
    .join('');

  const rutinas = db.rutinas
    .map(
      (rutina) => `
    <div class="tarjeta">
      <div class="entre" style="margin-bottom:12px">
        <input type="text" class="titulo-editable" value="${esc(rutina.nombre)}"
          data-accion="renombrarRutina" data-directo data-rutina="${esc(rutina.id)}" id="nombre_${esc(rutina.id)}">
        <button class="mini" data-accion="borrarRutina" data-rutina="${esc(rutina.id)}">✕</button>
      </div>
      ${rutina.ejercicios
        .map(
          (e, i) => `
        <div class="def">
          <div class="entre" style="margin-bottom:7px">
            <span class="nom">${esc(e.nombre)}</span>
            <button class="mini" data-accion="borrarEjercicio" data-rutina="${esc(rutina.id)}" data-indice="${i}">✕</button>
          </div>
          <div class="campos">
            <label><span>Importancia</span>
              <select data-accion="campoEjercicio" data-rutina="${esc(rutina.id)}" data-indice="${i}" data-campo="importancia">
                ${['principal', 'secundario', 'opcional']
                  .map((v) => `<option value="${v}" ${e.importancia === v ? 'selected' : ''}>${v}</option>`)
                  .join('')}
              </select>
            </label>
            <label><span>Series</span>
              <input type="number" min="1" max="10" value="${e.series ?? 3}"
                data-accion="campoEjercicio" data-rutina="${esc(rutina.id)}" data-indice="${i}" data-campo="series"></label>
            <label><span>Reps</span>
              <div class="fila" style="gap:4px">
                <input type="number" min="1" value="${e.repMin ?? 8}"
                  data-accion="campoEjercicio" data-rutina="${esc(rutina.id)}" data-indice="${i}" data-campo="repMin">
                <input type="number" min="1" value="${e.repMax ?? 12}"
                  data-accion="campoEjercicio" data-rutina="${esc(rutina.id)}" data-indice="${i}" data-campo="repMax">
              </div>
            </label>
          </div>
        </div>`,
        )
        .join('')}
      <div class="fila" style="margin-top:12px">
        <input type="text" placeholder="Nuevo ejercicio" data-nuevo="${esc(rutina.id)}">
        <button class="boton fino secundario" style="flex:0 0 auto;padding:9px 16px"
          data-accion="anadirEjercicio" data-rutina="${esc(rutina.id)}">Añadir</button>
      </div>
    </div>`,
    )
    .join('');

  return `
  <div class="titulo-seccion">Días de entreno por semana</div>
  <div class="tarjeta">
    <div class="dias" style="margin-bottom:14px">${dias}</div>
    <div class="mini">
      Es tu compromiso, no un calendario: eliges qué día entrenas y con qué rutina al abrir
      el día. Para mantener la racha necesitas
      ${plural(minimoCumplidosEntreno(porSemana), 'sesión cumplida', 'sesiones cumplidas')} cada siete días.
    </div>
  </div>

  <div class="titulo-seccion">Mis rutinas</div>
  ${rutinas}
  <button class="boton fino secundario" data-accion="anadirRutina">+ Nueva rutina</button>`;
}

export function render(ctx) {
  return pestanas() + (pestana === 'plan' ? renderPlan(ctx) : renderSesion(ctx));
}

/** Aplica un cambio sobre el día seleccionado. */
function editarDia(ctx, cambio, { callado = false } = {}) {
  const aplicar = callado ? ctx.actualizarCallado : ctx.actualizar;
  aplicar((db) => {
    const actual = db.dias[ctx.fecha] ?? {};
    db.dias[ctx.fecha] = cambio({ ejercicios: [], comidas: [], extras: [], ...actual });
  });
}

/**
 * Cambia el registro de un ejercicio y recalcula su estado. Un ejercicio que se queda sin
 * series hechas y sin marca manual se borra del día: así vuelve a estar «sin tocar» en vez
 * de quedar registrado como omitido antes de tiempo.
 */
function editarEjercicio(ctx, ejercicioId, cambio, opciones) {
  const rutina = rutinaDelDia(ctx.db, ctx.registroDe(ctx.fecha));
  const ficha = rutina?.ejercicios.find((e) => e.id === ejercicioId);
  if (!ficha) return;

  editarDia(ctx, (dia) => {
    const previo = dia.ejercicios.find((e) => e.id === ejercicioId) ?? {
      id: ejercicioId,
      importancia: ficha.importancia,
      series: [],
      estado: null,
    };
    const siguiente = cambio({ ...previo, importancia: ficha.importancia });
    const derivado = estadoPorSeries(ficha.series ?? 3, siguiente.series);
    const estado = siguiente.manual ? siguiente.estado : derivado;

    const resto = dia.ejercicios.filter((e) => e.id !== ejercicioId);
    const vacio = !estado && !(siguiente.series ?? []).some((s) => s.peso || s.reps);
    return { ...dia, ejercicios: vacio ? resto : [...resto, { ...siguiente, estado }] };
  }, opciones);
}

const serieEn = (series, i) => Array.from({ length: Math.max(series.length, i + 1) }, (_, j) => series[j] ?? {});

export const acciones = {
  pestana: (el, ctx) => {
    pestana = el.dataset.pestana;
    ctx.refrescar({ alPrincipio: true });
  },

  dia: (el, ctx) => ctx.verFecha(sumarDias(ctx.fecha, Number(el.dataset.delta))),

  // Cambiar de rutina no borra lo anotado: si vuelves a la de antes, sigue ahí.
  elegirSesion: (el, ctx) =>
    editarDia(ctx, (dia) => ({
      ...dia,
      sesion: dia.sesion === el.dataset.sesion ? undefined : el.dataset.sesion,
    })),

  irAjustes: (_, ctx) => ctx.ir('ajustes'),

  // Se guarda en cada tecla y sin repintar: si se repintara, el campo se recrearía a media
  // palabra y el teclado perdería el foco.
  serie: (el, ctx) => {
    const i = Number(el.dataset.indice);
    const valor = el.value.trim().replace(',', '.');
    editarEjercicio(
      ctx,
      el.dataset.ejercicio,
      (e) => ({
        ...e,
        series: serieEn(e.series ?? [], i).map((s, j) => (j === i ? { ...s, [el.dataset.campo]: valor } : s)),
      }),
      { callado: true },
    );
  },

  hecha: (el, ctx) => {
    const i = Number(el.dataset.indice);
    editarEjercicio(ctx, el.dataset.ejercicio, (e) => ({
      ...e,
      manual: false,
      series: serieEn(e.series ?? [], i).map((s, j) => (j === i ? { ...s, hecha: !s.hecha } : s)),
    }));
  },

  masSerie: (el, ctx) =>
    editarEjercicio(ctx, el.dataset.ejercicio, (e) => ({ ...e, series: [...(e.series ?? []), {}] })),

  copiarSeries: (el, ctx) => {
    const rutina = rutinaDelDia(ctx.db, ctx.registroDe(ctx.fecha));
    const objetivo = rutina?.ejercicios.find((x) => x.id === el.dataset.ejercicio)?.series ?? 3;
    editarEjercicio(ctx, el.dataset.ejercicio, (e) => {
      const primera = (e.series ?? [])[0];
      if (!primera?.peso) return e;
      const largo = Math.max(objetivo, e.series.length);
      return {
        ...e,
        series: Array.from({ length: largo }, (_, i) =>
          i === 0 ? primera : { ...(e.series[i] ?? {}), peso: primera.peso, reps: primera.reps },
        ),
      };
    });
  },

  estado: (el, ctx) => {
    const valor = el.dataset.valor;
    editarEjercicio(ctx, el.dataset.ejercicio, (e) => {
      const quitar = e.manual && e.estado === valor;
      return { ...e, manual: !quitar, estado: quitar ? null : valor };
    });
  },

  // --- Plan ---

  diasPorSemana: (el, ctx) =>
    ctx.actualizar((db) => {
      db.plan.diasPorSemana = Number(el.dataset.dias);
    }),

  campoEjercicio: (el, ctx) =>
    ctx.actualizar((db) => {
      const ejercicio = db.rutinas.find((r) => r.id === el.dataset.rutina).ejercicios[Number(el.dataset.indice)];
      const campo = el.dataset.campo;
      ejercicio[campo] = campo === 'importancia' ? el.value : Math.max(1, Number(el.value) || 1);
    }),

  anadirEjercicio: (el, ctx) => {
    const campo = document.querySelector(`[data-nuevo="${el.dataset.rutina}"]`);
    const nombre = campo.value.trim();
    if (!nombre) return;
    campo.value = '';

    ctx.actualizar((db) => {
      db.rutinas
        .find((r) => r.id === el.dataset.rutina)
        .ejercicios.push({ id: `e${Date.now()}`, nombre, importancia: 'secundario', series: 3, repMin: 8, repMax: 12 });
    });
  },

  borrarEjercicio: (el, ctx) =>
    ctx.actualizar((db) => {
      db.rutinas.find((r) => r.id === el.dataset.rutina).ejercicios.splice(Number(el.dataset.indice), 1);
    }),

  renombrarRutina: (el, ctx) =>
    ctx.actualizarCallado((db) => {
      db.rutinas.find((r) => r.id === el.dataset.rutina).nombre = el.value.trim() || 'Rutina';
    }),

  anadirRutina: (_, ctx) =>
    ctx.actualizar((db) => {
      db.rutinas.push({ id: `r${Date.now()}`, nombre: 'Nueva rutina', ejercicios: [] });
    }),

  borrarRutina: (el, ctx) => {
    if (ctx.db.rutinas.length === 1) {
      alert('Tiene que quedar al menos una rutina.');
      return;
    }
    if (!confirm('¿Borrar esta rutina? Los días ya registrados con ella se conservan.')) return;

    ctx.actualizar((db) => {
      db.rutinas = db.rutinas.filter((r) => r.id !== el.dataset.rutina);
    });
  },
};
