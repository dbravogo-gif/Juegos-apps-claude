// Los interiores de la isla 2, Fuerteventura (2026-11-13): como en Lanzarote, uno por edificio,
// generado a partir de su exterior. Aquí, su nombre y quién vive o trabaja en él.

import type { DefInterior } from '../core/mundo';
import { ISLA_2, PUERTAS_ISLA2 } from './isla2';
import { generarInteriores, vive, type DefSala } from './interiores-isla1';

const SALAS: Record<string, DefSala> = {
  'refugio-corralejo': { nombre: 'Refugio de Corralejo', gente: vive('enfermera-corralejo') },
  'tienda-corralejo': { nombre: 'Tienda de Corralejo', gente: vive('tendero-corralejo') },
  'casa-corralejo-1': { nombre: 'Casa de Corralejo', gente: vive('vecino-corralejo-1', 'Mi abuelo pescaba en Lobos. Volvía con la barca llena y la piel tostada.') },
  'casa-corralejo-2': { nombre: 'Casa de Corralejo', gente: vive('vecina-corralejo-2', 'Cuando sopla la calima, el cielo se pone amarillo y la arena se mete hasta en la nevera.') },
};

export const INTERIORES_ISLA2: readonly DefInterior[] = generarInteriores(ISLA_2, PUERTAS_ISLA2, SALAS);
