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
- En F05 y el pase de arte con KayKit subió a 1.018 KB (283 KB comprimido): el mapa de la isla,
  el cargador glTF, `SkeletonUtils` y las animaciones. El reparto tampoco está medido.
- `BufferGeometryUtils`, `GLTFLoader` y `SkeletonUtils` (`three/addons/`) son parte de `three`:
  no son dependencias nuevas.
- **Personas de Meshy** (`arte/personas.ts`): el jugador y algunos personajes, sin la luz del
  juego, como las criaturas. Si traen esqueleto, el clip de correr se acelera según lo que va su
  pie apoyado, para que no patinen.
- **Modelos:** solo los 5 personajes de KayKit (CC0, `CREDITS.md`), 2,7 MB en
  `public/modelos/kaykit/`. Se cargan una vez con `src/arte/modelos.ts`. Los prepara
  `herramientas/recursos-kaykit.mjs`, que se ejecuta a mano con `@gltf-transform` instalado
  aparte: no es una dependencia del juego.
- **El mundo entero se hace por código,** sin descargas:
  - `arte/montaje.ts`: juntar piezas con color por vértice, azar determinista y deformaciones;
  - `mundo/canario.ts`: casas y faro;
  - `mundo/kit.ts`: plantas, rocas, muro, volcanes, nubes, boya y barca;
  - `mundo/mar.ts`: qué hay en el mar (plan puro) y su espuma, en una sola malla;
  - `core/encuentros.ts`: el sorteo de criaturas salvajes por zona (tablas en
    `data/encuentros-isla1.ts`). «partida» lo usa al pisar hierba y avisa con `encuentro:inicio`;
  - `core/economia.ts`: lo que se pierde al caer derrotado (el 10 % del dinero);
  - `mundo/terreno.ts`, `cumbres`: con `silueta` en la isla, toda la tierra de su costa que no es
    de ninguna zona, con alturas suaves (bajan junto al mar y a las zonas);
  - `mapa/`: el plano en 2D de la isla, sacado de los mismos datos (`plano.ts`, puro) y dibujado
    en un lienzo (`dibujo.ts`). Hoy, la vista `?mapa`; mañana, el mapa dentro del juego;
  - `salas/salas.ts`: los interiores.
- **Las islas son datos:** `data/isla1.ts` (Lanzarote) y `data/la-palma.ts` (guardada para la
  6). Se generan con un borrador en Python a partir de rectángulos y caminos; el mapa manda y las
  mismas pruebas de reglas vigilan las dos.
- **Los interiores salen de los edificios:** `data/interiores-isla1.ts` recorre los edificios
  del mapa y, para cada puerta, genera su sala con `data/generar-interior.ts`, del tamaño de su
  fachada y con dos plantas en las casas de balcones. Solo el nombre de la sala y quién vive en
  ella se escriben a mano.

- Sin motor de física: el mundo es una rejilla de casillas con alturas.
- El sonido, más adelante, con Web Audio o ZzFX (MIT, menos de 1 KB).

## El núcleo: reglas de Leyendas de Iberia, código propio

De Leyendas de Iberia, obra del autor, solo se toman **reglas de juego**, nunca contenido
(indicación del autor, 2026-11-07). El detalle, archivo por archivo, está en
`src/core/ORIGEN.md`.

- **No se importa entre proyectos.** La única excepción es una prueba, que compara la lista de
  tipos con la de Leyendas.
- **El combate es nuevo y N contra N:**
  - cada lado tiene 1 o 2 huecos activos;
  - cada acción lleva su objetivo;
  - cada lado lo controla un jugador o la IA.
- **La interfaz valida antes de enviar.** Usa `validarDecisiones` con todas las acciones de su
  lado, nunca hueco a hueco, antes de emitir `combate:decision`.
- **La IA solo la llama el combate.** Consume el generador, así que llamarla sobre el estado en
  vivo desincroniza a los jugadores online.
- **Propios de este juego, sin equivalente en Leyendas:**
  - `mundo.ts`: el mapa por casillas, con los interiores como mapas aparte;
  - `explorar.ts`: andar, puertas que se cruzan andando hacia ellas, entrar y salir;
  - `guion.ts`: diálogos por datos, con variantes según las condiciones y la inicial, pregunta
    de sí o no y efectos.

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
| (biblioteca) | `src/arte/` | La paleta, el material base compartido (`MaterialDiorama`, la receta de la skill `juego-3d`) y la escala del mundo (`escala.ts`: casilla de 1 unidad y escalón de 0,5). `modelos.ts` carga los glTF y los pasa al material del juego |
| `motor` | `src/motor/` | El bucle, `ctx`, el registro de subsistemas, el paso fijo, los eventos y los niveles de calidad |
| `render` | `src/sistemas/render/` | El renderizador, la escena, las luces, las sombras y el postproceso |
| `camara` | `src/sistemas/camara/` | La cámara de diorama: sigue al jugador en la isla, encuadra la sala entera en los interiores y, al hablar, se acerca y sube a 72° entre los dos. En combate la coloca «combate» |
| `entrada` | `src/sistemas/entrada/` | El teclado (no hay ratón): direcciones, interactuar (E, Enter o Espacio) y cancelar. Un toque corto cuenta como un paso, también si llega mientras se termina el anterior |
| `mundo` | `src/sistemas/mundo/` | La isla en 3D, toda por código: terreno en terrazas por alturas, cumbres, mar, casas canarias (`canario.ts`) y kit de naturaleza (`kit.ts`), con los estilos y colores de cada isla, instanciado por trozos de 12 × 12, pasos cerrados y objetos. Publica `tapas`, la altura de lo más alto de cada casilla. Lee «partida»; no la cambia |
| `criaturas` | `src/sistemas/criaturas/` | El generador de criaturas por piezas y su animación procedural. Se pide con `crear(aspecto)` y se anima con `accion(criatura, accion)` |
| `personaje` | `src/sistemas/personaje/` | El jugador y los personajes de la isla y de los interiores (KayKit, animados), que se giran hacia el jugador al hablar; la silueta cuando algo tapa al jugador (con las `tapas` de «mundo») y las líneas de visión; más adelante, el generador y la personalización (F12) |
| `salas` | `src/sistemas/salas/` | Los interiores en 3D, por código: dioramas pequeños lejos de la isla, con la pared de delante baja, paredes y mostradores por tramos, muebles según las letras del mapa y los pedestales del museo con el modelo de cada inicial en piedra. Una malla por sala |
| `companera` | `src/sistemas/companera/` | La inicial elegida, que va una casilla detrás del jugador por su mismo camino (`rastro.ts`). Lee «partida» y «personaje» |
| `combate` | `src/sistemas/combate/` | El combate, en una arena aparte: fondo pintado, dos plataformas y las criaturas en diagonal; fichas de vida, mensajes y menú de ataques con teclado; presenta los eventos del núcleo con sus animaciones. Por ahora con datos provisionales (`data/combate-prueba.ts`) y solo con el primer entrenador. Emite `combate:fin` |
| `captura` | `src/sistemas/captura/` | El gesto, el vuelo del objeto y el resultado en pantalla |
| `interfaz` | `src/sistemas/interfaz/` | La interfaz en DOM: el cartel de zona, la caja de diálogo (quién habla, texto letra a letra y sí o no), el fundido al cruzar puertas y la ayuda; después, menús, marcador, tienda y equipo |
| `partida` | `src/sistemas/partida/` | El estado del núcleo (la isla y sus interiores), los modos (explorar, diálogo, fundido y combate; después menú) y el guardado automático. Avanza a paso fijo con la entrada |
| `depuracion` | `src/sistemas/depuracion/` | El panel de ajustes (solo en desarrollo) y los ganchos de `window.__JUEGO__` |
| (vista `?mapa`) | `src/sistemas/mapa/` | Herramienta y base del mapa del juego: el plano 2D de la isla 1 a pantalla completa, sin 3D. `?mapa=12` fija 12 píxeles por casilla |
| `inicio` | `src/sistemas/inicio/` | La portada de una partida nueva: elegir persona (las jugables de `arte/personas.ts`) y escribir el nombre. Sale mientras «partida» está en modo «titulo» |
| `sonido` | `src/sistemas/sonido/` | Efectos (tabla `EFECTOS`) y música en bucle (explorar y combate) con Web Audio, sin archivos. Arranca con la primera tecla y se silencia desde el menú |
| `menu` | `src/sistemas/menu/` | El menú de pausa (Esc explorando): equipo (rejilla con Datos, Mover y Objeto), mochila por bolsillos (`data/bolsillos.ts`, dibujada con `arte/mochila.ts`), medallero, mapa y opciones (sonido, exportar o importar la partida, nueva partida), y la tienda. Cambia el orden del equipo y gasta objetos de «partida». Las medallas salen de `data/medallas.ts` y se dibujan con `arte/pintaderas.ts` (SVG por código, puro) |
| `catalogo` | `src/sistemas/catalogo/` | Herramienta, no juego: con `?catalogo` o `?catalogo=edificios`, las piezas propias del mundo en fila, con la luz y la cámara del juego; ← → acercan la cámara a cada una |
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
| `dialogo:abrir` | `{ guionId }`: el id del personaje, o `aviso`, `objeto` o `puerta` | `partida` |
| `dialogo:cerrar` | `{ guionId, eleccion? }` | `partida` |
| `guardado:hecho` | `{}` | `partida` |
| `entrenador:visto` | `{ id }` | `partida` |
| `menu:abrir` | `{}` | `partida` |
| `jugador:viaja` | `{ isla }` | `partida` (justo antes de recargar en la otra isla) |
| `tienda:abrir` | `{}` | `partida` |
| `jugador:elegido` | `{ nombre, persona }` | `partida` |
| `sonido:tocar` | `{ nombre }` | `partida`, `combate`, `menu`, `inicio` |
| `sonido:alternar` | `{}` | `menu` |
| `medalla:ganada` | `{ isla }` | `partida` (al volver de vencer a un líder) |
| `calidad:cambio` | `{ nivel }` | `depuracion` |
| `objeto:recogido` | `{ id, objeto }` | `partida` |
| `inicial:elegida` | `{ tipo }` | `partida` |

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

## Islas y viajes

- `data/islas.ts` reúne lo propio de cada isla (mapa, puertas, interiores, encuentros,
  entrenadores, guion, objetivos, curanderos, tenderos, refugio y llegada en barco). «partida»,
  «combate» y el menú leen `partida.datos`, la isla actual.
- **Viajar en barco** (efecto de diálogo `viaje`): fundido a negro, se guarda la partida en la isla
  de destino, junto a su muelle, y se recarga la página. Así cada isla se monta desde cero con
  todos los subsistemas, sin tener que desmontar la anterior. El guardado lleva `isla`.

## Guardado

- **Automático** (hecho el 2026-11-12): al cambiar de zona, al cruzar una puerta, al acabar cada
  combate, cada 5 segundos explorando y al cerrar u ocultar la pestaña (`pagehide` y
  `visibilitychange`; en combate no). «Nueva partida», en el menú de pausa, lo borra y vuelve a la
  portada. Cada partida nueva tiene su propio azar; `?semilla=N` lo fija para las pruebas. Va en `localStorage` (`six-seven-islands:partida`), con
  versión de formato (`core/guardado.ts`). Si el mapa cambia y la casilla guardada ya no se pisa,
  se vuelve a casa conservando el equipo y los avances. `?nueva` empieza sin cargar.
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

- **Medido con el kit canario** (2026-11-08, todo el juego en calidad media):
  - el peor punto es el claro del bosque, con 211 llamadas y 623.000 triángulos;
  - el pueblo, 197 llamadas y 473.000 triángulos;
  - la zona inicial, 92 llamadas y 100.000 triángulos.
  - Para bajar llamadas, las piezas del kit tienen 1 a 3 variantes y la decoración del suelo
    (flores, matas y lajas) no proyecta sombra. Con el kit entero llegaban a 268.
  - Lo que más pesa en triángulos son los laureles (300 cada uno) y las plataneras: la primera
    rebaja sería una variante ligera para el interior del bosque, que solo enseña la copa.
  - No está medido por subsistema.
- **Medido en combate** (2026-11-10): 12 llamadas y 60.000 triángulos, con dos criaturas de
  Meshy de unos 15.000 triángulos cada una.
- **Medido en Lanzarote** (2026-11-10, calidad media, con conos, coladas altas y guijarros):
  - el peor punto es la caldera de las Montañas del Fuego, con 250 llamadas y 295.000
    triángulos: es lo que más lajas de colada ve a la vez;
  - La Geria, 191 llamadas y 283.000 triángulos (las viñas);
  - la zona inicial, 92 llamadas y 82.000 triángulos.
  - Los volcanes de las cumbres y las nubes van en trozos de 48 casillas, no de 12: están
    lejos y dispersos, y así cuestan pocas llamadas.
  - Queda por debajo del tope de 300, pero el reparto de `mundo` (≤ 160) se supera en la
    caldera. La primera rebaja sería una colada más ligera (menos lajas por casilla).

Ningún subsistema supera su parte sin documentarlo aquí.
