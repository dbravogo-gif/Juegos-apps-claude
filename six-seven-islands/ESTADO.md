# Estado de Six-seven islands

Actualizado: 2026-11-19. Solo el presente; el historial está en git. Máximo 40 líneas.

## Fase actual

Tanda 1: Lanzarote es la isla 1 (`ISLA-1.md`), con kit por código y la tabla de tipos C.

## Hecho

- Diseño aprobado (2026-11-07). `F01` a `F03`: andamiaje, núcleo (`core/ORIGEN.md`) y combate
  N contra N, con 1.000 combates de bots en las pruebas. Las criaturas salen de Meshy.

## Siguiente

1. Lanzarote (`ISLA-1.md`) y Fuerteventura (`ISLA-2.md`, fases 1 a 4) se juegan enteras:
   hierba, combate, captura, entrenadores, gimnasios de Roca y Aire, menús, guardado y barco.
   Historia cerrada (`HISTORIA.md`), hecha en Lanzarote y Fuerteventura.
2. Arte con Meshy (`prompts-meshy.md`): criaturas y edificios singulares.
3. Criaturas: reglas en `CRIATURAS.md`; el plan de las 203 para Meshy en `PLAN-CRIATURAS.md`
   (`herramientas/criaturas/plan.py`). Ya en el juego, a su altura, 21 criaturas del autor (Pok16 a
   Pok34 y el dinosaurio), con `herramientas/criaturas/juego.py` (ARCHITECTURE.md). Las iniciales,
   con sus tres formas; las criaturas evolucionan tras el combate, con el Sello.

4. Pendiente de lo que pidió el autor: sonido (hierba, malpaís, música y ambiente) y refugios,
   tiendas y escaleras de las casas más claros.

## Pendiente del autor

Probar las criaturas nuevas y Fuerteventura, aprobar Gran Canaria (`ISLA-3.md`) y lo demás de
la lista viva de `PENDIENTES.md` («Tareas del autor»).

## Defectos conocidos

- Solo ordenador desde 2026-11-08: falta medir los FPS en los PC del autor y sus amigos.
- En la caldera del Fuego, `mundo` gasta más llamadas de dibujo de su reparto (`ARCHITECTURE.md`).
- Las estatuas del museo y los personajes de KayKit son provisionales.
