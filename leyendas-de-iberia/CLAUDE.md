# Leyendas de Iberia (carpeta leyendas-de-iberia/)

Juego de criaturas al estilo Pokémon ambientado en la historia de España, de 1492 a hoy. Es para
el autor y dos amigos, y se juega en el navegador del móvil y del PC. Usa Vite + TypeScript +
Phaser y se publica como web estática en GitHub Pages.

El resto del repositorio (`game/`, `aerolinea/`, `Bulk-up-main/`) son otros proyectos. No se
tocan desde aquí.

## Estado actual

- **Fase 0, diseño.** Todavía no hay código.
- **Pendiente del visto bueno del autor** (`docs/PROTOTIPO.md`):
  - el sistema de estadísticas (A, B o C; se recomienda la A, Guardia);
  - la tabla de tipos provisional;
  - el plan del prototipo «Granada, 1492».
- **No se programa nada hasta que lo apruebe.**

## Antes de tocar nada

- Lee `docs/GDD.md`: las decisiones cerradas y las abiertas. Si una idea nueva choca con una
  decisión cerrada, pregunta antes de seguir. No diseñes sobre las abiertas sin preguntar.
- Lee `docs/PROTOTIPO.md`: el plan de la fase en curso.

## Reglas que más se olvidan

- **Nada de Pokémon ni de PokéRogue:** ni nombres, ni diseños, ni sprites, ni música, ni
  textos. Solo se toman las mecánicas como inspiración.
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

## Estructura prevista

Hay que actualizar este apartado cuando se cree el proyecto.

- `src/core/`: motor puro y determinista. Incluye el generador aleatorio, estadísticas, tipos,
  combate (estado, acciones, resolución, IA), captura, progreso y guardado. Lleva pruebas en
  `tests/`.
- `src/data/`: criaturas, movimientos, tipos, entrenadores, objetos, zonas y el registro de
  sprites.
- `src/escenas/` y `src/ui/`: Phaser. Escenas, mando táctil y cajas de diálogo.
- `src/assets/`:
  - `criaturas/<id>.png`: si falta una imagen, se genera una provisional con el color del tipo.
  - `mapas/`: en formato Tiled JSON.
  - `tiles/`.

## Comprobar

Lo siguiente aplica cuando exista código.

- `npm test`: Vitest contra `src/core`.
- `npm run build`: el build tiene que funcionar con base relativa.
- `npm run dev`: abre el juego con un viewport de móvil en vertical.
- **Publicación.** Hay que añadirlo a `.github/workflows/publicar-juego.yml`:
  - incluir `leyendas-de-iberia/**` en `paths`;
  - hacer el build en un paso;
  - copiar `dist/` a `web/leyendas-de-iberia/`.
