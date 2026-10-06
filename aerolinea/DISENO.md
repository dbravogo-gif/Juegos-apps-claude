# Aerolínea — documento de diseño (borrador)

Nombre provisional. Simulador de aerolínea para móvil: fundas una compañía minúscula a
mediados de los años 70, con un avión de segunda mano y una base en un aeropuerto real, y la
llevas a través de 50 años de historia de la aviación.

Estado: **propuesta**. Lo marcado como *pendiente* se cierra antes de programar esa parte.

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

Una tarjeta del tipo «Vuelo 214, Bilbao → Londres, sale en 40 min» muestra:

| Factor | Ejemplos |
| --- | --- |
| Meteo | Niebla en destino, tormenta en ruta, nieve en la pista, viento cruzado |
| Avión | Horas desde la última revisión, averías pendientes, edad, historial |
| Tripulación | Fatiga, experiencia en ese tipo de avión, rasgos (temerario, prudente…) |
| Aeropuerto | Longitud de pista, ayudas a la aproximación (ILS sí o no), terreno, calidad del servicio |
| Negocio | Pasajeros, ingreso del vuelo, coste de retrasar o cancelar, reputación en juego |

Opciones: **despegar**, **retrasar**, **cancelar** o **cargar combustible extra para un
alternativo** (cuesta dinero y reduce el riesgo).

**Riesgo con niebla informativa.** El juego calcula un riesgo real, pero tú ves una
*estimación*. Cuanto mejor es tu despachador o tu meteorólogo, más se acerca la estimación a
la realidad. Contratar bien es comprar información.

**Resultados graduados, no binarios**: normal, retraso, turbulencia (quejas), desvío al
alternativo, aterrizaje de emergencia, daños en el avión y, en raras ocasiones, accidente.

- Un accidente cuesta el avión, hunde la reputación y abre una **investigación**. Si descubre
  culpa (una revisión saltada, un piloto fatigado), llegan multas, la suspensión de rutas o la
  dimisión de alguien.
- Un accidente no acaba la partida automáticamente, pero puede arruinarte.
- Las probabilidades están muy exageradas respecto a la realidad: es un juego, no un
  simulador de seguridad aérea.
- **Tono**: sobrio. Sin detalles gráficos; las consecuencias se cuentan con titulares de
  prensa y con el informe de la investigación.

**Para que no se vuelva tedioso:** con pocos aviones, decides tú cada vuelo dudoso. Cuando
contratas a un **jefe de operaciones**, defines una política de riesgo («cancela por encima de
X») y solo te llegan los casos límite. La parte incremental del juego es pasar de despachar
vuelos a dirigir una aerolínea.

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

**Ritmo** (*pendiente*): 1 año de juego dura unos 10–15 minutos, así que la campaña completa
son unas 8–12 horas repartidas en muchas sesiones. Cada vuelo rutinario se simula solo: las
tarjetas aparecen únicamente cuando hay algo que decidir.

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

## Prototipo 1 — qué tiene que demostrar

Pregunta: **¿engancha decidir si el vuelo sale?**

- Año 1976, unos 20 aeropuertos de Europa y el Mediterráneo, y una base.
- Mercado con 3–4 aviones de segunda mano de la época, con inspección opcional.
- Crear 2–3 rutas y ver los aviones moverse sobre el globo.
- Tarjetas de despacho con meteo, estado del avión y aeropuerto. Riesgo y resultados
  graduados, incluido el accidente con su investigación.
- Dinero y reputación.

Fuera del prototipo: personal y entrevistas, eventos históricos, liberalización, piezas,
retos y arte final (se usan siluetas y formas).
