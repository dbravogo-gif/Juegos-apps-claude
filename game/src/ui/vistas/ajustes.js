import { plural } from '../util.js';
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
  return plural(ctx.db.exenciones.length, 'exención usada', 'exenciones usadas');
}

export function render(ctx) {
  const { db } = ctx;
  const disponibles = exencionesEntrenoDisponibles(db.exenciones, ctx.hoy);

  const exenciones = db.exenciones.length
    ? db.exenciones
        .map((e) => {
          const fechas = fechasCubiertas(e);
          return `<div class="entre" style="padding:7px 0"><span class="mini">${fechas[0]} → ${fechas[fechas.length - 1]}</span></div>`;
        })
        .join('')
    : '<div class="mini">Ninguna usada todavía.</div>';

  return `
  <div class="aviso ojo">Tu rutina se edita en la sección Entreno y tu dieta en la sección Dieta.</div>

  <div class="titulo-seccion">Cómo funciona</div>
  <div class="tarjeta">
    <button class="boton fino secundario" data-accion="verTutorial">Volver a ver la guía</button>
  </div>

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
  verTutorial: (_, ctx) => ctx.verTutorial(),

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
