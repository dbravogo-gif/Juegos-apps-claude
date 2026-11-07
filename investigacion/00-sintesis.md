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

## Ronda 3: juego 3D desde cero

Detalle en `06-juego-3d.md`.

- **Diseño antes que escena:** brief, contrato del bucle y plan de nivel, cada parte demostrada
  con entrada real.
- **Gráficos en orden:** forma, material, luz, efectos. El brillo no arregla los primitivos.
  Se puntúan con una hoja de 10 categorías y anclas visuales.
- **Sensación en orden:** latencia, curvas de respuesta, contacto, cámara y sonido.
- **Verificación:** bot con entrada real, capturas en partida, métricas de imagen y contadores
  de render.
- **Esta sesión** solo tiene WebGL2 por software. Los FPS de aquí no sirven como prueba.

## Ronda 4: arte sin artistas y concepto

Detalle en `07-arte-y-concepto.md`.

- **La receta de estilo de Bruno Simon** (r187, TSL, Rapier):
  - Color de una paleta compartida.
  - Rebote de luz falso.
  - Sombra propia con bordes ajustables.
  - Sombras de color.
  - Niebla.
  - *Bloom* solo para lo emisivo.
  - Calidad por niveles y panel de depuración.
- **Arte:** silueta, lenguaje de formas, prueba en grises y paleta limitada escrita.
- **Concepto:** pitch en una frase, restricciones, un verbo con profundidad y presión real.

## Ronda 5: reglas que se cumplen y contexto

Detalle en `08-reglas-y-contexto.md`.

- **CLAUDE.md es contexto, no una obligación.** Menos de 200 líneas, comprobable y sin
  contradicciones.
- **Lo que no admite excepción** se convierte en pruebas, hooks (`command`, `prompt` o
  `agent`) o CI.
- **Las reglas crecen por fallos observados.**
- **Safari en iPhone** tiene WebGPU desde iOS 26, con vuelta a WebGL2.

## De la investigación a las reglas

Las 18 candidatas se adoptaron el 2026-11-07 en un método único. Las reglas vigentes están solo
en `CONSTITUCION.md` (de la R1 a la R12), para que no haya dos versiones que se contradigan.

| Candidata | Dónde quedó |
| --- | --- |
| Especificación antes de construir | R1, con tamaños S, M y L, y `/nuevo-proyecto` |
| «Hecho» con prueba | R2, más el hook `herramientas/comprobar-al-terminar.mjs` |
| Quien construye no se puntúa | R3 y el agente `probador` |
| Primero jugable; una escena antes de multiplicar | R5 y la skill `juego-3d` |
| Gráficos en orden; guía de arte; calidad por niveles; panel de depuración | Skill `juego-3d` y plantilla `ARTE.md` |
| Núcleo determinista; ganchos de prueba | Convenciones de `CLAUDE.md` y `/nuevo-proyecto` |
| Estado en archivos | R7, `ESTADO.md` (importado en `CLAUDE.md`) y la skill `cierre` |
| Error repetido → barrera; causa raíz | R6 y `APRENDIDO.md` |
| Originalidad; licencias en `CREDITS.md`; dependencias justificadas | R8 |
| Avisar antes de saltarse una regla | Encabezado de `CONSTITUCION.md` (formato «⚠️ Excepción R<n>») |
| Contrato de arquitectura | Plantilla `arquitectura.md` de `/nuevo-proyecto` |
| Disciplina de coste | R9 y los modos de gasto de `CONSTITUCION.md` |
| Listón alcanzable | Skill `juego-3d` y rúbrica |
| Explicaciones para no perder la comprensión | «explícame X», en `COMO-TRABAJAMOS.md` |

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
