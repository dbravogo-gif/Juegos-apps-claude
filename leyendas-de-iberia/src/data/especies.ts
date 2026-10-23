import type { Especie } from '../core/modelo';
import type { MovimientoId } from './movimientos';
import type { TipoId } from './tipos';

// Criaturas del prototipo «Granada, 1492». Nombres y números provisionales.
// Estadísticas base en el orden de Pokémon: Vida, Fuerza, Escudo, Magia, Resistencia mágica y
// Celeridad. Los iniciales suman unos 310 / 405 / 530 en sus tres formas.

type Aprende = [nivel: number, movimiento: MovimientoId][];

interface DefEspecie {
  nombre: string;
  tipos: [TipoId] | [TipoId, TipoId];
  base: [vida: number, fuerza: number, escudo: number, magia: number, resMagica: number, celeridad: number];
  expBase: number;
  ratioCaptura: number;
  aprende: Aprende;
  evoluciona?: { a: string; nivel?: number; objeto?: string };
  descripcion: string;
}

// Las evoluciones comparten la lista de su línea, como en Pokémon.
const LINEA_TORO: Aprende = [
  [1, 'topetazo'], [1, 'bramido'], [5, 'rescoldo'], [9, 'acometida'], [13, 'cornada_ardiente'],
  [19, 'desplante'], [24, 'tizne'], [30, 'hoguera'],
];
const LINEA_CANGREJO: Aprende = [
  [1, 'tenaza'], [1, 'bramido'], [5, 'rociada'], [9, 'caparazon'], [13, 'marejada'],
  [19, 'dentellada'], [24, 'golpe_de_mar'], [30, 'remanso'],
];
const LINEA_DRAGO: Aprende = [
  [1, 'topetazo'], [1, 'desplante'], [4, 'varazo'], [7, 'hojarasca'], [10, 'sopor'], [13, 'savia_de_dragon'],
  [19, 'polvareda'], [24, 'caparazon'], [30, 'remanso'],
];
const LINEA_LIBELULA: Aprende = [[1, 'aletazo'], [4, 'revoloteo'], [8, 'ventolera']];
const LINEA_DUENDE: Aprende = [[1, 'trastada'], [4, 'desplante'], [8, 'mal_de_ojo'], [12, 'acometida']];

const DEF = {
  becerro_igneo: {
    nombre: 'Ascuerno',
    tipos: ['infernal'],
    base: [44, 60, 45, 50, 45, 66],
    expBase: 62,
    ratioCaptura: 45,
    aprende: LINEA_TORO,
    evoluciona: { a: 'novillo_embolado', nivel: 16 },
    descripcion: 'Nace con los cuernos encendidos, como los toros de fuego de las fiestas de tantos pueblos de España.',
  },
  novillo_embolado: {
    nombre: 'Embolado',
    tipos: ['infernal'],
    base: [60, 82, 58, 64, 56, 85],
    expBase: 142,
    ratioCaptura: 45,
    aprende: LINEA_TORO,
    evoluciona: { a: 'toro_de_fuego', nivel: 36 },
    descripcion: 'Lleva bolas de fuego en los cuernos, como el toro embolado de las fiestas del Levante.',
  },
  toro_de_fuego: {
    nombre: 'Pirotauro',
    tipos: ['infernal', 'tierra'],
    base: [80, 115, 80, 85, 70, 100],
    expBase: 263,
    ratioCaptura: 45,
    aprende: [...LINEA_TORO, [36, 'terronazo']],
    descripcion: 'Recuerda al Toro Júbilo de Medinaceli (Soria), que sale de noche con los cuernos ardiendo.',
  },

  cangrejo: {
    nombre: 'Caparín',
    tipos: ['agua'],
    base: [46, 58, 66, 44, 52, 44],
    expBase: 63,
    ratioCaptura: 45,
    aprende: LINEA_CANGREJO,
    evoluciona: { a: 'necora', nivel: 16 },
    descripcion: 'Corretea de lado entre las rocas de la costa y se esconde en cualquier grieta.',
  },
  necora: {
    nombre: 'Tenazor',
    tipos: ['agua'],
    base: [62, 78, 86, 58, 66, 55],
    expBase: 142,
    ratioCaptura: 45,
    aprende: LINEA_CANGREJO,
    evoluciona: { a: 'centollo', nivel: 36 },
    descripcion: 'Tiene las patas traseras aplanadas como remos y nada con soltura.',
  },
  centollo: {
    nombre: 'Centurión',
    tipos: ['agua', 'acero'],
    base: [84, 105, 115, 75, 86, 65],
    expBase: 265,
    ratioCaptura: 45,
    aprende: [...LINEA_CANGREJO, [36, 'tajo'], [40, 'coraza']],
    descripcion: 'Gigante de las rías gallegas. Se cubre de algas para pasar desapercibido.',
  },

  retono_drago: {
    nombre: 'Draguillo',
    tipos: ['planta'],
    base: [48, 44, 52, 62, 62, 42],
    expBase: 64,
    ratioCaptura: 45,
    aprende: LINEA_DRAGO,
    evoluciona: { a: 'drago', nivel: 16 },
    descripcion: 'Brote de drago traído de Gran Canaria. Su savia se vuelve roja al secarse: la llamaban sangre de dragón.',
  },
  drago: {
    nombre: 'Dracena',
    tipos: ['planta'],
    base: [64, 58, 70, 82, 80, 51],
    expBase: 142,
    ratioCaptura: 45,
    aprende: LINEA_DRAGO,
    evoluciona: { a: 'drago_milenario', nivel: 36 },
    descripcion: 'Su nombre científico es Dracaena: «dragona». No forma anillos en el tronco, así que su edad solo se puede estimar.',
  },
  drago_milenario: {
    nombre: 'Ladón',
    tipos: ['planta', 'ancestral'],
    base: [90, 80, 95, 110, 95, 60],
    expBase: 263,
    ratioCaptura: 45,
    aprende: [...LINEA_DRAGO, [36, 'ira_ancestral']],
    descripcion: 'Según el mito, los dragos nacieron de la sangre de Ladón, el dragón que guardaba el jardín de las Hespérides, que muchos situaban en Canarias.',
  },

  libelula: {
    nombre: 'Vitralina',
    tipos: ['aire'],
    base: [36, 40, 32, 45, 35, 70],
    expBase: 50,
    ratioCaptura: 255,
    aprende: LINEA_LIBELULA,
    evoluciona: { a: 'caballuco_diablu', nivel: 12 },
    descripcion: 'Caza otros insectos al vuelo y es capaz de volar hacia atrás.',
  },
  caballuco_diablu: {
    nombre: 'Caballuco',
    tipos: ['aire', 'infernal'],
    base: [60, 65, 55, 80, 60, 100],
    expBase: 150,
    ratioCaptura: 90,
    aprende: [...LINEA_LIBELULA, [12, 'rescoldo'], [15, 'picada'], [18, 'tizne'], [24, 'hoguera']],
    descripcion: 'Según la tradición cántabra, en la noche de San Juan los diablos cabalgan estas libélulas.',
  },
  topillo: {
    nombre: 'Rastrojín',
    tipos: ['comun'],
    base: [32, 50, 35, 25, 35, 70],
    expBase: 45,
    ratioCaptura: 255,
    aprende: [[1, 'topetazo'], [1, 'bramido'], [4, 'acometida'], [8, 'dentellada'], [12, 'terronazo'], [16, 'desplante']],
    descripcion: 'Roedor de campo. Algunos años sus plagas arrasan cosechas enteras en Castilla.',
  },
  barbo: {
    nombre: 'Barbudo',
    tipos: ['agua'],
    base: [45, 55, 45, 40, 45, 60],
    expBase: 55,
    ratioCaptura: 235,
    aprende: [[1, 'rociada'], [5, 'topetazo'], [9, 'marejada'], [14, 'caparazon'], [20, 'golpe_de_mar']],
    descripcion: 'Pez de río con barbillas junto a la boca, con las que tantea el fondo.',
  },
  abejaruco: {
    nombre: 'Abejarco',
    tipos: ['aire'],
    base: [40, 55, 38, 40, 38, 75],
    expBase: 55,
    ratioCaptura: 235,
    aprende: [[1, 'aletazo'], [5, 'acometida'], [9, 'revoloteo'], [13, 'picada'], [17, 'ventolera']],
    descripcion: 'Atrapa abejas al vuelo y les quita el aguijón golpeándolas contra una rama.',
  },
  duende: {
    nombre: 'Diañu',
    tipos: ['oscuridad'],
    base: [40, 52, 40, 55, 45, 68],
    expBase: 60,
    ratioCaptura: 120,
    aprende: LINEA_DUENDE,
    // El trasgu del folclore lleva un gorro rojo: el duende evoluciona al ponérselo.
    evoluciona: { a: 'trasgo', objeto: 'gorro_colorado' },
    descripcion: 'El diañu burllón del folclore asturiano se convierte en animal para engañar a los caminantes y se ríe cuando le descubren.',
  },
  trasgo: {
    nombre: 'Trasgu',
    tipos: ['oscuridad'],
    base: [65, 80, 60, 82, 68, 95],
    expBase: 155,
    ratioCaptura: 60,
    aprende: [...LINEA_DUENDE, [14, 'emboscada'], [20, 'sopor']],
    descripcion: 'El trasgu del folclore del norte revuelve la casa por la noche. Se le espanta encargándole tareas imposibles.',
  },
  mandragora: {
    nombre: 'Mandrágora',
    tipos: ['planta'],
    base: [50, 45, 50, 75, 60, 40],
    expBase: 70,
    ratioCaptura: 120,
    aprende: [[1, 'varazo'], [4, 'sopor'], [8, 'hojarasca'], [12, 'alarido'], [16, 'savia_de_dragon']],
    descripcion: 'Su raíz recuerda a una figura humana y se usó como somnífero. La leyenda dice que grita al arrancarla.',
  },
  galapago: {
    nombre: 'Carapachón',
    tipos: ['agua'],
    base: [60, 50, 90, 45, 70, 25],
    expBase: 85,
    ratioCaptura: 75,
    aprende: [[1, 'topetazo'], [1, 'caparazon'], [6, 'rociada'], [11, 'marejada'], [16, 'remanso'], [22, 'golpe_de_mar']],
    descripcion: 'El galápago leproso vive en ríos, balsas y acequias del sur de la península.',
  },
  leon_fuente: {
    nombre: 'León Nazarí',
    tipos: ['agua'],
    base: [80, 85, 85, 90, 80, 60],
    expBase: 180,
    ratioCaptura: 3,
    aprende: [[1, 'dentellada'], [1, 'bramido'], [1, 'rociada'], [10, 'marejada'], [14, 'remanso'], [20, 'golpe_de_mar']],
    descripcion: 'Nacido de los doce leones de piedra que sostienen la fuente del Patio de los Leones, en la Alhambra.',
  },
} satisfies Record<string, DefEspecie>;

export type EspecieId = keyof typeof DEF;

export const ESPECIES: Record<string, Especie> = Object.fromEntries(
  Object.entries(DEF).map(([id, d]) => {
    const [vida, fuerza, escudo, magia, resMagica, celeridad] = d.base;
    const especie: Especie = {
      id,
      nombre: d.nombre,
      tipos: [...d.tipos] as Especie['tipos'],
      base: { vida, fuerza, escudo, magia, resMagica, celeridad },
      expBase: d.expBase,
      ratioCaptura: d.ratioCaptura,
      aprende: d.aprende.map(([nivel, movimiento]) => ({ nivel, movimiento })),
      descripcion: d.descripcion,
    };
    if ('evoluciona' in d) especie.evoluciona = { ...d.evoluciona };
    return [id, especie];
  }),
);

export const INICIALES: EspecieId[] = ['becerro_igneo', 'cangrejo', 'retono_drago'];
