import { EQUIPO } from '../../data/content.js';

// El personaje solo tiene dos estadísticas a la vista: fuerza y vida. Crecen despacio con
// el nivel para que se pueda avanzar sin comprar nada, y el equipo las empuja de verdad.
const BASE = { fuerza: 5, vida: 20 };
const POR_NIVEL = { fuerza: 1, vida: 5 };

const piezaPorId = (id) => EQUIPO.find((e) => e.id === id) ?? null;

/**
 * Estadísticas efectivas del personaje. El equipo suma números pero no cambia su aspecto:
 * si se viera encima, cada combinación necesitaría su propia ilustración.
 *
 * La defensa y la energía no se muestran como estadísticas: salen de las otras dos para no
 * llenar la ficha de números que el jugador no va a comparar.
 *
 * @param {number} nivel
 * @param {{ arma?: string, armadura?: string, accesorio?: string }} equipado
 */
export function statsPersonaje(nivel, equipado = {}) {
  const piezas = ['arma', 'armadura', 'accesorio'].map((r) => piezaPorId(equipado[r])).filter(Boolean);
  const sumar = (campo) => piezas.reduce((total, pieza) => total + (pieza[campo] ?? 0), 0);

  const ganado = nivel - 1;
  const fuerza = BASE.fuerza + ganado * POR_NIVEL.fuerza + sumar('fuerza');

  return {
    fuerza,
    vidaMax: BASE.vida + ganado * POR_NIVEL.vida + sumar('vida'),
    defensa: Math.floor(fuerza / 2),
    energiaMax: 6 + Math.floor(nivel / 3),
  };
}
