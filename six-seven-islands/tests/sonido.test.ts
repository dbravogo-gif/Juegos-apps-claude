// Los datos del sonido (2026-11-19): los temas cuadran, cada zona tiene su ambiente y ningún
// efecto apunta a otro que no existe. Que suene bien lo dice el autor: Claude no oye.
import { describe, expect, it } from 'vitest';
import { construirMundo } from '../src/core/mundo';
import { ISLA_1 } from '../src/data/isla1';
import { ISLA_2 } from '../src/data/isla2';
import { AMBIENTE, EFECTOS, MUSICA } from '../src/sistemas/sonido/sonido';

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

  it('los efectos que suenan con otro lo nombran bien, y ninguno es atronador', () => {
    for (const [nombre, d] of Object.entries(EFECTOS)) {
      const con = (d as { con?: string }).con;
      if (con) expect(Object.keys(EFECTOS), nombre).toContain(con);
      expect(d.volumen, nombre).toBeLessThanOrEqual(0.35);
    }
  });
});
