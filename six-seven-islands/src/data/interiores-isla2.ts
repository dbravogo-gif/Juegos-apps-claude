// Los interiores de la isla 2, Fuerteventura (2026-11-13): como en Lanzarote, uno por edificio,
// generado a partir de su exterior. Aquí, su nombre y quién vive o trabaja en él.

import type { DefInterior } from '../core/mundo';
import { ISLA_2, PUERTAS_ISLA2 } from './isla2';
import { generarInteriores, vive, type DefSala } from './interiores-isla1';
import { CUEVA_AJUY } from './cueva-ajuy';

const SALAS: Record<string, DefSala> = {
  'refugio-corralejo': { nombre: 'Refugio de Corralejo', gente: vive('enfermera-corralejo') },
  'tienda-corralejo': { nombre: 'Tienda de Corralejo', gente: vive('tendero-corralejo') },
  'casa-corralejo-1': { nombre: 'Casa de Corralejo', gente: vive('vecino-corralejo-1', 'Mi abuelo pescaba en Lobos. Volvía con la barca llena y la piel tostada.') },
  'casa-corralejo-2': { nombre: 'Casa de Corralejo', gente: vive('vecina-corralejo-2', 'Cuando sopla la calima, el cielo se pone amarillo y la arena se mete hasta en la nevera.') },
  // Fase 2.
  'refugio-puerto': { nombre: 'Refugio de Puerto del Rosario', gente: vive('enfermera-puerto') },
  'tienda-puerto': { nombre: 'Tienda de Puerto del Rosario', gente: vive('tendero-puerto') },
  'casa-puerto-1': { nombre: 'Casa de Puerto del Rosario', gente: vive('vecino-puerto-1', 'Las cabras majoreras dan la mejor leche de Canarias. Y el mejor queso, claro.') },
  'casa-puerto-2': { nombre: 'Casa de Puerto del Rosario', gente: vive('vecina-puerto-2', 'Mi nieta se fue al sur a hacer kitesurf. Dice que allí el viento no para nunca.') },
  'casa-puerto-3': { nombre: 'Casa de Puerto del Rosario', gente: vive('vecino-puerto-3', 'Antes esto se llamaba Puerto de Cabras. Por algo será, ¿no?') },
  'refugio-betancuria': { nombre: 'Refugio de Betancuria', gente: vive('enfermera-betancuria') },
  'casa-betancuria': { nombre: 'Casa de Betancuria', gente: vive('vecino-betancuria', 'En el valle se está fresquito. Arriba, en las montañas, el viento te lleva.') },
  'casa-ajuy': { nombre: 'Casa de Ajuy', gente: vive('vecina-ajuy', 'De la cueva salían antes los barcos con cal. Ahora entran los curiosos.') },
};

export const INTERIORES_ISLA2: readonly DefInterior[] = generarInteriores(ISLA_2, PUERTAS_ISLA2, SALAS, [CUEVA_AJUY]);
