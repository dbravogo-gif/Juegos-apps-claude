// El guardado (F10): guardar y cargar da el mismo estado, el código exportado se importa igual y
// lo que no es un guardado válido no se carga.
import { describe, expect, it } from 'vitest';
import { deserializar, exportarCodigo, importarCodigo, reubicar, serializar, VERSION_GUARDADO, type Guardado } from '../src/core/guardado';
import { crearExploracion } from '../src/core/explorar';
import { construirMundo } from '../src/core/mundo';
import { crearCriatura } from '../src/core/criatura';
import { crearRng } from '../src/core/rng';
import { ISLA_1 } from '../src/data/isla1';
import { DATOS_COMBATE_PRUEBA } from '../src/data/combate-prueba';

function ejemplo(): Guardado {
  const rng = crearRng(3);
  const e = crearExploracion(construirMundo(ISLA_1));
  e.inicial = 'agua';
  e.recogidos.push('pocion-jable');
  return {
    version: VERSION_GUARDADO,
    explorar: e,
    equipo: [crearCriatura(DATOS_COMBATE_PRUEBA, 'inicial-agua', 7, rng, { mote: 'Ñoño' })],
    mochila: { pocion: 1, 'cubo-blanco': 3 },
    ultimoRefugio: 'refugio-geria',
    vencidos: ['entrenador-barrera'],
    rng,
  };
}

describe('guardado', () => {
  it('guardar y cargar da el mismo estado', () => {
    const g = ejemplo();
    expect(deserializar(serializar(g))).toEqual(g);
  });

  it('el código exportado se importa igual, también con eñes y tildes', () => {
    const g = ejemplo();
    const codigo = exportarCodigo(g);
    expect(codigo.startsWith('SSI1:')).toBe(true);
    expect(importarCodigo(`  ${codigo}\n`)).toEqual(g);
  });

  it('lo que no es un guardado válido no se carga', () => {
    expect(deserializar(null)).toBeNull();
    expect(deserializar('{roto')).toBeNull();
    expect(deserializar(JSON.stringify({ ...ejemplo(), version: 99 }))).toBeNull();
    expect(deserializar(JSON.stringify({ ...ejemplo(), equipo: 'nada' }))).toBeNull();
    expect(importarCodigo('hola')).toBeNull();
    expect(importarCodigo('SSI1:%%%')).toBeNull();
  });

  it('si una zona se mueve, la posición guardada se mueve con ella (también la de la puerta)', () => {
    const e = { ...crearExploracion(construirMundo(ISLA_1)), x: 50, y: 20, desdeX: 49, desdeY: 20, fuera: { x: 70, y: 30, zona: 'capital' } };
    const r = reubicar(e, { actual: { x: 40, y: 10 }, fuera: { x: 60, y: 25 } }, { actual: { x: 70, y: 12 }, fuera: { x: 90, y: 25 } });
    expect([r.x, r.desdeX, r.y, r.desdeY]).toEqual([80, 79, 22, 22]);
    expect(r.fuera).toEqual({ x: 100, y: 30, zona: 'capital' });
    // Sin tocar el original.
    expect(e.x).toBe(50);
  });
});
