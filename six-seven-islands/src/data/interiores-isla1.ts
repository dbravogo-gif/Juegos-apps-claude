// Los interiores de la isla 1: uno por edificio, generado a partir de su exterior (autor,
// 2026-11-10; `generar-interior.ts`). Las casas grandes por fuera lo son por dentro, y las de dos
// plantas (las de balcones de la capital) tienen escalera con juguetes delante. Aquí va solo lo
// propio de cada sala: su nombre y quién vive o trabaja en ella. Las frases de los vecinos
// nuevos son provisionales.

import { construirMundo, deClave, edificios, type Casilla, type DefInterior, type DefIsla, type DefZona, type Personaje } from '../core/mundo';
import { ISLA_1, PUERTAS_ISLA1 } from './isla1';
import { generarInterior, type InteriorGenerado, type TipoSala } from './generar-interior';
import { GIMNASIO_ROCA } from './gimnasio-roca';

/** La partida empieza dentro de casa: mamá te manda al museo (probador, 2026-11-08). */
export const SALA_INICIAL = 'casa-jugador';

export interface DefSala {
  nombre: string;
  gente: (s: InteriorGenerado) => Personaje[];
}

export const vive = (id: string, frase?: string) => (s: InteriorGenerado): Personaje[] => [{ id, x: s.residente.x, y: s.residente.y, mira: 's', ...(frase ? { frase } : {}) }];

const SALAS: Record<string, DefSala> = {
  museo: {
    nombre: 'Museo de las cinco leyendas',
    gente: (s) => [
      // Cinco pedestales, uno por inicial, en el orden del círculo de las naciones: cada una
      // lucha contra la de su derecha y la última contra la primera (autor, 2026-11-13).
      ...['planta', 'infernal', 'roca', 'tierra', 'agua'].map((t, i) => ({ id: `estatua-${t}`, x: s.estatuas[i].x, y: s.estatuas[i].y, mira: 's' as const })),
      { id: 'doctora', x: s.residente.x, y: s.residente.y, mira: 's' },
      { id: 'informatico', x: s.ordenador!.x, y: s.ordenador!.y, mira: 'o' },
    ],
  },
  'casa-jugador': { nombre: 'Tu casa', gente: vive('madre') },
  'casa-vecina': { nombre: 'Casa de unos vecinos', gente: vive('vecina-casa') },
  'casa-geria-1': { nombre: 'Casa de La Geria', gente: vive('vecino-geria', 'Aquí cada vid tiene su hoyo y su muro de piedra. Sin ellos, el viento se lo llevaría todo.') },
  'casa-geria-2': { nombre: 'Casa de La Geria', gente: vive('vecina-geria', 'Mi abuelo decía que el picón guarda el rocío de la noche para las plantas.') },
  'refugio-geria': { nombre: 'Refugio de La Geria', gente: vive('enfermera') },
  'tienda-geria': { nombre: 'Tienda de La Geria', gente: vive('tendero') },
  'refugio-capital': { nombre: 'Refugio de la capital', gente: vive('enfermera-capital') },
  gimnasio: { nombre: 'Gimnasio de Roca', gente: vive('lider-gimnasio') },
  'casa-capital-1': { nombre: 'Casa de la capital', gente: vive('vecino-capital-1', 'Desde el balcón se ve el puerto. Hoy no ha salido ningún barco.') },
  'casa-capital-2': { nombre: 'Casa de la capital', gente: vive('vecina-capital-2', '¿Vas al gimnasio? La líder entrena desde que sale el sol.') },
  'casa-capital-3': { nombre: 'Casa de la capital', gente: vive('nino-capital', '¡Arriba están mis juguetes! No subas, que lo tengo todo ordenado.') },
  'casa-capital-4': { nombre: 'Casa de la capital', gente: vive('vecino-capital-4', 'Dicen que desde el faro, de noche, se ve una isla que no sale en los mapas.') },
};

const TIPO: Partial<Record<Casilla, TipoSala>> = { C: 'casa', R: 'refugio', S: 'tienda', G: 'gimnasio', M: 'museo' };

/** Las casas de balcones (la capital) tienen dos plantas; el museo y el gimnasio, un salón. */
function plantasDe(z: DefZona, tipo: TipoSala): 1 | 2 {
  const balcones = z.casas === 'balcones' || z.casas === 'balcones-blanca' || (!z.casas && z.id === 'capital');
  return balcones && tipo !== 'gimnasio' && tipo !== 'museo' ? 2 : 1;
}

/** Número estable a partir de un texto, para variar los muebles entre casas. */
const semillaDe = (id: string) => [...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

/**
 * Los interiores de una isla: uno por edificio con puerta y sala conocida, generado a partir de su
 * exterior; los de `aMano` (los gimnasios) se usan tal cual.
 */
export function generarInteriores(
  isla: DefIsla,
  puertasIsla: Readonly<Record<string, Readonly<Record<string, string>>>>,
  salas: Readonly<Record<string, DefSala>>,
  aMano: readonly DefInterior[] = [],
): DefInterior[] {
  const m = construirMundo(isla);
  const res: DefInterior[] = [];
  const hechas = new Set<string>();
  for (const z of isla.zonas) {
    const puertas = puertasIsla[z.id] ?? {};
    for (const e of edificios(m, z.id)) {
      const tipo = TIPO[e.tipo];
      const k = e.puertas[0];
      if (k === undefined) continue;
      const [x, y] = deClave(k);
      const id = puertas[`${x - z.origen.x},${y - z.origen.y}`];
      const hecha = aMano.find((d) => d.id === id);
      // Sin tipo de sala conocido (la boca de una cueva), solo vale si está hecha a mano.
      if (!tipo && !hecha) continue;
      const def = id ? salas[id] : undefined;
      if (!id || (!def && !hecha) || hechas.has(id)) continue;
      hechas.add(id);
      // Los hechos a mano (el gimnasio de Roca: terrazas, compuertas y aprendices) van tal cual.
      if (hecha) {
        res.push(hecha);
        continue;
      }
      if (!def || !tipo) continue;
      const s = generarInterior({ tipo, ancho: e.ancho, fondo: e.fondo, plantas: plantasDe(z, tipo), semilla: semillaDe(id) });
      res.push({ id, nombre: def.nombre, mapa: s.mapa, personajes: def.gente(s), entrada: s.entrada });
    }
  }
  return res;
}

export const INTERIORES_ISLA1: readonly DefInterior[] = generarInteriores(ISLA_1, PUERTAS_ISLA1, SALAS, [GIMNASIO_ROCA]);
