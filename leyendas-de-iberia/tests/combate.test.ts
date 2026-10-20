import { describe, expect, it } from 'vitest';
import { crearRng } from '../src/core/rng';
import { crearCriatura } from '../src/core/criatura';
import { accionesDisponibles, iniciarCombate, resolverTurno, type Accion, type EstadoCombate } from '../src/core/combate';
import type { Criatura } from '../src/core/modelo';
import { DATOS } from '../src/data';

function criatura(especie: string, nivel: number, semilla = especie): Criatura {
  return crearCriatura(DATOS, especie, nivel, crearRng(semilla), { valia: 8, temperamento: 'sosegado' });
}

function salvaje(jugador: Criatura[], rival: Criatura, semilla = 'combate') {
  return iniciarCombate(
    {
      semilla,
      jugador: { nombre: 'Jugador', equipo: jugador, objetos: { tesera: 5, unguento: 2 } },
      rival: { nombre: 'Salvaje', equipo: [rival] },
      salvaje: true,
    },
    DATOS,
  );
}

/** Juega hasta el final eligiendo siempre la primera acción posible. */
function jugarHastaFin(estado: EstadoCombate, maxTurnos = 200): EstadoCombate {
  let e = estado;
  for (let i = 0; i < maxTurnos && !e.fin; i++) {
    let accion: Accion;
    if (e.pendiente === 'reemplazo') {
      accion = { tipo: 'reemplazo', indice: e.jugador.equipo.findIndex((c) => c.vida > 0) };
    } else {
      const disp = accionesDisponibles(e, DATOS);
      const indice = disp.movimientos.findIndex(Boolean);
      accion = { tipo: 'movimiento', indice };
    }
    e = resolverTurno(e, accion, DATOS).estado;
  }
  return e;
}

describe('combate', () => {
  it('empieza con las dos criaturas en el campo', () => {
    const { estado, eventos } = salvaje([criatura('retono_drago', 8)], criatura('topillo', 5));
    expect(estado.turno).toBe(1);
    expect(eventos.map((e) => e.tipo)).toEqual(['entrada', 'entrada']);
  });

  it('es determinista: misma semilla y mismas acciones, mismo resultado', () => {
    const a = jugarHastaFin(salvaje([criatura('becerro_igneo', 10)], criatura('barbo', 10), 'x').estado);
    const b = jugarHastaFin(salvaje([criatura('becerro_igneo', 10)], criatura('barbo', 10), 'x').estado);
    expect(a).toEqual(b);
    expect(a.fin).not.toBeNull();
  });

  it('el estado se puede guardar en JSON y seguir igual', () => {
    const { estado } = salvaje([criatura('cangrejo', 10)], criatura('abejaruco', 9), 'json');
    const t1 = resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, DATOS).estado;
    const copia = JSON.parse(JSON.stringify(t1)) as EstadoCombate;
    const a = resolverTurno(t1, { tipo: 'movimiento', indice: 0 }, DATOS);
    const b = resolverTurno(copia, { tipo: 'movimiento', indice: 0 }, DATOS);
    expect(b).toEqual(a);
  });

  it('no modifica el estado que recibe', () => {
    const { estado } = salvaje([criatura('cangrejo', 10)], criatura('abejaruco', 9));
    const antes = JSON.stringify(estado);
    resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    expect(JSON.stringify(estado)).toBe(antes);
  });

  it('gana el más fuerte y da experiencia', () => {
    const fuerte = criatura('drago_milenario', 50);
    const { estado } = salvaje([fuerte], criatura('topillo', 3));
    const r = resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    expect(r.estado.fin).toBe('victoria');
    expect(r.eventos.some((e) => e.tipo === 'experiencia')).toBe(true);
    expect(r.estado.jugador.equipo[0].exp).toBeGreaterThan(fuerte.exp);
  });

  it('gasta PP y, sin PP, usa el Arrebato con retroceso', () => {
    const c = criatura('topillo', 30);
    c.movimientos = c.movimientos.map((m) => ({ ...m, pp: 0 }));
    const { estado } = salvaje([c], criatura('galapago', 30));
    expect(accionesDisponibles(estado, DATOS).sinPP).toBe(true);
    const r = resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    expect(r.eventos.some((e) => e.tipo === 'sinPP' && e.lado === 'jugador')).toBe(true);
    expect(r.eventos.some((e) => e.tipo === 'danio' && e.causa === 'retroceso')).toBe(true);
  });

  it('no deja usar un movimiento sin PP si quedan otros', () => {
    const c = criatura('topillo', 10);
    c.movimientos[0].pp = 0;
    const { estado } = salvaje([c], criatura('barbo', 10));
    expect(() => resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, DATOS)).toThrow();
  });

  it('la tésera puede capturar y termina el combate', () => {
    // Galápago muy tocado y dormido: con varias semillas alguna captura tiene que salir.
    let capturas = 0;
    for (let s = 0; s < 20; s++) {
      const presa = criatura('galapago', 5);
      presa.vida = 1;
      presa.estado = { tipo: 'dormido', turnos: 3 };
      const { estado } = salvaje([criatura('drago', 20)], presa, `captura-${s}`);
      const r = resolverTurno(estado, { tipo: 'objeto', objeto: 'tesera' }, DATOS);
      expect(r.estado.jugador.objetos.tesera).toBe(4);
      if (r.estado.fin === 'captura') {
        capturas++;
        expect(r.estado.capturada?.especie).toBe('galapago');
      }
    }
    expect(capturas).toBeGreaterThan(10);
  });

  it('no se puede capturar ni huir contra un entrenador', () => {
    const { estado } = iniciarCombate(
      {
        semilla: 'entrenador',
        jugador: { nombre: 'Jugador', equipo: [criatura('cangrejo', 10)], objetos: { tesera: 3 } },
        rival: { nombre: 'Ballestero', equipo: [criatura('topillo', 8)] },
        salvaje: false,
      },
      DATOS,
    );
    expect(() => resolverTurno(estado, { tipo: 'objeto', objeto: 'tesera' }, DATOS)).toThrow();
    expect(() => resolverTurno(estado, { tipo: 'huir' }, DATOS)).toThrow();
    expect(accionesDisponibles(estado, DATOS).huir).toBe(false);
  });

  it('el entrenador saca a la siguiente y el jugador elige reemplazo', () => {
    const debil = criatura('topillo', 2);
    const reserva = criatura('drago_milenario', 60);
    const { estado } = iniciarCombate(
      {
        semilla: 'equipos',
        jugador: { nombre: 'Jugador', equipo: [debil, reserva] },
        rival: { nombre: 'Rival', equipo: [criatura('trasgo', 40), criatura('barbo', 5)] },
        salvaje: false,
      },
      DATOS,
    );
    const r = resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    expect(r.estado.pendiente).toBe('reemplazo');
    expect(() => resolverTurno(r.estado, { tipo: 'movimiento', indice: 0 }, DATOS)).toThrow();
    const r2 = resolverTurno(r.estado, { tipo: 'reemplazo', indice: 1 }, DATOS);
    expect(r2.estado.pendiente).toBeNull();
    expect(r2.estado.jugador.activo).toBe(1);
    const fin = jugarHastaFin(r2.estado);
    expect(fin.fin).toBe('victoria');
  });

  it('el ungüento cura y gasta el objeto', () => {
    const c = criatura('cangrejo', 10);
    c.vida = 5;
    const { estado } = salvaje([c], criatura('libelula', 3));
    const r = resolverTurno(estado, { tipo: 'objeto', objeto: 'unguento' }, DATOS);
    const cura = r.eventos.find((e) => e.tipo === 'curacion');
    expect(cura && cura.tipo === 'curacion' && cura.cantidad).toBe(20);
    expect(r.estado.jugador.objetos.unguento).toBe(1);
  });

  it('huir siempre funciona si eres más rápido', () => {
    const { estado } = salvaje([criatura('abejaruco', 30)], criatura('galapago', 5));
    const r = resolverTurno(estado, { tipo: 'huir' }, DATOS);
    expect(r.estado.fin).toBe('huida');
  });

  it('el sueño impide actuar y luego se despierta', () => {
    const dormilon = criatura('barbo', 10);
    dormilon.estado = { tipo: 'dormido', turnos: 1 };
    const { estado } = salvaje([dormilon], criatura('libelula', 2), 'sueno');
    const t1 = resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    expect(t1.eventos.some((e) => e.tipo === 'sigueDormido' && e.lado === 'jugador')).toBe(true);
    const t2 = resolverTurno(t1.estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    expect(t2.eventos.some((e) => e.tipo === 'despierta' && e.lado === 'jugador')).toBe(true);
  });

  it('la quemadura resta Vida al final del turno', () => {
    const quemado = criatura('barbo', 20);
    quemado.estado = { tipo: 'quemado' };
    const { estado } = salvaje([quemado], criatura('galapago', 20), 'quemado');
    const r = resolverTurno(estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    expect(r.eventos.some((e) => e.tipo === 'danio' && e.causa === 'quemadura' && e.lado === 'jugador')).toBe(true);
  });
});
