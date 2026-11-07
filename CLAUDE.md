# Juegos y apps (raíz del repositorio)

Proyectos web para móvil del mismo autor, publicados en GitHub Pages. Si existe
`<proyecto>/CLAUDE.md`, sus reglas mandan dentro de esa carpeta. No toques un proyecto distinto
del que te han pedido.

| Carpeta | Qué es | Se publica en |
| --- | --- | --- |
| `game/` | RPG de hábitos (JS sin build) | raíz de Pages |
| `aerolinea/` | Simulador de aerolínea (JS sin build) | `/aerolinea/` |
| `leyendas-de-iberia/` | Juego de criaturas (Vite + TS + Phaser) | `/leyendas-de-iberia/` |
| `gymlog-fase1/` | App de gimnasio (HTML único) | `/gymlog-fase1/` |
| `Bulk-up-main/` | App de gimnasio anterior | no se publica |

## Estado actual

@ESTADO.md

## Reglas

Se siguen siempre. Si una no se va a seguir, avisa **antes** de actuar así:
`⚠️ Excepción R<n>: <por qué> → <qué haré en su lugar>`, y repítelo en el mensaje final.

1. **R1 · Tamaño primero.** Clasifica cada encargo:
   - **S**, minutos: se hace directo.
   - **M**: plan de 3 a 6 líneas en el mensaje y se sigue.
   - **L**, más de una hora o con decisiones de diseño: especificación escrita y aprobada por el
     autor antes de construir. En juegos: brief, contrato del bucle y plan de nivel, con
     `/nuevo-proyecto`.

   Si dudas entre M y L, es L.
2. **R2 · Hecho = comprobado.** Cada tarea tiene una comprobación de sí o no: prueba, build o
   captura. Al decir «hecho», muestra la prueba: el comando y su resultado, o la captura. Lo que
   no se pudo comprobar se dice con esas palabras.
3. **R3 · Quien construye no se puntúa.** Al cerrar una fase, algo visual importante o (según el
   modo) una función grande, lo revisa el agente `probador` con la rúbrica del proyecto antes de
   darlo por terminado. Sus hallazgos se enseñan sin suavizarlos.
4. **R4 · Pasos pequeños.** Una tarea cada vez. Cada commit deja el proyecto funcionando y con
   las pruebas en verde.
5. **R5 · Primero jugable, luego bonito.** Primero el bucle con formas simples, después una
   escena representativa completa, y solo entonces más contenido.
6. **R6 · Causa raíz.** Un fallo que vuelve se arregla en su origen, no con parches defensivos.
   Si un error se repite o cuesta caro, se añade una barrera (prueba, hook o regla) y se apunta
   en `APRENDIDO.md`.
7. **R7 · El estado vive en archivos.** Al terminar una tarea, actualiza `ESTADO.md` y el del
   proyecto. Las decisiones del autor se apuntan en su documento. Lo dicho solo en el chat se
   pierde.
8. **R8 · Original y limpio.**
   - Nada de nombres, personajes, arte, música ni textos de obras ajenas: solo mecánicas.
   - Recursos de terceros solo con licencia comprobada y apuntada en `CREDITS.md`.
   - Ninguna dependencia nueva sin decir por qué hace falta.
9. **R9 · Gasto proporcional.**
   - Se trabaja en el modo vigente (ver la tabla y `ESTADO.md`).
   - Nunca se gasta dinero real (OpenArt u otras APIs de pago) sin un sí explícito.
   - Antes de algo caro se avisa con una estimación y se espera el sí, salvo en modo máximo.
     Es caro: un flujo de trabajo, más de 3 subagentes, una investigación larga o esfuerzo
     máximo.
10. **R10 · El autor decide lo suyo.**
    - Se le pregunta solo lo que es suyo: gusto, alcance, prioridades y nombres.
    - Con la herramienta de preguntas: opciones cerradas, tu recomendación primero y hasta 4
      por tanda.
    - Lo técnico lo decides tú y lo explicas en una línea.
    - Si te falta un dato, pídelo en una línea y sigue con lo que no dependa de él.
11. **R11 · Cierre útil.** Al terminar una tarea (no al responder una pregunta), el mensaje
    final lleva:
    - el resultado y su prueba,
    - las excepciones,
    - **qué necesitas del autor**, en concreto: qué abrir, en qué dispositivo y qué puntuar de
      1 a 5,
    - y el siguiente paso recomendado con su coste: bajo, medio o alto.
12. **R12 · Investigación con fuentes.** Se distingue hecho, inferencia y opinión, y cada dato
    lleva su fuente. Antes de investigar, se mira `investigacion/` para no repetir (skill
    `investigar`).

## Modos de gasto

El autor lo cambia diciendo «modo ahorro», «modo normal» o «modo máximo». El modo vigente se
guarda en `ESTADO.md`.

| Modo | Cómo se trabaja |
| --- | --- |
| Ahorro | Lecturas y comprobaciones mínimas pero suficientes. `probador` solo al cerrar fases. Ningún otro subagente salvo imprescindible. Respuestas cortas. Sugerir Sonnet para lo rutinario |
| Normal | Comprobación completa de lo que cambia. `probador` al cerrar fases y funciones grandes. Subagentes solo para revisar o paralelizar |
| Máximo | Críticos independientes. Flujos de trabajo pequeños o medianos. Iterar hasta cumplir la rúbrica. Sugerir esfuerzo alto |

En todos los modos:

- Se lee solo lo necesario: se busca antes de abrir, se leen trozos de los archivos grandes y no
  se relee lo que ya está en contexto.
- La salida de los comandos es corta; el detalle va a archivos de log.
- Un tema por conversación. Si el autor cambia de tema, se le recomienda una sesión nueva: el
  estado ya está en `ESTADO.md`.

## Convenciones de todos los proyectos

- Código, comentarios y textos en español.
- Móvil primero: todo se usa con el dedo en 390 × 844 y también con teclado.
- La lógica va en un núcleo puro y determinista (semilla, sin DOM, sin `Math.random` ni reloj),
  con pruebas. El contenido son datos.

## Comprobar un cambio

- **Pruebas:** `npm test` en la carpeta del proyecto. Además, un hook
  (`herramientas/comprobar-al-terminar.mjs`) las ejecuta al terminar cada turno si el proyecto
  cambió, y bloquea una vez si fallan.
- **Verlo de verdad:** `node herramientas/capturar.mjs <carpeta|url>` (móvil simulado, capturas
  y errores).
  - Esta máquina no tiene GPU: WebGL2 por software y sin WebGPU. Los FPS de aquí no valen como
    prueba.
- **Revisión independiente:** agente `probador`.

## Publicar

`.github/workflows/publicar-juego.yml` publica al hacer push a `main` si pasan las pruebas. Un
proyecto nuevo necesita su ruta en `paths`, sus pruebas y su copia en «Montar el sitio».

## Dónde está cada cosa

- `COMO-TRABAJAMOS.md`: la guía para el autor (cómo pedir, modos, qué recibe).
- `APRENDIDO.md`: errores ya pagados y su barrera. Se mira antes de una tarea parecida.
- `investigacion/`: lo estudiado, con fuentes. La síntesis está en `00-sintesis.md`.
- Skills:
  - `/nuevo-proyecto`: de la idea a la primera versión.
  - `juego-3d`: producción 3D.
  - `pulir`: sensación de juego.
  - `investigar`: protocolo de investigación.
  - `cierre`: cerrar una tarea.

Este archivo se queda por debajo de 150 líneas y sin historial: el historial va en git.
