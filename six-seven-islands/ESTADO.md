# Estado de Six-seven islands

Actualizado: 2026-11-25. Solo el presente; el historial está en git. Máximo 40 líneas.

## Fase actual

Gran Canaria (`ISLA-3.md`): hecha entera, fases 1 a 4, con lo del probador arreglado
(2026-11-23). Queda el barco a Tenerife: la isla 4 (`ISLA-4.md`) espera la aprobación del autor.

Revisión de todo el juego (2026-11-24, encargo del autor): arreglados los fallos y lo visual
de Fuerteventura y Gran Canaria. Los cambios de jugabilidad importantes están en
`RESUMEN-ISLAS.md` (D1 a D6), esperando al autor.

2026-11-25: vitrina 3D en la ficha; skills `rpg`, `level-design` y `threejs-*` instaladas; el
simulador de partida (`npm run equilibrio`, `EQUILIBRIO.md`). Revisión con esas herramientas en
`REVISION.md`: etapas 1 a 4 hechas y publicadas (dificultad, islas, aspecto, sensación). Etapa 5,
el probador independiente, en marcha. Lo de jugabilidad sigue en D1 a D6, esperando al autor.

## Hecho

- Diseño aprobado (2026-11-07). `F01` a `F03`: andamiaje, núcleo (`core/ORIGEN.md`) y combate
  N contra N, con 1.000 combates de bots en las pruebas. Las criaturas salen de Meshy.

## Siguiente

1. Lanzarote (`ISLA-1.md`) y Fuerteventura (`ISLA-2.md`, fases 1 a 4) se juegan enteras:
   hierba, combate, captura, entrenadores, gimnasios de Roca y Aire, menús, guardado y barco.
   Historia cerrada (`HISTORIA.md`), hecha en Lanzarote y Fuerteventura.
2. Arte con Meshy (`prompts-meshy.md`): criaturas y edificios singulares.
3. Criaturas: reglas en `CRIATURAS.md`; el plan de las 203 para Meshy en `PLAN-CRIATURAS.md`
   (`herramientas/criaturas/plan.py`). Ya en el juego, a su altura, 31 criaturas del autor (Pok16 a
   Pok42, Pok48–49 y el dinosaurio), con `herramientas/criaturas/juego.py` (ARCHITECTURE.md). Las iniciales,
   con sus tres formas; las criaturas evolucionan tras el combate, con el Sello.

4. Tenerife (`ISLA-4.md`), en cuanto el autor la apruebe y elija la mecánica del gimnasio de
   Agua. Las criaturas Eléctricas, cuando el autor las haga en Meshy: la isla y el gimnasio las
   usan provisionales.
5. Música grabada lista: falta que el autor suba las pistas (`src/assets/musica/LEEME.md`).

## Pendiente del autor

Probar las criaturas nuevas y Fuerteventura, aprobar Gran Canaria (`ISLA-3.md`) y lo demás de
la lista viva de `PENDIENTES.md` («Tareas del autor»).

## Defectos conocidos

- Solo ordenador desde 2026-11-08: falta medir los FPS en los PC del autor y sus amigos.
- En la caldera del Fuego, `mundo` gasta más llamadas de dibujo de su reparto (`ARCHITECTURE.md`).
- Las estatuas del museo y los personajes de KayKit son provisionales.
