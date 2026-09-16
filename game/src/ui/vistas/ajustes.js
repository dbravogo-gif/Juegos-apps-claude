import { esc, plural } from '../app.js';
import { NOMBRE_DIA } from '../../data/defaults.js';
import {
  exencionesEntrenoDisponibles,
  puedeActivarExencion,
  fechasCubiertas,
} from '../../core/scoring/exemptions.js';
import { exportar, importar, estadoInicial } from '../../data/storage.js';

const MOTIVO = {
  retroactiva: 'No se pueden pedir exenciones para días que ya han pasado.',
  sin_exenciones: 'Ya has gastado las seis exenciones de este año.',
  solapada: 'Esas fechas ya están cubiertas por otra exención.',
};

export function subtitulo(ctx) {
  return `${plural(ctx.db.rutinas.length, 'rutina', 'rutinas')} · ${plural(ctx.db.exenciones.length, 'exención usada', 'exenciones usadas')}`;
}

export function render(ctx) {
  const { db } = ctx;
  const disponibles = exencionesEntrenoDisponibles(db.exenciones, ctx.hoy);

  const dias = NOMBRE_DIA.map(
    (nombre, i) => `
    <button aria-pressed="${db.plan.diasEntreno.includes(i)}" data-accion="alternarDia" data-dia="${i}">
      ${nombre}
    </button>`,
  ).join('');

  const asignaciones = db.plan.diasEntreno
    .slice()
    .sort((a, b) => a - b)
    .map(
      (i) => `
      <div class="entre" style="margin-bottom:9px">
        <span class="mini">${NOMBRE_DIA[i]}</span>
        <select data-accion="asignarRutina" data-dia="${i}" style="width:auto">
          ${db.rutinas
            .map(
              (r) =>
                `<option value="${esc(r.id)}" ${db.plan.rutinaPorDia?.[i] === r.id ? 'selected' : ''}>${esc(r.nombre)}</option>`,
            )
            .join('')}
        </select>
      </div>`,
    )
    .join('');

  const rutinas = db.rutinas
    .map(
      (rutina) => `
    <div class="tarjeta">
      <div class="entre" style="margin-bottom:10px">
        <b>${esc(rutina.nombre)}</b>
        <span class="mini">${rutina.ejercicios.length} ejercicios</span>
      </div>
      ${rutina.ejercicios
        .map(
          (e, i) => `
        <div class="entre" style="padding:7px 0;border-bottom:1px solid var(--linea)">
          <span>${esc(e.nombre)}</span>
          <select data-accion="importancia" data-rutina="${esc(rutina.id)}" data-indice="${i}" style="width:auto">
            ${['principal', 'secundario', 'opcional']
              .map((v) => `<option value="${v}" ${e.importancia === v ? 'selected' : ''}>${v}</option>`)
              .join('')}
          </select>
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

  const exenciones = db.exenciones.length
    ? db.exenciones
        .map((e) => {
          const fechas = fechasCubiertas(e);
          return `<div class="entre" style="padding:7px 0"><span class="mini">${fechas[0]} → ${fechas[fechas.length - 1]}</span></div>`;
        })
        .join('')
    : '<div class="mini">Ninguna usada todavía.</div>';

  return `
  <div class="titulo-seccion">Días de entreno</div>
  <div class="tarjeta">
    <div class="dias" style="margin-bottom:14px">${dias}</div>
    <div class="mini">Los días que no marques cuentan como descanso y no rompen la racha.</div>
  </div>

  <div class="titulo-seccion">Rutina de cada día</div>
  <div class="tarjeta">${asignaciones || '<div class="mini">Marca algún día de entreno.</div>'}</div>

  <div class="titulo-seccion">Rutinas</div>
  ${rutinas}

  <div class="titulo-seccion">Exenciones de entreno</div>
  <div class="tarjeta">
    <div class="entre" style="margin-bottom:12px">
      <span class="mini">Te quedan ${disponibles} de 6 este año</span>
    </div>
    <label class="campo">
      <span>Cubrir tres días desde</span>
      <input type="date" id="inicioExencion" min="${ctx.hoy}">
    </label>
    <button class="boton fino" data-accion="pedirExencion" ${disponibles === 0 ? 'disabled' : ''}>Usar una exención</button>
    <div style="margin-top:12px">${exenciones}</div>
  </div>

  <div class="titulo-seccion">Copia de seguridad</div>
  <div class="tarjeta">
    <button class="boton fino secundario" data-accion="exportar">Descargar copia</button>
    <div style="height:8px"></div>
    <label class="boton fino secundario" style="display:block;cursor:pointer">
      Restaurar copia
      <input type="file" accept="application/json" data-accion="importar" hidden>
    </label>
    <div class="mini" style="margin-top:10px">Tus datos se guardan solo en este dispositivo.</div>
    <div style="height:12px"></div>
    <button class="boton fino" style="background:var(--alerta)" data-accion="borrar">Borrar todo</button>
  </div>`;
}

export const acciones = {
  alternarDia: (el, ctx) => {
    const dia = Number(el.dataset.dia);
    ctx.actualizar((db) => {
      const activos = new Set(db.plan.diasEntreno);
      if (activos.has(dia)) activos.delete(dia);
      else activos.add(dia);
      db.plan.diasEntreno = [...activos].sort((a, b) => a - b);
    });
  },

  asignarRutina: (el, ctx) =>
    ctx.actualizar((db) => {
      db.plan.rutinaPorDia = { ...db.plan.rutinaPorDia, [el.dataset.dia]: el.value };
    }),

  importancia: (el, ctx) =>
    ctx.actualizar((db) => {
      const rutina = db.rutinas.find((r) => r.id === el.dataset.rutina);
      rutina.ejercicios[Number(el.dataset.indice)].importancia = el.value;
    }),

  anadirEjercicio: (el, ctx) => {
    const campo = document.querySelector(`[data-nuevo="${el.dataset.rutina}"]`);
    const nombre = campo.value.trim();
    if (!nombre) return;

    ctx.actualizar((db) => {
      const rutina = db.rutinas.find((r) => r.id === el.dataset.rutina);
      rutina.ejercicios.push({ id: `e${Date.now()}`, nombre, importancia: 'secundario' });
    });
  },

  pedirExencion: (_, ctx) => {
    const inicio = document.getElementById('inicioExencion').value;
    if (!inicio) return;

    const comprobacion = puedeActivarExencion(ctx.db.exenciones, inicio, ctx.hoy);
    if (!comprobacion.ok) {
      alert(MOTIVO[comprobacion.motivo]);
      return;
    }

    ctx.actualizar((db) => {
      db.exenciones.push({ id: `x${Date.now()}`, inicio });
    });
  },

  exportar: (_, ctx) => {
    const blob = new Blob([exportar(ctx.db)], { type: 'application/json' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = `constant-${ctx.hoy}.json`;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  },

  importar: (el, ctx) => {
    const archivo = el.files[0];
    if (!archivo) return;

    archivo.text().then((texto) => {
      const resultado = importar(texto);
      if (!resultado.ok) {
        alert('El archivo no tiene el formato esperado.');
        return;
      }
      ctx.actualizar((db) => Object.assign(db, resultado.db));
    });
  },

  borrar: (_, ctx) => {
    if (!confirm('Se borrará todo tu progreso en este dispositivo. ¿Seguro?')) return;
    ctx.actualizar((db) => Object.assign(db, estadoInicial()));
  },
};
