# 02 · Cómo trabajan quienes más rendimiento le sacan a Claude

Casi todo viene de resúmenes y entrevistas, salvo el repositorio de Superpowers, que he leído
entero. Las cifras de estrellas y commits cambian mucho de una fuente a otra; las doy como orden
de magnitud.

## Superpowers, de Jesse Vincent (obra)

[Repositorio](https://github.com/obra/superpowers), leído. Es un plugin de skills con unas
decenas de miles de estrellas.

- **El flujo, siempre en este orden:**
  1. **Lluvia de ideas:** pregunta para aclarar, resume lo que ha entendido para que lo
     corrijas y escribe un documento de diseño si el trabajo es grande.
  2. **Worktree:** abre una rama aislada y comprueba que las pruebas pasan *antes* de tocar
     nada.
  3. **Plan:** tareas de 2 a 5 minutos, con rutas exactas, código y cómo verificar cada una.
  4. **Ejecución:** un subagente nuevo por tarea y una revisión en dos fases: primero si
     cumple la especificación y luego la calidad.
  5. **Desarrollo guiado por pruebas** en cada tarea: prueba que falla, código mínimo,
     commit.
  6. **Revisión entre tareas:** los fallos críticos bloquean el avance.
  7. **Cerrar la rama:** fusionar, abrir PR, conservarla o descartarla.
- **Skills que van fuera del flujo:**
  - *systematic-debugging*: cuatro fases para encontrar la causa raíz.
  - *verification-before-completion*: comprobar antes de decir «hecho».
  - *writing-skills*: crear y probar skills nuevas.
- **Filosofía:** pruebas primero, proceso en vez de adivinar, la simplicidad como objetivo y
  «pruebas en vez de afirmaciones».

## Compound engineering, de Kieran Klaassen (Every)

- **Bucle:** idea → plan → trabajo → revisión → pulido → «compound» → repetir.
- **El paso «compound»** escribe lo aprendido (problema, solución, trampa) en `docs/solutions/`
  para que la siguiente sesión lo lea. Cada fallo arreglado se convierte en conocimiento que no
  se vuelve a pagar.
- **Reparto del tiempo:** según resúmenes, el 80 % en planificar y revisar y el 20 % en ejecutar
  y anotar.
- **Plan con subagentes** que investigan en paralelo el código, las buenas prácticas y las
  versiones de las bibliotecas. **Revisión con agentes** de seguridad, arquitectura y calidad,
  con los hallazgos priorizados.
- `/lfg`: el ciclo entero en modo autónomo, con pruebas en navegador y vídeo de la función.
  Lanza más de 50 agentes; es caro.
- [Plugin](https://github.com/EveryInc/compound-engineering-plugin).

## Peter Steinberger (OpenClaw, antes Clawdbot)

Según la entrevista de *The Pragmatic Engineer* y otros resúmenes.

- **«Publico código que no leo»,** porque diseña el sistema para que los agentes compilen,
  pasen el linter, ejecuten la suite completa y validen. Si sale en verde, se publica.
- **Entre 5 y 10 agentes en paralelo**, cada uno en una función distinta. Mientras uno
  trabaja de 40 a 60 minutos, él planifica el siguiente.
- **Especificación antes de construir:** usa otro modelo para escribir una especificación
  formal a partir del código y se la pasa al agente constructor.
- **«Prompt requests»:** en vez de pull requests, prompts detallados. Discutir la arquitectura
  sustituye a la revisión línea a línea.
- **Prefiere Codex para tareas muy largas**, porque Claude Code le hacía preguntas a mitad.
  Inferencia mía: es una preferencia de su flujo; con `/goal` o un `Stop` hook, Claude Code
  también sigue sin preguntar.

## Mitchell Hashimoto (Terraform, Ghostty)

Fuente: resúmenes de «My AI Adoption Journey».

- **«Harness engineering»:** cada vez que un agente repite un error, se cambia algo en el
  entorno (una herramienta, una prueba, una regla) para que no pueda volver a cometerlo.
- **Siempre un agente trabajando.** Si no hay ninguno en marcha, se pregunta qué podría estar
  haciendo. Empezó reservando los últimos 30 minutos del día para dejar agentes trabajando
  mientras él no estaba.
- **La revisión depende del proyecto:** en Ghostty, que vivirá años, revisa cada línea; en
  proyectos de usar y tirar, mucho menos.

## Armin Ronacher (Flask, Sentry)

[Agentic coding](https://lucumr.pocoo.org/2025/6/12/agentic-coding.md), leído a través de
resúmenes.

- **Lenguajes y código simples:** Go, PHP o Python básico. Pocas dependencias, la biblioteca
  estándar y nombres claros. La «magia», como las fixtures implícitas, confunde a los agentes.
- **Ecosistemas estables:** lo que cambia cada mes, el modelo no lo conoce bien.
- **Herramientas como scripts normales**, no MCP. Un script, un log o un ejecutable son
  herramientas. Demasiados MCP pudren el contexto antes. Solo usa uno: Playwright.
- **Respuestas rápidas y claras:** logs sencillos y buenas excepciones.

## Steve Yegge (Gas Town, Beads, Wyvern)

- **Gas Town** (enero de 2026) orquesta entre 20 y 30 agentes. **Beads** es un gestor de tareas
  guardado en git que sobrevive a cualquier reinicio porque son archivos.
- **Usuarios:** gasto de unos 100 $ por hora con muchos agentes, demasiados conceptos que se
  solapan, y el propio Yegge avisaba de no usarlo en serio. Conclusión de un usuario: «la
  simplicidad gana a la potencia».
- **En agosto de 2026**, según resúmenes, dio por fallido su flujo con Gas Town y se hizo un
  arnés privado (Wheelhouse) para su juego Wyvern. Hay críticas al resultado del juego. Sin
  fuente primaria.

## Harper Reed

Fuente: «My LLM codegen workflow atm», febrero de 2025, a través de resúmenes.

1. **Especificación:** un modelo conversacional te hace preguntas *de una en una* hasta tener
   `spec.md`.
2. **Plan:** un modelo de razonamiento lo divide en pasos (`prompt_plan.md`) y una lista
   (`todo.md`).
3. **Ejecución:** un paso cada vez, con pruebas después de cada uno.

Avisa de que varios agentes sobre el mismo código «chocan, y las fusiones son horribles»,
salvo que cada uno tenga su propia rama.

## Boris Cherny (creador de Claude Code)

Fuente: recopilaciones de su hilo de enero de 2026; no he podido leer el original.

- Unas cinco sesiones a la vez, entre local y nube.
- Modo plan para lo que no sea trivial.
- Una segunda sesión revisa el plan de la primera como si fuera un ingeniero sénior.
- CLAUDE.md en git, con los errores que se repiten. Lo actualiza el equipo en las revisiones.
- Lo más importante, según él: darle a Claude una forma de verificar su trabajo, lo que
  multiplica la calidad por dos o tres.

## Lo que se repite en todos

1. **Especificación antes de programar**, sacada de una entrevista.
2. **Tareas pequeñas** con su forma de comprobarse.
3. **Verificación automática** antes de dar nada por hecho.
4. **Un revisor distinto** del que construye.
5. **Lo aprendido se escribe** (CLAUDE.md, `docs/solutions/`, harness engineering) para no
   pagar el mismo error dos veces.
6. **Paralelo con aislamiento:** una rama o un worktree por agente.
7. **La simplicidad gana:** los orquestadores enormes (Gas Town, `/lfg` con más de 50 agentes)
   impresionan, pero quienes los crearon o los usaron acaban volviendo a algo más simple.
