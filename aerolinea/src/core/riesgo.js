// Riesgo de un vuelo: amenaza → evento → desenlace.
//
// Cada vuelo se enfrenta a amenazas concretas (tiempo por debajo de mínimos, una avería que
// llega al límite, una pista contaminada, una tripulación cansada…). Cada amenaza puede
// convertirse en un evento con su probabilidad, y casi siempre el evento acaba en un incidente:
// un desvío, un motor apagado, un aterrizaje de emergencia. Solo una parte pequeña escala a
// accidente, y lo que hace que escale son los factores agravantes: terreno, noche, fatiga,
// falta de un sistema, presión por despachar. Así un accidente siempre tiene una historia.
//
// Las tecnologías actúan sobre categorías concretas: el GPWS sobre el CFIT, el radar sobre las
// tormentas en ruta, la alerta de cizalladura sobre la cizalladura, el TCAS sobre la colisión.
// Las cifras son de juego: exageradas respecto a la realidad para que la decisión importe,
// pero con las proporciones razonables entre unas causas y otras.

import { AVERIAS } from '../data/averias.js';
import { programa } from '../data/aviones.js';
import { MOTORES } from '../data/motores.js';
import { TOLERANCIA } from './mantenimiento.js';
import { textoClima } from './clima.js';

// Visibilidad en metros según el fenómeno y su intensidad.
const VISIBILIDAD = { niebla: [1500, 600, 150], calima: [3000, 1500, 800] };

export function visibilidad(clima) {
  return VISIBILIDAD[clima.tipo] ? VISIBILIDAD[clima.tipo][clima.sev - 1] : 10000;
}

// Visibilidad mínima para aterrizar según el ILS del aeropuerto y lo que admite el avión.
export function minimos(aeropuerto, tipo) {
  const cat = Math.min(aeropuerto.ils, tipo.catMax);
  if (cat === 0) return aeropuerto.montana ? 3000 : 1500; // aproximación de no precisión
  return [0, 550, 300, 75][cat];
}

export function descripcionAproximacion(aeropuerto, tipo) {
  const cat = Math.min(aeropuerto.ils, tipo.catMax);
  if (aeropuerto.ils === 0) return 'Sin ILS: aproximación de no precisión';
  if (cat < aeropuerto.ils) return `ILS CAT ${aeropuerto.ils}, pero el avión solo admite CAT ${cat}`;
  return `ILS CAT ${cat}`;
}

const contaminada = (c) => (c.tipo === 'lluvia' && c.sev >= 2) || c.tipo === 'nieve' || (c.tipo === 'tormenta' && c.sev >= 2);

function proteccionCFIT(avion, anio) {
  if (avion.equipo.egpws && !avion.inop.gpws) return { factor: 0.1, texto: 'EGPWS' };
  if (avion.equipo.gpws && !avion.inop.gpws) return { factor: 0.4, texto: 'GPWS' };
  return { factor: 1, texto: avion.equipo.gpws ? 'GPWS inoperativo' : 'Sin GPWS' };
}

// Mejora de procedimientos, formación y gestión de cabina con los años. Tiene suelo: por bien
// que se haga todo, el riesgo no llega a desaparecer.
const epoca = (anio) => Math.max(0.55, Math.pow(0.975, Math.max(0, anio - 1976)));

// Averías que el jugador conoce desde hace más de tres días y no ha atendido (ni reparadas ni
// diferidas según la MEL).
export function averiasDesatendidas(avion, t) {
  return avion.averias.filter((a) => !a.equipo && ['indicio', 'anomalia', 'confirmada'].includes(a.fase) && t - a.desde > 3 * 24 * 60);
}

// Peso de cada cosa vencida o desatendida. Las revisiones pesan más cuanto más tiempo llevan
// vencidas: no es lo mismo pasarse diez horas que mil. La A es la más ligera; la C, la
// estructural y la general de los motores pesan más.
const REVISION = { A: { peso: 0.4, crece: 5 }, C: { peso: 1, crece: 3 }, D: { peso: 1, crece: 3 } };
const MOTOR = { peso: 0.8, crece: 3 };
const PESO_OTRAS = { mel: 1, equipo: 0.5, noApto: 2, directiva: 1.5 };
const PESO_FASE = { indicio: 0.6, anomalia: 1, confirmada: 0.8 };

function pesoVencida(horas, intervalo, { peso, crece }) {
  const r = horas / intervalo;
  return r > TOLERANCIA ? peso * (1 + crece * Math.log(r / TOLERANCIA)) : 0;
}

// Dejadez: revisiones vencidas y averías conocidas sin atender. Multiplica el riesgo técnico de
// forma exponencial con el peso acumulado: un despiste pequeño lo dobla, varios a la vez lo
// disparan, y un avión con todo vencido y averías ignoradas acaba fallando y, cuando algo
// falla, se encadena. Vale 1 en un avión cuidado y llega a 100 en uno abandonado. Una falsa
// alarma ignorada no empeora el avión, pero el despacho no lo sabe.
export function dejadez(ctx, vision = 'real') {
  const { avion, tipo } = ctx;
  const prog = programa(tipo);
  const intervaloMotor = MOTORES[tipo.motor].intervalo;
  let w = 0;
  for (const nivel of ['A', 'C', 'D']) w += pesoVencida(avion.revisiones[nivel], prog[nivel].horas, REVISION[nivel]);
  for (const m of avion.motores) w += pesoVencida(m.horasRG, intervaloMotor, MOTOR);
  for (const x of ctx.irregularidades) w += PESO_OTRAS[x.codigo] ?? 0;
  for (const a of averiasDesatendidas(avion, ctx.t ?? 0)) {
    if (vision === 'despacho' || !a.falsa) w += PESO_FASE[a.fase] ?? 0;
  }
  return Math.min(100, Math.exp(0.8 * w));
}

// Escala general: con todo bien hecho, una partida entera (unos 150.000 vuelos en 50 años) se
// queda en torno a medio accidente. El resto lo ponen las decisiones del jugador.
const BASE = 0.5;

// Calcula los eventos posibles del vuelo y sus probabilidades. `vision` = 'real' usa el
// estado verdadero del avión y el tiempo real; 'despacho' usa lo que se sabe (previsión y
// averías conocidas).
export function amenazas(ctx, vision = 'real') {
  const { avion, tipo, origen, destino, anio } = ctx;
  const clima = vision === 'real' ? ctx.clima : ctx.prevision;
  const horas = ctx.duracion / 60;
  const lista = [];
  const add = (e) => { if (e.p > 0) lista.push(e); };
  const era = epoca(anio);
  // Cansancio: crece con la actividad y se dispara por encima del límite legal (13 h).
  const fatiga = ctx.jornada > 10 ? 1 + 0.15 * (ctx.jornada - 10) + 0.35 * Math.max(0, ctx.jornada - 13) : 1;
  const noche = ctx.noche ? 1.3 : 1;
  // Presión por despachar fuera de norma: la tripulación sabe que la compañía quiere que llegue.
  const presion = !ctx.despachoIrregular ? 1 : ctx.irregularidades.some((x) => x.codigo === 'minimos') ? 6 : 3;
  const dej = dejadez(ctx, vision);
  const cfit = proteccionCFIT(avion, anio);
  const montana = destino.montana ? 2.5 : 1;
  const bimotor = tipo.nMotores === 2;
  const restringido = ctx.cargaPorPista < 1 || origen.elev > 1000;

  // --- Técnica: averías que llegan a su límite
  for (const a of avion.averias) {
    if (a.falsa || a.equipo) continue;
    if (vision === 'despacho' && a.fase === 'oculta') continue;
    const def = AVERIAS[a.codigo];
    const p = vision === 'real' ? a.progreso : progresoEstimado(a, def);
    const lim = def.umbrales.limite;
    let pf = 0;
    if (p >= 1) pf = 0.95;
    else if (p >= lim) pf = Math.min(0.6, horas * 0.03 * ((p - lim) / (1 - lim)) ** 2 + 0.01);
    if (!pf) continue;
    const base = { averia: a.id, motor: a.motor, origen: 'tecnico', p: pf };
    switch (def.fallo) {
      case 'apagado': {
        add({ ...base, id: 'apagadoDespegue', p: pf * 0.25, esc: (bimotor ? 0.012 : tipo.nMotores === 3 ? 0.005 : 0.004) * (restringido ? 2 : 1) * fatiga * era, escena: 'vuelo' });
        add({ ...base, id: 'apagadoCrucero', p: pf * 0.65, esc: (bimotor ? 0.003 : 0.001) * era, escena: 'vuelo' });
        add({ ...base, id: 'apagadoAproximacion', p: pf * 0.1, esc: (bimotor ? 0.01 : 0.004) * fatiga * noche * era, escena: 'aproximacion' });
        break;
      }
      case 'noContenido': add({ ...base, id: 'noContenido', esc: 0.12, escena: 'vuelo' }); break;
      case 'incendio': add({ ...base, id: 'incendio', esc: 0.03 * era, escena: 'vuelo' }); break;
      case 'estructuraVuelo': add({ ...base, id: 'estructura', esc: 0.2, escena: 'vuelo' }); break;
      case 'hidraulico': add({ ...base, id: 'hidraulico', esc: 0.001 * (tipo.hidraulicos <= 2 ? 2 : 1) * (contaminada(clima.destino) ? 2 : 1), escena: 'pista' }); break;
      case 'tren': add({ ...base, id: 'tren', esc: 0.015, escena: 'pista' }); break;
      case 'presurizacion': add({ ...base, id: 'presurizacion', esc: 0.001, escena: 'vuelo' }); break;
      case 'reventon': add({ ...base, id: 'reventon', esc: 0.03 * (anio >= 2001 ? 0.2 : 1), escena: 'vuelo' }); break;
      default: break; // los frenos agravan la salida de pista (más abajo)
    }
  }
  add({ id: 'apagadoSinAviso', origen: 'tecnico', p: Math.min(0.2, horas * tipo.nMotores * 0.00002 * dej), esc: (bimotor ? 0.006 : 0.002) * era, escena: 'vuelo' });
  // Lo que un mantenimiento al día habría encontrado: cables y mandos de vuelo, compensadores.
  if (dej > 1.2) add({ id: 'mandos', origen: 'tecnico', propio: true, p: Math.min(0.06, 0.0008 * (dej - 1)), esc: Math.min(0.5, 0.005 * (dej - 1)), escena: 'vuelo' });
  add({ id: 'ave', origen: 'entorno', p: 0.0002, esc: 0.001, escena: 'vuelo' });

  // --- Meteorología en destino
  const vis = visibilidad(clima.destino);
  const min = minimos(destino, tipo);
  const extra = ctx.combustibleExtra;
  // Por debajo de mínimos lo normal es esperar o desviarse. El accidente llega cuando la
  // tripulación sigue bajando igualmente: más con cansancio, sin combustible para esperar y
  // si la compañía la ha despachado así a sabiendas.
  const sinViento = clima.destino.tipo === 'viento' && clima.destino.sev === 3;
  if (vis < min || sinViento) {
    const niebla = vis < min;
    const motivo = niebla ? `${textoClima(clima.destino)} en ${destino.id}, por debajo de mínimos` : `viento cruzado fuera de límites en ${destino.id}`;
    const continuar = Math.min(0.3, 0.008 * fatiga * presion * (extra ? 0.5 : 1.5) * era);
    const escCfit = Math.min(0.4, 0.06 * montana * (destino.ils === 0 ? 1.5 : 1) * cfit.factor * noche * fatiga);
    const escPista = Math.min(0.4, 0.04 * (destino.finPista === 'peligroso' ? 4 : 1) * fatiga);
    add({
      id: 'bajoMinimos', origen: 'meteo', p: 1, continuar, esc: continuar * (niebla ? escCfit : escPista),
      variante: niebla ? 'visibilidad' : 'viento', escena: niebla ? 'aproximacion' : 'pista', motivo, mejora: extra ? 0.35 : 0.1,
    });
  } else if (vis < min * 1.5) {
    add({ id: 'cercaMinimos', origen: 'meteo', p: 0.35, esc: 0.0001 * montana * cfit.factor * noche * fatiga * era, escena: 'aproximacion', motivo: `${textoClima(clima.destino)} en ${destino.id}, cerca de mínimos` });
  }
  if (clima.destino.tipo === 'tormenta' && clima.destino.sev >= 2) {
    add({ id: 'cizalladura', origen: 'meteo', p: 0.002 * clima.destino.sev, esc: 0.012 * (avion.equipo.cizalladura ? 0.4 : 1) * fatiga, escena: 'aproximacion' });
    add({ id: 'tormentaDestino', origen: 'meteo', p: extra ? 0.15 : 0.25, esc: 0, escena: null, motivo: `Tormenta en ${destino.id}` });
  }
  if (clima.destino.tipo === 'viento' && clima.destino.sev === 2) {
    add({ id: 'vientoCruzado', origen: 'meteo', p: 0.15, esc: 0.0002 * (destino.montana ? 3 : 1) * fatiga, escena: 'pista', motivo: `Viento cruzado fuerte en ${destino.id}` });
  }

  // --- Pista: salida de pista al aterrizar
  {
    const c = clima.destino;
    let p = 0.00003;
    if (c.tipo === 'lluvia') p = [0.00005, 0.0006, 0.0015][c.sev - 1];
    if (c.tipo === 'nieve') p = [0.0008, 0.002, 0.004][c.sev - 1];
    if (c.tipo === 'tormenta') p = [0.0003, 0.001, 0.002][c.sev - 1];
    const requerida = tipo.pistaMTOW * 0.75 * (contaminada(c) ? 1.4 : 1);
    const margen = Math.max(0.5, Math.min(4, (requerida / ctx.pistaDestino) * 2));
    const frenos = avion.averias.some((a) => a.codigo === 'frenos' && (vision === 'real' ? a.progreso >= AVERIAS.frenos.umbrales.limite : a.diagnostico?.fueraDeLimites)) ? 3 : 1;
    const viento = c.tipo === 'viento' && c.sev >= 2 ? 2 : 1;
    add({
      id: 'salidaPista', origen: 'pista', p: p * margen * frenos * viento * fatiga,
      esc: 0.015 * (destino.finPista === 'peligroso' ? 4 : 1) * (margen > 2 ? 1.5 : 1), escena: 'pista',
      motivo: contaminada(c) ? `Pista ${c.tipo === 'nieve' ? 'con nieve' : 'mojada'} en ${destino.id}` : null,
    });
  }

  // --- Meteorología en ruta y en origen
  if (clima.ruta.tipo === 'tormenta') {
    const radar = avion.equipo.radar && !avion.inop.radar;
    add({ id: 'turbulencia', origen: 'meteo', p: (radar ? 0.002 : 0.012) * clima.ruta.sev, esc: 0.004, escena: 'vuelo', motivo: `Tormenta ${radar ? '' : 'sin radar meteorológico '}en ruta` });
  }
  if (clima.origen.tipo === 'nieve' && clima.origen.sev >= 2) {
    add({ id: 'hielo', origen: 'meteo', p: 0.0005 * clima.origen.sev, esc: 0.05 * era, escena: 'vuelo', motivo: `Nieve en ${origen.id} al despegar` });
  }
  if (clima.origen.tipo === 'tormenta' && clima.origen.sev >= 2) {
    add({ id: 'cizalladuraDespegue', origen: 'meteo', p: 0.001 * clima.origen.sev, esc: 0.012 * (avion.equipo.cizalladura ? 0.4 : 1), escena: 'vuelo' });
  }

  // --- Tráfico y factor humano
  add({ id: 'conflicto', origen: 'trafico', p: 0.00005 * (origen.tam + destino.tam) / 6, esc: 0.008 * (avion.equipo.tcas ? 0.15 : 1), escena: 'vuelo' });
  add({ id: 'errorTripulacion', origen: 'humano', p: 0.0003 * fatiga * noche * presion, esc: 0.003 * montana * cfit.factor * era, escena: 'aproximacion' });

  // Escala general y, en lo técnico, la dejadez.
  for (const e of lista) {
    if (e.propio || !e.esc) continue;
    e.esc *= BASE;
    if (e.origen === 'tecnico') e.esc = Math.min(0.6, e.esc * dej);
  }
  return lista;
}

// Progreso que el despacho supone para una avería conocida.
function progresoEstimado(a, def) {
  const u = def.umbrales;
  if (a.fase === 'indicio') return Math.max(u.sintoma, u.inspeccion);
  if (a.fase === 'anomalia') return (u.inspeccion + u.limite) / 2;
  if (a.fase === 'confirmada' || a.fase === 'diferida') return a.diagnostico?.fueraDeLimites ? u.limite + 0.2 : u.limite - 0.1;
  return 0;
}

// Probabilidades agregadas para el despacho.
export function estimar(ctx, ruido = 0) {
  const lista = amenazas(ctx, 'despacho');
  let pAccidente = 0;
  let pNada = 1;
  for (const e of lista) {
    const esc = e.id === 'bajoMinimos' ? e.esc : e.esc ?? 0;
    pAccidente += e.p * esc;
    pNada *= 1 - Math.min(1, e.p);
  }
  pAccidente *= Math.exp(ruido * 0.3);
  const probable = lista.filter((e) => e.p >= 0.05 && e.motivo).sort((a, b) => b.p - a.p)[0] ?? null;
  return { pAccidente: Math.min(0.9, pAccidente), pIncidencia: 1 - pNada, probable, lista };
}

export function bandaIncidencia(p) {
  if (p < 0.02) return { clase: 'bajo', texto: 'Baja' };
  if (p < 0.1) return { clase: 'moderado', texto: 'Moderada' };
  if (p < 0.4) return { clase: 'alto', texto: 'Alta' };
  return { clase: 'extremo', texto: 'Muy alta' };
}

export function bandaGrave(p) {
  if (p < 0.00005) return { clase: 'bajo', texto: 'Muy bajo' };
  if (p < 0.0005) return { clase: 'bajo', texto: 'Bajo' };
  if (p < 0.005) return { clase: 'moderado', texto: 'Apreciable' };
  if (p < 0.03) return { clase: 'alto', texto: 'Alto' };
  return { clase: 'extremo', texto: 'Muy alto' };
}

// Simula el vuelo con el estado real. Devuelve el desenlace y la cadena de eventos.
export function simular(ctx, r) {
  const lista = amenazas(ctx, 'real');
  const eventos = [];
  for (const e of lista) {
    if (r() >= e.p) continue;
    if (e.id === 'bajoMinimos') {
      if (r() < e.continuar) {
        eventos.push({ ...e, continua: true });
        if (r() < e.esc / Math.max(e.continuar, 1e-9)) return { accidente: true, evento: { ...e, continua: true }, eventos, lista };
        continue;
      }
      eventos.push({ ...e, desvia: r() >= e.mejora });
      continue;
    }
    eventos.push(e);
    if (e.esc && r() < e.esc) return { accidente: true, evento: e, eventos, lista };
  }
  return { accidente: false, evento: null, eventos, lista };
}

// Factores que agravaron el accidente, de más a menos importantes, para la investigación.
export function factoresAgravantes(ctx, evento) {
  const { avion, destino, origen } = ctx;
  const f = [];
  if (ctx.jornada > 10) f.push({ texto: `Tripulación con ${ctx.jornada.toFixed(1)} horas de actividad`, imputable: ctx.jornada > 13 });
  if (ctx.noche && evento.escena === 'aproximacion') f.push({ texto: 'Aproximación de noche', imputable: false });
  if (destino.montana && evento.escena === 'aproximacion') f.push({ texto: `Terreno montañoso alrededor de ${destino.id}`, imputable: false });
  if (destino.ils === 0 && evento.escena === 'aproximacion') f.push({ texto: `${destino.id} sin ILS`, imputable: false });
  const terreno = (evento.id === 'bajoMinimos' && evento.variante !== 'viento') || ['cercaMinimos', 'errorTripulacion', 'apagadoAproximacion'].includes(evento.id);
  if (terreno) {
    if (!avion.equipo.gpws) f.push({ texto: 'El avión no llevaba GPWS', imputable: false });
    else if (avion.inop.gpws) f.push({ texto: 'GPWS inoperativo', imputable: true });
  }
  if (evento.id === 'turbulencia' && (!avion.equipo.radar || avion.inop.radar)) f.push({ texto: 'Radar meteorológico no disponible', imputable: avion.inop.radar === true });
  if (ctx.despachoIrregular) f.push({ texto: 'El vuelo se despachó con condiciones fuera de norma', imputable: true });
  if (!ctx.combustibleExtra && evento.id === 'bajoMinimos') f.push({ texto: 'Sin combustible extra para esperar o desviarse', imputable: false });
  if (evento.escena === 'pista' && destino.finPista === 'peligroso') f.push({ texto: `Terreno peligroso al final de la pista de ${destino.id}`, imputable: false });
  if (ctx.cargaPorPista < 1 && evento.id === 'apagadoDespegue') f.push({ texto: `Despegue con poco margen de pista en ${origen.id}`, imputable: false });
  for (const irr of ctx.irregularidades) f.push({ texto: irr.texto, imputable: true });
  const desatendidas = averiasDesatendidas(avion, ctx.t ?? 0);
  if (desatendidas.length) f.push({ texto: `${desatendidas.length === 1 ? 'Una avería conocida llevaba' : `${desatendidas.length} averías conocidas llevaban`} días sin atender`, imputable: true });
  return f;
}
