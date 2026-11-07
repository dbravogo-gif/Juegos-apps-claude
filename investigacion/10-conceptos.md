# 10 · Tres conceptos para el juego 3D

> **Decisión del autor (2026-11-07): ninguno de los tres.** Quedan como referencia. Se
> propusieron sin preguntar antes por sus gustos; ver `APRENDIDO.md` y el paso 0 de
> `/nuevo-proyecto`.

Propuestos el 2026-11-07 con los 8 criterios de `07-arte-y-concepto.md`. Las restricciones de
partida:

- iPhone 16 con Safari y control táctil.
- Plan Pro.
- Unas 7 horas a la semana del autor para probar.
- Sin dinero.
- Arte generado por código.

## Una decisión de fondo común a los tres: mundo en miniatura, no mundo abierto

Inferencia mía, a partir de la investigación. Un diorama (un mundo pequeño visto desde arriba,
con cámara que gira y hace zoom) es mucho más fácil de hacer bonito y rápido en un móvil que un
mundo abierto en tercera persona, por varias razones:

- **Menos piezas** que trabajar y menos llamadas de dibujo.
- **La cámara no choca con paredes,** que es uno de los problemas más difíciles de los 3C.
- **Se juega tocando y arrastrando,** sin mandos virtuales, que en móvil suelen ir mal.
- **El estilo encaja:** la receta de Bruno Simon (paleta, sombras de color, niebla) brilla en
  mundos pequeños, y la profundidad de campo da el efecto de miniatura.

## 1. Brasa (recomendado)

- **Pitch:** una isla en miniatura empieza a arder. Con el dedo abres cortafuegos y diriges el
  agua antes de que el fuego llegue al pueblo. Cada día, una isla y un viento nuevos.
- **Verbo:** marcar. Tocar para talar un cortafuegos, arrastrar para soltar agua desde una
  avioneta que tiene que recargar.
- **Cada 5 a 30 s:** leer el viento, decidir dónde cortar y ver avanzar el frente.
- **Cada 1 a 5 min:** el viento cambia, aparecen rachas y pavesas que abren focos nuevos, y cae
  la noche.
- **Presión:** el fuego avanza por una simulación determinista con viento, pendiente y humedad.
  Los cortes y el agua son limitados. Hay que sacrificar zonas para salvar otras.
- **Por qué se verá bien:**
  - Árboles instanciados que se mueven con el viento.
  - Brasas emisivas con *bloom* solo en el fuego.
  - Humo y suelo que se oscurece al quemarse.
  - De noche, el frente de fuego ilumina la isla, lo que da imágenes muy reconocibles en un clip.
- **Encaja con Claude:**
  - Una simulación determinista se comprueba con bots sin depender de las horas del autor.
  - Las islas son procedurales.
- **Volver a jugar:** la isla del día, igual para todos; se puede comparar con amigos.
- **Riesgos:**
  - Que el fuego parezca azar. Mitigación: flecha de viento visible y un «pronóstico» del
    avance.
  - El coste del humo en móvil, que tiene presupuesto.
  - El tono, porque los incendios son reales. Se enfoca como un juego heroico de salvar.

## 2. Rebaño

- **Pitch:** eres el perro pastor. Arrastras el dedo para mover al perro, y las ovejas huyen de
  él como un rebaño de verdad: tienen que entrar en el corral antes de que caiga la noche.
- **Verbo:** moverse. El rebaño reacciona con comportamiento de bandada, que es emergente.
- **Presión:**
  - El tiempo hasta la noche.
  - Las ovejas que se dispersan.
  - Ríos y barrancos.
  - Lobos al anochecer.
- **Decisiones:** el ángulo de acercamiento, dividir o juntar el rebaño, cuándo arriesgar.
- **Por qué se verá bien:** prados ondulados con hierba al viento, ovejas mullidas instanciadas
  y un atardecer cálido. Es simpático y se lee muy bien en un clip.
- **Riesgo principal:** la gracia depende de la sensación del movimiento, que Claude no puede
  sentir. Harían falta más rondas de prueba del autor.

## 3. Faro

- **Pitch:** eres el farero en una noche de tormenta. Con un dedo mueves el haz de luz para que
  cada barco encuentre el paso entre las rocas.
- **Verbo:** apuntar la luz.
- **Presión:**
  - Varios barcos a la vez.
  - Rocas que solo se ven con la luz o con los relámpagos.
  - El aceite se gasta, y más rápido con el haz ancho.
  - La tormenta crece.
- **Por qué se verá bien:** el haz de luz, la lluvia, las olas estilizadas y los relámpagos que lo
  iluminan todo.
- **Riesgos:**
  - Un solo verbo puede cansar al cabo de unas partidas.
  - Una escena nocturna tiende a usar la oscuridad en lugar de geometría, que es un fallo
    automático de la rúbrica.
  - El agua en móvil.

## Comparación

| Criterio | Brasa | Rebaño | Faro |
| --- | --- | --- | --- |
| Pitch en una frase | Sí | Sí | Sí |
| Se entiende en un clip de 10 s | Bien | Muy bien | Muy bien |
| Un verbo con profundidad | Mucha (estrategia) | Buena (emergente) | Poca |
| Encaja con lo que Claude hace bien | Muy bien (simulación) | Bien (bandada) | Bien |
| Móvil y sin inversión | Bien | Bien | Muy bien |
| Partidas cortas y motivo para volver | Isla diaria | Prado diario | Tormenta diaria |
| Presión real | Mucha | Media | Media |
| Riesgo principal | Que se lea como azar | Depende de la sensación | Poca profundidad |

**Recomendación: Brasa.** Es el más interesante (decisiones de verdad), el más espectacular con
nuestra receta visual y el más fácil de verificar con bots, que es lo que necesitamos con 7
horas a la semana de pruebas. La segunda opción es Rebaño.
