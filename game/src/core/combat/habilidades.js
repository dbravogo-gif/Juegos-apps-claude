import { HABILIDADES, HABILIDADES_EN_COMBATE } from '../../data/content.js';
import { clasificarEntreno, clasificarComida } from '../scoring/streaks.js';

/**
 * Lo que cargan las habilidades: hábitos de los últimos días, contados desde el historial.
 * Una semana para entreno y dieta, que es lo que se recuerda sin esfuerzo («esta semana he
 * ido cuatro veces»); dos para la actividad de fuera, que es más esporádica.
 *
 * @typedef {{ entrenos: number, dieta: number, otras: number, rachaEntreno: number, rachaComida: number }} Carga
 */
export const CARGA_VACIA = { entrenos: 0, dieta: 0, otras: 0, rachaEntreno: 0, rachaComida: 0 };

/**
 * @param {import('../scoring/streaks.js').DiaHistorial[]} dias ordenados, el último es hoy
 * @param {{ entreno: { activa: boolean, longitud: number }, comida: { activa: boolean, longitud: number } } | null} rachas
 * @returns {Carga}
 */
export function cargaDeHabilidades(dias = [], rachas = null) {
  const semana = dias.slice(-7);
  const quincena = dias.slice(-14);
  const viva = (r) => (r?.activa ? r.longitud : 0);

  return {
    entrenos: semana.filter((d) => clasificarEntreno(d) === 'cumplido').length,
    dieta: semana.filter((d) => clasificarComida(d) === 'cumplido').length,
    otras: quincena.filter((d) => d.sesion === 'otra').length,
    rachaEntreno: viva(rachas?.entreno),
    rachaComida: viva(rachas?.comida),
  };
}

const tope = (valor, maximo) => Math.min(valor, maximo);
const redondear = (x) => Math.round(x * 100) / 100;

/**
 * Qué hace cada habilidad con la carga de hoy. Todas sirven sin carga —quien empieza no
 * debe tener botones muertos— pero con hábitos llegan a valer bastante más.
 *
 * Los topes están puestos para que nada rompa el combate: el mejor golpe no llega a
 * triplicar uno normal y la mejor guardia sigue dejando pasar algo.
 */
export function potencia(id, carga = CARGA_VACIA) {
  switch (id) {
    case 'embestida':
      return { multiplicador: redondear(1.3 + 0.08 * tope(carga.entrenos, 6)), golpes: 1 };
    case 'segundo_aliento':
      return { cura: redondear(0.1 + 0.04 * tope(carga.dieta, 7)) };
    case 'paso_peregrino':
      return { esquiva: redondear(0.4 + 0.15 * tope(carga.otras, 3)) };
    case 'guardia_ferrea':
      return { pasa: redondear(Math.max(0.1, 0.35 - 0.01 * carga.rachaEntreno)) };
    case 'tajo_doble':
      return { multiplicador: 1, golpes: carga.dieta >= 5 ? 3 : 2 };
    case 'golpe_constante':
      return { multiplicador: redondear(tope(1.2 + 0.03 * (carga.rachaEntreno + carga.rachaComida), 2.8)), golpes: 1 };
    default:
      return {};
  }
}

const pct = (x) => `${Math.round(x * 100)} %`;
const veces = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

/** Una línea con lo que vale ahora y por qué, para que se vea qué hábito la empuja. */
export function describirPotencia(id, carga = CARGA_VACIA) {
  const p = potencia(id, carga);
  switch (id) {
    case 'embestida':
      return `×${p.multiplicador} de daño · ${veces(carga.entrenos, 'sesión', 'sesiones')} esta semana`;
    case 'segundo_aliento':
      return `Cura el ${pct(p.cura)} de tu vida · ${veces(carga.dieta, 'día', 'días')} de dieta esta semana`;
    case 'paso_peregrino':
      return `${pct(p.esquiva)} de esquivar · ${veces(carga.otras, 'actividad', 'actividades')} fuera en dos semanas`;
    case 'guardia_ferrea':
      return `Deja pasar el ${pct(p.pasa)} del golpe · racha de ${veces(carga.rachaEntreno, 'día', 'días')}`;
    case 'tajo_doble':
      return `${p.golpes} cortes · ${veces(carga.dieta, 'día', 'días')} de dieta esta semana`;
    case 'golpe_constante':
      return `×${p.multiplicador} de daño · rachas de ${carga.rachaEntreno} + ${carga.rachaComida} días`;
    default:
      return '';
  }
}

/**
 * Las que van al combate. Si nunca se ha elegido, las más recientes: la última habilidad
 * abierta tiene que poder probarse sin pasar antes por un menú.
 *
 * @param {{ id: string }[]} abiertas en orden de nivel
 * @param {string[] | undefined} elegidas
 */
export function habilidadesLlevadas(abiertas, elegidas) {
  if (!Array.isArray(elegidas)) return abiertas.slice(-HABILIDADES_EN_COMBATE);
  const validas = new Set(abiertas.map((h) => h.id));
  return abiertas.filter((h) => validas.has(h.id) && elegidas.includes(h.id)).slice(0, HABILIDADES_EN_COMBATE);
}

export const habilidad = (id) => HABILIDADES[id];
