# Leyendas de Iberia (carpeta leyendas-de-iberia/)

Juego de criaturas al estilo Pokémon ambientado en la historia de España, de 1492 a hoy. Es para
el autor y dos amigos, y se juega en el navegador del móvil y del PC. Usa Vite + TypeScript +
Phaser y se publica como web estática en GitHub Pages.

El resto del repositorio (`game/`, `aerolinea/`, `Bulk-up-main/`) son otros proyectos. No se
tocan desde aquí.

## Estado actual

- **Fase 1, prototipo «Granada, 1492».** Los hitos 1 a 3 están hechos y el modo historia se juega
  de principio a fin:
  - Título, nueva partida con nombre y guardado automático.
  - Santa Fe: Isabel y la elección de compañera, el Gran Capitán, Colón, el pastor de Orce, y el
    mesón con su tienda.
  - La Vega, con encuentros, ballestero y mercader.
  - La Alhambra, con su guardia.
  - El Patio de los Leones: Boabdil, el blasón y el final.
- **Capítulo 2, «Castilla, 1521» (2026-10-26), hecho y jugable:** al vencer a Boabdil se pasa
  (paso `viajar`) a Villalar el día de la derrota comunera, con el mismo protagonista.
  - Villalar (Padilla da su carta para María Pacheco), el camino de Toledo con el Tajo,
    Toledo con su mesón y el Alcázar, donde María Pacheco es la líder (Tierra/Acero).
  - 15 especies nuevas (Bestiario, cap. 2): lagarto, víbora, avutarda, águila, lobo, toro de
    Guisando, tarántula y erizo, con sus evoluciones, y 15 movimientos nuevos.
  - Cinco entrenadores de una criatura antes de la líder, como en el capítulo 1.
- **Hito 4, en curso:**
  - Hecho: el juego ocupa toda la pantalla del móvil.
  - Hecho: es una web instalable (PWA), con manifiesto, iconos y service worker para jugar sin
    conexión.
  - Hecho: se publica en Pages con el resto del repositorio, en
    `…/Juegos-apps-claude/leyendas-de-iberia/`.
  - Falta ajustar el equilibrio jugando.
- **Arte:**
  - Mapa: tileset propio al estilo de los juegos de criaturas de GBA, generado por
    `arte/mapa/tileset.py` (`src/assets/LEEME.md`). Se cambia el script, nunca el PNG a mano.
  - Personajes que caminan: propios, al mismo estilo, con la ropa y los tocados de la época;
    los genera `arte/mapa/personajes.py`. Ya no queda nada de *Ninja Adventure*.
  - Criaturas: hechas las 22 del capítulo 1 y las 15 del capítulo 2 en el estilo elegido por
    el autor, con vista de rival y vista del jugador (`src/assets/LEEME.md`). Guayota y la vieja, en reserva, en
    `arte/criaturas-futuras/`. Antes de hacer más, lee la guía de diseño visual del Bestiario.
  - Retratos para los diálogos, solo de los personajes importantes (decisión del autor):
    Isabel, Fernando, el Gran Capitán, Colón, Boabdil, Juan de Padilla y María Pacheco
    (`src/assets/retratos/`, `src/data/retratos.ts`). Hay 23 más hechos, en reserva, en
    `arte/retratos-reserva/` (entre ellos Carlos V, Felipe II y Juan de Austria).
- **Bestiario (`docs/BESTIARIO.md`), v2:**
  - Hecho: auditoría, segunda revisión de variedad (A.8), tabla de 150 especies y fichas del
    capítulo 1, Gofrón, la vieja, *Gallotia simonyi* y el Papemímico.
  - El juego ya usa el capítulo 1 del Bestiario. Los `id` internos no cambian; las especies
    retiradas se convierten al cargar la partida (`ESPECIES_RETIRADAS`).
  - `docs/DESCRIPCIONES.md`: la descripción visual de las 150 especies, corregida con todo lo
    decidido. Es la que se usa para generar el arte.
  - El reparto de tipos por zona y la regla para los capítulos siguientes, en A.9.
- **Hecho en esta tanda (2026-10-24):**
  - La tabla de tipos (`src/data/tipos.ts`), reducida a petición del autor y consultable en el
    menú, el Bestiario y el combate.
  - Los objetos se llaman como en el género, salvo téseras, Turrón y objetos únicos.
  - Tinajas en todo el juego, nunca papeleras.
  - Objetos por categorías, equipables y de evolución (`src/data/objetos.ts`).
  - Tinajas registrables y el Papemímico (`src/data/recipientes.ts`).
- **Menús (2026-10-25, segunda versión):** con aspecto de juego actual, como pidió el autor.
  - Tipografía Nunito (incluida en el juego), paneles blancos redondeados, botones con relieve,
    fondos de color con rayas que se mueven e iconos ilustrados (`src/assets/iconos/`).
  - Pausa con el equipo a la izquierda y las opciones a la derecha; equipo con submenú y
    opción de mover; ficha en pestañas; mochila por bolsillos; Bestiario; tienda.
  - Combate: los cuatro movimientos a la izquierda (70 %) y, a la derecha, la última tésera
    usada, la mochila, el equipo y huir en un 2 × 2. La partida recuerda la última tésera.
  - Los objetos tienen iconos ilustrados nuevos; los pixelados se han quitado.
- **El laboratorio de combate** es solo una herramienta de pruebas, con un enlace pequeño en el
  título. No es prioridad.
- **Pendiente del autor:** las decisiones abiertas al final de `docs/BESTIARIO.md` y del
  `docs/GDD.md` §3.
- **Correcciones del autor (2026-10-25, tras jugar):** tinajas solo en ciudades; primera zona
  más fácil (cinco entrenadores de una criatura; Boabdil con Brezuco y Trasgorn, sin nada de
  Agua ni Tierra); sin Tésera real al principio; Colón rehecho y con cinco téseras; control
  trabado tras el combate y barra de vida, arreglados.
- **Tabla de tipos (2026-10-26):** equilibrada con el autor: los tipos sin inmunidades dan
  tantos ×2 como ×½; las pruebas lo comprueban.
- **Pedidos del autor (2026-10-26), hechos:**
  - Pantalla como en los emuladores de GBA y DS (medidas de los skins de Delta): franja negra
    arriba (lo que ocupe el sistema y al menos un 5 %, en `index.html`), margen para la barra
    de inicio y el mando pegado abajo (cruceta a la izquierda, A y B en diagonal, Menú donde va
    Start).
  - Modo desarrollador: enlace en el título; partida aparte (`p.dev`, otra clave de
    `localStorage`) con una opción más en el menú de pausa para darse objetos, criaturas a
    cualquier nivel, viajar a cualquier zona, curar, dinero, quitar encuentros y ver todo el
    Bestiario.
  - Sexo de las criaturas: macho, hembra, hermafrodita (el drago y la mandrágora, que tienen
    flores de los dos sexos) o sin sexo (Alhambrón, Guisandor y el Papemímico, que son estatuas
    o una tinaja). Los toros son siempre machos. Sale en la ficha y en el combate.
  - Zona de captura: mapa pixelado de la península en la ficha (pestaña Zona) y en el Bestiario,
    con los lugares donde sale la especie resaltados, y sus niveles y frecuencia.
- **Mapa, MT, MO y legendarios (2026-10-26), hecho a petición del autor:**
  - Colón da el Mapa (opción Mapa en el menú); a quien ya pasó por él le llega al cargar
    (`REGALOS_ATRASADOS` en `data/mundo.ts`, que sirve para cualquier regalo añadido tarde).
  - MT y MO en el bolsillo «MT y MO»: no se gastan. Cinco MT (dos de líderes, tres en zurrones
    en el suelo: `ocultos` con `visible`). MO Pleamar (el Surf del género, `id` `surf`) y
    Vuelo, con sus usos fuera de combate: Pleamar cruza el agua profunda (`O`, con `encuentrosAgua`) y solo lo aprenden las especies
    `acuatica`; Vuelo, solo las `alada`, y viaja desde el mapa a cualquier lugar visitado, de
    cualquier época (decisión del autor; `llegada` en `lugares.ts`).
  - Pleamar la da Olivares en el capítulo 4 (decidido); quién da Vuelo y el plan de los
    legendarios, propuesta en el GDD §8.
  - Base de los legendarios: personajes con `criatura` (esperan de pie y empiezan el combate) y
    salidas con `requiere` (zonas cerradas hasta tener un objeto o una bandera).
- **Pedidos del autor (2026-10-26, tras la comparación con Cristal, Esmeralda y Negro 2):**
  - Hecho: mando hasta abajo, correr (Alpargatas, de Fernando), mochila por bolsillos y
    vecinos que pasean (`pasea` en el personaje).
  - Hecho: combate con parálisis, veneno, intoxicación, confusión, retroceso, Muérdago y Rodela
    (estados volátiles en `LadoCombate.volatil`), y 50 pasivas (`src/data/pasivas.ts`,
    `src/core/pasivas.ts`), una por especie.
  - Hecho: más objetos (bayas, potenciadores de tipo, objetos equipables, téseras, Elixires),
    piedras lunar y solar, y Repartir experiencia (maestro de Toledo; objetos `clave` con
    `interruptor`). Las otras cuatro piedras, en `arte/objetos-futuros/`.
  - Falta, en este orden: pesca y almacén de verdad; rivales recurrentes. La Liga, más
    adelante.
- **Siguiente:** capítulo 3 (1571). Alhambrón queda para una zona de ruinas, a petición del
  autor. La vista de espalda de Imperión parece de frente: se puede rehacer.
- **Mapas (2026-10-25), hecho:** con aspecto de los juegos de criaturas de GBA, a petición
  del autor.
  - Se descartó pasar el juego a Pokémon Essentials (no va en el navegador ni en iPhone) y usar
    tilesets de la comunidad (casi todos prohíben redistribuirlos y el repositorio es público).
  - Tileset propio y mapas del capítulo 1 más ricos: plaza con fuente, vallas, pozo, huertos,
    naranjos, setos, rocas.
  - Personajes propios de 16 × 24, con la cabeza asomando sobre la casilla de arriba.

## Antes de tocar nada

- Lee `docs/GDD.md`: las decisiones cerradas y las abiertas. Si una idea nueva choca con una
  decisión cerrada, pregunta antes de seguir. No diseñes sobre las abiertas sin preguntar.
- Lee `docs/PROTOTIPO.md`: el plan de la fase en curso.
- Para criaturas, lee `docs/BESTIARIO.md`. Es la fuente de verdad de nombres, tipos, roles y
  fichas, y `src/data/especies.ts` debe seguirla.

## Reglas que más se olvidan

- **Nada de Pokémon ni de PokéRogue:** ni nombres, ni diseños, ni sprites, ni música, ni
  textos. Solo se toman las mecánicas como inspiración.
  - Excepción, por decisión del autor: la mayoría de los objetos se llaman como en el género
    (Poción, Revivir, Repelente…). Las téseras, el Turrón y los objetos únicos tienen nombre
    propio.
- **Los personajes históricos nunca son criaturas.** Son entrenadores, líderes, PNJ y trama.
  Las criaturas salen de la mitología y la fauna ibérica, más los fósiles que revive el
  Dr. Jangel.
- **A quién elegir.** Primero reyes, generales y guerreros; artistas, pocos.
  - Se eligen por su peso histórico. No hace falta buscarles relación con los animales.
  - Los mentores son Isabel la Católica (capítulo 1) y, según la propuesta, Carlos III
    (capítulo 5).
  - Los héroes anteriores a 1492, como el Cid, solo salen como ánimas en las zonas opcionales.
- **Canarias.** Los jugadores son de allí, y al menos un gimnasio tiene que estar en las islas.
- **Hechos y fechas reales correctos.** Lo fantástico son las criaturas, no la historia. Si un
  dato es dudoso, se marca como tal o se pregunta.
- **Personas vivas:** solo figuras públicas y en su papel público, con retratos dibujados (nunca
  fotos) y caricatura amable. La web pública lleva `noindex`.
- **Determinismo en `src/core`.** Prohibido usar `Math.random`, `Date.now` o Phaser ahí. Toda la
  aleatoriedad sale del generador con semilla, cuyo estado viaja dentro del estado del juego. El
  estado se serializa a JSON: nada de clases con métodos ni funciones dentro. Es la base del
  multijugador y del reto diario.
- **El contenido son datos (`src/data`).** Añadir una criatura, un movimiento o un entrenador
  no debe obligar a tocar el motor.
- **Móvil primero.** Todo lo jugable funciona con el mando táctil y con el teclado.
- **Cada fase termina en algo jugable.**
- **Al final de cada sesión**, actualiza el apartado «Estado actual» de este archivo y el
  registro de cambios del GDD.

## Estructura

El código va en español: nombres, comentarios y textos.

- `src/core/`: motor puro y determinista, con pruebas en `tests/`.
  - `modelo.ts`: los tipos de datos.
  - `rng.ts`: el generador con semilla.
  - `estadisticas.ts`, `tipos.ts`, `danio.ts`, `captura.ts`, `progreso.ts` y `criatura.ts`.
  - `pasivas.ts`: consultas de pasivas e inmunidades a estados.
  - `combate.ts` e `ia.ts`: el combate, como (estado, acción) → (estado, eventos).
  - `mundo.ts`: zonas, personajes, salidas, guiones (`Paso`) y línea de visión.
  - `partida.ts`: el estado de la partida, los encuentros y el resultado de los combates.
  - `guardado.ts`: serializar y migrar partidas.
- `src/data/`:
  - Contenido de combate: `especies.ts`, `movimientos.ts`, `tipos.ts`, `temperamentos.ts`, `pasivas.ts` y
    `objetos.ts`, reunidos en `DATOS` (`index.ts`).
  - Contenido del mundo: `casillas.ts` (la leyenda de los mapas), `entrenadores.ts`,
    `zonas/capitulo1.ts`, `zonas/capitulo2.ts` y `guion.ts` (atajos para escribir guiones). Se reúnen en `mundo.ts`,
    que también da `CAPITULOS` y `ENTRADAS` (por dónde se entra en cada zona).
  - `lugares.ts`: los lugares del mapa de la península, con su latitud y longitud, y la
    proyección del mapa.
- `src/escenas/`:
  - `Arranque`.
  - `Titulo`.
  - `Mundo`: el mapa y los guiones.
  - `Interfaz`: el mando, los diálogos y los menús, encima del mapa. En los menús, la cruceta y
    A se reparten con `nav`: cada pantalla dice qué hacen.
  - `Combate`: modo historia o laboratorio.
  - `Laboratorio`.
- `src/ui/`:
  - `tema.ts`: medidas (1080 × 1920; el mapa ocupa los 1240 de arriba), paleta y tipografía.
  - `componentes.ts`: `Boton` (con relieve, icono opcional y mantener pulsado), `botonFlecha`,
    `Barra` y chips de tipo.
  - `ventanas.ts`: las piezas de los menús (panel, fondo con rayas, pestaña de título, franja de
    selección y píldoras).
  - `casillasVisual.ts`: el mapa con el tileset propio. El suelo de cada zona se pinta en un
    lienzo (caminos, agua y alfombras por cuartos según sus vecinos); árboles, columnas y demás
    cosas altas van aparte, ordenadas por profundidad; el agua se mueve.
  - `personaVisual.ts`: los personajes, con las hojas de `arte/mapa/personajes.py`.
  - `objetoVisual.ts`: los iconos ilustrados de objetos y menús.
  - `retratoVisual.ts`: los retratos de los diálogos, por el nombre de quien habla.
  - `mapaVisual.ts`: el mapa de la zona de captura, con los lugares resaltados.
  - `tablaTipos.ts`: la consulta de la tabla de tipos.
  - `criaturaVisual.ts`: las imágenes de `src/assets/criaturas/` (de frente y `_jugador`) o una
    figura provisional.
  - `textos.ts`: frases de combate y `describirMovimiento`.
  - `sesion.ts`: la partida en curso y el `localStorage`.
  - `pedirNombre.ts`.
- **Añadir una zona:**
  - Se dibuja en texto con los caracteres de `casillas.ts` y se le pone un `estilo` (pueblo,
    campo, alhambra, mesón, pabellón, patio, meseta, toledo, alcázar), que decide árboles,
    muros, suelos y paredes.
  - Para cambiar de capítulo, el guion termina con el paso `viajar` (zona y casilla).
  - Una casilla nueva necesita su entrada en `casillas.ts`, su dibujo en `casillasVisual.ts` y,
    si es una pieza nueva, su función en `arte/mapa/tileset.py`.
  - Cada salida necesita su vuelta en la otra zona.
  - Las pruebas (`tests/historia.test.ts`) comprueban filas, caracteres, salidas, personajes y
    guiones, y que se llega a todo lo que hay en el mapa.
- **Banderas de la historia:**
  - `inicial`, `teseras`, `colon`, `fosil`.
  - `oculto:<zona>:<id>`: objeto escondido ya recogido.
  - `mimico:<zona>:<id>`: premio del Papemímico ya dado.
  - `visto:<zona>`: el guion de entrada ya se ha visto.
  - `vencido:<entrenador>`.
  - `blason_alhambra`.
  - Capítulo 2: `capitulo2`, `carta_padilla`, `blason_toledo`.
  - Modo desarrollador: `dev:sin_encuentros`.
  - Regalos dados (para no repetirlos): `regalo:mapa`, `regalo:mt_boabdil`, `regalo:mt_maria`.
  - `fijo:<zona>:<id>`: legendario que esperaba de pie, ya vencido o capturado.
- **Cada zona nueva** necesita `enMapa` (su lugar de `lugares.ts`, o el camino entre dos) para
  salir en el mapa de la zona de captura; las pruebas lo exigen.

## Comprobar

- `npm test`: Vitest contra `src/core` y la coherencia de los datos.
- `npm run build`: `tsc` más `vite build`, con base relativa.
- `npm run dev` o `npm run preview`: abre el juego con un viewport de móvil en vertical.
- **Sin móvil, con Playwright:**
  - Usa un viewport de 390 × 844, con toques y teclado: flechas, Intro (A), Esc (B) y M (menú).
  - `window.juego` da acceso a las escenas para comprobar el estado; por ejemplo,
    `juego.scene.getScene('Mundo').p` es la partida.
- **Publicación.** `.github/workflows/publicar-juego.yml` publica al hacer push a `main`:
  - Ejecuta `npm ci`, `npm test` y `npm run build` aquí.
  - Copia `dist/` a `web/leyendas-de-iberia/`.
  - El service worker del juego de la raíz (`game/sw.js`) ignora esta carpeta.
- **Alto de pantalla.** El alto lógico se adapta al móvil: `ALTO` en `tema.ts`, entre 1920 y
  2400. Las pantallas fijas (título, combate, laboratorio) están diseñadas a 1920 y se centran
  con `MARGEN_VERTICAL`. El mapa usa todo el alto que sobra.
