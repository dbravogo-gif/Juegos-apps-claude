# Revisión del juego con las herramientas nuevas (2026-11-25)

Encargo del autor: rehacer la revisión de todo el juego con las skills instaladas el 2026-11-25
(`rpg`, `level-design`, `threejs-*`) y el simulador de partida. Se hace por etapas y cada una deja
aquí sus hallazgos. Lo pequeño se arregla y se publica; lo que cambia cómo se juega va a las
decisiones del autor (`RESUMEN-ISLAS.md`, D1 a D9).

## 1. Dificultad y progresión (skill `rpg` y simulador)

Datos: `EQUILIBRIO.md` (`npm run equilibrio`). Es pesimista: el jugador simulado nunca cambia de
criatura ni usa ataques de estado.

### Lo que dicen los números

- **Los jefes te tumban en 2 o 3 golpes, en todas las islas y con todas las iniciales.** A los
  niveles con que se llega, su criatura estrella tumba a tu inicial en 2 o 3 golpes y necesita de
  3 a 5 de los tuyos. La skill propone como orientación que aguantes de 5 a 8 golpes de un rival
  normal y algo menos de un jefe.
- **Por qué:** las estrellas de los jefes son especies mucho más fuertes que las tuyas y además
  van por encima de tu nivel.
  - **Fuerza de especie:** suma de estadísticas base de 450 a 525, frente a 314 de tu inicial y
    405 de su segunda forma.
  - **Ishiradon (495) al nivel 12** en la líder de Roca. Es la excepción que puso el autor, pero
    con la inicial de Fuego la tumba en 1 o 2 golpes y aguanta 8.
- **Llegas con 2 a 4 niveles menos de lo pensado.** La experiencia se reparte entre tres
  criaturas:
  - con la líder de Roca, tu inicial va al 10 y sus compañeras al 8 (rival: 11, 11 y 12);
  - con la de Aire, al 16 y al 13 (rival: 20, 21 y 22).
  - Si toda la experiencia fuera a una sola criatura, iría al 12 y al 20.
- **Resultado (simulado, a la primera):**
  - la líder de Roca, la de Aire y el tercer aprendiz Eléctrico ganan casi siempre;
  - los dos líderes de Agaete, también;
  - el comandante depende de la inicial: con Agua gana él el 95 %, porque su rama evoluciona al
    24; con las demás es un paseo.
- **Los ataques no crecen** (D2). Del nivel 13 al 34 nadie aprende nada y el ataque más fuerte
  pega 55. Como la vida sube con el nivel, cada combate pide más golpes. Ejemplo: Seaglide, en
  el tercer aprendiz Eléctrico, necesita 14 golpes de la inicial de Agua.
- **Hay salvajes que no se pueden vencer al principio.** Un Oreps al nivel 6 en las Montañas del
  Fuego necesita 23 golpes de Cronti, que solo tiene ataques comunes hasta el nivel 7.
- **En Gran Canaria las salvajes superan a tus criaturas.** Tailsan (480), Azurvan (455) y
  Seaglide (440) salen en Tamadaba, contra la segunda forma de tu inicial (405).
- **La curva de experiencia está bien.** Es la clásica: el nivel al cubo, con la experiencia de
  cada criatura según su especie y su nivel. El problema es cuánta hay que repartir, no la curva.

### Causas raíz

1. **Los jefes:** especies de estrella con niveles por encima de los del jugador.
2. **Repartir la experiencia** entre tres deja a cada criatura muy por detrás.
3. **Sin ataques nuevos** a partir del 13, el daño se estanca.

### Lo que hay que decidir

Lo apunto en las decisiones D1 a D3 de `RESUMEN-ISLAS.md`, con un objetivo para medir.

**El objetivo que propongo (lo decide el autor, R10):**
- con el jugador «normal», la criatura de un jefe cae en 2 a 4 golpes y tú aguantas al menos 3
  de los suyos (2 de la estrella);
- el jugador simulado gana a la primera entre el 40 y el 70 % de las veces;
- y ninguna salvaje del camino pide más de 6 golpes.

## 2. Las islas (skill `level-design`)

Datos: el recorrido del simulador (`herramientas/simular/ruta.ts`) cruzado con los refugios, las
casillas de encuentros del camino más corto, los entrenadores, los objetos y los objetivos de cada
isla. Las comprobaciones son las de la skill: recorrido y cierres, ritmo en dientes de sierra con
descanso antes de cada pico, enseñar antes de examinar, recompensa en las ramas y orientación.

### Lo que pasa la revisión

- **Cierres y atascos:** ya los vigilan las pruebas. El mapa de cada isla se recorre en orden
  (`tests/mundo.test.ts`, `tests/isla2.test.ts`, `tests/isla3.test.ts`), las escenas no se saltan
  (`tests/escenas.test.ts`) y el gimnasio de Aire no tiene sitio del que no se vuelva.
- **Descanso antes de cada jefe:** hay refugio en la misma zona o en la anterior antes de los
  cuatro gimnasios y del comandante (Guayadeque, a una zona corta). El terrero de Agaete es el
  mejor ejemplo: cada luchador te pregunta si quieres curarte antes.
- **Enseñar antes de examinar:** ninguna mecánica de gimnasio castiga la primera vez.
  - Roca: el tercer aprendiz dice dónde está la palanca.
  - Aire: el primer aprendiz explica las aspas antes de que hagan falta, y las corrientes solo
    empujan.
  - Eléctrico: a oscuras desde la entrada, pero cada relámpago enseña el plano entero.
- **Ritmo de Lanzarote y Gran Canaria:** alterna pueblos con refugio y zonas de combate de longitud
  media. Lanzarote empieza enseñando (casa, bar, museo y un combate obligatorio flojo).

### Problemas

| # | Problema | Regla de la skill | Qué hago |
| --- | --- | --- | --- |
| 1 | **Las Dunas:** 88 casillas de encuentros sin refugio en medio, unos 9 combates salvajes seguidos más los entrenadores | Nunca muchos picos seguidos | Ya está en D3 (el manantial del horno de cal) |
| 2 | **Famara** (rama opcional) no daba nada: las demás ramas dan una superpoción o un cubo | Las ramas recompensan | **Arreglado:** una poción en la punta de la playa (la isla 1 admite 4 en el suelo; hay 3) |
| 3 | **Fuerteventura tenía 2 objetivos para 9 zonas:** «Cruza la isla hasta Morro Jable» durante toda la isla | Orientar con hitos, no con muros | **Arreglado:** un objetivo intermedio (Puerto del Rosario y Betancuria, hasta vencer al guarda) y el siguiente nombra Ajuy y Sotavento |
| 4 | **La hierba obligatoria de Gran Canaria casi no lo es:** el camino más corto pisa 2 casillas en Guayadeque y 1 en las cumbres | Lo marcado como obligatorio, obligatorio | Ya está en D3 |
| 5 | **El puzle de Aire se resuelve en un minuto:** se presenta y se examina a la vez, sin giro | Presentar, desarrollar, girar, examinar | Ya está en D5 |
| 6 | **Hitos en las Dunas con calima:** la orientación depende de lo que se ve | Guiar con puntos de referencia | Por comprobar con capturas en la etapa 3 |

### Para Tenerife

- **Los refugios:** la propuesta (`ISLA-4.md`) solo pone uno, en Santa Cruz. Faltan en Puerto de
  la Cruz, antes del gimnasio, y cerca de Las Cañadas, la zona alta y larga.
- **Los objetivos,** de 4 a 5 para la isla, uno por cada tramo con nombre, como en Gran Canaria.
- **El gimnasio de Agua,** sea cual sea, con su mecánica presentada primero sin aprendices (la
  primera marea o la primera bolsa de aire) y después con ellos.

## 3. El aspecto (skill `juego-3d` y su rúbrica visual)

Datos: unas 50 capturas en partida, en escritorio (1280 × 800), de cada zona de las tres islas, los
cuatro gimnasios, la cueva de Ajuy, un combate y el menú; con los contadores del render en las
zonas más cargadas. Aquí el render es WebGL2 por software: los FPS no valen, los contadores sí.
La nota de la rúbrica la pone el `probador` en la etapa 5 (R3: no la pone quien construye).

### Lo que pasa la revisión

- **Dirección de arte:** cada isla tiene su paleta y su kit de piezas, y se reconoce:
  - Lanzarote, con picón negro, malpaís y casas blancas;
  - Fuerteventura, con tierra clara, dunas y casas majoreras;
  - Gran Canaria, con adoquín en Las Palmas, almendros en las cumbres y pinar con niebla.
- **La interfaz:** el objetivo, el cartel de zona y la ayuda de teclas caben y no tapan el camino.
  El objetivo más largo, el nuevo de Fuerteventura, se lee entero. El combate y el menú tienen
  jerarquía clara.
- **La luz:**
  - sol con sombras y relleno de cielo y suelo;
  - mapeo tonal neutro;
  - las sombras dan el contacto con el suelo.
  - **Falta la luz de contorno** que pide la rúbrica para un 2. Opinión: con la cámara alta y
    figuras pequeñas apenas se notaría, y costaría otra luz, así que no la propongo.
- **El rendimiento, dentro del presupuesto de escritorio:**

  | Medida | Peor caso | Límite |
  | --- | --- | --- |
  | Llamadas de dibujo | 237 (Montañas del Fuego) | 300 |
  | Triángulos | 591.000 (La Geria) | 750.000 |
  | Memoria de texturas | 108 MB (combate) | 256 MB |

### Problemas

| # | Problema | Qué hago |
| --- | --- | --- |
| 1 | **Puerto del Rosario y Morro Jable, vacíos en el plano medio:** grandes huecos de tierra lisa entre calles (la rúbrica lo da como fallo si el diseño no lo justifica) | **Arreglado** en `herramientas/isla2.py`: palmeras, tuneras, dos jardines y tres esculturas con su placa, sin tocar calles, puertas ni la visión del entrenador |
| 2 | **Los jardines de Fuerteventura no se veían:** la hierba corta tenía casi el color de la tierra | **Arreglado** en las dos ciudades: verde seco (`suelo` de la zona) |
| 3 | **«Zona inicial» y «Capital»** en el cartel: nombres provisionales | Ya está en D6 |
| 4 | **El gimnasio Eléctrico, negro casi entero entre relámpagos** | Es la mecánica que eligió el autor; se queda. Lo juzga él al jugarlo |
| 5 | **La calima de las Dunas** no salió en las capturas: no puedo juzgar si deja ver las crestas | Por mirar en el iPhone del autor |

**Barrera nueva (R6):** el gancho de prueba `window.__JUEGO__.poner` acepta una inicial que no existe
(«fuego» en vez de «infernal») y eso colgaba el juego al teñir los uniformes. Ahora la rechaza con
un mensaje que dice las válidas. Solo afecta a las pruebas: en la partida la inicial sale del museo.

## 4. La sensación y la interfaz (skills `pulir` y de diseño)

### Las acciones y su respuesta

| Tamaño | Acción | Respuesta | Estado |
| --- | --- | --- | --- |
| Pequeña | Andar | Paso por casillas; pisadas distintas en hierba, malpaís y arena | Bien |
| Pequeña | Menús: mover, aceptar, volver | Un clic distinto para cada una | Bien |
| Pequeña | Hablar | Pitido por letra con variación de tono | Bien |
| Pequeña | **Chocar con una pared** | Nada: con teclado no se sabía si la pulsación había llegado | **Hecho:** golpe sordo, una vez por intento (no en bucle) |
| Mediana | Objeto, puerta, curar, comprar, subir de nivel | Sonido propio y cartel o animación | Bien |
| Mediana | Golpe en combate | Chispas del color del tipo, parpadeo, temblor, barra de vida y sonido | Bien |
| Mediana | **Golpe muy eficaz o crítico** | Lo mismo que un golpe normal, más el texto | **Hecho:** sacudida de cámara (trauma², tope de 0,12 unidades) |
| Fallo | **Ataque que falla o no afecta** | Solo texto | **Hecho:** sonido grave que baja |
| Fallo | Criatura debilitada, huir | Sonido propio | Bien |
| Grande | Evolución, captura | Escena propia con sonido por tipo | Bien |
| Grande | **Ganar la pintadera** | Tarjeta animada, sin sonido | **Hecho:** fanfarria que sube dos octavas |

- **Silencio:** se activa en Opciones y se recuerda.
- **Escuchar los efectos:** Opciones → Probar sonidos. Ahí están los tres nuevos.
- **Movimiento reducido:** la sacudida no se hace si el sistema pide menos movimiento
  (`prefers-reduced-motion`).
- **Sin comprobar con imagen:** la sacudida. Aquí el combate va muy lento para cazar un golpe
  eficaz en una captura; lo valora el autor al jugar. Comprobado: compila, las pruebas pasan y
  en un combate de prueba no hay errores.
- **No puedo oírlo:** los tres sonidos los valora el autor.

### La interfaz

- **Contraste de la ayuda de teclas:**
  - era crema sobre marrón al 55 %; sobre una azotea blanca quedaba en 3,4:1, por debajo del 4,5:1
    recomendado;
  - **arreglado:** con el fondo al 70 % queda en 5,2:1 (calculado con la fórmula de WCAG).
- **Tamaños de letra:** de 11 a 56 px. Lo más pequeño son las etiquetas del menú (11 px) y los datos
  de los ataques (12 px). En un portátil se leen, pero justas. Lo juzga el probador en la etapa 5;
  si hace falta, se suben a 12 y 13 px.
- **Textos:** el objetivo y los carteles son cortos y en el idioma del juego. La ayuda de teclas
  usa los nombres de las teclas (A, Z, X), como el resto de menús.

## 5. Revisión independiente (agente `probador`)

Jugó con teclado real el principio entero (casa, madre, bar, museo, inicial, El Golfo, un salvaje
y el entrenador obligatorio) y el resto con los ganchos de prueba, a 1280 × 800 en calidad media.
Sin errores en consola ni bloqueos.

### La nota

- **Rúbrica visual: media 1,4, no llega a premium** (el listón es 2 en todo).
  - 2 en dirección de arte, mundo, interfaz y rendimiento;
  - 1 en protagonista, obstáculos, recompensas, materiales, luz y efectos.
- **Fallos automáticos de la rúbrica:**
  - vacío sin justificar en Sotavento, Ajuy y Cofete;
  - el Equipo son tarjetas de datos, sin retratos;
  - el HUD se lavaba en la niebla de Tamadaba y se cortaba en Probar sonidos (los dos, arreglados).
- **Jugabilidad, de 1 a 5:** funciona 4, se entiende 3, se siente bien 2, intención visual 3.
- **Lo de las etapas 2 a 4:** la poción de Famara, los objetivos de Fuerteventura, los sonidos
  nuevos y la ayuda de teclas, bien. Puerto del Rosario y Morro Jable, mejor pero a medias: los
  jardines son rectángulos verdes sin nada encima.
- **Las sospechas de la revisión anterior:** confirmadas la captura sin cubo, los pasos cerrados de
  bloques lisos, la compañera pequeña, el marcador del mapa y la falta de retratos. Descartada la
  pantalla negra al perder: hay fundido y despiertas curado.

### Arreglado

| # | Problema | Arreglo |
| --- | --- | --- |
| 1 | **La captura no tenía cubo:** la salvaje encogía hasta desaparecer y las sacudidas movían una criatura invisible sobre una plataforma vacía | El cubo vuela en arco desde tu lado, la salvaje encoge dentro con chispas, cae a la plataforma y es él el que se sacude. Si se escapa, se abre y la salvaje sale de un rebote; si no, suelta chispas doradas que suben. Color según el cubo lanzado |
| 2 | **La portada borraba la partida guardada sin preguntar** («Partida nueva (borra la guardada)») | Pregunta antes, como Opciones, con el cursor en «No, volver». X también vuelve |
| 3 | **La niebla de Tamadaba tapaba el objetivo y la ayuda** (la ayuda bajaba a 2,15:1) | La capa de calima y niebla va por debajo del resto de la interfaz |
| 4 | **El marcador del mapa tapaba el nombre de la zona** («El J◎ble») | Si el jugador cae sobre un nombre, el nombre sube justo encima del marcador |
| 5 | **Probar sonidos: la elegida quedaba cortada y la ayuda de teclas desaparecía** | Se desplaza solo la lista; el título y la ayuda se quedan a la vista |
| 6 | **Al perder antes del primer refugio decía «Vuelves corriendo al refugio» y salías en casa** | «Vuelves corriendo a casa» mientras tu sitio de curar sea tu casa |
| 7 | **«¿Quién eres? Flechas para elegir» con una sola persona** | Sin «Flechas para elegir» mientras haya una sola persona jugable |

### Para el autor

Lo que cambia el aspecto o el alcance va a `RESUMEN-ISLAS.md`, D7 a D9:
- **D7:** tamaños que no se leen (compañera, salvajes pequeñas en combate);
- **D8:** momentos que faltan (recibir la inicial, retratos en el Equipo);
- **D9:** lo que aún parece de prototipo (pasos cerrados, Sotavento, Ajuy y Cofete, gimnasio de Aire).

Además:
- **En el primer combate la inicial desobedeció 3 de 4 turnos** y el probador perdió con el
  primer entrenador. La probabilidad es del 45 % (`PROB_DESOBEDIENCIA`), así que fue mala suerte
  en pocos turnos; el simulador ya la cuenta. Va con D1.
- **Baja, sin decisión:**
  - el combate del pinar usa el fondo de Lanzarote hasta que pintes `gc-pinar`;
  - las copas de las palmeras tapan al jugador sin silueta;
  - los personajes vistos desde arriba se quedan en pelo o capucha.

### Sin probar

- Ningún sonido (aquí no hay audio).
- La sacudida de cámara.
- La calidad alta.
- Los FPS reales.
- La calima de las Dunas en movimiento.
- Safari.
