// Aerolíneas de la competencia.
//
// Unas 22 a lo largo de los 50 años, con 13–15 activas como máximo a la vez (CRITERIOS 26).
// Los nombres marcados `propuesta: true` son propuestas pendientes de que el autor los
// apruebe; los demás están aprobados. Entradas y salidas siguen la historia de la compañía en
// la que se inspiran, con alguna fecha ajustada para no pasar de 15 a la vez.
//
//   tipo       tradicional | regional | charter | bajoCoste | ultraBajoCoste | largoRadio
//   hubs       aeropuertos desde los que vuela (puede abrir más bases con los años)
//   zonas      países o regiones donde se siente fuerte (eligen rutas hacia ahí)
//   tamano     red relativa (1 = una gran tradicional europea de 1976)
//   precio     billete medio relativo al del mercado (1 = normal)
//   costes     coste por plaza relativo (1 = normal)
//   servicio   basico | estandar | superior
//   expansion  ganas de abrir rutas y bases (0–1)
//   riesgo     tolerancia al riesgo al estimar una ruta nueva (0–1)
//   copia      tendencia a copiar rutas que funcionan, incluidas las del jugador (0–1)
//   terquedad  cuánto aguanta una ruta que pierde dinero (0–1)
//   protegida  año hasta el que el Estado la rescata si pierde dinero (aerolíneas de bandera)
//   rep        reputación de partida: puntualidad, seguridad, servicio, prestigio (0–100)
//   plazas     plazas típicas por vuelo en medio radio, por época
//   fin        cómo desaparece: { anio, tipo: 'quiebra' | 'fusion' | 'cierre', con? }

const L = (id, datos) => ({
  propuesta: false, hasta: null, fin: null, protegida: null, bases: [], copia: 0.2, terquedad: 0.4,
  ...datos, id,
});

export const AEROLINEAS = [
  L('castilla', {
    nombre: 'Castilla', inspirada: 'Iberia', pais: 'ES', tipo: 'tradicional',
    hubs: ['MAD'], bases: ['BCN', 'LPA'], zonas: ['ES', 'Europa', 'Sudamérica', 'Norteamérica'],
    desde: 1976, tamano: 1.0, precio: 1.05, costes: 1.1, servicio: 'estandar',
    expansion: 0.35, riesgo: 0.3, copia: 0.15, terquedad: 0.7, protegida: 1995,
    rep: { puntualidad: 45, seguridad: 70, servicio: 60, prestigio: 70 },
    plazas: { 1976: 140, 1990: 160, 2005: 170 },
    descripcion: 'Tradicional, gran red, buena reputación y servicio alto. Protege sus mercados.',
  }),
  L('aviacutre', {
    nombre: 'Aviacutre', inspirada: 'Aviaco', pais: 'ES', tipo: 'regional', propuesta: true,
    hubs: ['MAD', 'PMI', 'LPA'], bases: ['TFN', 'BCN'], zonas: ['ES'],
    desde: 1976, hasta: 1999, fin: { anio: 1999, tipo: 'fusion', con: 'castilla' },
    tamano: 0.45, precio: 0.95, costes: 1.0, servicio: 'basico',
    expansion: 0.2, riesgo: 0.3, copia: 0.1, terquedad: 0.8, protegida: 1999,
    rep: { puntualidad: 45, seguridad: 60, servicio: 40, prestigio: 30 },
    plazas: { 1976: 110, 1990: 140 },
    descripcion: 'La compañía de las rutas nacionales e interinsulares. Sencilla y omnipresente.',
  }),
  L('espantax', {
    nombre: 'Espantax', inspirada: 'Spantax', pais: 'ES', tipo: 'charter', propuesta: true,
    hubs: ['LPA', 'PMI'], zonas: ['GB', 'DE', 'SE', 'DK', 'NO', 'NL', 'BE'],
    desde: 1976, hasta: 1988, fin: { anio: 1988, tipo: 'quiebra' },
    tamano: 0.3, precio: 0.8, costes: 0.8, servicio: 'basico',
    expansion: 0.4, riesgo: 0.6, copia: 0.3, terquedad: 0.5,
    rep: { puntualidad: 35, seguridad: 45, servicio: 35, prestigio: 25 },
    plazas: { 1976: 150 },
    descripcion: 'Chárter canario: turistas del norte de Europa a las islas y a Baleares.',
  }),
  L('lager', {
    nombre: 'Lager Airways', inspirada: 'Laker Airways', pais: 'GB', tipo: 'charter', propuesta: true,
    hubs: ['LGW'], zonas: ['ES', 'PT', 'GR', 'US'],
    desde: 1976, hasta: 1982, fin: { anio: 1982.1, tipo: 'quiebra' },
    tamano: 0.25, precio: 0.7, costes: 0.75, servicio: 'basico',
    expansion: 0.8, riesgo: 0.8, copia: 0.3, terquedad: 0.3,
    rep: { puntualidad: 50, seguridad: 60, servicio: 40, prestigio: 35 },
    plazas: { 1976: 180 },
    descripcion: 'Chárter británica con ganas de comerse el mundo a precio de saldo. Crece muy deprisa.',
  }),
  L('britanica', {
    nombre: 'British Airgüeis', inspirada: 'British Airways', pais: 'GB', tipo: 'tradicional', propuesta: true,
    hubs: ['LHR'], bases: ['LGW'], zonas: ['GB', 'Europa', 'Norteamérica', 'Asia', 'África', 'Oceanía'],
    desde: 1976, tamano: 1.3, precio: 1.15, costes: 1.15, servicio: 'superior',
    expansion: 0.3, riesgo: 0.3, copia: 0.2, terquedad: 0.5, protegida: 1987,
    rep: { puntualidad: 55, seguridad: 75, servicio: 70, prestigio: 85 },
    plazas: { 1976: 140, 1990: 160, 2005: 180 },
    descripcion: 'La gran tradicional británica, con largo radio por medio mundo y Concorde.',
  }),
  L('toallair', {
    nombre: 'Toallair', inspirada: 'Condor', pais: 'DE', tipo: 'charter', propuesta: true,
    hubs: ['FRA', 'DUS'], zonas: ['ES', 'PT', 'GR', 'TR', 'IT', 'MA', 'TN'],
    desde: 1976, tamano: 0.35, precio: 0.8, costes: 0.8, servicio: 'estandar',
    expansion: 0.3, riesgo: 0.4, copia: 0.3, terquedad: 0.4,
    rep: { puntualidad: 60, seguridad: 70, servicio: 50, prestigio: 35 },
    plazas: { 1976: 160, 1995: 190 },
    descripcion: 'Chárter alemana: lleva a media Alemania al sol, y llega antes que nadie a la tumbona.',
  }),
  L('naftansa', {
    nombre: 'Naftansa', inspirada: 'Lufthansa', pais: 'DE', tipo: 'tradicional',
    hubs: ['FRA'], bases: ['DUS'], zonas: ['DE', 'Europa', 'Norteamérica', 'Asia', 'Sudamérica', 'África', 'Oriente Medio'],
    desde: 1976, tamano: 1.2, precio: 1.1, costes: 1.05, servicio: 'superior',
    expansion: 0.35, riesgo: 0.25, copia: 0.15, terquedad: 0.4, protegida: 1994,
    rep: { puntualidad: 75, seguridad: 80, servicio: 70, prestigio: 80 },
    plazas: { 1976: 140, 1990: 160, 2005: 170 },
    descripcion: 'Grande y eficiente, buena reputación y gran presencia internacional.',
  }),
  L('croissair', {
    nombre: 'Croissair', inspirada: 'Air France', pais: 'FR', tipo: 'tradicional',
    hubs: ['CDG'], bases: ['NCE'], zonas: ['FR', 'Europa', 'África', 'Norteamérica', 'Asia', 'Sudamérica'],
    desde: 1976, tamano: 1.2, precio: 1.2, costes: 1.15, servicio: 'superior',
    expansion: 0.3, riesgo: 0.3, copia: 0.1, terquedad: 0.6, protegida: 1997,
    rep: { puntualidad: 55, seguridad: 75, servicio: 80, prestigio: 85 },
    plazas: { 1976: 150, 1990: 160, 2005: 180 },
    descripcion: 'Orientada al servicio y al segmento premium, con precios superiores. Opera el Concorde.',
  }),
  L('sos', {
    nombre: 'SOS', inspirada: 'SAS', pais: 'DK', tipo: 'tradicional',
    hubs: ['CPH'], bases: ['ARN', 'OSL'], zonas: ['DK', 'SE', 'NO', 'FI', 'Europa', 'Norteamérica', 'Asia'],
    desde: 1976, tamano: 0.7, precio: 1.15, costes: 1.2, servicio: 'estandar',
    expansion: 0.25, riesgo: 0.25, copia: 0.15, terquedad: 0.5, protegida: 1996,
    rep: { puntualidad: 70, seguridad: 80, servicio: 60, prestigio: 65 },
    plazas: { 1976: 120, 1990: 140, 2005: 160 },
    descripcion: 'Fuerte en el norte de Europa. Puntual y cara.',
  }),
  L('pastalia', {
    nombre: 'Pastalia', inspirada: 'Alitalia', pais: 'IT', tipo: 'tradicional', propuesta: true,
    hubs: ['FCO'], bases: ['LIN'], zonas: ['IT', 'Europa', 'Sudamérica', 'Norteamérica', 'África'],
    desde: 1976, hasta: 2021, fin: { anio: 2021.8, tipo: 'cierre' },
    tamano: 0.8, precio: 1.1, costes: 1.25, servicio: 'estandar',
    expansion: 0.25, riesgo: 0.4, copia: 0.1, terquedad: 0.9, protegida: 2020,
    rep: { puntualidad: 35, seguridad: 65, servicio: 60, prestigio: 60 },
    plazas: { 1976: 130, 1990: 150, 2005: 160 },
    descripcion: 'Bandera italiana: buena cocina a bordo, puntualidad discutible y cuentas siempre en rojo.',
  }),
  L('tulipair', {
    nombre: 'Tulipair', inspirada: 'KLM', pais: 'NL', tipo: 'tradicional', propuesta: true,
    hubs: ['AMS'], zonas: ['NL', 'Europa', 'Asia', 'África', 'Norteamérica', 'Sudamérica'],
    desde: 1976, hasta: 2004, fin: { anio: 2004.4, tipo: 'fusion', con: 'croissair' },
    tamano: 0.75, precio: 1.05, costes: 1.0, servicio: 'estandar',
    expansion: 0.3, riesgo: 0.3, copia: 0.2, terquedad: 0.4, protegida: 1993,
    rep: { puntualidad: 75, seguridad: 80, servicio: 65, prestigio: 70 },
    plazas: { 1976: 140, 1990: 160 },
    descripcion: 'Holandesa con una red enorme para el tamaño de su país. Conecta medio mundo por Ámsterdam.',
  }),
  L('breadam', {
    nombre: 'Bread Am', inspirada: 'Pan Am', pais: 'US', tipo: 'largoRadio',
    hubs: ['JFK'], bases: ['MIA', 'SFO'], zonas: ['Europa', 'Sudamérica', 'Asia', 'Oceanía', 'Norteamérica'],
    desde: 1976, hasta: 1991, fin: { anio: 1991.95, tipo: 'quiebra' },
    tamano: 1.0, precio: 1.15, costes: 1.25, servicio: 'superior',
    expansion: 0.2, riesgo: 0.4, copia: 0.1, terquedad: 0.8,
    rep: { puntualidad: 60, seguridad: 70, servicio: 75, prestigio: 90 },
    plazas: { 1976: 150 },
    descripcion: 'Internacional y de largo radio, con un prestigio enorme. Cara de mantener.',
  }),
  L('delfin', {
    nombre: 'Delfín Air Lines', inspirada: 'Delta', pais: 'US', tipo: 'tradicional', propuesta: true,
    hubs: ['ATL'], bases: ['JFK'], zonas: ['US', 'Norteamérica', 'Europa'],
    desde: 1976, tamano: 0.9, precio: 1.0, costes: 1.0, servicio: 'estandar',
    expansion: 0.35, riesgo: 0.3, copia: 0.25, terquedad: 0.4,
    rep: { puntualidad: 65, seguridad: 75, servicio: 65, prestigio: 60 },
    plazas: { 1976: 140, 1990: 160, 2005: 170 },
    descripcion: 'Gran compañía de EE. UU. Empieza nacional y en 1991 hereda el Atlántico de Bread Am.',
  }),
  L('depie', {
    nombre: 'Depie Air', inspirada: 'Ryanair', pais: 'IE', tipo: 'ultraBajoCoste',
    hubs: ['DUB'], bases: ['LGW'], zonas: ['GB', 'Europa'],
    desde: 1985, tamano: 0.35, precio: 0.6, costes: 0.6, servicio: 'basico',
    expansion: 0.9, riesgo: 0.7, copia: 0.6, terquedad: 0.1,
    rep: { puntualidad: 70, seguridad: 70, servicio: 15, prestigio: 10 },
    plazas: { 1985: 50, 1992: 130, 2000: 189 },
    descripcion: 'Costes muy bajos y precios agresivos. Abre bases donde huele demanda y las cierra igual de rápido.',
  }),
  L('burkirates', {
    nombre: 'Burkirates', inspirada: 'Emirates', pais: 'AE', tipo: 'largoRadio',
    hubs: ['DXB'], zonas: ['Europa', 'Asia', 'África', 'Oceanía', 'Oriente Medio', 'Norteamérica'],
    desde: 1985, protegida: 2100, tamano: 0.4, precio: 1.0, costes: 0.9, servicio: 'superior',
    expansion: 0.8, riesgo: 0.6, copia: 0.2, terquedad: 0.3,
    rep: { puntualidad: 70, seguridad: 80, servicio: 85, prestigio: 70 },
    plazas: { 1985: 180, 2000: 300 },
    descripcion: 'Largo radio y premium, con una apuesta muy fuerte por crecer y conectar el mundo por Dubái.',
  }),
  L('uropa', {
    nombre: 'Ay Europa', inspirada: 'Air Europa', pais: 'ES', tipo: 'charter',
    hubs: ['PMI'], bases: ['MAD'], zonas: ['ES', 'GB', 'DE', 'Europa', 'Sudamérica'],
    desde: 1986, tamano: 0.3, precio: 0.85, costes: 0.85, servicio: 'estandar',
    expansion: 0.5, riesgo: 0.5, copia: 0.4, terquedad: 0.4,
    rep: { puntualidad: 50, seguridad: 70, servicio: 50, prestigio: 30 },
    plazas: { 1986: 170 },
    descripcion: 'Nace chárter en Mallorca y acaba con red regular y largo radio desde Madrid.',
  }),
  L('guaguair', {
    nombre: 'Guaguair', inspirada: 'Binter Canarias', pais: 'ES', tipo: 'regional', propuesta: true,
    hubs: ['TFN', 'LPA'], zonas: ['ES', 'Canarias', 'PT', 'MA'],
    desde: 1989, tamano: 0.2, precio: 1.0, costes: 0.95, servicio: 'estandar',
    expansion: 0.3, riesgo: 0.3, copia: 0.3, terquedad: 0.6,
    rep: { puntualidad: 75, seguridad: 80, servicio: 65, prestigio: 45 },
    plazas: { 1989: 46, 2000: 68 },
    descripcion: 'La guagua del aire: turbohélices entre islas, frecuentes y puntuales.',
  }),
  L('lazyjet', {
    nombre: 'Lazyjet', inspirada: 'easyJet', pais: 'GB', tipo: 'bajoCoste', propuesta: true,
    hubs: ['LGW'], zonas: ['Europa'],
    desde: 1995, tamano: 0.35, precio: 0.7, costes: 0.7, servicio: 'basico',
    expansion: 0.8, riesgo: 0.6, copia: 0.5, terquedad: 0.2,
    rep: { puntualidad: 60, seguridad: 75, servicio: 30, prestigio: 25 },
    plazas: { 1995: 150, 2005: 180 },
    descripcion: 'Bajo coste británica: aeropuertos principales, precios bajos y naranja por todas partes.',
  }),
  L('berlina', {
    nombre: 'Air Berlina', inspirada: 'Air Berlin', pais: 'DE', tipo: 'bajoCoste', propuesta: true,
    hubs: ['DUS'], bases: ['PMI'], zonas: ['ES', 'Europa'],
    desde: 2002, hasta: 2017, fin: { anio: 2017.8, tipo: 'quiebra' },
    tamano: 0.4, precio: 0.8, costes: 0.85, servicio: 'estandar',
    expansion: 0.7, riesgo: 0.7, copia: 0.4, terquedad: 0.5,
    rep: { puntualidad: 60, seguridad: 75, servicio: 55, prestigio: 35 },
    plazas: { 2002: 180 },
    descripcion: 'Media bajo coste alemana con media vida en Mallorca. Crece comprando a otras y se endeuda.',
  }),
  L('flyando', {
    nombre: 'Flyando', inspirada: 'Vueling', pais: 'ES', tipo: 'bajoCoste',
    hubs: ['BCN'], bases: ['MAD'], zonas: ['ES', 'Europa'],
    desde: 2004.5, tamano: 0.3, precio: 0.75, costes: 0.75, servicio: 'basico',
    expansion: 0.8, riesgo: 0.6, copia: 0.5, terquedad: 0.3,
    rep: { puntualidad: 55, seguridad: 75, servicio: 35, prestigio: 30 },
    plazas: { 2004: 180 },
    descripcion: 'Bajo coste con precios competitivos que busca demanda con costes razonables.',
  }),
  L('catarro', {
    nombre: 'Catarro Airways', inspirada: 'Qatar Airways', pais: 'QA', tipo: 'largoRadio', propuesta: true,
    hubs: ['DOH'], zonas: ['Europa', 'Asia', 'África', 'Oceanía', 'Norteamérica'],
    desde: 2017.9, protegida: 2100, tamano: 0.5, precio: 1.0, costes: 0.9, servicio: 'superior',
    expansion: 0.7, riesgo: 0.5, copia: 0.2, terquedad: 0.3,
    rep: { puntualidad: 70, seguridad: 80, servicio: 85, prestigio: 70 },
    plazas: { 2017: 300 },
    descripcion: 'La otra gran conectora del Golfo. Llega tarde, con aviones nuevos y mucha prisa.',
  }),
  L('italia', {
    nombre: 'ITAlia', inspirada: 'ITA Airways', pais: 'IT', tipo: 'tradicional', propuesta: true,
    hubs: ['FCO'], bases: ['LIN'], zonas: ['IT', 'Europa'],
    desde: 2021.8, tamano: 0.35, precio: 1.0, costes: 1.0, servicio: 'estandar',
    expansion: 0.3, riesgo: 0.3, copia: 0.2, terquedad: 0.3,
    rep: { puntualidad: 55, seguridad: 75, servicio: 60, prestigio: 45 },
    plazas: { 2021: 160 },
    descripcion: 'Lo que queda de Pastalia, más pequeño y con las cuentas vigiladas.',
  }),
];

export const AEROLINEA = Object.fromEntries(AEROLINEAS.map((a) => [a.id, a]));

export const MAX_ACTIVAS = 15;

// Plazas por vuelo de una compañía en un año y una distancia: en los saltos cortos, aviones
// más pequeños; en el largo radio, de fuselaje ancho.
export function plazasPorVuelo(aerolinea, anio, distancia) {
  let plazas = 0;
  for (const [desde, n] of Object.entries(aerolinea.plazas)) if (anio >= Number(desde)) plazas = n;
  if (!plazas) plazas = Object.values(aerolinea.plazas)[0];
  if (distancia > 4000) return Math.round(Math.max(plazas * 2.2, 250));
  if (distancia < 400 && aerolinea.tipo !== 'ultraBajoCoste') return Math.round(Math.min(plazas, Math.max(48, plazas * 0.6)));
  return plazas;
}

export const TIPOS_AEROLINEA = {
  tradicional: 'Tradicional',
  regional: 'Regional',
  charter: 'Chárter',
  bajoCoste: 'Bajo coste',
  ultraBajoCoste: 'Bajo coste extremo',
  largoRadio: 'Largo radio',
};
