// Las tres escenas de accidente y el avance informativo.
//
// Solo se ve el avión: nada de personas. La gravedad la cuenta después el noticiario, con las
// cifras.

import { POR_ID } from '../data/aeropuertos.js';
import { TIPOS } from '../data/aviones.js';
import { textoFecha, textoHora } from '../core/tiempo.js';
import { dinero, esc } from './formato.js';

// Silueta lateral mirando a la derecha, centrada en (0, 0), unos 90 px de largo. Respeta la
// configuración real de cada tipo: ala alta o baja, motores bajo el ala o en la cola, cola en T
// o convencional, hélices, la joroba del 747 y el ala en delta del Concorde. Devuelve también
// dónde está el motor, para dibujar el fuego.
const CLARO = '#e8ecf0';
const MEDIO = '#c9cfd6';
const OSCURO = '#aeb6bf';
const CRISTAL = '#1d2633';

function helice(x, y) {
  return `<ellipse class="helice" cx="${x}" cy="${y}" rx="1.2" ry="7" fill="${CLARO}" opacity=".55"/>`;
}

export function silueta(tipo) {
  const c = tipo.config;
  const n = tipo.nMotores;
  if (c.ala === 'delta') {
    return {
      svg: `<path d="M-44,-4 L-35,-24 L-27,-24 L-30,-4 Z" fill="${MEDIO}"/>
        <path d="M-46,-1 Q-46,-4 -40,-4 L28,-4 L50,1 L28,2 L-40,2 Q-46,2 -46,-1 Z" fill="${CLARO}"/>
        <path d="M-40,2 L12,2 L-36,6 Z" fill="${OSCURO}"/>
        <rect x="-36" y="3" width="22" height="4" rx="1.5" fill="#9aa3ad"/>
        <path d="M-44,-1 L44,-1" stroke="#b5862c" stroke-width="1.2"/>
        ${Array.from({ length: 9 }, (_, i) => `<rect x="${-26 + i * 5}" y="-3" width="1.8" height="1.6" rx="0.5" fill="${CRISTAL}" opacity=".8"/>`).join('')}`,
      motor: { x: -26, y: 5 },
    };
  }
  const ventanillas = Array.from({ length: 11 }, (_, i) => `<rect x="${-28 + i * 5}" y="-3.6" width="2.2" height="2" rx="0.6" fill="${CRISTAL}" opacity=".8"/>`).join('');
  const fuselaje = `<path d="M-44,0 Q-46,-6 -36,-7 L30,-7 Q42,-6 47,-1 Q44,4 32,5 L-36,5 Q-46,4 -44,0 Z" fill="${CLARO}"/>
    ${c.joroba ? `<path d="M6,-7 Q18,-14 36,-6 Z" fill="${CLARO}"/>` : ''}
    <path d="M-44,-0.5 L44,-0.5" stroke="#b5862c" stroke-width="1.6"/>
    ${ventanillas}
    <path d="M38,-4.5 L43,-4 L45,-1.5 L39,-1.5 Z" fill="${CRISTAL}"/>`;
  const deriva = `<path d="M-40,-22 L-31,-22 L-21,-6 L-36,-6 Z" fill="${MEDIO}"/>`;
  const estabilizador = c.cola === 'T'
    ? `<path d="M-46,-24 L-28,-24 L-31,-21.5 L-45,-21.5 Z" fill="${OSCURO}"/>`
    : c.cola === 'cruciforme'
      ? `<path d="M-44,-14 L-30,-14 L-33,-12 L-45,-12 Z" fill="${OSCURO}"/>`
      : `<path d="M-46,-1 L-31,-1 L-35,1.5 L-47,1.5 Z" fill="${OSCURO}"/>`;
  let ala = '';
  let motores = '';
  let motor = { x: -10, y: 7 };
  if (c.ala === 'alta') ala = `<path d="M-10,-8.5 L18,-8.5 L15,-11 L-8,-11 Z" fill="${MEDIO}"/>`;
  else ala = `<path d="M-4,2 L-22,9 L-15,9 L8,2 Z" fill="${OSCURO}"/>`;
  if (c.motores === 'helices-ala') {
    if (c.ala === 'alta') {
      motores = `<rect x="4" y="-9" width="12" height="5" rx="2" fill="${OSCURO}"/>${helice(17, -6.5)}`;
      motor = { x: 9, y: -5 };
    } else {
      motores = `<rect x="-2" y="1" width="12" height="5" rx="2" fill="#9aa3ad"/>${helice(11, 3.5)}`
        + (n >= 4 ? `<rect x="-12" y="4.5" width="10" height="4.5" rx="2" fill="#9aa3ad"/>${helice(-1, 6.5)}` : '');
      motor = { x: 4, y: 4 };
    }
  } else if (c.motores === 'ala' || c.motores === 'ala+cola') {
    motores = `<rect x="-16" y="5" width="13" height="4.6" rx="2.2" fill="#9aa3ad"/>`
      + (n >= 4 ? '<rect x="-25" y="7.5" width="11" height="4.2" rx="2" fill="#9aa3ad"/>' : '');
    motor = { x: -10, y: 7 };
  }
  if (c.motores === 'cola') {
    motores = '<rect x="-38" y="-10" width="13" height="5" rx="2.3" fill="#9aa3ad"/>';
    motor = { x: -32, y: -7.5 };
  }
  if (c.motorCola === 'conducto') motores += `<path d="M-36,-7 Q-31,-11.5 -24,-7 Z" fill="${MEDIO}"/>`;
  if (c.motorCola === 'aleta') motores += '<rect x="-41" y="-16" width="13" height="5" rx="2.3" fill="#9aa3ad"/>';
  return { svg: `${deriva}${estabilizador}${fuselaje}${ala}${motores}`, motor };
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

function escenaPista({ svg: sil }) {
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

function escenaAproximacion({ svg: sil }) {
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

function escenaVuelo({ svg: sil, motor }) {
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
      <g class="llama"><ellipse class="fuego" cx="${motor.x - 6}" cy="${motor.y}" rx="7" ry="4" fill="#ff8a1e"/><ellipse class="fuego" cx="${motor.x - 9}" cy="${motor.y}" rx="4" ry="2.5" fill="#ffe08a"/></g>
    </g>
    <g class="columna">${humo(318, 186, 10, 5.4, '#1f1b1b')}</g>
    <ellipse class="bola" cx="318" cy="188" rx="46" ry="34" fill="url(#fuegoV)"/>
    <path d="${arboles}" fill="#120f14"/>
  </svg>`;
}

const ESCENAS = { pista: escenaPista, aproximacion: escenaAproximacion, vuelo: escenaVuelo };

export const DURACION_ESCENA = 7000;

const LETREROS = {
  pista: 'Salida de pista',
  aproximacion: 'Aproximación',
  vuelo: 'En vuelo',
};

export function htmlEscena(accidente) {
  const tipo = TIPOS[accidente.tipo];
  const sil = silueta(tipo);
  const lugar = POR_ID[accidente.lugar];
  return `<style>${ESTILO_COMUN}</style>
    <div class="escena">${ESCENAS[accidente.escena]({ ...sil, svg: `<g>${sil.svg}</g>` })}</div>
    <p class="escena-pie"><span>${esc(accidente.numero)} · ${esc(accidente.matricula)} · ${esc(tipo.corto)}</span><span>${accidente.enRuta ? 'En ruta' : lugar.id} · ${textoHora(accidente.t)}</span><span>${LETREROS[accidente.escena]}</span></p>`;
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
  let titular;
  if (accidente.enRuta) titular = `Se estrella un avión entre ${o.ciudad} y ${d.ciudad}`;
  else if (sinFallecidos && accidente.escena === 'pista') titular = `Grave accidente en el aeropuerto de ${lugar.ciudad}`;
  else titular = TITULARES[accidente.escena](lugar.ciudad);
  const donde = accidente.enRuta ? '' : ` en ${lugar.nombre}`;
  const ticker = [
    'Las autoridades de aviación civil abren una investigación',
    `${estado.nombre} suspende la venta de billetes del ${accidente.numero}`,
    'Los equipos de rescate trabajan en la zona',
    `El avión, un ${tipo.nombre}, cubría la ruta ${o.ciudad}–${d.ciudad}`,
    'Se habilita un teléfono de información para los familiares',
  ].join('   ·   ');
  return `
  <div class="tele">
    <div class="tele-pantalla">
      <div class="tele-cabecera"><span class="tele-cadena">Diario Nacional</span><span class="tele-directo">Avance informativo</span></div>
      <p class="tele-fecha">${textoFecha(accidente.t)} · ${textoHora(accidente.t)}</p>
      <h2 class="tele-titular">${esc(titular)}</h2>
      <p class="tele-texto">Un ${esc(tipo.nombre)} de ${esc(estado.nombre)}, vuelo ${esc(accidente.numero)} entre ${esc(o.ciudad)} y ${esc(d.ciudad)}, ${esc(accidente.descripcion)}${esc(donde)}. Viajaban ${aBordo} personas: ${accidente.pax} pasajeros y ${accidente.tripulantes} tripulantes.</p>
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
  const donde = accidente.enRuta ? `del vuelo ${accidente.numero}` : `de ${lugar.ciudad}`;
  const conclusion = accidente.negligencia
    ? `La comisión aprecia responsabilidad de ${esc(estado.nombre)}. La aseguradora no cubre el siniestro y la autoridad impone una multa.`
    : 'La comisión no aprecia responsabilidad de la compañía. La aseguradora cubre el avión y la mayor parte de las indemnizaciones.';
  return `
  <div class="tele">
    <div class="tele-pantalla">
      <div class="tele-cabecera"><span class="tele-cadena">Diario Nacional</span><span class="tele-directo">Investigación</span></div>
      <p class="tele-fecha">${textoFecha(estado.t)}</p>
      <h2 class="tele-titular">Concluye la investigación del accidente ${esc(donde)}</h2>
      <p class="tele-texto"><strong>Causa probable:</strong> ${esc(accidente.principal)}.</p>
      ${accidente.factores?.length ? `<p class="tele-texto"><strong>Factores contribuyentes:</strong></p><ul class="tele-lista">${accidente.factores.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
      <p class="tele-texto">${conclusion}${accidente.directiva ? ` ${esc(accidente.directiva.texto)}` : ''}</p>
      <div class="tele-cifras">
        <div><strong>${dinero(accidente.indemnizaciones)}</strong><span>indemnizaciones</span></div>
        <div><strong>${dinero(accidente.pagaSeguro)}</strong><span>paga el seguro</span></div>
        <div><strong>${dinero(accidente.multa)}</strong><span>multa</span></div>
      </div>
    </div>
  </div>`;
}
