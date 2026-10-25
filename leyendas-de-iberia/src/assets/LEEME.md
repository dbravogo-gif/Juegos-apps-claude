# Arte del juego

## Mapa y personajes (`mundo/` y `personajes/`)

Salen del paquete **Ninja Adventure**, de Pixel-boy y AAA, publicado con licencia **CC0**
(dominio público): se puede usar, modificar y redistribuir sin pedir permiso. No hace falta
citar, pero se agradece.

- Página del paquete: <https://pixel-boy.itch.io/ninja-adventure-asset-pack>
- Copia usada: el repositorio `rinn7e/ninja-adventure-indigo`, carpeta
  `assets/Ninja Adventure - Asset Pack`, que trae el `LICENSE.txt` con la CC0. La sombra viene
  del proyecto oficial `pixel-boy/NinjaAdventure`.

| Archivo | Original |
| --- | --- |
| `mundo/suelo.png` | `Backgrounds/Tilesets/TilesetFloor.png` |
| `mundo/agua.png` | `Backgrounds/Tilesets/TilesetWater.png` |
| `mundo/naturaleza.png` | `Backgrounds/Tilesets/TilesetNature.png` |
| `mundo/casas.png` | `Backgrounds/Tilesets/TilesetHouse.png` |
| `mundo/elementos.png` | `Backgrounds/Tilesets/TilesetElement.png` |
| `mundo/interior_suelo.png` | `Backgrounds/Tilesets/Interior/TilesetInteriorFloor.png` |
| `mundo/interior_pared.png` | `Backgrounds/Tilesets/Interior/TilesetWallSimple.png` |
| `mundo/campamento.png` | `Backgrounds/Tilesets/tileset_camp.png` |
| `mundo/sombra.png` | `content/character/Shadow.png` (proyecto oficial) |

Personajes (`Actor/Character/<nombre>/SpriteSheet.png`):

| Archivo | Original | Lo usa |
| --- | --- | --- |
| `muchacho.png` | Boy | El jugador |
| `dama.png` | Princess, con la piel, el pelo y el vestido recoloreados | Isabel la Católica: blanca y de pelo rubio rojizo, como la describen las crónicas de su tiempo |
| `noble.png` | Noble | Fernando el Católico |
| `caballero.png` | Knight | El Gran Capitán |
| `explorador.png` | Inspector | Colón |
| `anciano.png` | OldMan2 | El pastor de Orce |
| `anciana.png` | OldWoman | La mesonera |
| `mujer.png` | Woman | La vecina |
| `monje.png` | Monk | El tendero |
| `ballestero.png` | Hunter | El ballestero Sancho |
| `mercader.png` | Master | El mercader genovés |
| `guardia_nazari.png` | Sultan | El guardia de la Alhambra |
| `sultan.png` | Sultan2 | Boabdil |
| `soldado.png` | GladiatorBlue | El centinela |
| `aldeano.png`, `aldeano_verde.png`, `aldeana.png`, `maestro.png` | Villager, Villager3, Villager4, OldMan | De reserva |

**Pendiente: retocarlo a la época.** El paquete es de estética japonesa. Hay que cambiar
tejados, ropa y tocados para que encajen con cada capítulo: la corona de Isabel, la teja árabe,
el encalado, etcétera.

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
