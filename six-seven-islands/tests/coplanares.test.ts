// Barrera contra las caras solapadas en el mismo plano, que titilan (APRENDIDO.md, 2026-11-10):
// salas, casas y cubos no deben tener ninguna.

import { describe, expect, it } from 'vitest';
import { construirInterior } from '../src/core/mundo';
import { INTERIORES_ISLA1 } from '../src/data/interiores-isla1';
import { geometriaSala } from '../src/sistemas/salas/salas';
import { casaCanaria, faro, type OpcionesCasa } from '../src/sistemas/mundo/canario';
import { carasSolapadas } from './utiles/coplanares';

describe('sin caras solapadas en el mismo plano', () => {
  for (const [i, def] of INTERIORES_ISLA1.entries()) {
    it(`sala ${def.id}`, () => {
      const g = geometriaSala(construirInterior(def, { x: 200 + i * 20, y: 0 }), def.id);
      expect(carasSolapadas(g)).toEqual([]);
    });
  }
  const casas: [string, OpcionesCasa][] = [
    ['lanzaroteña', { estilo: 'lanzarote', ancho: 4, fondo: 3, puerta: -0.5, semilla: 4 }],
    ['refugio lanzaroteño', { estilo: 'lanzarote', uso: 'refugio', ancho: 5, fondo: 4, semilla: 5 }],
    ['tienda lanzaroteña', { estilo: 'lanzarote', uso: 'tienda', ancho: 4, fondo: 3, puerta: -0.5, semilla: 8 }],
    ['museo', { estilo: 'lanzarote', uso: 'museo', techo: 'teja', ancho: 8, fondo: 4, puerta: 0.5, semilla: 21 }],
    ['balcones blanca', { estilo: 'balcones', blanca: true, ancho: 4, fondo: 3, puerta: -0.5, semilla: 2 }],
    ['gimnasio', { estilo: 'balcones', blanca: true, emblema: 'volcan', uso: 'gimnasio', techo: 'azotea', ancho: 8, fondo: 6, puerta: 0.5, semilla: 34 }],
    ['rural', { estilo: 'rural', ancho: 4, fondo: 3, puerta: -0.5, semilla: 3 }],
  ];
  for (const [nombre, op] of casas) {
    it(`casa ${nombre}`, () => expect(carasSolapadas(casaCanaria(op))).toEqual([]));
  }
  it('faro', () => expect(carasSolapadas(faro())).toEqual([]));
});
