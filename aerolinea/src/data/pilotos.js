// Los comandantes: un retrato por amigo, generado con IA a partir de una foto suya. Cada uno
// entra por su página (piloto/<id>/, la crea tools/paginas-pilotos.mjs al publicar), que trae
// su icono para la pantalla de inicio y le hace salir en la partida: al fundar la compañía, en
// el primer vuelo y en unos pocos hitos. Por la página general no sale ninguno.

export const PILOTOS = {
  jorge: {
    nombre: 'Jorge',
    cuerpo: 'img/pilotos/jorge.webp',
    cara: 'img/pilotos/jorge-cara.webp',
    presentacion: 'Llega a la cabina con un tulipán rojo en la solapa y ganas de volar lo más nuevo del mercado.',
  },
  pinar: {
    nombre: 'Pinar',
    cuerpo: 'img/pilotos/pinar.webp',
    cara: 'img/pilotos/pinar-cara.webp',
    presentacion: 'Comandante de turbohélice: conoce cada pista corta y cada viento cruzado de las islas.',
  },
  oscar: {
    nombre: 'Óscar',
    cuerpo: 'img/pilotos/oscar.webp',
    cara: 'img/pilotos/oscar-cara.webp',
    presentacion: 'Ingeniero de motores antes que piloto: antes de firmar el despacho, mira el boroscopio.',
  },
  german: {
    nombre: 'Germán',
    cuerpo: 'img/pilotos/german.webp',
    cara: 'img/pilotos/german-cara.webp',
    presentacion: 'Ingeniero aeronáutico, programador y dueño de una red de cargadores: ya sueña con enchufar los aviones.',
  },
};

// Quien explica la ayuda: retrato de mencey guanche generado con IA a partir de su foto. Sin foto, sale el
// icono del juego.
export const INSTRUCTOR = { nombre: 'Mencey Danito', cara: 'img/pilotos/instructor-cara.webp' };

export const pilotoDe = (id) => (id && Object.hasOwn(PILOTOS, id) ? PILOTOS[id] : null);
