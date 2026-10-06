// Paneles de la hoja inferior: flota, rutas, mercado, cuentas y diario.

import { AEROPUERTOS, POR_ID, abiertoEn } from '../data/aeropuertos.js';
import { TIPOS } from '../data/aviones.js';
import { distanciaKm } from '../core/geo.js';
import { anio, dia, textoFecha, textoHora } from '../core/tiempo.js';
import { LIMITE_REVISION } from '../core/riesgo.js';
import { costeRevision, costeReparacion, costeInspeccion, valorMercado, catalogoNuevos, edad, nombrePieza } from '../core/flota.js';
import { demandaPropia, precioBillete, TARIFAS } from '../core/economia.js';
import { limitePrestamo, patrimonio, puedeOperar, horariosRuta } from '../core/sim.js';
import { dinero, porcentaje, esc, km, barra } from './formato.js';

const vacio = (titulo, texto) => `<div class="vacio"><p class="vacio-titulo">${titulo}</p><p>${texto}</p></div>`;

function estadoAvion(estado, a) {
  if (a.estado === 'vuelo') return `<span class="chip vuelo">En vuelo</span> ${esc(a.vuelo.numero)} ${a.vuelo.origen}→${a.vuelo.destino}, llega ${textoHora(a.vuelo.llegada)}`;
  if (a.estado === 'taller') return `<span class="chip taller">Taller</span> hasta el ${textoFecha(a.libreEn, { corta: true })} ${textoHora(a.libreEn)}`;
  if (a.estado === 'esperando') return `<span class="chip alerta">Esperando tu decisión</span> en ${a.lugar}`;
  const ruta = estado.rutas.find((r) => r.id === a.ruta);
  if (!ruta && a.lugar === estado.base) return `<span class="chip">Parado</span> en ${a.lugar}, sin ruta`;
  return `<span class="chip">En tierra</span> en ${a.lugar}${a.libreEn > estado.t ? `, listo ${dia(a.libreEn) > dia(estado.t) ? 'mañana a las' : 'a las'} ${textoHora(a.libreEn)}` : ''}`;
}

export function panelFlota(estado) {
  if (!estado.aviones.length) {
    return vacio('Todavía no tienes aviones', 'En el Mercado hay aviones de segunda mano. Inspeccionar cuesta dinero, pero comprar a ciegas puede salir más caro.')
      + '<button class="btn" data-ir="mercado">Ir al mercado</button>';
  }
  const n = anio(estado.t);
  return estado.aviones.map((a) => {
    const tipo = TIPOS[a.tipo];
    const conocidos = a.defectos.filter((d) => d.descubierto);
    const pedida = a.tareas.some((t) => t.tipo === 'revision');
    const opciones = [`<option value="">Sin ruta</option>`, ...estado.rutas.map((r) => {
      const error = puedeOperar(estado, a, r.destino);
      return `<option value="${r.id}" ${a.ruta === r.id ? 'selected' : ''} ${error ? 'disabled' : ''}>${r.origen}⇄${r.destino}${error ? ` · ${esc(error)}` : ''}</option>`;
    })].join('');
    return `
    <article class="ficha">
      <header class="ficha-cab">
        <div><h3>${esc(a.matricula)}</h3><p>${esc(tipo.nombre)} · ${edad(a, n)} años · ${tipo.plazas} plazas</p></div>
        <span class="ficha-valor">${dinero(valorMercado(a, n))}</span>
      </header>
      <p class="ficha-estado">${estadoAvion(estado, a)}</p>
      <div class="piezas">
        <div><span>Motores</span>${barra(a.partes.motores)}<em>${Math.round(a.partes.motores)}</em></div>
        <div><span>Tren</span>${barra(a.partes.tren)}<em>${Math.round(a.partes.tren)}</em></div>
        <div><span>Fuselaje</span>${barra(a.partes.fuselaje)}<em>${Math.round(a.partes.fuselaje)}</em></div>
        <div><span>Revisión</span>${barra(LIMITE_REVISION - a.horasDesdeRevision, LIMITE_REVISION, a.horasDesdeRevision > LIMITE_REVISION ? 'mal' : a.horasDesdeRevision > 400 ? 'regular' : 'bien')}<em>${Math.round(a.horasDesdeRevision)} h</em></div>
      </div>
      ${conocidos.length ? `<ul class="defectos">${conocidos.map((d) => {
        const pedidaR = a.tareas.some((t) => t.defecto === d.id);
        return `<li><span class="grav g${d.gravedad}">${['', 'Leve', 'Serio', 'Grave'][d.gravedad]}</span> ${esc(nombrePieza(d.pieza))}: ${esc(d.texto)}
          ${pedidaR ? '<em>En cola de taller</em>' : `<button class="btn-mini" data-accion="reparar" data-avion="${a.id}" data-defecto="${d.id}">Reparar · ${dinero(costeReparacion(a, d))}</button>`}</li>`;
      }).join('')}</ul>` : ''}
      <label class="campo"><span>Ruta</span><select id="ruta-avion-${a.id}" data-accion="asignar" data-avion="${a.id}">${opciones}</select></label>
      <div class="fila-botones">
        ${pedida ? '<span class="nota">Revisión pedida: entra al taller cuando esté en la base.</span>' : `<button class="btn-mini" data-accion="revision" data-avion="${a.id}">Revisión · ${dinero(costeRevision(a))}</button>`}
        <button class="btn-mini peligro" data-accion="vender" data-avion="${a.id}">Vender · ${dinero(valorMercado(a, n) * 0.85)}</button>
      </div>
      <p class="ficha-pie">${a.stats.vuelos} vuelos · ${a.stats.beneficio >= 0 ? 'beneficio' : 'pérdida'} ${dinero(a.stats.beneficio)}</p>
    </article>`;
  }).join('');
}

export function destinosPosibles(estado) {
  const base = POR_ID[estado.base];
  const n = anio(estado.t);
  return AEROPUERTOS
    .filter((a) => a.id !== estado.base && abiertoEn(a, n) && !estado.rutas.some((r) => r.destino === a.id))
    .map((a) => ({ a, dist: distanciaKm(base, a) }))
    .sort((x, y) => x.dist - y.dist);
}

export function panelRutas(estado) {
  const base = POR_ID[estado.base];
  const opciones = destinosPosibles(estado).map(({ a, dist }) => {
    const pax = Math.round(demandaPropia(base, a, estado.t, estado.reputacion));
    return `<option value="${a.id}">${a.id} · ${esc(a.ciudad)} · ${km(dist)} · ~${pax} pax/día</option>`;
  }).join('');
  const nueva = `
  <div class="nueva-ruta">
    <label class="campo"><span>Nueva ruta desde ${base.id}</span><select id="nueva-ruta-destino">${opciones}</select></label>
    <button class="btn" data-accion="crear-ruta">Abrir ruta</button>
    <p class="nota">Pax/día: lo que podrías llenar en cada sentido con la reputación de hoy. También puedes tocar un aeropuerto en el globo.</p>
  </div>`;
  if (!estado.rutas.length) return vacio('Sin rutas', 'Una ruta une tu base con un destino. Después le asignas un avión y decides cuántas vueltas hace al día.') + nueva;

  const lista = estado.rutas.map((r) => {
    const d = POR_ID[r.destino];
    const dist = distanciaKm(base, d);
    const avion = estado.aviones.find((a) => a.id === r.avion);
    const pax = Math.round(demandaPropia(base, d, estado.t, estado.reputacion, r.tarifa));
    const ocupacion = r.stats.plazas ? r.stats.pax / r.stats.plazas : null;
    const sinAvion = estado.aviones.filter((a) => !a.ruta && !puedeOperar(estado, a, r.destino));
    return `
    <article class="ficha">
      <header class="ficha-cab">
        <div><h3>${esc(estado.codigo)} ${r.numero} · ${r.origen} ⇄ ${r.destino}</h3><p>${esc(d.nombre)} · ${km(dist)} · billete ${dinero(precioBillete(dist, r.tarifa))}</p></div>
      </header>
      <p class="ficha-estado">${avion ? `<span class="chip vuelo">${esc(avion.matricula)}</span> ${esc(TIPOS[avion.tipo].corto)}` : `<span class="chip alerta">Sin avión</span>`}
        ${!avion && sinAvion.length ? `<button class="btn-mini" data-accion="asignar-libre" data-ruta="${r.id}" data-avion="${sinAvion[0].id}">Asignar ${esc(sinAvion[0].matricula)}</button>` : ''}</p>
      <div class="control-fila">
        <span>Vueltas al día</span>
        <div class="paso">
          <button class="btn-mini" data-accion="frecuencia" data-ruta="${r.id}" data-delta="-1" aria-label="Una vuelta menos">−</button>
          <strong>${r.frecuencia}</strong>
          <button class="btn-mini" data-accion="frecuencia" data-ruta="${r.id}" data-delta="1" aria-label="Una vuelta más">+</button>
        </div>
      </div>
      <p class="nota">Salidas de ${r.origen}: ${horariosRuta(r).map((m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`).join(' · ')} · demanda ~${pax} pax/día</p>
      <div class="segmentado" role="group" aria-label="Tarifa">
        ${Object.entries(TARIFAS).map(([k, t]) => `<button class="${r.tarifa === k ? 'activo' : ''}" data-accion="tarifa" data-ruta="${r.id}" data-tarifa="${k}">${t.nombre}</button>`).join('')}
      </div>
      <p class="ficha-pie">${r.stats.vuelos} vuelos · ocupación ${ocupacion == null ? '—' : porcentaje(ocupacion)} · ${r.stats.beneficio >= 0 ? 'beneficio' : 'pérdida'} ${dinero(r.stats.beneficio)}
        <button class="btn-mini peligro" data-accion="borrar-ruta" data-ruta="${r.id}">Cerrar ruta</button></p>
    </article>`;
  }).join('');
  return lista + nueva;
}

export function panelMercado(estado) {
  const n = anio(estado.t);
  const base = POR_ID[estado.base];
  const segunda = estado.mercado.map((o) => {
    const a = o.avion;
    const tipo = TIPOS[a.tipo];
    const noBase = tipo.pista > base.pista;
    const detalle = o.inspeccionada
      ? `<div class="piezas">
          <div><span>Motores</span>${barra(a.partes.motores)}<em>${Math.round(a.partes.motores)}</em></div>
          <div><span>Tren</span>${barra(a.partes.tren)}<em>${Math.round(a.partes.tren)}</em></div>
          <div><span>Fuselaje</span>${barra(a.partes.fuselaje)}<em>${Math.round(a.partes.fuselaje)}</em></div>
        </div>
        ${a.defectos.length ? `<ul class="defectos">${a.defectos.map((d) => `<li><span class="grav g${d.gravedad}">${['', 'Leve', 'Serio', 'Grave'][d.gravedad]}</span> ${esc(nombrePieza(d.pieza))}: ${esc(d.texto)} <em>${dinero(costeReparacion(a, d))}</em></li>`).join('')}</ul>` : '<p class="nota bien">Inspección limpia: sin defectos.</p>'}`
      : `<p class="ficha-estado">El vendedor dice: <strong>${esc(o.anunciado)}</strong></p>`;
    return `
    <article class="ficha">
      <header class="ficha-cab">
        <div><h3>${esc(tipo.nombre)}</h3><p>${a.fabricado} · ${Math.round(a.horas).toLocaleString('es-ES')} h de vuelo · revisión a ${Math.round(a.horasDesdeRevision)} h${tipo.ficticio ? ' · fabricación del Este' : ''}</p></div>
        <span class="ficha-valor">${dinero(o.precio)}</span>
      </header>
      <p class="nota">${esc(o.vendedor)}. ${tipo.plazas} plazas · alcance ${km(tipo.alcance)} · pista ${tipo.pista} m${noBase ? ` · <strong class="mal">no puede operar en ${base.id}</strong>` : ''}</p>
      ${detalle}
      <div class="fila-botones">
        ${o.inspeccionada ? '' : `<button class="btn-mini" data-accion="inspeccionar" data-oferta="${o.id}">Inspeccionar · ${dinero(costeInspeccion(o.precio))}</button>`}
        <button class="btn-mini primario" data-accion="comprar" data-oferta="${o.id}" ${estado.caja < o.precio ? 'disabled' : ''}>Comprar</button>
      </div>
    </article>`;
  }).join('');
  const nuevos = catalogoNuevos(n).sort((x, y) => x.precio - y.precio).map((t) => `
    <article class="ficha compacta">
      <header class="ficha-cab">
        <div><h3>${esc(t.nombre)}</h3><p>${t.plazas} plazas · ${km(t.alcance)} · pista ${t.pista} m · ${dinero(t.costeHora)}/h</p></div>
        <button class="btn-mini primario" data-accion="comprar-nuevo" data-tipo="${t.id}" ${estado.caja < t.precio ? 'disabled' : ''}>${dinero(t.precio)}</button>
      </header>
      ${t.descripcion ? `<p class="nota">${esc(t.descripcion)}</p>` : ''}
    </article>`).join('');
  return `<h3 class="seccion">Segunda mano</h3><p class="nota">Cambia cada mes. Lo que inspecciones se queda en la lista.</p>${segunda}
    <h3 class="seccion">Nuevos de fábrica</h3>${nuevos}`;
}

function grafica(historial) {
  const dias = historial.slice(-30);
  if (!dias.length) return '<p class="nota">La gráfica aparece al cerrar el primer día.</p>';
  const netos = dias.map((d) => d.ingresos - d.gastos);
  const max = Math.max(1, ...netos.map(Math.abs));
  const w = 300;
  const h = 70;
  const bw = w / 30;
  const barras = netos.map((v, i) => {
    const alto = (Math.abs(v) / max) * (h / 2 - 2);
    const y = v >= 0 ? h / 2 - alto : h / 2;
    return `<rect x="${(i * bw + 1).toFixed(1)}" y="${y.toFixed(1)}" width="${(bw - 2).toFixed(1)}" height="${Math.max(0.5, alto).toFixed(1)}" class="${v >= 0 ? 'pos' : 'neg'}"/>`;
  }).join('');
  return `<svg class="grafica" viewBox="0 0 ${w} ${h}" role="img" aria-label="Resultado diario de los últimos ${dias.length} días"><line x1="0" x2="${w}" y1="${h / 2}" y2="${h / 2}"/>${barras}</svg>`;
}

const UMBRALES = [[0, 'Siempre'], [0.001, '0,1 %'], [0.003, '0,3 %'], [0.01, '1 %'], [0.03, '3 %'], [1, 'Nunca']];

export function panelCuentas(estado) {
  const dias = estado.cuentas.historial.slice(-30);
  const ing = dias.reduce((s, d) => s + d.ingresos, 0);
  const gas = dias.reduce((s, d) => s + d.gastos, 0);
  const limite = limitePrestamo(estado);
  const accidentes = estado.accidentes.map((a) => `<li><strong>${textoFecha(a.t, { corta: true })}</strong> ${esc(a.numero)} en ${esc(POR_ID[a.lugar].ciudad)}: ${a.fallecidos} fallecidos. ${a.cerrado ? (a.negligencia ? 'Negligencia.' : 'Sin negligencia.') : 'Investigación en curso.'}</li>`).join('');
  return `
  <div class="cifras">
    <div><span>Caja</span><strong>${dinero(estado.caja)}</strong></div>
    <div><span>Préstamo</span><strong>${dinero(estado.prestamo)}</strong></div>
    <div><span>Patrimonio</span><strong>${dinero(patrimonio(estado))}</strong></div>
    <div><span>Reputación</span><strong>${Math.round(estado.reputacion)}/100</strong></div>
  </div>
  <h3 class="seccion">Últimos 30 días</h3>
  ${grafica(estado.cuentas.historial)}
  <p class="nota">Ingresos ${dinero(ing)} · gastos ${dinero(gas)} · resultado <strong>${dinero(ing - gas)}</strong></p>
  <h3 class="seccion">Banco</h3>
  <p class="nota">Interés del 9 % anual. Te prestan hasta ${dinero(limite)}, según el valor de tu flota.</p>
  <div class="fila-botones">
    <button class="btn-mini" data-accion="prestamo" data-cantidad="500000" ${estado.prestamo + 500000 > limite ? 'disabled' : ''}>Pedir $500 k</button>
    <button class="btn-mini" data-accion="devolver" data-cantidad="500000" ${estado.prestamo <= 0 || estado.caja < Math.min(500000, estado.prestamo) ? 'disabled' : ''}>Devolver $500 k</button>
  </div>
  <h3 class="seccion">Despacho</h3>
  <label class="campo"><span>Consultarme cuando el riesgo estimado supere</span>
    <select id="umbral" data-accion="umbral">${UMBRALES.map(([v, t]) => `<option value="${v}" ${estado.ajustes.umbral === v ? 'selected' : ''}>${t}</option>`).join('')}</select>
  </label>
  <p class="nota">Por debajo, el vuelo sale solo. Si subes el umbral te molestan menos… y decides menos.</p>
  ${accidentes ? `<h3 class="seccion">Accidentes</h3><ul class="lista-simple">${accidentes}</ul>` : ''}
  <h3 class="seccion">Partida</h3>
  <p class="nota">Semilla ${estado.semilla}: con la misma semilla y la misma base, el tiempo y el mercado son iguales para todos.</p>
  <div class="fila-botones"><button class="btn-mini peligro" data-accion="nueva-partida">Empezar otra partida</button></div>`;
}

export function panelDiario(estado) {
  if (!estado.diario.length) return vacio('Nada todavía', 'Aquí queda lo que pasa en la compañía.');
  return `<ol class="diario">${estado.diario.slice(0, 120).map((e) => `<li class="d-${e.tipo}"><time>${textoFecha(e.t, { corta: true })} ${textoHora(e.t)}</time><span>${esc(e.texto)}</span></li>`).join('')}</ol>`;
}

export function htmlAeropuerto(estado, id) {
  const a = POR_ID[id];
  const base = POR_ID[estado.base];
  const n = anio(estado.t);
  const dist = distanciaKm(base, a);
  const ruta = estado.rutas.find((r) => r.destino === id);
  const pax = id === estado.base ? null : Math.round(demandaPropia(base, a, estado.t, estado.reputacion));
  let accion = '';
  if (id === estado.base) accion = '<p class="nota">Tu base.</p>';
  else if (!abiertoEn(a, n)) accion = `<p class="nota">Abre en ${a.desde}.</p>`;
  else if (ruta) accion = `<button class="btn-mini" data-ir="rutas">Ver la ruta</button>`;
  else accion = `<button class="btn-mini primario" data-accion="crear-ruta-a" data-destino="${id}">Abrir ruta ${estado.base}–${id}</button>`;
  return `
    <div class="ap-cab"><div><h3>${a.id} · ${esc(a.ciudad)}</h3><p>${esc(a.nombre)}</p></div><button class="cerrar" data-accion="cerrar-ap" aria-label="Cerrar">×</button></div>
    <p class="nota">Pista ${a.pista} m · ILS ${a.ils ? 'sí' : 'no'}${a.montana ? ' · terreno montañoso' : ''}${id !== estado.base ? ` · ${km(dist)} desde ${base.id} · ~${pax} pax/día` : ''}</p>
    ${accion}`;
}
