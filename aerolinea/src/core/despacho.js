// Reglas de despacho por ruta: qué hace el despachador, sin preguntarte, ante cada situación
// típica. Lo que una ruta deja en «auto» sigue el ajuste general de Cuentas.

export const REGLAS = {
  bajoMinimos: {
    titulo: 'Previsión por debajo de mínimos',
    ayuda: 'Niebla o viento cruzado en destino peores que lo que permite la aproximación. Salir así es despachar fuera de norma: si hay inspección, multa.',
    opciones: {
      auto: 'Como el ajuste general',
      preguntar: 'Preguntarme',
      retrasar: 'Retrasar (hasta 6 h) y si no mejora, cancelar',
      cancelar: 'Cancelar el vuelo',
      salir: 'Salir igualmente, con combustible extra',
    },
  },
  meteo: {
    titulo: 'Tiempo justo en destino',
    ayuda: 'Cerca de mínimos, tormenta o viento cruzado fuerte, pero dentro de norma. Lo normal es esperar en circuito o desviarse; con combustible extra hay más margen.',
    opciones: {
      auto: 'Como el ajuste general',
      preguntar: 'Preguntarme',
      salirExtra: 'Salir con combustible extra',
      salir: 'Salir normal',
      retrasar: 'Retrasar (hasta 6 h) y si no mejora, cancelar',
    },
  },
  averias: {
    titulo: 'Avería nueva o que avanza',
    ayuda: 'Un indicio o una anomalía que no deja el avión fuera de norma. Seguir volando la puede agravar; lo seguro es mirarla en el taller.',
    opciones: {
      auto: 'Como el ajuste general',
      preguntar: 'Preguntarme',
      salir: 'Salir mientras esté dentro de norma',
    },
  },
  fueraNorma: {
    titulo: 'Avión o tripulación fuera de norma',
    ayuda: 'Revisión vencida, aplazamiento MEL caducado, avería fuera de límites o tripulación pasada de horas. Volar así es ilegal.',
    opciones: {
      preguntar: 'Preguntarme',
      cancelar: 'Cancelar y dejar el avión en tierra',
    },
  },
};

export const reglasPorDefecto = () => Object.fromEntries(Object.entries(REGLAS).map(([k, r]) => [k, Object.keys(r.opciones)[0]]));

// De dos acciones, la más prudente: preguntar manda sobre todo; cancelar, sobre retrasar...
const RANGO = { salir: 0, salirExtra: 1, retrasar: 2, cancelar: 3, preguntar: 4 };
export const masPrudente = (a, b) => (RANGO[b] > RANGO[a] ? b : a);
