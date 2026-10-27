import { describe, expect, it } from 'vitest';
import { DATOS } from '../src/data';
import { CASILLAS, ENTRADAS, ENTRENADORES, INICIO, ZONAS } from '../src/data/mundo';
import { crearCriatura } from '../src/core/criatura';
import { vidaMaxima } from '../src/core/estadisticas';
import { crearRng } from '../src/core/rng';
import { ancho, banderaPalanca, cauceSeco, casillaEn, deslizamiento, DELTA, enLineaDeVision, esSolida, posicionValida, type Dir, type Paso, type Zona } from '../src/core/mundo';
import { alterarUna, anadirCriatura, aplicarCombate, herirUna, nuevaPartida } from '../src/core/partida';

function partidaCon(...especies: string[]) {
  const p = nuevaPartida('Prueba', 7, INICIO);
  for (const e of especies) anadirCriatura(p, crearCriatura(DATOS, e, 10, crearRng(e)));
  return p;
}

describe('castigos fuera de combate', () => {
  it('herir quita un 20 % a una sola criatura en pie, sin debilitarla', () => {
    const p = partidaCon('duende', 'topillo', 'lagarto');
    p.equipo[2].vida = 0;
    const antes = p.equipo.map((c) => c.vida);
    const c = herirUna(p, 0.2, DATOS)!;
    const cambiadas = p.equipo.filter((x, i) => x.vida !== antes[i]);
    expect(cambiadas).toEqual([c]);
    expect(c).not.toBe(p.equipo[2]);
    expect(c.vida).toBe(antes[p.equipo.indexOf(c)] - Math.floor(vidaMaxima(c, DATOS) * 0.2));
    // Nunca la debilita.
    c.vida = 2;
    for (let i = 0; i < 10; i++) herirUna(p, 0.2, DATOS);
    expect(p.equipo.filter((x) => x !== p.equipo[2]).every((x) => x.vida >= 1)).toBe(true);
  });

  it('herir no siempre elige a la misma: va al azar', () => {
    const elegidas = new Set<string>();
    for (let s = 0; s < 20; s++) {
      const p = partidaCon('duende', 'topillo', 'lagarto');
      p.rng = crearRng(`castigo${s}`);
      elegidas.add(herirUna(p, 0.2, DATOS)!.especie);
    }
    expect(elegidas.size).toBeGreaterThan(1);
  });

  it('alterar da el estado a una sola de las que pueden sufrirlo', () => {
    const p = partidaCon('duende', 'topillo', 'lagarto');
    p.equipo[0].estado = { tipo: 'quemado' };
    const c = alterarUna(p, 'dormido', DATOS)!;
    expect(c).not.toBe(p.equipo[0]);
    expect(c.estado?.tipo).toBe('dormido');
    expect(p.equipo.filter((x) => x.estado?.tipo === 'dormido')).toHaveLength(1);
  });

  it('alterar respeta las inmunidades de tipo', () => {
    // El acero no se envenena.
    const p = partidaCon('escarabajo_bronce');
    expect(alterarUna(p, 'envenenado', DATOS)).toBeNull();
    expect(p.equipo[0].estado).toBeNull();
  });
});

describe('posición al cargar', () => {
  it('se queda donde estaba si la casilla sigue siendo transitable', () => {
    const pos = { zona: 'santa_fe', x: INICIO.x, y: INICIO.y, dir: 'arriba' as const };
    expect(posicionValida(pos, ZONAS, CASILLAS, ENTRADAS, INICIO)).toEqual(pos);
  });

  it('va a la entrada de la zona si quedó en un muro o fuera del mapa', () => {
    expect(posicionValida({ zona: 'vega', x: 0, y: 0, dir: 'abajo' }, ZONAS, CASILLAS, ENTRADAS, INICIO)).toEqual(ENTRADAS.vega);
    expect(posicionValida({ zona: 'vega', x: 30, y: 5, dir: 'abajo' }, ZONAS, CASILLAS, ENTRADAS, INICIO)).toEqual(ENTRADAS.vega);
  });

  it('va al inicio si la zona ya no existe, y no toca a quien navega', () => {
    expect(posicionValida({ zona: 'no_existe', x: 1, y: 1, dir: 'abajo' }, ZONAS, CASILLAS, ENTRADAS, INICIO)).toEqual(INICIO);
    const enElTajo = { zona: 'camino_toledo', x: 3, y: 30, dir: 'abajo' as const };
    expect(posicionValida(enElTajo, ZONAS, CASILLAS, ENTRADAS, INICIO)).toEqual(enElTajo);
  });
});

describe('cubierta resbaladiza', () => {
  const cubierta: Zona = {
    id: 'prueba',
    nombre: 'Prueba',
    mapa: ['WWWWWWW', 'WBDDDBW', 'WDDKDDW', 'WDDDDDW', 'WWWWWWW'],
    pnj: [],
    salidas: [],
    carteles: [],
  };
  const libre = (x: number, y: number) => !esSolida(cubierta, x, y, CASILLAS);

  it('se resbala hasta pisar tabla seca', () => {
    expect(deslizamiento(cubierta, { x: 2, y: 1 }, 'derecha', CASILLAS, libre).at(-1)).toEqual({ x: 5, y: 1 });
  });

  it('o hasta chocar, quedándose en la última casilla mojada', () => {
    expect(deslizamiento(cubierta, { x: 1, y: 2 }, 'derecha', CASILLAS, libre)).toEqual([
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ]);
    expect(deslizamiento(cubierta, { x: 5, y: 2 }, 'abajo', CASILLAS, libre).at(-1)).toEqual({ x: 5, y: 3 });
  });

  it('en tabla seca no se resbala', () => {
    expect(deslizamiento(cubierta, { x: 1, y: 1 }, 'abajo', CASILLAS, libre)).toEqual([{ x: 1, y: 1 }]);
  });
});

describe('compuertas', () => {
  const trinchera: Zona = {
    id: 'prueba',
    nombre: 'Prueba',
    mapa: ['BcB', 'BeB'],
    pnj: [],
    salidas: [],
    carteles: [],
    palancas: [{ id: 'a', x: 0, y: 0 }],
  };

  it('sin echar la palanca, un cauce está inundado y el otro seco; echada, al revés', () => {
    expect(esSolida(trinchera, 1, 0, CASILLAS)).toBe(true);
    expect(esSolida(trinchera, 1, 1, CASILLAS)).toBe(false);
    const echada = { [banderaPalanca('prueba', 'a')]: true };
    expect(esSolida(trinchera, 1, 0, CASILLAS, echada)).toBe(false);
    expect(esSolida(trinchera, 1, 1, CASILLAS, echada)).toBe(true);
    expect(cauceSeco('prueba', CASILLAS.c.compuerta!, echada)).toBe(true);
  });

  it('las palancas son de su zona: la de otra no cuenta', () => {
    expect(esSolida(trinchera, 1, 0, CASILLAS, { [banderaPalanca('otra', 'a')]: true })).toBe(true);
  });
});

/**
 * Los gimnasios (decisiones del autor, 2026-10-27): caben de ancho en la pantalla, tienen dos o
 * tres entrenadores además del líder y algo que los haga distintos (preguntas, laberinto…).
 * `obligatorios`: los entrenadores que no se pueden esquivar. `preguntas`: todos sus entrenadores
 * preguntan antes de combatir. `laberinto`: el camino hasta el líder es al menos el doble de largo
 * que la distancia en línea recta, y a oscuras. `resbaladizo`: hay que resbalar con cabeza (al
 * menos `resbaladizo` movimientos) y desde ningún sitio de la cubierta te quedas sin poder volver.
 * `palancas`: sin moverlas no se llega al líder, hace falta moverlas al menos tantas veces, y
 * nadie se queda dentro de un cauce que se inunda.
 */
const GIMNASIOS: Record<
  string,
  { lider: string; obligatorios: string[]; preguntas?: boolean; laberinto?: boolean; resbaladizo?: number; palancas?: number }
> = {
  patio_leones: { lider: 'boabdil', obligatorios: ['guardia', 'poeta', 'alarife'], preguntas: true },
  alcazar_toledo: { lider: 'maria_pacheco', obligatorios: ['escudero', 'espadero', 'artillero'], laberinto: true },
  galeon: { lider: 'menendez', obligatorios: ['grumete', 'marinero', 'contramaestre'], resbaladizo: 20 },
  breda: { lider: 'spinola', obligatorios: ['piquero', 'arcabucero', 'alferez'], palancas: 3 },
};

/**
 * Movimientos desde una casilla, con los personajes como estorbo, resbalando donde resbala y
 * moviendo las palancas que haya (en suelo seco, un movimiento es un paso; mover una palanca,
 * otro). Un resbalón que cruza una casilla prohibida no vale. Devuelve, por casilla, el mínimo de
 * movimientos con cualquier posición de las palancas, y cuántas veces hubo que moverlas.
 * `conPalancas = false`: como si no se pudieran mover.
 */
function recorrer(z: Zona, desde: [number, number], prohibidas = new Set<string>(), conPalancas = true) {
  const estorbos = new Set([...z.pnj, ...z.carteles, ...(z.recipientes ?? []), ...(z.palancas ?? [])].map((o) => `${o.x},${o.y}`));
  const palancas = conPalancas ? (z.palancas ?? []) : [];
  type Estado = { x: number; y: number; b: Record<string, boolean>; n: number; tirones: number };
  const libre = (b: Record<string, boolean>) => (x: number, y: number) => !esSolida(z, x, y, CASILLAS, b) && !estorbos.has(`${x},${y}`);
  const clave = (e: Pick<Estado, 'x' | 'y' | 'b'>) => `${e.x},${e.y}|${palancas.map((p) => (e.b[banderaPalanca(z.id, p.id)] ? 1 : 0)).join('')}`;
  const inicio: Estado = { x: desde[0], y: desde[1], b: {}, n: 0, tirones: 0 };
  const vistos = new Set([clave(inicio)]);
  const dist = new Map<string, number>([[desde.join(','), 0]]);
  const tirones = new Map<string, number>([[desde.join(','), 0]]);
  const cola = [inicio];
  const nuevo = (e: Estado) => {
    const k = clave(e);
    if (vistos.has(k)) return;
    vistos.add(k);
    cola.push(e);
    const pos = `${e.x},${e.y}`;
    if (!dist.has(pos)) {
      dist.set(pos, e.n);
      tirones.set(pos, e.tirones);
    }
  };
  while (cola.length > 0) {
    const e = cola.shift()!;
    const puede = libre(e.b);
    for (const [dir, [dx, dy]] of Object.entries(DELTA) as [Dir, [number, number]][]) {
      const palanca = palancas.find((p) => p.x === e.x + dx && p.y === e.y + dy);
      if (palanca) {
        const k = banderaPalanca(z.id, palanca.id);
        const b = { ...e.b, [k]: !e.b[k] };
        // Nunca se inunda el cauce donde uno está.
        if (libre(b)(e.x, e.y)) nuevo({ x: e.x, y: e.y, b, n: e.n + 1, tirones: e.tirones + 1 });
        continue;
      }
      if (!puede(e.x + dx, e.y + dy)) continue;
      const camino = deslizamiento(z, { x: e.x + dx, y: e.y + dy }, dir, CASILLAS, puede);
      if (camino.some((c) => prohibidas.has(`${c.x},${c.y}`))) continue;
      const fin = camino.at(-1)!;
      nuevo({ x: fin.x, y: fin.y, b: e.b, n: e.n + 1, tirones: e.tirones });
    }
  }
  return { dist, tirones };
}

function distancias(z: Zona, desde: [number, number], prohibidas = new Set<string>()): Map<string, number> {
  return recorrer(z, desde, prohibidas).dist;
}

const castiga = (pasos: Paso[]) => pasos.some((p) => p.tipo === 'herir' || p.tipo === 'alterar');

describe('gimnasios', () => {
  for (const [id, g] of Object.entries(GIMNASIOS)) {
    const z = ZONAS[id];
    const lider = z.pnj.find((p) => p.id === g.lider)!;
    const entrada = [ENTRADAS[id].x, ENTRADAS[id].y] as [number, number];
    const alLado = (d: Map<string, number>) =>
      Math.min(...[[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => d.get(`${lider.x + dx},${lider.y + dy}`) ?? Infinity));
    const entrenadores = z.pnj.filter((p) => p.entrenador);

    it(`${id}: cabe de ancho en la pantalla, tiene dos o tres entrenadores y se llega al líder`, () => {
      expect(ancho(z)).toBeLessThanOrEqual(13);
      expect(lider).toBeDefined();
      expect(entrenadores.length).toBeGreaterThanOrEqual(2);
      expect(entrenadores.length).toBeLessThanOrEqual(3);
      expect(alLado(distancias(z, entrada))).toBeLessThan(Infinity);
    });

    it(`${id}: no es sitio de buscar objetos: como mucho uno en el suelo`, () => {
      expect((z.ocultos ?? []).length).toBeLessThanOrEqual(1);
      expect((z.recipientes ?? []).length).toBe(0);
    });

    it(`${id}: el líder no pregunta: se entra a su combate sin más`, () => {
      const combates = JSON.stringify(lider.guion).match(/"entrenador":"(\w+)"/g) ?? [];
      expect(combates.length).toBeGreaterThan(0);
      for (const c of combates) expect(ENTRENADORES[c.split('"')[3]].pregunta).toBeUndefined();
    });

    if (g.preguntas) {
      it(`${id}: todos sus entrenadores preguntan antes de combatir`, () => {
        for (const p of entrenadores) expect(ENTRENADORES[p.entrenador!].pregunta, p.id).toBeDefined();
      });
    }

    for (const pid of g.obligatorios) {
      it(`${id}: no se puede esquivar a ${pid}`, () => {
        const p = z.pnj.find((o) => o.id === pid)!;
        expect(p.entrenador).toBeDefined();
        const prohibidas = new Set([`${p.x},${p.y}`]);
        z.mapa.forEach((fila, y) =>
          [...fila].forEach((_, x) => {
            if (enLineaDeVision(z, CASILLAS, p, p.vision ?? 0, { x, y })) prohibidas.add(`${x},${y}`);
          }),
        );
        expect(alLado(distancias(z, entrada, prohibidas))).toBe(Infinity);
      });
    }

    if (g.resbaladizo) {
      it(`${id}: hay que resbalar con cabeza, y no hay donde quedarse atascado`, () => {
        const d = distancias(z, entrada);
        expect(alLado(d)).toBeGreaterThanOrEqual(g.resbaladizo!);
        // Desde todo lo que se alcanza se puede volver a la entrada.
        for (const clave of d.keys()) {
          const [x, y] = clave.split(',').map(Number);
          expect(distancias(z, [x, y]).has(entrada.join(',')), clave).toBe(true);
        }
      });
    }

    if (g.palancas) {
      it(`${id}: hay que mover las palancas, y bien`, () => {
        const meta = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => `${lider.x + dx},${lider.y + dy}`);
        expect(meta.some((m) => recorrer(z, entrada, new Set(), false).dist.has(m))).toBe(false);
        const { dist, tirones } = recorrer(z, entrada);
        const mejor = meta.filter((m) => dist.has(m)).sort((a, b) => dist.get(a)! - dist.get(b)!)[0];
        expect(tirones.get(mejor)).toBeGreaterThanOrEqual(g.palancas!);
      });

      it(`${id}: ninguna palanca está junto a un cauce, ni un entrenador mira por encima de uno`, () => {
        const cauce = (x: number, y: number) => Boolean(CASILLAS[casillaEn(z, x, y)]?.compuerta);
        for (const p of z.palancas ?? []) {
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) expect(cauce(p.x + dx, p.y + dy), `palanca ${p.id}`).toBe(false);
        }
        for (const p of entrenadores) {
          const [dx, dy] = DELTA[p.dir];
          for (let i = 1; i <= (p.vision ?? 0); i++) expect(cauce(p.x + dx * i, p.y + dy * i), p.id).toBe(false);
        }
      });
    }

    if (g.laberinto) {
      it(`${id}: es un laberinto de verdad, y a oscuras`, () => {
        const recta = Math.abs(lider.x - entrada[0]) + Math.abs(lider.y - entrada[1]);
        expect(alLado(distancias(z, entrada))).toBeGreaterThanOrEqual(2 * recta);
        expect(z.oscuridad).toBeGreaterThan(0);
      });
    }
  }

  it('cada pregunta tiene una respuesta buena y castigo', () => {
    for (const e of Object.values(ENTRENADORES)) {
      if (!e.pregunta) continue;
      const q = e.pregunta;
      expect(q.respuestas.length, e.id).toBeGreaterThanOrEqual(2);
      expect(q.correcta, e.id).toBeGreaterThanOrEqual(0);
      expect(q.correcta, e.id).toBeLessThan(q.respuestas.length);
      expect(new Set(q.respuestas).size, e.id).toBe(q.respuestas.length);
      expect(castiga(q.castigo), e.id).toBe(true);
    }
  });

  it('perder no deshace lo ganado: los vencidos y las preguntas siguen hechos', () => {
    const p = nuevaPartida('Prueba', 7, INICIO);
    anadirCriatura(p, crearCriatura(DATOS, 'duende', 10, crearRng('d')));
    p.vencidos.push('guardia_alhambra');
    p.banderas['vencido:guardia_alhambra'] = true;
    p.banderas['pregunta:guardia_alhambra'] = true;
    p.banderas['pregunta:poeta_corte'] = true;
    p.regreso = { zona: 'santa_fe', x: 5, y: 5, dir: 'abajo' };
    p.posicion = { zona: 'patio_leones', x: 6, y: 16, dir: 'arriba' };
    const caida = p.equipo.map((c) => ({ ...c, vida: 0 }));
    aplicarCombate(p, { resultado: 'derrota', equipo: caida, objetos: p.objetos, capturada: null, rivales: [], entrenador: ENTRENADORES.poeta_corte }, DATOS);
    expect(p.posicion.zona).toBe('santa_fe');
    expect(p.vencidos).toContain('guardia_alhambra');
    expect(p.banderas['vencido:guardia_alhambra']).toBe(true);
    // Al volver, el poeta ya no repite la pregunta: solo queda el combate.
    expect(p.banderas['pregunta:poeta_corte']).toBe(true);
    expect(p.equipo.every((c) => c.vida > 0)).toBe(true);
  });
});
