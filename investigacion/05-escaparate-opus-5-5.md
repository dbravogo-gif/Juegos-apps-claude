# 05 · El escaparate de Opus 5.5: qué se hizo viral y cómo se hizo

Ronda 2 (2026-11-07). Punto de partida: un carrusel de Instagram de novedad.ai, «La gente está
creando cosas increíbles con Claude Opus 5.5». Solo vi la portada. La diapositiva de los láseres
no la he podido identificar.

## El modelo

[Anuncio oficial](https://www.anthropic.com/news/claude-opus-5-5).

- Salió el 22 de septiembre de 2026.
- Rinde «más o menos al nivel de Fable 5.1» y cuesta un 40 % menos que Opus 5. Genera un 30 % más
  rápido.
- **Tareas largas:** según los ejemplos del anuncio, una migración de 680.000 líneas en menos de
  un día y 18 horas trabajando solo durante una noche.
- **Juegos:** en una prueba de juego con un solo prompt, sacó la mejor nota en gráficos y pulido.
- Esfuerzo de bajo a máximo; por defecto, medio.
- Anthropic subió los límites de uso de 5 horas de los planes de pago.

## Los datos: 2.526 obras virales analizadas

Fuente: el índice
[awesome-opus-5.5-video](https://github.com/zhuyansen/awesome-opus-5.5-video), del que he
descargado y analizado `cases.json`, actualizado el 2026-11-05. Solo entran publicaciones
originales con vídeo, al menos 5.000 visualizaciones y que el autor diga que usó un modelo 5.5.

| Categoría | Obras | Visualizaciones |
| --- | --- | --- |
| Juegos | 442 | 57 M |
| 3D y arte | 415 | 53 M |
| Comparativas entre modelos | 473 | 41 M |
| Motion graphics | 334 | 36 M |
| Historias y cortos | 227 | 34 M |
| Producto y anuncios | 247 | 25 M |
| Educación | 216 | 24 M |
| Producción (edición, música) | 172 | 17 M |

- **Herramientas más citadas:**
  - Three.js (287), Blender (216), Claude Code (121) y Higgsfield (85).
  - Modelos de otras empresas: Gemini (73) y GPT-6 (64).
  - ElevenLabs (63), Tripo (52), Seedance (47), Python (46) y Suno (37).
  - Remotion (29), Godot (28), Unreal (28) y ffmpeg (25).
- **Sin gastar en herramientas:** de los 442 juegos, **263 (el 60 %) solo usaron herramientas
  gratuitas** (Three.js, Blender, Godot, Claude Code, WebGPU) y suman **32 de los 57 M de
  visualizaciones**. Aproximación mía: una herramienta que nadie citó no cuenta.
- **Crítica importante:** casi todos los juegos más vistos son **copias o mezclas de marcas
  famosas**: Call of Duty Zombies (4,7 M), Fallout (3,7 M), Zelda, League of Legends con Dragon
  Ball, Splatoon, Fortnite, Minecraft, Mario 64, Dark Souls y Rocket League.
  - Se hacen virales por lo reconocibles, no por ser buenos juegos.
  - No se pueden publicar ni monetizar, y no es lo que vamos a hacer.
  - Lo que sí se aprovecha es la **técnica**.
- **Originales que también funcionaron:**
  - Una exploración 3D de *El Principito* (3,9 M; con Tripo y Blender).
  - El mundo propio de @xikhar en su tercera iteración (1,8 M) y su plataformas de puzles
    original (1,4 M).
  - El juego del dilema del tranvía (0,7 M).
  - El viaje en barca de Meng To.

## Seis recetas sacadas de los prompts literales

Fuente: [awesome-opus-5-5-video-prompts](https://github.com/X-RayLuan/awesome-opus-5-5-video-prompts),
que solo publica prompts copiados tal cual del autor.

### 1. El director de cine

@kimmonismus: película de 3 minutos sobre la historia de la IA, hecha con Remotion. El prompt
tiene esta estructura:

1. **Rol y objetivo:** «Eres un motion designer y director creativo…», con una referencia de
   tono: «Kurzgesagt con la apertura de Pixar».
2. **Arranque técnico fijo:** 1920×1080, 30 fps, exactamente 180 s, una composición por escena y
   ningún recurso externo: todo dibujado en código.
3. **Plan antes de construir:** «escribe STORYBOARD.md con tiempos, visuales, texto y
   transiciones de cada escena».
4. **Autocrítica visual:** «después de cada escena, renderiza 3 o 4 fotogramas y míralos con
   ojo crítico; arregla composición, solapes, legibilidad y ritmo antes de seguir».
5. **Un motivo narrativo** que lo une todo: un token que viaja por las épocas.
6. **Escenas con su tiempo aproximado,** con permiso para reequilibrarlas.
7. **Reglas de oficio:**
   - Como mucho 8 palabras en pantalla, y cada texto visible al menos 2,5 s.
   - Una fuente de titulares y otra monoespaciada.
   - Curvas de muelle, nunca lineales.
   - Transiciones que nacen del contenido.
   - Un solo acento de color.
   - Detalles escondidos.
   - Ritmo que alterna momentos densos y tranquilos.
8. **Exactitud:** «si dudas de un dato, quítalo y apúntalo en NOTES.md».
9. **Autonomía y entrega:** la ruta del MP4, un resumen de las decisiones creativas y
   NOTES.md.

### 2. La especificación técnica

@majidmanzarpour: mago pixel-art animado, unos 30 minutos.

- Un solo HTML, sin recursos ni librerías.
- Lienzo lógico de 128×96, escalado entero y paleta fija de unos 24 colores.
- Personaje hecho por código, con la pose parametrizada y llevada a la rejilla en cada
  fotograma.
- Máquina de estados: reposo → carga → lanzamiento (con sacudida de 1 o 2 píxeles) →
  recuperación.
- Partículas reutilizadas, sin crear objetos en el bucle, con paso fijo de 60 Hz.
- Cierra con un **listón de calidad** explícito: «que parezca una animación de sprite de 16 bits
  pulida, no vectores reducidos».

### 3. La biblia del mundo

Meng To: barca por un valle japonés, una escena 3D jugable en Three.js. Es un prompt larguísimo.

- **Inventario exhaustivo:**
  - Cada lugar: puente, torii, templo, pagoda, linternas.
  - Cada especie de árbol.
  - La barca, pieza a pieza.
- **Movimiento físico de los personajes:** «la cadera baja, la espalda empuja, los pies quietos;
  la pértiga nunca atraviesa el casco».
- **El agua como protagonista:** reflejos, refracción, espuma en las rocas y estela en V.
- **Un ciclo de día y noche por fases:** amanecer → tormenta → hora dorada → noche con
  luciérnagas.
- **Restricciones:** ningún texto en la escena y un único archivo autónomo.
- **Interacción:** piloto automático, que el jugador puede tomar con inercia y deriva; cámara
  con reglas («nunca bajo la orilla»).
- **Bucle infinito:** al final se funde en niebla y vuelve a empezar.
- **El listón:** «una obra 3D premium, no un prototipo ni una demo técnica».

### 4. Primero las fuentes

Alex Albert, de Anthropic: Market Street en 1906, hecho con Blender.

- «Antes de modelar nada», crear un archivo de fuentes: mapas, películas y fotos, con cada dato,
  su fuente y su nivel de confianza.
- Generadores reutilizables en Blender Python (fachada victoriana, tranvía, farolas), sin bajar
  mallas ni texturas.
- La calle se monta a partir de los datos, así que todo es trazable.

### 5. Carta blanca con `/goal`

@JustinPerea: intro de *demoscene* (el arte de hacer demos audiovisuales con muy poco código):
43 segundos en un HTML de 280 KB.

> Create this in a new sub folder. /goal Create the most impressive demo of Opus 5.5 (you)
> capabilities to be shown off on Twitter. Pick what you want to make, record it into a short
> video that can get attention, and have fun.

Unas 5 horas de trabajo y unos 697 M de tokens, repartidos en 19 horas de límites de sesión. Lo
único que escribió después fue «continue».

### 6. Puntuarse y seguir

Meng To: barco japonés en Three.js. Pidió a Opus que puntuara cada parte de la escena y la
mejorara hasta llegar al menos a 8 sobre 10, dentro de un presupuesto de tiempo y tokens.

### Otras técnicas que se repiten

- **Un subagente por capítulo** en los videoclips: 7 subagentes, con un *storyboard* de 168
  planos.
- **Subir el esfuerzo** a `xhigh` o `max` cuando lo creativo sale flojo. Varios autores dicen
  que cambia mucho.
- **Todo dibujado en código:** Canvas, WebGL2, WebGPU, p5.js, SVG, Three.js. El sonido y la
  música salen de Web Audio, Node o Python.
- **Blender por Python** o Blender MCP para 3D.
- **Exportar a MP4:** Remotion, HyperFrames, o Chrome sin interfaz con ffmpeg.
- **Opus como director de otros modelos de vídeo** (Seedance, Runway, Higgsfield) a través de
  MCP. Es caro, porque se pagan créditos de esos servicios.

## Coste real de los resultados virales

Lo cuentan los propios autores:

- Lanzamiento de una startup: 1 minuto y unos 2 $.
- Animación de arena: un 30 % de la cuota de 5 horas del plan Pro.
- Corto de la humanidad: 2 prompts, 3 horas a máximo esfuerzo, unos 130 M de tokens.
- *Demoscene*: unos 697 M de tokens.
- Piloto de anime: 14 horas.
- Castillo en Blender: 35 minutos.

**Conclusión:** «un prompt» casi nunca significa «unos minutos». Lo impresionante suele ser un
prompt muy trabajado, seguido de horas de trabajo autónomo con autocrítica visual. Con
suscripción no cuesta dinero, pero gasta límites.

## Qué significa para lo que construyamos

Esto es inferencia mía.

1. **El salto de Opus 5.5 está en lo visual:** 3D, movimiento y animación generados solo con
   código. Es justo lo que no cuesta dinero ni licencias.
2. **La forma del prompt importa más que su longitud.** Los mejores llevan:
   - un listón de calidad explícito,
   - restricciones técnicas cerradas,
   - un plan en archivo antes de construir,
   - autocrítica con capturas después de cada parte,
   - y un inventario concreto de lo que debe existir.

   Encaja con lo que hace Anthropic: especificación, verificación y evaluador.
3. **Para juegos originales y gratuitos,** el camino que más se repite: Three.js, o Canvas si es
   2D; recursos procedurales y sonido sintetizado; un solo HTML o un proyecto pequeño; la
   «biblia del mundo» como especificación; capturas y nota por partes hasta llegar a 8 sobre 10.
4. **Cuidado con la viralidad fácil.** Copiar una marca famosa da visualizaciones, pero no un
   producto. Lo original que funcionó tiene una idea visual o emocional fuerte: *El Principito*,
   el valle japonés, el dilema del tranvía.

## Cautelas

- Los datos de visualizaciones y de coste los dan los propios autores.
- «One-shot» es a menudo marketing.
- Los prompts completos de muchos juegos (Fallout, Zelda con pincel, Minecraft, Fortnite) están
  en jasonzhu.ai, que no he podido leer: la red de esta sesión no deja entrar a hosts nuevos.
