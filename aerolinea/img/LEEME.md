# Imágenes

Qué sale y cuándo está en `src/data/imagenes.js`. Hay dos grupos: las fotos de aviones reales,
sacadas de Wikimedia Commons, y lo que se generó con IA para el juego.

## Fotos de aviones reales (Wikimedia Commons)

Fotos de época de los tipos reales. En casi todas se ha cambiado el rótulo de la aerolínea por
su nombre en el juego, con el mismo color y un tipo de letra parecido; los colores y los logos
de la cola se dejan, que es lo que hace reconocible a cada compañía. Después se recortan a 1,75:1
(2,2:1 el CASA 212) centradas en el avión y se reducen a WebP de 900 px. El rótulo se cambió editando la foto en
local (sin IA ni créditos); cómo se hace, en `herramientas/fotos/LEEME.md`.

Cada foto conserva la licencia del original: las CC BY-SA, también en su versión editada.

| Archivo | Rótulo | Original | Autor | Licencia | Año |
| --- | --- | --- | --- | --- | --- |
| `aviones/c212.webp` | Sin cambios (avión de CASA) | [CASA Aviocar EC-DHO at Sion 1982](https://commons.wikimedia.org/wiki/File:CASA_Aviocar_EC-DHO_at_Sion_1982.jpg) | Anidaat | CC BY-SA 4.0 | 1982 |
| `aviones/f27.webp` | Aviaco → Aviacutre | [Aviaco Fokker F-27-400 at San Sebastian](https://commons.wikimedia.org/wiki/File:Aviaco_Fokker_F-27-400_at_San_Sebastian.jpg) | Felix Goetting | GFDL 1.2 | 1991 |
| `aviones/hs748.webp` | Sin cambios (Dan-Air no sale en el juego) | [Dan-Air HS.748 Marmet-1](https://commons.wikimedia.org/wiki/File:Dan-Air_HS.748_Marmet-1.jpg) | Eduard Marmet | CC BY-SA 3.0 | 1983 |
| `aviones/viscount.webp` | British airways → British airgüeis | [British Airways Vickers Viscount Marmet-1](https://commons.wikimedia.org/wiki/File:British_Airways_Vickers_Viscount_Marmet-1.jpg) | Eduard Marmet | CC BY-SA 3.0 | 1977 |
| `aviones/caravelle.webp` | IBERIA → CASTILLA, en el fuselaje y la cola | [Iberia Sud SE-210 Caravelle VI-R AN1472209](https://commons.wikimedia.org/wiki/File:Iberia_Sud_SE-210_Caravelle_VI-R_AN1472209.jpg) | Lars Söderström | CC BY-SA 3.0 | 1965 |
| `aviones/f28.webp` | IBERIA → CASTILLA | [Iberia Fokker F-28-1000 Fellowship EC-BVA](https://commons.wikimedia.org/wiki/File:Iberia_Fokker_F-28-1000_Fellowship_EC-BVA.jpg) | Richard Vandervord | CC BY-SA 4.0 | 1971 |
| `aviones/bac111.webp` | British airways → British airgüeis | [BAC 111-510ED One-Eleven, British Airways AN2249712](https://commons.wikimedia.org/wiki/File:BAC_111-510ED_One-Eleven,_British_Airways_AN2249712.jpg) | Steve Fitzgerald | GFDL 1.2 | 1979 |
| `aviones/dc9.webp` | IBERIA → CASTILLA | [Iberia Douglas DC-9-32](https://commons.wikimedia.org/wiki/File:Iberia_Douglas_DC-9-32.jpg) | Steve Fitzgerald | GFDL 1.2 | 1978 |
| `aviones/b737.webp` | Lufthansa → Naftansa | [Lufthansa Boeing 737-200 Volpati-2](https://commons.wikimedia.org/wiki/File:Lufthansa_Boeing_737-200_Volpati-2.jpg) | Christian Volpati | GFDL 1.2 | 1983 |
| `aviones/b727.webp` | IBERIA → CASTILLA | [Boeing 727-256-Adv, Iberia AN0980251](https://commons.wikimedia.org/wiki/File:Boeing_727-256-Adv,_Iberia_AN0980251.jpg) | Peter Duijnmayer | GFDL 1.2 | 1978 |
| `aviones/b707.webp` | PAN AMERICAN → BREAD AMERICAN | [Boeing 707-321B N421PA Pan American World Airways (Pan Am)](https://commons.wikimedia.org/wiki/File:Boeing_707-321B_N421PA_Pan_American_World_Airways_(Pan_Am).jpg) | clipperarctic | CC BY-SA 2.0 | 1968 |
| `aviones/dc8.webp` | KLM → TULIPAIR | [Douglas DC-8-63, KLM Royal Dutch Airlines JP6836349](https://commons.wikimedia.org/wiki/File:Douglas_DC-8-63,_KLM_Royal_Dutch_Airlines_JP6836349.jpg) | Jon Proctor | GFDL 1.2 | 1968 |
| `aviones/a300.webp` | AIR FRANCE → CROISSAIR | [Airbus A300B4-203, Air France AN1389664](https://commons.wikimedia.org/wiki/File:Airbus_A300B4-203,_Air_France_AN1389664.jpg) | Michel Gilliand | GFDL 1.2 | 1980 |
| `aviones/l1011.webp` | DELTA → DELFIN, en el fuselaje y la cola | [Delta Air Lines L-1011 N713DA](https://commons.wikimedia.org/wiki/File:Delta_Air_Lines_L-1011_N713DA.jpg) | Piergiuliano Chesi | CC BY-SA 3.0 | 1974 |
| `aviones/dc10.webp` | LAKER → LAGER, en la cola | [McDonnell Douglas DC-10-30, Laker Airways Skytrain AN0091525](https://commons.wikimedia.org/wiki/File:McDonnell_Douglas_DC-10-30,_Laker_Airways_Skytrain_AN0091525.jpg) | Ted Quackenbush | GFDL 1.2 | 1981 |
| `aviones/b747.webp` | PAN AM → BREAD AM | [N736PA Clipper Victor Pan Am Boeing 747-121, London Heathrow](https://commons.wikimedia.org/wiki/File:N736PA_Clipper_Victor_Pan_Am_Boeing_747-121,_London_Heathrow.jpg) | Paul Seymour | CC BY-SA 4.0 | 1977 |
| `aviones/concorde.webp` | AIR FRANCE → CROISSAIR | [Aerospatiale-BAC Concorde 101, Air France AN0685269](https://commons.wikimedia.org/wiki/File:Aerospatiale-BAC_Concorde_101,_Air_France_AN0685269.jpg) | Michel Gilliand | GFDL 1.2 | 1986 |
| `aviones/md80.webp` | Alitalia → Pastalia | [McDonnell Douglas MD-82 (DC-9-82), Alitalia AN0221010](https://commons.wikimedia.org/wiki/File:McDonnell_Douglas_MD-82_(DC-9-82),_Alitalia_AN0221010.jpg) | JetPix | GFDL 1.2 | 1995 |
| `aviones/b767.webp` | DELTA → DELFIN, en el fuselaje y la cola | [Boeing 767-232, Delta Air Lines JP5949898](https://commons.wikimedia.org/wiki/File:Boeing_767-232,_Delta_Air_Lines_JP5949898.jpg) | Jon Proctor | GFDL 1.2 | 1984 |
| `aviones/b757.webp` | British → Airgüeis | [British Airways Boeing 757-236 Heathrow Fitzgerald](https://commons.wikimedia.org/wiki/File:British_Airways_Boeing_757-236_Heathrow_Fitzgerald.jpg) | Steve Fitzgerald | GFDL 1.2 | 1983 |
| `aviones/b733.webp` | air europa → ay europa, en el fuselaje y la cola | [Air Europa Boeing 737-3Q8 EC-EAK (26562891040)](https://commons.wikimedia.org/wiki/File:Air_Europa_Boeing_737-3Q8_EC-EAK_(26562891040).jpg) | Kambui | CC BY 2.0 | 1987 |
| `aviones/atr42.webp` | RYANAIR → DEPIE AIR | [EI-BYO 1 ATR.42-300 Ryanair MAN OCT90 (5931309439)](https://commons.wikimedia.org/wiki/File:EI-BYO_1_ATR.42-300_Ryanair_MAN_OCT90_(5931309439).jpg) | Ken Fielding | CC BY-SA 3.0 | 1990 |
| `aviones/a320.webp` | IBERIA → CASTILLA | [Airbus A320-211, Iberia AN0241572](https://commons.wikimedia.org/wiki/File:Airbus_A320-211,_Iberia_AN0241572.jpg) | Konstantin von Wedelstaedt | GFDL 1.2 | 2002 |
| `aviones/f100.webp` | KLM → TULIPAIR, bajo la corona de la deriva | [KLM Fokker 100; PH-KLC@ZRH;12.11.1995 (5216869901)](https://commons.wikimedia.org/wiki/File:KLM_Fokker_100;_PH-KLC@ZRH;12.11.1995_(5216869901).jpg) | Aero Icarus from Zürich, Switzerland | CC BY-SA 2.0 | 1995 |

Quedan sin tocar los logos de la cola: el «IB» de los aviones de Castilla, la grulla de
Naftansa, el globo de Bread Am, la corona de Tulipair o la «A» de Pastalia.

## Generadas con IA

Los dos aviones ficticios y las escenas de la historia están generados en OpenArt (Wan 2.7,
modo estándar, 2K, 6 créditos cada una) y reducidos a WebP de 900–960 px.

### Estilo común

- Foto documental de la época: película en color de los 70–80 (grano fino, color algo
  cálido) o foto actual para las escenas modernas.
- Sin texto legible, logotipos, matrículas, banderas ni aerolíneas reales.
- Los accidentes, sin personas: solo el avión, los restos y los vehículos a distancia.
- Aviones con las proporciones y la configuración del tipo: número y posición de motores,
  cola, ala; nada de winglets en diseños de los 60–70.

### Archivos

| Archivo | Dónde sale | Qué muestra |
| --- | --- | --- |
| `aviones/kr134.webp` | Mercado y flota | Birreactor del Este de 76 plazas, motores en la cola, cola en T y morro acristalado |
| `aviones/vk42.webp` | Mercado y flota | Turbohélice del Este de ala alta y cola en T en un aeródromo regional |
| `historia/noticia-1980.webp` | Avances, hasta 2004 | Vestíbulo de salidas con panel de paletas |
| `historia/noticia-2010.webp` | Avances, desde 2005 | Vestíbulo moderno con pantallas |
| `historia/accidente-pista.webp` | Noticiario: salida de pista o aproximación en llano, reactor | Reactor fuera de pista sobre espuma |
| `historia/accidente-monte.webp` | Noticiario: en ruta o aproximación en montaña, reactor | Restos en una ladera con pinos y niebla |
| `historia/accidente-pista-helice.webp` | Igual, turbohélice | Turbohélice fuera de pista sobre espuma |
| `historia/accidente-monte-helice.webp` | Igual, turbohélice | Turbohélice en una ladera volcánica con niebla |
| `historia/aeropuerto-1980.webp` | Ficha de los grandes aeropuertos, hasta 2004 | Terminal de hormigón, torre y plataforma de finales de los 70 |
| `historia/aeropuerto-2010.webp` | Ídem, desde 2005 | Terminal de cristal con pasarelas |
| `historia/taller-linea.webp` | Flota, avión en el taller por trabajos menores | Revisión de noche con el capó del motor abierto bajo el ala |
| `historia/taller-hangar.webp` | Flota, revisión C o estructural | Hangar con el avión entre andamios y un motor desmontado |
| `historia/taller-motor.webp` | Flota, motor a revisión general | Turbofán desmontado en el taller de motores |

### Descartes

- Primer KR-134: salió con proporciones de reactor ejecutivo y unos winglets anacrónicos.
- Primera revisión nocturna: el motor aparecía dentro del morro del avión.
- Turbohélice en el monte: los restos del suelo parecían avioncitos de juguete; se corrigió
  editando la imagen.
- Cambiar el rótulo de una foto real con IA: escribió «AVIACOE» en vez de «AVIACUTRE». Los
  rótulos se cambian ahora en local, sin gastar créditos.
