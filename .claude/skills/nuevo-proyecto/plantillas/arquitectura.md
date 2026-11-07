# <Nombre>: Contrato de arquitectura

Todo agente lo lee antes de escribir código. Es el único mecanismo de coordinación entre
agentes. El patrón viene de *Claude of Duty* (Matt Shumer, MIT).

## Reglas duras

1. **Cada subsistema es dueño de su carpeta.** Nadie edita carpetas ajenas.
2. **Ningún subsistema importa a otro.** Se piden en tiempo de ejecución: `ctx.get('id')`.
3. **Ninguna dependencia nueva** sin justificarla en este archivo.
4. **Nada de `Math.random` ni de reloj en la lógica.** Se usa `ctx.rng`, o un `fork()` propio.
5. **Nada de crear objetos en cada fotograma.** Se reservan en `init()` y se reutilizan.
6. **`dispose()` libera todo lo creado:** geometrías, materiales, texturas y objetivos de
   render.
7. **Tras cada cambio:** `npm test`, `npm run build` y una captura con
   `herramientas/capturar.mjs`.

## Interfaz de un subsistema

```js
export class Sistema {
  static id = 'sistema';     // único: así lo piden los demás
  static deps = [];          // ids que deben iniciarse antes
  async init(ctx) {}         // crea recursos
  pasoFijo(h, ctx) {}        // opcional: lógica determinista a frecuencia fija
  actualizar(dt, ctx) {}     // opcional: una vez por fotograma
  redimensionar(w, h, ctx) {}
  dispose() {}
}
```

`ctx` da acceso a: `escena`, `camara`, `config` (con el nivel de calidad), `eventos`, `entrada`,
`tiempo`, `rng` y `get(id)`.

## Mapa de propiedad

| id | Carpeta | Es dueño de |
| --- | --- | --- |
| | | |

## Eventos entre subsistemas

| Evento | Datos | Lo emite |
| --- | --- | --- |
| | | |

Un evento nuevo se añade a esta tabla en el mismo commit.

## Presupuesto

Llamadas de dibujo, triángulos, texturas, sombras y pasadas: ver
`.claude/skills/juego-3d/referencias/rendimiento.md`. Ningún subsistema supera su parte sin
documentarlo.
