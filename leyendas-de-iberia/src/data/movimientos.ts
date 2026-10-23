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
  tizne: {
    nombre: 'Tizne', tipo: 'infernal', categoria: 'estado', poder: 0, precision: 85, pp: 15,
    efectos: [{ tipo: 'estado', estado: 'quemado', prob: 100 }],
    descripcion: 'Quema al rival.',
  },

  // Agua
  rociada: { nombre: 'Rociada', tipo: 'agua', categoria: 'magico', poder: 40, precision: 100, pp: 25 },
  marejada: { nombre: 'Marejada', tipo: 'agua', categoria: 'magico', poder: 65, precision: 100, pp: 20 },
  golpe_de_mar: { nombre: 'Golpe de mar', tipo: 'agua', categoria: 'fisico', poder: 80, precision: 90, pp: 15 },
  caparazon: {
    nombre: 'Caparazón', tipo: 'agua', categoria: 'estado', poder: 0, precision: null, pp: 20,
    efectos: [{ tipo: 'etapa', objetivo: 'propio', estadistica: 'escudo', cambio: 1, prob: 100 }],
    descripcion: 'Sube el propio Escudo.',
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
  emboscada: { nombre: 'Emboscada', tipo: 'oscuridad', categoria: 'fisico', poder: 70, precision: 100, pp: 15 },

  // Mental
  alarido: {
    nombre: 'Alarido', tipo: 'mental', categoria: 'magico', poder: 60, precision: 100, pp: 20,
    efectos: [{ tipo: 'etapa', objetivo: 'rival', estadistica: 'fuerza', cambio: -1, prob: 10 }],
  },

  // Tierra
  terronazo: { nombre: 'Terronazo', tipo: 'tierra', categoria: 'fisico', poder: 55, precision: 95, pp: 20 },
  polvareda: { nombre: 'Polvareda', tipo: 'tierra', categoria: 'magico', poder: 45, precision: 100, pp: 25 },
} satisfies Record<string, DefMovimiento>;

export type MovimientoId = keyof typeof MOVIMIENTOS_DEF;

export const MOVIMIENTOS: Record<string, Movimiento> = Object.fromEntries(
  Object.entries(MOVIMIENTOS_DEF).map(([id, m]) => [id, { id, ...m } as Movimiento]),
);
