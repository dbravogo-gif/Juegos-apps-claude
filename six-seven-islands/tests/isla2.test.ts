// Fuerteventura, fase 1 (2026-11-13; ISLA-2.md): Corralejo y Las Dunas. Desde el muelle se llega a
// todo; las zonas se tocan; los entrenadores ven por donde se pasa; el camino del sur, cerrado.
import { describe, expect, it } from 'vitest';
import { alcanzables, clave, construirInterior, construirMundo, deClave, transitable, vision, DE_ENCUENTROS } from '../src/core/mundo';
import { interactuar, crearExploracion } from '../src/core/explorar';
import { ISLAS, FUERTEVENTURA, LANZAROTE } from '../src/data/islas';
import { ISLA_2, PUERTAS_ISLA2 } from '../src/data/isla2';
import { DATOS_COMBATE_PRUEBA as DATOS } from '../src/data/combate-prueba';

const m = construirMundo(ISLA_2);
const zona = (id: string) => m.zonas.get(id)!;
const enIsla = (z: string, x: number, y: number) => clave(zona(z).origen.x + x, zona(z).origen.y + y);
const llegada = enIsla(FUERTEVENTURA.llegada.zona, FUERTEVENTURA.llegada.x, FUERTEVENTURA.llegada.y);
const r = alcanzables(m, [llegada]);
const vecinas = (k: number) => {
  const [x, y] = deClave(k);
  return [clave(x + 1, y), clave(x - 1, y), clave(x, y + 1), clave(x, y - 1)];
};

describe('Fuerteventura (isla 2)', () => {
  it('está registrada con su número y su llegada se pisa en las dos islas', () => {
    expect(ISLAS[2]).toBe(FUERTEVENTURA);
    for (const d of [LANZAROTE, FUERTEVENTURA]) {
      const mm = construirMundo(d.def);
      const z = mm.zonas.get(d.llegada.zona)!;
      expect(transitable(mm, z.origen.x + d.llegada.x, z.origen.y + d.llegada.y), d.nombre).toBe(true);
    }
  });

  it('desde el muelle se llega a Las Dunas, a cada puerta, a cada personaje y a cada objeto', () => {
    expect([...r].some((k) => m.casillas.get(k)?.zona === 'dunas')).toBe(true);
    for (const [z, puertas] of Object.entries(PUERTAS_ISLA2)) {
      for (const xy of Object.keys(puertas)) {
        const [x, y] = xy.split(',').map(Number);
        expect(vecinas(enIsla(z, x, y)).some((v) => r.has(v)), `${z} ${xy}`).toBe(true);
      }
    }
    for (const z of ISLA_2.zonas) {
      for (const p of z.personajes) expect(vecinas(enIsla(z.id, p.x, p.y)).some((v) => r.has(v)), p.id).toBe(true);
      for (const o of z.objetos ?? []) expect(r.has(enIsla(z.id, o.x, o.y)), o.id).toBe(true);
    }
  });

  it('el camino del sur (en Ajuy) está cerrado, con aviso, y no se abre con nada de lo que hay', () => {
    const x = [...m.casillas].filter(([, c]) => c.c === 'X').map(([k]) => k);
    expect(x.every((k) => m.casillas.get(k)!.zona === 'ajuy')).toBe(true);
    expect(x.length).toBe(3);
    expect(x.some((k) => vecinas(k).some((v) => r.has(v)))).toBe(true);
    for (const k of x) expect(r.has(k)).toBe(false);
  });

  it('en Las Dunas, casi todo es arena con criaturas, con descansos de tierra dura', () => {
    const pisables = [...r].filter((k) => m.casillas.get(k)?.zona === 'dunas');
    const arena = pisables.filter((k) => DE_ENCUENTROS.has(m.casillas.get(k)!.c));
    expect(arena.length / pisables.length).toBeGreaterThan(0.6);
    expect(arena.length / pisables.length).toBeLessThan(0.95);
  });

  it('cada entrenador de Las Dunas ve casillas por las que se pasa, y todos tienen equipo', () => {
    for (const p of zona('dunas').personajes.filter((x) => x.entrenador)) {
      const ve = vision(m, 'dunas', p);
      expect(ve.some((k) => r.has(k)), p.id).toBe(true);
      const def = FUERTEVENTURA.entrenadores[p.id];
      expect(def?.equipo.length, p.id).toBeGreaterThan(0);
      for (const e of def.equipo) expect(DATOS.especies[e.especie], e.especie).toBeDefined();
    }
  });

  it('las zonas van encadenadas: Corralejo, Las Dunas, Puerto del Rosario, Betancuria y Ajuy', () => {
    const orden = ['corralejo', 'dunas', 'puerto', 'betancuria', 'ajuy'];
    for (const z of orden) expect([...r].some((k) => m.casillas.get(k)?.zona === z), z).toBe(true);
  });

  it('el guarda de Betancuria no se esquiva camino de Ajuy', () => {
    const g = zona('betancuria').personajes.find((p) => p.id === 'guarda-betancuria')!;
    const ve = new Set(vision(m, 'betancuria', g));
    const sinVer = alcanzables(m, [llegada], { prohibidas: ve });
    expect([...sinVer].some((k) => m.casillas.get(k)?.zona === 'ajuy')).toBe(false);
  });

  it('la cueva de Ajuy se entra por la boca del acantilado y tiene su objeto', () => {
    const cueva = FUERTEVENTURA.interiores.find((d) => d.id === 'cueva-ajuy')!;
    expect(cueva).toBeDefined();
    expect(cueva.objetos?.length).toBe(1);
    expect(Object.values(PUERTAS_ISLA2.ajuy)).toContain('cueva-ajuy');
  });

  it('la arqueóloga está junto a la estatua y cuenta la historia', () => {
    const a = zona('dunas').personajes.find((p) => p.id === 'arqueologa')!;
    const e = { ...crearExploracion(m), x: zona('dunas').origen.x + a.x + 1, y: zona('dunas').origen.y + a.y, mira: 'o' as const, zona: 'dunas' };
    expect(interactuar(m, e)).toEqual([{ tipo: 'hablar', zona: 'dunas', personaje: 'arqueologa' }]);
    expect(m.casillas.get(enIsla('dunas', a.x - 1, a.y))?.c).toBe('E');
    expect(FUERTEVENTURA.guion.arqueologa?.length).toBeGreaterThan(0);
  });

  it('sus interiores tienen salida y gente, y los curanderos y tenderos existen', () => {
    for (const def of FUERTEVENTURA.interiores) {
      const s = construirInterior(def, { x: 0, y: 0 });
      expect([...s.casillas.values()].filter((c) => c.c === 'd'), def.id).toHaveLength(1);
      expect(def.personajes.length, def.id).toBeGreaterThan(0);
    }
    const gente = new Set(FUERTEVENTURA.interiores.flatMap((d) => d.personajes.map((p) => p.id)));
    for (const id of [...Object.keys(FUERTEVENTURA.curanderos), ...FUERTEVENTURA.tenderos]) expect(gente.has(id), id).toBe(true);
    expect(FUERTEVENTURA.interiores.some((d) => d.id === FUERTEVENTURA.refugio)).toBe(true);
  });

  it('sus salvajes existen y van del nivel 10 al 15', () => {
    for (const t of Object.values(FUERTEVENTURA.encuentros)) {
      for (const e of t) {
        expect(DATOS.especies[e.especie], e.especie).toBeDefined();
        expect(e.nivel[0]).toBeGreaterThanOrEqual(10);
        expect(e.nivel[1]).toBeLessThanOrEqual(15);
      }
    }
  });
});
