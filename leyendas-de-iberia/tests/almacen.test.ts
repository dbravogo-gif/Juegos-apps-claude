import { describe, expect, it } from 'vitest';
import { crearRng } from '../src/core/rng';
import { crearCriatura } from '../src/core/criatura';
import { guardadas, guardar, HUECOS_PAGINA, liberar, mover, PAGINAS } from '../src/core/almacen';
import { anadirCriatura, MAX_EQUIPO, nuevaPartida } from '../src/core/partida';
import { deserializar } from '../src/core/guardado';
import type { Criatura } from '../src/core/modelo';
import { DATOS } from '../src/data';
import { INICIO } from '../src/data/mundo';

const rng = crearRng('almacen');
const cr = (especie = 'topillo', nivel = 5): Criatura => crearCriatura(DATOS, especie, nivel, rng);

describe('almacén', () => {
  it('una partida nueva tiene 10 páginas de 30 huecos vacíos', () => {
    const p = nuevaPartida('A', 1, INICIO);
    expect(p.paginas).toHaveLength(PAGINAS);
    expect(p.paginas.every((pg) => pg.length === HUECOS_PAGINA && pg.every((h) => h === null))).toBe(true);
  });

  it('las capturas con el equipo lleno van al primer hueco libre', () => {
    const p = nuevaPartida('A', 1, INICIO);
    for (let i = 0; i < MAX_EQUIPO; i++) anadirCriatura(p, cr());
    const extra = cr('lobo');
    expect(anadirCriatura(p, extra)).toBe('almacen');
    expect(p.paginas[0][0]).toBe(extra);
  });

  it('mover: del equipo a un hueco, de un hueco al equipo y cambios de sitio', () => {
    const p = nuevaPartida('A', 1, INICIO);
    const [a, b, c] = [cr('topillo'), cr('lobo'), cr('vibora')];
    p.equipo = [a, b];
    p.paginas[0][5] = c;
    expect(mover(p, { equipo: 1 }, { pagina: 0, hueco: 7 })).toBeNull();
    expect(p.equipo).toEqual([a]);
    expect(p.paginas[0][7]).toBe(b);
    expect(mover(p, { pagina: 0, hueco: 5 }, { equipo: 3 })).toBeNull();
    expect(p.equipo).toEqual([a, c]);
    expect(mover(p, { pagina: 0, hueco: 7 }, { equipo: 0 })).toBeNull();
    expect(p.equipo).toEqual([b, c]);
    expect(p.paginas[0][7]).toBe(a);
    expect(mover(p, { pagina: 0, hueco: 7 }, { pagina: 3, hueco: 29 })).toBeNull();
    expect(p.paginas[3][29]).toBe(a);
    expect(guardadas(p)).toEqual([a]);
  });

  it('el equipo no se queda vacío ni sin nadie en pie', () => {
    const p = nuevaPartida('A', 1, INICIO);
    const [a, b] = [cr(), cr()];
    p.equipo = [a];
    expect(mover(p, { equipo: 0 }, { pagina: 0, hueco: 0 })).not.toBeNull();
    expect(p.equipo).toEqual([a]);
    b.vida = 0;
    p.equipo = [a, b];
    expect(mover(p, { equipo: 0 }, { pagina: 0, hueco: 0 })).not.toBeNull();
    expect(liberar(p, { equipo: 0 })).not.toBeNull();
    expect(p.equipo).toHaveLength(2);
  });

  it('el equipo no pasa de seis', () => {
    const p = nuevaPartida('A', 1, INICIO);
    p.equipo = Array.from({ length: MAX_EQUIPO }, () => cr());
    p.paginas[0][0] = cr('lobo');
    expect(mover(p, { pagina: 0, hueco: 0 }, { equipo: MAX_EQUIPO })).not.toBeNull();
  });

  it('liberar deja el hueco vacío y devuelve su objeto a la mochila', () => {
    const p = nuevaPartida('A', 1, INICIO);
    p.equipo = [cr()];
    const c = cr('lobo');
    c.objeto = 'higo';
    p.paginas[2][3] = c;
    expect(liberar(p, { pagina: 2, hueco: 3 })).toBeNull();
    expect(p.paginas[2][3]).toBeNull();
    expect(p.objetos.higo).toBe(1);
  });

  it('las páginas llenas abren una nueva', () => {
    const p = nuevaPartida('A', 1, INICIO);
    for (const pg of p.paginas) pg.fill(cr());
    expect(guardar(p, cr('lobo'))).toEqual({ pagina: PAGINAS, hueco: 0 });
  });

  it('una partida de la versión 2 pasa su lista de criaturas a páginas', () => {
    const p = nuevaPartida('A', 1, INICIO) as unknown as Record<string, unknown>;
    const lista = Array.from({ length: 33 }, () => cr());
    delete p.paginas;
    p.almacen = lista;
    p.version = 2;
    const leida = deserializar(JSON.stringify(p))!;
    expect(leida).not.toBeNull();
    expect(leida.paginas[0]).toHaveLength(HUECOS_PAGINA);
    expect(guardadas(leida)).toHaveLength(33);
    expect(leida.paginas[1][2]?.uid).toBe(lista[32].uid);
    expect('almacen' in leida).toBe(false);
  });
});

describe('pesca', () => {
  it('el barbo sale pescando en la Vega y el galápago en el Tajo', async () => {
    const { ZONAS, CASILLAS } = await import('../src/data/mundo');
    const { dondeSale, esPescable } = await import('../src/core/mundo');
    expect(dondeSale(ZONAS, 'barbo')).toEqual([expect.objectContaining({ zona: 'vega', pesca: true })]);
    expect(dondeSale(ZONAS, 'galapago').some((d) => d.zona === 'camino_toledo' && d.pesca)).toBe(true);
    // Las acequias de la Vega y el Tajo son agua de pesca.
    expect(esPescable(ZONAS.vega, 3, 20, CASILLAS)).toBe(true);
    expect(esPescable(ZONAS.vega, 8, 38, CASILLAS)).toBe(true);
    for (const z of Object.values(ZONAS)) {
      for (const e of z.encuentrosPesca?.especies ?? []) expect(DATOS.especies[e.especie], e.especie).toBeDefined();
      if (z.encuentrosPesca) expect(z.mapa.some((f) => [...f].some((ch) => CASILLAS[ch]?.pesca)), z.id).toBe(true);
    }
  });
});
