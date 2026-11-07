import { describe, expect, it } from 'vitest';
import type { BufferAttribute } from 'three';
import { contarPiezas, evolucionar } from '../src/core/aspecto';
import { ASPECTOS_PRUEBA, INICIAL_PLANTA, INICIAL_PLANTA_2 } from '../src/data/aspectos';
import { COLOR_CRIATURA, TIPOS } from '../src/data/tipos';
import { crearCriatura, liberarCriatura } from '../src/sistemas/criaturas/criaturas';
import { animar, empezar, DURACION } from '../src/sistemas/criaturas/animacion';
import { perfil } from '../src/sistemas/criaturas/piezas';

/** Presupuesto por criatura (ARCHITECTURE.md: criaturas y personaje ≤ 40 llamadas en móvil). */
const MAX_MALLAS = 7;
const MAX_TRIANGULOS = 7000;

function triangulos(c: ReturnType<typeof crearCriatura>): number {
  return Object.values(c.huesos).reduce((s, m) => s + (m!.geometry.index!.count / 3), 0);
}

describe('fichas de aspecto', () => {
  it('cada tipo tiene color de criatura y los ids son únicos', () => {
    for (const t of TIPOS) expect(COLOR_CRIATURA[t.id]).toBeTypeOf('number');
    const ids = ASPECTOS_PRUEBA.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('la evolución es de la misma especie: mismo tipo, cuerpo, patrón y colores', () => {
    const [base, evo] = [INICIAL_PLANTA, INICIAL_PLANTA_2];
    expect(evo.tipo).toBe(base.tipo);
    expect(evo.cuerpo.forma).toBe(base.cuerpo.forma);
    expect(evo.patron).toEqual(base.patron);
    expect(evo.secundario).toBe(base.secundario);
  });

  it('la evolución es más grande, más angulosa y con más piezas', () => {
    expect(INICIAL_PLANTA_2.escala).toBeGreaterThan(INICIAL_PLANTA.escala);
    expect(INICIAL_PLANTA_2.anguloso).toBeGreaterThan(INICIAL_PLANTA.anguloso);
    expect(contarPiezas(INICIAL_PLANTA_2)).toBeGreaterThan(contarPiezas(INICIAL_PLANTA));
  });

  it('una evolución que no crece se rechaza, y la base no se modifica', () => {
    const antes = JSON.stringify(INICIAL_PLANTA);
    expect(() => evolucionar(INICIAL_PLANTA, { id: 'x', crecer: 1, masAnguloso: 0 })).toThrow();
    evolucionar(INICIAL_PLANTA, { id: 'y', crecer: 1.2, masAnguloso: 0.9, piezas: { cuernos: { tamano: 0.2, color: 'hueso' } } });
    expect(JSON.stringify(INICIAL_PLANTA)).toBe(antes);
  });
});

describe('generador por piezas', () => {
  it('los perfiles de los cuatro cuerpos van de 0 a 1 y suben siempre', () => {
    for (const forma of ['esfera', 'capsula', 'pera', 'gota'] as const) {
      for (const anguloso of [0, 1]) {
        const p = perfil(forma, anguloso);
        expect(p[0].y).toBeCloseTo(0);
        expect(p[p.length - 1].y).toBeCloseTo(1);
        expect(Math.max(...p.map((q) => q.x))).toBeCloseTo(1);
        for (let i = 1; i < p.length; i++) expect(p[i].y).toBeGreaterThan(p[i - 1].y);
      }
    }
  });

  it.each(ASPECTOS_PRUEBA.map((a) => [a.id, a] as const))('%s: cabe en el presupuesto y no tiene NaN', (_id, a) => {
    const c = crearCriatura(a);
    expect(Object.keys(c.huesos).length).toBeLessThanOrEqual(MAX_MALLAS);
    expect(triangulos(c)).toBeLessThanOrEqual(MAX_TRIANGULOS);
    for (const m of Object.values(c.huesos)) {
      for (const nombre of ['position', 'normal', 'color', 'emision', 'patron', 'posPatron']) {
        const attr = m!.geometry.getAttribute(nombre) as BufferAttribute;
        expect(attr, `${m!.name}.${nombre}`).toBeDefined();
        expect(Array.from(attr.array).every(Number.isFinite), `${m!.name}.${nombre}`).toBe(true);
      }
    }
    // Una criatura base mide en torno a 1 unidad: ni diminuta ni gigante.
    expect(c.alto).toBeGreaterThan(0.6);
    expect(c.alto).toBeLessThan(2.4);
    liberarCriatura(c);
  });

  it('es determinista: la misma ficha da la misma geometría', () => {
    for (const a of ASPECTOS_PRUEBA) {
      const x = crearCriatura(a);
      const y = crearCriatura(a);
      for (const h of Object.keys(x.huesos) as (keyof typeof x.huesos)[]) {
        const px = x.huesos[h]!.geometry.getAttribute('position').array;
        const py = y.huesos[h]!.geometry.getAttribute('position').array;
        expect(Array.from(py)).toEqual(Array.from(px));
      }
    }
  });

  it('la evolución es más alta que su forma anterior', () => {
    expect(crearCriatura(INICIAL_PLANTA_2).alto).toBeGreaterThan(crearCriatura(INICIAL_PLANTA).alto * 1.2);
  });

  it('los ojos y la cara quedan delante y por encima del suelo', () => {
    for (const a of ASPECTOS_PRUEBA) {
      const c = crearCriatura(a);
      c.raiz.updateMatrixWorld(true);
      const ojos = c.huesos.ojos!;
      ojos.geometry.computeBoundingBox();
      const caja = ojos.geometry.boundingBox!.clone().applyMatrix4(ojos.matrixWorld);
      expect(caja.min.z, a.id).toBeGreaterThan(0);
      expect(caja.min.y, a.id).toBeGreaterThan(0.1);
    }
  });
});

describe('animación', () => {
  it('cada acción vuelve al reposo, salvo debilitarse, que se queda hasta revivir', () => {
    const c = crearCriatura(INICIAL_PLANTA);
    for (const accion of ['ataque', 'golpe'] as const) {
      empezar(c, accion);
      for (let t = 0; t < DURACION[accion] + 0.1; t += 1 / 60) animar(c, 1 / 60);
      expect(c.anim.accion).toBe('reposo');
    }
    empezar(c, 'debilitarse');
    for (let t = 0; t < 3; t += 1 / 60) animar(c, 1 / 60);
    expect(c.anim.accion).toBe('debilitarse');
    empezar(c, 'ataque');
    expect(c.anim.accion).toBe('debilitarse');
    empezar(c, 'reposo');
    animar(c, 1 / 60);
    expect(c.huesos.cuerpo!.rotation.z).toBeCloseTo(0);
  });

  it('el golpe enciende el destello y se apaga solo', () => {
    const c = crearCriatura(INICIAL_PLANTA);
    empezar(c, 'golpe');
    animar(c, 1 / 60);
    expect(c.material.ajustes.destello.value).toBeGreaterThan(0.5);
    expect(c.huesos.cuerpo!.position.z).toBeLessThan(0);
    for (let t = 0; t < 1; t += 1 / 60) animar(c, 1 / 60);
    expect(c.material.ajustes.destello.value).toBe(0);
  });

  it('respirar no mueve la base: la criatura sigue apoyada en el suelo', () => {
    const c = crearCriatura(INICIAL_PLANTA);
    for (let t = 0; t < 2; t += 1 / 60) {
      animar(c, 1 / 60);
      expect(c.huesos.cuerpo!.position.y).toBeCloseTo(0);
    }
  });
});
