# Diseño del motor de puntuación y economía

Documento de referencia de la capa `src/core`. Todos los números viven en
`src/core/constants.js`; este documento explica **por qué** son así.

## Decisiones cerradas

| Tema | Decisión |
| --- | --- |
| Plataforma | Web instalable (PWA), sin paso de build, mismo patrón de despliegue que Bulk Up |
| Relación con Bulk Up | App separada. Se reutiliza su modelo de ejercicios como referencia, no su código |
| XP y monedas | Separadas. La XP sube de nivel y desbloquea; las monedas compran |
| Reventa | 25 % del precio de compra |
| Dificultad y rankings | Fuera del alcance |
| IA | Fuera del MVP. Registro de comida manual y cualitativo |

## Entrenamiento

Cumplimiento ponderado, sin saltos bruscos:

```
cumplimiento = Σ(peso × factor del estado) / Σ(peso exigido)
```

Solo hay dos importancias: **principal** (pesa 1) y **opcional** (pesa 0). Una intermedia
daba muchas combinaciones con poca diferencia real entre ellas y obligaba a decidir en cada
ejercicio algo que no cambiaba nada.

Los opcionales se registran para seguir la rutina durante el entreno, pero ni suman ni
restan. Si sumaran algo, marcarlo todo como opcional sería la forma fácil de aprobar el día
sin hacer nada.

Se puntúa contra **la rutina entera**, no contra lo que se haya tocado. Un ejercicio sin
marcar se ignora mientras el día sigue abierto —todavía puedes hacerlo— y cuenta como
omitido al cerrarse el día. Sin esa regla bastaría con registrar el ejercicio fácil y dejar
el resto en blanco para firmar un 100 %.

Cada ejercicio se anota serie a serie, con peso y repeticiones, igual que en Bulk Up. El
estado sale de ahí: todas las series hechas es `completado`, algunas es `parcial`, ninguna
es «sin tocar». `sustituido`, `justificado` y `omitido` se marcan a mano, porque no hay
manera de deducirlos de unos números.

La tarjeta de cada ejercicio tiene un **doblés** en la esquina que la gira sobre su eje y
enseña las notas de ese ejercicio (`ejercicio.info`, que se escribe en «Mi rutina»). Las dos
caras comparten celda de rejilla, así que la altura la marca la más alta y no hay que
fijarla a mano. El giro se aplica sobre el nodo, sin repintar: repintando, la tarjeta
nacería ya girada y no habría animación.

Estados y factor: `completado` 1, `sustituido` 1, `parcial` 0.5, `omitido` 0.
`justificado` (molestia, lesión) **se excluye del denominador**: ni suma ni penaliza.

### Tope de justificados

Sin límite, marcar toda la sesión como justificada daría 100 % de cumplimiento haciendo un
solo ejercicio. Por eso solo se absorbe como justificado hasta el **40 % del peso total**; lo
que excede cuenta como omitido y se devuelve en `justificadosExcedidos`.

Cuando alguien excede ese cupo suele ser porque no ha podido entrenar de verdad. La interfaz
debe ofrecerle marcar el día como sesión adaptada o gastar exención, **no** castigarle en
silencio: el principio es no penalizar la salud.

## Alimentación

Cualitativo, sin cantidades. Se planifica la semana por escrito —«lunes, comida: pollo con
arroz y tomate»— y el día solo consiste en decir si se ha cumplido. El planificador vive en
`plan.comidasPorDia`, con el lunes como 0.

Cada comida es `completo` (1), `excepcion_menor` (0,9) o `incumplido` (0). La puntuación del
día es la media de las comidas **no exentas**. Una comida del plan sin marcar se ignora
mientras el día sigue abierto y cuenta como incumplida al cerrarse, por el mismo motivo que
en el entrenamiento.

La lista del día se congela en cuanto se marca algo: cambiar el plan semanal no reescribe
días ya registrados.

La excepción menor puntúa 0,9 y no 1 para que la distinción signifique algo, pero queda por
encima de todos los umbrales: un postre pequeño no arruina el día.

Exenciones: **2 comidas por semana natural** (lunes a domingo). Una comida exenta se excluye
del cálculo en lugar de puntuar cero.

## El día de entrenamiento

No hay días de entreno fijos en el calendario. El plan es un **compromiso semanal**: cuántos
días a la semana entrenas (`plan.diasPorSemana`). Qué día lo haces y con qué rutina se elige
al abrir el día, igual que en Bulk Up.

El día se resuelve en `dias[fecha].sesion`, que guarda el id de la rutina elegida, o:

| Valor | Qué significa |
| --- | --- |
| `descanso` | Hoy no toca. No se exige nada |
| `otra` | Deporte fuera del gimnasio: fútbol, monte, una clase |
| sin valor | Todavía sin decidir |

`otra` existe porque quien no va al gimnasio por jugar al fútbol no debería salir castigado.
No cuenta como sesión —si contara, sería un botón para mantener el bonus sin pisar el
gimnasio— pero tampoco penaliza, y se reconoce con 30 XP fijos, **sin multiplicador**, para
que marcarla no sea una forma de farmear.

## Rachas

Ventana móvil de 7 días. Cada día se clasifica como:

- **cumplido**: entreno ≥ 75 % o comida ≥ 70 %
- **no exigido**: descanso, otra actividad, día sin decidir, exención, o sesión adaptada
- **fallado**: por debajo del umbral, o sin registro de comida

La racha sigue viva si en la ventana hay **como mucho 1 día fallado** y una **cuota de días
cumplidos** que sale del compromiso semanal: con 4 días por semana, la ventana necesita 3.

Esa cuota es lo que sostiene la racha ahora que no hay días fijos. Sin ella bastaría con
marcar descanso —o no marcar nada— para mantenerla sin haber entrenado nunca; y quien deja
de abrir la app la pierde igual, porque su ventana se queda sin cumplidos.

La cuota se escala al tamaño real de la ventana, porque los primeros días del historial
tienen menos de siete: exigir tres sesiones en una ventana de dos días sería imposible y
nadie llegaría a tener racha.

Al romperse, la racha **conserva la mitad** de los días acumulados en lugar de reiniciar a
cero, y se congela hasta que vuelve a estar activa.

### Multiplicador

Aditivo con tope, nunca multiplicativo entre sí:

```
multiplicador = 1 + bonus entreno + bonus comida + bonus combinado
```

Por semanas completas de racha: entreno hasta +0,25; comida hasta +0,20; combinado +0,15 si
ambas llevan al menos una semana. **Máximo 1,60.**

## Recompensas

Base diaria: entreno 100 XP / 50 monedas, comida 40 XP / 20 monedas, escalado por el
cumplimiento y por el multiplicador de rachas.

Un día que alcanza el umbral de cumplido cobra proporcionalmente a su cumplimiento; uno que
se queda por debajo cobra **la mitad**. Así, dejar la sesión a medias cuesta de verdad,
mientras que quien cumple al 80 % —el que empieza y le cuesta— cobra entero.

### Actividades del juego (talar, cocinar, combates opcionales)

En conjunto no pueden aportar más del **30 %** de lo ganado ese día con actividad real, y
se desbloquean por tres vías:

| Vía | Condición |
| --- | --- |
| `excelente` | El día alcanza el 85 % en entreno o en comida |
| `constancia` | El día está cumplido y la racha correspondiente sigue viva |
| `mejora` | El día está cumplido y supera la media reciente propia en 2 puntos o más |

La vía de constancia existe porque quien se estabiliza en un 80 % no supera nunca su propia
media: sin ella, el contenido del juego le quedaría vedado de forma permanente. La de mejora
cubre a quien todavía no tiene racha pero progresa.

Las tres exigen haber hecho las cosas bien ese día, y el suelo nunca baja del umbral de día
cumplido: dejarse ir para rebajar la media no abre nada.

## Niveles

`XP para pasar de n a n+1 = 260 + 180 × n^1,25`, redondeado a decenas.

El suelo de 260 existe porque el primer nivel costaba 180 XP —poco más de un día de
registro— y con él llegaba media zona de golpe. Encarece los primeros niveles sin tocar los
altos: multiplicar la curva entera habría dejado las zonas 2 y 3 fuera de alcance en una
prueba de dos meses.

Con una constancia buena (~190 XP/día): nivel 2 al tercer día, nivel 5 a las 2 semanas y
media, nivel 10 a los ~2 meses y medio.

## Balance a 12 semanas

Salida de `tools/simular.js`, en XP respecto al perfil constante:

| Perfil | XP | Nivel | Multiplicador final |
| --- | --- | --- | --- |
| Constante, 4 sesiones/semana | 100 % | 8 | 1,60 |
| Principiante plano al 80 % | 73 % | 7 | 1,60 |
| Principiante, 3 sesiones/semana | 66 % | 7 | 1,55 |
| Irregular, falla 1 de cada 3 | 51 % | 6 | 1,00 |

El irregular progresa a la mitad de velocidad y pierde el multiplicador entero, pero sigue
avanzando. La distancia se nota más en monedas que en nivel, porque la curva de niveles
comprime las diferencias de XP a medida que sube.

## Progresión y contenido

El nivel abre la **categoría**; las monedas compran las **piezas**. Subir de nivel sin
monedas te deja sitios vacíos que llenar, y ahorrar sin subir de nivel no adelanta el
contenido: las dos vías avanzan de verdad y ninguna anula a la otra.

Del nivel 1 al 10 cae algo casi cada nivel, que es donde se juega la retención; a partir
del 12 se espacia. Todo el calendario vive en `src/data/content.js` y `calendarioDesbloqueos()`
lo recorre.

- **Personaje**: cambia de aspecto en los niveles 1, 5, 10 y 15. Va con el nivel, que sale de
  la constancia, y **nunca con el peso levantado**: atar la imagen del cuerpo al rendimiento
  castigaría a quien se estanca o se lesiona, justo lo contrario de lo que persigue la app.
- **Estadísticas**: solo dos a la vista, fuerza y vida. Empieza con 5 y 20, y cada nivel da
  +1 y +5. La defensa y la energía se derivan de ellas para no llenar la ficha de números.
- **Equipo**: suma a esas dos, pero no se ve encima del personaje. Si se viera, cada
  combinación de arma y armadura necesitaría su propia ilustración. Sube por tramos
  (4, 8, 14, 22, 32, 44 de fuerza) y no doblando: si cada pieza valiera el doble que la
  anterior, comprar sería lo único que importa y subir de nivel dejaría de contar.
- **Mascotas**: solo por hito (rachas largas, jefes). No se compran, así que acumular monedas
  no las acerca.
- **Combates y trabajos**: pagan a través del presupuesto diario de extras, con su tope del
  30 % y su exigencia de día cumplido. Ganar peleas nunca sustituye a entrenar.

### Combate

El combate por turnos usa un generador con semilla (`generador(n)`) para que las partidas
sean reproducibles en los tests sin renunciar al azar en el juego real.

La defensa **quita un porcentaje del golpe**, no una cantidad fija: `daño = ataque × 20 /
(20 + defensa)`. Restándola, el combate era un interruptor —por debajo del umbral no hacías
nada y por encima ganabas siempre— sin peleas reñidas por el medio.

Cubrirse deja pasar el 40 % del golpe y recupera 2 de energía. Atacar ya no la recupera, así
que las habilidades obligan a alternar. Los jefes **avisan** un turno antes de su golpe
fuerte (`combate.avisa`): sin ese aviso, cubrirse sería adivinar.

### Vigor diario

Se puede pelear **2 veces al día**, o 4 si el día está cumplido. Los jefes cuestan dos.
Sin este tope se vacía una zona entera en una tarde, que es exactamente lo que pasaba.

El vigor se gasta **al entrar al combate**, no al ganarlo: si solo costara perder, reintentar
hasta que la tirada saliera bien sería gratis. Vive en `dias[fecha].combates`.

### La parcela

La decoración no es una cuadrícula sino una **escena**. Cada espacio define sus sitios en
cuatro franjas de profundidad; cada sitio tiene su punto del suelo (`x`, `y`) y su `escala`.
El objeto se ancla por la **base**, no por el centro, y el orden de dibujo sale de la propia
altura: lo que está más abajo está más cerca y tapa a lo de atrás.

Con la cuadrícula todo medía igual y quedaba flotando; hacerlo cenital lo habría arreglado
a costa de tirar el estilo frontal y toda la ilustración ya pedida. Esto conserva el dibujo
frontal y resuelve las dos cosas que fallaban: cada objeto se apoya en un suelo de verdad y
cambia de tamaño según lo lejos que esté.

Cada sitio tiene además una **superficie** —pared, suelo o mueble— y solo acepta lo que le
corresponde, que es lo que evita un tapiz tirado en el suelo o un banco colgado del techo.
Sale de la `categoria` que el mueble ya tenía.

Las marcas de sitio libre se dibujan por encima de lo colocado: si no, un mueble de primer
plano dejaría sin tocar el hueco que tiene detrás.

### Ritmo de las zonas

Cada zona cuesta un par de niveles al llegar: sus enemigos normales caen uno o dos niveles
después de abrirla y el jefe tres o cuatro. Una zona que se pasa el día que se abre no
aporta nada, y una que tarda cinco niveles es un muro.

| Zona | Se abre | Normales | Jefe |
| --- | --- | --- | --- |
| Las Murallas | 1 | 2-3 | 5 |
| El Puerto | 5 | 6 | 10 |
| El Gran Bazar | 10 | 13 | 14 |

`tools/simular-combate.js` mide esto de verdad peleando, y dos tests lo fijan.

## Imágenes

`ASSETS.md` lista los archivos exactos, y se regenera con `node tools/assets.js`.
`PROMPT-IMAGENES.md` tiene el prompt de estilo que se le pasa al generador. Mientras
un archivo no existe se ve un marcador de color; al añadirlo con su nombre aparece solo.

## Fuera del alcance

Esto es una prueba del bucle de juego, no el producto final. Quedan fuera a propósito:

- **Más contenido a partir del nivel 20.** Llegar ahí lleva más de un año de constancia; para
  lo que se quiere validar, sobra.
- **Índice de rendimiento** (progresión de carga y volumen, separado de la XP de constancia).
  Exigiría registrar series, repeticiones y kilos, lo que convertiría el registro diario en
  algo mucho más lento, y no alimenta ninguna mecánica. Bulk Up ya recoge esos datos: el sitio
  de esta métrica es la futura conexión entre ambas apps, no un segundo registro aquí.
- **IA para analizar comidas.** El registro es cualitativo y manual.

## La app

PWA sin paso de build: se sirve la carpeta tal cual y se instala desde el navegador con
«Añadir a pantalla de inicio». Los datos viven en `localStorage` de ese dispositivo, con
copia manual a archivo JSON desde Ajustes.

| Capa | Dónde | Qué hace |
| --- | --- | --- |
| Núcleo | `src/core` | Puntuación, rachas y economía. Sin DOM ni almacenamiento |
| Datos | `src/data` | Persistencia, migraciones y reconstrucción del historial |
| Interfaz | `src/ui` | Seis pantallas: Hoy, Entreno, Dieta, Héroe, Mundo y Ajustes |

El núcleo no importa nada de las otras dos capas, para que la lógica siga siendo probable
sin navegador y reutilizable si algún día hay servidor o app nativa.

Entreno y Dieta son secciones separadas, cada una con dos pestañas: el registro del día y
la edición del plan (las rutinas y el menú semanal). Hoy reúne el resumen y el progreso.

En Entreno, el día empieza con un recuadro por rutina más «Descanso» y «Otra actividad»:
se elige y debajo aparece lo que toque. Se pueden crear tantas rutinas como se quiera.

### Recorrido guiado

El héroe hace de profesor y lleva por las secciones en ocho pasos. El guion vive en
`src/data/tutorial.js` como datos, no como código, y cada paso dice a qué sección lleva y
qué resalta.

Lo señalado se busca por `data-guia`, no por selectores de CSS, para que cambiar el aspecto
de una vista no rompa el tutorial en silencio. El foco es un recuadro transparente con una
sombra enorme alrededor: oscurece todo menos lo que se explica, sin recortar nada.

Es corto a propósito: enseña dónde está cada cosa y se detiene solo en lo que nadie adivina
—las rachas y el vigor—, no en todo lo que la app sabe hacer. Sale la primera vez y se
puede repetir desde Ajustes.

### Avisos de progreso

Registrar el día cambiaba la XP en silencio: subías de nivel y no te enterabas. Ahora la
cabecera lleva el nivel y una barra de XP visible desde cualquier sección, y cada ganancia
salta como un aviso flotante abajo a la derecha. Al subir de nivel la barra sube hasta el
tope, destella en verde y sube una flecha.

**La sección de Entreno es la excepción**: ahí no hay barra ni avisos. Es donde más XP se
gana —cada serie marcada suma— así que sería justo la pantalla con más interrupciones, y es
la única que tiene que estar limpia mientras entrenas. Lo ganado no se pierde: se acumula y
se anuncia entero al salir de la sección, con su celebración si hubo subida de nivel.

Cada elemento con acción atiende **un solo evento**: los botones el clic, los `<select>` el
`change` y los campos con `data-directo` el `input`. Un `<select>` que atendiera el clic se
repintaba con el desplegable abierto y se cerraba solo al soltar.

Los campos de texto que se escriben letra a letra van marcados con `data-directo`: se
guardan en cada pulsación **sin repintar**. Repintar mientras alguien escribe destruye el
campo que tiene bajo el dedo y le roba el foco, que es de donde venían los fallos de
«no coge la opción que has marcado».

### Reglas contra la explotación

Además del tope de justificados y del mínimo de días cumplidos por ventana:

- Solo se puede registrar **hoy y ayer**. Si no, se podrían rellenar semanas enteras a
  posteriori y reconstruir rachas que nunca ocurrieron.
- Las exenciones de entreno no se pueden pedir con fecha pasada ni solapadas.
- Un combate perdido gasta vigor igual que uno ganado.
- Se puntúa contra la rutina y el menú completos, no contra lo que se haya marcado.
- Los días en los que no se abre la app no son huecos: el historial se reconstruye continuo
  y esos días cuentan como fallados si estaban planificados.

## Comprobar

```
npm test                      # motor, datos y casos de explotación
node tools/simular.js         # balance a 12 semanas con cuatro perfiles
node tools/simular-combate.js # si cada zona es jugable al llegar a ella
python3 -m http.server 8777   # y abrir http://localhost:8777
```
