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

Pesos: principal 3, secundario 2, opcional 0. Los opcionales se pueden registrar para tener
la rutina entera, pero ni suman ni restan.

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

Cualitativo, sin cantidades. Cada comida es `completo` (1), `excepcion_menor` (0,9) o
`incumplido` (0). La puntuación del día es la media de las comidas **no exentas**.

La excepción menor puntúa 0,9 y no 1 para que la distinción signifique algo, pero queda por
encima de todos los umbrales: un postre pequeño no arruina el día.

Exenciones: **2 comidas por semana natural** (lunes a domingo). Una comida exenta se excluye
del cálculo en lugar de puntuar cero.

## Rachas

Ventana móvil de 7 días. Cada día se clasifica como:

- **cumplido**: entreno ≥ 75 % o comida ≥ 70 %
- **no exigido**: descanso planificado, exención, o sesión adaptada por completo
- **fallado**: por debajo del umbral, o sin registro

La racha sigue viva si en la ventana hay **como mucho 1 día fallado** y **al menos 1-2 días
cumplidos**. Los días no exigidos no consumen el margen de fallo.

El mínimo de cumplidos existe para cerrar un agujero: sin él, marcar todos los días como
descanso planificado mantendría la racha —y su bonus— sin haber entrenado nunca.

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

`XP para pasar de n a n+1 = 180 × n^1,25`, redondeado a decenas.

Con una constancia buena (~190 XP/día): nivel 2 el primer día, nivel 5 a las 2 semanas,
nivel 10 a los ~2 meses, nivel 15 a los ~7 meses.

## Balance a 12 semanas

Salida de `tools/simular.js`, en XP respecto al perfil constante:

| Perfil | XP | Nivel | Multiplicador final |
| --- | --- | --- | --- |
| Constante, 4 sesiones/semana | 100 % | 9 | 1,60 |
| Principiante plano al 80 % | 73 % | 8 | 1,60 |
| Principiante, 3 sesiones/semana | 66 % | 7 | 1,55 |
| Irregular, falla 1 de cada 3 | 51 % | 7 | 1,00 |

El irregular progresa a la mitad de velocidad y pierde el multiplicador entero, pero sigue
avanzando. La distancia se nota más en monedas que en nivel, porque la curva de niveles
comprime las diferencias de XP a medida que sube.

## Pendiente de decidir

- Dónde caen exactamente los desbloqueos de RPG y construcción por nivel.
- Exenciones de entreno (6 al año × 3 días): falta la capa que las administra.
- Índice de rendimiento (progresión personal), separado de la XP de constancia.

## La app

PWA sin paso de build: se sirve la carpeta tal cual y se instala desde el navegador con
«Añadir a pantalla de inicio». Los datos viven en `localStorage` de ese dispositivo, con
copia manual a archivo JSON desde Ajustes.

| Capa | Dónde | Qué hace |
| --- | --- | --- |
| Núcleo | `src/core` | Puntuación, rachas y economía. Sin DOM ni almacenamiento |
| Datos | `src/data` | Persistencia, migraciones y reconstrucción del historial |
| Interfaz | `src/ui` | Cuatro pantallas: Hoy, Registrar, Progreso y Ajustes |

El núcleo no importa nada de las otras dos capas, para que la lógica siga siendo probable
sin navegador y reutilizable si algún día hay servidor o app nativa.

### Reglas contra la explotación

Además del tope de justificados y del mínimo de días cumplidos por ventana:

- Solo se puede registrar **hoy y ayer**. Si no, se podrían rellenar semanas enteras a
  posteriori y reconstruir rachas que nunca ocurrieron.
- Las exenciones de entreno no se pueden pedir con fecha pasada ni solapadas.
- Los días en los que no se abre la app no son huecos: el historial se reconstruye continuo
  y esos días cuentan como fallados si estaban planificados.

## Comprobar

```
npm test                      # motor, datos y casos de explotación
node tools/simular.js         # balance a 12 semanas con cuatro perfiles
python3 -m http.server 8777   # y abrir http://localhost:8777
```
