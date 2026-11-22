// Diálogos de la isla 3, Gran Canaria (2026-11-22), por id de personaje (src/core/guion.ts). Los
// personajes sin diálogo aquí dicen su `frase` del mapa.

import type { Guion } from '../core/guion';

export const GUION_ISLA3: Guion = {
  'marinero-palmas': [
    {
      dialogo: {
        lineas: [{ quien: 'Marinero', texto: '¡Bienvenido a Las Palmas! Este barco va y viene de Morro Jable.' }],
        pregunta: { quien: 'Marinero', texto: '¿Vuelves a Fuerteventura?' },
        efecto: { viaje: 2 },
        tras: [{ quien: 'Marinero', texto: '¡Levamos anclas!' }],
      },
    },
  ],
  'enfermera-palmas': [
    { dialogo: { lineas: [{ quien: 'Enfermera', texto: 'Bienvenido al refugio de Las Palmas. En la ciudad grande también curamos gratis.' }] } },
  ],
  'tendero-palmas': [
    { dialogo: { lineas: [{ quien: 'Tendero', texto: '¡Buenas! Esto es una ciudad: aquí hay de todo. Bueno, casi de todo.' }] } },
  ],
  'vigilante-electrico': [
    {
      sin: 'vencido:aprendiz-electrico-3',
      dialogo: {
        lineas: [
          { quien: 'Vigilante', texto: '¡Bienvenido al gimnasio Eléctrico! Cada sala está cerrada por una barrera de rayos.' },
          { quien: 'Vigilante', texto: 'Cada barrera la apaga una palanca. Búscala en la sala y bájala con E.' },
          { quien: 'Vigilante', texto: 'Un consejo: a lo Eléctrico le hace mucho daño la Tierra. Y aquí dentro, el campo eléctrico da más fuerza a sus rayos.' },
          { quien: 'Vigilante', texto: 'Del líder… mejor que te lo cuenten arriba.' },
        ],
      },
    },
    {
      dialogo: {
        lineas: [
          { quien: 'Vigilante', texto: 'Ya lo sabes: el líder se fue a Agaete. Dicen que la líder de Lucha y él te esperan juntos.' },
          { quien: 'Vigilante', texto: 'Las dos mitades de la pintadera de Gran Canaria se ganan allí, en el terrero.' },
        ],
      },
    },
  ],
  'guia-vegueta': [
    {
      dialogo: {
        lineas: [
          { quien: 'Guía', texto: 'Esta es la catedral de Santa Ana. Tardaron casi cuatrocientos años en terminarla.' },
          { quien: 'Guía', texto: 'Por eso tiene un poco de todos los estilos: cada siglo le puso lo suyo.' },
          { quien: 'Guía', texto: 'Desde las torres se ven las cumbres. Allí arriba está el Roque Nublo, una roca enorme entre las nubes.' },
        ],
      },
    },
  ],
  'farera-isleta': [
    {
      dialogo: {
        lineas: [
          { quien: 'Farera', texto: 'Desde lo alto del faro se ven Tenerife y el Teide, casi todos los días.' },
          { quien: 'Farera', texto: 'Y algunas mañanas, muy temprano, algo más allá del Teide. Una isla que luego no está.' },
          { quien: 'Farera', texto: 'Mi abuelo decía que desde el Roque Nublo se ve mejor. Él subía a mirarla.' },
        ],
      },
    },
  ],
};
