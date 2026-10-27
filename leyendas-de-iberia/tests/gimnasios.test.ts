import { describe, expect, it } from 'vitest';
import { DATOS } from '../src/data';
import { CASILLAS, ENTRADAS, ENTRENADORES, INICIO, ZONAS } from '../src/data/mundo';
import { crearCriatura } from '../src/core/criatura';
import { vidaMaxima } from '../src/core/estadisticas';
import { crearRng } from '../src/core/rng';
import { ancho, enLineaDeVision, esSolida, posicionValida, type Paso, type Zona } from '../src/core/mundo';
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

/**
 * Los gimnasios (decisiones del autor, 2026-10-27): caben de ancho en la pantalla, tienen dos o
 * tres entrenadores además del líder y algo que los haga distintos (preguntas, laberinto…).
 * `obligatorios`: los entrenadores que no se pueden esquivar. `preguntas`: todos sus entrenadores
 * preguntan antes de combatir. `laberinto`: el camino hasta el líder es al menos el doble de largo
 * que la distancia en línea recta, y a oscuras.
 */
const GIMNASIOS: Record<string, { lider: string; obligatorios: string[]; preguntas?: boolean; laberinto?: boolean }> = {
  patio_leones: { lider: 'boabdil', obligatorios: ['guardia', 'poeta', 'alarife'], preguntas: true },
  alcazar_toledo: { lider: 'maria_pacheco', obligatorios: ['escudero', 'espadero', 'artillero'], laberinto: true },
};

/** Distancias andando desde una casilla, con los personajes como estorbo. */
function distancias(z: Zona, desde: [number, number], prohibidas = new Set<string>()): Map<string, number> {
  const estorbos = new Set([...z.pnj, ...z.carteles, ...(z.recipientes ?? [])].map((o) => `${o.x},${o.y}`));
  const pisable = (x: number, y: number) => !esSolida(z, x, y, CASILLAS) && !estorbos.has(`${x},${y}`) && !prohibidas.has(`${x},${y}`);
  const dist = new Map([[desde.join(','), 0]]);
  const cola = [desde];
  while (cola.length > 0) {
    const [x, y] = cola.shift()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const clave = `${x + dx},${y + dy}`;
      if (!dist.has(clave) && pisable(x + dx, y + dy)) {
        dist.set(clave, dist.get(`${x},${y}`)! + 1);
        cola.push([x + dx, y + dy]);
      }
    }
  }
  return dist;
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
