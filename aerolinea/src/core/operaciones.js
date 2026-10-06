// Compatibilidad entre avión, ruta y aeropuerto.
//
// No basta con que el alcance dé: cuentan la pista (y la altitud del aeropuerto), el peso, la
// infraestructura, las normas para bimotores lejos de tierra y las restricciones de cada
// aeropuerto. El resultado distingue entre «no puede» y «puede, con menos plazas».

import { TIPOS } from '../data/aviones.js';
import { POR_ID, TODOS, pistaEn, abiertoEn } from '../data/aeropuertos.js';
import { distanciaKm, fraccionSobreMar, distanciaMaxAlternativo } from './geo.js';

// Los aeropuertos altos necesitan más pista: el aire es menos denso. Simplificación: un 12 %
// más por cada 1.000 m de elevación.
export function pistaEfectiva(aeropuerto, anio) {
  return pistaEn(aeropuerto, anio) / (1 + (0.12 * aeropuerto.elev) / 1000);
}

// Pesos aproximados por clase de avión (fracción del peso máximo al despegue que es avión
// vacío) y peso de cada pasajero con su equipaje. Aproximaciones de juego.
const VACIO = { regional: 0.57, estrecho: 0.5, cuatrimotor: 0.45, ancho: 0.5, supersonico: 0.43 };
const T_POR_PASAJERO = 0.095;

// Fracción de la carga de pago (pasajeros) con la que puede despegar de ese aeropuerto en un
// tramo de esa distancia. La distancia de despegue crece con el cuadrado del peso, así que con
// poca pista hay que elegir entre combustible y pasajeros; y más allá del alcance con todas las
// plazas, cada km de más se paga en asientos.
export function cargaPosible(tipo, aeropuerto, anio, distancia) {
  const pista = pistaEfectiva(aeropuerto, anio);
  if (pista < tipo.pistaMin) return 0;
  const mtow = tipo.mtow;
  const vacio = mtow * VACIO[tipo.clase];
  const carga = tipo.plazas * T_POR_PASAJERO;
  const combustibleMax = Math.max(mtow * 0.1, mtow - vacio - carga);
  const combustible = combustibleMax * (0.15 + (0.85 * distancia) / tipo.alcance);
  const pesoMax = mtow * Math.min(1, Math.sqrt(pista / tipo.pistaMTOW));
  return Math.max(0, Math.min(1, (pesoMax - vacio - combustible) / carga));
}

// Distancia máxima a un aeropuerto utilizable para un bimotor. Hasta 1985, una hora de vuelo
// con un motor; después llegan las autorizaciones ETOPS (120 minutos en 1985 y 180 en 1988)
// para los bimotores modernos.
export function limiteBimotor(tipo, anio) {
  if (tipo.nMotores > 2) return Infinity;
  const velocidadUnMotor = Math.min(tipo.crucero, 900) * 0.8;
  const moderno = tipo.entrada >= 1980;
  const minutos = anio >= 1988 && moderno ? 180 : anio >= 1985 && moderno ? 120 : 60;
  return (velocidadUnMotor * minutos) / 60;
}

export function duracionTramo(tipo, distancia, sobreMar) {
  if (tipo.clase !== 'supersonico') return Math.round((distancia / tipo.crucero) * 60 + 30);
  // Supersónico solo sobre el mar: sobre tierra, el estampido sónico lo obliga a ir subsónico.
  const horas = (distancia * sobreMar) / tipo.crucero + (distancia * (1 - sobreMar)) / tipo.cruceroSubsonico;
  return Math.round(horas * 60 + 35);
}

const cache = new Map();

// Evalúa un tramo en un sentido. `anio` puede llevar decimales.
export function evaluarTramo(tipoId, origenId, destinoId, anio) {
  const clave = `${tipoId}|${origenId}|${destinoId}|${Math.floor(anio * 12)}`;
  if (cache.has(clave)) return cache.get(clave);
  const r = calcular(TIPOS[tipoId], POR_ID[origenId], POR_ID[destinoId], anio);
  if (cache.size > 5000) cache.clear();
  cache.set(clave, r);
  return r;
}

function calcular(tipo, o, d, anio) {
  const distancia = distanciaKm(o, d);
  const sobreMar = tipo.clase === 'supersonico' || tipo.nMotores === 2 ? fraccionSobreMar(o, d) : 0;
  const base = { distancia, sobreMar, duracion: duracionTramo(tipo, distancia, sobreMar), restricciones: [] };
  const no = (motivo) => ({ ...base, posible: false, motivo, plazasMax: 0 });

  if (!abiertoEn(d, Math.floor(anio))) return no(`${d.nombre} todavía no existe`);
  if (distancia > tipo.alcanceMax) return no(`Fuera de alcance: ${Math.round(distancia)} km, máximo ${tipo.alcanceMax}`);

  if (tipo.clase === 'ancho' && Math.min(o.tam, d.tam) < 3) return no('El aeropuerto no tiene medios para un avión de fuselaje ancho');
  if (tipo.clase === 'supersonico' && Math.min(o.tam, d.tam) < 3) return no('El Concorde solo opera en aeropuertos grandes con asistencia especializada');
  for (const a of [o, d]) {
    const p = (a.prohibido ?? []).find((x) => x.tipo === tipo.id && anio < x.hasta);
    if (p) return no(p.motivo);
  }

  const restricciones = [];
  // Despegue desde el origen con el combustible del tramo; el aterrizaje en destino solo exige
  // la pista mínima.
  const carga = cargaPosible(tipo, o, anio, distancia);
  const pistaO = Math.round(pistaEn(o, anio));
  const pistaD = Math.round(pistaEn(d, anio));
  if (pistaEfectiva(d, anio) < tipo.pistaMin) return no(`Pista demasiado corta en ${d.id} (${pistaD} m${d.elev > 1000 ? `, a ${d.elev} m de altitud` : ''})`);
  if (carga <= 0.3) {
    const porPista = pistaEfectiva(o, anio) < tipo.pistaMTOW;
    return no(porPista ? `Pista demasiado corta en ${o.id} para ese tramo (${pistaO} m${o.elev > 1000 ? ` a ${o.elev} m` : ''})` : `Fuera de alcance con pasaje: ${Math.round(distancia)} km`);
  }
  if (carga < 1) {
    const plazas = Math.floor(tipo.plazas * carga);
    restricciones.push(pistaEfectiva(o, anio) < tipo.pistaMTOW
      ? `Pista corta en ${o.id} (${pistaO} m${o.elev > 1000 ? ` a ${o.elev} m` : ''}): máximo ${plazas} plazas`
      : `Por alcance: máximo ${plazas} plazas`);
  }

  const limite = limiteBimotor(tipo, anio);
  if (limite < Infinity && distancia > limite) {
    const utiles = TODOS.filter((a) => abiertoEn(a, Math.floor(anio)) && pistaEfectiva(a, anio) >= tipo.pistaMin);
    const lejos = distanciaMaxAlternativo(o, d, utiles);
    if (lejos > limite) {
      return no(`Bimotor demasiado lejos de un aeropuerto en ruta (${Math.round(lejos)} km; la norma permite ${Math.round(limite)})`);
    }
  }

  if (tipo.clase === 'supersonico' && sobreMar < 0.6) {
    restricciones.push(`Solo el ${Math.round(sobreMar * 100)} % del trayecto es sobre el mar: el resto, a velocidad subsónica`);
  }

  const r = { ...base, posible: true, motivo: null, plazasMax: Math.floor(tipo.plazas * Math.min(1, carga)), restricciones };
  return r;
}

// Evalúa la ida y la vuelta: lo que manda es el peor de los dos sentidos.
export function evaluarRuta(tipoId, origenId, destinoId, anio) {
  const ida = evaluarTramo(tipoId, origenId, destinoId, anio);
  const vuelta = evaluarTramo(tipoId, destinoId, origenId, anio);
  if (!ida.posible) return ida;
  if (!vuelta.posible) return vuelta;
  const restricciones = [...new Set([...ida.restricciones, ...vuelta.restricciones])];
  return { ...ida, plazasMax: Math.min(ida.plazasMax, vuelta.plazasMax), restricciones };
}
