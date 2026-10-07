// Tecnologías de seguridad y capacidad operativa.
//
// Fechas verificadas con dos fuentes (ver FUENTES.md); costes de instalación aproximados.
// Cada tecnología modifica categorías de riesgo concretas (ver riesgo.js), nunca un «+10 de
// seguridad» genérico.
//
//   desde          año en que se puede instalar
//   estandarDesde  año a partir del cual los aviones nuevos la traen de serie
//   retrofit       coste y días de taller para instalarla en un avión existente
//   requiere       tecnología previa que sustituye

export const TECNOLOGIAS = {
  radar: {
    nombre: 'Radar meteorológico',
    resumen: 'Permite rodear las tormentas en ruta.',
    desde: 1955, estandarDesde: 1965,
    retrofit: { coste: 40e3, dias: 2 },
    riesgos: ['tormentaRuta'],
  },
  gpws: {
    nombre: 'GPWS (aviso de proximidad al terreno)',
    resumen: 'Avisa a la tripulación cuando el avión se acerca peligrosamente al suelo.',
    desde: 1974, estandarDesde: 1980,
    retrofit: { coste: 60e3, dias: 2 },
    riesgos: ['cfit'],
  },
  cizalladura: {
    nombre: 'Alerta de cizalladura',
    resumen: 'Avisa de la cizalladura al despegar y aterrizar con tormentas.',
    desde: 1988, estandarDesde: 1991,
    retrofit: { coste: 80e3, dias: 2 },
    riesgos: ['cizalladura'],
  },
  tcas: {
    nombre: 'TCAS II (anticolisión)',
    resumen: 'Detecta el tráfico cercano y ordena maniobras para evitarlo.',
    desde: 1990, estandarDesde: 1993,
    retrofit: { coste: 150e3, dias: 3 },
    riesgos: ['colision'],
  },
  egpws: {
    nombre: 'EGPWS (conciencia de terreno)',
    resumen: 'Mapa del terreno por delante del avión: avisa mucho antes que el GPWS.',
    desde: 1996, estandarDesde: 2002,
    retrofit: { coste: 100e3, dias: 2 },
    requiere: 'gpws',
    riesgos: ['cfit'],
  },
};

export const ORDEN_TECNOLOGIAS = ['radar', 'gpws', 'cizalladura', 'tcas', 'egpws'];

// Lo que trae un avión fabricado en `anio`.
export function equipoDeSerie(tipo, anio) {
  const equipo = {};
  for (const id of ORDEN_TECNOLOGIAS) {
    const t = TECNOLOGIAS[id];
    // Los aviones de transporte llevan radar meteorológico de serie desde los 60. El C-212,
    // un avión de cercanías, no.
    if (id === 'radar') equipo.radar = tipo.clase !== 'regional' || tipo.plazas > 40;
    else equipo[id] = anio >= t.estandarDesde && anio >= tipo.entrada;
  }
  if (equipo.egpws) equipo.gpws = true;
  return equipo;
}

export function puedeInstalar(tecnologia, avion, anio) {
  const t = TECNOLOGIAS[tecnologia];
  if (avion.equipo[tecnologia]) return 'Ya lo tiene';
  if (anio < t.desde) return `No existe hasta ${t.desde}`;
  if (t.requiere && !avion.equipo[t.requiere]) return `Necesita antes ${TECNOLOGIAS[t.requiere].nombre}`;
  return null;
}
