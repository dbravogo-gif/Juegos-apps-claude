// Los interiores de la isla 3, Gran Canaria (2026-11-22): como en las otras, uno por edificio,
// generado a partir de su exterior, y el gimnasio Eléctrico, hecho a mano.

import type { DefInterior } from '../core/mundo';
import { ISLA_3, PUERTAS_ISLA3 } from './isla3';
import { generarInteriores, vive, type DefSala } from './interiores-isla1';
import { GIMNASIO_ELECTRICO } from './gimnasio-electrico';
import { GIMNASIO_LUCHA } from './gimnasio-lucha';

const SALAS: Record<string, DefSala> = {
  'refugio-palmas': { nombre: 'Refugio de Las Palmas', gente: vive('enfermera-palmas') },
  'tienda-palmas': { nombre: 'Tienda de Las Palmas', gente: vive('tendero-palmas') },
  'casa-palmas-1': { nombre: 'Casa de Triana', gente: vive('vecino-palmas-1', 'Mi abuela vendía flores en Triana. Ahora vende la tienda de al lado… y también flores.') },
  'casa-palmas-2': { nombre: 'Casa de Vegueta', gente: vive('vecina-palmas-2', 'Vegueta es el barrio más antiguo. Aquí empezó la ciudad, junto al barranco.') },
  'casa-palmas-3': { nombre: 'Casa de Vegueta', gente: vive('vecino-palmas-3', 'Dicen que Colón paró en esta ciudad camino de América. Yo no lo vi, ¿eh?') },
  'casa-palmas-4': { nombre: 'Casa junto a la plaza', gente: vive('vecina-palmas-4', 'Desde la azotea se ven las cumbres. Cuando hay nubes, parecen un mar encima de la isla.') },
  'casa-isleta-1': { nombre: 'Casa de La Isleta', gente: vive('vecino-isleta-1', 'Antes de la ciudad, La Isleta era casi una isla de verdad. Por eso se llama así.') },
  'refugio-guayadeque': { nombre: 'Refugio de Guayadeque', gente: vive('enfermera-guayadeque') },
  'casa-cueva-1': { nombre: 'Casa cueva', gente: vive('vecino-cueva-1', 'Esta cueva la excavó mi bisabuelo a mano. Cada generación le ha hecho un cuarto más.') },
  'casa-cueva-2': { nombre: 'Casa cueva', gente: vive('vecina-cueva-2', 'Los antiguos canarios ya vivían en estas cuevas. Dicen que guardaban aquí sus momias y su grano.') },
  'restaurante-cueva': { nombre: 'Restaurante cueva', gente: vive('camarera-cueva', 'Hoy hay papas arrugadas con mojo y queso de flor. ¡Vuelve cuando tengas hambre!') },
  // Fase 3.
  'refugio-tejeda': { nombre: 'Refugio de Tejeda', gente: vive('enfermera-tejeda') },
  'tienda-tejeda': { nombre: 'Tienda de Tejeda', gente: vive('tendero-tejeda') },
  'casa-tejeda': { nombre: 'Casa de Tejeda', gente: vive('vecino-tejeda', 'En la cumbre hace frío por la noche, hasta en verano. Por eso las casas cueva son tan buenas.') },
  'casa-cueva-tejeda': { nombre: 'Casa cueva', gente: vive('vecina-cueva-tejeda', 'Desde la puerta de mi cueva veo el Roque Nublo cada mañana. No lo cambio por nada.') },
  'casa-cueva-artenara': { nombre: 'Casa cueva de Artenara', gente: vive('vecino-cueva-artenara', 'Artenara es el pueblo más alto de la isla. Aquí hasta la iglesia está dentro de la roca.') },
  'refugio-agaete': { nombre: 'Refugio de Agaete', gente: vive('enfermera-agaete') },
  'tienda-agaete': { nombre: 'Tienda de Agaete', gente: vive('tendero-agaete') },
  'casa-agaete-1': { nombre: 'Casa de Agaete', gente: vive('vecino-agaete-1', 'En el terrero luchan los mejores de la isla. Sin golpes: solo fuerza, maña y agarres.') },
  'casa-agaete-2': { nombre: 'Casa de Agaete', gente: vive('vecina-agaete-2', 'En el valle de Agaete crece café. ¡Café en Canarias! Pruébalo antes de irte.') },
  // Fase 4.
  'casa-bandama': { nombre: 'La finca de la caldera', gente: vive('vecina-bandama', 'Vivir en el fondo de un volcán dormido da mucha paz. Bueno… casi siempre.') },
  'casa-isleta-2': { nombre: 'Casa de La Isleta', gente: vive('vecina-isleta-2', 'Mi marido sale a pescar de madrugada. Las criaturas del mar le siguen la barca.') },
};

export const INTERIORES_ISLA3: readonly DefInterior[] = generarInteriores(ISLA_3, PUERTAS_ISLA3, SALAS, [GIMNASIO_ELECTRICO, GIMNASIO_LUCHA]);
