// Pestaña Mundo: tus mercados, las noticias y la competencia (CRITERIOS 26–32).
//
// Todo en cantidades aproximadas y en palabras: el jugador interpreta los datos, el juego no
// le dice «oportunidad: 87 %».

import { POR_ID } from '../data/aeropuertos.js';
import { AEROLINEA, TIPOS_AEROLINEA } from '../data/aerolineas.js';
import { TIPOS } from '../data/aviones.js';
import { anioDecimal, textoFecha } from '../core/tiempo.js';
import { evaluarRuta } from '../core/operaciones.js';
import { infoMercado, estimarJugador, clave } from '../core/mercado.js';
import { activas, resumenAerolinea } from '../core/competencia.js';
import { etiqueta, etiquetaGeneral, notaReputacion } from '../core/reputacion.js';
import { esc } from './formato.js';

const ESCALAS = { local: 'Local', regional: 'Regional', global: 'Mundial' };
const TENDENCIA = { creciendo: '↗ creciendo', estable: '→ estable', bajando: '↘ bajando' };
const SERVICIO = { basico: 'básico', estandar: 'estándar', superior: 'superior' };
const TIPO_RUTA = { turistica: 'turística', negocios: 'de negocios', mixta: 'mixta' };

const miles = (n) => n.toLocaleString('es-ES');

// Ficha de un mercado: demanda, oferta, tendencia y quién opera.
export function htmlMercado(estado, o, d) {
  const m = infoMercado(estado, o, d);
  const ops = m.operadores.map((x) => `
    <tr class="${x.id === 'jugador' ? 'tu-fila' : ''}">
      <th scope="row">${esc(x.id === 'jugador' ? `${x.nombre} (tú)` : x.nombre)}</th>
      <td>${x.precio}</td><td>${SERVICIO[x.servicio]}</td><td>${x.reputacion}</td><td>${x.presencia}</td>
    </tr>`).join('');
  return `
  <div class="mercado">
    <p class="mercado-cifras"><strong>${esc(o.ciudad)} ⇄ ${esc(d.ciudad)}</strong> · ruta ${TIPO_RUTA[m.tipo]}<br>
      demanda <strong>~${miles(m.demanda)}</strong> pasajeros/día · oferta <strong>~${miles(m.oferta)}</strong> plazas/día · ${TENDENCIA[m.tendencia]}</p>
    ${m.operadores.length ? `<div class="tabla-envoltura"><table class="tabla-mercado">
      <thead><tr><th scope="col">Opera</th><th scope="col">Precio</th><th scope="col">Servicio</th><th scope="col">Reputación</th><th scope="col">Presencia</th></tr></thead>
      <tbody>${ops}</tbody></table></div>` : '<p class="nota">Nadie vuela esta ruta.</p>'}
    <p class="nota">Cifras por sentido y aproximadas: salen de un estudio de mercado, no de una bola de cristal.</p>
  </div>`;
}

// Cuánto te tocaría con tus aviones (o con uno de 100 plazas si aún no tienes).
export function htmlEstimacion(estado, o, d) {
  const anio = anioDecimal(estado.t);
  const tipos = [...new Set(estado.aviones.map((a) => a.tipo))]
    .map((t) => ({ t, tramo: evaluarRuta(t, o.id, d.id, anio) }))
    .filter((x) => x.tramo.posible && TIPOS[x.t].clase !== 'supersonico')
    .slice(0, 2);
  const filas = (tipos.length ? tipos.map((x) => ({ nombre: TIPOS[x.t].corto, plazas: x.tramo.plazasMax })) : [{ nombre: 'Un avión de 100 plazas', plazas: 100 }])
    .map(({ nombre, plazas }) => [1, 2].map((vueltas) => {
      const pax = estimarJugador(estado, o, d, { asientos: plazas * vueltas });
      const porVuelo = Math.round(pax / vueltas);
      return `<li>${esc(nombre)}, ${vueltas} ${vueltas === 1 ? 'vuelta' : 'vueltas'} al día: ~${porVuelo} pasajeros por vuelo (${Math.round(100 * Math.min(1, porVuelo / plazas))} % de ocupación)</li>`;
    }).join('')).join('');
  return `<p class="nota"><strong>Si entras</strong> con tarifa normal y tu reputación de hoy:</p><ul class="lista-simple">${filas}</ul>`;
}

function htmlNoticias(estado, n = 40) {
  const lista = estado.mundo.noticias.slice(0, n);
  if (!lista.length) return '<p class="nota">Sin noticias por ahora.</p>';
  return `<ol class="noticias">${lista.map((x) => `
    <li class="${x.importante ? 'importante' : ''}">
      <time>${textoFecha(x.t, { corta: true })}</time>
      <span class="chip escala-${x.escala}">${ESCALAS[x.escala] ?? x.escala}</span>
      <strong>${esc(x.titular)}</strong>${x.texto ? `<span>${esc(x.texto)}</span>` : ''}
    </li>`).join('')}</ol>`;
}

function htmlCompetencia(estado) {
  const filas = activas(estado).map((al) => resumenAerolinea(estado, al))
    .sort((a, b) => b.enTuPais - a.enTuPais || b.plazas - a.plazas)
    .map((x) => {
      const def = x.def;
      const bases = x.al.bases.slice(0, 4).map((b) => POR_ID[b]?.ciudad ?? b).join(', ') + (x.al.bases.length > 4 ? '…' : '');
      return `
      <article class="ficha rival">
        <header class="ficha-cab"><div><h3>${esc(def.nombre)}</h3><p>${TIPOS_AEROLINEA[def.tipo]} · ${esc(bases)}</p></div><span class="chip">${x.situacion}</span></header>
        <p class="nota">${esc(def.descripcion)}</p>
        <p class="rival-datos">Precio ${def.precio < 0.9 ? 'bajo' : def.precio > 1.1 ? 'alto' : 'medio'} · servicio ${SERVICIO[def.servicio]} · reputación ${etiqueta(notaReputacion(x.al.rep))} · ${x.rutas} rutas${x.enTuPais ? `, ${x.enTuPais} en tu país` : ''}</p>
      </article>`;
    }).join('');
  return filas;
}

function htmlTusMercados(estado) {
  if (!estado.rutas.length) return '<p class="nota">Cuando abras rutas, aquí verás cómo está cada mercado. Toca un aeropuerto en el globo para estudiar uno antes de entrar.</p>';
  return estado.rutas.map((r) => htmlMercado(estado, POR_ID[r.origen], POR_ID[r.destino])).join('');
}

function htmlReputacion(estado) {
  const rep = estado.reputacion;
  const tarifas = estado.rutas.map((r) => r.tarifa);
  const precio = !tarifas.length ? '—' : tarifas.every((x) => x === 'economica') ? 'barata' : tarifas.every((x) => x === 'alta') ? 'cara' : 'media';
  return `<dl class="reputacion">
    <div><dt>General</dt><dd>${etiquetaGeneral(rep)}</dd></div>
    <div><dt>Puntualidad</dt><dd>${etiqueta(rep.puntualidad)}</dd></div>
    <div><dt>Seguridad</dt><dd>${etiqueta(rep.seguridad)}</dd></div>
    <div><dt>Servicio</dt><dd>${etiqueta(rep.servicio)}</dd></div>
    <div><dt>Prestigio</dt><dd>${etiqueta(rep.prestigio)}</dd></div>
    <div><dt>Precio</dt><dd>${precio}</dd></div>
  </dl>`;
}

export function panelMundo(estado) {
  return `
  <h3 class="seccion">Tu compañía</h3>
  ${htmlReputacion(estado)}
  <p class="nota">Con precios bajos y puntualidad se puede ganar a una grande; con servicio y prestigio se puede cobrar más. La seguridad pesa en todas.</p>
  <h3 class="seccion">Tus mercados</h3>
  ${htmlTusMercados(estado)}
  <h3 class="seccion">Noticias</h3>
  ${htmlNoticias(estado)}
  <h3 class="seccion">Competencia</h3>
  ${htmlCompetencia(estado)}`;
}

// Avance informativo para las noticias importantes del mundo.
export function htmlAvance(noticia) {
  return `
  <div class="tele">
    <div class="tele-pantalla">
      <div class="tele-cabecera"><span class="tele-cadena">Diario Nacional</span><span class="tele-directo">${noticia.tipo === 'competencia' ? 'Economía' : 'Última hora'}</span></div>
      <p class="tele-fecha">${textoFecha(noticia.t)}</p>
      <h2 class="tele-titular">${esc(noticia.titular)}</h2>
      ${noticia.texto ? `<p class="tele-texto">${esc(noticia.texto)}</p>` : ''}
    </div>
  </div>`;
}

export { htmlReputacion, clave };
