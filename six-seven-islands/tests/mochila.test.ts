// La mochila por bolsillos (autor, 2026-11-12): cada objeto va en su bolsillo y la mochila
// dibujada marca el elegido.
import { describe, expect, it } from 'vitest';
import { svgMochila } from '../src/arte/mochila';
import { BOLSILLOS, bolsilloDe } from '../src/data/bolsillos';
import { DATOS_COMBATE_PRUEBA as DATOS } from '../src/data/combate-prueba';
import { ISLAS } from '../src/data/islas';
import { NOMBRE_OBJETO } from '../src/data/textos-isla1';

describe('mochila', () => {
  it('cuatro bolsillos distintos, con el botiquín primero', () => {
    expect(BOLSILLOS.map((b) => b.id)).toEqual(['botiquin', 'cubos', 'clave', 'tecnicas']);
  });

  it('cada objeto del juego va en su bolsillo: lo que cura en el botiquín y los cubos en los cubos', () => {
    for (const o of Object.values(DATOS.objetos)) {
      const b = bolsilloDe(o);
      expect(BOLSILLOS.some((x) => x.id === b), o.id).toBe(true);
      if (o.tipo === 'captura') expect(b).toBe('cubos');
      if (o.tipo === 'curar' || o.tipo === 'remedio' || o.tipo === 'revivir') expect(b).toBe('botiquin');
    }
  });

  it('la mochila dibujada marca solo el bolsillo elegido y tiene todos', () => {
    for (const b of BOLSILLOS) {
      const svg = svgMochila(b.id);
      expect(svg.match(/bolsillo-elegido/g)).toHaveLength(1);
      expect(svg).toContain(`class="bolsillo bolsillo-elegido" data-bolsillo="${b.id}"`);
      for (const x of BOLSILLOS) expect(svg).toContain(`data-bolsillo="${x.id}"`);
    }
  });

  it('todo objeto que hay por el suelo existe y tiene nombre al recogerlo (no «cubo-blanco»)', () => {
    for (const d of Object.values(ISLAS)) {
      const enSuelo = [...d.def.zonas.flatMap((z) => z.objetos ?? []), ...d.interiores.flatMap((i) => i.objetos ?? [])];
      for (const o of enSuelo) {
        expect(DATOS.objetos[o.objeto], o.id).toBeDefined();
        expect(NOMBRE_OBJETO[o.objeto], o.id).toBeDefined();
      }
    }
  });
});
