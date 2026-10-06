// Aviones: creación, mercado de segunda mano, desgaste y taller.

import { TIPOS, tiposDeSegundaMano, tiposEnProduccion } from '../data/aviones.js';
import { prefijoMatricula } from '../data/aeropuertos.js';
import { entre, entero, elegir, ponderado } from './azar.js';
import { PIEZAS } from './riesgo.js';

const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function matricula(pais, r) {
  const p = prefijoMatricula(pais);
  const letras = (n) => Array.from({ length: n }, () => elegir(r, LETRAS)).join('');
  if (p === 'N') return `N${entero(r, 100, 999)}${letras(2)}`;
  if (p === 'CCCP') return `CCCP-${entero(r, 10000, 99999)}`;
  return `${p}-${letras(p.length === 1 ? 4 : 3)}`;
}

const TEXTOS_DEFECTO = {
  motores: ['grieta en un álabe de turbina', 'consumo de aceite anómalo', 'vibraciones en el motor 2', 'corrosión en el inversor de empuje'],
  tren: ['amortiguador del tren principal gastado', 'fuga hidráulica en el tren', 'frenos al límite', 'corrosión en el tren de morro'],
  fuselaje: ['corrosión en la unión ala-fuselaje', 'grietas por fatiga junto a una puerta', 'remaches sueltos en el empenaje', 'reparación antigua mal hecha'],
  avionica: ['radioaltímetro poco fiable', 'piloto automático que se desconecta', 'radar meteorológico averiado', 'instrumentos de aproximación descalibrados'],
};

export function nuevoDefecto(estado, r, gravedad) {
  const pieza = ponderado(r, [['motores', 0.4], ['tren', 0.25], ['fuselaje', 0.2], ['avionica', 0.15]]);
  return {
    id: estado.siguienteId++,
    pieza,
    gravedad: gravedad ?? ponderado(r, [[1, 0.55], [2, 0.33], [3, 0.12]]),
    texto: elegir(r, TEXTOS_DEFECTO[pieza]),
    descubierto: false,
  };
}

export function crearAvion(estado, r, tipoId, { fabricado, horas = 0, condicion = 100, defectos = 0, horasDesdeRevision = 0 }) {
  const parte = () => Math.max(20, Math.min(100, condicion + entre(r, -10, 10)));
  const avion = {
    id: estado.siguienteId++,
    tipo: tipoId,
    matricula: matricula(estado.pais, r),
    fabricado,
    horas,
    ciclos: Math.round(horas * 0.8),
    partes: condicion >= 100 ? { motores: 100, tren: 100, fuselaje: 100 } : { motores: parte(), tren: parte(), fuselaje: parte() },
    defectos: [],
    horasDesdeRevision,
    horasHoy: 0,
    estado: 'tierra',
    lugar: estado.base,
    libreEn: 0,
    ruta: null,
    vuelo: null,
    tareas: [],
    stats: { vuelos: 0, beneficio: 0 },
  };
  for (let i = 0; i < defectos; i++) avion.defectos.push(nuevoDefecto(estado, r));
  return avion;
}

export const condicionMedia = (a) => (a.partes.motores + a.partes.tren + a.partes.fuselaje) / 3;
export const edad = (a, anio) => Math.max(0, anio - a.fabricado);

export function valorMercado(avion, anio) {
  const tipo = TIPOS[avion.tipo];
  const v = tipo.precio * Math.pow(0.92, edad(avion, anio)) * (0.45 + condicionMedia(avion) / 180);
  const defectos = avion.defectos.reduce((s, d) => s + costeReparacion(avion, d), 0);
  return Math.max(tipo.precio * 0.08, v - defectos);
}

export const costeInspeccion = (precio) => Math.max(15000, Math.round(precio * 0.015));

export function costeRevision(avion) {
  return Math.round(TIPOS[avion.tipo].costeHora * 15);
}

export function horasRevision(avion) {
  return TIPOS[avion.tipo].silueta === 'helice' ? 36 : 48;
}

export function costeReparacion(avion, defecto) {
  return Math.round(TIPOS[avion.tipo].precio * [0.004, 0.015, 0.05][defecto.gravedad - 1]);
}

const VENDEDORES = [
  'Una aerolínea nacional que renueva flota',
  'Un bróker de Miami',
  'Aerotransportes del Sur, en liquidación',
  'Un fondo de leasing de Ginebra',
  'Una compañía chárter británica',
  'Un operador de Sudamérica que reduce flota',
  'Un intermediario que no da muchos detalles',
];

function etiquetaEstado(cond) {
  return cond >= 85 ? 'Excelente' : cond >= 70 ? 'Bueno' : cond >= 55 ? 'Aceptable' : 'Para reformar';
}

export function ofertaSegundaMano(estado, r, anio, pistaMax = Infinity) {
  let candidatos = tiposDeSegundaMano(anio);
  const operables = candidatos.filter((t) => t.pista <= pistaMax);
  if (operables.length && r() < 0.75) candidatos = operables;
  const tipo = ponderado(r, candidatos.map((t) => [t, t.precio > 2e7 ? 0.25 : t.ficticio ? 0.4 : 1]));
  const maxEdad = Math.max(2, Math.min(22, anio - tipo.desde));
  const anios = entero(r, 2, maxEdad);
  const condicion = Math.max(25, Math.min(95, 100 - anios * 2.2 - entre(r, 0, 15)));
  const lambda = 0.3 + anios / 12 + (tipo.ficticio ? 0.6 : 0);
  let defectos = 0;
  for (let x = r(); x < lambda && defectos < 4; x += r()) defectos++;
  const vencida = r() < 0.15;
  const avion = crearAvion(estado, r, tipo.id, {
    fabricado: anio - anios,
    horas: Math.round(anios * entre(r, 1800, 3000)),
    condicion,
    defectos,
    horasDesdeRevision: vencida ? entre(r, 500, 700) : entre(r, 0, 450),
  });
  avion.lugar = null;
  // El precio se basa en lo que se ve, no en los defectos ocultos.
  const aparente = { ...avion, defectos: [] };
  const precio = Math.round((valorMercado(aparente, anio) * entre(r, 0.85, 1.15)) / 1000) * 1000;
  return {
    id: estado.siguienteId++,
    avion,
    precio,
    vendedor: tipo.ficticio ? 'Un chatarrero con contactos en el Este' : elegir(r, VENDEDORES),
    anunciado: etiquetaEstado(condicionMedia(avion) + entre(r, 0, 15)),
    inspeccionada: false,
  };
}

export function generarMercado(estado, r, anio, pistaMax) {
  const ofertas = [];
  for (let i = 0; i < 6; i++) ofertas.push(ofertaSegundaMano(estado, r, anio, pistaMax));
  return ofertas;
}

export function catalogoNuevos(anio) {
  return tiposEnProduccion(anio);
}

// Desgaste tras un vuelo. Puede aparecer un defecto nuevo, oculto.
export function desgastar(estado, r, avion, horas) {
  const tipo = TIPOS[avion.tipo];
  avion.horas += horas;
  avion.ciclos += 1;
  avion.horasDesdeRevision += horas;
  avion.horasHoy += horas;
  avion.partes.motores = Math.max(5, avion.partes.motores - horas * 0.025 * tipo.fiabilidad);
  avion.partes.tren = Math.max(5, avion.partes.tren - 0.05 * tipo.fiabilidad);
  avion.partes.fuselaje = Math.max(5, avion.partes.fuselaje - 0.015 - horas * 0.005);
  const p = horas * 0.0007 * tipo.fiabilidad * (1 + (100 - condicionMedia(avion)) / 50);
  if (r() < p) avion.defectos.push(nuevoDefecto(estado, r, r() < 0.8 ? 1 : 2));
}

// Revisión: recupera las piezas hasta un techo que baja con la edad y descubre la mayoría de
// los defectos ocultos.
export function aplicarRevision(avion, r, anio) {
  const techo = Math.max(55, 100 - edad(avion, anio) * 1.2);
  for (const k of Object.keys(avion.partes)) {
    avion.partes[k] = Math.max(avion.partes[k], Math.min(techo, avion.partes[k] + 15));
  }
  avion.horasDesdeRevision = 0;
  const descubiertos = [];
  for (const d of avion.defectos) {
    if (!d.descubierto && r() < 0.7) {
      d.descubierto = true;
      descubiertos.push(d);
    }
  }
  return descubiertos;
}

export const nombrePieza = (pieza) => PIEZAS[pieza].nombre;
