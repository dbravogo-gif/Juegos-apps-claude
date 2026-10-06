// Riesgo de un vuelo.
//
// Cada factor suma una probabilidad de accidente y lleva una causa, que decide qué tipo de
// accidente sería:
//   aproximacion  impacto contra el terreno al aproximarse con mala visibilidad
//   pista         salida de pista al aterrizar o despegar
//   vuelo         fallo en vuelo: motor, estructura, tormenta
//
// Las probabilidades están muy exageradas respecto a la realidad, para que la decisión importe.
// Todo se multiplica por un factor de época que baja con los años: en 1976 se vuela peor que en
// 1996.

import { climaEn, climaRuta, textoClima } from './clima.js';
import { anioDecimal, hora } from './tiempo.js';

export const CAUSAS = ['aproximacion', 'pista', 'vuelo'];

export const LIMITE_REVISION = 500;
// Horas de vuelo al día a partir de las cuales la tripulación de un avión acusa el cansancio.
export const JORNADA_MAXIMA = 9;

const BASE = 0.00001;

// Probabilidades por intensidad [ligera, moderada, severa]. Lo ligero apenas cuenta; lo
// moderado ya pide pensarlo; lo severo es jugársela.
const DESTINO = {
  niebla: { ils: [0.00001, 0.0002, 0.001], sinIls: [0.00005, 0.0025, 0.02] },
  calima: { ils: [0.000005, 0.0001, 0.0005], sinIls: [0.00003, 0.0012, 0.006] },
  tormenta: [0.00005, 0.001, 0.008],
  nieve: [0.00003, 0.001, 0.006],
  lluvia: [0.00001, 0.00005, 0.0004],
  viento: [0.00002, 0.0004, 0.004],
};
const ORIGEN = {
  tormenta: [0.00003, 0.0007, 0.005],
  nieve: [0.00003, 0.0006, 0.003],
  viento: [0.00001, 0.0002, 0.0015],
  niebla: [0.000005, 0.00005, 0.0004],
  calima: [0.000005, 0.00005, 0.0004],
};
const RUTA_TORMENTA = [0.00003, 0.0005, 0.003];
const DEFECTO = [0.0002, 0.0012, 0.005];

export const PIEZAS = {
  motores: { nombre: 'Motores', causa: 'vuelo' },
  tren: { nombre: 'Tren de aterrizaje', causa: 'pista' },
  fuselaje: { nombre: 'Fuselaje', causa: 'vuelo' },
  avionica: { nombre: 'Aviónica', causa: 'aproximacion' },
};

export const factorEpoca = (t) => Math.pow(0.965, anioDecimal(t) - 1976);

// Holgura de pista: con poca, la lluvia o la nieve son mucho peores.
export function factorPista(aeropuerto, tipo) {
  const margen = aeropuerto.pista / tipo.pista;
  return margen >= 1.5 ? 1 : margen >= 1.25 ? 1.6 : 2.8;
}

const desgaste = (cond) => Math.pow(Math.max(0, 100 - cond) / 60, 3);

// Devuelve los factores y el total. `opciones.combustibleExtra` permite desviarse a un
// alternativo, lo que quita gran parte del riesgo meteorológico en destino.
export function evaluarVuelo({ avion, tipo, origen, destino, t, semilla, distancia, duracion, combustibleExtra = false }) {
  const factores = [];
  const add = (id, grupo, texto, causa, valor, oculto = false) => {
    if (valor > 0) factores.push({ id, grupo, texto, causa, valor, oculto });
  };

  const climaO = climaEn(origen, t, semilla);
  const climaD = climaEn(destino, t + duracion, semilla);
  const climaR = climaRuta(origen, destino, t, semilla, distancia);
  const pistaD = factorPista(destino, tipo);
  const pistaO = factorPista(origen, tipo);
  const montana = destino.montana ? (destino.ils ? 1.3 : 2) : 1;
  const alternativo = combustibleExtra ? 0.35 : 1;
  const conAlt = combustibleExtra ? ' (con alternativo)' : '';

  add('base', 'avion', 'Riesgo de base de la época', 'vuelo', BASE);

  // Meteo en destino
  if (climaD.sev) {
    const i = climaD.sev - 1;
    const txt = `${textoClima(climaD)} en ${destino.id}${conAlt}`;
    const c = climaD.tipo;
    if (c === 'niebla' || c === 'calima') {
      const v = (destino.ils ? DESTINO[c].ils : DESTINO[c].sinIls)[i] * montana * alternativo;
      add('meteoDestino', 'meteo', txt + (destino.ils ? '' : ', sin ILS'), 'aproximacion', v);
    } else if (c === 'tormenta') {
      add('meteoDestino', 'meteo', txt, 'aproximacion', (DESTINO.tormenta[i] / 2) * montana * alternativo);
      add('meteoDestinoPista', 'meteo', `Pista mojada y cizalladura en ${destino.id}${conAlt}`, 'pista', (DESTINO.tormenta[i] / 2) * pistaD * alternativo);
    } else {
      const extraMontana = c === 'viento' && destino.montana ? 1.5 : 1;
      add('meteoDestino', 'meteo', txt, 'pista', DESTINO[c][i] * pistaD * extraMontana * alternativo);
    }
  }

  // Meteo en origen
  if (climaO.sev && ORIGEN[climaO.tipo]) {
    const causa = climaO.tipo === 'viento' || climaO.tipo === 'niebla' || climaO.tipo === 'calima' ? 'pista' : 'vuelo';
    const v = ORIGEN[climaO.tipo][climaO.sev - 1] * (causa === 'pista' ? pistaO : 1);
    add('meteoOrigen', 'meteo', `${textoClima(climaO)} en ${origen.id} al despegar`, causa, v);
  }

  // Meteo en ruta
  if (climaR.sev) {
    add('meteoRuta', 'meteo', `Tormenta ${['', 'ligera', 'moderada', 'severa'][climaR.sev]} en ruta`, 'vuelo', RUTA_TORMENTA[climaR.sev - 1]);
  }

  // Aeropuerto
  const margen = destino.pista / tipo.pista;
  if (margen < 1.15) add('pistaCorta', 'aeropuerto', `Pista justa en ${destino.id} (${destino.pista} m)`, 'pista', 0.00005);
  if (destino.montana && !destino.ils) add('terreno', 'aeropuerto', `Terreno montañoso en ${destino.id}`, 'aproximacion', 0.00002);

  // Avión
  const vencida = Math.max(0, avion.horasDesdeRevision - LIMITE_REVISION);
  const mult = tipo.fiabilidad * (1 + Math.min(3, vencida / 150));
  add('motores', 'avion', `Motores al ${Math.round(avion.partes.motores)} %`, 'vuelo', 0.002 * desgaste(avion.partes.motores) * mult);
  add('tren', 'avion', `Tren al ${Math.round(avion.partes.tren)} %`, 'pista', 0.0012 * desgaste(avion.partes.tren) * mult);
  add('fuselaje', 'avion', `Fuselaje al ${Math.round(avion.partes.fuselaje)} %`, 'vuelo', 0.0008 * desgaste(avion.partes.fuselaje) * mult);
  if (tipo.fiabilidad > 1.4) add('tipo', 'avion', `${tipo.corto}: fiabilidad dudosa`, 'vuelo', 0.0003 * (tipo.fiabilidad - 1));
  if (vencida > 0) add('revision', 'avion', `Revisión vencida hace ${Math.round(vencida)} h`, 'vuelo', 0.0005 * (vencida / 100));
  for (const d of avion.defectos) {
    const pieza = PIEZAS[d.pieza];
    const texto = d.descubierto ? `Defecto en ${pieza.nombre.toLowerCase()}: ${d.texto}` : `Defecto oculto en ${pieza.nombre.toLowerCase()}`;
    add(`defecto-${d.id}`, 'avion', texto, pieza.causa, DEFECTO[d.gravedad - 1] * mult, !d.descubierto);
  }

  // Tripulación: fatiga y noche multiplican lo que depende de pilotar bien.
  const horasVuelo = duracion / 60;
  const jornada = avion.horasHoy + horasVuelo;
  const pilotable = factores.filter((f) => f.causa !== 'vuelo').reduce((s, f) => s + f.valor, 0) + BASE;
  if (jornada > JORNADA_MAXIMA) {
    const exceso = jornada - JORNADA_MAXIMA;
    add('fatiga', 'tripulacion', `Tripulación cansada: ${jornada.toFixed(1)} h de vuelo hoy`, 'aproximacion', pilotable * exceso * 0.15 + 0.0002 * exceso);
  }
  const hLlegada = hora(t + duracion);
  if (hLlegada < 6 || hLlegada >= 23) {
    add('noche', 'tripulacion', 'Aterrizaje de noche', 'aproximacion', pilotable * 0.25 + 0.00001);
  }

  const epoca = factorEpoca(t);
  for (const f of factores) f.valor *= epoca;
  factores.sort((a, b) => b.valor - a.valor);

  const total = Math.min(0.6, factores.reduce((s, f) => s + f.valor, 0));
  const visible = Math.min(0.6, factores.filter((f) => !f.oculto).reduce((s, f) => s + f.valor, 0));
  const porCausa = Object.fromEntries(CAUSAS.map((c) => [c, factores.filter((f) => f.causa === c).reduce((s, f) => s + f.valor, 0)]));
  const meteoDestino = factores.filter((f) => f.id.startsWith('meteoDestino')).reduce((s, f) => s + f.valor, 0);

  return {
    factores, total, visible, porCausa, meteoDestino, combustibleExtra,
    clima: { origen: climaO, destino: climaD, ruta: climaR },
    jornada,
  };
}

// Lo que ve el jugador: el riesgo visible con el error del despachador.
export function estimar(evaluacion, r, sigma = 0.35) {
  const u = Math.max(r(), 1e-9);
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
  return Math.min(0.6, evaluacion.visible * Math.exp(z * sigma));
}

// Resultado del vuelo: normal, desvio, leve, grave o accidente.
export function resolverVuelo(evaluacion, r) {
  const p = evaluacion.total;
  const u = r();
  const causa = () => {
    let x = r() * p;
    for (const c of CAUSAS) {
      x -= evaluacion.porCausa[c];
      if (x <= 0) return c;
    }
    return 'vuelo';
  };
  if (u < p) return { resultado: 'accidente', causa: causa() };
  if (evaluacion.combustibleExtra && evaluacion.meteoDestino > 0) {
    const pDesvio = Math.min(0.7, (evaluacion.meteoDestino / 0.35) * 60);
    if (r() < pDesvio) return { resultado: 'desvio', causa: 'aproximacion' };
  }
  if (u < p * 3) return { resultado: 'grave', causa: causa() };
  if (u < p * 8) return { resultado: 'leve', causa: causa() };
  return { resultado: 'normal', causa: null };
}

// Lo que más contribuyó, contando lo oculto: es lo que descubre la investigación.
export function causaPrincipal(evaluacion, causa) {
  return evaluacion.factores.find((f) => f.causa === causa) ?? evaluacion.factores[0];
}
