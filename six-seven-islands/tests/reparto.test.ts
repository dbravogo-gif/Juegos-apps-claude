// Quién lleva cada criatura (autor, 2026-11-19): salían «iniciales» en la hierba y en entrenadores
// porque las criaturas de relleno tomaban prestado el modelo de una inicial. Las iniciales solo las
// llevan tú y tu amigo; ninguna otra criatura usa su modelo.
import { describe, expect, it } from 'vitest';
import { crearCriatura } from '../src/core/criatura';
import { vidaMaxima } from '../src/core/estadisticas';
import { cambiarRetiradas } from '../src/core/guardado';
import { crearRng } from '../src/core/rng';
import { DATOS_COMBATE_PRUEBA as DATOS, ESPECIES_RETIRADAS, MODELO_DE } from '../src/data/combate-prueba';
import { ENCUENTROS_ISLA1 } from '../src/data/encuentros-isla1';
import { ENCUENTROS_ISLA2 } from '../src/data/encuentros-isla2';
import { ENTRENADORES_ISLA1 } from '../src/data/entrenadores-isla1';
import { ENTRENADORES_ISLA2 } from '../src/data/entrenadores-isla2';
import { ESPECIE_RAMA } from '../src/data/pueblos';
import { RECADOS_ISLA1 } from '../src/data/recados-isla1';

const esInicial = (id: string) => id.startsWith('inicial-');
const ENTRENADORES = { ...ENTRENADORES_ISLA1, ...ENTRENADORES_ISLA2 };

describe('reparto de las criaturas', () => {
  it('ningún entrenador lleva una inicial (tu amigo, sí: la suya va aparte)', () => {
    for (const [quien, d] of Object.entries(ENTRENADORES)) {
      for (const { especie } of [...d.equipo, ...(d.rival?.extra ?? [])]) {
        expect(DATOS.especies[especie], `${quien}: ${especie}`).toBeDefined();
        expect(esInicial(especie), `${quien}: ${especie}`).toBe(false);
      }
    }
  });

  it('ninguna hierba saca una inicial, ni la llevan los soldados de las ramas', () => {
    for (const tabla of [ENCUENTROS_ISLA1, ENCUENTROS_ISLA2]) {
      for (const [zona, lista] of Object.entries(tabla)) {
        for (const { especie } of lista) {
          expect(DATOS.especies[especie], `${zona}: ${especie}`).toBeDefined();
          expect(esInicial(especie), `${zona}: ${especie}`).toBe(false);
        }
      }
    }
    for (const especie of Object.values(ESPECIE_RAMA)) expect(esInicial(especie), especie).toBe(false);
  });

  it('el modelo de una inicial es solo suyo', () => {
    for (const [id, modelo] of Object.entries(MODELO_DE)) {
      if (!esInicial(id)) expect(modelo.startsWith('iniciales/'), `${id}: ${modelo}`).toBe(false);
    }
  });

  it('la criatura que pide un recado se puede capturar en Lanzarote', () => {
    const salvajes = new Set(Object.values(ENCUENTROS_ISLA1).flatMap((l) => l.map((e) => e.especie)));
    for (const r of Object.values(RECADOS_ISLA1)) {
      if ('especie' in r.pide && r.pide.especie) expect(salvajes.has(r.pide.especie), r.id).toBe(true);
    }
  });
});

describe('partidas guardadas con una criatura quitada', () => {
  it('cada quitada tiene sustituta, que existe', () => {
    for (const [vieja, nueva] of Object.entries(ESPECIES_RETIRADAS)) {
      expect(DATOS.especies[vieja], vieja).toBeUndefined();
      expect(DATOS.especies[nueva], nueva).toBeDefined();
    }
  });

  it('al cargar, la quitada pasa a su sustituta sin pasarse de Vida, y las demás no cambian', () => {
    const buena = crearCriatura(DATOS, 'c031-1', 8, crearRng('r'));
    const vieja = { ...crearCriatura(DATOS, 'c007-1', 8, crearRng('r')), especie: 'tabaiba-andante', vida: 999 };
    const [a, b] = cambiarRetiradas([buena, vieja], ESPECIES_RETIRADAS, DATOS);
    expect(a).toBe(buena);
    expect(b.especie).toBe('c007-1');
    expect(b.vida).toBe(vidaMaxima(b, DATOS));
    expect(b.uid).toBe(vieja.uid);
  });
});
