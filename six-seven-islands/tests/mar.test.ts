// El mar alrededor de Lanzarote (autor, 2026-11-10): la orilla tiene espuma, frente a las playas
// hay boyas, y nada de lo que flota cae sobre tierra ni sobre lo que se pisa.
import { describe, expect, it } from 'vitest';
import { TRANSITABLES, clave, construirMundo, deClave } from '../src/core/mundo';
import { ISLA_1 } from '../src/data/isla1';
import { ISLA_2 } from '../src/data/isla2';
import { cumbres } from '../src/sistemas/mundo/terreno';
import { DISTANCIA_BOYAS, DISTANCIA_MINIMA, claveMar, distanciasMar, esMar, geometriaEspuma, geometriaPiezasMar, marAbierto, planMar } from '../src/sistemas/mundo/mar';
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

  it('las rocas y las boyas dejan al menos dos casillas de agua hasta la costa (autor, 2026-11-11)', () => {
    const dist = distanciasMar(m, cumbre);
    for (const p of plan.piezas.filter((p) => p.tipo !== 'barca')) {
      expect(dist.get(claveMar(p.x, p.y))!.d, `${p.tipo} en ${p.x},${p.y}`).toBeGreaterThanOrEqual(DISTANCIA_MINIMA);
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
    // Un trozo de costa con esquinas (la playa de El Golfo), para que la prueba sea rápida.
    const g = m.zonas.get('combates')!.origen;
    const trozo = plan.espuma.filter((e) => e.x > g.x - 4 && e.x < g.x + 11 && e.y > g.y + 30 && e.y < g.y + 52);
    expect(trozo.length).toBeGreaterThan(10);
    expect(carasSolapadas(geometriaEspuma(trozo)!)).toEqual([]);
  });

  it('las rocas, boyas y barcas se juntan en una sola malla (una llamada de dibujo)', () => {
    const g = geometriaPiezasMar(plan.piezas, (n) => piezaKit(n.split('_')[0] as PiezaKit, Number(n.split('_')[1])));
    expect(g).not.toBeNull();
    expect(g!.getAttribute('color')).toBeDefined();
  });
});

describe('el mar de Fuerteventura', () => {
  it('el mar de cada zona de costa da al mar abierto: ninguno queda encerrado como un canal', () => {
    // Pasó en Puerto del Rosario, Sotavento y Morro Jable: la silueta ponía tierra detrás de su mar.
    for (const isla of [ISLA_1, ISLA_2]) {
      const mm = construirMundo(isla);
      const abierto = marAbierto(mm, distanciasMar(mm, cumbres(mm)));
      const agua = new Set([...mm.casillas].filter(([, c]) => c.c === '~').map(([k]) => k));
      const vistas = new Set<number>();
      for (const k0 of agua) {
        if (vistas.has(k0)) continue;
        const grupo = [k0];
        vistas.add(k0);
        for (let i = 0; i < grupo.length; i++) {
          const [x, y] = deClave(grupo[i]);
          for (const v of [clave(x + 1, y), clave(x - 1, y), clave(x, y + 1), clave(x, y - 1)]) {
            if (agua.has(v) && !vistas.has(v)) {
              vistas.add(v);
              grupo.push(v);
            }
          }
        }
        // Las pozas y las presas son pequeñas; el mar de una zona, no.
        if (grupo.length < 40) continue;
        const zona = mm.casillas.get(k0)!.zona;
        expect(grupo.some((k) => abierto.has(claveMar(...deClave(k)))), `${isla.id} ${zona}`).toBe(true);
      }
    }
  });

  it('en la presa de Betancuria no hay barcas, boyas ni rocas: solo van en el mar abierto', () => {
    const m2 = construirMundo(ISLA_2);
    const z = m2.zonas.get('betancuria')!;
    const [ancho, alto] = [z.mapa[0].length, z.mapa.length];
    const dentro = (x: number, y: number) => x >= z.origen.x && x < z.origen.x + ancho && y >= z.origen.y && y < z.origen.y + alto;
    expect(z.mapa.some((f) => f.includes('~'))).toBe(true);
    for (const p of planMar(m2, cumbres(m2)).piezas) expect(dentro(Math.round(p.x), Math.round(p.y)), `${p.tipo} ${p.x},${p.y}`).toBe(false);
  });
});
