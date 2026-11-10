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
| `six-seven-islands/` | Juego de criaturas 3D (Vite + TS + Three.js) | `/six-seven-islands/` |
| `Bulk-up-main/` | App de gimnasio anterior | no se publica |

@CONSTITUCION.md

## Estado actual

@ESTADO.md

## Convenciones de todos los proyectos

- Código, comentarios y textos en español.
- Móvil primero: todo se usa con el dedo en 390 × 844 y también con teclado.
- **Plataformas: móvil y PC.** La jugabilidad se diseña para el tacto (uno o dos dedos) y
  funciona también con ratón y teclado. **Nada que necesite un mando.** En iPhone no hay
  vibración web: la respuesta no puede depender de ella.
- **Dispositivo del autor: iPhone 16.**
  - Se da por hecho que tiene siempre la última versión de iOS, así que hay WebGPU. Aun así se
    mantiene la vuelta a WebGL2.
  - En Safari se ven 393 × 659 px, con las barras del navegador. Instalado como app, 393 × 852
    con zonas seguras. Densidad de píxeles 3: limitar el render a 2.
  - Aquí solo hay Chromium: lo propio de Safari (WebKit) se comprueba en su iPhone.
- **Si el autor tiene que subir archivos a GitHub, se le pasa siempre el enlace directo de
  subida** (`…/upload/<rama>/<carpeta>`), con la carpeta ya creada. No maneja bien GitHub
  (autor, 2026-11-10).
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

**Autorización del autor (2026-11-07):**

- Claude abre y fusiona en `main`, sin preguntar, los PR que no tocan carpetas de proyectos ni
  `.github/`: método, documentación, investigación, `.claude/` y `herramientas/`.
- Los que tocan juegos, apps o la publicación se le consultan antes de fusionar. Excepción
  (autor, 2026-11-10): los de `six-seven-islands/` se fusionan y publican en cuanto pasan las
  pruebas; él los prueba después.

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
