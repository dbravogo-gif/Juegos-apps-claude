import { describe, expect, it } from 'vitest';
import { avanzar, crearExploracion, entrar, interactuar, salir, type EstadoExplorar, type EventoExplorar } from '../src/core/explorar';
import { abrirDialogo, completa, elegirDialogo, lineaActual, pasoDialogo, pulsar, type Efecto, type EstadoDialogo } from '../src/core/guion';
import {
  clave,
  construirInterior,
  construirMundo,
  deClave,
  edificios,
  enIsla,
  transitable,
  type Direccion,
  type Mundo,
} from '../src/core/mundo';
import { GUION_ISLA1 } from '../src/data/guion-isla1';
import { INTERIORES_ISLA1, PUERTAS_ISLA1 } from '../src/data/interiores-isla1';
import { ISLA_1 } from '../src/data/isla1';

const isla = construirMundo(ISLA_1);
const salas = new Map(INTERIORES_ISLA1.map((d, i) => [d.id, construirInterior(d, { x: 200 + i * 20, y: 0 })]));
const PASOS: Record<Direccion, [number, number]> = { n: [0, -1], s: [0, 1], e: [1, 0], o: [-1, 0] };

/** Mantiene una dirección hasta llegar a la casilla siguiente (o un paso, si choca). */
function andar(m: Mundo, e: EstadoExplorar, dir: Direccion): EventoExplorar[] {
  const ev = [...avanzar(m, e, dir)];
  while (e.paso > 0) ev.push(...avanzar(m, e, dir));
  return ev;
}

/** Casillas que se alcanzan andando desde `desde`. */
function alcanza(m: Mundo, desde: number): Set<number> {
  const vistos = new Set([desde]);
  const cola = [desde];
  while (cola.length) {
    const [x, y] = deClave(cola.pop()!);
    for (const [dx, dy] of Object.values(PASOS)) {
      const k = clave(x + dx, y + dy);
      if (!vistos.has(k) && transitable(m, x + dx, y + dy)) {
        vistos.add(k);
        cola.push(k);
      }
    }
  }
  return vistos;
}

/** Pasa un diálogo entero con la tecla de interactuar, diciendo sí o no a la pregunta. */
function leer(s: EstadoDialogo, si: boolean): { efectos: Efecto[]; textos: string[] } {
  const efectos: Efecto[] = [];
  const textos: string[] = [];
  for (let i = 0; i < 200; i++) {
    while (!completa(s)) pasoDialogo(s);
    textos.push(lineaActual(s).texto);
    if (s.tramo === 'pregunta' && !si) pulsar(s, 'derecha');
    const r = pulsar(s, 'confirmar');
    if (r.efecto) efectos.push(r.efecto);
    if (r.fin) return { efectos, textos };
  }
  throw new Error('El diálogo no termina');
}

describe('interiores de la isla 1', () => {
  it('cada sala tiene la salida abajo, se llega a ella y a todos sus personajes', () => {
    for (const def of INTERIORES_ISLA1) {
      const m = salas.get(def.id)!;
      const z = m.zonas.get(def.id)!;
      const entrada = clave(z.origen.x + def.entrada.x, z.origen.y + def.entrada.y);
      expect(m.casillas.get(entrada)?.c, `${def.id}: la entrada se pisa`).toBe('m');
      const salidas = [...m.casillas].filter(([, c]) => c.c === 'd');
      expect(salidas, def.id).toHaveLength(1);
      const [sx, sy] = deClave(salidas[0][0]);
      expect(m.casillas.has(clave(sx, sy + 1)), `${def.id}: la salida da al sur, fuera de la sala`).toBe(false);
      const r = alcanza(m, entrada);
      expect(r.has(salidas[0][0]), `${def.id}: se llega a la salida`).toBe(true);
      for (const [k, { personaje }] of m.ocupadas) {
        const [x, y] = deClave(k);
        // Alguna casilla alcanzable desde la que se habla con él (también por encima de un mostrador).
        const desde = Object.entries(PASOS).some(([dir, [dx, dy]]) =>
          [1, 2].some((d) => {
            const a = clave(x - dx * d, y - dy * d);
            if (!r.has(a)) return false;
            const e = { ...crearExploracion(m), x: x - dx * d, y: y - dy * d, mira: dir as Direccion };
            return interactuar(m, e).some((ev) => ev.tipo === 'hablar' && ev.personaje === personaje.id);
          }),
        );
        expect(desde, `${def.id}: se puede hablar con «${personaje.id}»`).toBe(true);
      }
    }
  });

  it('cada puerta de la isla lleva a una sala que existe, y no hay puertas inventadas', () => {
    const conSala = new Set<number>();
    for (const [zona, puertas] of Object.entries(PUERTAS_ISLA1)) {
      for (const [xy, id] of Object.entries(puertas)) {
        const [x, y] = xy.split(',').map(Number);
        const k = enIsla(isla, zona, x, y);
        expect(isla.casillas.get(k)?.c, `${zona} ${xy}`).toBe('d');
        expect(salas.has(id), `${zona} ${xy} → ${id}`).toBe(true);
        conSala.add(k);
      }
    }
    for (const z of isla.zonas.keys()) for (const e of edificios(isla, z)) for (const p of e.puertas) expect(conSala.has(p), `puerta ${deClave(p)} de ${z}`).toBe(true);
  });

  it('todo el que está en una sala tiene algo que decir', () => {
    for (const def of INTERIORES_ISLA1) {
      for (const p of def.personajes) expect(GUION_ISLA1[p.id] ?? p.frase, `${def.id}: ${p.id}`).toBeDefined();
    }
  });

  it('las puertas se cruzan andando hacia ellas, no al pasar por delante', () => {
    // La puerta del refugio del pueblo está en la calle: pasar por ella no debe hacer nada.
    const puerta = enIsla(isla, 'pueblo', 17, 8);
    const [px, py] = deClave(puerta);
    const e = { ...crearExploracion(isla), x: px - 1, y: py, desdeX: px - 1, desdeY: py, zona: 'pueblo' };
    expect(andar(isla, e, 'e').filter((ev) => ev.tipo === 'puerta')).toHaveLength(0);
    expect(andar(isla, e, 'e').filter((ev) => ev.tipo === 'puerta')).toHaveLength(0);
    // De vuelta en la puerta, hacia el edificio, se entra.
    andar(isla, e, 'o');
    expect(andar(isla, e, 'n')).toContainEqual({ tipo: 'puerta', x: px, y: py });
    // Y llegando a la puerta desde el sur, mirando al edificio, también.
    const f = { ...crearExploracion(isla), x: px, y: py + 1, desdeX: px, desdeY: py + 1, zona: 'pueblo' };
    expect(andar(isla, f, 'n')).toContainEqual({ tipo: 'puerta', x: px, y: py });
  });

  it('entrar y salir: se vuelve a la puerta por la que se entró, mirando a la calle', () => {
    const puerta = enIsla(isla, 'capital', 21, 7);
    const [px, py] = deClave(puerta);
    const e = { ...crearExploracion(isla), x: px, y: py, desdeX: px, desdeY: py, zona: 'capital' };
    const casa = salas.get('casa')!;
    entrar(e, 'casa', casa);
    expect(e.dentro).toBe('casa');
    // Hacia el sur hasta la alfombra, y un paso más: se sale.
    const eventos: EventoExplorar[] = [];
    for (let i = 0; i < 4 && !eventos.some((ev) => ev.tipo === 'salida'); i++) eventos.push(...andar(casa, e, 's'));
    expect(eventos).toContainEqual({ tipo: 'salida' });
    salir(e);
    expect([e.x, e.y, e.zona, e.mira, e.dentro]).toEqual([px, py, 'capital', 's', null]);
  });

  it('en el refugio y la tienda se habla por encima del mostrador', () => {
    for (const [id, quien] of [
      ['refugio', 'enfermera'],
      ['tienda', 'tendero'],
    ]) {
      const m = salas.get(id)!;
      const k = [...m.ocupadas].find(([, o]) => o.personaje.id === quien)![0];
      const [x, y] = deClave(k);
      const e = { ...crearExploracion(m), x, y: y + 2, mira: 'n' as Direccion };
      expect(interactuar(m, e), id).toContainEqual({ tipo: 'hablar', zona: id, personaje: quien });
    }
  });
});

describe('diálogos', () => {
  it('el texto sale letra a letra: interactuar lo completa y otra vez pasa de línea', () => {
    const s = abrirDialogo({ lineas: [{ texto: 'Hola, ¿qué tal?' }, { texto: 'Adiós.' }] });
    pasoDialogo(s);
    expect(completa(s)).toBe(false);
    expect(pulsar(s, 'confirmar')).toEqual({ fin: false });
    expect(completa(s)).toBe(true);
    expect(s.linea).toBe(0);
    pulsar(s, 'confirmar');
    expect(lineaActual(s).texto).toBe('Adiós.');
    s.revelado = 99;
    expect(pulsar(s, 'confirmar').fin).toBe(true);
  });

  it('a la pregunta, decir que no (o cancelar) no aplica el efecto', () => {
    const d = elegirDialogo(GUION_ISLA1, 'estatua-agua', [], null)!;
    expect(leer(abrirDialogo(d), false).efectos).toEqual([]);
    const s = abrirDialogo(d);
    while (s.tramo !== 'pregunta') {
      s.revelado = 999;
      pulsar(s, 'confirmar');
    }
    expect(pulsar(s, 'cancelar')).toEqual({ fin: true });
  });

  it('elegir una estatua elige la inicial y abre el paso; después solo cuenta su historia', () => {
    for (const tipo of ['planta', 'agua', 'infernal']) {
      const { efectos } = leer(abrirDialogo(elegirDialogo(GUION_ISLA1, `estatua-${tipo}`, [], null)!), true);
      expect(efectos).toEqual([{ condicion: 'inicial-elegida', inicial: tipo }]);
      const luego = elegirDialogo(GUION_ISLA1, `estatua-${tipo}`, ['inicial-elegida'], tipo)!;
      expect(luego.pregunta).toBeUndefined();
    }
    // Con la inicial elegida, el paso de la zona inicial se abre.
    const x = [...isla.casillas].find(([, c]) => c.zona === 'inicial' && c.c === 'X')![0];
    const [px, py] = deClave(x);
    expect(transitable(isla, px, py)).toBe(false);
    expect(transitable(isla, px, py, { condiciones: new Set(['inicial-elegida']) })).toBe(true);
  });

  it('el anciano cuenta la historia de tu inicial y te ayuda a conectar con ella', () => {
    for (const [tipo, palabra] of [
      ['planta', 'verde'],
      ['agua', 'agua'],
      ['infernal', 'infernal'],
    ]) {
      const { efectos, textos } = leer(abrirDialogo(elegirDialogo(GUION_ISLA1, 'anciano', ['inicial-elegida'], tipo)!), true);
      expect(efectos).toEqual([{ condicion: 'anciano' }]);
      expect(textos.join(' ')).toContain(palabra);
    }
    expect(elegirDialogo(GUION_ISLA1, 'anciano', ['inicial-elegida', 'anciano'], 'agua')!.efecto).toBeUndefined();
  });

  it('todos los textos caben en la caja (unas 3 líneas) y ninguno está vacío', () => {
    for (const [id, variantes] of Object.entries(GUION_ISLA1)) {
      for (const v of variantes) {
        const d = v.dialogo;
        for (const l of [...d.lineas, ...(d.tras ?? []), ...(d.pregunta ? [d.pregunta] : [])]) {
          expect(l.texto.trim().length, id).toBeGreaterThan(0);
          expect(l.texto.length, `${id}: «${l.texto.slice(0, 30)}…»`).toBeLessThanOrEqual(190);
        }
      }
    }
  });

  it('las salas están lejos de la isla: ninguna casilla coincide', () => {
    for (const m of salas.values()) for (const k of m.casillas.keys()) expect(isla.casillas.has(k)).toBe(false);
  });
});
