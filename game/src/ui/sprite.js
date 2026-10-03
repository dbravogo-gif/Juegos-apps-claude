import { esc } from './util.js';

/** Color estable a partir del identificador, para que cada marcador sea reconocible. */
function tono(id) {
  let suma = 0;
  for (let i = 0; i < id.length; i += 1) suma = (suma * 31 + id.charCodeAt(i)) % 360;
  return suma;
}

function iniciales(nombre) {
  const palabras = nombre.split(' ').filter((p) => p.length > 2);
  const letras = palabras.slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  // Un nombre corto ("Tú") no deja ninguna palabra larga: mejor sus letras que un hueco.
  return letras || nombre.slice(0, 2).toUpperCase();
}

const ruta = (carpeta, id) => `assets/${esc(carpeta)}/${esc(id)}.png`;

/**
 * Una pose recortada de una hoja con varias en fila horizontal. La imagen se estira a lo
 * ancho de todas las poses y se desplaza hasta la que toca, así que una sola descarga sirve
 * para el personaje entero.
 *
 * @param {number} pose índice desde 0
 * @param {number} poses cuántas trae la hoja
 */
export function figura(carpeta, id, nombre, { pose = 0, poses = 1, clase = '' } = {}) {
  const desplazamiento = poses > 1 ? `transform:translateX(-${(pose / poses) * 100}%)` : '';
  return `
  <div class="figura ${clase}" style="--tono:${tono(id)}">
    <b>${esc(iniciales(nombre))}</b>
    <img src="${ruta(carpeta, id)}" alt="" style="${desplazamiento}"
      onload="this.previousElementSibling.hidden=true" onerror="this.remove()">
  </div>`;
}
