// Tipos de avión.
//
// Cada dato tiene su fuente y su nivel de confianza en FUENTES.md. Los campos de la lista
// `aprox` son aproximaciones para el juego: coherentes entre sí y con la época, pero no
// verificadas con dos fuentes.
//
//   plazas       configuración típica de los 70 en una clase
//   alcance      km con todas las plazas ocupadas y reservas
//   alcanceMax   km con carga reducida (más allá de `alcance` hay que quitar pasajeros)
//   crucero      km/h de crucero normal (en el Concorde, la supersónica)
//   mtow         peso máximo al despegue en toneladas (para tasas de aterrizaje)
//   pistaMTOW    metros de pista para despegar al peso máximo, a nivel del mar y 15 °C
//   pistaMin     metros mínimos para aterrizar y operar con poco peso (por debajo, no puede)
//   consumo      kg de combustible por hora de bloque
//   tecnica      tripulantes de cabina de mando (3 = con mecánico de vuelo)
//   hidraulicos  sistemas hidráulicos independientes (redundancia)
//   catMax       categoría ILS más baja con la que puede aterrizar (1, 2 o 3)
//   precio       dólares de un avión nuevo en su época (o de referencia si ya no se fabrica)
//   repuestos    1 normal; más alto = repuestos y reparaciones más lentos
//   config       para dibujarlo: ala, posición de motores y cola

const T = (id, datos) => ({
  tecnica: 2, hidraulicos: 2, catMax: 1, repuestos: 1, ficticio: false, descripcion: '', aprox: [], ...datos, id,
});

const APROX_HABITUAL = ['alcance', 'alcanceMax', 'pistaMin', 'consumo', 'precio', 'crucero'];

export const TIPOS = Object.fromEntries([
  T('c212', {
    nombre: 'CASA C-212 Aviocar', corto: 'C-212', fabricante: 'CASA', clase: 'regional', mtow: 6.3,
    motor: 'tpe331', nMotores: 2, plazas: 19, alcance: 700, alcanceMax: 1400, crucero: 340,
    pistaMTOW: 600, pistaMin: 400, consumo: 280, precio: 1.3e6, entrada: 1974, finProduccion: 2013,
    config: { ala: 'alta', motores: 'helices-ala', cola: 'convencional', tren: 'fijo' },
    descripcion: 'Turbohélice español de despegue corto y tren fijo. Pensado para pistas pequeñas.',
    aprox: [...APROX_HABITUAL, 'pistaMTOW'],
  }),
  T('f27', {
    nombre: 'Fokker F27 Friendship', corto: 'F27', fabricante: 'Fokker', clase: 'regional', mtow: 19.8,
    motor: 'dart', nMotores: 2, plazas: 48, alcance: 1500, alcanceMax: 2200, crucero: 440,
    pistaMTOW: 1200, pistaMin: 800, consumo: 650, precio: 3.0e6, entrada: 1958, finProduccion: 1987,
    config: { ala: 'alta', motores: 'helices-ala', cola: 'convencional' },
    descripcion: 'El turbohélice europeo más vendido de su época. Opera en pistas cortas recortando carga.',
    aprox: APROX_HABITUAL,
  }),
  T('hs748', {
    nombre: 'Hawker Siddeley HS 748', corto: 'HS 748', fabricante: 'Hawker Siddeley', clase: 'regional', mtow: 21.1,
    motor: 'dart', nMotores: 2, plazas: 48, alcance: 1700, alcanceMax: 2600, crucero: 450,
    pistaMTOW: 1225, pistaMin: 750, consumo: 620, precio: 2.8e6, entrada: 1962, finProduccion: 1988,
    config: { ala: 'baja', motores: 'helices-ala', cola: 'convencional' },
    descripcion: 'Turbohélice británico robusto, apreciado en pistas difíciles.',
    aprox: ['alcanceMax', 'pistaMin', 'consumo', 'precio'],
  }),
  T('viscount', {
    nombre: 'Vickers Viscount 800', corto: 'Viscount', fabricante: 'Vickers', clase: 'cuatrimotor', mtow: 30.4,
    motor: 'dart', nMotores: 4, plazas: 65, alcance: 2000, alcanceMax: 2800, crucero: 510,
    pistaMTOW: 1600, pistaMin: 1100, consumo: 1000, precio: 1.8e6, entrada: 1957, finProduccion: 1964,
    config: { ala: 'baja', motores: 'helices-ala', cola: 'convencional' },
    descripcion: 'Clásico de los 50. Barato de comprar y con muchas horas encima.',
    aprox: [...APROX_HABITUAL, 'pistaMTOW'],
  }),
  T('caravelle', {
    nombre: 'Sud Aviation Caravelle VI-R', corto: 'Caravelle', fabricante: 'Sud Aviation', clase: 'estrecho', mtow: 50,
    motor: 'avon', nMotores: 2, plazas: 80, alcance: 1700, alcanceMax: 2300, crucero: 780,
    pistaMTOW: 2000, pistaMin: 1400, consumo: 2600, precio: 3.5e6, entrada: 1959, finProduccion: 1972,
    config: { ala: 'baja', motores: 'cola', cola: 'cruciforme' },
    descripcion: 'El primer reactor europeo de corto radio, con los motores en la cola. Elegante y sediento.',
    aprox: [...APROX_HABITUAL, 'pistaMTOW'],
  }),
  T('f28', {
    nombre: 'Fokker F28 Fellowship 1000', corto: 'F28', fabricante: 'Fokker', clase: 'estrecho', mtow: 29.5,
    motor: 'spey', nMotores: 2, plazas: 65, alcance: 1700, alcanceMax: 2400, crucero: 680,
    pistaMTOW: 1600, pistaMin: 1100, consumo: 1900, precio: 5.5e6, entrada: 1969, finProduccion: 1987,
    config: { ala: 'baja', motores: 'cola', cola: 'T' },
    descripcion: 'Birreactor regional de cola en T, hecho para pistas cortas.',
    aprox: [...APROX_HABITUAL, 'pistaMTOW'],
  }),
  T('bac111', {
    nombre: 'BAC One-Eleven 500', corto: 'One-Eleven', fabricante: 'BAC', clase: 'estrecho', mtow: 47.4,
    motor: 'spey', nMotores: 2, plazas: 109, alcance: 2400, alcanceMax: 3200, crucero: 740,
    pistaMTOW: 2100, pistaMin: 1400, consumo: 2500, precio: 5.5e6, entrada: 1968, finProduccion: 1982,
    config: { ala: 'baja', motores: 'cola', cola: 'T' },
    descripcion: 'Birreactor británico muy usado en vuelos chárter a Canarias y el Mediterráneo.',
    aprox: [...APROX_HABITUAL, 'pistaMTOW'],
  }),
  T('dc9', {
    nombre: 'McDonnell Douglas DC-9-30', corto: 'DC-9', fabricante: 'McDonnell Douglas', clase: 'estrecho', mtow: 49.9,
    motor: 'jt8d', nMotores: 2, plazas: 115, alcance: 2400, alcanceMax: 3300, crucero: 800,
    pistaMTOW: 2100, pistaMin: 1400, consumo: 2800, precio: 6.5e6, entrada: 1967, finProduccion: 1982,
    config: { ala: 'baja', motores: 'cola', cola: 'T' },
    descripcion: 'El caballo de batalla de las rutas cortas.',
    aprox: APROX_HABITUAL,
  }),
  T('b737', {
    nombre: 'Boeing 737-200 Advanced', corto: '737-200', fabricante: 'Boeing', clase: 'estrecho', mtow: 52.4,
    motor: 'jt8d', nMotores: 2, plazas: 120, alcance: 3300, alcanceMax: 4200, crucero: 750,
    pistaMTOW: 1830, pistaMin: 1250, consumo: 2900, precio: 7.5e6, entrada: 1968, finProduccion: 1988,
    config: { ala: 'baja', motores: 'ala', cola: 'convencional' },
    descripcion: 'Birreactor de corto y medio radio. Fiable, polivalente y fácil de vender.',
    aprox: APROX_HABITUAL,
  }),
  T('kr134', {
    nombre: 'Krasnov KR-134', corto: 'KR-134', fabricante: 'Krasnov', clase: 'estrecho', ficticio: true, mtow: 47,
    motor: 'd31', nMotores: 2, plazas: 76, alcance: 2000, alcanceMax: 2900, crucero: 800,
    pistaMTOW: 2200, pistaMin: 1300, consumo: 2700, precio: 2.5e6, entrada: 1967, finProduccion: 1984,
    repuestos: 2,
    config: { ala: 'baja', motores: 'cola', cola: 'T' },
    descripcion: 'Birreactor del bloque del Este. Robusto y barato, pero ruidoso y sediento. Los repuestos tardan.',
    aprox: ['plazas', 'pistaMTOW', ...APROX_HABITUAL],
  }),
  T('vk42', {
    nombre: 'Volkov VK-42', corto: 'VK-42', fabricante: 'Volkov', clase: 'regional', ficticio: true, mtow: 21,
    motor: 'tv24', nMotores: 2, plazas: 48, alcance: 1300, alcanceMax: 2000, crucero: 440,
    pistaMTOW: 1300, pistaMin: 700, consumo: 850, precio: 1.2e6, entrada: 1964, finProduccion: 1980,
    repuestos: 2,
    config: { ala: 'alta', motores: 'helices-ala', cola: 'T' },
    descripcion: 'Turbohélice del Este, rústico y barato. Gasta más que un F27 y sus motores piden taller a menudo.',
    aprox: ['plazas', 'pistaMTOW', ...APROX_HABITUAL],
  }),
  T('b727', {
    nombre: 'Boeing 727-200 Advanced', corto: '727-200', fabricante: 'Boeing', clase: 'estrecho', mtow: 95.3,
    motor: 'jt8d', nMotores: 3, tecnica: 3, hidraulicos: 3, plazas: 150, alcance: 4000, alcanceMax: 4700, crucero: 860,
    pistaMTOW: 2600, pistaMin: 1500, consumo: 4600, precio: 10.5e6, entrada: 1967, finProduccion: 1984,
    config: { ala: 'baja', motores: 'cola', cola: 'T', motorCola: 'conducto' },
    descripcion: 'Trirreactor rápido y capaz, con mecánico de vuelo. Gasta mucho.',
    aprox: [...APROX_HABITUAL, 'pistaMTOW'],
  }),
  T('b707', {
    nombre: 'Boeing 707-320B', corto: '707', fabricante: 'Boeing', clase: 'cuatrimotor', mtow: 151.3,
    motor: 'jt3d', nMotores: 4, tecnica: 3, hidraulicos: 2, plazas: 180, alcance: 7500, alcanceMax: 9200, crucero: 870,
    pistaMTOW: 3000, pistaMin: 2000, consumo: 7000, precio: 11e6, entrada: 1962, finProduccion: 1979,
    config: { ala: 'baja', motores: 'ala', cola: 'convencional' },
    descripcion: 'El avión que hizo cotidianos los vuelos intercontinentales.',
    aprox: APROX_HABITUAL,
  }),
  T('dc8', {
    nombre: 'Douglas DC-8-63', corto: 'DC-8', fabricante: 'Douglas', clase: 'cuatrimotor', mtow: 158.7,
    motor: 'jt3d', nMotores: 4, tecnica: 3, hidraulicos: 2, plazas: 220, alcance: 7000, alcanceMax: 9000, crucero: 870,
    pistaMTOW: 3000, pistaMin: 2000, consumo: 7800, precio: 12e6, entrada: 1967, finProduccion: 1972,
    config: { ala: 'baja', motores: 'ala', cola: 'convencional' },
    descripcion: 'Cuatrimotor alargado: mucha capacidad para cruzar océanos.',
    aprox: ['plazas', ...APROX_HABITUAL],
  }),
  T('a300', {
    nombre: 'Airbus A300B4', corto: 'A300', fabricante: 'Airbus', clase: 'ancho', mtow: 157.5,
    motor: 'cf6', nMotores: 2, tecnica: 3, hidraulicos: 3, catMax: 2, plazas: 250, alcance: 4800, alcanceMax: 6000, crucero: 850,
    pistaMTOW: 2600, pistaMin: 1700, consumo: 5400, precio: 26e6, entrada: 1975, finProduccion: 1984,
    config: { ala: 'baja', motores: 'ala', cola: 'convencional' },
    descripcion: 'El primer bimotor de fuselaje ancho. Mucha capacidad gastando poco para su tamaño.',
    aprox: ['plazas', 'catMax', 'pistaMTOW', ...APROX_HABITUAL],
  }),
  T('l1011', {
    nombre: 'Lockheed L-1011 TriStar 1', corto: 'TriStar', fabricante: 'Lockheed', clase: 'ancho', mtow: 195,
    motor: 'rb211', nMotores: 3, tecnica: 3, hidraulicos: 4, catMax: 3, plazas: 280, alcance: 5000, alcanceMax: 6500, crucero: 890,
    pistaMTOW: 2500, pistaMin: 1700, consumo: 7500, precio: 24e6, entrada: 1972, finProduccion: 1984,
    config: { ala: 'baja', motores: 'ala+cola', cola: 'convencional', motorCola: 'conducto' },
    descripcion: 'Trirreactor muy avanzado: aterrizaje automático con niebla densa de serie.',
    aprox: ['plazas', 'pistaMTOW', ...APROX_HABITUAL],
  }),
  T('dc10', {
    nombre: 'McDonnell Douglas DC-10-30', corto: 'DC-10', fabricante: 'McDonnell Douglas', clase: 'ancho', mtow: 263,
    motor: 'cf6', nMotores: 3, tecnica: 3, hidraulicos: 3, catMax: 2, plazas: 270, alcance: 7000, alcanceMax: 9600, crucero: 880,
    pistaMTOW: 3200, pistaMin: 2100, consumo: 9500, precio: 30e6, entrada: 1972, finProduccion: 1988,
    config: { ala: 'baja', motores: 'ala+cola', cola: 'convencional', motorCola: 'aleta' },
    descripcion: 'Trirreactor de largo radio.',
    aprox: ['plazas', 'catMax', 'pistaMTOW', ...APROX_HABITUAL],
  }),
  T('b747', {
    nombre: 'Boeing 747-200B', corto: '747', fabricante: 'Boeing', clase: 'ancho', mtow: 352,
    motor: 'jt9d', nMotores: 4, tecnica: 3, hidraulicos: 4, catMax: 2, plazas: 400, alcance: 9800, alcanceMax: 11500, crucero: 900,
    pistaMTOW: 3300, pistaMin: 2200, consumo: 12500, precio: 38e6, entrada: 1971, finProduccion: 1991,
    config: { ala: 'baja', motores: 'ala', cola: 'convencional', joroba: true },
    descripcion: 'El jumbo. Solo es rentable si lo llenas.',
    aprox: ['plazas', 'catMax', 'pistaMTOW', ...APROX_HABITUAL],
  }),
  T('concorde', {
    nombre: 'Aérospatiale-BAC Concorde', corto: 'Concorde', fabricante: 'Aérospatiale-BAC', clase: 'supersonico', mtow: 185,
    motor: 'olympus', nMotores: 4, tecnica: 3, hidraulicos: 3, plazas: 100, alcance: 6500, alcanceMax: 7200,
    crucero: 2150, cruceroSubsonico: 950, pistaMTOW: 3300, pistaMin: 2600, consumo: 20500, precio: 46e6,
    entrada: 1976, finProduccion: 1979, repuestos: 1.5, unidades: 20,
    config: { ala: 'delta', motores: 'delta', cola: 'delta' },
    descripcion: 'Mach 2 sobre el océano. Carísimo de comprar y de volar; solo rentable con pasaje premium.',
    aprox: ['alcance', 'pistaMTOW', 'pistaMin', 'consumo', 'precio'],
  }),

  // Llegan con los años (datos de referencia, pendientes de revisión detallada)
  T('md80', {
    nombre: 'McDonnell Douglas MD-80', corto: 'MD-80', fabricante: 'McDonnell Douglas', clase: 'estrecho', mtow: 63.5,
    motor: 'jt8d200', nMotores: 2, catMax: 2, plazas: 150, alcance: 3800, alcanceMax: 4600, crucero: 810,
    pistaMTOW: 2200, pistaMin: 1500, consumo: 3200, precio: 22e6, entrada: 1980, finProduccion: 1999,
    config: { ala: 'baja', motores: 'cola', cola: 'T' }, aprox: ['plazas', 'catMax', 'pistaMTOW', ...APROX_HABITUAL],
  }),
  T('b767', {
    nombre: 'Boeing 767-200', corto: '767', fabricante: 'Boeing', clase: 'ancho', mtow: 136,
    motor: 'cf680', nMotores: 2, hidraulicos: 3, catMax: 3, plazas: 216, alcance: 5500, alcanceMax: 7000, crucero: 850,
    pistaMTOW: 2400, pistaMin: 1600, consumo: 4800, precio: 40e6, entrada: 1982, finProduccion: 2000,
    config: { ala: 'baja', motores: 'ala', cola: 'convencional' }, aprox: ['plazas', 'catMax', 'pistaMTOW', ...APROX_HABITUAL],
  }),
  T('b757', {
    nombre: 'Boeing 757-200', corto: '757', fabricante: 'Boeing', clase: 'estrecho', mtow: 108,
    motor: 'rb211535', nMotores: 2, hidraulicos: 3, catMax: 3, plazas: 200, alcance: 5800, alcanceMax: 7200, crucero: 850,
    pistaMTOW: 2100, pistaMin: 1400, consumo: 3800, precio: 35e6, entrada: 1983, finProduccion: 2004,
    config: { ala: 'baja', motores: 'ala', cola: 'convencional' }, aprox: ['plazas', 'catMax', 'pistaMTOW', ...APROX_HABITUAL],
  }),
  T('b733', {
    nombre: 'Boeing 737-300', corto: '737-300', fabricante: 'Boeing', clase: 'estrecho', mtow: 56.5,
    motor: 'cfm56', nMotores: 2, catMax: 2, plazas: 140, alcance: 4200, alcanceMax: 5000, crucero: 790,
    pistaMTOW: 2000, pistaMin: 1400, consumo: 2600, precio: 25e6, entrada: 1984, finProduccion: 1999,
    config: { ala: 'baja', motores: 'ala', cola: 'convencional' }, aprox: ['plazas', 'catMax', 'pistaMTOW', ...APROX_HABITUAL],
  }),
  T('atr42', {
    nombre: 'ATR 42', corto: 'ATR 42', fabricante: 'ATR', clase: 'regional', mtow: 16.7,
    motor: 'pw100', nMotores: 2, plazas: 48, alcance: 1300, alcanceMax: 1800, crucero: 490,
    pistaMTOW: 1100, pistaMin: 800, consumo: 600, precio: 7e6, entrada: 1985, finProduccion: 2030,
    config: { ala: 'alta', motores: 'helices-ala', cola: 'T' }, aprox: ['plazas', 'pistaMTOW', ...APROX_HABITUAL],
  }),
  T('a320', {
    nombre: 'Airbus A320', corto: 'A320', fabricante: 'Airbus', clase: 'estrecho', mtow: 73.5,
    motor: 'cfm56', nMotores: 2, hidraulicos: 3, catMax: 3, plazas: 150, alcance: 5000, alcanceMax: 5900, crucero: 830,
    pistaMTOW: 2100, pistaMin: 1400, consumo: 2500, precio: 32e6, entrada: 1988, finProduccion: 2030,
    config: { ala: 'baja', motores: 'ala', cola: 'convencional' }, aprox: ['plazas', 'catMax', 'pistaMTOW', ...APROX_HABITUAL],
  }),
  T('f100', {
    nombre: 'Fokker 100', corto: 'F100', fabricante: 'Fokker', clase: 'estrecho', mtow: 43,
    motor: 'tay', nMotores: 2, catMax: 2, plazas: 107, alcance: 2800, alcanceMax: 3300, crucero: 760,
    pistaMTOW: 1800, pistaMin: 1200, consumo: 2100, precio: 20e6, entrada: 1988, finProduccion: 1997,
    config: { ala: 'baja', motores: 'cola', cola: 'T' }, aprox: ['plazas', 'catMax', 'pistaMTOW', ...APROX_HABITUAL],
  }),
].map((t) => [t.id, t]));

// Programa de mantenimiento por clase de avión. Intervalos del orden de los programas de los
// 70 (la revisión A del 737-200 era de 125 h, la C de 3.000 h y la estructural de 20.000 h);
// costes y duraciones aproximados.
const PROGRAMA = {
  regional:    { A: { horas: 150, coste: 1500 }, C: { horas: 2500, dias: 5, coste: 40e3 }, D: { horas: 16000, dias: 20, coste: 350e3 } },
  estrecho:    { A: { horas: 150, coste: 3000 }, C: { horas: 3000, dias: 6, coste: 120e3 }, D: { horas: 20000, dias: 25, coste: 900e3 } },
  cuatrimotor: { A: { horas: 150, coste: 4000 }, C: { horas: 3000, dias: 8, coste: 250e3 }, D: { horas: 18000, dias: 30, coste: 1.5e6 } },
  ancho:       { A: { horas: 200, coste: 8000 }, C: { horas: 3500, dias: 10, coste: 450e3 }, D: { horas: 24000, dias: 40, coste: 3e6 } },
  supersonico: { A: { horas: 100, coste: 25e3 }, C: { horas: 2000, dias: 14, coste: 1.5e6 }, D: { horas: 12000, dias: 60, coste: 8e6 } },
};

export function programa(tipo) {
  const p = PROGRAMA[tipo.clase];
  // Los trirreactores y aviones grandes de cada clase cuestan algo más de revisar.
  const escala = tipo.clase === 'estrecho' && tipo.plazas > 130 ? 1.3 : 1;
  return {
    A: { ...p.A, coste: p.A.coste * escala },
    C: { ...p.C, coste: p.C.coste * escala },
    D: { ...p.D, coste: p.D.coste * escala },
  };
}

// Tipos que se pueden comprar nuevos ese año.
export function tiposEnProduccion(anio) {
  return Object.values(TIPOS).filter((t) => t.entrada <= anio && anio <= t.finProduccion);
}

// Tipos que pueden aparecer de segunda mano: al menos dos años volando. El Concorde nunca.
export function tiposDeSegundaMano(anio) {
  return Object.values(TIPOS).filter((t) => t.entrada <= anio - 2 && t.clase !== 'supersonico');
}

// Tripulación por vuelo: la de cabina de mando más un tripulante de cabina por cada 50 plazas.
export function tripulacion(tipo) {
  return tipo.tecnica + Math.ceil(tipo.plazas / 50);
}

export const esReactor = (tipo) => tipo.config.motores !== 'helices-ala';
