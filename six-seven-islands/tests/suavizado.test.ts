// Correr fluido (autor, 2026-11-13): con fotogramas de duración irregular, el jugador dibujado
// avanza a velocidad constante, sin congelarse ni saltar al cambiar de casilla.
import { describe, expect, it } from 'vitest';
import { avanzar, crearExploracion, posicionVisual, PASOS_POR_CASILLA } from '../src/core/explorar';
import { construirMundo } from '../src/core/mundo';
import { Suavizado } from '../src/sistemas/personaje/suavizado';

const PASO_FIJO = 1 / 60;
const m = construirMundo({ id: 'prueba', zonas: [{ id: 'pasillo', nombre: 'Pasillo', origen: { x: 0, y: 0 }, mapa: [','.repeat(60)], hierbaObligatoria: false, personajes: [] }], inicio: { zona: 'pasillo', x: 0, y: 0 } });

/** Simula el bucle del juego andando al este y devuelve, por fotograma, el tiempo y la x dibujada. */
function simular(dibujar: (e: ReturnType<typeof crearExploracion>, s: Suavizado, alfa: number) => number): { t: number; x: number }[] {
  const e = crearExploracion(m);
  const s = new Suavizado();
  s.paso({ x: e.x, y: 0, z: e.y });
  let acumulado = 0;
  let t = 0;
  let semilla = 7;
  const res: { t: number; x: number }[] = [];
  for (let f = 0; f < 400; f++) {
    // Fotogramas de 7 a 23 ms, al azar pero siempre igual.
    semilla = (semilla * 1103515245 + 12345) % 2147483648;
    const dt = 0.007 + (semilla / 2147483648) * 0.016;
    acumulado += dt;
    t += dt;
    while (acumulado >= PASO_FIJO) {
      acumulado -= PASO_FIJO;
      avanzar(m, e, 'e');
      const p = posicionVisual(e, 0);
      s.paso({ x: p.x, y: 0, z: p.y });
    }
    res.push({ t, x: dibujar(e, s, acumulado / PASO_FIJO) });
  }
  return res;
}

/** Velocidades entre fotogramas, en casillas por segundo, tras arrancar. */
function velocidades(r: { t: number; x: number }[]): number[] {
  return r.slice(40).map((p, i, a) => (i ? (p.x - a[i - 1].x) / (p.t - a[i - 1].t) : NaN)).slice(1);
}

describe('suavizado del movimiento', () => {
  const nominal = 60 / PASOS_POR_CASILLA;

  it('dibujado entre los dos últimos pasos fijos, va siempre a la misma velocidad', () => {
    const v = velocidades(simular((_e, s, alfa) => s.en(alfa)!.x));
    // Un fotograma corto puede no tener paso fijo nuevo: la velocidad se mide en ventanas.
    const media = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
    for (let i = 0; i + 6 <= v.length; i += 6) expect(Math.abs(media(v.slice(i, i + 6)) / nominal - 1), `ventana ${i}`).toBeLessThan(0.12);
    expect(Math.min(...v)).toBeGreaterThan(0);
  });

  it('el dibujo de antes (adelantar con alfa, sin hacerlo en el paso 0) se congelaba en cada casilla', () => {
    const v = velocidades(simular((e, _s, alfa) => posicionVisual(e, alfa).x));
    expect(v.some((x) => x === 0)).toBe(true);
  });

  it('un salto largo (una puerta) no se recorre', () => {
    const s = new Suavizado();
    s.paso({ x: 0, y: 0, z: 0 });
    s.paso({ x: 200, y: 0, z: 0 });
    expect(s.en(0.5)).toEqual({ x: 200, y: 0, z: 0 });
  });
});
