// Los 25 temperamentos: uno por cada par (sube, baja) de las cinco estadísticas de combate. Los
// cinco con sube = baja son neutros. Nombres propios de este juego (R8): ninguno coincide con
// los de otras obras del género.

import type { EstadisticaCombate, Temperamento } from '../core/modelo';

const NOMBRES: Record<EstadisticaCombate, Record<EstadisticaCombate, string>> = {
  fuerza: { fuerza: 'Equilibrado', escudo: 'Temerario', magia: 'Bruto', resMagica: 'Impetuoso', celeridad: 'Tozudo' },
  escudo: { fuerza: 'Prudente', escudo: 'Sosegado', magia: 'Terco', resMagica: 'Recio', celeridad: 'Pachorro' },
  magia: { fuerza: 'Soñador', escudo: 'Curioso', magia: 'Pensativo', resMagica: 'Inquieto', celeridad: 'Estudioso' },
  resMagica: { fuerza: 'Dulce', escudo: 'Sensible', magia: 'Sencillo', resMagica: 'Paciente', celeridad: 'Calmoso' },
  celeridad: { fuerza: 'Nervioso', escudo: 'Travieso', magia: 'Vivaracho', resMagica: 'Impaciente', celeridad: 'Despierto' },
};

const quitarTildes = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '');

export const TEMPERAMENTOS: Temperamento[] = (Object.keys(NOMBRES) as EstadisticaCombate[]).flatMap((sube) =>
  (Object.keys(NOMBRES[sube]) as EstadisticaCombate[]).map((baja) => ({
    id: quitarTildes(NOMBRES[sube][baja]).toLowerCase(),
    nombre: NOMBRES[sube][baja],
    sube,
    baja,
  })),
);
