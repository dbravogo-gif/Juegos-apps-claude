# Aprendido

Errores ya pagados y la barrera que evita repetirlos (regla R6). Formato: fecha · qué pasó ·
causa · barrera. Lo más reciente va arriba. Si un error vuelve a pasar, su barrera sube de
nivel: de nota a regla, y de regla a prueba o hook.

- **2026-11-10 · Al hablar, paredes y suelos de los interiores se llenaban de líneas que se
  movían** (Six-seven islands; lo vio el autor en su portátil).
  - Causa: caras que coincidían.
    - Las paredes eran una caja por casilla, así que había caras pegadas entre vecinas.
    - Los zócalos medían 1,02 y se solapaban 2 cm con el de al lado, con las caras en el mismo
      plano.
    - El remate tenía la cara de arriba a la misma altura que la pared.
    - Entre las tablas del suelo se veía el fondo; con un fondo oscuro, salían rayas negras a
      través de cada casilla.
    - Al mover la cámara, la GPU alterna qué cara gana en cada píxel y salen rayas que se
      desplazan.
  - Barrera:
    - lo que es una pieza seguida se hace de una pieza (`tramosDe` en `salas.ts`, con su prueba
      en `tests/juntas.test.ts`);
    - dos cajas nunca comparten una cara en el mismo plano: una sobresale al menos 1 cm;
    - el suelo no lleva juntas: un cuadrado por casilla sobre una losa, 2 mm por encima.
  - Aparte, la sombra se mueve de texel en texel (`ajustarATexel` en `render.ts`), para que no
    «nade» cuando la cámara se desliza.

- **2026-11-08 · La azotea del gimnasio salía casi blanca y sin su sol pintado** (kit canario
  de Six-seven islands).
  - Causa: dos a la vez.
    - Arriba les da el sol y el relleno del cielo, y el mapeo tonal lleva los colores claros
      casi a blanco.
    - La cornisa era una caja maciza más alta que el suelo de la azotea y la tapaba entera.
  - Barrera:
    - en `ARTE.md`, las superficies horizontales llevan colores medios;
    - nada se apoya sobre una caja maciza sin comprobarlo en `?catalogo`, que enseña cada pieza
      de cerca con la luz del juego.

- **2026-11-07 · La prueba de arte F04 cumplía `ARTE.md`, pero el autor quería otra cosa:**
  criaturas mucho más trabajadas, al nivel de Pokémon, no «gotas» de vinilo.
  - Causa: la guía describía el estilo con palabras («redondas y blandas») y se aprobó sin
    imágenes de referencia del nivel de acabado que el autor tenía en mente.
  - Barrera: antes de construir una prueba de arte, pedir al autor 2 o 3 imágenes (o nombres
    concretos) del acabado que espera, y enseñarle un boceto rápido antes de construirlo
    entero. Está en esta nota; si se repite, pasa a la skill `/nuevo-proyecto`.

- **2026-11-07 · Las animaciones cortas no salían en las capturas** (prueba de arte de
  Six-seven islands): el destello del golpe parecía no funcionar.
  - Causa: aquí el render va a ~9 FPS por software y el motor limita el paso a 5 fotogramas
    fijos, así que el juego avanza más despacio que el reloj. Una espera de 280 ms son ~0,1 s
    de animación, y la captura tarda varios fotogramas. No era un fallo del juego.
  - Barrera:
    - cámara lenta en el juego (`?lento=0.1`) y la opción `--consulta` de `capturar.mjs` para
      pasarla también a una carpeta;
    - está en la skill `juego-3d`, en «Verificación».
    - En escritorio, el clic de Playwright se agota con el hilo saturado: usar teclas.
- **2026-11-07 · Aclarar los colores de tipo «para el sol de tarde» fundía las criaturas con la
  hierba** en escala de grises (prueba de arte de Six-seven islands).
  - Causa: se ajustó la luminosidad por intuición y no por contraste con el suelo.
  - Barrera: el criterio está en `ARTE.md` (contraste de valor con la hierba) y la captura en
    gris de la vista de explorar forma parte de la comprobación.

- **2026-11-07 · El `probador` encontró 8 fallos que 54 pruebas en verde no veían** (combate de
  Six-seven islands).
  - Causa:
    - las acciones se validaban hueco a hueco y no por lado;
    - el bot de las pruebas evitaba a propósito el caso malo (no sacaba dos veces al mismo
      suplente);
    - las invariantes no miraban esa propiedad.
  - Barrera:
    - validar el conjunto de decisiones de un lado (`validarDecisiones`);
    - comprobar las invariantes sobre el estado (ninguna criatura en dos huecos), no fiarse del
      bot;
    - una prueba por hallazgo, verificada deshaciendo la corrección.
    - El `probador` se lanza siempre al cerrar una fase, aunque las pruebas estén en verde.

- **2026-11-07 · Los contadores del render salían a 0 en el panel** (Three.js r187,
  `WebGPURenderer`).
  - Causa: el bucle interno de Three.js (`Animation.js`) pone `renderer.info` a cero al empezar
    cada fotograma, antes que nuestro bucle.
  - Barrera: los contadores se fotografían justo después de `render()`. Está en
    `juego-3d/referencias/rendimiento.md` y en el render de `six-seven-islands`.
- **2026-11-07 · `npm install` desde cero fallaba** con «Cannot read properties of null
  (reading 'edgesOut')» (npm 10.9).
  - Causa: un fallo de npm al resolver dependencias *peer* sin lockfile.
  - Barrera: partir de un `package-lock.json` que ya funcione (el de otro proyecto con las
    mismas herramientas) y usar `npm ci`.

- **2026-11-07 · El autor descartó los 3 conceptos de juego propuestos.**
  - Causa: se propusieron solo a partir de criterios técnicos, sin preguntar antes qué juegos le
    gustan ni qué sensación busca.
  - Barrera: el paso 0 de `/nuevo-proyecto`. Primero sus gustos y sus ideas; después, conceptos
    que partan de ellos.
- **2026-11-07 · WebFetch falla en dominios nuevos** (Medium, dev.to, Slate, InfoQ, blogs
  personales).
  - Causa: la red de la sesión solo deja pasar algunos hosts.
  - Barrera: no reintentar. Usar WebSearch, GitHub (`git clone --depth 1`,
    raw.githubusercontent.com), anthropic.com y code.claude.com. Está en la skill `investigar`.
- **2026-11-07 · Páginas de documentación de 50 a 65 KB llenaron el contexto.**
  - Causa: WebFetch sin un prompt acotado.
  - Barrera: prompt enfocado. Si la respuesta se guarda en un archivo, se lee con `grep` o
    `sed`, nunca entera.
- **2026-11-07 · Los FPS medidos aquí no significan nada.**
  - Causa: la máquina no tiene GPU (WebGL2 por SwiftShader, sin WebGPU).
  - Barrera: el rendimiento se mide con los contadores del renderizador y en el móvil del autor.
- **2026-11-07 · Listas de terceros atribuían obras a autores equivocados.**
  - Causa: copiar sin contrastar.
  - Barrera: contrastar con la fuente primaria o con `cases.json` antes de citar.
- **2026-11-07 · Los informes de otras IAs traían datos sin fuente,** sobre todo los de Gemini.
  - Causa: no se exigía URL.
  - Barrera: el prompt de `investigacion/prompts-otras-ias.md` exige URL y marca hecho o
    inferencia. Perplexity y Grok para datos; Gemini solo para vídeos.
