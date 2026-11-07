# 07 · Dirección de arte sin artistas y cómo elegir un concepto original

Ronda 4 (2026-11-07).

## Referencia técnica: el portfolio 2025 de Bruno Simon

[Repositorio](https://github.com/brunosimon/folio-2025), licencia MIT. He leído `sources/Game`.
Es un mundo para conducir, en Three.js, de uno de los desarrolladores web 3D más reconocidos.

**Herramientas:**

- Three.js r187 con `WebGPURenderer`; WebGL2 queda como respaldo.
- TSL para los shaders.
- Rapier para la física y Howler para el sonido.

**La receta de su estilo:** no usa iluminación realista (PBR). Su material por defecto
(`MeshDefaultMaterial`) calcula en este orden:

1. **Color base de una paleta compartida.** Una textura pequeña de paleta para casi todos los
   modelos. Así el color es coherente y hay pocos materiales y llamadas de dibujo.
2. **Rebote de luz falso.** Las caras que miran hacia abajo, cerca del suelo, toman el color
   del terreno.
3. **Multiplica por el color y la intensidad de la luz.**
4. **Sombra propia** con `smoothstep` del ángulo con la luz. Los bordes son ajustables: de banda
   dura de dibujo animado a suave.
5. **Sombra proyectada** del mapa de sombras, combinada con la propia (`max`).
6. **Sombras de color, nunca negras:** `colorBase × colorDeSombra`.
7. **Niebla** que mezcla hacia un color de niebla.

**Más detalles:**

- **Brillo controlado:** *bloom* con umbral 1, de modo que solo brilla lo emisivo por encima
  del rango normal, y fuerza 0,25 (sutil). En móvil, menos niveles.
- **Profundidad de campo barata** solo en escritorio. Antialias solo si la densidad de píxeles
  es menor que 2.
- **Calidad por niveles:** el móvil arranca en el nivel bajo y los sistemas escuchan el cambio
  de nivel.
- **Colores con nombre:** degradados emisivos y de color definidos una vez (naranja, morado,
  azul, verde).
- **Panel de depuración en todo:** colores, luz, viento, calidad…, ajustables en vivo.
- **Sistemas de mundo**, cada uno en su archivo: ciclos de día y de año, clima (lluvia, nieve,
  rayos, tornado), viento, niebla, hierba, follaje, agua, huellas y estelas, revelado.

## Otras técnicas estilizadas

- **Hierba y árboles** ([stylized-scene](https://github.com/dedekpo/stylized-scene)):
  - Hierba instanciada.
  - Color variado por mata.
  - Proyección del color del suelo.
  - Translucidez y borde iluminado.
  - Un nodo de viento compartido por hierba y árboles: curva, ráfaga que avanza, brisa y
    aleteo en las puntas.
- **Consejo de foro:** el viento se hace girando los vértices alrededor de la raíz, no
  desplazándolos. Si no, la planta se deforma como un paralelogramo.
- **Agua estilizada:** espuma por profundidad donde los objetos cortan la superficie, más
  Fresnel (el brillo que cambia según el ángulo de mirada). Hay tutoriales, pero son
  incompletos.
- **Toon shading:** `MeshToonMaterial` con un mapa de degradado de pocas bandas, o un material
  propio como el de Bruno Simon. Para contornos: casco invertido o detección de bordes por
  profundidad y normales. No he encontrado una receta de 2026 verificada para Three.js.

## Principios de dirección de arte

Guías de práctica, no doctrina.

- **Silueta primero.** Cada rol del juego (jugador, enemigo, recompensa) tiene una silueta
  distinta que se reconoce a la distancia de juego.
- **Lenguaje de formas:** redondo es amable, cuadrado es estable y angular es peligro. Se decide
  antes de modelar.
- **Prueba en escala de grises.** Si la escena se lee bien sin color, el color solo suma. Lo
  estilizado comprime el rango de valores.
- **Paleta limitada:**
  - Primario, secundario y un acento, con alto contraste.
  - La paleta se escribe una vez y no se improvisa.
  - Encaja con el «color de una paleta compartida» de Bruno Simon y con el atlas de degradado
    de KayKit.
- **La escala de cámara manda:** por debajo de unos milímetros en pantalla, la textura es ruido
  y solo sobreviven silueta y valor.
- **Guía de estilo escrita:**
  - Formas.
  - Paleta.
  - Dirección de la luz.
  - Materiales.
  - Referencias de escala.
  - Criterios de revisión.

## Recursos gratuitos

Licencias según guías de terceros; hay que comprobar el texto oficial antes de publicar.

- **KayKit:**
  - Todo CC0, según una guía.
  - Personajes con accesorios, en glTF.
  - Comparten un atlas de degradado pequeño.
- **Quaternius:** más de 50 personajes animados. Una fuente dice CC0 y otra «licencia
  Quaternius, sin atribución»; hay que comprobarlo. Viene en FBX, OBJ y Blend: hay que
  convertirlo a GLB.
- **Kenney:** personajes animados CC0 en glTF, y miles de recursos más.
- **100 Avatars:** 167 humanoides con esqueleto, CC0.
- **Sonido:** [ZzFX](https://github.com/KilledByAPixel/ZzFX) (licencia MIT, menos de 1 KB,
  con diseñador web de sonidos). jsfxr ha cambiado de manos; revisar su licencia antes de
  usarlo.
- **Formato:** GLB es lo que quiere la web (malla, materiales y texturas en un archivo).
  Comprimir con gltf-transform y texturas KTX2, como hace Bruno Simon.

## Elegir un concepto original

- **Pitch en una frase:** qué es y por qué apetece jugarlo. Sirve también de filtro contra
  funciones de más.
- **Las restricciones generan originalidad:** tema, alcance pequeño, límites técnicos.
- **Variación de un elemento** (Butterfly Effect Jam): se parte de una frase y se cambia una sola
  cosa.
- **Casos que funcionaron:**
  - ***Slow Roads*** (anslo, Three.js):
    - Conducción infinita y procedural, sin fallo, sin tiempo, sin rivales.
    - 16 meses de un solo desarrollador.
    - Cobertura en PC Gamer, Jalopnik y Ars Technica.
    - Sin anuncios, solo donaciones.

    Lección: una sola sensación (calma) ejecutada con mucha belleza puede bastar. Choca con
    «interesante» si no hay decisiones.
  - ***A Short Hike*:** un bucle sencillo (plumas → subir más alto → descubrir) hecho en 4
    meses.
  - ***Townscaper*:** construir sin objetivos. Encanta a unos y a otros les parece que le falta
    profundidad.
- **Criterios propuestos** para elegir entre conceptos (inferencia mía; la «prueba del clip» no
  tiene fuente):
  1. Se explica en una frase.
  2. Se entiende en un clip de 10 segundos sin texto.
  3. Un verbo con profundidad, no muchos a medias.
  4. Encaja con lo que Claude hace bien: mundo procedural, física, todo dibujado en código.
  5. Encaja con nuestras restricciones: navegador móvil, sin inversión, rendimiento medido
     con contadores.
  6. Partidas de 3 a 10 minutos y motivo para volver: una semilla diaria, que exige núcleo
     determinista.
  7. Original: sin marcas ajenas.
  8. Tiene presión (decisiones con riesgo). La pura contemplación queda fuera, porque el autor
     pidió que sea interesante.
