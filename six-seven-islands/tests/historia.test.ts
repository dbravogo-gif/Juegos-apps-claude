// La historia en Lanzarote, parte 1 (HISTORIA.md, decidida por el autor el 2026-11-15): los pueblos
// y su círculo, el bar con tu amigo (al que pones nombre) y su mensaje al salir del museo.
import { describe, expect, it } from 'vitest';
import { PUEBLOS, inicialDelRival, puebloQueTePersigue, type TipoInicial } from '../src/data/pueblos';
import { eficacia } from '../src/core/tipos';
import { TABLA_TIPOS } from '../src/data/tipos';
import { construirInterior, transitable, clave } from '../src/core/mundo';
import { LANZAROTE } from '../src/data/islas';
import { elegirDialogo } from '../src/core/guion';
import { AMIGOS } from '../src/data/textos-isla1';

const INICIALES = Object.keys(PUEBLOS) as TipoInicial[];

describe('historia: los pueblos', () => {
  it('tu rival lleva una inicial que te gana; la rama que te persigue es débil contra la tuya', () => {
    for (const x of INICIALES) {
      const rival = inicialDelRival(x);
      expect(rival).not.toBe(x);
      expect(eficacia(TABLA_TIPOS, rival, [x]), `${rival} contra ${x}`).toBe(2);
      expect(eficacia(TABLA_TIPOS, x, [puebloQueTePersigue(x)]), `${x} contra su perseguidor`).toBe(2);
    }
    // Cada pueblo es atacado por uno solo, y entre todos cierran un círculo.
    expect(new Set(INICIALES.map((x) => PUEBLOS[x].ataca)).size).toBe(5);
    expect(PUEBLOS.tierra.comandante).toBe('Kevin');
  });
});

describe('historia: el bar y tu amigo', () => {
  const bar = LANZAROTE.interiores.find((d) => d.id === 'bar')!;

  it('el bar existe, con el camarero y tu amigo, y a tu amigo se llega andando', () => {
    expect(bar).toBeDefined();
    expect(bar.personajes.map((p) => p.id).sort()).toEqual(['amigo', 'camarero']);
    const s = construirInterior(bar, { x: 0, y: 0 });
    const amigo = bar.personajes.find((p) => p.id === 'amigo')!;
    const vecinas = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [amigo.x + dx, amigo.y + dy]);
    expect(vecinas.some(([x, y]) => transitable(s, x, y))).toBe(true);
    expect(s.casillas.get(clave(amigo.x, amigo.y))?.c).toBe('m');
  });

  it('a tu amigo se le pone nombre, y antes y después de elegir dice cosas distintas', () => {
    expect(AMIGOS.has('amigo')).toBe(true);
    const antes = elegirDialogo(LANZAROTE.guion, 'amigo', [], null)!;
    const despues = elegirDialogo(LANZAROTE.guion, 'amigo', ['inicial-elegida'], 'agua')!;
    expect(antes.lineas[0].texto).toContain('{nombre}');
    expect(despues.lineas[0].texto).toContain('{inicialRival}');
    expect(antes.lineas.every((l) => l.quien === '{amigo}')).toBe(true);
  });

  it('al salir del museo te llega su mensaje, con su nombre y su inicial', () => {
    const m = elegirDialogo(LANZAROTE.guion, 'mensaje-rival', ['inicial-elegida'], 'roca')!;
    expect(m.lineas[0].quien).toContain('{amigo}');
    expect(m.lineas[0].texto).toContain('{inicialRival}');
    for (const l of m.lineas) expect(l.texto.length).toBeLessThanOrEqual(130);
  });
});

describe('historia: los soldados y la silueta de las Montañas del Fuego (parte 2)', () => {
  it('aparecen al elegir inicial, cortan el camino hasta verte y, tras su escena, se van', async () => {
    const { construirMundo, alcanzables, presente, enIsla, entrenadorQueVe, vision, deClave } = await import('../src/core/mundo');
    const { ISLA_1 } = await import('../src/data/isla1');
    const m = construirMundo(ISLA_1);
    const fuego = m.zonas.get('fuego')!;
    const ids = ['soldado-fuego-1', 'soldado-fuego-2', 'silueta-fuego'];
    const ps = fuego.personajes.filter((p) => ids.includes(p.id));
    expect(ps).toHaveLength(3);
    expect(ps.filter((p) => p.uniforme === 'perseguidor')).toHaveLength(2);
    expect(ps.find((p) => p.silueta)?.id).toBe('silueta-fuego');
    for (const p of ps) {
      expect(presente(p, [])).toBe(false);
      expect(presente(p, ['inicial-elegida'])).toBe(true);
      expect(presente(p, ['inicial-elegida', 'soldados-fuego'])).toBe(false);
    }
    // Mientras están, cortan el camino de verdad: al este de ellos no se llega sin pasar por su vista.
    const conInicial = new Set(['inicial-elegida'] as const);
    const ve = new Set(ps.flatMap((p) => vision(m, 'fuego', p, conInicial)));
    const desde = enIsla(m, 'fuego', 22, 12);
    const meta = enIsla(m, 'fuego', 35, 15);
    const sinVer = alcanzables(m, [desde], { condiciones: conInicial, prohibidas: ve, sinTemporales: false });
    expect(sinVer.has(meta)).toBe(false);
    // Y su vista salta la escena (sin combate: no son entrenadores).
    const [vx, vy] = deClave(enIsla(m, 'fuego', 27, 11));
    expect(ps.every((p) => !p.entrenador)).toBe(true);
    expect(entrenadorQueVe(m, vx, vy, [], ['inicial-elegida'])?.personaje).toBe('soldado-fuego-1');
    expect(entrenadorQueVe(m, vx, vy, [], ['inicial-elegida', 'soldados-fuego'])).toBeNull();
    // La escena cumple la condición que los quita.
    const d = elegirDialogo(LANZAROTE.guion, 'soldado-fuego-1', ['inicial-elegida'], 'agua')!;
    expect(d.efecto?.condicion).toBe('soldados-fuego');
    expect(d.lineas.some((l) => l.quien === 'Silueta')).toBe(true);
  });
});
