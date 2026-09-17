import { esc, plural } from '../util.js';
import { exencionesComidaDisponibles } from '../../core/scoring/nutrition.js';

const pct = (v) => (typeof v === 'number' ? `${Math.round(v * 100)} %` : '—');

const FECHA_LARGA = { weekday: 'long', day: 'numeric', month: 'long' };

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

export function render(ctx) {
  const { estado } = ctx;
  const { nivel, xpEnNivel, xpParaSiguiente } = estado.nivel;
  const avance = xpParaSiguiente ? (xpEnNivel / xpParaSiguiente) * 100 : 100;

  const hoy = estado.hoy;
  const planHoy = ctx.planDe(ctx.hoy);
  const registro = ctx.registroDe(ctx.hoy);
  const entrenoHecho = (registro.ejercicios ?? []).length > 0;
  const comidas = registro.comidas ?? [];

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
        <b>${planHoy === 'entreno' ? 'Día de entreno' : 'Día de descanso'}</b>
        <div class="mini">${
          entrenoHecho
            ? `Cumplimiento ${pct(ctx.evaluacionDe(ctx.hoy).entreno?.cumplimiento)}`
            : planHoy === 'entreno'
              ? 'Sin registrar'
              : 'No se exige sesión'
        }</div>
      </div>
      <button class="boton fino" style="width:auto;padding:9px 16px" data-accion="registrar">Registrar</button>
    </div>
    <div class="entre">
      <div>
        <b>Comidas</b>
        <div class="mini">${plural(comidas.length, 'registrada', 'registradas')} · ${plural(exentasRestantes, 'exención', 'exenciones')} esta semana</div>
      </div>
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
  </div>`;
}

export const acciones = {
  registrar: (_, ctx) => ctx.ir('registrar'),
};
