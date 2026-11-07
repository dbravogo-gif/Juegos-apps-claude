# Sensación de juego

## Orden de trabajo

Cada capa depende de la anterior.

1. **Latencia:** el verbo principal responde en menos de 100 ms. Sin esto, nada lo arregla.
2. **Curvas de respuesta:** aceleración, frenada, *easing* y rebote del propio movimiento.
3. **Contacto:** en el instante del impacto, destello, *squash and stretch* (aplastar y
   estirar), *hitstop* (congelar la imagen un instante) y sacudida.
4. **Cámara:** sacudida, empujón y cambio de campo de visión. Amplifican el impacto sin tapar
   nada.
5. **Sonido sincronizado:** en el mismo fotograma que la imagen, y con variación de tono para que
   no canse.

**Regla de legibilidad:** la respuesta aclara el estado y nunca tapa la siguiente decisión. Si una
sacudida o un destello oculta lo que hay que esquivar, es un fallo.

## Tabla de partida

Valores de *threejs-game-skills* (licencia MIT); se ajustan jugando. El *trauma* es la intensidad
de la sacudida de cámara, de 0 a 1.

| Evento | Respuesta |
| --- | --- |
| Recoger | «Pop» del objeto, golpe en el contador, tono variado y trauma 0,15 |
| Recibir un golpe | *Hitstop* de 70 ms, trauma 0,4, destello y pulso en la interfaz; vibración solo donde exista (no en iPhone) |
| Eliminar un enemigo | *Hitstop* de 40 ms, trauma 0,3, destello y golpe con tono variado |
| Impulso o carrera | Campo de visión +6°, estirar a 1,15 y silbido |
| Saltar y aterrizar | Estirar al saltar, aplastar a 0,9 al aterrizar, sonido de paso y trauma 0,2 |
| Explosión | *Hitstop* de 90 ms, trauma 0,7, destello blanco y campo de visión +8° |

## Reglas

- **Sacudida:** con curva trauma², con tope y decayendo rápido. Nunca constante.
- ***Hitstop*:** solo en contactos fuertes. Si se pone en todo, el juego parece lento.
- **El verbo principal nunca se bloquea** esperando a que acabe una animación.
- **Aleatoriedad:** la de los efectos también sale del generador con semilla.
- **Tiempos:** los efectos usan el tiempo de juego acumulado; la cámara y las animaciones de
  respuesta, el delta real.
- **Destellos:** un material emisivo con color negro no brilla.
- **Accesibilidad:** con `prefers-reduced-motion`, sin sacudidas ni partículas. Y siempre un
  ajuste para silenciar.

## Personaje, cámara y controles: los 3C

- Se deciden al principio. En 3D son la mitad de la sensación.
- **Cámara:**
  - Sigue un punto un poco **por delante** del personaje, para que se vea hacia dónde va.
  - Nunca atraviesa paredes ni se queda tapada: si algo se interpone, se acerca.
- **Tolerancias de control** (conocimiento previo; son puntos de partida):
  - *Coyote time* de unos 0,1 s: se puede saltar justo después de dejar el borde.
  - Búfer de entrada de 0,1 a 0,15 s: pulsar un poco antes también cuenta.
- **Controles:** el tacto primero (uno o dos dedos: tocar, arrastrar, pellizcar), y lo mismo
  con ratón y teclado en PC. Nada que necesite un mando.
- **En móvil:** zonas táctiles grandes y sin depender de la precisión fina. Hay que dejar sitio
  al pulgar sin tapar la acción, y respetar las zonas seguras.
- **Vibración:** Safari en iPhone no tiene vibración web (WebKit nunca la ha implementado). La
  respuesta tiene que funcionar solo con imagen y sonido.

## Lo que no se puede comprobar aquí

Claude no oye ni siente los controles. Lo valida el autor con la lista 1–5 de
`COMO-TRABAJAMOS.md`.
