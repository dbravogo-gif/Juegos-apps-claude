import { describe, expect, it } from 'vitest';
import {
  TODAS_LAS_CONDICIONES,
  alcanzables,
  clave,
  conexiones,
  construirMundo,
  deClave,
  edificios,
  enIsla,
  vision,
  type Condicion,
  type DefIsla,
  type Mundo,
} from '../src/core/mundo';
import { ISLA_1 } from '../src/data/isla1';

const m = construirMundo(ISLA_1);
const orden = ISLA_1.zonas.map((z) => z.id);
const inicio = enIsla(m, ISLA_1.inicio.zona, ISLA_1.inicio.x, ISLA_1.inicio.y);
const zonaDe = (k: number) => m.casillas.get(k)?.zona;
const conCondiciones = (...c: Condicion[]) => new Set<Condicion>(c);

/** Las casillas de la zona que tocan la zona anterior y la siguiente del recorrido. */
function entradaYSalida(zona: string): [number[], number[]] {
  const i = orden.indexOf(zona);
  return [conexiones(m, zona, orden[i - 1]), conexiones(m, zona, orden[i + 1])];
}

describe('isla 1: mapa bien escrito', () => {
  it('se monta sin errores: filas iguales, letras de la leyenda y zonas que no se pisan', () => {
    expect(m.casillas.size).toBeGreaterThan(0);
    expect(orden).toEqual(['inicial', 'combates', 'pueblo', 'bosque', 'capital']);
  });

  it('detecta un mapa mal escrito', () => {
    const roto: DefIsla = {
      ...ISLA_1,
      zonas: [{ ...ISLA_1.zonas[0], mapa: [...ISLA_1.zonas[0].mapa.slice(0, -1), '~~~'] }],
    };
    expect(() => construirMundo(roto)).toThrow(/mide/);
  });

  it('tiene los tamaños de ISLA-1.md', () => {
    const tam = Object.fromEntries(ISLA_1.zonas.map((z) => [z.id, [z.mapa[0].length, z.mapa.length]]));
    expect(tam).toEqual({ inicial: [24, 18], combates: [15, 44], pueblo: [28, 22], bosque: [48, 26], capital: [34, 28] });
  });

  it('cada zona solo toca la anterior y la siguiente del recorrido: no hay atajos', () => {
    for (let i = 0; i < orden.length; i++) {
      for (let j = i + 1; j < orden.length; j++) {
        const tocan = conexiones(m, orden[i], orden[j]).length > 0;
        expect(tocan, `${orden[i]} y ${orden[j]}`).toBe(j === i + 1);
      }
    }
  });
});

describe('isla 1: lo que pide el autor en cada zona', () => {
  const cuenta = (zona: string) => {
    const r: Record<string, number> = {};
    for (const e of edificios(m, zona)) r[e.tipo] = (r[e.tipo] ?? 0) + 1;
    return r;
  };

  it('zona inicial: dos casas iguales, un árbol (drago) y un museo', () => {
    expect(cuenta('inicial')).toEqual({ C: 2, M: 1 });
    const casas = edificios(m, 'inicial').filter((e) => e.tipo === 'C');
    expect(casas[0].ancho).toBe(casas[1].ancho);
    expect(casas[0].fondo).toBe(casas[1].fondo);
    const drago = [...m.casillas.values()].filter((c) => c.zona === 'inicial' && c.c === 'Y');
    expect(drago.length).toBeGreaterThan(0);
  });

  it('zona de combates: 2 entrenadores y 3 zonas de encuentros', () => {
    const z = m.zonas.get('combates')!;
    expect(z.personajes.filter((p) => p.entrenador)).toHaveLength(2);
    expect(manchasDeEncuentros('combates')).toBe(3);
  });

  it('zona de combates, de sur a norte: arena negra, barrera con su entrenador, malpaís en subida y hierba en llano', () => {
    const z = m.zonas.get('combates')!;
    const filas = (letra: string) => z.mapa.flatMap((f, y) => (f.includes(letra) ? [y] : []));
    const barrera = filas('=');
    expect(barrera).toHaveLength(1);
    const yb = barrera[0];
    const obligatorio = z.personajes.find((p) => p.entrenador?.obligatorio)!;
    expect(Math.min(...filas('_'))).toBeGreaterThanOrEqual(yb); // la arena negra, al sur de la barrera
    expect(Math.max(...filas(':'))).toBeLessThan(yb); // la tierra, al norte
    expect(obligatorio.y).toBe(yb - 1); // el entrenador, justo detrás de la barrera
    expect(Math.max(...filas(';'))).toBeLessThan(obligatorio.y); // después, el malpaís
    expect(Math.max(...filas('"'))).toBeLessThan(Math.min(...filas(';'))); // y por último, la hierba
    const h = (y: number) => Number(z.alturas![y][1]);
    expect(new Set(filas(';').map(h)).size).toBeGreaterThan(1); // el malpaís, en subida
    expect(new Set(filas('"').map(h)).size).toBe(1); // la hierba, en llano
    expect(h(z.mapa.length - 2)).toBe(0); // la playa, a nivel del mar
  });

  it('bosque: 4 entrenadores y un objeto en el claro de la bifurcación', () => {
    const z = m.zonas.get('bosque')!;
    expect(z.personajes.filter((p) => p.entrenador)).toHaveLength(4);
    expect(z.objetos?.map((o) => o.objeto)).toEqual(['pocion']);
  });

  it('pueblo: refugio, dos casas, tienda y el anciano', () => {
    expect(cuenta('pueblo')).toEqual({ R: 1, C: 2, S: 1 });
    expect(m.zonas.get('pueblo')!.personajes.map((p) => p.id)).toContain('anciano');
  });

  it('capital: refugio, gimnasio (el edificio más grande de la isla), varias casas, faro, muelle y barco', () => {
    const c = cuenta('capital');
    expect(c.R).toBe(1);
    expect(c.G).toBe(1);
    expect(c.F).toBe(1);
    expect(c.C).toBeGreaterThanOrEqual(3);
    const todos = orden.flatMap((z) => edificios(m, z));
    const mayor = todos.reduce((a, b) => (b.casillas.length > a.casillas.length ? b : a));
    expect(mayor.tipo).toBe('G');
    const letras = [...m.casillas.values()].filter((v) => v.zona === 'capital').map((v) => v.c);
    expect(letras).toContain('P');
    expect(letras).toContain('B');
  });
});

/** Cuántas manchas separadas de terreno de encuentros hay en una zona. */
function manchasDeEncuentros(zona: string): number {
  const vistas = new Set<number>();
  let n = 0;
  for (const [k, cm] of m.casillas) {
    if (cm.zona !== zona || !(cm.c === '"' || cm.c === ';') || vistas.has(k)) continue;
    n++;
    const cola = [k];
    vistas.add(k);
    while (cola.length) {
      const [x, y] = deClave(cola.pop()!);
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const kb = clave(x + dx, y + dy);
        const v = m.casillas.get(kb);
        if (v && v.zona === zona && (v.c === '"' || v.c === ';') && !vistas.has(kb)) {
          vistas.add(kb);
          cola.push(kb);
        }
      }
    }
  }
  return n;
}

describe('isla 1: recorrido y pasos cerrados', () => {
  const llega = (condiciones: ReadonlySet<Condicion>) => alcanzables(m, [inicio], { condiciones });
  const zonasAlcanzadas = (c: ReadonlySet<Condicion>) => new Set([...llega(c)].map(zonaDe));
  const junto = (k: number) => {
    const [x, y] = deClave(k);
    return [clave(x + 1, y), clave(x - 1, y), clave(x, y + 1), clave(x, y - 1)];
  };
  const casillasDe = (letra: string) => [...m.casillas].filter(([, v]) => v.c === letra).map(([k]) => k);

  it('el jugador empieza en suelo de la zona inicial', () => {
    expect(zonaDe(inicio)).toBe('inicial');
    expect(llega(new Set()).has(inicio)).toBe(true);
  });

  it('sin elegir la inicial no se sale de la zona inicial', () => {
    expect(zonasAlcanzadas(new Set())).toEqual(new Set(['inicial']));
  });

  it('sin hablar con el anciano no se entra en el bosque', () => {
    expect(zonasAlcanzadas(conCondiciones('inicial-elegida'))).toEqual(new Set(['inicial', 'combates', 'pueblo']));
  });

  it('sin vencer al gimnasio se llega a la capital y a su puerta, pero no al barco', () => {
    const c = conCondiciones('inicial-elegida', 'anciano');
    const r = llega(c);
    expect(zonasAlcanzadas(c)).toEqual(new Set(orden));
    const gimnasio = edificios(m, 'capital').find((e) => e.tipo === 'G')!;
    expect(gimnasio.puertas.some((p) => r.has(p))).toBe(true);
    expect(casillasDe('B').flatMap(junto).some((k) => r.has(k))).toBe(false);
  });

  it('con todo hecho, se llega junto al barco', () => {
    const r = llega(TODAS_LAS_CONDICIONES);
    expect(casillasDe('B').flatMap(junto).some((k) => r.has(k))).toBe(true);
  });

  it('todas las puertas tienen su edificio y se alcanzan', () => {
    const r = llega(TODAS_LAS_CONDICIONES);
    const conEdificio = new Set(orden.flatMap((z) => edificios(m, z).flatMap((e) => e.puertas)));
    for (const p of casillasDe('d')) {
      expect(conEdificio.has(p), `puerta ${deClave(p)}`).toBe(true);
      expect(r.has(p), `puerta ${deClave(p)}`).toBe(true);
    }
    for (const z of orden) for (const e of edificios(m, z)) if (e.tipo !== 'F') expect(e.puertas.length, `${e.tipo} de ${z}`).toBeGreaterThan(0);
  });

  it('todas las puertas dan al sur, hacia la cámara (las fachadas se dibujan mirando al sur)', () => {
    for (const z of orden) {
      for (const e of edificios(m, z)) {
        const fondo = Math.max(...e.casillas.map((k) => deClave(k)[1]));
        for (const p of e.puertas) expect(deClave(p)[1], `${e.tipo} de ${z}`).toBe(fondo + 1);
      }
    }
  });

  it('todos los objetos se alcanzan, y el del bosque no hace falta para cruzarlo', () => {
    const r = llega(TODAS_LAS_CONDICIONES);
    for (const [k, { objeto }] of m.objetos) expect(r.has(k), objeto.id).toBe(true);
    const [entrada, salida] = [conexiones(m, 'bosque', 'pueblo'), conexiones(m, 'bosque', 'capital')];
    const prohibidas = new Set([...m.objetos.keys()]);
    const sin = alcanzables(m, entrada, { condiciones: TODAS_LAS_CONDICIONES, prohibidas });
    expect(salida.some((k) => sin.has(k))).toBe(true);
  });

  it('las laderas son suaves: entre dos casillas pisables vecinas nunca hay más de un escalón', () => {
    const pisable = (c: string) => c !== '#' && c !== '~' && c !== 'T' && c !== 'b' && c !== '=' && c !== 'Y' && !'CMRSGFB'.includes(c);
    for (const [k, a] of m.casillas) {
      if (!pisable(a.c)) continue;
      const [x, y] = deClave(k);
      for (const v of [clave(x + 1, y), clave(x, y + 1)]) {
        const b = m.casillas.get(v);
        if (b && pisable(b.c)) expect(Math.abs(a.h - b.h), `${deClave(k)} → ${deClave(v)}`).toBeLessThanOrEqual(1);
      }
    }
  });

  it('con todos los personajes se puede hablar: tienen al lado una casilla alcanzable', () => {
    const r = llega(TODAS_LAS_CONDICIONES);
    for (const [k, { personaje }] of m.ocupadas) {
      expect(junto(k).some((v) => r.has(v)), personaje.id).toBe(true);
    }
  });
});

describe('isla 1: reglas de Leyendas de Iberia para todo el juego', () => {
  const zonasConHierba = ISLA_1.zonas.filter((z) => z.hierbaObligatoria).map((z) => z.id);

  it('hay zonas con hierba obligatoria (la de combates y el bosque)', () => {
    expect(zonasConHierba).toEqual(['combates', 'bosque']);
  });

  it('combates: el malpaís y la hierba son obligatorios, cada uno por separado', () => {
    const [entrada, salida] = entradaYSalida('combates');
    for (const letra of [';', '"']) {
      const r = alcanzables(m, entrada, { condiciones: TODAS_LAS_CONDICIONES, evitar: new Set([letra]) });
      expect(salida.some((k) => r.has(k)), letra).toBe(false);
    }
  });

  for (const zona of ['combates', 'bosque']) {
    it(`${zona}: se cruza, pero no sin pisar terreno de encuentros`, () => {
      const [entrada, salida] = entradaYSalida(zona);
      const op = { condiciones: TODAS_LAS_CONDICIONES };
      expect(salida.some((k) => alcanzables(m, entrada, op).has(k))).toBe(true);
      expect(salida.some((k) => alcanzables(m, entrada, { ...op, sinEncuentros: true }).has(k))).toBe(false);
    });
  }

  const obligatorios = ISLA_1.zonas.flatMap((z) =>
    z.personajes.filter((p) => p.entrenador?.obligatorio).map((p) => ({ zona: z.id, p })),
  );

  it('hay entrenadores obligatorios en la zona de combates y a la salida del bosque', () => {
    expect(obligatorios.map((o) => o.zona)).toEqual(['combates', 'bosque']);
  });

  for (const { zona, p } of obligatorios) {
    it(`${zona}: a ${p.id} no se le puede esquivar`, () => {
      const [entrada, salida] = entradaYSalida(zona);
      const prohibidas = new Set([enIsla(m, zona, p.x, p.y), ...vision(m, zona, p)]);
      const r = alcanzables(m, entrada, { condiciones: TODAS_LAS_CONDICIONES, prohibidas });
      expect(salida.some((k) => r.has(k))).toBe(false);
    });
  }

  it('los entrenadores opcionales sí se pueden esquivar', () => {
    for (const z of ISLA_1.zonas) {
      for (const p of z.personajes.filter((q) => q.entrenador && !q.entrenador.obligatorio)) {
        const [entrada, salida] = entradaYSalida(z.id);
        const prohibidas = new Set([enIsla(m, z.id, p.x, p.y), ...vision(m, z.id, p)]);
        const r = alcanzables(m, entrada, { condiciones: TODAS_LAS_CONDICIONES, prohibidas });
        expect(salida.some((k) => r.has(k)), p.id).toBe(true);
      }
    }
  });

  it('cada entrenador ve al menos una casilla', () => {
    for (const z of ISLA_1.zonas) for (const p of z.personajes.filter((q) => q.entrenador)) expect(vision(m, z.id, p).length, p.id).toBeGreaterThan(0);
  });
});

/** Para los tipos que solo se usan aquí. */
export type { Mundo };
