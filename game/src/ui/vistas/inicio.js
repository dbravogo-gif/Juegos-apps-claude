import { esc, plural } from '../util.js';
import { exencionesComidaDisponibles } from '../../core/scoring/nutrition.js';
import { clasificarEntreno, clasificarComida } from '../../core/scoring/streaks.js';
import { NOMBRE_DIA } from '../../data/defaults.js';
import { diaDeLaSemana, comidasDelDia } from '../../data/history.js';

const pct = (v) => (typeof v === 'number' ? `${Math.round(v * 100)} %` : '—');

const FECHA_LARGA = { weekday: 'long', day: 'numeric', month: 'long' };

const TITULO_SESION = {
  entreno: 'Día de entreno',
  descanso: 'Día de descanso',
  otra: 'Otra actividad',
  sin_decidir: 'Sin decidir',
};

const DETALLE_SESION = {
  descanso: 'No se te exige nada',
  otra: 'No cuenta como sesión, pero no penaliza',
  sin_decidir: 'Elige qué has hecho hoy',
};

export function subtitulo(ctx) {
  const fecha = new Date(`${ctx.hoy}T00:00:00`);
  return fecha.toLocaleDateString('es-ES', FECHA_LARGA);
}

function racha(nombre, datos, bonus) {
  if (!datos) return '';
  const clase = datos.activa ? 'viva' : 'rota';
  const texto = datos.activa ? plural(datos.longitud, 'día', 'días') : 'sin racha';
  const extra = bonus > 0 ? ` · +${Math.round(bonus * 100)} %` : '';
  return `<span class="pastilla ${clase}">${nombre} · ${texto}${extra}</span>`;
}

/** Tira de los últimos días, un cuadro por día, con el color de su clasificación. */
function tira(dias, clasificar) {
  return dias
    .map((dia) => `<div class="celda ${clasificar(dia)}" title="${dia.fecha}">${NOMBRE_DIA[diaDeLaSemana(dia.fecha)]}</div>`)
    .join('');
}

function media(dias, extraer) {
  const valores = dias.map(extraer).filter((v) => typeof v === 'number');
  if (!valores.length) return null;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

function progreso(ctx) {
  const { estado } = ctx;
  if (!estado.dias.length) return '';

  const ultimos = estado.dias.slice(-14);
  const cumplidos = ultimos.filter((d) => clasificarEntreno(d) === 'cumplido').length;
  const fallados = ultimos.filter((d) => clasificarEntreno(d) === 'fallado').length;
  const ganadoSemana = estado.resumenes.slice(-7).reduce((total, r) => total + r.recompensa.total.xp, 0);

  return `
  <div class="titulo-seccion">Últimos 14 días</div>
  <div class="tarjeta">
    <div class="mini" style="margin-bottom:7px">Entrenamiento</div>
    <div class="tira" style="margin-bottom:14px">${tira(ultimos, clasificarEntreno)}</div>
    <div class="mini" style="margin-bottom:7px">Alimentación</div>
    <div class="tira">${tira(ultimos, clasificarComida)}</div>
  </div>

  <div class="rejilla">
    <div class="dato">
      <div class="k">Media entreno</div>
      <div class="v">${pct(media(ultimos, (d) => d.entreno?.cumplimiento))}</div>
      <div class="n">${plural(cumplidos, 'cumplido', 'cumplidos')} · ${fallados} fallados</div>
    </div>
    <div class="dato">
      <div class="k">Media comida</div>
      <div class="v">${pct(media(ultimos, (d) => d.comida?.puntuacion))}</div>
    </div>
    <div class="dato">
      <div class="k">XP esta semana</div>
      <div class="v">${ganadoSemana}</div>
    </div>
    <div class="dato">
      <div class="k">Racha más larga</div>
      <div class="v">${estado.rachas?.entreno.longitud ?? 0}</div>
      <div class="n">${(estado.rachas?.entreno.longitud ?? 0) === 1 ? 'día' : 'días'} de entreno</div>
    </div>
  </div>`;
}

export function render(ctx) {
  const { estado } = ctx;
  const { nivel, xpEnNivel, xpParaSiguiente } = estado.nivel;
  const avance = xpParaSiguiente ? (xpEnNivel / xpParaSiguiente) * 100 : 100;

  const hoy = estado.hoy;
  const sesionHoy = ctx.sesionDe(ctx.hoy);
  const registro = ctx.registroDe(ctx.hoy);
  const comidas = comidasDelDia(registro, ctx.db.plan, ctx.hoy);
  const marcadas = comidas.filter((c) => c.estado || c.exenta).length;

  const rachas = estado.rachas;
  const multiplicador = rachas ? rachas.multiplicador : 1;
  const exentasRestantes = exencionesComidaDisponibles(
    Object.entries(ctx.db.dias).map(([fecha, d]) => ({ fecha, comidas: d.comidas ?? [] })),
    ctx.hoy,
  );

  return `
  <div class="tarjeta">
    <div class="nivel-fila">
      <div>
        <div class="mini">Nivel</div>
        <div class="nivel-num">${nivel}</div>
      </div>
      <div class="mini">${xpParaSiguiente ? `${xpEnNivel} / ${xpParaSiguiente} XP` : 'Nivel máximo'}</div>
    </div>
    <div class="barra-xp"><i style="width:${Math.min(100, avance)}%"></i></div>
  </div>

  <div class="rejilla">
    <div class="dato">
      <div class="k">XP total</div>
      <div class="v">${estado.xp}</div>
    </div>
    <div class="dato">
      <div class="k">Monedas</div>
      <div class="v">${estado.monedas.disponibles}</div>
      <div class="n">${estado.monedas.gastadas} gastadas</div>
    </div>
  </div>

  <div class="titulo-seccion">Rachas</div>
  <div class="tarjeta">
    <div class="fila" style="flex-wrap:wrap;gap:8px;margin-bottom:12px">
      ${racha('Entreno', rachas?.entreno, rachas?.bonusEntreno)}
      ${racha('Comida', rachas?.comida, rachas?.bonusComida)}
    </div>
    <div class="entre">
      <span class="mini">Multiplicador actual</span>
      <b>× ${multiplicador.toFixed(2)}</b>
    </div>
    ${rachas?.bonusCombinado ? '<div class="aviso" style="margin:12px 0 0">Bonus combinado activo por mantener ambas rachas.</div>' : ''}
  </div>

  <div class="titulo-seccion">Hoy</div>
  <div class="tarjeta">
    <div class="entre" style="margin-bottom:12px">
      <div>
        <b>${TITULO_SESION[sesionHoy]}</b>
        <div class="mini">${
          sesionHoy === 'entreno'
            ? `${esc(ctx.rutinaDe(ctx.hoy)?.nombre ?? '')} · cumplimiento ${pct(ctx.evaluacionDe(ctx.hoy).entreno?.cumplimiento)}`
            : DETALLE_SESION[sesionHoy]
        }</div>
      </div>
      <button class="boton fino" style="width:auto;padding:9px 16px" data-accion="irEntreno">Registrar</button>
    </div>
    <div class="entre">
      <div>
        <b>Comidas</b>
        <div class="mini">${marcadas} de ${comidas.length} marcadas · ${plural(exentasRestantes, 'exención', 'exenciones')} esta semana</div>
      </div>
      <button class="boton fino secundario" style="width:auto;padding:9px 16px" data-accion="irDieta">Marcar</button>
    </div>
  </div>

  ${
    hoy?.extras?.desbloqueado
      ? `<div class="aviso">Actividades del mundo desbloqueadas (${esc(hoy.extras.via)}): hasta ${hoy.extras.xp} XP y ${hoy.extras.monedas} monedas hoy.</div>`
      : '<div class="aviso ojo">Registra un buen día para desbloquear las actividades del mundo.</div>'
  }

  <div class="tarjeta plana">
    <div class="entre">
      <span class="mini">Ganado hoy</span>
      <b>${hoy ? hoy.recompensa.total.xp : 0} XP · ${hoy ? hoy.recompensa.total.monedas : 0} 🪙</b>
    </div>
  </div>

  ${progreso(ctx)}`;
}

export const acciones = {
  irEntreno: (_, ctx) => ctx.ir('entreno'),
  irDieta: (_, ctx) => ctx.ir('dieta'),
};
