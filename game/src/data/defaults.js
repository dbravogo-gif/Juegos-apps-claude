/**
 * Rutina de ejemplo para que la app sea usable desde el primer día. Es solo un punto de
 * partida: todo se edita desde Ajustes.
 */
export function rutinasPorDefecto() {
  return [
    {
      id: 'r_torso',
      nombre: 'Torso',
      ejercicios: [
        { id: 'e1', nombre: 'Press banca', importancia: 'principal', series: 4, repMin: 6, repMax: 8 },
        { id: 'e2', nombre: 'Remo con barra', importancia: 'principal', series: 4, repMin: 8, repMax: 10 },
        { id: 'e3', nombre: 'Press militar', importancia: 'principal', series: 3, repMin: 8, repMax: 10 },
        { id: 'e4', nombre: 'Dominadas', importancia: 'principal', series: 3, repMin: 6, repMax: 10 },
        { id: 'e5', nombre: 'Elevaciones laterales', importancia: 'principal', series: 3, repMin: 12, repMax: 15 },
        { id: 'e6', nombre: 'Curl de bíceps', importancia: 'opcional', series: 3, repMin: 10, repMax: 12 },
      ],
    },
    {
      id: 'r_pierna',
      nombre: 'Pierna',
      ejercicios: [
        { id: 'e7', nombre: 'Sentadilla', importancia: 'principal', series: 4, repMin: 6, repMax: 8 },
        { id: 'e8', nombre: 'Peso muerto rumano', importancia: 'principal', series: 3, repMin: 8, repMax: 10 },
        { id: 'e9', nombre: 'Prensa', importancia: 'principal', series: 3, repMin: 10, repMax: 12 },
        { id: 'e10', nombre: 'Curl femoral', importancia: 'principal', series: 3, repMin: 10, repMax: 12 },
        { id: 'e11', nombre: 'Gemelos', importancia: 'opcional', series: 3, repMin: 12, repMax: 15 },
        { id: 'e12', nombre: 'Plancha', importancia: 'opcional', series: 3, repMin: 30, repMax: 60 },
      ],
    },
  ];
}

/** Plan de comidas de partida: mismo menú los siete días, para que se edite y no se escriba. */
export function comidasPorDefecto() {
  const dia = ['Desayuno', 'Comida', 'Cena'];
  return Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((i) => [i, [...dia]]));
}

export const ETIQUETA_ESTADO = {
  completado: 'Hecho',
  parcial: 'Mitad',
  sustituido: 'Cambio',
  justificado: 'Molestia',
  omitido: 'No',
};

export const ETIQUETA_COMIDA = {
  completo: 'Según dieta',
  excepcion_menor: 'Con algo extra',
  incumplido: 'Fuera de dieta',
};

export const NOMBRE_DIA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
