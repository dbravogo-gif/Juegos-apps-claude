import { evaluarDia, rutinaDelDia, comidasDelDia, tipoDeSesion } from './history.js';
import { clasificarEntreno, clasificarComida } from '../core/scoring/streaks.js';

/**
 * Consultas del historial. Nada de esto se guarda: se deriva de los días registrados, que
 * se conservan enteros y para siempre. Recortar el historial no ahorraría trabajo, sería
 * tirar datos que ya están.
 */

/** Los números se guardan como texto, tal cual se teclean. */
const numero = (valor) => {
  const n = Number.parseFloat(String(valor ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

const mesDe = (fecha) => fecha.slice(0, 7);

/** Meses que tienen algún registro, del más reciente al más antiguo. */
export function mesesConRegistro(db) {
  return [...new Set(Object.keys(db.dias ?? {}).map(mesDe))].sort().reverse();
}

/** Días naturales de un mes `YYYY-MM`, con el lunes como primera columna. */
export function diasDelMes(mes) {
  const [anio, m] = mes.split('-').map(Number);
  const ultimo = new Date(Date.UTC(anio, m, 0)).getUTCDate();
  return Array.from({ length: ultimo }, (_, i) => `${mes}-${String(i + 1).padStart(2, '0')}`);
}

/** Cuántas casillas vacías van antes del día 1 para que caiga en su columna. */
export function huecoInicial(mes) {
  return (new Date(`${mes}-01T00:00:00Z`).getUTCDay() + 6) % 7;
}

/**
 * Un mes entero clasificado, para el calendario. Los días sin registro salen como
 * `sin_datos` y no como fallados: el calendario cuenta lo que pasó, no juzga.
 */
export function calendarioDelMes(db, mes, hoy) {
  return diasDelMes(mes).map((fecha) => {
    const registro = db.dias?.[fecha];
    if (!registro) return { fecha, sesion: 'sin_datos', entreno: 'sin_datos', comida: 'sin_datos' };

    const dia = evaluarDia(registro, fecha, { db, hoy });
    return {
      fecha,
      sesion: dia.sesion,
      entreno: clasificarEntreno(dia),
      comida: clasificarComida(dia),
    };
  });
}

/** Todo lo que se registró un día concreto, listo para enseñar. */
export function detalleDelDia(db, fecha) {
  const registro = db.dias?.[fecha];
  if (!registro) return null;

  const dia = evaluarDia(registro, fecha, { db, hoy: fecha });
  const rutina = rutinaDelDia(db, registro);
  const porId = new Map((rutina?.ejercicios ?? []).map((e) => [e.id, e]));

  return {
    fecha,
    sesion: tipoDeSesion(registro),
    // La rutina puede haberse borrado después; el nombre guardado en el registro sobrevive.
    rutina: rutina?.nombre ?? null,
    cumplimiento: dia.entreno?.cumplimiento ?? null,
    puntuacionComida: dia.comida?.puntuacion ?? null,
    ejercicios: (registro.ejercicios ?? []).map((e) => ({
      nombre: e.nombre ?? porId.get(e.id)?.nombre ?? e.id,
      estado: e.estado,
      series: (e.series ?? []).filter((s) => s.hecha),
    })),
    comidas: comidasDelDia(registro, db.plan, fecha),
  };
}

/** Ejercicios con al menos un peso anotado, los más registrados primero. */
export function ejerciciosConHistorial(db) {
  const cuenta = new Map();

  Object.values(db.dias ?? {}).forEach((dia) => {
    (dia.ejercicios ?? []).forEach((e) => {
      if (!(e.series ?? []).some((s) => s.hecha && numero(s.peso) !== null)) return;
      const previo = cuenta.get(e.id) ?? { id: e.id, nombre: e.nombre ?? e.id, dias: 0 };
      cuenta.set(e.id, { ...previo, nombre: e.nombre ?? previo.nombre, dias: previo.dias + 1 });
    });
  });

  return [...cuenta.values()].sort((a, b) => b.dias - a.dias || a.nombre.localeCompare(b.nombre));
}

/**
 * Progresión de un ejercicio: el mejor peso de cada día y el volumen movido.
 * El mejor peso es la referencia habitual para ver si uno mejora; el volumen cuenta
 * el trabajo total, que sube aunque el peso se estanque.
 */
export function progresionEjercicio(db, ejercicioId) {
  return Object.entries(db.dias ?? {})
    .map(([fecha, dia]) => {
      const series = ((dia.ejercicios ?? []).find((e) => e.id === ejercicioId)?.series ?? [])
        .filter((s) => s.hecha && numero(s.peso) !== null);
      if (!series.length) return null;

      return {
        fecha,
        mejorPeso: Math.max(...series.map((s) => numero(s.peso))),
        volumen: Math.round(series.reduce((t, s) => t + numero(s.peso) * (numero(s.reps) ?? 0), 0)),
        series: series.length,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}
