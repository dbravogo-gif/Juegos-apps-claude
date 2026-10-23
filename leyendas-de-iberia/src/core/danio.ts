import type { Criatura, DatosJuego, Etapas, Movimiento } from './modelo';
import { calcularEstadisticas, multiplicadorEtapa } from './estadisticas';
import { eficacia } from './tipos';

export interface Combatiente {
  criatura: Criatura;
  etapas: Etapas;
}

export interface ResultadoDanio {
  danio: number;
  eficacia: number;
  critico: boolean;
}

/** Bonificación por usar un movimiento del propio tipo. */
export const AFINIDAD = 1.5;
export const MULT_CRITICO = 1.5;
/** Uno de cada 24 golpes es crítico. */
export const PROB_CRITICO = 100 / 24;

/**
 * Fórmula de daño de Pokémon. `tirada` va de 85 a 100. El llamante decide el crítico y la
 * tirada, así esta función no toca el generador y la IA puede usarla para estimar.
 */
export function calcularDanio(
  atacante: Combatiente,
  defensor: Combatiente,
  mov: Movimiento,
  datos: DatosJuego,
  critico: boolean,
  tirada: number,
): ResultadoDanio {
  const espAt = datos.especies[atacante.criatura.especie];
  const espDef = datos.especies[defensor.criatura.especie];
  const ef = eficacia(datos.tipos, mov.tipo, espDef.tipos);
  if (mov.categoria === 'estado' || ef === 0) return { danio: 0, eficacia: ef, critico: false };

  const statsAt = calcularEstadisticas(atacante.criatura, datos);
  const statsDef = calcularEstadisticas(defensor.criatura, datos);
  const fisico = mov.categoria === 'fisico';
  const estAt = fisico ? 'fuerza' : 'magia';
  const estDef = fisico ? 'escudo' : 'resMagica';
  // El crítico ignora las bajadas propias y las subidas del rival.
  let etapaAt = atacante.etapas[estAt];
  let etapaDef = defensor.etapas[estDef];
  if (critico) {
    etapaAt = Math.max(0, etapaAt);
    etapaDef = Math.min(0, etapaDef);
  }
  const a = Math.max(1, Math.floor(statsAt[estAt] * multiplicadorEtapa(etapaAt)));
  const d = Math.max(1, Math.floor(statsDef[estDef] * multiplicadorEtapa(etapaDef)));
  const nivel = atacante.criatura.nivel;

  let danio = Math.floor(Math.floor((Math.floor((2 * nivel) / 5 + 2) * mov.poder * a) / d) / 50) + 2;
  if (critico) danio = Math.floor(danio * MULT_CRITICO);
  danio = Math.floor((danio * tirada) / 100);
  if (mov.tipo && espAt.tipos.includes(mov.tipo)) danio = Math.floor(danio * AFINIDAD);
  danio = Math.floor(danio * ef);
  if (fisico && atacante.criatura.estado?.tipo === 'quemado') danio = Math.floor(danio / 2);
  return { danio: Math.max(1, danio), eficacia: ef, critico };
}
