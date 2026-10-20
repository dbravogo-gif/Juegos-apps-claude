# Leyendas de Iberia (carpeta leyendas-de-iberia/)

Juego de criaturas al estilo Pokémon ambientado en la historia de España, de 1492 a hoy. Es para
el autor y dos amigos, y se juega en el navegador del móvil y del PC. Usa Vite + TypeScript +
Phaser y se publica como web estática en GitHub Pages.

El resto del repositorio (`game/`, `aerolinea/`, `Bulk-up-main/`) son otros proyectos. No se
tocan desde aquí.

## Estado actual

- **Fase 1, prototipo «Granada, 1492».** El hito 1, el laboratorio de combate, está hecho y se
  puede jugar.
  - Motor de combate completo en `src/core`, con 41 pruebas.
  - 19 especies; los iniciales tienen tres formas cada uno.
  - Pantallas de laboratorio y de combate, con captura, objetos, cambios, experiencia y
    evolución.
- **Siguiente: hito 2, la Vega** (`docs/PROTOTIPO.md` §5): mapa, encuentros, equipo y mesón.
- **Decidido:**
  - Estadísticas como en Pokémon, con nombres propios.
  - Valía de 1 a 14.
  - 15 tipos.
  - Phaser 4.
- **Pendiente del autor:** las relaciones entre tipos y la definición de Plasma (`docs/GDD.md`
  §8). Mientras tanto, la tabla de `src/data/tipos.ts` es provisional.

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

## Estructura

El código va en español: nombres, comentarios y textos.

- `src/core/`: motor puro y determinista, con pruebas en `tests/`.
  - `modelo.ts`: los tipos de datos.
  - `rng.ts`: el generador con semilla.
  - `estadisticas.ts`: fórmulas, Valía y temperamento.
  - `tipos.ts`, `danio.ts`, `captura.ts` y `progreso.ts` (experiencia, movimientos y
    evolución).
  - `criatura.ts`: crear y curar ejemplares.
  - `combate.ts`: `iniciarCombate` y `resolverTurno`, que devuelven el estado nuevo y los
    eventos.
  - `ia.ts`: la IA del rival.
- `src/data/`: `especies.ts`, `movimientos.ts`, `tipos.ts` (tabla provisional),
  `temperamentos.ts` y `objetos.ts`. `index.ts` reúne todo en `DATOS`, que el motor recibe como
  parámetro.
- `src/escenas/`: escenas de Phaser.
  - `Arranque` carga el arte.
  - `Laboratorio` es donde se eligen los equipos.
  - `Combate` pinta los eventos del motor, sin lógica de reglas.
- `src/ui/`:
  - `tema.ts`: medidas (1080 × 1920, escalado con FIT) y colores.
  - `componentes.ts`: `Boton`, `Barra` y chips de tipo.
  - `criaturaVisual.ts`: el arte de las criaturas.
  - `textos.ts`: la frase que acompaña a cada evento.
- `src/assets/criaturas/<id>.png`: arte de cada criatura. Se detecta solo. Si falta, se dibuja
  una figura provisional con el color del tipo, más grande y con más adornos cuanto más
  evolucionada.

## Comprobar

- `npm test`: Vitest contra `src/core` y la coherencia de los datos.
- `npm run build`: `tsc` más `vite build`, con base relativa.
- `npm run dev` o `npm run preview`: abre el juego con un viewport de móvil en vertical. Sin
  móvil, se puede usar Playwright con un viewport de 390 × 844 y toques.
- **Publicación** (hito 4). Hay que añadirlo a `.github/workflows/publicar-juego.yml`:
  - incluir `leyendas-de-iberia/**` en `paths`;
  - hacer `npm ci`, `npm test` y `npm run build`;
  - copiar `dist/` a `web/leyendas-de-iberia/`.
