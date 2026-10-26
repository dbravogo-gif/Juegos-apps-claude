import { describe, expect, it } from 'vitest';
import { crearRng } from '../src/core/rng';
import { crearCriatura } from '../src/core/criatura';
import { iniciarCombate, resolverTurno, type Evento } from '../src/core/combate';
import { probabilidadCaptura } from '../src/core/captura';
import type { Criatura, DatosJuego, Movimiento } from '../src/core/modelo';
import { DATOS } from '../src/data';

function criatura(especie: string, nivel: number, movimientos: string[], datos: DatosJuego = DATOS): Criatura {
  const c = crearCriatura(datos, especie, nivel, crearRng(especie), { valia: 8, temperamento: 'sosegado' });
  c.movimientos = movimientos.map((id) => ({ id, pp: datos.movimientos[id].pp }));
  return c;
}

function combate(jugador: Criatura, rival: Criatura, semilla = 'estados', datos: DatosJuego = DATOS, salvaje = true) {
  return iniciarCombate(
    { semilla, jugador: { nombre: 'Jugador', equipo: [jugador] }, rival: { nombre: 'Rival', equipo: [rival] }, salvaje },
    datos,
  );
}

/** Los datos del juego con la pasiva de una especie cambiada. */
function conPasiva(especie: string, pasiva: string): DatosJuego {
  return { ...DATOS, especies: { ...DATOS.especies, [especie]: { ...DATOS.especies[especie], pasiva } } };
}

function conMovimiento(mov: Movimiento): DatosJuego {
  return { ...DATOS, movimientos: { ...DATOS.movimientos, [mov.id]: mov } };
}

const hay = (ev: Evento[], tipo: Evento['tipo'], lado?: 'jugador' | 'rival') =>
  ev.some((e) => e.tipo === tipo && (!lado || !('lado' in e) || e.lado === lado));

describe('estados alterados', () => {
  it('la parálisis a veces impide moverse y baja la Celeridad', () => {
    let quieta = 0;
    for (let i = 0; i < 40; i++) {
      const j = criatura('lobo', 20, ['aullido']);
      j.estado = { tipo: 'paralizado' };
      const { estado } = combate(j, criatura('galapago', 20, ['caparazon']), `par${i}`);
      const r = resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, DATOS);
      if (hay(r.eventos, 'noSeMueve', 'jugador')) quieta++;
    }
    expect(quieta).toBeGreaterThan(3);
    expect(quieta).toBeLessThan(20);
  });

  it('el veneno quita 1/8 y la intoxicación cada vez más', () => {
    const j = criatura('lobo', 30, ['aullido']);
    j.estado = { tipo: 'envenenado' };
    const { estado } = combate(j, criatura('galapago', 5, ['caparazon']));
    const r = resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    const d = r.eventos.find((e) => e.tipo === 'danio' && e.causa === 'veneno');
    expect(d && d.tipo === 'danio' && d.cantidad).toBe(Math.floor(d && d.tipo === 'danio' ? d.vidaMax / 8 : 0));

    const t = criatura('lobo', 30, ['aullido']);
    t.estado = { tipo: 'intoxicado', turnos: 1 };
    let e = combate(t, criatura('galapago', 5, ['caparazon'])).estado;
    const danios: number[] = [];
    for (let i = 0; i < 3; i++) {
      const r2 = resolverTurno(e, { tipo: 'movimiento', indice: 0 }, DATOS);
      const x = r2.eventos.find((ev) => ev.tipo === 'danio' && ev.causa === 'veneno');
      if (x?.tipo === 'danio') danios.push(x.cantidad);
      e = r2.estado;
    }
    expect(danios.length).toBe(3);
    expect(danios[1]).toBeGreaterThan(danios[0]);
    expect(danios[2]).toBeGreaterThan(danios[1]);
  });

  it('el fuego no se quema y el acero no se envenena', () => {
    const tizne = combate(criatura('lobo', 20, ['tizne']), criatura('becerro_igneo', 20, ['bramido']));
    const r = resolverTurno(tizne.estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    expect(r.estado.rival.equipo[0].estado).toBeNull();
    const ponzona = combate(criatura('vibora', 30, ['ponzona']), criatura('escarabajo_bronce', 30, ['desplante']));
    const r2 = resolverTurno(ponzona.estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    expect(r2.estado.rival.equipo[0].estado).toBeNull();
    expect(hay(r2.eventos, 'sinEfecto', 'rival')).toBe(true);
  });

  it('capturar es más fácil con cualquier estado', () => {
    const base = { vida: 20, vidaMax: 40, ratio: 120, bonus: 1, estado: null };
    const sin = probabilidadCaptura(base);
    expect(probabilidadCaptura({ ...base, estado: { tipo: 'paralizado' } })).toBeGreaterThan(sin);
    expect(probabilidadCaptura({ ...base, estado: { tipo: 'envenenado' } })).toBeGreaterThan(sin);
    expect(probabilidadCaptura({ ...base, estado: { tipo: 'dormido', turnos: 2 } })).toBeGreaterThan(
      probabilidadCaptura({ ...base, estado: { tipo: 'intoxicado', turnos: 1 } }),
    );
  });
});

describe('confusión, retroceso, drenadoras y Rodela', () => {
  it('Desvarío confunde y la confusión se pasa', () => {
    const { estado } = combate(criatura('tarantula', 20, ['desvario']), criatura('galapago', 20, ['caparazon']), 'conf');
    const r = resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    expect(hay(r.eventos, 'confunde', 'rival')).toBe(true);
    expect(r.estado.rival.volatil.confusion).toBeGreaterThanOrEqual(1);
    let e = r.estado;
    const vistos: Evento[] = [];
    for (let i = 0; i < 6 && !e.fin; i++) {
      const t = resolverTurno(e, { tipo: 'movimiento', indice: 0 }, DATOS);
      vistos.push(...t.eventos);
      e = t.estado;
    }
    expect(hay(vistos, 'finConfusion', 'rival')).toBe(true);
  });

  it('el retroceso solo funciona si ataca primero', () => {
    const golpe: Movimiento = { id: 'golpe_seco', nombre: 'Golpe seco', tipo: 'comun', categoria: 'fisico', poder: 10, precision: null, pp: 30, efectos: [{ tipo: 'retroceso', prob: 100 }] };
    const datos = conMovimiento(golpe);
    // El águila (rápida) hace retroceder al galápago (lento).
    const rapido = combate(criatura('aguila', 30, ['golpe_seco'], datos), criatura('galapago', 30, ['topetazo'], datos), 'r1', datos);
    const r = resolverTurno(rapido.estado, { tipo: 'movimiento', indice: 0 }, datos);
    expect(hay(r.eventos, 'retrocede', 'rival')).toBe(true);
    // Al revés, el galápago ya ha atacado cuando le llega el golpe.
    const lento = combate(criatura('galapago', 30, ['golpe_seco'], datos), criatura('aguila', 30, ['aletazo'], datos), 'r2', datos);
    const r2 = resolverTurno(lento.estado, { tipo: 'movimiento', indice: 0 }, datos);
    expect(hay(r2.eventos, 'retrocede')).toBe(false);
  });

  it('Muérdago roba Vida cada turno y no afecta a las de tipo Planta', () => {
    const j = criatura('mandragora', 25, ['muerdago']);
    j.vida -= 20;
    const { estado } = combate(j, criatura('lobo', 25, ['aullido']), 'muer');
    const r = resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    expect(hay(r.eventos, 'siembra', 'rival')).toBe(true);
    expect(r.eventos.some((e) => e.tipo === 'danio' && e.causa === 'drenadoras' && e.lado === 'rival')).toBe(true);
    expect(r.eventos.some((e) => e.tipo === 'curacion' && e.lado === 'jugador' && e.cantidad > 0)).toBe(true);

    const planta = combate(criatura('mandragora', 25, ['muerdago']), criatura('retono_drago', 25, ['varazo']), 'muer2');
    const r2 = resolverTurno(planta.estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    expect(r2.estado.rival.volatil.drenadoras).toBe(false);
  });

  it('Rodela para el ataque, falla si actúa la última y cuesta repetirla', () => {
    const j = criatura('galapago', 30, ['rodela']);
    const { estado } = combate(j, criatura('lobo', 30, ['zarpazo']), 'rodela');
    const r = resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    expect(hay(r.eventos, 'protege', 'jugador')).toBe(true);
    expect(hay(r.eventos, 'protegido', 'jugador')).toBe(true);
    expect(r.estado.jugador.equipo[0].vida).toBe(j.vida);
    expect(r.estado.jugador.volatil.protegido).toBe(false);

    // Si la usa el rival después de que el jugador ya ha actuado (con un objeto), falla.
    const herida = criatura('aguila', 30, ['aletazo']);
    herida.vida -= 10;
    const t = iniciarCombate(
      { semilla: 'rodela2', jugador: { nombre: 'Jugador', equipo: [herida], objetos: { unguento: 1 } }, rival: { nombre: 'Rival', equipo: [criatura('galapago', 30, ['rodela'])] }, salvaje: true },
      DATOS,
    );
    const r2 = resolverTurno(t.estado, { tipo: 'objeto', objeto: 'unguento' }, DATOS);
    expect(r2.eventos.some((e) => e.tipo === 'falla' && e.lado === 'rival')).toBe(true);

    // Seguidas, alguna falla.
    let fallos = 0;
    for (let i = 0; i < 20; i++) {
      let e = combate(criatura('galapago', 30, ['rodela']), criatura('lobo', 30, ['aullido']), `rr${i}`).estado;
      e = resolverTurno(e, { tipo: 'movimiento', indice: 0 }, DATOS).estado;
      const r3 = resolverTurno(e, { tipo: 'movimiento', indice: 0 }, DATOS);
      if (r3.eventos.some((x) => x.tipo === 'falla' && x.lado === 'jugador')) fallos++;
    }
    expect(fallos).toBeGreaterThan(3);
    expect(fallos).toBeLessThan(17);
  });
});

describe('pasivas', () => {
  it('todas las especies tienen una pasiva que existe', () => {
    for (const e of Object.values(DATOS.especies)) {
      expect(e.pasiva, e.id).toBeDefined();
      expect(DATOS.pasivas[e.pasiva!], `${e.id}: ${e.pasiva}`).toBeDefined();
    }
    expect(Object.keys(DATOS.pasivas).length).toBe(50);
    for (const p of Object.values(DATOS.pasivas)) {
      if (p.efecto.tipo === 'rebuscar') for (const o of p.efecto.objetos) expect(DATOS.objetos[o.objeto], o.objeto).toBeDefined();
    }
  });

  it('Mirada torva baja la Fuerza del rival al salir, salvo con Pétreo', () => {
    const { estado, eventos } = combate(criatura('galapago', 20, ['caparazon']), criatura('lobo', 20, ['aullido']));
    expect(hay(eventos, 'pasiva', 'rival')).toBe(true);
    expect(estado.jugador.etapas.fuerza).toBe(-1);
    const piedra = combate(criatura('leon_fuente', 20, ['caparazon']), criatura('lobo', 20, ['aullido']));
    expect(piedra.estado.jugador.etapas.fuerza).toBe(0);
    expect(hay(piedra.eventos, 'etapaProtegida', 'jugador')).toBe(true);
  });

  it('Esponja: el agua le cura en vez de hacerle daño', () => {
    const barbo = criatura('barbo', 20, ['rociada']);
    barbo.vida -= 15;
    const { estado } = combate(criatura('cangrejo', 20, ['rociada']), barbo, 'esp');
    const r = resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    expect(r.eventos.some((e) => e.tipo === 'danio' && e.lado === 'rival' && e.causa === 'ataque')).toBe(false);
    expect(r.estado.rival.equipo[0].vida).toBeGreaterThan(barbo.vida);
  });

  it('Firme: con la Vida llena aguanta con 1', () => {
    const datos = conPasiva('topillo', 'firme');
    const { estado } = combate(criatura('drago_milenario', 60, ['ira_ancestral'], datos), criatura('topillo', 2, ['topetazo'], datos), 'firme', datos);
    const r = resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, datos);
    expect(hay(r.eventos, 'aguanta', 'rival')).toBe(true);
    expect(r.estado.rival.equipo[0].vida).toBe(1);
  });

  it('Escurridizo siempre huye', () => {
    for (let i = 0; i < 10; i++) {
      const { estado } = combate(criatura('topillo', 2, ['topetazo']), criatura('aguila_imperial', 50, ['picada']), `h${i}`);
      expect(resolverTurno(estado, { tipo: 'huir' }, DATOS).estado.fin).toBe('huida');
    }
  });

  it('Púas venenosas pueden envenenar a quien golpea', () => {
    let envenenados = 0;
    for (let i = 0; i < 30; i++) {
      const { estado } = combate(criatura('lobo', 20, ['zarpazo']), criatura('vibora', 20, ['desplante']), `p${i}`);
      const r = resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, DATOS);
      if (r.estado.jugador.equipo[0].estado?.tipo === 'envenenado') envenenados++;
    }
    expect(envenenados).toBeGreaterThan(2);
    expect(envenenados).toBeLessThan(20);
  });

  it('Rebuscar encuentra objetos al ganar', () => {
    const base = DATOS.pasivas.rebuscar;
    const datos: DatosJuego = {
      ...DATOS,
      pasivas: { ...DATOS.pasivas, rebuscar: { ...base, efecto: { tipo: 'rebuscar', prob: 100, objetos: [{ objeto: 'unguento', peso: 1 }] } } },
    };
    const { estado } = combate(criatura('duende', 40, ['trastada'], datos), criatura('topillo', 2, ['topetazo'], datos), 'reb', datos);
    const r = resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, datos);
    expect(r.estado.fin).toBe('victoria');
    const i = r.eventos.findIndex((e) => e.tipo === 'rebusca');
    expect(i).toBeGreaterThanOrEqual(0);
    expect(i).toBeLessThan(r.eventos.findIndex((e) => e.tipo === 'fin'));
    expect(r.estado.jugador.objetos.unguento).toBe(1);
  });

  it('Coraza y Sebo reducen el daño', () => {
    const ataque = (datos: DatosJuego) => {
      const { estado } = combate(criatura('becerro_igneo', 30, ['rescoldo'], datos), criatura('avutarda', 30, ['bramido'], datos), 'sebo', datos);
      const r = resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, datos);
      const d = r.eventos.find((e) => e.tipo === 'danio' && e.lado === 'rival');
      return d?.tipo === 'danio' ? d.cantidad : 0;
    };
    // La avutarda tiene Sebo: el mismo golpe le hace la mitad que sin él.
    expect(ataque(DATOS)).toBeLessThan(ataque(conPasiva('avutarda', 'duermevela')) * 0.6);
  });
});
