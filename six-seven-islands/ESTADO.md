# Estado de Six-seven islands

Actualizado: 2026-11-08. Solo el presente; el historial está en git. Máximo 40 líneas.

## Fase actual

Tanda 1 (bucle con formas simples): F05 hecha, con un pase de arte de KayKit (CC0) en casas,
árboles, rocas y personas (2026-11-08). La prueba de arte de criaturas (F04) sigue con Meshy.

## Hecho

- Entrevista (fase 1). Las decisiones están en `DISENO.md`.
- Documentos (fase 2), aprobados el 2026-11-07: `DISENO.md`, `ARTE.md`, `ARCHITECTURE.md` y
  `funciones.json`.
- `F01`, el andamiaje: motor de subsistemas, render WebGPU o WebGL2, isla de prueba temporal,
  panel `?depurar`, `window.__JUEGO__`, web instalable y publicación.
- `F02`, el núcleo: reglas de Leyendas, con código propio y sin su contenido (`core/ORIGEN.md`).
- `F03`, el combate N contra N (1 contra 1 y 2 contra 2), puro y determinista, con 1.000
  combates de bots en las pruebas.
- `F04`, generador de criaturas por piezas y vitrina. **El autor lo juzga insuficiente**
  (2026-11-07): las criaturas saldrán de Meshy (`DISENO.md`).

## Siguiente

1. Isla 1 (`ISLA-1.md`): mapa por casillas y maqueta jugable (F05) hechos; se recorre con el
   teclado (`?abrir=todo` abre los pasos). Siguiente: interiores y diálogos (museo, elección de
   la inicial y anciano) y después encuentros, combate y captura.
2. En paralelo, arte con Meshy (`prompts-meshy.md`): la cría de Planta y `planta-2.glb`.

## Pendiente del autor

- Decidir si las pasivas entran en el juego, como contenido propio. Propuesta de Claude: sí,
  después de la isla 1.
- Antes de la tanda 3, elegir los nombres que proponga Claude.
- La imagen de la cría y la captura con textura de la forma 2 (`prompts-meshy.md`).

## Defectos conocidos

- Solo ordenador desde 2026-11-08: falta medir los FPS en los PC del autor y sus amigos.
- El bosque es de coníferas de KayKit; la laurisilva real es de hoja ancha (`ARTE.md`).
