# 00 · Síntesis: los patrones de los mejores usos de Claude

Primera ronda de estudio (2026-11-07). Detalle y fuentes en:

- `01-anthropic.md`: lo que publica Anthropic.
- `02-maestros.md`: cómo trabajan los grandes usuarios.
- `03-juegos.md`: casos de juegos.
- `04-herramientas.md`: herramientas y opciones gratuitas.

## Los patrones que se repiten

Ordenados por la fuerza de la evidencia.

1. **El verificador decide la calidad.** Lo dicen el compilador en C («el verificador tiene que
   ser casi perfecto»), Boris Cherny («la verificación multiplica la calidad por 2 o 3»),
   Steinberger («si sale en verde, se publica») y la puerta por capas de World of ClaudeCraft.
   El humano diseña las pruebas; Claude escribe el código.
2. **Quien construye no se juzga.** Lo dicen el arnés de Anthropic, la revisión en dos fases
   de Superpowers, los revisores de Compound Engineering, `/code-review` y la revisión
   adversaria de *gstack-game*. Tiene dos trampas conocidas:
   - El revisor encuentra fallos y se convence de aprobarlos.
   - El revisor encuentra algo siempre, aunque no haya nada importante.
3. **Primero la especificación, sacada de una entrevista.** Lo hacen Harper Reed (una
   pregunta cada vez), Superpowers (lluvia de ideas), el planificador de Anthropic (el único
   componente que no se pudo quitar) y la guía oficial.
4. **Unidades pequeñas, con su forma de comprobarse, una cada vez.** Funciones en JSON con
   `passes` (Anthropic), tareas de 2 a 5 minutos (Superpowers), contratos de sprint, Beads.
5. **El estado vive en archivos y en git, no en la conversación.** Archivos de progreso,
   README que mantienen los propios agentes, `docs/solutions/` y Beads. Cada sesión empieza
   leyéndolos y termina actualizándolos.
6. **Cada error se convierte en una barrera.**
   - El «harness engineering» de Hashimoto y el paso «compound» de Klaassen.
   - Las pruebas de arquitectura de World of ClaudeCraft.
   - Una prueba nueva por cada fallo, en el compilador.
   - La regla oficial: si una línea de CLAUDE.md se incumple, pásala a un hook.
7. **Un núcleo determinista y probado, y todo lo demás encima.** World of ClaudeCraft usa el
   mismo núcleo para navegador, servidor y bots. El compilador usa GCC como oráculo y una
   muestra determinista de pruebas.
8. **El juego se prueba con estado, no con píxeles.** Los bots juegan con `window.__game`. Las
   capturas son para juzgar lo visual. A Claude le cuesta el espacio, como se vio en Pokémon.
9. **Paralelo, pero aislado y desacoplado.** Una rama o un worktree por agente y tareas
   independientes. Con una tarea gigante y acoplada, los agentes se pisan (el kernel), y las
   fusiones son «horribles» (Harper Reed).
10. **La simplicidad gana a la maquinaria.**
    - Anthropic quita piezas a su arnés con cada modelo nuevo.
    - Yegge abandonó Gas Town.
    - Los paquetes de 49 agentes impresionan más de lo que rinden.
    - Ronacher prefiere scripts a MCP.

## Lo que sigue siendo humano

Hay acuerdo en todas las fuentes:

- La sensación de juego y el «¿es divertido?».
- El sonido, porque Claude no oye.
- Las decisiones de diseño y de gusto.
- La aprobación final.

Los sistemas buenos no eliminan al humano: hacen que su tiempo vaya a esas cosas y no a cazar
textos que se salen de su recuadro.

## Antipatrones documentados

- Pedir un juego en un solo prompt y tomarlo por un producto.
- Dejar que el agente marque su trabajo como hecho sin pruebas de extremo a extremo.
- Varios agentes escribiendo en el mismo archivo. En el experimento de memoria se perdieron
  entradas: de 57 hechos quedaron 41.
- Instrucciones largas cargadas siempre: «los archivos largos reducen la fiabilidad».
- Muchos MCP y muchos agentes «por si acaso».
- Fiarse de una puntuación sin leer las transcripciones.

## Ronda 2: el escaparate de Opus 5.5

Detalle en `05-escaparate-opus-5-5.md`.

- **El salto está en lo visual hecho solo con código:** 3D, movimiento y animación.
- **Sin gastar en herramientas:** el 60 % de los juegos virales solo usó herramientas gratuitas.
- **Lo que tienen en común los mejores prompts:**
  - un listón de calidad explícito,
  - restricciones técnicas cerradas,
  - un plan en archivo antes de construir,
  - autocrítica con capturas por partes,
  - y un inventario concreto del mundo.
- **«Un prompt» suele significar horas de trabajo autónomo.**

## Huecos para las próximas rondas

1. **Diseño de juegos con Claude:** qué hace divertido un juego (bucle, progresión, *juice*) y
   cómo convertirlo en criterios que un evaluador pueda puntuar. Aún no he leído fuentes
   específicas.
2. **Anthropic, pendientes:** «Writing effective tools for agents», «Effective context
   engineering», «Agent Skills» y el sistema de investigación multiagente.
3. **El `.claude/` real de World of ClaudeCraft:** sus hooks, skills y agentes por dentro.
4. **Prompts reales** de las creaciones que mejor salieron, para ver la forma exacta.
5. **Apps (no juegos)** con mayor impacto hechas con Claude, y cómo se hicieron.
6. **Fuentes que no pude leer porque la red las bloquea:** los blogs de Simon Willison,
   Hashimoto y Ronacher, Medium, dev.to, InfoQ y *The Pragmatic Engineer*. Habría que
   permitirlas en los ajustes de red del entorno.
