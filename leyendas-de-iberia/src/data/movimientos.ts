import type { Movimiento } from '../core/modelo';
import type { TipoId } from './tipos';

type DefMovimiento = Omit<Movimiento, 'id' | 'tipo'> & { tipo: TipoId };

const MOVIMIENTOS_DEF = {
  // Común
  topetazo: { nombre: 'Topetazo', tipo: 'comun', categoria: 'fisico', poder: 40, precision: 100, pp: 35 },
  acometida: { nombre: 'Acometida', tipo: 'comun', categoria: 'fisico', poder: 40, precision: 100, pp: 30, prioridad: 1, descripcion: 'Ataca siempre primero.' },
  dentellada: { nombre: 'Dentellada', tipo: 'comun', categoria: 'fisico', poder: 60, precision: 100, pp: 25 },
  tenaza: { nombre: 'Tenaza', tipo: 'comun', categoria: 'fisico', poder: 55, precision: 100, pp: 30 },
  bramido: {
    nombre: 'Bramido', tipo: 'comun', categoria: 'estado', poder: 0, precision: 100, pp: 40,
    efectos: [{ tipo: 'etapa', objetivo: 'rival', estadistica: 'fuerza', cambio: -1, prob: 100 }],
    descripcion: 'Baja la Fuerza del rival.',
  },
  desplante: {
    nombre: 'Desplante', tipo: 'comun', categoria: 'estado', poder: 0, precision: 100, pp: 30,
    efectos: [{ tipo: 'etapa', objetivo: 'rival', estadistica: 'escudo', cambio: -1, prob: 100 }],
    descripcion: 'Baja el Escudo del rival.',
  },

  // Infernal
  rescoldo: {
    nombre: 'Rescoldo', tipo: 'infernal', categoria: 'magico', poder: 40, precision: 100, pp: 25,
    efectos: [{ tipo: 'estado', estado: 'quemado', prob: 10 }],
  },
  cornada_ardiente: {
    nombre: 'Cornada ardiente', tipo: 'infernal', categoria: 'fisico', poder: 70, precision: 100, pp: 15,
    efectos: [{ tipo: 'estado', estado: 'quemado', prob: 10 }],
  },
  hoguera: {
    nombre: 'Hoguera', tipo: 'infernal', categoria: 'magico', poder: 90, precision: 85, pp: 5,
    efectos: [{ tipo: 'estado', estado: 'quemado', prob: 10 }],
  },
  colada: {
    nombre: 'Colada', tipo: 'infernal', categoria: 'fisico', poder: 100, precision: 85, pp: 5,
    efectos: [{ tipo: 'estado', estado: 'quemado', prob: 10 }],
    descripcion: 'Embiste como una lengua de lava.',
  },
  tizne: {
    nombre: 'Tizne', tipo: 'infernal', categoria: 'estado', poder: 0, precision: 85, pp: 15,
    efectos: [{ tipo: 'estado', estado: 'quemado', prob: 100 }],
    descripcion: 'Quema al rival.',
  },

  // Agua
  rociada: { nombre: 'Rociada', tipo: 'agua', categoria: 'magico', poder: 40, precision: 100, pp: 25 },
  marejada: { nombre: 'Marejada', tipo: 'agua', categoria: 'magico', poder: 65, precision: 100, pp: 20 },
  golpe_de_mar: { nombre: 'Golpe de mar', tipo: 'agua', categoria: 'fisico', poder: 80, precision: 90, pp: 15 },
  brazada: {
    nombre: 'Brazada', tipo: 'agua', categoria: 'fisico', poder: 40, precision: 100, pp: 30, prioridad: 1,
    descripcion: 'Nada con las patas remo y ataca siempre primero.',
  },
  caparazon: {
    nombre: 'Caparazón', tipo: 'agua', categoria: 'estado', poder: 0, precision: null, pp: 20,
    efectos: [{ tipo: 'etapa', objetivo: 'propio', estadistica: 'escudo', cambio: 1, prob: 100 }],
    descripcion: 'Sube el propio Escudo.',
  },
  camuflaje_algas: {
    nombre: 'Camuflaje de algas', tipo: 'agua', categoria: 'estado', poder: 0, precision: null, pp: 15,
    efectos: [
      { tipo: 'etapa', objetivo: 'propio', estadistica: 'escudo', cambio: 1, prob: 100 },
      { tipo: 'etapa', objetivo: 'propio', estadistica: 'resMagica', cambio: 1, prob: 100 },
    ],
    descripcion: 'Se cubre de algas: sube el propio Escudo y la Resistencia mágica.',
  },
  remanso: {
    nombre: 'Remanso', tipo: 'agua', categoria: 'estado', poder: 0, precision: null, pp: 10,
    efectos: [{ tipo: 'curar', fraccion: 0.5 }],
    descripcion: 'Recupera la mitad de la Vida.',
  },

  // Acero
  tajo: { nombre: 'Tajo', tipo: 'acero', categoria: 'fisico', poder: 70, precision: 95, pp: 15 },
  coraza: {
    nombre: 'Coraza', tipo: 'acero', categoria: 'estado', poder: 0, precision: null, pp: 15,
    efectos: [{ tipo: 'etapa', objetivo: 'propio', estadistica: 'escudo', cambio: 2, prob: 100 }],
    descripcion: 'Sube mucho el propio Escudo.',
  },

  // Planta
  varazo: { nombre: 'Varazo', tipo: 'planta', categoria: 'fisico', poder: 45, precision: 100, pp: 25 },
  hojarasca: { nombre: 'Hojarasca', tipo: 'planta', categoria: 'magico', poder: 55, precision: 100, pp: 25 },
  savia_de_dragon: {
    nombre: 'Savia de dragón', tipo: 'planta', categoria: 'magico', poder: 60, precision: 100, pp: 15,
    efectos: [{ tipo: 'drenar', fraccion: 0.5 }],
    descripcion: 'Recupera la mitad del daño causado.',
  },
  sopor: {
    nombre: 'Sopor', tipo: 'planta', categoria: 'estado', poder: 0, precision: 75, pp: 15,
    efectos: [{ tipo: 'estado', estado: 'dormido', prob: 100 }],
    descripcion: 'Duerme al rival.',
  },

  // Ancestral
  resina_roja: {
    nombre: 'Resina roja', tipo: 'planta', categoria: 'estado', poder: 0, precision: null, pp: 10,
    efectos: [{ tipo: 'curar', fraccion: 0.5 }],
    descripcion: 'La sangre de drago, que se usó como remedio. Recupera la mitad de la Vida.',
  },

  ira_ancestral: { nombre: 'Ira ancestral', tipo: 'ancestral', categoria: 'magico', poder: 85, precision: 100, pp: 10 },

  // Aire
  aletazo: { nombre: 'Aletazo', tipo: 'aire', categoria: 'fisico', poder: 40, precision: 100, pp: 35 },
  picada: { nombre: 'Picada', tipo: 'aire', categoria: 'fisico', poder: 65, precision: 95, pp: 20 },
  ventolera: { nombre: 'Ventolera', tipo: 'aire', categoria: 'magico', poder: 55, precision: 100, pp: 25 },
  revoloteo: {
    nombre: 'Revoloteo', tipo: 'aire', categoria: 'estado', poder: 0, precision: null, pp: 30,
    efectos: [{ tipo: 'etapa', objetivo: 'propio', estadistica: 'celeridad', cambio: 1, prob: 100 }],
    descripcion: 'Sube la propia Celeridad.',
  },

  // Oscuridad
  trastada: { nombre: 'Trastada', tipo: 'oscuridad', categoria: 'fisico', poder: 40, precision: 100, pp: 25 },
  mal_de_ojo: {
    nombre: 'Mal de ojo', tipo: 'oscuridad', categoria: 'magico', poder: 65, precision: 100, pp: 15,
    efectos: [{ tipo: 'etapa', objetivo: 'rival', estadistica: 'resMagica', cambio: -1, prob: 20 }],
  },
  tapazo: { nombre: 'Tapazo', tipo: 'acero', categoria: 'fisico', poder: 85, precision: 90, pp: 15, descripcion: 'Cierra la tapa como una mandíbula.' },
  escondite: {
    nombre: 'Escondite',
    tipo: 'oscuridad',
    categoria: 'estado',
    poder: 0,
    precision: null,
    pp: 10,
    descripcion: 'Se mete dentro de sí mismo y se protege.',
    efectos: [
      { tipo: 'etapa', objetivo: 'propio', estadistica: 'escudo', cambio: 1, prob: 100 },
      { tipo: 'etapa', objetivo: 'propio', estadistica: 'resMagica', cambio: 1, prob: 100 },
    ],
  },
  tarea_imposible: {
    nombre: 'Tarea imposible', tipo: 'oscuridad', categoria: 'estado', poder: 0, precision: 90, pp: 15,
    efectos: [
      { tipo: 'etapa', objetivo: 'rival', estadistica: 'fuerza', cambio: -1, prob: 100 },
      { tipo: 'etapa', objetivo: 'rival', estadistica: 'celeridad', cambio: -1, prob: 100 },
    ],
    descripcion: 'Le encarga al rival una tarea que nunca acaba: baja su Fuerza y su Celeridad.',
  },
  emboscada: { nombre: 'Emboscada', tipo: 'oscuridad', categoria: 'fisico', poder: 70, precision: 100, pp: 15 },

  // Mental
  mocarabe: {
    nombre: 'Mocárabe', tipo: 'luz', categoria: 'magico', poder: 80, precision: 100, pp: 15,
    descripcion: 'Un rayo de luz que se quiebra en mil celdas, como una cúpula de mocárabes.',
  },
  amanecer: {
    nombre: 'Amanecer', tipo: 'luz', categoria: 'estado', poder: 0, precision: null, pp: 10,
    efectos: [{ tipo: 'curar', fraccion: 0.5 }],
    descripcion: 'Recupera la mitad de la Vida.',
  },

  alarido: {
    nombre: 'Alarido', tipo: 'mental', categoria: 'magico', poder: 60, precision: 100, pp: 20,
    efectos: [{ tipo: 'etapa', objetivo: 'rival', estadistica: 'fuerza', cambio: -1, prob: 10 }],
  },

  // Tierra
  terronazo: { nombre: 'Terronazo', tipo: 'tierra', categoria: 'fisico', poder: 55, precision: 95, pp: 20 },
  polvareda: { nombre: 'Polvareda', tipo: 'tierra', categoria: 'magico', poder: 45, precision: 100, pp: 25 },
  // Capítulo 2 (Toledo y Castilla)
  zarpazo: { nombre: 'Zarpazo', tipo: 'comun', categoria: 'fisico', poder: 50, precision: 100, pp: 30 },
  pisoton: {
    nombre: 'Pisotón', tipo: 'comun', categoria: 'fisico', poder: 65, precision: 95, pp: 20,
    efectos: [{ tipo: 'retroceso', prob: 30 }],
  },
  aullido: {
    nombre: 'Aullido', tipo: 'comun', categoria: 'estado', poder: 0, precision: null, pp: 30,
    efectos: [{ tipo: 'etapa', objetivo: 'propio', estadistica: 'fuerza', cambio: 1, prob: 100 }],
    descripcion: 'Sube la Fuerza propia.',
  },
  rueda: {
    nombre: 'Rueda', tipo: 'comun', categoria: 'estado', poder: 0, precision: null, pp: 20,
    efectos: [
      { tipo: 'etapa', objetivo: 'propio', estadistica: 'escudo', cambio: 1, prob: 100 },
      { tipo: 'etapa', objetivo: 'propio', estadistica: 'resMagica', cambio: 1, prob: 100 },
    ],
    descripcion: 'Se hincha como la avutarda en celo: sube el Escudo y la Resistencia mágica propios.',
  },
  erizarse: {
    nombre: 'Erizarse', tipo: 'comun', categoria: 'estado', poder: 0, precision: null, pp: 20,
    efectos: [{ tipo: 'etapa', objetivo: 'propio', estadistica: 'escudo', cambio: 2, prob: 100 }],
    descripcion: 'Se enrosca con las púas de punta: sube mucho el Escudo propio.',
  },
  bola_de_puas: { nombre: 'Bola de púas', tipo: 'comun', categoria: 'fisico', poder: 60, precision: 100, pp: 25 },
  cantazo: { nombre: 'Cantazo', tipo: 'tierra', categoria: 'fisico', poder: 75, precision: 90, pp: 15 },
  temblor: { nombre: 'Temblor', tipo: 'tierra', categoria: 'magico', poder: 70, precision: 100, pp: 15 },
  molienda: {
    nombre: 'Molienda', tipo: 'tierra', categoria: 'fisico', poder: 75, precision: 100, pp: 15,
    efectos: [{ tipo: 'etapa', objetivo: 'rival', estadistica: 'escudo', cambio: -1, prob: 30 }],
  },
  compactar: {
    nombre: 'Compactar', tipo: 'tierra', categoria: 'estado', poder: 0, precision: null, pp: 15,
    efectos: [{ tipo: 'etapa', objetivo: 'propio', estadistica: 'escudo', cambio: 2, prob: 100 }],
    descripcion: 'Se apelmaza como la tierra pisada: sube mucho el Escudo propio.',
  },
  colmillo_sombrio: {
    nombre: 'Colmillo sombrío', tipo: 'oscuridad', categoria: 'fisico', poder: 60, precision: 100, pp: 25,
    efectos: [{ tipo: 'retroceso', prob: 30 }],
  },
  noche_cerrada: {
    nombre: 'Noche cerrada', tipo: 'oscuridad', categoria: 'magico', poder: 80, precision: 100, pp: 15,
    efectos: [{ tipo: 'cegar', prob: 20 }],
  },
  vuelo_real: { nombre: 'Vuelo real', tipo: 'aire', categoria: 'fisico', poder: 90, precision: 90, pp: 10 },
  // Capítulo 3 (El Escorial, Sevilla y el Guadalquivir): los primeros de Eléctrico y de Plasma.
  chispazo: {
    nombre: 'Chispazo', tipo: 'electrico', categoria: 'magico', poder: 40, precision: 100, pp: 30,
    efectos: [{ tipo: 'estado', estado: 'paralizado', prob: 10 }],
  },
  descarga: {
    nombre: 'Descarga', tipo: 'electrico', categoria: 'magico', poder: 80, precision: 100, pp: 15,
    efectos: [{ tipo: 'estado', estado: 'paralizado', prob: 10 }],
    descripcion: 'Suelta de golpe la electricidad que guarda, como la tremielga.',
  },
  calambre: {
    nombre: 'Calambre', tipo: 'electrico', categoria: 'estado', poder: 0, precision: 90, pp: 20,
    efectos: [{ tipo: 'estado', estado: 'paralizado', prob: 100 }],
    descripcion: 'Un calambre que deja paralizado al rival.',
  },
  fuego_de_san_telmo: {
    nombre: 'Fuego de San Telmo', tipo: 'plasma', categoria: 'magico', poder: 65, precision: 100, pp: 20,
    efectos: [{ tipo: 'etapa', objetivo: 'propio', estadistica: 'magia', cambio: 1, prob: 20 }],
    descripcion: 'Penachos de luz azulada que no queman, como los que ven los marineros en los mástiles. Pueden subirle la Magia.',
  },
  corona: {
    nombre: 'Corona', tipo: 'plasma', categoria: 'magico', poder: 95, precision: 90, pp: 10,
    descripcion: 'Un halo de plasma que estalla alrededor de quien lo lanza.',
  },
  estela_fantasma: {
    nombre: 'Estela fantasma', tipo: 'espectral', categoria: 'magico', poder: 50, precision: 100, pp: 25,
    efectos: [{ tipo: 'etapa', objetivo: 'propio', estadistica: 'celeridad', cambio: 1, prob: 100 }],
    descripcion: 'Pasa como una sombra de agua y gana velocidad.',
  },
  resaca: {
    nombre: 'Resaca', tipo: 'agua', categoria: 'magico', poder: 80, precision: 100, pp: 15,
    efectos: [{ tipo: 'etapa', objetivo: 'rival', estadistica: 'celeridad', cambio: -1, prob: 30 }],
    descripcion: 'La corriente de vuelta de las olas arrastra al rival: puede bajarle la Celeridad.',
  },
  vuelo_rasante: {
    nombre: 'Vuelo rasante', tipo: 'aire', categoria: 'fisico', poder: 40, precision: 100, pp: 30, prioridad: 1,
    descripcion: 'Ataca siempre primero.',
  },
  hoz_de_viento: { nombre: 'Hoz de viento', tipo: 'aire', categoria: 'fisico', poder: 85, precision: 95, pp: 15 },
  acecho: {
    nombre: 'Acecho', tipo: 'mental', categoria: 'estado', poder: 0, precision: null, pp: 20,
    efectos: [{ tipo: 'etapa', objetivo: 'propio', estadistica: 'celeridad', cambio: 2, prob: 100 }],
    descripcion: 'Espera agazapado y lee al rival: sube mucho la Celeridad.',
  },
  vuelo_silencioso: {
    nombre: 'Vuelo silencioso', tipo: 'oscuridad', categoria: 'fisico', poder: 60, precision: 100, pp: 20,
    efectos: [{ tipo: 'retroceso', prob: 20 }],
    descripcion: 'Cae sin hacer ruido: el rival puede retroceder.',
  },
  ulular: {
    nombre: 'Ulular', tipo: 'mental', categoria: 'estado', poder: 0, precision: 70, pp: 15,
    efectos: [{ tipo: 'estado', estado: 'dormido', prob: 100 }],
    descripcion: 'Un ulular grave y lento que duerme al rival.',
  },

  // Los de las MO: también se usan fuera de combate. Pleamar es el Surf del género; su `id`
  // se queda en `surf`.
  surf: {
    nombre: 'Pleamar', tipo: 'agua', categoria: 'magico', poder: 90, precision: 100, pp: 15,
    descripcion: 'La mar sube en su punto más alto y rompe contra el rival. Fuera de combate, la pleamar te lleva por ríos y mares.',
  },
  vuelo: {
    nombre: 'Vuelo', tipo: 'aire', categoria: 'fisico', poder: 90, precision: 95, pp: 15,
    descripcion: 'Sube muy alto y cae en picado. Fuera de combate, te lleva volando a un lugar que ya conoces.',
  },
  resplandor: {
    nombre: 'Resplandor', tipo: 'luz', categoria: 'magico', poder: 60, precision: 100, pp: 20,
    efectos: [{ tipo: 'cegar', prob: 20 }],
  },
  lamento: {
    nombre: 'Lamento', tipo: 'espectral', categoria: 'magico', poder: 65, precision: 100, pp: 15,
    efectos: [{ tipo: 'etapa', objetivo: 'rival', estadistica: 'fuerza', cambio: -1, prob: 20 }],
  },
  tarantela: {
    nombre: 'Tarantela', tipo: 'mental', categoria: 'magico', poder: 55, precision: 100, pp: 20,
    efectos: [{ tipo: 'estado', estado: 'dormido', prob: 20 }],
    descripcion: 'Un baile que agota: puede dormir al rival.',
  },
  hoja_toledana: { nombre: 'Hoja toledana', tipo: 'acero', categoria: 'fisico', poder: 75, precision: 100, pp: 15 },

  // Estados alterados, ceguera, retroceso, drenadoras y protección.
  testarazo: {
    nombre: 'Testarazo', tipo: 'comun', categoria: 'fisico', poder: 70, precision: 100, pp: 15,
    efectos: [{ tipo: 'retroceso', prob: 30 }],
    descripcion: 'Un cabezazo que puede hacer retroceder al rival.',
  },
  peso_muerto: {
    nombre: 'Peso muerto', tipo: 'comun', categoria: 'fisico', poder: 85, precision: 100, pp: 15,
    efectos: [{ tipo: 'estado', estado: 'paralizado', prob: 30 }],
    descripcion: 'Se deja caer con todo su peso sobre el rival.',
  },
  colmillo_venenoso: {
    nombre: 'Colmillo venenoso', tipo: 'oscuridad', categoria: 'fisico', poder: 50, precision: 100, pp: 15,
    efectos: [{ tipo: 'estado', estado: 'envenenado', prob: 30 }],
  },
  ponzona: {
    nombre: 'Ponzoña', tipo: 'oscuridad', categoria: 'estado', poder: 0, precision: 90, pp: 10,
    efectos: [{ tipo: 'estado', estado: 'intoxicado', prob: 100 }],
    descripcion: 'Un veneno que hace más daño cada turno.',
  },
  polvo_urticante: {
    nombre: 'Polvo urticante', tipo: 'planta', categoria: 'estado', poder: 0, precision: 75, pp: 30,
    efectos: [{ tipo: 'estado', estado: 'paralizado', prob: 100 }],
    descripcion: 'Suelta un polvo que entumece.',
  },
  desvario: {
    nombre: 'Desvarío', tipo: 'mental', categoria: 'estado', poder: 0, precision: 90, pp: 10,
    efectos: [{ tipo: 'estado', estado: 'colera', prob: 100 }],
    descripcion: 'Le hace perder el juicio: monta en cólera.',
  },
  ofuscacion: {
    nombre: 'Ofuscación', tipo: 'mental', categoria: 'magico', poder: 50, precision: 100, pp: 25,
    efectos: [{ tipo: 'estado', estado: 'colera', prob: 10 }],
  },
  destello: {
    nombre: 'Destello', tipo: 'luz', categoria: 'estado', poder: 0, precision: 90, pp: 20,
    efectos: [{ tipo: 'cegar', prob: 100 }],
    descripcion: 'Un fogonazo de luz que deja cegado al rival.',
  },
  tiniebla: {
    nombre: 'Tiniebla', tipo: 'oscuridad', categoria: 'estado', poder: 0, precision: 90, pp: 15,
    efectos: [{ tipo: 'cegar', prob: 100 }],
    descripcion: 'Lo envuelve en una oscuridad tan cerrada que no ve nada.',
  },
  muerdago: {
    nombre: 'Muérdago', tipo: 'planta', categoria: 'estado', poder: 0, precision: 90, pp: 10,
    efectos: [{ tipo: 'drenadoras' }],
    descripcion: 'Le planta muérdago, que vive de chuparle la savia.',
  },
  rodela: {
    nombre: 'Rodela', tipo: 'comun', categoria: 'estado', poder: 0, precision: null, pp: 10, prioridad: 4,
    efectos: [{ tipo: 'proteger' }],
    descripcion: 'Se cubre con un escudo redondo, como los rodeleros.',
  },
} satisfies Record<string, DefMovimiento>;

export type MovimientoId = keyof typeof MOVIMIENTOS_DEF;

export const MOVIMIENTOS: Record<string, Movimiento> = Object.fromEntries(
  Object.entries(MOVIMIENTOS_DEF).map(([id, m]) => [id, { id, ...m } as Movimiento]),
);
