// El comandante de la partida en pantalla: su ficha al fundar la compañía y las noticias de
// los hitos (primer vuelo, largo radio, diez aviones, aniversarios).

import { pilotoDe } from '../data/pilotos.js';
import { textoFecha } from '../core/tiempo.js';
import { esc } from './formato.js';

// El piloto de la página por la que se ha entrado (piloto/<id>/ lleva <meta name="piloto">).
export const pilotoDePagina = () => {
  const id = document.querySelector('meta[name="piloto"]')?.content ?? null;
  return pilotoDe(id) ? id : null;
};

export function htmlFichaPiloto(id) {
  const p = pilotoDe(id);
  if (!p) return '';
  return `
  <figure class="ficha-piloto">
    <img src="${p.cuerpo}" alt="El comandante ${esc(p.nombre)} con su uniforme" decoding="async">
    <figcaption><span class="ficha-piloto-cargo">Comandante jefe</span><strong>${esc(p.nombre)}</strong><span>${esc(p.presentacion)}</span></figcaption>
  </figure>`;
}

const TEXTOS = {
  'primer-vuelo': (c, n) => [`${c} despega por primera vez`, `El primer vuelo de la compañía sale con el comandante ${n} a los mandos. En la plataforma, aplausos de los mecánicos y algún familiar emocionado.`],
  'largo-radio': (c, n) => [`${c} se atreve con el océano`, `El comandante ${n} estrena el primer avión de largo radio de la compañía: «Ahora sí que somos una aerolínea de verdad».`],
  'flota-10': (c, n) => [`${c} ya tiene diez aviones`, `El comandante ${n} posa ante la flota: «Empezamos con uno y una oficina prestada».`],
  'aniversario-10': (c, n) => [`Diez años de ${c}`, `Fiesta en el hangar por el décimo aniversario. El comandante ${n} brinda por los que siguen y por los que ya se jubilaron.`],
  'aniversario-25': (c, n) => [`${c} cumple veinticinco años`, `Bodas de plata de la compañía. El comandante ${n}, ya con canas en la gorra, sigue saliendo a la plataforma a ver despegar los aviones.`],
};

export function htmlHitoPiloto(estado, hito) {
  const p = pilotoDe(estado.piloto);
  const texto = TEXTOS[hito];
  if (!p || !texto) return '';
  const [titular, cuerpo] = texto(esc(estado.nombre), esc(p.nombre));
  // El primer vuelo, como recorte de periódico en blanco y negro; el resto, en color.
  const recorte = hito === 'primer-vuelo';
  return `
  <div class="tele">
    <div class="tele-pantalla">
      <div class="tele-cabecera"><span class="tele-cadena">Diario Nacional</span><span class="tele-directo">${recorte ? 'Exclusiva' : 'Aniversarios y hitos'}</span></div>
      <p class="tele-fecha">${textoFecha(estado.t)}</p>
      <figure class="foto foto-piloto${recorte ? ' recorte' : ''}"><img src="${p.cuerpo}" alt="El comandante ${esc(p.nombre)}" decoding="async"></figure>
      <h2 class="tele-titular">${titular}</h2>
      <p class="tele-texto">${cuerpo}</p>
    </div>
  </div>`;
}
