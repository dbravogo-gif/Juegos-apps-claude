# Fuentes de los datos

Regla (`CRITERIOS.md`, 2): ningún dato importante de aviones, motores o aeropuertos se
inventa. Cada uno tiene fuente o se marca como aproximación (`aprox` en `src/data/`). Cuanto
más antiguo es el dato, menos fiabilidad se le exige, sobre todo antes de 1990.

Niveles:

- **Verificado**: fuente primaria (fabricante, autoridad, gestor del aeropuerto) o dos
  fuentes independientes que coinciden.
- **Una fuente**: una sola fuente seria; vale mientras no aparezca otra que lo contradiga.
- **Aprox**: cifra de juego, coherente con la época y con el resto, sin verificar.

Las búsquedas de la v2 se hicieron con búsqueda web; las páginas de Boeing, EASA, FAA,
Wikipedia y archive.org no se podían abrir directamente desde el entorno de trabajo, así que
lo «verificado» se apoya en lo que devolvían los buscadores de esas mismas fuentes.

## Aeropuertos de Canarias y Madeira

| Dato | En el juego | Nivel | Fuente |
| --- | --- | --- | --- |
| Tenerife Norte (Los Rodeos): ILS | Desde 1971, CAT I | Verificado | AENA, historia del aeropuerto |
| Tenerife Norte: elevación | 633 m | Verificado | AIP España |
| Tenerife Sur: apertura | 1978 | Verificado | AENA |
| El Hierro: pista | 1.000 m en 1972; 1.205 m desde 1992 | Verificado | AENA |
| La Palma: pista | 1.700 m en 1970; 2.200 m hacia 1980 | Una fuente (la fecha de la ampliación, aprox) | AENA |
| Gran Canaria: pista | 3.100 m desde 1960 | Verificado | AENA |
| Lanzarote: pista | 2.400 m (1969–70) | Una fuente | AENA |
| Fuerteventura: apertura de El Matorral (el actual, sustituye a Los Estancos) | 1969 | Una fuente | AENA |
| La Gomera: apertura | 1999 | Verificado | AENA |
| Madeira: pista | 1.600 m (1964); 1.800 m (1986); 2.781 m (2000) | Verificado | ANA/Aeroportos da Madeira; prensa |
| Madeira con 727 | Operable con restricciones | Verificado | TAP operó 727-200 (accidente del TP425, 1977) |

## Otros aeropuertos

- **Nueva York (JFK) y el Concorde**: prohibido hasta que los tribunales lo permitieron en
  octubre de 1977; primer servicio comercial el 22 de noviembre de 1977. En el juego, vetado
  hasta 1977,89. Verificado.
- **Elevaciones** de Ciudad de México, Bogotá, Quito, Nairobi, Johannesburgo, Adís Abeba y
  Teherán: AIP de cada país. Verificado.
- Tamaño, demanda, perfil de clima, nivel de costes del país y aeropuertos alternativos:
  aprox.
- **Añadidos en la v3** (Bilbao, Pamplona, Santiago, Sevilla, Valencia, Alicante, Ibiza y
  Doha): coordenadas verificadas; elevación de Pamplona (459 m) y Santiago (370 m) del AIP
  España, una fuente; pistas, ILS de 1976 y el resto, aprox.

## Aviones

Distancias de despegue y pesos máximos de Skybrary (fichas de tipo de Eurocontrol):

| Tipo | Dato | Nivel |
| --- | --- | --- |
| Boeing 737-200 | Despegue 1.830 m al MTOW de 52.390 kg | Verificado |
| Boeing 727-200 | MTOW 95.300 kg | Verificado |
| Fokker F27 | Despegue 1.200 m | Verificado |
| HS 748 | Despegue 1.225 m | Verificado |
| DC-9-30 | MTOW 49.940 kg | Verificado |
| Boeing 707-320 | Despegue 3.000 m | Verificado |
| DC-8-63 | Despegue 3.000 m; MTOW 158.700 kg | Verificado |
| DC-10-30 | MTOW 263.086 kg | Verificado |

- **Entrada en servicio, motores y fin de producción** de cada tipo: páginas de historia de
  los fabricantes y Wikipedia. Verificado para los tipos reales.
- **Categoría ILS**: el Trident y el L-1011 fueron de los primeros certificados para CAT III;
  el A300 llegó con CAT II. Una fuente por tipo.
- Lo que cada tipo marca en su lista `aprox` (alcance con carga, pista mínima, consumo por
  hora de bloque, precio, crucero…) es aproximado.
- **Concorde**: crucero de Mach 2,04 (unos 2.150 km/h), 100 plazas, 20 construidos (14 de
  línea), supersónico solo sobre el mar. Verificado.
- Ficticios (Kr-134, VK-42): inventados a propósito, inspirados en la práctica soviética.

## Motores

- Intervalos entre revisiones generales, coste de la revisión, tasa de averías y alquiler
  diario: aprox.
- Referencia para el ficticio TV-24: los turbohélices soviéticos como el AI-24 empezaron con
  revisiones generales cada ~600 h y llegaron a ~2.000 h. Una fuente.

## Mantenimiento

- **Programa del 737-200** de referencia: A cada 125 h, B 750 h, C 3.000 h, D 20.000 h
  (Aircraft Commerce). El juego simplifica a A, C y estructural; para los de pasillo único,
  A 150 h, C 3.000 h, D 20.000 h. Verificado el de referencia; los demás tipos, aprox.
- **MEL**: categoría B 3 días y C 10 días (FAA). Verificado.
- Catálogo de averías, umbrales, vidas y costes de reparación: aprox, con la lógica de
  mantenimiento real (síntoma → inspección dirigida → diagnóstico).

## Tecnologías de seguridad

| Tecnología | Fechas en el juego | Nivel | Fuente |
| --- | --- | --- | --- |
| Radar meteorológico | Obligatorio en EE. UU. desde 1964 (14 CFR 121.357) | Verificado | FAA |
| GPWS | Norma FAA de diciembre de 1974, obligatorio desde diciembre de 1975; estándar OACI de 1979 | Verificado | FAA, OACI |
| Alerta de cizalladura | Norma FAA de 1988; equipos desde 1988–1991 | Verificado | FAA |
| TCAS II | Norma FAA de 1989, obligatorio hacia 1993; ACAS II en Europa en 2000/2005 | Verificado | FAA, Eurocontrol |
| EGPWS | Desde 1996 | Verificado | Honeywell; NTSB |

Costes y días de taller de cada retrofit, y el tamaño de su efecto en el riesgo: aprox.

## Economía

- **IPC**: CPI-U de EE. UU., media anual (BLS). Verificado.
- **Queroseno**: 40 ¢/galón en 1978, unos 80 ¢ a finales de 1979 y 86,8 ¢ en 1980 (datos de
  aerolíneas de EE. UU.). Verificado; el resto de la serie, aprox.
- **Tarifas**: calibradas cerca del rendimiento por pasajero-milla de las aerolíneas de
  EE. UU. en 1976 (unos 8 ¢), algo más altas en recorridos europeos. Aprox.
- **Costes**: tripulación, handling, tasas, catering, estructura y seguro calibrados para que
  el coste por hora de bloque de un 737-200 en 1976 quede en torno a 1.600–1.800 $ y el
  equilibrio de una ruta normal esté en una ocupación del 45–55 %. Aprox.

## Mercado y competencia (v3)

- **Países** (`src/data/paises.js`): renta por habitante relativa y población por década,
  aprox (orden de magnitud de las series de PIB por habitante en paridad de poder adquisitivo
  y de población, sin comprobar cifra a cifra). Año de entrada en la Comunidad Europea y
  salida del Reino Unido (2020): registro histórico conocido.
- **Demanda entre ciudades**: cifra de juego, aprox. Se ha cuidado el orden de magnitud (por
  ejemplo, ~1.600 pasajeros diarios por sentido entre Gran Canaria y Tenerife en 1976), no el
  dato exacto.
- **Liberalización**: Airline Deregulation Act de EE. UU. (24 de octubre de 1978), tercer
  paquete europeo (1 de enero de 1993) y cabotaje en la Comunidad (1 de abril de 1997).
  Registro histórico conocido.
- **Aerolíneas** (`src/data/aerolineas.js`): ficticias. Las fechas de entrada, quiebra o
  fusión siguen a la compañía real en la que se inspiran (Laker, 1982; Spantax, 1988; Pan Am,
  1991, con su Atlántico para Delta; Aviaco en Iberia, 1999; KLM con Air France, 2004; Air
  Berlin, 2017; Alitalia e ITA, 2021), salvo Catarro, que entra en 2017 por el tope de 15
  activas (Qatar Airways vuela desde 1994). Tamaños, costes y carácter: aprox.

## Acontecimientos

- **Fechas** de los históricos, de las liberalizaciones y de las compañías reales: registro
  histórico conocido, sin contrastar una a una con búsqueda. La noticia sale el día del
  suceso o poco después, nunca antes.
- **Concorde**: certificado suspendido tras el accidente de París (25 de julio de 2000) hasta
  noviembre de 2001; último vuelo comercial el 24 de octubre de 2003.
- El tamaño de cada efecto sobre la demanda (−55 % Madrid–Sevilla con el AVE, −45 %
  Madrid–Barcelona…) y los acontecimientos locales: cifras de juego.

## Imágenes

- **Escenas** (noticias, accidentes, grandes aeropuertos y taller) y **aviones ficticios**
  (KR-134, VK-42): generadas con IA en OpenArt (Wan 2.7) para el juego, con aspecto de foto de
  la época y sin marcas, matrículas ni aerolíneas reales. No muestran sucesos, aeropuertos ni
  aviones concretos; en pantalla llevan la etiqueta «Recreación». Las indicaciones usadas y lo
  que se descartó por poco realista (un motor dentro del morro, restos con forma de avioncito)
  quedan en `img/LEEME.md`.
- **Fotos de aviones reales**: pendientes. Irán con autor y licencia (Wikimedia Commons) en
  cuanto el entorno de trabajo pueda descargarlas; mientras, cada tipo se ve con su silueta.

## Riesgo

Las probabilidades de accidente no son estadística real (`CRITERIOS.md`, 33): se calibran por
partida. Referencia real solo para el orden de magnitud: en los años 70 los reactores
occidentales perdían del orden de 2–3 aviones por millón de salidas. Ver `DISENO.md`,
«Calibración del riesgo».
