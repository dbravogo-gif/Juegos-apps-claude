# Cómo sacarle el máximo a Claude en juegos y apps

Guía hecha en noviembre de 2026 a partir de lo que publican Anthropic y la gente que está sacando
juegos y apps con Claude, comparada con lo que ya hay en este repositorio.

## Qué he estudiado y con qué cautela

- **Fuentes primarias:** dos artículos de ingeniería de Anthropic sobre agentes que trabajan horas
  solos, la guía oficial de buenas prácticas de Claude Code (versión actual) y la skill oficial de
  diseño de interfaces.
- **Fuentes secundarias:** recopilaciones del flujo de trabajo de Boris Cherny (creador de Claude
  Code), *fly.pieter.com*, la Vibe Jam 2026, la lista *awesome-ai-built-games*, *Claude Code Game
  Studios*, experiencias con Godot y la técnica «Ralph».
- **No he podido leer** Medium, Slate, dev.to ni explainx: la red de esta sesión no los deja pasar.
  Lo que sé de ellos viene de resúmenes de búsqueda.
- **Cautelas:** las cifras de ingresos de los juegos virales se contradicen entre fuentes (de 5.000
  a 138.000 $ al mes para el mismo juego), así que no las uso como argumento. Y solo se publica lo
  que triunfa: hay sesgo de supervivencia.

## La idea central

Los que sacan cosas buenas con Claude no escriben prompts mágicos. Montan un sistema en el que:

1. Claude puede **comprobar su propio trabajo** con algo que responde sí o no.
2. **Otro distinto juzga** el resultado con criterios escritos.
3. Cada sesión empieza con **el contexto justo**: el diseño, el estado y las reglas, sin ruido.

El prompt importa menos que eso. Todo lo demás de esta guía son formas de conseguir esas tres cosas.

## Ocho principios, con la prueba y lo que significan para ti

### 1. Dale una comprobación que responda sí o no

- **Prueba:** la guía oficial lo pone como el cambio que más rinde: sin comprobación, Claude para
  cuando el trabajo *parece* hecho. En los experimentos de Anthropic, probar la app en un navegador
  como un usuario cazó fallos que las pruebas unitarias no veían.
- **Tú:** ya lo haces mejor que la mayoría: pruebas en los tres proyectos grandes, CI que no publica
  si fallan (50 de las últimas 50 ejecuciones, en verde) y un bot que juega Leyendas entero.
- **Nuevo:** `herramientas/capturar.mjs` lleva lo mismo a todos los proyectos: abre la app en un
  móvil simulado, sigue unos pasos, hace capturas y falla si hay errores de consola o de red.

### 2. Quien construye no se juzga a sí mismo

- **Prueba:** Anthropic vio que un agente alaba su propio trabajo aunque sea mediocre. Un evaluador
  aparte, con criterios ponderados y ajustado para ser escéptico, subió mucho la calidad. Incluso
  así, al principio el evaluador encontraba fallos y luego se convencía de aprobarlos: hubo que
  decirle explícitamente que no lo hiciera.
- **Tú:** hoy el juez de calidad eres tú jugando. Se ve en el CLAUDE.md de Leyendas: «correcciones
  del autor tras jugar», «textos que se salían», «control trabado tras el combate».
- **Nuevo:** el agente `probador` (`.claude/agents/probador.md`). No ha visto escribir el código,
  no puede editar, puntúa cuatro criterios y tiene que demostrar cada fallo con una captura.

### 3. Planifica antes de construir

- **Prueba:** la guía oficial recomienda pedir a Claude que te entreviste hasta poder escribir la
  especificación, y construir después en una sesión limpia. Cuando Anthropic simplificó su
  sistema quitando piezas, el planificador fue lo único que no pudo quitar: sin él, el constructor
  se quedaba corto.
- **Tú:** el GDD con decisiones cerradas y abiertas es exactamente esto, y a buen nivel.
- **Nuevo:** una lista de funciones en JSON con «cómo se comprueba» cada una (la usa
  `/nuevo-proyecto`). Anthropic eligió JSON porque Claude lo respeta más que un Markdown y no
  «reinterpreta» las tareas.

### 4. Pide ambición de forma explícita

- **Prueba:** la guía oficial dice que Claude interpreta los pedidos de forma conservadora y
  construye lo mínimo que los cumple, porque no sabe cuánto esperabas. La frase que funciona es
  «sé ambicioso» seguida de lo que incluye: estados vacíos y de error, transiciones, teclado…
- También dice qué **no** sirve ya: «piensa mucho», «sé exhaustivo», MAYÚSCULAS o «IMPORTANTE».
  Para pensar más está `/effort high`, o `ultrathink` en un único mensaje.

### 5. CLAUDE.md corto; los procedimientos, en skills; el estado, en su archivo

- **Prueba:** CLAUDE.md se carga en cada sesión y cada línea resta atención. La guía oficial
  recomienda menos de 200 líneas y da por obsoleto describir la arquitectura y los archivos ahí,
  porque Claude lee el código solo. Las skills solo se cargan cuando hacen falta.
- **Tú:** el CLAUDE.md de Leyendas tiene 310 líneas: 148 son el historial del «Estado actual» y 93
  describen la estructura. Las reglas que de verdad importan («Reglas que más se olvidan») son unas
  30 y quedan enterradas.
- **Propuesta (pendiente de tu visto bueno):**
  - Pasar el estado a `docs/ESTADO.md`, que es el «archivo de progreso» del método de Anthropic.
  - Pasar «Añadir una zona» a una skill.
  - Dejar en CLAUDE.md las reglas, los comandos y las trampas.

### 6. Deja que trabaje horas sin ti, pero con raíles

- **Prueba:** el método de Anthropic para sesiones largas tiene seis piezas:
  - Una lista de funciones en la que todas empiezan «sin hacer».
  - Una función cada vez.
  - Un commit por función.
  - Un archivo de progreso que la siguiente sesión lee al empezar.
  - Un script para arrancar la app.
  - Una prueba de extremo a extremo antes de seguir.

  La comunidad lo empuja más lejos con el bucle «Ralph» (hay plugin oficial) o con `/goal`,
  siempre con un tope de iteraciones.
- **Cuándo sí:** el capítulo 5 de Leyendas, cuando sus decisiones abiertas estén cerradas.
- **Cuándo no:** con decisiones de gusto o de diseño sin cerrar. Ahí trabajará deprisa en la
  dirección equivocada.
- **Coste:** gasta el uso de tu plan. No es dinero, pero se acaba.

### 7. Trabaja en paralelo

- **Prueba:** el hábito más citado de Boris Cherny es tener unas cinco sesiones a la vez, cada una
  en su rama o *worktree*, y que una segunda sesión revise el plan de la primera.
- **Tú:** todas las PR de Leyendas han salido en serie de una única rama. Hay trabajos que no se
  pisan y podrían ir en paralelo, en sesiones distintas: el arte del capítulo 5, el sonido y el
  equilibrio.
- **Bloqueo:** todas las sesiones editan «Estado actual» en el mismo archivo, así que en paralelo
  chocarían. Por eso el punto 5 va primero.

### 8. El gusto también se escribe

- **Prueba:** la skill oficial de diseño de Anthropic lista los tics de la interfaz hecha por IA:
  - Fondo crema con un acento terracota.
  - Tarjetas redondeadas todas iguales.
  - Etiquetas en mayúsculas espaciadas.
  - Degradados morados.
  - La animación de aparecer deslizando en cada sección.

  La regla de la skill es «gasta tu audacia en un solo sitio». Anthropic también comprobó que
  puntúa mejor preguntar «¿sigue nuestros principios?» que «¿es bonito?».
- **Tú:** la portada de App viación tiene un estilo propio. Aun así, cuando le pidas a Claude
  algo visual, dale los principios del proyecto, no adjetivos.

## Qué tienen los juegos que triunfan

- ***fly.pieter.com*** (Pieter Levels, 2025): un simulador de vuelo multijugador en Three.js,
  hecho en unas 3 horas y publicado sin terminar. Su lema es «mejor al 80 % que nunca». Se hizo
  viral sobre todo porque su autor ya tenía audiencia.
  - Lección: publicar y enseñar pronto. La distribución pesa más que la técnica.
- **Vibe Jam 2026:** la ganó *A Game About Capybaras Delivering Food*, un mundo abierto
  multijugador en Three.js. Lo que se repite en las listas de juegos hechos con IA:
  - Se juegan en el navegador.
  - Partidas cortas.
  - Un solo gancho claro.
  - A menudo, multijugador ligero.
- ***Claude Code Game Studios*** (49 agentes, 73 skills): es popular, pero no lo instalaría
  entero. Anthropic quitó piezas de su propio sistema cada vez que el modelo mejoraba, y más
  agentes es más coste y más ruido. Copia ideas sueltas, no el paquete.
- **Motores:** Claude rinde mejor con motores cuyo contenido es texto (web, Phaser, Godot) que con
  Unity o Unreal. Tu elección de stack es la correcta.
- **Juegos de un solo prompt:** son demos, no productos. Lo que se hace viral en una tarde no
  aguanta una semana de juego. Leyendas ya está en otra liga.

## Diagnóstico de este repositorio

**Lo que ya haces a nivel alto:**

- Núcleo determinista y contenido como datos.
- Pruebas y CI que no publica si fallan.
- Diseño con decisiones cerradas y abiertas.
- Un bot que juega el modo historia completo.
- Arte generado por scripts (se cambia el script, nunca el PNG).
- Publicación automática.

**Huecos, ordenados por impacto:**

1. **Ningún juego tiene sonido.** Ni Leyendas, ni App viación, ni el juego de hábitos. Un juego
   de criaturas sin un golpe en el combate ni una fanfarria al capturar pierde buena parte de la
   sensación. Se arregla sin coste ni licencias con `/pulir` (efectos generados por código).
2. **El control de calidad depende de que tú juegues.** Para eso está el agente `probador`.
3. **El CLAUDE.md de Leyendas está sobrecargado** (punto 5), y eso también impide el paralelo.
4. **Trabajo en serie** (punto 7).
5. **Dispersión** (esto es una inferencia mía): hay cinco proyectos. Si quieres «algo grande», uno
   tiene que ser el buque insignia y llevarse la mayoría de las sesiones. Por madurez, por
   jugadores reales (tú y tus dos amigos) y por originalidad, ese es Leyendas.

## Lo que he dejado montado

| Archivo | Para qué | Cómo se usa |
| --- | --- | --- |
| `CLAUDE.md` (raíz) | Mapa de proyectos, convenciones comunes y cómo publicar uno nuevo | Se carga solo; 40 líneas |
| `herramientas/capturar.mjs` | Capturas en un móvil simulado y errores de consola o red | `node herramientas/capturar.mjs aerolinea` |
| `.claude/agents/probador.md` | Revisión independiente como jugador, con notas y pruebas | «Pide al probador que revise el combate» |
| `.claude/skills/nuevo-proyecto/` | De la idea a la primera versión publicada, con entrevista y lista de funciones | `/nuevo-proyecto` |
| `.claude/skills/pulir/` | Pase de sensación de juego y sonido sin archivos | `/pulir el combate de Leyendas` |

He probado `capturar.mjs` con `game/`, `aerolinea/`, `gymlog-fase1/` y Leyendas compilado: las
cuatro abren sin errores.

## Plan propuesto

1. **Reorganizar el CLAUDE.md de Leyendas** (corto, y desbloquea el paralelo). Necesita tu visto
   bueno porque cambia tu rutina de fin de sesión.
2. **`/pulir` en Leyendas:** sonido y respuesta en combate, captura y menús. Después lo escuchas
   tú y decides.
3. **Capítulo 5 con el método largo:**
   - Cerrar sus decisiones abiertas contigo.
   - Escribir `funciones.json`.
   - Una sesión autónoma.
   - El `probador`.
   - Tú juegas al final, no en medio.
4. **Un experimento con Claude dentro del juego** (sección siguiente), pequeño y aparte, para ver
   si merece la pena.

## Capacidades gratis que no estás usando

- **Claude dentro de una página publicada en claude.ai.** Las páginas que Claude publica como
  Artifact pueden:
  - Preguntar a Claude: un personaje que conversa o un narrador que reacciona a lo que haces.
  - Tener multijugador en tiempo real entre quienes la tienen abierta.
  - Guardar datos compartidos, como un marcador o intercambios de criaturas.

  Todo eso sin servidor ni clave de API. **Cautela:** solo funciona dentro de claude.ai, para
  personas con acceso a la página, así que no sirve para la versión pública de GitHub Pages. Y no
  he verificado cuánto uso le consume a quien la abre. Por eso el plan lo propone como
  experimento.
- **Tareas programadas:** una partida de prueba cada noche contra `main` que te deja el informe.
  Consume uso del plan.
- **Controles de sesión:**
  - `Esc` para frenar en cuanto se desvía.
  - `/rewind` para volver atrás.
  - `/clear` y un prompt mejor después de dos correcciones fallidas: una tercera corrección en la
    misma conversación casi nunca funciona.
- **OpenArt** está conectado a tus sesiones y genera imágenes y vídeo, pero gasta créditos. Lo
  dejo fuera mientras no quieras invertir.

## Recetas para copiar

**Idea nueva:**

> Quiero hacer [idea]. Entrevístame con preguntas de opciones hasta poder escribir el diseño. Luego
> escríbelo con decisiones cerradas y abiertas, y la lista de funciones con cómo se comprueba cada
> una. No programes nada todavía.

O directamente `/nuevo-proyecto`.

**Pedir el nivel alto:**

> Sé ambicioso: estados vacíos y de error, transiciones, respuesta a cada toque, que quepa en
> 390 × 844 y funcione con teclado. No solo la maqueta.

**Revisión que no sea autocomplaciente:**

> Cuando acabes, pide al probador que revise [pantalla] contra el GDD. Arregla todo lo que puntúe
> por debajo de 4 y enséñame su informe original, no un resumen.

**Sesión larga:**

> Trabaja `funciones.json` de arriba abajo, una función cada vez: impleméntala, `npm test`,
> captúrala con `capturar.mjs`, márcala hecha y haz commit. No cambies descripciones ni criterios.
> Para cuando estén todas o cuando una decisión abierta te bloquee, y dime cuál.

**Cuando no sale:** después de dos intentos fallidos, `/clear` y un prompt nuevo que diga qué se
probó y por qué falló.

**Fallo raro:** `/effort high` antes de pedirlo, o `ultrathink` en ese mensaje.

## Límites reales

- **Claude no oye.** Cualquier sonido lo tiene que valorar una persona.
- **El probador también falla.** En los experimentos de Anthropic, el evaluador seguía dejando
  pasar fallos escondidos. Reduce lo que tienes que revisar, pero no lo elimina.
- **La calidad cuesta uso.** Anthropic midió que construir con planificador, constructor y
  evaluador costaba más de 20 veces lo que una sola pasada: 200 $ frente a 9 $ en precio de API.
  Úsalo para lo que importa, no para cada botón.
- **La sensación de juego la juzgas tú.** El sistema sirve para que, cuando juegues, encuentres
  problemas de diseño y no textos que se salen.

## Fuentes

- [Anthropic: Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Claude Code: Best practices](https://code.claude.com/docs/en/best-practices)
- [Skill oficial frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)
- [InfoQ: el flujo de trabajo del creador de Claude Code](https://infoq.com/news/2026/01/claude-code-creator-workflow/)
- [levels.io: fly.pieter.com](https://levels.io/full-multiplayer-python-websockets-game-ai)
- [Vibe Jam 2026](https://vibej.am/2026/)
- [awesome-ai-built-games](https://github.com/lappemic/awesome-ai-built-games)
- [Claude Code Game Studios, análisis](https://www.developersdigest.tech/blog/claude-code-game-studios-49-agents-rigor-analysis-2026)
- [Summer Engine: Claude para Godot](https://www.summerengine.com/blog/claude-for-godot)
- [La técnica Ralph](https://www.atcyrus.com/stories/ralph-wiggum-technique-claude-code-autonomous-loops)
