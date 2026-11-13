// Diálogos de la isla 2, Fuerteventura (2026-11-13), por id de personaje (src/core/guion.ts).
// Provisionales hasta la historia del autor (PROMPT-HISTORIA.md). Los personajes sin diálogo aquí
// dicen su `frase` del mapa.

import type { Guion } from '../core/guion';

export const GUION_ISLA2: Guion = {
  'marinero-corralejo': [
    {
      dialogo: {
        lineas: [{ quien: 'Marinero', texto: '¡Bienvenido a Corralejo! Este barco va y viene de Lanzarote.' }],
        pregunta: { quien: 'Marinero', texto: '¿Vuelves a Lanzarote?' },
        efecto: { viaje: 1 },
        tras: [{ quien: 'Marinero', texto: '¡Levamos anclas!' }],
      },
    },
  ],
  'enfermera-corralejo': [
    {
      dialogo: { lineas: [{ quien: 'Enfermera', texto: 'Bienvenido al refugio de Corralejo. Aquí también cuidamos de tu equipo sin cobrar nada.' }] },
    },
  ],
  'tendero-corralejo': [
    {
      dialogo: {
        lineas: [{ quien: 'Tendero', texto: '¡Buenas! Si vas a cruzar las dunas, llévate pociones. La arena no perdona.' }],
      },
    },
  ],
  // La arqueóloga de Las Dunas (autor, 2026-11-13): desentierra una estatua ancestral y cuenta un
  // trozo de la historia. La estatua de verdad, ya se verá.
  arqueologa: [
    {
      dialogo: {
        lineas: [
          { quien: 'Arqueóloga', texto: '¡Cuidado con las cuerdas! Llevo semanas desenterrando esta estatua.' },
          { quien: 'Arqueóloga', texto: 'Es mucho más antigua que las cinco leyendas. Mira la cabeza: es una criatura ancestral.' },
          { quien: 'Arqueóloga', texto: 'Dicen que antes de la guerra de las cinco naciones, las ancestrales cuidaban de todas las islas.' },
          { quien: 'Arqueóloga', texto: 'Y que cuando las naciones empezaron a pelear, una isla entera desapareció del mapa.' },
          { quien: 'Arqueóloga', texto: 'Cuentos de viejos, seguramente… Aunque esta estatua mira justo hacia el oeste.' },
        ],
      },
    },
  ],
};
