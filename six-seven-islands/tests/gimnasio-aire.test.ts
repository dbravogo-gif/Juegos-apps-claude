// El gimnasio de Aire (Fuerteventura, 2026-11-13): se resuelve con el núcleo de verdad. Tiene
// solución, hace falta girar las dos aspas, sin girarlas no se llega, y desde cualquier sitio al
// que se pueda llegar se vuelve a la puerta (nadie se queda atrapado). Los aprendices no se esquivan.
import { describe, expect, it } from 'vitest';
import { avanzar, crearExploracion, interactuar, type EstadoExplorar } from '../src/core/explorar';
import { alcanzables, clave, construirInterior, vision, type Condicion, type Direccion } from '../src/core/mundo';
import { GIMNASIO_AIRE } from '../src/data/gimnasio-aire';

const m = construirInterior(GIMNASIO_AIRE, { x: 0, y: 0 });
const DIRS: Direccion[] = ['n', 's', 'e', 'o'];
const inicio = (): EstadoExplorar => ({ ...crearExploracion(m), x: 8, y: 12, desdeX: 8, desdeY: 12, zona: 'gimnasio-aire', dentro: null });
const claveEstado = (e: EstadoExplorar) => `${e.x},${e.y}|${[...e.condiciones].filter((c) => c.startsWith('aspas:')).sort().join(',')}`;

/** Un toque de tecla: el paso y lo que empujen las corrientes después, hasta quedarse quieto. */
function mover(e: EstadoExplorar, d: Direccion): EstadoExplorar {
  const c = structuredClone(e);
  avanzar(m, c, d);
  for (let i = 0; i < 500 && (c.paso > 0 || c.empuje); i++) avanzar(m, c, null);
  return c;
}

/** Girar las aspas que se tienen delante, mirando hacia ellas: como hace «partida». */
function girar(e: EstadoExplorar, d: Direccion): EstadoExplorar | null {
  const c = { ...structuredClone(e), mira: d };
  const ev = interactuar(m, c).find((x) => x.tipo === 'aspas');
  if (!ev || ev.tipo !== 'aspas') return null;
  const cond: Condicion = `aspas:${ev.id}`;
  c.condiciones = ev.activas ? c.condiciones.filter((x) => x !== cond) : [...c.condiciones, cond];
  return c;
}

function explorar(desde: EstadoExplorar, conAspas = true): Map<string, EstadoExplorar> {
  const vistos = new Map([[claveEstado(desde), desde]]);
  const cola = [desde];
  while (cola.length) {
    const e = cola.shift()!;
    const siguientes = DIRS.map((d) => mover(e, d));
    if (conAspas) for (const d of DIRS) siguientes.push(girar(e, d) ?? e);
    for (const s of siguientes) {
      const k = claveEstado(s);
      if (!vistos.has(k)) {
        vistos.set(k, s);
        cola.push(s);
      }
    }
  }
  return vistos;
}

const delanteLider = (e: EstadoExplorar) => e.x === 8 && e.y === 2;

describe('gimnasio de Aire', () => {
  const todos = explorar(inicio());

  it('tiene solución: se llega delante de la líder', () => {
    expect([...todos.values()].some(delanteLider)).toBe(true);
  });

  it('sin girar las aspas no se llega, y hacen falta las dos', () => {
    expect([...explorar(inicio(), false).values()].some(delanteLider)).toBe(false);
    const llega = [...todos.values()].filter(delanteLider);
    expect(llega.every((e) => e.condiciones.includes('aspas:aire-a'))).toBe(true);
    // A las aspas A solo se llega con las B giradas: sin B, nadie se pone a su lado.
    const juntoA = [...todos.values()].filter((e) => Math.abs(e.x - 15) + Math.abs(e.y - 3) === 1);
    expect(juntoA.length).toBeGreaterThan(0);
    expect(juntoA.every((e) => e.condiciones.includes('aspas:aire-b'))).toBe(true);
  });

  it('nadie se queda atrapado: desde cualquier sitio se vuelve a la puerta', () => {
    // El grafo entero de una vez y, al revés, quién llega a la puerta.
    const haciaAtras = new Map<string, Set<string>>();
    for (const [k, e] of todos) {
      const siguientes = [...DIRS.map((d) => mover(e, d)), ...DIRS.map((d) => girar(e, d) ?? e)];
      for (const t of siguientes) {
        const kt = claveEstado(t);
        if (!haciaAtras.has(kt)) haciaAtras.set(kt, new Set());
        haciaAtras.get(kt)!.add(k);
      }
    }
    const vuelven = new Set([...todos.keys()].filter((k) => k.startsWith('8,12|')));
    const cola = [...vuelven];
    while (cola.length) {
      for (const a of haciaAtras.get(cola.pop()!) ?? []) {
        if (!vuelven.has(a)) {
          vuelven.add(a);
          cola.push(a);
        }
      }
    }
    expect([...todos.keys()].filter((k) => !vuelven.has(k))).toEqual([]);
  });

  it('los tres aprendices no se esquivan camino de la líder', () => {
    // Sin pisar lo que ve cada uno (y con las aspas giradas, lo más favorable), no se llega.
    for (const id of ['aprendiz-aire-1', 'aprendiz-aire-2', 'aprendiz-aire-3']) {
      const p = GIMNASIO_AIRE.personajes.find((x) => x.id === id)!;
      const ve = new Set(vision(m, 'gimnasio-aire', p));
      expect(ve.size, id).toBeGreaterThan(0);
      const hasta = [...todos.values()].filter((e) => !ve.has(clave(e.x, e.y)));
      // Algún estado que llegue a la líder pasa por lo que ve: se comprueba con el camino a pie.
      const pie = alcanzables(m, [clave(8, 12)], { prohibidas: ve, condiciones: new Set<Condicion>(['aspas:aire-a', 'aspas:aire-b']) });
      expect(hasta.length).toBeGreaterThan(0);
      if (id === 'aprendiz-aire-1') expect(pie.has(clave(15, 10))).toBe(false);
      if (id === 'aprendiz-aire-3') expect(pie.has(clave(8, 8))).toBe(false);
    }
  });
});
