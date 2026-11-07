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
- **Requisitos de la imagen para pasarla a 3D:** una sola criatura, entera, en vista de tres
  cuartos, centrada y sobre fondo blanco liso, sin sombra en el suelo y sin texto.
- **Meshy:** «Image to 3D» con Meshy 6 Lite y **Smart Topology** (no «alto detalle» ni
  «relieve», que son para figuras). Si queda pobre, se repite solo la épica con el modelo
  completo, para saber si Lite basta.
- **Polígonos:** unos 10.000 triángulos para la cría y el toro, y 15.000–20.000 para la
  serpiente (larga y con piezas finas). En cuadriláteros, la mitad. Triángulos si se puede
  elegir. Nunca menos de unos 8.000. Si hay duda, mejor de más: Claude reduce sin coste y no
  puede añadir detalle. Presupuesto: 4 criaturas en un 2 contra 2 son ~40.000 de los 300.000 del
  móvil.
- **Si sale demasiado detallado**, cambia «moderate detail» por «low detail»; si sale pobre, por
  «rich but clean detail».

### Prompts de imagen

1. Épica (Aire):

```text
A legendary sky serpent dragon, long graceful serpentine body coiled in an elegant S-shape, floating, sky-blue body with a pearl-white belly, golden crescent horns, cloud-like fins along its spine, small feathered wing-fins behind the head, glowing aquamarine eyes, ribbon tail ending in a cloud tuft, majestic. Official-quality 2D character concept art in the clean anime style of modern monster-collecting RPGs: crisp clean linework, cel shading with soft highlights, flat saturated colors, moderate detail, big expressive eyes, appealing silhouette. Single creature, full body, three-quarter front view, centered, plain white background, no shadow, no text.
```

2. Débil (Agua):

```text
A small chubby baby water creature like a sea otter pup, round body standing on four short legs, big glossy eyes, a translucent water-droplet crest on its head, webbed paws, flat paddle tail, cobalt-blue body with cream muzzle and belly, light-blue wave markings on its back, cheerful. Official-quality 2D character concept art in the clean anime style of modern monster-collecting RPGs: crisp clean linework, cel shading with soft highlights, flat saturated colors, moderate detail, big expressive eyes, appealing silhouette. Single creature, full body, three-quarter front view, centered, plain white background, no shadow, no text.
```

3. Neutra (Común):

```text
A sturdy young bull creature, compact strong body standing on four legs, cream-beige body, fluffy chocolate-brown mane on neck and shoulders, two short ivory horns curving forward, single tufted tail, dark hooves, friendly determined eyes. Official-quality 2D character concept art in the clean anime style of modern monster-collecting RPGs: crisp clean linework, cel shading with soft highlights, flat saturated colors, moderate detail, big expressive eyes, appealing silhouette. Single creature, full body, three-quarter front view, centered, plain white background, no shadow, no text.
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
