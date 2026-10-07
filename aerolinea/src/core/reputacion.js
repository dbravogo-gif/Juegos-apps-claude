// Reputación por dimensiones (CRITERIOS 29): puntualidad, seguridad, servicio y prestigio,
// más la posición de precio, que sale de las tarifas. Pocas características que influyen en
// a quién elige el pasajero; en pantalla solo se ven en palabras.
//
// Por dentro son números de 0 a 100:
//   puntualidad  media móvil de los últimos vuelos (a tiempo, con retraso, cancelados)
//   seguridad    baja con incidentes y accidentes y se recupera despacio volando limpio
//   servicio     media móvil del servicio a bordo y del estado de los aviones
//   prestigio    lento: red, flota moderna o de lujo, años sin accidentes

export const DIMENSIONES = ['puntualidad', 'seguridad', 'servicio', 'prestigio'];

export const reputacionInicial = () => ({ puntualidad: 60, seguridad: 60, servicio: 50, prestigio: 20 });

// Lo que pesa cada dimensión al elegir compañía según el tipo de ruta.
export const PREFERENCIAS = {
  turistica: { precio: 2.2, mercado: 1.2, pesos: { puntualidad: 0.25, seguridad: 0.35, servicio: 0.2, prestigio: 0.2 } },
  mixta: { precio: 1.6, mercado: 0.9, pesos: { puntualidad: 0.35, seguridad: 0.3, servicio: 0.15, prestigio: 0.2 } },
  negocios: { precio: 1.0, mercado: 0.6, pesos: { puntualidad: 0.45, seguridad: 0.2, servicio: 0.15, prestigio: 0.2 } },
};

export function notaReputacion(rep, tipo = 'mixta') {
  const p = PREFERENCIAS[tipo].pesos;
  return rep.puntualidad * p.puntualidad + rep.seguridad * p.seguridad + rep.servicio * p.servicio + rep.prestigio * p.prestigio;
}

const acotar = (x) => Math.max(0, Math.min(100, x));
const acercar = (actual, objetivo, paso) => actual + (objetivo - actual) * paso;

// --- Cambios

// Tras cada vuelo: puntualidad y servicio.
export function trasVuelo(rep, { retraso = 0, desviado = false, servicio = 'estandar', edadAvion = 10 }) {
  const puntual = desviado ? 25 : retraso <= 15 ? 85 : retraso <= 60 ? 55 : 25;
  rep.puntualidad = acotar(acercar(rep.puntualidad, puntual, 0.02));
  const nivel = { basico: 30, estandar: 55, superior: 80 }[servicio] + (edadAvion > 20 ? -10 : edadAvion < 5 ? 5 : 0);
  rep.servicio = acotar(acercar(rep.servicio, nivel, 0.02));
}

export function trasCancelacion(rep) {
  rep.puntualidad = acotar(acercar(rep.puntualidad, 10, 0.03));
}

export function trasIncidente(rep, grave) {
  rep.seguridad = acotar(rep.seguridad - (grave ? 4 : 1));
}

export function trasAccidente(rep) {
  rep.seguridad = acotar(rep.seguridad - 35);
  rep.prestigio = acotar(rep.prestigio - 15);
}

export function trasInvestigacion(rep, negligencia) {
  if (negligencia) rep.seguridad = acotar(rep.seguridad - 15);
}

export function trasMulta(rep) {
  rep.seguridad = acotar(rep.seguridad - 3);
}

// Cada día: la seguridad se recupera despacio si no pasa nada (hasta 80).
export function diaria(rep) {
  if (rep.seguridad < 80) rep.seguridad = acotar(rep.seguridad + 0.04);
}

// Cada mes: el prestigio se acerca a lo que la compañía es.
export function mensual(rep, { rutas, anchos, supersonicos, edadMedia, anios, accidentesRecientes }) {
  const objetivo = 15 + 9 * Math.log2(1 + rutas) + (anchos ? 10 : 0) + (supersonicos ? 15 : 0)
    + (edadMedia < 8 ? 5 : edadMedia > 20 ? -5 : 0) + Math.min(15, anios) - 20 * accidentesRecientes;
  rep.prestigio = acotar(acercar(rep.prestigio, acotar(objetivo), 0.08));
}

// --- En palabras

export function etiqueta(valor) {
  if (valor >= 80) return 'excelente';
  if (valor >= 65) return 'buena';
  if (valor >= 45) return 'normal';
  if (valor >= 30) return 'regular';
  return 'mala';
}

export function etiquetaGeneral(rep) {
  return etiqueta(notaReputacion(rep, 'mixta'));
}

export function etiquetaPrecio(precioRelativo) {
  return precioRelativo < 0.9 ? 'bajo' : precioRelativo > 1.12 ? 'alto' : 'medio';
}
