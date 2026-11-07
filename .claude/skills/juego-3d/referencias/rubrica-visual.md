# Rúbrica visual de juegos 3D

Adaptada de *threejs-game-skills* (Majid Manzarpour, licencia MIT).

- Se puntúan capturas **en partida activa**, no la pantalla de título.
- En móvil (390 × 844) y en escritorio.
- La puntúa el `probador`, no quien construyó.

**Escala:** 0, marcador de posición · 1, estilizado básico · 2, estilizado premium ·
3, escaparate.

| Categoría | 1 | 2 | 3 |
| --- | --- | --- | --- |
| Dirección de arte | El tema es solo color y niebla | El tema manda en formas, materiales, interfaz, mundo y respuesta | Identidad propia en cada superficie |
| Protagonista | Objeto básico con brillo | Silueta trabajada, detalles y señales de estado | Modelo memorable con respuesta expresiva |
| Obstáculos y enemigos | Cuesta distinguir sus papeles | Formas por papel, avisos y materiales legibles | Familia variada con anticipación |
| Recompensas e interactivos | Respuesta genérica o ausente | Formas propias, estados legibles y respuesta en la interfaz | Su valor se entiende incluso en movimiento |
| Mundo | Tema reconocible, pero vacío y repetido | Kit de piezas, primer plano, plano medio y fondo, referencias de escala | Mundo denso que ayuda a leer el juego |
| Materiales | Rugosidad y metal básicos, o solo emisivo | Papeles de material compartidos, detalles y desgaste | Lenguaje de materiales rico y medido |
| Luz y render | La niebla y el brillo son el estilo | Mapeo tonal y exposición pensados, luz clave, de relleno y de contorno, contacto y profundidad | Cinematográfico pero legible |
| Efectos y movimiento | Partículas y estelas genéricas | Efectos por evento: recoger, golpe, fallo, combo… | Efectos que aclaran el juego y salen baratos |
| Interfaz | Tarjetas de datos genéricas | Estados del género, iconos y texto que cabe | Coherente, con jerarquía clara y transiciones |
| Rendimiento | «Parece que va bien» | Contadores del render, capturas y notas de presupuesto | Antes y después medidos, con el cuello de botella identificado |

**Antes de puntuar**, cada categoría se traduce al género. Por ejemplo, en un puzle,
«enemigos» son las restricciones. No se inventan enemigos ni adornos para subir la nota.

## Umbrales

- **Premium:** ninguna categoría por debajo de 2 y media de al menos 2,3.
- **Escaparate:** ninguna por debajo de 2, al menos seis con 3 y media de al menos 2,7.
- **Nuestro listón** es alcanzable y del estilo elegido en `ARTE.md`.

## Fallos automáticos

Si se da alguno, no es premium aunque las notas digan lo contrario:

- La captura en partida está dominada por formas sin trabajar o por un vacío que el diseño no
  justifica.
- El protagonista es un primitivo con brillo, o papeles distintos no se distinguen.
- La interfaz está hecha de tarjetas rectangulares de datos.
- La niebla, la oscuridad, el brillo o las partículas tapan geometría que falta.
- La interfaz tapa el camino de juego, corta texto o invade las zonas seguras.
- No se puede jugar con entrada real, o no hay captura en partida.
- No hay contadores de render después de un cambio gráfico grande.

## Señales medidas

Son orientativas. Se miden cuando `capturar.mjs` las calcule.

| Señal | Indica |
| --- | --- |
| Entropía de color por debajo de 3 bits, o un color que ocupa más del 60 % | Escena pobre |
| Densidad de bordes por debajo de 0,04 | Dominan los primitivos o el vacío |
| Contraste de luminancia por debajo de 60 | La niebla o la oscuridad aplanan la imagen |

No se añade ruido ni partículas para subir una métrica. Una composición limpia e intencionada
puede medir bajo.
