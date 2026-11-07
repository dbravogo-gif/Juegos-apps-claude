---
name: nuevo-proyecto
description: Empieza un juego o una app nueva en este repositorio, desde la idea hasta una primera versión jugable publicada. Entrevista al autor, escribe el diseño y la lista de funciones, monta la estructura que ya ha funcionado en los otros proyectos y deja algo que se pueda abrir en el móvil.
disable-model-invocation: true
---
Sigue estas fases en orden. No pases a la siguiente sin cerrar la anterior.

## 1. Entrevista

Pregunta con opciones cerradas (la herramienta de preguntas, de una a cuatro por tanda) hasta
poder escribir el diseño sin inventar nada importante:

- Para quién es y en qué dispositivo se juega. Cuánto dura una partida o una sesión de uso.
- La fantasía en una frase: qué se siente al jugar.
- El bucle principal: qué hace el jugador cada 10 segundos, cada 10 minutos y cada día.
- El gancho: la única cosa que lo hace distinto. Si no hay, proponle tres y que elija.
- Lo que no entra en la primera versión.
- Referencias de sensación (juegos o apps que le gusten), solo para entender el tono: no se
  copia nada de ellas.

## 2. Diseño y lista de funciones

En la carpeta nueva, escribe:

- `DISENO.md`: la fantasía, el bucle, el gancho, decisiones **cerradas** y decisiones
  **abiertas** (estas no se diseñan sin preguntar), y los criterios de calidad con los que se
  juzgará (los cuatro del agente `probador` más los propios del proyecto). Alto nivel: qué y por
  qué, no cómo se programa.
- `funciones.json`: la lista de funciones de principio a fin, cada una con `id`, `descripcion`,
  `como_se_comprueba` (pasos de un jugador) y `hecha: false`. Ordenadas por prioridad, y la
  primera tanda forma una versión jugable mínima. Durante la construcción solo se cambia
  `hecha`; si una función se replantea, se pregunta al autor.
- `CLAUDE.md` corto: qué es, las reglas que no se ven en el código, los comandos para
  comprobar y el estado actual en tres o cuatro líneas que apunten a `funciones.json`.

Enséñale al autor el diseño y la lista y espera su visto bueno.

## 3. Estructura

La que ya funciona en `aerolinea/` y `leyendas-de-iberia/`:

- `src/core/`: lógica pura y determinista (generador con semilla, sin `Math.random`, sin DOM),
  con su estado serializable a JSON.
- `src/data/`: el contenido como datos.
- `src/ui/`: la interfaz.
- `tests/`: pruebas del núcleo y de coherencia de los datos (`npm test`).
- Web instalable: `manifest.webmanifest`, iconos y service worker.
- Sin paso de build salvo que haga falta (motor de juego, TypeScript). Si lo hay, Vite con base
  relativa.

Añade el proyecto a `.github/workflows/publicar-juego.yml` (su ruta en `paths`, sus pruebas y
su copia en «Montar el sitio») y a la tabla del `CLAUDE.md` de la raíz.

## 4. Primera versión jugable

Construye una función de `funciones.json` cada vez. Después de cada una:

1. `npm test`.
2. `node herramientas/capturar.mjs <carpeta> --pasos "..."` recorriendo lo nuevo, y mira las
   capturas.
3. Marca `hecha: true` solo si las dos cosas salen bien, y haz commit.

Con la primera tanda hecha, pide al agente `probador` una revisión contra `DISENO.md`, arregla
lo grave y dale al autor el enlace de Pages (o las instrucciones para abrirlo) y el informe.
