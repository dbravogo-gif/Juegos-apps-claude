// Tipos de avión. Cifras aproximadas y redondeadas para el juego, no fichas técnicas.
//
//   plazas     configuración típica de una sola clase
//   alcance    km con carga normal
//   crucero    km/h
//   pista      metros de pista que necesita con carga normal
//   costeHora  dólares de 1976 por hora de vuelo: combustible, tripulación y reserva de mantenimiento
//   precio     dólares de un avión nuevo (o de referencia, si ya no se fabrica)
//   desde      año de entrada en servicio
//   hasta      último año en que se fabrica
//   fiabilidad multiplica el riesgo de origen mecánico (1 = normal)
//   silueta    'helice' o 'reactor', para el dibujo

const T = (id, nombre, corto, plazas, alcance, crucero, pista, costeHora, precio, desde, hasta, extra = {}) => ({
  id, nombre, corto, plazas, alcance, crucero, pista, costeHora, precio, desde, hasta,
  motores: 2, silueta: 'reactor', fiabilidad: 1, ficticio: false, descripcion: '', ...extra,
});

export const TIPOS = Object.fromEntries([
  T('f27', 'Fokker F27 Friendship', 'F27', 48, 1700, 460, 1100, 910, 2.6e6, 1958, 1987, {
    silueta: 'helice', descripcion: 'Turbohélice holandés de ala alta. Aterriza casi en cualquier sitio.',
  }),
  T('hs748', 'Hawker Siddeley HS 748', 'HS 748', 44, 1600, 450, 1100, 870, 2.3e6, 1962, 1988, {
    silueta: 'helice', fiabilidad: 1.05, descripcion: 'Turbohélice británico, robusto y lento.',
  }),
  T('viscount', 'Vickers Viscount 800', 'Viscount', 65, 2200, 510, 1500, 1260, 1.8e6, 1957, 1964, {
    silueta: 'helice', motores: 4, fiabilidad: 1.3, descripcion: 'Un clásico de los 50. Barato, pero con muchas horas encima.',
  }),
  T('caravelle', 'Sud Aviation Caravelle', 'Caravelle', 80, 1800, 780, 1900, 2100, 3.5e6, 1959, 1972, {
    fiabilidad: 1.2, descripcion: 'El primer reactor de corto alcance de Europa. Elegante y sediento.',
  }),
  T('bac111', 'BAC One-Eleven 500', 'One-Eleven', 99, 2700, 750, 2000, 2380, 4.8e6, 1968, 1982, {
    fiabilidad: 1.05, descripcion: 'Bimotor británico de cola en T, muy usado en vuelos chárter.',
  }),
  T('dc9', 'McDonnell Douglas DC-9-30', 'DC-9', 115, 2500, 800, 2000, 2660, 5.5e6, 1967, 1982, {
    descripcion: 'El caballo de batalla de las rutas cortas.',
  }),
  T('b737', 'Boeing 737-200', '737-200', 120, 3500, 780, 1900, 2800, 6.5e6, 1968, 1988, {
    descripcion: 'Bimotor de corto y medio radio. Fiable y fácil de vender.',
  }),
  T('b727', 'Boeing 727-200', '727', 155, 3700, 860, 2300, 3780, 8.5e6, 1967, 1984, {
    motores: 3, descripcion: 'Trirreactor rápido. Capaz, pero gasta mucho.',
  }),
  T('b707', 'Boeing 707-320B', '707', 180, 8500, 880, 3000, 5460, 9e6, 1959, 1979, {
    motores: 4, fiabilidad: 1.15, descripcion: 'El avión que inventó los vuelos intercontinentales.',
  }),
  T('dc8', 'Douglas DC-8-63', 'DC-8', 250, 7600, 870, 3200, 6440, 11e6, 1967, 1972, {
    motores: 4, fiabilidad: 1.1, descripcion: 'Cuatrimotor alargado. Mucha capacidad para cruzar el Atlántico.',
  }),
  T('dc10', 'McDonnell Douglas DC-10-30', 'DC-10', 270, 9600, 900, 3200, 8680, 24e6, 1972, 1989, {
    motores: 3, fiabilidad: 1.1, descripcion: 'Trirreactor de fuselaje ancho.',
  }),
  T('b747', 'Boeing 747-200B', '747', 420, 10000, 900, 3300, 11900, 35e6, 1971, 1991, {
    motores: 4, descripcion: 'El jumbo. Solo rentable si lo llenas.',
  }),

  // Ficticios
  T('vk42', 'Volkov VK-42', 'VK-42', 52, 1500, 430, 1050, 730, 1.1e6, 1966, 1990, {
    silueta: 'helice', fiabilidad: 2.6, ficticio: true,
    descripcion: 'Turbohélice del Este. Barato de comprar y de operar… y de fiabilidad discutible.',
  }),
  T('kr134', 'Krasnov KR-134', 'KR-134', 80, 2000, 820, 1800, 1820, 2.4e6, 1967, 1985, {
    fiabilidad: 2.2, ficticio: true,
    descripcion: 'Reactor del Este a precio de saldo. Los repuestos llegan cuando llegan.',
  }),

  // Llegan con los años
  T('md80', 'McDonnell Douglas MD-80', 'MD-80', 150, 3800, 810, 2200, 3220, 18e6, 1980, 1999, { fiabilidad: 0.85 }),
  T('b767', 'Boeing 767-200', '767', 216, 5500, 850, 2400, 5880, 40e6, 1982, 2000, { fiabilidad: 0.8 }),
  T('b757', 'Boeing 757-200', '757', 200, 5800, 850, 2100, 4480, 30e6, 1983, 2004, { fiabilidad: 0.8 }),
  T('b733', 'Boeing 737-300', '737-300', 140, 4200, 790, 2000, 3080, 22e6, 1984, 1999, { fiabilidad: 0.75 }),
  T('atr42', 'ATR 42', 'ATR 42', 48, 1300, 490, 1100, 840, 7e6, 1985, 2020, { silueta: 'helice', fiabilidad: 0.8 }),
  T('a320', 'Airbus A320', 'A320', 150, 5000, 830, 2100, 3080, 30e6, 1988, 2030, { fiabilidad: 0.6 }),
  T('f100', 'Fokker 100', 'F100', 107, 2800, 760, 1800, 2660, 18e6, 1988, 1997, { fiabilidad: 0.75 }),
].map((t) => [t.id, t]));

// Tipos que se pueden comprar nuevos ese año.
export function tiposEnProduccion(anio) {
  return Object.values(TIPOS).filter((t) => t.desde <= anio && anio <= t.hasta);
}

// Tipos que pueden aparecer de segunda mano: ya llevan al menos dos años volando.
export function tiposDeSegundaMano(anio) {
  return Object.values(TIPOS).filter((t) => t.desde <= anio - 2);
}

// Tripulación: dos pilotos, mecánico de vuelo en los de tres y cuatro motores y un tripulante de
// cabina por cada 50 plazas.
export function tripulacion(tipo) {
  return 2 + (tipo.motores >= 3 ? 1 : 0) + Math.ceil(tipo.plazas / 50);
}
