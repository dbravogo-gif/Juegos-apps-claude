---
name: nuevo-proyecto
description: Empieza un juego o una app nueva desde cero, de la idea a la primera versión jugable publicada. Entrevista al autor, escribe diseño, guía de arte, contrato de arquitectura y lista de funciones, monta el andamiaje y construye una escena representativa comprobada. Para juegos 3D usa también la skill juego-3d.
disable-model-invocation: true
---

Las fases van en orden. No pases a la siguiente sin cerrar la anterior. Al cerrar cada una,
actualiza el `ESTADO.md` del proyecto y el de la raíz.

## 1. Entrevista

Son decisiones del autor (regla R10). Usa la herramienta de preguntas, con opciones cerradas y
tu recomendación primero, hasta poder escribir el diseño sin inventar nada importante:

- Para quién es y en qué dispositivo se juega. Cuánto dura una partida o una sesión.
- La promesa en una frase: qué se siente al jugar.
- El verbo principal. Qué se repite cada 5 a 30 segundos y qué cambia cada 1 a 5 minutos.
- La presión: qué arriesga el jugador, y cómo pierde, aprende y vuelve a empezar.
- El gancho: la única cosa que lo hace distinto. Si no lo hay, propón tres.
- El estilo visual: ofrece 2 o 3 direcciones, cada una con una frase y una paleta.
- Qué queda fuera de la primera versión.

## 2. Documentos

Las plantillas están en `plantillas/`. En la carpeta nueva se escriben:

- **`DISENO.md`:**
  - El brief, el contrato del bucle y el plan de nivel.
  - Las decisiones cerradas y las abiertas.
  - Los criterios de calidad.

  Se queda en el qué y el porqué, no en el cómo.
- **`ARTE.md`:** la guía de estilo. Paleta con nombre, formas por papel, luz, materiales y
  escala.
- **`ARCHITECTURE.md`:** el contrato de los subsistemas: dueño por carpeta, interfaz, eventos y
  reglas duras. Todos los agentes lo leen antes de escribir código.
- **`funciones.json`:** las funciones de principio a fin, ordenadas. Cada una lleva `id`,
  `descripcion`, `como_se_comprueba` y `hecha: false`. La primera tanda es la versión jugable
  mínima. Durante la construcción solo se cambia `hecha`; replantear una función se consulta al
  autor.
- **`ESTADO.md` y un `CLAUDE.md` corto del proyecto** (plantilla `claude-proyecto.md`).

Enséñale los documentos al autor y espera su visto bueno (regla R1).

## 3. Andamiaje

- **Núcleo determinista:** `src/core/`, con generador con semilla y sin DOM ni reloj, y con sus
  pruebas. El contenido va como datos y la interfaz aparte.
- **Ganchos de prueba en `window.__JUEGO__`:**
  - `estado()`: fotograma, puntuación, fase y posición.
  - `semilla(n)`.
  - `poner(estado)`.
- **Panel de depuración** para ajustar en vivo, solo en desarrollo. **Niveles de calidad**:
  móvil y escritorio.
- Si `herramientas/capturar.mjs` aún no da **métricas de imagen** (entropía de color, densidad
  de bordes, contraste) y los **contadores del render** (leídos del gancho), añádeselos ahora.
  Hacen falta para la rúbrica.
- **Web instalable.** Añade el proyecto a `.github/workflows/publicar-juego.yml` y a la tabla del
  `CLAUDE.md` de la raíz.

## 4. Escena representativa

1. **Bucle con formas simples** (*grey-box*): jugable con entrada real, con presión en el primer
   minuto, y con fallo y reintento.
2. **La misma escena con el arte definitivo,** a la escala de cámara real.
3. **Revisión:** el `probador` en modo completo, y el autor la juega con la lista 1–5 de
   `COMO-TRABAJAMOS.md`.

Solo después se multiplican niveles, enemigos o contenido (regla R5).

## 5. Construcción

Una función de `funciones.json` cada vez:

1. Implementarla.
2. `npm test`.
3. Captura con `node herramientas/capturar.mjs`.
4. Marcarla como `hecha`.
5. Commit.

Al cerrar cada tanda, `/cierre`.
