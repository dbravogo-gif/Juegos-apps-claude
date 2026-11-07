# Estado de Six-seven islands

Actualizado: 2026-11-07. Solo el presente; el historial está en git. Máximo 40 líneas.

## Fase actual

Fase 3 de `/nuevo-proyecto`, el andamiaje: cerrada. El `probador` encontró 8 fallos en el
combate, todos corregidos y con su prueba (62 pruebas).

## Hecho

- Entrevista (fase 1). Las decisiones están en `DISENO.md`.
- Documentos (fase 2), aprobados por el autor el 2026-11-07: `DISENO.md`, `ARTE.md`,
  `ARCHITECTURE.md` y `funciones.json`.
- `F01`, el andamiaje: motor de subsistemas, render WebGPU o WebGL2, isla de prueba temporal,
  panel `?depurar`, `window.__JUEGO__`, web instalable y publicación.
- `F02`, el núcleo: reglas de Leyendas con código propio y sin su contenido
  (`src/core/ORIGEN.md`).
- `F03`, el combate N contra N, de 1 contra 1 y de 2 contra 2:
  - es puro y determinista, y cada lado lo controla un jugador o la IA;
  - 54 pruebas, entre ellas 1.000 combates de bots y la repetición idéntica con las mismas
    decisiones.

## Siguiente

1. `F04`, la prueba de arte del generador de criaturas, antes de invertir en contenido.
2. Después, el bucle con formas simples: de `F05` a `F10`.

## Pendiente del autor

- Antes de la tanda 3, elegir los nombres que proponga Claude.

## Defectos conocidos

- La isla de prueba no se ve entera en vertical: es provisional y la cámara de verdad llega en
  `F05`.
- Sin comprobar en el iPhone: la instalación en la pantalla de inicio. WebGPU sí: el autor vio
  WebGPU a 60 FPS con `?depurar` (2026-11-07).
