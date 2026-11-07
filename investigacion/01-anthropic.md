# 01 · Lo que publica Anthropic sobre sus mejores usos de Claude

Fuentes primarias, leídas completas el 2026-11-07. Lo que no es un hecho del artículo va marcado.

## El compilador de C hecho por 16 Claudes en paralelo (feb. 2026)

[Artículo](https://www.anthropic.com/engineering/building-c-compiler), de Nicholas Carlini.

- **Resultado:** compilador de C en Rust de 100.000 líneas, hecho desde cero.
  - Compila Linux 6.9 en x86, ARM y RISC-V, además de SQLite, Postgres, Redis, FFmpeg y QEMU.
    También ejecuta Doom.
  - Pasa alrededor del 99 % de las suites de pruebas.
  - Costó unas 2.000 sesiones en dos semanas y unos 20.000 $ de API.
- **Arnés mínimo:**
  - Un bucle de bash relanza `claude -p` con un archivo de prompt cada vez que termina una sesión.
  - Cada agente trabaja en su propio contenedor, con un clon de un repositorio git compartido.
- **Coordinación sin jefe:**
  - Cada agente «reserva» una tarea creando un archivo en `current_tasks/`. Git hace de
    cerrojo: si dos reservan la misma, uno tiene que elegir otra.
  - No hay agente orquestador. Cada uno coge «el siguiente problema más obvio».
- **La lección principal:** el verificador tiene que ser casi perfecto, porque si no Claude
  resuelve el problema equivocado. El autor se repetía «escribe las pruebas para Claude, no para
  ti».
- **Proteger el contexto:**
  - Por pantalla solo salen unas pocas líneas; el detalle va a archivos de log.
  - Cada error ocupa una línea que empieza por `ERROR`, para poder buscarlo.
  - Las estadísticas se resumen antes de enseñarlas.
- **Ceguera temporal:**
  - Claude no nota el tiempo que pasa y podía pasarse horas ejecutando pruebas.
  - Solución: una opción `--fast` que ejecuta una muestra determinista del 1 % o el 10 %,
    distinta en cada agente. Entre todos cubren la suite entera.
- **Cuándo funciona el paralelo y cuándo no:**
  - Con fallos independientes, sí: cada agente coge uno.
  - Con una tarea gigante (el kernel), los 16 agentes chocaban con el mismo fallo y se pisaban
    los arreglos.
  - Solución: un oráculo conocido (GCC) que compila al azar una parte de los archivos. Así cada
    agente se queda con fallos distintos.
- **Roles especializados:**
  - Quitar código duplicado.
  - Mejorar el rendimiento.
  - Criticar el diseño como lo haría un experto en Rust.
  - Mantener la documentación.
- **Memoria entre sesiones:** README y archivos de progreso actualizados a menudo. Cuando un
  agente se atasca, lleva un documento con los intentos fallidos.
- **Límites que encontró:**
  - Las funciones nuevas rompían las viejas; el CI se añadió tarde y hacía falta antes.
  - Pasar las pruebas puede dar una falsa sensación de terminado.
  - Calidad de código «razonable, por debajo de un experto».
- **Qué hizo el humano:** diseñó el arnés, las pruebas y el entorno, y fijó los requisitos de
  alto nivel. La implementación quedó en manos de los agentes.

## Arnés para apps largas: planificador, constructor y evaluador (mar. 2026)

[Artículo](https://www.anthropic.com/engineering/harness-design-long-running-apps).

- **El evaluador va aparte.** Un agente alaba su propio trabajo. El evaluador usa Playwright
  sobre la app en marcha, puntúa criterios ponderados y está ajustado para ser escéptico.
- **Criterios de diseño:** calidad, originalidad, oficio y funcionalidad. Pesan más los dos
  primeros, porque los otros el modelo ya los cumple. Funciona mejor preguntar «¿sigue nuestros
  principios?» que «¿es bonito?».
- **Calibrado:** se le dan ejemplos puntuados para que no derive. Al principio el evaluador
  encontraba fallos y luego se convencía de aprobarlos; hubo que corregirle el prompt leyendo
  sus registros.
- **Contratos de sprint:** antes de programar, el constructor propone qué significa «hecho» y
  cómo se comprobará, y el evaluador lo revisa.
- **El planificador** convierte un prompt de una a cuatro frases en una especificación completa.
  Se queda en el qué y el porqué, no en el cómo. Fue lo único imprescindible al simplificar:
  sin él, el constructor se queda corto.
- **Generar, puntuar y decidir:** el constructor recibe la nota y decide si refina o cambia de
  dirección. Entre 5 y 15 iteraciones. A veces la mejor no es la última.
- **Coste:** una pasada sola, 20 min y 9 $, con el modo de juego roto. El arnés completo,
  6 h y 200 $, con un editor de juegos retro que funciona.
- **Principio:** la solución más simple posible, y complejidad solo cuando haga falta. Cada
  modelo nuevo permite quitar piezas.

## Arneses para agentes de larga duración (nov. 2025)

[Artículo](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents).

- **Un agente inicializador** prepara:
  - `init.sh`, para arrancar la app.
  - Un archivo de progreso.
  - Una lista de funciones en JSON, todas marcadas como fallando.
  - El primer commit.
- **Cada sesión siguiente:**
  1. Lee el progreso y el log de git.
  2. Arranca la app y hace una prueba de extremo a extremo.
  3. Hace una sola función.
  4. Hace commit y deja el código limpio.
- **Por qué JSON:** el modelo lo altera menos que un Markdown. Solo puede cambiar `passes`.
- **Fallos que resuelve:**
  - Querer hacerlo todo de golpe.
  - Dar el proyecto por terminado antes de tiempo.
  - Marcar funciones como hechas sin probarlas en el navegador.

## Componentes de la memoria de un agente (nov. 2026)

[Artículo](https://www.anthropic.com/engineering/components-of-agent-memory).

- **Cuatro capas:**
  1. Transcripciones: la verdad, consultable.
  2. Notas: hechos, reglas y planes, en archivos.
  3. Representaciones: una wiki de páginas enlazadas.
  4. Contexto inyectado: un índice pequeño que se carga siempre.
- **Qué guardar:**
  - Reglas verificadas, con cómo se verificaron.
  - Trampas descubiertas.
  - El objetivo y los próximos pasos, reescritos cuando cambian.
  - Correcciones después de un error.
- **Qué no guardar:** lo que se puede leer del estado actual. Envejece y ocupa sitio.
- **Un dueño por archivo.** Con varios agentes escribiendo en el mismo archivo se pierden
  entradas: en una prueba, de 57 hechos quedaron 41.
- **Wiki y búsqueda a la vez:** acierta un 61 %, frente al 53 % solo con búsqueda y el 48 % solo
  con wiki, y gasta unos 20.000 tokens menos por pregunta.
- **No poner reglas rígidas** sobre qué escribir. «Apunta solo los fallos» empeoró a algunos
  modelos.
- **«Soñar»:** una pasada fuera de la sesión que revisa las notas contra las transcripciones,
  corrige, fusiona, poda y mantiene pequeño el índice.
- **Borrar el estado viejo** en vez de llevar un registro detallado de él: mantener ese registro
  puede costar más que trabajar.

## Cómo usan Claude Code los equipos de Anthropic

[Artículo](https://claude.com/resources/articles/how-anthropic-teams-use-claude-code).

- **Diseño de producto:**
  - Le dan archivos de Figma y bucles autónomos: escribe, prueba e itera.
  - Consejo: plantear un problema abstracto, dejarlo trabajar y revisar antes de refinar.
  - Le piden que mapee estados de error y casos límite ya en la fase de diseño.
- **Prototipos «tragaperras»** (científicos de datos que no saben TypeScript):
  1. Un intento de una sola vez en un entorno aislado.
  2. Si no vale, pequeños retoques y se vuelve a tirar.
- **Seguridad:** primero pseudocódigo y después desarrollo guiado por pruebas. Dejaron atrás el
  ciclo «documento de diseño → código chapucero → refactorizar → abandonar las pruebas».
- **Capturas de pantalla** en lugar de descripciones, incluso para depurar una caída de
  servicio.
- **Marketing:** dos subagentes generan cientos de variantes de anuncios a partir de un CSV.
- Consejo común: tratarlo como un compañero con quien pensar, no como un generador de código.

## Evaluaciones de agentes (ene. 2026)

[Artículo](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents).

- **Empezar pequeño:** de 20 a 50 tareas sacadas de fallos reales, y empezar pronto.
- **Tres tipos de juez:**
  - Código: rápido, barato y reproducible.
  - Modelo con rúbrica: para lo subjetivo; hay que calibrarlo.
  - Humano: el patrón oro; úsalo poco.
- **Cada tarea:** que no sea ambigua y que tenga una solución de referencia que demuestre que
  se puede resolver. Se juzga el resultado, no los pasos.
- **pass@k frente a pass^k:** pass@k es la probabilidad de acertar al menos una vez en k
  intentos; pass^k, la de acertar las k veces. Si un jugador espera que algo funcione siempre,
  cuenta pass^k: un 75 % por intento da solo un 42 % de acertar tres de tres.
- **Dos suites:**
  - Capacidad, con una tasa de acierto baja, para saber dónde mejorar.
  - Regresión, cerca del 100 %. Una tarea pasa a esta cuando ya sale siempre bien.
- **Leer las transcripciones** antes de fiarse de una puntuación.

## Claude juega a Pokémon

Fuentes secundarias. No he leído la fuente primaria.

- Empezó en 2024 como banco de pruebas de agentes de larga duración, con un arnés modesto.
- **Problemas:**
  - Memoria: si debe decidir él qué guardar, guarda poco u olvida.
  - Percepción espacial: estuvo horas intentando cerrar un «diálogo» que en realidad era una
    puerta.
- **Lo que ayudó:** herramientas de navegación aparte.
- **Estado:** en mayo de 2026 había una partida en curso con Opus 4.7. No he encontrado
  confirmación de que la terminara.
- **Lección (inferencia mía):** Claude ve peor el espacio que el código. Para juegos, darle el
  estado como datos (`window.juego`, JSON) es más fiable que pedirle que interprete capturas.
