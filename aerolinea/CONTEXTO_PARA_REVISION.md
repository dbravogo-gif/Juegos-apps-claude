# App viación: contexto completo para revisión externa

> **Nota:** este documento describe la versión 1 (el prototipo). La versión 2 rehízo el
> mantenimiento, el riesgo, la operación y la economía siguiendo `CRITERIOS.md`; su estado
> está en `DISENO.md` («Versión 2») y las fuentes de los datos en `FUENTES.md`.

Este documento describe el estado actual del juego *App viación* para que otro asistente
(ChatGPT u otro) lo entienda sin ver el código y aporte información útil. Al final está la
lista de lo que pedimos y el formato de respuesta que nos viene bien.

---

## 1. Qué es

- **Género**: simulador de gestión de una aerolínea, con poca parte incremental. Más
  simulación que números que crecen solos.
- **Plataforma**: web para móvil (en vertical), sin servidor y sin paso de compilación. Es
  HTML, CSS y JavaScript con módulos ES y se publica en GitHub Pages.
- **Público**: el autor y un grupo de amigos. No es un producto comercial.
- **Fantasía**: fundas en enero de 1976 una aerolínea minúscula, con poco dinero y un avión
  de segunda mano, en un aeropuerto real que eliges tú. La idea es llevarla a través de 50
  años de historia de la aviación.
- **El núcleo**: **tú decides si cada vuelo sale**. Ves el tiempo que hace, el estado del
  avión, la tripulación y el aeropuerto. Si te arriesgas puedes ganar dinero o perder un avión
  con gente dentro.
- **Inspiración**: el autor quería algo del estilo de *Big Ambitions*, menos realista, y acabó
  en este concepto.

## 2. Decisiones ya tomadas por el autor

| Tema | Decisión |
| --- | --- |
| Inicio | Enero de 1976 |
| Base inicial | La elige el jugador entre todos los aeropuertos abiertos en 1976 |
| Aeropuertos | Ciudades principales de cada continente, una o dos por país y solo en los países con más peso en la aviación. EE. UU. tiene unos 8. España tiene 4 más Canarias |
| Canarias | **Todos** sus aeropuertos (el autor es de allí), incluidos los que abrieron más tarde: Tenerife Sur en 1978 y La Gomera en 1999 |
| Accidentes | Tono **crudo pero sin personas**. Hay tres escenas animadas en las que solo se ve el avión (salida de pista, impacto en la aproximación, fallo en vuelo). Después, un avance informativo de un noticiario ficticio («Diario Nacional») da las cifras de fallecidos, heridos y personas a bordo |
| Aerolíneas | Todas ficticias, incluida la del jugador y las rivales futuras |
| Aviones | Modelos reales con nombre real (uso privado), más algunos ficticios («gangas del Este» poco fiables) |
| Arte previsto | Globo terráqueo, retratos de personajes, aviones reales y ficticios en vista lateral, algunos aeropuertos y piezas (motores, tren). Se generará con una herramienta de IA (OpenArt) |
| Fuera de alcance | Diversificar a fabricar motores de **coche**. Como mucho, al final del juego: taller propio, mantenimiento para otras aerolíneas y fabricación de piezas o motores **de avión** |
| Jugar con amigos | Simulación determinista con semilla: con la misma semilla y la misma base, el tiempo y el mercado son iguales para todos. Más adelante habrá retos cortos con puntuación compartida mediante un código. No hay servidor |
| Accidentes reales | Hasta ahora **no se recrea ningún accidente real**. Si propones algo así, márcalo para que lo decida el autor |

## 3. Estado actual: prototipo 1 jugable

Funciona de principio a fin en el móvil:

1. Pantalla de inicio: nombre de la compañía y elección de base, con buscador y Canarias
   arriba.
2. Globo 3D que se gira con el dedo y se amplía con un pellizco. Muestra los aeropuertos, la
   base, las rutas y los aviones moviéndose por arcos de círculo máximo. Encima de los
   aeropuertos de tu red aparecen iconos de mal tiempo.
3. Paneles inferiores: **Flota, Rutas, Mercado, Cuentas y Diario**.
4. **Hoja de despacho**: una tarjeta con estética de papel que pausa el juego cuando un
   vuelo supera el umbral de riesgo.
5. Escenas de accidente, avance informativo y, al mes, el informe de la investigación.
6. Guardado automático en el navegador (`localStorage`).
7. 17 pruebas automáticas del motor (`node --test`).

No hay todavía: personal ni entrevistas, eventos históricos, regulación ni liberalización,
competencia simulada, más de una base, retos, sonido ni arte final (de momento son siluetas
dibujadas).

## 4. Mecánicas en detalle (como están programadas hoy)

### 4.1 Tiempo

- El reloj cuenta minutos desde el 1 de enero de 1976 a las 00:00. No hay husos horarios:
  todo va en la hora de la compañía.
- El motor avanza en pasos de 5 minutos.
- Velocidades: pausa, 1 h de juego por segundo real, 4 h/s y 12 h/s. Cuando no hay ningún
  avión en el aire el tiempo corre 4 veces más rápido.
- Las salidas solo se permiten entre las 06:00 y las 23:00.
- Hay un cierre diario (costes fijos, intereses, reputación) y uno mensual (renovación del
  mercado).

### 4.2 Clima

- Cada aeropuerto tiene un **perfil climático**: atlántico, continental, nórdico,
  mediterráneo, llanura con niebla (Milán), subtropical (costa de Canarias), nubes de montaña
  (Tenerife Norte, La Palma), desierto, Sahel, monzón, indogangético (Delhi), tropical,
  altitud y costa con niebla (Lima, San Francisco).
- Cada perfil da, para cada fenómeno (tormenta, nieve, niebla, calima, viento fuerte,
  lluvia), su probabilidad en pleno invierno y en pleno verano. El resto del año se
  interpola. En el hemisferio sur las estaciones van al revés.
- El tiempo se calcula por aeropuerto y por franja de 6 horas, a partir de un hash de
  (semilla, aeropuerto, franja). Es reproducible y no hay que guardarlo.
- Si sale un fenómeno, su intensidad es ligera en el 60 % de los casos, moderada en el 30 %
  y severa en el 10 %.
- En ruta puede haber tormentas, más probables en verano y en vuelos largos.

### 4.3 Riesgo de un vuelo

El riesgo es la **suma de factores**. Cada factor es una probabilidad de accidente y lleva
una **causa**, que decide qué tipo de accidente sería:

- `aproximacion`: impacto contra el terreno al aproximarse con mala visibilidad;
- `pista`: salida de pista;
- `vuelo`: fallo en vuelo (motor, estructura, tormenta).

**Probabilidad por intensidad [ligera, moderada, severa]:**

| Factor | Valores |
| --- | --- |
| Base de la época | 0,001 % |
| Niebla en destino con ILS | 0,001 % / 0,02 % / 0,1 % |
| Niebla en destino sin ILS | 0,005 % / 0,25 % / 2 % |
| Calima en destino con ILS | 0,0005 % / 0,01 % / 0,05 % |
| Calima en destino sin ILS | 0,003 % / 0,12 % / 0,6 % |
| Tormenta en destino (mitad aproximación, mitad pista) | 0,005 % / 0,1 % / 0,8 % |
| Nieve en destino (pista) | 0,003 % / 0,1 % / 0,6 % |
| Lluvia en destino (pista) | 0,001 % / 0,005 % / 0,04 % |
| Viento en destino (pista) | 0,002 % / 0,04 % / 0,4 % |
| Tormenta en origen | 0,003 % / 0,07 % / 0,5 % |
| Nieve en origen (hielo) | 0,003 % / 0,06 % / 0,3 % |
| Viento, niebla y calima en origen | entre 0,0005 % y 0,15 % |
| Tormenta en ruta | 0,003 % / 0,05 % / 0,3 % |

**Modificadores:**

- **Terreno montañoso en destino** multiplica la parte de aproximación por 2 sin ILS y por
  1,3 con ILS. Sin ILS añade además un 0,002 % fijo.
- **Holgura de pista** (pista disponible entre pista que necesita el avión): con 1,5 o más
  no cambia nada, con 1,25 o más multiplica por 1,6 y por debajo multiplica por 2,8. Afecta
  a lluvia, nieve, viento y tormenta. Con menos de 1,15 se añade un 0,005 %.
- **Piezas del avión** (motores, tren, fuselaje, de 0 a 100): cada una aporta
  `coeficiente × ((100 − estado) / 60)³`. Los coeficientes son 0,2 % para motores, 0,12 %
  para tren y 0,08 % para fuselaje. Un motor al 50 % añade un 0,12 % y al 30 % un 0,32 %.
- **Revisión vencida** (límite de 500 h): multiplica lo mecánico por `1 + min(3, horas de
  retraso / 150)` y añade un 0,05 % por cada 100 h de retraso.
- **Defectos** (leve, serio, grave): 0,02 % / 0,12 % / 0,5 %, multiplicados por la fiabilidad
  del tipo de avión. Pueden ser **ocultos**: cuentan para el riesgo real pero el jugador no
  los ve.
- **Fiabilidad del tipo**: multiplica todo lo mecánico (por ejemplo, 2,6 en el turbohélice
  ficticio del Este).
- **Fatiga**: a partir de 9 horas de vuelo en el día, cada hora extra suma un 15 % de los
  factores de pilotaje, más un 0,02 % fijo.
- **Aterrizaje de noche** (llegada entre las 23:00 y las 06:00): +25 % de los factores de
  pilotaje.
- **Época**: todo se multiplica por `0,965^(año − 1976)`. En 1996 el riesgo es la mitad y
  en 2016, la cuarta parte.
- **Combustible para alternativo** (cuesta un 7 % más de operación): multiplica por 0,35 el
  riesgo meteorológico en destino, a cambio de que el vuelo pueda acabar desviado.

**Lo que ve el jugador**: el riesgo visible (sin lo oculto) con el error del despachador,
`× e^(N(0,1) × 0,35)`. Es decir, se equivoca alrededor de un tercio arriba o abajo.

**Cuándo pregunta el juego**: si el riesgo estimado supera el umbral, el juego se para y
aparece la hoja de despacho. El umbral por defecto es 0,3 % y se puede poner en «siempre»,
0,1 %, 0,3 %, 1 %, 3 % o «nunca». Por debajo, el vuelo sale solo.

**Opciones en la hoja**: despegar, despegar con combustible para alternativo, retrasar 2 h o
cancelar. Cancelar devuelve el 10 % del ingreso previsto como compensación y cuesta un poco
de reputación.

### 4.4 Resultado del vuelo

Con `p` = riesgo real total y `u` un número aleatorio entre 0 y 1:

- `u < p`: **accidente**. La causa se elige según el peso de cada causa.
- Si se llevaba combustible extra y había mal tiempo en destino: **desvío**, con una
  probabilidad que crece con la severidad (máximo 70 %). Llega con 2 h de retraso, pierde el
  20 % del ingreso y gasta un 30 % más.
- `u < 3p`: **incidente grave**. Aterrizaje de emergencia, una pieza pierde entre 8 y 15
  puntos, el avión pasa 3 días en el taller y la reputación baja 4.
- `u < 8p`: **incidente leve**. La reputación baja 1 y puede descubrirse un defecto oculto.
- Si no, vuelo normal: la reputación sube un poco.

**Víctimas en un accidente** (a bordo = pasajeros + tripulación):

| Tipo | Fallecidos | Heridos |
| --- | --- | --- |
| Salida de pista | 0–20 % de los ocupantes | 30–70 % del resto |
| Aproximación | 85–100 % | el resto |
| Fallo en vuelo | 60–100 % | el resto |

La tripulación son 2 pilotos, un mecánico de vuelo si el avión tiene 3 o 4 motores y un
tripulante de cabina por cada 50 plazas.

### 4.5 Consecuencias de un accidente

Al momento:

- se pierde el avión;
- la reputación baja 30 puntos;
- se ve la escena y el avance informativo.

**Investigación a los 30 días**. Hay negligencia si al despachar se daba alguno de estos
casos:

- revisión vencida;
- un defecto conocido serio o grave sin reparar;
- más de 11 h de vuelo de la tripulación en el día;
- se autorizó a mano un vuelo con un riesgo estimado del 2 % o más.

| | Indemnizaciones | Seguro | Multa | Reputación |
| --- | --- | --- | --- | --- |
| **Con negligencia** | 75.000 $ por fallecido y 15.000 $ por herido, las pagas todas | No paga | 250.000 $ | −10 |
| **Sin negligencia** | Las mismas | Paga el 70 % del valor del avión y el 80 % de las indemnizaciones | — | — |

La causa probable publicada es el factor que más pesó, incluido lo oculto. Así puede salir
a la luz un defecto que no viste porque no inspeccionaste el avión antes de comprarlo.

### 4.6 Aviones

- **Estado**: tres piezas de 0 a 100, horas, ciclos, horas desde la última revisión,
  defectos, horas voladas hoy, ubicación y estado (en tierra, en vuelo, en taller o esperando
  tu decisión).
- **Desgaste por vuelo**:
  - motores, −0,025 por hora × fiabilidad;
  - tren, −0,05 por ciclo × fiabilidad;
  - fuselaje, −0,015 por ciclo y −0,005 por hora.
- **Defectos nuevos**: cada vuelo puede crear uno nuevo, oculto, con probabilidad
  `0,0007 × horas × fiabilidad × (1 + (100 − estado medio) / 50)`.
- **Revisión**: cuesta 15 veces el coste por hora del avión y dura 36 h en turbohélices y
  48 h en reactores. Solo se hace en la base. Sube cada pieza hasta 15 puntos, con un techo de
  `100 − edad × 1,2` (mínimo 55), y descubre cada defecto oculto con un 70 % de probabilidad.
- **Reparar un defecto**: cuesta el 0,4 %, 1,5 % o 5 % del precio del avión nuevo según la
  gravedad, y tarda 12 h.
- **Valor de mercado**: `precio × 0,92^edad × (0,45 + estado medio / 180) − coste de reparar
  los defectos`. Al vender se cobra el 85 %.

### 4.7 Mercado de segunda mano

- Hay 6 ofertas a la vez y se renuevan cada mes. Las ofertas inspeccionadas se quedan.
- El tipo se elige entre los que llevan al menos 2 años en servicio. Los muy caros y los
  ficticios salen menos.
- Con un 75 % de probabilidad la oferta es de un tipo que puede operar en la pista de tu
  base.
- **Edad**: entre 2 y 22 años. **Estado**: alrededor de `100 − edad × 2,2`, menos algo de
  azar.
- **Defectos ocultos**: más cuanto más viejo, y más en los ficticios.
- En el 15 % de los casos la revisión ya está vencida.
- El precio se calcula **sin contar los defectos ocultos**, con una variación de ±15 %.
- El vendedor anuncia un estado más optimista que el real: «Excelente», «Bueno», «Aceptable»
  o «Para reformar».
- **Inspección**: cuesta el 1,5 % del precio (mínimo 15.000 $) y revela el estado real y
  todos los defectos.
- **Aviones nuevos**: se pueden comprar los tipos que estén en producción ese año, a precio
  de catálogo.
- Todo avión comprado llega a la base al día siguiente.

### 4.8 Rutas, horarios y demanda

- Una ruta une la base con un destino.
- La **frecuencia** son las vueltas al día (de 1 a 8), con salidas repartidas entre las
  07:00 y las 22:00. El avión vuelve en cuanto está listo.
- **Demanda del mercado** (pasajeros al día en cada sentido):
  `300 × (población_o × población_d)^0,4 × turismo_medio² × temporada × islas × nacional / (1 + distancia/2500)`.
  - `islas`: 1,5 entre islas del mismo archipiélago y 1,4 si un extremo es una isla.
  - `nacional`: 1,3 si los dos aeropuertos están en el mismo país.
  - `temporada`: ±40 % según la estación, en los destinos de verano o de invierno.
- **Lo que te toca a ti**: `demanda × 0,10 × competencia × reputación × elasticidad`.
  - `competencia` según el aeropuerto más grande de la ruta: 1,4 / 1,2 / 1 / 0,8 / 0,55 para
    tamaños del 1 al 5.
  - `reputación` = reputación / 50, entre 0,3 y 1,6.
  - `elasticidad` = multiplicador de tarifa elevado a −1,6.
- Las vueltas del día se reparten esa demanda. Cuantas más vueltas, más vacíos van los
  aviones.
- **Billete**: hasta 1000 km, `35 + 0,085 × km`; por encima, `120 + 0,06 × (km − 1000)`. Hay
  tres tarifas: económica (×0,8), normal y alta (×1,25).
- **Coste por tramo**:
  `horas × coste/hora (×1,07 si lleva combustible extra) + tasas (tamaño del aeropuerto × 90 × plazas/100) + 6 $ por pasajero + 8 % del ingreso`.

### 4.9 Dinero, reputación y quiebra

- **Caja inicial**: 3 M$.
- **Préstamo**: hasta `4 M$ + 30 % del valor de la flota`, al 9 % anual.
- **Costes fijos diarios**:
  - base: tamaño del aeropuerto × 150 $;
  - tripulación de cada avión: plazas × 5 + 200 $;
  - seguro: 0,18 % del valor del avión al mes.
- **Reputación** de 0 a 100. Empieza en 50 y cada día se acerca un 1 % a 50.
- **Números rojos**: si al cerrar el día la caja es negativa, el banco amplía el préstamo. Si
  ya no puede, **quiebra** y termina la partida.

### 4.10 Presentación

- **Estética**: sala de operaciones de noche en 1976. Azul petróleo, cifras en ámbar como en
  un panel de salidas y la hoja de despacho en papel con un sello de riesgo («Bajo»,
  «Moderado», «Alto», «Muy alto»).
- **Las tres escenas** de accidente (unos 7 s, se pueden saltar):
  - **salida de pista**: de noche y con lluvia;
  - **aproximación**: niebla y montaña;
  - **fallo en vuelo**: al atardecer, motor ardiendo y caída detrás de los árboles.
- **Avance informativo**: titular, texto, cifras y una cinta de noticias.
- **Informe de la investigación**: causa probable, si hubo negligencia, y cuánto suman las
  indemnizaciones, lo que paga el seguro y la multa.

## 5. Calibración actual (primera pasada)

Simulación de un año con un bot que despega siempre y hace las revisiones a tiempo:

- **Riesgo medio por vuelo**: ~0,03 % en rutas normales (Madrid–Londres); ~0,15 % hacia
  Tenerife Norte, por la niebla, la falta de ILS y la montaña.
- **Tarjetas de decisión** con el umbral al 0,3 %: entre 7 y 40 al año por avión.
- **Ejemplos de resultado por avión y año**:

  | Avión y ruta | Resultado |
  | --- | --- |
  | F27 entre islas | apenas cubre gastos |
  | 737 Gran Canaria–Londres Gatwick, 1 vuelta al día | +1,5 a +2 M$ |
  | 737 Madrid–Londres, 2 vueltas al día | pierde dinero (demasiada capacidad) |
  | 727 Tenerife Norte–Gatwick | pierde (avión demasiado grande, ocupación del 37 %) |

- **Duración**: a velocidad media, un año de juego son unos 36 minutos reales.

## 6. Datos actuales

### 6.1 Aeropuertos

Columnas:

- **Pob.**: población del área en millones, aproximada para 1976.
- **Tam.**: tamaño de 1 a 5. Decide las tasas, la competencia y el coste de tener ahí la
  base.
- **Pista**: la pista más larga en metros.
- **ILS**: si tenía ILS en 1976.
- **Turismo**: peso del turismo en la demanda (1 = normal).
- **Abre**: año de apertura, si es posterior a 1976.

Los valores de pista, ILS y población son **aproximados** y conviene revisarlos.

| Código | Aeropuerto | País | Región | Pob. (M) | Tam. | Pista (m) | ILS | Montaña | Clima | Turismo | Temporada | Abre |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| LPA | Gran Canaria (Gando) | ES | Canarias | 0.65 | 4 | 3100 | sí | no | subtropical | 1.8 | invierno | ≤1976 |
| TFN | Tenerife Norte (Los Rodeos) | ES | Canarias | 0.55 | 4 | 3400 | no | sí | nubes_montana | 1.4 | invierno | ≤1976 |
| TFS | Tenerife Sur (Reina Sofía) | ES | Canarias | 0.1 | 3 | 3200 | sí | no | subtropical | 2 | invierno | 1978 |
| ACE | Lanzarote | ES | Canarias | 0.05 | 3 | 2400 | no | no | subtropical | 1.8 | invierno | ≤1976 |
| FUE | Fuerteventura | ES | Canarias | 0.03 | 2 | 2400 | no | no | subtropical | 1.6 | invierno | ≤1976 |
| SPC | La Palma | ES | Canarias | 0.08 | 2 | 2200 | no | sí | nubes_montana | 1 | — | ≤1976 |
| VDE | El Hierro | ES | Canarias | 0.006 | 1 | 1250 | no | sí | subtropical | 0.8 | — | ≤1976 |
| GMZ | La Gomera | ES | Canarias | 0.02 | 1 | 1500 | no | sí | subtropical | 1 | — | 1999 |
| MAD | Madrid-Barajas | ES | Europa | 4 | 5 | 4100 | sí | no | continental | 1.1 | — | ≤1976 |
| BCN | Barcelona-El Prat | ES | Europa | 3.5 | 4 | 3100 | sí | no | mediterraneo | 1.3 | verano | ≤1976 |
| PMI | Palma de Mallorca | ES | Europa | 0.5 | 4 | 3270 | sí | no | mediterraneo | 2 | verano | ≤1976 |
| AGP | Málaga | ES | Europa | 0.6 | 3 | 3200 | sí | no | mediterraneo | 1.8 | verano | ≤1976 |
| LIS | Lisboa-Portela | PT | Europa | 2 | 4 | 3800 | sí | no | mediterraneo | 1.3 | — | ≤1976 |
| FNC | Madeira (Santa Catarina) | PT | Europa | 0.25 | 2 | 1600 | no | sí | subtropical | 1.6 | invierno | ≤1976 |
| LHR | Londres-Heathrow | GB | Europa | 10 | 5 | 3900 | sí | no | atlantico | 1.3 | — | ≤1976 |
| LGW | Londres-Gatwick | GB | Europa | 6 | 4 | 3100 | sí | no | atlantico | 1.5 | — | ≤1976 |
| DUB | Dublín | IE | Europa | 1 | 3 | 2600 | sí | no | atlantico | 1 | — | ≤1976 |
| CDG | París-Charles de Gaulle | FR | Europa | 9 | 5 | 3600 | sí | no | atlantico | 1.4 | — | ≤1976 |
| NCE | Niza-Costa Azul | FR | Europa | 0.5 | 3 | 2700 | sí | no | mediterraneo | 1.7 | verano | ≤1976 |
| FRA | Fráncfort | DE | Europa | 2.5 | 5 | 3900 | sí | no | continental | 1 | — | ≤1976 |
| DUS | Düsseldorf | DE | Europa | 5 | 4 | 3000 | sí | no | continental | 1.2 | — | ≤1976 |
| AMS | Ámsterdam-Schiphol | NL | Europa | 2 | 4 | 3500 | sí | no | atlantico | 1 | — | ≤1976 |
| BRU | Bruselas-Zaventem | BE | Europa | 1.5 | 4 | 3600 | sí | no | atlantico | 1 | — | ≤1976 |
| ZRH | Zúrich-Kloten | CH | Europa | 1 | 4 | 3700 | sí | no | continental | 1 | — | ≤1976 |
| VIE | Viena-Schwechat | AT | Europa | 2 | 3 | 3600 | sí | no | continental | 1 | — | ≤1976 |
| FCO | Roma-Fiumicino | IT | Europa | 3.5 | 5 | 3900 | sí | no | mediterraneo | 1.5 | — | ≤1976 |
| LIN | Milán-Linate | IT | Europa | 4 | 4 | 2400 | sí | no | llanura_niebla | 1 | — | ≤1976 |
| ATH | Atenas-Hellinikon | GR | Europa | 3 | 4 | 3400 | sí | no | mediterraneo | 1.6 | verano | ≤1976 |
| IST | Estambul-Yeşilköy | TR | Europa | 3.9 | 4 | 3000 | sí | no | mediterraneo | 1 | — | ≤1976 |
| CPH | Copenhague-Kastrup | DK | Europa | 1.8 | 4 | 3600 | sí | no | nordico | 1 | — | ≤1976 |
| ARN | Estocolmo-Arlanda | SE | Europa | 1.4 | 4 | 3300 | sí | no | nordico | 1 | — | ≤1976 |
| OSL | Oslo-Fornebu | NO | Europa | 0.6 | 3 | 2300 | sí | sí | nordico | 1 | — | ≤1976 |
| HEL | Helsinki-Vantaa | FI | Europa | 0.8 | 3 | 3400 | sí | no | nordico | 1 | — | ≤1976 |
| SVO | Moscú-Sheremétievo | SU | Europa | 7.5 | 5 | 3700 | sí | no | nordico | 1 | — | ≤1976 |
| LED | Leningrado-Pulkovo | SU | Europa | 4.3 | 4 | 3400 | sí | no | nordico | 1 | — | ≤1976 |
| WAW | Varsovia-Okęcie | PL | Europa | 1.5 | 3 | 3700 | sí | no | continental | 1 | — | ≤1976 |
| PRG | Praga-Ruzyně | CS | Europa | 1.2 | 3 | 3700 | sí | no | continental | 1 | — | ≤1976 |
| BUD | Budapest-Ferihegy | HU | Europa | 2 | 3 | 3000 | sí | no | continental | 1 | — | ≤1976 |
| BEG | Belgrado-Surčin | YU | Europa | 1.3 | 3 | 3400 | sí | no | continental | 1 | — | ≤1976 |
| OTP | Bucarest-Otopeni | RO | Europa | 1.9 | 3 | 3500 | sí | no | continental | 1 | — | ≤1976 |
| CMN | Casablanca-Mohammed V | MA | África | 2.2 | 3 | 3700 | sí | no | mediterraneo | 1 | — | ≤1976 |
| RAK | Marrakech-Menara | MA | África | 0.4 | 2 | 3100 | no | no | desierto | 1.6 | — | ≤1976 |
| ALG | Argel-Dar el Beida | DZ | África | 2 | 3 | 3500 | sí | no | mediterraneo | 1 | — | ≤1976 |
| TUN | Túnez-Cartago | TN | África | 1 | 3 | 3200 | sí | no | mediterraneo | 1.4 | verano | ≤1976 |
| TIP | Trípoli | LY | África | 0.8 | 3 | 3600 | no | no | desierto | 1 | — | ≤1976 |
| CAI | El Cairo | EG | África | 8 | 4 | 3300 | sí | no | desierto | 1.4 | — | ≤1976 |
| DKR | Dakar-Yoff | SN | África | 0.8 | 3 | 3500 | sí | no | sahel | 1 | — | ≤1976 |
| ABJ | Abiyán-Port Bouët | CI | África | 1 | 3 | 3000 | sí | no | tropical | 1 | — | ≤1976 |
| LOS | Lagos-Ikeja | NG | África | 3 | 4 | 3900 | sí | no | monzon | 1 | — | ≤1976 |
| FIH | Kinsasa-N'Djili | ZR | África | 2 | 3 | 4700 | no | no | tropical | 1 | — | ≤1976 |
| ADD | Adís Abeba-Bole | ET | África | 1.1 | 3 | 3800 | no | sí | altitud | 1 | — | ≤1976 |
| NBO | Nairobi-Embakasi | KE | África | 0.8 | 4 | 4100 | sí | no | altitud | 1.3 | — | ≤1976 |
| JNB | Johannesburgo-Jan Smuts | ZA | África | 3 | 4 | 4400 | sí | no | altitud | 1 | — | ≤1976 |
| CPT | Ciudad del Cabo-D. F. Malan | ZA | África | 1.1 | 3 | 3200 | sí | sí | mediterraneo | 1.3 | — | ≤1976 |
| TLV | Tel Aviv-Lod | IL | Oriente Medio | 1.5 | 3 | 3600 | sí | no | mediterraneo | 1 | — | ≤1976 |
| THR | Teherán-Mehrabad | IR | Oriente Medio | 4.5 | 4 | 4000 | sí | sí | altitud | 1 | — | ≤1976 |
| JED | Yeda-Kandara | SA | Oriente Medio | 0.6 | 3 | 3300 | no | no | desierto | 1 | — | ≤1976 |
| RUH | Riad | SA | Oriente Medio | 0.7 | 3 | 3200 | no | no | desierto | 1 | — | ≤1976 |
| KWI | Kuwait | KW | Oriente Medio | 0.8 | 3 | 3400 | sí | no | desierto | 1 | — | ≤1976 |
| DXB | Dubái | AE | Oriente Medio | 0.2 | 3 | 3800 | sí | no | desierto | 1 | — | ≤1976 |
| KHI | Karachi | PK | Asia | 4 | 4 | 3400 | sí | no | desierto | 1 | — | ≤1976 |
| BOM | Bombay-Santa Cruz | IN | Asia | 7 | 4 | 3400 | sí | no | monzon | 1 | — | ≤1976 |
| DEL | Delhi-Palam | IN | Asia | 4.5 | 4 | 3800 | sí | no | indogangetico | 1 | — | ≤1976 |
| CMB | Colombo-Katunayake | LK | Asia | 0.6 | 2 | 3350 | no | no | monzon | 1.2 | — | ≤1976 |
| BKK | Bangkok-Don Mueang | TH | Asia | 4.5 | 4 | 3700 | sí | no | monzon | 1.4 | — | ≤1976 |
| SIN | Singapur-Paya Lebar | SG | Asia | 2.3 | 4 | 3800 | sí | no | tropical | 1 | — | ≤1976 |
| KUL | Kuala Lumpur-Subang | MY | Asia | 1 | 3 | 3800 | sí | no | tropical | 1 | — | ≤1976 |
| JKT | Yakarta-Kemayoran | ID | Asia | 6 | 3 | 2500 | no | no | tropical | 1 | — | ≤1976 |
| DPS | Bali-Ngurah Rai | ID | Asia | 0.3 | 2 | 3000 | no | no | tropical | 1.8 | — | ≤1976 |
| MNL | Manila | PH | Asia | 5 | 4 | 3400 | sí | no | tropical | 1 | — | ≤1976 |
| HKG | Hong Kong-Kai Tak | HK | Asia | 4.5 | 4 | 3400 | sí | sí | monzon | 1.3 | — | ≤1976 |
| TPE | Taipéi-Songshan | TW | Asia | 2 | 3 | 2600 | sí | sí | monzon | 1 | — | ≤1976 |
| PEK | Pekín-Capital | CN | Asia | 8 | 3 | 3200 | sí | no | continental | 1 | — | ≤1976 |
| SHA | Shanghái-Hongqiao | CN | Asia | 10 | 3 | 3200 | sí | no | monzon | 1 | — | ≤1976 |
| GMP | Seúl-Gimpo | KR | Asia | 7 | 4 | 3200 | sí | no | continental | 1 | — | ≤1976 |
| HND | Tokio-Haneda | JP | Asia | 20 | 5 | 3000 | sí | no | monzon | 1 | — | ≤1976 |
| NRT | Tokio-Narita | JP | Asia | 20 | 5 | 4000 | sí | no | monzon | 1 | — | 1978 |
| ITM | Osaka-Itami | JP | Asia | 12 | 4 | 3000 | sí | sí | monzon | 1 | — | ≤1976 |
| SYD | Sídney-Kingsford Smith | AU | Oceanía | 3.1 | 4 | 3900 | sí | no | mediterraneo | 1.2 | — | ≤1976 |
| MEL | Melbourne-Tullamarine | AU | Oceanía | 2.6 | 4 | 3700 | sí | no | atlantico | 1 | — | ≤1976 |
| PER | Perth | AU | Oceanía | 0.8 | 3 | 3400 | sí | no | mediterraneo | 1 | — | ≤1976 |
| AKL | Auckland | NZ | Oceanía | 0.8 | 3 | 3600 | sí | no | atlantico | 1.2 | — | ≤1976 |
| NAN | Fiyi-Nadi | FJ | Oceanía | 0.1 | 2 | 3300 | no | no | tropical | 1.8 | — | ≤1976 |
| HNL | Honolulu | US | Oceanía | 0.7 | 4 | 3800 | sí | no | tropical | 2 | — | ≤1976 |
| JFK | Nueva York-JFK | US | Norteamérica | 16 | 5 | 4400 | sí | no | continental | 1.3 | — | ≤1976 |
| ORD | Chicago-O'Hare | US | Norteamérica | 7.5 | 5 | 3900 | sí | no | continental | 1 | — | ≤1976 |
| ATL | Atlanta | US | Norteamérica | 1.8 | 5 | 3600 | sí | no | tropical | 1 | — | ≤1976 |
| MIA | Miami | US | Norteamérica | 2.5 | 4 | 3900 | sí | no | tropical | 1.6 | invierno | ≤1976 |
| DFW | Dallas-Fort Worth | US | Norteamérica | 2.7 | 4 | 4000 | sí | no | continental | 1 | — | ≤1976 |
| LAX | Los Ángeles | US | Norteamérica | 10 | 5 | 3700 | sí | no | costa_niebla | 1.3 | — | ≤1976 |
| SFO | San Francisco | US | Norteamérica | 4.5 | 4 | 3600 | sí | no | costa_niebla | 1.2 | — | ≤1976 |
| YYZ | Toronto-Malton | CA | Norteamérica | 2.8 | 4 | 3400 | sí | no | nordico | 1 | — | ≤1976 |
| YUL | Montreal-Dorval | CA | Norteamérica | 2.8 | 4 | 3300 | sí | no | nordico | 1 | — | ≤1976 |
| YVR | Vancouver | CA | Norteamérica | 1.1 | 3 | 3300 | sí | sí | atlantico | 1 | — | ≤1976 |
| MEX | Ciudad de México | MX | Norteamérica | 12 | 4 | 3900 | sí | sí | altitud | 1 | — | ≤1976 |
| CUN | Cancún | MX | Norteamérica | 0.05 | 2 | 3500 | no | no | tropical | 2 | invierno | ≤1976 |
| HAV | La Habana-José Martí | CU | Norteamérica | 1.9 | 3 | 4000 | no | no | tropical | 1 | — | ≤1976 |
| SDQ | Santo Domingo-Las Américas | DO | Norteamérica | 1 | 2 | 3350 | no | no | tropical | 1.3 | — | ≤1976 |
| SJU | San Juan-Isla Verde | PR | Norteamérica | 1 | 3 | 3000 | sí | no | tropical | 1.5 | — | ≤1976 |
| PTY | Panamá-Tocumen | PA | Norteamérica | 0.7 | 3 | 3050 | sí | no | tropical | 1 | — | ≤1976 |
| CCS | Caracas-Maiquetía | VE | Sudamérica | 2.5 | 4 | 3500 | sí | sí | tropical | 1 | — | ≤1976 |
| BOG | Bogotá-El Dorado | CO | Sudamérica | 3.5 | 4 | 3800 | sí | sí | altitud | 1 | — | ≤1976 |
| UIO | Quito-Mariscal Sucre | EC | Sudamérica | 0.6 | 2 | 3100 | no | sí | altitud | 1 | — | ≤1976 |
| LIM | Lima-Jorge Chávez | PE | Sudamérica | 3.5 | 3 | 3500 | sí | no | costa_niebla | 1 | — | ≤1976 |
| SCL | Santiago-Pudahuel | CL | Sudamérica | 3.5 | 3 | 3200 | sí | sí | mediterraneo | 1 | — | ≤1976 |
| EZE | Buenos Aires-Ezeiza | AR | Sudamérica | 9.5 | 4 | 3300 | sí | no | atlantico | 1 | — | ≤1976 |
| MVD | Montevideo-Carrasco | UY | Sudamérica | 1.3 | 2 | 3200 | sí | no | atlantico | 1 | — | ≤1976 |
| GIG | Río de Janeiro-Galeão | BR | Sudamérica | 8.5 | 4 | 4000 | sí | sí | tropical | 1.5 | — | ≤1976 |
| VCP | São Paulo-Viracopos | BR | Sudamérica | 11 | 4 | 3240 | sí | no | tropical | 1 | — | ≤1976 |

### 6.2 Tipos de avión

- **Coste/hora**: dólares de 1976 por hora de vuelo, con combustible, tripulación y reserva
  de mantenimiento.
- **Fiabilidad**: multiplica el riesgo mecánico (1 = normal).
- **Precio nuevo**: está en **dólares nominales sin ajustar por inflación**. Es un problema
  conocido.

| Id | Modelo | Plazas | Alcance (km) | Crucero (km/h) | Pista (m) | Coste/hora ($) | Precio nuevo ($) | En servicio | Fabricado hasta | Motores | Fiabilidad | Ficticio |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| f27 | Fokker F27 Friendship | 48 | 1700 | 460 | 1100 | 910 | 2.6 M | 1958 | 1987 | 2 | 1 | no |
| hs748 | Hawker Siddeley HS 748 | 44 | 1600 | 450 | 1100 | 870 | 2.3 M | 1962 | 1988 | 2 | 1.05 | no |
| viscount | Vickers Viscount 800 | 65 | 2200 | 510 | 1500 | 1260 | 1.8 M | 1957 | 1964 | 4 | 1.3 | no |
| caravelle | Sud Aviation Caravelle | 80 | 1800 | 780 | 1900 | 2100 | 3.5 M | 1959 | 1972 | 2 | 1.2 | no |
| bac111 | BAC One-Eleven 500 | 99 | 2700 | 750 | 2000 | 2380 | 4.8 M | 1968 | 1982 | 2 | 1.05 | no |
| dc9 | McDonnell Douglas DC-9-30 | 115 | 2500 | 800 | 2000 | 2660 | 5.5 M | 1967 | 1982 | 2 | 1 | no |
| b737 | Boeing 737-200 | 120 | 3500 | 780 | 1900 | 2800 | 6.5 M | 1968 | 1988 | 2 | 1 | no |
| b727 | Boeing 727-200 | 155 | 3700 | 860 | 2300 | 3780 | 8.5 M | 1967 | 1984 | 3 | 1 | no |
| b707 | Boeing 707-320B | 180 | 8500 | 880 | 3000 | 5460 | 9 M | 1959 | 1979 | 4 | 1.15 | no |
| dc8 | Douglas DC-8-63 | 250 | 7600 | 870 | 3200 | 6440 | 11 M | 1967 | 1972 | 4 | 1.1 | no |
| dc10 | McDonnell Douglas DC-10-30 | 270 | 9600 | 900 | 3200 | 8680 | 24 M | 1972 | 1989 | 3 | 1.1 | no |
| b747 | Boeing 747-200B | 420 | 10000 | 900 | 3300 | 11900 | 35 M | 1971 | 1991 | 4 | 1 | no |
| vk42 | Volkov VK-42 | 52 | 1500 | 430 | 1050 | 730 | 1.1 M | 1966 | 1990 | 2 | 2.6 | sí |
| kr134 | Krasnov KR-134 | 80 | 2000 | 820 | 1800 | 1820 | 2.4 M | 1967 | 1985 | 2 | 2.2 | sí |
| md80 | McDonnell Douglas MD-80 | 150 | 3800 | 810 | 2200 | 3220 | 18 M | 1980 | 1999 | 2 | 0.85 | no |
| b767 | Boeing 767-200 | 216 | 5500 | 850 | 2400 | 5880 | 40 M | 1982 | 2000 | 2 | 0.8 | no |
| b757 | Boeing 757-200 | 200 | 5800 | 850 | 2100 | 4480 | 30 M | 1983 | 2004 | 2 | 0.8 | no |
| b733 | Boeing 737-300 | 140 | 4200 | 790 | 2000 | 3080 | 22 M | 1984 | 1999 | 2 | 0.75 | no |
| atr42 | ATR 42 | 48 | 1300 | 490 | 1100 | 840 | 7 M | 1985 | 2020 | 2 | 0.8 | no |
| a320 | Airbus A320 | 150 | 5000 | 830 | 2100 | 3080 | 30 M | 1988 | 2030 | 2 | 0.6 | no |
| f100 | Fokker 100 | 107 | 2800 | 760 | 1800 | 2660 | 18 M | 1988 | 1997 | 2 | 0.75 | no |

## 7. Arquitectura (por si sirve)

```
aerolinea/
  index.html             página, estilos y estructura
  src/core/              motor puro y testeable, sin DOM
    azar.js              generador determinista con semilla
    tiempo.js            reloj del juego
    clima.js             perfiles climáticos y tiempo por franja
    riesgo.js            factores de riesgo, estimación y resultado del vuelo
    flota.js             aviones, desgaste, mercado, revisiones y valor
    economia.js          demanda, tarifas y costes
    sim.js               bucle principal, vuelos, decisiones, accidentes y acciones del jugador
  src/data/              aeropuertos.js y aviones.js
  src/ui/                globo (d3-geo en Canvas), paneles, hoja de despacho, escenas y noticiario
  tests/                 node --test
  vendor/                d3-geo, topojson y mapas de Natural Earth
```

## 8. Hoja de ruta prevista

1. **Personal y entrevistas**:
   - candidatos con rasgos ocultos (competencia, honestidad, temperamento, ambición) que se
     intuyen con las preguntas;
   - puestos: pilotos, mecánicos, despachador, jefe de operaciones, comercial y director
     financiero;
   - eventos en los que la lían (resaca, una revisión firmada sin hacer, una huelga, un
     soborno);
   - un buen despachador reduce el error de la estimación;
   - el jefe de operaciones permite delegar con una política de riesgo.
2. **Eventos históricos de 1976 a 2026** que cambien las reglas.
3. **Regulación**:
   - permisos para rutas internacionales al principio;
   - liberalización en EE. UU. y en Europa;
   - llegada de las low cost.
4. **Varias bases y competencia simulada.**
5. **Inflación y precio del combustible por año.**
6. **Retos con semilla compartida** para jugar con amigos.
7. **Arte final** y personajes recurrentes: un mentor, una aerolínea rival y un inspector de
   aviación civil.
8. **Final del juego**: taller propio y fabricación de piezas y motores de avión.

---

## 9. Lo que te pedimos

Responde en español. Cuando aportes datos, ponlos en **tablas con las mismas columnas que
usamos**. Marca tu **confianza** en cada fila (alta, media o baja) y, si puedes, cita la
fuente o el tipo de fuente. **No inventes**: si no lo sabes, escribe «desconocido». Un dato
aproximado y bien marcado nos vale más que uno preciso inventado.

### A. Corrección de los aeropuertos para 1976

Revisa la tabla 6.1. Nos interesa sobre todo:

- **El ILS en 1976.** Es lo que más pesa en el riesgo, sobre todo en Canarias y en
  aeropuertos de montaña. Tenemos dudas, por ejemplo, con Tenerife Norte, Madeira, Quito,
  Kai Tak y La Palma.
- **La longitud de la pista** en 1976 y cuándo cambió.
- **El nombre o código** que tenía en 1976.
- **Los aeropuertos que sustituyen a otros a lo largo de los 50 años**: año y código antiguo
  → nuevo. Por ejemplo, Hong Kong (Kai Tak → Chek Lap Kok), Múnich, Atenas, Singapur (Paya
  Lebar → Changi), Kuala Lumpur, Seúl, Bangkok, Yeda, Denver, Oslo, Estambul o Quito.
- **Aeropuertos que deberían estar y no están**, o al revés, siguiendo el criterio de la
  sección 2.

### B. Aviones de 1976 a 2026

- Corrige los datos de la tabla 6.2: plazas, alcance, pista, año de entrada en servicio y
  fin de producción.
- Propón **los tipos que faltan**, con año de entrada, para cubrir hasta hoy:
  turbohélices regionales, reactores regionales, fuselaje estrecho, fuselaje ancho y
  supersónicos, si tiene sentido.
- Para cada uno: **precio aproximado en su año de lanzamiento**, **consumo o coste relativo
  por plaza y km** frente a los de su época y **notas de fiabilidad o historial** que sirvan
  para el juego.
- Ideas de **2–4 modelos ficticios** que encajen: gangas del Este, prototipos raros,
  conversiones.

### C. Eventos históricos de 1976 a 2026

Una tabla con estas columnas: **año, mes (si importa), evento, regiones afectadas, efecto
propuesto en el juego**. Ejemplos de efecto: demanda −30 % durante 2 años en la región X,
combustible ×2, se abre el espacio aéreo de Y, cambian las reglas para operar en el océano,
quiebra de una aerolínea rival.

Incluye crisis del petróleo, liberalizaciones, guerras y cierres de espacio aéreo, la caída
de la URSS, Schengen, las normas ETOPS, 2001, el SARS, 2008, el volcán islandés de 2010, la
COVID y la guerra de Ucrania, además de los que creas relevantes.

### D. Regulación y mercado

Propón un modelo **simple** para un juego de móvil que represente:

- los **acuerdos bilaterales** de los años 70 y los derechos de tráfico;
- la **liberalización** de EE. UU. (1978) y de la UE (1987–1997);
- los **cielos abiertos**;
- las **franjas horarias** (slots) en aeropuertos saturados.

Queremos 3 o 4 reglas que el jugador entienda, no un reglamento.

### E. Series económicas

Valores aproximados por año (cada 5 años es suficiente):

- **Precio del queroseno de aviación** en $/galón.
- **Inflación en EE. UU.**, como índice con 1976 = 1.
- **Tarifa media por pasajero y km**, para calibrar los billetes.
- **Ocupación media** de las aerolíneas.

### F. Seguridad aérea por épocas

- **Tasa de accidentes mortales** por millón de salidas, por décadas, desde los 70 hasta hoy.
  Queremos comparar la curva con nuestro factor `0,965^(año − 1976)`.
- **Qué tecnologías redujeron cada tipo de accidente y cuándo**: ILS, GPWS/TAWS, radar
  meteorológico, TCAS, CRM, fly-by-wire. Lo usaríamos para que la seguridad mejore por
  causas concretas y no con una curva genérica.

### G. Personal

- **Puestos clave** de una aerolínea pequeña y **sueldos aproximados en 1976**.
- **15–20 ideas de eventos de personal** con decisión y consecuencias. Que sean verosímiles y
  sin morbo.
- **Ideas de preguntas de entrevista** que revelen rasgos ocultos de forma indirecta.

### H. Revisión crítica

Señala lo que te parezca **poco realista o poco divertido** en las mecánicas de la sección 4
y en la calibración de la sección 5, con una propuesta concreta para cada punto. Por ejemplo:
fórmulas que den resultados absurdos, decisiones sin dilema real o economía demasiado fácil o
demasiado difícil.

No hace falta escribir código: el autor y Claude lo integran.
