import { describe, expect, it } from 'vitest';
import { crearRng } from '../src/core/rng';
import { crearCriatura } from '../src/core/criatura';
import { formaANivel, inicialDe, inicialesRivales, nuevaPartida, prepararEntrenador } from '../src/core/partida';
import { DATOS } from '../src/data';
import { INICIALES } from '../src/data/especies';
import { ENTRENADORES, NOMBRES_RIVALES } from '../src/data/entrenadores';
import { INICIO, ZONAS } from '../src/data/mundo';
import { ASPECTOS } from '../src/data/aspectos';

describe('rivales', () => {
  it('el primero se queda con la inicial que gana a la tuya y el segundo, con la otra', () => {
    expect(inicialesRivales('becerro_igneo', INICIALES, DATOS)).toEqual({ a: 'cangrejo', b: 'retono_drago' });
    expect(inicialesRivales('cangrejo', INICIALES, DATOS)).toEqual({ a: 'retono_drago', b: 'becerro_igneo' });
    expect(inicialesRivales('retono_drago', INICIALES, DATOS)).toEqual({ a: 'becerro_igneo', b: 'cangrejo' });
  });

  it('su inicial evoluciona con el nivel', () => {
    expect(formaANivel('cangrejo', 12, DATOS)).toBe('cangrejo');
    expect(formaANivel('cangrejo', 20, DATOS)).toBe('necora');
    expect(formaANivel('cangrejo', 40, DATOS)).toBe('centollo');
  });

  it('en una partida antigua, la inicial se deduce del equipo', () => {
    const p = nuevaPartida('Antigua', 1, INICIO);
    p.equipo = [crearCriatura(DATOS, 'lobo', 10, crearRng(1)), crearCriatura(DATOS, 'novillo_embolado', 18, crearRng(2))];
    expect(inicialDe(p, INICIALES, DATOS)).toBe('becerro_igneo');
  });

  it('el rival lleva el nombre que le pusiste y su inicial al final del equipo', () => {
    const p = nuevaPartida('Daniel', 1, INICIO);
    p.inicial = 'becerro_igneo';
    p.rivales = { a: 'Lucía' };
    const def = prepararEntrenador(ENTRENADORES.rival_a_camino, p, DATOS, INICIALES, NOMBRES_RIVALES);
    expect(def.nombre).toBe('Lucía');
    expect(def.antes.join(' ')).toContain('Daniel');
    expect(def.antes.join(' ')).not.toContain('{');
    expect(def.equipo.at(-1)).toEqual({ especie: 'cangrejo', nivel: 12 });
    const b = prepararEntrenador(ENTRENADORES.rival_b_toledo, p, DATOS, INICIALES, NOMBRES_RIVALES);
    expect(b.nombre).toBe(NOMBRES_RIVALES.b);
    expect(b.equipo.at(-1)?.especie).toBe('retono_drago');
  });

  it('cada rival está en el mapa, visible tras elegir inicial y oculto al vencerle', () => {
    const rivales = Object.values(ENTRENADORES).filter((e) => e.rival);
    expect(rivales.length).toBeGreaterThanOrEqual(4);
    for (const r of rivales) {
      const pnj = Object.values(ZONAS).flatMap((z) => z.pnj).find((x) => x.entrenador === r.id);
      expect(pnj, r.id).toBeDefined();
      expect(pnj!.visibleSi).toBe('inicial');
      expect(pnj!.ocultoSi).toBe(`vencido:${r.id}`);
      expect(ASPECTOS).toContain(pnj!.aspecto);
    }
  });

  it('Isabel presenta a los dos rivales antes de dar por elegida la inicial', () => {
    const isabel = ZONAS.pabellon_real.pnj.find((x) => x.id === 'isabel')!;
    const pasos = JSON.stringify(isabel.guion);
    const a = pasos.indexOf('"conocerRival","rival":"a"');
    const b = pasos.indexOf('"conocerRival","rival":"b"');
    expect(a).toBeGreaterThan(0);
    expect(b).toBeGreaterThan(a);
    expect(pasos.indexOf('"nombre":"inicial"')).toBeGreaterThan(b);
  });
});
