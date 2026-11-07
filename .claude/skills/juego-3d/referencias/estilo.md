# Estilo visual sin artistas

## Principios

- **Silueta primero.** Cada papel (jugador, peligro, recompensa) se reconoce solo por la forma, a
  la distancia de juego.
- **Lenguaje de formas.** Lo redondo se lee como amable; lo cuadrado, como estable; lo anguloso,
  como peligro.
- **Prueba en escala de grises.** Si la escena se entiende sin color, el color solo suma.
- **Paleta limitada y escrita en `ARTE.md`:** primario, secundario, acento, sombra y cielo. No
  se improvisan colores.
- **Escala de cámara.** Lo que mide pocos milímetros en pantalla es ruido: solo cuentan la
  silueta y el valor.
- **Audacia en un solo sitio.** Un elemento memorable; el resto, tranquilo.

## Receta de material

Del portfolio 2025 de Bruno Simon (`folio-2025`, licencia MIT). Un material propio en lugar de
iluminación realista, que calcula en este orden:

1. **Color base de una paleta compartida** (una textura pequeña o colores por vértice). Da
   coherencia y deja pocos materiales.
2. **Rebote falso:** las caras que miran al suelo, cerca de él, toman el color del terreno.
3. **Luz:** se multiplica por su color e intensidad.
4. **Sombra propia:** `smoothstep` del ángulo con la luz, con bordes ajustables, de banda dura a
   suave.
5. **Sombra proyectada:** se combina con la propia con `max`.
6. **Sombras de color:** `colorBase × colorDeSombra`. Nunca negras.
7. **Niebla** hacia el color del cielo.

Además:

- *Bloom* con umbral 1, para que solo brille lo emisivo, y fuerza de unos 0,25.
- Degradados emisivos con nombre.
- Panel de depuración para ajustarlo todo.

## Técnicas

- **Modelado procedural:**
  - Extrusiones, biseles, tornos (*lathe*), tubos y curvas sobre primitivos.
  - Biseles falsos con tiras finas.
  - Detalle solo donde mira la cámara.
- **Hierba y follaje:**
  - Instanciados, con color variado por mata.
  - Un viento compartido que **gira los vértices alrededor de la raíz**: si se desplazan, la
    planta se deforma.
- **Agua estilizada:** espuma por profundidad donde los objetos cortan la superficie, más
  Fresnel.
- ***Toon*:**
  - `MeshToonMaterial` con un degradado de pocas bandas y filtrado *nearest*, o el material
    propio de arriba.
  - Contornos con casco invertido o con detección de bordes por profundidad y normales.
- **Luz legible:**
  - Luz clave (da forma), de relleno (mantiene la legibilidad) y de contorno (separa al
    protagonista del fondo).
  - Luces prácticas o emisivas, y sombras de contacto.
  - Mapeo tonal elegido a propósito (ACES para lo cinematográfico) y exposición ajustada en
    partida.

## Recursos

- **Primero, los generados por código.** El sonido, con Web Audio o ZzFX (licencia MIT).
- **Recursos CC0** (Kenney, KayKit, Quaternius, 100 Avatars): **se comprueba la licencia de cada
  paquete** en su web oficial antes de usarlo, y se apunta en `CREDITS.md`. Formato GLB
  comprimido con gltf-transform.
- **Generadores de pago** (Tripo, Meshy, generadores de imágenes): fuera mientras no haya
  inversión (regla R9).
