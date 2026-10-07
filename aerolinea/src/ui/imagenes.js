// La imagen de un tipo de avión: su foto o, si no hay, su silueta sobre el cielo.

import { TIPOS } from '../data/aviones.js';
import { FOTOS_AVION } from '../data/imagenes.js';
import { silueta } from './escenas.js';
import { esc, htmlFoto } from './formato.js';

export function htmlAvion(tipoId, clase = '') {
  const foto = FOTOS_AVION[tipoId];
  if (foto) return htmlFoto(foto, clase);
  const tipo = TIPOS[tipoId];
  return `<figure class="foto foto-silueta ${clase}"><svg viewBox="-54 -30 108 44" role="img" aria-label="Silueta del ${esc(tipo.nombre)}">${silueta(tipo).svg}</svg></figure>`;
}
