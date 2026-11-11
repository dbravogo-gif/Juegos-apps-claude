# Personas (modelos de Meshy)

Los personajes del juego, hechos por el autor con Meshy a partir de un dibujo (2026-11-11).
Cada amigo tendrá el suyo: por eso no hace falta personalizar al protagonista. Cada modelo va con
su imagen 2D al lado, con el mismo nombre en `.webp`.

| Archivo | Quién | Esqueleto y animaciones |
| --- | --- | --- |
| `dani.glb` | El jugador (el autor) | Sí: `Running` y `Walking` |
| `pescador.glb` | Entrenador que pesca en Famara | No: respira por código |
| `informatico.glb` | El informático del museo | No: respira por código |

- **Aligerados** con `herramientas/aligerar-glb.py`: solo la textura de color, a 1K. Pasan de
  unos 7 MB a entre 0,5 y 1,3 MB. Los originales siguen en el historial de git.
- **De Meshy:** unos 15.000 triángulos en los personajes que se manejan y unos 8.000 a 11.000 en
  los que solo están.
- **Parado:** Dani no trae una animación de parado. Mientras tanto se usa el fotograma 0 de su
  andar, que tiene los pies juntos. Si se exporta con `Idle` en el mismo GLB, se cambia en
  `src/arte/personas.ts`.
- **Correr:** el jugador va a paso de carrera. `Running` se acelera para que los pies no patinen.
