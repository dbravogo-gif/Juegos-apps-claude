// Acontecimientos del mundo (CRITERIOS 30 y 31).
//
// Las noticias son señales, no certezas: los históricos pasan (son historia), pero los locales
// se anuncian y a veces no llegan a pasar o se retrasan. El efecto es gradual: `rampa` son los
// años que tarda en notarse del todo.
//
// Efectos:
//   { tipo: 'demanda', ambito, objetivo, factor, desde, hasta?, rampa?, ambos? }
//   { tipo: 'cierre', ambito, objetivo, desde, hasta, motivo }   vuelos imposibles esos días
//   { tipo: 'coste', factor, desde, hasta }                       seguros y seguridad
// ambito: 'global' | 'region' (regiones de aeropuertos.js) | 'pais' | 'aeropuerto' | 'ruta' |
// 'supersonico' (solo cierre)
//
// Fechas en años con decimales (1992.3 ≈ abril de 1992). Las cifras de efecto son de juego.

const H = (id, fecha, escala, titular, texto, efectos = [], extra = {}) => ({ id, fecha, escala, titular, texto, efectos, ...extra });
const EUROPA_NORTE = ['GB', 'IE', 'FR', 'DE', 'NL', 'BE', 'DK', 'NO', 'SE', 'FI', 'PL', 'CS', 'AT', 'CH'];
const ESTE = ['PL', 'CS', 'HU', 'RO', 'YU', 'SU'];

const LISTA = [
  H('concordeNY', 1977.85, 'regional', 'El Concorde ya puede aterrizar en Nueva York',
    'Tras año y medio de pleitos por el ruido, los tribunales permiten los vuelos supersónicos a Nueva York.'),
  H('tfs', 1978.85, 'local', 'Abre el aeropuerto de Tenerife Sur',
    'El nuevo aeropuerto Reina Sofía, cerca de las playas del sur de la isla, recibe sus primeros vuelos.',
    [{ tipo: 'demanda', ambito: 'aeropuerto', objetivo: ['TFS'], factor: 1.3, desde: 1979, rampa: 6 }]),
  H('desregulacionUS', 1978.8, 'regional', 'Estados Unidos libera el transporte aéreo',
    'Cualquier compañía podrá volar cualquier ruta nacional y fijar sus precios. Se esperan guerras de tarifas.',
    [{ tipo: 'demanda', ambito: 'pais', objetivo: ['US'], ambos: true, factor: 1.12, desde: 1979, rampa: 4 }], { liberaliza: 'US' }),
  H('iran', 1979.1, 'global', 'La revolución en Irán dispara el petróleo',
    'El queroseno se encarece mes a mes. Las aerolíneas avisan de subidas de precios.',
    [{ tipo: 'demanda', ambito: 'pais', objetivo: ['IR'], factor: 0.3, desde: 1979.1, rampa: 0.3 },
      { tipo: 'demanda', ambito: 'global', factor: 0.95, desde: 1980, hasta: 1983, rampa: 0.5 }], { importante: true }),
  H('cee', 1986.0, 'regional', 'España y Portugal entran en la Comunidad Europea',
    'Más comercio y más viajes con el resto de Europa. Las rutas internacionales seguirán reguladas unos años.',
    [{ tipo: 'demanda', ambito: 'pais', objetivo: ['ES', 'PT'], factor: 1.1, desde: 1986, rampa: 4 }]),
  H('muro', 1989.86, 'global', 'Cae el Muro de Berlín',
    'Se abren las fronteras del Este. Praga, Budapest y Varsovia empiezan a recibir viajeros de todo el mundo.',
    [{ tipo: 'demanda', ambito: 'pais', objetivo: ESTE, factor: 1.6, desde: 1990, rampa: 6 }], { importante: true }),
  H('golfo', 1990.6, 'global', 'Irak invade Kuwait',
    'Miedo a una guerra en el Golfo: el petróleo se dispara y mucha gente deja de volar.',
    [{ tipo: 'demanda', ambito: 'global', factor: 0.88, desde: 1990.6, hasta: 1991.4, rampa: 0.2 },
      { tipo: 'demanda', ambito: 'region', objetivo: ['Oriente Medio'], factor: 0.5, desde: 1990.6, hasta: 1991.5, rampa: 0.1 },
      { tipo: 'cierre', ambito: 'aeropuerto', objetivo: ['KWI'], desde: 1990.59, hasta: 1991.25, motivo: 'guerra en Kuwait' }], { importante: true }),
  H('urss', 1991.98, 'global', 'Se disuelve la Unión Soviética',
    'Rusia hereda Moscú y San Petersburgo. Su espacio aéreo se abre poco a poco a las compañías occidentales.',
    [{ tipo: 'demanda', ambito: 'pais', objetivo: ['SU'], factor: 1.4, desde: 1992, rampa: 5 }]),
  H('ave', 1992.3, 'local', 'El AVE une Madrid y Sevilla en dos horas y media',
    'El tren de alta velocidad compite de tú a tú con el avión entre las dos ciudades.',
    [{ tipo: 'demanda', ambito: 'ruta', objetivo: [['MAD', 'SVQ']], factor: 0.45, desde: 1992.3, rampa: 1 }]),
  H('expo', 1992.3, 'regional', 'Abre la Exposición Universal de Sevilla',
    'Seis meses de Expo 92: hoteles llenos y vuelos a Sevilla desde todo el mundo.',
    [{ tipo: 'demanda', ambito: 'aeropuerto', objetivo: ['SVQ'], factor: 1.7, desde: 1992.3, hasta: 1992.8, rampa: 0 }]),
  H('olimpiadas', 1992.55, 'regional', 'Barcelona inaugura los Juegos Olímpicos',
    'Quince días que ponen la ciudad en el mapa del turismo mundial.',
    [{ tipo: 'demanda', ambito: 'aeropuerto', objetivo: ['BCN'], factor: 1.4, desde: 1992.55, hasta: 1992.65, rampa: 0 },
      { tipo: 'demanda', ambito: 'aeropuerto', objetivo: ['BCN'], factor: 1.15, desde: 1992.65, rampa: 6 }]),
  H('mercadoUnico', 1993.0, 'regional', 'Europa abre su mercado aéreo',
    'Cualquier compañía europea podrá volar entre dos países de la Comunidad y poner sus precios. Llega la competencia.',
    [{ tipo: 'demanda', ambito: 'region', objetivo: ['Europa', 'Canarias'], ambos: true, factor: 1.1, desde: 1993, rampa: 5 }], { importante: true, liberaliza: 'CE' }),
  H('eurotunel', 1994.88, 'regional', 'Abre el túnel bajo el canal de la Mancha',
    'El Eurostar une Londres con París y Bruselas en tres horas. Las rutas aéreas entre esas ciudades lo notarán.',
    [{ tipo: 'demanda', ambito: 'ruta', objetivo: [['LHR', 'CDG'], ['LGW', 'CDG'], ['LHR', 'BRU'], ['LGW', 'BRU']], factor: 0.6, desde: 1994.9, rampa: 2 }]),
  H('ferris', 1999.4, 'local', 'Los ferris rápidos unen Gran Canaria y Tenerife en poco más de una hora',
    'Los barcos de alta velocidad entre las islas capitalinas compiten por el viajero que no tiene prisa.',
    [{ tipo: 'demanda', ambito: 'ruta', objetivo: [['LPA', 'TFN'], ['LPA', 'TFS']], factor: 0.8, desde: 1999.4, rampa: 2 }]),
  H('cabotaje', 1997.3, 'regional', 'Las aerolíneas europeas ya pueden volar rutas nacionales de otros países',
    'Una compañía irlandesa podrá unir Madrid y Barcelona. Las de bandera pierden su último refugio.', [], { liberaliza: 'cabotaje' }),
  H('asia', 1997.55, 'global', 'Crisis financiera en Asia',
    'Las monedas del sudeste asiático se hunden. Menos viajes de negocios y de turismo en la región.',
    [{ tipo: 'demanda', ambito: 'region', objetivo: ['Asia'], factor: 0.85, desde: 1997.6, hasta: 1999.2, rampa: 0.3 }]),
  H('concorde4590', 2000.56, 'global', 'Se estrella un Concorde al despegar de París',
    'Un neumático reventado en la pista desencadenó el desastre. Las autoridades retiran el certificado del Concorde hasta revisar el avión.',
    [{ tipo: 'cierre', ambito: 'supersonico', desde: 2000.57, hasta: 2001.86, motivo: 'certificado del Concorde suspendido' }], { importante: true }),
  H('11s', 2001.69, 'global', 'Atentados en Nueva York y Washington',
    'Cuatro aviones secuestrados. El espacio aéreo de EE. UU. cierra varios días y el miedo vacía los aviones en todo el mundo.',
    [{ tipo: 'cierre', ambito: 'pais', objetivo: ['US'], desde: 2001.69, hasta: 2001.70, motivo: 'espacio aéreo de EE. UU. cerrado' },
      { tipo: 'demanda', ambito: 'global', factor: 0.85, desde: 2001.69, hasta: 2002.4, rampa: 0 },
      { tipo: 'demanda', ambito: 'region', objetivo: ['Norteamérica'], factor: 0.85, desde: 2001.69, hasta: 2002.6, rampa: 0 },
      { tipo: 'coste', factor: 1.08, desde: 2001.7, hasta: 2004 }], { importante: true }),
  H('sars', 2003.2, 'regional', 'Una neumonía desconocida se extiende por Asia',
    'El SRAS llega a Hong Kong, Pekín y Singapur. Muchos viajes a la región se cancelan.',
    [{ tipo: 'demanda', ambito: 'region', objetivo: ['Asia'], factor: 0.6, desde: 2003.22, hasta: 2003.55, rampa: 0.05 }]),
  H('finConcorde', 2003.82, 'global', 'Último vuelo del Concorde',
    'Los costes y el fin del apoyo del fabricante retiran el avión supersónico. Termina una época.',
    [{ tipo: 'cierre', ambito: 'supersonico', desde: 2003.83, hasta: 2100, motivo: 'el fabricante ya no da soporte al Concorde' }], { importante: true }),
  H('aveBCN', 2008.15, 'local', 'El AVE llega a Barcelona',
    'Madrid y Barcelona quedan a dos horas y media en tren. El puente aéreo pierde pasajeros.',
    [{ tipo: 'demanda', ambito: 'ruta', objetivo: [['MAD', 'BCN']], factor: 0.55, desde: 2008.15, rampa: 2 }]),
  H('crisis2008', 2008.7, 'global', 'Quiebra Lehman Brothers',
    'Pánico en los mercados. Empieza una crisis económica que golpeará con fuerza a España.',
    [{ tipo: 'demanda', ambito: 'global', factor: 0.92, desde: 2008.75, hasta: 2010.3, rampa: 0.3 },
      { tipo: 'demanda', ambito: 'pais', objetivo: ['ES', 'PT', 'GR', 'IE'], factor: 0.88, desde: 2009, hasta: 2014, rampa: 1 }], { importante: true }),
  H('volcan', 2010.29, 'regional', 'La ceniza de un volcán islandés cierra el cielo de Europa',
    'El Eyjafjallajökull escupe ceniza sobre el norte de Europa. Miles de vuelos cancelados durante días.',
    [{ tipo: 'cierre', ambito: 'pais', objetivo: EUROPA_NORTE, desde: 2010.29, hasta: 2010.307, motivo: 'nube de ceniza volcánica' }], { importante: true }),
  H('primavera', 2011.08, 'regional', 'Revueltas en Túnez, Egipto y Libia',
    'Los turistas cambian de destino: Canarias y Baleares reciben a muchos de los que iban al norte de África.',
    [{ tipo: 'demanda', ambito: 'pais', objetivo: ['TN', 'EG', 'LY'], factor: 0.4, desde: 2011.08, hasta: 2013, rampa: 0.1 },
      { tipo: 'demanda', ambito: 'region', objetivo: ['Canarias'], factor: 1.12, desde: 2011.2, hasta: 2016, rampa: 0.5 }]),
  H('covid', 2020.2, 'global', 'Una pandemia paraliza el mundo',
    'Fronteras cerradas, confinamientos y aviones en tierra. Nadie sabe cuánto durará.',
    [{ tipo: 'cierre', ambito: 'global', desde: 2020.23, hasta: 2020.42, motivo: 'fronteras cerradas por la pandemia' },
      { tipo: 'demanda', ambito: 'global', factor: 0.35, desde: 2020.42, hasta: 2021.4, rampa: 0 },
      { tipo: 'demanda', ambito: 'global', factor: 0.7, desde: 2021.4, hasta: 2022.3, rampa: 0 },
      { tipo: 'demanda', ambito: 'global', factor: 0.9, desde: 2022.3, hasta: 2023.2, rampa: 0 }], { importante: true }),
  H('ucrania', 2022.15, 'global', 'Rusia invade Ucrania',
    'Europa cierra su espacio aéreo a Rusia y Rusia a Europa. El queroseno se dispara.',
    [{ tipo: 'cierre', ambito: 'pais', objetivo: ['SU'], desde: 2022.16, hasta: 2100, motivo: 'espacio aéreo ruso cerrado' }], { importante: true }),
];

export const HISTORICOS = LISTA.sort((a, b) => a.fecha - b.fecha);

// Plantillas de acontecimientos locales. Se generan cerca del jugador (su país y los
// aeropuertos a los que vuela o podría volar), con una certeza: lo anunciado no siempre pasa.
//   donde    aeropuerto (cualquiera) | turistico | ciudad (grande) | par (dos ciudades cercanas
//            por tierra) | pais
//   certeza  probabilidad de que pase de verdad
//   espera   años entre el anuncio y que empiece a notarse [mín, máx]
//   factor   [mín, máx] sobre la demanda; dura `duracion` años (null = para siempre) con `rampa`
//            años de subida y, al final, otros tantos de bajada
export const PLANTILLAS = [
  {
    id: 'sede', donde: 'ciudad', certeza: 0.7, espera: [1, 2], factor: [1.06, 1.12], rampa: 3, duracion: 12, peso: 3,
    anuncio: (x) => `Una gran empresa estudia trasladar su sede a ${x.ciudad}`,
    pasa: (x) => `${x.ciudad} confirma la llegada de la nueva sede: más viajes de negocios`,
    noPasa: (x) => `La empresa descarta ${x.ciudad} y se queda donde estaba`,
  },
  {
    id: 'moda', donde: 'turistico', certeza: 0.6, espera: [1, 3], factor: [1.12, 1.25], rampa: 3, duracion: 8, peso: 3,
    anuncio: (x) => `${x.ciudad} se pone de moda: varias cadenas planean hoteles nuevos`,
    pasa: (x) => `Abren los primeros hoteles nuevos en ${x.ciudad}`,
    noPasa: (x) => `Los hoteles de ${x.ciudad} se quedan en proyecto`,
  },
  {
    id: 'feria', donde: 'ciudad', certeza: 0.9, espera: [0.3, 1], factor: [1.3, 1.6], rampa: 0, duracion: 0.08, peso: 2,
    anuncio: (x) => `${x.ciudad} acogerá una gran feria internacional`,
    pasa: (x) => `Empieza la feria de ${x.ciudad}: hoteles completos`,
    noPasa: (x) => `Se suspende la feria de ${x.ciudad}`,
  },
  {
    id: 'tren', donde: 'par', certeza: 0.5, espera: [4, 8], factor: [0.55, 0.75], rampa: 2, duracion: null, peso: 1.5,
    anuncio: (x) => `Se planea un tren rápido entre ${x.ciudad} y ${x.ciudad2}`,
    pasa: (x) => `Inaugurado el tren rápido entre ${x.ciudad} y ${x.ciudad2}: el avión pierde pasajeros`,
    noPasa: (x) => `El tren rápido entre ${x.ciudad} y ${x.ciudad2} se aplaza sin fecha`,
  },
  {
    id: 'cierreFabrica', donde: 'ciudad', certeza: 0.8, espera: [0.5, 1.5], factor: [0.85, 0.94], rampa: 1, duracion: 8, peso: 2,
    anuncio: (x) => `Una gran fábrica de ${x.ciudad} anuncia que cerrará`,
    pasa: (x) => `Cierra la fábrica de ${x.ciudad}: menos viajes de negocios`,
    noPasa: (x) => `La fábrica de ${x.ciudad} encuentra comprador y sigue abierta`,
  },
  {
    id: 'ampliacion', donde: 'aeropuerto', certeza: 0.65, espera: [2, 4], factor: [1.04, 1.1], rampa: 2, duracion: 10, peso: 2,
    anuncio: (x) => `Se proyecta ampliar el aeropuerto de ${x.ciudad}`,
    pasa: (x) => `Abre la terminal nueva del aeropuerto de ${x.ciudad}`,
    noPasa: (x) => `La ampliación del aeropuerto de ${x.ciudad} se queda en el cajón`,
  },
  {
    id: 'inestabilidad', donde: 'pais', certeza: 0.5, espera: [0.2, 0.8], factor: [0.6, 0.8], rampa: 0.3, duracion: 2, peso: 1,
    anuncio: (x) => `Tensión política en ${x.pais}: se temen disturbios`,
    pasa: (x) => `Los disturbios en ${x.pais} ahuyentan a los viajeros`,
    noPasa: (x) => `${x.pais} recupera la calma`,
  },
  {
    id: 'recursos', donde: 'ciudad', certeza: 0.45, espera: [2, 5], factor: [1.1, 1.2], rampa: 4, duracion: 15, peso: 1,
    anuncio: (x) => `Hallazgo de petróleo cerca de ${x.ciudad}: las petroleras miran la zona`,
    pasa: (x) => `Empieza la explotación cerca de ${x.ciudad}: llegan técnicos y empresas`,
    noPasa: (x) => `El yacimiento de ${x.ciudad} no resulta rentable`,
  },
  {
    id: 'huelga', donde: 'aeropuerto', certeza: 0.55, espera: [0.05, 0.2], cierre: [1, 3], peso: 2,
    anuncio: (x) => `Los controladores de ${x.ciudad} amenazan con una huelga`,
    pasa: (x) => `Huelga de controladores en ${x.ciudad}: vuelos cancelados`,
    noPasa: (x) => `Acuerdo de última hora: no habrá huelga en ${x.ciudad}`,
  },
];
