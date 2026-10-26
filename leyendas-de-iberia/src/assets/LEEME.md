# Arte del juego

## Mapa (`mundo/`)

`iberia.png` e `iberia.json` son el tileset propio del juego, al estilo de los juegos de criaturas
de GBA (tiles de 16 × 16). Los genera `arte/mapa/tileset.py`, que lo dibuja todo por código, sin
recursos de terceros: son nuestros y se pueden publicar. **No se editan a mano**: se cambia el
script y se vuelve a ejecutar (`python3 arte/mapa/tileset.py`).

- El JSON dice dónde está cada pieza (`nombre: [x, y, ancho, alto]`).
- Caminos, empedrado, acequias, fuentes, alfombras y huertos son materiales que se juntan con sus
  vecinos: cinco tiles de referencia que el juego corta en cuartos (`src/ui/casillasVisual.ts`).
- Las acequias y las fuentes tienen cuatro fotogramas.
- Capítulo 2: hierba de la meseta, trigales (hierba alta), encinas, losas, muros de sillería
  gris del Alcázar, armaduras y armeros.

## Mapa de la península (`mundo/mapa_iberia.*`)

`mapa_iberia.png` (240 × 196, en píxeles grandes) es el mapa de la zona de captura del
Bestiario, y `mapa_iberia.json`, su proyección. Los genera `arte/mapa/mapa_iberia.py`; **no se
editan a mano.**

- **Origen de las costas y fronteras:** Natural Earth 4.1.0, escala 1:10m, de dominio público,
  tomada del paquete npm `world-atlas` 2.0.2. El script guarda solo los países que se ven en
  `arte/mapa/datos/costas.json`.
- **Dibujo:** propio, al estilo del mapa de la región de los juegos de GBA: mar con olas, la
  península en verde con la frontera de Portugal punteada y los vecinos en color arena.
- **Canarias** va en un recuadro abajo a la izquierda, en el Atlántico bajo el Algarve, para no
  tapar Huelva, Cádiz ni el estrecho.

## Personajes (`personajes/`)

Hojas propias, al estilo de los juegos de criaturas de GBA: 16 × 24 píxeles por fotograma, 4
columnas (abajo, arriba, izquierda, derecha) y 4 filas (quieto, paso, quieto, el otro paso). Las
genera `arte/mapa/personajes.py`: todos comparten un cuerpo y cada uno lleva sus colores, su tocado
y su ropa. **No se editan a mano.**

| Archivo | Cómo va | Lo usa |
| --- | --- | --- |
| `muchacho.png` | Gorro rojo y jubón azul | El jugador |
| `dama.png` | Corona, pelo rubio rojizo, piel blanca y vestido carmesí, como la describen las crónicas | Isabel la Católica |
| `noble.png` | Corona, jubón granate y oro, capa | Fernando el Católico |
| `caballero.png` | Coraza, capa roja y barba | El Gran Capitán |
| `explorador.png` | Pelo cano, gorro oscuro, jubón granate, calzas y capa azul | Colón |
| `anciano.png` | Sombrero de ala ancha, zamarra y barba blanca | El pastor de Orce |
| `anciana.png` | Toca blanca, vestido y delantal | La mesonera |
| `mujer.png` | Pañuelo rojo y vestido verde | La vecina |
| `tendero.png` | Gorro, camisa y delantal | El tendero del mesón |
| `ballestero.png` | Capucha y sayo verdes | El ballestero Sancho |
| `mercader.png` | Bonete rojo y ropa azul con cadena de oro | El mercader genovés |
| `guardia_nazari.png` | Turbante, aljuba roja y barba | El guardia de la Alhambra |
| `sultan.png` | Turbante con joya, barba y túnica verde y oro | Boabdil |
| `soldado.png` | Capacete y sayo rojo | El centinela |
| `labrador.png` | Sombrero de paja | Labrador de la Vega |
| `hortelana.png` | Vestido y delantal | Hortelana de la Vega |
| `aguador.png` | Turbante blanco y camisa azul | Aguador de la Alhambra |
| `halconero.png` | Turbante verde y barba | Halconero de la Alhambra |
| `jardinero.png` | Sombrero de paja y camisa verde | Jardinero de la Alhambra |
| `padilla.png` | Coraza, calzas carmesí y barba | Juan de Padilla |
| `maria_pacheco.png` | Vestido negro de luto, gorguera blanca y gorro negro | María Pacheco |
| `comunero.png` | Capacete y sayo carmesí, el color de las Comunidades | Comuneros |
| `imperial.png` | Capacete, sayo blanco y calzas rojas | Soldados del emperador |
| `espadero.png` | Gorro, delantal y barba | El espadero de Toledo |
| `monje.png`, `aldeano.png` | Fraile y aldeano | Villalar |
| `aldeano_verde.png`, `aldeana.png`, `maestro.png` | Aldeanos y un sabio | De reserva |

## Retratos (`retratos/`)

`<id>.webp`: bustos de 384 px sobre fondo transparente, apoyados abajo, para los diálogos. Qué
nombre usa cada uno está en `src/data/retratos.ts`. Solo llevan retrato los personajes
importantes (decisión del autor): Isabel, Fernando, el Gran Capitán, Colón, Boabdil, Juan de
Padilla y María Pacheco. Los demás están hechos y guardados en `arte/retratos-reserva/`, fuera
del juego (entre ellos Carlos V, Felipe II y Juan de Austria, para capítulos siguientes).

- **Origen:** OpenArt (GPT Image 2) el 2026-10-25, en cuatro hojas de 3 × 2, con el estilo de las
  criaturas (dibujo limpio, colores planos con una sombra, contorno fino) y la ropa de la época.
- **Historia:** Isabel, blanca y de pelo rubio rojizo; Fernando, con melena corta y flequillo;
  Colón, con el pelo ya blanco a los cuarenta, como lo describe su hijo Hernando; Boabdil, de unos
  treinta años; María Pacheco, de luto por Padilla.
- **Proceso:** el mismo corte que las criaturas, sin vaciar huecos blancos (tocas, turbantes y
  velos son blancos a propósito).

## Criaturas (`criaturas/`)

`<id de especie>.png`. Si no hay imagen, se dibuja una figura provisional.

- **Origen:** generadas con OpenArt (GPT Image 2, plan Starter, sin marca de agua) en hojas de una
  línea o de tres criaturas, a partir de las fichas de `docs/BESTIARIO.md` y su guía de diseño
  visual. Estilo «D», elegido por el autor el 2026-10-25.
- **Dos vistas por criatura:**
  - `<id>.webp`: el rival, en diagonal de frente, mirando a la izquierda.
  - `<id>_jugador.webp`: la tuya, en diagonal por detrás, mirando arriba a la derecha.
- **Proceso:** la hoja se corta en 2 filas y 3 columnas por las líneas con menos dibujo, se quita
  el fondo blanco (también los huecos grandes interiores), y cada criatura se coloca apoyada abajo
  en un cuadro de 384 px. Las formas débiles ocupan menos del cuadro, así que se ven más pequeñas.
- **Revisión de huecos:** el fondo blanco que queda encerrado entre ramas, patas o asas no
  siempre sale en el corte. Hay que mirar cada imagen sobre un fondo oscuro y quitar a mano esos
  huecos, sin tocar lo que es blanco a propósito (vapor, motas, alas, mármol, brillos de los
  ojos). Corregidos el 2026-10-25: el drago, el Papemímico, el Trasgorn y el pelotero.
- **Capítulo 2 (2026-10-26):** las 15 especies nuevas, en cinco hojas por línea evolutiva. La
  vista de espalda de Imperión (`aguila_imperial_jugador`) parece casi de frente: candidata a
  rehacerse.
- Reserva para más adelante: `arte/criaturas-futuras/` (Guayota y la vieja).

## Objetos (`objetos/`) e iconos de menú (`iconos/`)

- **Origen:** ilustrados con OpenArt (GPT Image 2) el 2026-10-25, en hojas de 4 × 3, con estilo de
  icono de juego para móvil. Sustituyen a los iconos pixelados de *Ninja Adventure*.
- **Objetos:** `objetos/<id>.webp`, uno por `id`. El dibujo sale de la idea original de cada
  objeto (ungüento, tarro de miel, azabache, téseras de manos unidas…), aunque el nombre en
  pantalla sea el del género.
- **Menús:** `iconos/<nombre>.webp` (equipo, bestiario, mochila, tipos, guardar, cerrar, huir,
  dinero, tarjeta, opciones, tienda y mapa).
- **Proceso:** el mismo corte que las criaturas, centrado y a 192 px. Aquí no se vacían los
  huecos blancos interiores, que son parte del dibujo, salvo en el amuleto de Tanit.
- Reserva: `arte/objetos-futuros/` (tres bayas sin uso todavía).
