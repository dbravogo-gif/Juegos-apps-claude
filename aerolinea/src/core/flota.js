// Aviones: cómo son por dentro, cuánto valen y el mercado de segunda mano.
//
// Por dentro un avión lleva horas, ciclos, horas desde cada revisión, motores con su propia
// historia, averías en distintas fases y su equipo. El jugador solo ve lo que se ha
// inspeccionado: ver mantenimiento.js.

import { TIPOS, programa, tiposDeSegundaMano } from '../data/aviones.js';
import { MOTORES } from '../data/motores.js';
import { AVERIAS, EQUIPOS_INOP } from '../data/averias.js';
import { equipoDeSerie } from '../data/tecnologias.js';
import { prefijoMatricula, POR_ID } from '../data/aeropuertos.js';
import { entre, entero, elegir, ponderado } from './azar.js';
import { indice, precioNuevo } from './economia.js';
import { pistaEfectiva } from './operaciones.js';

const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function matricula(pais, r) {
  const p = prefijoMatricula(pais);
  const letras = (n) => Array.from({ length: n }, () => elegir(r, LETRAS)).join('');
  if (p === 'N') return `N${entero(r, 100, 999)}${letras(2)}`;
  if (p === 'CCCP') return `CCCP-${entero(r, 10000, 99999)}`;
  return `${p}-${letras(p.length === 1 ? 4 : 3)}`;
}

export const edad = (a, anio) => Math.max(0, anio - a.fabricado);

// Averías que admite un avión según su tipo.
export function averiasPosibles(tipo) {
  return Object.entries(AVERIAS).filter(([, a]) => {
    if (!a.solo) return true;
    if (a.solo === 'helice') return tipo.config.motores === 'helices-ala';
    return a.solo === tipo.id;
  }).map(([codigo]) => codigo);
}

export function nuevaAveria(estado, r, codigo, { motor = null, progreso = 0 } = {}) {
  const def = AVERIAS[codigo];
  return {
    id: estado.siguienteId++,
    codigo,
    motor,
    progreso,
    vida: entre(r, def.vida[0], def.vida[1]),
    fase: 'oculta',
    desde: estado.t,
    diferidaHasta: null,
    diagnostico: null,
  };
}

export function crearAvion(estado, r, tipoId, opciones = {}) {
  const tipo = TIPOS[tipoId];
  const anio = opciones.anio ?? 1976;
  const fabricado = opciones.fabricado ?? anio;
  const horas = opciones.horas ?? 0;
  const ciclos = opciones.ciclos ?? 0;
  const usado = horas > 0;
  const prog = programa(tipo);
  const motor = MOTORES[tipo.motor];
  const avion = {
    id: estado.siguienteId++,
    tipo: tipoId,
    matricula: matricula(estado.pais ?? 'ES', r),
    fabricado,
    horas,
    ciclos,
    motores: Array.from({ length: tipo.nMotores }, (_, i) => ({
      pos: i + 1,
      horasRG: usado ? Math.round(motor.intervalo * entre(r, 0.05, 1.05)) : 0,
      historial: [],
    })),
    revisiones: {
      A: usado ? Math.round(prog.A.horas * entre(r, 0, 0.9)) : 0,
      C: usado ? Math.round(prog.C.horas * entre(r, 0.05, 1.05)) : 0,
      D: usado ? Math.round(horas % prog.D.horas) : 0,
    },
    averias: [],
    equipo: equipoDeSerie(tipo, fabricado),
    inop: {},
    registros: opciones.registros ?? 'completos',
    horasHoy: 0,
    estado: 'tierra',
    lugar: estado.base,
    libreEn: 0,
    ruta: null,
    vuelo: null,
    tareas: [],
    historial: [],
    stats: { vuelos: 0, beneficio: 0, incidentes: 0 },
  };
  // Un avión usado trae averías latentes: más cuanto más viejo y peor documentado.
  if (usado) {
    const posibles = averiasPosibles(tipo);
    let lambda = 0.4 + edad(avion, anio) / 10 + (avion.registros === 'dudosos' ? 1 : avion.registros === 'incompletos' ? 0.4 : 0);
    if (tipo.ficticio) lambda += 0.5;
    for (let x = r(); x < lambda && avion.averias.length < 6; x += r()) {
      const codigo = elegir(r, posibles);
      const def = AVERIAS[codigo];
      const motorPos = def.comp === 'motor' ? entero(r, 1, tipo.nMotores) : null;
      avion.averias.push(nuevaAveria(estado, r, codigo, { motor: motorPos, progreso: entre(r, 0.05, 0.75) }));
    }
  }
  return avion;
}

// --- Valor

export function valorMercado(avion, anio) {
  const tipo = TIPOS[avion.tipo];
  const i = indice(anio);
  // Sin soporte del fabricante (el Concorde desde finales de 2003) solo vale como pieza de museo.
  if (tipo.clase === 'supersonico' && anio >= 2004) return Math.round(precioNuevo(tipo, anio) * 0.02);
  const base = precioNuevo(tipo, anio) * Math.max(0.12, Math.pow(0.93, edad(avion, anio)));
  const prog = programa(tipo);
  // Lo que falta para la próxima revisión estructural y para la revisión general de cada motor
  // se paga: un avión «recién salido de la D» vale más.
  const restanteD = 1 - Math.min(1, avion.revisiones.D / prog.D.horas);
  const ajusteD = (restanteD - 0.5) * prog.D.coste * i;
  const motor = MOTORES[tipo.motor];
  const ajusteMotores = avion.motores.reduce((s, m) => s + (0.5 - Math.min(1, m.horasRG / motor.intervalo)) * motor.costeRG * i, 0);
  const registros = { completos: 1, incompletos: 0.9, dudosos: 0.75 }[avion.registros];
  const conocidas = avion.averias.filter((a) => a.fase === 'confirmada' && !a.falsa).reduce((s, a) => s + costeReparacion(avion, a, anio), 0);
  return Math.max(base * 0.1, (base + ajusteD + ajusteMotores) * registros - conocidas);
}

export function costeReparacion(avion, averia, anio) {
  const def = AVERIAS[averia.codigo] ?? EQUIPOS_INOP[averia.codigo];
  const tipo = TIPOS[avion.tipo];
  if (def.reparacion === 'rg') return MOTORES[tipo.motor].costeRG * indice(anio);
  return Math.round(precioNuevo(tipo, anio) * def.reparacion.coste);
}

// --- Mercado de segunda mano

const VENDEDORES = [
  { texto: 'Una aerolínea nacional que renueva flota', registros: [0.85, 0.12, 0.03] },
  { texto: 'Un bróker de Miami', registros: [0.5, 0.35, 0.15], gpws: true },
  { texto: 'Una compañía chárter británica', registros: [0.75, 0.2, 0.05] },
  { texto: 'Un fondo de leasing de Ginebra', registros: [0.9, 0.1, 0] },
  { texto: 'Una aerolínea sudamericana que reduce flota', registros: [0.5, 0.35, 0.15] },
  { texto: 'Una compañía en liquidación', registros: [0.35, 0.4, 0.25] },
];

function etiquetaAnunciada(avion, r) {
  // El vendedor siempre ve su avión con buenos ojos.
  const mal = avion.averias.length + avion.revisiones.D / 20000;
  const nota = Math.max(0, mal - entre(r, 0, 1.5));
  return nota < 0.8 ? 'Excelente' : nota < 1.8 ? 'Bueno' : nota < 3 ? 'Aceptable' : 'Para reformar';
}

export function ofertaSegundaMano(estado, r, anio, base) {
  let candidatos = tiposDeSegundaMano(anio);
  if (base) {
    const operables = candidatos.filter((t) => pistaEfectiva(base, anio) >= t.pistaMin * 1.15);
    if (operables.length && r() < 0.75) candidatos = operables;
  }
  const tipo = ponderado(r, candidatos.map((t) => [t, t.clase === 'ancho' ? 0.3 : t.ficticio ? 0.4 : 1]));
  const anios = entero(r, 2, Math.max(2, Math.min(24, anio - tipo.entrada)));
  const uso = entre(r, 1800, 3000);
  const vendedor = tipo.ficticio
    ? { texto: 'Un intermediario con contactos en el Este', registros: [0.2, 0.4, 0.4] }
    : elegir(r, VENDEDORES);
  const registros = ponderado(r, [['completos', vendedor.registros[0]], ['incompletos', vendedor.registros[1]], ['dudosos', vendedor.registros[2]]]);
  const horas = Math.round(anios * uso);
  const ciclos = Math.round(horas * (tipo.clase === 'regional' ? 1.3 : tipo.clase === 'estrecho' ? 0.9 : 0.35));
  const avion = crearAvion(estado, r, tipo.id, { anio, fabricado: anio - anios, horas, ciclos, registros });
  if (vendedor.gpws && anio >= 1976 && tipo.clase !== 'regional') avion.equipo.gpws = true;
  avion.lugar = null;
  // El precio se basa en lo que se ve: las averías ocultas no lo bajan.
  const aparente = { ...avion, averias: [] };
  const precio = Math.round((valorMercado(aparente, anio) * entre(r, 0.88, 1.12)) / 1000) * 1000;
  return {
    id: estado.siguienteId++,
    avion,
    precio,
    vendedor: vendedor.texto,
    anunciado: etiquetaAnunciada(avion, r),
    inspeccion: null,
    informe: null,
  };
}

export function generarMercado(estado, r, anio, base) {
  return Array.from({ length: 6 }, () => ofertaSegundaMano(estado, r, anio, base));
}
