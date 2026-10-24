import type { Especie } from '../core/modelo';
import type { MovimientoId } from './movimientos';
import type { TipoId } from './tipos';

// Criaturas del capítulo 1 («Granada, 1492»), según las fichas de `docs/BESTIARIO.md`, que es la
// fuente de verdad. Los `id` son los del prototipo y no cambian aunque cambie el nombre, para no
// romper las partidas guardadas.
// Estadísticas base en el orden de Pokémon: Vida, Fuerza, Escudo, Magia, Resistencia mágica y
// Celeridad.

type Aprende = [nivel: number, movimiento: MovimientoId][];

interface DefEspecie {
  /** Número en el Bestiario (`docs/BESTIARIO.md`). */
  numero: number;
  nombre: string;
  tipos: [TipoId] | [TipoId, TipoId];
  base: [vida: number, fuerza: number, escudo: number, magia: number, resMagica: number, celeridad: number];
  expBase: number;
  ratioCaptura: number;
  aprende: Aprende;
  evoluciona?: { a: string; nivel?: number; objeto?: string };
  descripcion: string;
}

// Las evoluciones comparten la lista de su línea, como en Pokémon. Lo que aprende una forma
// evolucionada va en niveles posteriores a su evolución: al evolucionar no se aprende nada.
const LINEA_TORO: Aprende = [
  [1, 'topetazo'], [1, 'bramido'], [5, 'rescoldo'], [9, 'acometida'], [13, 'cornada_ardiente'],
  [21, 'desplante'], [26, 'tizne'], [31, 'hoguera'],
];
const LINEA_CANGREJO: Aprende = [
  [1, 'tenaza'], [1, 'bramido'], [5, 'rociada'], [9, 'caparazon'], [13, 'marejada'],
  [21, 'dentellada'], [26, 'golpe_de_mar'], [31, 'remanso'],
];
const LINEA_DRAGO: Aprende = [
  [1, 'varazo'], [1, 'desplante'], [5, 'hojarasca'], [9, 'sopor'], [14, 'polvareda'], [20, 'savia_de_dragon'],
];
const LINEA_LIBELULA: Aprende = [[1, 'aletazo'], [3, 'acometida'], [6, 'revoloteo'], [10, 'picada']];
const LINEA_DUENDE: Aprende = [[1, 'trastada'], [4, 'desplante'], [8, 'mal_de_ojo'], [12, 'acometida']];
const LINEA_ESCARABAJO: Aprende = [[1, 'topetazo'], [1, 'desplante'], [5, 'polvareda'], [9, 'terronazo']];

const DEF = {
  becerro_igneo: {
    numero: 1,
    nombre: 'Ignibue',
    tipos: ['infernal'],
    base: [44, 62, 44, 46, 44, 66],
    expBase: 62,
    ratioCaptura: 45,
    aprende: LINEA_TORO,
    evoluciona: { a: 'novillo_embolado', nivel: 16 },
    descripcion: 'En las fiestas de muchos pueblos sale de noche un toro de fuego: un armazón con forma de toro, cargado de cohetes, que alguien lleva a hombros. Ignibue embiste igual, pero el fuego es suyo.',
  },
  novillo_embolado: {
    numero: 2,
    nombre: 'Braverno',
    tipos: ['infernal', 'tierra'],
    base: [62, 85, 62, 60, 56, 80],
    expBase: 142,
    ratioCaptura: 45,
    aprende: [...LINEA_TORO, [18, 'terronazo']],
    evoluciona: { a: 'toro_de_fuego', nivel: 36 },
    descripcion: 'El basalto es lava que se enfrió deprisa. Es la roca de la que están hechas buena parte de las islas volcánicas, Canarias incluida.',
  },
  toro_de_fuego: {
    numero: 3,
    nombre: 'Ignivárgoth',
    tipos: ['infernal', 'tierra'],
    base: [85, 120, 85, 75, 70, 95],
    expBase: 263,
    ratioCaptura: 45,
    aprende: [...LINEA_TORO, [18, 'terronazo'], [38, 'colada']],
    descripcion: 'Diodoro de Sicilia cuenta que en el 228 a. C., en Helike, los oretanos lanzaron contra el ejército de Amílcar Barca carros de bueyes cargados de leña ardiendo.',
  },

  cangrejo: {
    numero: 4,
    nombre: 'Marzuko',
    tipos: ['agua'],
    base: [46, 58, 64, 42, 50, 50],
    expBase: 63,
    ratioCaptura: 45,
    aprende: LINEA_CANGREJO,
    evoluciona: { a: 'necora', nivel: 16 },
    descripcion: 'Para crecer, los cangrejos mudan el caparazón: se desprenden del viejo y pasan unos días blandos y escondidos hasta que endurece el nuevo.',
  },
  necora: {
    numero: 5,
    nombre: 'Nakarra',
    tipos: ['agua'],
    base: [64, 74, 90, 50, 66, 61],
    expBase: 142,
    ratioCaptura: 45,
    aprende: [...LINEA_CANGREJO, [18, 'brazada']],
    evoluciona: { a: 'centollo', nivel: 36 },
    descripcion: 'La nécora tiene los ojos rojos y el último par de patas aplanado como remos, con el que nada. Tiene fama de agresiva y peleona.',
  },
  centollo: {
    numero: 6,
    nombre: 'Talascrón',
    tipos: ['agua', 'acero'],
    base: [100, 95, 130, 55, 90, 60],
    expBase: 265,
    ratioCaptura: 45,
    aprende: [...LINEA_CANGREJO, [18, 'brazada'], [38, 'tajo'], [42, 'coraza'], [46, 'camuflaje_algas']],
    descripcion: 'Los cangrejos araña, la familia del centollo, se enganchan algas y otros organismos al caparazón para pasar desapercibidos.',
  },

  // El drago tiene dos formas: evoluciona más tarde, pero directamente a la final.
  retono_drago: {
    numero: 7,
    nombre: 'Dralín',
    tipos: ['planta'],
    base: [54, 44, 56, 62, 66, 48],
    expBase: 66,
    ratioCaptura: 45,
    aprende: LINEA_DRAGO,
    evoluciona: { a: 'drago_milenario', nivel: 26 },
    descripcion: 'El drago no forma anillos en el tronco: su edad solo se estima contando las veces que se ha ramificado. Su savia se vuelve roja al secarse, y se vendía como «sangre de drago».',
  },
  drago_milenario: {
    numero: 8,
    nombre: 'Dracendro',
    tipos: ['planta', 'ancestral'],
    base: [100, 70, 100, 100, 105, 55],
    expBase: 263,
    ratioCaptura: 45,
    aprende: [...LINEA_DRAGO, [28, 'ira_ancestral'], [33, 'resina_roja']],
    descripcion: 'Al Drago Milenario de Icod de los Vinos se le llama milenario, pero un estudio de 1975 le calculó unos 250 años. Mide unos 21 metros.',
  },

  libelula: {
    numero: 9,
    nombre: 'Zumbrel',
    tipos: ['aire'],
    base: [38, 48, 34, 38, 36, 76],
    expBase: 50,
    ratioCaptura: 255,
    aprende: LINEA_LIBELULA,
    evoluciona: { a: 'caballuco_diablu', nivel: 12 },
    descripcion: 'Las libélulas mueven cada una de sus cuatro alas por separado. Así pueden quedarse quietas en el aire, girar en seco o volar hacia atrás.',
  },
  caballuco_diablu: {
    numero: 10,
    nombre: 'Diablisca',
    tipos: ['aire', 'infernal'],
    base: [60, 72, 55, 82, 58, 103],
    expBase: 150,
    ratioCaptura: 90,
    aprende: [...LINEA_LIBELULA, [13, 'rescoldo'], [16, 'ventolera'], [19, 'tizne'], [25, 'hoguera']],
    descripcion: 'En Cantabria se cuenta que la noche de San Juan salen los caballucos del diablu, caballos con alas de libélula, a destrozar los tréboles de cuatro hojas.',
  },
  topillo: {
    numero: 13,
    nombre: 'Túmbriz',
    tipos: ['comun', 'tierra'],
    base: [35, 50, 38, 25, 35, 67],
    expBase: 45,
    ratioCaptura: 255,
    aprende: [[1, 'topetazo'], [1, 'bramido'], [4, 'acometida'], [8, 'dentellada'], [12, 'terronazo']],
    descripcion: 'El topillo mediterráneo excava galerías y come raíces. Cuando sus poblaciones se disparan, arruina frutales y alfalfares.',
  },
  barbo: {
    numero: 14,
    nombre: 'Barbaflux',
    tipos: ['agua'],
    base: [55, 72, 50, 40, 48, 65],
    expBase: 58,
    ratioCaptura: 235,
    aprende: [[1, 'rociada'], [4, 'topetazo'], [9, 'dentellada'], [15, 'golpe_de_mar']],
    descripcion: 'El barbo gitano solo vive en el sur de la península, en las cuencas del Guadalquivir y del Guadiana. Le amenazan las presas, las sequías y los peces introducidos.',
  },
  abejaruco: {
    numero: 15,
    nombre: 'Abezar',
    tipos: ['aire'],
    base: [42, 58, 40, 45, 40, 80],
    expBase: 55,
    ratioCaptura: 235,
    aprende: [[1, 'aletazo'], [5, 'acometida'], [9, 'revoloteo'], [13, 'picada'], [17, 'ventolera']],
    descripcion: 'El abejaruco anida en túneles que excava en taludes de arena o arcilla. Caza al vuelo abejas, avispas y otros insectos.',
  },
  duende: {
    numero: 11,
    nombre: 'Brezuco',
    tipos: ['oscuridad'],
    base: [40, 45, 42, 55, 50, 70],
    expBase: 55,
    ratioCaptura: 120,
    aprende: LINEA_DUENDE,
    // El trasgu del folclore lleva un gorro rojo: el duende evoluciona al ponérselo.
    evoluciona: { a: 'trasgo', objeto: 'gorro_colorado' },
    descripcion: 'La palabra duende viene de «duen de casa», el dueño de la casa. Por eso vive en las casas y se cree con derecho a todo lo que hay en ellas.',
  },
  trasgo: {
    numero: 12,
    nombre: 'Trasgorn',
    tipos: ['oscuridad'],
    base: [62, 70, 60, 85, 70, 98],
    expBase: 155,
    ratioCaptura: 60,
    aprende: [...LINEA_DUENDE, [14, 'emboscada'], [18, 'tarea_imposible']],
    descripcion: 'El trasgu tiene un agujero en la mano izquierda. Para librarse de él se le manda recoger linaza derramada: se le cuela por el agujero, nunca termina y acaba por marcharse.',
  },
  mandragora: {
    numero: 16,
    nombre: 'Mandragor',
    tipos: ['planta', 'mental'],
    base: [65, 45, 60, 85, 80, 45],
    expBase: 85,
    ratioCaptura: 120,
    aprende: [[1, 'varazo'], [4, 'sopor'], [8, 'hojarasca'], [12, 'alarido'], [16, 'savia_de_dragon']],
    descripcion: 'Sus raíces son narcóticas, con efectos parecidos a los de la belladona. Desde la Antigüedad se cuenta que grita cuando la arrancan.',
  },
  galapago: {
    numero: 17,
    nombre: 'Carapachón',
    tipos: ['agua'],
    base: [65, 50, 95, 40, 65, 25],
    expBase: 85,
    ratioCaptura: 75,
    aprende: [[1, 'topetazo'], [1, 'caparazon'], [6, 'rociada'], [11, 'marejada'], [16, 'remanso'], [22, 'golpe_de_mar']],
    descripcion: 'El galápago leproso vive en ríos, balsas y acequias del sur de la península. Está en declive por la pérdida de hábitat y los galápagos exóticos que la gente suelta.',
  },
  leon_fuente: {
    numero: 18,
    nombre: 'Alhambrón',
    tipos: ['agua', 'tierra'],
    base: [85, 90, 95, 70, 85, 55],
    expBase: 180,
    ratioCaptura: 3,
    aprende: [[1, 'dentellada'], [1, 'bramido'], [1, 'rociada'], [8, 'terronazo'], [13, 'remanso'], [18, 'golpe_de_mar']],
    descripcion: 'Los doce leones de la fuente son de mármol de Macael. En el borde de la taza se tallaron versos de Ibn Zamrak, el poeta de la corte nazarí, que describen la fuente.',
  },

  escarabajo_pelotero: {
    numero: 19,
    nombre: 'Broncero',
    tipos: ['tierra'],
    base: [45, 60, 55, 25, 35, 40],
    expBase: 50,
    ratioCaptura: 200,
    aprende: LINEA_ESCARABAJO,
    evoluciona: { a: 'escarabajo_bronce', nivel: 18 },
    descripcion: 'El escarabajo pelotero sagrado vive en dunas y arenales del sur de España. Sale al atardecer.',
  },
  escarabajo_bronce: {
    numero: 20,
    nombre: 'Escarbraz',
    tipos: ['tierra', 'acero'],
    base: [65, 78, 98, 35, 62, 45],
    expBase: 125,
    ratioCaptura: 90,
    aprende: [...LINEA_ESCARABAJO, [20, 'tajo'], [25, 'coraza']],
    evoluciona: { a: 'escarabajo_joya', nivel: 34 },
    descripcion: 'Los peloteros ruedan bolas de estiércol y las entierran. Dentro ponen sus huevos, y las larvas crecen comiéndose la bola.',
  },
  escarabajo_joya: {
    numero: 21,
    nombre: 'Mocarabeo',
    tipos: ['acero', 'luz'],
    base: [95, 75, 120, 70, 110, 40],
    expBase: 230,
    ratioCaptura: 45,
    aprende: [...LINEA_ESCARABAJO, [20, 'tajo'], [25, 'coraza'], [36, 'mocarabe'], [40, 'amanecer']],
    descripcion: 'Los egipcios veían en el escarabajo que rueda su bola al dios que empujaba el sol. La cúpula de la Sala de las Dos Hermanas, en la Alhambra, tiene más de cinco mil celdas de mocárabes.',
  },

  // Encuentro especial: se esconde en tinajas y papeleras (ver src/data/recipientes.ts).
  papemimico: {
    numero: 129,
    nombre: 'Papemímico',
    tipos: ['oscuridad', 'acero'],
    base: [120, 105, 115, 65, 95, 45],
    expBase: 220,
    ratioCaptura: 3,
    aprende: [[1, 'tapazo'], [1, 'emboscada'], [1, 'mal_de_ojo'], [1, 'escondite']],
    descripcion: 'Se hace pasar por un recipiente cualquiera: una tinaja en 1492, una papelera hoy. Quien mete la mano se lleva un susto… y, si lo vence, tres turrones.',
  },
} satisfies Record<string, DefEspecie>;

export type EspecieId = keyof typeof DEF;

export const ESPECIES: Record<string, Especie> = Object.fromEntries(
  Object.entries(DEF).map(([id, d]) => {
    const [vida, fuerza, escudo, magia, resMagica, celeridad] = d.base;
    const especie: Especie = {
      id,
      numero: d.numero,
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

/**
 * Especies que ya no existen y a cuál pasan las criaturas guardadas: la primera opción cuyo
 * nivel mínimo alcance la criatura.
 */
export const ESPECIES_RETIRADAS: Record<string, { desdeNivel: number; a: EspecieId }[]> = {
  // Dracena, la forma intermedia del drago, desapareció en la v2 del Bestiario.
  drago: [
    { desdeNivel: 26, a: 'drago_milenario' },
    { desdeNivel: 1, a: 'retono_drago' },
  ],
};
