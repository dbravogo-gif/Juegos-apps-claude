import { describe, expect, it } from 'vitest';
import { DATOS } from '../src/data';
import { CASILLAS, ENTRADAS, INICIO, ZONAS } from '../src/data/mundo';
import { crearCriatura } from '../src/core/criatura';
import { vidaMaxima } from '../src/core/estadisticas';
import { crearRng } from '../src/core/rng';
import { ancho, enLineaDeVision, esSolida, posicionValida, type Paso, type Zona } from '../src/core/mundo';
import { alterarEquipo, anadirCriatura, herirEquipo, nuevaPartida } from '../src/core/partida';

function partidaCon(...especies: string[]) {
  const p = nuevaPartida('Prueba', 7, INICIO);
  for (const e of especies) anadirCriatura(p, crearCriatura(DATOS, e, 10, crearRng(e)));
  return p;
}

describe('castigos fuera de combate', () => {
  it('herir quita vida a las que están en pie, sin debilitar a ninguna', () => {
    const p = partidaCon('duende', 'topillo', 'lagarto');
    p.equipo[1].vida = 2;
    p.equipo[2].vida = 0;
    const antes = p.equipo[0].vida;
    herirEquipo(p, 0.25, DATOS);
    expect(p.equipo[0].vida).toBe(antes - Math.floor(vidaMaxima(p.equipo[0], DATOS) * 0.25));
    expect(p.equipo[1].vida).toBe(1);
    expect(p.equipo[2].vida).toBe(0);
    herirEquipo(p, 0.25, DATOS);
    expect(p.equipo[1].vida).toBe(1);
  });

  it('alterar da el estado a la primera que puede sufrirlo', () => {
    const p = partidaCon('duende', 'topillo');
    p.equipo[0].estado = { tipo: 'quemado' };
    const c = alterarEquipo(p, 'dormido', DATOS);
    expect(c).toBe(p.equipo[1]);
    expect(p.equipo[1].estado?.tipo).toBe('dormido');
    // Ya no queda nadie que pueda.
    expect(alterarEquipo(p, 'paralizado', DATOS)).toBeNull();
  });

  it('alterar respeta las inmunidades de tipo', () => {
    // El acero no se envenena.
    const p = partidaCon('escarabajo_bronce');
    expect(alterarEquipo(p, 'envenenado', DATOS)).toBeNull();
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
 * Los gimnasios (decisión del autor, 2026-10-27): caben de ancho en la pantalla, tienen dos o tres
 * entrenadores además del líder y algo que los haga distintos (puertas con pregunta, laberinto…).
 * `obligatorios`: los entrenadores que no se pueden esquivar. `laberinto`: el camino hasta el líder
 * tiene que ser al menos el doble de largo que la distancia en línea recta.
 */
const GIMNASIOS: Record<string, { lider: string; obligatorios: string[]; laberinto?: boolean }> = {
  patio_leones: { lider: 'boabdil', obligatorios: ['guardia', 'alarife'] },
  alcazar_toledo: { lider: 'maria_pacheco', obligatorios: ['escudero', 'espadero', 'artillero'], laberinto: true },
};

const esPuerta = (ocultoSi?: string) => Boolean(ocultoSi?.startsWith('puerta:'));

/** Distancias andando desde una casilla, con todos los personajes como estorbo salvo los que se quitan. */
function distancias(z: Zona, desde: [number, number], quitar: (id: string) => boolean, prohibidas = new Set<string>()): Map<string, number> {
  const estorbos = new Set([...z.pnj.filter((p) => !quitar(p.id)), ...z.carteles, ...(z.recipientes ?? [])].map((o) => `${o.x},${o.y}`));
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

/** Los pasos de un guion, entrando en las ramas. */
function pasos(g: Paso[]): Paso[] {
  return g.flatMap((p) => [p, ...(p.tipo === 'si' ? [...pasos(p.entonces), ...pasos(p.sino ?? [])] : []), ...(p.tipo === 'elegir' ? p.opciones.flatMap((o) => pasos(o.pasos)) : [])]);
}

describe('gimnasios', () => {
  for (const [id, g] of Object.entries(GIMNASIOS)) {
    const z = ZONAS[id];
    const lider = z.pnj.find((p) => p.id === g.lider)!;
    const entrada = [ENTRADAS[id].x, ENTRADAS[id].y] as [number, number];
    const alLado = (d: Map<string, number>) =>
      Math.min(...[[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => d.get(`${lider.x + dx},${lider.y + dy}`) ?? Infinity));
    // Con las puertas ya abiertas: los porteros se han apartado.
    const abiertas = (pid: string) => esPuerta(z.pnj.find((p) => p.id === pid)?.ocultoSi);

    it(`${id}: cabe de ancho en la pantalla y tiene al menos dos entrenadores además del líder`, () => {
      expect(ancho(z)).toBeLessThanOrEqual(13);
      expect(lider).toBeDefined();
      expect(z.pnj.filter((p) => p.entrenador).length).toBeGreaterThanOrEqual(2);
      expect(alLado(distancias(z, entrada, abiertas))).toBeLessThan(Infinity);
    });

    const porteros = z.pnj.filter((p) => esPuerta(p.ocultoSi));
    if (porteros.length > 0) {
      it(`${id}: sin acertar las preguntas no se llega al líder`, () => {
        expect(alLado(distancias(z, entrada, () => false))).toBe(Infinity);
      });

      for (const portero of porteros) {
        it(`${id}: ${portero.id} tiene una sola respuesta buena, castigo en las malas y «Ahora no»`, () => {
          const eleccion = pasos(portero.guion).find((p) => p.tipo === 'elegir');
          if (eleccion?.tipo !== 'elegir') throw new Error('sin pregunta');
          const abre = (o: { pasos: Paso[] }) => pasos(o.pasos).some((p) => p.tipo === 'bandera' && p.nombre === portero.ocultoSi);
          const castiga = (o: { pasos: Paso[] }) => pasos(o.pasos).some((p) => p.tipo === 'herir' || p.tipo === 'alterar');
          const respuestas = eleccion.opciones.slice(0, -1);
          const cancelar = eleccion.opciones.at(-1)!;
          expect(respuestas.filter(abre)).toHaveLength(1);
          for (const o of respuestas.filter((o) => !abre(o))) expect(castiga(o), o.texto).toBe(true);
          expect(abre(cancelar) || castiga(cancelar)).toBe(false);
        });
      }
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
        expect(alLado(distancias(z, entrada, abiertas, prohibidas))).toBe(Infinity);
      });
    }

    if (g.laberinto) {
      it(`${id}: es un laberinto de verdad`, () => {
        const recta = Math.abs(lider.x - entrada[0]) + Math.abs(lider.y - entrada[1]);
        expect(alLado(distancias(z, entrada, abiertas))).toBeGreaterThanOrEqual(2 * recta);
      });
    }
  }
});
