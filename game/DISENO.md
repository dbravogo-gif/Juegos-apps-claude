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

### Actividades del juego (talar, cocinar, combates opcionales)

Solo se desbloquean si ese día el entreno **o** la comida alcanzan el 85 %, y en conjunto no
pueden aportar más del **30 %** de lo ganado ese día con actividad real. Sin actividad real
registrada no hay extras.

## Niveles

`XP para pasar de n a n+1 = 180 × n^1,25`, redondeado a decenas.

Con una constancia buena (~190 XP/día): nivel 2 el primer día, nivel 5 a las 2 semanas,
nivel 10 a los ~2 meses, nivel 15 a los ~7 meses.

## Pendiente de decidir

- Umbral de extras: con 85 % un perfil principiante que cumple al 80 % no accede nunca a las
  actividades del juego. Ver `tools/simular.js`.
- Dónde caen exactamente los desbloqueos de RPG y construcción por nivel.
- Exenciones de entreno (6 al año × 3 días): falta la capa que las administra.
- Índice de rendimiento (progresión personal), separado de la XP de constancia.

## Comprobar

```
npm test              # motor de puntuación y economía, incluidos casos de explotación
node tools/simular.js # balance a 12 semanas con tres perfiles
```
