# 09 · Revisión crítica del informe de otras IAs (Grok, Perplexity, Gemini, consolidado por ChatGPT)

Recibido el 2026-11-07. He contrastado cada punto con mis fuentes y con verificaciones nuevas:

- La base de datos `cases.json`, con 2.526 obras.
- La documentación oficial de Claude Code.
- El repositorio original de Matt Shumer.

## Valoración del informe

- **Perplexity: la mejor.** Trajo fuentes primarias, como las notas oficiales de Safari de
  Apple, y separó bien lo verificado.
- **Grok: útil para X.** Confundió algunas autorías (el barco en la botella).
- **Gemini: casi todo sin URL.** Hace afirmaciones técnicas plausibles, pero ningún caso
  verificable. Sus dos «casos de estudio» (el *roguelite* de 24 h y «Unmask the City») no tienen
  fuente: los descarto.
- **El consolidado es honesto:** separa hechos, inferencias y lo no verificado. Tiene un error
  de calibración: marcó como sospechosa una cifra que es correcta (ver más abajo).
- **Para futuras investigaciones con varias IAs:** Perplexity y Grok sí; Gemini para vídeos de
  YouTube, nunca como fuente de datos.

## Contradicciones del informe que he resuelto

Contrastadas con `cases.json`.

- **C1, *El Principito*:** las dos versiones son ciertas. @Saccc_c tiene dos publicaciones:
  - `2109962425512734739`, del 13 de octubre: **juego** de exploración 3D, con Tripo y Blender,
    3,88 M de visualizaciones.
  - `2114942260353868116`, del 27 de octubre: corto animado de papel recortado.

  Grok tenía razón sobre el juego.
- **C2, barcos:**
  - El barco en la botella (*voxel*) es de **@vib3coded**.
  - Meng To tiene otras cuatro obras: el viaje en barca por Japón (`2102760783344189761`, con el
    prompt completo ya en `05-escaparate-opus-5-5.md`), el barco esculpido en código
    (`2103122947133309311`), un juego de mesa con IA como máster (`2116404959277433240`) y una
    partida familiar de rol.

  Mis notas eran correctas.
- **@DannyLimanseta:** el informe cambió su juego de aventuras con pincel
  (`2104215873120764032`) por el paseo por la Atlántida (`2103169095034400772`). Son obras
  distintas. Del primero sigue sin aparecer el prompt.

## Lo nuevo y valioso

### 1. El *Gauntlet Loop* y *Claude of Duty* (Matt Shumer)

Fuente primaria: [repositorio](https://github.com/mshumer/Claude-of-Duty), 3.510 estrellas.
He leído `prompt.md` y `ARCHITECTURE.md`.

**El prompt completo** (literal):

> I want you to build a first-person shooter at the level of the most recent Call of Duty games.
> It should be utterly perfect, visually beautiful, with every single thing done at AAA
> quality—from textures to physics to anything you could think of.
>
> Fan out sub-agents and have sub-agents tackle each one individually so that the game is
> utterly perfect. You should /loop on each item and have a separate sub-agent check it visually
> to ensure it looks triple A. That separate sub-agent should be a really harsh critic, and if it
> doesn't look triple A, it should keep going.
>
> Don't stop until each sub-agent is utterly wowed with the quality when compared with the
> actual Call of Duty game. It should literally compare them side by side blind and say which one
> looks better. Do this in ThreeJS. /loop until it's utterly perfect. Fan out sub-agents and
> ultracode.

**El método,** según la prensa: quien construye nunca se puntúa a sí mismo; críticos nuevos y
duros; comparación a ciegas contra una referencia **inalcanzable**. Es la versión popular del
generador y evaluador de Anthropic.

**El resultado real,** según el propio README:

- 11 críticos puntuaron 3,59 → 4,14 → 4,05 → **5,05 sobre 10**. La mayoría de tomas quedaron
  en «AMATEUR».
- En la comparación a ciegas, **todos los críticos eligieron siempre el Call of Duty real**.
- Problemas que el autor reconoce:
  - Manos de bloque.
  - Materiales que de cerca parecen ruido.
  - Enemigos con aspecto de maniquí.
  - Iluminación indirecta aproximada.
  - 28 a 30 FPS en pantalla Retina.

**Coste,** según la prensa (Stork, Decrypt) y no verificado: un juego tipo F1 hecho con el mismo
método costó unos 1.200 $, con 1.700 M de tokens, 137 agentes y 19 horas.

**La pieza clave no es el prompt,** sino `ARCHITECTURE.md`, un «contrato del motor» que cada
agente lee antes de escribir código. Es el único mecanismo de coordinación:

- **Reglas duras:**
  - Cada agente es dueño de su carpeta y nunca edita fuera de ella.
  - Nunca importa otro subsistema: lo pide en tiempo de ejecución (`ctx.get('fx')`).
  - Ninguna dependencia nueva, ni recursos externos.
  - Nada de `Math.random`: solo `ctx.rng`.
  - **No crear objetos en cada fotograma.**
  - Liberar (`dispose`) todo lo que se crea.
  - `npm run build` y la captura deben funcionar después de cada cambio.
- **Interfaz común por subsistema:** `init`, `fixedUpdate` (120 Hz, determinista), `update`,
  `lateUpdate`, `resize` y `dispose`. Cada uno con su id y sus dependencias.
- **Mapa de propiedad:** 11 subsistemas (render, materials, sky, world, physics, player,
  weapons, fx, ai, ui y audio), cada uno en su carpeta.
- **Tabla de eventos entre subsistemas** con su carga útil. Un evento nuevo se añade a la tabla
  en el mismo commit.
- **Listón de calidad no negociable:**
  - Ninguna superficie plana.
  - Iluminación con separación clave, relleno y contorno.
  - Valores físicamente plausibles.
  - Nada perfectamente recto, limpio o repetido.
  - Toda acción tiene peso: retroceso, sacudida, sonido y efecto visual.
- **Herramientas** en `tools/`: captura, línea base, diferencia de imágenes, perfilado, partida
  de prueba y series de tomas.

**Lecciones:**

1. El contrato de arquitectura con propiedad por carpetas es lo que hace posible el paralelo.
   Coincide con «un archivo, un dueño» del artículo de memoria de Anthropic y con el compilador
   en C.
2. Un listón inalcanzable empuja el esfuerzo, pero no da AAA: dio 5/10. Para nosotros, sin
   presupuesto, el listón debe ser **alcanzable y del estilo elegido** (estilizado), no
   «fotorrealista como Call of Duty».
3. El coste de este método está fuera de nuestro alcance si se usa a lo bruto. Con Pro, los
   flujos de trabajo vienen por defecto en tamaño `small` (menos de 5 agentes).

### 2. Flujos de trabajo dinámicos y `ultracode`

Una función de Claude Code que no conocía, verificada en la
[documentación oficial](https://code.claude.com/docs/en/workflows).

- **Qué son:** un script de JavaScript que escribe Claude y que orquesta muchos subagentes:
  `agent()`, `pipeline()`, `parallel()` y `phase()`. Se ejecuta en segundo plano.
  - Los resultados intermedios viven en variables del script, no en el contexto de Claude.
  - Se pueden **guardar** en `.claude/workflows/` como comandos y **reanudar**.
- **Cómo se activan:**
  - La palabra `ultracode` en un prompt, o pedir «usa un workflow».
  - `/effort ultracode` para toda la sesión. Gasta mucho más.
- **En Pro:** hay que activarlos en `/config`. El tamaño por defecto es `small` (menos de 5
  agentes).
- **Aviso:** a partir de 25 agentes o 1,5 M de tokens previstos, sale la alerta «Large
  workflow».
- **Patrones de calidad incluidos:** revisión adversaria entre agentes, «arreglar hasta que la
  comprobación pase o dos rondas seguidas no avancen», buscar hasta que la lista deje de crecer.
- **Detalle útil:** dentro del script, `Math.random()` y `Date.now()` lanzan un error, para que
  al relanzar se repitan las mismas llamadas.
- `/deep-research` es un flujo incluido: investiga con verificación cruzada y votación por cada
  afirmación.
- @xikhar usó estos flujos para su mundo 3D: «agents build and check in parallel».

### 3. Citas de expertos, ahora con fuente

- **Boris Cherny,** sin URL primaria pero coherente con todo lo demás:
  - «give Claude a way to verify its work… it will 2-3x the quality».
  - «Spin up 3-5 git worktrees at once… the single biggest productivity unlock».
- **Simon Willison:**
  [Agentic Engineering Patterns](https://simonwillison.net/2026/Feb/23/agentic-engineering-patterns/),
  del 23 de febrero de 2026. Ideas:
  - «Writing code is cheap now».
  - TDD rojo/verde.
  - **Explicaciones interactivas para reducir la «deuda cognitiva»:** el autor deja de entender
    el código que genera el agente. Muy relevante para un autor que no lee código: pedir a Claude
    recorridos explicados de la arquitectura.
- **Mitchell Hashimoto:**
  [My AI Adoption Journey](https://mitchellh.com/writing/my-ai-adoption-journey), del 5 de
  febrero de 2026. **Contradicción sin resolver:** el informe habla de 3 fases y mis resúmenes
  anteriores de 6, terminando en «siempre un agente trabajando» y «harness engineering». No puedo
  leer el original.

### 4. Prompts literales nuevos

- **Minecraft** (@noahwachnik, `2102470200415166699`): «Create a playable version of Minecraft in
  my browser. Add advanced shaders that make it look as real and beautiful as possible.» Esfuerzo
  máximo, unos 1 h 37 min. Visualmente ambicioso; no dice nada de la arquitectura.
- **Fallout** (@chrisfirst): «make me a Fallout game in New York», más el *Gauntlet Loop*. Todo en
  código, sin texturas ni archivos de sonido.
- **Barco en una botella** (@vib3coded): prompt completo en el informe. Pide arte *voxel*, física,
  todo dentro de la botella y un único HTML. Unos 12 $ de API.
- **Patrón (inferencia mía):** los prompts cortos funcionan con esfuerzo máximo y horas de
  trabajo autónomo, pero apoyados en un **método** (el *Gauntlet Loop*, flujos de trabajo) o en
  una **lista exhaustiva** (Meng To). El prompt corto solo no explica el resultado.

### 5. WebGPU en Safari, con fuente oficial

Notas de versión de Apple, vía Perplexity.

- **Safari 26** (15 de septiembre de 2025): «Added support for WebGPU».
- **Safari 27** (14 de septiembre de 2026): cambios en WGSL y en límites.
- **Safari 27.2** (26 de octubre de 2026): **corrigió una caída grave de FPS** con
  `executeBundles()` y dibujado indirecto.
- **Consecuencias:**
  1. WebGPU en iPhone es real, pero joven.
  2. Evitar *render bundles* con dibujado indirecto hasta Safari 27.2 o posterior.
  3. Mantener WebGL2 como respaldo.
  4. Probar en el iPhone real del autor, sabiendo su versión de iOS.

### 6. Afirmaciones técnicas de Gemini, revisadas con criterio propio

- **«4 texturas de 2048² ≈ 90 MB»: es CORRECTO,** aunque el consolidado lo marcó como sospechoso.
  - Cada textura RGBA8 ocupa 2048 × 2048 × 4 B = 16 MiB; con mipmaps, unos 21,3 MiB; por
    cuatro, unos 85 MiB.
  - KTX2/Basis se convierte a formatos comprimidos de GPU (ASTC, ETC2, BC7) que **siguen
    comprimidos en la memoria de vídeo**. Esto es conocimiento previo, coherente con que Bruno
    Simon usa KTX2 ETC1S.
  - Lo exagerado: que la conversión sea «siempre instantánea». Cuesta CPU al cargar.
- **`InstancedMesh` y el descarte por cámara:** plausible y coherente con lo que sé. Three.js
  descarta el conjunto entero por su esfera envolvente, no cada instancia; para campos grandes
  hacen falta trozos espaciales o `BatchedMesh`. Hay que comprobarlo en la versión que usemos.
- **Tabla de códigos de salida de `PreToolUse`: CORRECTA según la documentación oficial.**
  - 2 bloquea, y stderr vuelve a Claude.
  - 0 con JSON permite el control estructurado.
  - Cualquier otro código es un error no bloqueante y la acción sigue.
- **Riesgo de «código defensivo» y parches acumulados:** sin estudio, pero coherente con dos
  fuentes oficiales:
  - La guía oficial: «si arreglas cada hallazgo del revisor, acabas con capas de abstracción de
    más».
  - World of ClaudeCraft, que tiene una prueba de presupuesto de líneas contra los archivos
    monstruo.

  Lo adopto como regla: **causa raíz, no parches**.
- **«Loop engineering»:** no es un término establecido. Es lo mismo que el «harness engineering»
  o los bucles de `/goal`.

## Lo que «nadie encontró», y ya tenemos parcialmente

- **Reglas verificadas de un proyecto grande:** World of ClaudeCraft es público, con CLAUDE.md,
  `AGENTS.md`, hooks, pruebas de arquitectura, CI y puertas por capas. Más el contrato de
  *Claude of Duty*.
- **Presupuestos de render para móvil:** *threejs-game-skills* da presupuestos, no mediciones.
  Las mediciones reales tendremos que hacerlas nosotros en el móvil del autor.
- **Coste por método:** tampoco hay datos fiables. Los generaremos nosotros midiendo con `/usage`
  por tarea.

## Señal del autor

El encargo consolidado pone como objetivo explícito **reducir el consumo de créditos**. Las
reglas tienen que incluir disciplina de coste:

- Elegir el esfuerzo y el modelo según la tarea.
- `/clear` entre tareas distintas.
- Subagentes baratos (Haiku) para tareas simples.
- No volver a leer archivos grandes.
- Archivo de progreso en vez de volver a explicar.
- Flujos de trabajo pequeños o medianos, nunca a lo bruto.
