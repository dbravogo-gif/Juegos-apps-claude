// Fichas de aspecto (ARTE.md, «Generador de criaturas»). Por ahora, las de la prueba de arte F04:
// las tres iniciales (Agua, Planta e Infernal) en su primera forma y la segunda forma de la de
// Planta. Sin nombres todavía: los propone Claude antes de la tanda 3 (ESTADO.md).
import { evolucionar, type AspectoCriatura } from '../core/aspecto';

export const INICIAL_PLANTA: AspectoCriatura = {
  id: 'inicial-planta-1',
  tipo: 'planta',
  secundario: 0xd4ec74,
  escala: 0.95,
  anguloso: 0,
  cuerpo: { forma: 'pera', ancho: 1, alto: 0.92 },
  ojos: { tamano: 0.17, separacion: 0.42, altura: 0.6 },
  boca: 'sonrisa',
  mejillas: true,
  vientre: true,
  patron: { tipo: 'manchas', color: 'oscuro', escala: 2.2 },
  piezas: {
    copete: { forma: 'hoja', tamano: 0.5, cantidad: 2, color: 'secundario' },
    patas: { tamano: 0.24, color: 'oscuro' },
  },
};

export const INICIAL_PLANTA_2: AspectoCriatura = evolucionar(INICIAL_PLANTA, {
  id: 'inicial-planta-2',
  crecer: 1.35,
  masAnguloso: 0.4,
  ojos: { tamano: 0.145 },
  piezas: {
    copete: { forma: 'hoja', tamano: 0.62, cantidad: 3, color: 'secundario' },
    cresta: { forma: 'hoja', tamano: 0.3, cantidad: 3, color: 'secundario' },
    orejas: { forma: 'puntiaguda', tamano: 0.3, color: 'secundario' },
    brazos: { tamano: 0.2, color: 'principal' },
  },
});

export const INICIAL_AGUA: AspectoCriatura = {
  id: 'inicial-agua-1',
  tipo: 'agua',
  secundario: 0xa6f2e8,
  escala: 1.05,
  anguloso: 0,
  cuerpo: { forma: 'gota', ancho: 0.95, alto: 1.05 },
  ojos: { tamano: 0.18, separacion: 0.46, altura: 0.42 },
  boca: 'sonrisa',
  mejillas: true,
  vientre: true,
  patron: { tipo: 'rayas', color: 'claro', escala: 2.8 },
  piezas: {
    aletas: { tamano: 0.42, color: 'secundario' },
    cola: { forma: 'aleta', tamano: 0.5, color: 'secundario' },
    patas: { tamano: 0.22, color: 'principal' },
  },
};

export const INICIAL_INFERNAL: AspectoCriatura = {
  id: 'inicial-infernal-1',
  tipo: 'infernal',
  secundario: 0xff8a2a,
  escala: 1,
  anguloso: 0.1,
  cuerpo: { forma: 'capsula', ancho: 0.82, alto: 0.6 },
  ojos: { tamano: 0.2, separacion: 0.5, altura: 0.5 },
  boca: 'colmillos',
  mejillas: false,
  vientre: true,
  patron: { tipo: 'degradado', color: 'oscuro', escala: 1 },
  piezas: {
    cabeza: { tamano: 0.82 },
    copete: { forma: 'llama', tamano: 0.75, cantidad: 1, color: 'secundario' },
    orejas: { forma: 'puntiaguda', tamano: 0.3, color: 'oscuro' },
    cola: { forma: 'punta', tamano: 0.5, color: 'principal' },
    patas: { tamano: 0.24, color: 'oscuro' },
  },
};

/** Las cuatro de la prueba de arte, en el orden de la vitrina. */
export const ASPECTOS_PRUEBA: readonly AspectoCriatura[] = [
  INICIAL_PLANTA,
  INICIAL_PLANTA_2,
  INICIAL_AGUA,
  INICIAL_INFERNAL,
];
