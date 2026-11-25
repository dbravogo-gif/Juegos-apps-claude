# Aprendido

Errores ya pagados y la barrera que evita repetirlos (regla R6). Formato: fecha · qué pasó ·
causa · barrera. Lo más reciente va arriba. Si un error vuelve a pasar, su barrera sube de
nivel: de nota a regla, y de regla a prueba o hook.

- **2026-11-19 · Al cambiar de criatura, entraba con la vida ya rebajada** (Six-seven islands; lo
  vio el autor con Oreps).
  - Causa: los mensajes del combate se enseñan después de resolver el turno, y la ficha se pintaba
    con el estado del final del turno, con el golpe del rival ya restado.
  - Barrera: lo que se enseña en un mensaje sale de su evento (`ficha`, `vida`, `subidas`), nunca
    del estado actual (`pintarEntrada` y `pintarSubida` en `combate.ts`).
- **2026-11-19 · Salían «iniciales» en la hierba y en entrenadores** (Six-seven islands; lo vio el
  autor).
  - Causa: las criaturas de relleno tomaban prestado el modelo de una inicial.
  - Barrera: `tests/reparto.test.ts`: ninguna criatura que no sea inicial usa su modelo, y ni
    hierbas, ni entrenadores, ni soldados llevan iniciales.
- **2026-11-17 · Las criaturas del autor no llegaban a GitHub, y luego media subida cayó en la
  raíz** (Six-seven islands).
  - Causa: la subida web de GitHub falla si el lote pesa demasiado; al partirla en dos, la primera
    mitad se subió desde la raíz del repositorio, no desde la carpeta del enlace.
  - Barrera: `herramientas/criaturas/plan.py` avisa de los archivos `Pok…` fuera de
    `conceptos/criaturas/meshy` y de los mal nombrados. Al recibir subidas, mirar todo el
    repositorio (`git ls-files | grep Pok`), no solo la carpeta, y darle al autor el enlace de
    subida con la carpeta ya puesta.
- **2026-11-16 · Pasar diálogos con Enter le ponía «Amigo» al rival para siempre** (Six-seven
  islands; lo vio el probador).
  - Causa: la caja del nombre se abría al hablar, ya con un nombre por defecto, y el siguiente Enter
    (el de pasar diálogo) la aceptaba al instante.
  - Barrera: las cajas que se abren en mitad de una conversación empiezan vacías, no aceptan vacío,
    ignoran la tecla mantenida y el primer medio segundo.
- **2026-11-15 · El mar de las zonas de costa quedaba encerrado como un canal** (Six-seven
  islands; lo vio el probador en Puerto del Rosario, y salió también en Sotavento, Morro Jable,
  Cofete y la capital de Lanzarote).
  - Causa: el borde de roca de la zona, o la tierra de la silueta detrás, cerraban su mar.
  - Barrera: una prueba exige que toda agua grande de una zona dé al mar abierto (`marAbierto`).
    Las barcas, boyas y rocas solo van en mar abierto, así que una presa queda sin barcas.
- **2026-11-13 · Mover zonas descolocaba las partidas guardadas** (Six-seven islands; visto al
  ampliar Fuerteventura dos veces).
  - Causa: el guardado apunta la posición en casillas de la isla entera; al desplazar la isla para
    que cupieran zonas nuevas, la misma casilla era otro sitio.
  - Barrera: el guardado lleva también dónde empezaban sus zonas (`origenes`) y, al cargar, la
    posición se mueve con ellas (`reubicar`, con prueba). Si aun así no cuadra la zona, se vuelve
    a casa con los avances.
- **2026-11-13 · Recoger un cubo decía «Has encontrado cubo-blanco.»** (Six-seven islands).
  - Causa: los nombres al recoger iban en una lista aparte que nadie revisaba al añadir objetos.
  - Barrera: una prueba exige que todo objeto del suelo, en cualquier isla, exista y tenga nombre.
- **2026-11-13 · Correr se veía a tirones** (Six-seven islands; lo vio el autor). Segunda vez que
  el andar no se ve fluido: el 2026-11-10 fue la animación.
  - Causa: se dibujaba adelantando la posición con la fracción del paso siguiente, salvo al
    llegar a cada casilla (paso 0): un instante congelado por casilla. El primer arreglo
    (encadenar el paso siguiente) lo cambió por un salto, porque acortaba cada casilla un paso
    fijo; contar fotogramas con `paso` 0 no lo detectaba.
  - Barrera: el jugador se dibuja entre los dos últimos pasos fijos (`personaje/suavizado.ts`) y
    `tests/suavizado.test.ts` simula fotogramas irregulares: exige velocidad constante y que el
    dibujo de antes falle. La fluidez se mide así, no en el Chromium de aquí, que va lento.
- **2026-11-13 · La inicial de fuego salía casi negra** (lo vio el autor).
  - Causa: la textura de Meshy salió más oscura que su dibujo (gris 53 frente a 65), y en
    pantalla, sin luz del juego, el cuerpo quedaba en 23.
  - Barrera: al meter un modelo de Meshy, se compara el gris o el color medio de su cuerpo en
    pantalla con el de su dibujo. Si se va mucho, se corrige con `RETOQUE` en
    `arte/criaturas3d.ts`, o se rehace la textura.
- **2026-11-11 · Entrenadores opcionales que no veían el camino** (Six-seven islands; lo vio el
  autor). Uno miraba a tres casillas que se quedaban a una del camino; otro estaba en una salita
  aparte.
  - Causa: las pruebas solo pedían que los opcionales se pudieran esquivar, no que estuvieran
    donde pasa el jugador.
  - Barrera: prueba en `tests/mundo.test.ts`: todo entrenador opcional ve al menos una casilla de
    camino. Antes de colocar uno, se dibuja su vista sobre el mapa.
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
  - **Se repitió el mismo día:**
    - el charco verde, a la altura del mar, se veía azul;
    - los libros de las estanterías titilaban;
    - en las ventanas, las caras de los barrotes coincidían con las del cristal;
    - en las azoteas, las esquinas de los pretiles se solapaban.
  - **La barrera sube a prueba:** `tests/coplanares.test.ts` busca caras solapadas en el mismo
    plano en todas las salas, las casas y el faro (`tests/utiles/coplanares.ts`). Una pieza nueva
    hecha con cajas entra en esa prueba.

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
- **2026-11-19 · «null» escrito en pantalla, dos veces** (Beep Run Club).
  - Causa: `append()` nativo con un hijo condicional (`cond ? nodo : null`) escribe «null».
  - Barrera: los hijos se añaden con `h()` o `agregar()`, que ignoran null. En Beep,
    `npm run flujos` falla si una pantalla muestra «null» o «undefined».
- **2026-11-19 · Un autoguardado con espera sobrevivía a su pantalla** (Beep Run Club).
  - Causa: un `setTimeout` de 600 ms disparaba después de cerrar la sesión, con datos nulos.
  - Barrera: cada pantalla registra en `ctx.alSalir` lo que tiene pendiente, y el router lo
    ejecuta (guarda ya) antes de pintar la siguiente. Al cerrar sesión se descarta.
- **2026-11-19 · Se cerró la fase 2 de Beep sin el `probador` y sin avisar la excepción (R3).**
  - Causa: con la revisión de la fase 1 en marcha, se siguió construyendo y se marcó la fase 2
    como hecha.
  - Barrera: una fase solo se marca hecha en `funciones.json` cuando su revisión ha terminado; si
    no, se avisa la excepción antes.
- **2026-11-20 · En el iPhone «se comían» los toques** (Beep Run Club, con Firebase).
  - Causa medida: con latencia móvil, aceptar tardaba 2,8 s y «Terminar y valorar» 0,8 s sin
    ninguna señal en pantalla. Además, una pantalla que terminaba de cargar después de volver
    atrás se pintaba encima de la nueva.
  - Barrera: las pantallas que esperan datos pintan «Cargando…» al momento y no se pintan si ha
    cambiado el turno de pantalla (`ctx.turno`). `pruebas-reglas: npm run e2e` lo comprueba con
    latencia de red móvil. Comprobado que falla sin la protección.
  - En local (127.0.0.1) todo responde al instante: un retardo de red solo se ve emulándolo.
  - También tapaba los botones el aviso fijo «Hay una versión nueva», pegado abajo. Ahora va arriba;
    comprobado con `elementFromPoint` que el botón principal queda libre.
- **2026-11-23 · Escena de historia que se podía saltar y combate que se bloqueaba** (Six-seven
  islands, Gran Canaria; lo vio el probador).
  - El Roque Nublo era un desvío sin cierre: se llegaba a Tejeda sin conocer al segundo amigo, y el
    terrero daba por conocido a alguien a quien no habías visto.
  - Barrera: `tests/isla3.test.ts` recorre la isla con los personajes en su sitio
    (`sinTemporales: false`) y exige que Tejeda no se alcance sin `amigo2-conocido`. Cada escena
    obligatoria de una isla nueva, con su prueba de «no se salta».
  - **Se repitió el 2026-11-24** en una isla ya hecha: la estatua de Las Dunas y Chano en
    Corralejo se esquivaban dando un rodeo. Barrera general: `tests/escenas.test.ts`, una tabla
    con cada escena que te para al verte; exige que no haya camino de un lado al otro sin pisar su
    vista. Una escena nueva entra en la tabla.
  - El dos contra dos se colgaba al caer todas tus criaturas: el núcleo sí seguía con el aliado,
    pero la interfaz abría el menú con `activa(0)!`. Un estado nuevo del núcleo (aquí, un hueco
    vacío) obliga a revisar cada `!` de la interfaz que lo lee.
- **2026-11-24 · Una revisión larga en segundo plano se perdió tres veces** (Six-seven islands, la
  revisión de Lanzarote y los sistemas).
  - Dos reinicios del contenedor mataron al agente, y la tercera vez se agotó el límite de cinco
    horas del plan. La primera vez no había apuntado nada fuera de su memoria.
  - Barrera: `.claude/agents/probador.md` le pide apuntar en un archivo al acabar cada zona; al
    relanzarlo, se le pasan sus notas y no repite lo hecho. Para medir dificultad, mejor una
    simulación con el núcleo (segundos) que combates jugados con render por software (minutos).
- **2026-11-25 · Un gancho de prueba aceptaba datos imposibles y colgaba el juego** (Six-seven
  islands, capturas de la revisión visual).
  - `window.__JUEGO__.poner({ inicial: 'fuego' })`: la inicial de Fuego se llama `infernal`. El
    juego se colgaba al teñir los uniformes y parecía un fallo del viaje en barco; costó varias
    vueltas verlo.
  - Barrera: `poner` rechaza una inicial desconocida y dice las válidas. Los ganchos de prueba
    validan lo que reciben, como ya hacía `salvaje` con las especies.
  - De paso: con render por software, `viajar(n)` tarda más de un minuto (el fundido va por
    fotogramas). Se espera al evento `load`, no un tiempo fijo.
- **2026-11-25 · La captura llevaba semanas sin cubo y la portada borraba sin preguntar**
  (Six-seven islands, probador de la etapa 5).
  - Al lanzar, la salvaje encogía y las sacudidas movían una criatura invisible: el texto («…»)
    decía una cosa y la escena, otra. Las capturas por software tardan segundos y la animación
    dura uno; las revisiones miraban el antes y el después.
  - Barrera: el probador mira en el código las animaciones cortas (`.claude/agents/probador.md`).
  - Borrar la partida tenía dos entradas y solo una preguntaba. Todo lo que borra datos del
    jugador pregunta antes, con el cursor en «No».
- **2026-11-25 · Di por publicada una etapa cuyo despliegue había fallado** (Six-seven islands,
  etapa 4 de la revisión).
  - El flujo «Publicar juegos» pasó las pruebas pero falló al desplegar en Pages: un fallo
    pasajero de GitHub. Dije «publicado» por haber fusionado el PR, sin mirar el flujo.
  - Barrera: la skill `cierre` pide ver el flujo en verde antes de decir «publicado».
- **2026-11-25 · Un efecto de sonido que no se oía en el portátil del autor** (Six-seven islands,
  el choque contra la pared).
  - Era una senoidal de 150 a 70 Hz: en el juego se disparaba bien, pero los altavoces pequeños
    apenas dan esos graves. Aquí no hay audio, así que solo lo podía notar el autor.
  - Barrera: una prueba (`tests/sonido.test.ts`) prohíbe senoidales puras por debajo de 200 Hz;
    para lo grave, triángulo, cuadrada o ruido, que tienen armónicos agudos.
