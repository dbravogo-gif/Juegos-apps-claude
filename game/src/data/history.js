import { puntuarEntreno } from '../core/scoring/workout.js';
import { puntuarDiaComida } from '../core/scoring/nutrition.js';
import { sumarDias, diasEntre } from '../core/scoring/exemptions.js';

/** Índice del día de la semana con el lunes como 0, igual que `plan.comidasPorDia`. */
/**
 * Solo se puede registrar hoy y ayer. Sin ese límite se podrían rellenar semanas enteras a
 * posteriori y reconstruir rachas que nunca ocurrieron.
 */
export function esEditable(fecha, hoy) {
  const desfase = diasEntre(fecha, hoy);
  return desfase >= 0 && desfase <= 1;
}

export function diaDeLaSemana(fechaISO) {
  return (new Date(`${fechaISO}T00:00:00Z`).getUTCDay() + 6) % 7;
}

/**
 * Qué hizo el jugador ese día. Ya no hay días de entreno fijos en el calendario: se elige
 * al abrir el día, igual que en Bulk Up. `sesion` guarda el id de la rutina elegida, o
 * `descanso`, o `otra` (deporte fuera del gimnasio).
 *
 * @returns {'entreno'|'descanso'|'otra'|'sin_decidir'}
 */
export function tipoDeSesion(registro) {
  const sesion = registro?.sesion;
  if (!sesion) return 'sin_decidir';
  return sesion === 'descanso' || sesion === 'otra' ? sesion : 'entreno';
}

/** Rutina elegida ese día, o `null` si ese día no se eligió ninguna. */
export function rutinaDelDia(db, registro) {
  return db?.rutinas?.find((r) => r.id === registro?.sesion) ?? null;
}

/**
 * Ejercicios que toca ese día: los de la rutina, con lo ya registrado encima.
 * Los que se registraron y luego salieron de la rutina se conservan al final para no
 * borrar trabajo hecho al editar el plan.
 */
export function ejerciciosDelDia(registro, rutina) {
  const registrados = registro?.ejercicios ?? [];
  if (!rutina) return registrados;

  const porId = new Map(registrados.map((e) => [e.id, e]));
  const deLaRutina = rutina.ejercicios.map(
    (e) => porId.get(e.id) ?? { id: e.id, importancia: e.importancia, estado: null },
  );
  const sueltos = registrados.filter((e) => !rutina.ejercicios.some((x) => x.id === e.id));
  return [...deLaRutina, ...sueltos];
}

/**
 * Comidas que toca ese día: las que ya estén marcadas, y si no, las del plan semanal.
 * Así el registro diario no parte de una lista vacía sino de lo que uno se había propuesto.
 */
export function comidasDelDia(registro, plan, fecha) {
  if (registro?.comidas?.length) return registro.comidas;

  const previstas = plan?.comidasPorDia?.[diaDeLaSemana(fecha)] ?? [];
  return previstas.map((nombre, i) => ({ id: `p${i}`, nombre, estado: null }));
}

/**
 * Convierte un registro crudo en el día que consume el motor de puntuación.
 * Un día sin sesión elegida no se exige por sí solo: lo que sostiene la racha es la cuota
 * de días cumplidos por ventana, que sale del compromiso semanal.
 */
export function evaluarDia(registro, fecha, { db, hoy } = {}) {
  const sesion = tipoDeSesion(registro);
  const rutina = sesion === 'entreno' ? rutinaDelDia(db, registro) : null;
  const ejercicios = ejerciciosDelDia(registro, rutina);
  const comidas = comidasDelDia(registro, db?.plan, fecha);
  const cerrado = Boolean(hoy) && fecha < hoy;

  return {
    fecha,
    sesion,
    entreno: sesion === 'entreno' && ejercicios.length > 0 ? puntuarEntreno(ejercicios, { cerrado }) : null,
    comida: comidas.length > 0 ? puntuarDiaComida(comidas, { cerrado }) : null,
    extras: registro?.extras ?? [],
  };
}

/**
 * Historial continuo desde el primer registro hasta `hoy`, rellenando los días en los que
 * no se abrió la app. Sin ese relleno, dejar de registrar durante una semana no rompería
 * ninguna racha: los huecos simplemente no existirían.
 *
 * @param {{ plan: object, rutinas: object[], dias: Record<string, object> }} db
 * @param {string} hoy fecha ISO
 */
export function construirHistorial(db, hoy) {
  const fechas = Object.keys(db.dias).sort();
  const primera = fechas[0] ?? hoy;
  if (diasEntre(primera, hoy) < 0) return [];

  const historial = [];
  for (let fecha = primera; diasEntre(fecha, hoy) >= 0; fecha = sumarDias(fecha, 1)) {
    historial.push(evaluarDia(db.dias[fecha], fecha, { db, hoy }));
  }
  return historial;
}
