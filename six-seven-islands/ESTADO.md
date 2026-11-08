# Estado de Six-seven islands

Actualizado: 2026-11-07. Solo el presente; el historial está en git. Máximo 40 líneas.

## Fase actual

Fase 3 de `/nuevo-proyecto`, el andamiaje: cerrada. Ahora, la prueba de arte (`F04`): hecha y
sin aprobar.

## Hecho

- Entrevista (fase 1). Las decisiones están en `DISENO.md`.
- Documentos (fase 2), aprobados por el autor el 2026-11-07: `DISENO.md`, `ARTE.md`,
  `ARCHITECTURE.md` y `funciones.json`.
- `F01`, el andamiaje: motor de subsistemas, render WebGPU o WebGL2, isla de prueba temporal,
  panel `?depurar`, `window.__JUEGO__`, web instalable y publicación.
- `F02`, el núcleo: reglas de Leyendas con código propio y sin su contenido
  (`src/core/ORIGEN.md`).
- `F03`, el combate N contra N (1 contra 1 y 2 contra 2), puro y determinista, con 1.000
  combates de bots en las pruebas.
- `F04`, la prueba de arte: generador por piezas, material compartido, animaciones y vitrina
  (79 pruebas). **El autor lo juzga insuficiente** (2026-11-07): quiere criaturas mucho más
  trabajadas. La decisión está abierta en `DISENO.md`.

## Siguiente

1. Prueba de Meshy con la línea de la inicial de Planta (`prompts-meshy.md`): falta la cría y
   una captura con textura. Si convence, Pro un mes y Claude la pone en la vitrina.
2. El bucle con formas simples (`F05` a `F10`) no depende del arte.

## Pendiente del autor

- Decidir si las pasivas entran en el juego, como contenido propio. Propuesta de Claude: sí,
  después de la isla 1.
- Antes de la tanda 3, elegir los nombres que proponga Claude.
- La imagen de la cría y la captura con textura de la forma 2 (`prompts-meshy.md`).

## Defectos conocidos

- Solo ordenador desde 2026-11-08: falta medir los FPS en los PC del autor y sus amigos.
