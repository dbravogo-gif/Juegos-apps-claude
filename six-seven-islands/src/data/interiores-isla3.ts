// Los interiores de la isla 3, Gran Canaria (2026-11-22): como en las otras, uno por edificio,
// generado a partir de su exterior, y el gimnasio Eléctrico, hecho a mano.

import type { DefInterior } from '../core/mundo';
import { ISLA_3, PUERTAS_ISLA3 } from './isla3';
import { generarInteriores, vive, type DefSala } from './interiores-isla1';
import { GIMNASIO_ELECTRICO } from './gimnasio-electrico';

const SALAS: Record<string, DefSala> = {
  'refugio-palmas': { nombre: 'Refugio de Las Palmas', gente: vive('enfermera-palmas') },
  'tienda-palmas': { nombre: 'Tienda de Las Palmas', gente: vive('tendero-palmas') },
  'casa-palmas-1': { nombre: 'Casa de Triana', gente: vive('vecino-palmas-1', 'Mi abuela vendía flores en Triana. Ahora vende la tienda de al lado… y también flores.') },
  'casa-palmas-2': { nombre: 'Casa de Vegueta', gente: vive('vecina-palmas-2', 'Vegueta es el barrio más antiguo. Aquí empezó la ciudad, junto al barranco.') },
  'casa-palmas-3': { nombre: 'Casa de Vegueta', gente: vive('vecino-palmas-3', 'Dicen que Colón paró en esta ciudad camino de América. Yo no lo vi, ¿eh?') },
  'casa-palmas-4': { nombre: 'Casa junto a la plaza', gente: vive('vecina-palmas-4', 'Desde la azotea se ven las cumbres. Cuando hay nubes, parecen un mar encima de la isla.') },
  'casa-isleta-1': { nombre: 'Casa de La Isleta', gente: vive('vecino-isleta-1', 'Antes de la ciudad, La Isleta era casi una isla de verdad. Por eso se llama así.') },
  'casa-isleta-2': { nombre: 'Casa de La Isleta', gente: vive('vecina-isleta-2', 'Mi marido sale a pescar de madrugada. Las criaturas del mar le siguen la barca.') },
};

export const INTERIORES_ISLA3: readonly DefInterior[] = generarInteriores(ISLA_3, PUERTAS_ISLA3, SALAS, [GIMNASIO_ELECTRICO]);
