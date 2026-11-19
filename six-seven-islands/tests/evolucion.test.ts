// La evolución (autor, 2026-11-19): tras un combate, evolucionan las que han subido de nivel y ya
// pueden; las iniciales, a los niveles 16 y 34, con sus tres formas del autor.
import { describe, expect, it } from 'vitest';
import { crearCriatura } from '../src/core/criatura';
import { evolucionesTrasCombate } from '../src/core/progreso';
import { crearRng } from '../src/core/rng';
import { DATOS_COMBATE_PRUEBA as DATOS, MODELO_DE, NIVELES_EVOLUCION_INICIAL } from '../src/data/combate-prueba';

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
