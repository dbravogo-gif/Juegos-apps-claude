// Las escenas de historia que te paran al verte no se esquivan (probador, 2026-11-23 y 2026-11-24).
// El Roque Nublo y la estatua de Las Dunas se podían saltar dando un rodeo: cada escena obligatoria
// va en esta tabla, y la prueba exige que no haya camino de un lado al otro sin pisar su vista.
import { describe, expect, it } from 'vitest';
import { alcanzables, conexiones, construirMundo, enIsla, vision, type Condicion } from '../src/core/mundo';
import { ISLAS } from '../src/data/islas';

interface Escena {
  isla: number;
  zona: string;
  /** Quienes te paran (y su compañero, si lo hay). */
  ids: string[];
  /** De dónde se viene: una zona vecina o una casilla de la propia zona. */
  desde: string | { x: number; y: number };
  /** Adónde no se llega sin la escena. */
  hasta: string;
}

const OBLIGATORIAS: Escena[] = [
  { isla: 1, zona: 'fuego', ids: ['soldado-fuego-1', 'soldado-fuego-2', 'silueta-fuego'], desde: 'pueblo', hasta: 'jable' },
  { isla: 2, zona: 'corralejo', ids: ['chano-corralejo'], desde: { x: 12, y: 5 }, hasta: 'dunas' },
  { isla: 2, zona: 'dunas', ids: ['soldado-dunas-1', 'soldado-dunas-2'], desde: 'corralejo', hasta: 'puerto' },
];

describe('las escenas obligatorias no se saltan', () => {
  for (const e of OBLIGATORIAS) {
    it(`${e.zona}: ${e.ids[0]} corta el paso hacia ${e.hasta}`, () => {
      const m = construirMundo(ISLAS[e.isla]!.def);
      const z = m.zonas.get(e.zona)!;
      const prohibidas = new Set<number>();
      for (const id of e.ids) {
        const p = z.personajes.find((q) => q.id === id);
        expect(p, id).toBeDefined();
        prohibidas.add(enIsla(m, e.zona, p!.x, p!.y));
        for (const k of vision(m, e.zona, p!, [])) prohibidas.add(k);
      }
      const desde = typeof e.desde === 'string' ? conexiones(m, e.zona, e.desde) : [enIsla(m, e.zona, e.desde.x, e.desde.y)];
      const hasta = conexiones(m, e.zona, e.hasta);
      expect(desde.length && hasta.length).toBeTruthy();
      const op = { prohibidas, condiciones: new Set(['inicial-elegida'] as Condicion[]) };
      // Sin la escena no se llega…
      expect(hasta.some((k) => alcanzables(m, desde, op).has(k))).toBe(false);
      // …y sin la prohibición, sí: la prueba no pasa por un mapa roto.
      expect(hasta.some((k) => alcanzables(m, desde, { condiciones: op.condiciones, sinTemporales: true }).has(k))).toBe(true);
    });
  }
});
