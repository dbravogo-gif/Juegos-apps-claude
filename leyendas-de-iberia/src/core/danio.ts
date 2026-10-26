import type { Criatura, DatosJuego, Etapas, Movimiento } from './modelo';
import { calcularEstadisticas, multiplicadorEtapa } from './estadisticas';
import { eficacia } from './tipos';
import { anulaTipo, pasivaDe } from './pasivas';
import { sexoDe } from './criatura';

export interface Combatiente {
  criatura: Criatura;
  etapas: Etapas;
  /** Brasero: un ataque de tipo Infernal le ha avivado los suyos. */
  avivado?: boolean;
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
  const ef = anulaTipo(defensor.criatura, mov.tipo, datos) ? 0 : eficacia(datos.tipos, mov.tipo, espDef.tipos);
  if (mov.categoria === 'estado' || ef === 0) return { danio: 0, eficacia: ef, critico: false };
  const pAt = pasivaDe(atacante.criatura, datos)?.efecto;

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
  let multAt = multiplicadorEtapa(etapaAt);
  if (fisico && pAt?.tipo === 'corpulencia') multAt *= 1.3;
  if (fisico && pAt?.tipo === 'coraje' && atacante.criatura.estado) multAt *= 1.5;
  const a = Math.max(1, Math.floor(statsAt[estAt] * multAt));
  const d = Math.max(1, Math.floor(statsDef[estDef] * multiplicadorEtapa(etapaDef)));
  const nivel = atacante.criatura.nivel;

  let danio = Math.floor(Math.floor((Math.floor((2 * nivel) / 5 + 2) * mov.poder * a) / d) / 50) + 2;
  if (critico) danio = Math.floor(danio * MULT_CRITICO * (pAt?.tipo === 'punteria' ? 1.5 : 1));
  danio = Math.floor((danio * tirada) / 100);
  if (mov.tipo && espAt.tipos.includes(mov.tipo)) danio = Math.floor(danio * (pAt?.tipo === 'afinidad' ? 2 : AFINIDAD));
  danio = Math.floor(danio * ef);
  danio = Math.floor(danio * multiplicadorPasivas(atacante, defensor, mov, ef, statsAt.vida, statsDef.vida, datos));
  if (fisico && atacante.criatura.estado?.tipo === 'quemado' && pAt?.tipo !== 'coraje') danio = Math.floor(danio / 2);
  return { danio: Math.max(1, danio), eficacia: ef, critico };
}

/** Lo que las pasivas de los dos (y el Brasero) añaden al daño, ya con la eficacia calculada. */
function multiplicadorPasivas(
  atacante: Combatiente,
  defensor: Combatiente,
  mov: Movimiento,
  ef: number,
  vidaMaxAt: number,
  vidaMaxDef: number,
  datos: DatosJuego,
): number {
  const pAt = pasivaDe(atacante.criatura, datos)?.efecto;
  const pDef = pasivaDe(defensor.criatura, datos)?.efecto;
  let m = 1;
  if (pAt?.tipo === 'apuro' && pAt.tipoMov === mov.tipo && atacante.criatura.vida <= Math.floor(vidaMaxAt / 3)) m *= 1.5;
  if (pAt?.tipo === 'tecnica' && mov.poder <= 60) m *= 1.5;
  if (pAt?.tipo === 'celos') {
    const s1 = sexoDe(atacante.criatura, datos);
    const s2 = sexoDe(defensor.criatura, datos);
    const conSexo = (s: string) => s === 'macho' || s === 'hembra';
    if (conSexo(s1) && conSexo(s2)) m *= s1 === s2 ? 1.25 : 0.75;
  }
  if (atacante.avivado && mov.tipo === 'infernal') m *= 1.5;
  const obj = atacante.criatura.objeto ? datos.objetos[atacante.criatura.objeto] : undefined;
  if (obj?.tipo === 'equipo' && obj.efecto.tipo === 'potenciarTipo' && obj.efecto.tipoMov === mov.tipo) m *= obj.efecto.multiplicador;
  if (pDef?.tipo === 'resistir' && pDef.tipos.includes(mov.tipo)) m *= 0.5;
  if (pDef?.tipo === 'coraza' && ef > 1) m *= 0.75;
  if (pDef?.tipo === 'escamas' && defensor.criatura.vida >= vidaMaxDef) m *= 0.5;
  return m;
}
