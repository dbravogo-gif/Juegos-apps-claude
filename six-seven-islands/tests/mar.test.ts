// El mar alrededor de Lanzarote (autor, 2026-11-10): la orilla tiene espuma, frente a las playas
// hay boyas, y nada de lo que flota cae sobre tierra ni sobre lo que se pisa.
import { describe, expect, it } from 'vitest';
import { TRANSITABLES, clave, construirMundo } from '../src/core/mundo';
import { ISLA_1 } from '../src/data/isla1';
import { cumbres } from '../src/sistemas/mundo/terreno';
import { DISTANCIA_BOYAS, claveMar, distanciasMar, esMar, geometriaEspuma, geometriaPiezasMar, planMar } from '../src/sistemas/mundo/mar';
import { piezaKit, type PiezaKit } from '../src/sistemas/mundo/kit';
import { carasSolapadas } from './utiles/coplanares';

const m = construirMundo(ISLA_1);
const cumbre = cumbres(m);
const plan = planMar(m, cumbre);

describe('el mar de Lanzarote', () => {
  it('es determinista', () => {
    expect(planMar(m, cumbre)).toEqual(plan);
  });

  it('las rocas, boyas y barcas están en el mar, nunca en tierra ni junto a donde se camina', () => {
    expect(plan.piezas.length).toBeGreaterThan(20);
    for (const p of plan.piezas) {
      expect(esMar(m, cumbre, p.x, p.y), `${p.tipo} en ${p.x},${p.y}`).toBe(true);
      const c = m.casillas.get(clave(p.x, p.y))?.c;
      expect(c === undefined || !TRANSITABLES.has(c)).toBe(true);
    }
  });

  it('la barca cabe: agua en las ocho casillas de alrededor', () => {
    const barcas = plan.piezas.filter((p) => p.tipo === 'barca');
    expect(barcas.length).toBeGreaterThanOrEqual(3);
    for (const b of barcas) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) expect(esMar(m, cumbre, b.x + dx, b.y + dy)).toBe(true);
  });

  it('frente a la playa de El Golfo hay una fila de boyas, que dice hasta dónde se nada', () => {
    const golfo = m.zonas.get('combates')!.origen;
    const boyas = plan.piezas.filter((p) => p.tipo === 'boya' && p.y >= golfo.y + 33 && p.y <= golfo.y + 50 && p.x < golfo.x + 4);
    expect(boyas.length).toBeGreaterThanOrEqual(4);
    const dist = distanciasMar(m, cumbre);
    for (const b of boyas) expect(dist.get(claveMar(b.x, b.y))!.d).toBe(DISTANCIA_BOYAS);
  });

  it('toda casilla de mar pegada a tierra lleva espuma', () => {
    const franjas = plan.espuma.filter((e) => e.tipo === 'franja');
    const costa = [...distanciasMar(m, cumbre).values()].filter((v) => v.d === 1).length;
    expect(franjas.length).toBeGreaterThanOrEqual(costa);
  });

  it('la espuma no tiene caras solapadas en el mismo plano (titilaría)', () => {
    // Un trozo de costa con esquinas, para que la prueba sea rápida.
    const trozo = plan.espuma.filter((e) => e.x > 25 && e.x < 40 && e.y > 78 && e.y < 100);
    expect(trozo.length).toBeGreaterThan(10);
    expect(carasSolapadas(geometriaEspuma(trozo)!)).toEqual([]);
  });

  it('las rocas, boyas y barcas se juntan en una sola malla (una llamada de dibujo)', () => {
    const g = geometriaPiezasMar(plan.piezas, (n) => piezaKit(n.split('_')[0] as PiezaKit, Number(n.split('_')[1])));
    expect(g).not.toBeNull();
    expect(g!.getAttribute('color')).toBeDefined();
  });
});
