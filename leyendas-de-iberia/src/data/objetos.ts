import type { Objeto } from '../core/modelo';

export const OBJETOS: Record<string, Objeto> = {
  tesera: {
    id: 'tesera',
    nombre: 'Tésera',
    tipo: 'captura',
    bonus: 1,
    descripcion: 'Pacto de bronce, como los de hospitalidad celtíberos. Sirve para capturar criaturas salvajes.',
  },
  fosil_colmillo: {
    id: 'fosil_colmillo',
    nombre: 'Colmillo de sable',
    tipo: 'clave',
    descripcion: 'Un colmillo enorme y curvo encontrado en Orce. Quizá algún sabio sepa qué bestia lo llevaba.',
  },
  unguento: {
    id: 'unguento',
    nombre: 'Ungüento',
    tipo: 'curar',
    cantidad: 20,
    descripcion: 'Devuelve 20 puntos de Vida.',
  },
};
