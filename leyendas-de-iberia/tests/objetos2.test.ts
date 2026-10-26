import { describe, expect, it } from 'vitest';
import { crearRng } from '../src/core/rng';
import { crearCriatura } from '../src/core/criatura';
import { iniciarCombate, resolverTurno, type Evento } from '../src/core/combate';
import { aplicarCuracion, encendido, motivoNoUsable } from '../src/core/objetos';
import { destinoConObjeto } from '../src/core/progreso';
import { nuevaPartida } from '../src/core/partida';
import type { Criatura, DatosJuego } from '../src/core/modelo';
import { DATOS } from '../src/data';
import { INICIO } from '../src/data/mundo';

function criatura(especie: string, nivel: number, movimientos?: string[], objeto?: string): Criatura {
  const c = crearCriatura(DATOS, especie, nivel, crearRng(especie), { valia: 8, temperamento: 'sosegado' });
  if (movimientos) c.movimientos = movimientos.map((id) => ({ id, pp: DATOS.movimientos[id].pp }));
  if (objeto) c.objeto = objeto;
  return c;
}

function combate(jugador: Criatura[], rival: Criatura[], op: { objetos?: Record<string, number>; semilla?: string; repartir?: boolean; datos?: DatosJuego } = {}) {
  return iniciarCombate(
    {
      semilla: op.semilla ?? 'objetos2',
      jugador: { nombre: 'Tú', equipo: jugador, objetos: op.objetos ?? {} },
      rival: { nombre: 'Rival', equipo: rival },
      salvaje: true,
      repartir: op.repartir,
    },
    op.datos ?? DATOS,
  );
}

const de = (ev: Evento[], tipo: Evento['tipo']) => ev.filter((e) => e.tipo === tipo);

describe('Repartir experiencia', () => {
  it('sin él, solo gana quien ha luchado; con él, las demás la mitad', () => {
    const equipo = () => [criatura('drago_milenario', 50, ['ira_ancestral']), criatura('lobo', 10, ['aullido'])];
    const sin = resolverTurno(combate(equipo(), [criatura('topillo', 5, ['topetazo'])]).estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    expect(sin.estado.fin).toBe('victoria');
    expect(de(sin.eventos, 'experiencia').map((e) => e.tipo === 'experiencia' && e.indice)).toEqual([0]);

    const con = resolverTurno(combate(equipo(), [criatura('topillo', 5, ['topetazo'])], { repartir: true }).estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    const exp = de(con.eventos, 'experiencia');
    expect(exp).toHaveLength(2);
    const [a, b] = exp.map((e) => (e.tipo === 'experiencia' ? e : null)!);
    expect(b.repartida).toBe(true);
    expect(b.cantidad).toBe(Math.floor(a.cantidad / 2));
    expect(de(con.eventos, 'experienciaRepartida')).toHaveLength(1);
  });

  it('las que salen contra la criatura rival ganan la experiencia entera', () => {
    const { estado } = combate([criatura('lobo', 10, ['aullido']), criatura('drago_milenario', 50, ['ira_ancestral'])], [criatura('topillo', 5, ['topetazo'])]);
    const r1 = resolverTurno(estado, { tipo: 'cambio', indice: 1 }, DATOS);
    const r2 = resolverTurno(r1.estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    const exp = de(r2.eventos, 'experiencia').map((e) => (e.tipo === 'experiencia' ? e : null)!);
    expect(exp.map((e) => e.indice).sort()).toEqual([0, 1]);
    expect(exp[0].cantidad).toBe(exp[1].cantidad);
  });

  it('se enciende y se apaga con una bandera', () => {
    const p = nuevaPartida('Prueba', 1, INICIO);
    expect(encendido(p, 'repartir_exp', DATOS)).toBe(false);
    p.objetos.repartir_exp = 1;
    expect(encendido(p, 'repartir_exp', DATOS)).toBe(true);
    p.banderas['repartir_exp:apagado'] = true;
    expect(encendido(p, 'repartir_exp', DATOS)).toBe(false);
  });
});

describe('objetos nuevos', () => {
  it('las piedras lunar y solar hacen evolucionar a Lobregón y a Aquilín', () => {
    expect(destinoConObjeto(criatura('lobo_adulto', 25), 'piedra_lunar', DATOS)).toBe('lobo_animas');
    expect(destinoConObjeto(criatura('aguila', 12), 'piedra_solar', DATOS)).toBe('aguila_imperial');
    expect(destinoConObjeto(criatura('lobo', 12), 'piedra_lunar', DATOS)).toBeNull();
  });

  it('el Elixir devuelve PP y no se usa si no hace falta', () => {
    const c = criatura('lobo', 20, ['aullido', 'zarpazo']);
    expect(motivoNoUsable(DATOS.objetos.elixir, c, DATOS)).not.toBeNull();
    c.movimientos[0].pp = 0;
    c.movimientos[1].pp = 25;
    aplicarCuracion(DATOS.objetos.elixir, c, DATOS);
    expect(c.movimientos.map((m) => m.pp)).toEqual([10, 30]);
    aplicarCuracion(DATOS.objetos.elixir_maximo, c, DATOS);
    expect(c.movimientos[0].pp).toBe(DATOS.movimientos.aullido.pp);
  });

  it('los potenciadores de tipo suben el daño de su tipo', () => {
    const golpe = (objeto?: string) => {
      const { estado } = combate([criatura('becerro_igneo', 30, ['rescoldo'], objeto)], [criatura('galapago', 30, ['caparazon'])], { semilla: 'carbon' });
      const r = resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, DATOS);
      const d = r.eventos.find((e) => e.tipo === 'danio' && e.lado === 'rival');
      return d?.tipo === 'danio' ? d.cantidad : 0;
    };
    expect(golpe('carbon')).toBeGreaterThan(golpe());
    expect(golpe('agua_mistica')).toBe(golpe());
  });

  it('la Garra rápida a veces deja actuar antes al más lento', () => {
    let primero = 0;
    for (let i = 0; i < 40; i++) {
      const { estado } = combate([criatura('galapago', 30, ['topetazo'], 'garra_rapida')], [criatura('aguila', 30, ['aletazo'])], { semilla: `g${i}` });
      const r = resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, DATOS);
      if (r.eventos.find((e) => e.tipo === 'usa')?.lado === 'jugador') primero++;
    }
    expect(primero).toBeGreaterThan(2);
    expect(primero).toBeLessThan(20);
  });

  it('la Bola humo siempre deja huir', () => {
    for (let i = 0; i < 10; i++) {
      const { estado } = combate([criatura('galapago', 5, ['topetazo'], 'bola_humo')], [criatura('aguila', 40, ['aletazo'])], { semilla: `h${i}` });
      expect(resolverTurno(estado, { tipo: 'huir' }, DATOS).estado.fin).toBe('huida');
    }
  });

  it('las bayas de estado curan veneno, ceguera y cólera, y la Aranja 10 de Vida', () => {
    const meloc = combate([criatura('lobo', 20, ['aullido'], 'baya_meloc')], [criatura('vibora', 25, ['ponzona'])], { semilla: 'meloc' });
    const r = resolverTurno(meloc.estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    if (de(r.eventos, 'estado').length > 0) {
      expect(r.estado.jugador.equipo[0].estado).toBeNull();
      expect(r.estado.jugador.equipo[0].objeto).toBeUndefined();
    }
    const perasi = combate([criatura('lobo', 20, ['aullido'], 'baya_perasi')], [criatura('trasgo', 25, ['tiniebla'])], { semilla: 'perasi' });
    const r2 = resolverTurno(perasi.estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    expect(de(r2.eventos, 'ciega')).toHaveLength(1);
    expect(de(r2.eventos, 'recuperaVista')).toHaveLength(1);
    expect(r2.estado.jugador.volatil.ceguera).toBe(0);
    let calmada = 0;
    for (let i = 0; i < 6; i++) {
      const caquic = combate([criatura('lobo', 20, ['aullido'], 'baya_caquic')], [criatura('tarantula', 25, ['desvario'])], { semilla: `caq${i}` });
      const r4 = resolverTurno(caquic.estado, { tipo: 'movimiento', indice: 0 }, DATOS);
      if (de(r4.eventos, 'estado').length > 0) {
        expect(r4.estado.jugador.equipo[0].estado).toBeNull();
        calmada++;
      }
    }
    expect(calmada).toBeGreaterThan(0);

    const herido = criatura('lobo', 20, ['aullido'], 'baya_aranja');
    herido.vida = 12;
    const { estado } = combate([herido], [criatura('topillo', 3, ['topetazo'])], { semilla: 'aranja' });
    const r3 = resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    expect(r3.eventos.some((e) => e.tipo === 'curacion' && e.lado === 'jugador' && e.cantidad === 10)).toBe(true);
  });

  it('la Tésera rápida captura mejor en el primer turno', () => {
    const capturas = (tesera: string) => {
      let n = 0;
      for (let i = 0; i < 60; i++) {
        const { estado } = combate([criatura('lobo', 20, ['aullido'])], [criatura('aguila', 20, ['aletazo'])], { objetos: { [tesera]: 1 }, semilla: `t${i}` });
        if (resolverTurno(estado, { tipo: 'objeto', objeto: tesera }, DATOS).estado.fin === 'captura') n++;
      }
      return n;
    };
    expect(capturas('tesera_rapida')).toBeGreaterThan(capturas('tesera') + 10);
    // La de red, contra una de Aire, también.
    expect(capturas('tesera_red')).toBeGreaterThan(capturas('tesera') + 5);
  });
});
