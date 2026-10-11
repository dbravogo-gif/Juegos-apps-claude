// Informes de aeropuerto: lo que se sabe de un sitio sin haber volado allí. Gratis, una idea
// general (el clima de todo el año y un orden de magnitud del mercado); pagando, el estudio
// meteorológico (por estación y cuánto tiempo queda por debajo de mínimos) y el de mercado
// (demanda, competidores y lo que te tocaría), que caduca a los doce meses.

import { probabilidades, NOMBRES } from './clima.js';
import { visibilidad, minimos } from './riesgo.js';

// En dólares de 1976 (se ajustan con la inflación). Los dos juntos, con descuento. Cifras de
// juego: una consultora pequeña de la época, no un precio documentado.
export const PRECIOS_INFORME = { clima: 5000, mercado: 15000, ambos: 17000 };
export const VIGENCIA_MERCADO = 365 * 1440;

const ORDEN = ['tormenta', 'nieve', 'niebla', 'calima', 'viento', 'lluvia'];
const SEV = [0.6, 0.3, 0.1]; // ligera, moderada, severa (como en clima.js)

// Fracción del tiempo con cada fenómeno en un mes: si salen dos, manda el primero de ORDEN.
function frecuencias(aeropuerto, m) {
  const p = probabilidades(aeropuerto, m);
  const f = {};
  let libre = 1;
  for (const x of ORDEN) {
    f[x] = libre * p[x];
    libre *= 1 - p[x];
  }
  return f;
}

// Fracción del tiempo por debajo de mínimos o justa, para un avión que admita el ILS del sitio.
function operatividad(aeropuerto, f) {
  const min = minimos(aeropuerto, { catMax: 3 });
  let bajo = 0;
  let justo = 0;
  for (const x of ['niebla', 'calima']) {
    SEV.forEach((ps, i) => {
      const vis = visibilidad({ tipo: x, sev: i + 1 });
      if (vis < min) bajo += f[x] * ps;
      else if (vis < min * 1.5) justo += f[x] * ps;
    });
  }
  bajo += f.viento * SEV[2];
  justo += f.viento * SEV[1] + f.tormenta * (SEV[1] + SEV[2]);
  return { bajo, justo };
}

const media = (lista) => {
  const r = {};
  for (const k of Object.keys(lista[0])) r[k] = lista.reduce((s, x) => s + x[k], 0) / lista.length;
  return r;
};

// Gratis: los fenómenos que más se dan a lo largo del año.
export function climaResumen(aeropuerto) {
  const f = media(Array.from({ length: 12 }, (_, m) => frecuencias(aeropuerto, m)));
  return ORDEN.map((x) => ({ fenomeno: x, nombre: NOMBRES[x], p: f[x] }))
    .filter((x) => x.p >= 0.01).sort((a, b) => b.p - a.p).slice(0, 3);
}

// De pago: por estación (en el hemisferio del aeropuerto) y con la operatividad.
export function climaEstudio(aeropuerto) {
  const sur = aeropuerto.lat < 0;
  const estaciones = [
    ['Invierno', sur ? [5, 6, 7] : [11, 0, 1]],
    ['Primavera', sur ? [8, 9, 10] : [2, 3, 4]],
    ['Verano', sur ? [11, 0, 1] : [5, 6, 7]],
    ['Otoño', sur ? [2, 3, 4] : [8, 9, 10]],
  ];
  return estaciones.map(([nombre, meses]) => {
    const f = media(meses.map((m) => frecuencias(aeropuerto, m)));
    return { nombre, frecuencias: f, ...operatividad(aeropuerto, f) };
  });
}

// Una horquilla de la demanda: «entre 200 y 250», «entre 1500 y 2000».
export function horquilla(n) {
  if (n < 10) return [0, 10];
  const paso = 10 ** Math.floor(Math.log10(n)) / 2;
  const bajo = Math.floor(n / paso) * paso;
  return [bajo, bajo + paso];
}
