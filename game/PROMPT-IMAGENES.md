# Prompt para generar las imágenes

Pega el bloque de abajo **una sola vez** al empezar la conversación con Gemini o GPT, junto
con tu primera petición. A partir de ahí ya basta con «ahora una mesa de cobre», «ahora el
bandido harapiento».

Si en algún momento notas que se le olvida el estilo (suele pasar tras quince o veinte
imágenes), vuelve a pegarlo o empieza una conversación nueva adjuntando dos o tres imágenes
ya aprobadas como referencia.

---

## El prompt

```
Vas a ayudarme a generar los recursos gráficos de un pequeño videojuego 2D llamado
Constant. Necesito que TODAS las imágenes parezcan del mismo juego, así que estas reglas
valen para todo lo que te pida a partir de ahora, aunque no las repita.

AMBIENTACIÓN
Fantasía ligera inspirada en la Constantinopla bizantina: cúpulas, arcos de medio punto,
mosaicos dorados, mármol, terracota, telas bordadas, bronce envejecido. No es histórico ni
realista: es un mundo inventado que solo toma prestada esa estética. Nada de referencias
religiosas concretas, banderas, símbolos reales ni nada bélico identificable.

ESTILO
- Ilustración 2D digital, limpia y acogedora. Aire de juego tipo Stardew Valley o Animal
  Crossing, pero con formas algo más definidas y menos infantiles.
- Color plano con sombreado suave en dos o tres tonos. Nada de degradados complicados,
  texturas fotográficas, ni render 3D.
- Contorno fino de color oscuro cálido (marrón muy oscuro, nunca negro puro) alrededor de
  cada figura. Es importante: el juego tiene modo claro y modo oscuro, y sin ese contorno
  los objetos oscuros desaparecen sobre fondo oscuro.
- Proporciones ligeramente estilizadas y simpáticas, sin llegar a caricatura extrema.
- Legible en pequeño: los objetos se ven a 90 píxeles de ancho en el móvil. Silueta clara,
  pocos detalles diminutos, buen contraste interno.

PALETA
Base cálida: crema (#F6F1E7), terracota, madera media, piedra arena.
Acentos: verde bizantino (#2F7D5D), oro viejo (#C98A2B), rojo teja (#B24A3C).
Azules y morados solo como toques puntuales. Evita colores fríos saturados, neones y
cualquier cosa que desentone con una paleta cálida y natural.

REGLAS TÉCNICAS (siempre)
- Fondo completamente transparente (PNG con canal alfa), EXCEPTO los fondos de zona.
  Si no puedes generar transparencia real, usa un fondo de color plano y uniforme de un
  verde puro (#00FF00) que no aparezca en la imagen, para poder recortarlo después.
- Sin sombra proyectada en el suelo, sin plataforma, sin peana, sin base.
- Sin texto, sin números, sin logotipos, sin marcas de agua.
- Sin marco, sin borde decorativo, sin fondo de tarjeta ni viñeta.
- Un solo objeto o personaje por imagen, centrado, con un pequeño margen alrededor.
- Iluminación siempre igual: luz suave desde arriba y ligeramente a la izquierda.

PERSPECTIVA (esto es lo más importante para que todo encaje)
La cámara es SIEMPRE frontal y ligeramente elevada, como si miraras el objeto de pie desde
un par de metros: ves la cara frontal y, un poco, la superficie de arriba. Nunca cenital
(desde el techo), nunca a ras de suelo, nunca isométrica ni en tres cuartos girado.
Mantén exactamente el mismo ángulo en todas las imágenes.

Con dos excepciones, que explico abajo: las armas y los accesorios.

CÓMO ORIENTAR CADA COSA
- Muebles, decoración, plantas y mascotas: de frente, con esa ligera altura. Apoyados sobre
  una superficie imaginaria, con la base bien visible y horizontal.
- Armas: en diagonal a 45 grados, con la empuñadura abajo a la izquierda y la punta arriba
  a la derecha. De perfil limpio, como un icono de inventario. Así aprovechan el cuadrado y
  se reconocen al instante.
- Armaduras: completamente de frente y rectas, simétricas, como si colgaran de un maniquí
  invisible. Sin torsión ni perspectiva.
- Accesorios (amuletos, anillos, reliquias): de frente y rectos, centrados, presentados como
  una pieza de joyería sobre fondo vacío.
- Personajes y enemigos: de frente, mirando a cámara, cuerpo entero, con los pies apoyados
  en una línea de suelo imaginaria.

FONDOS DE ZONA (única excepción al fondo transparente)
- Formato apaisado, 1536 × 1024 píxeles, imagen completa sin transparencia.
- Misma cámara: frontal y ligeramente elevada. La línea del horizonte va alta, en el tercio
  superior, de modo que se vea bastante suelo en la mitad inferior.
- El suelo de la parte baja debe quedar despejado y sin detalles importantes: ahí se
  colocarán personajes encima.
- Sin personajes, sin criaturas, sin objetos en primer plano.
- Profundidad suave, con el fondo algo desvaído y menos contrastado que el primer plano.

HOJAS DE PERSONAJE (personajes y enemigos)
No me des las poses en imágenes separadas: salen personajes distintos cada vez. Dame
SIEMPRE una sola imagen con las tres poses en fila horizontal, mismo personaje, mismo
tamaño, misma ropa, mismos colores, alineados sobre la misma línea de suelo:
  1. En guardia: quieto, de frente, postura de espera.
  2. Atacando: el gesto de ataque más claro que tenga.
  3. Recibiendo daño: echado hacia atrás, encogido.
Formato 1536 × 768 píxeles, cada pose centrada en su tercio, separadas entre sí, fondo
transparente y sin nada que las divida (ni líneas, ni cajas, ni texto).

TAMAÑOS
- Objetos sueltos (muebles, armas, armaduras, accesorios, mascotas): 512 × 512.
- Hojas de personaje y enemigo: 1536 × 768.
- Fondos de zona: 1536 × 1024.

QUÉ NO QUIERO
Nada de estilo píxel art, ni anime, ni cómic americano, ni 3D, ni fotorrealismo, ni acuarela
suelta. Nada de fondos decorados en los objetos. Nada de efectos de brillo, destellos,
partículas ni resplandores mágicos salvo que te lo pida. Nada de sangre, armas de fuego ni
violencia explícita: el tono es amable.

Empecemos. Cuando te pida algo, genera solo eso y respeta todo lo anterior.
```

---

## Notas prácticas

**Empieza por el personaje.** Pídele `assets/personaje/etapa1.png` antes que nada: esa
imagen fija el estilo y luego sirve de referencia visual para el resto. Cuando te guste,
adjúntala en las peticiones siguientes diciendo «mismo estilo que esta».

**Si la transparencia sale mal** y te devuelve fondo blanco o a cuadros, pídele el fondo
verde puro (#00FF00) que menciona el prompt y dímelo: lo recorto yo sin problema.

**Con las hojas de poses**, comprueba que las tres figuras son reconociblemente la misma
persona. Si no, vuelve a pedirla: es el punto donde más falla la generación por IA. Yo las
recorto en tres al integrarlas.

**El nombre del archivo importa.** Cada imagen tiene que guardarse con el nombre exacto que
aparece en `ASSETS.md`, dentro de su carpeta. En cuanto el archivo existe, la app lo muestra
sola, sin tocar código.

**Si prefieres trabajar en inglés**, el prompt funciona igual traducido y a veces los
generadores afinan algo más los detalles. Pero en español rinde de sobra.
