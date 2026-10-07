// Imágenes del juego: la foto de cada tipo de avión y escenas de la historia (noticias,
// accidentes, grandes aeropuertos y taller).
//
// Las escenas y los aviones ficticios están generados con IA (OpenArt) para el juego, con
// aspecto de foto de la época. Las fotos de aviones reales son de Wikimedia Commons, con el
// rótulo de la aerolínea cambiado por su nombre en el juego; autor y licencia en img/LEEME.md.
// Si un tipo no tiene foto, la interfaz pinta su silueta.

import { TIPOS } from './aviones.js';

export const FOTOS_AVION = {
  c212: { src: 'img/aviones/c212.webp', alt: 'CASA C-212 Aviocar en el aeródromo de Sion, 1982' },
  f27: { src: 'img/aviones/f27.webp', alt: 'Fokker F27 de Aviacutre en San Sebastián, 1991' },
  hs748: { src: 'img/aviones/hs748.webp', alt: 'Hawker Siddeley 748 de Dan-Air, 1983' },
  viscount: { src: 'img/aviones/viscount.webp', alt: 'Vickers Viscount de British Airgüeis, 1977' },
  caravelle: { src: 'img/aviones/caravelle.webp', alt: 'Caravelle de Castilla de noche en la plataforma, 1965' },
  f28: { src: 'img/aviones/f28.webp', alt: 'Fokker F28 de Castilla en la pista, 1971' },
  bac111: { src: 'img/aviones/bac111.webp', alt: 'BAC One-Eleven de British Airgüeis en aproximación, 1979' },
  dc9: { src: 'img/aviones/dc9.webp', alt: 'DC-9 de Castilla en aproximación, 1978' },
  b737: { src: 'img/aviones/b737.webp', alt: 'Boeing 737-200 de Naftansa rodando, 1983' },
  kr134: { src: 'img/aviones/kr134.webp', alt: 'Krasnov KR-134 en la plataforma, foto de época' },
  vk42: { src: 'img/aviones/vk42.webp', alt: 'Volkov VK-42 en un aeropuerto regional, foto de época' },
  b727: { src: 'img/aviones/b727.webp', alt: 'Boeing 727 de Castilla en la pista, 1978' },
  b707: { src: 'img/aviones/b707.webp', alt: 'Boeing 707 de Bread Am en aproximación, 1968' },
  dc8: { src: 'img/aviones/dc8.webp', alt: 'DC-8-63 de Tulipair en la plataforma, 1968' },
  a300: { src: 'img/aviones/a300.webp', alt: 'Airbus A300 de Croissair rodando, 1980' },
  l1011: { src: 'img/aviones/l1011.webp', alt: 'Lockheed TriStar de Delfín ante el hangar de Lockheed, 1974' },
  dc10: { src: 'img/aviones/dc10.webp', alt: 'DC-10-30 de Lager Airways rodando, 1981' },
  b747: { src: 'img/aviones/b747.webp', alt: 'Boeing 747 de Bread Am rodando en Heathrow, 1977' },
  concorde: { src: 'img/aviones/concorde.webp', alt: 'Concorde de Croissair en la plataforma, 1986' },
  md80: { src: 'img/aviones/md80.webp', alt: 'MD-82 de Pastalia en aproximación, 1995' },
  b767: { src: 'img/aviones/b767.webp', alt: 'Boeing 767 de Delfín rodando, 1984' },
  b757: { src: 'img/aviones/b757.webp', alt: 'Boeing 757 de British Airgüeis en Heathrow, 1983' },
  b733: { src: 'img/aviones/b733.webp', alt: 'Boeing 737-300 de Ay Europa en la plataforma, 1987' },
  atr42: { src: 'img/aviones/atr42.webp', alt: 'ATR 42 de Depie Air en Mánchester, 1990' },
  a320: { src: 'img/aviones/a320.webp', alt: 'Airbus A320 de Castilla rodando, 2002' },
  f100: { src: 'img/aviones/f100.webp', alt: 'Fokker 100 de Tulipair en Zúrich, 1995' },
};

export const ESCENAS = {
  noticiaAntigua: { src: 'img/historia/noticia-1980.webp', alt: 'Vestíbulo de salidas con un panel de paletas, años 80' },
  noticiaModerna: { src: 'img/historia/noticia-2010.webp', alt: 'Vestíbulo de salidas moderno con pantallas de vuelos' },
  accidentePista: { src: 'img/historia/accidente-pista.webp', alt: 'Avión fuera de la pista sobre espuma, con los bomberos al fondo' },
  accidenteMonte: { src: 'img/historia/accidente-monte.webp', alt: 'Restos de un avión en una ladera con pinos y niebla' },
  accidentePistaHelice: { src: 'img/historia/accidente-pista-helice.webp', alt: 'Turbohélice accidentado más allá del final de la pista, con espuma' },
  accidenteMonteHelice: { src: 'img/historia/accidente-monte-helice.webp', alt: 'Restos de un turbohélice en una ladera volcánica con niebla' },
  aeropuertoAntiguo: { src: 'img/historia/aeropuerto-1980.webp', alt: 'Gran aeropuerto internacional a finales de los 70' },
  aeropuertoModerno: { src: 'img/historia/aeropuerto-2010.webp', alt: 'Gran aeropuerto actual con terminal de cristal' },
  tallerLinea: { src: 'img/historia/taller-linea.webp', alt: 'Revisión de noche en la plataforma, con el motor abierto' },
  tallerHangar: { src: 'img/historia/taller-hangar.webp', alt: 'Revisión completa en el hangar, con un motor desmontado' },
  tallerMotor: { src: 'img/historia/taller-motor.webp', alt: 'Revisión general de un motor a reacción en el taller' },
};

// Desde 2005 las escenas modernas: pantallas en vez de paneles de paletas, terminales de cristal.
const MODERNO = 2005;

export const escenaNoticia = (anio) => (anio < MODERNO ? ESCENAS.noticiaAntigua : ESCENAS.noticiaModerna);

// Solo los grandes aeropuertos tienen imagen.
export function escenaAeropuerto(aeropuerto, anio) {
  if (aeropuerto.tam < 4) return null;
  return anio < MODERNO ? ESCENAS.aeropuertoAntiguo : ESCENAS.aeropuertoModerno;
}

// Una salida de pista, o una aproximación que acaba antes de la pista en terreno llano, deja el
// avión en el campo junto al aeropuerto; lo demás acaba en el monte. Con hélices o reactores,
// según el avión.
export function escenaAccidente(accidente, aeropuerto) {
  const helices = TIPOS[accidente.tipo]?.config.motores === 'helices-ala';
  const campo = accidente.escena === 'pista' || (accidente.escena === 'aproximacion' && !accidente.enRuta && !aeropuerto?.montana);
  if (campo) return helices ? ESCENAS.accidentePistaHelice : ESCENAS.accidentePista;
  return helices ? ESCENAS.accidenteMonteHelice : ESCENAS.accidenteMonte;
}

// Lo que se ve del taller según el trabajo: hangar para las revisiones grandes, el taller de
// motores para una revisión general y la plataforma de noche para lo demás.
export function escenaTaller(avion) {
  const tareas = avion.tareas ?? [];
  if (tareas.some((t) => t.tipo === 'revision' && (t.nivel === 'C' || t.nivel === 'D'))) return ESCENAS.tallerHangar;
  if (tareas.some((t) => t.tipo === 'motor')) return ESCENAS.tallerMotor;
  return ESCENAS.tallerLinea;
}
