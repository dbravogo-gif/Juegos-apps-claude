// La hoja de despacho: la decisión de si el vuelo sale.

import { POR_ID } from '../data/aeropuertos.js';
import { TIPOS } from '../data/aviones.js';
import { textoClima, ICONOS } from '../core/clima.js';
import { textoHora, textoFecha } from '../core/tiempo.js';
import { LIMITE_REVISION, factorPista } from '../core/riesgo.js';
import { costeVuelo } from '../core/economia.js';
import { dinero, porcentaje, nivelRiesgo, esc, barra } from './formato.js';

function filaClima(etiqueta, clima) {
  const icono = ICONOS[clima.tipo];
  const clase = clima.sev >= 3 ? 'mal' : clima.sev === 2 ? 'regular' : 'bien';
  return `<div class="hd-fila"><span class="hd-etq">${etiqueta}</span><span class="hd-val ${clase}">${icono} ${esc(textoClima(clima))}</span></div>`;
}

export function htmlTarjeta(estado, dec) {
  const avion = estado.aviones.find((a) => a.id === dec.avion);
  const tipo = TIPOS[avion.tipo];
  const o = POR_ID[dec.origen];
  const d = POR_ID[dec.destino];
  const ev = dec.evaluacion;
  const nivel = nivelRiesgo(dec.estimacion);
  const visibles = ev.factores.filter((f) => !f.oculto && f.valor >= ev.visible * 0.04).slice(0, 6);
  const maxF = Math.max(...visibles.map((f) => f.valor), 1e-9);
  const conocidos = avion.defectos.filter((x) => x.descubierto);
  const vencida = avion.horasDesdeRevision > LIMITE_REVISION;
  const holgura = factorPista(d, tipo);
  const extra = costeVuelo(tipo, dec.duracion / 60, d, dec.pax, dec.ingreso, true) - dec.coste;
  const compensacion = Math.round(dec.ingreso * 0.1);

  return `
  <div class="hoja" role="dialog" aria-labelledby="hd-titulo">
    <header class="hd-cabecera">
      <div>
        <p class="hd-eyebrow">Hoja de despacho · ${textoFecha(dec.t, { corta: true })}</p>
        <h2 id="hd-titulo" class="hd-vuelo">${esc(dec.numero)}</h2>
      </div>
      <div class="hd-hora"><span>Salida</span><strong>${textoHora(dec.t)}</strong></div>
    </header>
    <div class="hd-ruta"><span>${o.id}</span><i aria-hidden="true">✈</i><span>${d.id}</span></div>
    <p class="hd-sub">${esc(o.ciudad)} → ${esc(d.ciudad)} · ${Math.round(dec.duracion)} min · ${esc(tipo.corto)} ${esc(avion.matricula)}</p>

    <div class="hd-riesgo ${nivel.clase}">
      <div>
        <span class="hd-etq">Riesgo estimado</span>
        <strong>${porcentaje(dec.estimacion)}</strong>
      </div>
      <span class="hd-sello">${nivel.texto}</span>
    </div>
    <p class="hd-nota">Estimación de tu despachador: puede equivocarse en un tercio arriba o abajo, y no ve lo que nadie ha inspeccionado.</p>

    <section class="hd-bloque">
      <h3>Qué pesa</h3>
      <ul class="hd-factores">
        ${visibles.map((f) => `<li><span>${esc(f.texto)}</span><span class="hd-peso"><span style="width:${Math.max(4, (f.valor / maxF) * 100).toFixed(0)}%"></span></span></li>`).join('')}
      </ul>
    </section>

    <section class="hd-bloque hd-columnas">
      <div>
        <h3>Meteo</h3>
        ${filaClima(o.id, ev.clima.origen)}
        ${filaClima('Ruta', ev.clima.ruta)}
        ${filaClima(d.id, ev.clima.destino)}
      </div>
      <div>
        <h3>Avión</h3>
        <div class="hd-fila"><span class="hd-etq">Motores</span>${barra(avion.partes.motores)}</div>
        <div class="hd-fila"><span class="hd-etq">Tren</span>${barra(avion.partes.tren)}</div>
        <div class="hd-fila"><span class="hd-etq">Fuselaje</span>${barra(avion.partes.fuselaje)}</div>
        <div class="hd-fila"><span class="hd-etq">Revisión</span><span class="hd-val ${vencida ? 'mal' : ''}">${Math.round(avion.horasDesdeRevision)} / ${LIMITE_REVISION} h</span></div>
      </div>
      <div>
        <h3>Destino</h3>
        <div class="hd-fila"><span class="hd-etq">Pista</span><span class="hd-val ${holgura > 2 ? 'mal' : holgura > 1 ? 'regular' : ''}">${d.pista} m (necesita ${tipo.pista})</span></div>
        <div class="hd-fila"><span class="hd-etq">ILS</span><span class="hd-val ${d.ils ? '' : 'regular'}">${d.ils ? 'Sí' : 'No'}</span></div>
        <div class="hd-fila"><span class="hd-etq">Terreno</span><span class="hd-val ${d.montana ? 'regular' : ''}">${d.montana ? 'Montañoso' : 'Llano'}</span></div>
      </div>
      <div>
        <h3>Tripulación</h3>
        <div class="hd-fila"><span class="hd-etq">Hoy</span><span class="hd-val ${ev.jornada > 9 ? 'mal' : ''}">${ev.jornada.toFixed(1)} h al llegar</span></div>
        ${conocidos.length ? `<div class="hd-fila"><span class="hd-etq">Defectos</span><span class="hd-val mal">${conocidos.length} sin reparar</span></div>` : ''}
      </div>
    </section>

    <div class="hd-negocio">
      <span><strong>${dec.pax}</strong>/${tipo.plazas} pasajeros</span>
      <span>Ingreso <strong>${dinero(dec.ingreso)}</strong></span>
    </div>

    <div class="hd-acciones">
      <button class="btn btn-despegar" data-decision="despegar">Despegar</button>
      <button class="btn" data-decision="extra">Combustible para alternativo <small>+${dinero(extra)} · se puede desviar</small></button>
      <div class="hd-par">
        <button class="btn btn-sec" data-decision="retrasar">Retrasar 2 h</button>
        <button class="btn btn-sec" data-decision="cancelar">Cancelar <small>−${dinero(compensacion)} y reputación</small></button>
      </div>
    </div>
  </div>`;
}
