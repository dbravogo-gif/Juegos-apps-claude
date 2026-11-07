# Prueba de arte con Meshy (F04, segunda vuelta)

2026-11-07. El autor quiere criaturas bonitas, y algunas épicas, al nivel de los juegos del
género. Se prueba la IA 3D de Meshy con su plan gratis antes de decidir el método de arte
(`DISENO.md`, decisiones abiertas).

## Reglas de los prompts (R8)

- Nunca se nombra a Pokémon ni a ninguna criatura o juego ajenos. Se describe un arquetipo con
  diseño propio: colores, piezas y anatomía distintos de cualquier criatura conocida.
- Si un resultado recuerda claramente a una criatura existente, se descarta.
- El color principal es el de su tipo (`ARTE.md`).
- Los tres comparten el mismo bloque de estilo, para que parezcan del mismo juego.
- En inglés, porque los generadores responden mejor así.

## Las tres criaturas

| # | Papel | Arquetipo | Tipo | Archivo |
| --- | --- | --- | --- | --- |
| 1 | Épica, legendaria | Dragón serpiente del cielo | Aire | `serpiente-cielo.glb` |
| 2 | Débil, inicial | Cría de agua, tipo nutria | Agua | `cria-agua.glb` |
| 3 | Neutra, media | Toro joven | Común | `toro.glb` |

### 1. Épica: dragón serpiente del cielo (Aire)

```text
A legendary sky serpent dragon, long graceful serpentine body coiled in an elegant S-shape as if floating in the air, pearl-white belly and sky-blue scales, golden crescent horns, flowing cloud-like fins along its spine, small feathered wing-fins behind the head, glowing aquamarine eyes, long ribbon tail ending in a wispy cloud tuft, majestic and kind. Stylized 3D creature for a cute monster-collecting adventure game, smooth vinyl-toy finish, clean readable silhouette, saturated colors, single creature, full body, no base.
```

### 2. Débil: cría de agua (Agua, inicial)

```text
A small chubby baby sea-otter-like water creature, round soft body on four short stubby legs, short soft fur, big glossy eyes, a translucent water-droplet crest on top of its head, webbed paws, flat paddle tail, cobalt-blue fur with a cream muzzle and belly and light-blue wave markings on its back, cheerful and a little shy. Stylized 3D creature for a cute monster-collecting adventure game, smooth vinyl-toy finish, clean readable silhouette, saturated colors, single creature, full body, standing, no base.
```

### 3. Neutra: toro joven (Común)

```text
A sturdy young bull creature, compact muscular body standing proudly on four legs, warm cream-beige short fur, a fluffy chocolate-brown mane around the neck and shoulders, two short ivory horns curving forward, a single tufted tail, dark hooves, friendly but determined eyes. Stylized 3D creature for a cute monster-collecting adventure game, smooth vinyl-toy finish, clean readable silhouette, saturated colors, single creature, full body, standing, no base.
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

Claude los coloca en la vitrina, con la misma luz que las criaturas del generador, para
comparar en el iPhone.
