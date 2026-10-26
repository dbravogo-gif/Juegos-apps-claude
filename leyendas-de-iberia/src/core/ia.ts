// IA del rival. Usa el generador del propio combate, así que también es determinista.

import type { DatosJuego, EstadoAlterado, Movimiento } from './modelo';
import { elegir, probabilidad } from './rng';
import { calcularDanio } from './danio';
import { calcularEstadisticas } from './estadisticas';
import { anulaTipo, inmuneAEstado, puedeSufrir } from './pasivas';
import type { Accion, EstadoCombate } from './combate';

/** Probabilidad (sobre 100) de que un entrenador no elija el mejor movimiento. */
const DESPISTE_ENTRENADOR = 15;

/** Lo que vale provocar cada estado, en «fracciones de la Vida del rival». */
const VALOR_ESTADO: Record<EstadoAlterado, number> = {
  dormido: 0.6,
  paralizado: 0.5,
  intoxicado: 0.5,
  quemado: 0.45,
  envenenado: 0.4,
  colera: 0.35,
};

export function elegirAccionIA(e: EstadoCombate, datos: DatosJuego): Accion {
  const yo = e.rival.equipo[e.rival.activo];
  const usables = yo.movimientos.map((m, i) => (m.pp > 0 ? i : -1)).filter((i) => i >= 0);
  if (usables.length === 0) return { tipo: 'movimiento', indice: -1 };
  if ((e.salvaje && !e.iaAstuta) || probabilidad(e.rng, DESPISTE_ENTRENADOR)) {
    return { tipo: 'movimiento', indice: elegir(e.rng, usables) };
  }
  let mejor = usables[0];
  let mejorPuntos = -Infinity;
  for (const i of usables) {
    const puntos = puntuar(e, datos.movimientos[yo.movimientos[i].id], datos);
    if (puntos > mejorPuntos) {
      mejor = i;
      mejorPuntos = puntos;
    }
  }
  return { tipo: 'movimiento', indice: mejor };
}

/** Valor aproximado de un movimiento, en «fracciones de la Vida del rival». */
function puntuar(e: EstadoCombate, mov: Movimiento, datos: DatosJuego): number {
  const yo = e.rival.equipo[e.rival.activo];
  const tu = e.jugador.equipo[e.jugador.activo];
  const acierto = (mov.precision ?? 100) / 100;

  if (mov.categoria !== 'estado') {
    const r = calcularDanio(
      { criatura: yo, etapas: e.rival.etapas, avivado: e.rival.volatil.avivado },
      { criatura: tu, etapas: e.jugador.etapas },
      mov,
      datos,
      false,
      92,
    );
    if (r.eficacia === 0) return 0;
    const fraccion = r.danio / Math.max(1, tu.vida);
    return (fraccion >= 1 ? 1.5 : fraccion) * acierto;
  }

  // Un ataque de estado contra una pasiva que anula su tipo no sirve de nada.
  if (anulaTipo(tu, mov.tipo, datos) && (mov.efectos ?? []).some((f) => f.tipo !== 'curar' && !(f.tipo === 'etapa' && f.objetivo === 'propio'))) return 0;
  let puntos = 0;
  for (const f of mov.efectos ?? []) {
    switch (f.tipo) {
      case 'estado':
        if (puedeSufrir(tu, f.estado, datos)) puntos += VALOR_ESTADO[f.estado];
        break;
      case 'cegar':
        if (e.jugador.volatil.ceguera === 0 && !inmuneAEstado(tu, 'cegado', datos)) puntos += 0.35;
        break;
      case 'drenadoras':
        if (!e.jugador.volatil.drenadoras && !datos.especies[tu.especie].tipos.includes('planta')) puntos += 0.4;
        break;
      case 'proteger':
        // De vez en cuando, y nunca dos veces seguidas.
        if (e.rival.volatil.protecciones === 0) puntos += 0.15;
        break;
      case 'etapa': {
        const etapas = f.objetivo === 'propio' ? e.rival.etapas : e.jugador.etapas;
        const margen = f.cambio > 0 ? etapas[f.estadistica] < 2 : etapas[f.estadistica] > -2;
        if (margen) puntos += f.objetivo === 'propio' ? 0.3 : 0.25;
        break;
      }
      case 'curar': {
        const max = calcularEstadisticas(yo, datos).vida;
        puntos += yo.vida < max / 2 ? 0.7 : 0.05;
        break;
      }
      case 'drenar':
      case 'retroceso':
        break;
    }
  }
  return puntos * acierto;
}
