// Los datos del sonido (2026-11-19): los temas cuadran, cada zona tiene su ambiente y ningún
// efecto apunta a otro que no existe. Que suene bien lo dice el autor: Claude no oye.
import { describe, expect, it } from 'vitest';
import { construirMundo } from '../src/core/mundo';
import { ISLA_1 } from '../src/data/isla1';
import { ISLA_2 } from '../src/data/isla2';
import { RANGOS, rangoDe } from '../src/core/rango';
import { AMBIENTE, EFECTOS, MUSICA, SONIDO_RANGO, sonidoDe } from '../src/sistemas/sonido/sonido';

describe('sonido', () => {
  it('cada tema cuadra: una melodía por paso, un acorde y un bajo por compás, y patrones de un compás', () => {
    for (const [nombre, m] of Object.entries(MUSICA)) {
      const pasos = m.compas * m.subdivision;
      expect(m.melodia.length, nombre).toBe(m.acordes.length * pasos);
      expect(m.bajos.length, nombre).toBe(m.acordes.length);
      expect(m.patronBajo.length, nombre).toBe(pasos);
      expect(m.patronPunteo.length, nombre).toBe(pasos);
      if (m.bateria) expect(m.bateria.length % pasos, nombre).toBe(0);
    }
  });

  it('cada zona de Lanzarote y Fuerteventura tiene su ambiente', () => {
    for (const isla of [ISLA_1, ISLA_2]) {
      for (const zona of construirMundo(isla).zonas.keys()) expect(AMBIENTE[zona], zona).toBeDefined();
    }
  });

  it('todos los efectos se oyen en un portátil: ninguna senoidal pura empieza por debajo de 200 Hz', () => {
    // El choque era una senoidal de 150 a 70 Hz y el autor no la oía (2026-11-25): los altavoces
    // pequeños apenas dan esos graves. Por debajo de 200 Hz, triángulo, cuadrada o ruido, que tienen
    // armónicos más agudos.
    for (const [nombre, d] of Object.entries(EFECTOS) as [string, { onda: string; desde: number }][]) {
      if (d.onda === 'sine') expect(d.desde, nombre).toBeGreaterThanOrEqual(200);
    }
  });

  it('los efectos que suenan con otro lo nombran bien, sin bucles, y ninguno es atronador', () => {
    for (const [nombre, d] of Object.entries(EFECTOS)) {
      for (const otro of conDe(nombre)) expect(Object.keys(EFECTOS), nombre).toContain(otro);
      expect(capas(nombre).length, nombre).toBeLessThan(12);
      expect(d.volumen, nombre).toBeLessThanOrEqual(0.35);
    }
  });

  it('el rango sale de la experiencia base de juego.py, y las legendarias tienen el suyo', async () => {
    // Si cambian los quintiles de juego.py, esta prueba avisa de que los umbrales ya no casan.
    const { readFileSync } = (await import('node:fs' as string)) as { readFileSync(ruta: string, cod: 'utf8'): string };
    const py = readFileSync('herramientas/criaturas/juego.py', 'utf8');
    const quintiles = [...py.matchAll(/'Q(\d)': \((\d+),/g)].map((m) => [Number(m[1]), Number(m[2])]);
    expect(quintiles).toHaveLength(5);
    for (const [q, exp] of quintiles) expect(rangoDe({ expBase: exp }), `Q${q}`).toBe(q);
    // Las iniciales: 60, 140 y 240 según la forma.
    expect([60, 140, 240].map((expBase) => rangoDe({ expBase }))).toEqual([1, 3, 4]);
    expect(rangoDe({ expBase: 250, legendaria: true })).toBe('leyenda');
    expect(sonidoDe('salida', 'no-existe')).toBe('salida1');
  });

  it('cuanto mejor la criatura, más capas suenan al aparecer y al salir; cada rango, el suyo', () => {
    for (const momento of ['encuentro', 'salida'] as const) {
      const efectos = RANGOS.map((r) => SONIDO_RANGO[momento][r]);
      expect(new Set(efectos).size, momento).toBe(RANGOS.length);
      const n = efectos.slice(0, 5).map((e) => capas(e).length);
      for (let i = 1; i < n.length; i++) expect(n[i], `${momento} ${i + 1}`).toBeGreaterThanOrEqual(n[i - 1]);
      expect(n[4], momento).toBeGreaterThan(n[0]);
      expect(capas(SONIDO_RANGO[momento].leyenda).length, momento).toBeGreaterThanOrEqual(3);
    }
  });
});

/** Los efectos que un efecto hace sonar a la vez (su `con`). */
function conDe(nombre: string): string[] {
  const con = (EFECTOS as Record<string, { con?: string | readonly string[] }>)[nombre]?.con;
  return typeof con === 'string' ? [con] : [...(con ?? [])];
}

/** El efecto y todo lo que suena con él, en cadena (falla si hay un bucle). */
function capas(nombre: string, camino: string[] = []): string[] {
  if (camino.includes(nombre)) throw new Error(`bucle: ${[...camino, nombre].join(' → ')}`);
  return [nombre, ...conDe(nombre).flatMap((o) => capas(o, [...camino, nombre]))];
}
