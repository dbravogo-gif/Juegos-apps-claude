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

- **Criaturas:** el color principal de cada una es el de su tipo. Se parte de los 15 colores de
  `leyendas-de-iberia/src/data/tipos.ts` y se ajusta su luminosidad en la prueba de arte, para
  que encajen con el sol de tarde. Una vez ajustados, se apuntan aquí.
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
- **Plan B:** paquetes CC0 de monstruos animados, con la licencia comprobada y apuntada en
  `CREDITS.md`.
- **Plan C:** criaturas ilustradas en 2D dentro del mundo 3D.

## Luz

- **Luz principal:** un sol bajo de tarde, cálido (`#FFE2B8`), que entra de lado a unos 35°.
  - El relleno es la luz azulada del cielo.
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

## Escala y cámara

- **Explorar:**
  - Cámara alta, a unos 50°, con un campo de visión estrecho (unos 30°). Ángulo alto con lente
    larga: así se ve una miniatura.
  - El jugador mide alrededor del 9 % del alto de la pantalla, unos 60 px en 393 × 659.
- **Combate:** cámara más cerca, sobre el mismo terreno. Las criaturas ocupan entre un tercio y
  la mitad del alto.
- **Efecto *tilt-shift*:**
  - En escritorio, desenfoque de profundidad real arriba y abajo.
  - En móvil, el presupuesto no lo permite (`referencias/rendimiento.md` de la skill
    `juego-3d`). Se simula con niebla por distancia y un degradado de color en los bordes, que
    cuesta casi nada.
- **Qué detalle se ve a esa distancia:**
  - Explorando, solo siluetas y grandes manchas de color.
  - Las caras y los patrones de las criaturas solo cuentan en combate.
  - Lo que queda más pequeño es ruido.

## Pruebas de la guía

- La escena se lee en escala de grises.
- Cada papel se reconoce solo por su silueta.
- En combate, el tipo de cada criatura se reconoce por su color y su pieza característica.
- Una criatura y su evolución se reconocen como de la misma especie.
