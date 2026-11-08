import { describe, expect, it } from 'vitest';
import {
  PASOS_POR_CASILLA,
  avanzar,
  crearExploracion,
  cumplir,
  interactuar,
  posicionVisual,
  type EstadoExplorar,
  type EventoExplorar,
} from '../src/core/explorar';
import {
  TODAS_LAS_CONDICIONES,
  clave,
  construirMundo,
  deClave,
  enIsla,
  transitable,
  type Condicion,
  type Direccion,
} from '../src/core/mundo';
import { ISLA_1 } from '../src/data/isla1';

const m = construirMundo(ISLA_1);

/** Mantiene pulsada una dirección hasta llegar a la casilla siguiente (o un paso, si choca). */
function pulsar(e: EstadoExplorar, dir: Direccion): EventoExplorar[] {
  const ev = [...avanzar(m, e, dir)];
  while (e.paso > 0) ev.push(...avanzar(m, e, dir));
  return ev;
}

/** Camino más corto entre dos casillas, como lista de direcciones. */
function camino(desde: number, hasta: (k: number) => boolean, condiciones: ReadonlySet<Condicion>): Direccion[] {
  const previo = new Map<number, [number, Direccion]>();
  const cola = [desde];
  const vistos = new Set([desde]);
  const dirs: [Direccion, number, number][] = [
    ['n', 0, -1],
    ['s', 0, 1],
    ['e', 1, 0],
    ['o', -1, 0],
  ];
  for (let i = 0; i < cola.length; i++) {
    const k = cola[i];
    if (hasta(k)) {
      const res: Direccion[] = [];
      let c = k;
      while (c !== desde) {
        const [p, d] = previo.get(c)!;
        res.unshift(d);
        c = p;
      }
      return res;
    }
    const [x, y] = deClave(k);
    for (const [d, dx, dy] of dirs) {
      const v = clave(x + dx, y + dy);
      if (!vistos.has(v) && transitable(m, x + dx, y + dy, { condiciones })) {
        vistos.add(v);
        previo.set(v, [k, d]);
        cola.push(v);
      }
    }
  }
  throw new Error('No hay camino');
}

describe('exploración por casillas', () => {
  it('empieza en el inicio de la isla, parado y mirando al sur', () => {
    const e = crearExploracion(m);
    expect(clave(e.x, e.y)).toBe(enIsla(m, ISLA_1.inicio.zona, ISLA_1.inicio.x, ISLA_1.inicio.y));
    expect(e.paso).toBe(0);
    expect(e.zona).toBe('inicial');
  });

  it('cruzar una casilla dura PASOS_POR_CASILLA pasos fijos y se dibuja interpolado', () => {
    const e = crearExploracion(m);
    const x0 = e.x;
    avanzar(m, e, 'e');
    expect(e.x).toBe(x0 + 1);
    expect(posicionVisual(e, 0).x).toBeCloseTo(x0 + 1 / PASOS_POR_CASILLA);
    for (let i = 1; i < PASOS_POR_CASILLA; i++) avanzar(m, e, null);
    expect(e.paso).toBe(0);
    expect(posicionVisual(e, 0).x).toBe(x0 + 1);
  });

  it('no atraviesa paredes ni casas: choca y se queda, aunque gire', () => {
    const e = crearExploracion(m);
    // Al norte del inicio está la puerta de su casa y, más allá, la casa: entra en la puerta y choca.
    pulsar(e, 'n');
    const y = e.y;
    pulsar(e, 'n');
    expect(e.y).toBe(y);
    expect(e.mira).toBe('n');
  });

  it('el paso cerrado da su aviso una vez mientras se empuja, y se abre con su condición', () => {
    const e = crearExploracion(m);
    // Ir hasta justo debajo del paso cerrado de la zona inicial (3,2) y empujar hacia el norte.
    const objetivo = enIsla(m, 'inicial', 3, 2);
    for (const d of camino(clave(e.x, e.y), (k) => k === objetivo, new Set())) pulsar(e, d);
    const avisos = [...avanzar(m, e, 'n'), ...avanzar(m, e, 'n'), ...avanzar(m, e, 'n')].filter((v) => v.tipo === 'aviso');
    expect(avisos).toHaveLength(1);
    expect(clave(e.x, e.y)).toBe(objetivo);
    cumplir(e, 'inicial-elegida');
    pulsar(e, 'n');
    expect(clave(e.x, e.y)).not.toBe(objetivo);
  });

  it('entrar por una puerta lo avisa', () => {
    const e = crearExploracion(m);
    const ev = pulsar(e, 'n');
    expect(ev.some((v) => v.tipo === 'puerta')).toBe(true);
  });

  it('habla con el personaje que tiene delante', () => {
    const e = crearExploracion(m);
    const vecino = enIsla(m, 'inicial', 5, 1);
    const [vx, vy] = deClave(vecino);
    // Ponerse al sur del vecino y mirar al norte.
    for (const d of camino(clave(e.x, e.y), (k) => k === clave(vx, vy + 1), new Set())) pulsar(e, d);
    e.mira = 'n';
    expect(interactuar(m, e)).toEqual([{ tipo: 'hablar', zona: 'inicial', personaje: 'vecino-salida' }]);
  });
});

describe('un bot recorre la isla 1 con la lógica del juego', () => {
  const barco = new Set([...m.casillas].filter(([, v]) => v.c === 'B').map(([k]) => k));
  const juntoAlBarco = (k: number) => {
    const [x, y] = deClave(k);
    return [clave(x + 1, y), clave(x - 1, y), clave(x, y + 1), clave(x, y - 1)].some((v) => barco.has(v));
  };

  it('con todo hecho, cruza de la casa al barco pasando por las cinco zonas en orden', () => {
    const e = crearExploracion(m, [...TODAS_LAS_CONDICIONES]);
    const ruta = camino(clave(e.x, e.y), juntoAlBarco, TODAS_LAS_CONDICIONES);
    const zonas: string[] = [e.zona];
    let pasos = 0;
    for (const d of ruta) {
      const antes = clave(e.x, e.y);
      for (const ev of pulsar(e, d)) if (ev.tipo === 'zona') zonas.push(ev.zona);
      expect(clave(e.x, e.y), `se atascó en ${deClave(antes)}`).not.toBe(antes);
      pasos++;
    }
    expect(juntoAlBarco(clave(e.x, e.y))).toBe(true);
    expect(zonas).toEqual(['inicial', 'combates', 'pueblo', 'bosque', 'capital']);
    expect(pasos).toBeGreaterThan(150); // la isla tiene recorrido
  });

  it('va a por la poción del claro del bosque y la recoge una sola vez', () => {
    const e = crearExploracion(m, [...TODAS_LAS_CONDICIONES]);
    const [k] = [...m.objetos.keys()];
    const recogidas: string[] = [];
    for (const d of camino(clave(e.x, e.y), (v) => v === k, TODAS_LAS_CONDICIONES)) {
      for (const ev of pulsar(e, d)) if (ev.tipo === 'objeto') recogidas.push(ev.id);
    }
    // Salir y volver a pisarla no la recoge otra vez.
    const opuesta: Record<Direccion, Direccion> = { n: 's', s: 'n', e: 'o', o: 'e' };
    const llegada = e.mira;
    pulsar(e, opuesta[llegada]);
    for (const ev of pulsar(e, llegada)) if (ev.tipo === 'objeto') recogidas.push(ev.id);
    expect(clave(e.x, e.y)).toBe(k);
    expect(recogidas).toEqual(['pocion-claro']);
  });

  it('la misma entrada da el mismo recorrido (determinista)', () => {
    const correr = () => {
      const e = crearExploracion(m, [...TODAS_LAS_CONDICIONES]);
      for (const d of camino(clave(e.x, e.y), juntoAlBarco, TODAS_LAS_CONDICIONES)) pulsar(e, d);
      return JSON.stringify(e);
    };
    expect(correr()).toBe(correr());
  });
});
