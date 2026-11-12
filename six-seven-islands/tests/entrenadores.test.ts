// Los entrenadores de la isla 1 (F16, 2026-11-12): ven al jugador en su línea de visión, todos
// tienen equipo y premio, y el vencido ya no ve a nadie.
import { describe, expect, it } from 'vitest';
import { construirMundo, deClave, entrenadorQueVe, vision } from '../src/core/mundo';
import { ISLA_1 } from '../src/data/isla1';
import { ENTRENADORES_ISLA1 } from '../src/data/entrenadores-isla1';
import { DATOS_COMBATE_PRUEBA } from '../src/data/combate-prueba';

const m = construirMundo(ISLA_1);

describe('entrenadores de la isla 1', () => {
  it('cada entrenador ve al jugador en su línea de visión; vencido, ya no', () => {
    for (const z of ISLA_1.zonas) {
      for (const p of z.personajes.filter((q) => q.entrenador)) {
        for (const k of vision(m, z.id, p)) {
          const [x, y] = deClave(k);
          expect(entrenadorQueVe(m, x, y, [])?.personaje, p.id).toBe(p.id);
          expect(entrenadorQueVe(m, x, y, [p.id])?.personaje).not.toBe(p.id);
        }
      }
    }
  });

  it('fuera de las líneas de visión no ve nadie', () => {
    const z = m.zonas.get('inicial')!;
    expect(entrenadorQueVe(m, z.origen.x + 5, z.origen.y + 13, [])).toBeNull();
  });

  it('todos los entrenadores, y la líder, tienen equipo de especies que existen y premio', () => {
    const ids = [
      ...ISLA_1.zonas.flatMap((z) => z.personajes.filter((p) => p.entrenador).map((p) => p.id)),
      'lider-gimnasio',
    ];
    for (const id of ids) {
      const def = ENTRENADORES_ISLA1[id];
      expect(def, id).toBeDefined();
      expect(def.premio, id).toBeGreaterThan(0);
      for (const e of def.equipo) expect(DATOS_COMBATE_PRUEBA.especies[e.especie], `${id}: ${e.especie}`).toBeDefined();
    }
    // La líder, en su gimnasio, abre el barco.
    expect(ENTRENADORES_ISLA1['lider-gimnasio'].condicion).toBe('gimnasio-vencido');
  });
});
