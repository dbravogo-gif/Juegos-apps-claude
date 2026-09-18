// Genera ASSETS.md a partir del catálogo: `node tools/assets.js > ASSETS.md`
// Así la lista de imágenes nunca se desvía de lo que el código busca de verdad.

import {
  ZONAS,
  ENEMIGOS,
  MUEBLES,
  EQUIPO,
  MASCOTAS,
  ESPACIOS,
  ETAPAS_PERSONAJE,
} from '../src/data/content.js';

// Dos hojas por etapa, cada una de una sola generación: es lo único que garantiza que las
// tres poses sean el mismo personaje.
const ARCHIVOS_PERSONAJE = [
  ['', 'De frente', '3 poses: quieto (ficha), celebrando, arrodillado'],
  ['_combate', 'De espaldas en diagonal', '3 poses: quieto, atacando, recibiendo daño'],
];

const linea = (carpeta, id, nombre, nota = '') =>
  `| \`assets/${carpeta}/${id}.png\` | ${nombre} |${nota ? ` ${nota} |` : ' |'}`;

const tabla = (cabecera, filas) =>
  [`| Archivo | Qué es |${cabecera ? ` ${cabecera} |` : ''}`,
   `| --- | --- |${cabecera ? ' --- |' : ''}`,
   ...filas].join('\n');

console.log(`# Imágenes

Lista generada desde \`src/data/content.js\` con \`node tools/assets.js\`. Cada pieza se
muestra como un marcador de color hasta que el archivo existe; en cuanto se añade con el
nombre exacto, aparece sola sin tocar código.

## Cómo deben ser

- **PNG con fondo transparente**, salvo los fondos de zona.
- **Perspectiva frontal con algo de altura**, nunca a ras de suelo. La misma en todo.
- Iconos (muebles, equipo, mascotas): **512 × 512**, el objeto centrado y con aire alrededor.
- Hojas de tres poses: las tres en fila, misma generación, para que sean el mismo personaje.
  Las recorto yo por código.
- **En combate el héroe se ve de espaldas** (abajo a la izquierda) y el enemigo **de frente**
  (arriba a la derecha), como en un combate de Pokémon. Por eso el héroe necesita la hoja de
  espaldas además de la de frente para su ficha.
- Fondos: **1536 × 1024**, sin personajes.

Empieza por el personaje de la etapa 1: fija el estilo del resto.

## Personaje

Empieza por las cuatro de la etapa 1: con eso el combate ya se ve entero.

${tabla('Poses', ETAPAS_PERSONAJE.flatMap((e) =>
  ARCHIVOS_PERSONAJE.map(([sufijo, que, poses]) =>
    linea('personaje', `${e.id}${sufijo}`, `${que} (nivel ${e.nivel})`, poses))))}

### El héroe de guía

Una sola hoja, solo de la etapa 1: es quien lleva el recorrido guiado de la app. Va de
frente, de medio cuerpo para arriba, porque se ve pequeño dentro de un globo de texto.

${tabla('Poses', [linea('personaje', 'etapa1_guia', 'De frente, medio cuerpo',
  '3 poses: saludando, señalando hacia abajo, pulgar arriba')])}

## Enemigos

${tabla('Zona', ZONAS.flatMap((zona) =>
  [...zona.enemigos, zona.jefe].map((id) =>
    linea('enemigos', id, ENEMIGOS[id].nombre + (ENEMIGOS[id].jefe ? ' (jefe)' : ''), zona.nombre))))}

## Fondos de zona (combate)

Apaisados y sin transparencia. El héroe se dibuja abajo a la izquierda y el enemigo arriba
a la derecha, así que la mitad inferior debe quedar despejada.

${tabla('Descripción', ZONAS.map((z) => linea('zonas', z.id, z.nombre, z.descripcion)))}

## Fondos de los espacios (construcción)

Apaisados y sin transparencia. Son el telón de fondo sobre el que se colocan los muebles,
así que necesitan mucho suelo libre y ningún mueble ya dibujado.

${tabla('Se abre en', ESPACIOS.map((e) => linea('espacios', e.id, e.nombre, `Nivel ${e.nivel}`)))}

## Muebles y decoración

${tabla('Categoría', MUEBLES.map((m) => linea('muebles', m.id, m.nombre, m.categoria)))}

## Equipo

${tabla('Tipo', EQUIPO.map((e) => linea('equipo', e.id, e.nombre, e.tipo)))}

## Mascotas

${tabla('Cómo se gana', MASCOTAS.map((m) => linea('mascotas', m.id, m.nombre, m.pista)))}

## Resumen

| Categoría | Imágenes |
| --- | --- |
| Personaje (2 hojas por etapa, más la de guía) | ${ETAPAS_PERSONAJE.length * ARCHIVOS_PERSONAJE.length + 1} |
| Enemigos (hojas de 3 poses) | ${ZONAS.reduce((t, z) => t + z.enemigos.length + 1, 0)} |
| Fondos de zona | ${ZONAS.length} |
| Fondos de espacios | ${ESPACIOS.length} |
| Muebles | ${MUEBLES.length} |
| Equipo | ${EQUIPO.length} |
| Mascotas | ${MASCOTAS.length} |
`);
