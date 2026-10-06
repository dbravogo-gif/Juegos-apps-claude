// Motor de la partida: el reloj, los vuelos, las decisiones y las cuentas.
//
// `avanzar` mueve el reloj y devuelve los eventos que la interfaz tiene que enseñar. Se para en
// cuanto hay una decisión pendiente: el mundo no sigue mientras decides si sale un avión.

import { POR_ID, abiertoEn } from '../data/aeropuertos.js';
import { TIPOS, tripulacion } from '../data/aviones.js';
import { azarDe, entre, hash, generador } from './azar.js';
import { distanciaKm, duracionMin } from './geo.js';
import { evaluarVuelo, estimar, resolverVuelo, causaPrincipal, LIMITE_REVISION } from './riesgo.js';
import {
  desgastar, aplicarRevision, costeRevision, horasRevision, costeReparacion, valorMercado,
  generarMercado, ofertaSegundaMano, costeInspeccion, crearAvion, condicionMedia,
} from './flota.js';
import {
  demandaPropia, precioBillete, costeVuelo, costeBaseDiario, costeTripulacionDiario, seguroDiario,
  CAJA_INICIAL, INTERES_ANUAL,
} from './economia.js';
import { MIN_DIA, dia, hora, anio, mes, textoFecha } from './tiempo.js';

export const VERSION = 1;
const PASO = 5;
const HORA_PRIMERA_SALIDA = 6;
const HORA_ULTIMA_SALIDA = 23;
const DIAS_INVESTIGACION = 30;

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
    diario: [],
    demandaUsada: {},
    cuentas: { hoy: { ingresos: 0, gastos: 0 }, historial: [] },
    ajustes: { umbral: 0.003 },
    siguienteId: 1,
    quiebra: false,
  };
  estado.mercado = generarMercado(estado, azarDe(estado), 1976, aeropuerto.pista);
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

export const limitePrestamo = (estado) =>
  Math.round((4e6 + 0.3 * estado.aviones.reduce((s, a) => s + valorMercado(a, anio(estado.t)), 0)) / 1e5) * 1e5;

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
    if (a.vuelo.accidente && t >= a.vuelo.momento) estrellar(estado, a, eventos);
    else if (t >= a.vuelo.llegada) aterrizar(estado, a, eventos);
    return;
  }
  if (a.estado === 'taller') {
    if (t >= a.libreEn) salirDelTaller(estado, a, eventos);
    return;
  }
  if (a.estado !== 'tierra' || t < a.libreEn) return;

  if (a.lugar === estado.base && a.tareas.length) {
    entrarEnTaller(estado, a);
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

// ---------------------------------------------------------------- vuelos

export function datosVuelo(estado, a, destinoId, combustibleExtra = false) {
  const tipo = TIPOS[a.tipo];
  const origen = POR_ID[a.lugar];
  const destino = POR_ID[destinoId];
  const distancia = distanciaKm(origen, destino);
  const duracion = duracionMin(distancia, tipo.crucero);
  const evaluacion = evaluarVuelo({
    avion: a, tipo, origen, destino, t: estado.t, semilla: estado.semilla, distancia, duracion, combustibleExtra,
  });
  const ruta = rutaDelTramo(estado, a.lugar, destinoId);
  const tarifa = ruta?.tarifa ?? 'normal';
  const precio = precioBillete(distancia, tarifa);
  const clave = `${dia(estado.t)}:${a.lugar}-${destinoId}`;
  const libre = Math.max(0, demandaPropia(origen, destino, estado.t, estado.reputacion, tarifa) - (estado.demandaUsada[clave] ?? 0));
  const r = generador(hash(estado.semilla, 'pax', a.id, estado.t));
  const pax = Math.max(0, Math.min(tipo.plazas, Math.round(libre * entre(r, 0.85, 1.15))));
  const ingreso = pax * precio;
  const coste = costeVuelo(tipo, duracion / 60, destino, pax, ingreso, combustibleExtra);
  return { tipo, origen, destino, distancia, duracion, evaluacion, pax, ingreso, coste, clave, ruta };
}

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

function prepararSalida(estado, a, destino, eventos) {
  const d = datosVuelo(estado, a, destino);
  const r = generador(hash(estado.semilla, 'estimacion', a.id, estado.t));
  const estimacion = estimar(d.evaluacion, r);
  if (estimacion >= estado.ajustes.umbral) {
    a.estado = 'esperando';
    const decision = {
      id: estado.siguienteId++,
      avion: a.id,
      origen: a.lugar,
      destino,
      t: estado.t,
      numero: numeroVuelo(estado, d.ruta, destino === estado.base),
      estimacion,
      evaluacion: d.evaluacion,
      pax: d.pax,
      ingreso: d.ingreso,
      coste: d.coste,
      duracion: d.duracion,
    };
    estado.decisiones.push(decision);
    eventos.push({ tipo: 'decision', decision });
    return;
  }
  despegar(estado, a, d, { manual: false, estimacion });
}

function despegar(estado, a, d, { manual, estimacion }) {
  const r = azarDe(estado);
  const resultado = resolverVuelo(d.evaluacion, r);
  estado.demandaUsada[d.clave] = (estado.demandaUsada[d.clave] ?? 0) + d.pax;
  if (d.ruta && a.lugar === estado.base) registrarSalida(estado, d.ruta);
  const salida = estado.t;
  const llegada = salida + d.duracion;
  const accidente = resultado.resultado === 'accidente';
  const vencida = a.horasDesdeRevision > LIMITE_REVISION;
  a.estado = 'vuelo';
  a.vuelo = {
    origen: a.lugar,
    destino: d.destino.id,
    numero: numeroVuelo(estado, d.ruta, d.destino.id === estado.base),
    salida,
    llegada,
    pax: d.pax,
    ingreso: d.ingreso,
    coste: d.coste,
    resultado: resultado.resultado,
    causa: resultado.causa,
    accidente,
    momento: accidente
      ? resultado.causa === 'vuelo' ? salida + Math.min(25, Math.round(d.duracion * 0.3)) : llegada - 3
      : null,
    manual,
    estimacion,
    // Lo que sabrá la investigación si algo sale mal.
    expediente: {
      factores: d.evaluacion.factores.slice(0, 5),
      total: d.evaluacion.total,
      revisionVencida: vencida,
      defectoConocido: a.defectos.some((x) => x.descubierto && x.gravedad >= 2),
      fatiga: d.evaluacion.jornada > 11,
      riesgoAsumido: manual && estimacion >= 0.02,
      combustibleExtra: d.evaluacion.combustibleExtra,
      clima: d.evaluacion.clima,
    },
  };
}

function aterrizar(estado, a, eventos) {
  const v = a.vuelo;
  const tipo = TIPOS[a.tipo];
  const r = azarDe(estado);
  const horas = (v.llegada - v.salida) / 60;
  let ingreso = v.ingreso;
  let coste = v.coste;
  a.lugar = v.destino;
  a.estado = 'tierra';
  a.libreEn = estado.t + (tipo.silueta === 'helice' ? 35 : 45);
  desgastar(estado, r, a, horas);

  const destino = POR_ID[v.destino];
  if (v.resultado === 'desvio') {
    coste += Math.round(v.coste * 0.3);
    ingreso = Math.round(ingreso * 0.8);
    a.libreEn += 120;
    apuntar(estado, `${v.numero} se desvía al alternativo por el tiempo en ${destino.ciudad}. Llega con dos horas de retraso.`, 'aviso');
    eventos.push({ tipo: 'aviso', texto: `${v.numero} desviado: mal tiempo en ${destino.id}` });
  } else if (v.resultado === 'grave') {
    const pieza = ['motores', 'tren', 'fuselaje'][Math.floor(r() * 3)];
    a.partes[pieza] = Math.max(5, a.partes[pieza] - entre(r, 8, 15));
    coste += Math.round(tipo.precio * 0.02);
    a.estado = 'taller';
    a.libreEn = estado.t + 72 * 60;
    ajustarReputacion(estado, -4);
    const texto = {
      vuelo: 'tras un fallo en vuelo',
      pista: 'con una salida de pista sin heridos graves',
      aproximacion: 'después de una aproximación frustrada al límite',
    }[v.causa];
    apuntar(estado, `${v.numero}: aterrizaje de emergencia en ${destino.ciudad} ${texto}. El ${a.matricula} queda tres días en el taller.`, 'grave');
    eventos.push({ tipo: 'aviso', grave: true, texto: `Emergencia: ${v.numero} en ${destino.id}` });
  } else if (v.resultado === 'leve') {
    ajustarReputacion(estado, -1);
    const oculto = a.defectos.find((x) => !x.descubierto);
    const extra = oculto ? ` Los mecánicos encuentran: ${oculto.texto}.` : '';
    if (oculto) oculto.descubierto = true;
    apuntar(estado, `${v.numero}: incidente leve llegando a ${destino.ciudad}. Pasajeros asustados, ningún herido.${extra}`, 'aviso');
    eventos.push({ tipo: 'aviso', texto: `Incidente leve en ${v.numero}` });
  } else {
    ajustarReputacion(estado, 0.03);
  }

  ingresar(estado, ingreso);
  gastar(estado, coste);
  a.stats.vuelos++;
  a.stats.beneficio += ingreso - coste;
  const ruta = rutaDelTramo(estado, v.origen, v.destino);
  if (ruta) {
    ruta.stats.vuelos++;
    ruta.stats.pax += v.pax;
    ruta.stats.plazas += tipo.plazas;
    ruta.stats.beneficio += ingreso - coste;
  }
  a.vuelo = null;
  eventos.push({ tipo: 'aterrizaje', avion: a.id });
}

const DESCRIPCION_ACCIDENTE = {
  pista: 'se ha salido de la pista al aterrizar',
  aproximacion: 'se ha estrellado durante la aproximación',
  vuelo: 'se ha estrellado poco después de despegar',
};

function estrellar(estado, a, eventos) {
  const v = a.vuelo;
  const tipo = TIPOS[a.tipo];
  const r = azarDe(estado);
  const tripulantes = tripulacion(tipo);
  const ocupantes = v.pax + tripulantes;
  let fallecidos;
  if (v.causa === 'pista') fallecidos = Math.round(ocupantes * entre(r, 0, 0.2));
  else if (v.causa === 'aproximacion') fallecidos = Math.round(ocupantes * entre(r, 0.85, 1));
  else fallecidos = Math.round(ocupantes * entre(r, 0.6, 1));
  const resto = ocupantes - fallecidos;
  const heridos = v.causa === 'pista' ? Math.round(resto * entre(r, 0.3, 0.7)) : resto;
  const lugar = v.causa === 'vuelo' ? v.origen : v.destino;

  const exp = v.expediente;
  const motivos = [];
  if (exp.revisionVencida) motivos.push('el avión volaba con la revisión vencida');
  if (exp.defectoConocido) motivos.push('la compañía conocía un defecto grave sin reparar');
  if (exp.fatiga) motivos.push('la tripulación excedía una jornada razonable');
  if (exp.riesgoAsumido) motivos.push('se autorizó la salida pese a un riesgo estimado muy alto');
  const principal = causaPrincipal({ factores: exp.factores }, v.causa);

  const accidente = {
    id: estado.siguienteId++,
    t: estado.t,
    numero: v.numero,
    matricula: a.matricula,
    tipo: a.tipo,
    silueta: tipo.silueta,
    origen: v.origen,
    destino: v.destino,
    lugar,
    causa: v.causa,
    descripcion: DESCRIPCION_ACCIDENTE[v.causa],
    pax: v.pax,
    tripulantes,
    fallecidos,
    heridos,
    valorAvion: Math.round(valorMercado(a, anio(estado.t))),
    principal: principal?.texto ?? 'Sin determinar',
    motivos,
    negligencia: motivos.length > 0,
    investigacionEn: estado.t + DIAS_INVESTIGACION * MIN_DIA,
    cerrado: false,
  };
  estado.accidentes.unshift(accidente);
  gastar(estado, v.coste);
  ajustarReputacion(estado, -30);
  estado.aviones = estado.aviones.filter((x) => x.id !== a.id);
  for (const ruta of estado.rutas) if (ruta.avion === a.id) ruta.avion = null;
  const ap = POR_ID[lugar];
  apuntar(estado, `ACCIDENTE. El ${tipo.corto} ${a.matricula} (${v.numero}) ${accidente.descripcion} en ${ap.ciudad}. ${fallecidos} fallecidos y ${heridos} heridos.`, 'accidente');
  eventos.push({ tipo: 'accidente', accidente });
}

// ---------------------------------------------------------------- decisiones

export const OPCIONES = ['despegar', 'extra', 'retrasar', 'cancelar'];

export function decidir(estado, idDecision, opcion) {
  const i = estado.decisiones.findIndex((x) => x.id === idDecision);
  if (i < 0) return;
  const dec = estado.decisiones[i];
  estado.decisiones.splice(i, 1);
  const a = estado.aviones.find((x) => x.id === dec.avion);
  if (!a) return;
  a.estado = 'tierra';
  if (opcion === 'retrasar') {
    a.libreEn = estado.t + 120;
    apuntar(estado, `${dec.numero} se retrasa dos horas.`, 'info');
    return;
  }
  if (opcion === 'cancelar') {
    const ruta = rutaDelTramo(estado, dec.origen, dec.destino);
    if (ruta && dec.origen === estado.base) registrarSalida(estado, ruta);
    a.libreEn = estado.t + (dec.origen === estado.base ? 30 : 180);
    gastar(estado, Math.round(dec.ingreso * 0.1));
    ajustarReputacion(estado, -0.8);
    apuntar(estado, `${dec.numero} cancelado. Se reubica a los pasajeros.`, 'info');
    return;
  }
  const d = datosVuelo(estado, a, dec.destino, opcion === 'extra');
  despegar(estado, a, d, { manual: true, estimacion: dec.estimacion });
}

// ---------------------------------------------------------------- fin de día

function finDeDia(estado, eventos) {
  const base = POR_ID[estado.base];
  const n = anio(estado.t);
  gastar(estado, costeBaseDiario(base));
  for (const a of estado.aviones) {
    gastar(estado, costeTripulacionDiario(TIPOS[a.tipo]) + seguroDiario(valorMercado(a, n)));
    a.horasHoy = 0;
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
  const indemnizaciones = acc.fallecidos * 75000 + acc.heridos * 15000;
  if (acc.negligencia) {
    acc.multa = 250000;
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
  apuntar(estado, `Concluye la investigación del ${acc.numero}: ${acc.negligencia ? 'hay negligencia de la compañía' : 'no hay negligencia de la compañía'}.`, acc.negligencia ? 'accidente' : 'info');
  eventos.push({ tipo: 'investigacion', accidente: acc });
}

function renovarMercado(estado) {
  const r = azarDe(estado);
  const n = anio(estado.t);
  const quedan = estado.mercado.filter((o) => o.inspeccionada || r() < 0.5).slice(0, 4);
  const pista = POR_ID[estado.base].pista;
  while (quedan.length < 6) quedan.push(ofertaSegundaMano(estado, r, n, pista));
  estado.mercado = quedan;
}

// ---------------------------------------------------------------- acciones

export function inspeccionar(estado, idOferta) {
  const o = estado.mercado.find((x) => x.id === idOferta);
  if (!o || o.inspeccionada) return 'No disponible';
  const coste = costeInspeccion(o.precio);
  if (estado.caja < coste) return 'No tienes dinero para la inspección';
  gastar(estado, coste);
  o.inspeccionada = true;
  for (const d of o.avion.defectos) d.descubierto = true;
  apuntar(estado, `Inspección del ${TIPOS[o.avion.tipo].corto} ${o.avion.matricula}: ${o.avion.defectos.length ? `${o.avion.defectos.length} defecto(s)` : 'limpio'}.`);
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
  if (estado.caja < tipo.precio) return 'No tienes caja suficiente';
  gastar(estado, tipo.precio);
  const a = crearAvion(estado, azarDe(estado), tipoId, { fabricado: anio(estado.t) });
  recibirAvion(estado, a);
  apuntar(estado, `Estrenas un ${tipo.nombre} nuevo: ${a.matricula}.`, 'hito');
  return null;
}

export function vender(estado, idAvion) {
  const a = estado.aviones.find((x) => x.id === idAvion);
  if (!a) return 'No existe';
  if (a.estado === 'vuelo' || a.estado === 'esperando') return 'Espera a que esté en tierra';
  const precio = Math.round(valorMercado(a, anio(estado.t)) * 0.85);
  ingresar(estado, precio);
  estado.aviones = estado.aviones.filter((x) => x.id !== idAvion);
  for (const ruta of estado.rutas) if (ruta.avion === idAvion) ruta.avion = null;
  apuntar(estado, `Vendes el ${a.matricula} por ${precio.toLocaleString('es-ES')} $.`);
  return null;
}

export function puedeOperar(estado, a, destinoId) {
  const tipo = TIPOS[a.tipo];
  const o = POR_ID[estado.base];
  const d = POR_ID[destinoId];
  const dist = distanciaKm(o, d);
  if (dist > tipo.alcance) return `Fuera de alcance (${Math.round(dist)} km, máx. ${tipo.alcance})`;
  if (d.pista < tipo.pista) return `Pista corta en ${d.id} (${d.pista} m, necesita ${tipo.pista})`;
  if (o.pista < tipo.pista) return `Pista corta en ${o.id}`;
  return null;
}

export function crearRuta(estado, destinoId, tarifa = 'normal') {
  const d = POR_ID[destinoId];
  if (!d || destinoId === estado.base) return 'Destino no válido';
  if (!abiertoEn(d, anio(estado.t))) return `${d.nombre} todavía no existe`;
  if (estado.rutas.some((r) => r.destino === destinoId)) return 'Ya tienes esa ruta';
  const numero = estado.rutas.reduce((m, r) => Math.max(m, r.numero + 10), 100);
  estado.rutas.push({
    id: estado.siguienteId++, origen: estado.base, destino: destinoId, tarifa, avion: null, numero,
    frecuencia: 2, salidas: { dia: -1, hechas: 0 },
    stats: { vuelos: 0, pax: 0, plazas: 0, beneficio: 0 },
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

export function cambiarFrecuencia(estado, idRuta, frecuencia) {
  const ruta = estado.rutas.find((r) => r.id === idRuta);
  if (ruta) ruta.frecuencia = Math.max(1, Math.min(8, frecuencia));
}

export function asignar(estado, idAvion, idRuta) {
  const a = estado.aviones.find((x) => x.id === idAvion);
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
  const anterior = estado.aviones.find((x) => x.id === ruta.avion);
  if (anterior) anterior.ruta = null;
  ruta.avion = idAvion;
  a.ruta = idRuta;
  return null;
}

export function ordenarRevision(estado, idAvion) {
  const a = estado.aviones.find((x) => x.id === idAvion);
  if (!a || a.tareas.some((x) => x.tipo === 'revision')) return 'Ya está pedida';
  const coste = costeRevision(a);
  if (estado.caja < coste) return 'No tienes caja';
  gastar(estado, coste);
  a.tareas.push({ tipo: 'revision' });
  return null;
}

export function ordenarReparacion(estado, idAvion, idDefecto) {
  const a = estado.aviones.find((x) => x.id === idAvion);
  const d = a?.defectos.find((x) => x.id === idDefecto);
  if (!d || a.tareas.some((x) => x.defecto === idDefecto)) return 'Ya está pedida';
  const coste = costeReparacion(a, d);
  if (estado.caja < coste) return 'No tienes caja';
  gastar(estado, coste);
  a.tareas.push({ tipo: 'reparar', defecto: idDefecto });
  return null;
}

function entrarEnTaller(estado, a) {
  const horas = (a.tareas.some((x) => x.tipo === 'revision') ? horasRevision(a) : 0)
    + a.tareas.filter((x) => x.tipo === 'reparar').length * 12;
  a.estado = 'taller';
  a.libreEn = estado.t + horas * 60;
  apuntar(estado, `El ${a.matricula} entra en el taller (${horas} h).`);
}

function salirDelTaller(estado, a, eventos) {
  a.estado = 'tierra';
  const notas = [];
  for (const tarea of a.tareas) {
    if (tarea.tipo === 'revision') {
      const nuevos = aplicarRevision(a, azarDe(estado), anio(estado.t));
      notas.push(nuevos.length ? `revisión hecha; aparecen ${nuevos.length} defecto(s)` : 'revisión hecha');
    } else {
      a.defectos = a.defectos.filter((x) => x.id !== tarea.defecto);
      notas.push('defecto reparado');
    }
  }
  a.tareas = [];
  if (notas.length) {
    apuntar(estado, `El ${a.matricula} sale del taller: ${notas.join(', ')}.`);
    eventos.push({ tipo: 'aviso', texto: `${a.matricula} sale del taller` });
  }
}

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

export { condicionMedia };
