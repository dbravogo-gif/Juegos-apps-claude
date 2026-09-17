# Prompt para generar las imágenes

El personaje ya está hecho. Este prompt sirve para pedir **todo lo demás**: enemigos,
fondos, muebles, equipo y mascotas.

Pega el bloque de abajo al empezar la conversación **adjuntando las dos hojas del héroe**
(la de frente y la de espaldas). Son la referencia de estilo: sin ellas el prompt solo
describe con palabras algo que ya existe en imágenes, y saldrá distinto.

A partir de ahí basta con «ahora una mesa de cobre», «ahora el bandido harapiento».

Si tras quince o veinte imágenes empieza a desviarse, vuelve a pegarlo en una conversación
nueva con las dos hojas del héroe y dos o tres imágenes ya aprobadas.

---

## El prompt

```
Te adjunto dos imágenes del personaje protagonista de un pequeño videojuego 2D llamado
Constant. Son la REFERENCIA DE ESTILO OBLIGATORIA: todo lo que generes a partir de ahora
tiene que parecer sacado del mismo juego, dibujado por la misma mano y el mismo día.

Copia de esas imágenes, sin desviarte:
- El trazo y el contorno: línea exterior definida, de color marrón muy oscuro, nunca negro
  puro, de grosor constante.
- El sombreado: color plano con dos o tres tonos de sombra bien delimitados, sin degradados
  suaves, sin texturas y sin brillos complicados.
- El nivel de detalle: definido pero no recargado. Silueta clara y legible en pequeño.
- La paleta: azul verdoso apagado, crema, blanco roto, marrón cuero, oro viejo y terracota.
  Nada de colores fríos saturados, ni neones, ni pasteles lavados.
- La iluminación: luz suave desde arriba, sombras hacia abajo.

AMBIENTACIÓN
Fantasía ligera de aire mediterráneo antiguo, entre lo griego y lo bizantino: grecas, telas
drapeadas, cúpulas, arcos de medio punto, mosaicos, mármol, terracota, bronce envejecido.
No es histórico: es un mundo inventado que toma prestada esa estética. Nada de referencias
religiosas concretas, banderas ni símbolos reales.

REGLAS TÉCNICAS (en todas las imágenes)
- Fondo completamente transparente (PNG con canal alfa), EXCEPTO los fondos de escenario.
  Si no puedes hacer transparencia real, usa un fondo plano de verde puro (#00FF00) que no
  aparezca en el dibujo, para poder recortarlo.
- Sin sombra proyectada en el suelo, sin peana, sin plataforma, sin base.
- Sin texto, sin números, sin logotipos, sin marcas de agua.
- Sin marco, sin borde, sin fondo de tarjeta, sin viñeta.
- Un solo objeto o criatura por imagen, centrado y con un pequeño margen alrededor.

PERSPECTIVA
La cámara es frontal y ligeramente elevada, como si miraras el objeto de pie desde un par
de metros: se ve la cara frontal y un poco la superficie de arriba. Nunca cenital, nunca a
ras de suelo, nunca isométrica. La misma en todo, salvo en las armas y los accesorios.

CÓMO ORIENTAR CADA COSA
- Enemigos y criaturas: de frente, mirando a cámara, cuerpo entero, apoyados sobre una línea
  de suelo imaginaria.
- Muebles, decoración y plantas: de frente con esa ligera altura, apoyados, con la base
  visible y horizontal. La base tiene que tocar el borde inferior del encuadre, sin aire
  debajo: el juego ancla cada objeto por ahí a un punto del suelo, y un margen inferior lo
  deja flotando. El objeto se escala según lo lejos que esté, así que debe leerse bien
  también a la mitad de tamaño: nada de detalles finos que se pierdan.
- Alfombras y esteras: vistas desde más arriba que el resto, casi tumbadas, como una lámina
  apoyada en el suelo. Van en su propio sitio de la escena y nunca llevan nada encima.
- Cuadros, tapices, mosaicos e iconos de pared: de frente y planos, sin perspectiva, como si
  los miraras de cara. Estos no se apoyan en el suelo; cuelgan.
- Mascotas: de frente, cuerpo entero, en pose tranquila.
- Armas: en diagonal a 45 grados, empuñadura abajo a la izquierda y punta arriba a la
  derecha, de perfil limpio, como icono de inventario.
- Armaduras: de frente, rectas y simétricas, como colgadas de un maniquí invisible.
- Accesorios (amuletos, anillos, reliquias): de frente, rectos y centrados, como una pieza
  de joyería.

HOJAS DE TRES POSES (solo enemigos)
Cada enemigo va en UNA sola imagen con tres poses en fila horizontal, mismo tamaño, mismos
colores, alineadas sobre la misma línea de suelo:
  1. En guardia: quieto, postura de espera.
  2. Atacando: su gesto de ataque más claro.
  3. Recibiendo daño: echado hacia atrás, encogido.
Formato 1536 × 1024 píxeles, cada pose centrada en su propio tercio.

MUY IMPORTANTE SOBRE LAS HOJAS: recorto la imagen en tres partes iguales por código, así que
NADA puede invadir el tercio de al lado. Ni una estela de arma, ni un efecto de movimiento,
ni una cola, ni un ala, ni una sombra. Si una pose necesita un efecto, que quepa entero
dentro de su tercio y con margen. Las tres figuras del mismo tamaño y a la misma altura, sin
líneas ni cajas que las separen.

FONDOS DE ESCENARIO (única excepción al fondo transparente)
Hay dos tipos y las reglas son las mismas:
- De zona: donde ocurren los combates.
- De espacio: el sitio que el jugador decora (patio, habitación, huerto, taller, terraza).
Reglas:
- Apaisados, 1536 × 1024, imagen completa sin transparencia.
- Misma cámara frontal ligeramente elevada. Horizonte alto, en el tercio superior, de modo
  que la mitad inferior sea suelo.
- La mitad inferior tiene que quedar DESPEJADA: ahí se colocan encima los personajes y los
  muebles. Nada de objetos importantes en primer plano.
- En los fondos de espacio, además: el suelo tiene que ocupar de la mitad de la imagen hacia
  abajo y verse continuo, sin escalones ni muebles pintados. Los objetos que el jugador
  coloca se reparten en cuatro franjas de profundidad, así que ese suelo debe leerse como un
  plano que se aleja. En los interiores, deja la pared del fondo libre en su tercio superior
  para los tapices y los cuadros.
- Sin personajes ni criaturas.
- Profundidad suave: el fondo algo más desvaído y con menos contraste que el primer plano.

TAMAÑOS
- Objetos sueltos (muebles, armas, armaduras, accesorios, mascotas): 512 × 512.
- Hojas de enemigo: 1536 × 1024.
- Fondos de escenario: 1536 × 1024.

QUÉ NO QUIERO
Nada de píxel art, ni cómic americano, ni 3D, ni fotorrealismo, ni acuarela suelta. Nada de
fondos decorados detrás de los objetos. Nada de brillos, destellos, partículas ni auras
mágicas salvo que te lo pida. Nada de sangre ni violencia explícita: el tono es amable.

Empecemos. Cuando te pida algo, genera solo eso y respeta todo lo anterior.
```

---

## Notas prácticas

**Adjunta siempre las dos hojas del héroe** en la primera petición. La referencia visual pesa
mucho más que cualquier descripción escrita.

**Revisa que nada se salga de su tercio** en las hojas de enemigo. Es el fallo que ya salió
una vez: la estela de la espada del héroe invadía el tercio siguiente. Si pasa, pídela de
nuevo con «el efecto se sale de su tercio, hazlo más pequeño».

**Si la transparencia sale mal** y devuelve fondo blanco o a cuadros, pídele el fondo verde
puro (#00FF00) y dímelo: lo recorto yo.

**El nombre del archivo importa.** Cada imagen va con el nombre exacto de `ASSETS.md`, dentro
de su carpeta de `assets/`. En cuanto el archivo existe, la app lo usa sola.

**Orden sugerido** para ver resultados pronto: el fondo de Las Murallas y la rata de las
murallas —con eso el combate ya se ve entero—, después el fondo del patio y cuatro o cinco
muebles baratos, y a partir de ahí lo que quieras.
