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
        { id: 'e1', nombre: 'Press banca', importancia: 'principal' },
        { id: 'e2', nombre: 'Remo con barra', importancia: 'principal' },
        { id: 'e3', nombre: 'Press militar', importancia: 'secundario' },
        { id: 'e4', nombre: 'Dominadas', importancia: 'secundario' },
        { id: 'e5', nombre: 'Elevaciones laterales', importancia: 'secundario' },
        { id: 'e6', nombre: 'Curl de bíceps', importancia: 'opcional' },
      ],
    },
    {
      id: 'r_pierna',
      nombre: 'Pierna',
      ejercicios: [
        { id: 'e7', nombre: 'Sentadilla', importancia: 'principal' },
        { id: 'e8', nombre: 'Peso muerto rumano', importancia: 'principal' },
        { id: 'e9', nombre: 'Prensa', importancia: 'secundario' },
        { id: 'e10', nombre: 'Curl femoral', importancia: 'secundario' },
        { id: 'e11', nombre: 'Gemelos', importancia: 'opcional' },
        { id: 'e12', nombre: 'Plancha', importancia: 'opcional' },
      ],
    },
  ];
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
