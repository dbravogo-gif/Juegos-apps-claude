import { plural } from '../util.js';
import { clasificarEntreno, clasificarComida } from '../../core/scoring/streaks.js';
import { NOMBRE_DIA } from '../../data/defaults.js';
import { diaDeLaSemana } from '../../data/history.js';

const pct = (v) => `${Math.round(v * 100)} %`;

export function subtitulo(ctx) {
  const dias = ctx.estado.dias.length;
  return dias ? `${plural(dias, 'día registrado', 'días registrados')}` : 'Aún sin historial';
}

function tira(dias, clasificar) {
  return dias
    .map((dia) => {
      const estado = clasificar(dia);
      return `<div class="celda ${estado}" title="${dia.fecha}">${NOMBRE_DIA[diaDeLaSemana(dia.fecha)]}</div>`;
    })
    .join('');
}

function media(dias, extraer) {
  const valores = dias.map(extraer).filter((v) => typeof v === 'number');
  if (!valores.length) return null;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

export function render(ctx) {
  const { estado } = ctx;
  if (!estado.dias.length) {
    return '<div class="vacio">Registra tu primer día para empezar a ver tu progreso.</div>';
  }

  const ultimos = estado.dias.slice(-14);
  const mediaEntreno = media(ultimos, (d) => d.entreno?.cumplimiento);
  const mediaComida = media(ultimos, (d) => d.comida?.puntuacion);

  const cumplidos = ultimos.filter((d) => clasificarEntreno(d) === 'cumplido').length;
  const fallados = ultimos.filter((d) => clasificarEntreno(d) === 'fallado').length;

  const ganadoSemana = estado.resumenes
    .slice(-7)
    .reduce((total, r) => total + r.recompensa.total.xp, 0);

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
      <div class="v">${mediaEntreno === null ? '—' : pct(mediaEntreno)}</div>
      <div class="n">${plural(cumplidos, 'cumplido', 'cumplidos')} · ${fallados} fallados</div>
    </div>
    <div class="dato">
      <div class="k">Media comida</div>
      <div class="v">${mediaComida === null ? '—' : pct(mediaComida)}</div>
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
  </div>

  <div class="titulo-seccion">Cómo se reparte</div>
  <div class="tarjeta">
    <div class="entre" style="margin-bottom:9px"><span class="mini">XP total</span><b>${estado.xp}</b></div>
    <div class="entre" style="margin-bottom:9px"><span class="mini">Monedas ganadas</span><b>${estado.monedas.ganadas}</b></div>
    <div class="entre"><span class="mini">Monedas gastadas</span><b>${estado.monedas.gastadas}</b></div>
  </div>`;
}
