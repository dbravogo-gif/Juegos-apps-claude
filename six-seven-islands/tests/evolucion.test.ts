// La evolución (autor, 2026-11-19): tras un combate, evolucionan las que han subido de nivel y ya
// pueden; las iniciales, a los niveles 16 y 34, con sus tres formas del autor.
import { describe, expect, it } from 'vitest';
import { crearCriatura } from '../src/core/criatura';
import { evolucionesTrasCombate, formaAlNivel } from '../src/core/progreso';
import { crearRng } from '../src/core/rng';
import { DATOS_COMBATE_PRUEBA as DATOS, MODELO_DE, NIVELES_EVOLUCION_INICIAL } from '../src/data/combate-prueba';
import { ENCUENTROS_ISLA1 } from '../src/data/encuentros-isla1';
import { ENCUENTROS_ISLA2 } from '../src/data/encuentros-isla2';
import { ENTRENADORES_ISLA1 } from '../src/data/entrenadores-isla1';
import { ENTRENADORES_ISLA2 } from '../src/data/entrenadores-isla2';
import { ESPECIE_RAMA } from '../src/data/pueblos';

const MODELOS = Object.keys(import.meta.glob('../public/modelos/**/*.glb')).map((r) => r.replace('../public/modelos/', ''));
const rng = crearRng(7);

describe('evolución tras el combate', () => {
  it('solo la que ha subido de nivel en el combate y ya tiene el de su evolución', () => {
    const sube = crearCriatura(DATOS, 'inicial-agua', 16, rng);
    const noSube = crearCriatura(DATOS, 'inicial-roca', 16, rng);
    const corta = crearCriatura(DATOS, 'inicial-planta', 15, rng);
    const antes = new Map([[sube.uid, 15], [noSube.uid, 16], [corta.uid, 14]]);
    expect(evolucionesTrasCombate(antes, [sube, noSube, corta], DATOS)).toEqual([{ uid: sube.uid, a: 'inicial-agua-2' }]);
  });

  it('la debilitada no evoluciona, y la recién capturada tampoco', () => {
    const debil = { ...crearCriatura(DATOS, 'c031-1', 20, rng), vida: 0 };
    const nueva = crearCriatura(DATOS, 'c031-1', 20, rng);
    expect(evolucionesTrasCombate(new Map([[debil.uid, 19]]), [debil, nueva], DATOS)).toEqual([]);
  });
});

describe('formas de las iniciales', () => {
  it('cada inicial tiene tres formas con modelo, que crecen y evolucionan a los niveles 16 y 34', () => {
    for (const t of ['agua', 'planta', 'infernal', 'roca', 'tierra']) {
      const [f1, f2, f3] = [`inicial-${t}`, `inicial-${t}-2`, `inicial-${t}-3`].map((id) => DATOS.especies[id]!);
      expect(f1!.evoluciona).toEqual([{ a: f2!.id, nivel: NIVELES_EVOLUCION_INICIAL[0] }]);
      expect(f2!.evoluciona).toEqual([{ a: f3!.id, nivel: NIVELES_EVOLUCION_INICIAL[1] }]);
      expect(f3!.evoluciona).toBeUndefined();
      expect(f1!.altura!).toBeLessThan(f2!.altura!);
      expect(f2!.altura!).toBeLessThan(f3!.altura!);
      for (const f of [f1, f2, f3]) expect(MODELOS).toContain(MODELO_DE[f!.id]);
    }
  });

  it('las cinco suman lo mismo en cada forma (314, 405 y 530): ninguna es mejor que otra en total', () => {
    const suma = (id: string) => Object.values(DATOS.especies[id]!.base).reduce((a, b) => a + b, 0);
    for (const t of ['agua', 'planta', 'infernal', 'roca', 'tierra']) {
      expect([suma(`inicial-${t}`), suma(`inicial-${t}-2`), suma(`inicial-${t}-3`)], t).toEqual([314, 405, 530]);
    }
  });
});

describe('evoluciones a su tiempo (autor, 2026-11-19)', () => {
  // A qué nivel se llega a cada especie evolucionando.
  const desde = new Map<string, number>();
  for (const e of Object.values(DATOS.especies)) for (const ev of e.evoluciona ?? []) desde.set(ev.a, ev.nivel);
  // La excepción: Ishiradon, la estrella de la líder de Roca.
  const EXCEPCIONES = new Set(['lider-gimnasio>c062-2']);

  it('ningún entrenador lleva una forma evolucionada antes del nivel al que se evoluciona', () => {
    for (const [quien, d] of Object.entries({ ...ENTRENADORES_ISLA1, ...ENTRENADORES_ISLA2 })) {
      for (const { especie, nivel } of d.equipo) {
        if (EXCEPCIONES.has(`${quien}>${especie}`)) continue;
        expect(nivel, `${quien}: ${especie} al ${nivel}`).toBeGreaterThanOrEqual(desde.get(especie) ?? 0);
      }
    }
  });

  it('ninguna salvaje sale evolucionada antes de tiempo', () => {
    for (const tabla of [ENCUENTROS_ISLA1, ENCUENTROS_ISLA2]) {
      for (const [zona, lista] of Object.entries(tabla)) {
        for (const { especie, nivel } of lista) expect(nivel[0], `${zona}: ${especie}`).toBeGreaterThanOrEqual(desde.get(especie) ?? 0);
      }
    }
  });
});

describe('los equipos por nivel llevan la forma de su nivel (probador, 2026-11-24)', () => {
  it('la especie de cada rama sube de forma con el nivel, y no antes', () => {
    for (const especie of Object.values(ESPECIE_RAMA)) {
      const ev = DATOS.especies[especie]!.evoluciona![0]!;
      expect(formaAlNivel(DATOS, especie, ev.nivel - 1)).toBe(especie);
      expect(formaAlNivel(DATOS, especie, ev.nivel)).toBe(ev.a);
    }
  });

  it('el comandante del Roque Nublo ya no lleva primeras formas al 26', () => {
    for (const especie of Object.values(ESPECIE_RAMA)) {
      const forma = formaAlNivel(DATOS, especie, 26);
      // Todas las ramas evolucionan antes del 26 salvo la de Agua (Aculiso, al 30).
      if ((DATOS.especies[especie]!.evoluciona![0]!.nivel) <= 26) expect(forma, especie).not.toBe(especie);
    }
  });
});
