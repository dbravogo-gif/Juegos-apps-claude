// Países: renta, población y pertenencia a la Comunidad Europea.
//
// Es lo que mueve la demanda a largo plazo: una ciudad más rica y más poblada vuela más. Con
// esto salen solos los mercados que crecen (España en los 80, Europa del Este tras 1990, el
// Golfo y China en los 2000) y los que se estancan.
//
//   renta  renta por habitante relativa a la de EE. UU. en 1976, en 1976, 1990, 2000, 2010 y
//          2020 (aprox, a partir del PIB por habitante en paridad de poder adquisitivo)
//   pob    población relativa a 1976 en 1990, 2000, 2010 y 2020 (aprox)
//   ce     año de entrada en la Comunidad Europea / UE (para la liberalización)
//
// Todas las cifras son aproximaciones de juego (ver FUENTES.md). SU es la URSS hasta 1991 y
// Rusia después; CS, Checoslovaquia y luego la República Checa; YU, Yugoslavia y luego Serbia.

const P = (nombre, renta, pob, extra = {}) => ({ nombre, renta, pob, ce: null, ...extra });

export const PAISES = {
  // Europa occidental
  ES: P('España', [0.5, 0.7, 0.9, 1.0, 1.0], [1.08, 1.13, 1.3, 1.31], { ce: 1986 }),
  PT: P('Portugal', [0.35, 0.55, 0.7, 0.75, 0.8], [1.07, 1.1, 1.13, 1.1], { ce: 1986 }),
  GB: P('Reino Unido', [0.7, 0.9, 1.1, 1.25, 1.3], [1.02, 1.05, 1.12, 1.19], { ce: 1973, sale: 2020 }),
  IE: P('Irlanda', [0.45, 0.65, 1.1, 1.4, 2.0], [1.1, 1.18, 1.4, 1.55], { ce: 1973 }),
  FR: P('Francia', [0.75, 0.95, 1.1, 1.2, 1.25], [1.08, 1.13, 1.2, 1.24], { ce: 1958 }),
  DE: P('Alemania', [0.75, 0.95, 1.15, 1.3, 1.45], [1.01, 1.05, 1.04, 1.06], { ce: 1958 }),
  NL: P('Países Bajos', [0.8, 1.0, 1.25, 1.4, 1.5], [1.08, 1.17, 1.21, 1.27], { ce: 1958 }),
  BE: P('Bélgica', [0.75, 0.95, 1.15, 1.3, 1.35], [1.01, 1.04, 1.12, 1.17], { ce: 1958 }),
  CH: P('Suiza', [1.1, 1.3, 1.4, 1.6, 1.7], [1.07, 1.14, 1.24, 1.37]),
  AT: P('Austria', [0.7, 0.95, 1.2, 1.35, 1.45], [1.02, 1.07, 1.12, 1.19], { ce: 1995 }),
  IT: P('Italia', [0.65, 0.95, 1.1, 1.1, 1.1], [1.01, 1.02, 1.06, 1.06], { ce: 1958 }),
  GR: P('Grecia', [0.45, 0.55, 0.7, 0.8, 0.7], [1.1, 1.17, 1.2, 1.16], { ce: 1981 }),
  DK: P('Dinamarca', [0.8, 1.0, 1.2, 1.3, 1.4], [1.01, 1.04, 1.08, 1.14], { ce: 1973 }),
  SE: P('Suecia', [0.85, 1.0, 1.15, 1.3, 1.4], [1.03, 1.08, 1.14, 1.25], { ce: 1995 }),
  NO: P('Noruega', [0.85, 1.15, 1.6, 1.8, 1.8], [1.05, 1.1, 1.21, 1.33]),
  FI: P('Finlandia', [0.7, 0.95, 1.05, 1.2, 1.25], [1.04, 1.09, 1.13, 1.17], { ce: 1995 }),
  TR: P('Turquía', [0.25, 0.35, 0.45, 0.6, 0.75], [1.36, 1.64, 1.84, 2.07]),
  // Europa del Este
  SU: P('URSS / Rusia', [0.35, 0.4, 0.3, 0.55, 0.65], [1.1, 1.08, 1.06, 1.08]),
  PL: P('Polonia', [0.3, 0.3, 0.45, 0.65, 0.85], [1.12, 1.13, 1.12, 1.11], { ce: 2004 }),
  CS: P('Checoslovaquia / Chequia', [0.45, 0.5, 0.6, 0.8, 1.0], [1.03, 1.04, 1.06, 1.08], { ce: 2004 }),
  HU: P('Hungría', [0.4, 0.45, 0.55, 0.7, 0.85], [0.98, 0.95, 0.94, 0.91], { ce: 2004 }),
  YU: P('Yugoslavia / Serbia', [0.3, 0.3, 0.25, 0.35, 0.45], [1.0, 0.95, 0.9, 0.85]),
  RO: P('Rumanía', [0.25, 0.25, 0.25, 0.45, 0.7], [1.08, 1.04, 0.94, 0.9], { ce: 2007 }),
  // África
  MA: P('Marruecos', [0.12, 0.15, 0.18, 0.22, 0.27], [1.4, 1.65, 1.9, 2.1]),
  DZ: P('Argelia', [0.25, 0.25, 0.25, 0.3, 0.32], [1.5, 1.8, 2.2, 2.6]),
  TN: P('Túnez', [0.18, 0.2, 0.25, 0.3, 0.32], [1.4, 1.6, 1.8, 2.0]),
  LY: P('Libia', [0.6, 0.45, 0.4, 0.45, 0.25], [1.6, 2.0, 2.4, 2.6]),
  EG: P('Egipto', [0.12, 0.15, 0.2, 0.25, 0.3], [1.4, 1.75, 2.1, 2.6]),
  SN: P('Senegal', [0.07, 0.07, 0.07, 0.08, 0.09], [1.5, 2.0, 2.6, 3.3]),
  CI: P('Costa de Marfil', [0.12, 0.09, 0.08, 0.08, 0.1], [1.7, 2.3, 3.0, 3.8]),
  NG: P('Nigeria', [0.12, 0.09, 0.08, 0.13, 0.15], [1.5, 1.9, 2.5, 3.2]),
  ET: P('Etiopía', [0.03, 0.03, 0.03, 0.04, 0.06], [1.5, 2.0, 2.6, 3.4]),
  KE: P('Kenia', [0.06, 0.07, 0.06, 0.07, 0.1], [1.6, 2.2, 3.0, 3.7]),
  ZA: P('Sudáfrica', [0.4, 0.35, 0.35, 0.4, 0.37], [1.4, 1.7, 2.0, 2.3]),
  // Oriente Próximo
  IL: P('Israel', [0.6, 0.75, 0.9, 1.0, 1.15], [1.3, 1.8, 2.2, 2.6]),
  IR: P('Irán', [0.5, 0.3, 0.35, 0.45, 0.4], [1.6, 1.9, 2.1, 2.4]),
  SA: P('Arabia Saudí', [1.4, 0.9, 0.9, 1.1, 1.2], [2.0, 2.6, 3.6, 4.4]),
  KW: P('Kuwait', [2.0, 1.0, 1.1, 1.3, 1.2], [2.0, 1.9, 2.8, 4.0]),
  AE: P('Emiratos Árabes Unidos', [2.5, 1.6, 1.5, 1.5, 1.6], [3.4, 5.6, 15, 17]),
  QA: P('Catar', [3.0, 1.8, 2.0, 3.0, 2.5], [3.4, 4.0, 12, 17]),
  // Asia
  PK: P('Pakistán', [0.07, 0.08, 0.09, 0.1, 0.1], [1.5, 2.0, 2.5, 3.1]),
  IN: P('India', [0.05, 0.06, 0.08, 0.11, 0.15], [1.3, 1.6, 1.9, 2.2]),
  LK: P('Sri Lanka', [0.08, 0.1, 0.12, 0.17, 0.27], [1.25, 1.3, 1.4, 1.5]),
  TH: P('Tailandia', [0.1, 0.17, 0.23, 0.3, 0.4], [1.3, 1.5, 1.6, 1.7]),
  SG: P('Singapur', [0.6, 1.0, 1.5, 1.9, 2.2], [1.3, 1.75, 2.2, 2.6]),
  MY: P('Malasia', [0.2, 0.3, 0.45, 0.55, 0.6], [1.5, 1.9, 2.3, 2.7]),
  ID: P('Indonesia', [0.07, 0.1, 0.13, 0.17, 0.22], [1.3, 1.5, 1.7, 1.9]),
  PH: P('Filipinas', [0.12, 0.12, 0.13, 0.15, 0.17], [1.4, 1.8, 2.2, 2.6]),
  HK: P('Hong Kong', [0.6, 1.0, 1.15, 1.45, 1.4], [1.3, 1.5, 1.6, 1.7]),
  TW: P('Taiwán', [0.3, 0.6, 0.9, 1.2, 1.4], [1.2, 1.35, 1.4, 1.45]),
  CN: P('China', [0.03, 0.05, 0.1, 0.22, 0.35], [1.25, 1.4, 1.45, 1.5]),
  KR: P('Corea del Sur', [0.2, 0.45, 0.7, 0.95, 1.1], [1.2, 1.3, 1.4, 1.45]),
  JP: P('Japón', [0.7, 1.0, 1.1, 1.1, 1.1], [1.08, 1.12, 1.13, 1.12]),
  // Oceanía
  AU: P('Australia', [0.85, 1.0, 1.15, 1.3, 1.3], [1.2, 1.4, 1.6, 1.8]),
  NZ: P('Nueva Zelanda', [0.75, 0.8, 0.9, 1.0, 1.1], [1.1, 1.2, 1.4, 1.6]),
  FJ: P('Fiyi', [0.2, 0.2, 0.2, 0.22, 0.2], [1.3, 1.4, 1.5, 1.6]),
  // América del Norte y Caribe
  US: P('Estados Unidos', [1.0, 1.35, 1.65, 1.8, 2.05], [1.15, 1.3, 1.43, 1.51]),
  CA: P('Canadá', [0.9, 1.15, 1.35, 1.5, 1.6], [1.2, 1.35, 1.48, 1.64]),
  MX: P('México', [0.35, 0.35, 0.4, 0.4, 0.4], [1.4, 1.7, 1.9, 2.1]),
  CU: P('Cuba', [0.25, 0.25, 0.15, 0.2, 0.2], [1.1, 1.15, 1.15, 1.15]),
  DO: P('República Dominicana', [0.15, 0.15, 0.2, 0.3, 0.45], [1.4, 1.75, 2.0, 2.2]),
  PR: P('Puerto Rico', [0.5, 0.6, 0.7, 0.75, 0.8], [1.1, 1.2, 1.25, 1.1]),
  PA: P('Panamá', [0.25, 0.25, 0.3, 0.45, 0.65], [1.4, 1.7, 2.0, 2.4]),
  // América del Sur
  VE: P('Venezuela', [0.6, 0.45, 0.4, 0.4, 0.15], [1.5, 1.9, 2.2, 2.2]),
  CO: P('Colombia', [0.2, 0.22, 0.24, 0.3, 0.35], [1.4, 1.7, 1.9, 2.1]),
  EC: P('Ecuador', [0.2, 0.2, 0.2, 0.22, 0.25], [1.4, 1.8, 2.1, 2.5]),
  PE: P('Perú', [0.25, 0.18, 0.2, 0.25, 0.3], [1.4, 1.7, 1.9, 2.1]),
  CL: P('Chile', [0.25, 0.3, 0.45, 0.55, 0.6], [1.3, 1.5, 1.7, 1.8]),
  AR: P('Argentina', [0.55, 0.4, 0.5, 0.55, 0.5], [1.24, 1.42, 1.56, 1.73]),
  UY: P('Uruguay', [0.35, 0.35, 0.45, 0.5, 0.55], [1.1, 1.15, 1.18, 1.22]),
  BR: P('Brasil', [0.3, 0.3, 0.3, 0.35, 0.35], [1.4, 1.7, 1.9, 2.0]),
};

const ANIOS = [1976, 1990, 2000, 2010, 2020];

function interpolar(valores, anio) {
  if (anio <= ANIOS[0]) return valores[0];
  for (let i = 1; i < ANIOS.length; i++) {
    if (anio <= ANIOS[i]) {
      const f = (anio - ANIOS[i - 1]) / (ANIOS[i] - ANIOS[i - 1]);
      return valores[i - 1] + (valores[i] - valores[i - 1]) * f;
    }
  }
  // Después de 2020, un crecimiento suave.
  return valores[valores.length - 1] * Math.pow(1.012, anio - ANIOS[ANIOS.length - 1]);
}

const pais = (codigo) => PAISES[codigo] ?? PAISES.US;

export const rentaEn = (codigo, anio) => interpolar(pais(codigo).renta, anio);
export const poblacionEn = (codigo, anio) => interpolar([1, ...pais(codigo).pob], anio);

// Si dos países comparten el mercado único europeo de aviación (desde 1993; antes, cada país
// protegía sus rutas).
export function enMercadoUnico(codigo, anio) {
  const p = pais(codigo);
  return p.ce != null && anio >= Math.max(1993, p.ce) && (p.sale == null || anio < p.sale);
}
