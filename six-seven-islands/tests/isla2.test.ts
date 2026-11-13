// Fuerteventura (2026-11-13; ISLA-2.md): de Corralejo a Morro Jable, con Tindaya y Cofete. Desde el
// muelle se llega a todo; las zonas se tocan; los entrenadores ven por donde se pasa.
import { describe, expect, it } from 'vitest';
import { alcanzables, clave, construirInterior, construirMundo, deClave, transitable, vision, DE_ENCUENTROS } from '../src/core/mundo';
import { interactuar, crearExploracion } from '../src/core/explorar';
import { ISLAS, FUERTEVENTURA, LANZAROTE } from '../src/data/islas';
import { ISLA_2, PUERTAS_ISLA2 } from '../src/data/isla2';
import { DATOS_COMBATE_PRUEBA as DATOS } from '../src/data/combate-prueba';
import { quienEs } from '../src/data/entrenadores-isla1';

const m = construirMundo(ISLA_2);
const zona = (id: string) => m.zonas.get(id)!;
const enIsla = (z: string, x: number, y: number) => clave(zona(z).origen.x + x, zona(z).origen.y + y);
const llegada = enIsla(FUERTEVENTURA.llegada.zona, FUERTEVENTURA.llegada.x, FUERTEVENTURA.llegada.y);
const r = alcanzables(m, [llegada]);
const vecinas = (k: number) => {
  const [x, y] = deClave(k);
  return [clave(x + 1, y), clave(x - 1, y), clave(x, y + 1), clave(x, y - 1)];
};

/** Las zonas que no están en el camino al gimnasio (ISLA-2.md). */
const OPCIONALES = ['tindaya', 'cofete'];

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

  it('se cruza entera, de Corralejo a Morro Jable, y se llega a la puerta del gimnasio de Aire', () => {
    expect([...m.casillas.values()].some((c) => c.c === 'X')).toBe(false);
    const [xy] = Object.entries(PUERTAS_ISLA2.morro).find(([, sala]) => sala === 'gimnasio-aire')!;
    const [x, y] = xy.split(',').map(Number);
    expect(r.has(enIsla('morro', x, y))).toBe(true);
  });

  it('en Las Dunas, casi todo es arena con criaturas, con descansos de tierra dura', () => {
    const pisables = [...r].filter((k) => m.casillas.get(k)?.zona === 'dunas');
    const arena = pisables.filter((k) => DE_ENCUENTROS.has(m.casillas.get(k)!.c));
    expect(arena.length / pisables.length).toBeGreaterThan(0.6);
    expect(arena.length / pisables.length).toBeLessThan(0.95);
  });

  it('cada entrenador de la isla ve casillas por las que se pasa, y todos tienen equipo', () => {
    for (const p of ISLA_2.zonas.flatMap((z) => z.personajes.filter((x) => x.entrenador).map((x) => ({ ...x, zona: z.id })))) {
      const ve = vision(m, p.zona, p);
      expect(ve.some((k) => r.has(k)), p.id).toBe(true);
      const def = FUERTEVENTURA.entrenadores[p.id];
      expect(def?.equipo.length, p.id).toBeGreaterThan(0);
      for (const e of def.equipo) expect(DATOS.especies[e.especie], e.especie).toBeDefined();
    }
  });

  it('las zonas van encadenadas: Corralejo, Las Dunas, Puerto del Rosario, Betancuria, Ajuy, Sotavento y Morro Jable', () => {
    const orden = ['corralejo', 'dunas', 'puerto', 'betancuria', 'ajuy', 'sotavento', 'morro'];
    for (const z of orden) expect([...r].some((k) => m.casillas.get(k)?.zona === z), z).toBe(true);
  });

  it('el guarda de Betancuria no se esquiva camino de Ajuy', () => {
    const g = zona('betancuria').personajes.find((p) => p.id === 'guarda-betancuria')!;
    const ve = new Set(vision(m, 'betancuria', g));
    const sinVer = alcanzables(m, [llegada], { prohibidas: ve });
    expect([...sinVer].some((k) => m.casillas.get(k)?.zona === 'ajuy')).toBe(false);
  });

  it('todo entrenador de las dos islas dice quién es al hablar, y el gimnasio de Aire es de Aire', () => {
    for (const d of [LANZAROTE, FUERTEVENTURA]) for (const id of Object.keys(d.entrenadores)) expect(quienEs(id), id).toBeDefined();
    for (const id of ['aprendiz-aire-1', 'aprendiz-aire-2', 'aprendiz-aire-3', 'lider-aire']) {
      const tipos = FUERTEVENTURA.entrenadores[id].equipo.map((e) => DATOS.especies[e.especie].tipos[0]);
      expect(tipos.every((t) => t === 'aire'), id).toBe(true);
    }
  });

  it('a Tindaya se llega desde Las Dunas y a Cofete desde Morro Jable, y sin ellas se cruza igual', () => {
    for (const z of OPCIONALES) expect([...r].some((k) => m.casillas.get(k)?.zona === z), z).toBe(true);
    // Las opcionales no son de paso: sin pisarlas, se llega igual al gimnasio.
    const prohibidas = new Set([...m.casillas].filter(([, c]) => OPCIONALES.includes(c.zona)).map(([k]) => k));
    const sin = alcanzables(m, [llegada], { prohibidas });
    const [xy] = Object.entries(PUERTAS_ISLA2.morro).find(([, sala]) => sala === 'gimnasio-aire')!;
    const [x, y] = xy.split(',').map(Number);
    expect(vecinas(enIsla('morro', x, y)).some((v) => sin.has(v))).toBe(true);
  });

  it('en la cima de Tindaya y en el paso de Cofete, el entrenador no se esquiva', () => {
    const casos: [string, string, (k: number) => boolean][] = [
      ['tindaya', 'peregrino-tindaya', (k) => k === enIsla('tindaya', 8, 10)],
      ['cofete', 'pastor-jandia', (k) => m.casillas.get(k)?.zona === 'cofete' && m.casillas.get(k)?.c === 'a'],
    ];
    for (const [z, id, meta] of casos) {
      const p = zona(z).personajes.find((q) => q.id === id)!;
      const sinVer = alcanzables(m, [llegada], { prohibidas: new Set(vision(m, z, p)) });
      expect([...sinVer].some(meta), id).toBe(false);
      expect([...r].some(meta), id).toBe(true);
    }
  });

  it('las rocas grabadas de Tindaya se leen al mirarlas', () => {
    const e = { ...crearExploracion(m), x: zona('tindaya').origen.x + 7, y: zona('tindaya').origen.y + 10, mira: 'n' as const, zona: 'tindaya' };
    const [ev] = interactuar(m, e);
    expect(ev?.tipo).toBe('letrero');
    expect(ev?.tipo === 'letrero' && ev.texto).toContain('pies');
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

  it('sus salvajes existen y van del nivel 10 al 17; en las opcionales, hasta el 19', () => {
    for (const [zona, t] of Object.entries(FUERTEVENTURA.encuentros)) {
      const tope = OPCIONALES.includes(zona) ? 19 : 17;
      for (const e of t) {
        expect(DATOS.especies[e.especie], e.especie).toBeDefined();
        expect(e.nivel[0]).toBeGreaterThanOrEqual(10);
        expect(e.nivel[1], zona).toBeLessThanOrEqual(tope);
      }
    }
  });
});
