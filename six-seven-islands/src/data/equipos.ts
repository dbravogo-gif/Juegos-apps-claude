// Los equipos de los entrenadores, según tu inicial (2026-11-25). Lo usan el combate y el
// simulador de partida (herramientas/simular/), para que los dos luchen exactamente contra lo mismo.
// Puro: sin DOM; el azar sale del generador que se le pasa, en el mismo orden que antes en combate.

import { crearCriatura } from '../core/criatura';
import type { Criatura } from '../core/modelo';
import { formaAlNivel } from '../core/progreso';
import type { EstadoRng } from '../core/rng';
import { DATOS_COMBATE_PRUEBA as DATOS, ENTRENADOR_PRUEBA, ESPECIE_INICIAL, RIVAL_DE } from './combate-prueba';
import type { DefEntrenador } from './entrenadores-isla1';
import { ESPECIE_RAMA, inicialDelRival, inicialesDeAmigos, puebloQueTePersigue, type TipoInicial } from './pueblos';

export interface EquipoRival {
  /** Las criaturas del entrenador. */
  rivales: Criatura[];
  /** Los dos líderes juntos (el terrero de Agaete): las del otro líder y las de tu aliado. */
  pareja?: { delOtro: Criatura[]; aliado: Criatura[] };
}

/**
 * El equipo de un entrenador contra quien eligió esta inicial:
 * - el primer entrenador saca la inicial que pierde contra la tuya;
 * - los soldados de la rama, la especie del pueblo que te persigue, en la forma de su nivel;
 * - tu rival (el amigo), la inicial del pueblo al que ataca el tuyo (HISTORIA.md);
 * - el resto, su equipo fijo.
 */
export function equipoDeEntrenador(id: string, entrenadores: Readonly<Record<string, DefEntrenador>>, inicial: TipoInicial, rng: EstadoRng): EquipoRival {
  const def = entrenadores[id];
  if (!def) throw new Error(`No hay entrenador «${id}»`);
  const crear = (especie: string, nivel: number) => crearCriatura(DATOS, especie, nivel, rng);
  const rivales =
    id === ENTRENADOR_PRUEBA
      ? [crear(ESPECIE_INICIAL[RIVAL_DE[inicial] ?? 'roca']!, 5)]
      : def.rama
        ? def.rama.niveles.map((nivel) => crear(formaAlNivel(DATOS, ESPECIE_RAMA[puebloQueTePersigue(inicial)], nivel), nivel))
        : def.rival
          ? [crear(formaAlNivel(DATOS, ESPECIE_INICIAL[inicialDelRival(inicial)]!, def.rival.nivel), def.rival.nivel), ...(def.rival.extra ?? []).map((e) => crear(e.especie, e.nivel))]
          : def.equipo.map((e) => crear(e.especie, e.nivel));
  if (!def.pareja) return { rivales };
  const delOtro = (entrenadores[def.pareja.entrenador]?.equipo ?? []).map((e) => crear(e.especie, e.nivel));
  const tipo = inicialesDeAmigos(inicial)[0]!;
  const nivel = def.pareja.nivelAliado;
  const aliado = [crear(formaAlNivel(DATOS, ESPECIE_INICIAL[tipo] ?? ESPECIE_INICIAL.roca!, nivel), nivel), ...(def.pareja.extraAliado ?? []).map((e) => crear(e.especie, e.nivel))];
  return { rivales, pareja: { delOtro, aliado } };
}
