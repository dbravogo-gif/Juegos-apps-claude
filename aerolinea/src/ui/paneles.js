// Paneles de la hoja inferior: flota, rutas, mercado, cuentas y diario.

import { AEROPUERTOS, POR_ID, abiertoEn, pistaEn, nivelCostes } from '../data/aeropuertos.js';
import { TIPOS, programa, tiposEnProduccion } from '../data/aviones.js';
import { MOTORES } from '../data/motores.js';
import { AVERIAS, METODOS, DIAGNOSTICO, DIAS_MEL } from '../data/averias.js';
import { TECNOLOGIAS, ORDEN_TECNOLOGIAS, puedeInstalar } from '../data/tecnologias.js';
import { distanciaKm } from '../core/geo.js';
import { anio, anioDecimal, dia, textoFecha, textoHora } from '../core/tiempo.js';
import { evaluarRuta } from '../core/operaciones.js';
import {
  describir, puedeDiferir, metodoDe, tipoDiagnostico, costeRevision, diasRevision, costeRG, alquilerMotor,
  diasTallerMotor, irregularidades,
} from '../core/mantenimiento.js';
import { valorMercado, edad } from '../core/flota.js';
import { resumenSeguridad } from '../core/seguridad.js';
import { demandaPropia, precioBillete, precioNuevo, precioGalon, indice, TARIFAS, SERVICIOS } from '../core/economia.js';
import { limitePrestamo, patrimonio, puedeOperar, horariosRuta, costeReparar, costeInspeccionCompra } from '../core/sim.js';
import { dinero, porcentaje, esc, km } from './formato.js';

const vacio = (titulo, texto) => `<div class="vacio"><p class="vacio-titulo">${titulo}</p><p>${texto}</p></div>`;
const horasTexto = (h) => `${Math.round(h).toLocaleString('es-ES')} h`;

function estadoAvion(estado, a) {
  if (a.estado === 'vuelo') return `<span class="chip vuelo">En vuelo</span> ${esc(a.vuelo.numero)} ${a.vuelo.origen}→${a.vuelo.destino}, llega ${textoHora(a.vuelo.llegada)}`;
  if (a.estado === 'taller') return `<span class="chip taller">Taller</span> hasta el ${textoFecha(a.libreEn, { corta: true })} ${textoHora(a.libreEn)}`;
  if (a.estado === 'esperando') return `<span class="chip alerta">Esperando tu decisión</span> en ${a.lugar}`;
  const ruta = estado.rutas.find((r) => r.id === a.ruta);
  if (!ruta && a.lugar === estado.base) return `<span class="chip">Parado</span> en ${a.lugar}, sin ruta`;
  const cuando = a.libreEn > estado.t ? `, listo ${dia(a.libreEn) > dia(estado.t) ? 'mañana a las' : 'a las'} ${textoHora(a.libreEn)}` : '';
  return `<span class="chip">En tierra</span> en ${a.lugar}${cuando}`;
}

// Estado de un intervalo de mantenimiento, en palabras.
function chipIntervalo(usado, intervalo) {
  const f = usado / intervalo;
  if (f > 1.1) return '<span class="chip alerta">Vencida</span>';
  if (f > 0.9) return '<span class="chip aviso">Toca ya</span>';
  if (f > 0.7) return '<span class="chip">Pronto</span>';
  return '';
}

const FASES = {
  indicio: { texto: 'Indicio', clase: 'aviso' },
  anomalia: { texto: 'Anomalía', clase: 'aviso' },
  confirmada: { texto: 'Confirmada', clase: 'alerta' },
  diferida: { texto: 'Diferida', clase: '' },
};

function filaAveria(estado, a, x) {
  const n = anio(estado.t);
  const pedida = a.tareas.some((t) => t.averia === x.id);
  let fase = FASES[x.fase];
  let detalle = '';
  if (x.fase === 'confirmada' && x.diagnostico) {
    fase = x.diagnostico.fueraDeLimites ? { texto: 'Fuera de límites', clase: 'alerta' } : { texto: 'Dentro de límites', clase: '' };
  }
  if (x.equipo) fase = { texto: 'Inoperativo', clase: 'alerta' };
  if (x.fase === 'diferida') detalle = ` · hasta el ${textoFecha(x.diferidaHasta, { corta: true })}`;
  const botones = [];
  if (pedida) botones.push('<em>En cola de taller</em>');
  else if (x.fase === 'indicio') {
    const m = METODOS[metodoDe(x)];
    botones.push(`<button class="btn-mini" data-accion="inspeccionar-averia" data-avion="${a.id}" data-averia="${x.id}">${esc(m.nombre)} · ${dinero(m.coste * indice(n))}</button>`);
  } else if (x.fase === 'anomalia') {
    const d = DIAGNOSTICO[tipoDiagnostico(x)];
    botones.push(`<button class="btn-mini" data-accion="diagnosticar" data-avion="${a.id}" data-averia="${x.id}">${esc(d.nombre)} · ${dinero(d.coste * indice(n))}</button>`);
    botones.push(`<button class="btn-mini" data-accion="reparar" data-avion="${a.id}" data-averia="${x.id}">Reparar sin más · ${dinero(costeReparar(estado, a, x))}</button>`);
  } else {
    const def = AVERIAS[x.codigo];
    const rg = def?.reparacion === 'rg';
    botones.push(`<button class="btn-mini" data-accion="reparar" data-avion="${a.id}" data-averia="${x.id}">${rg ? 'Revisión general del motor' : 'Reparar'} · ${dinero(costeReparar(estado, a, x))}</button>`);
    const mel = puedeDiferir(x);
    if (mel && x.fase !== 'diferida') botones.push(`<button class="btn-mini" data-accion="diferir" data-avion="${a.id}" data-averia="${x.id}">Diferir (MEL ${mel}: ${DIAS_MEL[mel]} días)</button>`);
  }
  return `<li><span class="chip ${fase.clase}">${fase.texto}</span> ${esc(describir(x))}${detalle}<div class="fila-botones">${botones.join('')}</div></li>`;
}

export function panelFlota(estado) {
  if (!estado.aviones.length) {
    return vacio('Todavía no tienes aviones', 'En el Mercado hay aviones de segunda mano. Inspeccionar cuesta dinero, pero comprar a ciegas puede salir más caro.')
      + '<button class="btn" data-ir="mercado">Ir al mercado</button>';
  }
  const n = anio(estado.t);
  return estado.aviones.map((a) => {
    const tipo = TIPOS[a.tipo];
    const prog = programa(tipo);
    const motor = MOTORES[tipo.motor];
    const conocidas = a.averias.filter((x) => x.fase !== 'oculta');
    const irreg = irregularidades(a, estado.t);
    const seg = resumenSeguridad(a);
    const opciones = [`<option value="">Sin ruta</option>`, ...estado.rutas.map((r) => {
      const error = puedeOperar(estado, a, r.destino);
      return `<option value="${r.id}" ${a.ruta === r.id ? 'selected' : ''} ${error ? 'disabled' : ''}>${r.origen}⇄${r.destino}${error ? ` · ${esc(error)}` : ''}</option>`;
    })].join('');
    const tareas = a.tareas.map((t) => ({
      inspeccion: 'inspección', diagnostico: 'diagnóstico', reparacion: 'reparación', revision: `revisión ${t.nivel === 'D' ? 'estructural' : t.nivel}`,
      motor: `motor ${t.pos} a taller${t.alquiler ? ' (con motor de alquiler)' : ''}`, retrofit: `instalar ${TECNOLOGIAS[t.tecnologia]?.nombre ?? ''}`, directiva: 'directiva',
    }[t.tipo]));
    const tecnologias = ORDEN_TECNOLOGIAS
      .filter((id) => !a.equipo[id] && !puedeInstalar(id, a, n) && !a.tareas.some((t) => t.tecnologia === id))
      .map((id) => `<button class="btn-mini" data-accion="retrofit" data-avion="${a.id}" data-tecnologia="${id}">Instalar ${esc(TECNOLOGIAS[id].nombre.split(' (')[0])} · ${dinero(TECNOLOGIAS[id].retrofit.coste * indice(n))}</button>`);
    return `
    <article class="ficha">
      <header class="ficha-cab">
        <div><h3>${esc(a.matricula)}</h3><p>${esc(tipo.nombre)} · ${edad(a, n)} años · ${horasTexto(a.horas)} · ${a.ciclos.toLocaleString('es-ES')} ciclos</p></div>
        <span class="ficha-valor">${dinero(valorMercado(a, n))}</span>
      </header>
      <p class="ficha-estado">${estadoAvion(estado, a)}</p>
      ${irreg.length ? `<ul class="irregular">${irreg.map((x) => `<li>${esc(x.texto)}</li>`).join('')}</ul>` : ''}
      <details class="bloque" ${conocidas.length || irreg.length ? 'open' : ''}>
        <summary>Mantenimiento${conocidas.length ? ` · ${conocidas.length} aviso${conocidas.length > 1 ? 's' : ''}` : ''}</summary>
        <dl class="datos">
          <dt>Revisión A</dt><dd>${horasTexto(a.revisiones.A)} de ${prog.A.horas} ${chipIntervalo(a.revisiones.A, prog.A.horas)}<small>${estado.ajustes.revisionesAuto ? 'Se hace de noche en la base' : 'Automática desactivada'}</small></dd>
          <dt>Revisión C</dt><dd>${horasTexto(a.revisiones.C)} de ${prog.C.horas.toLocaleString('es-ES')} ${chipIntervalo(a.revisiones.C, prog.C.horas)}</dd>
          <dt>Estructural</dt><dd>${horasTexto(a.revisiones.D)} de ${prog.D.horas.toLocaleString('es-ES')} ${chipIntervalo(a.revisiones.D, prog.D.horas)}</dd>
          ${a.motores.map((m) => `<dt>Motor ${m.pos}</dt><dd>${horasTexto(m.horasRG)} desde la revisión general (cada ~${motor.intervalo.toLocaleString('es-ES')}) ${chipIntervalo(m.horasRG, motor.intervalo)}</dd>`).join('')}
          <dt>Registros</dt><dd>${{ completos: 'Completos', incompletos: 'Incompletos', dudosos: 'Dudosos' }[a.registros]}</dd>
        </dl>
        ${conocidas.length ? `<ul class="averias">${conocidas.map((x) => filaAveria(estado, a, x)).join('')}</ul>` : '<p class="nota">Sin averías conocidas.</p>'}
        <div class="fila-botones">
          <button class="btn-mini" data-accion="revision" data-nivel="C" data-avion="${a.id}">Revisión C · ${dinero(costeRevision(a, 'C', n))} · ${diasRevision(a, 'C')} días</button>
          <button class="btn-mini" data-accion="revision" data-nivel="D" data-avion="${a.id}">Estructural · ${dinero(costeRevision(a, 'D', n))} · ${diasRevision(a, 'D')} días</button>
        </div>
        <div class="fila-botones">
          ${a.motores.map((m) => `<button class="btn-mini" data-accion="motor" data-avion="${a.id}" data-pos="${m.pos}" data-alquiler="1">Motor ${m.pos} a taller con alquiler · ${dinero(costeRG(a, n) + alquilerMotor(a, n))}</button>`).join('')}
        </div>
        <p class="nota">Sin motor de alquiler, el avión espera unos ${diasTallerMotor(a)} días a que vuelva el suyo (${dinero(costeRG(a, n))}).
          <button class="btn-mini" data-accion="motor" data-avion="${a.id}" data-pos="1" data-alquiler="0">Motor 1 sin alquiler</button></p>
        ${tareas.length ? `<p class="nota">Pedido al taller: ${tareas.map(esc).join(', ')}. Entra cuando esté en la base. ${a.estado !== 'taller' ? `<button class="btn-mini" data-accion="cancelar-tareas" data-avion="${a.id}">Anular</button>` : ''}</p>` : ''}
      </details>
      <details class="bloque">
        <summary>Seguridad: ${seg.general}</summary>
        <dl class="datos">${seg.filas.map((f) => `<dt>${f.eje}</dt><dd><span class="punto ${f.nivel}"></span>${esc(f.valor)}</dd>`).join('')}</dl>
        ${tecnologias.length ? `<div class="fila-botones">${tecnologias.join('')}</div>` : ''}
      </details>
      <label class="campo"><span>Ruta</span><select id="ruta-avion-${a.id}" data-accion="asignar" data-avion="${a.id}">${opciones}</select></label>
      <div class="ficha-pie"><span>${a.stats.vuelos} vuelos · ${a.stats.incidentes} incidentes · ${a.stats.beneficio >= 0 ? 'beneficio' : 'pérdida'} ${dinero(a.stats.beneficio)}</span>
        <button class="btn-mini peligro" data-accion="vender" data-avion="${a.id}">Vender · ${dinero(valorMercado(a, n) * 0.85)}</button></div>
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
  const n = anio(estado.t);
  const opciones = destinosPosibles(estado).map(({ a, dist }) => {
    const pax = Math.round(demandaPropia(base, a, estado.t, estado.reputacion));
    return `<option value="${a.id}">${a.id} · ${esc(a.ciudad)} · ${km(dist)} · ~${pax} pax/día</option>`;
  }).join('');
  const nueva = `
  <div class="nueva-ruta">
    <label class="campo"><span>Nueva ruta desde ${base.id}</span><select id="nueva-ruta-destino">${opciones}</select></label>
    <button class="btn" data-accion="crear-ruta">Abrir ruta</button>
    <p class="nota">Pax/día: lo que podrías llenar en cada sentido con tu reputación de hoy. También puedes tocar un aeropuerto en el globo.</p>
  </div>`;
  if (!estado.rutas.length) return vacio('Sin rutas', 'Una ruta une tu base con un destino. Después le asignas un avión y decides cuántas vueltas hace al día.') + nueva;

  const lista = estado.rutas.map((r) => {
    const d = POR_ID[r.destino];
    const dist = distanciaKm(base, d);
    const avion = estado.aviones.find((a) => a.id === r.avion);
    const compat = avion ? evaluarRuta(avion.tipo, r.origen, r.destino, anioDecimal(estado.t)) : null;
    const horas = compat ? compat.duracion / 60 : dist / 750 + 0.5;
    const pax = Math.round(demandaPropia(base, d, estado.t, estado.reputacion, r.tarifa, r.servicio, horas));
    const ocupacion = r.stats.plazas ? r.stats.pax / r.stats.plazas : null;
    const libres = estado.aviones.filter((a) => !a.ruta && !puedeOperar(estado, a, r.destino));
    const puntual = r.stats.vuelos ? r.stats.retraso / r.stats.vuelos : 0;
    return `
    <article class="ficha">
      <header class="ficha-cab">
        <div><h3>${esc(estado.codigo)} ${r.numero} · ${r.origen} ⇄ ${r.destino}</h3><p>${esc(d.nombre)} · ${km(dist)} · billete ${dinero(precioBillete(dist, r.tarifa, n, avion && TIPOS[avion.tipo].clase === 'supersonico'))}</p></div>
      </header>
      <p class="ficha-estado">${avion ? `<span class="chip vuelo">${esc(avion.matricula)}</span> ${esc(TIPOS[avion.tipo].corto)}` : `<span class="chip alerta">Sin avión</span>`}
        ${!avion && libres.length ? `<button class="btn-mini" data-accion="asignar-libre" data-ruta="${r.id}" data-avion="${libres[0].id}">Asignar ${esc(libres[0].matricula)}</button>` : ''}</p>
      ${compat?.restricciones.length ? `<ul class="restricciones">${compat.restricciones.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
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
      <div class="segmentado" role="group" aria-label="Servicio a bordo">
        ${Object.entries(SERVICIOS).map(([k, s]) => `<button class="${r.servicio === k ? 'activo' : ''}" data-accion="servicio" data-ruta="${r.id}" data-servicio="${k}">${s.nombre}</button>`).join('')}
      </div>
      ${horas <= 3 ? `<label class="interruptor"><input type="checkbox" id="catering-base-${r.id}" data-accion="catering-base" data-ruta="${r.id}" ${r.cateringBase ? 'checked' : ''}> Cargar el catering de ida y vuelta en ${r.origen} <small>(${nivelCostes(d) > nivelCostes(base) ? `${d.id} es más caro` : `${d.id} no es más caro`})</small></label>` : ''}
      <div class="ficha-pie"><span>${r.stats.vuelos} vuelos · ocupación ${ocupacion == null ? '—' : porcentaje(ocupacion)} · retraso medio ${Math.round(puntual)} min · ${r.stats.beneficio >= 0 ? 'beneficio' : 'pérdida'} ${dinero(r.stats.beneficio)}</span>
        <button class="btn-mini peligro" data-accion="borrar-ruta" data-ruta="${r.id}">Cerrar ruta</button></div>
    </article>`;
  }).join('');
  return lista + nueva;
}

function informeOferta(o) {
  const a = o.avion;
  const tipo = TIPOS[a.tipo];
  const motor = MOTORES[tipo.motor];
  const horasMotor = (m) => {
    if (a.registros === 'dudosos') return 'desconocidas';
    const h = m.horasRG;
    return a.registros === 'incompletos' ? `entre ${horasTexto(h * 0.75)} y ${horasTexto(h * 1.25)}` : horasTexto(h);
  };
  const motores = a.motores.map((m) => {
    let estadoMotor = '';
    if (o.inspeccion) {
      const malas = a.averias.filter((x) => x.motor === m.pos && x.fase !== 'oculta');
      const desgaste = m.horasRG / motor.intervalo;
      estadoMotor = malas.length ? ' · <strong class="mal">anomalía</strong>' : desgaste > 0.85 ? ' · desgaste alto' : desgaste > 0.5 ? ' · desgaste moderado' : ' · buen estado';
      if (o.inspeccion) estadoMotor += ` (${horasTexto(m.horasRG)} reales)`;
    }
    return `<li>Motor ${m.pos}: ${horasMotor(m)} desde la revisión general${estadoMotor}</li>`;
  }).join('');
  const hallazgos = o.inspeccion ? a.averias.filter((x) => x.fase !== 'oculta') : [];
  const prog = programa(tipo);
  return `<ul class="lista-simple">${motores}<li>Próxima revisión estructural en ~${horasTexto(Math.max(0, prog.D.horas - a.revisiones.D))}</li><li>Registros de mantenimiento: ${{ completos: 'completos', incompletos: 'incompletos', dudosos: 'dudosos' }[a.registros]}</li></ul>
    ${o.inspeccion ? (hallazgos.length
      ? `<ul class="averias">${hallazgos.map((x) => `<li><span class="chip ${x.fase === 'confirmada' ? 'alerta' : 'aviso'}">${x.fase === 'confirmada' ? (x.diagnostico?.fueraDeLimites ? 'Fuera de límites' : 'Confirmada') : 'Anomalía'}</span> ${esc(describir(x))}</li>`).join('')}</ul>`
      : `<p class="nota bien">Inspección ${o.inspeccion === 'completa' ? 'completa' : 'básica'}: sin hallazgos.</p>`) : ''}`;
}

export function panelMercado(estado) {
  const n = anio(estado.t);
  const base = POR_ID[estado.base];
  const segunda = estado.mercado.map((o) => {
    const a = o.avion;
    const tipo = TIPOS[a.tipo];
    const noBase = pistaEn(base, n) < tipo.pistaMin;
    return `
    <article class="ficha">
      <header class="ficha-cab">
        <div><h3>${esc(tipo.nombre)}</h3><p>${a.fabricado} · ${horasTexto(a.horas)} · ${a.ciclos.toLocaleString('es-ES')} ciclos${tipo.ficticio ? ' · fabricación del Este' : ''}</p></div>
        <span class="ficha-valor">${dinero(o.precio)}</span>
      </header>
      <p class="nota">${esc(o.vendedor)}. ${tipo.plazas} plazas · ${MOTORES[tipo.motor].nombre} × ${tipo.nMotores} · alcance ${km(tipo.alcance)}${noBase ? ` · <strong class="mal">no puede operar en ${base.id}</strong>` : ''}</p>
      <p class="ficha-estado">El vendedor dice: <strong>${esc(o.anunciado)}</strong></p>
      ${informeOferta(o)}
      <div class="fila-botones">
        ${o.inspeccion ? '' : `<button class="btn-mini" data-accion="inspeccionar" data-nivel="basica" data-oferta="${o.id}">Inspección básica · ${dinero(costeInspeccionCompra(o, 'basica', n))}</button>`}
        ${o.inspeccion === 'completa' ? '' : `<button class="btn-mini" data-accion="inspeccionar" data-nivel="completa" data-oferta="${o.id}">Inspección completa · ${dinero(costeInspeccionCompra(o, 'completa', n))}</button>`}
        <button class="btn-mini primario" data-accion="comprar" data-oferta="${o.id}" ${estado.caja < o.precio ? 'disabled' : ''}>Comprar</button>
      </div>
    </article>`;
  }).join('');
  const nuevos = tiposEnProduccion(n).sort((x, y) => x.precio - y.precio).map((t) => {
    const precio = precioNuevo(t, n) + (t.clase === 'supersonico' && !estado.concordes ? 2e6 * indice(n) : 0);
    return `
    <article class="ficha compacta">
      <header class="ficha-cab">
        <div><h3>${esc(t.nombre)}</h3><p>${t.plazas} plazas · ${km(t.alcance)} · ${MOTORES[t.motor].nombre} × ${t.nMotores} · pista ${t.pistaMTOW.toLocaleString('es-ES')} m</p></div>
        <button class="btn-mini primario" data-accion="comprar-nuevo" data-tipo="${t.id}" ${estado.caja < precio ? 'disabled' : ''}>${dinero(precio)}</button>
      </header>
      ${t.descripcion ? `<p class="nota">${esc(t.descripcion)}${t.clase === 'supersonico' ? ` Solo se fabricaron ${t.unidades}; el consorcio te venderá como mucho dos. La primera incluye la formación especializada.` : ''}</p>` : ''}
    </article>`;
  }).join('');
  return `<h3 class="seccion">Segunda mano</h3><p class="nota">Cambia cada mes. Lo que inspecciones se queda en la lista. La básica mira registros, una visual y boroscopia y aceite de los motores; la completa equivale a una revisión C.</p>${segunda}
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

const CONSULTAS = [
  ['siempre', 'En cada vuelo'],
  ['anormal', 'Si hay algo fuera de lo normal'],
  ['serio', 'Solo si es serio o fuera de norma'],
  ['nunca', 'Lo mínimo: decide el despachador'],
];

export function panelCuentas(estado) {
  const dias = estado.cuentas.historial.slice(-30);
  const ing = dias.reduce((s, d) => s + d.ingresos, 0);
  const gas = dias.reduce((s, d) => s + d.gastos, 0);
  const limite = limitePrestamo(estado);
  const n = anio(estado.t);
  const accidentes = estado.accidentes.map((a) => `<li><strong>${textoFecha(a.t, { corta: true })}</strong> ${esc(a.numero)}: ${a.fallecidos} fallecidos. ${a.cerrado ? (a.negligencia ? 'Negligencia.' : 'Sin negligencia.') : 'Investigación en curso.'}</li>`).join('');
  const directivas = (estado.directivas ?? []).map((d) => `<li>${esc(d.texto)} Plazo: ${textoFecha(d.hasta, { corta: true })}.
    ${estado.aviones.filter((a) => a.tipo === d.tipo && !d.hechas.includes(a.id)).map((a) => `<button class="btn-mini" data-accion="directiva" data-avion="${a.id}" data-directiva="${d.id}">Inspeccionar ${esc(a.matricula)}</button>`).join('')}</li>`).join('');
  return `
  <div class="cifras">
    <div><span>Caja</span><strong>${dinero(estado.caja)}</strong></div>
    <div><span>Préstamo</span><strong>${dinero(estado.prestamo)}</strong></div>
    <div><span>Patrimonio</span><strong>${dinero(patrimonio(estado))}</strong></div>
    <div><span>Reputación</span><strong>${Math.round(estado.reputacion)}/100</strong></div>
  </div>
  <h3 class="seccion">Últimos 30 días</h3>
  ${grafica(estado.cuentas.historial)}
  <p class="nota">Ingresos ${dinero(ing)} · gastos ${dinero(gas)} · resultado <strong>${dinero(ing - gas)}</strong> · el queroseno va este año a unos ${precioGalon(n).toLocaleString('es-ES', { minimumFractionDigits: 2 })} $ el galón</p>
  <h3 class="seccion">Banco</h3>
  <p class="nota">Interés del 9 % anual. Te prestan hasta ${dinero(limite)}, según el valor de tu flota.</p>
  <div class="fila-botones">
    <button class="btn-mini" data-accion="prestamo" data-cantidad="500000" ${estado.prestamo + 500000 > limite ? 'disabled' : ''}>Pedir $500 k</button>
    <button class="btn-mini" data-accion="devolver" data-cantidad="500000" ${estado.prestamo <= 0 || estado.caja < Math.min(500000, estado.prestamo) ? 'disabled' : ''}>Devolver $500 k</button>
  </div>
  <h3 class="seccion">Operaciones</h3>
  <label class="campo"><span>Consultarme antes de despachar</span>
    <select id="consulta" data-accion="consulta">${CONSULTAS.map(([v, t]) => `<option value="${v}" ${estado.ajustes.consulta === v ? 'selected' : ''}>${t}</option>`).join('')}</select>
  </label>
  <p class="nota">Cuando decide el despachador no firma nada fuera de norma: si la previsión en destino está por debajo de mínimos, retrasa el vuelo y, si no mejora, lo cancela; si va justa, carga combustible extra. Lo que esté fuera de norma por el avión o la tripulación te lo consulta siempre.</p>
  <label class="interruptor"><input type="checkbox" id="revisiones-auto" data-accion="revisiones-auto" ${estado.ajustes.revisionesAuto ? 'checked' : ''}> Hacer las revisiones A de noche en la base, automáticamente</label>
  ${directivas ? `<h3 class="seccion">Directivas de aeronavegabilidad</h3><ul class="lista-simple">${directivas}</ul>` : ''}
  ${accidentes ? `<h3 class="seccion">Accidentes</h3><ul class="lista-simple">${accidentes}</ul>` : ''}
  <h3 class="seccion">Partida</h3>
  <p class="nota">Semilla ${estado.semilla}: con la misma semilla y la misma base, el tiempo y el mercado son iguales para todos.</p>
  <div class="fila-botones"><button class="btn-mini peligro" data-accion="nueva-partida">Empezar otra partida</button></div>`;
}

export function panelDiario(estado) {
  if (!estado.diario.length) return vacio('Nada todavía', 'Aquí queda lo que pasa en la compañía.');
  return `<ol class="diario">${estado.diario.slice(0, 150).map((e) => `<li class="d-${e.tipo}"><time>${textoFecha(e.t, { corta: true })} ${textoHora(e.t)}</time><span>${esc(e.texto)}</span></li>`).join('')}</ol>`;
}

export function htmlAeropuerto(estado, id) {
  const a = POR_ID[id];
  const base = POR_ID[estado.base];
  const n = anio(estado.t);
  const dist = distanciaKm(base, a);
  const ruta = estado.rutas.find((r) => r.destino === id);
  const pax = id === estado.base ? null : Math.round(demandaPropia(base, a, estado.t, estado.reputacion));
  const tipos = [...new Set(estado.aviones.map((x) => x.tipo))];
  const compat = id === estado.base ? [] : tipos.map((t) => {
    const r = evaluarRuta(t, estado.base, id, anioDecimal(estado.t));
    return `<li><strong>${esc(TIPOS[t].corto)}</strong>: ${r.posible ? (r.restricciones.length ? esc(r.restricciones.join('; ')) : 'sin restricciones') : `<span class="mal">${esc(r.motivo)}</span>`}</li>`;
  });
  let accion = '';
  if (id === estado.base) accion = '<p class="nota">Tu base.</p>';
  else if (!abiertoEn(a, n)) accion = `<p class="nota">Abre en ${a.desde}.</p>`;
  else if (ruta) accion = `<button class="btn-mini" data-ir="rutas">Ver la ruta</button>`;
  else accion = `<button class="btn-mini primario" data-accion="crear-ruta-a" data-destino="${id}">Abrir ruta ${estado.base}–${id}</button>`;
  const ils = a.ils ? `ILS CAT ${a.ils}` : 'sin ILS';
  return `
    <div class="ap-cab"><div><h3>${a.id} · ${esc(a.ciudad)}</h3><p>${esc(a.nombre)}</p></div><button class="cerrar" data-accion="cerrar-ap" aria-label="Cerrar">×</button></div>
    <p class="nota">Pista ${pistaEn(a, n).toLocaleString('es-ES')} m · ${ils}${a.montana ? ' · terreno montañoso' : ''}${a.elev > 500 ? ` · ${a.elev} m de altitud` : ''}${a.finPista === 'peligroso' ? ' · final de pista peligroso' : ''} · costes ${nivelCostes(a) > 1.2 ? 'altos' : nivelCostes(a) < 0.8 ? 'bajos' : 'medios'}${id !== estado.base ? ` · ${km(dist)} desde ${base.id} · ~${pax} pax/día` : ''}</p>
    ${compat.length ? `<ul class="lista-simple">${compat.join('')}</ul>` : ''}
    ${accion}`;
}
