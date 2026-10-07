// Imágenes del juego: la foto de cada tipo de avión y escenas de la historia (noticias,
// accidentes, grandes aeropuertos y taller).
//
// Las escenas y los aviones ficticios están generados con IA (OpenArt) para el juego, con
// aspecto de foto de la época. Las fotos de aviones reales son de Wikimedia Commons, con su
// autor y licencia en img/LEEME.md. Si un tipo no tiene foto, la interfaz pinta su silueta.

import { TIPOS } from './aviones.js';

export const FOTOS_AVION = {
  kr134: { src: 'img/aviones/kr134.webp', alt: 'Krasnov KR-134 en la plataforma, foto de época' },
  vk42: { src: 'img/aviones/vk42.webp', alt: 'Volkov VK-42 en un aeropuerto regional, foto de época' },
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
