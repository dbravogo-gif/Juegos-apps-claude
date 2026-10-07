// Tiempo atmosférico por aeropuerto y franja de seis horas.
//
// Cada perfil da, para cada fenómeno, la probabilidad en pleno invierno y en pleno verano; el
// resto del año se interpola. En el hemisferio sur las estaciones van al revés. El resultado
// sale de un hash de (semilla, aeropuerto, franja): es el mismo cada vez que se consulta y no
// hay que guardarlo.

import { hash, generador } from './azar.js';
import { mes } from './tiempo.js';

//                  [invierno, verano]
export const PERFILES = {
  atlantico:      { niebla: [0.10, 0.03], tormenta: [0.01, 0.04], nieve: [0.03, 0], viento: [0.10, 0.03], lluvia: [0.35, 0.22], calima: [0, 0] },
  continental:    { niebla: [0.07, 0.02], tormenta: [0.00, 0.08], nieve: [0.08, 0], viento: [0.06, 0.03], lluvia: [0.18, 0.15], calima: [0, 0] },
  nordico:        { niebla: [0.06, 0.03], tormenta: [0.00, 0.04], nieve: [0.25, 0], viento: [0.08, 0.04], lluvia: [0.15, 0.22], calima: [0, 0] },
  mediterraneo:   { niebla: [0.04, 0.01], tormenta: [0.03, 0.05], nieve: [0.005, 0], viento: [0.08, 0.04], lluvia: [0.18, 0.03], calima: [0.01, 0.02] },
  llanura_niebla: { niebla: [0.25, 0.02], tormenta: [0.01, 0.08], nieve: [0.04, 0], viento: [0.02, 0.02], lluvia: [0.15, 0.12], calima: [0, 0] },
  subtropical:    { niebla: [0.01, 0.00], tormenta: [0.01, 0.00], nieve: [0, 0], viento: [0.10, 0.14], lluvia: [0.06, 0.00], calima: [0.08, 0.06] },
  nubes_montana:  { niebla: [0.25, 0.15], tormenta: [0.01, 0.00], nieve: [0, 0], viento: [0.12, 0.15], lluvia: [0.12, 0.02], calima: [0.05, 0.04] },
  desierto:       { niebla: [0.02, 0.00], tormenta: [0.01, 0.01], nieve: [0, 0], viento: [0.08, 0.10], lluvia: [0.04, 0.00], calima: [0.08, 0.15] },
  sahel:          { niebla: [0.01, 0.00], tormenta: [0.00, 0.10], nieve: [0, 0], viento: [0.08, 0.05], lluvia: [0.00, 0.20], calima: [0.20, 0.05] },
  monzon:         { niebla: [0.05, 0.01], tormenta: [0.02, 0.25], nieve: [0, 0], viento: [0.04, 0.10], lluvia: [0.03, 0.55], calima: [0.02, 0] },
  indogangetico:  { niebla: [0.25, 0.00], tormenta: [0.01, 0.15], nieve: [0, 0], viento: [0.03, 0.06], lluvia: [0.03, 0.40], calima: [0.05, 0.10] },
  tropical:       { niebla: [0.02, 0.02], tormenta: [0.10, 0.18], nieve: [0, 0], viento: [0.03, 0.06], lluvia: [0.25, 0.35], calima: [0, 0] },
  altitud:        { niebla: [0.05, 0.05], tormenta: [0.05, 0.20], nieve: [0.02, 0], viento: [0.06, 0.06], lluvia: [0.10, 0.25], calima: [0, 0] },
  costa_niebla:   { niebla: [0.08, 0.22], tormenta: [0.01, 0.00], nieve: [0, 0], viento: [0.04, 0.04], lluvia: [0.10, 0.00], calima: [0, 0] },
};

// Orden de prioridad: si salen dos fenómenos, manda el primero.
const ORDEN = ['tormenta', 'nieve', 'niebla', 'calima', 'viento', 'lluvia'];

export const NOMBRES = {
  despejado: 'Despejado',
  tormenta: 'Tormenta',
  nieve: 'Nieve',
  niebla: 'Niebla',
  calima: 'Calima',
  viento: 'Viento fuerte',
  lluvia: 'Lluvia',
};

export const ICONOS = {
  despejado: '☀️', tormenta: '⛈️', nieve: '❄️', niebla: '🌫️', calima: '🌫️', viento: '💨', lluvia: '🌧️',
};

export const INTENSIDAD = ['', 'ligera', 'moderada', 'severa'];

// 0 en pleno invierno, 1 en pleno verano (del hemisferio del aeropuerto).
export function verano(mesIndice, lat) {
  const s = (1 - Math.cos((2 * Math.PI * mesIndice) / 12)) / 2;
  return lat < 0 ? 1 - s : s;
}

export function probabilidades(aeropuerto, mesIndice) {
  const perfil = PERFILES[aeropuerto.clima] ?? PERFILES.mediterraneo;
  const s = verano(mesIndice, aeropuerto.lat);
  const p = {};
  for (const f of ORDEN) {
    const [inv, ver] = perfil[f];
    p[f] = inv + (ver - inv) * s;
  }
  return p;
}

function intensidad(r) {
  const x = r();
  return x < 0.6 ? 1 : x < 0.9 ? 2 : 3;
}

export const franja = (t) => Math.floor(t / 360);

export function climaEn(aeropuerto, t, semilla) {
  const r = generador(hash(semilla, 'clima', aeropuerto.id, franja(t)));
  const p = probabilidades(aeropuerto, mes(t));
  for (const f of ORDEN) {
    if (r() < p[f]) return { tipo: f, sev: intensidad(r) };
  }
  return { tipo: 'despejado', sev: 0 };
}

// Tormentas en ruta: más probables en verano y en vuelos largos.
export function climaRuta(origen, destino, t, semilla, distancia) {
  const r = generador(hash(semilla, 'ruta', origen.id, destino.id, franja(t)));
  const s = (verano(mes(t), origen.lat) + verano(mes(t), destino.lat)) / 2;
  const p = (0.03 + 0.05 * s) * Math.min(2, 0.6 + distancia / 2500);
  if (r() < p) return { tipo: 'tormenta', sev: intensidad(r) };
  return { tipo: 'despejado', sev: 0 };
}

export function textoClima(c) {
  if (c.tipo === 'despejado') return NOMBRES.despejado;
  return `${NOMBRES[c.tipo]} ${INTENSIDAD[c.sev]}`;
}
