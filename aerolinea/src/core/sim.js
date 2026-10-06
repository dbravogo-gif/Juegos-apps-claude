// Motor de la partida: el reloj, los vuelos, las decisiones, el taller y las cuentas.
//
// `avanzar` mueve el reloj y devuelve los eventos que la interfaz tiene que enseñar. Se para en
// cuanto hay una decisión pendiente: el mundo no sigue mientras decides si sale un avión.

import { POR_ID } from '../data/aeropuertos.js';
import { TIPOS, programa, tripulacion } from '../data/aviones.js';
import { TECNOLOGIAS, puedeInstalar } from '../data/tecnologias.js';
import { METODOS, DIAGNOSTICO, AVERIAS } from '../data/averias.js';
import { MOTORES } from '../data/motores.js';
import { azarDe, entre, entero, hash, generador, normal } from './azar.js';
import { climaEn, climaRuta, franja } from './clima.js';
import { evaluarTramo, evaluarRuta, pistaEfectiva } from './operaciones.js';
import { amenazas, estimar, simular, minimos, visibilidad, bandaGrave, bandaIncidencia } from './riesgo.js';
import { investigar } from './investigacion.js';
import {
  progresar, inspeccionar as inspeccionarAveria, diagnosticar as diagnosticarAveria, aplicarRevision,
  costeRevision, diasRevision, costeRG, alquilerMotor, diasTallerMotor, revisarMotor, diferir as diferirAveria,
  irregularidades, metodoDe, tipoDiagnostico, describir, revisionPendiente, TOLERANCIA,
} from './mantenimiento.js';
import { crearAvion, generarMercado, ofertaSegundaMano, valorMercado, costeReparacion, edad } from './flota.js';
import {
  demandaPropia, demandaPremium, precioBillete, costeVuelo, costeCatering, costeBaseDiario, administracionDiaria,
  tripulacionFijaDiaria, seguroDiario, pernocta, precioNuevo, indice, CAJA_INICIAL, INTERES_ANUAL, SERVICIOS,
} from './economia.js';
import { MIN_DIA, dia, hora, anio, anioDecimal, mes, textoFecha } from './tiempo.js';

export const VERSION = 2;
const PASO = 5;
const HORA_PRIMERA_SALIDA = 6;
const HORA_ULTIMA_SALIDA = 23;
const DIAS_INVESTIGACION = 30;
const LIMITE_ACTIVIDAD = 13;

// ---------------------------------------------------------------- partida

export function codigoDe(nombre) {
  const letras = nombre.normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase();
  return (letras + 'XX').slice(0, 2);
}

export function nuevaPartida({ nombre, base, semilla = Date.now() >>> 0 }) {
  const aeropuerto = POR_ID[base];
  const estado = {
    version: VERSION,
    semilla,
    azar: hash(semilla, 'partida'),
    t: 8 * 60,
    nombre,
    codigo: codigoDe(nombre),
    base,
    pais: aeropuerto.pais,
    caja: CAJA_INICIAL,
    prestamo: 0,
    reputacion: 50,
    aviones: [],
    rutas: [],
    mercado: [],
    mesMercado: 0,
    decisiones: [],
    accidentes: [],
    directivas: [],
    diario: [],
    demandaUsada: {},
    cuentas: { hoy: { ingresos: 0, gastos: 0 }, historial: [] },
    ajustes: { consulta: 'anormal', revisionesAuto: true },
    concordes: 0,
    siguienteId: 1,
    quiebra: false,
  };
  estado.mercado = generarMercado(estado, azarDe(estado), 1976, aeropuerto);
  apuntar(estado, `Se funda ${nombre} con base en ${aeropuerto.ciudad}.`, 'hito');
  return estado;
}

export function apuntar(estado, texto, tipo = 'info') {
  estado.diario.unshift({ t: estado.t, texto, tipo });
  if (estado.diario.length > 300) estado.diario.length = 300;
}

function gastar(estado, cantidad) {
  estado.caja -= cantidad;
  estado.cuentas.hoy.gastos += cantidad;
}

function ingresar(estado, cantidad) {
  estado.caja += cantidad;
  estado.cuentas.hoy.ingresos += cantidad;
}

const ajustarReputacion = (estado, delta) => {
  estado.reputacion = Math.max(0, Math.min(100, estado.reputacion + delta));
};

export const anioActual = (estado) => anio(estado.t);

export const limitePrestamo = (estado) =>
  Math.round((4e6 * indice(anio(estado.t)) + 0.3 * estado.aviones.reduce((s, a) => s + valorMercado(a, anio(estado.t)), 0)) / 1e5) * 1e5;

// ---------------------------------------------------------------- reloj

export function avanzar(estado, minutos) {
  const eventos = [];
  let restante = minutos;
  while (restante > 0 && !estado.decisiones.length && !estado.quiebra) {
    const antes = estado.t;
    estado.t += PASO;
    restante -= PASO;
    if (dia(antes) !== dia(estado.t)) finDeDia(estado, eventos);
    for (const a of [...estado.aviones]) actualizarAvion(estado, a, eventos);
  }
  return eventos;
}

function actualizarAvion(estado, a, eventos) {
  const t = estado.t;
  if (a.estado === 'vuelo') {
    if (a.vuelo.accidente && t >= a.vuelo.accidente.momento) estrellar(estado, a, eventos);
    else if (t >= a.vuelo.llegada) aterrizar(estado, a, eventos);
    return;
  }
  if (a.estado === 'taller') {
    if (t >= a.libreEn) salirDelTaller(estado, a, eventos);
    return;
  }
  if (a.estado === 'tierra') revisionNocturna(estado, a);
  if (a.estado !== 'tierra' || t < a.libreEn) return;

  if (a.lugar === estado.base && a.tareas.length) {
    entrarEnTaller(estado, a, eventos);
    return;
  }
  const ruta = estado.rutas.find((r) => r.id === a.ruta);
  let destino = null;
  if (a.lugar !== estado.base) destino = estado.base;
  else if (ruta) {
    const salida = siguienteSalida(ruta, t);
    if (salida > t) {
      a.libreEn = salida;
      return;
    }
    destino = ruta.destino;
  }
  if (!destino) return;

  const h = hora(t);
  if (h < HORA_PRIMERA_SALIDA || h >= HORA_ULTIMA_SALIDA) {
    a.libreEn = dia(t) * MIN_DIA + (h >= HORA_ULTIMA_SALIDA ? MIN_DIA : 0) + HORA_PRIMERA_SALIDA * 60;
    return;
  }
  prepararSalida(estado, a, destino, eventos);
}

// La revisión A se hace de noche, en cuanto el avión para: en la base con tu personal y fuera
// con mantenimiento contratado, que sale más caro.
function revisionNocturna(estado, a) {
  if (!estado.ajustes.revisionesAuto) return;
  const h = hora(estado.t);
  if (h >= 5 && h < 23) return;
  if (a.revisionNoche === dia(estado.t - 6 * 60) || revisionPendiente(a).A < 0.6) return;
  a.revisionNoche = dia(estado.t - 6 * 60);
  const n = anio(estado.t);
  const fuera = a.lugar !== estado.base;
  const coste = costeRevision(a, 'A', n) * (fuera ? 1.5 : 1);
  const res = aplicarRevision(a, 'A', n);
  gastar(estado, coste + res.reparaciones);
  a.libreEn = Math.max(a.libreEn, dia(estado.t + 6 * 60) * MIN_DIA + HORA_PRIMERA_SALIDA * 60);
  if (res.hallazgos.length) apuntar(estado, `Revisión A del ${a.matricula}${fuera ? ` en ${a.lugar}` : ''}: ${res.hallazgos.join('; ')}.`, 'info');
}

// ---------------------------------------------------------------- rutas y horarios

// Salidas desde la base repartidas entre las 7:00 y las 22:00. Si vas tarde, sale ya.
export function horariosRuta(ruta) {
  const hueco = Math.floor((15 * 60) / ruta.frecuencia);
  return Array.from({ length: ruta.frecuencia }, (_, k) => 7 * 60 + k * hueco);
}

function siguienteSalida(ruta, t) {
  const hoy = dia(t);
  const hechas = ruta.salidas.dia === hoy ? ruta.salidas.hechas : 0;
  const horarios = horariosRuta(ruta);
  if (hechas >= horarios.length) return (hoy + 1) * MIN_DIA + horarios[0];
  return hoy * MIN_DIA + horarios[hechas];
}

function registrarSalida(estado, ruta) {
  const hoy = dia(estado.t);
  if (ruta.salidas.dia !== hoy) ruta.salidas = { dia: hoy, hechas: 0 };
  ruta.salidas.hechas++;
}

function rutaDelTramo(estado, o, d) {
  return estado.rutas.find((r) => (r.origen === o && r.destino === d) || (r.origen === d && r.destino === o));
}

export function numeroVuelo(estado, ruta, haciaBase) {
  if (!ruta) return `${estado.codigo} 900`;
  return `${estado.codigo} ${ruta.numero + (haciaBase ? 1 : 0)}`;
}

// ---------------------------------------------------------------- tripulación

// Cada avión tiene dos tripulaciones: una de mañana (salidas antes de las 14:00) y otra de
// tarde. La actividad cuenta desde una hora antes de su primera salida del día.
function jornadaAlLlegar(a, salida, llegada) {
  const turno = hora(salida) < 14 ? 'manana' : 'tarde';
  const hoy = dia(salida);
  const t = a.turnos?.[turno];
  const inicio = t && t.dia === hoy ? t.inicio : salida;
  return { turno, inicio, horas: (llegada - inicio) / 60 + 1 };
}

// ---------------------------------------------------------------- previsión

// La previsión acierta casi siempre, pero no siempre: a veces el tiempo real es un grado
// mejor o peor.
function prevision(climaReal, semilla, clave) {
  const r = generador(hash(semilla, 'prevision', clave));
  if (r() > 0.2 || climaReal.tipo === 'despejado') return climaReal;
  const sev = Math.max(1, Math.min(3, climaReal.sev + (r() < 0.5 ? -1 : 1)));
  return { ...climaReal, sev };
}

// ---------------------------------------------------------------- vuelos

// Todo lo que hace falta para decidir y simular un tramo.
export function contextoVuelo(estado, a, destinoId, combustibleExtra = false) {
  const tipo = TIPOS[a.tipo];
  const origen = POR_ID[a.lugar];
  const destino = POR_ID[destinoId];
  const anioDec = anioDecimal(estado.t);
  const n = Math.floor(anioDec);
  const tramo = evaluarTramo(tipo.id, origen.id, destino.id, anioDec);
  const duracion = tramo.duracion;
  const llegada = estado.t + duracion;
  const real = {
    origen: climaEn(origen, estado.t, estado.semilla),
    destino: climaEn(destino, llegada, estado.semilla),
    ruta: climaRuta(origen, destino, estado.t, estado.semilla, tramo.distancia),
  };
  const clave = `${a.id}-${franja(estado.t)}`;
  const previsto = {
    origen: real.origen,
    destino: prevision(real.destino, estado.semilla, `${clave}-d`),
    ruta: prevision(real.ruta, estado.semilla, `${clave}-r`),
  };
  const jornada = jornadaAlLlegar(a, estado.t, llegada);
  const hLlegada = hora(llegada);
  const irreg = irregularidades(a, estado.t).concat(directivasPendientes(estado, a));
  if (jornada.horas > LIMITE_ACTIVIDAD) irreg.push({ codigo: 'actividad', texto: `Tripulación por encima del límite de actividad (${jornada.horas.toFixed(1)} h)` });
  if (visibilidad(previsto.destino) < minimos(destino, tipo)) irreg.push({ codigo: 'minimos', texto: `Previsión en ${destino.id} por debajo de los mínimos de aproximación` });
  return {
    avion: a, tipo, origen, destino, anio: anioDec, t: estado.t, tramo, duracion, llegada,
    clima: real, prevision: previsto, combustibleExtra,
    jornada: jornada.horas, turno: jornada,
    noche: hLlegada < 6 || hLlegada >= 23,
    cargaPorPista: tramo.plazasMax / tipo.plazas,
    pistaDestino: pistaEfectiva(destino, n),
    irregularidades: irreg,
    despachoIrregular: irreg.length > 0,
  };
}

function datosComerciales(estado, a, ctx) {
  const { tipo, origen, destino, tramo } = ctx;
  if (ctx.traslado) {
    const n = anio(estado.t);
    const coste = costeVuelo({ tipo, horas: ctx.duracion / 60, origen, destino, pax: 0, ingreso: 0, anio: n, combustibleExtra: ctx.combustibleExtra });
    return { ruta: null, pax: 0, ingreso: 0, coste: coste.total, desglose: coste.desglose, clave: null, precio: 0 };
  }
  const n = anio(estado.t);
  const ruta = rutaDelTramo(estado, origen.id, destino.id);
  const tarifa = ruta?.tarifa ?? 'normal';
  const servicio = ruta?.servicio ?? 'estandar';
  const supersonico = tipo.clase === 'supersonico';
  const horas = ctx.duracion / 60;
  const precio = precioBillete(tramo.distancia, tarifa, n, supersonico);
  const clave = `${dia(estado.t)}:${origen.id}-${destino.id}`;
  const demanda = supersonico
    ? demandaPremium(origen, destino, estado.t) * (estado.reputacion / 50)
    : demandaPropia(origen, destino, estado.t, estado.reputacion, tarifa, servicio, horas);
  const libre = Math.max(0, demanda - (estado.demandaUsada[clave] ?? 0));
  const r = generador(hash(estado.semilla, 'pax', a.id, estado.t));
  const pax = Math.max(0, Math.min(tramo.plazasMax, Math.round(libre * entre(r, 0.85, 1.15))));
  const ingreso = pax * precio;
  // El catering se carga en el aeropuerto de salida, o en la base para ida y vuelta.
  const abastece = ruta?.cateringBase && horas <= 3 ? POR_ID[estado.base] : origen;
  const salidasAlli = estado.rutas.filter((x) => x.avion && (x.origen === abastece.id || x.destino === abastece.id)).reduce((s, x) => s + x.frecuencia, 0);
  const catering = pax * costeCatering(servicio, horas, abastece, salidasAlli, n, supersonico) * (ruta?.cateringBase && abastece.id !== origen.id ? 1.1 : 1);
  const coste = costeVuelo({ tipo, horas, origen, destino, pax, ingreso, anio: n, combustibleExtra: ctx.combustibleExtra, catering });
  return { ruta, pax, ingreso, coste: coste.total, desglose: coste.desglose, clave, precio };
}

function debePreguntar(estado, ctx, est) {
  const modo = estado.ajustes.consulta;
  if (modo === 'siempre') return true;
  // Lo que está fuera de norma por el avión o la tripulación lo decides siempre tú. Si solo es
  // el tiempo, en modo «nunca» el despachador retiene el vuelo por su cuenta.
  if (modo === 'nunca') return ctx.irregularidades.some((x) => x.codigo !== 'minimos');
  const conocidas = ctx.avion.averias.some((x) => x.fase !== 'oculta');
  if (modo === 'serio') return ctx.despachoIrregular || est.pAccidente >= 0.002;
  return ctx.despachoIrregular || conocidas || est.pIncidencia >= 0.08 || est.pAccidente >= 0.0005;
}

function prepararSalida(estado, a, destino, eventos) {
  const ctx = contextoVuelo(estado, a, destino);
  if (!ctx.tramo.posible) {
    // No puede volar este tramo (por ejemplo, la pista ha cambiado): se queda en tierra.
    a.libreEn = estado.t + 6 * 60;
    if (a.avisoNoPuede !== dia(estado.t)) {
      a.avisoNoPuede = dia(estado.t);
      apuntar(estado, `${a.matricula} no puede volar ${ctx.origen.id}–${ctx.destino.id}: ${ctx.tramo.motivo}.`, 'aviso');
      eventos.push({ tipo: 'aviso', grave: true, texto: `${a.matricula} no puede volar a ${destino}` });
    }
    return;
  }
  const ruido = normal(generador(hash(estado.semilla, 'estimacion', a.id, estado.t)));
  const est = estimar(ctx, ruido);
  if (debePreguntar(estado, ctx, est)) {
    a.estado = 'esperando';
    const decision = { id: estado.siguienteId++, avion: a.id, origen: a.lugar, destino, t: estado.t, ruido };
    estado.decisiones.push(decision);
    eventos.push({ tipo: 'decision', decision });
    return;
  }
  // Decide el despachador: no firma nada fuera de norma y, si el tiempo en destino anda cerca
  // del límite, carga combustible para esperar o desviarse.
  if (ctx.despachoIrregular) {
    retener(estado, a, ctx);
    return;
  }
  const margen = est.lista.some((e) => e.origen === 'meteo' && e.p >= 0.1);
  despegar(estado, a, margen ? contextoVuelo(estado, a, destino, true) : ctx, { manual: false });
}

// Con la previsión por debajo de mínimos el despachador retrasa la salida dos horas; si a la
// tercera sigue igual, cancela.
function retener(estado, a, ctx) {
  const ruta = rutaDelTramo(estado, ctx.origen.id, ctx.destino.id);
  const numero = numeroVuelo(estado, ruta, ctx.destino.id === estado.base);
  a.retenido = (a.retenido ?? 0) + 1;
  if (a.retenido <= 3) {
    a.libreEn = estado.t + 120;
    apuntar(estado, `${numero} retenido dos horas: ${ctx.irregularidades[0].texto.toLowerCase()}.`, 'info');
    return;
  }
  cancelarVuelo(estado, a, ctx.origen.id, ctx.destino.id);
}

function cancelarVuelo(estado, a, origen, destino) {
  const ruta = rutaDelTramo(estado, origen, destino);
  const numero = numeroVuelo(estado, ruta, destino === estado.base);
  if (ruta && origen === estado.base) registrarSalida(estado, ruta);
  a.retenido = 0;
  a.libreEn = estado.t + (origen === estado.base ? 30 : 180);
  const com = datosComerciales(estado, a, contextoVuelo(estado, a, destino));
  gastar(estado, Math.round(com.ingreso * 0.1));
  ajustarReputacion(estado, -0.8);
  apuntar(estado, `${numero} cancelado. Se reubica a los pasajeros.`, 'info');
}

// Todo lo que la hoja de despacho necesita enseñar sobre una decisión pendiente.
export function informeDespacho(estado, decision) {
  const a = estado.aviones.find((x) => x.id === decision.avion);
  const ctx = contextoVuelo(estado, a, decision.destino);
  const est = estimar(ctx, decision.ruido);
  const ctxExtra = contextoVuelo(estado, a, decision.destino, true);
  const estExtra = estimar(ctxExtra, decision.ruido);
  const com = datosComerciales(estado, a, ctx);
  const comExtra = datosComerciales(estado, a, ctxExtra);
  return {
    avion: a, ctx, est, estExtra, com,
    traslado: puedeTrasladar(estado, a, ctx),
    taller: puedeIrAlTaller(estado, a, ctx),
    numero: numeroVuelo(estado, com.ruta, decision.destino === estado.base),
    costeExtra: comExtra.coste - com.coste,
    compensacion: Math.round(com.ingreso * 0.1),
    incidencia: bandaIncidencia(est.pIncidencia),
    grave: bandaGrave(est.pAccidente),
    graveExtra: bandaGrave(estExtra.pAccidente),
  };
}

// Punto de observación para las herramientas de calibración: si se le asigna una función, la
// llama en cada despegue con el contexto y la simulación del vuelo.
export const sondas = { despegue: null };

function despegar(estado, a, ctx, { manual }) {
  const r = azarDe(estado);
  a.retenido = 0;
  const com = datosComerciales(estado, a, ctx);
  const sim = simular(ctx, r);
  sondas.despegue?.(ctx, sim, { manual });
  if (com.clave) estado.demandaUsada[com.clave] = (estado.demandaUsada[com.clave] ?? 0) + com.pax;
  if (com.ruta && a.lugar === estado.base) registrarSalida(estado, com.ruta);
  const turno = ctx.turno;
  a.turnos = { ...(a.turnos ?? {}), [turno.turno]: { dia: dia(estado.t), inicio: turno.inicio } };

  // Retrasos por esperas y desvíos.
  let retraso = 0;
  for (const e of sim.eventos) {
    if (e.id === 'bajoMinimos' && !e.continua) retraso += e.desvia ? 150 : 45;
    if (e.id === 'tormentaDestino') retraso += r() < 0.4 ? 150 : 40;
    if (e.id === 'cercaMinimos' || e.id === 'errorTripulacion' || e.id === 'vientoCruzado') retraso += 15;
  }
  const salida = estado.t;
  const llegada = salida + ctx.duracion + retraso;
  let accidente = null;
  if (sim.accidente) {
    const e = sim.evento;
    const enTierra = e.escena === 'pista' || e.escena === 'aproximacion';
    const momento = enTierra ? llegada - 3 : salida + Math.min(25, Math.round(ctx.duracion * (e.id.includes('Crucero') || e.id === 'estructura' || e.id === 'turbulencia' || e.id === 'presurizacion' || e.id === 'conflicto' ? 0.5 : 0.1)));
    accidente = { evento: e, momento };
  }
  a.estado = 'vuelo';
  a.vuelo = {
    origen: a.lugar,
    destino: ctx.destino.id,
    numero: ctx.traslado ? `${estado.codigo} 990` : numeroVuelo(estado, com.ruta, ctx.destino.id === estado.base),
    salida,
    llegada,
    retraso,
    traslado: ctx.traslado ?? false,
    extra: ctx.combustibleExtra,
    pax: com.pax,
    ingreso: com.ingreso,
    coste: com.coste,
    eventos: sim.eventos.map((e) => ({ id: e.id, motor: e.motor ?? null, averia: e.averia ?? null, continua: e.continua ?? false, desvia: e.desvia ?? false, motivo: e.motivo ?? null })),
    accidente,
    manual,
    irregular: ctx.despachoIrregular,
  };
  if (ctx.despachoIrregular) inspeccionEnRampa(estado, a, ctx);
}

// Un despacho fuera de norma puede acabar en una inspección de la autoridad.
function inspeccionEnRampa(estado, a, ctx) {
  const r = azarDe(estado);
  if (r() >= 0.05) return;
  const multa = Math.round(50e3 * indice(anio(estado.t)));
  gastar(estado, multa);
  ajustarReputacion(estado, -2);
  apuntar(estado, `Inspección de la autoridad en ${ctx.origen.ciudad}: ${ctx.irregularidades[0].texto.toLowerCase()}. Multa de ${multa.toLocaleString('es-ES')} $.`, 'grave');
}

const TEXTO_INCIDENTE = {
  apagadoDespegue: (v, e) => `${v.numero}: el motor ${e.motor ?? ''} se para en el despegue. La tripulación vuelve a ${v.origen}.`,
  apagadoCrucero: (v, e) => `${v.numero}: motor ${e.motor ?? ''} apagado en vuelo. Llega a ${v.destino} con el resto de motores.`,
  apagadoAproximacion: (v, e) => `${v.numero}: el motor ${e.motor ?? ''} se para en la aproximación. Aterriza sin más daños.`,
  apagadoSinAviso: (v) => `${v.numero}: un motor se para en vuelo sin aviso previo. Aterrizaje de precaución.`,
  noContenido: (v, e) => `${v.numero}: fallo no contenido del motor ${e.motor ?? ''}. Aterrizaje de emergencia; el motor queda destrozado.`,
  incendio: (v, e) => `${v.numero}: incendio en el motor ${e.motor ?? ''}, extinguido en vuelo. Aterrizaje de emergencia.`,
  estructura: (v) => `${v.numero}: descompresión en crucero por un fallo estructural. Descenso de emergencia; el avión queda inmovilizado.`,
  hidraulico: (v) => `${v.numero}: pierde un sistema hidráulico. Aterrizaje de emergencia sin heridos.`,
  tren: (v) => `${v.numero}: el tren cede al aterrizar en ${v.destino}. Evacuación sin heridos graves; daños importantes.`,
  presurizacion: (v) => `${v.numero}: problema de presurización. Descenso de emergencia y desvío.`,
  reventon: (v) => `${v.numero}: revienta un neumático en el despegue. Vuelve a ${v.origen} para revisar daños.`,
  ave: (v) => `${v.numero}: impacto con aves en el despegue. Vuelve a ${v.origen} por precaución.`,
  cizalladura: (v) => `${v.numero}: cizalladura en la aproximación a ${v.destino}. Motor y al aire; aterriza en el segundo intento.`,
  cizalladuraDespegue: (v) => `${v.numero}: cizalladura al despegar de ${v.origen}. La tripulación lo saca adelante con potencia máxima.`,
  salidaPista: (v) => `${v.numero}: se sale de la pista a baja velocidad en ${v.destino}. Daños en el tren, ningún herido.`,
  turbulencia: (v) => `${v.numero}: turbulencia severa dentro de una tormenta. Varios pasajeros heridos leves.`,
  hielo: (v) => `${v.numero}: despegue abortado por hielo en las alas. Nuevo deshielo y retraso.`,
  conflicto: (v) => `${v.numero}: pérdida de separación con otro avión. El control lo resuelve a tiempo; se abre un informe.`,
  mandos: (v) => `${v.numero}: los mandos de vuelo responden mal (un cable destensado que un mantenimiento al día habría visto). Aterrizaje de emergencia en ${v.destino}.`,
};

function aterrizar(estado, a, eventos) {
  const v = a.vuelo;
  const tipo = TIPOS[a.tipo];
  const r = azarDe(estado);
  const n = anio(estado.t);
  const horas = (v.llegada - v.salida - v.retraso) / 60;
  let ingreso = v.ingreso;
  let coste = v.coste;
  let inmovilizado = 0;
  let reputacion = 0.03;
  const destino = POR_ID[v.destino];
  a.lugar = v.destino;
  a.estado = 'tierra';
  a.libreEn = estado.t + (tipo.config.motores === 'helices-ala' ? 35 : 45);
  for (const ev of progresar(estado, a, { horas, ciclos: 1 }, r)) eventos.push(ev);

  for (const e of v.eventos) {
    const texto = TEXTO_INCIDENTE[e.id]?.(v, e);
    if (e.id === 'bajoMinimos' && !e.continua) {
      if (e.desvia) {
        coste += Math.round(v.coste * 0.3 + v.pax * 20 * indice(n));
        ingreso = Math.round(ingreso * 0.9);
        reputacion -= 0.4;
        apuntar(estado, `${v.numero} se desvía: ${e.motivo}. Llega con dos horas y media de retraso.`, 'aviso');
        eventos.push({ tipo: 'aviso', texto: `${v.numero} desviado: ${e.motivo}` });
      } else {
        apuntar(estado, `${v.numero} espera en circuito: ${e.motivo}. Aterriza cuando mejora.`, 'info');
      }
      continue;
    }
    if (e.id === 'tormentaDestino') {
      apuntar(estado, `${v.numero}: espera por tormenta en ${v.destino}.`, 'info');
      continue;
    }
    if (!texto) continue;
    a.stats.incidentes++;
    const grave = ['noContenido', 'incendio', 'estructura', 'tren', 'turbulencia', 'salidaPista', 'mandos'].includes(e.id);
    reputacion -= grave ? 3 : 1;
    if (e.averia) {
      const av = a.averias.find((x) => x.id === e.averia);
      if (av) {
        av.fase = 'confirmada';
        av.diagnostico = { fueraDeLimites: true };
      }
    }
    if (e.id.startsWith('apagado') || e.id === 'noContenido' || e.id === 'incendio') {
      // El motor afectado necesita una revisión general: se cambia por uno de alquiler.
      const pos = e.motor ?? 1;
      const extra = e.id === 'noContenido' ? 1.5 : 1;
      coste += Math.round(costeRG(a, n) * extra + alquilerMotor(a, n) + 15e3 * indice(n));
      revisarMotor(a, pos);
      inmovilizado = Math.max(inmovilizado, e.id === 'noContenido' ? 5 * 24 : 48);
    } else if (e.id === 'estructura') {
      coste += Math.round(precioNuevo(tipo, n) * 0.05);
      inmovilizado = Math.max(inmovilizado, 20 * 24);
      a.averias = a.averias.filter((x) => x.id !== e.averia);
    } else if (e.id === 'tren' || e.id === 'salidaPista') {
      coste += Math.round(precioNuevo(tipo, n) * (e.id === 'tren' ? 0.03 : 0.01));
      inmovilizado = Math.max(inmovilizado, (e.id === 'tren' ? 15 : 7) * 24);
      a.averias = a.averias.filter((x) => x.id !== e.averia);
    } else if (e.id === 'hidraulico' || e.id === 'presurizacion' || e.id === 'reventon') {
      coste += e.averia ? costeReparacion(a, a.averias.find((x) => x.id === e.averia) ?? { codigo: e.id === 'hidraulico' ? 'bomba' : e.id === 'reventon' ? 'neumatico' : 'presurizacion' }, n) : 0;
      a.averias = a.averias.filter((x) => x.id !== e.averia);
      inmovilizado = Math.max(inmovilizado, 24);
    } else if (e.id === 'mandos') {
      coste += Math.round(precioNuevo(tipo, n) * 0.002);
      inmovilizado = Math.max(inmovilizado, 72);
    } else if (e.id === 'turbulencia') {
      const heridos = entero(r, 1, 8);
      coste += Math.round(heridos * 5000 * indice(n));
    }
    apuntar(estado, texto, grave ? 'grave' : 'aviso');
    eventos.push({ tipo: 'aviso', grave, texto });
  }

  ajustarReputacion(estado, reputacion + (v.retraso > 60 ? -0.1 : 0));
  const ruta = v.traslado ? null : rutaDelTramo(estado, v.origen, v.destino);
  if (v.traslado) apuntar(estado, `${a.matricula} llega a ${v.destino} en vuelo de traslado.`, 'info');
  if (ruta) ajustarReputacion(estado, SERVICIOS[ruta.servicio ?? 'estandar'].reputacion);
  ingresar(estado, ingreso);
  gastar(estado, coste);
  a.stats.vuelos++;
  a.stats.beneficio += ingreso - coste;
  if (ruta) {
    ruta.stats.vuelos++;
    ruta.stats.pax += v.pax;
    ruta.stats.plazas += TIPOS[a.tipo].plazas;
    ruta.stats.beneficio += ingreso - coste;
    ruta.stats.retraso += v.retraso;
  }
  if (inmovilizado) {
    a.estado = 'taller';
    a.libreEn = estado.t + inmovilizado * 60;
    a.tareas = a.tareas.filter((t) => t.tipo !== 'motor');
  }
  a.vuelo = null;
  eventos.push({ tipo: 'aterrizaje', avion: a.id });
}

const DESCRIPCION_ACCIDENTE = {
  pista: 'se ha salido de la pista al aterrizar',
  aproximacion: 'se ha estrellado durante la aproximación',
  vuelo: 'se ha estrellado',
};

function estrellar(estado, a, eventos) {
  const v = a.vuelo;
  const tipo = TIPOS[a.tipo];
  const r = azarDe(estado);
  const evento = v.accidente.evento;
  const escena = evento.escena;
  const tripulantes = v.traslado ? tipo.tecnica : tripulacion(tipo);
  const ocupantes = v.pax + tripulantes;
  let fallecidos;
  if (escena === 'pista') fallecidos = Math.round(ocupantes * entre(r, 0, 0.25));
  else if (escena === 'aproximacion') fallecidos = Math.round(ocupantes * entre(r, 0.85, 1));
  else fallecidos = Math.round(ocupantes * entre(r, 0.6, 1));
  const resto = ocupantes - fallecidos;
  const heridos = escena === 'pista' ? Math.round(resto * entre(r, 0.3, 0.7)) : resto;
  const enDespegue = ['apagadoDespegue', 'reventon', 'hielo', 'ave', 'cizalladuraDespegue'].includes(evento.id);
  const lugar = escena === 'vuelo' ? (enDespegue ? v.origen : null) : v.destino;

  // La investigación se hace con el estado del avión en el momento del accidente.
  const ctx = contextoVuelo({ ...estado, t: v.salida }, { ...a, lugar: v.origen, estado: 'tierra' }, v.destino, v.extra ?? false);
  ctx.despachoIrregular = v.irregular;
  if (v.traslado) ctx.irregularidades = ctx.irregularidades.filter((x) => !MANTENIMIENTO.has(x.codigo));
  const informe = investigar(ctx, evento);

  const accidente = {
    id: estado.siguienteId++,
    t: estado.t,
    numero: v.numero,
    matricula: a.matricula,
    tipo: a.tipo,
    config: tipo.config,
    origen: v.origen,
    destino: v.destino,
    lugar: lugar ?? v.origen,
    enRuta: !lugar,
    escena,
    evento: evento.id,
    descripcion: lugar ? DESCRIPCION_ACCIDENTE[escena] : 'se ha estrellado en ruta',
    pax: v.pax,
    tripulantes,
    fallecidos,
    heridos,
    valorAvion: Math.round(valorMercado(a, anio(estado.t))),
    principal: informe.causa,
    factores: informe.factores,
    motivos: informe.motivos,
    negligencia: informe.negligencia,
    directiva: informe.directiva,
    investigacionEn: estado.t + DIAS_INVESTIGACION * MIN_DIA,
    cerrado: false,
  };
  estado.accidentes.unshift(accidente);
  gastar(estado, v.coste);
  ajustarReputacion(estado, -30);
  estado.aviones = estado.aviones.filter((x) => x.id !== a.id);
  for (const ruta of estado.rutas) if (ruta.avion === a.id) ruta.avion = null;
  const ap = POR_ID[accidente.lugar];
  apuntar(estado, `ACCIDENTE. El ${tipo.corto} ${a.matricula} (${v.numero}) ${accidente.descripcion}${accidente.enRuta ? '' : ` en ${ap.ciudad}`}. ${fallecidos} fallecidos y ${heridos} heridos.`, 'accidente');
  eventos.push({ tipo: 'accidente', accidente });
}

// ---------------------------------------------------------------- decisiones

export const OPCIONES = ['despegar', 'extra', 'retrasar', 'cancelar', 'traslado', 'taller'];

// Irregularidades del avión que un permiso especial de vuelo deja resolver llevándolo sin
// pasaje a la base, donde está el taller.
const MANTENIMIENTO = new Set(['revisionA', 'revisionC', 'revisionD', 'motorRG', 'mel', 'equipo', 'noApto', 'directiva']);

export function puedeTrasladar(estado, a, ctx) {
  return a.lugar !== estado.base && ctx.destino.id === estado.base && ctx.irregularidades.some((x) => MANTENIMIENTO.has(x.codigo));
}

export function puedeIrAlTaller(estado, a, ctx) {
  return a.lugar === estado.base && ctx.irregularidades.some((x) => MANTENIMIENTO.has(x.codigo));
}

// Encarga al taller lo que hace falta para que el avión vuelva a ser legal.
function encargarLoPendiente(estado, a) {
  const tipo = TIPOS[a.tipo];
  const prog = programa(tipo);
  const motor = MOTORES[tipo.motor];
  for (const nivel of ['D', 'C', 'A']) {
    if (a.revisiones[nivel] > prog[nivel].horas * TOLERANCIA) { pedirRevision(estado, a.id, nivel); break; }
  }
  for (const m of a.motores) if (m.horasRG > motor.intervalo * TOLERANCIA) pedirMotor(estado, a.id, m.pos, true);
  for (const x of a.averias) {
    const caducada = x.fase === 'diferida' && estado.t > x.diferidaHasta;
    const pendiente = x.fase === 'confirmada' && (x.equipo || x.diagnostico?.fueraDeLimites);
    if (caducada || pendiente) pedirReparacion(estado, a.id, x.id);
  }
  for (const d of estado.directivas ?? []) {
    if (d.tipo === a.tipo && !d.hechas.includes(a.id) && estado.t > d.hasta) pedirDirectiva(estado, a.id, d.id);
  }
}

function contextoTraslado(estado, a, destino) {
  const ctx = contextoVuelo(estado, a, destino);
  ctx.traslado = true;
  ctx.irregularidades = ctx.irregularidades.filter((x) => !MANTENIMIENTO.has(x.codigo));
  ctx.despachoIrregular = ctx.irregularidades.length > 0;
  return ctx;
}

export function decidir(estado, idDecision, opcion) {
  const i = estado.decisiones.findIndex((x) => x.id === idDecision);
  if (i < 0) return;
  const dec = estado.decisiones[i];
  estado.decisiones.splice(i, 1);
  const a = estado.aviones.find((x) => x.id === dec.avion);
  if (!a) return;
  a.estado = 'tierra';
  const ruta = rutaDelTramo(estado, dec.origen, dec.destino);
  const numero = numeroVuelo(estado, ruta, dec.destino === estado.base);
  if (opcion === 'retrasar') {
    a.libreEn = estado.t + 120;
    apuntar(estado, `${numero} se retrasa dos horas.`, 'info');
    return;
  }
  if (opcion === 'cancelar') {
    cancelarVuelo(estado, a, dec.origen, dec.destino);
    return;
  }
  if (opcion === 'taller') {
    cancelarVuelo(estado, a, dec.origen, dec.destino);
    encargarLoPendiente(estado, a);
    a.libreEn = estado.t;
    return;
  }
  if (opcion === 'traslado') {
    const ctx = contextoVuelo(estado, a, dec.destino);
    if (!puedeTrasladar(estado, a, ctx)) return;
    gastar(estado, Math.round(datosComerciales(estado, a, ctx).ingreso * 0.1));
    ajustarReputacion(estado, -0.8);
    apuntar(estado, `${numero} cancelado: el ${a.matricula} vuelve sin pasaje a la base con un permiso especial de vuelo.`, 'aviso');
    despegar(estado, a, contextoTraslado(estado, a, dec.destino), { manual: true });
    return;
  }
  const ctx = contextoVuelo(estado, a, dec.destino, opcion === 'extra');
  despegar(estado, a, ctx, { manual: true });
}

// ---------------------------------------------------------------- fin de día

function finDeDia(estado, eventos) {
  const base = POR_ID[estado.base];
  const n = anio(estado.t);
  const r = azarDe(estado);
  gastar(estado, costeBaseDiario(base, n));
  for (const a of estado.aviones) {
    const tipo = TIPOS[a.tipo];
    gastar(estado, administracionDiaria(tipo, n) + tripulacionFijaDiaria(tipo, n) + seguroDiario(valorMercado(a, n)));
    if (a.lugar !== estado.base && a.estado !== 'vuelo') gastar(estado, pernocta(tipo, POR_ID[a.lugar], n));
    a.horasHoy = 0;
    for (const ev of progresar(estado, a, { dias: 1 }, r)) eventos.push(ev);
  }
  if (estado.prestamo > 0) gastar(estado, (estado.prestamo * INTERES_ANUAL) / 365);
  ajustarReputacion(estado, (50 - estado.reputacion) * 0.01);

  const hoy = dia(estado.t);
  for (const k of Object.keys(estado.demandaUsada)) {
    if (Number(k.split(':')[0]) < hoy) delete estado.demandaUsada[k];
  }

  for (const acc of estado.accidentes) {
    if (!acc.cerrado && estado.t >= acc.investigacionEn) cerrarInvestigacion(estado, acc, eventos);
  }

  if (mes(estado.t) !== estado.mesMercado) {
    estado.mesMercado = mes(estado.t);
    renovarMercado(estado);
  }

  estado.cuentas.historial.push({ dia: hoy - 1, ...estado.cuentas.hoy });
  if (estado.cuentas.historial.length > 90) estado.cuentas.historial.shift();
  estado.cuentas.hoy = { ingresos: 0, gastos: 0 };

  if (textoFecha(estado.t).startsWith('1 de enero')) {
    apuntar(estado, `Empieza ${n}.`, 'hito');
    eventos.push({ tipo: 'aviso', texto: `Feliz ${n}` });
  }

  if (estado.caja < 0) {
    const falta = Math.ceil((-estado.caja + 100000) / 1e5) * 1e5;
    if (estado.prestamo + falta <= limitePrestamo(estado)) {
      estado.prestamo += falta;
      estado.caja += falta;
      apuntar(estado, `Números rojos. El banco te adelanta ${falta.toLocaleString('es-ES')} $ más de préstamo.`, 'aviso');
      eventos.push({ tipo: 'aviso', grave: true, texto: 'El banco cubre tus números rojos' });
    } else {
      estado.quiebra = true;
      apuntar(estado, `${estado.nombre} se declara en quiebra.`, 'accidente');
      eventos.push({ tipo: 'quiebra' });
    }
  }
}

function cerrarInvestigacion(estado, acc, eventos) {
  acc.cerrado = true;
  const n = anio(estado.t);
  const indemnizaciones = Math.round((acc.fallecidos * 75000 + acc.heridos * 15000) * indice(n));
  if (acc.negligencia) {
    acc.multa = Math.round(250000 * indice(n));
    acc.pagaSeguro = 0;
    gastar(estado, indemnizaciones + acc.multa);
    ajustarReputacion(estado, -10);
  } else {
    acc.multa = 0;
    acc.pagaSeguro = Math.round(acc.valorAvion * 0.7 + indemnizaciones * 0.8);
    gastar(estado, indemnizaciones);
    ingresar(estado, acc.pagaSeguro);
  }
  acc.indemnizaciones = indemnizaciones;
  if (acc.directiva) {
    estado.directivas.push({ id: estado.siguienteId++, tipo: acc.directiva.tipo, texto: acc.directiva.texto, hasta: estado.t + acc.directiva.dias * MIN_DIA, hechas: [] });
    apuntar(estado, acc.directiva.texto, 'aviso');
  }
  apuntar(estado, `Concluye la investigación del ${acc.numero}: ${acc.negligencia ? 'hay negligencia de la compañía' : 'no hay negligencia de la compañía'}.`, acc.negligencia ? 'accidente' : 'info');
  eventos.push({ tipo: 'investigacion', accidente: acc });
}

function directivasPendientes(estado, a) {
  return (estado.directivas ?? [])
    .filter((d) => d.tipo === a.tipo && !d.hechas.includes(a.id) && estado.t > d.hasta)
    .map((d) => ({ codigo: 'directiva', texto: `Directiva de aeronavegabilidad sin cumplir: ${d.texto}` }));
}

function renovarMercado(estado) {
  const r = azarDe(estado);
  const n = anio(estado.t);
  const quedan = estado.mercado.filter((o) => o.inspeccion || r() < 0.5).slice(0, 4);
  while (quedan.length < 6) quedan.push(ofertaSegundaMano(estado, r, n, POR_ID[estado.base]));
  estado.mercado = quedan;
}

// ---------------------------------------------------------------- taller

export function tareasPendientes(a) {
  return a.tareas;
}

function horasTarea(estado, a, tarea) {
  switch (tarea.tipo) {
    case 'inspeccion': return METODOS[tarea.metodo].horas;
    case 'diagnostico': return DIAGNOSTICO[tarea.clase].horas;
    case 'reparacion': return tarea.horas;
    case 'revision': return diasRevision(a, tarea.nivel) * 24;
    case 'motor': return tarea.alquiler ? 24 : diasTallerMotor(a) * 24;
    case 'retrofit': return TECNOLOGIAS[tarea.tecnologia].retrofit.dias * 24;
    case 'directiva': return 24;
    default: return 0;
  }
}

function entrarEnTaller(estado, a, eventos) {
  const horas = a.tareas.reduce((s, t) => s + horasTarea(estado, a, t), 0);
  a.estado = 'taller';
  a.libreEn = estado.t + Math.max(1, horas) * 60;
  apuntar(estado, `El ${a.matricula} entra en el taller (${horas >= 48 ? `${Math.round(horas / 24)} días` : `${Math.round(horas)} h`}).`);
}

function salirDelTaller(estado, a, eventos) {
  a.estado = 'tierra';
  const n = anio(estado.t);
  const notas = [];
  for (const tarea of a.tareas) {
    const averia = a.averias.find((x) => x.id === tarea.averia);
    if (tarea.tipo === 'inspeccion' && averia) {
      const res = inspeccionarAveria(a, averia, n);
      if (res.eliminar) a.averias = a.averias.filter((x) => x !== averia);
      notas.push(res.texto);
    } else if (tarea.tipo === 'diagnostico' && averia) {
      notas.push(diagnosticarAveria(a, averia).texto);
    } else if (tarea.tipo === 'reparacion' && averia) {
      if (averia.equipo) a.inop[averia.codigo] = false;
      a.averias = a.averias.filter((x) => x !== averia);
      notas.push(`${describir(averia)}: reparado`);
    } else if (tarea.tipo === 'revision') {
      const res = aplicarRevision(a, tarea.nivel, n);
      gastar(estado, res.reparaciones);
      notas.push(`revisión ${tarea.nivel === 'D' ? 'estructural' : tarea.nivel} hecha${res.hallazgos.length ? ` (${res.hallazgos.join('; ')}; reparaciones ${Math.round(res.reparaciones).toLocaleString('es-ES')} $)` : ''}`);
    } else if (tarea.tipo === 'motor') {
      const encontradas = revisarMotor(a, tarea.pos);
      notas.push(`motor ${tarea.pos} revisado${encontradas.length ? ` (${encontradas.join(', ')})` : ''}`);
    } else if (tarea.tipo === 'retrofit') {
      a.equipo[tarea.tecnologia] = true;
      notas.push(`${TECNOLOGIAS[tarea.tecnologia].nombre} instalado`);
    } else if (tarea.tipo === 'directiva') {
      const d = estado.directivas.find((x) => x.id === tarea.directiva);
      if (d) d.hechas.push(a.id);
      notas.push('inspección de la directiva hecha');
    }
  }
  a.tareas = [];
  if (notas.length) {
    apuntar(estado, `El ${a.matricula} sale del taller: ${notas.join(' ')}`, 'info');
    eventos.push({ tipo: 'aviso', texto: `${a.matricula} sale del taller` });
  }
}

function pedir(estado, a, tarea, coste) {
  if (estado.caja < coste) return 'No tienes caja';
  if (a.tareas.some((t) => t.tipo === tarea.tipo && t.averia === tarea.averia && t.nivel === tarea.nivel && t.pos === tarea.pos && t.tecnologia === tarea.tecnologia)) return 'Ya está pedido';
  gastar(estado, coste);
  a.tareas.push(tarea);
  return null;
}

const avionDe = (estado, id) => estado.aviones.find((x) => x.id === id);

export function pedirInspeccion(estado, idAvion, idAveria) {
  const a = avionDe(estado, idAvion);
  const averia = a?.averias.find((x) => x.id === idAveria);
  if (!averia) return 'No existe';
  const metodo = metodoDe(averia);
  return pedir(estado, a, { tipo: 'inspeccion', averia: idAveria, metodo }, Math.round(METODOS[metodo].coste * indice(anio(estado.t))));
}

export function pedirDiagnostico(estado, idAvion, idAveria) {
  const a = avionDe(estado, idAvion);
  const averia = a?.averias.find((x) => x.id === idAveria);
  if (!averia || averia.fase !== 'anomalia') return 'No hay nada que diagnosticar';
  const clase = tipoDiagnostico(averia);
  return pedir(estado, a, { tipo: 'diagnostico', averia: idAveria, clase }, Math.round(DIAGNOSTICO[clase].coste * indice(anio(estado.t))));
}

export function costeReparar(estado, a, averia) {
  const n = anio(estado.t);
  if (averia.equipo) return Math.round(precioNuevo(TIPOS[a.tipo], n) * 0.001);
  return costeReparacion(a, averia, n);
}

export function pedirReparacion(estado, idAvion, idAveria) {
  const a = avionDe(estado, idAvion);
  const averia = a?.averias.find((x) => x.id === idAveria);
  if (!averia) return 'No existe';
  const def = AVERIAS[averia.codigo];
  if (def?.reparacion === 'rg') return pedirMotor(estado, idAvion, averia.motor, false);
  const horas = averia.equipo ? 6 : def.reparacion.horas * TIPOS[a.tipo].repuestos;
  return pedir(estado, a, { tipo: 'reparacion', averia: idAveria, horas }, costeReparar(estado, a, averia));
}

export function diferir(estado, idAvion, idAveria) {
  const a = avionDe(estado, idAvion);
  const averia = a?.averias.find((x) => x.id === idAveria);
  if (!averia) return 'No existe';
  const error = diferirAveria(averia, estado.t);
  if (!error) apuntar(estado, `${a.matricula}: ${describir(averia).toLowerCase()} se difiere según la MEL.`);
  return error;
}

export function pedirRevision(estado, idAvion, nivel) {
  const a = avionDe(estado, idAvion);
  if (!a) return 'No existe';
  return pedir(estado, a, { tipo: 'revision', nivel }, Math.round(costeRevision(a, nivel, anio(estado.t))));
}

export function pedirMotor(estado, idAvion, pos, alquiler) {
  const a = avionDe(estado, idAvion);
  if (!a) return 'No existe';
  const n = anio(estado.t);
  const coste = costeRG(a, n) + (alquiler ? alquilerMotor(a, n) : 0);
  return pedir(estado, a, { tipo: 'motor', pos, alquiler }, Math.round(coste));
}

export function pedirRetrofit(estado, idAvion, tecnologia) {
  const a = avionDe(estado, idAvion);
  if (!a) return 'No existe';
  const error = puedeInstalar(tecnologia, a, anio(estado.t));
  if (error) return error;
  return pedir(estado, a, { tipo: 'retrofit', tecnologia }, Math.round(TECNOLOGIAS[tecnologia].retrofit.coste * indice(anio(estado.t))));
}

export function pedirDirectiva(estado, idAvion, idDirectiva) {
  const a = avionDe(estado, idAvion);
  const d = estado.directivas.find((x) => x.id === idDirectiva);
  if (!a || !d) return 'No existe';
  return pedir(estado, a, { tipo: 'directiva', directiva: idDirectiva }, Math.round(30e3 * indice(anio(estado.t))));
}

export function cancelarTareas(estado, idAvion) {
  const a = avionDe(estado, idAvion);
  if (a && a.estado !== 'taller') a.tareas = [];
}

// ---------------------------------------------------------------- compraventa

export function costeInspeccionCompra(oferta, nivel, anio) {
  const i = indice(anio);
  return nivel === 'completa' ? Math.max(40e3 * i, oferta.precio * 0.025) : Math.max(8e3 * i, oferta.precio * 0.005);
}

// Inspección previa a la compra. La básica revisa registros, hace una visual y boroscopia y
// análisis de aceite de los motores. La completa equivale a una revisión C.
export function inspeccionar(estado, idOferta, nivel = 'basica') {
  const o = estado.mercado.find((x) => x.id === idOferta);
  if (!o) return 'No disponible';
  if (o.inspeccion === 'completa' || o.inspeccion === nivel) return 'Ya está inspeccionado';
  const n = anio(estado.t);
  const coste = Math.round(costeInspeccionCompra(o, nivel, n));
  if (estado.caja < coste) return 'No tienes dinero para la inspección';
  gastar(estado, coste);
  o.inspeccion = nivel;
  const a = o.avion;
  for (const x of a.averias) {
    const def = AVERIAS[x.codigo];
    const umbral = nivel === 'completa' ? Math.min(def.umbrales.C, def.umbrales.inspeccion) : def.metodo === 'ndt' || def.metodo === 'taller' ? 9 : def.umbrales.inspeccion;
    if (x.progreso >= umbral) {
      x.fase = nivel === 'completa' || !def.importante ? 'confirmada' : 'anomalia';
      if (x.fase === 'confirmada') x.diagnostico = { fueraDeLimites: x.progreso >= def.umbrales.limite };
    }
  }
  apuntar(estado, `Inspección ${nivel === 'completa' ? 'completa' : 'básica'} del ${TIPOS[a.tipo].corto} ${a.matricula}.`);
  return null;
}

function recibirAvion(estado, a) {
  a.lugar = estado.base;
  a.estado = 'tierra';
  a.libreEn = estado.t + 24 * 60;
  estado.aviones.push(a);
}

export function comprar(estado, idOferta) {
  const o = estado.mercado.find((x) => x.id === idOferta);
  if (!o) return 'La oferta ya no está';
  if (estado.caja < o.precio) return 'No tienes caja suficiente';
  gastar(estado, o.precio);
  estado.mercado = estado.mercado.filter((x) => x.id !== idOferta);
  recibirAvion(estado, o.avion);
  apuntar(estado, `Compras el ${TIPOS[o.avion.tipo].nombre} ${o.avion.matricula} por ${o.precio.toLocaleString('es-ES')} $. Llega mañana.`, 'hito');
  return null;
}

export function comprarNuevo(estado, tipoId) {
  const tipo = TIPOS[tipoId];
  const n = anio(estado.t);
  if (n < tipo.entrada || n > tipo.finProduccion) return 'No se fabrica este año';
  let precio = precioNuevo(tipo, n);
  if (tipo.clase === 'supersonico') {
    if (estado.concordes >= 2) return 'El consorcio no te vende más unidades';
    if (POR_ID[estado.base].tam < 4) return 'Necesitas una base en un aeropuerto principal';
    // La primera unidad incluye la formación especializada de tripulaciones y mecánicos.
    if (!estado.concordes) precio += 2e6 * indice(n);
  }
  if (estado.caja < precio) return 'No tienes caja suficiente';
  gastar(estado, precio);
  if (tipo.clase === 'supersonico') estado.concordes++;
  const a = crearAvion(estado, azarDe(estado), tipoId, { anio: n, fabricado: n });
  recibirAvion(estado, a);
  apuntar(estado, `Estrenas un ${tipo.nombre} nuevo: ${a.matricula}.`, 'hito');
  return null;
}

export function vender(estado, idAvion) {
  const a = avionDe(estado, idAvion);
  if (!a) return 'No existe';
  if (a.estado === 'vuelo' || a.estado === 'esperando' || a.estado === 'taller') return 'Espera a que esté en tierra y fuera del taller';
  const precio = Math.round(valorMercado(a, anio(estado.t)) * 0.85);
  ingresar(estado, precio);
  estado.aviones = estado.aviones.filter((x) => x.id !== idAvion);
  for (const ruta of estado.rutas) if (ruta.avion === idAvion) ruta.avion = null;
  apuntar(estado, `Vendes el ${a.matricula} por ${precio.toLocaleString('es-ES')} $.`);
  return null;
}

// ---------------------------------------------------------------- rutas

export function puedeOperar(estado, a, destinoId) {
  const r = evaluarRuta(a.tipo, estado.base, destinoId, anioDecimal(estado.t));
  return r.posible ? null : r.motivo;
}

export function crearRuta(estado, destinoId, tarifa = 'normal') {
  const d = POR_ID[destinoId];
  if (!d || destinoId === estado.base || d.alternativo) return 'Destino no válido';
  if (d.desde && anio(estado.t) < d.desde) return `${d.nombre} todavía no existe`;
  if (estado.rutas.some((r) => r.destino === destinoId)) return 'Ya tienes esa ruta';
  const numero = estado.rutas.reduce((m, r) => Math.max(m, r.numero + 10), 100);
  estado.rutas.push({
    id: estado.siguienteId++, origen: estado.base, destino: destinoId, tarifa, avion: null, numero,
    frecuencia: 2, salidas: { dia: -1, hechas: 0 }, servicio: 'estandar', cateringBase: false,
    stats: { vuelos: 0, pax: 0, plazas: 0, beneficio: 0, retraso: 0 },
  });
  apuntar(estado, `Abres la ruta ${estado.base}–${destinoId}.`);
  return null;
}

export function borrarRuta(estado, idRuta) {
  const ruta = estado.rutas.find((r) => r.id === idRuta);
  if (!ruta) return;
  for (const a of estado.aviones) if (a.ruta === idRuta) a.ruta = null;
  estado.rutas = estado.rutas.filter((r) => r.id !== idRuta);
  apuntar(estado, `Cierras la ruta ${ruta.origen}–${ruta.destino}.`);
}

export function cambiarTarifa(estado, idRuta, tarifa) {
  const ruta = estado.rutas.find((r) => r.id === idRuta);
  if (ruta) ruta.tarifa = tarifa;
}

export function cambiarServicio(estado, idRuta, servicio) {
  const ruta = estado.rutas.find((r) => r.id === idRuta);
  if (ruta) ruta.servicio = servicio;
}

export function cambiarCateringBase(estado, idRuta, valor) {
  const ruta = estado.rutas.find((r) => r.id === idRuta);
  if (ruta) ruta.cateringBase = valor;
}

export function cambiarFrecuencia(estado, idRuta, frecuencia) {
  const ruta = estado.rutas.find((r) => r.id === idRuta);
  if (ruta) ruta.frecuencia = Math.max(1, Math.min(8, frecuencia));
}

export function asignar(estado, idAvion, idRuta) {
  const a = avionDe(estado, idAvion);
  if (!a) return 'No existe';
  if (idRuta == null) {
    for (const r of estado.rutas) if (r.avion === idAvion) r.avion = null;
    a.ruta = null;
    return null;
  }
  const ruta = estado.rutas.find((r) => r.id === idRuta);
  if (!ruta) return 'No existe la ruta';
  const error = puedeOperar(estado, a, ruta.destino);
  if (error) return error;
  for (const r of estado.rutas) if (r.avion === idAvion) r.avion = null;
  const anterior = avionDe(estado, ruta.avion);
  if (anterior) anterior.ruta = null;
  ruta.avion = idAvion;
  a.ruta = idRuta;
  return null;
}

// ---------------------------------------------------------------- banco

export function pedirPrestamo(estado, cantidad) {
  if (estado.prestamo + cantidad > limitePrestamo(estado)) return 'El banco no te deja más';
  estado.prestamo += cantidad;
  estado.caja += cantidad;
  return null;
}

export function devolverPrestamo(estado, cantidad) {
  const c = Math.min(cantidad, estado.prestamo);
  if (estado.caja < c) return 'No tienes caja';
  estado.prestamo -= c;
  estado.caja -= c;
  return null;
}

export function patrimonio(estado) {
  const n = anio(estado.t);
  return estado.caja - estado.prestamo + estado.aviones.reduce((s, a) => s + valorMercado(a, n), 0);
}

export { valorMercado, edad, amenazas };
