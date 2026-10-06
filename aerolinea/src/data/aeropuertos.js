// Aeropuertos del juego, con nombres y datos de 1976 aproximados.
//
// Criterio: una o dos ciudades por país, solo en los países con más peso en la aviación de la
// época. Estados Unidos, que es un continente en sí mismo, tiene algunos más. Canarias está
// completa, incluidos los aeropuertos que aún no existían (`desde`).
//
// Campos:
//   pob       población del área en millones (aprox. 1976)
//   tam       tamaño del aeropuerto, 1–5: demanda, tasas y coste de tener base
//   pista     metros de la pista más larga (aprox.)
//   ils       ayuda a la aproximación instrumental en 1976 (aprox.)
//   montana   terreno montañoso o accidentado en la aproximación
//   clima     perfil de src/core/clima.js
//   tur       peso del turismo en la demanda (1 = normal)
//   temporada 'verano' o 'invierno' si la demanda turística es estacional
//   desde     año de apertura, si es posterior a 1976
//   region    agrupación para elegir base

const A = (id, nombre, ciudad, pais, region, lat, lon, pob, tam, pista, ils, clima, extra = {}) => ({
  id, nombre, ciudad, pais, region, lat, lon, pob, tam, pista, ils, clima,
  montana: false, tur: 1, temporada: null, desde: 0, grupo: null, ...extra,
});

export const AEROPUERTOS = [
  // Canarias
  A('LPA', 'Gran Canaria (Gando)', 'Gran Canaria', 'ES', 'Canarias', 27.93, -15.39, 0.65, 4, 3100, true, 'subtropical', { tur: 1.8, temporada: 'invierno', grupo: 'canarias' }),
  A('TFN', 'Tenerife Norte (Los Rodeos)', 'Tenerife', 'ES', 'Canarias', 28.48, -16.34, 0.55, 4, 3400, false, 'nubes_montana', { montana: true, tur: 1.4, temporada: 'invierno', grupo: 'canarias' }),
  A('TFS', 'Tenerife Sur (Reina Sofía)', 'Tenerife', 'ES', 'Canarias', 28.04, -16.57, 0.1, 3, 3200, true, 'subtropical', { tur: 2.0, temporada: 'invierno', grupo: 'canarias', desde: 1978 }),
  A('ACE', 'Lanzarote', 'Lanzarote', 'ES', 'Canarias', 28.95, -13.61, 0.05, 3, 2400, false, 'subtropical', { tur: 1.8, temporada: 'invierno', grupo: 'canarias' }),
  A('FUE', 'Fuerteventura', 'Fuerteventura', 'ES', 'Canarias', 28.45, -13.86, 0.03, 2, 2400, false, 'subtropical', { tur: 1.6, temporada: 'invierno', grupo: 'canarias' }),
  A('SPC', 'La Palma', 'La Palma', 'ES', 'Canarias', 28.63, -17.76, 0.08, 2, 2200, false, 'nubes_montana', { montana: true, grupo: 'canarias' }),
  A('VDE', 'El Hierro', 'El Hierro', 'ES', 'Canarias', 27.81, -17.89, 0.006, 1, 1250, false, 'subtropical', { montana: true, tur: 0.8, grupo: 'canarias' }),
  A('GMZ', 'La Gomera', 'La Gomera', 'ES', 'Canarias', 28.03, -17.21, 0.02, 1, 1500, false, 'subtropical', { montana: true, grupo: 'canarias', desde: 1999 }),

  // Europa
  A('MAD', 'Madrid-Barajas', 'Madrid', 'ES', 'Europa', 40.47, -3.56, 4.0, 5, 4100, true, 'continental', { tur: 1.1 }),
  A('BCN', 'Barcelona-El Prat', 'Barcelona', 'ES', 'Europa', 41.30, 2.08, 3.5, 4, 3100, true, 'mediterraneo', { tur: 1.3, temporada: 'verano' }),
  A('PMI', 'Palma de Mallorca', 'Palma', 'ES', 'Europa', 39.55, 2.74, 0.5, 4, 3270, true, 'mediterraneo', { tur: 2.0, temporada: 'verano' }),
  A('AGP', 'Málaga', 'Málaga', 'ES', 'Europa', 36.67, -4.50, 0.6, 3, 3200, true, 'mediterraneo', { tur: 1.8, temporada: 'verano' }),
  A('LIS', 'Lisboa-Portela', 'Lisboa', 'PT', 'Europa', 38.77, -9.13, 2.0, 4, 3800, true, 'mediterraneo', { tur: 1.3 }),
  A('FNC', 'Madeira (Santa Catarina)', 'Funchal', 'PT', 'Europa', 32.70, -16.77, 0.25, 2, 1600, false, 'subtropical', { montana: true, tur: 1.6, temporada: 'invierno' }),
  A('LHR', 'Londres-Heathrow', 'Londres', 'GB', 'Europa', 51.47, -0.45, 10, 5, 3900, true, 'atlantico', { tur: 1.3 }),
  A('LGW', 'Londres-Gatwick', 'Londres', 'GB', 'Europa', 51.15, -0.19, 6, 4, 3100, true, 'atlantico', { tur: 1.5 }),
  A('DUB', 'Dublín', 'Dublín', 'IE', 'Europa', 53.43, -6.25, 1.0, 3, 2600, true, 'atlantico'),
  A('CDG', 'París-Charles de Gaulle', 'París', 'FR', 'Europa', 49.01, 2.55, 9, 5, 3600, true, 'atlantico', { tur: 1.4 }),
  A('NCE', 'Niza-Costa Azul', 'Niza', 'FR', 'Europa', 43.66, 7.22, 0.5, 3, 2700, true, 'mediterraneo', { tur: 1.7, temporada: 'verano' }),
  A('FRA', 'Fráncfort', 'Fráncfort', 'DE', 'Europa', 50.03, 8.57, 2.5, 5, 3900, true, 'continental'),
  A('DUS', 'Düsseldorf', 'Düsseldorf', 'DE', 'Europa', 51.29, 6.77, 5, 4, 3000, true, 'continental', { tur: 1.2 }),
  A('AMS', 'Ámsterdam-Schiphol', 'Ámsterdam', 'NL', 'Europa', 52.31, 4.76, 2.0, 4, 3500, true, 'atlantico'),
  A('BRU', 'Bruselas-Zaventem', 'Bruselas', 'BE', 'Europa', 50.90, 4.48, 1.5, 4, 3600, true, 'atlantico'),
  A('ZRH', 'Zúrich-Kloten', 'Zúrich', 'CH', 'Europa', 47.46, 8.55, 1.0, 4, 3700, true, 'continental'),
  A('VIE', 'Viena-Schwechat', 'Viena', 'AT', 'Europa', 48.11, 16.57, 2.0, 3, 3600, true, 'continental'),
  A('FCO', 'Roma-Fiumicino', 'Roma', 'IT', 'Europa', 41.80, 12.25, 3.5, 5, 3900, true, 'mediterraneo', { tur: 1.5 }),
  A('LIN', 'Milán-Linate', 'Milán', 'IT', 'Europa', 45.45, 9.28, 4.0, 4, 2400, true, 'llanura_niebla'),
  A('ATH', 'Atenas-Hellinikon', 'Atenas', 'GR', 'Europa', 37.89, 23.73, 3.0, 4, 3400, true, 'mediterraneo', { tur: 1.6, temporada: 'verano' }),
  A('IST', 'Estambul-Yeşilköy', 'Estambul', 'TR', 'Europa', 40.98, 28.82, 3.9, 4, 3000, true, 'mediterraneo'),
  A('CPH', 'Copenhague-Kastrup', 'Copenhague', 'DK', 'Europa', 55.62, 12.65, 1.8, 4, 3600, true, 'nordico'),
  A('ARN', 'Estocolmo-Arlanda', 'Estocolmo', 'SE', 'Europa', 59.65, 17.92, 1.4, 4, 3300, true, 'nordico'),
  A('OSL', 'Oslo-Fornebu', 'Oslo', 'NO', 'Europa', 59.90, 10.62, 0.6, 3, 2300, true, 'nordico', { montana: true }),
  A('HEL', 'Helsinki-Vantaa', 'Helsinki', 'FI', 'Europa', 60.32, 24.96, 0.8, 3, 3400, true, 'nordico'),
  A('SVO', 'Moscú-Sheremétievo', 'Moscú', 'SU', 'Europa', 55.97, 37.41, 7.5, 5, 3700, true, 'nordico'),
  A('LED', 'Leningrado-Pulkovo', 'Leningrado', 'SU', 'Europa', 59.80, 30.26, 4.3, 4, 3400, true, 'nordico'),
  A('WAW', 'Varsovia-Okęcie', 'Varsovia', 'PL', 'Europa', 52.17, 20.97, 1.5, 3, 3700, true, 'continental'),
  A('PRG', 'Praga-Ruzyně', 'Praga', 'CS', 'Europa', 50.10, 14.26, 1.2, 3, 3700, true, 'continental'),
  A('BUD', 'Budapest-Ferihegy', 'Budapest', 'HU', 'Europa', 47.44, 19.26, 2.0, 3, 3000, true, 'continental'),
  A('BEG', 'Belgrado-Surčin', 'Belgrado', 'YU', 'Europa', 44.82, 20.31, 1.3, 3, 3400, true, 'continental'),
  A('OTP', 'Bucarest-Otopeni', 'Bucarest', 'RO', 'Europa', 44.57, 26.10, 1.9, 3, 3500, true, 'continental'),

  // África
  A('CMN', 'Casablanca-Mohammed V', 'Casablanca', 'MA', 'África', 33.37, -7.59, 2.2, 3, 3700, true, 'mediterraneo'),
  A('RAK', 'Marrakech-Menara', 'Marrakech', 'MA', 'África', 31.61, -8.04, 0.4, 2, 3100, false, 'desierto', { tur: 1.6 }),
  A('ALG', 'Argel-Dar el Beida', 'Argel', 'DZ', 'África', 36.69, 3.22, 2.0, 3, 3500, true, 'mediterraneo'),
  A('TUN', 'Túnez-Cartago', 'Túnez', 'TN', 'África', 36.85, 10.23, 1.0, 3, 3200, true, 'mediterraneo', { tur: 1.4, temporada: 'verano' }),
  A('TIP', 'Trípoli', 'Trípoli', 'LY', 'África', 32.66, 13.16, 0.8, 3, 3600, false, 'desierto'),
  A('CAI', 'El Cairo', 'El Cairo', 'EG', 'África', 30.12, 31.41, 8.0, 4, 3300, true, 'desierto', { tur: 1.4 }),
  A('DKR', 'Dakar-Yoff', 'Dakar', 'SN', 'África', 14.74, -17.49, 0.8, 3, 3500, true, 'sahel'),
  A('ABJ', 'Abiyán-Port Bouët', 'Abiyán', 'CI', 'África', 5.26, -3.93, 1.0, 3, 3000, true, 'tropical'),
  A('LOS', 'Lagos-Ikeja', 'Lagos', 'NG', 'África', 6.58, 3.32, 3.0, 4, 3900, true, 'monzon'),
  A('FIH', 'Kinsasa-N\'Djili', 'Kinsasa', 'ZR', 'África', -4.39, 15.44, 2.0, 3, 4700, false, 'tropical'),
  A('ADD', 'Adís Abeba-Bole', 'Adís Abeba', 'ET', 'África', 8.98, 38.80, 1.1, 3, 3800, false, 'altitud', { montana: true }),
  A('NBO', 'Nairobi-Embakasi', 'Nairobi', 'KE', 'África', -1.32, 36.93, 0.8, 4, 4100, true, 'altitud', { tur: 1.3 }),
  A('JNB', 'Johannesburgo-Jan Smuts', 'Johannesburgo', 'ZA', 'África', -26.14, 28.25, 3.0, 4, 4400, true, 'altitud'),
  A('CPT', 'Ciudad del Cabo-D. F. Malan', 'Ciudad del Cabo', 'ZA', 'África', -33.97, 18.60, 1.1, 3, 3200, true, 'mediterraneo', { montana: true, tur: 1.3 }),

  // Oriente Medio
  A('TLV', 'Tel Aviv-Lod', 'Tel Aviv', 'IL', 'Oriente Medio', 32.01, 34.89, 1.5, 3, 3600, true, 'mediterraneo'),
  A('THR', 'Teherán-Mehrabad', 'Teherán', 'IR', 'Oriente Medio', 35.69, 51.31, 4.5, 4, 4000, true, 'altitud', { montana: true }),
  A('JED', 'Yeda-Kandara', 'Yeda', 'SA', 'Oriente Medio', 21.50, 39.20, 0.6, 3, 3300, false, 'desierto'),
  A('RUH', 'Riad', 'Riad', 'SA', 'Oriente Medio', 24.71, 46.73, 0.7, 3, 3200, false, 'desierto'),
  A('KWI', 'Kuwait', 'Kuwait', 'KW', 'Oriente Medio', 29.24, 47.97, 0.8, 3, 3400, true, 'desierto'),
  A('DXB', 'Dubái', 'Dubái', 'AE', 'Oriente Medio', 25.25, 55.36, 0.2, 3, 3800, true, 'desierto'),

  // Asia
  A('KHI', 'Karachi', 'Karachi', 'PK', 'Asia', 24.91, 67.16, 4.0, 4, 3400, true, 'desierto'),
  A('BOM', 'Bombay-Santa Cruz', 'Bombay', 'IN', 'Asia', 19.09, 72.87, 7.0, 4, 3400, true, 'monzon'),
  A('DEL', 'Delhi-Palam', 'Delhi', 'IN', 'Asia', 28.57, 77.10, 4.5, 4, 3800, true, 'indogangetico'),
  A('CMB', 'Colombo-Katunayake', 'Colombo', 'LK', 'Asia', 7.18, 79.88, 0.6, 2, 3350, false, 'monzon', { tur: 1.2 }),
  A('BKK', 'Bangkok-Don Mueang', 'Bangkok', 'TH', 'Asia', 13.91, 100.61, 4.5, 4, 3700, true, 'monzon', { tur: 1.4 }),
  A('SIN', 'Singapur-Paya Lebar', 'Singapur', 'SG', 'Asia', 1.36, 103.91, 2.3, 4, 3800, true, 'tropical'),
  A('KUL', 'Kuala Lumpur-Subang', 'Kuala Lumpur', 'MY', 'Asia', 3.13, 101.55, 1.0, 3, 3800, true, 'tropical'),
  A('JKT', 'Yakarta-Kemayoran', 'Yakarta', 'ID', 'Asia', -6.15, 106.85, 6.0, 3, 2500, false, 'tropical'),
  A('DPS', 'Bali-Ngurah Rai', 'Denpasar', 'ID', 'Asia', -8.75, 115.17, 0.3, 2, 3000, false, 'tropical', { tur: 1.8 }),
  A('MNL', 'Manila', 'Manila', 'PH', 'Asia', 14.51, 121.02, 5.0, 4, 3400, true, 'tropical'),
  A('HKG', 'Hong Kong-Kai Tak', 'Hong Kong', 'HK', 'Asia', 22.31, 114.20, 4.5, 4, 3400, true, 'monzon', { montana: true, tur: 1.3 }),
  A('TPE', 'Taipéi-Songshan', 'Taipéi', 'TW', 'Asia', 25.07, 121.55, 2.0, 3, 2600, true, 'monzon', { montana: true }),
  A('PEK', 'Pekín-Capital', 'Pekín', 'CN', 'Asia', 40.08, 116.58, 8.0, 3, 3200, true, 'continental'),
  A('SHA', 'Shanghái-Hongqiao', 'Shanghái', 'CN', 'Asia', 31.20, 121.34, 10, 3, 3200, true, 'monzon'),
  A('GMP', 'Seúl-Gimpo', 'Seúl', 'KR', 'Asia', 37.56, 126.79, 7.0, 4, 3200, true, 'continental'),
  A('HND', 'Tokio-Haneda', 'Tokio', 'JP', 'Asia', 35.55, 139.78, 20, 5, 3000, true, 'monzon'),
  A('NRT', 'Tokio-Narita', 'Tokio', 'JP', 'Asia', 35.76, 140.39, 20, 5, 4000, true, 'monzon', { desde: 1978 }),
  A('ITM', 'Osaka-Itami', 'Osaka', 'JP', 'Asia', 34.79, 135.44, 12, 4, 3000, true, 'monzon', { montana: true }),

  // Oceanía y Pacífico
  A('SYD', 'Sídney-Kingsford Smith', 'Sídney', 'AU', 'Oceanía', -33.95, 151.18, 3.1, 4, 3900, true, 'mediterraneo', { tur: 1.2 }),
  A('MEL', 'Melbourne-Tullamarine', 'Melbourne', 'AU', 'Oceanía', -37.67, 144.84, 2.6, 4, 3700, true, 'atlantico'),
  A('PER', 'Perth', 'Perth', 'AU', 'Oceanía', -31.94, 115.97, 0.8, 3, 3400, true, 'mediterraneo'),
  A('AKL', 'Auckland', 'Auckland', 'NZ', 'Oceanía', -37.01, 174.79, 0.8, 3, 3600, true, 'atlantico', { tur: 1.2 }),
  A('NAN', 'Fiyi-Nadi', 'Nadi', 'FJ', 'Oceanía', -17.76, 177.44, 0.1, 2, 3300, false, 'tropical', { tur: 1.8 }),
  A('HNL', 'Honolulu', 'Honolulu', 'US', 'Oceanía', 21.32, -157.92, 0.7, 4, 3800, true, 'tropical', { tur: 2.0 }),

  // Norteamérica
  A('JFK', 'Nueva York-JFK', 'Nueva York', 'US', 'Norteamérica', 40.64, -73.78, 16, 5, 4400, true, 'continental', { tur: 1.3 }),
  A('ORD', 'Chicago-O\'Hare', 'Chicago', 'US', 'Norteamérica', 41.98, -87.90, 7.5, 5, 3900, true, 'continental'),
  A('ATL', 'Atlanta', 'Atlanta', 'US', 'Norteamérica', 33.64, -84.43, 1.8, 5, 3600, true, 'tropical'),
  A('MIA', 'Miami', 'Miami', 'US', 'Norteamérica', 25.79, -80.29, 2.5, 4, 3900, true, 'tropical', { tur: 1.6, temporada: 'invierno' }),
  A('DFW', 'Dallas-Fort Worth', 'Dallas', 'US', 'Norteamérica', 32.90, -97.04, 2.7, 4, 4000, true, 'continental'),
  A('LAX', 'Los Ángeles', 'Los Ángeles', 'US', 'Norteamérica', 33.94, -118.41, 10, 5, 3700, true, 'costa_niebla', { tur: 1.3 }),
  A('SFO', 'San Francisco', 'San Francisco', 'US', 'Norteamérica', 37.62, -122.38, 4.5, 4, 3600, true, 'costa_niebla', { tur: 1.2 }),
  A('YYZ', 'Toronto-Malton', 'Toronto', 'CA', 'Norteamérica', 43.68, -79.63, 2.8, 4, 3400, true, 'nordico'),
  A('YUL', 'Montreal-Dorval', 'Montreal', 'CA', 'Norteamérica', 45.47, -73.74, 2.8, 4, 3300, true, 'nordico'),
  A('YVR', 'Vancouver', 'Vancouver', 'CA', 'Norteamérica', 49.19, -123.18, 1.1, 3, 3300, true, 'atlantico', { montana: true }),
  A('MEX', 'Ciudad de México', 'Ciudad de México', 'MX', 'Norteamérica', 19.44, -99.07, 12, 4, 3900, true, 'altitud', { montana: true }),
  A('CUN', 'Cancún', 'Cancún', 'MX', 'Norteamérica', 21.04, -86.87, 0.05, 2, 3500, false, 'tropical', { tur: 2.0, temporada: 'invierno' }),
  A('HAV', 'La Habana-José Martí', 'La Habana', 'CU', 'Norteamérica', 22.99, -82.41, 1.9, 3, 4000, false, 'tropical'),
  A('SDQ', 'Santo Domingo-Las Américas', 'Santo Domingo', 'DO', 'Norteamérica', 18.43, -69.67, 1.0, 2, 3350, false, 'tropical', { tur: 1.3 }),
  A('SJU', 'San Juan-Isla Verde', 'San Juan', 'PR', 'Norteamérica', 18.44, -66.00, 1.0, 3, 3000, true, 'tropical', { tur: 1.5 }),
  A('PTY', 'Panamá-Tocumen', 'Panamá', 'PA', 'Norteamérica', 9.07, -79.38, 0.7, 3, 3050, true, 'tropical'),

  // Sudamérica
  A('CCS', 'Caracas-Maiquetía', 'Caracas', 'VE', 'Sudamérica', 10.60, -66.99, 2.5, 4, 3500, true, 'tropical', { montana: true }),
  A('BOG', 'Bogotá-El Dorado', 'Bogotá', 'CO', 'Sudamérica', 4.70, -74.15, 3.5, 4, 3800, true, 'altitud', { montana: true }),
  A('UIO', 'Quito-Mariscal Sucre', 'Quito', 'EC', 'Sudamérica', -0.14, -78.49, 0.6, 2, 3100, false, 'altitud', { montana: true }),
  A('LIM', 'Lima-Jorge Chávez', 'Lima', 'PE', 'Sudamérica', -12.02, -77.11, 3.5, 3, 3500, true, 'costa_niebla'),
  A('SCL', 'Santiago-Pudahuel', 'Santiago', 'CL', 'Sudamérica', -33.39, -70.79, 3.5, 3, 3200, true, 'mediterraneo', { montana: true }),
  A('EZE', 'Buenos Aires-Ezeiza', 'Buenos Aires', 'AR', 'Sudamérica', -34.82, -58.54, 9.5, 4, 3300, true, 'atlantico'),
  A('MVD', 'Montevideo-Carrasco', 'Montevideo', 'UY', 'Sudamérica', -34.84, -56.03, 1.3, 2, 3200, true, 'atlantico'),
  A('GIG', 'Río de Janeiro-Galeão', 'Río de Janeiro', 'BR', 'Sudamérica', -22.81, -43.25, 8.5, 4, 4000, true, 'tropical', { montana: true, tur: 1.5 }),
  A('VCP', 'São Paulo-Viracopos', 'São Paulo', 'BR', 'Sudamérica', -23.01, -47.13, 11, 4, 3240, true, 'tropical'),
];

export const POR_ID = Object.fromEntries(AEROPUERTOS.map((a) => [a.id, a]));

export const REGIONES = ['Canarias', 'Europa', 'África', 'Oriente Medio', 'Asia', 'Oceanía', 'Norteamérica', 'Sudamérica'];

export function abiertoEn(aeropuerto, anio) {
  return !aeropuerto.desde || anio >= aeropuerto.desde;
}

// Prefijo de matrícula por país (OACI), para dar un poco de sabor.
const PREFIJOS = {
  ES: 'EC', PT: 'CS', GB: 'G', IE: 'EI', FR: 'F', DE: 'D', NL: 'PH', BE: 'OO', CH: 'HB', AT: 'OE',
  IT: 'I', GR: 'SX', TR: 'TC', DK: 'OY', SE: 'SE', NO: 'LN', FI: 'OH', SU: 'CCCP', PL: 'SP',
  CS: 'OK', HU: 'HA', YU: 'YU', RO: 'YR', MA: 'CN', DZ: '7T', TN: 'TS', LY: '5A', EG: 'SU',
  SN: '6V', CI: 'TU', NG: '5N', ZR: '9Q', ET: 'ET', KE: '5Y', ZA: 'ZS', IL: '4X', IR: 'EP',
  SA: 'HZ', KW: '9K', AE: 'A6', PK: 'AP', IN: 'VT', LK: '4R', TH: 'HS', SG: '9V', MY: '9M',
  ID: 'PK', PH: 'RP', HK: 'VR', TW: 'B', CN: 'B', KR: 'HL', JP: 'JA', AU: 'VH', NZ: 'ZK',
  FJ: 'DQ', US: 'N', CA: 'C', MX: 'XA', CU: 'CU', DO: 'HI', PR: 'N', PA: 'HP', VE: 'YV',
  CO: 'HK', EC: 'HC', PE: 'OB', CL: 'CC', AR: 'LV', UY: 'CX', BR: 'PP',
};

export function prefijoMatricula(pais) {
  return PREFIJOS[pais] ?? 'X';
}
