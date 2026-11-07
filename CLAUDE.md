# Juegos y apps (raíz del repositorio)

Varios proyectos independientes del mismo autor, todos web para móvil y publicados en GitHub
Pages. Cada uno tiene sus propias reglas: si existe `<proyecto>/CLAUDE.md`, mandan las suyas.

| Carpeta | Qué es | Se publica en |
| --- | --- | --- |
| `game/` | RPG de hábitos (JS sin build) | raíz de Pages |
| `aerolinea/` | Simulador de aerolínea (JS sin build) | `/aerolinea/` |
| `leyendas-de-iberia/` | Juego de criaturas (Vite + TS + Phaser) | `/leyendas-de-iberia/` |
| `gymlog-fase1/` | App de gimnasio (HTML único) | `/gymlog-fase1/` |
| `Bulk-up-main/` | App de gimnasio anterior | no se publica |

No toques un proyecto distinto del que te han pedido.

## Convenciones de todos los proyectos

- Código, comentarios y textos en español.
- Móvil primero: todo se usa con el dedo en 390 × 844 y también con teclado.
- La lógica va en un núcleo puro y determinista (semilla, sin DOM) con pruebas; el contenido
  son datos. Así se puede probar sin abrir el navegador.
- Nada de nombres, arte, música ni textos de juegos ajenos: solo se toman mecánicas.

## Comprobar un cambio

- Las pruebas de cada proyecto: `npm test` dentro de su carpeta.
- Verlo de verdad, con capturas y errores de consola en un móvil simulado:
  `node herramientas/capturar.mjs <carpeta>` (opciones al principio del archivo). Leyendas se
  compila antes (`npm run build`) y se abre `leyendas-de-iberia/dist`.
- Para una revisión independiente, con criterios y como jugador, usa el agente `probador`.

## Publicar

`.github/workflows/publicar-juego.yml` publica todo al hacer push a `main` si pasan las
pruebas. Un proyecto nuevo necesita su ruta en `paths` y su copia en «Montar el sitio».
