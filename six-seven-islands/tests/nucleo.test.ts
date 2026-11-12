import { describe, expect, it } from 'vitest';
import { CALIDAD_ZONA, factorLanzamiento, intentarCaptura, probabilidadCaptura, zonaBarra, type DatosCaptura } from '../src/core/captura';
import { crearCriatura, curarDelTodo, objetoUtil, usarObjeto } from '../src/core/criatura';
import { calcularDanio, type Combatiente } from '../src/core/danio';
import {
  PESOS_VALIA,
  VALIA_CASI_PERFECTA,
  ivDeValia,
  tirarValia,
  tirarValiaCasiPerfecta,
  vidaMaxima,
} from '../src/core/estadisticas';
import type { Criatura, Etapas } from '../src/core/modelo';
import { aplicarExperiencia, evolucionar, evolucionesPosibles, expParaNivel } from '../src/core/progreso';
import { crearRng } from '../src/core/rng';
import { eficacia } from '../src/core/tipos';
import { TEMPERAMENTOS } from '../src/data/temperamentos';
import { TABLA_TIPOS } from '../src/data/tipos';
import { TABLA_TIPOS as TABLA_LEYENDAS } from '../../leyendas-de-iberia/src/data/tipos';
import { DATOS_PRUEBA as D } from './utiles/datos-prueba';

const etapas0 = (): Etapas => ({ fuerza: 0, escudo: 0, magia: 0, resMagica: 0, celeridad: 0 });
const cr = (especie: string, nivel = 20, extra: Partial<Criatura> = {}): Criatura => ({
  ...crearCriatura(D, especie, nivel, crearRng(`${especie}-${nivel}`), { valia: 8, temperamento: 'equilibrado' }),
  ...extra,
});
const comb = (c: Criatura): Combatiente => ({ criatura: c, etapas: etapas0() });

describe('tipos', () => {
  type Rel = { eficaz: string[]; pocoEficaz: string[]; sinEfecto: string[] };
  const R = TABLA_TIPOS.relaciones as unknown as Record<string, Rel>;
  const ids = TABLA_TIPOS.tipos.map((t) => t.id as string);

  it('son 16: los de Leyendas sin Plasma ni Luz, más Bicho, Veneno y Roca (autor, 2026-11-08 y 11-10)', () => {
    const deLeyendas = TABLA_LEYENDAS.tipos.map((t) => t.id as string).filter((id) => id !== 'plasma' && id !== 'luz');
    expect([...ids].sort()).toEqual([...deLeyendas, 'bicho', 'veneno', 'roca'].sort());
    expect(Object.keys(R).sort()).toEqual([...ids].sort());
  });

  it('cada relación nombra tipos que existen y ninguna se contradice', () => {
    for (const id of ids) {
      const { eficaz, pocoEficaz, sinEfecto } = R[id];
      const todos = [...eficaz, ...pocoEficaz, ...sinEfecto];
      for (const d of todos) expect(ids, `${id} → ${d}`).toContain(d);
      expect(new Set(todos).size, id).toBe(todos.length);
    }
  });

  it('todo ataque tiene quien le resista, y ninguno está muy descompensado (salvo Común, que es neutro)', () => {
    for (const id of ids) {
      const contra = R[id].pocoEficaz.length + R[id].sinEfecto.length;
      expect(contra, `${id}: nadie le resiste`).toBeGreaterThanOrEqual(1);
      if (id !== 'comun') expect(Math.abs(R[id].eficaz.length - contra), id).toBeLessThanOrEqual(2);
    }
  });

  it('nadie tiene más de 4 debilidades ni más de 4 resistencias, y pocos llegan a 4 (autor, 2026-11-10)', () => {
    const debil = (d: string) => ids.filter((a) => R[a].eficaz.includes(d)).length;
    const resiste = (d: string) => ids.filter((a) => R[a].pocoEficaz.includes(d)).length;
    for (const d of ids) {
      expect(debil(d), `${d} débil`).toBeGreaterThanOrEqual(1);
      expect(debil(d), `${d} débil`).toBeLessThanOrEqual(4);
      expect(resiste(d), `${d} resiste`).toBeLessThanOrEqual(4);
    }
    expect(ids.filter((d) => debil(d) === 4).length, 'tipos con 4 debilidades').toBeLessThanOrEqual(3);
    expect(ids.filter((d) => resiste(d) === 4).length, 'tipos con 4 resistencias').toBeLessThanOrEqual(3);
  });

  it('las inmunidades son las decididas: las cuatro de la tabla C y la de Espectral a Común', () => {
    const inmunes = ids.flatMap((a) => R[a].sinEfecto.map((d) => `${a}→${d}`)).sort();
    expect(inmunes).toEqual(['comun→espectral', 'electrico→tierra', 'espectral→comun', 'tierra→aire', 'veneno→acero'].sort());
  });

  it('las iniciales Agua, Planta e Infernal forman un triángulo perfecto', () => {
    const e = (a: string, d: string) => eficacia(TABLA_TIPOS, a, [d]);
    expect([e('agua', 'infernal'), e('infernal', 'planta'), e('planta', 'agua')]).toEqual([2, 2, 2]);
    expect([e('infernal', 'agua'), e('planta', 'infernal'), e('agua', 'planta')]).toEqual([0.5, 0.5, 0.5]);
  });
});

describe('Valía y estadísticas', () => {
  it('casi perfecta es Valía 13 o más: IV del 90 % o más', () => {
    expect(ivDeValia(VALIA_CASI_PERFECTA) / 31).toBeGreaterThanOrEqual(0.9);
    expect(ivDeValia(VALIA_CASI_PERFECTA - 1) / 31).toBeLessThan(0.9);
  });

  it('la Valía normal sale de la campana: 13 o 14 en torno al 3,1 %', () => {
    const rng = crearRng('campana');
    const n = 40000;
    let altas = 0;
    for (let i = 0; i < n; i++) if (tirarValia(rng) >= VALIA_CASI_PERFECTA) altas++;
    const esperado = (PESOS_VALIA[12] + PESOS_VALIA[13]) / 96;
    expect(altas / n).toBeGreaterThan(esperado - 0.005);
    expect(altas / n).toBeLessThan(esperado + 0.005);
  });

  it('la casi perfecta siempre da 13 o 14, con unas dos de 13 por cada 14', () => {
    const rng = crearRng('perfectas');
    const tiradas = Array.from({ length: 6000 }, () => tirarValiaCasiPerfecta(rng));
    expect(tiradas.every((v) => v === 13 || v === 14)).toBe(true);
    const trece = tiradas.filter((v) => v === 13).length / tiradas.length;
    expect(trece).toBeGreaterThan(0.62);
    expect(trece).toBeLessThan(0.71);
  });
});

describe('temperamentos', () => {
  it('hay 25, con ids únicos y 5 neutros', () => {
    expect(TEMPERAMENTOS).toHaveLength(25);
    expect(new Set(TEMPERAMENTOS.map((t) => t.id)).size).toBe(25);
    expect(TEMPERAMENTOS.filter((t) => t.sube === t.baja)).toHaveLength(5);
  });

  it('ningún nombre coincide con las naturalezas de la saga de referencia (R8)', () => {
    const ajenos = ['fuerte', 'huraña', 'huraño', 'audaz', 'firme', 'pícara', 'pícaro', 'osada', 'osado', 'dócil', 'plácida', 'plácido',
      'agitada', 'agitado', 'floja', 'flojo', 'miedosa', 'miedoso', 'activa', 'activo', 'seria', 'serio', 'alegre', 'ingenua', 'ingenuo',
      'modesta', 'modesto', 'afable', 'mansa', 'manso', 'tímida', 'tímido', 'alocada', 'alocado', 'serena', 'sereno', 'amable',
      'grosera', 'grosero', 'cauta', 'cauto', 'rara', 'raro'];
    for (const t of TEMPERAMENTOS) expect(ajenos).not.toContain(t.nombre.toLowerCase());
  });
});

describe('daño', () => {
  it('el tipo eficaz hace el doble y la inmunidad nada', () => {
    const at = comb(cr('agua1'));
    const normal = calcularDanio(at, comb(cr('rama')), D.movimientos.chorro, D, false, 100);
    const eficaz = calcularDanio(at, comb(cr('infernal1')), D.movimientos.chorro, D, false, 100);
    expect(eficaz.eficacia).toBe(2);
    expect(eficaz.danio).toBeGreaterThan(normal.danio * 1.6);
    expect(calcularDanio(comb(cr('rama')), comb(cr('fantasma')), D.movimientos.golpe, D, false, 100)).toMatchObject({ danio: 0, eficacia: 0 });
  });

  it('afinidad, crítico, quemadura y el multiplicador extra cambian el daño como deben', () => {
    const def = comb(cr('rama'));
    const agua = comb(cr('agua1'));
    const sinAfinidad = calcularDanio(agua, def, D.movimientos.golpe, D, false, 100).danio;
    const quemado = calcularDanio(comb(cr('agua1', 20, { estado: { tipo: 'quemado' } })), def, D.movimientos.golpe, D, false, 100).danio;
    expect(quemado).toBeLessThanOrEqual(Math.ceil(sinAfinidad / 2));
    expect(calcularDanio(agua, def, D.movimientos.golpe, D, true, 100).danio).toBeGreaterThan(sinAfinidad);
    expect(calcularDanio(agua, def, D.movimientos.golpe, D, false, 100, 0.75).danio).toBeLessThan(sinAfinidad);
    expect(calcularDanio(agua, def, D.movimientos.rugido, D, false, 100).danio).toBe(0);
  });
});

describe('captura', () => {
  const base: DatosCaptura = { vida: 20, vidaMax: 60, ratio: 45, bonus: 1, estado: null, calidad: 0.5 };

  it('mejor lanzamiento, menos Vida o un estado alterado dan más probabilidad', () => {
    const p = probabilidadCaptura;
    expect(p({ ...base, calidad: 1 })).toBeGreaterThan(p({ ...base, calidad: 0 }));
    expect(p({ ...base, vida: 1 })).toBeGreaterThan(p({ ...base, vida: 60 }));
    expect(p({ ...base, estado: { tipo: 'dormido', turnos: 2 } })).toBeGreaterThan(p({ ...base, estado: { tipo: 'paralizado' } }));
    expect(p({ ...base, estado: { tipo: 'paralizado' } })).toBeGreaterThan(p(base));
  });

  it('el lanzamiento multiplica según la zona de la barra y tolera valores fuera de rango', () => {
    // Gris ×1, blanca ×1,5 y verde ×2,5 (DISENO.md); lo de fuera de rango cuenta como el extremo.
    expect([factorLanzamiento(0), factorLanzamiento(0.5), factorLanzamiento(1), factorLanzamiento(-3), factorLanzamiento(9), factorLanzamiento(NaN)]).toEqual([1, 1.5, 2.5, 1, 2.5, 1]);
  });

  it('la barra: verde pequeña en el centro, blanca alrededor y gris en los lados', () => {
    expect([zonaBarra(0.5), zonaBarra(0.53), zonaBarra(0.6), zonaBarra(0.36), zonaBarra(0.1), zonaBarra(0.95)]).toEqual(['verde', 'verde', 'blanca', 'blanca', 'gris', 'gris']);
    expect(factorLanzamiento(CALIDAD_ZONA.verde)).toBeGreaterThan(factorLanzamiento(CALIDAD_ZONA.blanca));
    expect(factorLanzamiento(CALIDAD_ZONA.blanca)).toBeGreaterThan(factorLanzamiento(CALIDAD_ZONA.gris));
  });

  it('la tasa observada coincide con la calculada', () => {
    const rng = crearRng('captura');
    const n = 20000;
    let exitos = 0;
    for (let i = 0; i < n; i++) if (intentarCaptura(base, rng).exito) exitos++;
    expect(Math.abs(exitos / n - probabilidadCaptura(base))).toBeLessThan(0.015);
  });
});

describe('criaturas y progreso', () => {
  it('con la misma semilla sale la misma criatura', () => {
    expect(crearCriatura(D, 'agua1', 10, crearRng(5))).toEqual(crearCriatura(D, 'agua1', 10, crearRng(5)));
  });

  it('la experiencia sube niveles, aprende movimientos y deja pendientes los que no caben', () => {
    const c = cr('agua1', 8);
    expect(c.movimientos.map((m) => m.id)).toEqual(['golpe', 'chorro', 'rugido']);
    const { criatura, subidas } = aplicarExperiencia(c, expParaNivel(12) - c.exp, D);
    expect(criatura.nivel).toBe(12);
    expect(subidas.map((s) => s.nivel)).toEqual([9, 10, 11, 12]);
    expect(criatura.movimientos.map((m) => m.id)).toEqual(['golpe', 'chorro', 'rugido', 'escudo']);
    expect(subidas[3].pendientes).toEqual(['onda']);
  });

  it('las evoluciones ramificadas ofrecen varias y conservan la Vida perdida', () => {
    const c = cr('rama', 20);
    expect(evolucionesPosibles(cr('rama', 19), D)).toEqual([]);
    expect(evolucionesPosibles(c, D).map((e) => e.a)).toEqual(['rama-agua', 'rama-planta']);
    const herida = { ...c, vida: c.vida - 10 };
    const evo = evolucionar(herida, 'rama-agua', D);
    expect(vidaMaxima(evo, D) - evo.vida).toBe(10);
    expect(() => evolucionar(c, 'agua2', D)).toThrow();
  });

  it('los objetos solo se usan cuando sirven', () => {
    const c = cr('agua1', 20);
    const max = vidaMaxima(c, D);
    expect(objetoUtil(c, 'pocion', D)).toBe(false);
    expect(usarObjeto({ ...c, vida: 5 }, 'pocion', D).vida).toBe(Math.min(max, 25));
    expect(usarObjeto({ ...c, estado: { tipo: 'intoxicado', turnos: 3 } }, 'antidoto', D).estado).toBeNull();
    expect(usarObjeto({ ...c, vida: 0 }, 'revivir', D).vida).toBe(Math.floor(max / 2));
    expect(objetoUtil(c, 'paquete', D)).toBe(false);
    expect(() => usarObjeto(c, 'revivir', D)).toThrow();
    expect(curarDelTodo({ ...c, vida: 1, estado: { tipo: 'quemado' } }, D)).toMatchObject({ vida: max, estado: null });
  });
});
