import { describe, expect, it } from 'vitest';
import { crearRng } from '../src/core/rng';
import { crearCriatura } from '../src/core/criatura';
import { accionesDisponibles, iniciarCombate, resolverTurno, type EstadoCombate, type Evento } from '../src/core/combate';
import { aplicarCuracion, equipar, motivoNoUsable, quitarObjeto, usoDe } from '../src/core/objetos';
import { destinoConObjeto, evolucionar, subirNivel } from '../src/core/progreso';
import { nuevaPartida, pasoRepelente, repelida } from '../src/core/partida';
import { deserializar, serializar } from '../src/core/guardado';
import { vidaMaxima } from '../src/core/estadisticas';
import type { Criatura } from '../src/core/modelo';
import { DATOS } from '../src/data';
import { CATEGORIAS } from '../src/data/objetos';
import { INICIO } from '../src/data/mundo';

function criatura(especie: string, nivel: number, objeto?: string): Criatura {
  const c = crearCriatura(DATOS, especie, nivel, crearRng(especie), { valia: 8, temperamento: 'sosegado' });
  if (objeto) c.objeto = objeto;
  return c;
}

function combate(jugador: Criatura[], rival: Criatura[], objetos: Record<string, number> = {}, salvaje = true, semilla = 'objetos') {
  return iniciarCombate({ semilla, jugador: { nombre: 'Tú', equipo: jugador, objetos }, rival: { nombre: 'Rival', equipo: rival }, salvaje }, DATOS);
}

const eventos = (r: { eventos: Evento[] }, tipo: Evento['tipo']) => r.eventos.filter((e) => e.tipo === tipo);

describe('catálogo de objetos', () => {
  it('cada objeto tiene una categoría conocida y un icono', () => {
    const categorias = new Set(CATEGORIAS.map((c) => c.id));
    const iconos = Object.keys(import.meta.glob('../src/assets/objetos/*.png')).map((r) => r.split('/').pop());
    for (const o of Object.values(DATOS.objetos)) {
      expect(categorias.has(o.categoria), o.id).toBe(true);
      expect(iconos, `icono de ${o.id}`).toContain(`${o.id}.png`);
    }
  });

  it('cada objeto se puede usar de alguna forma (salvo los importantes)', () => {
    for (const o of Object.values(DATOS.objetos)) {
      const u = usoDe(o);
      if (o.tipo !== 'clave') expect(u.combate || u.fuera || u.equipable, o.id).toBe(true);
    }
  });

  it('la Tésera real es única: no se vende', () => {
    expect(DATOS.objetos.tesera_real.precio).toBeUndefined();
    expect(DATOS.objetos.turron.precio).toBeUndefined();
  });
});

describe('fuera del combate', () => {
  it('curan, quitan estados y reaniman', () => {
    const c = criatura('cangrejo', 10);
    const max = vidaMaxima(c, DATOS);
    c.vida = 5;
    expect(motivoNoUsable(DATOS.objetos.unguento, c, DATOS)).toBeNull();
    expect(aplicarCuracion(DATOS.objetos.unguento, c, DATOS)).toBe(20);
    aplicarCuracion(DATOS.objetos.balsamo_fierabras, c, DATOS);
    expect(c.vida).toBe(max);
    expect(motivoNoUsable(DATOS.objetos.unguento, c, DATOS)).toBe('Ya tiene la Vida al máximo');

    c.estado = { tipo: 'quemado' };
    expect(motivoNoUsable(DATOS.objetos.sales, c, DATOS)).toBe('No le hace falta');
    aplicarCuracion(DATOS.objetos.aloe, c, DATOS);
    expect(c.estado).toBeNull();

    c.vida = 0;
    expect(motivoNoUsable(DATOS.objetos.unguento, c, DATOS)).toBe('Está debilitada');
    aplicarCuracion(DATOS.objetos.aliento, c, DATOS);
    expect(c.vida).toBe(Math.floor(max / 2));
  });

  it('el Turrón sube exactamente un nivel', () => {
    const c = criatura('topillo', 7);
    const { criatura: r, subidas } = subirNivel(c, DATOS);
    expect(r.nivel).toBe(8);
    expect(subidas).toHaveLength(1);
  });

  it('el Gorro colorado hace evolucionar al duende y a nadie más', () => {
    const duende = criatura('duende', 5);
    expect(destinoConObjeto(duende, 'gorro_colorado', DATOS)).toBe('trasgo');
    expect(motivoNoUsable(DATOS.objetos.gorro_colorado, criatura('topillo', 5), DATOS)).toBe('No le hace nada');
    expect(evolucionar(duende, DATOS, 'trasgo').especie).toBe('trasgo');
  });

  it('equipar devuelve a la mochila el objeto anterior', () => {
    const p = nuevaPartida('X', 1, INICIO);
    const c = criatura('topillo', 5);
    p.equipo = [c];
    p.objetos = { higo: 1, tarro_miel: 1 };
    equipar(p, c, 'higo', DATOS);
    expect(c.objeto).toBe('higo');
    expect(p.objetos.higo).toBe(0);
    equipar(p, c, 'tarro_miel', DATOS);
    expect(p.objetos.higo).toBe(1);
    quitarObjeto(p, c);
    expect(c.objeto).toBeUndefined();
    expect(p.objetos.tarro_miel).toBe(1);
    expect(() => equipar(p, c, 'unguento', DATOS)).toThrow();
  });

  it('el repelente espanta a las criaturas de menos nivel y se agota', () => {
    const p = nuevaPartida('X', 1, INICIO);
    p.equipo = [criatura('cangrejo', 10)];
    p.repelente = 2;
    expect(repelida(p, criatura('topillo', 5))).toBe(true);
    expect(repelida(p, criatura('topillo', 12))).toBe(false);
    expect(pasoRepelente(p)).toBe(false);
    expect(pasoRepelente(p)).toBe(true);
    expect(repelida(p, criatura('topillo', 5))).toBe(false);
  });

  it('la mochila, lo equipado y el repelente se guardan y se recuperan', () => {
    const p = nuevaPartida('X', 1, INICIO);
    p.equipo = [criatura('cangrejo', 10, 'caracola')];
    p.objetos = { tesera: 3, turron: 2 };
    p.repelente = 40;
    expect(deserializar(serializar(p))).toEqual(p);
  });

  it('una partida de la versión 1 se abre con el repelente a cero', () => {
    const p = nuevaPartida('X', 1, INICIO) as unknown as Record<string, unknown>;
    delete p.repelente;
    p.version = 1;
    const leida = deserializar(JSON.stringify(p));
    expect(leida?.repelente).toBe(0);
    expect(leida?.version).toBe(2);
  });
});

describe('en combate', () => {
  it('la Tésera real captura siempre', () => {
    const r0 = combate([criatura('cangrejo', 10)], [criatura('trasgo', 30)], { tesera_real: 1 });
    const r = resolverTurno(r0.estado, { tipo: 'objeto', objeto: 'tesera_real' }, DATOS);
    expect(r.estado.fin).toBe('captura');
  });

  it('los objetos que no se usan en combate no salen en la mochila del combate', () => {
    const r0 = combate([criatura('cangrejo', 10)], [criatura('topillo', 3)], { ruda: 1, higo: 1, turron: 1, tesera: 1 });
    expect(Object.keys(accionesDisponibles(r0.estado, DATOS).objetos)).toEqual(['tesera']);
  });

  it('un Revivir reanima a una criatura debilitada del equipo', () => {
    const caida = criatura('topillo', 5);
    caida.vida = 0;
    const r0 = combate([criatura('cangrejo', 10), caida], [criatura('topillo', 3)], { aliento: 1 });
    expect(accionesDisponibles(r0.estado, DATOS).objetos.aliento).toBe(true);
    const r = resolverTurno(r0.estado, { tipo: 'objeto', objeto: 'aliento', objetivo: 1 }, DATOS);
    expect(r.estado.jugador.equipo[1].vida).toBeGreaterThan(0);
    expect(eventos(r, 'reanima')).toHaveLength(1);
  });

  it('un brebaje sube la etapa de la criatura activa', () => {
    const r0 = combate([criatura('cangrejo', 10)], [criatura('topillo', 3)], { brebaje_fuerza: 1 });
    const r = resolverTurno(r0.estado, { tipo: 'objeto', objeto: 'brebaje_fuerza' }, DATOS);
    expect(r.estado.jugador.etapas.fuerza).toBe(1);
  });

  it('los Restos curan al final del turno', () => {
    const c = criatura('cangrejo', 20, 'tarro_miel');
    c.vida = 10;
    const r0 = combate([c], [criatura('topillo', 2)]);
    const r = resolverTurno(r0.estado, { tipo: 'movimiento', indice: 1 }, DATOS);
    expect(eventos(r, 'objetoEquipado').some((e) => e.tipo === 'objetoEquipado' && e.efecto === 'cura' && e.lado === 'jugador')).toBe(true);
  });

  it('la Banda focus aguanta con 1 de Vida y se rompe', () => {
    const debil = criatura('topillo', 3, 'amuleto_tanit');
    const r0 = combate([criatura('becerro_igneo', 40)], [debil]);
    const r = resolverTurno(r0.estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    const rival = r.estado.rival.equipo[0];
    expect(eventos(r, 'objetoEquipado').some((e) => e.tipo === 'objetoEquipado' && e.efecto === 'aguanta')).toBe(true);
    expect(rival.objeto).toBeUndefined();
    expect(rival.vida === 1 || r.estado.fin === 'victoria' || rival.vida === 0).toBe(true);
  });

  it('la Baya Zidra se come al bajar de la mitad', () => {
    const c = criatura('cangrejo', 10, 'higo');
    const r0 = combate([c], [criatura('becerro_igneo', 14)], {}, true, 'higo');
    let e: EstadoCombate = r0.estado;
    let comido = false;
    for (let i = 0; i < 10 && !e.fin && !comido; i++) {
      const r = resolverTurno(e, { tipo: 'movimiento', indice: 3 }, DATOS);
      comido = eventos(r, 'objetoEquipado').some((x) => x.tipo === 'objetoEquipado' && x.efecto === 'come');
      e = r.estado;
    }
    expect(comido).toBe(true);
    expect(e.jugador.equipo[0].objeto).toBeUndefined();
  });

  it('el Huevo suerte da la mitad más de experiencia', () => {
    const conAzabache = combate([criatura('becerro_igneo', 30, 'azabache')], [criatura('topillo', 3)]);
    const sin = combate([criatura('becerro_igneo', 30)], [criatura('topillo', 3)]);
    const exp = (r0: ReturnType<typeof combate>) => {
      const r = resolverTurno(r0.estado, { tipo: 'movimiento', indice: 0 }, DATOS);
      const ev = eventos(r, 'experiencia')[0];
      return ev && ev.tipo === 'experiencia' ? ev.cantidad : 0;
    };
    expect(exp(conAzabache)).toBe(Math.floor(exp(sin) * 1.5));
  });

  it('lo equipado que se gasta en combate vuelve gastado a la partida', () => {
    const r0 = combate([criatura('topillo', 3, 'amuleto_tanit')], [criatura('becerro_igneo', 40)], {}, false);
    const r = resolverTurno(r0.estado, { tipo: 'movimiento', indice: 0 }, DATOS);
    expect(r.estado.jugador.equipo[0].objeto).toBeUndefined();
  });
});
