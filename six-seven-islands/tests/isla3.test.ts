// Gran Canaria (2026-11-22; ISLA-3.md), fase 1: Las Palmas y La Isleta, y el gimnasio Eléctrico.
// Desde el muelle se llega a todo; las zonas se tocan; los entrenadores ven por donde se pasa; el
// gimnasio se resuelve con sus dos palancas y el tercer aprendiz no se esquiva.
import { describe, expect, it } from 'vitest';
import { alcanzables, clave, construirInterior, construirMundo, deClave, transitable, vision, type Condicion } from '../src/core/mundo';
import { ISLAS, FUERTEVENTURA, GRAN_CANARIA } from '../src/data/islas';
import { ISLA_3, PUERTAS_ISLA3 } from '../src/data/isla3';
import { GIMNASIO_ELECTRICO } from '../src/data/gimnasio-electrico';
import { GUION_ISLA2 } from '../src/data/guion-isla2';
import { DATOS_COMBATE_PRUEBA as DATOS } from '../src/data/combate-prueba';
import { quienEs } from '../src/data/entrenadores-isla1';

const m = construirMundo(ISLA_3);
const zona = (id: string) => m.zonas.get(id)!;
const enIsla = (z: string, x: number, y: number) => clave(zona(z).origen.x + x, zona(z).origen.y + y);
const llegada = enIsla(GRAN_CANARIA.llegada.zona, GRAN_CANARIA.llegada.x, GRAN_CANARIA.llegada.y);
const r = alcanzables(m, [llegada]);
const vecinas = (k: number) => {
  const [x, y] = deClave(k);
  return [clave(x + 1, y), clave(x - 1, y), clave(x, y + 1), clave(x, y - 1)];
};

describe('Gran Canaria (isla 3), fase 1', () => {
  it('está registrada con su número, se llega en barco desde Morro Jable y la llegada se pisa', () => {
    expect(ISLAS[3]).toBe(GRAN_CANARIA);
    expect(transitable(m, zona('palmas').origen.x + GRAN_CANARIA.llegada.x, zona('palmas').origen.y + GRAN_CANARIA.llegada.y)).toBe(true);
    const barco = GUION_ISLA2['marinero-morro']!;
    expect(barco[0]!.sin).toBe('gimnasio2-vencido');
    expect(barco.some((e) => e.dialogo.efecto?.viaje === 3 && e.dialogo.efecto.fin)).toBe(true);
    expect(FUERTEVENTURA.def.zonas.find((z) => z.id === 'morro')!.personajes.some((p) => p.id === 'marinero-morro')).toBe(true);
  });

  it('desde el muelle se llega a La Isleta, a cada puerta, a cada personaje y a cada objeto', () => {
    expect([...r].some((k) => m.casillas.get(k)?.zona === 'isleta')).toBe(true);
    for (const [z, puertas] of Object.entries(PUERTAS_ISLA3)) {
      for (const xy of Object.keys(puertas)) {
        const [x, y] = xy.split(',').map(Number);
        expect(vecinas(enIsla(z, x, y)).some((v) => r.has(v)), `${z} ${xy}`).toBe(true);
      }
    }
    for (const z of ISLA_3.zonas) {
      for (const p of z.personajes) expect(vecinas(enIsla(z.id, p.x, p.y)).some((v) => r.has(v)), p.id).toBe(true);
      for (const o of z.objetos ?? []) expect(r.has(enIsla(z.id, o.x, o.y)), o.id).toBe(true);
    }
  });

  it('cada entrenador ve casillas por las que se pasa, dice quién es y tiene equipo que existe', () => {
    for (const p of ISLA_3.zonas.flatMap((z) => z.personajes.filter((x) => x.entrenador).map((x) => ({ ...x, zona: z.id })))) {
      expect(vision(m, p.zona, p).some((k) => r.has(k)), p.id).toBe(true);
    }
    for (const [id, def] of Object.entries(GRAN_CANARIA.entrenadores)) {
      expect(quienEs(id), id).toBeDefined();
      expect(def.equipo.length, id).toBeGreaterThan(0);
      for (const e of def.equipo) {
        const especie = DATOS.especies[e.especie];
        expect(especie, e.especie).toBeDefined();
        // Ninguna, evolucionada antes de tiempo.
        const previa = Object.values(DATOS.especies).find((s) => s.evoluciona?.some((ev) => ev.a === e.especie));
        const a = previa?.evoluciona?.find((ev) => ev.a === e.especie)?.nivel ?? 0;
        expect(e.nivel, `${id}: ${e.especie}`).toBeGreaterThanOrEqual(a);
      }
    }
  });

  it('sus salvajes existen y van del nivel 18 al 20 (ISLA-3.md: la isla, del 18 al 25)', () => {
    for (const [z, t] of Object.entries(GRAN_CANARIA.encuentros)) {
      expect(zona(z), z).toBeDefined();
      for (const e of t) {
        expect(DATOS.especies[e.especie], e.especie).toBeDefined();
        expect(e.nivel[0]).toBeGreaterThanOrEqual(18);
        expect(e.nivel[1], z).toBeLessThanOrEqual(20);
      }
    }
  });

  it('sus interiores tienen salida y gente, y la enfermera y el tendero existen', () => {
    for (const def of GRAN_CANARIA.interiores) {
      const s = construirInterior(def, { x: 0, y: 0 });
      // Los pisos de arriba no tienen puerta: se baja por el hueco de la escalera.
      const salida = def.id.endsWith('-arriba') ? 'z' : 'd';
      expect([...s.casillas.values()].filter((c) => c.c === salida), def.id).toHaveLength(1);
      if (!def.id.endsWith('-arriba')) expect(def.personajes.length, def.id).toBeGreaterThan(0);
    }
    const gente = new Set(GRAN_CANARIA.interiores.flatMap((d) => d.personajes.map((p) => p.id)));
    for (const id of [...Object.keys(GRAN_CANARIA.curanderos), ...GRAN_CANARIA.tenderos]) expect(gente.has(id), id).toBe(true);
    expect(GRAN_CANARIA.interiores.some((d) => d.id === 'gimnasio-electrico')).toBe(true);
  });
});

describe('gimnasio Eléctrico de Las Palmas', () => {
  const g = construirInterior(GIMNASIO_ELECTRICO, { x: 0, y: 0 });
  const entrada = clave(GIMNASIO_ELECTRICO.entrada.x, GIMNASIO_ELECTRICO.entrada.y);
  const desde = (c: Condicion[], prohibidas?: Set<number>) => alcanzables(g, [entrada], { condiciones: new Set(c), prohibidas });
  const alLado = (x: number, y: number) => [clave(x, y + 1), clave(x, y - 1), clave(x + 1, y), clave(x - 1, y)];
  const palanca = (id: string) => Object.entries(GIMNASIO_ELECTRICO.palancas!).find(([, p]) => p === id)![0].split(',').map(Number) as [number, number];
  const arriba = (c: Condicion[]) => [...desde(c)].some((k) => deClave(k)[1] <= 3);

  it('la primera palanca se alcanza desde la entrada; con ella, la segunda; con las dos, la sala del líder', () => {
    const [x1, y1] = palanca('electrico-1');
    const [x2, y2] = palanca('electrico-2');
    expect(alLado(x1, y1).some((k) => desde([]).has(k))).toBe(true);
    expect(alLado(x2, y2).some((k) => desde([]).has(k))).toBe(false);
    expect(alLado(x2, y2).some((k) => desde(['palanca:electrico-1']).has(k))).toBe(true);
    expect(arriba(['palanca:electrico-1'])).toBe(false);
    expect(arriba(['palanca:electrico-2'])).toBe(false);
    expect(arriba(['palanca:electrico-1', 'palanca:electrico-2'])).toBe(true);
  });

  it('el tercer aprendiz no se esquiva camino del líder, y el líder no está', () => {
    const p = GIMNASIO_ELECTRICO.personajes.find((x) => x.id === 'aprendiz-electrico-3')!;
    const ve = new Set(vision(g, GIMNASIO_ELECTRICO.id, p));
    const todas = ['palanca:electrico-1', 'palanca:electrico-2'] as Condicion[];
    expect([...desde(todas, ve)].some((k) => deClave(k)[1] <= 3)).toBe(false);
    expect(GIMNASIO_ELECTRICO.personajes.some((x) => x.id.startsWith('lider'))).toBe(false);
    expect(GRAN_CANARIA.entrenadores['aprendiz-electrico-3']!.alVencer?.join(' ')).toMatch(/no está/);
  });

  it('dentro hay campo eléctrico', () => {
    expect(GRAN_CANARIA.campos?.['gimnasio-electrico']).toEqual({ terreno: 'electrico' });
  });
});
