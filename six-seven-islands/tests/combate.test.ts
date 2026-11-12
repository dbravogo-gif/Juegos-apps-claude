import { describe, expect, it } from 'vitest';
import {
  EMPUJON,
  iniciarCombate,
  reemplazar,
  resolverTurno,
  validarAccion,
  validarDecisiones,
  type Control,
  type EstadoCombate,
  type Evento,
} from '../src/core/combate';
import { crearCriatura } from '../src/core/criatura';
import { vidaMaxima } from '../src/core/estadisticas';
import type { Criatura } from '../src/core/modelo';
import { aprenderMovimiento, evolucionar, evolucionesPosibles } from '../src/core/progreso';
import { crearRng, elegir, entero } from '../src/core/rng';
import { DATOS_PRUEBA as D } from './utiles/datos-prueba';
import { jugarHastaElFinal, repetir } from './utiles/bots';

let n = 0;
const cr = (especie: string, nivel = 20, extra: Partial<Criatura> = {}): Criatura => ({
  ...crearCriatura(D, especie, nivel, crearRng(`cr-${n++}`), { valia: 8, temperamento: 'equilibrado' }),
  ...extra,
});
const conMovs = (c: Criatura, ...ids: string[]): Criatura => ({ ...c, movimientos: ids.map((id) => ({ id, pp: D.movimientos[id].pp })) });

function combate(
  a: Criatura[],
  b: Criatura[],
  opciones: { formato?: 1 | 2; salvaje?: boolean; control?: [Control, Control]; semilla?: number | string; experiencia?: boolean } = {},
): EstadoCombate {
  return iniciarCombate(
    {
      equipos: [a, b],
      formato: opciones.formato ?? 1,
      salvaje: opciones.salvaje ?? false,
      control: opciones.control ?? ['jugador', 'jugador'],
      rng: crearRng(opciones.semilla ?? 67),
      experiencia: opciones.experiencia ?? true,
    },
    D,
  ).estado;
}

const mover = (indice: number, hueco = 0, lado: 0 | 1 = 1) => ({ tipo: 'movimiento' as const, indice, objetivo: { lado, hueco } });
const tipos = (ev: Evento[]) => ev.map((x) => x.tipo);

describe('combate determinista', () => {
  it('50 combates repetidos con los mismos pasos, pasando el estado por JSON, dan lo mismo', () => {
    const especies = Object.keys(D.especies);
    for (let i = 0; i < 50; i++) {
      const rng = crearRng(`det-${i}`);
      const equipo = () => Array.from({ length: entero(rng, 2, 5) }, () => crearCriatura(D, elegir(rng, especies), entero(rng, 5, 30), rng));
      const inicial = combate(equipo(), equipo(), { formato: (1 + (i % 2)) as 1 | 2, control: ['jugador', i % 3 ? 'ia' : 'jugador'], semilla: i });
      const a = jugarHastaElFinal(inicial, D, crearRng(`bot-det-${i}`));
      const b = repetir(inicial, a.pasos, D);
      expect(a.estado.fin, `combate ${i}`).not.toBeNull();
      expect(JSON.stringify(b.estado), `combate ${i}`).toBe(JSON.stringify(a.estado));
      expect(JSON.stringify(b.eventos), `combate ${i}`).toBe(JSON.stringify(a.eventos));
    }
  });
});

describe('1.000 combates de bots', () => {
  // Pesada a propósito (unos 3 s solos): con la máquina ocupada pasaba de los 5 s por defecto y
  // fallaba sin motivo (2026-11-12). Por eso lleva su propio límite.
  it('terminan todos, sin errores y sin romper las invariantes', () => {
    const especies = Object.keys(D.especies);
    const rng = crearRng('mil');
    const resultados: Record<string, number> = {};
    for (let i = 0; i < 1000; i++) {
      const equipo = () => Array.from({ length: entero(rng, 1, 6) }, () => crearCriatura(D, elegir(rng, especies), entero(rng, 3, 30), rng));
      const salvaje = entero(rng, 0, 1) === 1;
      const formato = entero(rng, 1, 2) as 1 | 2;
      const control: [Control, Control] = [entero(rng, 0, 3) === 0 ? 'ia' : 'jugador', entero(rng, 0, 3) === 0 ? 'jugador' : 'ia'];
      const inicial = combate(equipo(), salvaje ? [crearCriatura(D, elegir(rng, especies), entero(rng, 3, 30), rng)] : equipo(), {
        formato,
        salvaje,
        control,
        semilla: i,
      });
      const p = jugarHastaElFinal(inicial, D, crearRng(`bot-${i}`), 400, (antes, e, copiaAntes) => {
        expect(JSON.stringify(antes), 'el paso ha modificado el estado recibido').toBe(copiaAntes);
        for (const lado of e.lados) {
          const ocupados = lado.activos.filter((a) => a >= 0);
          expect(new Set(ocupados).size, 'una criatura en dos huecos').toBe(ocupados.length);
          for (const c of lado.equipo) {
            expect(c.vida).toBeGreaterThanOrEqual(0);
            expect(c.vida).toBeLessThanOrEqual(vidaMaxima(c, D));
            for (const m of c.movimientos) expect(m.pp).toBeGreaterThanOrEqual(0);
          }
          for (const a of lado.activos) expect(a === -1 || (a >= 0 && a < lado.equipo.length)).toBe(true);
        }
      });
      expect(p.estado.fin, `combate ${i} sin terminar en ${p.turnos} turnos`).not.toBeNull();
      resultados[p.estado.fin!] = (resultados[p.estado.fin!] ?? 0) + 1;
    }
    expect(resultados.victoria).toBeGreaterThan(50);
    expect(resultados.derrota).toBeGreaterThan(50);
    expect(resultados.captura).toBeGreaterThan(10);
    expect(resultados.huida).toBeGreaterThan(10);
  }, 30_000);
});

describe('2 contra 2', () => {
  it('un movimiento a todos los rivales golpea a los dos', () => {
    const e = combate([conMovs(cr('fantasma'), 'onda'), cr('rama')], [cr('agua1'), cr('planta1')], { formato: 2, control: ['jugador', 'ia'] });
    const { eventos } = resolverTurno(e, { 0: [mover(0), mover(0)] }, D);
    const i = eventos.findIndex((x) => x.tipo === 'usa' && x.movimiento === 'onda');
    const golpes = eventos.slice(i + 1).filter((x): x is Extract<Evento, { tipo: 'danio' }> => x.tipo === 'danio' && x.ref.lado === 1);
    expect(new Set(golpes.slice(0, 2).map((g) => g.ref.hueco))).toEqual(new Set([0, 1]));
  });

  it('si el objetivo elegido ya ha caído, el golpe va al otro rival', () => {
    const debil = cr('rama', 5);
    debil.vida = 1;
    const e = combate([cr('agua1', 60), cr('agua1', 60)], [debil, cr('planta1', 5)], { formato: 2, control: ['jugador', 'ia'] });
    const { eventos } = resolverTurno(e, { 0: [mover(0, 0), mover(0, 0)] }, D);
    const golpes = eventos.filter((x): x is Extract<Evento, { tipo: 'danio' }> => x.tipo === 'danio' && x.ref.lado === 1);
    expect(golpes[0].ref.hueco).toBe(0);
    expect(golpes.some((g) => g.ref.hueco === 1)).toBe(true);
  });

  it('con dos caídas y un solo suplente, solo espera un hueco', () => {
    const a = cr('rama', 5);
    const b = cr('rama', 5);
    a.vida = 1;
    b.vida = 1;
    const e = combate([a, b, cr('rama', 5)], [cr('agua1', 60), cr('agua1', 60)], { formato: 2, control: ['jugador', 'ia'] });
    const { estado } = resolverTurno(e, { 0: [mover(0), mover(0)] }, D);
    expect(estado.pendientes).toHaveLength(1);
    expect(estado.lados[0].activos.filter((x) => x === -1)).toHaveLength(1);
  });
});

describe('reglas del turno', () => {
  it('la prioridad adelanta al rápido y el retroceso hace perder el turno', () => {
    const lento = conMovs(cr('rama', 20), 'rapido');
    const veloz = cr('infernal1', 40);
    const e = combate([lento], [veloz], { control: ['jugador', 'jugador'] });
    const { eventos } = resolverTurno(e, { 0: [mover(0)], 1: [mover(0, 0, 0)] }, D);
    expect(eventos.find((x) => x.tipo === 'usa')).toMatchObject({ ref: { lado: 0 } });
    expect(eventos.some((x) => x.tipo === 'noSeMueve' && x.motivo === 'retroceso' && x.ref.lado === 1)).toBe(true);
  });

  it('proteger para los golpes y, usado seguido, sale una de cada tres veces', () => {
    let segundas = 0;
    const veces = 600;
    for (let s = 0; s < veces; s++) {
      const e = combate([conMovs(cr('agua1'), 'escudo')], [cr('infernal1')], { control: ['jugador', 'ia'], semilla: s });
      const t1 = resolverTurno(e, { 0: [{ tipo: 'movimiento', indice: 0 }] }, D);
      expect(tipos(t1.eventos)).toContain('protegido');
      const t2 = resolverTurno(t1.estado, { 0: [{ tipo: 'movimiento', indice: 0 }] }, D);
      if (tipos(t2.eventos).includes('protege')) segundas++;
    }
    expect(segundas / veces).toBeGreaterThan(0.27);
    expect(segundas / veces).toBeLessThan(0.4);
  });

  it('dormida no actúa y despierta a los pocos turnos', () => {
    const e = combate([cr('agua1', 20, { estado: { tipo: 'dormido', turnos: 2 } })], [cr('rama', 5)], { control: ['jugador', 'ia'] });
    const t1 = resolverTurno(e, { 0: [mover(0)] }, D);
    expect(t1.eventos.some((x) => x.tipo === 'noSeMueve' && x.motivo === 'dormido')).toBe(true);
    const t2 = resolverTurno(t1.estado, { 0: [mover(0)] }, D);
    expect(tipos(t2.eventos)).toContain('despierta');
    expect(t2.eventos.some((x) => x.tipo === 'usa' && x.ref.lado === 0)).toBe(true);
  });

  it('sin PP usa el Empujón y se hace daño de retroceso', () => {
    const c = cr('agua1');
    c.movimientos = c.movimientos.map((m) => ({ ...m, pp: 0 }));
    const e = combate([c], [cr('rama')], { control: ['jugador', 'ia'] });
    const { eventos } = resolverTurno(e, { 0: [mover(3)] }, D);
    expect(eventos.some((x) => x.tipo === 'usa' && x.movimiento === EMPUJON.id)).toBe(true);
    expect(eventos.some((x) => x.tipo === 'danio' && x.causa === 'retroceso' && x.ref.lado === 0)).toBe(true);
  });

  it('la intoxicación hace cada turno más daño', () => {
    const e = combate([cr('agua1', 40, { estado: { tipo: 'intoxicado', turnos: 1 } })], [conMovs(cr('rama', 40), 'escudo')], { control: ['jugador', 'jugador'] });
    const t1 = resolverTurno(e, { 0: [{ tipo: 'movimiento', indice: 2 }], 1: [{ tipo: 'movimiento', indice: 0 }] }, D);
    const t2 = resolverTurno(t1.estado, { 0: [{ tipo: 'movimiento', indice: 2 }], 1: [{ tipo: 'movimiento', indice: 0 }] }, D);
    const veneno = (ev: Evento[]) => ev.find((x) => x.tipo === 'danio' && x.causa === 'veneno') as Extract<Evento, { tipo: 'danio' }>;
    expect(veneno(t2.eventos).cantidad).toBeGreaterThan(veneno(t1.eventos).cantidad);
  });
});

describe('salvajes, objetos y cambios', () => {
  it('se captura con el lanzamiento y se devuelve la criatura capturada', () => {
    const presa = cr('fantasma', 5);
    presa.vida = 1;
    let e = combate([cr('agua1')], [presa], { salvaje: true, control: ['jugador', 'ia'] });
    for (let i = 0; i < 30 && !e.fin; i++) e = resolverTurno(e, { 0: [{ tipo: 'objeto', objeto: 'basica', calidad: 1 }] }, D).estado;
    expect(e.fin).toBe('captura');
    expect(e.capturada?.uid).toBe(presa.uid);
  });

  it('no se captura con dos salvajes en pie, ni a la criatura de un entrenador', () => {
    const doble = combate([cr('agua1'), cr('rama')], [cr('rama'), cr('rama')], { formato: 2, salvaje: true });
    expect(() => validarAccion(doble, { lado: 0, hueco: 0 }, { tipo: 'objeto', objeto: 'basica' }, D)).toThrow(/una criatura/);
    const entrenador = combate([cr('agua1')], [cr('rama')]);
    expect(() => validarAccion(entrenador, { lado: 0, hueco: 0 }, { tipo: 'objeto', objeto: 'basica' }, D)).toThrow();
    expect(() => validarAccion(entrenador, { lado: 0, hueco: 0 }, { tipo: 'huir' }, D)).toThrow();
    expect(() => validarAccion(entrenador, { lado: 0, hueco: 0 }, { tipo: 'objeto', objeto: 'paquete', objetivo: 0 }, D)).toThrow();
  });

  it('huye siempre si es más rápido', () => {
    const e = combate([cr('infernal1', 60)], [cr('rama', 3)], { salvaje: true, control: ['jugador', 'ia'] });
    const { estado, eventos } = resolverTurno(e, { 0: [{ tipo: 'huir' }] }, D);
    expect(estado.fin).toBe('huida');
    expect(eventos).toContainEqual({ tipo: 'huida', exito: true });
  });

  it('una poción cura a la propia criatura y avisa de que se ha gastado', () => {
    const herida = cr('agua1');
    herida.vida = 5;
    const e = combate([herida], [conMovs(cr('rama'), 'escudo')], { control: ['jugador', 'jugador'] });
    const { estado, eventos } = resolverTurno(e, { 0: [{ tipo: 'objeto', objeto: 'pocion', objetivo: 0 }], 1: [{ tipo: 'movimiento', indice: 0 }] }, D);
    expect(eventos).toContainEqual({ tipo: 'objetoUsado', lado: 0, objeto: 'pocion', objetivo: 0 });
    expect(estado.lados[0].equipo[0].vida).toBe(25);
  });

  it('tras caer, el jugador elige el reemplazo y hasta entonces no hay turno', () => {
    const caida = cr('rama', 5);
    caida.vida = 1;
    const e = combate([caida, cr('agua1')], [cr('infernal1', 40)], { control: ['jugador', 'ia'] });
    const t = resolverTurno(e, { 0: [mover(0)] }, D);
    expect(t.estado.pendientes).toEqual([{ lado: 0, hueco: 0 }]);
    expect(() => resolverTurno(t.estado, { 0: [mover(0)] }, D)).toThrow(/reemplazar/);
    const r = reemplazar(t.estado, { lado: 0, hueco: 0 }, 1, D);
    expect(r.estado.lados[0].activos).toEqual([1]);
    expect(tipos(r.eventos)).toEqual(['entrada']);
  });

  it('la victoria da experiencia; un reto entre amigos, no', () => {
    const jugar = (experiencia: boolean) => {
      const rival = cr('rama', 3);
      rival.vida = 1;
      const e = combate([cr('agua1', 30)], [rival], { control: ['jugador', 'ia'], experiencia });
      return resolverTurno(e, { 0: [mover(0)] }, D);
    };
    const con = jugar(true);
    expect(con.estado.fin).toBe('victoria');
    expect(tipos(con.eventos)).toContain('experiencia');
    expect(tipos(jugar(false).eventos)).not.toContain('experiencia');
  });
});

describe('barreras de la revisión del probador (2026-11-07)', () => {
  it('dos huecos no pueden sacar a la misma criatura', () => {
    const e = combate([cr('agua1'), cr('rama'), cr('planta1')], [cr('rama'), cr('rama')], { formato: 2 });
    expect(() => validarDecisiones(e, 0, [{ tipo: 'cambio', indice: 2 }, { tipo: 'cambio', indice: 2 }], D)).toThrow(/dos huecos/);
    expect(() => resolverTurno(e, { 0: [{ tipo: 'cambio', indice: 2 }, { tipo: 'cambio', indice: 2 }], 1: [mover(0, 0, 0), mover(0, 0, 0)] }, D)).toThrow();
  });

  it('dos objetos sobre la misma criatura no se aceptan', () => {
    const herida = cr('agua1');
    herida.vida -= 3;
    const e = combate([herida, cr('rama')], [cr('rama'), cr('rama')], { formato: 2 });
    const pocion = { tipo: 'objeto' as const, objeto: 'pocion', objetivo: 0 };
    expect(() => validarDecisiones(e, 0, [pocion, pocion], D)).toThrow(/misma criatura/);
  });

  it('una criatura debilitada no evoluciona', () => {
    const c = { ...cr('agua1', 16), vida: 0 };
    expect(evolucionesPosibles(c, D)).toEqual([]);
    expect(() => evolucionar(c, 'agua2', D)).toThrow();
  });

  it('aprender un movimiento no deja huecos ni repite', () => {
    const c = conMovs(cr('planta1'), 'golpe', 'hoja');
    expect(() => aprenderMovimiento(c, 'onda', 3, D)).toThrow(/Hueco/);
    expect(() => aprenderMovimiento(c, 'golpe', 0, D)).toThrow(/Ya sabe/);
    expect(aprenderMovimiento(c, 'onda', 2, D).movimientos.map((m) => m.id)).toEqual(['golpe', 'hoja', 'onda']);
  });

  it('si caen a la vez las últimas criaturas, gana quien cayó después: no siempre el lado 0', () => {
    const sinPP = (c: Criatura) => ({ ...c, vida: 1, movimientos: c.movimientos.map((m) => ({ ...m, pp: 0 })) });
    const fragil = (c: Criatura) => ({ ...c, vida: 1 });
    // Usa el Empujón el lado 0: el rival cae primero y el lado 0 después, por el retroceso.
    const a = combate([sinPP(cr('infernal1', 30))], [fragil(conMovs(cr('rama', 5), 'golpe'))], { control: ['jugador', 'jugador'] });
    expect(resolverTurno(a, { 0: [mover(0)], 1: [mover(0, 0, 0)] }, D).estado.fin).toBe('victoria');
    // Usa el Empujón el lado 1.
    const b = combate([fragil(conMovs(cr('rama', 5), 'golpe'))], [sinPP(cr('infernal1', 30))], { control: ['jugador', 'jugador'] });
    expect(resolverTurno(b, { 0: [mover(0)], 1: [mover(0, 0, 0)] }, D).estado.fin).toBe('derrota');
  });

  it('los efectos sobre uno mismo no se aplican si el golpe lo paran', () => {
    const e = combate([conMovs(cr('agua1'), 'carga')], [conMovs(cr('rama', 5), 'escudo')], { control: ['jugador', 'jugador'] });
    const { eventos } = resolverTurno(e, { 0: [mover(0)], 1: [{ tipo: 'movimiento', indice: 0 }] }, D);
    expect(tipos(eventos)).toContain('protegido');
    expect(eventos.some((x) => x.tipo === 'etapa' && x.ref.lado === 0)).toBe(false);
  });

  it('proteger vuelve a salir siempre tras un turno sin proteger, aunque no haya movido', () => {
    for (let s = 0; s < 60; s++) {
      const herida = conMovs(cr('agua1', 30), 'escudo');
      herida.vida -= 10;
      let e = combate([herida], [cr('rama', 5)], { control: ['jugador', 'ia'], semilla: s });
      e = resolverTurno(e, { 0: [{ tipo: 'movimiento', indice: 0 }] }, D).estado;
      e = resolverTurno(e, { 0: [{ tipo: 'objeto', objeto: 'pocion', objetivo: 0 }] }, D).estado;
      expect(tipos(resolverTurno(e, { 0: [{ tipo: 'movimiento', indice: 0 }] }, D).eventos)).toContain('protege');
    }
  });

  it('al retirarse, la intoxicación vuelve a empezar', () => {
    const e = combate([cr('agua1', 40, { estado: { tipo: 'intoxicado', turnos: 5 } }), cr('rama', 40)], [conMovs(cr('rama', 40), 'escudo')], { control: ['jugador', 'jugador'] });
    const { estado } = resolverTurno(e, { 0: [{ tipo: 'cambio', indice: 1 }], 1: [{ tipo: 'movimiento', indice: 0 }] }, D);
    expect(estado.lados[0].equipo[0].estado).toEqual({ tipo: 'intoxicado', turnos: 1 });
  });

  it('los uid tienen 62 bits y no se repiten en 20.000 criaturas', () => {
    const rng = crearRng('uid');
    const uids = new Set(Array.from({ length: 20000 }, () => crearCriatura(D, 'rama', 5, rng).uid));
    expect(uids.size).toBe(20000);
  });
});
