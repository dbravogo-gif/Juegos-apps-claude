import { esc, plural } from '../util.js';
import { ETIQUETA_ESTADO, ETIQUETA_COMIDA } from '../../data/defaults.js';
import {
  mesesConRegistro,
  diasDelMes,
  huecoInicial,
  calendarioDelMes,
  detalleDelDia,
  ejerciciosConHistorial,
  progresionEjercicio,
} from '../../data/consultas.js';

/**
 * El historial, en tres vistas que responden a tres preguntas distintas:
 * el calendario a «¿he sido constante?», el detalle a «¿qué hice aquel día?» y la
 * progresión a «¿estoy mejorando?». Nada se borra nunca; esto solo enseña.
 */

const NOMBRE_DIA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

let mesVisible = null;
let diaAbierto = null;
let ejercicioVisible = null;
let puntoActivo = null;
let verNumeros = false;

const pct = (v) => (typeof v === 'number' ? `${Math.round(v * 100)} %` : '—');
const nombreMes = (mes) => {
  const [anio, m] = mes.split('-');
  return `${MESES[Number(m) - 1]} de ${anio}`;
};
const diaCorto = (fecha) => `${Number(fecha.slice(8))} ${MESES[Number(fecha.slice(5, 7)) - 1].slice(0, 3)}`;

function mesActual(ctx) {
  const meses = mesesConRegistro(ctx.db);
  if (mesVisible && (meses.includes(mesVisible) || mesVisible <= ctx.hoy.slice(0, 7))) return mesVisible;
  return meses[0] ?? ctx.hoy.slice(0, 7);
}

const desplazarMes = (mes, delta) => {
  const [anio, m] = mes.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, m - 1 + delta, 1));
  return fecha.toISOString().slice(0, 7);
};

// --- Calendario ---

function calendarioHTML(ctx) {
  const mes = mesActual(ctx);
  const dias = calendarioDelMes(ctx.db, mes, ctx.hoy);
  const huecos = Array.from({ length: huecoInicial(mes) }, () => '<div></div>').join('');

  const casillas = dias
    .map((dia) => {
      const nada = dia.entreno === 'sin_datos';
      return `
      <button class="dia-cal ${dia.entreno} ${diaAbierto === dia.fecha ? 'abierto' : ''}"
        ${nada ? 'disabled' : ''} data-accion="verDia" data-fecha="${dia.fecha}">
        <span>${Number(dia.fecha.slice(8))}</span>
        <i class="marca ${dia.comida}"></i>
      </button>`;
    })
    .join('');

  const siguiente = desplazarMes(mes, 1);

  return `
  <div class="tarjeta">
    <div class="entre" style="margin-bottom:12px">
      <button class="mini" data-accion="mes" data-delta="-1">‹</button>
      <b>${nombreMes(mes)}</b>
      <button class="mini" data-accion="mes" data-delta="1"
        ${siguiente > ctx.hoy.slice(0, 7) ? 'disabled' : ''}>›</button>
    </div>
    <div class="calendario cabecera">${NOMBRE_DIA.map((d) => `<span>${d}</span>`).join('')}</div>
    <div class="calendario">${huecos}${casillas}</div>
    <div class="leyenda">
      <span><i class="cumplido"></i> cumplido</span>
      <span><i class="fallado"></i> fallado</span>
      <span><i class="no_exigido"></i> descanso</span>
      <span><i class="marca cumplido"></i> dieta</span>
    </div>
  </div>`;
}

// --- Detalle de un día ---

function detalleHTML(ctx) {
  if (!diaAbierto) return '';
  const dia = detalleDelDia(ctx.db, diaAbierto);
  if (!dia) return '';

  const titulo = { entreno: dia.rutina ?? 'Sesión', descanso: 'Descanso', otra: 'Otra actividad' }[dia.sesion] ?? 'Sin decidir';

  const ejercicios = dia.ejercicios
    .map(
      (e) => `
    <div class="linea-hist">
      <div>
        <b>${esc(e.nombre)}</b>
        ${e.series.length ? `<div class="mini">${e.series.map((s) => `${esc(s.peso ?? '—')}×${esc(s.reps ?? '—')}`).join('  ·  ')}</div>` : ''}
      </div>
      <span class="mini">${ETIQUETA_ESTADO[e.estado] ?? '—'}</span>
    </div>`,
    )
    .join('');

  const comidas = dia.comidas
    .map(
      (c) => `
    <div class="linea-hist">
      <span>${esc(c.nombre || 'Comida')}</span>
      <span class="mini">${c.exenta ? 'exenta' : (ETIQUETA_COMIDA[c.estado] ?? 'sin marcar')}</span>
    </div>`,
    )
    .join('');

  return `
  <div class="tarjeta">
    <div class="entre" style="margin-bottom:12px">
      <div>
        <b>${esc(titulo)}</b>
        <div class="mini">${diaCorto(dia.fecha)} · entreno ${pct(dia.cumplimiento)} · dieta ${pct(dia.puntuacionComida)}</div>
      </div>
      <button class="mini" data-accion="cerrarDia">✕</button>
    </div>
    ${ejercicios || (dia.sesion === 'entreno' ? '<div class="mini">No anotaste ningún ejercicio.</div>' : '')}
    ${comidas ? `<div class="titulo-seccion" style="margin:14px 0 4px">Comidas</div>${comidas}` : ''}
  </div>`;
}

// --- Progresión de un ejercicio ---

const ANCHO = 320;
const ALTO = 132;
const MARGEN = { arriba: 12, abajo: 22, izquierda: 30, derecha: 14 };

// Por encima de esto, un punto por sesión sería una fila de manchas pegadas.
const MAX_PUNTOS_VISIBLES = 14;

const posicionX = (i, total) =>
  MARGEN.izquierda +
  (total === 1 ? (ANCHO - MARGEN.izquierda - MARGEN.derecha) / 2
    : (i / (total - 1)) * (ANCHO - MARGEN.izquierda - MARGEN.derecha));

/**
 * Una línea, un color y etiqueta solo en el último punto. Es una sola serie a lo largo del
 * tiempo: con leyenda y un número en cada punto se leería peor, no mejor.
 */
function graficaHTML(datos) {
  const pesos = datos.map((d) => d.mejorPeso);
  const max = Math.max(...pesos);
  const min = Math.min(...pesos);
  // Si todo el historial es el mismo peso, un rango de cero dividiría por cero.
  const suelo = min === max ? min - 5 : min - (max - min) * 0.25;
  const techo = min === max ? max + 5 : max + (max - min) * 0.25;

  const x = (i) => posicionX(i, datos.length);
  const y = (v) => MARGEN.arriba + (1 - (v - suelo) / (techo - suelo)) * (ALTO - MARGEN.arriba - MARGEN.abajo);

  const linea = datos.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(d.mejorPeso).toFixed(1)}`).join(' ');
  const guias = [techo, (techo + suelo) / 2, suelo]
    .map((v) => `<line x1="${MARGEN.izquierda}" x2="${ANCHO - MARGEN.derecha}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/>
       <text class="eje" x="${MARGEN.izquierda - 6}" y="${(y(v) + 3.5).toFixed(1)}" text-anchor="end">${Math.round(v)}</text>`)
    .join('');

  // Con muchas sesiones se dibujan solo el punto elegido y el último: uno por sesión sería
  // una fila de manchas pegadas donde no se distingue nada.
  const denso = datos.length > MAX_PUNTOS_VISIBLES;
  const puntos = datos
    .map((d, i) => {
      const activo = puntoActivo === d.fecha || (puntoActivo === null && i === datos.length - 1);
      if (denso && !activo && i !== datos.length - 1) return '';
      return `<circle class="punto ${activo ? 'activo' : ''}" cx="${x(i).toFixed(1)}" cy="${y(d.mejorPeso).toFixed(1)}" r="${activo ? 5 : 3.5}"/>`;
    })
    .join('');

  // Una sola zona de toque para toda la gráfica, que luego busca el punto más cercano.
  // Con una zona por punto se solapaban entre ellas y la mayoría quedaba inalcanzable.
  const toques = `<rect class="toque" x="${MARGEN.izquierda}" y="0"
    width="${(ANCHO - MARGEN.izquierda - MARGEN.derecha).toFixed(1)}" height="${ALTO}" data-accion="punto"/>`;

  const ultimo = datos[datos.length - 1];
  return `
  <svg class="grafica" viewBox="0 0 ${ANCHO} ${ALTO}" role="img"
    aria-label="Mejor peso por sesión, de ${datos[0].mejorPeso} a ${ultimo.mejorPeso} kilos">
    <g class="guias">${guias}</g>
    <path class="serie" d="${linea}"/>
    ${puntos}
    <text class="valor" x="${(ANCHO - MARGEN.derecha).toFixed(1)}" y="${Math.max(12, y(ultimo.mejorPeso) - 10).toFixed(1)}"
      text-anchor="end">${ultimo.mejorPeso} kg</text>
    ${toques}
  </svg>`;
}

function progresionHTML(ctx) {
  const ejercicios = ejerciciosConHistorial(ctx.db);
  if (!ejercicios.length) {
    return `
    <div class="titulo-seccion">Progresión</div>
    <div class="vacio">Anota peso y repeticiones en tus series y aquí verás cómo evolucionan.</div>`;
  }

  const elegido = ejercicios.find((e) => e.id === ejercicioVisible) ?? ejercicios[0];
  const datos = progresionEjercicio(ctx.db, elegido.id);
  const punto = datos.find((d) => d.fecha === puntoActivo) ?? datos[datos.length - 1];

  const tabla = datos
    .slice()
    .reverse()
    .map(
      (d) => `<div class="linea-hist"><span>${diaCorto(d.fecha)}</span>
        <span class="mini">${d.mejorPeso} kg · ${plural(d.series, 'serie', 'series')} · ${d.volumen} kg de volumen</span></div>`,
    )
    .join('');

  return `
  <div class="titulo-seccion">Progresión</div>
  <div class="tarjeta">
    <select data-accion="ejercicio" style="margin-bottom:12px">
      ${ejercicios
        .map((e) => `<option value="${esc(e.id)}" ${e.id === elegido.id ? 'selected' : ''}>${esc(e.nombre)}</option>`)
        .join('')}
    </select>

    ${
      datos.length < 2
        ? '<div class="vacio">Con una sola sesión todavía no hay línea que dibujar.</div>'
        : graficaHTML(datos)
    }

    <div class="entre" style="margin-top:6px">
      <span class="mini">${diaCorto(punto.fecha)}</span>
      <span class="mini">${punto.mejorPeso} kg · ${plural(punto.series, 'serie', 'series')} · ${punto.volumen} kg de volumen</span>
    </div>

    <button class="mini" style="margin-top:10px" data-accion="numeros">
      ${verNumeros ? 'Ocultar los números' : 'Ver los números'}
    </button>
    ${verNumeros ? `<div style="margin-top:8px">${tabla}</div>` : ''}
  </div>`;
}

export function render(ctx) {
  if (!Object.keys(ctx.db.dias ?? {}).length) {
    return '<div class="vacio">Registra tu primer día y aquí quedará guardado para siempre.</div>';
  }

  return `
  <div class="titulo-seccion">Calendario</div>
  ${calendarioHTML(ctx)}
  ${detalleHTML(ctx)}
  ${progresionHTML(ctx)}`;
}

export const acciones = {
  mes: (el, ctx) => {
    mesVisible = desplazarMes(mesActual(ctx), Number(el.dataset.delta));
    diaAbierto = null;
    ctx.refrescar();
  },

  verDia: (el, ctx) => {
    diaAbierto = diaAbierto === el.dataset.fecha ? null : el.dataset.fecha;
    ctx.refrescar();
  },

  cerrarDia: (_, ctx) => {
    diaAbierto = null;
    ctx.refrescar();
  },

  ejercicio: (el, ctx) => {
    ejercicioVisible = el.value;
    puntoActivo = null;
    ctx.refrescar();
  },

  /** Toca donde toque, se queda con la sesión más cercana en horizontal. */
  punto: (el, ctx, evento) => {
    const ejercicios = ejerciciosConHistorial(ctx.db);
    const elegido = ejercicios.find((e) => e.id === ejercicioVisible) ?? ejercicios[0];
    const datos = progresionEjercicio(ctx.db, elegido.id);
    if (!datos.length) return;

    const caja = el.ownerSVGElement.getBoundingClientRect();
    const enViewBox = ((evento.clientX - caja.left) / caja.width) * ANCHO;
    const cerca = datos.reduce(
      (mejor, d, i) => {
        const distancia = Math.abs(posicionX(i, datos.length) - enViewBox);
        return distancia < mejor.distancia ? { fecha: d.fecha, distancia } : mejor;
      },
      { fecha: datos[0].fecha, distancia: Infinity },
    );

    puntoActivo = cerca.fecha;
    ctx.refrescar();
  },

  numeros: (_, ctx) => {
    verNumeros = !verNumeros;
    ctx.refrescar();
  },
};

/** Al salir de la sección se olvida lo abierto, para no volver a un día de hace un mes. */
export function reiniciar() {
  mesVisible = null;
  diaAbierto = null;
  puntoActivo = null;
}
