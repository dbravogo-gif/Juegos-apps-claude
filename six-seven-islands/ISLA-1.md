# Isla 1: Lanzarote

2026-11-10. El autor decide recorrer el archipiélago de este a oeste: la isla 1 es Lanzarote,
hecha desde cero con la misma idea que La Palma, que queda guardada para la isla 6
(`LA-PALMA.md`). Mapa en `src/data/isla1.ts`, con las mismas pruebas de reglas que La Palma.

## El recorrido

Del sur al este, como en La Palma: 1 → 2 → 3 → 4 → 5 → 6. Lo decidido por el autor para la
isla 1 (zonas, reglas y orden de la zona de combates) se mantiene; cambia el paisaje. El
2026-11-10 el autor pidió una isla más larga, no más ancha: más contenido y más tiempo para
completarla. Por eso hay una zona más, El Jable, entre las Montañas del Fuego y la capital.

1. **Zona inicial** (sur): pueblo blanco junto a una playa dorada.
   - La casa del jugador, otra casa igual, una palmera y el museo.
   - Unas tuneras y unas viñas en sus hoyos.
   - El paso se cierra hasta elegir la inicial.
2. **El Golfo** (zona de combates, costa oeste), de sur a norte:
   - playa de arena negra, con el charco verde (5 × 4) y boyas en el mar;
   - la barrera de piedra, con el entrenador obligatorio justo detrás;
   - la subida con dos manchas de malpaís, una obligatoria y otra opcional;
   - el llano de tierra con la hierba obligatoria, tuneras y el entrenador opcional, que mira de
     lado al camino.
3. **La Geria** (pueblo): casas blancas entre viñas en hoyos de picón.
   - Refugio, dos casas, tienda y la plaza de palmeras con el anciano.
   - El paso a las Montañas del Fuego se cierra hasta hablar con el anciano.
4. **Montañas del Fuego** (la zona larga):
   - coladas de lava que no se pisan y caminos de picón;
   - un malpaís obligatorio que corta el paso y otros que se rodean;
   - un cono de escorias y un mirador;
   - el excursionista, a la puerta del mirador del oeste, mirando al camino de subida;
   - una caldera sin salida con un entrenador que vigila la senda hasta la poción;
   - el entrenador obligatorio a la salida, que ahora baja al sur, hacia El Jable.
5. **El Jable** (zona opcional de encuentros, entre el Fuego y la capital):
   - arenal con muros de piedra seca que obligan a zigzaguear: el camino es más del doble de
     largo que la línea recta;
   - tres manchas de hierba, ninguna obligatoria;
   - un entrenador opcional, un agricultor que habla de las batatas y una poción escondida.
6. **La capital** (costa este):
   - refugio, el gimnasio de Roca (el edificio más grande), casas blancas de balcones;
   - un charco de agua de mar con su paseo de palmeras;
   - el muelle, el faro y el barco, que solo lleva a quien vence al gimnasio.
7. **Famara** (opcional, al norte de las Montañas del Fuego; autor, 2026-11-11): una playa al pie
   del Risco, con dos bañistas tumbados (uno, un guiri quemado), sombrillas, un poco de barrilla
   en las dunas y dos entrenadores opcionales, uno pescando y otro cogiendo pulpos. No lleva a
   ningún sitio.

## Tamaños

2026-11-10: el autor pidió zonas más grandes. Primero se ensancharon, pero él quería decir más
largas, con más contenido. El Golfo vuelve a su ancho y se alarga; el Fuego vuelve a su tamaño, y
se añade El Jable. Lo juzga el autor al probarlo.

| Zona | Casillas |
| --- | --- |
| 1. Zona inicial | 24 × 18 |
| 2. El Golfo | 15 × 52 (antes, 15 × 44) |
| 3. La Geria | 28 × 22 |
| 4. Montañas del Fuego | 48 × 26 |
| 5. El Jable | 24 × 22 (nueva) |
| 6. Capital | 34 × 28 |
| 7. Famara | 28 × 18 (opcional) |

## La forma de la isla

Desde el 2026-11-11 la isla tiene la silueta de Lanzarote (`silueta` en `src/data/isla1.ts`):
aproximada, dibujada de memoria y más ancha que la real. Las zonas no cambian. Lo que queda dentro
de la costa y fuera de las zonas es tierra volcánica que no se pisa: baja junto al mar y las
zonas, para no tapar los caminos, y sube hacia el interior, con volcanes. Las zonas bajaron 76
casillas para dejar sitio al norte, que queda libre para más adelante.

## El mar

Alrededor de toda la isla (`src/sistemas/mundo/mar.ts`), para que no parezca que se puede
andar sobre el agua (autor, 2026-11-10): espuma en las orillas, olas sueltas, rocas de basalto
cerca de la costa, una fila de boyas frente a cada playa y barcas, amarradas en el puerto de la
capital.

## Las islas, en orden

De este a oeste y sin saltos (autor, 2026-11-10): 1 Lanzarote, 2 Fuerteventura, 3 Gran Canaria,
4 Tenerife, 5 La Gomera y 6 La Palma. El Hierro es la séptima, la desaparecida, que reaparece
al final con la Liga.

## Lo propio de Lanzarote

- **Entrenadores opcionales** (autor, 2026-11-11): se pueden esquivar, pero miran al camino,
  así que quien va por él se los encuentra. Lo vigila una prueba.
- **Gimnasio de Roca:** la isla de los volcanes. Tiene un volcán pintado en la azotea.
- **Casas:** la casa blanca de azotea, con chimenea redonda y carpintería verde o azul, en el
  campo; en la capital, casas blancas de balcones.
- **Flora:** palmeras, tuneras, viñas en hoyos de picón, tabaibas y cardones entre las rocas; en
  las Montañas del Fuego, casi nada: escorias, basalto y órganos.
- **Suelo:** jable (arena clara) en lugar de hierba corta, y las cumbres del centro son volcanes.

## Lo mismo que La Palma

- Los interiores, los diálogos, el museo con las tres estatuas, la inicial rebelde (45 % de los
  turnos) hasta el anciano y la captura con barra: ver «Decisiones técnicas» en `LA-PALMA.md`.
- Las historias de las tres leyendas se cuentan con paisajes de Lanzarote: la vid en el picón,
  los jameos donde entra el mar y las Montañas del Fuego.
