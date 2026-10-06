// La hoja de despacho: la decisión de si el vuelo sale.
//
// No enseña porcentajes exactos: la valoración del despachador va en palabras, con lo que se
// sabe. Lo que nadie ha inspeccionado no aparece.

import { TIPOS } from '../data/aviones.js';
import { textoClima, ICONOS } from '../core/clima.js';
import { textoHora, textoFecha } from '../core/tiempo.js';
import { visibilidad, minimos, descripcionAproximacion } from '../core/riesgo.js';
import { describir } from '../core/mantenimiento.js';
import { informeDespacho } from '../core/sim.js';
import { dinero, esc } from './formato.js';

function textoVisibilidad(m) {
  return m >= 5000 ? 'buena' : m >= 1000 ? `${(m / 1000).toLocaleString('es-ES')} km` : `${m} m`;
}

function filaClima(etiqueta, clima) {
  const clase = clima.sev >= 3 ? 'mal' : clima.sev === 2 ? 'regular' : '';
  return `<div class="hd-fila"><span class="hd-etq">${etiqueta}</span><span class="hd-val ${clase}">${ICONOS[clima.tipo]} ${esc(textoClima(clima))}</span></div>`;
}

const LO_MAS_PROBABLE = {
  bajoMinimos: (e) => `desvío o espera: ${e.motivo}`,
  cercaMinimos: (e) => `aproximación difícil: ${e.motivo}`,
  tormentaDestino: (e) => `espera o desvío: ${e.motivo}`,
  vientoCruzado: (e) => `motor y al aire: ${e.motivo}`,
  turbulencia: (e) => `turbulencia: ${e.motivo}`,
  salidaPista: (e) => `frenada larga: ${e.motivo}`,
};

export function htmlTarjeta(estado, dec) {
  const inf = informeDespacho(estado, dec);
  const { avion, ctx, est, com } = inf;
  const tipo = TIPOS[avion.tipo];
  const o = ctx.origen;
  const d = ctx.destino;
  const conocidas = avion.averias.filter((x) => x.fase !== 'oculta');
  const visPrevista = visibilidad(ctx.prevision.destino);
  const min = minimos(d, tipo);
  const probable = est.probable ? (LO_MAS_PROBABLE[est.probable.id]?.(est.probable) ?? est.probable.motivo) : null;
  const plazas = ctx.tramo.plazasMax;

  return `
  <div class="hoja" role="dialog" aria-labelledby="hd-titulo">
    <header class="hd-cabecera">
      <div>
        <p class="hd-eyebrow">Hoja de despacho · ${textoFecha(dec.t, { corta: true })}</p>
        <h2 id="hd-titulo" class="hd-vuelo">${esc(inf.numero)}</h2>
      </div>
      <div class="hd-hora"><span>Salida</span><strong>${textoHora(dec.t)}</strong></div>
    </header>
    <div class="hd-ruta"><span>${o.id}</span><i aria-hidden="true">✈</i><span>${d.id}</span></div>
    <p class="hd-sub">${esc(o.ciudad)} → ${esc(d.ciudad)} · ${Math.round(ctx.duracion)} min · ${esc(tipo.corto)} ${esc(avion.matricula)}</p>

    <div class="hd-valoracion">
      <div class="hd-riesgo ${inf.incidencia.clase}">
        <div><span class="hd-etq">Probabilidad de incidencias</span><strong>${inf.incidencia.texto}</strong></div>
      </div>
      <div class="hd-riesgo ${inf.grave.clase}">
        <div><span class="hd-etq">Riesgo grave</span><strong>${inf.grave.texto}</strong></div>
        <span class="hd-sello">${inf.grave.texto}</span>
      </div>
    </div>
    ${probable ? `<p class="hd-probable">Lo más probable si sale: <strong>${esc(probable)}</strong>.</p>` : ''}
    <p class="hd-nota">Valoración de tu despachador con la información que tiene. Lo que nadie ha inspeccionado no lo ve.</p>

    ${ctx.irregularidades.length ? `
    <section class="hd-bloque hd-irregular">
      <h3>Fuera de norma</h3>
      <ul>${ctx.irregularidades.map((x) => `<li>${esc(x.texto)}</li>`).join('')}</ul>
      <p>Si despegas así y pasa algo, la investigación lo contará. Y una inspección en rampa puede multarte.</p>
    </section>` : ''}

    <section class="hd-bloque hd-columnas">
      <div>
        <h3>Meteo prevista</h3>
        ${filaClima(o.id, ctx.prevision.origen)}
        ${filaClima('Ruta', ctx.prevision.ruta)}
        ${filaClima(d.id, ctx.prevision.destino)}
        <div class="hd-fila"><span class="hd-etq">Visibilidad</span><span class="hd-val ${visPrevista < min ? 'mal' : visPrevista < min * 1.5 ? 'regular' : ''}">${textoVisibilidad(visPrevista)} (mínimo ${textoVisibilidad(min)})</span></div>
      </div>
      <div>
        <h3>Destino</h3>
        <div class="hd-fila"><span class="hd-etq">Aproximación</span><span class="hd-val ${d.ils === 0 ? 'regular' : ''}">${esc(descripcionAproximacion(d, tipo))}</span></div>
        <div class="hd-fila"><span class="hd-etq">Pista</span><span class="hd-val">${Math.round(ctx.pistaDestino).toLocaleString('es-ES')} m${d.finPista === 'peligroso' ? ', final peligroso' : ''}</span></div>
        <div class="hd-fila"><span class="hd-etq">Terreno</span><span class="hd-val ${d.montana ? 'regular' : ''}">${d.montana ? 'Montañoso' : 'Llano'}</span></div>
      </div>
      <div>
        <h3>Avión</h3>
        ${conocidas.length ? conocidas.map((x) => `<div class="hd-fila hd-averia"><span>${esc(describir(x))}</span></div>`).join('') : '<div class="hd-fila"><span class="hd-val">Sin averías conocidas</span></div>'}
        <div class="hd-fila"><span class="hd-etq">Terreno</span><span class="hd-val ${avion.equipo.gpws && !avion.inop.gpws ? '' : 'regular'}">${avion.equipo.egpws ? 'EGPWS' : avion.equipo.gpws ? (avion.inop.gpws ? 'GPWS averiado' : 'GPWS') : 'Sin GPWS'}</span></div>
        <div class="hd-fila"><span class="hd-etq">Radar</span><span class="hd-val ${avion.equipo.radar && !avion.inop.radar ? '' : 'regular'}">${avion.equipo.radar ? (avion.inop.radar ? 'Averiado' : 'Operativo') : 'No tiene'}</span></div>
      </div>
      <div>
        <h3>Tripulación</h3>
        <div class="hd-fila"><span class="hd-etq">Actividad</span><span class="hd-val ${ctx.jornada > 13 ? 'mal' : ctx.jornada > 10 ? 'regular' : ''}">${ctx.jornada.toFixed(1)} h al llegar</span></div>
        ${ctx.noche ? '<div class="hd-fila"><span class="hd-etq">Llegada</span><span class="hd-val regular">De noche</span></div>' : ''}
      </div>
    </section>

    <div class="hd-negocio">
      <span><strong>${com.pax}</strong>/${plazas}${plazas < tipo.plazas ? ` (de ${tipo.plazas})` : ''} pasajeros</span>
      <span>Ingreso <strong>${dinero(com.ingreso)}</strong></span>
    </div>

    <div class="hd-acciones">
      <button class="btn btn-despegar" data-decision="despegar">Despegar</button>
      <button class="btn" data-decision="extra">Combustible extra <small>+${dinero(inf.costeExtra)} · más margen para esperar o desviarse · riesgo grave: ${inf.graveExtra.texto.toLowerCase()}</small></button>
      ${inf.taller ? `<button class="btn" data-decision="taller">Cancelar y mandarlo al taller <small>se encarga lo vencido o pendiente · −${dinero(inf.compensacion)} por el vuelo</small></button>` : ''}
      ${inf.traslado ? `<button class="btn" data-decision="traslado">Traslado a la base sin pasaje <small>permiso especial de vuelo · se cancela este tramo (−${dinero(inf.compensacion)})</small></button>` : ''}
      <div class="hd-par">
        <button class="btn btn-sec" data-decision="retrasar">Retrasar 2 h</button>
        <button class="btn btn-sec" data-decision="cancelar">Cancelar <small>−${dinero(inf.compensacion)} y reputación</small></button>
      </div>
    </div>
  </div>`;
}
