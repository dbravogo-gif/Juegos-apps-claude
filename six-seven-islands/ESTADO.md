# Estado de Six-seven islands

Actualizado: 2026-11-10. Solo el presente; el historial está en git. Máximo 40 líneas.

## Fase actual

Tanda 1. La isla 1 es Lanzarote desde el 2026-11-10 (`ISLA-1.md`), con mapa nuevo, kit por
código y la tabla de tipos C. La Palma, guardada para la 6. Las criaturas, con Meshy.

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

1. Isla 1, Lanzarote (`ISLA-1.md`): mapa, interiores y diálogos hechos, con los arreglos del
   probador (2026-11-10). Siguen encuentros, combate y captura.
2. En paralelo, arte con Meshy (`prompts-meshy.md`): criaturas y edificios singulares.

## Pendiente del autor

- Decidir si entran las pasivas, como contenido propio. Propuesta de Claude: tras la isla 1.
- Antes de la tanda 3, elegir los nombres que proponga Claude.
- Puntuar el kit en `?catalogo` y en la isla; rehacer con Meshy lo que no llegue a 4.

## Defectos conocidos

- Solo ordenador desde 2026-11-08: falta medir los FPS en los PC del autor y sus amigos.
- La Palma: el camino de su capital pasa detrás del gimnasio (en Lanzarote ya va por delante).
- En la caldera de las Montañas del Fuego, `mundo` gasta más de su reparto de llamadas
  (`ARCHITECTURE.md`).
- Las estatuas del museo y los personajes son provisionales (Meshy y F12).
