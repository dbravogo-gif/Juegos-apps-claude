import { resumenDelDia } from './day.js';
import { nivelDesdeXp } from './economy/levels.js';
import { diasExentos } from './scoring/exemptions.js';

const sumar = (lista, campo) => lista.reduce((total, x) => total + (x[campo] ?? 0), 0);

/**
 * Marca en cada día si cae dentro de una exención de entreno, para que el motor de rachas
 * no lo exija.
 */
export function aplicarExenciones(historial, exenciones) {
  const exentos = diasExentos(exenciones);
  return historial.map((dia) =>
    exentos.has(dia.fecha) ? { ...dia, exencionEntreno: true } : dia,
  );
}

/**
 * Estado completo derivado del historial. La XP y las monedas ganadas no se almacenan:
 * se recalculan desde los registros para que no puedan desincronizarse. Lo único que se
 * guarda aparte es lo gastado, que no se deduce de la actividad.
 *
 * El coste es cuadrático con los días registrados porque el multiplicador de cada día
 * depende de su propio pasado. Con un par de años de historial sigue siendo cuestión de
 * milisegundos, pero conviene llamarlo al cambiar los datos y no en cada repintado.
 *
 * @param {import('./scoring/streaks.js').DiaHistorial[]} historial ordenado por fecha
 * @param {{ exenciones?: object[], monedasGastadas?: number }} opciones
 */
export function estadoDesdeHistorial(historial, { exenciones = [], monedasGastadas = 0 } = {}) {
  const dias = aplicarExenciones(historial, exenciones);

  let xp = 0;
  let monedasGanadas = 0;

  const resumenes = dias.map((dia, i) => {
    const resumen = resumenDelDia(dias, i);
    const extras = dia.extras ?? [];

    xp += resumen.recompensa.total.xp + sumar(extras, 'xp');
    monedasGanadas += resumen.recompensa.total.monedas + sumar(extras, 'monedas');

    return resumen;
  });

  const hoy = resumenes[resumenes.length - 1] ?? null;

  return {
    xp,
    dias,
    nivel: nivelDesdeXp(xp),
    monedas: { ganadas: monedasGanadas, gastadas: monedasGastadas, disponibles: monedasGanadas - monedasGastadas },
    rachas: hoy ? hoy.rachas : null,
    hoy,
    resumenes,
  };
}
