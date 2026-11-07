# 03 · Juegos hechos con Claude: los mejores casos y qué los hace funcionar

## Caso de referencia: World of ClaudeCraft (Levy Street, 2026)

[Repositorio](https://github.com/levy-street/world-of-claudecraft). He leído el README, el
CLAUDE.md, la lista de skills y `docs/qa-gate.md`.

- **Qué es:** un MMO clásico en el navegador, de código abierto.
  - Nueve clases, tres zonas, unas 60 misiones, mazmorras, PvP, comercio y una banda de diez
    jugadores.
  - Atrajo unos 30.000 jugadores, según la prensa alemana.
  - Primera versión jugable en unas 48 horas con Claude Fable 5. Después siguió meses.
- **Críticas:** es más una prueba de concepto que un MMO. Flojea en escalabilidad, red, base de
  datos y seguridad, y reutiliza recursos.

**Arquitectura, que es la lección principal:**

- **Un solo núcleo para tres usos.** `src/sim/` es una simulación determinista a 20 ticks por
  segundo, con un generador con semilla. No usa DOM, ni reloj, ni `Math.random`. El mismo código
  corre como mundo sin conexión en el navegador, como servidor y como entorno de aprendizaje por
  refuerzo.
- **Una sola puerta.** La interfaz solo habla con la simulación a través de `IWorld`. Una prueba
  comprueba que la versión sin conexión y la en línea no se separan.
- **Pruebas de arquitectura.** Una prueba rastrea los archivos de la simulación buscando imports
  prohibidos, DOM, reloj o `Math.random`. Otra pone un límite de líneas a los archivos grandes.
  Inferencia mía: esto convierte reglas de CLAUDE.md en algo que Claude no puede saltarse.
- **Bots como probadores:**
  - Scripts que juegan en navegador real.
  - Cinco bots que limpian una mazmorra en unos cinco minutos.
  - Los agentes mueven al personaje con `window.__game.controller` en vez de simular teclas.

**Cómo trabajan con agentes:**

- **CLAUDE.md:**
  - Invariantes.
  - Mapa del repositorio.
  - Comandos.
  - Flujo por defecto: una rama, un worktree, revisar antes, diffs pequeños y pruebas para la
    simulación.
  - Convenciones.
  - Instrucciones separadas para modelos más y menos capaces.
- **Reglas destacadas:**
  - Arreglar fallos empezando por una prueba que falla.
  - Todo texto visible sale de una clave de traducción.
  - Comprobar cada nombre propio nuevo para no chocar con propiedad intelectual ajena.
  - No editar a mano archivos generados.
- **Skills:**
  - Planificar funciones.
  - Control de calidad.
  - Revisar PR.
  - Abrir incidencias.
  - Escribir los textos de ayuda del juego.
  - Pasar de imagen a modelo 3D.
  - Auditorías antes de publicar.
- **Control de calidad por capas**, de rápido a lento:

  | Capa | Qué hace |
  | --- | --- |
  | `Stop` hook | Busca en milisegundos lo prohibido en las líneas nuevas |
  | `pre-push` | Tipos, determinismo y textos |
  | `gate:fast` | Comprobación rápida mientras se itera; no basta para fusionar |
  | `gate_select` | Comprobación selectiva; es el listón para fusionar |
  | `gate` | Todo, como en CI |
  | Cola de fusión | La suite sobre el resultado exacto de la fusión |
  | Puerta nocturna | Abre una incidencia si algo falla |
  | `/qa` | Revisión con criterio, solo consultiva |

  Dos frases clave del documento: «un camino rápido en verde nunca basta para decir que está
  hecho» y «un revisor que devuelve una lista vacía ha fallado y se vuelve a lanzar».
- **Recursos:**
  - Terreno, agua, cielo, pueblos y efectos generados en código.
  - Modelos 3D de fábricas deterministas, más kits CC0.
  - Iconos pintados por capas.
  - Música compuesta por procedimiento.
  - `CREDITS.md` con la licencia de cada recurso.

## Otros casos

- ***fly.pieter.com*** (Pieter Levels, 2025): Three.js multijugador en unas 3 horas, publicado
  sin terminar. Se hizo viral por la audiencia previa del autor y se monetizó con anuncios
  dentro del juego. Las cifras de ingresos se contradicen.
- **Vibe Jam 2026:** al menos el 90 % del código tenía que escribirlo una IA, y estaba
  patrocinada por Cursor, Bolt, Glif y Tripo.
  - Ganó *A Game About Capybaras Delivering Food*, multijugador en Three.js.
  - *Tiny Skies* se llevó el premio al más pulido y *KOTTBULLAR METAL* al más gracioso.
  - No he encontrado autopsias de cómo se hicieron.
- **Más jugados en Foundplay** (octubre de 2026): *Neon Intercept* (7.941 partidas) y World of
  ClaudeCraft (3.641). Funcionan en el móvil y se abren con un clic. No hay datos fiables de
  retención en ninguno.
- **Lista *awesome-ai-built-games*:**
  - Abundan Three.js y Canvas.
  - Géneros: carreras, idle con mercado entre jugadores, 4X, puzles diarios y recreativas con
    marcador compartido.
  - Mucho multijugador ligero y partidas cortas.

## Qué funciona en juegos, según las fuentes

1. **El estado como datos, no como píxeles.** Claude juega mal mirando capturas: le cuesta el
   espacio y se atascó horas en Pokémon. Juega bien con `window.__game` y estado JSON.
   - Bots que juegan con el estado sirven para encontrar regresiones.
   - Las capturas sirven para juzgar lo visual.
2. **Núcleo determinista y probado** que sirva para todo: navegador, servidor, bots y
   repeticiones.
3. **Contenido y arte generados por código** (procedural), con un registro de licencias.
4. **Puerta de calidad por capas,** con hooks para lo que no admite excepción.
5. **La sensación de juego sigue siendo humana.**
   - Fuentes de desarrolladores: «media hora de Claude y varias horas de pruebas manuales» y
     «el movimiento parece correcto, pero hay que jugarlo para notar la sensación».
   - Hay skills para diagnosticarla. *gstack-game* mide cinco dimensiones: respuesta, impacto,
     ritmo, claridad y recompensa. Su propio autor reconoce que las rúbricas están a medio
     calibrar.
6. **Retención.** Hay muy poca evidencia. Lo único concreto que he encontrado es anecdótico: en
   los juegos idle, un sistema de reinicio con ventajas («prestigio») evita que el jugador se vaya
   a los 20 minutos.

## Paquetes de skills para juegos

- ***gstack-game*** (29 skills). Sigue un orden de sprint: idea → plan → revisión → corte →
  construir → sensación → jugabilidad → pruebas → publicar → retrospectiva. Las más útiles:
  - **Revisión del GDD:** bucle, progresión, economía, motivación y riesgo, con nota.
  - **Recorrido como siete perfiles de jugador** con la emoción a lo largo del tiempo. Detecta
    cosas como «60 segundos muertos».
  - **Plan de prototipo:** qué hipótesis probar, qué fingir y cómo es el fracaso.
  - **Revisión adversaria** buscando trampas, desincronizaciones y partidas corruptas.

  El README avisa de que la madurez varía entre el 35 % y el 80 %.
- ***Claude Code Game Studios*** (49 agentes): muy popular, pero es una estructura pesada.
- **Inferencia mía:** lo valioso de estos paquetes son las **preguntas** que hacen, no la
  maquinaria.
