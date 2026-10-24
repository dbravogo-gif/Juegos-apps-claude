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
| `dama.png` | Princess | Isabel la Católica |
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

- **Origen:** generadas con OpenArt (modelo Wan 2.7 Image) en hojas de varias criaturas, a partir
  de las descripciones visuales de `docs/BESTIARIO.md` (2026-10-24).
- **Proceso:** se separa cada criatura, se quita el fondo blanco y se reduce a 128 × 128 con una
  paleta corta, para que parezca pixel art. Las formas pequeñas ocupan menos del cuadro, así que
  se ven más pequeñas que las grandes. Todas miran a la izquierda: el juego las da la vuelta
  para la criatura del jugador.
- **Licencia:** el plan gratuito de OpenArt pone una marca de agua en el centro de cada imagen y
  permite el uso no comercial. Solo se usan criaturas que quedaron fuera de la marca; las que
  quedaron debajo se volvieron a generar, no se retocaron.
- Reserva para más adelante: `arte/criaturas-futuras/` (por ahora, la vieja del capítulo 5).

## Objetos (`objetos/`)

Iconos del mismo paquete *Ninja Adventure* (carpeta `Items/`), uno por `id` de objeto.
