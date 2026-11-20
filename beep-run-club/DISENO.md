# Beep Run Club: Diseño

App web instalable (se añade a la pantalla de inicio) para el club de running Beep. El
entrenador escribe el plan de cada atleta y lo cambia cuando quiere; el atleta lo ve, lo hace y
le cuenta cómo le fue.

## Brief

- **Promesa:** «Abro la app y sé qué me toca hoy; al terminar, en 20 segundos le digo a mi
  entrenador cómo me ha ido».
- **Para quién:**
  - **Atleta:** paga un plan personalizado. Usa el móvil, a veces sin cobertura, y entra con
    el código que le da el entrenador.
  - **Entrenador:** lleva varios atletas, edita desde el móvil o el portátil y quiere ver de
    un vistazo quién lo pasó mal.
- **Qué se repite:** la semana. El atleta abre la sesión del día, la hace y la valora. El
  entrenador revisa las novedades y ajusta la semana siguiente.
- **Tono:** el de la marca, cercano y con humor, nunca de gimnasio militar.

## Lo que hace el atleta

1. **Entra** con su enlace o tecleando su código (por ejemplo `LAURA-7K3QX`).
   - La sesión queda iniciada hasta que la cierre o entre con otro código.
   - Si entra con otro código, se le pregunta: «¿Seguro que quieres cerrar la sesión anterior
     para entrar en esta nueva?».
   - Si el código está desactivado, ve un aviso para hablar con su entrenador y se cierra la
     sesión.
2. **Ve su semana:** de lunes a domingo, con hoy resaltado, y puede moverse entre semanas.
3. **Abre una sesión:** los ejercicios en orden, cada uno con su detalle y la nota del
   entrenador. Marca cada ejercicio como hecho.
4. **En los ejercicios de carrera** (los marca el entrenador) puede apuntar, si quiere, la
   distancia, el tiempo y el ritmo. Con dos de ellos se calcula el tercero.
5. **Al terminar** indica:
   - el esfuerzo de la sesión, del 1 al 10, con etiquetas (1 muy fácil … 10 al máximo);
   - si ha hecho toda la sesión o solo una parte (y cuál), para que valorar rápido no le diga
     al entrenador «0 hechos»;
   - qué ejercicios le resultaron demasiado duros;
   - un comentario opcional.

   Puede corregirlo después: lo que marque después de valorar se guarda solo. Sin cobertura se
   guarda en el móvil y se envía al volver la conexión.
6. **Opcional (fase 4):** en los ejercicios de carrera, sube una captura de Strava y la app
   rellena la distancia, el tiempo y el ritmo. El atleta los revisa antes de guardar. La captura
   no sale del móvil.

## Lo que hace el entrenador

Entra en un panel aparte (`/beep-run-club/entrenador/`) con su email y contraseña.

1. **Atletas:**
   - Darlos de alta con un nombre. El código se genera solo y el enlace se copia para
     mandarlo.
   - Activar y desactivar el código, y ver en cuántos móviles se ha usado.
2. **Plan:** por atleta y por semana.
   - Sesiones con su fecha, título y nota.
   - Ejercicios con nombre, detalle (por ejemplo «6 × 400 m a ritmo de 5 km, recuperación
     90 s»), nota y la casilla «de carrera».
   - Al escribir, autocompleta con los ejercicios que ya ha usado.
   - Copiar una semana a la siguiente, y una sesión a otro atleta.
3. **Novedades:**
   - Las valoraciones recientes de todos los atletas.
   - Resaltadas las de esfuerzo 9 o 10 y las que marcan algún ejercicio demasiado duro.
   - El historial de cada atleta.
4. **Baja de un atleta:** el código se desactiva al momento. El entrenador elige entre
   archivarlo (los datos se quedan, ocultos) o descargar su historial en un archivo y borrarlo
   de la nube.

## Decisiones cerradas

- (2026-11-19) **Panel propio del entrenador dentro de la app, con los datos en Firebase:** lo
  eligió el autor frente a la hoja de Google. Firebase y no Supabase porque el plan gratuito de
  Supabase pausa los proyectos inactivos (inferencia, confianza media) y Firebase no.
- (2026-11-19) **Acceso del atleta con código o enlace, sin contraseña.**
  - El código es desactivable.
  - La sesión persiste hasta cerrarla o cambiar de código, con confirmación al cambiar.
  - Cada móvil queda registrado al entrar, para poder limitar más adelante el número de
    móviles por código sin rehacer nada.
- (2026-11-19) **v1 del atleta:** ver el plan, marcar ejercicios, esfuerzo del 1 al 10,
  ejercicios demasiado duros, comentario, y la distancia, el tiempo y el ritmo opcionales.
- (2026-11-19) **Una sola casilla «de carrera» por ejercicio:** activa los campos de distancia,
  tiempo y ritmo y, en la fase 4, el reconocimiento de capturas. No tiene sentido en un
  *skipping* (autor).
- (2026-11-19) **Esfuerzo como RPE del 1 al 10:** es la escala habitual en entrenamiento y
  permite al entrenador calcular la carga (esfuerzo × minutos) si un día lo quiere.
- (2026-11-19) **Capturas de Strava reconocidas en el propio móvil** (Tesseract.js, licencia
  Apache-2.0, descarga de unos pocos MB solo la primera vez que se usa). Ni servidor, ni coste,
  ni la captura sube a ningún sitio. Es opcional y va en la última fase.
- (2026-11-19) **Se publica en este repositorio**, en `/beep-run-club/`. Se puede pasar a un
  dominio propio más adelante.
- (2026-11-19) **Privacidad:**
  - Del atleta solo se guarda el nombre que ponga el entrenador, sin email ni teléfono.
  - Los datos se guardan en servidores de la UE.
  - La app incluye un aviso breve de privacidad.
  - La baja permite borrar todo.

## Decisiones abiertas

No se diseñan sin el autor.

- **Límite de móviles por código:** cuántos y qué pasa al superarlo. Más adelante.

- (2026-11-19) **Android e iPhone:** web instalable con manifest e iconos para los dos (autor).
- (2026-11-19) **Modo noche** automático, o fijado a mano en Ajustes (autor).
- (2026-11-19) **«Beep» bajo el icono, y el logo vectorizado de las imágenes**, que son el
  original (autor).
- (2026-11-19) **Firebase en la cuenta del entrenador:** el autor ya se la ha pedido.
- (2026-11-19) **Los temas legales (parecido de la marca y protección de datos)** son cosa del
  club. El autor ya se lo advirtió.

## Fuera de la v1

- Notificaciones push: en iPhone exigen un servidor de pago (Firebase Blaze).
- Sincronizar con Strava o Garmin por su API: necesita un servidor y registrar la app con ellos.
- Planes de grupo compartidos: de momento se copia la sesión de un atleta a otro.
- Chat, pagos y estadísticas avanzadas.

## Fases

1. **Atleta en modo demo:** toda la experiencia del atleta, con datos de ejemplo guardados en el
   móvil. Se puede probar sin Firebase.
2. **Panel del entrenador en modo demo.**
3. **Nube:** Firebase, reglas de seguridad, guía de puesta en marcha y publicación.
4. **Opcional:** el reconocimiento de capturas de Strava.

## Criterios de calidad

- **Uso:** el atleta encuentra la sesión de hoy y la valora sin instrucciones. El entrenador
  crea una semana en menos de 5 minutos. Lo puntúa el agente `probador`.
- **Marca:** los colores, las fuentes y el logo de la guía de marca, sin inventar otros. Ver
  `ARTE.md`.
- **Robustez:** funciona sin cobertura y no pierde ninguna valoración.
- **Seguridad:** sin el código no se ve nada, y un atleta no ve el plan de otro. Lo demuestran
  las pruebas de las reglas.
