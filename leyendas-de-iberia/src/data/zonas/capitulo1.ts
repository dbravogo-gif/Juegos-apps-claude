import type { Zona } from '../../core/mundo';
import { bandera, dar, decir, si } from '../guion';

// Capítulo 1: Granada, invierno de 1491 a 1492. Santa Fe → la Vega → la Alhambra.
// Leyenda de casillas en `src/data/casillas.ts`.

const SANTA_FE: Zona = {
  id: 'santa_fe',
  nombre: 'Santa Fe',
  mapa: [
    'MMMMMMMMMMMGMMMMMMMMMMMM',
    'M#,,,,,,,,,..,,,,,,,,,#M',
    'M,TTTTTT,,,..,,,LLLLLL,M',
    'M,TTTTTT,,,..,,,LLLLLL,M',
    'M,MMMPMM,,,..,,,LLLPLL,M',
    'M,,,,.,,,,,..,,,,,,.,,,M',
    'M,*,,.,,,,,..,,,,,,.,*,M',
    'M,,,,......SS......,,,,M',
    'M..........SS..........M',
    'M..........SS..........M',
    'M,,,,......SS......,,,,M',
    'M,*,,,,,,,,..,,,,,,,,*,M',
    'M,,,,,,,,,,..,,,,,,,,,,M',
    'M,TTTTTT,,,..,,,TTTTTT,M',
    'M,TTTTTT,,,..,,,TTTTTT,M',
    'M,MMMMMM,,,..,,,MMMMMM,M',
    'M,,,,,,,,,,..,,,,,,,,,,M',
    'M#,,,,,,K,,..,,K,,,,,,#M',
    'M,,,,,,,,,,..,,,,,,,,,,M',
    'MMMMMMMMMMMMMMMMMMMMMMMM',
  ],
  pnj: [
    {
      id: 'centinela',
      nombre: 'Centinela',
      x: 11,
      y: 1,
      dir: 'abajo',
      aspecto: 'soldado',
      ocultoSi: 'inicial',
      guion: decir('Centinela', 'Sin licencia de la reina no sale nadie de Santa Fe.', 'Su pabellón es la tienda grande, al noreste de la plaza.'),
    },
    {
      id: 'gran_capitan',
      nombre: 'Gran Capitán',
      x: 14,
      y: 9,
      dir: 'izquierda',
      aspecto: 'caballero',
      guion: [
        si(
          'teseras',
          decir(
            'Gran Capitán',
            'Debilita a la criatura sin derrotarla y después lanza la tésera.',
            'Si está dormida o quemada, el pacto es todavía más fácil.',
          ),
          [
            si(
              'inicial',
              [
                ...decir(
                  'Gran Capitán',
                  'Gonzalo Fernández de Córdoba, a tu servicio. Llevo semanas negociando la entrega de la ciudad con los hombres de Boabdil.',
                  'Una criatura no se rinde: se pacta con ella. Toma estas téseras.',
                ),
                dar('tesera', 5),
                bandera('teseras'),
                ...decir('Gran Capitán', 'En la hierba alta de la Vega saltan criaturas salvajes. Debilítalas antes de lanzar la tésera.'),
              ],
              decir('Gran Capitán', '¿Aún no has visto a la reina? Su pabellón está al noreste de la plaza.'),
            ),
          ],
        ),
      ],
    },
    {
      id: 'colon',
      nombre: 'Colón',
      x: 7,
      y: 12,
      dir: 'abajo',
      aspecto: 'explorador',
      guion: [
        si('colon', decir('Colón', 'Cuando la reina me dé su licencia, cruzaré el océano hacia el oeste. ¡Ya lo verás!'), [
          ...decir(
            'Colón',
            'Me llamo Cristóbal Colón. Llevo años pidiendo barcos a los Reyes para llegar a las Indias por el oeste.',
            'Los sabios de la corte dicen que el océano es demasiado grande. Ya veremos quién tiene razón.',
            'Toma, para el camino. A mí me sobran: no me dejan ir a ninguna parte.',
          ),
          dar('unguento', 3),
          bandera('colon'),
        ]),
      ],
    },
    {
      id: 'pastor_orce',
      nombre: 'Pastor de Orce',
      x: 9,
      y: 2,
      dir: 'abajo',
      aspecto: 'anciano',
      guion: [
        si('fosil', decir('Pastor', 'En Orce aparecen huesos de bestias que ya no existen. Mi abuelo decía que eran de gigantes.'), [
          si(
            'inicial',
            [
              ...decir(
                'Pastor',
                'Vengo de Orce, en el norte del reino. Mira lo que encontré enterrado: un colmillo enorme, curvo como una hoz.',
                'Yo no sé qué hacer con él. Quédatelo; quizá algún sabio sepa qué bestia lo llevaba.',
              ),
              dar('fosil_colmillo', 1),
              bandera('fosil'),
            ],
            decir('Pastor', 'Hace frío en la Vega. Ve a ver a la reina antes de que anochezca.'),
          ),
        ]),
      ],
    },
    {
      id: 'vecina',
      nombre: 'Vecina',
      x: 19,
      y: 17,
      dir: 'izquierda',
      aspecto: 'mujer',
      guion: decir(
        'Vecina',
        'El verano pasado ardió el campamento real entero.',
        'La reina mandó levantar esta ciudad de piedra para que Boabdil viera que no pensaban marcharse.',
      ),
    },
  ],
  salidas: [
    { x: 11, y: 0, zona: 'vega', ax: 7, ay: 26, dir: 'arriba' },
    { x: 5, y: 4, zona: 'meson_santa_fe', ax: 4, ay: 6, dir: 'arriba' },
    { x: 19, y: 4, zona: 'pabellon_real', ax: 4, ay: 6, dir: 'arriba' },
  ],
  carteles: [
    { x: 10, y: 5, texto: ['Santa Fe.', 'Ciudad levantada en 1491 por los Reyes Católicos frente a Granada.'] },
    { x: 4, y: 5, texto: ['Mesón de Santa Fe.', 'Cama, comida y descanso para tus criaturas.'] },
  ],
  ocultos: [{ id: 'azabache', x: 21, y: 11, objeto: 'azabache' }],
  recipientes: [
    { id: 'meson', x: 7, y: 5 },
    { id: 'plaza', x: 3, y: 10 },
    { id: 'huerto', x: 20, y: 16 },
  ],
  alEntrar: decir(
    undefined,
    'Invierno de 1491. Los Reyes Católicos asedian Granada, el último reino nazarí de la Península.',
    'Desde Santa Fe, la ciudad que han levantado frente a sus murallas, esperan que el emir Boabdil se rinda.',
    'Esta mañana te ha llegado un recado: la reina Isabel quiere verte en su pabellón.',
  ),
};

const MESON: Zona = {
  id: 'meson_santa_fe',
  nombre: 'Mesón de Santa Fe',
  interior: true,
  mapa: [
    'WWWWWWWWWW',
    'WEXXXXXXEW',
    'WBBBBBBBBW',
    'WBRRRRRRBW',
    'WBRRRRRRBW',
    'WBBBBBBBBW',
    'WKBBBBBBKW',
    'WWWWPWWWWW',
  ],
  pnj: [
    {
      id: 'mesonera',
      nombre: 'Mesonera',
      x: 3,
      y: 2,
      dir: 'abajo',
      aspecto: 'anciana',
      guion: [
        {
          tipo: 'elegir',
          quien: 'Mesonera',
          pregunta: '¡Bienvenido al mesón! ¿Quieres que tus criaturas descansen?',
          opciones: [
            {
              texto: 'Sí, por favor',
              pasos: [{ tipo: 'curar' }, { tipo: 'regreso' }, ...decir('Mesonera', '¡Ya están como nuevas! Que tengas buen camino.')],
            },
            { texto: 'Ordenar el equipo', pasos: [{ tipo: 'almacen' }] },
            { texto: 'No, gracias', pasos: decir('Mesonera', 'Aquí estaremos cuando nos necesites.') },
          ],
        },
      ],
    },
    {
      id: 'tendero',
      nombre: 'Tendero',
      x: 6,
      y: 2,
      dir: 'abajo',
      aspecto: 'monje',
      guion: [
        ...decir('Tendero', 'Téseras de bronce y ungüentos del boticario. ¿Qué te pongo?'),
        {
          tipo: 'tienda',
          productos: ['tesera', 'tesera_plata', 'unguento', 'emplasto', 'aloe', 'sales', 'ruda', 'ovillo', 'brebaje_fuerza', 'brebaje_escudo'],
        },
      ],
    },
  ],
  salidas: [{ x: 4, y: 7, zona: 'santa_fe', ax: 5, ay: 5, dir: 'abajo' }],
  carteles: [],
};

const PABELLON: Zona = {
  id: 'pabellon_real',
  nombre: 'Pabellón real',
  interior: true,
  mapa: [
    'LLLLLLLLLL',
    'LKRRRRRRKL',
    'LRRRRRRRRL',
    'LRRRRRRRRL',
    'LRRRRRRRRL',
    'LRRRRRRRRL',
    'LKRRRRRRKL',
    'LLLLPLLLLL',
  ],
  pnj: [
    {
      id: 'isabel',
      nombre: 'Isabel la Católica',
      x: 4,
      y: 2,
      dir: 'abajo',
      aspecto: 'dama',
      guion: [
        si(
          'inicial',
          decir('Isabel', 'Registra las leyendas de mis reinos, {nombre}. Y no hagas esperar a Boabdil: está en la Alhambra, al norte de la Vega.'),
          [
            ...decir(
              'Isabel',
              'Así que tú eres {nombre}. Acércate.',
              'Granada está a punto de rendirse. Pero en estas tierras no solo luchan los hombres: también las leyendas.',
              'Quiero que alguien las registre en este Bestiario. Cada criatura que veas y cada pacto que selles quedarán escritos en él.',
              'Para empezar, elige compañera. Las tres han llegado a la corte este año.',
            ),
            { tipo: 'elegirInicial' },
            ...decir(
              'Isabel',
              'Buena elección. Cuidaos el uno al otro.',
              'Boabdil ha aceptado un último duelo de leyendas en la Alhambra antes de entregar la ciudad.',
              'Ve a verle. Pero antes habla con Gonzalo, el Gran Capitán: está en la plaza y te dará con qué sellar pactos.',
            ),
            bandera('inicial'),
            { tipo: 'guardar' },
          ],
        ),
      ],
    },
    {
      id: 'fernando',
      nombre: 'Fernando el Católico',
      x: 6,
      y: 2,
      dir: 'abajo',
      aspecto: 'noble',
      guion: decir('Fernando', 'La reina confía en ti. Y yo confío en la reina.', 'Tanto monta, monta tanto.'),
    },
  ],
  salidas: [{ x: 4, y: 7, zona: 'santa_fe', ax: 19, ay: 5, dir: 'abajo' }],
  carteles: [],
};

const VEGA: Zona = {
  id: 'vega',
  nombre: 'La Vega de Granada',
  mapa: [
    '#######G########',
    '#oo,,,,.,,,,,oo#',
    '#o,hhhh.,,hhh,o#',
    '#,,hhhh.,,hhh,,#',
    '#,,hhhh.,,hhh,,#',
    '#,,,,,,.,,,,,,,#',
    '#~~~~~~=~~~~~~~#',
    '#,,,,,,.,,,,,,,#',
    '#o,,,,,.....,,o#',
    '#o,hhh,,,,,.,,o#',
    '#,,hhh,,,,,.,,,#',
    '#,,hhh,,,,,.hhh#',
    '#,,,,,,,,,,.hhh#',
    '#oo,,,,.....hhh#',
    '#oo,,,,.,,,,,,,#',
    '#,,,,,,.,,,,,,,#',
    '#,hhhhh.hhhhh,,#',
    '#,hhhhh.hhhhh,,#',
    '#,,,,,,.,,,,,,,#',
    '#~~~~~~=~~~~~~~#',
    '#,,,,,,.,,,,,,,#',
    '#,,o,,,.,,,o,,,#',
    '#,hhh,,h,,hhhh,#',
    '#,hhhhhhhhhhhh,#',
    '#,hhh,,h,,hhhh,#',
    '#oo,,,,.,,,,,oo#',
    '#,,,,,,.,,,,,,,#',
    '#######G########',
  ],
  encuentros: {
    tasa: 12,
    especies: [
      { especie: 'topillo', min: 2, max: 4, peso: 30 },
      { especie: 'libelula', min: 2, max: 4, peso: 25 },
      { especie: 'abejaruco', min: 3, max: 5, peso: 20 },
      { especie: 'mandragora', min: 3, max: 5, peso: 12 },
      { especie: 'duende', min: 4, max: 5, peso: 8 },
      { especie: 'galapago', min: 4, max: 6, peso: 5 },
    ],
  },
  pnj: [
    {
      id: 'ballestero',
      nombre: 'Ballestero Sancho',
      x: 9,
      y: 20,
      dir: 'izquierda',
      aspecto: 'ballestero',
      entrenador: 'ballestero_sancho',
      vision: 3,
      guion: [],
    },
    {
      id: 'mercader',
      nombre: 'Mercader genovés',
      x: 13,
      y: 10,
      dir: 'izquierda',
      aspecto: 'mercader',
      entrenador: 'mercader_genoves',
      vision: 3,
      guion: [],
    },
  ],
  salidas: [
    { x: 7, y: 27, zona: 'santa_fe', ax: 11, ay: 1, dir: 'abajo' },
    { x: 7, y: 0, zona: 'alhambra', ax: 6, ay: 10, dir: 'arriba' },
  ],
  carteles: [{ x: 8, y: 26, texto: ['La Vega de Granada.', 'Al norte, la Alhambra.'] }],
  ocultos: [
    { id: 'higo', x: 14, y: 15, objeto: 'higo' },
    { id: 'endrina', x: 1, y: 20, objeto: 'endrina' },
    { id: 'ruda', x: 13, y: 7, objeto: 'ruda' },
  ],
  recipientes: [
    { id: 'puente', x: 8, y: 5 },
    { id: 'acequia', x: 6, y: 18 },
  ],
};

const ALHAMBRA: Zona = {
  id: 'alhambra',
  nombre: 'Bosque de la Alhambra',
  mapa: [
    'MMMMMMPMMMMMMM',
    'M#,,,,S,,,,,#M',
    'M#,*,,S,,*,,#M',
    'M##,,,S,,,,##M',
    'M#,,,,S,,,,,#M',
    'M#,hh,S,,hh,#M',
    'M#,hh,S,,hh,#M',
    'M#,,,,S,,,,,#M',
    'M##,,,S,,,,##M',
    'M#,,,,S,,,,,#M',
    'M#,,,,S,,,,,#M',
    'M#####G######M',
  ],
  encuentros: {
    tasa: 14,
    especies: [
      { especie: 'duende', min: 5, max: 7, peso: 40 },
      { especie: 'abejaruco', min: 5, max: 7, peso: 30 },
      { especie: 'mandragora', min: 5, max: 7, peso: 20 },
      { especie: 'galapago', min: 6, max: 8, peso: 10 },
    ],
  },
  pnj: [
    {
      id: 'guardia',
      nombre: 'Guardia de la Alhambra',
      x: 7,
      y: 3,
      dir: 'izquierda',
      aspecto: 'guardia_nazari',
      entrenador: 'guardia_alhambra',
      vision: 2,
      guion: [],
    },
  ],
  salidas: [
    { x: 6, y: 11, zona: 'vega', ax: 7, ay: 1, dir: 'abajo' },
    { x: 6, y: 0, zona: 'patio_leones', ax: 5, ay: 10, dir: 'arriba' },
  ],
  carteles: [{ x: 5, y: 10, texto: ['La Alhambra.', 'Palacio de los reyes nazaríes de Granada.'] }],
  ocultos: [
    { id: 'gorro', x: 2, y: 9, objeto: 'gorro_colorado' },
    { id: 'tuno', x: 11, y: 2, objeto: 'tuno' },
  ],
  recipientes: [{ id: 'adarve', x: 8, y: 4 }],
};

const PATIO_LEONES: Zona = {
  id: 'patio_leones',
  nombre: 'Patio de los Leones',
  interior: true,
  mapa: [
    'ZZZZZZZZZZZZ',
    'ZCBBBBBBBBCZ',
    'ZBBBBBBBBBBZ',
    'ZBCBBBBBBCBZ',
    'ZBBBAAAABBBZ',
    'ZBBBAAAABBBZ',
    'ZBCBBBBBBCBZ',
    'ZBBBBBBBBBBZ',
    'ZBBBBRRBBBBZ',
    'ZCBBBRRBBBCZ',
    'ZBBBBRRBBBBZ',
    'ZZZZZPZZZZZZ',
  ],
  pnj: [
    {
      id: 'boabdil',
      nombre: 'Boabdil',
      x: 5,
      y: 2,
      dir: 'abajo',
      aspecto: 'sultan',
      guion: [
        si('blason_alhambra', decir('Boabdil', 'Cuida de este patio. Doce leones lo han guardado durante más de cien años.'), [
          { tipo: 'combate', entrenador: 'boabdil' },
          si('vencido:boabdil', [
            ...decir('Boabdil', 'Toma este blasón. Que se sepa que venciste en la Alhambra.'),
            { tipo: 'blason', id: 'alhambra', nombre: 'Blasón de la Alhambra' },
            bandera('blason_alhambra'),
            ...decir(undefined, 'Un mensajero llega del real de Santa Fe con un regalo de la reina.'),
            dar('tesera_real', 1),
            ...decir('Mensajero', 'Una Tésera real, con el sello de doña Isabel. Ninguna criatura salvaje rechaza ese pacto. Úsala bien: no hay otra.'),
            {
              tipo: 'fin',
              texto: [
                '2 de enero de 1492. Boabdil entrega las llaves de Granada a los Reyes Católicos.',
                'En abril, en Santa Fe, los Reyes firman con Colón las capitulaciones de su viaje.',
                'Las leyendas de la Alhambra quedan escritas en tu Bestiario.',
                'Fin del capítulo 1 (prototipo). Continuará en 1516…',
              ],
            },
          ]),
        ]),
      ],
    },
  ],
  salidas: [{ x: 5, y: 11, zona: 'alhambra', ax: 6, ay: 1, dir: 'abajo' }],
  carteles: [],
  ocultos: [{ id: 'turron', x: 1, y: 10, objeto: 'turron' }],
};

export const ZONAS_CAPITULO_1: Zona[] = [SANTA_FE, MESON, PABELLON, VEGA, ALHAMBRA, PATIO_LEONES];

/** Dónde empieza una partida nueva. */
export const INICIO = { zona: 'santa_fe', x: 12, y: 16, dir: 'arriba' as const };
