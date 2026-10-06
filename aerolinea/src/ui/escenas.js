// Las tres escenas de accidente y el avance informativo.
//
// Solo se ve el avión: nada de personas. La gravedad la cuenta después el noticiario, con las
// cifras.

import { POR_ID } from '../data/aeropuertos.js';
import { TIPOS } from '../data/aviones.js';
import { textoFecha, textoHora } from '../core/tiempo.js';
import { dinero, esc } from './formato.js';

// Silueta lateral mirando a la derecha, centrada en (0, 0), unos 90 px de largo.
function silueta(tipo) {
  const helice = tipo === 'helice';
  const ventanillas = Array.from({ length: 11 }, (_, i) => `<rect x="${-28 + i * 5}" y="-3.6" width="2.2" height="2" rx="0.6" fill="#1d2633" opacity=".8"/>`).join('');
  const motor = helice
    ? `<path d="M-10,-8.5 L18,-8.5 L15,-11 L-8,-11 Z" fill="#c9cfd6"/>
       <rect x="4" y="-8" width="11" height="5" rx="2" fill="#aeb6bf"/>
       <ellipse class="helice" cx="16" cy="-5.5" rx="1.2" ry="7" fill="#e8ecf0" opacity=".55"/>`
    : `<path d="M-4,2 L-22,9 L-15,9 L8,2 Z" fill="#aeb6bf"/>
       <rect class="motor" x="-16" y="5" width="13" height="4.6" rx="2.2" fill="#9aa3ad"/>`;
  return `
    <path d="M-40,-22 L-30,-22 L-20,-6 L-36,-6 Z" fill="#c9cfd6"/>
    <path d="M-44,0 Q-46,-6 -36,-7 L30,-7 Q42,-6 47,-1 Q44,4 32,5 L-36,5 Q-46,4 -44,0 Z" fill="#e8ecf0"/>
    <path d="M-44,-0.5 L44,-0.5" stroke="#b5862c" stroke-width="1.6"/>
    ${ventanillas}
    <path d="M38,-4.5 L43,-4 L45,-1.5 L39,-1.5 Z" fill="#1d2633"/>
    ${motor}`;
}

const humo = (x, y, n, retraso, color = '#3a3a3a') =>
  Array.from({ length: n }, (_, i) =>
    `<circle class="humo" cx="${x + (i % 3) * 6 - 6}" cy="${y}" r="${7 + (i % 4) * 2}" fill="${color}" style="animation-delay:${(retraso + i * 0.25).toFixed(2)}s"/>`).join('');

const ESTILO_COMUN = `
  .escena svg{width:100%;height:100%;display:block}
  .escena .humo{opacity:0;transform-box:fill-box;transform-origin:center;animation:humo 3.2s ease-out infinite}
  @keyframes humo{0%{opacity:0;transform:translate(0,0) scale(.4)}15%{opacity:.85}100%{opacity:0;transform:translate(14px,-90px) scale(2.6)}}
  .escena .estela{opacity:0;transform-box:fill-box;transform-origin:center;animation:estela 2.4s ease-out forwards}
  @keyframes estela{0%{opacity:0;transform:scale(.5)}20%{opacity:.75}100%{opacity:.25;transform:translate(-8px,6px) scale(2.2)}}
  .escena .fuego{transform-box:fill-box;transform-origin:center bottom;animation:fuego .18s ease-in-out infinite alternate}
  @keyframes fuego{from{transform:scale(1,1)}to{transform:scale(1.15,.85)}}
  .escena .helice{animation:helice .08s linear infinite}
  @keyframes helice{from{ry:7}to{ry:2}}
  @media (prefers-reduced-motion: reduce){.escena *{animation-duration:.01s!important;animation-iteration-count:1!important}}
`;

function escenaPista(sil) {
  const luces = Array.from({ length: 15 }, (_, i) => `<circle cx="${i * 20}" cy="181" r="1.6" fill="#f5edd2"/>`).join('');
  const lluvia = Array.from({ length: 60 }, (_, i) => `<line x1="${(i * 37) % 420}" y1="${(i * 53) % 240}" x2="${(i * 37) % 420 - 6}" y2="${(i * 53) % 240 + 14}"/>`).join('');
  return `
  <style>
    .e-pista .avion{animation:pista-avion 6s cubic-bezier(.3,.1,.4,1) forwards}
    @keyframes pista-avion{
      0%{transform:translate(-70px,110px) rotate(5deg)}
      28%{transform:translate(70px,170px) rotate(-2deg)}
      62%{transform:translate(285px,171px) rotate(0)}
      76%{transform:translate(330px,176px) rotate(7deg)}
      100%{transform:translate(352px,183px) rotate(9deg)}}
    .e-pista .lluvia{stroke:#9fb3c8;stroke-width:1;opacity:.45;animation:lluvia .5s linear infinite}
    @keyframes lluvia{from{transform:translate(0,-20px)}to{transform:translate(-8px,10px)}}
    .e-pista .chispas{opacity:0;animation:aparece .2s 3.9s forwards, parpadeo .12s 3.9s infinite alternate}
    .e-pista .rastro{opacity:0;animation:aparece .3s 4.6s forwards}
    .e-pista .resplandor{opacity:0;animation:aparece 1s 5.2s forwards}
    @keyframes aparece{to{opacity:1}}
    @keyframes parpadeo{from{opacity:.3}to{opacity:1}}
  </style>
  <svg class="e-pista" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="cieloP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1220"/><stop offset="1" stop-color="#22324a"/></linearGradient>
      <radialGradient id="fuegoP"><stop offset="0" stop-color="#ffcf6b"/><stop offset=".5" stop-color="#ff7a1a" stop-opacity=".7"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="400" height="240" fill="url(#cieloP)"/>
    <rect y="184" width="400" height="56" fill="#141c14"/>
    <rect x="-20" y="178" width="322" height="7" fill="#3b4048"/>
    ${luces}
    <circle cx="302" cy="181" r="2.2" fill="#ff4a3a"/><circle cx="296" cy="181" r="2.2" fill="#ff4a3a"/>
    <path d="M300,186 L400,192 L400,240 L300,240 Z" fill="#1c2416"/>
    <path class="rastro" d="M302,184 Q330,186 352,190" stroke="#0a0d08" stroke-width="5" fill="none"/>
    <g class="resplandor"><circle cx="352" cy="180" r="48" fill="url(#fuegoP)"/>${humo(352, 172, 8, 5.4)}</g>
    <g class="avion">${sil}
      <g class="chispas"><circle cx="20" cy="7" r="1.5" fill="#ffd36b"/><circle cx="12" cy="9" r="1.2" fill="#ff9a2a"/><circle cx="28" cy="8" r="1" fill="#ffe7a8"/></g>
    </g>
    <g class="lluvia">${lluvia}</g>
  </svg>`;
}

function escenaAproximacion(sil) {
  return `
  <style>
    .e-aprox .avion{animation:aprox-avion 5s linear forwards}
    @keyframes aprox-avion{
      0%{transform:translate(-70px,50px) rotate(7deg);opacity:1}
      78%{transform:translate(268px,132px) rotate(9deg);opacity:1}
      80%{opacity:0}100%{transform:translate(276px,134px);opacity:0}}
    .e-aprox .niebla{animation:niebla 9s ease-in-out infinite alternate}
    .e-aprox .niebla.b{animation-duration:7s;animation-direction:alternate-reverse}
    @keyframes niebla{from{transform:translateX(-30px)}to{transform:translateX(30px)}}
    .e-aprox .destello{opacity:0;transform-box:fill-box;transform-origin:center;animation:destello 1.2s 3.95s ease-out forwards}
    @keyframes destello{0%{opacity:1;transform:scale(.2)}100%{opacity:0;transform:scale(3)}}
    .e-aprox .incendio{opacity:0;animation:aparece 1s 4.2s forwards}
    .e-aprox .faro{animation:faro .9s ease-in-out infinite alternate}
    @keyframes faro{from{opacity:.4}to{opacity:1}}
    @keyframes aparece{to{opacity:1}}
  </style>
  <svg class="e-aprox" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="cieloA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4552"/><stop offset="1" stop-color="#6c7682"/></linearGradient>
      <radialGradient id="fuegoA"><stop offset="0" stop-color="#ffd27a"/><stop offset=".5" stop-color="#ff6a1a" stop-opacity=".6"/><stop offset="1" stop-color="#ff6a1a" stop-opacity="0"/></radialGradient>
      <filter id="desenfoque"><feGaussianBlur stdDeviation="8"/></filter>
    </defs>
    <rect width="400" height="240" fill="url(#cieloA)"/>
    <path d="M200,240 L250,170 L285,128 L320,96 L350,112 L380,90 L420,120 L420,240 Z" fill="#2a3138"/>
    <path d="M150,240 L210,200 L260,190 L300,205 L330,240 Z" fill="#232a30"/>
    <g class="avion">${sil}<circle class="faro" cx="48" cy="1" r="3" fill="#fff6d0"/></g>
    <g class="incendio"><circle cx="276" cy="130" r="44" fill="url(#fuegoA)"/>${humo(276, 122, 9, 4.3, '#2b2b2b')}</g>
    <circle class="destello" cx="276" cy="132" r="18" fill="#fff3c4"/>
    <g filter="url(#desenfoque)" opacity=".85">
      <rect class="niebla" x="-40" y="70" width="480" height="40" fill="#b8c0c8" opacity=".55"/>
      <rect class="niebla b" x="-40" y="118" width="480" height="50" fill="#c6cdd4" opacity=".6"/>
      <rect class="niebla" x="-40" y="160" width="480" height="60" fill="#aab3bc" opacity=".5"/>
    </g>
  </svg>`;
}

function escenaVuelo(sil) {
  const arboles = 'M0,200 ' + Array.from({ length: 41 }, (_, i) => `Q${i * 10 + 5},${186 - (i % 3) * 4} ${i * 10 + 10},200`).join(' ') + ' L400,240 L0,240 Z';
  const estela = Array.from({ length: 10 }, (_, i) => {
    const x = 20 + i * 15;
    const y = 160 - i * 7;
    return `<circle class="estela" cx="${x}" cy="${y}" r="5" fill="#2e2a2a" style="animation-delay:${(1.4 + i * 0.14).toFixed(2)}s"/>`;
  }).join('');
  return `
  <style>
    .e-vuelo .avion{animation:vuelo-avion 5.2s ease-in forwards}
    @keyframes vuelo-avion{
      0%{transform:translate(-60px,178px) rotate(-11deg)}
      40%{transform:translate(150px,96px) rotate(-12deg)}
      55%{transform:translate(215px,86px) rotate(4deg)}
      80%{transform:translate(285px,150px) rotate(28deg)}
      100%{transform:translate(312px,214px) rotate(36deg)}}
    .e-vuelo .llama{opacity:0;animation:aparece .2s 1.3s forwards}
    .e-vuelo .bola{opacity:0;transform-box:fill-box;transform-origin:center bottom;animation:bola 1.6s 5s ease-out forwards}
    @keyframes bola{0%{opacity:1;transform:scale(.2)}60%{opacity:1;transform:scale(1.1)}100%{opacity:.7;transform:scale(1)}}
    .e-vuelo .columna{opacity:0;animation:aparece .8s 5.3s forwards}
    @keyframes aparece{to{opacity:1}}
  </style>
  <svg class="e-vuelo" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="cieloV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2140"/><stop offset=".6" stop-color="#a1513a"/><stop offset="1" stop-color="#e7a35a"/></linearGradient>
      <radialGradient id="fuegoV"><stop offset="0" stop-color="#fff0b0"/><stop offset=".45" stop-color="#ff8a1e"/><stop offset="1" stop-color="#ff5a12" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="400" height="240" fill="url(#cieloV)"/>
    <rect x="-10" y="196" width="120" height="5" fill="#3a3030"/>
    ${estela}
    <g class="avion">${sil}
      <g class="llama"><ellipse class="fuego" cx="-18" cy="7" rx="7" ry="4" fill="#ff8a1e"/><ellipse class="fuego" cx="-21" cy="7" rx="4" ry="2.5" fill="#ffe08a"/></g>
    </g>
    <g class="columna">${humo(318, 186, 10, 5.4, '#1f1b1b')}</g>
    <ellipse class="bola" cx="318" cy="188" rx="46" ry="34" fill="url(#fuegoV)"/>
    <path d="${arboles}" fill="#120f14"/>
  </svg>`;
}

const ESCENAS = { pista: escenaPista, aproximacion: escenaAproximacion, vuelo: escenaVuelo };

export const DURACION_ESCENA = 7000;

const LETREROS = {
  pista: 'Aterrizaje con la pista mojada',
  aproximacion: 'Aproximación con visibilidad nula',
  vuelo: 'Fallo en vuelo',
};

export function htmlEscena(accidente) {
  const sil = silueta(accidente.silueta);
  const lugar = POR_ID[accidente.lugar];
  return `<style>${ESTILO_COMUN}</style>
    <div class="escena">${ESCENAS[accidente.causa](`<g>${sil}</g>`)}</div>
    <p class="escena-pie"><span>${esc(accidente.numero)} · ${esc(accidente.matricula)}</span><span>${lugar.id} · ${textoHora(accidente.t)}</span><span>${LETREROS[accidente.causa]}</span></p>`;
}

// --- noticiario

const TITULARES = {
  pista: (c) => `Un avión se sale de la pista en ${c}`,
  aproximacion: (c) => `Tragedia aérea en ${c}`,
  vuelo: (c) => `Se estrella un avión tras despegar de ${c}`,
};

export function htmlNoticia(accidente, estado) {
  const lugar = POR_ID[accidente.lugar];
  const o = POR_ID[accidente.origen];
  const d = POR_ID[accidente.destino];
  const tipo = TIPOS[accidente.tipo];
  const aBordo = accidente.pax + accidente.tripulantes;
  const sinFallecidos = accidente.fallecidos === 0;
  const titular = sinFallecidos && accidente.causa === 'pista'
    ? `Grave accidente en el aeropuerto de ${lugar.ciudad}`
    : TITULARES[accidente.causa](lugar.ciudad);
  const ticker = [
    `Las autoridades de aviación civil abren una investigación`,
    `${estado.nombre} suspende la venta de billetes del ${accidente.numero}`,
    `Los equipos de rescate trabajan en la zona`,
    `El avión, un ${tipo.nombre}, cubría la ruta ${o.ciudad}–${d.ciudad}`,
    `Se habilita un teléfono de información para los familiares`,
  ].join('   ·   ');
  return `
  <div class="tele">
    <div class="tele-pantalla">
      <div class="tele-cabecera"><span class="tele-cadena">Diario Nacional</span><span class="tele-directo">Avance informativo</span></div>
      <p class="tele-fecha">${textoFecha(accidente.t)} · ${textoHora(accidente.t)}</p>
      <h2 class="tele-titular">${esc(titular)}</h2>
      <p class="tele-texto">Un ${esc(tipo.nombre)} de ${esc(estado.nombre)}, vuelo ${esc(accidente.numero)} entre ${esc(o.ciudad)} y ${esc(d.ciudad)}, ${esc(accidente.descripcion)} en ${esc(lugar.nombre)}. Viajaban ${aBordo} personas: ${accidente.pax} pasajeros y ${accidente.tripulantes} tripulantes.</p>
      <div class="tele-cifras">
        <div><strong>${accidente.fallecidos}</strong><span>fallecidos</span></div>
        <div><strong>${accidente.heridos}</strong><span>heridos</span></div>
        <div><strong>${aBordo}</strong><span>a bordo</span></div>
      </div>
      <div class="tele-ticker"><span>${esc(ticker)}   ·   ${esc(ticker)}</span></div>
    </div>
  </div>`;
}

export function htmlInforme(accidente, estado) {
  const lugar = POR_ID[accidente.lugar];
  const conclusion = accidente.negligencia
    ? `La comisión concluye que hubo negligencia de ${esc(estado.nombre)}: ${accidente.motivos.map(esc).join('; ')}. La aseguradora no cubre el siniestro y la autoridad impone una multa.`
    : `La comisión no aprecia negligencia de la compañía. La aseguradora cubre el avión y la mayor parte de las indemnizaciones.`;
  return `
  <div class="tele">
    <div class="tele-pantalla">
      <div class="tele-cabecera"><span class="tele-cadena">Diario Nacional</span><span class="tele-directo">Investigación</span></div>
      <p class="tele-fecha">${textoFecha(estado.t)}</p>
      <h2 class="tele-titular">Concluye la investigación del accidente de ${esc(lugar.ciudad)}</h2>
      <p class="tele-texto">Causa probable: ${esc(accidente.principal.toLowerCase())}. ${conclusion}</p>
      <div class="tele-cifras">
        <div><strong>${dinero(accidente.indemnizaciones)}</strong><span>indemnizaciones</span></div>
        <div><strong>${dinero(accidente.pagaSeguro)}</strong><span>paga el seguro</span></div>
        <div><strong>${dinero(accidente.multa)}</strong><span>multa</span></div>
      </div>
    </div>
  </div>`;
}
