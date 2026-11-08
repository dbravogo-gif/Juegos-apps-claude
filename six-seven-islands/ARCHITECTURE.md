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
| `@types/three` | Los tipos de Three.js para TypeScript. Solo en desarrollo |

- **Instalar:** `npm ci`. El `npm install` desde cero falla con un error interno de npm 10.9
  (`edgesOut`). Para añadir un paquete, se parte de este `package-lock.json`.
- **El paquete pesa 900 KB (248 KB comprimido),** casi todo de Three.js con WebGPU. Se vigila en
  cada build. En F04 subió desde 822 KB (223 KB): el generador de criaturas y lo que trae de
  Three.js (geometrías de torno, tubo y extrusión, `BufferGeometryUtils` y el ruido celular de
  TSL). El reparto exacto no está medido.
- `three/addons/utils/BufferGeometryUtils.js` es parte de `three`: no es una dependencia nueva.

- Sin motor de física: el mundo es una rejilla de casillas con alturas.
- El sonido, más adelante, con Web Audio o ZzFX (MIT, menos de 1 KB).

## El núcleo: reglas de Leyendas de Iberia, código propio

De Leyendas de Iberia, obra del autor, solo se toman **reglas de juego**, nunca contenido
(indicación del autor, 2026-11-07). El detalle, archivo por archivo, está en
`src/core/ORIGEN.md`.

- **No se importa entre proyectos.** La única excepción es una prueba, que compara la tabla de
  tipos con la de Leyendas.
- **El combate es nuevo y N contra N:**
  - cada lado tiene 1 o 2 huecos activos;
  - cada acción lleva su objetivo;
  - cada lado lo controla un jugador o la IA.
- **La interfaz valida antes de enviar.** Usa `validarDecisiones` con todas las acciones de su
  lado, nunca hueco a hueco, antes de emitir `combate:decision`.
- **La IA solo la llama el combate.** Consume el generador, así que llamarla sobre el estado en
  vivo desincroniza a los jugadores online.

## Reglas duras

1. **Cada subsistema es dueño de su carpeta.** Nadie edita carpetas ajenas.
2. **Ningún subsistema importa a otro.** Se piden en tiempo de ejecución con `ctx.get('id')`.
   `src/core/` y `src/data/` son bibliotecas puras: cualquiera las importa, pero ellas no
   importan nada de fuera. `src/arte/` es la biblioteca visual compartida: puede usar Three.js,
   `src/core/` y `src/data/`, pero ningún subsistema.
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
  dibujar?(ctx: Ctx) {}                 // al final del fotograma: solo el render
  redimensionar?(w: number, h: number, ctx: Ctx) {}
  dispose() {}
}
```

- **`ctx` da acceso a:** `escena`, `camara`, `config` (con el nivel de calidad), `eventos`,
  `tiempo`, `rng`, `get(id)` y `tiene(id)`.
- **La entrada** será el subsistema `entrada`, que se pide con `get`.
- **Orden de cada fotograma:** los pasos fijos que tocan, después `actualizar()` de todos y al
  final `dibujar()`. Es el código de `src/motor/motor.ts`.

## Mapa de propiedad

| id | Carpeta | Es dueño de |
| --- | --- | --- |
| (biblioteca) | `src/core/` | Las reglas puras: generador con semilla, tipos, estadísticas, daño, combate N contra N, captura, encuentros, progreso, economía, mundo lógico (posición, colisión por casillas y zonas) y serialización del guardado |
| (biblioteca) | `src/data/` | Solo datos: especies, movimientos, tipos, objetos, zonas, entrenadores, guion y fichas de aspecto |
| (biblioteca) | `src/arte/` | La paleta, el material base compartido (`MaterialDiorama`, la receta de la skill `juego-3d`) y la escala del mundo (`escala.ts`: casilla de 1 unidad y escalón de 0,5) |
| `motor` | `src/motor/` | El bucle, `ctx`, el registro de subsistemas, el paso fijo, los eventos y los niveles de calidad |
| `render` | `src/sistemas/render/` | El renderizador, la escena, las luces, las sombras y el postproceso |
| `camara` | `src/sistemas/camara/` | La cámara de diorama y la de combate |
| `entrada` | `src/sistemas/entrada/` | El teclado (no hay ratón): direcciones, confirmar y cancelar. Un toque corto cuenta como un paso |
| `mundo` | `src/sistemas/mundo/` | La isla en 3D: terreno en terrazas por alturas, cumbres, mar, edificios, decoración por trozos de 12 × 12, pasos cerrados y objetos. Lee «partida»; no la cambia |
| `criaturas` | `src/sistemas/criaturas/` | El generador de criaturas por piezas y su animación procedural. Se pide con `crear(aspecto)` y se anima con `accion(criatura, accion)` |
| `personaje` | `src/sistemas/personaje/` | El jugador (con silueta cuando algo lo tapa), los personajes y las líneas de visión; más adelante, el generador y la personalización (F12) |
| `combate` | `src/sistemas/combate/` | La escena de combate: presenta los eventos del núcleo, con sus efectos |
| `captura` | `src/sistemas/captura/` | El gesto, el vuelo del objeto y el resultado en pantalla |
| `interfaz` | `src/sistemas/interfaz/` | La interfaz en DOM: menús, diálogos, marcador, tienda y equipo |
| `partida` | `src/sistemas/partida/` | El estado del núcleo, los modos (explorar y aviso; después combate, diálogo y menú) y el guardado automático. Avanza a paso fijo con la entrada |
| `depuracion` | `src/sistemas/depuracion/` | El panel de ajustes (solo en desarrollo) y los ganchos de `window.__JUEGO__` |
| `prueba` | `src/sistemas/prueba/` | **Temporal:** la vitrina de la prueba de arte (`F04`), con `?vitrina`. Se queda para probar los modelos de Meshy; se borra cuando las criaturas entren en el juego |
| `audio` | `src/sistemas/audio/` | El sonido generado por código. Llegará después |
| `red` | `src/sistemas/red/` | Presencia, retos y cooperativo. Llegará en la fase online |

## Eventos entre subsistemas

| Evento | Datos | Lo emite |
| --- | --- | --- |
| `zona:entrar` | `{ zonaId }` | `partida` |
| `encuentro:inicio` | `{ salvajes, visible }` | `partida` |
| `combate:evento` | un `EventoCombate` del núcleo | `partida` |
| `combate:decision` | `{ lado, hueco, accion }`; la acción lleva su objetivo | `interfaz` |
| `combate:fin` | `{ resultado }` | `partida` |
| `captura:lanzar` | `{ calidad }`, de 0 a 1 | `captura` |
| `captura:resultado` | `{ exito, sacudidas }` | `partida` |
| `dialogo:abrir` | `{ guionId }` | `partida` |
| `dialogo:cerrar` | `{ guionId, eleccion? }` | `interfaz` |
| `guardado:hecho` | `{}` | `partida` |
| `calidad:cambio` | `{ nivel }` | `depuracion` |
| `aviso:mostrar` | `{ texto }` | `partida` |
| `aviso:cerrar` | `{}` | `partida` |
| `objeto:recogido` | `{ id, objeto }` | `partida` |

Un evento nuevo se añade a esta tabla en el mismo commit.

## Ganchos de prueba: `window.__JUEGO__`

- `estado()`: fotograma, modo, zona, posición, equipo resumido, dinero y fase del combate.
- `semilla(n)`: reinicia el generador.
- `poner(estado)`: carga un estado, sea una partida guardada o un escenario de prueba.
- `contadores()`: los del render en el último fotograma dibujado. Se toman al dibujar, porque
  Three.js los pone a cero al empezar cada fotograma.
- `calidad(nivel)`: cambia el nivel de calidad en vivo.

Los bots juegan con el estado, no con los píxeles (skill `juego-3d`).

**Panel de depuración:** sale en desarrollo y, en la web publicada, añadiendo `?depurar` a la
dirección. Muestra el backend, los FPS, los contadores y el selector de calidad. Sirve para que
el autor mida en su ordenador, que es donde los FPS valen. Otros parámetros: `?calidad=bajo|medio|alto`
y `?semilla=n`. Mientras exista la vitrina de F04: `?vista=combate|todas|explorar|tipos`,
`?criatura=0..3`, `?gris` y `?lento=0.1` (cámara lenta, para revisar las animaciones). En el juego,
`?abrir=todo` abre los pasos cerrados para recorrer la isla entera.
- **Dos arranques:** el juego por defecto y la vitrina con `?vitrina` (`src/main.ts`).

## Guardado

- **Automático:** al cambiar de zona, al acabar cada combate y cada pocos segundos mientras se
  explora. Va en `localStorage`, con una versión de formato y migraciones.
- **Registro de partidas completadas:** con qué iniciales se ha terminado el juego. Va en una
  clave aparte, que sobrevive al empezar una partida nueva, porque lo necesita el regalo por
  rejugar (`DISENO.md`).
- **Riesgo si se juega en Safari (Mac):**
  - WebKit borra el almacenamiento de las webs que llevan 7 días sin visitarse. Fuente: el blog
    de WebKit, «Full Third-Party Cookie Blocking and More», marzo de 2020. Confianza media
    sobre cómo se aplica hoy.
  - Mitigación: pedir `navigator.storage.persist()` y ofrecer exportar e importar la partida
    como código. En Chrome y Edge no aplica.

## Calidad y presupuesto

- **Solo ordenador** (2026-11-08). Se usa el presupuesto de escritorio de la skill.
- **Niveles de calidad:**
  - **medio por defecto:** son portátiles que mueven juegos ligeros, a menudo con gráfica
    integrada y, en los Mac, pantalla de densidad 2;
  - alto si van holgados; bajo para los flojos.
  - Se ajustan cuando se midan los FPS en sus equipos con `?depurar`.
- **Densidad de píxeles:** como mucho 2.
- **Presupuesto:** `.claude/skills/juego-3d/referencias/rendimiento.md`, columna de escritorio
  (≤ 300 llamadas y ≤ 750.000 triángulos). Reparto:

| Parte | Llamadas de dibujo | Notas |
| --- | --- | --- |
| `mundo` | ≤ 160 | Hierba y kit instanciados, troceados por zona |
| `criaturas` y `personaje` | ≤ 80 | Piezas fusionadas por hueso (ver abajo). Medido en F04: 36 para las 4 criaturas de la prueba |
| `combate` y `captura` | ≤ 40 | Efectos instanciados |
| Postproceso | 2 pasadas | *Bloom* y desenfoque de profundidad (*tilt-shift*). En calidad baja, solo *bloom* a media resolución |

- **Sombras:** una luz con sombra, de 2048 (1024 en calidad baja).
- **El pase de sombras cuenta:** cada malla que proyecta sombra es una llamada más en
  `llamadas`. Una criatura es una malla por hueso (cuerpo, cabeza, ojos, copete, cola y dos
  apéndices, como mucho 7); los ojos y la cara pintada no proyectan sombra. Coste medido: de 6 a
  11 llamadas por criatura. Una prueba comprueba que 4 criaturas del generador caben en 40,
  la mitad de su reparto.

Ningún subsistema supera su parte sin documentarlo aquí.
