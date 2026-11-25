// El simulador de partida (herramientas/simular/; skill `rpg`). Siempre: que su recorrido esté al
// día con las islas (todo entrenador dentro) y que funcione. Con EQUILIBRIO=1 (`npm run equilibrio`),
// además juega todas las islas y escribe el informe EQUILIBRIO.md.
import { describe, expect, it } from 'vitest';
import { crearRng } from '../src/core/rng';
import { ESPECIE_INICIAL, RIVAL_DE } from '../src/data/combate-prueba';
import { equipoDeEntrenador } from '../src/data/equipos';
import { ISLAS } from '../src/data/islas';
import { informe } from '../herramientas/simular/informe';
import { RECORRIDOS, SOLO_EN_PAREJA } from '../herramientas/simular/ruta';
import { encuentrosHasta, probabilidadDeGanar, progresion } from '../herramientas/simular/simulador';

// El proyecto no trae los tipos de Node (no los necesita el juego): lo justo para el informe.
declare const process: { env: Record<string, string | undefined> };

describe('los equipos de los entrenadores (data/equipos.ts)', () => {
  it('el primer entrenador saca la inicial que pierde contra la tuya, a nivel 5', () => {
    const { rivales } = equipoDeEntrenador('entrenador-barrera', ISLAS[1]!.entrenadores, 'agua', crearRng('t'));
    expect(rivales.map((c) => [c.especie, c.nivel])).toEqual([[ESPECIE_INICIAL[RIVAL_DE.agua!], 5]]);
  });

  it('los dos líderes de Agaete traen al otro líder y a tu aliado', () => {
    const { rivales, pareja } = equipoDeEntrenador('lider-lucha', ISLAS[3]!.entrenadores, 'roca', crearRng('t'));
    expect(rivales.length).toBeGreaterThan(0);
    expect(pareja?.delOtro.length).toBeGreaterThan(0);
    expect(pareja?.aliado.length).toBeGreaterThan(0);
  });
});

describe('el simulador de partida', () => {
  it('su recorrido tiene a todos los entrenadores de cada isla, y solo los que existen', () => {
    for (const r of RECORRIDOS) {
      const isla = ISLAS[r.isla]!;
      const zonas = new Set([...isla.def.zonas.map((z) => z.id), ...isla.interiores.map((s) => s.id)]);
      const enRuta = r.tramos.flatMap((t) => t.entrenadores.map((e) => e.id));
      for (const t of r.tramos) expect(zonas.has(t.zona), `${r.isla}: zona ${t.zona}`).toBe(true);
      for (const id of enRuta) expect(isla.entrenadores[id], `${r.isla}: ${id}`).toBeDefined();
      // Un entrenador nuevo sin sitio en el recorrido falsearía el equilibrio: hay que ponerlo.
      for (const id of Object.keys(isla.entrenadores)) if (!SOLO_EN_PAREJA.has(id)) expect(enRuta, `${r.isla}: falta ${id} en herramientas/simular/ruta.ts`).toContain(id);
      for (const j of r.jefes) expect(enRuta).toContain(j);
    }
  });

  it('cuenta las casillas de encuentros del camino y llega a cada jefe con niveles crecientes', () => {
    // Las Dunas son todas de encuentros: para cruzarlas hay que pisar decenas.
    const fv = encuentrosHasta(2);
    expect(fv.get('puerto')! - fv.get('dunas')!).toBeGreaterThan(40);
    const hitos = progresion('normal', 'agua');
    expect(hitos.map((h) => h.jefe)).toEqual(RECORRIDOS.flatMap((r) => r.jefes));
    for (let i = 1; i < hitos.length; i++) expect(hitos[i]!.nivelInicial).toBeGreaterThanOrEqual(hitos[i - 1]!.nivelInicial);
  });

  it('un equipo muy por encima gana siempre, y uno muy por debajo casi nunca', () => {
    expect(probabilidadDeGanar(1, 'lider-gimnasio', 'agua', 40, 40, 20)).toBe(1);
    expect(probabilidadDeGanar(1, 'lider-gimnasio', 'agua', 4, 4, 20)).toBeLessThan(0.2);
  });

  it.skipIf(!process.env.EQUILIBRIO)('escribe el informe EQUILIBRIO.md', { timeout: 600_000 }, async () => {
    const texto = informe(new Date().toISOString().slice(0, 10));
    const fs = (await import('node:fs' as string)) as { writeFileSync(ruta: URL, texto: string): void };
    fs.writeFileSync(new URL('../EQUILIBRIO.md', import.meta.url), texto);
    expect(texto).toContain('El primer combate');
  });
});
