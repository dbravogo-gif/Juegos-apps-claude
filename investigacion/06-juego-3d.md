# 06 · Cómo se hace un juego 3D bueno en el navegador con Claude

Ronda 3 (2026-11-07). El objetivo: un juego 3D desde cero, con buenos gráficos y que sea
interesante.

## La fuente más útil: *threejs-game-skills*

[Repositorio](https://github.com/majidmanzarpour/threejs-game-skills). Lo he clonado y leído:
el director, gameplay, gráficos AAA (con su hoja de puntuación), control de calidad y bot de
partida. Es del autor del mago pixel-art viral y tiene cinco juegos de demostración publicados.
Es un sistema práctico y probado. Lo que sigue es lo esencial.

### Diseño antes que escena

- **«Explorar una escena bonita» no es un diseño.** Un diseño necesita decisiones, presión,
  respuesta y consecuencias.
- **Tres documentos cortos** antes de construir:
  1. **Brief de diseño:**
     - La promesa al jugador en una frase y la sensación buscada.
     - El verbo principal y los secundarios.
     - Qué repite el jugador cada 5 a 30 segundos y qué cambia en 1 a 5 minutos.
     - Cómo pierde, aprende y vuelve a empezar.
     - Qué se premia y qué crea riesgo.
     - Qué hace distinto un jugador mejor.
  2. **Contrato del bucle:** «El jugador hace [verbo] para conseguir [objetivo] mientras
     [presión] crea riesgo; el éxito da [recompensa] y el fallo cuesta [coste o reintento]».
     Cada parte se **demuestra en el código**:
     - El verbo está ligado a una entrada real.
     - El objetivo se ve.
     - La presión aparece en el primer minuto.
     - La recompensa cambia el estado, no solo lo visual.
  3. **Plan de nivel:**
     - Qué ve y qué no ve la cámara.
     - Dónde empieza el jugador, su primera decisión, la primera amenaza y la primera
       recompensa.
     - Puntos de referencia.
     - Escalada cada 20 a 60 segundos.
     - Momentos de respiro.
     - Cómo se avisa de cada peligro.
- **Errores típicos:**
  - Una demo estática en vez de un bucle jugable.
  - Mecánicas pegadas a una escena construida antes.
  - Un bucle descrito pero nunca demostrado con entrada real, presión, recompensa y reintento.
  - Un mundo que decora en vez de dar forma a las decisiones.
  - Una mecánica que compila pero que ninguna entrada puede activar.
- **Orden de construcción:**
  1. Una escena representativa, a la escala de cámara real, con el protagonista y la
     respuesta definitivos.
  2. Solo después, multiplicar niveles, enemigos y variedad.

### Gráficos: forma → material → luz → efectos, en ese orden

- **«El brillo no hace AAA a los primitivos».** Niebla, oscuridad, *bloom* o partículas que
  tapan geometría que falta son un fallo automático.
- **Todo lo visible está hecho a propósito,** no solo el protagonista: obstáculos,
  recompensas, suelo, fondo, interfaz y efectos.
- **Modelado procedural:** extrusiones, biseles, tornos y tubos combinados con primitivos.
  Detalle donde mira la cámara y biseles falsos con tiras finas.
- **Luz legible:**
  - Clave (da forma), relleno (mantiene legible), contraluz (separa al protagonista del fondo),
    luces prácticas o emisivas, y sombras de contacto.
  - Sombras reales solo para el protagonista y los elementos grandes.
- **Mapeo tonal elegido a propósito:** ACES Filmic para estilizado cinematográfico. La
  exposición se ajusta en partida, no en la pantalla de título.

**Hoja de puntuación visual, de 0 a 3:** dirección de arte, protagonista, obstáculos,
recompensas, mundo, materiales, luz, efectos, interfaz y evidencia de rendimiento.

- Hay **tres imágenes de referencia** para calibrar el 1, el 2 y el 2,5–3.
- **Premium:** ninguna categoría por debajo de 2 y media de al menos 2,3.
- **Escaparate:** al menos seis categorías con 3 y media de al menos 2,7.

**Métricas medidas sobre capturas:**

- Entropía de color por debajo de 3 bits, o un color que ocupa más del 60 % de la imagen:
  escena pobre.
- Densidad de bordes por debajo de 0,04: dominan los primitivos o el vacío.
- Contraste por debajo de 60: la niebla o la oscuridad lo están aplanando.

**Presupuesto de render** (punto de partida):

| | Escritorio | Móvil |
| --- | --- | --- |
| Llamadas de dibujo | ≤ 300 | ≤ 150 |
| Triángulos | ≤ 750.000 | ≤ 300.000 |
| Texturas | ≤ 60 | ≤ 40 |
| Luces con sombra | ≤ 2 | 1 |
| Mapa de sombras | ≤ 2048 | ≤ 1024 |
| Pasadas de postproceso | ≤ 2 | 0–1 |
| Resolución de píxel máxima | 2 | 1,5–2 |

### Sensación de juego, en este orden

1. **Latencia:** el verbo principal responde en menos de 100 ms. Sin esto, ningún efecto lo
   arregla.
2. **Curvas de respuesta:** aceleración, *easing* y rebote.
3. **Respuesta al contacto:** destello, *squash and stretch* (aplastar y estirar), *hitstop*
   (congelar la imagen un instante en el impacto) y sacudida.
4. **Cámara:** sacudida, empujón y cambio de campo de visión.
5. **Sonido sincronizado** en el mismo fotograma, con variación de tono.

**Tabla de ejemplo:**

| Evento | Respuesta |
| --- | --- |
| Recoger algo | «Pop» del objeto, golpe en el contador, tono variado y 0,15 de trauma (intensidad de la sacudida de cámara) |
| Recibir un golpe | *Hitstop* de 70 ms, 0,4 de trauma, destello y pulso en la interfaz |
| Explosión | *Hitstop* de 90 ms, 0,7 de trauma, destello blanco y campo de visión +8° |

**Reglas:**

- La respuesta **aclara** el estado del juego y nunca tapa la siguiente decisión.
- La sacudida va con curva de trauma² y tope.
- El *hitstop* solo en contactos fuertes.
- Nunca bloquear el verbo principal esperando a que acabe una animación.
- Toda la aleatoriedad, también la de los efectos, sale del generador con semilla.

### Verificación

- **Ganchos de prueba:**
  - `window.__THREE_GAME_DIAGNOSTICS__`: fotograma, puntuación, estado y posición.
  - `window.__THREE_GAME_TEST_HOOKS__`: `seed()` y `setState()`.
- **Bot de partida** con entrada real. Mide:
  - si el bucle sobrevive,
  - la distancia recorrida (la entrada funciona),
  - el primer punto conseguido (el objetivo se encuentra),
  - las **ventanas de bloqueo** (hay entrada pero ni movimiento ni progreso),
  - el tiempo hasta el primer fallo y que el reintento funcione.
- **Dificultad:** dos bots, uno sin retraso y otro con 300 ms. Si sobreviven igual, la presión
  es decorativa.
- **Inspector del lienzo:** píxeles no vacíos, métricas de imagen y contadores de render frente
  al presupuesto.
- **Capturas en partida activa,** en escritorio y móvil, no en la pantalla de título.
- **Advertencia:** sin GPU, Chromium renderiza por software (SwiftShader). Los FPS no valen como
  prueba; los píxeles, los contadores y lo funcional sí.

## Lo que hay en esta sesión

Comprobado.

- **3D:** WebGL2 por software (SwiftShader, 4 núcleos). No hay WebGPU.
  - El juego tiene que funcionar bien con WebGL2. Si usamos `WebGPURenderer`, sus capturas aquí
    saldrán por el camino de WebGL2.
  - El rendimiento se mide con `renderer.info` (llamadas de dibujo, triángulos), que no depende
    de la GPU, y en el móvil real del autor.
- **npm accesible:** se pueden instalar Three.js (la versión actual es la r187, de octubre),
  Vite y Rapier (física).

## Three.js en 2026

Fuentes secundarias; hay que comprobarlo con la versión real al construir.

- **`WebGPURenderer`** con TSL (el lenguaje de shaders en JavaScript de Three.js) y vuelta
  automática a WebGL2. El postproceso nuevo es `RenderPipeline`.
- El mapeo tonal va al final del postproceso; el *bloom* se calcula sobre la imagen HDR antes
  del mapeo.
- *Bloom* selectivo, solo en lo emisivo.
- En móvil, el *bloom* a media resolución apenas se nota. Un *bloom* a intensidad 0 sigue
  costando llamadas de dibujo: si no se usa, hay que quitarlo, no ponerlo a 0.
- El *toon shading* (sombreado de dibujo animado) va con `MeshToonMaterial` y un mapa de
  degradado con filtrado *nearest*. Suele hacer falta un shader propio para afinarlo.

## Qué hace interesante un juego

Teoría clásica (fuentes en la sección siguiente).

- **Koster:** divertirse es aprender patrones. Cuando el patrón se domina, llega el
  aburrimiento. Hacen falta patrones nuevos o variaciones del mismo verbo.
- **MDA** (Hunicke, LeBlanc y Zubek), que separa tres capas:
  - Mecánicas: reglas y código.
  - Dinámicas: cómo se comportan en juego.
  - Estética: lo que siente el jugador.

  Se diseña desde la emoción buscada y se habla de ella con palabras precisas, no con «es
  divertido». Las buenas dinámicas siguen la curva tensión → liberación → resolución.
- **Un verbo bien desarrollado** gana a dos a medias. La profundidad la da el diseño de los
  niveles, no el número de mecánicas. *A Short Hike* tiene un bucle sencillo (plumas → subir más
  alto → ver lugares nuevos desde arriba) y se hizo en 4 meses. *Townscaper* muestra el riesgo
  contrario: la falta de objetivos divide a la crítica.
- **Los 3C** (personaje, cámara y controles) se deciden al principio. En un juego 3D son la mitad
  de la sensación. Por ejemplo, la cámara puede seguir un punto *delante* del personaje para que
  se vea hacia dónde va.
- **Si el bucle no es divertido en los primeros 5 minutos,** ni la progresión ni el pulido lo
  salvan. Hay que demostrarlo con un prototipo sin gráficos (*grey-box*).

## Fuentes

- [threejs-game-skills](https://github.com/majidmanzarpour/threejs-game-skills) (leído)
- [Three.js, versiones](https://github.com/mrdoob/three.js/releases) (leído)
- [Guía de postproceso en Three.js 2026](https://threejsroadmap.com/blog/the-complete-guide-to-threejs-post-processing-in-2026),
  [100 consejos de rendimiento](https://www.utsubo.com/blog/threejs-best-practices-100-tips),
  [coste por pasada de postproceso](https://digitalgarden.si/blog/threejs-postprocessing-cost-per-pass/)
  (a través de resúmenes)
- [MDA (artículo original)](https://users.cs.northwestern.edu/%7Ehunicke/MDA.pdf),
  [Koster, *Theory of Fun*](https://wiki.p2pfoundation.net/Theory_of_Fun_for_Game_Design)
- [GameAnalytics: bucles principales](https://www.gameanalytics.com/blog/how-to-perfect-your-games-core-loop),
  [Egmatic: sensación de juego](https://egmatic.com/blog/how-to-make-your-game-feel-good)
- [Pluralsight: los 3C](https://www.pluralsight.com/resources/blog/software-development/character-controls-camera-3cs-game-development)
- [Heurísticas de jugabilidad HEP (CHI 2004)](https://hci.rwth-aachen.de/materials/conferences/CHI2004/2p1509.pdf)
- [Alcance pequeño en juegos indie](https://birdor-blog.pages.dev/scope-design-for-indie-games/),
  [*A Short Hike*](https://www.hyperpad.com/blog/what-you-can-learn-from-tiny-world-themed-games)
