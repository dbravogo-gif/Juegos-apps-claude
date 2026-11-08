# Prueba de arte con Meshy (F04, segunda vuelta)

2026-11-07. El autor quiere criaturas bonitas, y algunas épicas, al nivel de los juegos del
género. Se prueba la IA 3D de Meshy con su plan gratis antes de decidir el método de arte
(`DISENO.md`, decisiones abiertas).

## Reglas de los prompts (R8)

- Nunca se nombra a Pokémon ni a ninguna criatura o juego ajenos. Se describe un arquetipo con
  diseño propio: colores, piezas y anatomía distintos de cualquier criatura conocida.
- Si un resultado recuerda claramente a una criatura existente, se descarta.
- El color principal es el de su tipo (`ARTE.md`).
- Los tres comparten el mismo bloque de estilo, para que parezcan del mismo juego. Se busca el
  estilo de dibujo del género (formas limpias, colores planos con sombreado suave, ojos
  expresivos y detalle moderado), no los rasgos de ninguna criatura. Nada de «juguete de
  vinilo»: es el aspecto que el autor descartó en la primera prueba.
- En inglés, porque los generadores responden mejor así.

## Camino recomendado: primero el dibujo, después el 3D

Decidido con el autor (2026-11-07): se diseña cada criatura en 2D y Meshy solo la pasa a 3D
(«Image to 3D»). Así el diseño se aprueba antes de gastar créditos de 3D, el 3D se ciñe a él,
las 200 comparten estilo y las imágenes sirven de retrato en los menús.

- **Imagen:** con un generador gratuito desde el móvil (Gemini, ChatGPT o Copilot; sus límites
  no están comprobados). OpenArt, conectado a la sesión de Claude, tiene 5 créditos y la imagen
  más barata cuesta 10.
- **Requisitos de la imagen para pasarla a 3D:** una sola criatura (con varias, Meshy las
  funde en una malla con triángulos estirados entre ellas), entera, en vista de tres
  cuartos, centrada y sobre fondo blanco liso, sin sombra en el suelo y sin texto.
- **Meshy** (comprobado en su documentación, docs.meshy.ai, 2026-11-07):
  1. «Model», pestaña «Image to 3D», tipo **Smart Topology** y modelo **Meshy T2** (5
     créditos). Ni «High Detail» ni el modo de relieve, que es para grabado.
  2. Sube la imagen (PNG o JPG, de 512 × 512 o más, fondo liso).
  3. **Poly Count:** 10.000 para la cría y el toro; 15.000 (el máximo) para la serpiente.
  4. **Texture:** si aparece en el panel, actívala (+10). Si no, al terminar, en la barra del
     visor, «Texture» (AI Texturing, 10 créditos), con **Image Input** = la misma imagen,
     **2K**, **Remove Lighting** activado y **Generate PBR Maps** desactivado (el juego solo usa
     el color).
  5. Ni pose ni Rigging ni Animate: la pose fija es solo para humanoides y la animación la
     pone el juego. Smart Topology entrega la criatura separada en partes, y eso ayuda a
     animar cola, cabeza y aletas por separado.
  6. Descarga en **GLB**.
- **Coste:** 5 + 10 = 15 créditos por criatura: las 3 cuestan 45 de los 100 gratis y quedan 55
  para repetir. Si la forma sale tosca, se prueba «High Detail» con Meshy 6 Lite (10) y
  después Remesh a 10.000, que es gratis.
- **Licencia del plan gratis:** CC BY 4.0, uso comercial con atribución; el resultado es tuyo.
- **Si sale demasiado detallado**, cambia «moderate detail» por «low detail»; si sale pobre, por
  «rich but clean detail».

### Prompts de imagen

1. Épica (Aire):

```text
A legendary sky serpent dragon, long graceful serpentine body coiled in an elegant S-shape, floating, sky-blue body with a pearl-white belly, golden crescent horns, cloud-like fins along its spine, small feathered wing-fins behind the head, glowing aquamarine eyes, ribbon tail ending in a cloud tuft, majestic. Official-quality 2D character concept art in the clean anime style of modern monster-collecting RPGs: crisp clean linework, cel shading with soft highlights, flat saturated colors, moderate detail, big expressive eyes, appealing silhouette. Cute animal face with big round eyes and a small muzzle, never a human face. Bold simple shapes: a few large leaves, feathers or scales instead of many small ones. Single creature, full body, three-quarter front view, centered, plain white background, no shadow, no text.
```

2. Débil (Agua):

```text
A small chubby baby water creature like a sea otter pup, round body standing on four short legs, big glossy eyes, a translucent water-droplet crest on its head, webbed paws, flat paddle tail, cobalt-blue body with cream muzzle and belly, light-blue wave markings on its back, cheerful. Official-quality 2D character concept art in the clean anime style of modern monster-collecting RPGs: crisp clean linework, cel shading with soft highlights, flat saturated colors, moderate detail, big expressive eyes, appealing silhouette. Cute animal face with big round eyes and a small muzzle, never a human face. Bold simple shapes: a few large leaves, feathers or scales instead of many small ones. Single creature, full body, three-quarter front view, centered, plain white background, no shadow, no text.
```

3. Neutra (Común):

```text
A sturdy young bull creature, compact strong body standing on four legs, cream-beige body, fluffy chocolate-brown mane on neck and shoulders, two short ivory horns curving forward, single tufted tail, dark hooves, friendly determined eyes. Official-quality 2D character concept art in the clean anime style of modern monster-collecting RPGs: crisp clean linework, cel shading with soft highlights, flat saturated colors, moderate detail, big expressive eyes, appealing silhouette. Cute animal face with big round eyes and a small muzzle, never a human face. Bold simple shapes: a few large leaves, feathers or scales instead of many small ones. Single creature, full body, three-quarter front view, centered, plain white background, no shadow, no text.
```


## Las tres criaturas

| # | Papel | Arquetipo | Tipo | Archivo |
| --- | --- | --- | --- | --- |
| 1 | Épica, legendaria | Dragón serpiente del cielo | Aire | `serpiente-cielo.glb` |
| 2 | Débil, inicial | Cría de agua, tipo nutria | Agua | `cria-agua.glb` |
| 3 | Neutra, media | Toro joven | Común | `toro.glb` |

### Texto a 3D (alternativa, menos control)

#### 1. Épica: dragón serpiente del cielo (Aire)

```text
A legendary sky serpent dragon, long graceful serpentine body coiled in an elegant S-shape, floating, sky-blue body with a pearl-white belly, golden crescent horns, cloud-like fins along its spine, small feathered wing-fins behind the head, glowing aquamarine eyes, ribbon tail ending in a cloud tuft, majestic. Stylized 3D creature in the style of modern Japanese monster-collecting RPGs: clean smooth shapes, moderate detail, solid color areas with soft shading, no realistic fur or scale texture, big expressive anime eyes, appealing readable silhouette, single creature, full body, no base.
```

#### 2. Débil: cría de agua (Agua, inicial)

```text
A small chubby baby water creature like a sea otter pup, round body standing on four short legs, big glossy eyes, a translucent water-droplet crest on its head, webbed paws, flat paddle tail, cobalt-blue body with cream muzzle and belly, light-blue wave markings on its back, cheerful. Stylized 3D creature in the style of modern Japanese monster-collecting RPGs: clean smooth shapes, moderate detail, solid color areas with soft shading, no realistic fur or scale texture, big expressive anime eyes, appealing readable silhouette, single creature, full body, no base.
```

#### 3. Neutra: toro joven (Común)

```text
A sturdy young bull creature, compact strong body standing on four legs, cream-beige body, fluffy chocolate-brown mane on neck and shoulders, two short ivory horns curving forward, single tufted tail, dark hooves, friendly determined eyes. Stylized 3D creature in the style of modern Japanese monster-collecting RPGs: clean smooth shapes, moderate detail, solid color areas with soft shading, no realistic fur or scale texture, big expressive anime eyes, appealing readable silhouette, single creature, full body, no base.
```

## Cómo generarlas

Datos de Meshy sin comprobar directamente (su web está bloqueada en la red de la sesión de
Claude; salen de búsquedas, ver `investigacion/12-arte-criaturas.md`):

- El plan gratis da 100 créditos al mes. Un modelo con textura cuesta unos 30: dan para 3,
  sin margen para repetir.
- Lo que sale en el plan gratis tiene licencia CC BY 4.0: se puede usar citando a Meshy. Claude
  lo apunta en `CREDITS.md` al integrarlo.

Pasos:

1. «Text to 3D», con el modelo más reciente, y pega un prompt.
2. Si hay estilo artístico, elige el de dibujo o estilizado, nunca el realista.
3. Si deja elegir topología o polígonos: triángulos y unos 10.000–20.000. Si no, Claude lo
   reduce después.
4. Mira la forma antes de texturizar. Si no convence, no gastes en textura: dime qué falla y
   ajusto el prompt.
5. No hace falta esqueleto ni animación: la animación la pone el juego.
6. Descarga en **GLB**.

## Cómo pasárselas a Claude

Sube los `.glb` a GitHub, en la rama `claude/f04-creature-generator-art-test-54e7th`, carpeta
`six-seven-islands/public/modelos/prueba-meshy/`, con los nombres de la tabla. Se puede desde
el iPhone: en github.com, «Add file», «Upload files». El límite es de 25 MB por archivo.

Sube también las imágenes 2D que hayas usado (`.png`), con el mismo nombre que su modelo
(`serpiente-cielo.png`, etc.): Claude comprueba que el diseño es original y las guarda como
retratos.

Claude los coloca en la vitrina, con la misma luz que las criaturas del generador, para
comparar en el iPhone.

## Lo aprendido con la primera criatura de Meshy (2026-11-07)

El autor pasó a 3D una bestia del bosque (cuadrúpedo con astas, melena de hojas y flores).

- **Bien:** el detalle y la silueta suben muchísimo frente al generador por piezas; se lee
  épica y de tipo Planta de un vistazo.
- **Mal:**
  - El estilo es de fantasía occidental pintada, no el dibujo limpio del género.
  - La cara es casi humana y con ceño, nada «bonita».
  - Cientos de hojas pequeñas: a un tercio de la pantalla del móvil son ruido.
  - Hay manchas blancas en las hojas de los lados que la imagen no enseñaba.
- **Causa confirmada** con la imagen 2D que usó el autor:
  - era un dibujo de cómic occidental muy recargado, con cara de león seria y vista de
    perfil puro;
  - Meshy la copió con mucha fidelidad (la flor de la cola, las lianas, las patas de madera);
  - al ser de perfil, tuvo que inventarse el frente y el otro lado, y de ahí la cara rara y las
    manchas blancas.
  - Conclusión: si la imagen es buena, el 3D sale bueno. La imagen va siempre en tres cuartos.
- **Meshy 7** entrega la criatura separada en partes que se pueden ver despiezadas. Sirve para
  animar cola, cabeza y piezas por separado.
- **Lo que hizo falta cambiar en el estilo:** Por eso el bloque de
  estilo pide ahora una cara de animal con ojos grandes (nunca humana) y pocas formas grandes.
- **Meshy 7 para las difíciles:**
  - «High Detail» con Meshy 7.1 (20 créditos).
  - Después «Remesh» a triángulos, que es gratis; con el plan gratis solo hay un objetivo.
  - Textura con Meshy 7 Flagship (10).
  - En total, 30 créditos. Las normales siguen en 15 (Smart Topology T2 más textura).
- **Esqueleto:** Meshy hace gratis el de los humanoides y el de los cuadrúpedos («Quadruped
  Dog», con su animación de andar). Las demás formas usan «Smart Rig», sin biblioteca de
  animaciones. Fuente: docs.meshy.ai, rigging.
- **Cuenta para la isla 1:** ~23 criaturas, 3 difíciles a 30 y 20 normales a 15, son 390
  créditos; con repeticiones, unos 800. Cabe en un mes de Pro (1.000).

## Segunda tanda de imágenes (2026-11-08)

El autor generó dos imágenes de la bestia del bosque con el prompt corregido: una joven y
esbelta, y otra majestuosa, con melena de hojas y patas de madera.

- **Bien:** el estilo es el buscado (trazo limpio, colores planos, tres cuartos, fondo blanco y
  cara de animal) y sirven para pasar a 3D.
- **Antes del 3D:** astas más gruesas, con solo tres puntas, y sin chispas sueltas. Lo fino se
  rompe en Meshy y es ruido en el móvil. Edición para el generador: «same creature, thicker
  antlers with only three tines each, no floating sparkles».
- **R8:** sin flores en las astas, que es el rasgo de un ciervo conocido del género.
- **Propuesta de Claude (pendiente del autor):**
  - Que sean la 2.ª y la 3.ª forma de la línea de la inicial de Planta, con una cría como 1.ª.
  - Las diferencias entre hembra y macho, solo en unas pocas especies emblemáticas: duplican
    el coste y, si la hembra final parece una forma intermedia, confunden la evolución.
- **Prompt de la cría** (con la imagen joven como referencia en el generador):

```text
The baby first evolution of this same creature: a tiny chubby forest fawn-lion cub, big head, oversized round green eyes, two tiny wooden antler nubs with one sprouting leaf, a small collar of three large leaves, leaf-shaped tail tip, same leaf-green body, cream chest and brown paws, playful and curious. Same clean anime style of modern monster-collecting RPGs: crisp clean linework, cel shading, flat saturated colors, moderate detail. Single creature, full body, three-quarter front view, centered, plain white background, no shadow, no text.
```

