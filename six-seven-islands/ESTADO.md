# Estado de Six-seven islands

Actualizado: 2026-11-10. Solo el presente; el historial está en git. Máximo 40 líneas.

## Fase actual

Tanda 1: Lanzarote es la isla 1 (`ISLA-1.md`), con kit por código y la tabla de tipos C.

## Hecho

- Documentos de diseño aprobados el 2026-11-07 (`DISENO.md`, `ARTE.md`, `ARCHITECTURE.md`).
- `F01` andamiaje, `F02` núcleo con las reglas de Leyendas (`core/ORIGEN.md`) y `F03` combate
  N contra N, puro y determinista, con 1.000 combates de bots en las pruebas.
- `F04`, generador de criaturas por piezas, descartado: las criaturas salen de Meshy.

## Siguiente

1. Isla 1, Lanzarote (`ISLA-1.md`): con la silueta de Lanzarote y 7 zonas (Famara, opcional),
   un interior por edificio, mar adornado y plano en 2D (`?mapa`). Dani es el jugador (Meshy).
   **Ya se juega** (2026-11-12): encuentros en la hierba, combate con Luchar, Mochila, Equipo y
   Huir, experiencia, captura con la barra, cura y vuelta al refugio al perder, y guardado
   automático (`?nueva` empieza de cero) y todos los entrenadores, que te ven, retan y pagan;
   la líder abre el barco, y menú de pausa con Esc (equipo, mochila, mapa y exportar o importar
   la partida), tienda en La Geria, inicial rebelde hasta el anciano, portada (persona y
   nombre), sonido por código y final de la isla 1 (el barco, tras la líder). Siguen la tabla
   de tipos con Lucha y, con las criaturas del autor, la evolución.
2. En paralelo, arte con Meshy (`prompts-meshy.md`): criaturas y edificios singulares.
3. Criaturas: reparto y lista de referencia en `CRIATURAS.md` (2026-11-10). Se diseñan con el
   autor y sus amigos; dónde aparece cada una se decide al final.

## Pendiente del autor

Las personas de sus amigos, la historia y, si puede, Dani con `Idle`. Todo lo abierto está en
`PENDIENTES.md`. Lo primero: las estadísticas de las 4 iniciales, el
cuadrado de tipos (aparcado) y puntuar el kit.

## Defectos conocidos

- Solo ordenador desde 2026-11-08: falta medir los FPS en los PC del autor y sus amigos.
- La Palma: el camino de su capital pasa detrás del gimnasio (en Lanzarote ya va por delante).
- En la caldera de las Montañas del Fuego, `mundo` gasta más de su reparto de llamadas
  (`ARCHITECTURE.md`).
- Las estatuas del museo y los personajes de KayKit son provisionales.
