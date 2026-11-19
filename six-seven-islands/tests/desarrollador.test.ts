// El modo desarrollador (autor, 2026-11-19): su código y su partida aparte.
import { describe, expect, it } from 'vitest';
import { claveGuardado, esCodigoDesarrollador, huella } from '../src/core/desarrollador';
import { crearCriatura, objetoUtil, usarObjeto } from '../src/core/criatura';
import { crearRng } from '../src/core/rng';
import { DATOS_COMBATE_PRUEBA as DATOS } from '../src/data/combate-prueba';

describe('modo desarrollador', () => {
  it('solo abre con el código del autor', () => {
    expect(esCodigoDesarrollador('25343027')).toBe(true);
    expect(esCodigoDesarrollador(' 25343027 ')).toBe(true);
    for (const otro of ['', '2534302', '253430270', '12345678', '25343028']) expect(esCodigoDesarrollador(otro), otro).toBe(false);
  });

  it('el código no va escrito en el código del juego, solo su huella', () => {
    const fuentes = import.meta.glob('../src/**/*.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
    for (const [ruta, texto] of Object.entries(fuentes)) expect(texto.includes('25343027'), ruta).toBe(false);
    expect(huella('25343027')).toBe(0x18aefd4f);
  });

  it('su partida va aparte de la normal', () => {
    expect(claveGuardado(true)).not.toBe(claveGuardado(false));
    expect(claveGuardado(false)).toBe('six-seven-islands:partida');
  });

  it('el almendrado sube un nivel', () => {
    const c = crearCriatura(DATOS, 'c031-1', 7, crearRng(3));
    expect(objetoUtil(c, 'almendrado', DATOS)).toBe(true);
    const r = usarObjeto(c, 'almendrado', DATOS);
    expect(r.nivel).toBe(8);
    expect(r.vida).toBeGreaterThan(c.vida);
  });
});
