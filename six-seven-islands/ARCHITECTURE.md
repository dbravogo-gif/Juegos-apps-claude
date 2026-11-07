# Six-seven islands: Contrato de arquitectura

Todo agente lo lee antes de escribir código. Es el único mecanismo de coordinación entre
agentes. El patrón viene de *Claude of Duty* (Matt Shumer, MIT).

## Pila y dependencias

| Dependencia | Por qué hace falta |
| --- | --- |
| `three` (r187) | Render 3D: `WebGPURenderer`, con vuelta a WebGL2, y TSL para los shaders (skill `juego-3d`) |
| `vite` | Desarrollo y build. La misma versión que Leyendas de Iberia |
| `typescript` | Tipos en el núcleo, que es grande. La misma que Leyendas de Iberia |
| `vitest` | Pruebas del núcleo. La misma que Leyendas de Iberia |

- Sin motor de física: el mundo es una rejilla de casillas con alturas.
- El sonido, más adelante, con Web Audio o ZzFX (MIT, menos de 1 KB).

## El núcleo viene de Leyendas de Iberia

Se **copia y se adapta** `leyendas-de-iberia/src/core/`, que es obra del autor: generador con
semilla, tipos, estadísticas con Valía, daño, combate, captura, IA, pasivas y objetos.

- **No se importa entre proyectos.** Cada proyecto se construye y se publica por separado, y
  Leyendas de Iberia no se toca.
- El commit de origen se apunta en `src/core/ORIGEN.md`.
- **El cambio principal: el combate pasa a N contra N.** Cada lado tiene 1 o 2 criaturas activas,
  y cada acción lleva su objetivo. Hay que hacerlo antes de construir nada encima (R6).

## Reglas duras

1. **Cada subsistema es dueño de su carpeta.** Nadie edita carpetas ajenas.
2. **Ningún subsistema importa a otro.** Se piden en tiempo de ejecución con `ctx.get('id')`.
   `src/core/` y `src/data/` son bibliotecas puras: cualquiera las importa, pero ellas no
   importan nada de fuera.
3. **Ninguna dependencia nueva** sin justificarla en este archivo.
4. **Nada de `Math.random` ni de reloj en la lógica.** Se usa `ctx.rng`, o un `fork()` propio.
   `src/core/` no conoce el DOM, ni Three.js, ni el tiempo real.
5. **Nada de crear objetos en cada fotograma.** Se reservan en `init()` y se reutilizan.
6. **`dispose()` libera todo lo creado:** geometrías, materiales, texturas y objetivos de
   render.
7. **El estado de la partida vive en el núcleo.**
   - Lo avanza el subsistema `partida`, a paso fijo de 60 Hz: posición, pasos por la hierba,
     encuentros y combate.
   - El render solo interpola y presenta.
8. **El contenido son datos** (`src/data/`): especies, movimientos, objetos, zonas,
   entrenadores y guion. Se valida con pruebas: referencias que existen, niveles coherentes y
   nombres únicos.
9. **Tras cada cambio:** `npm test`, `npm run build` y una captura con
   `herramientas/capturar.mjs`.

## Interfaz de un subsistema

```ts
export class Sistema implements Subsistema {
  static id = 'sistema';      // único: así lo piden los demás
  static deps: string[] = []; // ids que deben iniciarse antes
  async init(ctx: Ctx) {}     // crea recursos
  pasoFijo?(h: number, ctx: Ctx) {}     // lógica determinista a frecuencia fija
  actualizar?(dt: number, ctx: Ctx) {}  // una vez por fotograma
  redimensionar?(w: number, h: number, ctx: Ctx) {}
  dispose() {}
}
```

`ctx` da acceso a: `escena`, `camara`, `config` (con el nivel de calidad), `eventos`, `entrada`,
`tiempo`, `rng` y `get(id)`.

## Mapa de propiedad

| id | Carpeta | Es dueño de |
| --- | --- | --- |
| (biblioteca) | `src/core/` | Las reglas puras: generador con semilla, tipos, estadísticas, daño, combate N contra N, captura, encuentros, progreso, economía, mundo lógico (posición, colisión por casillas y zonas) y serialización del guardado |
| (biblioteca) | `src/data/` | Solo datos: especies, movimientos, tipos, objetos, zonas, entrenadores y guion |
| `motor` | `src/motor/` | El bucle, `ctx`, el registro de subsistemas, el paso fijo, los eventos y los niveles de calidad |
| `render` | `src/sistemas/render/` | El renderizador, la escena, las luces, las sombras y el postproceso |
| `camara` | `src/sistemas/camara/` | La cámara de diorama y la de combate |
| `entrada` | `src/sistemas/entrada/` | El joystick flotante, el teclado y el gesto de lanzar |
| `mundo` | `src/sistemas/mundo/` | La malla de cada zona (terreno, hierba, agua y kit de piezas), y su carga y descarga |
| `criaturas` | `src/sistemas/criaturas/` | El generador de criaturas por piezas y su animación procedural |
| `personaje` | `src/sistemas/personaje/` | El jugador y los personajes generados, y la personalización |
| `combate` | `src/sistemas/combate/` | La escena de combate: presenta los eventos del núcleo, con sus efectos |
| `captura` | `src/sistemas/captura/` | El gesto, el vuelo del objeto y el resultado en pantalla |
| `interfaz` | `src/sistemas/interfaz/` | La interfaz en DOM: menús, diálogos, marcador, tienda y equipo |
| `partida` | `src/sistemas/partida/` | El estado del núcleo, los modos (explorar, combate, diálogo y menú) y el guardado automático |
| `depuracion` | `src/sistemas/depuracion/` | El panel de ajustes (solo en desarrollo) y los ganchos de `window.__JUEGO__` |
| `audio` | `src/sistemas/audio/` | El sonido generado por código. Llegará después |
| `red` | `src/sistemas/red/` | Presencia, retos y cooperativo. Llegará en la fase online |

## Eventos entre subsistemas

| Evento | Datos | Lo emite |
| --- | --- | --- |
| `zona:entrar` | `{ zonaId }` | `partida` |
| `encuentro:inicio` | `{ salvajes, visible }` | `partida` |
| `combate:evento` | un `EventoCombate` del núcleo | `partida` |
| `combate:decision` | `{ lado, activo, accion, objetivo }` | `interfaz` |
| `combate:fin` | `{ resultado }` | `partida` |
| `captura:lanzar` | `{ calidad }`, de 0 a 1 | `captura` |
| `captura:resultado` | `{ exito, sacudidas }` | `partida` |
| `dialogo:abrir` | `{ guionId }` | `partida` |
| `dialogo:cerrar` | `{ guionId, eleccion? }` | `interfaz` |
| `guardado:hecho` | `{}` | `partida` |
| `calidad:cambio` | `{ nivel }` | `depuracion` |

Un evento nuevo se añade a esta tabla en el mismo commit.

## Ganchos de prueba: `window.__JUEGO__`

- `estado()`: fotograma, modo, zona, posición, equipo resumido, dinero y fase del combate.
- `semilla(n)`: reinicia el generador.
- `poner(estado)`: carga un estado, sea una partida guardada o un escenario de prueba.

Los bots juegan con el estado, no con los píxeles (skill `juego-3d`).

## Guardado

- **Automático:** al cambiar de zona, al acabar cada combate y cada pocos segundos mientras se
  explora. Va en `localStorage`, con una versión de formato y migraciones.
- **Riesgo en Safari:**
  - WebKit borra el almacenamiento de las webs que llevan 7 días sin visitarse; las instaladas
    en la pantalla de inicio quedan fuera de esa regla. Fuente: el blog de WebKit, «Full
    Third-Party Cookie Blocking and More», marzo de 2020. Confianza media sobre cómo se aplica
    hoy.
  - Mitigación:
    - pedir `navigator.storage.persist()`,
    - recomendar instalar el juego como app,
    - y ofrecer exportar e importar la partida como código.
  - Hay que comprobarlo en el iPhone del autor.

## Calidad y presupuesto

- **Niveles de calidad:** móvil (empieza en bajo) y escritorio.
- **Densidad de píxeles:** como mucho 2.
- **Presupuesto:** `.claude/skills/juego-3d/referencias/rendimiento.md`. Reparto en móvil:

| Parte | Llamadas de dibujo | Notas |
| --- | --- | --- |
| `mundo` | ≤ 80 | Hierba y kit instanciados, troceados por zona |
| `criaturas` y `personaje` | ≤ 40 | Piezas fusionadas por criatura cuando no se animan por separado |
| `combate` y `captura` | ≤ 20 | Efectos instanciados |
| Postproceso | 1 pasada | *Bloom* a media resolución. Sin desenfoque de profundidad en móvil |

- **Sombras:** una luz con sombra, de 1024 en móvil y 2048 en escritorio.

Ningún subsistema supera su parte sin documentarlo aquí.
