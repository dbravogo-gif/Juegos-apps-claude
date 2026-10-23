import { describe, expect, it } from 'vitest';
import { crearRng, entero, siguiente } from '../src/core/rng';
import { estadisticasDe, ivDeValia, multiplicadorEtapa, PESOS_VALIA, tirarValia } from '../src/core/estadisticas';
import { eficacia, multiplicadorTipo } from '../src/core/tipos';
import { calcularDanio } from '../src/core/danio';
import { intentarCaptura, probabilidadCaptura, valorCaptura } from '../src/core/captura';
import { aplicarExperiencia, evolucionar, evolucionPendiente, expParaNivel, movimientosIniciales } from '../src/core/progreso';
import { crearCriatura } from '../src/core/criatura';
import { etapasCero } from '../src/core/combate';
import type { Especie } from '../src/core/modelo';
import { DATOS } from '../src/data';

describe('generador con semilla', () => {
  it('repite la misma secuencia con la misma semilla', () => {
    const a = crearRng('reto-2026-10-20');
    const b = crearRng('reto-2026-10-20');
    const sa = Array.from({ length: 50 }, () => siguiente(a));
    const sb = Array.from({ length: 50 }, () => siguiente(b));
    expect(sa).toEqual(sb);
  });

  it('cambia con otra semilla y se puede guardar en JSON a mitad de secuencia', () => {
    const a = crearRng(1);
    const b = crearRng(2);
    expect(siguiente(a)).not.toEqual(siguiente(b));
    for (let i = 0; i < 10; i++) siguiente(a);
    const copia = JSON.parse(JSON.stringify(a));
    expect(siguiente(copia)).toEqual(siguiente(a));
  });

  it('los enteros quedan dentro del rango', () => {
    const r = crearRng(7);
    for (let i = 0; i < 2000; i++) {
      const n = entero(r, 85, 100);
      expect(n).toBeGreaterThanOrEqual(85);
      expect(n).toBeLessThanOrEqual(100);
    }
  });
});

describe('estadísticas', () => {
  const especie: Especie = {
    id: 'prueba',
    nombre: 'Prueba',
    tipos: ['comun'],
    base: { vida: 108, fuerza: 130, escudo: 95, magia: 80, resMagica: 85, celeridad: 102 },
    expBase: 1,
    ratioCaptura: 1,
    aprende: [],
    descripcion: '',
  };

  it('siguen las fórmulas de Pokémon', () => {
    // Base 108 de Vida y 130 de Fuerza, nivel 78, IV 31 (Valía 14), sin EV ni temperamento.
    const s = estadisticasDe(especie, 78, 14);
    expect(s.vida).toBe(Math.floor(((2 * 108 + 31) * 78) / 100) + 78 + 10);
    expect(s.fuerza).toBe(Math.floor(((2 * 130 + 31) * 78) / 100) + 5);
  });

  it('el temperamento sube un 10 % una estadística y baja otra', () => {
    const neutro = estadisticasDe(especie, 50, 7);
    const bruto = estadisticasDe(especie, 50, 7, { id: 'bruto', nombre: 'Bruto', sube: 'fuerza', baja: 'escudo' });
    expect(bruto.fuerza).toBe(Math.floor(neutro.fuerza * 1.1));
    expect(bruto.escudo).toBe(Math.floor(neutro.escudo * 0.9));
    expect(bruto.magia).toBe(neutro.magia);
  });

  it('la Valía va de un IV de 0 a uno de 31', () => {
    expect(ivDeValia(1)).toBe(0);
    expect(ivDeValia(14)).toBe(31);
    expect(ivDeValia(8)).toBeGreaterThan(ivDeValia(7));
  });

  it('la Valía sale con forma de campana', () => {
    expect(PESOS_VALIA).toHaveLength(14);
    const r = crearRng('valia');
    const cuenta = new Array(15).fill(0);
    for (let i = 0; i < 20000; i++) cuenta[tirarValia(r)] += 1;
    expect(cuenta[0]).toBe(0);
    expect(cuenta[7] + cuenta[8]).toBeGreaterThan(cuenta[1] + cuenta[14]);
    const normal = cuenta[6] + cuenta[7] + cuenta[8] + cuenta[9];
    expect(normal / 20000).toBeGreaterThan(0.45);
    expect(cuenta[14]).toBeGreaterThan(0);
  });

  it('las etapas multiplican como en Pokémon', () => {
    expect(multiplicadorEtapa(0)).toBe(1);
    expect(multiplicadorEtapa(1)).toBe(1.5);
    expect(multiplicadorEtapa(6)).toBe(4);
    expect(multiplicadorEtapa(-2)).toBe(0.5);
    expect(multiplicadorEtapa(-9)).toBe(0.25);
  });
});

describe('tabla de tipos', () => {
  const t = DATOS.tipos;
  it('eficaz, poco eficaz e inmune', () => {
    expect(multiplicadorTipo(t, 'agua', 'infernal')).toBe(2);
    expect(multiplicadorTipo(t, 'infernal', 'agua')).toBe(0.5);
    expect(multiplicadorTipo(t, 'tierra', 'aire')).toBe(0);
    expect(multiplicadorTipo(t, 'comun', 'espectral')).toBe(0);
    expect(multiplicadorTipo(t, 'espectral', 'espectral')).toBe(2);
    expect(multiplicadorTipo(t, 'comun', 'agua')).toBe(1);
    expect(multiplicadorTipo(t, '', 'agua')).toBe(1);
  });

  it('con dos tipos se multiplican', () => {
    expect(eficacia(t, 'electrico', ['agua', 'acero'])).toBe(4);
    expect(eficacia(t, 'infernal', ['planta', 'ancestral'])).toBe(2);
  });

  it('todos los tipos usados existen', () => {
    const ids = new Set(t.tipos.map((x) => x.id));
    for (const [a, d] of [...t.eficaces, ...t.inmunidades]) {
      expect(ids.has(a) && ids.has(d)).toBe(true);
    }
  });
});

describe('daño', () => {
  const rng = crearRng('danio');
  const toro = crearCriatura(DATOS, 'becerro_igneo', 20, rng, { valia: 8, temperamento: 'sosegado' });
  const drago = crearCriatura(DATOS, 'retono_drago', 20, rng, { valia: 8, temperamento: 'sosegado' });
  const cangrejo = crearCriatura(DATOS, 'cangrejo', 20, rng, { valia: 8, temperamento: 'sosegado' });
  const at = (c: typeof toro) => ({ criatura: c, etapas: etapasCero() });

  it('la eficacia y la afinidad cuentan', () => {
    const rescoldo = DATOS.movimientos.rescoldo;
    const contraDrago = calcularDanio(at(toro), at(drago), rescoldo, DATOS, false, 100);
    const contraCangrejo = calcularDanio(at(toro), at(cangrejo), rescoldo, DATOS, false, 100);
    expect(contraDrago.eficacia).toBe(2);
    expect(contraCangrejo.eficacia).toBe(0.5);
    expect(contraDrago.danio).toBeGreaterThan(contraCangrejo.danio * 3);
  });

  it('el crítico y la tirada suben o bajan el daño', () => {
    const m = DATOS.movimientos.topetazo;
    const normal = calcularDanio(at(toro), at(cangrejo), m, DATOS, false, 100).danio;
    const critico = calcularDanio(at(toro), at(cangrejo), m, DATOS, true, 100).danio;
    const flojo = calcularDanio(at(toro), at(cangrejo), m, DATOS, false, 85).danio;
    expect(critico).toBeGreaterThan(normal);
    expect(flojo).toBeLessThanOrEqual(normal);
  });

  it('la quemadura reduce a la mitad el daño físico', () => {
    const m = DATOS.movimientos.topetazo;
    const sano = calcularDanio(at(toro), at(cangrejo), m, DATOS, false, 100).danio;
    const quemado = calcularDanio(at({ ...toro, estado: { tipo: 'quemado' } }), at(cangrejo), m, DATOS, false, 100).danio;
    expect(quemado).toBe(Math.max(1, Math.floor(sano / 2)));
  });

  it('un ataque inmune no hace daño', () => {
    const topillo = crearCriatura(DATOS, 'topillo', 10, rng);
    const abejaruco = crearCriatura(DATOS, 'abejaruco', 10, rng);
    const r = calcularDanio(at(topillo), at(abejaruco), DATOS.movimientos.terronazo, DATOS, false, 100);
    expect(r).toEqual({ danio: 0, eficacia: 0, critico: false });
  });
});

describe('captura', () => {
  it('es más fácil con poca Vida y con estado alterado', () => {
    const base = { vida: 30, vidaMax: 30, ratio: 120, bonus: 1, estado: null };
    const tocado = { ...base, vida: 3 };
    const dormido = { ...tocado, estado: { tipo: 'dormido' as const, turnos: 2 } };
    expect(probabilidadCaptura(tocado)).toBeGreaterThan(probabilidadCaptura(base));
    expect(probabilidadCaptura(dormido)).toBeGreaterThan(probabilidadCaptura(tocado));
  });

  it('con ratio 255, poca Vida y un estado alterado es segura', () => {
    const d = { vida: 1, vidaMax: 30, ratio: 255, bonus: 1, estado: { tipo: 'quemado' as const } };
    expect(valorCaptura(d)).toBeGreaterThanOrEqual(255);
    expect(intentarCaptura(d, crearRng(1))).toEqual({ exito: true, sacudidas: 3 });
  });

  it('la tasa observada se parece a la calculada', () => {
    const d = { vida: 10, vidaMax: 40, ratio: 90, bonus: 1, estado: null };
    const r = crearRng('tasa');
    let exitos = 0;
    const n = 5000;
    for (let i = 0; i < n; i++) if (intentarCaptura(d, r).exito) exitos++;
    expect(Math.abs(exitos / n - probabilidadCaptura(d))).toBeLessThan(0.03);
  });
});

describe('progreso', () => {
  it('sube niveles, mantiene la Vida perdida y aprende movimientos', () => {
    const r = crearRng('exp');
    const c = crearCriatura(DATOS, 'becerro_igneo', 4, r);
    c.vida -= 3;
    const { criatura, subidas } = aplicarExperiencia(c, expParaNivel(6) - c.exp, DATOS);
    expect(criatura.nivel).toBe(6);
    expect(subidas.map((s) => s.nivel)).toEqual([5, 6]);
    expect(criatura.movimientos.map((m) => m.id)).toContain('rescoldo');
    const max = estadisticasDe(DATOS.especies.becerro_igneo, 6, criatura.valia, DATOS.temperamentos.find((t) => t.id === criatura.temperamento)).vida;
    expect(max - criatura.vida).toBe(3);
  });

  it('si ya sabe cuatro movimientos, el nuevo queda pendiente', () => {
    const r = crearRng('exp2');
    const c = crearCriatura(DATOS, 'becerro_igneo', 12, r);
    expect(c.movimientos).toHaveLength(4);
    const { subidas } = aplicarExperiencia(c, expParaNivel(13) - c.exp, DATOS);
    expect(subidas[0].pendientes).toEqual(['cornada_ardiente']);
  });

  it('evoluciona al nivel indicado', () => {
    const r = crearRng('evo');
    const c = crearCriatura(DATOS, 'cangrejo', 16, r);
    expect(evolucionPendiente(c, DATOS)).toBe('necora');
    const n = evolucionar(c, DATOS);
    expect(n.especie).toBe('necora');
    expect(n.vida).toBeGreaterThan(c.vida);
  });

  it('las criaturas salvajes llevan los cuatro últimos movimientos', () => {
    expect(movimientosIniciales(DATOS, 'becerro_igneo', 13)).toEqual(['bramido', 'rescoldo', 'acometida', 'cornada_ardiente']);
  });
});
