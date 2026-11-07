// Datos de prueba: NO son contenido del juego. Nombres funcionales para que las pruebas se lean.
import type { DatosJuego, Especie, Estadisticas, Movimiento } from '../../src/core/modelo';
import { TEMPERAMENTOS } from '../../src/data/temperamentos';
import { TABLA_TIPOS } from '../../src/data/tipos';

const base = (v: number, f: number, e: number, m: number, r: number, c: number): Estadisticas => ({
  vida: v,
  fuerza: f,
  escudo: e,
  magia: m,
  resMagica: r,
  celeridad: c,
});

const aprende = (...lista: [number, string][]) => lista.map(([nivel, movimiento]) => ({ nivel, movimiento }));

const especies: Especie[] = [
  {
    id: 'agua1', nombre: 'Agua uno', tipos: ['agua'], base: base(50, 50, 50, 60, 55, 50), expBase: 60, ratioCaptura: 45,
    aprende: aprende([1, 'golpe'], [1, 'chorro'], [5, 'rugido'], [9, 'escudo'], [12, 'onda']),
    evoluciona: [{ a: 'agua2', nivel: 16 }], descripcion: '',
  },
  {
    id: 'agua2', nombre: 'Agua dos', tipos: ['agua'], base: base(70, 65, 70, 85, 75, 65), expBase: 140, ratioCaptura: 45,
    aprende: aprende([1, 'golpe'], [1, 'chorro']), descripcion: '',
  },
  {
    id: 'planta1', nombre: 'Planta uno', tipos: ['planta'], base: base(55, 55, 55, 55, 55, 45), expBase: 60, ratioCaptura: 45,
    aprende: aprende([1, 'golpe'], [1, 'hoja'], [7, 'somnifero']), descripcion: '',
  },
  {
    id: 'infernal1', nombre: 'Infernal uno', tipos: ['infernal'], base: base(45, 60, 45, 60, 45, 65), expBase: 60, ratioCaptura: 45,
    aprende: aprende([1, 'golpe'], [1, 'brasa'], [8, 'toxina']), descripcion: '',
  },
  {
    id: 'rama', nombre: 'Rama', tipos: ['comun'], base: base(55, 55, 50, 45, 65, 55), expBase: 65, ratioCaptura: 45,
    aprende: aprende([1, 'golpe']),
    evoluciona: [{ a: 'rama-agua', nivel: 20 }, { a: 'rama-planta', nivel: 20 }], descripcion: '',
  },
  { id: 'rama-agua', nombre: 'Rama agua', tipos: ['agua'], base: base(90, 65, 60, 110, 95, 65), expBase: 180, ratioCaptura: 45, aprende: aprende([1, 'golpe']), descripcion: '' },
  { id: 'rama-planta', nombre: 'Rama planta', tipos: ['planta'], base: base(65, 110, 130, 60, 65, 95), expBase: 180, ratioCaptura: 45, aprende: aprende([1, 'golpe']), descripcion: '' },
  {
    id: 'fantasma', nombre: 'Fantasma', tipos: ['espectral'], base: base(40, 40, 40, 70, 40, 80), expBase: 60, ratioCaptura: 190,
    aprende: aprende([1, 'onda']), descripcion: '',
  },
];

const mov = (m: Movimiento): Movimiento => m;
const movimientos: Movimiento[] = [
  mov({ id: 'golpe', nombre: 'Golpe', tipo: 'comun', categoria: 'fisico', poder: 40, precision: 100, pp: 35 }),
  mov({ id: 'chorro', nombre: 'Chorro', tipo: 'agua', categoria: 'magico', poder: 40, precision: 100, pp: 25 }),
  mov({ id: 'hoja', nombre: 'Hoja', tipo: 'planta', categoria: 'fisico', poder: 40, precision: 100, pp: 25 }),
  mov({ id: 'brasa', nombre: 'Brasa', tipo: 'infernal', categoria: 'magico', poder: 40, precision: 100, pp: 25, efectos: [{ tipo: 'estado', estado: 'quemado', prob: 10 }] }),
  mov({ id: 'rugido', nombre: 'Rugido', tipo: 'comun', categoria: 'estado', poder: 0, precision: 100, pp: 40, objetivo: 'rivales', efectos: [{ tipo: 'etapa', a: 'objetivo', estadistica: 'fuerza', cambio: -1, prob: 100 }] }),
  mov({ id: 'escudo', nombre: 'Escudo', tipo: 'comun', categoria: 'estado', poder: 0, precision: null, pp: 10, prioridad: 4, objetivo: 'propio', efectos: [{ tipo: 'proteger' }] }),
  mov({ id: 'onda', nombre: 'Onda', tipo: 'comun', categoria: 'magico', poder: 50, precision: 100, pp: 15, objetivo: 'rivales' }),
  mov({ id: 'somnifero', nombre: 'Somnífero', tipo: 'planta', categoria: 'estado', poder: 0, precision: 75, pp: 15, efectos: [{ tipo: 'estado', estado: 'dormido', prob: 100 }] }),
  mov({ id: 'toxina', nombre: 'Toxina', tipo: 'comun', categoria: 'estado', poder: 0, precision: 90, pp: 10, efectos: [{ tipo: 'estado', estado: 'intoxicado', prob: 100 }] }),
  mov({ id: 'carga', nombre: 'Carga', tipo: 'comun', categoria: 'fisico', poder: 40, precision: 100, pp: 20, efectos: [{ tipo: 'etapa', a: 'propio', estadistica: 'fuerza', cambio: 1, prob: 100 }] }),
  mov({ id: 'rapido', nombre: 'Rápido', tipo: 'comun', categoria: 'fisico', poder: 40, precision: 100, pp: 30, prioridad: 1, efectos: [{ tipo: 'retroceso', prob: 100 }] }),
];

export const DATOS_PRUEBA: DatosJuego = {
  especies: Object.fromEntries(especies.map((e) => [e.id, e])),
  movimientos: Object.fromEntries(movimientos.map((m) => [m.id, m])),
  temperamentos: TEMPERAMENTOS,
  tipos: TABLA_TIPOS,
  objetos: {
    basica: { id: 'basica', nombre: 'Captura básica', descripcion: '', tipo: 'captura', bonus: 1, precio: 200 },
    pocion: { id: 'pocion', nombre: 'Poción', descripcion: '', tipo: 'curar', cantidad: 20, precio: 300 },
    antidoto: { id: 'antidoto', nombre: 'Antídoto', descripcion: '', tipo: 'remedio', estados: ['envenenado', 'intoxicado'], precio: 100 },
    revivir: { id: 'revivir', nombre: 'Revivir', descripcion: '', tipo: 'revivir', fraccion: 0.5 },
    paquete: { id: 'paquete', nombre: 'Paquete', descripcion: '', tipo: 'clave' },
  },
};
