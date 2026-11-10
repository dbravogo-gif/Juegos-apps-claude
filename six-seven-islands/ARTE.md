# Six-seven islands: Guía de arte

- **Concepto visual en una frase:** un archipiélago de juguete bajo el sol de la tarde, con
  criaturas blanditas y de colores vivos.
- **Referencias de sensación** (no se copian):
  - las maquetas y los dioramas de modelismo,
  - las fotos con efecto *tilt-shift*,
  - los juguetes de vinilo de formas suaves,
  - el material del portfolio 2025 de Bruno Simon (licencia MIT; ver la skill `juego-3d`).
- **El elemento memorable:** las criaturas. Llevan los colores saturados de su tipo sobre un
  mundo de tonos tranquilos. La audacia va solo en ellas; el resto acompaña.

## Paleta

No se improvisan colores.

| Nombre | Hex | Uso |
| --- | --- | --- |
| Hierba menta | `#7ED6A5` | Primario: terreno y vegetación |
| Arena caramelo | `#E8B878` | Secundario: caminos, playas y madera |
| Acento coral | `#FF6B6B` | Acento, solo para lo importante: objetivos, objetos y el botón principal |
| Sombra lavanda | `#6B7BB8` | Sombra: tiñe las sombras, que nunca son negras |
| Cielo melocotón | `#FFD8B0` | Niebla y cielo cerca del horizonte |
| Agua turquesa | `#3CC8D8` | Mar, ríos y espuma |

- **Derivados** (en `src/arte/paleta.ts`, mezclas de los de arriba): hierba honda `#5BBF8A`,
  madera tostada `#B98A5A`, piedra lavanda `#A9AFD6`, espuma `#E9FBF7`, crema `#FFF4E0`, ojo
  `#2B2340` y el relleno del cielo `#C4C6F2`.
- **Criaturas:** el color principal de cada una es el de su tipo. Se partió de los 15 colores de
  `leyendas-de-iberia/src/data/tipos.ts` y se ajustó su luminosidad en la prueba de arte (F04),
  en OKLCH, conservando el tono.
  - **Criterio:** contraste de valor con la hierba menta (L ≈ 0,81), para que se lean en gris
    al explorar. Los tipos de tono medio, a L 0,54–0,66; los claros, a 0,86–0,94.
  - **Lo aprendido:** aclararlos «para el sol de tarde» (L 0,68–0,72) los fundía con la hierba
    en gris. Los de Leyendas ya estaban casi en su sitio.
  - Común, acero y oscuridad son casi grises: se distinguen poco entre sí. Decisión pendiente
    del autor si molesta (por ejemplo, Común hacia un beige cálido).

| Tipo | Color | Tipo | Color | Tipo | Color |
| --- | --- | --- | --- | --- | --- |
| Común | `#A9A39F` | Eléctrico | `#FFC83E` | Roca | `#94775C` |
| Agua | `#3A81F5` | Hielo | `#8BF1FF` | Oscuridad | `#504C47` |
| Tierra | `#A96A17` | Infernal | `#E4312E` | Espectral | `#7C39ED` |
| Planta | `#1FA74E` | Mental | `#ED499A` | Acero | `#91A0B5` |
| Aire | `#96DCFF` | Bicho | `#6AA706` | Ancestral | `#BC5B18` |
| Veneno | `#A31DB0` | | | | |

Plasma se fundió en Eléctrico y entraron Bicho y Veneno (2026-11-08), con el mismo criterio
de luminosidad.
- **Interfaz:** fondos crema, texto oscuro cálido y el acento coral solo en la acción
  principal.

## Formas por papel

Cada una se distingue por la silueta a la distancia de juego.

- **Jugador:** una figurita de juguete con la cabeza grande (proporción 1:2), siluetada por un
  contraluz cálido. La ropa lleva los colores que elige el jugador.
- **Criaturas:**
  - Redondas y blandas: cuerpos de esfera, cápsula, pera o gota, con ojos grandes y brillantes.
  - El tipo se lee por el color y por una pieza característica: llama, hoja, aleta, cristal…
  - La evolución se lee por el tamaño y por las piezas: la segunda forma añade crestas o
    cuernos, y la tercera es más grande y más angulosa.
- **Peligros:**
  - La hierba alta es más alta, más oscura y se mece de otra manera.
  - El equipo enemigo viste formas angulosas.
  - Los entrenadores muestran su línea de visión.
- **Recompensas:** objetos redondos con brillo propio. Las criaturas casi perfectas, visibles en
  la hierba, despiden un destello sutil.
- **Mundo:**
  - Bloques biselados con los bordes redondeados, como piezas de juguete.
  - La isla tiene un canto visible que cae al mar: eso es lo que la hace diorama.

## Modelos del mundo

Kit canario del 2026-11-08, aprobado por el autor:
- estilo de juguete redondeado;
- unas pocas piezas que se repiten por toda la isla;
- todo por código, y lo que no le guste lo rehace él con Meshy.

Se revisan de cerca en `?catalogo` (plantas, rocas y muro) y `?catalogo=edificios`; con
← →, la cámara se acerca a cada pieza.

- **Cómo se hacen:** geometrías con color por vértice y un solo material, con variantes por
  semilla (`montaje.ts`). Cada variante es una llamada de dibujo más por trozo de la isla, así
  que hay pocas.
- **Cada isla elige** por zona el estilo de sus casas, sus árboles y la flora de sus rocas, y
  por isla los colores del suelo y de las cumbres (`DefZona` y `DefIsla` en `core/mundo.ts`).
- **Casas** (`canario.ts`):
  - **Lanzarote** (zona inicial y La Geria de la isla 1): blanca, de una planta, lisa, con zócalo
    y carpintería verde o azul, azotea con pretil y la chimenea redonda con su sombrerete.
  - **De balcones blanca** (capital de la isla 1): como la de balcones, con la fachada de cal,
    sin cantería en las esquinas y siempre con azotea. En Lanzarote no hay teja.
  - Las azoteas de Lanzarote son blancas (`azoteaBlanca`), algo más grises que el pretil para
    que se lea su forma.
  - **Rural** (La Palma: zona inicial y pueblo): blanca, de una planta, con muros redondeados, zócalo,
    cantería en las esquinas, carpintería verde, azul o de madera, contraventanas, macetas con
    geranios y tejado de teja curva, a veces con chimenea.
  - **De balcones** (capital): fachada de color, dos plantas y balcón de madera corrido con
    tejadillo. La mitad lleva teja y la otra mitad azotea con pretil, cuarto y depósito.
  - El refugio lleva puerta y letrero coral. La tienda, toldo a rayas azules y cajas.
  - **Provisionales hasta que el autor los haga con Meshy:**
    - el museo, una casa de una planta del estilo de su zona, con un pórtico de cuatro
      columnas de cantería y frontón delante de la puerta;
    - el gimnasio, una casona de balcones con azotea y el emblema de su tipo pintado arriba: un
      volcán en el de Roca de Lanzarote (un sol en el de La Palma, por decidir);
    - el faro, una torre blanca con dos bandas rojas.
- **Plantas** (`kit.ts`):
  - **Laurel**, en el bosque. Los que tienen un camino justo al norte son bajos, para no tapar
    la última fila.
  - **Palmera canaria**, en las plazas y paseos.
  - **Platanera**, en las plantaciones (La Palma).
  - **Viña en su hoyo** de picón, con su muro en media luna (La Geria).
  - **Tunera**, la chumbera.
  - **Drago.**
  - **En las rocas (`#`), según la flora de la zona:**
    - en el secano, cardón, tabaiba y tunera;
    - en lo húmedo, tajinaste azul gigante, endémico de La Palma;
    - en el volcán, escorias, basalto y órganos.
  - **De aquí en adelante, como mucho 4 plantas nuevas** (autor, 2026-11-10).
- **Rocas y muros:** roca basáltica, órganos de basalto, escoria roja, lajas del malpaís y muro
  de piedra seca.
- **Coladas de lava** (no se pisan): lajas altas en negros y grises, sobre un escalón alto. El
  malpaís, que sí se pisa, es rojizo y de lajas bajas: así no se confunden (probador,
  2026-11-10).
- **Conos volcánicos** (`Q` en el mapa): cada grupo de casillas es un volcán a su medida, que
  sale de entre las coladas de las Montañas del Fuego.
- **Suelos de Lanzarote:** jable gris claro; playa dorada (`a`) con guijarros; picón negro en La
  Geria; en las Montañas del Fuego, el picón y la tierra con manchas negras, óxido y ocre, como
  en Timanfaya. Bajo una planta, el suelo es el de alrededor.
- **Objetos del suelo:** un frasco que flota y gira hasta que se recoge.
- **Silueta del jugador** cuando algo lo tapa: coral, que se ve sobre la cal y sobre el picón.
- **Charco verde** de El Golfo: agua verde, más alta que el mar.
- **Volcanes** en las cumbres (pequeños, juntos y a más de tres casillas de las zonas) y
  **nubes** solo sobre el mar del norte, para que no tapen: el paisaje ya no usa KayKit.
- **Luz sobre lo horizontal:** arriba les da el sol y el relleno, y los colores claros se queman
  hasta casi blanco. Azoteas y suelos llevan colores medios (`azotea`, `solPintado`).
- **De KayKit** (CC0, Kay Lousberg; `CREDITS.md`) solo quedan las personas, sin armas, a 1,25
  casillas de alto y animadas: jugador `Rogue`, anciano y doctora `Mage`, entrenadores y líder
  `Knight` y `Barbarian`, y el resto `Rogue_Hooded`.
  - Quaternius no se puede descargar desde la red de trabajo.
- **Personas, más adelante (F12):** gente normal y personalizable, sin pícaros ni magos
  (decisión del autor, 2026-11-08).
- **Silueta del jugador:** clara (espuma, al 70 %), y solo cuando algo le tapa el pecho. Lo
  calcula «personaje» con la altura de lo que hay en las casillas al sur, entre él y la cámara.
  Encendida siempre, se pintaba sobre el propio jugador.
- **Con Meshy (el autor):** los edificios singulares que quiera, las tres estatuas del museo y
  las criaturas.
- **Cambiar una pieza del kit por un modelo de Meshy:**
  - El modelo se pasa por un normalizador:
    - lo pone a la escala de la pieza y con la base a ras de suelo;
    - le quita la luz pintada de su textura y le pone nuestro material;
    - ajusta sus colores a la paleta.
  - **Una pieza que sale pocas veces** (el drago, un edificio) es casi cambiar una por otra. Basta
    con unos 5.000 a 8.000 polígonos.
  - **Una que se repite en cada casilla** (el malpaís, unas 150 a la vista) tiene que ser ligera,
    unos 300 triángulos. Hay dos caminos:
    - reducir el modelo de Meshy;
    - mejor: usarlo como 2 o 3 rocas grandes de lava sueltas, de 1.000 a 1.500 polígonos, y dejar
      las lajas por código como suelo.
  - Con Meshy gratis, la licencia es CC BY: se cita en `CREDITS.md`.

## Generador de criaturas

Es el mayor riesgo del proyecto: 200 criaturas sin artistas. Su calidad se decide en la prueba
de arte, antes de construir contenido.

- **Una ficha de datos por criatura** combina un kit de piezas:
  - cuerpo, cabeza opcional y ojos (siempre);
  - orejas, cuernos, aletas, alas, cola y extremidades;
  - un patrón de manchas, rayas o degradado;
  - y el color del tipo más uno secundario.
- **Las evoluciones reutilizan la ficha base:** más escala, más piezas y formas más angulosas.
- **Animación procedural** de cada pieza, sin esqueleto:
  - reposo (respirar, con *squash and stretch*),
  - ataque,
  - recibir un golpe,
  - debilitarse.
- **Hecho en F04** (`src/sistemas/criaturas/`):
  - Kit: cuerpo (esfera, cápsula, pera o gota), cabeza, ojos con dos brillos fijos, boca
    (sonrisa o colmillos), mejillas, tripa, orejas, cuernos, copete (hoja, llama, aleta o
    cristal), aletas, brazos, patas, cola (punta, aleta u hoja) y cresta en el lomo. Patrones:
    liso, manchas, rayas y degradado, pintados por fragmento (nítidos de cerca, sin texturas).
  - Falta: alas. Se añaden cuando una especie las pida.
  - Las piezas se fusionan por «hueso» (cuerpo, cabeza, ojos, copete, cola y dos apéndices):
    como mucho 7 mallas por criatura.
  - La evolución se deriva con `evolucionar(base, cambio)`: crece, gana angulosidad y piezas, y
    hereda forma, colores y patrón. En la prueba, la forma 2 de Planta añade hojas a los lados,
    una corona de tres hojas, cresta y brazos.
  - Para revisar las animaciones: `?lento=0.1`.
- **Plan B:** paquetes CC0 de monstruos animados, con la licencia comprobada y apuntada en
  `CREDITS.md`.
- **Plan C:** criaturas ilustradas en 2D dentro del mundo 3D.

## Luz

- **Luz principal:** un sol de tarde, cálido (`#FFE2B8`, intensidad 2,3), que entra de lado a
  unos 48°. A 35°, las casas de KayKit tapaban media calle con su sombra.
  - El relleno es la luz del cielo, azul lavanda (`#C4C6F2`, intensidad 1,5). Es lo único que
    queda en la sombra, así que es lo que la tiñe.
  - Un contraluz cálido separa al jugador y a las criaturas del fondo.
- **Mapeo tonal y exposición:**
  - Mapeo tonal neutro (`NeutralToneMapping`), que respeta los colores de la paleta mejor que el
    ACES.
  - La exposición se ajusta en partida, no en la pantalla de título.
- **Brillo (*bloom*):** solo en lo emisivo y sutil: el faro, el destello de las casi perfectas y
  los efectos de los ataques.

## Materiales

- Un material base compartido, con la receta de la skill `juego-3d`: mate, como de plástico o
  arcilla, con el color de la paleta.
- Sombras de color lavanda.
- Rebote del color del suelo.
- Niebla hacia el melocotón del cielo.
- Las criaturas tienen además un brillo especular suave, y los ojos un punto de luz fijo.
- **Valores de la prueba de arte** (`src/arte/material.ts`):
  - Mundo: sombra propia con `smoothstep(-0,02, 0,32)` sobre N·L, casi una banda.
  - Criaturas: `smoothstep(-0,3, 0,55)`, especular 0,14 con dureza 14 y contraluz 0,25. Con
    más especular y contraluz parecían de gelatina.

## Escala y cámara

- **Explorar:**
  - Cámara alta, a unos 50°, con un campo de visión estrecho (unos 30°). Ángulo alto con lente
    larga: así se ve una miniatura.
  - El jugador mide alrededor del 9 % del alto de la pantalla, unos 70 px en 1280 × 800
    (pantalla apaisada; el juego es solo para ordenador).
- **Interiores:** la cámara encuadra la sala entera, quieta.
- **Diálogos:** la cámara se acerca y sube a 72°, entre el jugador y quien habla. A 50°, el
  jugador, que habla desde el sur, le tapaba.
- **Combate:** cámara más cerca, sobre el mismo terreno. Las criaturas ocupan entre un tercio y
  la mitad del alto.
- **Efecto *tilt-shift*:** desenfoque de profundidad real arriba y abajo. En la calidad baja,
  para ordenadores flojos, se simula con niebla por distancia y un degradado de color en los
  bordes, que cuesta casi nada.
- **Qué detalle se ve a esa distancia:**
  - Explorando, solo siluetas y grandes manchas de color.
  - Las caras y los patrones de las criaturas solo cuentan en combate.
  - Lo que queda más pequeño es ruido.

## Pruebas de la guía

- La escena se lee en escala de grises.
- Cada papel se reconoce solo por su silueta.
- En combate, el tipo de cada criatura se reconoce por su color y su pieza característica.
- Una criatura y su evolución se reconocen como de la misma especie.
