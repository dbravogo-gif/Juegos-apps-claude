# Six-seven islands: Diseño

Entrevista del 2026-11-07. Se queda en el qué y el porqué; el cómo está en `ARCHITECTURE.md`.

**Vocabulario:** una **especie** es una línea evolutiva entera; una **criatura** es cada forma.

## Brief

- **Promesa, en una frase:** recorre un archipiélago de juguete capturando y criando criaturas,
  y compártelo con tus amigos: os cruzáis por las islas, os retáis y os unís contra los rivales
  más duros.
- **Sensación buscada:**
  - La intriga de qué saldrá de la hierba.
  - El apego al propio equipo.
  - El orgullo de vencer a un campeón.
  - Con amigos, una rivalidad sana.
- **Verbo principal:** capturar y combatir por turnos.
- **Verbos secundarios:** explorar, formar equipo, evolucionar y, online, intercambiar.
- **Cada 5 a 30 segundos, el jugador:** anda por la isla, cruza hierba alta, le salta un
  encuentro, elige un movimiento o lanza la captura con el dedo.
- **Cada 1 a 5 minutos, cambia:** acaba un combate (experiencia, nivel, una captura), aparece un
  entrenador, se abre una zona, se cumple un recado o evoluciona una criatura.
- **Cómo pierde, aprende y lo vuelve a intentar:**
  - Si caen todas sus criaturas, despierta en el último refugio con el equipo curado y un 10 %
    menos de dinero. Conserva capturas y progreso.
  - Aprende la tabla de tipos y a llevar un equipo variado.
  - El entrenador que le ganó sigue esperándole.
- **Qué se premia:** un equipo equilibrado por tipos, buscar criaturas de buena Valía y apuntar
  bien al capturar.
- **Qué crea riesgo:** alejarse del refugio con el equipo herido y pocas curas. Por eso la
  economía es ajustada.
- **Qué hace distinto a un jugador mejor:**
  - Domina los tipos y elige bien los movimientos.
  - Administra las curas.
  - Apunta mejor al lanzar.
  - Caza las criaturas casi perfectas que se ven en la hierba.
- **Qué decisión viene después:** a quién llevar en el equipo, a quién evolucionar, a dónde ir y
  qué comprar.

## Contrato del bucle

El jugador **explora la isla y combate por turnos** para **capturar criaturas, hacer crecer su
equipo y vencer al campeón** mientras **las criaturas salvajes y los entrenadores desgastan su
equipo lejos del refugio**. El éxito da **criaturas nuevas, experiencia, evoluciones, dinero y
la zona siguiente**. El fallo **le devuelve al refugio con menos dinero**.

**Cómo se demuestra cada parte en el juego:**

- **Entrada real:**
  - Para moverse, un joystick flotante con el dedo, o WASD y las flechas.
  - En combate, botones grandes.
  - Para capturar, deslizar el dedo o arrastrar el ratón.
- **Objetivo visible:** la cámara de diorama deja ver el camino y, a lo lejos, el faro de la
  ciudad del campeón.
- **Presión en el primer minuto:** el primer combate, contra el amigo rival nada más elegir la
  inicial, y después la hierba alta a la salida del pueblo.
- **Recompensa que cambia el estado:** la criatura capturada entra en el equipo, y al subir de
  nivel suben sus estadísticas.
- **Reintento:** la derrota lleva al refugio, y el combate se puede repetir.

## El juego completo

- **Mundo:**
  - Un archipiélago de 6 islas, cada una con su clima y su campeón.
  - Una séptima isla secreta, desaparecida, que se descubre siguiendo el hilo del misterio.
    Reaparece al final y en ella está la Liga.
- **Tono de la historia:** ligero y con humor. Se vence al campeón de cada isla para avanzar,
  mientras se investiga por qué desapareció la séptima.
- **Contenido:**
  - 200 criaturas.
  - Líneas de 2 y de 3 formas, algunas ramificadas (una base que evoluciona de varias maneras),
    y especies sin evolución.
  - Las terceras formas, más fuertes, aparecen tarde.
- **Tipos:** los 15 de Leyendas de Iberia con su tabla de eficacias, tal cual. Son obra del
  autor (`leyendas-de-iberia/src/data/tipos.ts`).
- **Más largo que Leyendas de Iberia.** Entre un campeón y el siguiente hay mucho más: rutas,
  entrenadores, recados, tramos de historia y salas del equipo enemigo.
- **Sesiones abiertas:** se juega todo el tiempo que se quiera, con guardado automático
  continuo. Safari puede cerrar la pestaña en cualquier momento.

### Las tres historias

- Al empezar se cuentan las historias de las tres criaturas iniciales, y el jugador elige con
  cuál se identifica.
- La elección fija la **variante** de la partida. Cambian:
  - la historia y los uniformes del equipo enemigo, desde el principio;
  - y, más adelante, 2 salas pequeñas exclusivas.

  Todo lo demás es común.
- **Las iniciales:** Agua, Planta e Infernal, todas con líneas de 3 formas. En la tabla forman
  un triángulo perfecto: cada una vence a otra y resiste a la tercera.
- **Las otras dos iniciales se consiguen intercambiando con amigos.**
- **Regalo por rejugar:** si ya has completado el juego con una inicial y empiezas otra partida
  con otra, al vencer al campeón de la isla 4 te regalan la inicial con la que lo completaste.
  - El registro de partidas completadas se guarda aparte de la partida, para que sobreviva al
    empezar una nueva.
  - El momento de la isla 4 es una propuesta de Claude para lo que pediste como «un nivel medio
    alto».

### Combate

- **Por turnos, al estilo clásico:** 4 movimientos, cambiar de criatura, usar un objeto o huir
  (solo contra salvajes).
- **El motor admite 1 contra 1 y 2 contra 2 desde el principio.** El cooperativo online lo
  necesitará.
- **Reglas:** de Leyendas de Iberia, obra del autor, solo se toman reglas, nunca contenido
  (indicación del autor, 2026-11-07):
  - estadísticas con Valía (de 1 a 14) y temperamento;
  - las fórmulas de daño y captura;
  - PP, etapas, proteger y retroceso;
  - los estados quemado, dormido, paralizado, envenenado e intoxicado.
- **Las pasivas** quedan para más adelante, como contenido propio de este juego.
- **Captura:**
  - Tras debilitar a la criatura, se lanza el objeto deslizando el dedo o arrastrando el ratón.
  - La puntería y el momento suben la probabilidad. La base depende de la Vida que le quede, de
    su estado y del objeto.

### Encuentros

- Todas las criaturas salvajes salen por sorpresa al cruzar la hierba alta, como en los juegos
  clásicos del género. Cada zona tiene su tabla de aparición.
- **Excepción, las criaturas visibles:** al entrar en un parche de hierba alta hay un 2,5 % de
  probabilidad (1 de cada 40, de media) de que camine por él una criatura que se ve, con un
  brillo sutil.
  - Siempre es una de las especies fuertes de la zona, al nivel más alto de la zona, y con
    Valía 13 o 14: estadísticas al 90 % o más.
  - Cada parche se sortea una vez por visita a la zona: salir y volver a entrar no repite el
    sorteo.
  - Online, cada jugador ve las suyas.

### Personaje y nombres

- **Personaje:** personalización básica (cuerpo, piel, pelo y colores de la ropa), generada por
  código. Basta para reconocer a cada amigo.
- **Nombres de criaturas:**
  - La mayoría, inventados con raíces en inglés o japonés. Ejemplo del autor: a un pato no se le
    llama «Patil», sino «Duckil».
  - Algunos, pocos, son juegos de palabras en español.
  - Ninguno debe recordar a una criatura de otra obra (R8). Cada nombre se comprueba antes de
    fijarlo.

### Con amigos, en fases posteriores

1. **Presencia:** ves a los amigos que están en tu misma zona.
2. **Retos 1 contra 1 e intercambios.**
3. **Combates cooperativos 2 contra 2** contra rivales difíciles.

Cada combate es determinista con una semilla compartida: solo viajan las decisiones de cada
turno. El servicio de tiempo real gratuito se elige al llegar a esa fase.

## Primera versión: la isla 1, para un jugador

- **Recorrido:**
  - Presentación de las tres historias y elección de la inicial.
  - Rutas con hierba y entrenadores rivales.
  - Un bosque.
  - Un pueblo con tienda y refugio.
  - La base del equipo enemigo. Es común a las tres variantes; cambian los uniformes y los
    diálogos.
  - La ciudad del campeón, que cierra la versión.
- **Historia con diálogos:** el arranque del misterio de la séptima isla y la primera aparición
  del equipo enemigo.
- **Recados con objetos clave,** del tipo «lleva esto a esta persona».
- **Un combate 2 contra 2** contra una pareja de entrenadores.
- **Tienda y objetos.** La economía, con cuidado: al principio no se consigue nada muy valioso.
- **Criaturas:** 11 especies de la isla y las 3 iniciales, hasta 23 criaturas.
  - 5 especies sin evolución: 5 criaturas.
  - 4 especies de 2 formas: 8 criaturas.
  - 2 especies de 3 formas, solo con las dos primeras: 4 criaturas.
  - 3 iniciales de 3 formas, solo con las dos primeras: 6 criaturas.
  - No entran las terceras formas ni las evoluciones que se alcanzan por encima del nivel de la
    isla 1. Con ellas, las especies de la isla 1 sumarían 28 criaturas.

### Fuera de la primera versión

- Todo lo online: presencia, retos, cooperativo 2 contra 2 e intercambios.
- Las islas 2 a 7.
- Las terceras formas, las evoluciones tardías y las ramificadas.
- Las salas exclusivas de cada variante.
- El regalo de la inicial al rejugar: hace falta completar el juego.
- La personalización amplia del personaje.

## Plan de nivel de la isla 1

- **Formato espacial:**
  - La isla en miniatura se divide en zonas conectadas: el pueblo inicial, la ruta 1, el
    bosque, el pueblo 2, la ruta costera, la base del equipo enemigo y la ciudad del campeón.
  - La cámara, alta e inclinada, sigue al jugador. Se ve su zona y, al fondo, el mar con las
    otras islas.
- **Inicio:** la casa del jugador, las tres historias, la elección de la inicial y el primer
  combate contra el amigo rival.
- **Primera amenaza:** la hierba alta de la ruta 1.
- **Primera recompensa:** la primera captura. Se reciben unos pocos objetos de captura.
- **Puntos de referencia:** el faro de la ciudad del campeón, el volcán de la isla vecina y el
  remolino donde estaba la séptima isla.
- **Escalada:**
  - Los niveles de las salvajes suben por zona.
  - Los entrenadores llevan equipos cada vez más variados.
  - Después vienen la sala del equipo enemigo, el combate 2 contra 2 y, por último, el campeón.
- **Respiro:** los refugios, con curación gratuita, los pueblos y los recados.
- **Aviso de peligro:**
  - La hierba alta se distingue por su color y su altura.
  - Los entrenadores muestran su línea de visión, y una exclamación cuando te ven.
- **Piezas modulares:**
  - Un terreno por casillas con alturas.
  - Hierba instanciada.
  - Casas, árboles y rocas hechos con un kit parametrizado.

## Decisiones cerradas

- 2026-11-07 · Concepto A, con amigos y por fases (`investigacion/11-conceptos-criaturas.md`).
- 2026-11-07 · Nombre: Six-seven islands.
- 2026-11-07 · Mundo: un archipiélago de 6 islas y una séptima secreta, que reaparece al final
  con la Liga.
- 2026-11-07 · Estilo visual: diorama de juguete (`ARTE.md`).
- 2026-11-07 · 200 criaturas, con evoluciones de 2 y 3 formas, algunas ramificadas, y especies
  sin evolución.
- 2026-11-07 · Los 15 tipos y la tabla de Leyendas de Iberia.
- 2026-11-07 · Combate por turnos clásico. El motor admite 2 contra 2.
- 2026-11-07 · Captura: lanzar deslizando el dedo o arrastrando el ratón.
- 2026-11-07 · Derrota: vuelta al refugio, con el 10 % menos de dinero.
- 2026-11-07 · Equipo de 6 criaturas.
- 2026-11-07 · Encuentros por sorpresa en la hierba. Las únicas que se ven aparecen en 1 de
  cada 40 parches de media: fuertes y con Valía 13 o 14.
- 2026-11-07 · Tres historias de inicio, con Agua, Planta e Infernal. Cambian la historia y
  los uniformes del equipo enemigo; las 2 salas exclusivas por variante llegan más tarde.
- 2026-11-07 · Las otras iniciales, por intercambio, y de regalo al rejugar con otra.
- 2026-11-07 · Personalización básica del personaje.
- 2026-11-07 · Nombres: casi todos inventados, con raíces en inglés o japonés, y pocos juegos de
  palabras.
- 2026-11-07 · Primera versión: la isla 1 para un jugador, con el contenido de arriba. Unas
  2 horas de juego.
- 2026-11-07 · Más largo que Leyendas de Iberia: más contenido entre campeones.
- 2026-11-07 · Sesiones abiertas con guardado automático.
- 2026-11-07 · Empate en combate (caen a la vez las últimas de los dos lados): gana el lado
  cuya última criatura cayó después, como con el daño de retroceso en el género.

- 2026-11-08 · Línea de la inicial de Planta: una bestia del bosque, ciervo-león con astas de
  madera, collar de hojas y cola de hoja. Tres formas: cría, joven (forma 2) y majestuosa
  (forma 3). Las imágenes de las formas 2 y 3 las generó el autor; prompts y notas en
  `prompts-meshy.md`. En esta especie no hay diferencias entre hembra y macho.

## Decisiones abiertas

No se diseñan sin el autor. Cada una lleva la propuesta de Claude.

- **Nombres:** del equipo enemigo (uno por variante), de las islas, de los personajes y de las
  criaturas. Claude los propone antes de la tanda 3.
- **Formato de la Liga.**
- **Servicio de tiempo real** para la fase online.
- **Método de arte de las criaturas (prueba F04).** El autor vio la primera versión del
  generador por piezas (2026-11-07) y la juzga insuficiente: quiere criaturas «mucho más
  curradas», al nivel de Pokémon. El estilo de `ARTE.md` («redondas y blandas», cuerpos de
  revolución) se queda corto frente a lo que imagina. Opciones y datos en
  `investigacion/12-arte-criaturas.md`. Propuesta de Claude: comparar en la misma vitrina una
  criatura del generador esculpido (0 €) con 2 o 3 hechas con IA 3D en el plan gratis de
  Meshy, y decidir en el iPhone del autor.
  - Revisión del `probador` (2026-11-07): media de la rúbrica 1,5 sobre 3 (no premium).
    Recomienda seguir con el generador; el riesgo que ve es la variedad entre 200 (misma cara,
    tripa y patas; «anguloso» no cambia el cuerpo). Condición: una hoja de 10 a 12 criaturas
    variadas, con una tercera forma, antes de hacer contenido.
  - **El autor elige probar Meshy** (2026-11-07): quiere criaturas bonitas y algunas épicas;
    acepta un gasto pequeño si hace falta. Tres criaturas de prueba (épica, débil y neutra);
    prompts y pasos en `prompts-meshy.md`. También mira los paquetes de Quaternius.
  - Fallos locales que solo importan si el generador sigue: al debilitarse se hunde en el
    suelo, los ojos cerrados parecen tajos, las mejillas salen caqui en los tipos verdes,
    faltan el bloom y el tilt-shift, tres parejas de tipos se confunden por color y «luz» se ve
    oliva, y un 2 contra 2 de segundas formas pasaría de 40 llamadas.

## Criterios de calidad

- **Jugabilidad:** funciona, se entiende y se siente bien. La puntúa el agente `probador`.
- **Visual:** la rúbrica de la skill `juego-3d`. Premium: ninguna categoría por debajo de 2 y
  media de al menos 2,3.
- **Rendimiento:** el presupuesto de la skill `juego-3d`, medido con contadores y en el móvil
  del autor.
- **Online:** un combate repetido con la misma semilla y las mismas decisiones da exactamente el
  mismo resultado. Lo comprueba una prueba.
