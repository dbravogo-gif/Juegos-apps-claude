# App viación — documento de diseño

Nombre decidido por el autor. Simulador de aerolínea para móvil: fundas una compañía minúscula a
mediados de los años 70, con un avión de segunda mano y una base en un aeropuerto real, y la
llevas a través de 50 años de historia de la aviación.

Estado: **versión 3 jugable** (núcleo realista de la v2 más competencia, mercado,
reputación y noticias; ver «Versión 3» al final). Las reglas del autor están en `CRITERIOS.md` y mandan sobre este
documento. Lo marcado como *pendiente* se cierra antes de programar esa parte.

Decisiones cerradas:

| Tema | Decisión |
| --- | --- |
| Inicio | Enero de 1976 |
| Base | La elige el jugador entre todos los aeropuertos abiertos en 1976 |
| Aeropuertos | Ciudades principales de cada continente, una o dos por país y solo en los países con más peso; EE. UU. tiene algunos más. Canarias completa, con TFS (1978) y GMZ (1999) apareciendo cuando abrieron |
| Tono de los accidentes | Crudo pero sin personas: tres escenas animadas que solo muestran el avión (salida de pista, impacto en la aproximación, fallo en vuelo) y después un avance informativo con fallecidos y heridos |


## La fantasía

- **Cada vuelo puede ser una decisión.** Tú decides si sale o no, sabiendo el tiempo que
  hace, el estado del avión, la tripulación y el aeropuerto. Si te arriesgas, ganas dinero o
  pierdes un avión.
- **La historia avanza contigo.** Empiezas con DC-9, 727 y turbohélices viejos, y vives la
  liberalización del mercado, la llegada del A320 y los bimotores transoceánicos, las crisis y
  el auge del low cost.
- **Las personas cuentan.** Entrevistas a tu gente, y luego puede brillar o liarla.

## Pantalla principal: el globo

- Globo terráqueo que se gira con el dedo. Muestra los aeropuertos, tus bases, las rutas como
  arcos de círculo máximo y tus aviones moviéndose.
- El tiempo corre acelerado, con pausa y varias velocidades. Las decisiones aparecen como
  **tarjetas** que pausan el juego si son urgentes.
- Hay paneles para la flota, el personal, las rutas, las finanzas y el mercado de aviones.

## El despacho de vuelo (el núcleo)

La hoja de despacho de cada vuelo dudoso muestra:

| Bloque | Qué enseña |
| --- | --- |
| Valoración | Probabilidad de incidencias y riesgo grave **en palabras** (muy bajo → muy alto), nunca porcentajes; y «lo más probable si sale» |
| Fuera de norma | Revisiones vencidas, averías fuera de límites, MEL caducada, directivas, tripulación por encima de 13 h, previsión bajo mínimos |
| Meteo prevista | Origen, ruta y destino; visibilidad contra el mínimo de esa aproximación |
| Destino | ILS y categoría que admite el avión, pista disponible, terreno |
| Avión | Averías conocidas, GPWS, radar |
| Tripulación | Horas de actividad al llegar, llegada de noche |
| Negocio | Pasajeros e ingreso |

Opciones: **despegar**, **combustible extra** (más margen para esperar o desviarse),
**retrasar 2 h**, **cancelar**, y cuando hay algo vencido: **traslado a la base sin pasaje**
(permiso especial de vuelo) o, si ya está en la base, **cancelar y mandarlo al taller**.

**Información imperfecta.** La valoración usa la previsión (que falla a veces) y solo las
averías conocidas. Lo que nadie ha inspeccionado no aparece.

**Delegación.** El jugador elige cuándo le consultan: en cada vuelo, si hay algo anormal,
solo si es serio, o lo mínimo. Cuando decide el despachador no firma nada fuera de norma:
retiene y, si no mejora, cancela los vuelos con previsión bajo mínimos, y carga combustible
extra si el tiempo va justo. Lo que esté fuera de norma por el avión o la tripulación lo
decide siempre el jugador.

**Resultados graduados**: normal, espera, desvío, motor parado, aterrizaje de emergencia,
daños e inmovilización y, raras veces, accidente.

- Un accidente cuesta el avión, hunde la reputación y abre una **investigación** de 30 días
  con causa probable y 1–3 factores. Si hubo culpa de la compañía, no paga el seguro y llega
  una multa; si fue un fallo técnico del tipo, la autoridad emite una directiva para toda la
  flota de ese modelo.
- **Tono**: crudo pero contenido. Tres escenas animadas (aproximación, salida de pista, en
  vuelo) que solo muestran el avión, con su silueta según el modelo; después, un avance del
  «Diario Nacional» con fallecidos y heridos, y al mes el informe de la investigación.

## 50 años de historia

Empieza hacia **1976** (*pendiente*: quizá con la opción de empezar en otras épocas).

- **Aviones por época.** Cada modelo entra en servicio y se retira en su año aproximado:
  turbohélices como el F27, DC-9, 727, 737-200, DC-10, 747; después el ATR, el A320, el 777;
  y más tarde el A380 y el 787. Hay también algunos modelos ficticios: prototipos raros y
  gangas del Este de dudosa fiabilidad.
- **La seguridad mejora con los años.** El radar meteorológico, el ILS en más aeropuertos y
  los motores más fiables hacen que el riesgo base baje década a década. Volar en 1976 es más
  peligroso que en 2016.
- **Eventos históricos** que cambian las reglas: la crisis del petróleo de 1979, la
  liberalización del mercado (primero en EE. UU. y después en Europa en los 90), la caída de
  la URSS (se abre su espacio aéreo), los bimotores sobre el océano (ETOPS), la crisis de
  seguridad de 2001, la crisis de 2008 y la pandemia de 2020.
- **Mercado regulado al principio.** Para abrir una ruta internacional hace falta un
  permiso. Con la liberalización llega la competencia de las low cost.

**Ritmo**: a la velocidad máxima un día dura 2 segundos y un año unos 12 minutos sin
contar las pausas, así que la campaña completa son unas 10 horas repartidas en muchas
sesiones. Cada vuelo rutinario se simula solo: las hojas aparecen cuando hay algo que decidir.

## Aviones de segunda mano

Cada avión del mercado tiene un año, horas de vuelo, ciclos, un estado por pieza (motores,
tren y fuselaje) y un **historial que puede ocultar cosas**.

- Una **inspección previa a la compra** cuesta dinero y revela defectos. Comprar sin
  inspeccionar es más barato, y una apuesta.
- Los motores se desgastan y se pueden revisar o cambiar. Aquí entra el arte de piezas.

## Aeropuertos y bases

- Unos 60–100 aeropuertos reales, cada uno con coordenadas, tamaño (demanda), calidad (pista,
  ILS, servicios), tasas y **perfil climático por estación**: niebla en Londres en invierno,
  monzón en Bombay, nieve en Moscú, huracanes en el Caribe.
- La calidad de un aeropuerto mejora con los años, igual que en la realidad.
- **Base**: el aeropuerto donde tienes tripulaciones y mantenimiento. Solo puedes operar
  rutas que salgan de una base; abrir una nueva cuesta dinero y da acceso a otra región.
- **Demanda entre ciudades**: según su población, el turismo y la distancia, y repartida
  entre las aerolíneas de la competencia.

## Personal

- **Entrevistas.** Cada candidato tiene rasgos ocultos (competencia, honestidad, temperamento,
  ambición). Tus preguntas revelan pistas, y el currículum puede mentir.
- **Puestos**: pilotos, mecánicos, despachador, jefe de operaciones, comercial y director
  financiero.
- **Pueden liarla**: el piloto que llega con resaca, el mecánico que firma una revisión sin
  hacerla, la azafata que se hace viral, una huelga, un intento de soborno, un fichaje de la
  competencia. Cada evento es una tarjeta con decisión y consecuencias.
- Los personajes recurrentes dan hilo narrativo: un mentor (el piloto veterano que te vende
  tu primer avión), una aerolínea rival y un inspector de aviación civil.

## Diversificar

Fabricar motores de **coche** queda fuera. Es otro juego entero (fábricas, ventas a otro
mercado) y no reutiliza casi nada.

La alternativa que encaja: un **taller de mantenimiento propio** → hacer revisiones a otras
aerolíneas → **fabricar piezas y motores de avión**. Reutiliza el sistema de piezas y el de
personal. Es para el final del juego, no para el MVP.

## Para jugar con colegas

- **Simulación determinista con semilla**: con la misma semilla, todos tienen el mismo mercado
  y el mismo tiempo.
- **Retos cortos con puntuación**, por ejemplo «sobrevive a 1979 con dos aviones» o «llega a
  1992 con la mayor flota de Europa». Se comparte el resultado con un código. La campaña
  larga es para cada uno.

## Arte

Todo en el mismo estilo, generado con OpenArt como en `game/`:

- el globo, dibujado por código, sin imágenes;
- retratos de personajes;
- aviones en vista lateral, reales y ficticios;
- algunos aeropuertos;
- piezas: motores, tren de aterrizaje.

Para uso privado, los nombres reales de los modelos de avión no son problema. Las aerolíneas
del juego, rivales incluidas, son ficticias.

## Técnica

- Web instalable (PWA) sin paso de build, igual que `game/`.
- `src/core` puro y testeable con `node --test`.
- Globo con proyección ortográfica (d3-geo) en Canvas y el mapa del mundo en TopoJSON
  incluido en el repositorio, para que funcione sin conexión.
- Guardado en `localStorage` con exportación a fichero.
- Publicación: el flujo actual sube solo `game/` a GitHub Pages; habrá que publicar las dos
  carpetas (*pendiente*).

## Prototipo 1 (hecho)

Demostró que decidir si el vuelo sale engancha: aeropuertos reales, mercado de segunda mano,
rutas con frecuencia y tarifa, hojas de despacho, accidentes con escenas y noticiario.

## Versión 2 — núcleo realista (hecho)

Aplica `CRITERIOS.md` 1–25 y 33. Lo que cambió:

- **Mantenimiento** (`src/core/mantenimiento.js`, `src/data/averias.js`, `src/data/motores.js`):
  revisiones A, C y estructural por horas con tolerancia del 10 %; motores como piezas con su
  revisión general y motor de alquiler; averías que avanzan por horas, ciclos o días con
  fases (oculta → indicio → anomalía → confirmada → diferida según la MEL); inspecciones
  fiables por umbrales y doble comprobación en lo importante; falsas alarmas; directivas.
- **Operación** (`src/core/operaciones.js`): compatibilidad avión–ruta–aeropuerto con
  «no puede» y «puede con restricciones»; pista según peso (la distancia de despegue crece
  con el cuadrado del peso) y altitud; alcance con carga; bimotores sobre el mar (60 min,
  ETOPS desde 1985/1988) con alternativos reales; Concorde solo supersónico sobre el mar y
  prohibido en Nueva York hasta finales de 1977.
- **Tecnología** (`src/data/tecnologias.js`): radar, GPWS, alerta de cizalladura, TCAS y EGPWS
  con fecha, coste, retrofit y efecto sobre su categoría de accidente.
- **Riesgo** (`src/core/riesgo.js`): amenaza → evento → desenlace. Cada vuelo calcula sus
  amenazas (técnicas, meteo, pista, tráfico, humanas) y cada una escala a accidente según
  los factores agravantes.
- **Investigación** (`src/core/investigacion.js`): causa probable, 1–3 factores y
  responsabilidad, ligada a lo que pasó en la partida.
- **Economía** (`src/core/economia.js`): dólares de cada año (IPC de EE. UU.) con su serie de
  queroseno; tasas, handling y catering por aeropuerto; estructura, tripulaciones y seguro.

### Calibración del riesgo (CRITERIOS 33)

Se calibra por partida, no con estadística real: el jugador hace pocos vuelos al día. Tres
palancas:

1. **Base baja** para todos (`BASE` en `riesgo.js`), que mejora con la época y con la
   tecnología, pero con suelo: nunca llega a cero.
2. **Dejadez**: cada revisión vencida (más cuanto más tiempo lleve vencida) y cada avería
   conocida sin atender suma peso; el riesgo técnico se multiplica por e^(0,8·peso) hasta ×100,
   y aparece el fallo de mandos de vuelo por mantenimiento descuidado.
3. **Decisiones de despacho**: despachar con la previsión bajo mínimos (presión ×6 sobre
   seguir bajando), sin combustible extra, con la tripulación cansada (se dispara pasadas
   las 13 h), de noche, sin GPWS.

Medido con bots (probabilidad esperada de accidente por vuelo):

| Perfil | 1976 | Años 90 en adelante |
| --- | --- | --- |
| Todo bien (revisiones al día, inspecciona, retrofit, nada fuera de norma) | ~4 por millón | ~2–3 por millón |
| Medio (revisiones al día, ignora indicios, a veces despacha con niebla) | 10–60 por millón | — |
| Todo mal (nada de mantenimiento, despega siempre) | 0,1–0,3 % de media; ~3 % con el avión ya abandonado | — |

Con unos 150.000 vuelos en una partida de 50 años, quien lo hace todo bien tiene en torno a
0,5 accidentes esperados; quien lo hace todo mal se estrella varias veces al año. Escala
entre un avión cuidado y uno con la revisión A vencida: +30 % ×2, el doble ×20, el triple
×100; con todo vencido, ~3 % por vuelo.

### Calibración económica (v2, sin competencia)

Superada por la de la v3, que reparte el pasaje entre competidores. Tarifas cerca del rendimiento real de 1976 (≈96 $ Gran Canaria–Madrid, ≈120 $ a Londres,
≈190 $ Londres–Nueva York) y costes con handling y estructura de la época. Un año con un
solo avión:

- F27 entre Gran Canaria y Tenerife con 2 vueltas al día (ocupación 85 %): +150–200 k$.
  Con 4 vueltas (51 %), pierde 0,2–0,5 M$.
- 737 Gran Canaria–Madrid (48 %): +0,45 M$; Gran Canaria–Gatwick (65 %): +1,5–1,9 M$.
- 707 Londres–Nueva York para una compañía nueva (38 %): pierde 1,3–2,4 M$. Un 747 o un
  Concorde, mucho más.

Son números para ajustar jugando. `npm run calibrar` (`tools/calibrar.mjs`) repite la
medición del riesgo con bots de tres perfiles; conviene pasarlo después de tocar `riesgo.js`,
`mantenimiento.js` o los datos de averías.

## Versión 3 — competencia y mercado (hecho)

Aplica `CRITERIOS.md` 26–32. Lo que cambió:

- **Demanda** (`src/core/mercado.js`, `src/data/paises.js`): modelo de gravedad por par de
  aeropuertos con la población y la renta de cada país año a año, la distancia, el mar (en
  tierra compiten el coche y el tren), las fronteras (el mercado único suma), el turismo con
  su temporada, los grandes hubs, un factor para aeropuertos pequeños y un suelo para las
  islas. Cuatro tipos de mercado salen solos: saturado (Madrid–Londres), con oportunidad
  (Bilbao–Lisboa), de nicho (Pamplona–París) y emergente (Barcelona–Praga, tras 1989).
- **Reparto**: el pasaje se reparte por plazas con curva en S (más frecuencia atrae más que
  proporcionalmente), precio con elasticidad según la ruta sea turística, mixta o de
  negocios, reputación y servicio. «Otras compañías» cubre con retraso la capacidad que no
  ponen las rivales con nombre; su cobertura varía por ruta y quinquenio, así que hay rutas
  mal servidas por descubrir.
- **Información aproximada** (CRITERIOS 26 y 28): demanda y oferta redondeadas y con ruido,
  tendencia y quién opera con su precio, servicio, reputación y presencia en palabras. La
  estimación para tus aviones da pasajeros/día con 1 y 2 vueltas. Ningún «oportunidad 87 %».
- **Tarifas reguladas** hasta la liberalización: nacional de EE. UU. en 1979, Comunidad
  Europea en 1993 (incluidas las rutas nacionales), el resto en 1997. Mientras tanto, la
  tarifa económica o la alta solo mueven el precio la mitad.
- **Salarios por país**: tripulaciones y estructura cuestan según la renta del país de la
  base (España de 1976, ~0,8 de EE. UU.).
- **Competencia** (`src/core/competencia.js`, `src/data/aerolineas.js`): 22 aerolíneas de
  parodia con época, tipo (tradicional, regional, chárter, bajo coste, ultra bajo coste,
  largo radio), carácter (expansión, riesgo, copia, terquedad) y final histórico (Lager
  quiebra en 1982, Bread Am en 1991 y Delfín hereda su Atlántico, Aviacutre se funde con
  Castilla en 1999…). Nunca más de 15 activas. Cada mes revisan sus rutas con lo que les toca
  del reparto, recortan o cierran las que pierden (más tarde cuanto más tercas), buscan
  huecos con estimaciones con error, copian rutas llenas del jugador con meses de retraso,
  responden a las bajadas de precio y cuadran cuentas: quiebran salvo rescate (las de
  bandera antes de la liberalización; rescates generales en 2001–02 y 2020–22). Respetan la
  regulación: antes de 1993, solo rutas que tocan su país; después, entre países de la
  Comunidad; desde 1997, rutas nacionales de otro país comunitario.
- **Reputación** (`src/core/reputacion.js`): puntualidad, seguridad, servicio y prestigio de
  0 a 100 por dentro; en pantalla, palabras. Pesan distinto según la ruta: en la turística
  manda el precio, en la de negocios la puntualidad. Un accidente hunde la seguridad y el
  prestigio, que se recuperan despacio volando limpio.
- **Mundo y noticias** (`src/core/mundo.js`, `src/data/acontecimientos.js`): 25
  acontecimientos históricos con fecha real (liberalizaciones, crisis, guerras, AVE, Eurostar,
  11-S, volcán, COVID…) con efectos graduales sobre la demanda, cierres y costes; y
  9 plantillas de acontecimientos locales cerca del jugador (sede, moda turística, feria,
  tren, cierre de fábrica, ampliación, inestabilidad, recursos, huelga) que se anuncian y a
  veces no pasan. Solo llegan las noticias que tocan al jugador: 10–25 al año. Las
  importantes salen como avance de televisión.
- **Interfaz**: pestaña Mundo (tu compañía, tus mercados, noticias y competencia), estudio de
  mercado en la ficha de cada aeropuerto y, en cada ruta, «te tocan ~N de ~D pax/día».

### Calibración con competencia

Un año con un solo avión, base en Gran Canaria en 1976, bot prudente, cuatro semillas:

| Ruta | Mercado | Ocupación | Resultado del año |
| --- | --- | --- | --- |
| F27 Gran Canaria–Tenerife Norte, 2 vueltas | Saturado: ~1.600 pax/día contra ~2.600 plazas | ~50 % | −0,21 a −0,25 M$ |
| 737 Gran Canaria–Madrid, 1 vuelta | Bien servido | 45–53 % | +0,1 a +0,6 M$ |
| 737 Gran Canaria–Barcelona, 2 vueltas | Mal servido | 54–69 % | +1,9 a +3,6 M$ |
| 737 Gran Canaria–Gatwick, 1 vuelta | Chárter británico lleno (Espantax y Lager) | ~40 % | −0,3 a −0,7 M$ |
| 737 Madrid–Heathrow, 2 vueltas | Negocios, sobreofertado | 38–43 % | −0,6 a +0,4 M$ |
| 707 Heathrow–Nueva York, 1 vuelta | Los grandes del Atlántico | 23–31 % | −3,1 a −5,6 M$ |

Ya no basta con elegir la ruta obvia: hay que mirar el mercado. Con 3 M$ de caja inicial, un
mal primer año se puede corregir. El mundo completo sin jugador (1976–2026) tarda 7–11 s y se
mantiene estable.

## Versión 3.1 — arreglos e imágenes (hecho)

- **Rendimiento**: el globo guarda el fondo (mar, costa y fronteras) en un lienzo aparte y
  solo lo rehace al cambiar la vista. Antes redibujaba la costa de alta resolución en cada
  fotograma: de cerca sobre Canarias iba a ~9 fotogramas por segundo; ahora a 60.
- **Hojas de despacho**: el despachador recuerda las averías que ya autorizaste y solo vuelve
  a preguntar si aparece una nueva o avanza de fase. En el modo por defecto, la hoja sale en
  el 11 % de los vuelos (antes, el 57 %).
- **Robustez**: un error en un fotograma ya no congela el juego, los paneles no se repintan
  bajo el dedo y cada pestaña se abre desde arriba.
- **Imágenes** (`img/`, `src/data/imagenes.js`): los dos aviones ficticios y las escenas,
  generados con IA: avances de noticias (dos épocas), noticiario de
  accidentes (en el campo o en el monte, con reactor o con turbohélice), grandes aeropuertos
  (dos épocas) y taller (revisión de línea, hangar y motor). Los aviones reales se ven con su
  silueta hasta tener sus fotos.

## Versión 3.2 — marcas y fotos (hecho)

- **Marca propia**: al fundar la compañía se diseña la cola de sus aviones (dos colores, un
  dibujo, hasta tres letras y, si se quiere, una imagen propia reducida a 192 px que viaja en
  la partida). Sale en la barra superior, en las tablas de mercado y en Mundo, desde donde se
  puede cambiar.
- **Colas de las rivales** (`src/ui/marcas.js`): cada aerolínea lleva los colores de la real en
  la que se inspira y un logo parecido con el guiño del nombre: la corona de Castilla, la grulla
  de Naftansa, un tulipán para Tulipair, una huella para Depie Air.
- **Fotos de los aviones**: los 24 tipos reales tienen foto de época de Wikimedia Commons, con
  el rótulo de la aerolínea cambiado por su nombre en el juego (Naftansa, Castilla, Bread Am,
  Tulipair, Ay Europa, Depie Air…). Se editan en local, sin créditos de IA, y quedan
  reproducibles en `herramientas/fotos/` por si cambia algún nombre. Créditos en `img/LEEME.md`.

## Versión 3.3 — comandantes (hecho)

- Cada amigo tiene su página (`piloto/jorge/`, `piloto/pinar/`, `piloto/oscar/`) con su
  retrato como icono de la app. En la partida sale al fundar la compañía (ficha de cuerpo
  entero), en el primer vuelo (recorte de periódico en blanco y negro) y en cuatro hitos:
  primer avión de largo radio, diez aviones y aniversarios de 10 y 25 años. Es decorado: no
  cambia el juego.

## Siguiente

- Nombres pendientes de aprobar: 13 de las 22 compañías llevan `propuesta: true` en
  `src/data/aerolineas.js`. Seis salen ya en fotos (Aviacutre, British Airgüeis, Lager,
  Pastalia, Tulipair y Delfín); si cambian, se rehacen con `herramientas/fotos/`.
- Jugar la v3 y ajustar: el arranque interinsular con un solo F27 pierde dinero (la
  estructura de la compañía pesa demasiado para un avión).
- Abrir bases nuevas, personal (entrevistas y eventos) y retos cortos con semilla.
