import { EQUIPO } from '../../data/content.js';

const BASE = { vida: 50, ataque: 8, defensa: 4, energia: 6 };

const piezaPorId = (id) => EQUIPO.find((e) => e.id === id) ?? null;

/**
 * Estadísticas efectivas del personaje. El equipo suma números pero no cambia su aspecto:
 * si se viera encima, cada combinación necesitaría su propia ilustración.
 *
 * @param {number} nivel
 * @param {{ arma?: string, armadura?: string, accesorio?: string }} equipado
 */
export function statsPersonaje(nivel, equipado = {}) {
  const piezas = ['arma', 'armadura', 'accesorio'].map((r) => piezaPorId(equipado[r])).filter(Boolean);
  const sumar = (campo) => piezas.reduce((total, pieza) => total + (pieza[campo] ?? 0), 0);

  return {
    vidaMax: BASE.vida + nivel * 10 + sumar('vida'),
    ataque: BASE.ataque + nivel * 2 + sumar('ataque'),
    defensa: BASE.defensa + nivel + sumar('defensa'),
    energiaMax: BASE.energia + Math.floor(nivel / 3) + sumar('energia'),
  };
}
