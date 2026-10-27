import type { Paso } from '../core/mundo';

// Atajos para escribir guiones con menos ruido. `{nombre}` se sustituye por el nombre del
// jugador al mostrar el texto.

export const decir = (quien: string | undefined, ...textos: string[]): Paso[] =>
  textos.map((texto) => ({ tipo: 'decir', texto, quien }));

export const si = (bandera: string, entonces: Paso[], sino: Paso[] = []): Paso => ({ tipo: 'si', bandera, entonces, sino });

export const bandera = (nombre: string): Paso => ({ tipo: 'bandera', nombre });

export const dar = (objeto: string, cantidad: number): Paso => ({ tipo: 'dar', objeto, cantidad });

/**
 * Una pregunta que cierra el paso, como las de los gimnasios del género. Si aciertas, se pone
 * `abre` (el que pregunta se aparta con `ocultoSi`); si fallas, el castigo, y se puede volver a
 * intentar. `correcta` es el índice de la respuesta buena en `respuestas`. La última opción es
 * «Ahora no», que es también lo que elige B: así cancelar nunca castiga.
 */
export const pregunta = (
  quien: string,
  texto: string,
  respuestas: string[],
  correcta: number,
  abre: string,
  castigo: Paso[],
): Paso[] => [
  {
    tipo: 'elegir',
    quien,
    pregunta: texto,
    opciones: [
      ...respuestas.map((r, i) => ({
        texto: r,
        pasos: i === correcta ? [...decir(quien, '¡Correcto! Puedes pasar.'), bandera(abre)] : [...decir(quien, 'No es eso.'), ...castigo],
      })),
      { texto: 'Ahora no', pasos: decir(quien, 'Aquí estaré.') },
    ],
  },
];
