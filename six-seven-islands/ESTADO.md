# Estado de Six-seven islands

Actualizado: 2026-11-07. Solo el presente; el historial está en git. Máximo 40 líneas.

## Fase actual

Fase 3 de `/nuevo-proyecto`: el andamiaje.

## Hecho

- Entrevista (fase 1). Las decisiones están en `DISENO.md`.
- Documentos (fase 2), aprobados por el autor el 2026-11-07: `DISENO.md`, `ARTE.md`,
  `ARCHITECTURE.md` y `funciones.json`.
- `F01`, el andamiaje:
  - el motor de subsistemas, con paso fijo, eventos y calidad;
  - el render en WebGPU, con vuelta a WebGL2;
  - una isla de prueba temporal;
  - el panel de depuración (`?depurar`) y `window.__JUEGO__`;
  - la web instalable y la publicación.

## Siguiente

1. `F02`, el núcleo portado de Leyendas, y `F03`, el combate N contra N.
2. `F04`, la prueba de arte, antes de invertir en contenido.

## Pendiente del autor

- Nada por ahora. Antes de la tanda 3, elegir los nombres que proponga Claude.

## Defectos conocidos

- La isla de prueba no se ve entera en vertical: es provisional y la cámara de verdad llega en
  `F05`.
- Sin comprobar en un iPhone: el arranque con WebGPU y la instalación en la pantalla de inicio.
