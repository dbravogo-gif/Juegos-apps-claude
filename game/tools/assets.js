// Genera ASSETS.md a partir del catálogo: `node tools/assets.js > ASSETS.md`
// Así la lista de imágenes nunca se desvía de lo que el código busca de verdad.

import {
  ZONAS,
  ENEMIGOS,
  MUEBLES,
  EQUIPO,
  MASCOTAS,
  ETAPAS_PERSONAJE,
} from '../src/data/content.js';

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
- Personajes y enemigos: **hoja con tres poses en fila** (en guardia, atacando, recibiendo
  daño) sobre fondo plano. Salen de una sola generación para que sean el mismo personaje;
  las recorto yo.
- Fondos de zona: **1536 × 1024**, sin personajes.

Empieza por el personaje de la etapa 1: fija el estilo del resto.

## Personaje

${tabla('Cuándo aparece', ETAPAS_PERSONAJE.map((e) =>
  linea('personaje', e.id, `Etapa ${e.id.slice(-1)}`, `Nivel ${e.nivel}`)))}

## Enemigos

${tabla('Zona', ZONAS.flatMap((zona) =>
  [...zona.enemigos, zona.jefe].map((id) =>
    linea('enemigos', id, ENEMIGOS[id].nombre + (ENEMIGOS[id].jefe ? ' (jefe)' : ''), zona.nombre))))}

## Fondos de zona

${tabla('Descripción', ZONAS.map((z) => linea('zonas', z.id, z.nombre, z.descripcion)))}

## Muebles y decoración

${tabla('Categoría', MUEBLES.map((m) => linea('muebles', m.id, m.nombre, m.categoria)))}

## Equipo

${tabla('Tipo', EQUIPO.map((e) => linea('equipo', e.id, e.nombre, e.tipo)))}

## Mascotas

${tabla('Cómo se gana', MASCOTAS.map((m) => linea('mascotas', m.id, m.nombre, m.pista)))}

## Resumen

| Categoría | Imágenes |
| --- | --- |
| Personaje (hojas de 3 poses) | ${ETAPAS_PERSONAJE.length} |
| Enemigos (hojas de 3 poses) | ${ZONAS.reduce((t, z) => t + z.enemigos.length + 1, 0)} |
| Fondos de zona | ${ZONAS.length} |
| Muebles | ${MUEBLES.length} |
| Equipo | ${EQUIPO.length} |
| Mascotas | ${MASCOTAS.length} |
`);
