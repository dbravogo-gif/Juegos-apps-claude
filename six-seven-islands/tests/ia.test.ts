// La IA de los entrenadores (core/ia.ts). Lo vio el probador (2026-11-24): cuando sus golpes hacían
// poco, repetía Mirada fija o Caparazón sin fin, aunque la estadística ya no bajara ni subiera más.
import { describe, expect, it } from 'vitest';
import { iniciarCombate } from '../src/core/combate';
import { crearCriatura } from '../src/core/criatura';
import { elegirAccionIA } from '../src/core/ia';
import { crearRng } from '../src/core/rng';
import { DATOS_COMBATE_PRUEBA as DATOS } from '../src/data/combate-prueba';

function combate(tuya: string, suya: string, nivel = 5) {
  const cr = (especie: string, s: string) => crearCriatura(DATOS, especie, nivel, crearRng(s), { valia: 8, temperamento: 'equilibrado' });
  return iniciarCombate(
    { equipos: [[cr(tuya, 'a')], [cr(suya, 'b')]], formato: 1, salvaje: false, control: ['jugador', 'ia'], rng: crearRng('ia'), experiencia: false },
    DATOS,
  ).estado;
}

/** Los ataques que elige la IA del lado 1 en 40 tiradas (cada una avanza el generador). */
function elegidos(e: ReturnType<typeof combate>): string[] {
  const c = e.lados[1].equipo[e.lados[1].activos[0]!]!;
  return Array.from({ length: 40 }, () => {
    const a = elegirAccionIA(e, { lado: 1, hueco: 0 }, DATOS);
    return a.tipo === 'movimiento' ? c.movimientos[a.indice]!.id : a.tipo;
  });
}

describe('la IA no malgasta turnos', () => {
  it('baja el escudo del rival mientras sirve, y a −2 deja de hacerlo', () => {
    // Cronti contra Armalito, de Roca: Topetazo apenas le hace nada, así que primero le baja el escudo.
    const e = combate('inicial-roca', 'inicial-agua');
    expect(elegidos(e)).toContain('mirada-fija');
    e.lados[0].etapas[0]!.escudo = -2;
    expect(elegidos(e)).not.toContain('mirada-fija');
  });

  it('se sube el escudo hasta +2 y no más', () => {
    const e = combate('inicial-agua', 'inicial-roca');
    e.lados[1].etapas[0]!.escudo = 2;
    expect(elegidos(e)).not.toContain('caparazon');
  });
});
