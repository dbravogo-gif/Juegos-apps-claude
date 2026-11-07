# Juegos y apps (raíz del repositorio)

Proyectos web para móvil del mismo autor, publicados en GitHub Pages. Si existe
`<proyecto>/CLAUDE.md`, sus reglas mandan dentro de esa carpeta, siempre por debajo de la
constitución. No toques un proyecto distinto del que te han pedido.

| Carpeta | Qué es | Se publica en |
| --- | --- | --- |
| `game/` | RPG de hábitos (JS sin build) | raíz de Pages |
| `aerolinea/` | Simulador de aerolínea (JS sin build) | `/aerolinea/` |
| `leyendas-de-iberia/` | Juego de criaturas (Vite + TS + Phaser) | `/leyendas-de-iberia/` |
| `gymlog-fase1/` | App de gimnasio (HTML único) | `/gymlog-fase1/` |
| `Bulk-up-main/` | App de gimnasio anterior | no se publica |

@CONSTITUCION.md

## Estado actual

@ESTADO.md

## Convenciones de todos los proyectos

- Código, comentarios y textos en español.
- Móvil primero: todo se usa con el dedo en 390 × 844 y también con teclado.
- La lógica va en un núcleo puro y determinista (semilla, sin DOM, sin `Math.random` ni reloj),
  con pruebas. El contenido son datos.

## Comprobar un cambio

- **Pruebas:** `npm test` en la carpeta del proyecto. Además, un hook
  (`herramientas/comprobar-al-terminar.mjs`) las ejecuta al terminar cada turno si el proyecto
  cambió, y bloquea una vez si fallan (R2).
- **Verlo de verdad:** `node herramientas/capturar.mjs <carpeta|url>` (móvil simulado, capturas
  y errores).
  - Esta máquina no tiene GPU: WebGL2 por software y sin WebGPU. Los FPS de aquí no valen como
    prueba.
- **Revisión independiente:** agente `probador` (R3).

## Publicar

`.github/workflows/publicar-juego.yml` publica al hacer push a `main` si pasan las pruebas. Un
proyecto nuevo necesita su ruta en `paths`, sus pruebas y su copia en «Montar el sitio».

## Dónde está cada cosa

- `CONSTITUCION.md`: los 12 mandamientos y los modos de gasto. Se cargan arriba.
- `COMO-TRABAJAMOS.md`: la guía del autor y la versión de la constitución para claude.ai.
- `APRENDIDO.md`: errores ya pagados y su barrera. Se mira antes de una tarea parecida.
- `investigacion/`: lo estudiado, con fuentes. La síntesis está en `00-sintesis.md`.
- Skills:
  - `/nuevo-proyecto`: de la idea a la primera versión.
  - `juego-3d`: producción 3D.
  - `pulir`: sensación de juego.
  - `investigar`: protocolo de investigación.
  - `cierre`: cerrar una tarea.

Este archivo se queda por debajo de 80 líneas y sin historial: el historial va en git.
