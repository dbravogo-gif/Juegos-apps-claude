// Lo que se lee de cada ataque en combate (autor, 2026-11-19).
import { describe, expect, it } from 'vitest';
import { describirMovimiento } from '../src/core/describir';
import { DATOS_COMBATE_PRUEBA as DATOS } from '../src/data/combate-prueba';

const de = (id: string) => describirMovimiento(DATOS.movimientos[id]);

describe('describir un ataque', () => {
  it('los de daño: la potencia, y la precisión solo si no es 100; con qué pegan no se dice (autor)', () => {
    expect(de('topetazo')).toEqual({ cifras: 'Potencia 40', efecto: '' });
    expect(de('ola-de-cresta').cifras).toBe('Potencia 55 · Precisión 95');
    expect(de('soplo-de-brasas').efecto).toBe('Puede quemar al rival (10 %).');
  });

  it('los de estado: sin poder, y lo que suben o bajan', () => {
    expect(de('caparazon')).toEqual({ cifras: '', efecto: 'Sube tu Escudo.' });
    expect(de('mirada-fija').cifras).toBe('');
    expect(de('mirada-fija').efecto).toMatch(/^Baja el Escudo del rival\. Alcanza a todos los rivales\.$/);
  });

  it('ningún texto sale roto, y los de estado siempre dicen lo que hacen', () => {
    for (const m of Object.values(DATOS.movimientos)) {
      const d = describirMovimiento(m);
      expect(`${d.cifras} ${d.efecto}`, m.id).not.toMatch(/undefined|NaN/);
      if (m.categoria === 'estado') expect(d.efecto.length, m.id).toBeGreaterThan(5);
    }
  });
});
